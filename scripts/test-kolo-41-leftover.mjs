// Kolo 41: kompletní živý audit 16. 9. 2026 (po #459, hero Gemini 3.8 Live)
// proti kódu — axe (wcag2a/aa, 21aa, best-practice) 0 nálezů světle i
// tmavě, CLS 0–0,005, 0 rozbitých interních odkazů, redirecty i edge filtr
// v pořádku. Co zbylo a je tady zamčené:
//
// P1 Aside článku na desktopu s vnitřním rolováním (#447: max-height
//    100dvh − 112px, overflow-y: auto, overscroll-behavior: contain).
//    Na 1366×768 i 1280×800 je aside (~770 px) vyšší než okno, a s
//    `contain` kolečko nad aside (pravá třetina článku) dojelo na konec
//    aside a stránka se dál NEPOSUNULA (12 kroků kolečka = scrollY beze
//    změny). Pryč s contain — řetězení scrollu pokračuje na stránku.
//    Zároveň se vnitřní rolování váže na stejný dotaz jako sticky
//    (min-height: 640px, kolo 19 / 34): na 1280×600 aside sticky nebyl,
//    ale řezal se na 488 px s vlastním posuvníkem uprostřed toku.
// P2 Redakční HTML komentář „<!-- TODO: sem interní odkaz … -->“ v těle
//    iPhone 18 Pro šel doslova do HTML stránky i do RSS. Odstraněn a
//    validate-content ho od teď shodí (pravidlo 6).
// P2 Bez JS: přepínač tématu = mrtvé tlačítko 44×44 (schová se jako ⌘K
//    z kola 37); play tlačítko fasády YouTube 760×430 nic nedělalo — přes
//    fasádu leží <noscript> odkaz na YouTube.
// P3 Hlas: tři věty „Pro OSVČ a malou firmu …“ (AA Index, Astra Critical,
//    Muse Spark) mluví k člověku, který AI/API platí sám (pravidlo kola 40).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const editorial = cti('src/styles/editorial.css');
const globalCss = cti('src/styles/global.css');
const base = cti('src/layouts/Base.astro');
const clanek = cti('src/pages/clanky/[...id].astro');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

/** Celý blok @media včetně vnořených závorek (jako v kolech 19, 29 a 34). */
function blokMedia(css, dotaz) {
  const start = css.search(new RegExp(`@media\\s*${dotaz}\\s*\\{`));
  if (start < 0) return '';
  let hloubka = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') hloubka++;
    if (css[i] === '}' && --hloubka === 0) return css.slice(start, i + 1);
  }
  return '';
}

// ── P1: aside bez pasti na kolečko, rolování jen když je sticky ───────────

