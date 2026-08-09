// Prebuild kontrola obsahu — chytá chyby, které se v praxi opakovaly:
//  1. cover leží v public/images/clanky/SLUG.jpg, ale článek nemá `image:` → AUTO-OPRAVA
//     (stalo se u waze-gemini-novinky i claude-cowork-sandbox-utek — článek pak byl bez náhledovky)
//  2. článek odkazuje na `image:`, který neexistuje → build FAIL (radši spadnout než vydat rozbitý článek)
//  3. duplicitní titulky napříč články → varování
//  4. datum článku v budoucnosti (překlep v roce/měsíci) → varování
//  5. interní odkaz na /clanky/SLUG/, který neexistuje → build FAIL
//     (Starlink průvodce takhle chvíli odkazoval na 404, než se dopublikoval druhý díl)
import fs from 'node:fs';
import path from 'node:path';
import { ARTICLE_CATEGORIES } from '../src/content-categories.mjs';

const DIR = 'src/content/clanky';
const IMG = 'public/images/clanky';
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));

let fixed = 0;
const warnings = [];
const errors = [];
const titles = new Map();
const today = new Date();
today.setHours(23, 59, 59, 999);

const REQUIRED_FIELDS = ['title', 'description', 'category', 'date'];

function frontmatterValue(frontmatter, field) {
  const value = frontmatter.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, 'm'))?.[1].trim();
  if (!value) return undefined;

  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.at(-1) === quote) {
    return value.slice(1, -1).trim() || undefined;
  }

  return value;
}

for (const f of files) {
  const slug = f.replace(/\.md$/, '');
  const full = path.join(DIR, f);
  let raw = fs.readFileSync(full, 'utf8');
  const fm = raw.split('---')[1] ?? '';

  const image = frontmatterValue(fm, 'image');
  const hasVideo = /^video:/m.test(fm);
  const title = frontmatterValue(fm, 'title');
  const category = frontmatterValue(fm, 'category');
  const dateStr = frontmatterValue(fm, 'date')?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];

  for (const field of REQUIRED_FIELDS) {
    if (!frontmatterValue(fm, field)) {
      errors.push(`${slug}: chybí povinné pole ${field}`);
    }
  }

  if (category && !ARTICLE_CATEGORIES.includes(category)) {
    errors.push(`${slug}: neplatné pole category "${category}"`);
  }

  // 1. chybí image, ale cover existuje → doplnit
  if (!image && !hasVideo && fs.existsSync(`${IMG}/${slug}.jpg`)) {
    const line = `image: "/images/clanky/${slug}.jpg"`;
    raw = raw.replace(/^(date:.*)$/m, `$1\n${line}`);
    fs.writeFileSync(full, raw);
    warnings.push(`AUTO-OPRAVA ${slug}: doplněn chybějící image (cover existoval)`);
    fixed++;
  }

  // 2. image odkazuje na neexistující soubor
  if (image && !fs.existsSync(`public${image}`)) {
    errors.push(`${slug}: image "${image}" neexistuje`);
  }

  // 3. duplicitní titulek
  if (title) {
    if (titles.has(title)) warnings.push(`Duplicitní titulek: "${title}" (${slug} + ${titles.get(title)})`);
    else titles.set(title, slug);
  }

  // 4. datum v budoucnu
  if (dateStr && new Date(dateStr) > today) {
    warnings.push(`${slug}: datum ${dateStr} je v budoucnosti`);
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
