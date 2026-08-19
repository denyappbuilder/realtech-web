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

test("Z10024: hero obrázek na mobilu musí mít strop výšky", () => {
  const desktop = pravidlo(css, ".hero-visual");
  assert.match(
    desktop,
    /aspect-ratio:\s*16\s*\/\s*10/,
    "desktopový hero musí zůstat 16/10 — léčba je strop na mobilu, ne změna desktopu",
  );

  const mobil = mediaBlok("max-width:\\s*900px");
  assert.ok(mobil, "chybí @media (max-width: 900px)");

  const telo = pravidlo(mobil, ".hero-visual");
  assert.ok(
    telo,
    ".hero-visual v mobilní media query chybí — 16/10 přes celou šířku žere fold",
  );

  const stropPx = telo.match(/max-height:\s*([0-9.]+)px/);
  const stropVh = telo.match(/max-height:\s*([0-9.]+)vh/);
  assert.ok(
    stropPx || stropVh,
    ".hero-visual na mobilu nemá max-height — aspect-ratio 16/10 bez stropu tlačí karty pod fold",
  );
  if (stropPx) {
    assert.ok(
      Number(stropPx[1]) <= 240,
      `.hero-visual max-height ${stropPx[1]}px je moc vysoko — na tabletu pořád žere fold`,
    );
  }
  if (stropVh) {
    assert.ok(
      Number(stropVh[1]) <= 40,
      `.hero-visual max-height ${stropVh[1]}vh je moc vysoko — pořád dominuje první obrazovku`,
    );
  }
});
