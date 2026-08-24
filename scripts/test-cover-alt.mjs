// Živý web servíroval hlavní cover článku i hero-visual na úvodce s alt="".
// Ani jeden není dekorace: nemají aria-hidden a hero-visual je odkaz, který
// bez altu nemá jméno. Alt nese titulek článku — frontmatter vlastní alt
// obrázku nemá. Náhledy karet (ArticleCard) hlídá test-karta-alt.mjs.
//
// První verze testu fasádu videa výslovně přeskočila (jméno tlačítka dává
// aria-label) — jenže poster ve fasádě je u video článků LCP hero (eager,
// fetchpriority=high, maxresdefault), ne dekorace, a živě šel ven s alt=""
// (ověřeno 2026-08-24 na /clanky/starlink-mini-vs-standard/). aria-label
// pojmenovává ovládací prvek, o viditelném obrázku ale čtečka mlčela.
// Proto i poster fasády nese titulek článku.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const clanek = readFileSync(join(koren, 'src/pages/clanky/[...id].astro'), 'utf8');
const uvodka = readFileSync(join(koren, 'src/pages/index.astro'), 'utf8');

test('hlavní cover článku nesmí mít alt=""', () => {
  const hero = clanek.match(/<div class="article-hero">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(hero, 'blok .article-hero v šabloně článku chybí');
  assert.doesNotMatch(
    hero,
    /alt=""/,
    'hlavní cover má prázdný alt — čtečka o obrázku mlčí',
  );
  assert.match(
    hero,
    /<img [^>]*alt=\{title\}/,
    'hlavní cover musí mít alt s titulkem článku',
  );
});

test('poster video fasády (LCP hero video článku) nesmí mít alt=""', () => {
  const start = clanek.indexOf('{videoId && (');
  const end = clanek.indexOf('{video && (', start);
  assert.notEqual(start, -1, 'šablona článku nemá větev pro video');
  assert.notEqual(end, -1, 'nejde vymezit větev pro video');
  const facade = clanek.slice(start, end);
  assert.match(facade, /<img /, 'fasáda videa nerenderuje poster');
  assert.doesNotMatch(
    facade,
    /alt=""/,
    'poster video fasády má prázdný alt — u video článku je to LCP hero, čtečka o něm mlčí',
  );
  assert.match(
    facade,
    /<img [^>]*loading="eager"[^>]*\/>/,
    'poster fasády musí zůstat eager — jinak test hlídá jiný obrázek, než je LCP hero',
  );
  assert.match(
    facade,
    /<img [^>]*alt=\{title\}[^>]*loading="eager"/,
    'eager poster video fasády musí mít alt s titulkem článku',
  );
});

test('hero-visual na úvodce nesmí mít alt=""', () => {
  const visual = uvodka.match(/class="hero-visual">([\s\S]*?)<\/a>/)?.[1];
  assert.ok(visual, 'blok .hero-visual na úvodce chybí');
  assert.doesNotMatch(
    visual,
    /alt=""/,
    'hero-visual má prázdný alt — odkaz na hero článek je pro čtečku beze jména',
  );
  assert.match(
    visual,
    /<img [^>]*alt=\{hero\.data\.title\}/,
    'hero-visual musí mít alt s titulkem hero článku',
  );
});
