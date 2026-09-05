// Kolo 22: leftover po živém auditu 5. 9. 2026 (po #389).
// Jeden Insights beacon, hero úvodky na mobilu bez ořezu, eager jen první
// karta výpisů, cover článku ve sloupci hlavičky (760px), tisk a drobná a11y.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { CLANEK_HERO_SIZES, heroObrazekClanku } from '../src/lib/hero-obrazek.js';
import { preloadHeroObrazku } from '../src/lib/hero-preload.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');

const css = cti('src/styles/global.css');
const base = cti('src/layouts/Base.astro');
const uvodka = cti('src/pages/index.astro');
const archiv = cti('src/components/ArticleArchivePage.astro');
const tema = cti('src/components/TemaPage.astro');
const hub = cti('src/pages/temata/index.astro');
const clanek = cti('src/pages/clanky/[...id].astro');

function blok(zacatek) {
  const start = css.search(zacatek);
  if (start < 0) return '';
  const open = css.indexOf('{', start);
  let hloubka = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') hloubka += 1;
    else if (css[i] === '}') {
      hloubka -= 1;
      if (hloubka === 0) return css.slice(open + 1, i);
    }
  }
  return '';
}
// Top-level pravidlo je neodsazené; `.video-embed { margin-top: 20px }` leží
// i odsazené v @media (max-width: 580px). Uvnitř vyseknutého @media bloku
// (`vnorene`) jsou naopak všechna pravidla odsazená.
const pravidlo = (zdroj, selektor, { vnorene = false } = {}) =>
  zdroj.match(new RegExp(`^${vnorene ? '[ \\t]*' : ''}${selektor.replaceAll('.', '\\.')}\\s*\\{([^}]+)\\}`, 'm'))?.[1] ?? '';

// ── 1) Jeden Cloudflare Insights beacon ────────────────────────────────────

test('kolo 22: Base nevkládá vlastní Insights beacon — Pages ho injektuje sám na konec <body>', () => {
  assert.doesNotMatch(base, /beacon\.min\.js/, 'ruční <script> beaconu = druhý token, každé zobrazení dvakrát');
  assert.doesNotMatch(base, /data-cf-beacon/);
  assert.match(
    base,
    /<link rel="preconnect" href="https:\/\/static\.cloudflareinsights\.com" \/>/,
    'preconnect zůstává — vložený beacon z něj těží',
  );
});

// ── 2) Hero úvodky na mobilu drží 16/9 ─────────────────────────────────────

