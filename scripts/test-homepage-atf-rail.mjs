import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");

function mediaBlok(dotaz) {
  const start = css.search(new RegExp(`@media\\s*\\(${dotaz}\\)\\s*\\{`));
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  let hloubka = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") hloubka += 1;
    else if (css[i] === "}") {
      hloubka -= 1;
      if (hloubka === 0) return css.slice(open + 1, i);
    }
  }
  return "";
}

function pravidlo(blok, selektor) {
  const shoda = blok.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("desktopový ATF rail bere tři nejnovější další články, ne featured", () => {
  assert.match(
    index,
    /const hero = all\[0\]/,
    "hero musí být nejnovější podle date, ne featured pin",
  );
  assert.doesNotMatch(
    index,
    /FEATURED_MAX_AGE|c\.data\.featured/,
    "featured nesmí pinovat homepage hero",
  );
  assert.match(
    index,
    /const candidates = all\.filter\(\(c\) => c\.id !== hero\?\.id\)\.slice\(0,\s*9\)/,
    "jeden seznam 9 kandidátů bez featured",
  );
  assert.match(
    index,
    /const rail = candidates\.slice\(0,\s*3\)/,
    "rail musí být první tři z kandidátů — featured do něj nepatří",
  );
  assert.match(
    index,
    /const rest = candidates\.slice\(3,\s*9\)/,
    "šest velkých karet musí být dalších šest, ne tytéž tři znovu",
  );
  assert.doesNotMatch(
    index,
    /const rest = candidates\.slice\(0,\s*6\)/,
    "karty se nesmí vrátit na překrývající slice(0, 6)",
  );
  assert.doesNotMatch(
    index,
    /const rest = all\.filter[\s\S]{0,120}?\.slice\(0,\s*6\)/,
    "karty se nesmí počítat jako první šest z rest",
  );
  assert.match(index, /class="hero-rail"/, "úvodka ztratila hero-rail");
  assert.match(index, /class="hero-rail-title"/, "rail musí nést titulek");
  assert.match(
    index,
    /<time datetime=\{article\.data\.date\.toISOString\(\)\.slice\(0, 10\)\}>/,
    "rail musí nést datum, ne jen titulek",
  );
  assert.doesNotMatch(
    index.slice(index.indexOf("hero-rail"), index.indexOf("</aside>")),
    /article\.data\.description|ArticleCard|card-thumb|<img/,
    "rail nesmí kreslit perex ani velké obrázky",
  );
});

test("rail je jen od 901px — mobilní hero, CTA i mřížka zůstávají", () => {
  const zaklad = pravidlo(css, ".hero-rail");
  assert.match(zaklad, /display:\s*none/, "bez media query by rail lezl i na mobil");

  const desktop = mediaBlok("min-width:\\s*901px");
  assert.ok(desktop, "chybí @media (min-width: 901px) pro desktopový rail");
  assert.match(
    pravidlo(desktop, ".hero-rail"),
    /display:\s*block/,
    "od 901px se rail musí ukázat",
  );
  assert.match(
    pravidlo(desktop, ".hero-rail-list"),
    /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
    "desktopový rail musí být tři kompaktní sloupce, ne velké karty",
  );

  const mobil = mediaBlok("max-width:\\s*900px");
  assert.match(
    pravidlo(mobil, ".hero-grid"),
    /grid-template-columns:\s*1fr/,
    "mobilní hero-grid se nesmí rozbít kvůli railu",
  );
  assert.match(index, /class="btn-primary"/, "featured CTA zmizelo");
  assert.match(index, /class="hero-visual"/, "featured visual zmizel");
  assert.match(
    index,
    /const rest = candidates\.slice\(3,\s*9\)/,
    "šest běžných karet pod herem musí zůstat jako dalších šest",
  );
  assert.doesNotMatch(
    `${base}\n${index}\n${css}`,
    /hamburger|nav-toggle|menu-btn/i,
    "nesmí přibýt hamburger",
  );
});
