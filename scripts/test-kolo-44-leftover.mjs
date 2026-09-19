// Kolo 44: audit webu po kolech 42–43 a #469 (živě 19. 9. 2026, preview
// 1280×800 / 390×844, light i dark, axe bez nálezů). Funkčně web drží;
// zbyly nedotažené kouty premium vrstvy a mrtvý kód. Tady zamčené:
//
// P1 Obsah článku: článek psaný jen v `###` (ChatGPT ve Wordu, 8× h3 bez h2)
//    měl v osnově všech osm položek odsazených jako podsekce bez rodiče.
//    article-outline počítá hloubku relativně k nejmělčímu nadpisu;
//    validate-content na h3-bez-h2 varuje (živý článek nemá spadnout).
// P1 Hledání (⌘K): premium round 3 stylovalo `.search-item-title`, ale
//    položka se jmenuje `.si-title` — pravidlo nikdy nesedlo, titulky ve
//    hledání zůstaly v broadcast řezu 700. Štítek kategorie a datum na
//    reading-face bez verzálek jako `.lt .k` / `.card-meta`.
// P1 404: jediná stránka v Archivo 850/108 % a v 640px sloupci vystředěném
//    uvnitř wrapu — nadpis 190 px vpravo od mřížky „Zatím mrkni na tohle“.
//    Editorial 650, levá hrana wrapu, měřítko přes max-width.
// P2 Mrtvé CSS: ticker (markup pryč od round 3), .hero-visual .rec/.tc/
//    .headline-mark (overlay pryč od round 3), .nl-cta (markup nikde) —
//    ~4 kB CSS na každé stránce. Pryč včetně print / reduced-motion / responsive.
// P2 Fonty: preload dvou woff2 Plex Sans 400 (latin + latin-ext) — tělo textu
//    se jinak objevuje až po druhém kole (CSS → font). Archivo ne (2× 88 kB,
//    soupeřilo by s LCP). Tytéž soubory jako fonts-plex.css, jinak 2× stažení.
// P3 Článek: AKTUALIZOVÁNO je <time datetime>; sdílení na X vede na
//    x.com/intent/post; tisk schová „Přejít rovnou na text“, témata a rail.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { articleOutline } from '../src/lib/article-outline.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const premium = cti('src/styles/premium.css');
const global = cti('src/styles/global.css');
const editorial = cti('src/styles/editorial.css');
const fontyPlex = cti('src/styles/fonts-plex.css');
const base = cti('src/layouts/Base.astro');
const baseSablona = bezKomentaru(base);
const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
const validace = cti('scripts/validate-content.mjs');

/** Tělo prvního pravidla se selektorem přesně na začátku řádku (mimo @media). */
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
const blok = (css, hlavicka) => css.match(new RegExp(`${hlavicka.source}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';

// ── P1: osnova článku psaného jen v ### ──────────────────────────────────────

test('kolo 44: osnova počítá hloubku relativně — článek jen s h3 nemá samé podsekce', () => {
  const jenH3 = articleOutline([
    { depth: 3, text: 'Co to je a co to není', slug: 'a' },
    { depth: 3, text: 'Kam tečou tvoje data', slug: 'b' },
  ]);
  assert.deepEqual(jenH3.map((h) => h.depth), [2, 2], 'h3 bez h2 jsou sekce, ne podsekce');
  assert.deepEqual(jenH3.map((h) => h.id), ['co-to-je-a-co-to-neni', 'kam-tecou-tvoje-data'], 'ID nadpisů (kotvy) se nemění');
  const smiseny = articleOutline([
    { depth: 2, text: 'Sekce', slug: 's' },
    { depth: 3, text: 'Podsekce', slug: 'p' },
    { depth: 4, text: 'Hlouběji', slug: 'h' },
  ]);
  assert.deepEqual(smiseny.map((h) => h.depth), [2, 3], 'h2 + h3 zůstává sekce + podsekce, h4 do osnovy nejde');
  assert.deepEqual(articleOutline([]), []);
  assert.deepEqual(articleOutline([{ depth: 1, text: 'Titulek', slug: 't' }]), []);
});

test('kolo 44: šablona článku značí podsekci podle relativní hloubky z osnovy', () => {
  assert.equal((clanek.match(/'contents-subsection': heading\.depth === 3/g) ?? []).length, 2, 'mobilní i desktopová osnova');
});

test('kolo 44: validate-content varuje na sekce jen v ### bez ## (nepadá)', () => {
  assert.match(validace, /\/\^### \/m\.test\(telo\) && !\/\^## \/m\.test\(telo\)/);
  assert.match(validace, /warnings\.push\(`\$\{f\.replace\(\/\\\.md\$\/, ''\)\}: sekce jsou jen ### bez ##/);
});

