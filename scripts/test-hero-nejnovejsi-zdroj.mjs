import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(join(koren, 'src/pages/index.astro'), 'utf8');

test('úvodka vybírá hero jako all[0]; featured nepinuje', () => {
  assert.match(
    index,
    /const hero = all\[0\]/,
    'hero musí zůstat const hero = all[0] po date-desc řazení',
  );
  assert.doesNotMatch(
    index,
    /FEATURED_MAX_AGE/,
    'FEATURED_MAX_AGE se nesmí vrátit — featured pin je zrušený',
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
