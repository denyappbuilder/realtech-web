// Projdou SKUTEČNÉ články produkčním schématem tak, jak je parsuje Astro?
//
// Proč to nestačí, co už v repu je: `scripts/validate-content.mjs` i
// `test-content-schema.mjs` čtou frontmatter přes js-yaml CORE_SCHEMA, kde
// `date: 2026-01-15` zůstane ŘETĚZEC. Astro ale markdown frontmatter parsuje
// výchozím schématem js-yaml, kde ze stejného zápisu vznikne `Date`. Obě strany
// pak vidí jinou hodnotu a schéma dostane jiný typ, než na jaký ho testujeme.
//
// Ta mezera není teoretická: `npm test` prochází i ve chvíli, kdy `astro build`
// padne na PRVNÍM článku a web se nedá vydat (BUILD-DATE-001).
import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { CORE_SCHEMA, load as parseYaml } from 'js-yaml';
import ts from 'typescript';
import { z } from 'astro/zod';
import { parseCalendarDate } from '../src/lib/calendarDate.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const CLANKY = path.join(REPOSITORY_ROOT, 'src/content/clanky');

/** Schéma z src/content.config.ts — stejným postupem jako validate-content.mjs. */
function nactiProdukcniSchema() {
  const configPath = path.join(REPOSITORY_ROOT, 'src/content.config.ts');
  const { outputText } = ts.transpileModule(readFileSync(configPath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: configPath,
  });
  const configModule = { exports: {} };

  vm.runInNewContext(
    outputText,
    {
      exports: configModule.exports,
      module: configModule,
      require(specifier) {
        if (specifier === 'astro:content') {
          return { defineCollection: (config) => config, z };
        }
        if (specifier === 'astro/loaders') {
          return { glob: (options) => options };
        }
        if (specifier === './lib/calendarDate.js') {
          return { parseCalendarDate };
        }
        throw new Error(`Neočekávaný import z content.config.ts: ${specifier}`);
      },
    },
    { filename: configPath },
  );

  const schema = configModule.exports.collections?.clanky?.schema;
  assert.equal(
    typeof schema?.safeParse,
    'function',
    'v src/content.config.ts nebylo nalezeno schéma kolekce clanky',
  );
  return schema;
}

/** Frontmatter mezi řádkovými `---` (Z1267/Z10036 — ne libovolný výskyt). */
function frontmatter(soubor) {
  const casti = readFileSync(path.join(CLANKY, soubor), 'utf8').split(/^---\s*$/m);
  assert.ok(casti.length >= 3, `${soubor} nemá frontmatter ohraničený řádky ---`);
  return casti[1];
}

const clanky = readdirSync(CLANKY).filter((f) => f.endsWith('.md'));
const articleSchema = nactiProdukcniSchema();

test('nequoted datum dorazí ke schématu jako Date, ne jako řetězec [BUILD-DATE-001]', () => {
  const zdroj = 'date: 2026-01-15\nupdated: "2026-02-20"\n';

  const jakoAstro = parseYaml(zdroj);
  const jakoValidator = parseYaml(zdroj, { schema: CORE_SCHEMA });

  assert.ok(
    jakoAstro.date instanceof Date,
    'výchozí schéma js-yaml (to používá Astro) dělá z nequoted data Date',
  );
  assert.equal(
    jakoValidator.date,
    '2026-01-15',
    'CORE_SCHEMA (to používá validate-content.mjs) nechá stejný zápis řetězcem',
  );
  assert.equal(
    jakoAstro.updated,
    '2026-02-20',
    'quoted hodnota zůstane řetězcem v obou parserech',
  );

  // Tohle je celý rozdíl: validátor a build hodnotí JINOU hodnotu. Dokud to
  // platí, nesmí být zelený `npm test` brán jako doklad, že web jde sestavit.
  assert.notEqual(typeof jakoAstro.date, typeof jakoValidator.date);
});

test(
  'každý článek projde produkčním schématem tak, jak ho parsuje Astro [BUILD-DATE-001]',
  {
    todo:
      'BUILD-DATE-001: po 8a2520f schéma nepřijímá Date, ale všech 66 článků má ' +
      'date: nequoted → astro build padne na prvním článku. Po opravě smaž todo.',
  },
  () => {
    const nepresly = [];

    for (const soubor of clanky) {
      const vysledek = articleSchema.safeParse(parseYaml(frontmatter(soubor)) ?? {});
      if (!vysledek.success) {
        const duvod = vysledek.error.issues
          .map((issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`)
          .join('; ');
        nepresly.push(`${soubor} — ${duvod}`);
      }
    }

    assert.deepEqual(
      nepresly,
      [],
      `${nepresly.length} z ${clanky.length} článků neprojde produkčním schématem, ` +
        `takže astro build spadne dřív, než vyrobí první stránku:\n${nepresly.slice(0, 3).join('\n')}`,
    );
  },
);
