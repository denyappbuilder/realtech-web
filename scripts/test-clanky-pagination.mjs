import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ARTICLES_PER_PAGE } from '../src/lib/pagination.js';

const archive = readFileSync(new URL('../src/components/ArticleArchivePage.astro', import.meta.url), 'utf8');
const paginatedRoute = readFileSync(new URL('../src/pages/clanky/strana/[page].astro', import.meta.url), 'utf8');

test('archiv posílá nejvýše 15 karet v prvním HTML', () => {
  assert.equal(ARTICLES_PER_PAGE, 15);
  assert.match(archive, /import \{ ARTICLES_PER_PAGE \} from '\.\.\/lib\/pagination\.js'/);
  assert.match(archive, /all\.slice\(start, start \+ ARTICLES_PER_PAGE\)/);
});

test('další stránky archivu vznikají jako statické cesty od strany 2', () => {
  assert.match(paginatedRoute, /import \{ ARTICLES_PER_PAGE \} from '\.\.\/\.\.\/\.\.\/lib\/pagination\.js'/);
  assert.match(paginatedRoute, /index \+ 2/);
  assert.match(paginatedRoute, /params: \{ page: String\(index \+ 2\) \}/);
});

test('stránkování zachová průchod bez JavaScriptu', () => {
  assert.match(archive, /<nav class="archive-pagination"/);
  assert.match(archive, /href=\{pagePath\(page \+ 1\)\}/);
  assert.match(archive, /href=\{pagePath\(page - 1\)\}/);
});
