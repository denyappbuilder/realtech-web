// Kolo 21: leftover po živém auditu 5. 9. 2026 (po #388).
// Preload výpisů s imagesrcset/imagesizes, sizes featured/related karet,
// hero cover přes celý sloupec na mobilu, tisk v darku, fokus karty.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  KARTA_SIZES,
  KARTA_SIZES_FEATURED,
  KARTA_SIZES_RELATED,
} from '../src/lib/karta-nahled.js';
import { preloadHeroObrazku } from '../src/lib/hero-preload.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');

const css = cti('src/styles/global.css');
const karta = cti('src/components/ArticleCard.astro');
const archiv = cti('src/components/ArticleArchivePage.astro');
const tema = cti('src/components/TemaPage.astro');
const hub = cti('src/pages/temata/index.astro');
const vitej = cti('src/pages/vitej.astro');
const clanek = cti('src/pages/clanky/[...id].astro');

function mediaBlok(dotaz) {
  const start = css.search(new RegExp(`@media\\s*\\(${dotaz}\\)\\s*\\{`));
  if (start < 0) return '';
  const open = css.indexOf('{', start);
  let hloubka = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') hloubka += 1;
    else if (css[i] === '}') {
      hloubka -= 1;
      if (hloubka === 0) return css.slice(open + 1, i);
    }
  }
  return '';
}

const printBlok = (() => {
  const start = css.indexOf('@media print');
  const open = css.indexOf('{', start);
  let hloubka = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') hloubka += 1;
    else if (css[i] === '}') {
      hloubka -= 1;
      if (hloubka === 0) return css.slice(open + 1, i);
    }
  }
  return '';
})();

// ── Preload výpisů = <source> karty ────────────────────────────────────────

test('kolo 21: jedna konstanta sizes pro kartu i preload; featured a related mají vlastní slot', () => {
  assert.equal(KARTA_SIZES, '(max-width: 580px) 100vw, (max-width: 900px) 50vw, 33vw');
  assert.match(karta, /import \{ KARTA_SIZES, nahledKarty \} from '\.\.\/lib\/karta-nahled\.js'/);
  assert.match(karta, /sizes\?:\s*string/);
  assert.match(karta, /sizes = KARTA_SIZES/);
  assert.match(karta, /<source srcset=\{thumbWebpSrcset\} sizes=\{sizes\} type="image\/webp" \/>/);
  assert.doesNotMatch(karta, /CARD_SIZES/, 'lokální kopie sizes by se rozjela s imagesizes preloadu');

  // Featured karta tématu: ≥581px celá šířka mřížky, náhled 1.2fr/2.2fr (582px z 1072).
  assert.match(KARTA_SIZES_FEATURED, /582px$/);
  // Related pod článkem: 3 col v 760px = 241px.
  assert.match(KARTA_SIZES_RELATED, /241px$/);
  assert.match(KARTA_SIZES_RELATED, /^\(max-width: 700px\) 100vw/, '.related .grid padá na 1 col pod 701px');
});

test('kolo 21: preload první karty nese imagesrcset/imagesizes ze srcsetu karty', () => {
  const out = preloadHeroObrazku({
    src: '/images/clanky/x-640.webp',
    webp: '/images/clanky/x-640.webp',
    webpSrcset: '/images/clanky/x-640.webp 640w, /images/clanky/x.webp 1280w',
    sizes: KARTA_SIZES,
  });
  assert.deepEqual(out, {
    href: '/images/clanky/x-640.webp',
    imagesrcset: '/images/clanky/x-640.webp 640w, /images/clanky/x.webp 1280w',
    imagesizes: KARTA_SIZES,
    type: 'image/webp',
  });
  // Bez plného WebP (null z nahledKarty) zůstává single-URL preload.
  const bez = preloadHeroObrazku({ src: '/i/x-640.webp', webp: '/i/x-640.webp', webpSrcset: undefined, sizes: KARTA_SIZES });
  assert.deepEqual(bez, { href: '/i/x-640.webp', type: 'image/webp' });
});