test('kolo 22: .hero-visual pod 901px ani 581px nemá max-height — cover není ořezaný proužek', () => {
  const tablet = pravidlo(blok(/@media\s*\(max-width:\s*900px\)\s*\{/), '.hero-visual', { vnorene: true });
  assert.match(tablet, /width:\s*100%/, 'kolo 21: přes celý sloupec');
  assert.doesNotMatch(tablet, /max-height/, '220px strop dělal z 720px coveru 3,3:1 proužek');
  const mobil = pravidlo(blok(/@media\s*\(max-width:\s*580px\)\s*\{/), '.hero-visual', { vnorene: true });
  assert.doesNotMatch(mobil, /max-height/, '160px strop dělal z 342px coveru 2,1:1 proužek');
  assert.match(pravidlo(css, '.hero-visual'), /aspect-ratio:\s*16\s*\/\s*9/, 'výšku dává jen 16/9');
});

// ── 3) Výpisy: eager + high jen první karta ─────────────────────────────────

test('kolo 22: archiv, téma i hub dávají eager jen první kartě, zbytek lazy', () => {
  assert.match(archiv, /priority=\{page === 1 && index === 0\}/);
  assert.doesNotMatch(archiv, /eager=\{/, 'tři eager náhledy soupeřily s preloadovaným LCP');
  assert.match(tema, /priority=\{index === 0\}/);
  assert.doesNotMatch(tema, /eager=\{/);
  assert.match(hub, /loading=\{i === 0 \? 'eager' : 'lazy'\}/);
  assert.match(hub, /fetchpriority=\{i === 0 \? 'high' : undefined\}/);
});

// ── 4) Cover článku ve sloupci hlavičky ────────────────────────────────────

test('kolo 22: .article-hero a fasáda videa drží 760px sloupec jako .article-head/.audio-prehled/.related', () => {
  for (const selektor of ['.article-hero', '.video-embed']) {
    const telo = pravidlo(css, selektor);
    assert.match(telo, /max-width:\s*760px/, `${selektor} přečníval přes 1120px wrap`);
    assert.match(telo, /margin:\s*28px auto 0/, `${selektor} musí být vycentrovaný (margin-inline auto)`);
  }
  assert.match(pravidlo(css, '.article-head'), /max-width:\s*760px/);
  assert.match(pravidlo(css, '.audio-prehled'), /max-width:\s*760px/);
  assert.match(pravidlo(css, '.related'), /max-width:\s*760px/);
});

test('kolo 22: sizes/preload hero článku míří na 760px, ne 1120px', () => {
  assert.equal(CLANEK_HERO_SIZES, '(max-width: 808px) 100vw, 760px');
  const out = heroObrazekClanku('/images/clanky/x.jpg', undefined, (c) =>
    ['public/images/clanky/x.jpg', 'public/images/clanky/x.webp', 'public/images/clanky/x-640.webp'].includes(c));
  const preload = preloadHeroObrazku({ src: out.lcpSrc, webp: out.webp, webpSrcset: out.webpSrcset, sizes: out.sizes });
  assert.equal(preload.imagesizes, '(max-width: 808px) 100vw, 760px');
  assert.match(clanek, /sizes=\{heroSizes\}/);
  assert.doesNotMatch(clanek, /1120px/);
});

// ── NICE ───────────────────────────────────────────────────────────────────

test('kolo 22: tisk kreslí štítek REALTECH na hero jako text s rámečkem', () => {
  const tisk = blok(/@media print\s*\{/);
  assert.match(tisk, /\.hero-visual \.rec\s*\{[^}]*background:\s*none;[^}]*color:\s*#000;[^}]*border:\s*1px solid #000/);
});

test('kolo 22: tisk doplňuje href jen k absolutním http(s) odkazům', () => {
  const tisk = blok(/@media print\s*\{/);
  assert.match(tisk, /\.article-body a\[href\^="http:\/\/"\]::after,\s*\.article-body a\[href\^="https:\/\/"\]::after\s*\{\s*content: " \(" attr\(href\) "\)"/);
  assert.doesNotMatch(tisk, /\.article-body a::after/, 'relativní /clanky/… a kotvy #sekce na papíře nikam nevedou');
});

test('kolo 22: tlačítko sdílení „X“ má aria-label, kopírování hlásí výsledek živou oblastí', () => {
  const x = clanek.match(/<a class="share-btn" href=\{`https:\/\/twitter\.com\/intent\/tweet[^>]*>X<\/a>/g) ?? [];
  assert.equal(x.length, 2, 'aside i patička článku mají tlačítko X');
  for (const tag of x) assert.match(tag, /aria-label="Sdílet na X"/);

  assert.match(clanek, /<p class="sr-only" role="status" aria-live="polite" data-copy-status><\/p>/);
  assert.match(clanek, /ohlasKopii\('Odkaz na článek zkopírován'\)/);
  assert.match(clanek, /ohlasKopii\(`Odkaz na sekci \$\{nazevSekce\} zkopírován`\)/);
  assert.match(css, /\.sr-only\s*\{[^}]*clip-path:\s*inset\(50%\)/);
  assert.doesNotMatch(pravidlo(css, '.sr-only'), /display:\s*none/, 'display: none by aria-live umlčelo');
  assert.ok(pravidlo(css, '.sr-only'), '.sr-only v CSS chybí');
});

test('kolo 22: og:image:alt úvodky nese titulek hero článku, Base má imageAlt s fallbackem na title', () => {
  assert.match(base, /imageAlt\?:\s*string/);
  assert.match(base, /const altNahledu = imageAlt \?\? title;/);
  assert.match(base, /<meta property="og:image:alt" content=\{altNahledu\} \/>/);
  assert.match(base, /<meta name="twitter:image:alt" content=\{altNahledu\} \/>/);
  assert.match(uvodka, /const heroOgAlt = heroOg \? hero\.data\.title : undefined;/);
  assert.match(uvodka, /image=\{heroOg\} imageAlt=\{heroOgAlt\}/);
});

test('kolo 22: logo v hlavičce i patičce nese jméno značky „REALTECH CZ — domů“', () => {
  const loga = base.match(/<a href="\/" class="logo" aria-label="([^"]+)">/g) ?? [];
  assert.equal(loga.length, 2);
  for (const tag of loga) assert.match(tag, /aria-label="REALTECH CZ — domů"/);
  assert.doesNotMatch(base, /REALTECHCZ/, 'slitý název čtečka četla jako jedno slovo');
});
