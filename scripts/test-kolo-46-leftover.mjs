// Kolo 46: hluboký audit po kole 45 (živě 20. 9. 2026, realtech.cz — úvodka,
// dva nejnovější články, /clanky/ + ?kat=, /temata/ai-agenti/; preview
// 320–1280px, light i dark, axe bez nálezů, žádný vodorovný přetok, žádné
// CSP hlášení u widgetu X ani audia). Co zůstalo a tu se zamyká:
//
// P1 Filtr archivu: /clanky/?kat=AI (kategorie, která neexistuje — překlep,
//    starý odkaz, jiná velikost písmen) dával živě „0 článků“, „Nic
//    nenalezeno“ a role=group čipů BEZ jediného stisknutého (ani „Vše“).
//    Edge porovnával přesně, klientský skript neznámou kategorii ignoruje
//    („Vše“) — dvě chování na téže URL. Teď obě strany: shoda bez diakritiky
//    a velikosti písmen dá kanonický název z indexu, neznámá = bez filtru
//    kategorie (bez dotazu statický archiv beze změny).
// P2 Článek na desktopu měl tři levé hrany: hlava 880px s auto okraji
//    (x=200 na 1280px), cover a audio 760px s auto okraji (x=260), text
//    článku od hrany wrapu (x=104). editorial.css to řešilo `margin-left: 0`,
//    round 3 níž v kaskádě vrátil `margin: 0 auto` — mrtvé pravidlo. Stejná
//    hrana jako archiv, O nás a 404 (kolo 44); šířky sloupců se nemění.
// P2 Autorský box byl poslední --panel blok článku (černá karta s pruhovaným
//    závojem) — stejný kit jako audio/videobar (--surface, --line-strong,
//    12px). Červené „Odebírat na YouTube“ zůstává.
// P2 Kotva „#“ u nadpisů měřila 8×15px (h3, mobil) — pod 24×24 z WCAG
//    2.5.8. Padding místo marginu: stejná poloha, cíl 24×25px.
//
// Doplnění z nezávislého live auditu (kolo-46-audit.md, 20. 9. 2026 13:26):
// P1 Hub AI Agenti: „Souvisí s tématem“ (AGENTS.md, Custom GPT) hub vypisuje,
//    ale ItemList CollectionPage je neznal. Teď jsou v ItemList za všemi
//    články tématu; numberOfItems = téma + cross-linky. Kategorie se nemění.
// P1 Stav filtru archivu („data-vychozi vedle počtu → drift“): živě ověřeno
//    20. 9. 2026 — edge ?kat=AI Agenti: role=status „9 článků“, 9 karet;
//    „Zrušit filtr“: „Zobrazeno 1–15 z 121 článků“, 15 karet, stránkování
//    zpět; bez JS viditelně „9 článků“ a 9 karet. data-vychozi je datový
//    atribut (není v accessibility tree ani viditelný). Nereprodukováno,
//    formát ponechán — zamčeno kolo 29/33/35/37/45.
// P1 Audio přepis: <details class="audio-prehled-prepis"> se vykresluje
//    u všech 72 článků s `transcript` ve frontmatteru; 49 Deep Dive
//    (-nlm.mp3) zdroj nemá — nic se nevymýšlí, a11y popis + velikost už jsou.
// P2 ?kat= alias: sedí i slug tématu („ai-agenti“, „ai-report“, „site“);
//    samotné „ai“ je nejednoznačné → „Vše“.
// P2 type="button" na tlačítkách bez formuláře (⌘K, téma, čipy, Kopírovat
//    odkaz) — výslovný typ, žádné implicitní submit.
// P2 Faux checklist: .task-box je dekorace (aria-hidden), stav pro čtečku
//    nese sr-only „Hotovo:“ (kolo 45) — role=checkbox by u neinteraktivního
//    prvku lhala; ponecháno, zamčeno test-kolo-45-leftover.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { filtrujIndex, kanonickaKategorie } from '../src/lib/archiv-filtr.js';
import { handleryFiltru, onRequestGet } from '../functions/clanky/index.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const premium = bezCssKomentaru(cti('src/styles/premium.css'));
const global = bezCssKomentaru(cti('src/styles/global.css'));
const editorial = bezCssKomentaru(cti('src/styles/editorial.css'));
const archiv = bezKomentaru(cti('src/components/ArticleArchivePage.astro'));
const edge = cti('functions/clanky/index.js');

