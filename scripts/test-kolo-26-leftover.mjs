// Kolo 26: leftover po živém auditu 7. 9. 2026 (po kolech 22–25 + Starship #410).
// Search APG combobox, kontakt bez CF email-protection 404, filtr /clanky/
// přes search-index.json + debounce, Deny alternateName, OG výpisů,
// /images/* max-age=0 beze změny, HTML s-maxage na CF Pages ne.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { autoriClanku, zakladateleOrg } from '../src/lib/autori.js';
import { ogObrazekClanku } from '../src/lib/og-vypis.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');

const search = cti('src/components/SearchModal.astro');
const base = cti('src/layouts/Base.astro');
const onas = cti('src/pages/o-nas.astro');
const archiv = cti('src/components/ArticleArchivePage.astro');
const tema = cti('src/components/TemaPage.astro');
const hub = cti('src/pages/temata/index.astro');
const clanek = cti('src/pages/clanky/[...id].astro');
const headers = cti('public/_headers');
const robots = cti('public/robots.txt');
const karta = cti('src/components/ArticleCard.astro');

function parseHeaders(text) {
  const rules = new Map();
  let currentPath;
  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    if (!/^\s/.test(rawLine)) {
      currentPath = rawLine.trim();
      rules.set(currentPath, new Map());
      continue;
    }
    const match = rawLine.trim().match(/^([^:]+):\s*(.+)$/);
    if (!match || !currentPath) continue;
    rules.get(currentPath).set(match[1].toLowerCase(), match[2]);
  }
  return rules;
}

function cacheDirectives(rule) {
  return new Map(
    rule
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .map((directive) => {
        const [name, ...value] = directive.split('=');
        return [name, value.length ? value.join('=') : true];
      }),
  );
}

// ── 1) Search a11y: combobox + role=option na <a> ────────────────────────

test('kolo 26: combobox má listbox popup a option na <a> s tabindex=-1', () => {
  const inputTag = search.match(/<input[\s\S]*?\/>/)?.[0] ?? '';
  assert.match(inputTag, /role="combobox"/);
  assert.match(inputTag, /aria-haspopup="listbox"/);
  assert.match(inputTag, /aria-controls="search-results"/);
  assert.match(search, /<div class="search-results" id="search-results" role="listbox"/);
  assert.match(
    search,
    /href="\/clanky\/\$\{it\.s\}\/" role="option"[^>]*tabindex="-1"/,
    'APG: option na <a> je v pořádku, ale nesmí být v Tab pořadí (activedescendant)',
  );
});

// ── 2) Kontakt bez JS: ne mailto v patičce, email_off + noscript ─────────

test('kolo 26: patička Kontakt vede na /o-nas/#kontakt, ne na mailto', () => {
  const paticka = base.match(/<footer class="site">[\s\S]*?<\/footer>/)?.[0] ?? '';
  assert.match(paticka, /<a href="\/o-nas\/#kontakt">Kontakt<\/a>/);
  assert.doesNotMatch(paticka, /mailto:info@realtech\.cz/, 'mailto v patičce CF přepisoval na 404 /cdn-cgi/l/email-protection');
});

test('kolo 26: /o-nas/ má kotvu #kontakt, email_off kolem mailto a noscript fallback', () => {
  assert.match(onas, /<h2 id="kontakt">Kontakt<\/h2>/);
  assert.match(onas, /<!--email_off--><a href="mailto:info@realtech\.cz">info@realtech\.cz<\/a><!--\/email_off-->/);
  assert.match(onas, /<noscript>\s*<p><!--email_off-->E-mail: info@realtech\.cz<!--\/email_off--><\/p>\s*<\/noscript>/);
  assert.equal((onas.match(/<!--email_off-->/g) ?? []).length, 3);
  assert.equal((onas.match(/<!--\/email_off-->/g) ?? []).length, 3);
});

test('kolo 26: robots.txt zakazuje /cdn-cgi/ (email-protection 404)', () => {
  assert.match(robots, /^Disallow: \/cdn-cgi\/$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/realtech\.cz\/sitemap-index\.xml$/m);
});

// ── 3) Archiv: search-index.json + debounce, ne sériové HTML ─────────────

