import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Kolo 53 (review): záložní fonty jako JEDNA rodina, chipy 44px, hover
// Herohero výzvy, štítek na mobilu jen u malých náhledů.
const css = readFileSync(new URL("../src/styles/redesign.css", import.meta.url), "utf8");
const fontFaces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

test("kolo 53: záložní fonty nadpisů jsou jedna rodina se dvěma řezy (jinak 700 dostane 122 %)", () => {
  const fb = fontFaces.filter((f) => /font-family:\s*'Archivo Display Fallback'/.test(f));
  assert.equal(fb.length, 2, "dva řezy téže rodiny");
  assert.ok(fb.some((f) => /font-weight:\s*750 900/.test(f) && /size-adjust:\s*122%/.test(f)), "800 = 122 %");
  assert.ok(fb.some((f) => /font-weight:\s*600 749/.test(f) && /size-adjust:\s*105%/.test(f)), "700 = 105 % (Archivo 700/106 % ≈ 1,05× Arial Bold)");
  assert.doesNotMatch(css, /Archivo Card Fallback/, "druhá rodina v seznamu by se pro 700 nikdy nepoužila");
  const posledni = [...css.matchAll(/--rd-display:\s*([^;]+);/g)].at(-1)[1];
  assert.equal(posledni.trim(), "'Archivo Variable', 'Archivo Display Fallback', Arial, sans-serif");
});

test("kolo 53: textové chipy archivu a témat drží 44px cíl", () => {
  const blok = css.match(/\[data-archive\] \.chip, \.topics \.chip \{([^}]*)\}/)[1];
  assert.match(blok, /min-width:\s*44px/);
  assert.doesNotMatch(blok, /padding-inline:\s*2px/);
});

test("kolo 53: Herohero výzva má červený hover se stejnou specificitou jako premium (:root …:hover)", () => {
  assert.match(css, /:root \.herohero-akce \.hero-actions \.btn-primary:hover \{ background: var\(--signal-fill-hover\); color: #fff; \}/);
});

test("kolo 53: štítek kategorie se na mobilu skrývá jen u kompaktních náhledů, ne u velkých karet", () => {
  assert.doesNotMatch(css, /^\s*\.card-thumb \.lt \{ display: none; \}/m);
  assert.match(css, /\.latest-reports > \.card:not\(:first-child\) \.card-thumb \.lt, \[data-archive\] \.card-thumb \.lt \{ display: none; \}/);
});
