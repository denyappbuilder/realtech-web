import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("Z10138: hero sloupce nesmí dávat textu víc než obrázku", () => {
  const grid = pravidlo(".hero-grid");
  assert.ok(grid, ".hero-grid v CSS chybí");
  assert.match(grid, /grid-template-columns:/, ".hero-grid nemá sloupce");
  assert.doesNotMatch(
    grid,
    /grid-template-columns:\s*1\.4fr\s+1fr/,
    ".hero-grid pořád dává textu 1.4fr a obrázku 1fr — pravá strana zůstává slabší",
  );
  assert.match(
    grid,
    /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.15fr\)/,
    ".hero-grid musí dát obrázku víc než textu",
  );
});

test("Z10138: hero nadpis nesmí šplhat na 3.7rem", () => {
  const h1 = pravidlo(".hero h1");
  assert.ok(h1, ".hero h1 v CSS chybí");
  assert.doesNotMatch(
    h1,
    /3\.7rem/,
    ".hero h1 pořád šplhá na 3.7rem — text táhne oko dolů",
  );
  assert.match(
    h1,
    /clamp\([^)]*3\.1rem\)/,
    ".hero h1 musí mít strop 3.1rem",
  );
});

test("Z10138: hero obrázek nesmí být nižší než 16/9", () => {
  const visual = pravidlo(".hero-visual");
  assert.ok(visual, ".hero-visual v CSS chybí");
  assert.doesNotMatch(
    visual,
    /aspect-ratio:\s*16\s*\/\s*10/,
    ".hero-visual pořád drží 16/10 — pravá strana je nižší než text",
  );
  assert.match(
    visual,
    /aspect-ratio:\s*16\s*\/\s*9/,
    ".hero-visual musí být 16/9, ať fotka vyplní sloupec",
  );
});
