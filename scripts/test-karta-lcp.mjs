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
const temata = zdroj('src/pages/temata/[slug].astro');
const uvodka = zdroj('src/pages/index.astro');

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

test('archiv dá priority jen první kartě na straně 1', () => {
  assert.match(
    archiv,
    /articles\.map\(\(article, index\) => \(\s*<ArticleCard article=\{article\} priority=\{page === 1 && index === 0\} \/>/,
    'strana 1 musí eagerovat jen index 0; /clanky/strana/2+ zůstane lazy',
  );
  assert.doesNotMatch(
    archiv,
    /<ArticleCard article=\{article\} \/>/,
    'archiv nesmí vrátit kartu bez rozhodnutí o priority',
  );
});

test('téma dá priority první kartě — featured-lead je LCP', () => {
  assert.match(
    temata,
    /clanky\.map\(\(article, index\) => \(\s*<ArticleCard article=\{article\} priority=\{index === 0\} \/>/,
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
