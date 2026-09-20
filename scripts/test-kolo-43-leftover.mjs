// Kolo 43: design polish po auditu 17. 9. 2026 (Deny: „vypadá to trochu
// nedodělaně“). Site funkčně drží; dojem dělá chrome / rytmus / tokeny, ne
// chybějící features. Žádný redesign — jen sjednocení, tady zamčené:
//
// P1 UI popisky `// Sdílej dál`, `// Další témata`, `// CHYBA 404` = code
//    comment chrome vedle reading-led premium vrstvy. Bez lomítek; jen UI
//    stringy, těla článků netknuta.
// P1 premium.css nulovala border na .audio-prehled / .article-videobar —
//    --surface je od --bg jen o schod, bloky plavaly. 1px rámeček zpět,
//    radius přes token --radius-field (12px). Vizuální audit: --line je na
//    oddělovačích sekcí hairline bez kontrastu → --line-strong (o krok
//    tmavší) JEN pro audio/videobar, tema-souvisi a related. Ne token redesign.
// P1 .tema-souvisi (kolo 42) přilepený pod mřížkou: border-top, padding-top,
//    gap 14px, nadpis bez natvrdo 1.15rem.
// P2 .share-btn na globálním --radius 8px vedle 24px chipů a 12px polí →
//    var(--radius-field). Popisky chrome jedna škála (0.85rem / 600 / --ink).
// P2 .filter-empty v archivu holý odstavec → tichá ploška s rámečkem.
// P2 Mobilní header ≤580px: oddělovač mezi řadou loga a navigací. Bez
//    hamburgeru.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const premium = cti('src/styles/premium.css');
const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
const tema = bezKomentaru(cti('src/components/TemaPage.astro'));
const notfound = bezKomentaru(cti('src/pages/404.astro'));

