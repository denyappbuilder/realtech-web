// Kolo 31: leftover po kolech 29–30 (#415, #419 živě). Živý audit 8. 9. 2026
// (úvodka, /clanky/aa-index-v43-astra-fable/, /clanky/, /clanky/strana/2/,
// /o-nas/, /temata/, 404; 320–1280px, axe bez violations) proti kódu.
//
// P2: scroll-margin-top pod sticky hlavičku měly jen h2/h3 v těle článku.
//     Skip link „Přeskočit na obsah“ (#obsah) posunul <main> pod hlavičku
//     (390px: štítek, datum i horní řádek h1 článku pryč); „Kontakt“
//     z patičky (/o-nas/#kontakt) na 1280px schoval h2 i odstavec s e-mailem.
// P3: pruh čtení se přepočítával jen při scrollu — otočení telefonu ani
//     dorůstání dokumentu (lazy iframe giscusu, widget X) ho nezměnily.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const base = cti("src/layouts/Base.astro");
const oNas = cti("src/pages/o-nas.astro");
const clanek = cti("src/pages/clanky/[...id].astro");

/** Všechny bloky @media s daným dotazem (bez vnořených závorek v těle). */
function mediaBloky(dotaz) {
  const re = new RegExp(`@media\\s*${dotaz}\\s*\\{([\\s\\S]*?)\\n\\}`, "g");
  return [...css.matchAll(re)].map((m) => m[1]);
}

/** Hodnota --kotva-odstup deklarovaná na :root v daném bloku CSS. */
function kotvaOdstup(blok) {
  return blok.match(/:root\s*\{\s*--kotva-odstup:\s*([^;}]+);?\s*\}/)?.[1]?.trim();
}

/** Selektory pravidla, které nastavuje scroll-margin-top přes proměnnou. */
function selektoryKotev() {
  const shoda = css.match(/([^{}]+)\{\s*scroll-margin-top:\s*var\(--kotva-odstup\)\s*;?\s*\}/);
  assert.ok(shoda, "pravidlo scroll-margin-top: var(--kotva-odstup) chybí");
  return shoda[1].split(",").map((s) => s.trim()).filter(Boolean);
}

// ── Odstup kotev pod sticky hlavičkou ─────────────────────────────────────

test("kolo 31: odstup kotev je jedna proměnná se třemi prahy hlavičky (65 / 117 / 93 px)", () => {
  const bezMedia = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");
  assert.equal(kotvaOdstup(bezMedia), "90px", "desktop: hlavička 65px + rezerva");
  const tablet = mediaBloky("\\(max-width:\\s*900px\\)").map(kotvaOdstup).filter(Boolean);
  assert.deepEqual(tablet, ["130px"], "581–900px: hlavička 117px + rezerva");
  const mobil = mediaBloky("\\(max-width:\\s*580px\\)").map(kotvaOdstup).filter(Boolean);
  assert.deepEqual(mobil, ["106px"], "do 580px: hlavička 93px + rezerva");
});

test("kolo 31: odstup mají všechny cíle fragmentů, ne jen nadpisy v těle článku", () => {
  const selektory = selektoryKotev();
  for (const s of ["#obsah", ".about h2", ".article-body h2", ".article-body h3"]) {
    assert.ok(selektory.includes(s), `${s} chybí mezi cíli se scroll-margin-top`);
  }
  assert.doesNotMatch(css, /scroll-margin-top:\s*\d/, "pevné hodnoty nahradila proměnná — třetí kopie prahů sem nepatří");
});

test("kolo 31: kotvy nadpisů článku drží position: relative (kolo 16, heading-anchor)", () => {
  assert.match(css, /\.article-body h2,\s*\.article-body h3\s*\{\s*position:\s*relative;?\s*\}/);
});

test("kolo 31: každý cíl fragmentu odkazovaný z Base opravdu existuje a má odstup", () => {
  // Skip link → <main id="obsah">
  assert.match(base, /<a class="skip-link" href="#obsah">/);
  assert.match(base, /<main id="obsah">/);
  // Patička „Kontakt“ → /o-nas/#kontakt → <h2 id="kontakt"> uvnitř .about
  assert.match(base, /href="\/o-nas\/#kontakt"/);
  assert.match(oNas, /<h2 id="kontakt">Kontakt<\/h2>/);
  assert.match(oNas, /<section class="about about-wide wrap">/, ".about h2 v CSS míří na tenhle obal");
  // Žádný další #fragment v Base bez odstupu (mimo protokoly a ⌘K).
  const fragmenty = [...base.matchAll(/href="([^"#]*)#([^"]+)"/g)].map((m) => m[2]);
  assert.deepEqual([...new Set(fragmenty)].sort(), ["kontakt", "obsah"], "nový cíl fragmentu v Base musí dostat scroll-margin-top");
});

// ── Pruh čtení ────────────────────────────────────────────────────────────

test("kolo 31: pruh čtení se přepočítává i při resize a růstu dokumentu", () => {
  const skript = clanek.match(/const onScroll = \(\) => \{[\s\S]*?onScroll\(\);/)?.[0] ?? "";
  assert.ok(skript, "blok onScroll v [...id].astro chybí");
  assert.match(skript, /document\.addEventListener\('scroll', onScroll, \{ passive: true \}\)/);
  assert.match(skript, /window\.addEventListener\('resize', onScroll, \{ passive: true \}\)/);
  assert.match(skript, /new ResizeObserver\(onScroll\)\.observe\(document\.documentElement\)/);
  assert.match(skript, /'ResizeObserver' in window/, "starý engine bez ResizeObserver nesmí spadnout — zbytek skriptu (kopírování, fasády) by s ním umřel");
});
