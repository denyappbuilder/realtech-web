// Živě 24. 8. 2026: pásek „Nejnovější videa" na úvodce posílal
// i.ytimg.com/vi/{id}/hqdefault.jpg s width=480 height=360 — to je 4:3
// s černými pruhy, zatímco .vc-thumb má aspect-ratio 16/9 a ořezává.
// Hero i og:image už dávno berou maxresdefault (1280×720, 16:9) — #299.
//
// Pásek videí nespouští žádný render test (test-homepage.mjs testuje jen
// frontmatter), takže šablonu hlídáme jako text — stejný přístup jako
// test-hero-overlay.mjs nebo test-karta-z10093.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const index = readFileSync(path.join(KOREN, 'src/pages/index.astro'), 'utf8');
const karta = readFileSync(
  path.join(KOREN, 'src/components/ArticleCard.astro'),
  'utf8',
);

test('pásek videí na úvodce bere maxresdefault v rozměrech 1280×720', () => {
  assert.match(
    index,
    /<img src=\{`https:\/\/i\.ytimg\.com\/vi\/\$\{v\.id\}\/maxresdefault\.jpg`\} alt="" width="1280" height="720"/,
    'video karta na úvodce musí mít maxresdefault a 16:9 rozměry',
  );
});

test('žádný výpisový náhled neemituje hqdefault, když existuje 16:9 poster', () => {
  for (const [nazev, zdroj] of [
    ['src/pages/index.astro', index],
    ['src/components/ArticleCard.astro', karta],
  ]) {
    assert.doesNotMatch(
      zdroj,
      /hqdefault\.jpg/,
      `${nazev} nesmí posílat hqdefault (480×360, 4:3 s pruhy) — hero už bere 16:9 maxresdefault (#299)`,
    );
  }
});