/** Tělo prvního pravidla se selektorem přesně na začátku řádku (mimo @media). */
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
/** Obsah bloku @media (max-width: 580px). */
const mobil = premium.match(/@media \(max-width: 580px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

// ── P1: UI popisky bez `//` ─────────────────────────────────────────────────

test('kolo 43: žádný UI popisek nezačíná `// ` — Sdílej dál, Další témata, Chyba 404', () => {
  assert.match(clanek, /<div class="article-share">\s*<span class="mono">Sdílej dál<\/span>/);
  assert.match(tema, /<nav class="topics" aria-label="Další témata">\s*<span class="mono">Další témata<\/span>/);
  assert.match(notfound, /<span class="mono">Chyba 404<\/span>/);
  for (const [cesta, zdroj] of [['clanky/[...id].astro', clanek], ['TemaPage.astro', tema], ['404.astro', notfound]]) {
    assert.doesNotMatch(zdroj, /<(?:span|p|h[1-6]) class="mono"[^>]*>\s*\/\//, `${cesta}: popisek s code-comment „//“`);
  }
});

// ── P1: rámeček na audio přehledu a videobaru ───────────────────────────────

test('kolo 43: premium vrací 1px rámeček na .audio-prehled / .article-videobar, radius přes --radius-field', () => {
  assert.match(pravidlo(premium, ':root'), /--radius-field:\s*12px/, 'token pole 12px (DESIGN.md rounded.field)');
  const blok = pravidlo(premium, '.audio-prehled, .article-videobar');
  assert.ok(blok, 'společné pravidlo .audio-prehled, .article-videobar chybí');
  assert.match(blok, /border:\s*1px solid var\(--line-strong\)/, 'rámeček zpět — bez něj plovoucí panel');
  assert.doesNotMatch(blok, /border:\s*0/);
  assert.match(blok, /border-radius:\s*var\(--radius-field\)/);
  assert.match(blok, /padding:\s*24px/);
});

// Kolo 44: varianta bez videa je ještě tišší — bez karty, jen hairline nad
// řadou a obrysové tlačítko (test-kolo-44-leftover.mjs). Výzva zůstává.
test('kolo 43: článek bez videa má vlastní modifikátor, varianta s videem beze změny, výzva zůstává', () => {
  assert.match(clanek, /\{!video && xEmbedy\.length === 0 && \(\s*<div class="article-videobar article-videobar-bez-videa">/);
  assert.match(clanek, /\{video && \(\s*<div class="article-videobar">/, 'varianta s videem beze změny');
  assert.ok(pravidlo(premium, '.article-videobar-bez-videa'), 'modifikátor v premium.css chybí');
  assert.doesNotMatch(pravidlo(premium, '.article-videobar-bez-videa'), /display:\s*none/);
  assert.match(clanek, /K tomuhle článku video není[\s\S]*?Odebírat kanál/, 'YT výzva u článku bez videa zůstává');
});

// ── P1: tema-souvisi rytmus ─────────────────────────────────────────────────

test('kolo 43: .tema-souvisi má oddělovač a rytmus jako .archive-pagination, bez natvrdo 1.15rem', () => {
  const blok = pravidlo(premium, '.tema-souvisi');
  assert.match(blok, /border-top:\s*1px solid var\(--line-strong\)/);
  assert.match(blok, /padding-top:\s*(28|30|32)px/);
  assert.match(pravidlo(premium, '.related'), /border-top:\s*1px solid var\(--line-strong\)/, '„Další reporty“ stejný oddělovač');
  assert.doesNotMatch(premium, /\.tema-souvisi \.section-head h2\s*\{[^}]*font-size/, 'nadpis drží škálu .section-head h2');
  const gap = pravidlo(premium, '.tema-souvisi-list').match(/gap:\s*(\d+)px/)?.[1];
  assert.ok(gap && Number(gap) >= 12 && Number(gap) <= 16, `gap seznamu 12–16px, je ${gap}`);
  assert.match(mobil, /\.tema-souvisi, \.related \{[^}]*padding-top:\s*24px/);
});

test('kolo 43: --line-strong je o krok tmavší jen pro oddělovače sekcí — pole, karty a header drží --line', () => {
  assert.match(pravidlo(premium, ':root'), /--line-strong:\s*#CBD2DA/);
  assert.match(premium, /:root\[data-theme="dark"\] \{ --line-strong: #343C48; \}/);
  assert.match(premium, /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{ --line-strong: #343C48; \}/);
  const pouziti = premium.match(/^[^@\n][^{\n]*\{[^}]*var\(--line-strong\)/gm) ?? [];
  const selektory = pouziti.map((p) => p.split('{')[0].trim());
  // Kolo 44: tichý videobar bez videa je taky oddělovač sekce (hairline nad řadou).
  // Kolo 46: autorský box je panel ve čtecím sloupci jako audio/videobar — stejný rámeček.
  // Kolo 47: zbylé panely čtecího sloupce (výzva B19, navigace Starší/Novější, komentáře)
  // a oddělovače v textu (citát, hlavička tabulky) — dřív 1px --line, které na --bg nebylo vidět.
  assert.deepEqual(selektory.sort(), [
    '.audio-prehled, .article-videobar', '.article-videobar-bez-videa', '.author-box', '.related', '.tema-souvisi',
    '.article-body blockquote', '.article-body th', '.article-cta-inline', '.an-item', '.komentare-placeholder',
  ].sort(), `--line-strong jen na oddělovačích sekcí a panelech čtecího sloupce, je: ${selektory}`);
  assert.match(pravidlo(premium, '[data-archive] .filter-empty'), /var\(--line\)/, 'pole archivu drží --line');
  assert.match(mobil, /header\.site nav\.main \{[^}]*var\(--line\)/, 'header drží --line');
});

// ── P2: share radius + jedna škála popisků ──────────────────────────────────

test('kolo 43: .share-btn na --radius-field; popisky chrome jedna škála 0.85rem / 600 / --ink', () => {
  assert.match(pravidlo(premium, '.share-btn'), /border-radius:\s*var\(--radius-field\)/);
  const popisky = premium.match(/^\.article-contents h2, \.article-aside \.mono, \.article-share \.mono, \.topics \.mono \{([^}]*)\}/m)?.[1] ?? '';
  assert.ok(popisky, 'společné pravidlo popisků chybí');
  assert.match(popisky, /font-family:\s*var\(--reading-face\)/);
  assert.match(popisky, /font-size:\s*0\.85rem/);
  assert.match(popisky, /font-weight:\s*600/);
  assert.match(popisky, /color:\s*var\(--ink\)/);
  assert.match(popisky, /letter-spacing:\s*0/, 'global dává .article-share .mono 0.08em — premium ruší');
  assert.doesNotMatch(premium, /^\.article-contents h2\s*\{[^}]*font-size:\s*0\.95rem/m, 'stará 0.95rem výjimka');
});

// ── P2: archiv prázdný výsledek ─────────────────────────────────────────────

test('kolo 43: [data-archive] .filter-empty je ploška s rámečkem, ne holý odstavec', () => {
  const blok = pravidlo(premium, '[data-archive] .filter-empty');
  assert.ok(blok, 'pravidlo chybí');
  assert.match(blok, /padding:\s*(32|36|40|44|48)px/, 'padding-block 32–48px');
  assert.match(blok, /background:\s*var\(--surface\)/);
  assert.match(blok, /border:\s*1px solid var\(--line\)/);
  assert.match(blok, /border-radius:\s*var\(--radius-field\)/);
  assert.match(blok, /text-align:\s*center/);
  assert.doesNotMatch(blok, /display:/, '`hidden` řídí skript / edge — display se nesahá');
  assert.match(cti('src/components/ArticleArchivePage.astro'), /<p class="filter-empty" role="status" hidden>Nic nenalezeno\./, 'copy i role zůstávají');
});

// ── P2: mobilní header ──────────────────────────────────────────────────────

test('kolo 43: ≤580px má nav.main border-top jako oddělovač řad; hamburger nepřibyl', () => {
  assert.match(mobil, /header\.site nav\.main \{[^}]*border-top:\s*1px solid var\(--line\)/);
  const base = bezKomentaru(cti('src/layouts/Base.astro'));
  assert.doesNotMatch(base, /hamburger|menu-toggle|nav-toggle/i);
  assert.match(base, /<nav class="main" aria-label="Hlavní navigace">/);
});
