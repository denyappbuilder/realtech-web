import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { KARTA_SIZES_ARCHIVE, nahledKarty, webpSrcsetZDerivatu } from '../src/lib/karta-nahled.js';
import { preloadHeroObrazku } from '../src/lib/hero-preload.js';

// Exercise the homepage's actual derivation block without an Astro fixture build.
function homepage(image, files, video) {
  const source = fs.readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('const heroImage ='), source.indexOf('const heroOgSoubor ='));
  return vm.runInNewContext(`${block}; ({ heroSrcset, heroHasWebp, heroWebp, heroWebpSrcset, heroLcpSrc })`, {
    hero: { data: { image } }, heroVideoId: video,
    fs: { existsSync: (p) => files.includes(p) }, webpSrcsetZDerivatu,
  });
}

test('B06: optional small WebP candidates preserve existing-only gating and card parity', () => {
  const files = [192, 384, 640, 960].map((w) => `public/cover-${w}.webp`).concat('public/cover.webp', 'public/cover-640.jpg', 'public/cover.jpg');
  const exists = (p) => files.includes(p);
  const expected = '/cover-192.webp 192w, /cover-384.webp 384w, /cover-640.webp 640w, /cover-960.webp 960w, /cover.webp 1280w';
  assert.equal(webpSrcsetZDerivatu('/cover.webp', exists), expected);
  assert.equal(nahledKarty('/cover.jpg', exists).thumbWebpSrcset, expected);
  assert.equal(webpSrcsetZDerivatu('/cover.webp', (p) => exists(p) && !p.includes('-192')), expected.replace('/cover-192.webp 192w, ', ''));
  assert.equal(webpSrcsetZDerivatu('/cover.webp', (p) => exists(p) && !p.includes('-640.webp')), null);
  assert.equal(webpSrcsetZDerivatu('/cover.webp', (p) => exists(p) && p !== 'public/cover.webp'), null);
});

test('B06: archive square cover sizes account for 16:9 crop at both mobile breakpoints', () => {
  assert.ok(KARTA_SIZES_ARCHIVE.startsWith('(max-width: 360px) 128px, (max-width: 580px) 171px,'));
  for (const slot of [72, 96]) {
    const sourceSize = slot === 72 ? 128 : 171;
    for (const dpr of [1, 2, 3]) {
      const candidate = [192, 384, 640, 960, 1280].find((w) => w >= sourceSize * dpr);
      assert.ok(candidate * 9 / 16 >= slot * dpr, `${slot}px square at DPR ${dpr}`);
    }
  }
});

test('B06: existing PNG stays original, without false JPEG candidates or WebP preload', () => {
  const result = homepage('/cover.png', ['public/cover.png']);
  assert.equal(result.heroSrcset, undefined);
  assert.equal(result.heroHasWebp, false);
  assert.equal(result.heroLcpSrc, '/cover.png');
  const preload = preloadHeroObrazku({ src: result.heroLcpSrc, webp: result.heroHasWebp ? result.heroWebp : undefined, webpSrcset: result.heroWebpSrcset });
  assert.equal(preload.href, '/cover.png');
  assert.notEqual(preload.type, 'image/webp');
  assert.equal(preload.imagesrcset, undefined);
});

test('B06: JPG keeps real JPEG candidates and optional WebP; missing-path policy unchanged', () => {
  const jpg = homepage('/cover.jpg', ['public/cover.jpg', 'public/cover-640.jpg']);
  assert.equal(jpg.heroSrcset, '/cover-640.jpg 640w, /cover.jpg 1280w');
  assert.equal(jpg.heroHasWebp, false);
  assert.equal(homepage('/cover.jpg', ['public/cover.jpg']).heroSrcset, undefined);
  assert.equal(homepage('/missing.jpg', []).heroLcpSrc, '/missing.jpg');
  assert.equal(homepage('/missing.jpg', [], 'abcdefghijk').heroLcpSrc, 'https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg');
  const webp = homepage('/cover.jpg', ['public/cover.jpg', 'public/cover-640.jpg', 'public/cover.webp', 'public/cover-640.webp']);
  assert.equal(webp.heroHasWebp, true);
  assert.equal(webp.heroWebpSrcset, '/cover-640.webp 640w, /cover.webp 1280w');
  assert.equal(homepage(undefined, []).heroLcpSrc, undefined);
  assert.equal(homepage(undefined, [], 'abcdefghijk').heroLcpSrc, 'https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg');
});
