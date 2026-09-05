// Kolo 23: leftover po živém auditu 5. 9. 2026 (po #391–#393).
// Komentáře až za „Další reporty“ a navigací, jeden Insights beacon zpátky,
// LCP karta i na /clanky/strana/2+, tisk archivu, giscus CLS, rámeček na
// --panel v darku, kotvy nadpisů (živé, ne mrtvé CSS).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');

const css = cti('src/styles/global.css');
const base = cti('src/layouts/Base.astro');
const archiv = cti('src/components/ArticleArchivePage.astro');
const tema = cti('src/components/TemaPage.astro');
const clanek = cti('src/pages/clanky/[...id].astro');
const giscus = cti('src/components/Giscus.astro');
const headers = cti('public/_headers');

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
const pravidlo = (zdroj, selektor, { vnorene = false } = {}) =>
  zdroj.match(new RegExp(`^${vnorene ? '[ \\t]*' : ''}${selektor.replaceAll('.', '\\.')}\\s*\\{([^}]+)\\}`, 'm'))?.[1] ?? '';

const cspDirektiva = (jmeno) => {
  const radek = headers.split(/\r?\n/).find((l) => l.trim().startsWith('Content-Security-Policy:'));
  assert.ok(radek, 'public/_headers musí mít Content-Security-Policy');
  const cast = radek.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${jmeno} `) || c.includes(`Content-Security-Policy: ${jmeno} `));
  return cast ?? '';
};

// ── 1) Komentáře až za „Další reporty“ a chronologickou navigací ────────────

test('kolo 23: <Giscus /> stojí za .related i .article-nav, před „Zpět na články“', () => {
  const autorskyBox = clanek.indexOf('<div class="author-box">');
  const related = clanek.indexOf('<div class="related">');
  const nav = clanek.indexOf('<nav class="article-nav"');
  const komentare = clanek.indexOf('<Giscus />');
  const zpet = clanek.indexOf('<div class="article-back">');
  assert.ok(autorskyBox > 0 && related > autorskyBox && nav > related, 'předpoklad o pořadí šablony');
  assert.ok(komentare > nav, 'lazy iframe s vlastní výškou nesmí odsouvat „Další reporty“ ani navigaci');
  assert.ok(zpet > komentare, 'komentáře jsou poslední blok před „Zpět na články“');
  assert.equal((clanek.match(/<Giscus \/>/g) ?? []).length, 1);
  assert.match(giscus, /<section class="komentare" id="komentare"/, 'kotva #komentare zůstává');
});

// ── 2) Cloudflare Insights: právě jeden beacon ─────────────────────────────

test('kolo 23: Base vkládá právě jeden Insights beacon (token c2d8811d…) a CSP ho pouští', () => {
  const beacony = base.match(/<script is:inline defer src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js" data-cf-beacon='\{"token": "([0-9a-f]{32})"\}'><\/script>/g) ?? [];
  assert.equal(beacony.length, 1, 'po #391 živě neběžel žádný beacon — zpátky je JEDEN');
  assert.match(beacony[0], /"token": "c2d8811d709646ad986cb0e671b8ffd6"/, 'jediný celý token v historii repa (#18)');
  assert.equal((base.match(/beacon\.min\.js/g) ?? []).length, 1);
  assert.equal((base.match(/data-cf-beacon=/g) ?? []).length, 1);
  assert.match(base, /<link rel="preconnect" href="https:\/\/static\.cloudflareinsights\.com" \/>/, 'preconnect už není mrtvý');
  assert.doesNotMatch(base, /Pages ho vkládá sám|vkládá ho\s+Cloudflare Pages/, 'komentář už nesmí tvrdit, že beacon vkládá Pages');

  assert.match(cspDirektiva('script-src'), /https:\/\/static\.cloudflareinsights\.com/);
  assert.match(cspDirektiva('connect-src'), /https:\/\/cloudflareinsights\.com/);
});

// ── 3) Archiv: LCP karta i na /clanky/strana/2+ ─────────────────────────────

test('kolo 23: první karta každé strany archivu má eager + fetchpriority=high, zbytek lazy', () => {
  assert.match(archiv, /priority=\{index === 0\}/, 'strana 2+ dřív dostala jen lazy — první karta je tam LCP');
  assert.doesNotMatch(archiv, /priority=\{page === 1 && index === 0\}/);
  assert.doesNotMatch(archiv, /eager=\{/, 'jen první karta, ne celá řada (kolo 22)');
  assert.match(tema, /priority=\{index === 0\}/, 'stejný vzor jako featured karta tématu');
});

test('kolo 23: karty přilepené filtrem ze stran 2+ na stranu 1 ztrácí eager/high', () => {
  const importKarty = archiv.match(/documentPage\.querySelectorAll\('#articles-grid \.card'\)\.forEach\(\(card\) => \{([\s\S]*?)\n\s*\}\);/)?.[1] ?? '';
  assert.ok(importKarty, 'archiv importuje karty ze stran 2+');
  assert.match(importKarty, /setAttribute\('loading', 'lazy'\)/, 'pod ohybem na straně 1 karta LCP není');
  assert.match(importKarty, /removeAttribute\('fetchpriority'\)/);
});

// ── 4) Tisk /clanky/ ────────────────────────────────────────────────────────

test('kolo 23: tisk schová filtr, hledání a stránkování archivu; mrtvý .topbar je pryč', () => {
  const tisk = blok(/@media print\s*\{/);
  const skryte = tisk.match(/([^{}]+)\{\s*display:\s*none\s*!important;?\s*\}/)?.[1] ?? '';
  for (const selektor of ['.filter-bar', '#art-search', '.archive-pagination']) {
    assert.ok(skryte.includes(selektor), `${selektor} musí být v tisku skrytý`);
  }
  for (const selektor of ['.heading-anchor', '.skip-link', '.read-progress', '.komentare', '.related']) {
    assert.ok(skryte.includes(selektor), `${selektor} zůstává skrytý (kolo 18/22, #392)`);
  }
  assert.doesNotMatch(css, /\.topbar/, '.topbar v markupu neexistuje');
  assert.match(archiv, /<div class="filter-bar">/);
  assert.match(archiv, /id="art-search"/);
  assert.match(archiv, /<nav class="archive-pagination"/);
});

