import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { nahledKarty } from '../src/lib/karta-nahled.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

function existsZeSady(soubory) {
  const sada = new Set(soubory);
  return (cesta) => sada.has(cesta);
}

test('Z1071: PNG cover má 1280×720 a žádný WebP source', () => {
  const out = nahledKarty(
    '/images/clanky/cover.png',
    existsZeSady(['public/images/clanky/cover.png']),
  );
  assert.equal(out.localThumb, '/images/clanky/cover.png');
  assert.equal(out.thumbW, 1280);
  assert.equal(out.thumbH, 720);
  assert.equal(out.thumbWebp, null);
  assert.equal(out.hasWebp, false);
});

test('Z1071: JPG s 640px variantou zůstane 640×360 + WebP', () => {
  const out = nahledKarty(
    '/images/clanky/cover.jpg',
    existsZeSady([
      'public/images/clanky/cover.jpg',
      'public/images/clanky/cover-640.jpg',
      'public/images/clanky/cover-640.webp',
    ]),
  );
  assert.equal(out.localThumb, '/images/clanky/cover-640.jpg');
  assert.equal(out.thumbW, 640);
  assert.equal(out.thumbH, 360);
  assert.equal(out.thumbWebp, '/images/clanky/cover-640.webp');
  assert.equal(out.hasWebp, true);
  assert.equal(out.lcpSrc, '/images/clanky/cover-640.webp');
});

test('Z1071: karta bere helper, ne holý replace na .jpg', () => {
  const src = readFileSync(
    path.join(REPOSITORY_ROOT, 'src/components/ArticleCard.astro'),
    'utf8',
  );
  assert.match(src, /from '\.\.\/lib\/karta-nahled\.js'/);
  assert.match(src, /nahledKarty\(image\)/);
  assert.doesNotMatch(
    src,
    /image\?\.replace\(\/\\\.jpg\$\//,
    'starý replace(/\\.jpg$/) nesmí zůstat v kartě',
  );
});
