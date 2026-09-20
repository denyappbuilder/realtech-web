// Kolo 47: živý vizuální audit se zaměřením na design (realtech.cz 20. 9. 2026
// — úvodka, nejnovější článek, /clanky/, /temata/ai-report/, /temata/, 404;
// 1280 i 390px, light i dark; computed styly přes headless Chrome). Hledaly se
// „nedodělané“ plochy: dvojí poloměry, sirotčí styly z broadcast kitu,
// dělicí linky bez kontrastu. Žádná změna markupu ani obsahu — jen premium.css
// (poslední vrstva; global.css drží testy kol 14–46).
//
// P1 Jedno červené tlačítko, dva tvary: `.yt-btn` byl v hlavičce a pod „video
//    není“ pilulka 24px, ale ve videobaru, výzvě B19 a autorském boxu 8px —
//    v boxu hranaté „Odebírat na YouTube“ hned vedle pilulky „Víc o nás“.
//    DESIGN.md `rounded.control` = 24px → jedna hodnota pro celou třídu.
// P1 Hlavička tabulky: poslední Plex Mono verzálky s prostrkáním ve čtecím
//    sloupci (kolo 43 přepsalo .mono, .card-meta, štítky, hledání) + 2px
//    linka v --ink — v darku bílý pruh přes tabulku. Reading-face 0.8rem/600,
//    --line-strong 1px.
// P1 ⌘K tlačítko: `border-radius: 50%` na 101×44 = elipsa vedle pilulky
//    YouTube. 999px = pilulka v každém poměru, kruh u 44×44 přepínače.
// P1 <details> (mobilní osnova, přepis audia) kreslil UA trojúhelník — jediný
//    marker prohlížeče v kitu. Vlastní šipka z currentColor, [open] dolů.
// P2 Zbylé panely čtecího sloupce mimo kit: výzva B19 (10px/--line), navigace
//    Starší/Novější (8px/--line, titulek Archivo 750), komentáře B04 (8px
//    ploška i tlačítko). Stejný kit jako audio/autor: 12px, --line-strong,
//    editorial 650, tlačítko pilulka.
// P2 Citát: 1px --line na --bg nebyl vidět (Grok Voice) → 2px --line-strong.
// P2 Inline `code`: ve světlém podklad --bg = barva stránky, odlišoval ho jen
//    rámeček (článek AGENTS.md: 20+ krabiček); v darku --panel + rámeček.
//    Jeden vzhled v obou tématech: tón z --ink, bez rámečku.
// P2 Archiv: „Načítám index článků…“ holý odstavec vedle plošky „Nic
//    nenalezeno“ z kola 43 → stejná ploška.
// P2 404: .notfound uvnitř .article-page = 64 + 64 = 128px shora (archiv 64).
// P2 Hub tématu: štítek téže kategorie na každém náhledu (15× „AI Report“ pod
//    h1 AI Report) → na .featured-lead se nekreslí; „Zpráva“ a délka zůstávají.
//
// Zváženo a ponecháno: newsletter pole/tlačítko 10px = DESIGN.md
// `rounded.compact-control`; červené štítky ve hledání (kolo 44 výslovně);
// aside na 900px výšky roluje bez naznačení (fade by tlumil i poslední odkaz
// bez přetečení — CSS overflow nepozná; zaparkováno); ČTENÍ N MIN verzálky
// jsou text v markupu, ne CSS.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const premium = bezCssKomentaru(cti('src/styles/premium.css'));
const global = bezCssKomentaru(cti('src/styles/global.css'));
const editorial = bezCssKomentaru(cti('src/styles/editorial.css'));

