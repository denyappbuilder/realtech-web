import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

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

// Kolo 22: strop výšky (220px tablet / 160px na 390px) z původního Z10024
// dělal z LCP coveru ořezaný proužek (720×220 = 3,3:1, 342×160 = 2,1:1).
// Fold hlídá kompaktní rytmus níž; výšku coveru dává jen aspect-ratio 16/9.
test("Z10024/kolo 22: hero obrázek na mobilu drží 16/9 přes celý sloupec, bez stropu výšky", () => {
  const desktop = pravidlo(css, ".hero-visual");
  assert.match(
    desktop,
    /aspect-ratio:\s*16\s*\/\s*9/,
    "desktopový hero musí zůstat 16/9",
  );

  const mobil = mediaBlok("max-width:\\s*900px");
  assert.ok(mobil, "chybí @media (max-width: 900px)");

  const telo = pravidlo(mobil, ".hero-visual");
  assert.ok(telo, ".hero-visual v mobilní media query chybí — grid item s aspect-ratio se bez width: 100% neroztáhne");
  assert.match(telo, /width:\s*100%/, "cover musí jít přes celý sloupec (kolo 21)");
  assert.doesNotMatch(
    telo,
    /max-height/,
    ".hero-visual má na tabletu max-height — s object-fit: cover z 16/9 fotky zbyde ořezaný proužek",
  );
  assert.doesNotMatch(telo, /aspect-ratio/, "mobil nesmí přepisovat desktopové 16/9");

  const uzky = mediaBlok("max-width:\\s*580px");
  const teloUzky = pravidlo(uzky, ".hero-visual");
  assert.doesNotMatch(
    teloUzky,
    /max-height/,
    ".hero-visual má na 390px max-height — 342px sloupec má být 192px vysoký (16/9), ne 160px proužek",
  );
});

test("Z10024: mobilní hero má kompaktní rytmus a pustí další obsah k foldu", () => {
  const mobil = mediaBlok("max-width:\\s*900px");
  const hero = pravidlo(mobil, ".hero");
  const grid = pravidlo(mobil, ".hero-grid");
  const lowerThird = pravidlo(mobil, ".lower-third");
  const title = pravidlo(mobil, ".hero h1");
  const lead = pravidlo(mobil, ".hero p.lead");

  assert.match(hero, /padding:\s*32px\s+0\s+40px/, "mobilní hero má pořád desktopové odsazení");
  assert.match(grid, /gap:\s*24px/, "mezera mezi textem a obrázkem je na mobilu zbytečně velká");
  assert.match(lowerThird, /margin-bottom:\s*16px/, "štítek nechává před titulkem zbytečně velkou mezeru");
  assert.match(title, /margin-bottom:\s*16px/, "titulek nechává před perexem zbytečně velkou mezeru");
  assert.match(lead, /margin-bottom:\s*22px/, "perex tlačí CTA a další obsah zbytečně hluboko");
});

test("Z10024: na 390px hero ukáže i náznak další sekce", () => {
  const mobil = mediaBlok("max-width:\\s*580px");
  const hero = pravidlo(mobil, ".hero");
  const grid = pravidlo(mobil, ".hero-grid");
  const title = pravidlo(mobil, ".hero h1");

  assert.match(hero, /padding:\s*24px\s+0/, "úzký mobil pořád používá tabletové odsazení hero");
  assert.match(grid, /gap:\s*18px/, "mezera před coverem vytlačuje další sekci pod fold");
  assert.match(title, /font-size:\s*1\.95rem/, "titulek na 390px zbytečně roste přes šest vysokých řádků");
});
