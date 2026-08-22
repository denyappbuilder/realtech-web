// Prebuild kontrola obsahu — chytá chyby, které se v praxi opakovaly:
//  1. cover leží v public/images/clanky/SLUG.jpg, ale článek nemá `image:` → AUTO-OPRAVA
//     (stalo se u waze-gemini-novinky i claude-cowork-sandbox-utek — článek pak byl bez náhledovky)
//  2. článek odkazuje na `image:`, který neexistuje → build FAIL (radši spadnout než vydat rozbitý článek)
//  3. duplicitní titulky napříč články → varování
//  4. neplatné kalendářní datum → build FAIL; date v budoucnosti → varování;
//     updated před date nebo updated v budoucnosti → build FAIL (Z10065)
//  5. interní odkaz na /clanky/SLUG/, který neexistuje → build FAIL
//     (Starlink průvodce takhle chvíli odkazoval na 404, než se dopublikoval druhý díl)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { CORE_SCHEMA, load as parseYaml } from 'js-yaml';
import ts from 'typescript';
import { z } from 'astro/zod';
import { parseCalendarDate } from '../src/lib/calendarDate.js';
import { chybaTvaruImage } from '../src/lib/image-cesta.js';
import { jeAudioUrl, parseAudioDuration } from '../src/lib/audio-prehled.js';

const DIR = 'src/content/clanky';
const IMG = 'public/images/clanky';
const files = fs
  .readdirSync(DIR, { recursive: true })
  .filter((f) => f.endsWith('.md'));
const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadArticleSchema() {
  const configPath = path.join(REPOSITORY_ROOT, 'src/content.config.ts');
  const source = fs.readFileSync(configPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: configPath,
  });
  const configModule = { exports: {} };
  const requireFromConfig = (specifier) => {
    if (specifier === 'astro:content') return { defineCollection: (config) => config, z };
    if (specifier === 'astro/loaders') return { glob: (options) => options };
    if (specifier === './lib/calendarDate.js') return { parseCalendarDate };
    if (specifier === './lib/audio-prehled.js') return { jeAudioUrl, parseAudioDuration };
    throw new Error(`Nepodporovaný import v content.config.ts: ${specifier}`);
  };

  vm.runInNewContext(
    outputText,
    {
      exports: configModule.exports,
      module: configModule,
      require: requireFromConfig,
    },
    { filename: configPath },
  );

  const schema = configModule.exports.collections?.clanky?.schema;
  if (!schema || typeof schema.safeParse !== 'function') {
    throw new Error('V src/content.config.ts nebylo nalezeno schéma kolekce clanky.');
  }
  return schema;
}

const articleSchema = loadArticleSchema();

let fixed = 0;
const warnings = [];
const errors = [];
const titles = new Map();
const today = new Date();
today.setHours(23, 59, 59, 999);

for (const f of files) {
  const slug = f.replace(/\.md$/, '');
  const full = path.join(DIR, f);
  let raw = fs.readFileSync(full, 'utf8');
  // Oddělovač je řádek ---, ne výskyt v hodnotě (Z10036). Capture group
  // oddělovače zachová, ať join('') při auto-opravě nesežere prázdné
  // řádky kolem vodorovných čar v těle (Z10037).
  const casti = raw.split(/(^---\s*$)/m);
  const fm = casti[2] ?? '';

  try {
    // Keep timestamp-looking scalars as strings so the shared schema validates
    // the original calendar value instead of js-yaml's rolled-over Date.
    const frontmatter = parseYaml(fm, { schema: CORE_SCHEMA }) ?? {};
    const validation = articleSchema.safeParse(frontmatter);
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path.length ? issue.path.join('.') : 'frontmatter';
        errors.push(`${f}: pole "${field}" je neplatné: ${issue.message}`);
      }
    }
  } catch (error) {
    errors.push(`${f}: pole "frontmatter" je neplatné: ${error.message}`);
  }

  // Prázdný řádek `image:` je taky klíč — regex s (.+?) ho dřív nenašel
  // a auto-oprava pak vložila druhý. YAML bere poslední (null) a cover zmizí.
  const maKlicImage = /^image:\s*/m.test(fm);
  const image = fm.match(/^image:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const hasVideo = /^video:/m.test(fm);
  const title = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const dateStr = fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  const updatedStr = fm.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];

  for (const [field, value] of [['date', dateStr], ['updated', updatedStr]]) {
    if (value && !parseCalendarDate(value)) {
      errors.push(`${f}: pole "${field}" není platné kalendářní datum: ${value}`);
    }
  }

  // 1. chybí image, ale cover existuje → doplnit. Náhrada JEN ve frontmatteru —
  // raw.replace(/^(date:.*)$/m) nad celým souborem psala image do těla článku,
  // když frontmatter `date:` neměl a tělo ho zmínilo.
  if (!maKlicImage && !hasVideo && fs.existsSync(`${IMG}/${slug}.jpg`)) {
    const line = `image: "/images/clanky/${slug}.jpg"`;
    if (/^date:/m.test(fm)) {
      casti[2] = fm.replace(/^(date:.*)$/m, `$1\n${line}`);
      raw = casti.join('');
      fs.writeFileSync(full, raw);
      warnings.push(`AUTO-OPRAVA ${slug}: doplněn chybějící image (cover existoval)`);
      fixed++;
    }
  }

  // 2. image musí mít povolený tvar a existující soubor
  if (image) {
    const tvar = chybaTvaruImage(image);
    if (tvar) {
      errors.push(`${slug}: ${tvar}`);
    } else if (!fs.existsSync(`public${image}`)) {
      errors.push(`${slug}: image "${image}" neexistuje`);
    }
  }

  // 3. duplicitní titulek
  if (title) {
    if (titles.has(title)) warnings.push(`Duplicitní titulek: "${title}" (${slug} + ${titles.get(title)})`);
    else titles.set(title, slug);
  }

  // 4. datum v budoucnu — u date jen varování (draft může mít příští den),
  // u updated chyba: lastmod 2099 a dateModified před datePublished jdou ven.
  if (dateStr && parseCalendarDate(dateStr) > today) {
    warnings.push(`${slug}: datum ${dateStr} je v budoucnosti`);
  }

  const parsedDate = dateStr ? parseCalendarDate(dateStr) : undefined;
  const parsedUpdated = updatedStr ? parseCalendarDate(updatedStr) : undefined;
  if (parsedDate && parsedUpdated && parsedUpdated < parsedDate) {
    errors.push(
      `${f}: pole "updated" (${updatedStr}) nesmí předcházet poli "date" (${dateStr})`,
    );
  }
  if (parsedUpdated && parsedUpdated > today) {
    errors.push(`${slug}: updated ${updatedStr} je v budoucnosti`);
  }
}

// 5. interní odkazy mezi články (až po načtení všech slugů)
const slugs = new Set(files.map((f) => f.replace(/\.md$/, '')));
for (const f of files) {
  const body = fs.readFileSync(path.join(DIR, f), 'utf8');
  for (const m of body.matchAll(/\]\(\/clanky\/([^/)#?]+)/g)) {
    if (!slugs.has(m[1])) errors.push(`${f.replace(/\.md$/, '')}: odkaz na neexistující článek /clanky/${m[1]}/`);
  }
}

for (const w of warnings) console.warn(`[validate-content] ⚠️  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`[validate-content] ❌ ${e}`);
  process.exit(1);
}
console.log(`[validate-content] ${files.length} článků OK${fixed ? `, ${fixed} auto-opraveno` : ''}`);
