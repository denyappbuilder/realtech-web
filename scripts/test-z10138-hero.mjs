import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const uvodka = readFileSync(join(koren, "src/pages/index.astro"), "utf8");

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

test("kolo 10: hero fotka bez černého závoje a CRT scanlines", () => {
  assert.doesNotMatch(
    css,
    /\.hero-visual\s+\.shade\s*\{[^}]*linear-gradient/,
    ".hero-visual .shade pořád maluje full-bleed černý filtr přes LCP fotku",
  );
  assert.doesNotMatch(
    css,
    /\.hero-visual::before\s*\{/,
    ".hero-visual::before pořád kreslí CRT scanlines přes reálnou fotku",
  );
  assert.doesNotMatch(
    uvodka,
    /class="shade"/,
    "HTML pořád drží <span class=\"shade\"> — závoj má zmizet i ze značky",
  );
});

test("kolo 10: hero sedí jako karta, ne jako neonový 3D panel", () => {
  const visual = pravidlo(".hero-visual");
  assert.ok(visual, ".hero-visual v CSS chybí");
  assert.doesNotMatch(
    visual,
    /#1[Aa]2230|#0[Ff]1520|#23150[Ff]|linear-gradient\(\s*140deg/,
    ".hero-visual pořád má uhlový neonový gradient místo fotky",
  );
  assert.doesNotMatch(
    visual,
    /color-mix\(\s*in srgb\s*,\s*var\(--signal\)/,
    ".hero-visual pořád míchá --signal do rámečku — červená záře z neon éry",
  );
  assert.doesNotMatch(
    visual,
    /229\s*,\s*50\s*,\s*45/,
    ".hero-visual pořád vrhá červenou záři",
  );
  // Kolo 23: --line-panel = --line ve světlém, v darku o krok světlejší
  // (--line na --panel nebyl vidět). Pořád tokenový rámeček, žádná záře.
  assert.match(
    visual,
    /border:\s*1px\s+solid\s+var\(--line-panel\)/,
    ".hero-visual musí mít tokenový rámeček (--line-panel) jako karty",
  );
  assert.doesNotMatch(
    css,
    /\.hero-visual\s*\{[^}]*229\s*,\s*50\s*,\s*45/,
    "dark mode pořád vrací červenou záři na .hero-visual",
  );
});

test("kolo 10: značka REALTECH je plný chip, ne text na černé cloně", () => {
  const rec = pravidlo(".hero-visual .rec");
  assert.ok(rec, ".hero-visual .rec v CSS chybí");
  assert.match(
    rec,
    /background:\s*var\(--panel\)/,
    ".rec musí mít plné pozadí --panel, ať nepotřebuje černý závoj",
  );
});