// ── P1: hledání ⌘K v premium kitu ────────────────────────────────────────────

test('kolo 44: premium styluje skutečnou třídu položky hledání (.si-title), ne .search-item-title', () => {
  assert.doesNotMatch(bezCssKomentaru(premium), /\.search-item-title/, 'selektor, který v markupu neexistuje');
  const titulek = pravidlo(premium, '.si-title');
  assert.ok(titulek, '.si-title v premium.css chybí');
  assert.match(titulek, /font-family:\s*var\(--editorial-face\)/);
  assert.match(titulek, /font-weight:\s*650/);
  assert.match(titulek, /font-stretch:\s*100%/);
  const stitek = pravidlo(premium, '.si-cat');
  assert.ok(stitek, '.si-cat v premium.css chybí');
  assert.match(stitek, /font-family:\s*var\(--reading-face\)/);
  assert.match(stitek, /text-transform:\s*none/);
  assert.match(stitek, /letter-spacing:\s*0/);
  assert.doesNotMatch(stitek, /background/, 'červená výplň štítku zůstává z global.css (kolo 19)');
  assert.match(cti('src/components/SearchModal.astro'), /class="si-title"/);
});

// ── P1: 404 ve stejném kitu jako archiv a O nás ──────────────────────────────

test('kolo 44: 404 má editorial nadpis a sedí na levé hraně wrapu jako mřížka pod ní', () => {
  const obal = pravidlo(premium, '.notfound');
  assert.ok(obal, '.notfound v premium.css chybí');
  assert.match(obal, /max-width:\s*1120px/, 'stejná šířka jako .wrap — ne 640px sloupec uprostřed');
  assert.doesNotMatch(obal, /padding:\s/, 'shorthand padding by přebil vodorovné odsazení .wrap (Z10254)');
  const h1 = pravidlo(premium, '.notfound h1');
  assert.ok(h1, '.notfound h1 v premium.css chybí');
  assert.match(h1, /font-family:\s*var\(--editorial-face\)/);
  assert.match(h1, /font-weight:\s*650/);
  assert.match(h1, /font-stretch:\s*100%/);
  assert.match(h1, /max-width:\s*\d+ch/, 'měřítko přes max-width nadpisu, ne přes užší wrap');
  assert.match(pravidlo(premium, '.notfound .lead'), /max-width:\s*54ch/);
  const mobil = blok(premium, /@media \(max-width: 580px\)/);
  assert.match(mobil, /\.notfound h1 \{ font-size: 2\.5rem; \}/, 'mobilní stupeň jako .about h1');
  // global.css zůstává (test-kolo-15-design hlídá padding-block a Archivo Clanek Fallback).
  assert.match(pravidlo(global, '.notfound'), /padding-block:\s*90px/);
});

// ── P2: mrtvé CSS pryč ───────────────────────────────────────────────────────

test('kolo 44: global.css nenese CSS pro markup, který na webu není (ticker, overlay hero, nl-cta)', () => {
  for (const mrtvy of [/\.ticker\b/, /\.ticker-/, /ticker-scroll/, /\.hero-visual \.rec\b/, /\.hero-visual \.tc\b/, /\.headline-mark/, /\.nl-cta/]) {
    for (const css of [global, premium, editorial]) assert.doesNotMatch(bezCssKomentaru(css), mrtvy, `${mrtvy}: selektor bez markupu`);
  }
  // Co z toho zbývá v markupu, zůstává i v CSS.
  assert.match(pravidlo(global, '.live-dot'), /background:\s*var\(--signal\)/, '.live-dot má videobar článku');
  assert.match(global, /\.hero-visual \.play \{ z-index: 1; \}/, 'play na coveru úvodky zůstává');
  const zdroje = ['src/layouts/Base.astro', 'src/pages/index.astro', 'src/pages/clanky/[...id].astro', 'src/components/ArticleCard.astro'].map(cti).join('\n');
  assert.doesNotMatch(zdroje, /class="(?:ticker|rec|tc|headline-mark|nl-cta)"/);
});

