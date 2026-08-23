import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLANEK_HERO_SIZES, heroObrazekClanku } from '../src/lib/hero-obrazek.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

function existsZeSady(soubory) {
  const sada = new Set(soubory);
  return (cesta) => sada.has(cesta);
}

const COVER = '/images/clanky/cover.jpg';

test('hero článku s 640.webp dá obě šířky do WebP srcset', () => {
  const out = heroObrazekClanku(
    COVER,
    existsZeSady([
      'public/images/clanky/cover.jpg',
      'public/images/clanky/cover-640.jpg',
      'public/images/clanky/cover.webp',
      'public/images/clanky/cover-640.webp',
    ]),
  );

  assert.equal(out.src, COVER);
  assert.equal(
    out.srcset,
    '/images/clanky/cover-640.jpg 640w, /images/clanky/cover.jpg 1280w',
  );
  assert.equal(out.webp, '/images/clanky/cover.webp');
  assert.equal(
    out.webpSrcset,
    '/images/clanky/cover-640.webp 640w, /images/clanky/cover.webp 1280w',
  );
  assert.equal(out.sizes, CLANEK_HERO_SIZES);
  assert.match(out.webpSrcset, /-640\.webp 640w/);
  assert.match(out.webpSrcset, /\.webp 1280w/);
});

test('chybějící 640.webp nesmí rozbít hero — 1280.webp zůstane fallback', () => {
  const out = heroObrazekClanku(
    COVER,
    existsZeSady([
      'public/images/clanky/cover.jpg',
      'public/images/clanky/cover.webp',
    ]),
  );

  assert.equal(out.src, COVER);
  assert.equal(out.srcset, undefined);
  assert.equal(out.webp, '/images/clanky/cover.webp');
  assert.equal(out.webpSrcset, undefined);
  assert.equal(out.sizes, CLANEK_HERO_SIZES);
});

test('chybějící 640.jpg nechá v <img> jen 1280 JPG', () => {
  const out = heroObrazekClanku(
    COVER,
    existsZeSady([
      'public/images/clanky/cover.jpg',
      'public/images/clanky/cover.webp',
      'public/images/clanky/cover-640.webp',
    ]),
  );

  assert.equal(out.srcset, undefined);
  assert.equal(
    out.webpSrcset,
    '/images/clanky/cover-640.webp 640w, /images/clanky/cover.webp 1280w',
  );
});

test('bez jakéhokoli WebP zůstane jen JPG', () => {
  const out = heroObrazekClanku(
    COVER,
    existsZeSady(['public/images/clanky/cover.jpg']),
  );

  assert.equal(out.webp, undefined);
  assert.equal(out.webpSrcset, undefined);
  assert.equal(out.src, COVER);
});

test('prázdný image nic nevyrobí', () => {
  const out = heroObrazekClanku(undefined, existsZeSady([]));
  assert.equal(out.src, undefined);
  assert.equal(out.srcset, undefined);
  assert.equal(out.webp, undefined);
  assert.equal(out.webpSrcset, undefined);
});

test('šablona článku zapojuje helper a sizes, ne holé 1280.webp', () => {
  const src = readFileSync(
    path.join(REPOSITORY_ROOT, 'src/pages/clanky/[...id].astro'),
    'utf8',
  );

  assert.match(src, /from '\.\.\/\.\.\/lib\/hero-obrazek\.js'/);
  assert.match(src, /heroObrazekClanku\(image\)/);
  assert.match(
    src,
    /heroWebpSrcset && <source srcset=\{heroWebpSrcset\} sizes=\{heroSizes\} type="image\/webp" \/>/,
  );
  assert.match(
    src,
    /srcset=\{heroSrcset\} sizes=\{heroSrcset \? heroSizes : undefined\}/,
  );
  assert.doesNotMatch(
    src,
    /image\.replace\(\/\\\.jpg\$\/,\s*'\.webp'\)/,
    'článek už nesmí dávat do srcset jen plné .webp bez 640',
  );
});
