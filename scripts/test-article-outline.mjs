import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const helper = new URL('../src/lib/article-outline.js', import.meta.url);
test('outline provides section anchors matching the existing ASCII heading pipeline', async () => {
  assert.ok(existsSync(helper), 'article outline helper is implemented');
  const { articleOutline } = await import(helper);
  assert.deepEqual(articleOutline([
    { depth: 1, text: 'Titulek', slug: 'titulek' },
    { depth: 2, text: 'Co se mění?', slug: 'co-se-mění' },
    { depth: 3, text: 'Cena', slug: 'cena' },
    { depth: 4, text: 'Cena', slug: 'cena-1' },
    { depth: 2, text: 'Cena', slug: 'cena-2' },
    { depth: 2, text: '…', slug: 'fallback' },
  ]), [
    { depth: 2, text: 'Co se mění?', id: 'co-se-meni' },
    { depth: 3, text: 'Cena', id: 'cena' },
    { depth: 2, text: 'Cena', id: 'cena-2' },
    { depth: 2, text: '…', id: 'fallback' },
  ]);
  assert.deepEqual(articleOutline(), []);
});

test('article ships native mobile and desktop section navigation before reading', () => {
  const source = readFileSync(new URL('../src/pages/clanky/[...id].astro', import.meta.url), 'utf8');
  assert.match(source, /const \{ Content, headings \} = await render\(article\)/);
  assert.match(source, /articleOutline\(headings\)/);
  assert.match(source, /<details class="article-contents-mobile"/);
  assert.match(source, /<nav class="article-contents" aria-label="Obsah článku">/);
  assert.match(source, /href="#article-text"/);
  assert.match(source, /id="article-text" tabindex="-1"/);
  assert.ok(source.indexOf('article-contents-mobile') < source.indexOf('<AudioPrehled'));
});