// ── P2: preload fontů těla textu ─────────────────────────────────────────────

test('kolo 44: Base preloaduje právě ty dva woff2 Plex Sans 400, které deklaruje fonts-plex.css', () => {
  const importy = [...base.matchAll(/^import (\w+) from '(@fontsource\/ibm-plex-sans\/files\/[^'?]+\.woff2)\?url';/gm)];
  assert.deepEqual(importy.map((m) => m[2]), [
    '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2',
    '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-ext-400-normal.woff2',
  ], 'jen Plex Sans 400 latin + latin-ext; Archivo (2× 88 kB) soupeří s LCP');
  for (const [, , cesta] of importy) {
    assert.match(fontyPlex, new RegExp(`url\\('${cesta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\)`), `${cesta}: preload míří na soubor, který CSS nepoužívá — stáhl by se dvakrát`);
  }
  for (const promenna of importy.map((m) => m[1])) {
    assert.match(baseSablona, new RegExp(`<link rel="preload" as="font" type="font/woff2" href=\\{${promenna}\\} crossorigin />`), `${promenna}: preload fontu bez crossorigin prohlížeč nespáruje`);
  }
  // Až za slotem stránky: LCP obrázek stránky má být v HTML první.
  assert.ok(baseSablona.indexOf('<slot name="head" />') < baseSablona.indexOf('as="font"'));
  assert.ok(baseSablona.indexOf('as="font"') < baseSablona.indexOf('beacon.min.js'));
  // Preload je jen font — hlavička nesmí preloadovat žádný obrázek (test-hero-preload).
  assert.doesNotMatch(baseSablona, /rel="preload"[^>]*as="image"/);
});

// ── P3: chrome článku ────────────────────────────────────────────────────────

test('kolo 44: AKTUALIZOVÁNO je <time datetime>, sdílení na X jde na x.com/intent/post', () => {
  assert.match(clanek, /\{updated && updatedStr && <time class="time" datetime=\{updated\.toISOString\(\)\.slice\(0, 10\)\}>AKTUALIZOVÁNO \{updatedStr\}<\/time>\}/);
  assert.doesNotMatch(clanek, /<span class="time">AKTUALIZOVÁNO/);
  assert.equal((clanek.match(/https:\/\/x\.com\/intent\/post\?text=/g) ?? []).length, 2, 'aside i patička článku');
  assert.doesNotMatch(clanek, /twitter\.com\/intent/);
});

test('kolo 44: tisk článku schová „Přejít rovnou na text“, témata úvodky a rail', () => {
  const tisk = blok(premium, /@media print/);
  assert.ok(tisk, 'premium.css nemá @media print');
  const skryte = tisk.match(/^\s*header\.site,[\s\S]*?\{ display: none; \}/m)?.[0] ?? '';
  for (const selektor of ['.article-credit .article-read-link', '.topic-navigation', '.hero-rail', '.reading-entry', '.newsletter', 'footer.site']) {
    assert.ok(skryte.includes(selektor), `${selektor} se tiskne`);
  }
});

// ── P1: přepínač tématu bez JS ───────────────────────────────────────────────

test('kolo 44: noscript schová přepínač tématu přes ID — .theme-toggle prohrávalo s pozdějším display: grid', () => {
  assert.match(base, /<Fragment set:html=\{'<noscript><style>#theme-toggle\{display:none\}<\/style><\/noscript>'\} \/>/);
  assert.doesNotMatch(base, /<style>\.theme-toggle\{display:none\}/, 'stejná specificita jako .theme-toggle { display: grid } v global.css — pořadí rozhodne pro stylesheet');
  assert.match(pravidlo(global, '.theme-toggle'), /display:\s*grid/, 'důvod, proč třída nestačí');
  assert.match(base, /<button id="theme-toggle" class="theme-toggle"/);
});
