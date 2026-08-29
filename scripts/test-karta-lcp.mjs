// První náhled na výpisu nesmí být lazy — jinak LCP čeká na intersection
// observer. Rodiče předají ArticleCard prop `priority` u indexu 0;
// karta sama to nehádá z CSS.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');

function zdroj(rel) {
  return readFileSync(join(koren, rel), 'utf8');
}

const karta = zdroj('src/components/ArticleCard.astro');
const archiv = zdroj('src/components/ArticleArchivePage.astro');
const temata = zdroj('src/components/TemaPage.astro');
const uvodka = zdroj('src/pages/index.astro');
const vitej = zdroj('src/pages/vitej.astro');
const notfound = zdroj('src/pages/404.astro');

test('karta počítá loading a fetchpriority z props.priority', () => {
  assert.match(karta, /priority\?:\s*boolean/);
  assert.match(karta, /const \{ article, priority = false \} = Astro\.props/);
  assert.match(karta, /const loading = priority \? 'eager' : 'lazy'/);
  assert.match(karta, /const fetchpriority = priority \? 'high' : undefined/);
  assert.match(
    karta,
    /loading=\{loading\} decoding="async" fetchpriority=\{fetchpriority\}/,
  );
  assert.doesNotMatch(karta, /loading="lazy"/);
});

test('archiv dá priority první kartě jen na straně 1', () => {
  assert.match(
    archiv,
    /articles\.map\(\(article, index\) => \(\s*<ArticleCard article=\{article\} priority=\{page === 1 && index === 0\} \/>/,
    'eager/high jen na /clanky/ (page 1), ne na /clanky/strana/2+',
  );
  assert.doesNotMatch(
    archiv,
    /<ArticleCard article=\{article\} \/>/,
    'archiv nesmí vrátit kartu bez rozhodnutí o priority',
  );
  assert.doesNotMatch(
    archiv,
    /priority=\{index === 0\}/,
    'strana 2+ nesmí dostat eager jen proto, že karta je první na stránce',
  );
});

test('téma dá priority první kartě na každé straně — featured-lead je LCP', () => {
  assert.match(
    temata,
    /articles\.map\(\(article, index\) => \(\s*<ArticleCard article=\{article\} priority=\{index === 0\} \/>/,
  );
});

test('vitej dá priority první kartě — stránka nemá hero obrázek', () => {
  assert.match(
    vitej,
    /latest\.map\(\(c, i\) => <ArticleCard article=\{c\} priority=\{i === 0\} \/>\)/,
    'první karta „Nejnovější reporty" je LCP na /vitej/ — eager jen index 0',
  );
  assert.doesNotMatch(
    vitej,
    /<ArticleCard article=\{c\} \/>/,
    'vitej nesmí vrátit kartu bez rozhodnutí o priority',
  );
});

test('404 dá priority první kartě — stránka nemá hero obrázek', () => {
  assert.match(
    notfound,
    /latest\.map\(\(article, index\) => <ArticleCard article=\{article\} priority=\{index === 0\} \/>\)/,
    'první karta „Zatím mrkni na tohle" je LCP na 404 — eager jen index 0',
  );
  assert.doesNotMatch(
    notfound,
    /<ArticleCard article=\{article\} \/>/,
    '404 nesmí vrátit kartu bez rozhodnutí o priority',
  );
});

test('úvodka nenechá kartu soupeřit s hero o fetchpriority', () => {
  assert.match(uvodka, /fetchpriority="high"/);
  assert.match(
    uvodka,
    /\{rest\.map\(\(article\) => <ArticleCard article=\{article\} \/>\)\}/,
  );
  assert.match(
    uvodka,
    /\{pruvodci\.map\(\(article\) => <ArticleCard article=\{article\} \/>\)\}/,
  );
  const karty = [...uvodka.matchAll(/<ArticleCard[^>]*>/g)].map((m) => m[0]);
  assert.ok(karty.length >= 2, 'úvodka ztratila ArticleCard v mřížkách pod herem');
  for (const tag of karty) {
    assert.doesNotMatch(
      tag,
      /priority/,
      `karta na úvodce nesmí dostat priority — LCP je hero: ${tag}`,
    );
  }
});
