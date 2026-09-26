import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { KARTA_SIZES_RELATED } from "../src/lib/karta-nahled.js";
import { videoPasekNahled } from "../src/lib/video-pasek-nahled.js";

// Kolo 54: technický audit 25. 9. 2026 (Playwright 390/1280 × DPR 1/2,
// Lighthouse 3×). Každý test = jedna změřená vada.
const cti = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const index = cti("src/pages/index.astro");

test("kolo 54: karty „Mimo AI“ nejsou kompaktní řádky — berou KARTA_SIZES, ne 72/96px (na 390 px 342px slot bral 192w)", () => {
  assert.match(index, /\{mimoAi\.map\(\(article\) => <ArticleCard article=\{article\} sizes=\{KARTA_SIZES\} \/>\)\}/);
  assert.doesNotMatch(index, /mimoAi\.map\([^\n]*KARTA_SIZES_HOME_COMPACT/);
});

test("kolo 54: související karty pod článkem na mobilu = šířka wrapu bez okrajů, ne 100vw", () => {
  assert.match(KARTA_SIZES_RELATED, /^\(max-width: 700px\) calc\(100vw - 48px\), /);
});

// Pásek videí: sddefault 640w vyzkoušen a vrácen — u vlastních náhledů
// YouTube sddefault je 4:3 VÝŘEZ (ne letterbox), v 16:9 slotu ořízl text
// náhledu („VLASTNÍ“, „GROK BOT“). hq720 zůstává (kolo 50/53).
test("kolo 54: pásek videí zůstává na hq720 bez sddefault srcsetu (ořez textu náhledů)", () => {
  assert.equal(videoPasekNahled("abc").webpSrcset, undefined);
  assert.match(index, /<source srcset=\{v\.nahled\.webp\} type="image\/webp" \/>/);
});

// Kolo 56 nahradilo: hero úvodky na desktopu zase vyplňuje výšku textového
// sloupce (ořez cover), sizes je 1080px — hlídá test-kolo-56.mjs.
test("kolo 54: Archivo je výseč os wght 600–900 / wdth 100–125 % (−93 KB na stránku)", () => {
  const css = cti("src/styles/fonts-archivo.css");
  for (const sada of ["latin-ext", "latin"]) {
    const soubor = `src/assets/fonts/archivo-${sada}-wght600-900-wdth100-125.woff2`;
    assert.ok(existsSync(new URL(`../${soubor}`, import.meta.url)), `${soubor} chybí — spusť scripts/archivo-instance.py`);
    assert.ok(statSync(new URL(`../${soubor}`, import.meta.url)).size < 50_000, "výseč má mít < 50 KB (plný font 87–90 KB)");
    assert.match(css, new RegExp(`url\\('\\.\\./assets/fonts/archivo-${sada}-wght600-900-wdth100-125\\.woff2'\\)`));
  }
  // Web nesmí sáhnout mimo výseč: prohlížeč by jinak vykreslil nejbližší
  // krajní hodnotu (tenčí/užší Archivo tiše zmizí). Hlídáme zdroj stylů.
  const styly = ["global", "premium", "redesign", "editorial"].map((f) => cti(`src/styles/${f}.css`)).join("\n");
  for (const m of styly.matchAll(/font-stretch:\s*(\d+)%/g)) {
    const v = Number(m[1]);
    assert.ok(v >= 100 && v <= 125, `font-stretch ${v}% je mimo výseč Archiva 100–125 %`);
  }
});

test("kolo 54: čipy filtru mají záložní řez Plex 500 (CLS 0,027 na /clanky/ mobil)", () => {
  const css = cti("src/styles/redesign.css");
  assert.match(css, /@font-face \{\s*font-family: 'Plex Chip Fallback';[^}]*font-weight: 500;[^}]*size-adjust: 105%;/);
  assert.match(css, /\[data-archive\] \.chip, \.topics \.chip \{ font-family: 'IBM Plex Sans', 'Plex Chip Fallback', Arial, sans-serif; \}/);
});

test("kolo 54: nativní <audio> má signální fokus ring, ne modrý UA", () => {
  assert.match(cti("src/styles/global.css"), /audio:focus-visible \{ outline: 2px solid var\(--signal\); outline-offset: 3px; \}/);
});

test("kolo 54: archiv — JSON-LD popis = meta description, strana N v drobečcích", () => {
  const a = cti("src/components/ArticleArchivePage.astro");
  assert.match(a, /description: popisArchivu,/);
  // Meta description zůstává inline (test-pagination-description ji vyhodnocuje); musí se shodovat s JSON-LD.
  assert.ok(a.includes("const popisArchivu = 'Všechny články a analýzy REALTECH CZ — AI, drony, Starlink, mobily a hardware bez marketingových řečí.'"));
  assert.ok(a.includes("<Base title={title} description={'Všechny články a analýzy REALTECH CZ — AI, drony, Starlink, mobily a hardware bez marketingových řečí.' + (page > 1 ? ` Strana ${page}.` : '')}"));
  assert.doesNotMatch(a, /Kompletní archiv novinek/);
  assert.match(a, /position: 3, name: `Strana \$\{page\}`/);
});

test("kolo 54: vydavatel článku je tatáž Organization (#org) jako na úvodce", () => {
  assert.match(cti("src/pages/clanky/[...id].astro"), /'@type': 'Organization',\s*'@id': `\$\{Astro\.site\?\.href\}#org`,\s*name: 'REALTECH CZ',/);
});
