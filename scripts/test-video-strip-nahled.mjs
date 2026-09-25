// Živě 24. 8. 2026: pásek „Nejnovější videa" na úvodce posílal
// i.ytimg.com/vi/{id}/hqdefault.jpg s width=480 height=360 — to je 4:3
// s černými pruhy, zatímco .vc-thumb má aspect-ratio 16/9 a ořezává.
//
// Oprava na maxresdefault ale přestřelila: tři malé thumby (~350 px)
// stahovaly živě 26. 8. 2026 dohromady ~490 KB v 1280×720. Pak sddefault
// (640×480, ~64 KB): po ořezu 4:3 pruhů zbylo jen 640×360.
//
// Kolo 50 (audit 23. 9. 2026): hq720 je nativní 16:9 1280×720. Jako JPEG
// má ~185 KB (stejná past jako maxres), jako WebP z i.ytimg.com/vi_webp/
// ~85 KB — <picture> s WebP a JPEG jen jako fallback. Video bez 720p hq720
// nemá (404) — build pak padá na sddefault s pravdivými rozměry
// (video-pasek-nahled.js, test-homepage.mjs).
//
// Pásek videí nespouští žádný render test (test-homepage.mjs testuje jen
// frontmatter), takže šablonu hlídáme jako text — stejný přístup jako
// test-hero-overlay.mjs nebo test-karta-z10093.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { maHq720, videoPasekNahled } from '../src/lib/video-pasek-nahled.js';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const index = readFileSync(path.join(KOREN, 'src/pages/index.astro'), 'utf8');
const karta = readFileSync(
  path.join(KOREN, 'src/components/ArticleCard.astro'),
  'utf8',
);

test('pásek videí na úvodce: <picture> s WebP zdrojem a JPEG fallbackem, rozměry z náhledu, dekorace pro čtečku', () => {
  assert.match(
    index,
    /<span class="vc-thumb">\s*<picture>\s*<source srcset=\{v\.nahled\.webpSrcset \?\? v\.nahled\.webp\} sizes="[^"]+" type="image\/webp" \/>\s*<img src=\{v\.nahled\.jpg\} alt="" aria-hidden="true" width=\{v\.nahled\.width\} height=\{v\.nahled\.height\} loading="lazy" decoding="async" \/>\s*<\/picture>/,
  );
  assert.match(index, /\{videaPasek\.map\(\(v\) => \(/);
  assert.doesNotMatch(index, /sddefault\.jpg|maxresdefault\.jpg`\} alt=""/, 'URL náhledu pásku skládá jen video-pasek-nahled.js');
  assert.doesNotMatch(
    index,
    /\$\{v\.id\}\/maxresdefault\.jpg/,
    'malý thumb v pásku nesmí stahovat maxresdefault (1280×720 JPEG, ~170 KB) — maxres patří jen heru',
  );
});

test('videoPasekNahled: hq720 WebP + JPEG 1280×720, bez HD sddefault 640×480', () => {
  assert.deepEqual(videoPasekNahled('dyU7RAa5l0Y'), {
    webp: 'https://i.ytimg.com/vi_webp/dyU7RAa5l0Y/hq720.webp',
    jpg: 'https://i.ytimg.com/vi/dyU7RAa5l0Y/hq720.jpg',
    width: 1280,
    height: 720,
    webpSrcset: 'https://i.ytimg.com/vi_webp/dyU7RAa5l0Y/mqdefault.webp 320w, https://i.ytimg.com/vi_webp/dyU7RAa5l0Y/hq720.webp 1280w',
  });
  assert.deepEqual(videoPasekNahled('dyU7RAa5l0Y', { hd: false }), {
    webp: 'https://i.ytimg.com/vi_webp/dyU7RAa5l0Y/sddefault.webp',
    jpg: 'https://i.ytimg.com/vi/dyU7RAa5l0Y/sddefault.jpg',
    width: 640,
    height: 480,
    webpSrcset: undefined,
  });
});

test('maHq720: jen 404 znamená „není“, chyba sítě hq720 nechá', async () => {
  const volani = [];
  assert.equal(await maHq720('x', async (url, volby) => { volani.push([url, volby.method]); return { status: 200 }; }), true);
  assert.deepEqual(volani, [['https://i.ytimg.com/vi/x/hq720.jpg', 'HEAD']]);
  assert.equal(await maHq720('x', async () => ({ status: 404 })), false);
  assert.equal(await maHq720('x', async () => { throw new Error('offline'); }), true);
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