test('kolo 21: archiv, téma, hub i vitej posílají thumbWebpSrcset + sizes do preloadu a <link> má imagesrcset/imagesizes', () => {
  const link = /imagesrcset=\{kartaPreload\.imagesrcset\}\s+imagesizes=\{kartaPreload\.imagesizes\}/;
  for (const [nazev, zdroj, sizes] of [
    ['archiv', archiv, 'KARTA_SIZES'],
    ['vitej', vitej, 'KARTA_SIZES'],
    ['téma', tema, 'KARTA_SIZES_FEATURED'],
  ]) {
    assert.match(zdroj, new RegExp(`webpSrcset: prvniNahled\\.thumbWebpSrcset \\?\\? undefined, sizes: ${sizes} \\}`), `${nazev}: preload bez srcsetu karty`);
    assert.match(zdroj, link, `${nazev}: <link rel=preload> bez imagesrcset/imagesizes`);
  }
  assert.match(hub, /webpSrcset: prvniHub\.nahled\.thumbWebpSrcset \?\? undefined,\s*sizes: KARTA_SIZES,/);
  assert.match(hub, link);
  assert.match(hub, /<source srcset=\{t\.nahled\.thumbWebpSrcset\} sizes=\{KARTA_SIZES\} type="image\/webp" \/>/, 'hub musí sdílet konstantu, ne inline řetězec');
});

test('kolo 21: featured karta tématu a related karty článku dostávají vlastní sizes', () => {
  assert.match(tema, /sizes=\{index === 0 \? KARTA_SIZES_FEATURED : undefined\}/);
  assert.match(clanek, /import \{ KARTA_SIZES_RELATED \} from '\.\.\/\.\.\/lib\/karta-nahled\.js'/);
  assert.match(clanek, /related\.map\(\(c\) => <ArticleCard article=\{c\} sizes=\{KARTA_SIZES_RELATED\} \/>\)/);
});

// ── Hero cover přes celý sloupec ───────────────────────────────────────────

test('kolo 21: .hero-visual pod 901px má width: 100% — strop výšky se nesmí přenést do šířky', () => {
  const mobil = mediaBlok('max-width:\\s*900px');
  const telo = mobil.match(/\.hero-visual\s*\{([^}]+)\}/)?.[1] ?? '';
  assert.match(telo, /width:\s*100%/, 'grid item s aspect-ratio se neroztáhne; bez šířky je cover 391px z 720px');
  assert.match(telo, /max-height:\s*220px/, 'Z10024 strop výšky zůstává');
});

// ── Tisk ───────────────────────────────────────────────────────────────────

test('kolo 21: tisk přepíše tokeny tématu na papír všemi třemi selektory dark režimu', () => {
  assert.match(printBlok, /:root,\s*:root\[data-theme="dark"\],\s*:root:not\(\[data-theme="light"\]\)\s*\{[^}]*--ink-soft:\s*#333/);
  assert.match(printBlok, /--surface:\s*#fff/);
  assert.match(printBlok, /color-scheme:\s*light/);
});

test('kolo 21: tisk kreslí štítek kategorie, datum a <pre> jako text s rámečkem, ne bílý text na netištěném pozadí', () => {
  assert.match(printBlok, /\.lower-third \.tag,\s*\.lower-third \.time,\s*\.article-head \.lower-third \.time\s*\{[^}]*background:\s*none;[^}]*color:\s*#000;[^}]*border:\s*1px solid #000/);
  assert.match(printBlok, /\.lower-third \.tag\.tag-zprava\s*\{[^}]*background:\s*none/, 'tag-zprava má pozdější pravidlo se stejnou specificitou — tisk potřebuje vyšší');
  assert.match(printBlok, /\.article-body pre\s*\{[^}]*color:\s*#000/);
});

// ── Fokus karty ────────────────────────────────────────────────────────────

test('kolo 21: fokus stretched linku nese celá karta (s fallbackem bez :has)', () => {
  assert.match(css, /@supports selector\(:has\(a\)\)\s*\{\s*\.card:has\(\.card-body a:focus-visible\)\s*\{[^}]*outline:\s*2px solid var\(--signal\)/);
  assert.match(css, /\.card \.card-body a:focus-visible\s*\{\s*outline:\s*none;?\s*\}/);
});