test('kolo 41: .article-aside nemá overscroll-behavior: contain (kolečko nad aside musí po jeho konci hýbat stránkou)', () => {
  const pravidla = [...editorial.matchAll(/\.article-aside\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(pravidla.length > 0, '.article-aside v editorial.css chybí');
  for (const p of pravidla) assert.doesNotMatch(p, /overscroll-behavior/, 'overscroll-behavior na aside zastavuje scroll stránky');
  assert.doesNotMatch(globalCss, /\.article-aside[^{]*\{[^}]*overscroll-behavior/, 'ani global.css nesmí contain vrátit');
});

test('kolo 41: vnitřní rolování aside (max-height + overflow-y) stojí ve stejném dotazu jako sticky — (min-width: 901px) and (min-height: 640px)', () => {
  const sticky = blokMedia(editorial, String.raw`\(min-width:\s*901px\)\s*and\s*\(min-height:\s*640px\)`);
  assert.ok(sticky, 'dotaz (min-width: 901px) and (min-height: 640px) v editorial.css chybí');
  assert.match(sticky, /\.article-aside\s*\{[^}]*max-height:\s*calc\(100dvh - 112px\)/, 'max-height aside patří do sticky dotazu');
  assert.match(sticky, /\.article-aside\s*\{[^}]*overflow-y:\s*auto/, 'overflow-y: auto aside patří do sticky dotazu');
  // Širokoúhlý dotaz bez min-height už aside neřeže (1280×600: static aside
  // s vlastním posuvníkem uprostřed toku).
  const jenSirka = editorial.match(/@media\s*\(min-width:\s*901px\)\s*\{(?![^{}]*and)/g) ?? [];
  for (const start of jenSirka) {
    const blok = blokMedia(editorial.slice(editorial.indexOf(start)), String.raw`\(min-width:\s*901px\)`);
    assert.doesNotMatch(blok, /\.article-aside\s*\{[^}]*(max-height|overflow)/, 'aside se bez min-height nesmí řezat');
  }
  // global.css: sticky drží stejný dotaz (kolo 19) — spolu s ním i rolování.
  const stickyGlobal = blokMedia(globalCss, String.raw`\(min-width:\s*901px\)\s*and\s*\(min-height:\s*640px\)`);
  assert.match(stickyGlobal, /\.article-aside\s*\{\s*position:\s*sticky/, 'sticky aside v global.css (kolo 19) musí zůstat ve stejném dotazu');
});

// ── P2: bez JS se mrtvé ovládání schová / nahradí odkazem ──────────────────

test('kolo 41: <noscript><style> v <head> schová přepínač tématu (bez JS je to mrtvé tlačítko); ⌘K z kola 37 zůstává', () => {
  const head = bezKomentaru(base).match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  // Přes set:html HNED za prvním <noscript>: @astrojs/compiler 2.13 po
  // </noscript> v <head> nesnese druhý <noscript> ani výraz {…} — </head>
  // uzavře za prvním a slot head, preload i beacon spadnou do <body>
  // (ověřeno kompilací Base.astro v kole 41, viz test níž).
  assert.match(
    head,
    /<noscript><style>\.search-trigger\[data-search-open\]\{display:none\}<\/style><\/noscript>\s*<Fragment set:html=\{'<noscript><style>\.theme-toggle\{display:none\}<\/style><\/noscript>'\} \/>\s*<slot name="head" \/>/,
    'kolo 37 noscript → Fragment set:html → slot head, bez ničeho mezi',
  );
  assert.equal((head.match(/(?<!')<noscript>/g) ?? []).length, 1, 'v <head> Base smí být jen jeden literální <noscript> (kompilátor)');
  const body = bezKomentaru(base).match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? '';
  for (const noscript of body.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)) {
    assert.doesNotMatch(noscript[1], /<style/, '<style> v <noscript> mimo <head> validátor neuznává');
  }
  // Tlačítko samo zůstává (skript ho řídí) — jen se bez skriptu nekreslí.
  assert.match(body, /<button id="theme-toggle" class="theme-toggle"/);
});

test('kolo 41: kompilátor uzavře </head> Base až za slotem head a beaconem (druhý <noscript> ho zavíral hned za prvním)', async () => {
  const { transform } = await import('@astrojs/compiler');
  const { code } = await transform(base, { filename: 'Base.astro', resolvePath: async (s) => s });
  const konecHlavy = code.indexOf('</head>');
  assert.ok(konecHlavy > 0, 'kompilát bez </head>');
  const slotHead = code.indexOf('$$slots["head"]');
  const beacon = code.indexOf('static.cloudflareinsights.com/beacon.min.js');
  const noscriptTema = code.indexOf('.theme-toggle{display:none}');
  assert.ok(slotHead > 0 && slotHead < konecHlavy, 'slot head musí zůstat v <head> (preload LCP, JSON-LD, noscript článku)');
  assert.ok(beacon > 0 && beacon < konecHlavy, 'beacon Cloudflare musí zůstat v <head>');
  assert.ok(noscriptTema > 0 && noscriptTema < konecHlavy, 'noscript přepínače tématu musí zůstat v <head>');
  assert.equal(code.indexOf('</head>', konecHlavy + 1), -1, 'jediný </head>');
});

test('kolo 41: fasáda YouTube nese <noscript> odkaz na video přes celou plochu; se skriptem zůstává tlačítko', () => {
  const zdroj = bezKomentaru(clanek);
  const fasada = zdroj.match(/<div\s+class="video-embed youtube-facade"[\s\S]*?<\/button>\s*<noscript>([\s\S]*?)<\/noscript>\s*<\/div>/);
  assert.ok(fasada, '<noscript> hned za .youtube-facade-button ve fasádě chybí');
  const odkaz = fasada[1].match(/<a class="youtube-facade-nojs" href=\{video\}[^>]*>/)?.[0];
  assert.ok(odkaz, 'odkaz a.youtube-facade-nojs s href={video} chybí');
  assert.match(odkaz, /aria-label=\{`Přehrát video na YouTube: \$\{title\}`\}/, 'prázdný odkaz potřebuje jméno');
  assert.doesNotMatch(fasada[1], /<style/, '<style> v <noscript> smí stát jen v <head>');
  // Tlačítko zůstává nativní <button type="button"> — Enter i mezerník (youtube-facade.js).
  assert.match(zdroj, /<button\s+type="button"\s+class="youtube-facade-button"/);
  // CSS: odkaz leží přes fasádu, která je proto position: relative.
  assert.match(globalCss, /\.youtube-facade\s*\{[^}]*position:\s*relative/, '.youtube-facade musí být kotva pro absolutní odkaz');
  const nojs = globalCss.match(/\.youtube-facade-nojs\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(nojs, /position:\s*absolute/);
  assert.match(nojs, /inset:\s*0/);
  assert.match(globalCss, /\.youtube-facade-nojs:focus-visible\s*\{[^}]*outline/, 'odkaz přes fasádu potřebuje viditelný fokus jako tlačítko');
});

// ── P2: redakční poznámky nejdou do HTML ani RSS ───────────────────────────

const DIR = join(koren, 'src/content/clanky');
const clankyMd = readdirSync(DIR, { recursive: true }).filter((f) => f.endsWith('.md'));
const telo = (soubor) => readFileSync(join(DIR, soubor), 'utf8').split(/^---\s*$/m).slice(2).join('---');

test('kolo 41: žádný článek nenese v těle HTML komentář (živě 16. 9. 2026: TODO v iPhone 18 Pro šlo do HTML i RSS)', () => {
  assert.ok(clankyMd.length >= 114, `čekám ≥ 114 článků, je ${clankyMd.length}`);
  for (const f of clankyMd) assert.doesNotMatch(telo(f), /<!--/, `${f}: HTML komentář v těle`);
  const iphone = telo('iphone-18-pro-a20-ai.md');
  assert.doesNotMatch(iphone, /TODO/);
  assert.match(iphone, /jde o měřítko\.\n\n## Tři věci, které z toho použiješ hned/, 'odstavec před mezititulkem musí zůstat oddělený prázdným řádkem');
});

const VALIDATOR = join(koren, 'scripts/validate-content.mjs');
const FIXTURE_PREFIX = join(tmpdir(), 'realtech-kolo-41-');

function fixture(t, teloClanku) {
  const root = mkdtempSync(FIXTURE_PREFIX);
  mkdirSync(join(root, 'src/content/clanky'), { recursive: true });
  mkdirSync(join(root, 'public/images/clanky'), { recursive: true });
  t.after(() => {
    assert.ok(root.startsWith(FIXTURE_PREFIX));
    rmSync(root, { recursive: true, force: true });
  });
  writeFileSync(
    join(root, 'src/content/clanky/pokus.md'),
    ['---', 'title: "Pokus"', 'description: "Popis pokusu."', 'category: "AI Report"', 'date: "2026-01-15"', '---', '', teloClanku, ''].join('\n'),
  );
  return spawnSync(process.execPath, [VALIDATOR], { cwd: root, encoding: 'utf8' });
}

test('kolo 41: validate-content shodí build kvůli HTML komentáři v těle článku', (t) => {
  const vysledek = fixture(t, 'Odstavec.\n\n<!-- TODO: sem interní odkaz -->\n\n## Nadpis');
  assert.equal(vysledek.error, undefined);
  assert.equal(vysledek.status, 1);
  assert.match(vysledek.stderr, /pokus: HTML komentář v těle článku jde doslova do HTML i RSS: „<!-- TODO: sem interní odkaz -->“/);
});

test('kolo 41: validate-content nechá projít článek bez komentáře a nevidí `---` ani `<!--` ve frontmatteru jako tělo', (t) => {
  const vysledek = fixture(t, 'Odstavec s `<code>` a odkazem [x](/clanky/pokus/).\n\n## Nadpis');
  assert.equal(vysledek.status, 0, vysledek.stderr);
  assert.match(vysledek.stdout, /1 článků OK/);
});

// ── P3: hlas pro běžného čtenáře i ve třech starších článcích ─────────────

test('kolo 41: „Pro OSVČ a malou firmu“ zmizelo z AA Indexu, Astry Critical a Muse Spark; fakta a čísla zůstala', () => {
  const OSVC = /OSVČ|živnost|malou firmu|malá firma/;
  const aa = telo('aa-index-v43-astra-fable.md');
  assert.doesNotMatch(aa, OSVC);
  assert.match(aa, /Když za API platíš z vlastní kapsy, je cena za úlohu užitečnější číslo než cena za token\./);
  assert.match(aa, /3,26 a u Fable na 7,63 dolaru/);
  const astra = telo('astra-critical-daybreak-blue.md');
  assert.doesNotMatch(astra, OSVC);
  assert.match(astra, /Pro tebe z toho plyne hlavně jedno: až Astra přijde do ChatGPT nebo přes API/);
  const muse = telo('muse-spark-13-misto-fable-astra.md');
  assert.doesNotMatch(muse, OSVC);
  assert.match(muse, /Když za AI platíš sám, je ale hlavní číslo jinde než v žebříčku\./);
  assert.match(muse, /asi 0,55 dolaru za úlohu/);
  // Napříč archivem: OSVČ jako výchozí čtenář se už nikde nevrací.
  for (const f of clankyMd) assert.doesNotMatch(telo(f), /Pro OSVČ/, `${f}: OSVČ rámec`);
});