/** Tělo prvního pravidla se selektorem přesně na začátku řádku (i odsazeného v @media). */
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
const blok = (css, hlavicka) => css.match(new RegExp(`${hlavicka.source}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';

const INDEX = [
  { s: 'a', t: 'Starlink Mini', d: 'd', k: 'Sítě', b: 'b', p: '2026-09-20' },
  { s: 'b', t: 'Agent', d: 'd', k: 'AI Agenti', b: 'b', p: '2026-09-19' },
  { s: 'c', t: 'Report', d: 'd', k: 'AI Report', b: 'b', p: '2026-09-18' },
];
const KATEGORIE = new Set(INDEX.map((it) => it.k));

// ── P1: kategorie z URL proti indexu ─────────────────────────────────────────

test('kolo 46: kanonickaKategorie — velikost písmen a diakritika nerozhodují, neznámá kategorie je „Vše“', () => {
  assert.equal(kanonickaKategorie('AI Report', KATEGORIE), 'AI Report');
  assert.equal(kanonickaKategorie('ai report', KATEGORIE), 'AI Report');
  assert.equal(kanonickaKategorie(' AI REPORT ', KATEGORIE), 'AI Report');
  assert.equal(kanonickaKategorie('site', KATEGORIE), 'Sítě', 'bez diakritiky');
  assert.equal(kanonickaKategorie('ai-agenti', KATEGORIE), 'AI Agenti', 'slug tématu z /temata/ai-agenti/');
  assert.equal(kanonickaKategorie('AI-REPORT', KATEGORIE), 'AI Report');
  assert.equal(kanonickaKategorie('AI', KATEGORIE), '', 'živě 20. 9. 2026: /clanky/?kat=AI → 0 článků a žádný stisknutý čip');
  assert.equal(kanonickaKategorie('ai', KATEGORIE), '', '„ai“ sedí na AI Report i AI Agenti — nehádá se, „Vše“');
  assert.equal(kanonickaKategorie('Drony', KATEGORIE), '', 'kategorie bez článku v indexu = bez filtru, ne prázdný výpis');
  assert.equal(kanonickaKategorie('', KATEGORIE), '');
  assert.equal(kanonickaKategorie('   ', KATEGORIE), '');
  assert.equal(kanonickaKategorie('AI Report', []), '', 'prázdný index');
  // Předpoklad: filtrujIndex dál porovnává přesně — kanonizace stojí PŘED ním.
  assert.deepEqual(filtrujIndex(INDEX, { kat: 'ai report', q: '' }), [], 'filtrujIndex sám nekanonizuje (shoda 1:1 s klientem)');
  assert.deepEqual(filtrujIndex(INDEX, { kat: kanonickaKategorie('ai report', KATEGORIE), q: '' }).map((it) => it.s), ['c']);
});

test('kolo 46: edge kanonizuje ?kat= proti indexu; neznámá kategorie bez dotazu = statický archiv beze změny', async () => {
  const puvodni = globalThis.HTMLRewriter;
  const volani = [];
  globalThis.HTMLRewriter = class {
    on(selektor, handler) { volani.push([selektor, handler]); return this; }
    transform(r) { return r; }
  };
  try {
    const asset = () => new Response('<p data-filter-count></p>', { headers: { 'content-type': 'text/html' } });
    const context = (url) => ({
      request: new Request(url),
      env: { ASSETS: { fetch: async () => new Response(JSON.stringify(INDEX), { status: 200 }) } },
      next: () => asset(),
    });
    // Neznámá kategorie, bez dotazu: statický archiv, žádný přepis (ETag zůstává, klient URL uklidí).
    volani.length = 0;
    const neznama = await onRequestGet(context('https://realtech.cz/clanky/?kat=AI'));
    assert.equal(volani.length, 0, 'HTMLRewriter se pro neznámou kategorii nespouští');
    assert.equal(await neznama.text(), '<p data-filter-count></p>');

    // Jiná velikost písmen: filtr běží s kanonickým názvem (čip „AI Report“ aktivní, karty z indexu podle 'AI Report').
    volani.length = 0;
    await onRequestGet(context('https://realtech.cz/clanky/?kat=ai%20report'));
    const handlery = new Map(volani);
    assert.ok(handlery.size > 0, 'známá kategorie (jinak psaná) filtr spustí');
    const cip = { attrs: new Map([['class', 'chip'], ['data-cat', 'AI Report'], ['aria-pressed', 'false']]),
      getAttribute(n) { return this.attrs.get(n) ?? null; }, setAttribute(n, v) { this.attrs.set(n, String(v)); } };
    handlery.get('.cat-filter .chip').element(cip);
    assert.equal(cip.getAttribute('aria-pressed'), 'true', 'čip kanonické kategorie je stisknutý');
    assert.equal(cip.getAttribute('class'), 'chip active');
    const pocet = { text: '', setInnerContent(t) { this.text = t; } };
    handlery.get('[data-filter-count]').element(pocet);
    assert.equal(pocet.text, '1 článek', 'výběr podle kanonického názvu, ne podle „ai report“');

    // Neznámá kategorie + dotaz: filtr jen podle dotazu, čip „Vše“.
    volani.length = 0;
    await onRequestGet(context('https://realtech.cz/clanky/?kat=AI&q=starlink'));
    const sDotazem = new Map(volani);
    const vse = { attrs: new Map([['class', 'chip'], ['data-cat', ''], ['aria-pressed', 'false']]),
      getAttribute(n) { return this.attrs.get(n) ?? null; }, setAttribute(n, v) { this.attrs.set(n, String(v)); } };
    sDotazem.get('.cat-filter .chip').element(vse);
    assert.equal(vse.getAttribute('aria-pressed'), 'true', 'neznámá kategorie → „Vše“ stisknuté, ne role=group bez stavu');
    const pocet2 = { text: '', setInnerContent(t) { this.text = t; } };
    sDotazem.get('[data-filter-count]').element(pocet2);
    assert.equal(pocet2.text, '1 článek', 'dotaz „starlink“ bez filtru kategorie');
  } finally {
    if (puvodni === undefined) delete globalThis.HTMLRewriter;
    else globalThis.HTMLRewriter = puvodni;
  }
  assert.match(edge, /import \{[^}]*kanonickaKategorie[^}]*\} from '\.\.\/\.\.\/src\/lib\/archiv-filtr\.js';/);
  assert.match(edge, /const kat = kanonickaKategorie\(filtr\.kat, new Set\(index\.map\(\(it\) => it\.k\)\)\);\s*if \(!kat && !filtr\.q\) return context\.next\(\);/);
  assert.match(edge, /filtrujIndex\(index, \{ kat, q: filtr\.q \}\)/, 'filtr běží s kanonickým názvem');
  assert.match(edge, /handleryFiltru\(\{ vybrane, prvniSlug: index\[0\]\?\.s, kat, q: filtr\.q \}\)/, 'aktivní čip podle kanonického názvu');
  // handleryFiltru samy zůstávají (kolo 37): aktivní čip = přesná shoda s kanonickým názvem.
  const h = new Map(handleryFiltru({ vybrane: [], prvniSlug: 'a', kat: 'AI Report', q: '' }));
  const cizi = { attrs: new Map([['class', 'chip active'], ['data-cat', 'Sítě']]), getAttribute(n) { return this.attrs.get(n) ?? null; }, setAttribute(n, v) { this.attrs.set(n, String(v)); } };
  h.get('.cat-filter .chip').element(cizi);
  assert.equal(cizi.getAttribute('class'), 'chip');
});

test('kolo 46: klientský skript archivu hledá čip ke kategorii z URL stejně jako edge (bez diakritiky, neznámá = „Vše“)', () => {
  assert.match(archiv, /const cipKategorie = \(kat: string\) => \{\s*const hledana = slugKategorie\(kat\.trim\(\)\);\s*const shoda = hledana \? chips\.find\(\(chip\) => slugKategorie\(chip\.getAttribute\('data-cat'\) \?\? ''\) === hledana\) : undefined;\s*return shoda \?\? chips\.find\(\(chip\) => chip\.getAttribute\('data-cat'\) === ''\);/);
  // Klientský slugKategorie = tentýž výraz jako v archiv-filtr.js (kolo 37 hlídá shodu karet, tady shodu kategorie).
  assert.match(archiv, /const slugKategorie = \(s: string\) =>\s*s\.toLowerCase\(\)\.normalize\('NFD'\)\.replace\(\/\[\\u0300-\\u036f\]\/g, ''\)\.replace\(\/\\s\+\/g, '-'\);/);
  assert.match(archiv, /if \(initialCategory\) \{\s*const target = cipKategorie\(initialCategory\);/, 'start stránky');
  assert.match(archiv, /const target = cipKategorie\(params\.get\('kat'\) \?\? ''\);\s*if \(target\) activate\(target\);\s*void apply\('none'\);/, 'popstate');
  assert.doesNotMatch(archiv, /chips\.find\(\(chip\) => chip\.getAttribute\('data-cat'\) === (initialCategory|category)\)/, 'žádná přesná shoda mimo cipKategorie');
  // Bez značky edge (neznámá kategorie → context.next()) skript filtr spustí a apply() URL uklidí.
  assert.match(archiv, /if \(!grid\?\.hasAttribute\('data-filtr-edge'\)\) \{\s*if \(initialCategory \|\| initialQuery\) void apply\(\);/);
  assert.match(archiv, /else if \(historyMode === 'replace'\) history\.replaceState\(null, '', nextUrl\);/);
});

// ── P2: jedna levá hrana čtecího sloupce na desktopu ─────────────────────────

test('kolo 46: na ≥ 901px sedí hlava, cover, audio, sdílení, autor, related i navigace článku na levé hraně wrapu', () => {
  const desktop = blok(premium, /@media \(min-width: 901px\)/);
  assert.ok(desktop, 'premium.css: blok @media (min-width: 901px) chybí');
  const hrana = desktop.match(/\.article-page \.article-head,\s*\.article-hero, \.video-embed, \.audio-prehled, \.article-videobar,\s*\.article-share, \.author-box, \.related, \.article-nav, \.komentare, \.article-back \{([^}]*)\}/)?.[1];
  assert.ok(hrana, 'společné pravidlo levé hrany chybí');
  assert.match(hrana, /^\s*margin-left:\s*0;\s*$/, 'jen margin-left — šířky (760px, kolo 22) a svislý rytmus se nemění');
  // Šířky zůstávají: global.css (kolo 22) i premium hlava.
  assert.match(pravidlo(global, '.article-hero'), /max-width:\s*760px/);
  assert.match(pravidlo(global, '.article-hero'), /margin:\s*28px auto 0/, 'global.css se nemění (test-kolo-22-leftover)');
  assert.match(pravidlo(premium, '.article-page .article-head'), /max-width:\s*880px/);
  assert.match(pravidlo(premium, '.article-page .article-head'), /margin:\s*0 auto 44px/, 'základ zůstává centrovaný — pod 901px je sloupec jeden');
  // editorial.css pravidlo, které round 3 přebil, zůstává jako záměr (pořadí importů Base.astro: editorial před premium).
  assert.match(blok(editorial, /@media \(min-width: 901px\) \{\s*\.article-page \.article-head/), /margin-left:\s*0/);
  const base = bezKomentaru(cti('src/layouts/Base.astro'));
  assert.ok(base.indexOf("import '../styles/editorial.css';") < base.indexOf("import '../styles/premium.css';"), 'premium je poslední vrstva');
  // Pod 901px: centrovaný jeden sloupec beze změny.
  assert.match(pravidlo(blok(premium, /@media \(max-width: 900px\)/), '.article-layout .article-body'), /margin-inline:\s*auto/);
});

// ── P2: autorský box v tichém kitu ───────────────────────────────────────────

test('kolo 46: .author-box sedí na --surface s --line-strong a 12px jako audio/videobar; červené YouTube CTA zůstává', () => {
  const box = pravidlo(premium, '.author-box');
  assert.match(box, /background:\s*var\(--surface\)/);
  assert.match(box, /color:\s*var\(--ink\)/);
  assert.match(box, /border:\s*1px solid var\(--line-strong\)/);
  assert.match(box, /border-radius:\s*var\(--radius-field\)/);
  // Kolo 47: pruhovaný ::before je z global.css smazaný — premium ho už nemusí schovávat.
  assert.doesNotMatch(premium + global, /\.author-box::before/, 'pruhovaný závoj z --panel doby pryč z obou vrstev');
  assert.match(pravidlo(premium, '.ab-logo .real'), /color:\s*var\(--ink\)/);
  assert.match(pravidlo(premium, '.ab-body p'), /color:\s*var\(--ink-soft\)/);
  assert.match(pravidlo(premium, '.ab-body p strong'), /color:\s*var\(--ink\)/);
  assert.match(pravidlo(premium, '.author-box .btn-ghost'), /border-color:\s*var\(--line\)/);
  assert.doesNotMatch(premium, /\.author-box \.yt-btn/, 'hlavní výzva článku zůstává plná --signal-fill z global.css');
  assert.match(pravidlo(global, '.yt-btn'), /background:\s*var\(--signal-fill\)/);
  // Logo TECH v boxu: --signal na světlé ploše (4,6:1 při 1.3rem/900), v darku --signal-dark už z kola 20/22.
  assert.match(global, /:root\[data-theme="dark"\] \.logo \.tech,\n:root\[data-theme="dark"\] \.ab-logo \.tech \{\n\s*color: var\(--signal-dark\);/);
  const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
  assert.match(clanek, /<div class="author-box">/, 'markup beze změny (test-b19, test-giscus, test-kolo-23)');
});

// ── Doplnění z nezávislého auditu ────────────────────────────────────────────

test('kolo 46: ItemList hubu tématu nese i cross-linky „Souvisí s tématem“ — za všemi články tématu, počet za téma + cross-linky', () => {
  const tema = bezKomentaru(cti('src/components/TemaPage.astro'));
  assert.match(tema, /const souvisiVse = souvisejiciClanky\(category, all\);\s*const souvisi = page === 1 \? souvisiVse : \[\];/, 'cross-linky se počítají pro každou stranu, vypisují jen na první');
  assert.match(tema, /numberOfItems: clanky\.length \+ souvisiVse\.length,/);
  assert.match(tema, /\.\.\.souvisi\.map\(\(c, i\) => \(\{\s*'@type': 'ListItem',\s*position: clanky\.length \+ i \+ 1,/, 'pozice až za poslední článek tématu (i za stranou 2+)');
  // Kategorie článků se nemění (kolo 42/45: jedna kategorie); do mřížky nejdou.
  assert.match(tema, /const clanky = \(await getCollection\('clanky', \(\{ data \}\) => !data\.draft && data\.category === category\)\)/);
  assert.match(tema, /\{articles\.map\(\(article, index\) => \(\s*<ArticleCard/, 'mřížka jen z articles');
  for (const slug of ['claude-code-agents-md-jeden-soubor-pokynu', 'custom-gpt-konec-migrace-na-pluginy-checklist']) {
    assert.match(cti(`src/content/clanky/${slug}.md`), /^category: "AI Report"$/m);
  }
});

test('kolo 46: tlačítka mimo formulář mají výslovné type="button" (⌘K, téma, čipy archivu, Kopírovat odkaz)', () => {
  const base = bezKomentaru(cti('src/layouts/Base.astro'));
  assert.match(base, /<button class="search-trigger" data-search-open aria-label="Hledat v článcích \(⌘K\)" title="Hledat \(⌘K\)" type="button">/);
  assert.match(base, /<button id="theme-toggle" class="theme-toggle" aria-label="Tmavý režim" aria-pressed="false" title="Přepnout na tmavý režim" type="button">/);
  assert.match(archiv, /<button class="chip active" data-cat="" aria-pressed="true" type="button">Vše<\/button>/);
  assert.match(archiv, /<button class="chip" data-cat=\{category\} aria-pressed="false" type="button">\{category\}<\/button>/);
  const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
  assert.equal((clanek.match(/<button class="share-btn copy-link" data-url=\{[^}]+\} aria-label="Kopírovat odkaz na článek" type="button">Kopírovat odkaz<\/button>/g) ?? []).length, 2, 'aside i pod textem');
  // Žádné <button> bez type v layoutu, komponentách ani stránkách.
  for (const soubor of ['src/layouts/Base.astro', 'src/components/ArticleArchivePage.astro', 'src/components/SearchModal.astro', 'src/components/Giscus.astro', 'src/pages/clanky/[...id].astro']) {
    const zdroj = bezKomentaru(cti(soubor));
    for (const tag of zdroj.match(/<button\s[^>]*>/g) ?? []) {
      if (/type="submit"/.test(tag)) continue;
      assert.match(tag, /type="button"/, `${soubor}: ${tag}`);
    }
  }
});

test('kolo 46: přepis audia se vykresluje všude, kde je zdroj; Deep Dive bez transcriptu nic nevymýšlí', () => {
  const audio = bezKomentaru(cti('src/components/AudioPrehled.astro'));
  assert.match(audio, /\{pohled\.prepis && \(\s*<details class="audio-prehled-prepis">\s*<summary>Přepis<\/summary>/);
  assert.match(audio, /aria-label="Audio přehled článku" aria-describedby="audio-prehled-popis"/, 'a11y popis přehrávače');
  assert.match(audio, /\{velikostText && <span class="audio-prehled-velikost">/, 'velikost z kola 45');
  const clanky = readdirSync(join(koren, 'src/content/clanky')).filter((f) => f.endsWith('.md'));
  const sPrepisem = clanky.filter((f) => /^ {2}transcript:/m.test(cti(`src/content/clanky/${f}`)));
  assert.ok(sPrepisem.length >= 72, `články s transcriptem: ${sPrepisem.length}`);
  assert.ok(sPrepisem.length < clanky.length, 'Deep Dive články transcript nemají — UI se u nich nevykreslí a žádný se nedopisuje');
  assert.ok(pravidlo(global, '.audio-prehled-prepis summary'), 'CSS přepisu zůstává — markup má 72+ článků');
});

// ── P2: kotva nadpisu s dotykovým cílem ──────────────────────────────────────

test('kolo 46: .heading-anchor má 24×24 cíl přes padding, ne 8×15 (WCAG 2.5.8); poloha a skrytí do hoveru zůstávají', () => {
  const kotva = pravidlo(global, '.heading-anchor');
  assert.match(kotva, /padding:\s*5px 8px/, '8px vlevo = původní margin-left, 8px vpravo + 5px svisle = cíl 24×25 i u 0.7em h3');
  assert.doesNotMatch(kotva, /margin-left/, 'odsazení nese padding — zásah je součást cíle');
  assert.match(kotva, /opacity:\s*0/);
  assert.match(kotva, /font-size:\s*0\.7em/);
  assert.match(global, /\.article-body h2:hover \.heading-anchor,\n\.article-body h3:hover \.heading-anchor,\n\.heading-anchor:focus-visible \{ opacity: 1; \}/);
});
