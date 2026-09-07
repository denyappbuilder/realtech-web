// Kolo 27: leftover po živém screenshotu 7. 9. 2026 (po kolech 26 #411 + #412).
// P0: titulek úvodky „OpenAI hlásí, že má „automatizovaného výzkumného
// stážistu“…“ přetékal na 1024–1440px pod cover — slovo „automatizovaného“
// (~530 px v Archivo 870/110 % při 3.1rem) bylo širší než 435–480px sloupec
// a grid item s min-width: auto se roztáhl přes mezeru. P1: titulky od 90
// znaků dostanou menší desktopový stupeň. P2: fallback font se size-adjust,
// ať swap Archiva neposouvá perex, CTA ani cover (živě CLS 0.037).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");
const headers = readFileSync(join(koren, "public/_headers"), "utf8");

function mediaBlok(zdroj, dotaz) {
  const start = zdroj.search(new RegExp(`@media\\s*\\(${dotaz}\\)\\s*\\{`));
  if (start < 0) return "";
  const open = zdroj.indexOf("{", start);
  let hloubka = 0;
  for (let i = open; i < zdroj.length; i += 1) {
    if (zdroj[i] === "{") hloubka += 1;
    else if (zdroj[i] === "}") {
      hloubka -= 1;
      if (hloubka === 0) return zdroj.slice(open + 1, i);
    }
  }
  return "";
}

