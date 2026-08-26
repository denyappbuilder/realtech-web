// Živě 24. 8. 2026: pásek „Nejnovější videa" na úvodce posílal
// i.ytimg.com/vi/{id}/hqdefault.jpg s width=480 height=360 — to je 4:3
// s černými pruhy, zatímco .vc-thumb má aspect-ratio 16/9 a ořezává.
//
// Oprava na maxresdefault ale přestřelila: tři malé thumby (~350 px)
// stahovaly živě 26. 8. 2026 dohromady ~490 KB v 1280×720. Správně je
// sddefault (640×480): má sice 4:3 pruhy 60 px nahoře a dole, ale
// .vc-thumb s object-fit: cover je ořeže PŘESNĚ — zbyde ostrých 640×360.
// hqdefault by po stejném ořezu nechal měkkých 480×270, proto dál nesmí.
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

test('pásek videí na úvodce bere sddefault v rozměrech 640×480', () => {
  assert.match(
    index,
    /<img src=\{`https:\/\/i\.ytimg\.com\/vi\/\$\{v\.id\}\/sddefault\.jpg`\} alt="" aria-hidden="true" width="640" height="480"/,
    'video karta na úvodce musí mít sddefault a jeho pravdivé rozměry 640×480',
  );
  assert.doesNotMatch(
    index,
    /\$\{v\.id\}\/maxresdefault\.jpg/,
    'malý thumb v pásku nesmí stahovat maxresdefault (1280×720, ~170 KB) — maxres patří jen heru',
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
