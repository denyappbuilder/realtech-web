import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { parsePublishDate } from '../src/lib/calendarDate.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(join(koren, 'src/pages/index.astro'), 'utf8');

test('úvodka vybírá hero jako all[0]; featured nepinuje', () => {
  assert.match(
    index,
    /const hero = all\[0\]/,
    'hero musí zůstat const hero = all[0] po newest-first řazení',
  );
  assert.match(
    index,
    /b\.data\.date\.valueOf\(\) - a\.data\.date\.valueOf\(\)/,
    'řazení musí jít podle času vydání (date.valueOf), ne podle slugu',
  );
  assert.doesNotMatch(
    index,
    /FEATURED_MAX_AGE/,
    'FEATURED_MAX_AGE se nesmí vrátit — featured pin je zrušený',
  );
  assert.doesNotMatch(
    index,
    /\.sort\(\s*\(a,\s*b\)\s*=>\s*a\.id/,
    'stejný den se nesmí řadit primárně podle slugu/id',
  );

  const prirazeni = [...index.matchAll(/const hero\s*=\s*([^;]+);/g)].map((m) => m[1]);
  assert.ok(prirazeni.length > 0, 'index.astro musí mít přiřazení const hero');
  for (const vyraz of prirazeni) {
    assert.doesNotMatch(
      vyraz,
      /data\.featured/,
      `hero nesmí sahat na data.featured: ${vyraz.trim()}`,
    );
    assert.equal(
      /\.find\b/.test(vyraz) && /featured/.test(vyraz),
      false,
      `hero nesmí hledat featured přes all.find: ${vyraz.trim()}`,
    );
  }
});

test('živý stejný den: Hugging Face má čas vydání a předběhne date-only Nscale', () => {
  const huggingRaw = readFileSync(
    join(koren, 'src/content/clanky/nvidia-hugging-face-12-9-miliard.md'),
    'utf8',
  );
  const nscaleRaw = readFileSync(
    join(koren, 'src/content/clanky/anthropic-nscale-45-miliard.md'),
    'utf8',
  );
  const huggingFm = parseYaml(huggingRaw.split(/^---\s*$/m)[1]);
  const nscaleFm = parseYaml(nscaleRaw.split(/^---\s*$/m)[1]);

  const hugging = parsePublishDate(huggingFm.date);
  const nscale = parsePublishDate(nscaleFm.date);

  assert.equal(typeof huggingFm.date, 'string');
  assert.match(huggingFm.date, /T/, 'Hugging Face musí mít čas vydání, ne jen den');
  assert.doesNotMatch(nscaleFm.date, /T/, 'Nscale zůstává date-only — čas se nedomýšlí');
  assert.ok(hugging instanceof Date);
  assert.ok(nscale instanceof Date);
  assert.ok(
    hugging.valueOf() > nscale.valueOf(),
    'Hugging Face musí být později vydaný než Nscale téhož dne',
  );
  assert.equal(nscale.toISOString(), '2026-08-27T00:00:00.000Z');
});