function pravidlo(blok, selektor) {
  const shoda = blok.match(
    new RegExp(`(?:^|[}\\s/])${selektor.replaceAll(".", "\\.").replaceAll(" ", "\\s+")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

/** Všechny bloky @media (min-width: 901px) — CSS má víc než jeden. */
function vsechnyMediaBloky(zdroj, dotaz) {
  const bloky = [];
  let zbytek = zdroj;
  for (;;) {
    const blok = mediaBlok(zbytek, dotaz);
    if (!blok) return bloky;
    bloky.push(blok);
    zbytek = zbytek.slice(zbytek.indexOf(blok) + blok.length);
  }
}

const hero = index.match(/<section class="hero">([\s\S]*?)<\/section>/)?.[0] ?? "";
const heroGrid = hero.match(/<div class="hero-grid">([\s\S]*?)<a href=\{hero\.data\.video/)?.[1] ?? "";

// ── P0: titulek nesmí přetéct pod cover ──────────────────────────────────

test("kolo 27: textový sloupec hera má .hero-copy s min-width: 0", () => {
  assert.ok(heroGrid, "úvodka ztratila .hero-grid před .hero-visual");
  assert.match(
    heroGrid,
    /^\s*<div class="hero-copy">\s*<div class="lower-third">/,
    "první grid item (text) musí být <div class=\"hero-copy\"> — holý <div> má min-width: auto = nejdelší slovo",
  );
  const copy = pravidlo(css, ".hero-copy");
  assert.ok(copy, ".hero-copy v CSS chybí");
  assert.match(copy, /min-width:\s*0\s*;/, ".hero-copy musí smět být užší než nejdelší slovo titulku");
});

test("kolo 27: .hero h1 umí zlomit dlouhé slovo (hyphens + overflow-wrap)", () => {
  const h1 = pravidlo(css, ".hero h1");
  assert.ok(h1, ".hero h1 v CSS chybí");
  assert.match(h1, /overflow-wrap:\s*anywhere\s*;/, "bez overflow-wrap přeteče nedělitelné slovo pod cover");
  assert.match(h1, /hyphens:\s*auto\s*;/, "hyphens: auto — čeština dělí na slabice se spojovníkem, ne natvrdo");
  assert.match(
    h1,
    /hyphenate-limit-chars:\s*10\s+4\s+4\s*;/,
    "limit 10/4/4: krátká slova titulku se nedělí, „au-tomatizovaného“ ne",
  );
  assert.doesNotMatch(h1, /word-break:\s*break-all/, "break-all by lámal i krátká slova");
  assert.doesNotMatch(h1, /white-space:\s*nowrap/, "nowrap by titulek nikdy nezlomil");
});

test("kolo 27: obě stopy .hero-grid mají minmax(0, …) — desktop i mobil", () => {
  const desktop = pravidlo(css, ".hero-grid");
  assert.match(
    desktop,
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.15fr\)\s*;/,
    "desktopové stopy musí zůstat minmax(0, 1fr) minmax(0, 1.15fr) (Z10138)",
  );
  const mobil = mediaBlok(css, "max-width:\\s*900px");
  assert.ok(mobil, "chybí @media (max-width: 900px)");
  assert.match(
    pravidlo(mobil, ".hero-grid"),
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*;/,
    "holé 1fr = minmax(auto, 1fr) — dlouhé slovo by na mobilu roztáhlo sloupec přes viewport",
  );
});

test("kolo 27: html má lang=cs, bez něj hyphens: auto nedělí", () => {
  const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
  assert.match(base, /<html lang="cs">/);
});

// ── P1: dlouhý titulek = menší desktopový stupeň ─────────────────────────

test("kolo 27: index.astro přidá .h1-dlouhy od 90 znaků přes class:list", () => {
  assert.match(index, /const HERO_DLOUHY_TITULEK = 90;/, "práh 90 znaků (≈ 15 z 98 titulků) musí být pojmenovaná konstanta");
  assert.match(
    index,
    /const heroTitulekDlouhy = Boolean\(hero && hero\.data\.title\.length >= HERO_DLOUHY_TITULEK\);/,
  );
  assert.match(
    hero,
    /<h1 class:list=\{\[\{ 'h1-dlouhy': heroTitulekDlouhy \}\]\}><a href=\{`\/clanky\/\$\{hero\.id\}\/`\}>\{hero\.data\.title\}<\/a><\/h1>/,
    "h1 nese class:list; odkaz přes celý titulek zůstává (test-hero-nadpis-proklik)",
  );
});

test("kolo 27: .hero h1.h1-dlouhy je jen od 901px a nepřekračuje 2.5rem", () => {
  const bloky = vsechnyMediaBloky(css, "min-width:\\s*901px");
  const sPravidlem = bloky.map((b) => pravidlo(b, ".hero h1.h1-dlouhy")).filter(Boolean);
  assert.equal(sPravidlem.length, 1, ".hero h1.h1-dlouhy musí být přesně jednou uvnitř @media (min-width: 901px)");
  assert.match(
    sPravidlem[0],
    /font-size:\s*clamp\(2rem,\s*3\.6vw,\s*2\.5rem\)\s*;/,
    "dlouhý titulek: clamp(2rem, 3.6vw, 2.5rem) — na 1280px 40px místo 49,6px, 6 řádků místo 9",
  );
  // Mimo media query pravidlo být nesmí — mobilní 1.95rem (≤ 600px) by
  // vyšší specificita .hero h1.h1-dlouhy přepsala.
  const bezMedia = css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  assert.equal(pravidlo(bezMedia, ".hero h1.h1-dlouhy"), "", ".hero h1.h1-dlouhy mimo @media by přebilo mobilní 1.95rem");
});

test("kolo 27: základní .hero h1 drží strop 3.1rem (Z10138) i balance", () => {
  const h1 = pravidlo(css, ".hero h1");
  assert.match(h1, /font-size:\s*clamp\(2\.1rem,\s*4\.8vw,\s*3\.1rem\)\s*;/);
  assert.match(h1, /text-wrap:\s*balance\s*;/);
});

// ── P2: fallback font se size-adjust proti CLS při swapu Archiva ─────────

test("kolo 27: @font-face 'Archivo Hero Fallback' = lokální Arial Bold se size-adjust", () => {
  const face = css.match(/@font-face\s*\{([^}]*font-family:\s*'Archivo Hero Fallback'[^}]*)\}/)?.[1] ?? "";
  assert.ok(face, "@font-face 'Archivo Hero Fallback' v CSS chybí");
  assert.match(face, /src:\s*local\('Arial Bold'\),\s*local\('Arial'\)/, "Arial Bold první — local('Arial') by na 870 dostal syntetický bold s jinou šířkou");
  assert.match(face, /local\('Roboto Bold'\)/, "Android nemá Arial, Roboto je tam systémový sans");
  assert.match(face, /font-weight:\s*100 1000\s*;/, "rozsah vah, ať fallback platí i pro 870");
  const adjust = Number(face.match(/size-adjust:\s*([\d.]+)%/)?.[1]);
  assert.ok(adjust >= 115 && adjust <= 120, `size-adjust ${adjust}% — Archivo 870/110 % je proti Arial Bold 1,1765×`);
  assert.doesNotMatch(face, /url\(/, "fallback je jen local(), žádné další stahování");
});

test("kolo 27: fallback bere jen .hero h1, ne karty ani článek", () => {
  const h1 = pravidlo(css, ".hero h1");
  assert.match(
    h1,
    /font-family:\s*'Archivo Variable',\s*'Archivo Hero Fallback',\s*'Archivo',\s*sans-serif\s*;/,
    "fallback musí být hned za Archivo Variable, aby ho prohlížeč použil po dobu swapu",
  );
  const vyskyty = css.match(/'Archivo Hero Fallback'/g) ?? [];
  assert.equal(vyskyty.length, 2, "jen @font-face + .hero h1 — karty (750/105 %) mají poměr 1,057 a 117,6 % by je rozhodilo");
});

// ── Cache /images/* beze změny ───────────────────────────────────────────

test("kolo 27: /images/* Cache-Control max-age=0 zůstává", () => {
  assert.match(headers, /^\/images\/\*\n\s+Cache-Control: public, max-age=0, must-revalidate$/m);
});
