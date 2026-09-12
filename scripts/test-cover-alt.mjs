// Živý web servíroval hlavní cover článku s alt="". Není dekorace: nemá
// aria-hidden. Alt nese titulek článku — frontmatter vlastní alt obrázku
// nemá. Náhledy karet (ArticleCard) hlídá test-karta-alt.mjs. Hero-visual
// na úvodce viz poslední test (kolo 29 z něj dekoraci udělalo vědomě).
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

// Kolo 29: hero-visual na úvodce už NENÍ pojmenovaný odkaz. Na stejný cíl
// vedou hned vedle h1 a „Přečíst analýzu“ (s videem „Video · 12:34“) —
// třetí odkaz s alt = h1 četl titulek třikrát a přidával zastávku tabulátoru.
// Cover je pro čtečku dekorace: aria-hidden + tabindex=-1 (myš kliká dál).
// Kolo 37: <img> přesto nese alt s titulkem — aria-hidden ho před čtečkou
// schová (titulek se třikrát nečte), ale vyhledávače obrázků a čtenář bez
// obrázků (spadlé CDN, vypnuté obrázky) LCP cover úvodky popsaný mají.
// Alt s titulkem tu je bezpečný JEN s aria-hidden na odkazu — bez něj by
// odkaz četl titulek potřetí (původní nález kola 29). Hlídá to test-kolo-29.
test('hero-visual na úvodce: aria-hidden + tabindex=-1 na odkazu, alt s titulkem na <img>', () => {
  const odkaz = uvodka.match(/<a [^>]*class="hero-visual"[^>]*>/)?.[0];
  assert.ok(odkaz, 'odkaz .hero-visual na úvodce chybí');
  assert.match(odkaz, /aria-hidden="true"/, 'bez aria-hidden by odkaz s alt = h1 četl titulek třikrát');
  assert.match(odkaz, /tabindex="-1"/, 'aria-hidden na fokusovatelném prvku = axe aria-hidden-focus');
  const visual = uvodka.match(/class="hero-visual"[^>]*>([\s\S]*?)<\/a>/)?.[1];
  assert.ok(visual, 'blok .hero-visual na úvodce chybí');
  assert.doesNotMatch(visual, /<img [^>]*alt=""/, 'LCP cover úvodky nesmí jít ven s alt="" (živě 12. 9. 2026)');
  assert.match(visual, /<img [^>]*alt=\{hero\.data\.title\}/, 'cover úvodky nese titulek hero článku jako alt');
});
