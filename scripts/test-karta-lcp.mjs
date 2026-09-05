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
const hub = zdroj('src/pages/temata/index.astro');
const uvodka = zdroj('src/pages/index.astro');
const vitej = zdroj('src/pages/vitej.astro');
const notfound = zdroj('src/pages/404.astro');

test('karta počítá loading a fetchpriority z props.priority / eager', () => {
  assert.match(karta, /priority\?:\s*boolean/);
  assert.match(karta, /eager\?:\s*boolean/);
  assert.match(karta, /titleTag\?:\s*'h2' \| 'h3'/);
  assert.match(karta, /const \{ article, priority = false(?:, [^}]*)? \} = Astro\.props/);
  assert.match(karta, /const loading = \(priority \|\| eager\) \? 'eager' : 'lazy'/);
  assert.match(karta, /const fetchpriority = priority \? 'high' : undefined/);
  assert.match(
    karta,
    /loading=\{loading\} decoding="async" fetchpriority=\{fetchpriority\}/,
  );
  assert.doesNotMatch(karta, /loading="lazy"/);
});

test('archiv dá priority první kartě jen na straně 1, ostatní karty jsou lazy', () => {
  assert.match(
    archiv,
    /priority=\{page === 1 && index === 0\}/,
    'fetchpriority=high jen na /clanky/ (page 1) index 0',
  );
  // Kolo 22: eager celé první řady (index < 3) soupeřilo s preloadovaným LCP.
  assert.doesNotMatch(
    archiv,
    /eager=\{/,
    'archiv nesmí dávat eager dalším kartám — eager + high má jen první',
  );
  assert.match(
    archiv,
    /titleTag="h2"/,
    'archiv pod h1 musí mít h2 titulky karet (ne h1→h3 skok)',
  );
  assert.doesNotMatch(
    archiv,
    /<ArticleCard article=\{article\} \/>/,
    'archiv nesmí vrátit kartu bez rozhodnutí o priority',
  );
  assert.doesNotMatch(
    archiv,
    /priority=\{index === 0\}/,
    'strana 2+ nesmí dostat high jen proto, že karta je první na stránce',
  );
});

test('téma dá priority první kartě na každé straně — featured-lead je LCP, zbytek lazy', () => {
  assert.match(temata, /priority=\{index === 0\}/);
  assert.doesNotMatch(temata, /eager=\{/, 'kolo 22: eager jen featured karta');
  assert.match(temata, /titleTag="h2"/);
});

test('hub /temata/ dá eager + fetchpriority jen první kartě', () => {
  assert.match(
    hub,
    /temata\.map\(\(t, i\) =>/,
    'hub musí mapovat s indexem, ať první karta může být LCP',
  );
  assert.match(
    hub,
    /loading=\{i === 0 \? 'eager' : 'lazy'\}/,
    'eager jen první karta hubu (kolo 22) — zbytek lazy',
  );
  assert.match(
    hub,
    /fetchpriority=\{i === 0 \? 'high' : undefined\}/,
    'první náhled hubu musí dostat fetchpriority=high',
  );
  assert.match(
    hub,
    /<h2><a href=\{\`\/temata\/\$\{t\.slug\}\/\`\}>/,
    'hub pod h1 musí mít h2 titulky (ne h1→h3 skok)',
  );
  assert.doesNotMatch(
    hub,
    /loading="lazy"/,
    'hub nesmí hardcodovat lazy na všechny náhledy',
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