/** Tělo prvního pravidla se selektorem přesně na začátku řádku (i odsazeného v @media). */
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
const blok = (css, hlavicka) => css.match(new RegExp(`${hlavicka.source}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
const mobil = blok(premium, /@media \(max-width: 580px\)/);

// ── P1: jedna pilulka pro každé červené YouTube tlačítko ─────────────────────

test('kolo 47: .yt-btn má v premium.css jeden poloměr 24px (DESIGN.md rounded.control) — hlavička, videobar, výzva B19 i autorský box', () => {
  const yt = pravidlo(premium, '.yt-btn');
  assert.ok(yt, 'premium.css: základní .yt-btn chybí');
  assert.match(yt, /border-radius:\s*24px/);
  assert.match(yt, /padding-inline:\s*20px/, 'pilulka potřebuje o krok víc vodorovného paddingu než 8px roh (18px)');
  assert.doesNotMatch(yt, /background|color:/, 'výplň --signal-fill a bílý text zůstávají z global.css (test-kolo-19)');
  // Žádná další výjimka tvaru: ani autor (kolo 46 hlídá), ani videobar/výzva.
  assert.doesNotMatch(premium, /\.(author-box|article-videobar|article-cta-inline) \.yt-btn\s*\{[^}]*border-radius/);
  assert.match(pravidlo(premium, '.article-videobar-bez-videa .yt-btn'), /border-radius:\s*24px/, 'kolo 44 zůstává, teď už jen potvrzuje základ');
  assert.match(pravidlo(premium, 'header.site .yt-btn'), /border-radius:\s*24px/);
  assert.match(pravidlo(premium, '.btn-primary, .btn-ghost'), /border-radius:\s*24px/, 'stejná pilulka jako ostatní ovládací prvky (kolo 43)');
  // global.css beze změny: 8px základ a --signal-fill drží starší testy.
  assert.match(pravidlo(global, '.yt-btn'), /border-radius:\s*var\(--radius\)/);
  assert.match(pravidlo(global, '.yt-btn'), /background:\s*var\(--signal-fill\)/);
  // Úzký mobil: header.site .yt-btn (vyšší specificita) dál řídí šířku 44px a padding 0.
  assert.match(blok(premium, /@media \(max-width: 360px\)/), /header\.site \.yt-btn \{ width: 44px; padding: 0;/);
  assert.match(cti('DESIGN.md'), /^\s*control: "24px"/m, 'token, o který se poloměr opírá');
});

test('kolo 47: ⌘K a přepínač tématu mají 999px (pilulka / kruh), ne 50 % (elipsa na 101×44)', () => {
  const kontrola = pravidlo(premium, '.search-trigger, .theme-toggle');
  assert.ok(kontrola, 'společné pravidlo .search-trigger, .theme-toggle chybí');
  assert.match(kontrola, /border-radius:\s*999px/);
  assert.doesNotMatch(premium, /\.search-trigger[^{]*\{[^}]*border-radius:\s*50%/);
  // Markup ⌘K se nemění: ikona + <kbd> = obdélník, na mobilu (kbd skrytý) 44×44 kruh.
  const base = bezKomentaru(cti('src/layouts/Base.astro'));
  assert.match(base, /<button class="search-trigger" data-search-open[^>]*>\s*<svg[\s\S]*?<\/svg>\s*<kbd class="st-kbd">⌘K<\/kbd>\s*<\/button>/);
  assert.match(pravidlo(global, '.theme-toggle'), /width:\s*44px;\s*height:\s*44px/);
});

// ── P1: hlavička tabulky v reading-face, oddělovač --line-strong ────────────

test('kolo 47: .article-body th je reading-face bez verzálek a prostrkání, s 1px --line-strong místo 2px --ink', () => {
  const th = pravidlo(premium, '.article-body th');
  assert.ok(th, 'premium.css: .article-body th chybí');
  assert.match(th, /font-family:\s*var\(--reading-face\)/);
  assert.match(th, /font-size:\s*0\.8rem/);
  assert.match(th, /font-weight:\s*600/);
  assert.match(th, /letter-spacing:\s*0;/);
  assert.match(th, /text-transform:\s*none/);
  assert.match(th, /color:\s*var\(--ink-soft\)/);
  assert.match(th, /border-bottom:\s*1px solid var\(--line-strong\)/);
  assert.doesNotMatch(th, /background/, 'podklad --bg hlavičky z global.css zůstává (tichý tón nad zebrou)');
  // global.css drží mono + 2px --ink (test-kolo-17) — premium přepisuje, nemaže.
  assert.match(pravidlo(global, '.article-body th'), /IBM Plex Mono/);
  assert.match(pravidlo(global, '.article-body th'), /border-bottom:\s*2px solid var\(--ink\)/);
  // Ostatní styly tabulky se nemění: zebra, tučný první sloupec, obal 8px (kolo 45 hlídá mobil).
  assert.match(global, /\.article-body tbody tr:nth-child\(even\) td \{ background: color-mix/);
  assert.match(global, /\.article-body td:first-child \{ font-weight: 600; \}/);
  assert.doesNotMatch(premium, /^\.article-body (td|table|\.table-wrap)\s*\{/m, 'premium mimo @media sahá jen na th');
});

// ── P1: vlastní šipka <details> ──────────────────────────────────────────────

test('kolo 47: summary mobilní osnovy a přepisu audia má vlastní šipku (::before), UA marker skrytý, [open] otočí dolů', () => {
  const sel = '.article-contents-mobile summary, .audio-prehled-prepis summary';
  const summary = pravidlo(premium, sel);
  assert.ok(summary, 'společné pravidlo summary chybí');
  assert.match(summary, /list-style:\s*none/);
  assert.match(summary, /display:\s*flex/);
  assert.match(summary, /align-items:\s*center/);
  assert.match(pravidlo(premium, '.article-contents-mobile summary::-webkit-details-marker, .audio-prehled-prepis summary::-webkit-details-marker'), /display:\s*none/, 'starší Safari ignoruje list-style na summary');
  const sipka = pravidlo(premium, '.article-contents-mobile summary::before, .audio-prehled-prepis summary::before');
  assert.ok(sipka, 'šipka ::before chybí');
  assert.match(sipka, /content:\s*''/);
  assert.match(sipka, /border:\s*solid currentColor/, 'barva z textu — v darku i světlém bez dalšího tokenu');
  assert.match(sipka, /border-width:\s*0 1\.5px 1\.5px 0/);
  assert.match(sipka, /transform:\s*rotate\(-45deg\)/, 'zavřeno = doprava');
  assert.match(sipka, /transition:\s*transform 200ms var\(--editorial-ease\)/, 'globální reduced-motion vypínač transition zruší; otočení je stav');
  assert.match(pravidlo(premium, '.article-contents-mobile[open] > summary::before, .audio-prehled-prepis[open] > summary::before'), /transform:\s*rotate\(45deg\)/, 'otevřeno = dolů');
  // Počet sekcí „1 / 9“ vpravo: ve flexu float nefunguje, drží margin-left: auto.
  const span = pravidlo(blok(premium, /@media \(max-width: 900px\)/), '.article-contents-mobile summary span');
  assert.match(span, /margin-left:\s*auto/);
  assert.doesNotMatch(span, /float/);
  // Markup nativních <details> beze změny (kolo 45/46): žádný JS pro rozbalení.
  const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
  assert.match(clanek, /<details class="article-contents-mobile">\s*<summary>Obsah článku <span data-reading-section aria-hidden="true"><\/span><\/summary>/);
  assert.match(bezKomentaru(cti('src/components/AudioPrehled.astro')), /<details class="audio-prehled-prepis">\s*<summary>Přepis<\/summary>/);
  // 44px cíle zůstávají: editorial 48px summary osnovy, global 9px padding přepisu.
  assert.match(pravidlo(blok(editorial, /@media \(max-width: 900px\)/), '.article-contents-mobile summary'), /min-height:\s*48px/);
  assert.match(pravidlo(global, '.audio-prehled-prepis summary'), /padding-block:\s*9px/);
  assert.match(global, /a:focus-visible, button:focus-visible, summary:focus-visible \{\s*outline: 2px solid var\(--signal\)/, 'fokus ring summary z kola 15');
});

// ── P2: zbylé panely čtecího sloupce ve stejném kitu ─────────────────────────

test('kolo 47: výzva B19, navigace Starší/Novější a komentáře sedí na 12px / --line-strong jako audio a autorský box', () => {
  const cta = pravidlo(premium, '.article-cta-inline');
  assert.match(cta, /border-color:\s*var\(--line-strong\)/);
  assert.match(cta, /border-radius:\s*var\(--radius-field\)/);
  assert.match(pravidlo(global, '.article-cta-inline'), /border:\s*1px solid var\(--line\)/, 'global.css se nemění (test-b19)');

  const an = pravidlo(premium, '.an-item');
  assert.match(an, /border-color:\s*var\(--line-strong\)/);
  assert.match(an, /border-radius:\s*var\(--radius-field\)/);
  assert.match(pravidlo(premium, '.an-item:hover'), /border-color:\s*var\(--ink-soft\)/, 'stejný hover jako obrysová tlačítka hlavičky');
  const anTitle = pravidlo(premium, '.an-title');
  assert.match(anTitle, /font-family:\s*var\(--editorial-face\)/);
  assert.match(anTitle, /font-weight:\s*650/);
  assert.match(anTitle, /font-stretch:\s*100%/);
  assert.match(anTitle, /letter-spacing:\s*-0\.015em/, 'stejný titulek jako .hero-rail-title a .tema-souvisi-title');
  assert.match(pravidlo(premium, '.an-item .mono'), /color:\s*var\(--ink-soft\)/);
  assert.match(pravidlo(global, '.an-title'), /font-weight:\s*750/, 'global.css drží starý řez — premium přepisuje');

  const ph = pravidlo(premium, '.komentare-placeholder');
  assert.match(ph, /border-color:\s*var\(--line-strong\)/);
  assert.match(ph, /border-radius:\s*var\(--radius-field\)/);
  assert.doesNotMatch(ph, /min-height/, 'B04: ploška zůstává nízká');
  assert.match(pravidlo(premium, '.komentare-nacist'), /border-radius:\s*24px/, 'tlačítko = pilulka jako .btn-primary');
  assert.match(premium, /\.komentare\.komentare-aktivni \.giscus:empty,\n\.komentare\.komentare-aktivni \.giscus:has\(> \.giscus-frame--loading\) \{ border-radius: var\(--radius-field\); \}/, 'kostra načítání iframe stejný poloměr');
  assert.match(pravidlo(global, '.komentare-nacist'), /min-height:\s*44px/, 'global.css se nemění (test-b04)');
  // Audio a autorský box (kolo 43/46) dál definují kit, ke kterému se tyhle tři přidávají.
  assert.match(pravidlo(premium, '.audio-prehled, .article-videobar'), /border:\s*1px solid var\(--line-strong\)[^}]*border-radius:\s*var\(--radius-field\)/);
  assert.match(pravidlo(premium, '.author-box'), /border:\s*1px solid var\(--line-strong\)[^}]*border-radius:\s*var\(--radius-field\)/);
});

test('kolo 47: citát má 2px --line-strong (1px --line na --bg nebyl vidět); inline code jeden vzhled v obou tématech, bez rámečku', () => {
  const bq = pravidlo(premium, '.article-body blockquote');
  assert.match(bq, /border-left:\s*2px solid var\(--line-strong\)/);
  assert.match(bq, /color:\s*var\(--ink-soft\)/);
  assert.match(global, /\n\.article-body blockquote \{\n\s*border-left: 3px solid var\(--signal\);/, 'global.css beze změny');

  const code = pravidlo(premium, '.article-page .article-layout .article-body code');
  assert.ok(code, 'pravidlo pro inline code chybí');
  assert.match(code, /background:\s*color-mix\(in srgb, var\(--ink\) 8%, transparent\)/, 'tón z --ink sedí ve světlém i tmavém');
  assert.match(code, /border:\s*0/);
  assert.match(pravidlo(premium, '.article-page .article-layout .article-body pre code'), /background:\s*none/, 'kód v <pre> zůstává bez podkladu (specificita 0,3,2 > global 0,1,2)');
  // Proč (0,3,1): dark override v global.css má :root[data-theme="dark"] .article-body code = (0,3,1).
  assert.match(global, /:root\[data-theme="dark"\] \.article-body code \{ background: var\(--panel\); \}/);
  assert.match(pravidlo(global, '.article-body code'), /border:\s*1px solid var\(--line\)/, 'global.css beze změny');
  assert.match(pravidlo(global, '.article-body pre'), /background:\s*var\(--panel\)/, 'blok kódu zůstává na --panel');
});

// ── P2: stavy archivu, 404, hub tématu ──────────────────────────────────────

test('kolo 47: „Načítám index článků…“ je stejná ploška jako „Nic nenalezeno“ (kolo 43), na mobilu s užším paddingem', () => {
  assert.match(premium, /^\[data-archive\] \.filter-loading,\n\[data-archive\] \.filter-empty \{/m, '.filter-empty drží vlastní řádek (test-kolo-43 čte pravidlo od začátku řádku)');
  const ploska = pravidlo(premium, '[data-archive] .filter-empty');
  assert.match(ploska, /padding:\s*40px 24px/);
  assert.match(ploska, /border-radius:\s*var\(--radius-field\)/);
  assert.match(mobil, /\[data-archive\] \.filter-loading,\n\s*\[data-archive\] \.filter-empty \{ padding: 32px 18px; \}/);
  // Markup a role stavů beze změny (kolo 18/29/33/37).
  const archiv = bezKomentaru(cti('src/components/ArticleArchivePage.astro'));
  assert.match(archiv, /<p class="filter-loading" role="status" hidden>Načítám index článků…<\/p>/);
  assert.match(pravidlo(global, '.filter-empty,\n.filter-loading'), /padding:\s*12px 0/, 'global.css beze změny');
});

test('kolo 47: 404 nezdvojuje horní odsazení — .article-page dává 64px, .notfound už nic', () => {
  const nf = pravidlo(premium, '.notfound');
  assert.match(nf, /padding-block:\s*0;/);
  assert.doesNotMatch(nf, /padding:\s/, 'shorthand by přebil vodorovné odsazení .wrap (Z10254, kolo 44)');
  assert.match(nf, /max-width:\s*1120px/, 'kolo 44 zůstává');
  assert.match(pravidlo(mobil, '.notfound'), /padding-top:\s*0/);
  assert.match(pravidlo(premium, '.article-page'), /padding:\s*64px 0 88px/, 'jediný zdroj horního odsazení 404');
  assert.match(pravidlo(premium, '.articles.hub'), /padding-top:\s*64px/, 'stejná hrana shora jako archiv a hub');
  assert.match(mobil, /\.article-page \{ padding-top: 32px;/);
  assert.match(pravidlo(global, '.notfound'), /padding-block:\s*90px/, 'global.css se nemění (test-kolo-15)');
  assert.match(cti('src/pages/404.astro'), /<div class="article-page">\s*<div class="wrap notfound">/, 'obal, kvůli kterému se odsazení sčítalo');
});

test('kolo 47: na stránce tématu se štítek téže kategorie na náhledech nekreslí; markup karty a ostatní výpisy beze změny', () => {
  assert.match(pravidlo(premium, '.featured-lead .card-thumb .lt .k'), /display:\s*none/);
  assert.doesNotMatch(premium, /\.featured-lead \.card-thumb \.lt \.(z|t)\s*\{[^}]*display:\s*none/, '„Zpráva“ a délka videa zůstávají');
  const karta = bezKomentaru(cti('src/components/ArticleCard.astro'));
  assert.match(karta, /<span class="k">\{category\}<\/span>/, 'štítek zůstává v markupu — archiv, úvodka, related, klientská karta z indexu');
  const tema = bezKomentaru(cti('src/components/TemaPage.astro'));
  assert.match(tema, /<div class="grid featured-lead">/);
  assert.match(tema, /<span class="tag">\{category\}<\/span>/, 'kategorii říká .lower-third nad h1');
  assert.doesNotMatch(bezKomentaru(cti('src/components/ArticleArchivePage.astro')), /featured-lead/, 'archiv .featured-lead nemá — štítky zůstávají');
  assert.doesNotMatch(bezKomentaru(cti('src/pages/index.astro')), /featured-lead/);
});

// ── Zváženo a ponecháno ─────────────────────────────────────────────────────

test('kolo 47: newsletter drží 10px (DESIGN.md rounded.compact-control), štítky ve hledání červené (kolo 44)', () => {
  assert.match(pravidlo(premium, '.nl-form input'), /border-radius:\s*10px/);
  assert.match(pravidlo(premium, '.nl-form button'), /border-radius:\s*10px/);
  assert.match(cti('DESIGN.md'), /^\s*compact-control: "10px"/m);
  assert.match(pravidlo(global, '.si-cat'), /background:\s*var\(--signal-fill\)/);
  assert.doesNotMatch(pravidlo(premium, '.si-cat'), /background/);
});
