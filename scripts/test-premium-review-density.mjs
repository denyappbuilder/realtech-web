import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as thumbnails from '../src/lib/karta-nahled.js';
import { preloadHeroObrazku } from '../src/lib/hero-preload.js';

test('homepage cover requests available 1280w desktop, preserving mobile sizes', () => {
  assert.equal(thumbnails.HOMEPAGE_HERO_SIZES, '(max-width: 900px) calc(100vw - 48px), 1280px');
});

test('cover-aware size is shared by homepage source, fallback and preload', () => {
  const index = fs.readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  assert.match(index, /const HERO_SIZES = HOMEPAGE_HERO_SIZES;/);
  assert.match(index, /sizes: HERO_SIZES/);
  assert.match(index, /<source srcset=\{heroWebpSrcset\} sizes=\{HERO_SIZES\}/);
  assert.match(index, /sizes=\{\(!heroHasWebp && heroSrcset\) \? HERO_SIZES : undefined\}/);
  const srcset = thumbnails.webpSrcsetZDerivatu('/cover.webp', () => true);
  assert.match(srcset, /-960.webp 960w/);
  const preload = preloadHeroObrazku({ src: '/cover.webp', webp: '/cover.webp', webpSrcset: srcset, sizes: thumbnails.HOMEPAGE_HERO_SIZES });
  assert.equal(preload.imagesizes, thumbnails.HOMEPAGE_HERO_SIZES);
  assert.equal(preload.imagesrcset, srcset);
});
