import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as images from '../src/lib/karta-nahled.js';

test('compact home thumbnails advertise their real slot without changing the hero', () => {
  assert.equal(images.KARTA_SIZES_HOME_COMPACT, '(max-width: 360px) 72px, (max-width: 580px) 96px, (max-width: 900px) calc((100vw - 72px) / 2), (max-width: 1120px) calc((100vw - 96px) / 3), 341px');
  // Kolo 54: hero je 16:9 ve 2. sloupci (redesign.css), slot 399–508 px — ne ořez 579px.
  // Kolo 56: hero na desktopu vyplňuje výšku sloupce (ořez cover) → 1080px.
  assert.equal(images.HOMEPAGE_HERO_SIZES, '(max-width: 900px) calc(100vw - 48px), 1080px');
});
const read = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');

test('header subscription names its destination, distinct from email', () => {
  const base = read('layouts/Base.astro');
  assert.match(base, /class="yt-btn" aria-label="Odebírat na YouTube"/);
  assert.match(base, /<span class="yt-label">YouTube<\/span>/);
});

test('compact homepage treatment is scoped to latest reports, not guides or desktop', () => {
  assert.match(read('pages/index.astro'), /class="grid latest-reports"/);
  const css = read('styles/premium.css');
  assert.ok(css.indexOf('.latest-reports {') > css.indexOf('@media (max-width: 580px)'));
});

test('archive search precedes category controls in both keyboard and visual order', () => {
  const source = read('components/ArticleArchivePage.astro');
  for (const branch of source.split('<div class="filter-bar').slice(1)) {
    assert.ok(branch.indexOf('<form') < branch.indexOf('class="cat-filter"'), 'search must be first in each filter branch');
    assert.match(branch, /<label[^>]*class="archive-search-label"/);
  }
});