test('kolo 26: filtr /clanky/ bere search-index.json, debounce 300 ms, ne strany 2–7', () => {
  assert.match(archiv, /fetch\('\/search-index\.json'\)/);
  assert.match(archiv, /const DEBOUNCE_MS = 300/);
  assert.match(archiv, /window\.setTimeout/);
  assert.match(archiv, /data-from-index/);
  assert.doesNotMatch(archiv, /fetch\(`\/clanky\/strana\//);
  assert.doesNotMatch(archiv, /DOMParser/);
  assert.match(karta, /data-slug=\{article\.id\}/);
  assert.match(archiv, /Načítám index článků/);
});

// ── 4) Autor: Daniel Soukup + Deny alternateName ─────────────────────────

test('kolo 26: schema i zobrazení sdílí Deny jako alternateName Daniela Soukupa', () => {
  const autori = autoriClanku(new URL('https://realtech.cz/'));
  assert.deepEqual(autori, [
    {
      '@type': 'Person',
      name: 'Daniel Soukup',
      alternateName: 'Deny',
      url: 'https://realtech.cz/o-nas/',
    },
    {
      '@type': 'Person',
      name: 'Sam',
      url: 'https://realtech.cz/o-nas/',
    },
  ]);
  const org = zakladateleOrg();
  assert.equal(org[0].alternateName, 'Deny');
  assert.equal(org[0].name, 'Daniel Soukup');
  assert.match(clanek, /import \{ autoriClanku \} from '\.\.\/\.\.\/lib\/autori\.js'/);
  assert.match(clanek, /const autori = autoriClanku\(Astro\.site\)/);
  assert.match(
    clanek,
    /\/\/ Chronologická navigace \(novější\/starší\)[\s\S]*const autori = autoriClanku\(Astro\.site\);/,
    'test-article-chrono-loader řeže blok mezi tímhle komentářem a autoriClanku',
  );
  assert.match(onas, /import \{ zakladateleOrg \} from '\.\.\/lib\/autori\.js'/);
  assert.match(onas, /<strong>Daniel \(Deny\) a Sam<\/strong>/);
  assert.match(onas, /<strong>Daniel Soukup<\/strong> \(Deny\)/);
  assert.match(clanek, /Jsme <strong>Deny a Sam<\/strong>/);
});

// ── 5) OG výpisů: první článek, ne jen og-default ────────────────────────

test('kolo 26: archiv, téma i hub berou OG z prvního článku stránky', () => {
  assert.match(archiv, /const vypisOg = ogObrazekClanku\(articles\[0\]\)/);
  assert.match(archiv, /image=\{vypisOg\.image\} imageAlt=\{vypisOg\.imageAlt\}/);
  assert.match(tema, /const vypisOg = ogObrazekClanku\(articles\[0\]\)/);
  assert.match(tema, /image=\{vypisOg\.image\} imageAlt=\{vypisOg\.imageAlt\}/);
  assert.match(hub, /const vypisOg = ogObrazekClanku\(prvniHub\?\.nejnovejsi\)/);
  assert.match(hub, /image=\{vypisOg\.image\} imageAlt=\{vypisOg\.imageAlt\}/);
});

test('kolo 26: ogObrazekClanku preferuje brandovaný OG, jinak cover, jinak prázdno', () => {
  assert.deepEqual(ogObrazekClanku(undefined), {});
  assert.deepEqual(ogObrazekClanku({ id: 'neexistuje-vubec', data: { title: 'X' } }), {});

  const sOg = 'starship-flight-14-prvni-orbita-net-15-zari';
  if (existsSync(join(koren, `public/images/og/${sOg}.jpg`))) {
    assert.deepEqual(
      ogObrazekClanku({ id: sOg, data: { title: 'Starship', image: '/images/clanky/x.jpg' } }),
      { image: `/images/og/${sOg}.jpg`, imageAlt: 'Starship' },
    );
  }

  assert.deepEqual(
    ogObrazekClanku({ id: 'bez-og-souboru', data: { title: 'Cover', image: '/images/clanky/cover.jpg' } }),
    { image: '/images/clanky/cover.jpg', imageAlt: 'Cover' },
  );
});

// ── 6) Cache: /images/* max-age=0 drží; HTML s-maxage na Pages ne ────────

test('kolo 26: /images/* zůstává max-age=0 must-revalidate, HTML nemá s-maxage', () => {
  const rules = parseHeaders(headers);
  const images = cacheDirectives(rules.get('/images/*')?.get('cache-control') ?? '');
  assert.equal(images.get('max-age'), '0');
  assert.equal(images.get('must-revalidate'), true);
  assert.equal(images.has('immutable'), false);

  const all = headers.toLowerCase();
  assert.doesNotMatch(all, /s-maxage/, 'CF Pages bere HTML jako DYNAMIC — s-maxage bez Cache Rule v dashboardu nefunguje');
  assert.doesNotMatch(headers, /\/\*\n\s+Cache-Control:.*s-maxage/i);
});
