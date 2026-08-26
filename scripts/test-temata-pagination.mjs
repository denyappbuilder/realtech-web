import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ARTICLES_PER_PAGE } from '../src/lib/pagination.js';

const tema = readFileSync(new URL('../src/components/TemaPage.astro', import.meta.url), 'utf8');
const paginatedRoute = readFileSync(new URL('../src/pages/temata/[slug]/strana/[page].astro', import.meta.url), 'utf8');

test('téma posílá nejvýše jednu stránku karet v prvním HTML a sdílí velikost stránky s archivem', () => {
  assert.equal(ARTICLES_PER_PAGE, 15);
  assert.match(tema, /import \{ ARTICLES_PER_PAGE \} from '\.\.\/lib\/pagination\.js'/);
  assert.match(tema, /clanky\.slice\(start, start \+ ARTICLES_PER_PAGE\)/);
});

test('další stránky tématu vznikají jako statické cesty od strany 2', () => {
  assert.match(paginatedRoute, /import \{ ARTICLES_PER_PAGE \} from '\.\.\/\.\.\/\.\.\/\.\.\/lib\/pagination\.js'/);
  assert.match(paginatedRoute, /index \+ 2/);
  assert.match(paginatedRoute, /params: \{ slug: slugify\(category\), page: String\(index \+ 2\) \}/);
});

test('stránkování tématu zachová průchod bez JavaScriptu', () => {
  assert.match(tema, /<nav class="archive-pagination"/);
  assert.match(tema, /href=\{pagePath\(page \+ 1\)\}/);
  assert.match(tema, /href=\{pagePath\(page - 1\)\}/);
});

test('hlavička nese rel=prev/next jen tam, kde sousední strana existuje', () => {
  assert.match(
    tema,
    /\{page > 1 && <link rel="prev" href=\{new URL\(pagePath\(page - 1\), Astro\.site\)\} slot="head" \/>\}/,
  );
  assert.match(
    tema,
    /\{page < totalPages && <link rel="next" href=\{new URL\(pagePath\(page \+ 1\), Astro\.site\)\} slot="head" \/>\}/,
  );
});

test('strana 1 tématu žije na /temata/{slug}/ — pagePath negeneruje /strana/1/', () => {
  assert.match(
    tema,
    /pageNumber === 1 \? `\/temata\/\$\{slug\}\/` : `\/temata\/\$\{slug\}\/strana\/\$\{pageNumber\}\/`/,
  );
});
