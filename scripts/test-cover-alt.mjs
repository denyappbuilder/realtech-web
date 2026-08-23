// Živý web servíroval hlavní cover článku i hero-visual na úvodce s alt="".
// Ani jeden není dekorace: nemají aria-hidden a hero-visual je odkaz, který
// bez altu nemá jméno. Alt nese titulek článku — frontmatter vlastní alt
// obrázku nemá. Náhledy karet s aria-hidden="true" a fasáda videa (jméno má
// z aria-label tlačítka) alt="" mít smí, ty tenhle test nehlídá.
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