// ── NICE ───────────────────────────────────────────────────────────────────

test('kolo 23: .komentare .giscus drží víc než 180px a má kostru, dokud iframe nenaběhne', () => {
  const minHeight = Number(pravidlo(css, '.komentare .giscus').match(/min-height:\s*(\d+)px/)?.[1]);
  assert.ok(minHeight > 180, `180px bylo málo pro prázdnou diskuzi, je ${minHeight}px`);
  assert.ok(minHeight >= 320 && minHeight <= 480, `min-height ${minHeight}px mimo rozumný rozsah`);
  assert.match(
    css,
    /^\.komentare \.giscus:empty,\n\.komentare \.giscus:has\(> \.giscus-frame--loading\) \{[^}]*border: 1px dashed var\(--line\)/m,
    'kostra pro prázdný kontejner i načítající iframe',
  );
});

test('kolo 23: rámeček na --panel má vlastní token --line-panel, v darku světlejší', () => {
  const root = blok(/^:root \{/m);
  assert.match(root, /--line-panel:\s*#E2E6EB/, 've světlém = --line');
  const darkOs = blok(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)/);
  const darkRucni = blok(/^:root\[data-theme="dark"\] \{/m);
  for (const dark of [darkOs, darkRucni]) {
    assert.ok(dark, 'dark blok chybí');
    assert.match(dark, /--line-panel:\s*#3A4350/, '--line #262C35 na --panel #1D232C nebyl vidět');
  }
  const tisk = blok(/@media print\s*\{/);
  assert.match(tisk, /--line-panel:\s*#bbb/, 'tisk přepisuje i nový token');
  for (const selektor of ['.hero-visual', '.article-hero', '.video-embed', '.vc-thumb']) {
    const telo = pravidlo(css, selektor);
    assert.match(telo, /background:\s*var\(--panel\)/, `${selektor} sedí na --panel`);
    assert.match(telo, /border:\s*1px solid var\(--line-panel\)/, `${selektor} musí brát --line-panel`);
  }
});

test('kolo 23: kotvy nadpisů vkládá klientský skript článku — .heading-anchor v CSS není mrtvý', () => {
  assert.match(clanek, /a\.className = 'heading-anchor';/, 'statické HTML kotvy nemá, doplňuje je skript');
  assert.match(clanek, /document\.querySelectorAll<HTMLElement>\('\.article-body h2, \.article-body h3'\)/);
  assert.ok(pravidlo(css, '.heading-anchor'), 'styl kotvy zůstává');
  assert.match(css, /\.article-body h2:hover \.heading-anchor,\n\.article-body h3:hover \.heading-anchor,\n\.heading-anchor:focus-visible \{ opacity: 1; \}/);
});
