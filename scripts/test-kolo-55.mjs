import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { POPISY_TEMAT } from "../src/lib/tema-popis.js";

// Kolo 55: údržba po kole 54 (produkce 26. 9. 2026).
const cti = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");

test("kolo 55: štítek rubriky a odkaz na diskuzi drží cíl ≥ 44 px (WCAG 2.5.8)", () => {
  const css = cti("src/styles/redesign.css");
  assert.match(css, /a\.tag \{ min-width: 44px;/);
  assert.match(css, /\.komentare-placeholder a \{ display: inline-flex; align-items: center; min-height: 44px; \}/);
});

test("kolo 55: popis každého tématu má aspoň 80 znaků a nejvýš 160 (meta description)", () => {
  for (const [tema, popis] of Object.entries(POPISY_TEMAT)) {
    const n = [...popis].length;
    assert.ok(n >= 80 && n <= 160, `${tema}: ${n} znaků`);
  }
});
