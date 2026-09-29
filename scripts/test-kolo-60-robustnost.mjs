import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Kolo 60 (29. 9. 2026): robustnost — focus pod hlavičkou, reflow, forced colors, bez JS, tisk, 24px cíle.
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = cti('src/styles/redesign.css');
const blok = css.slice(css.indexOf('/* ==== Kolo 60: robustnost'));

test('kolo 60: fokus nezmizí pod sticky hlavičkou (WCAG 2.4.11)', () => {
  assert.match(blok, /html \{ scroll-padding-top: calc\(var\(--reading-header-height, 96px\) \+ 12px\); \}/);
});

test('kolo 60: nadpisy stránek se zalomí i s rozšířenými mezerami (WCAG 1.4.12)', () => {
  assert.match(blok, /\.about h1, [^{]*\{ overflow-wrap: break-word; max-width: min\(17ch, 100%\); \}/);
});

test('kolo 60: forced colors — aktivní položka menu a ukazatel čtení zůstanou vidět', () => {
  const fc = blok.match(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/)[1];
  assert.match(fc, /nav\.main a\[aria-current\]::after \{ background: CanvasText; forced-color-adjust: none; \}/);
  assert.match(fc, /\.read-progress span \{ background: Highlight;/);
});

test('kolo 60: tisk bez Herohero, Co se dělo dál a drobečků; bez JS schované tlačítko komentářů', () => {
  assert.match(blok, /@media print \{ \.herohero-cta, \.co-dal, \.drobky \{ display: none !important; \} \}/);
  assert.match(cti('src/components/Giscus.astro'), /<noscript>[\s\S]*?<style is:inline>\[data-komentare-nacist\]\{display:none\}<\/style>/);
});

test('kolo 60: odkazy patičky a meta v asidu mají na desktopu 24 px (WCAG 2.5.8)', () => {
  assert.match(blok, /footer\.site \.f-nav a, \.about-aside-meta a, \.article-aside-meta a \{ display: inline-flex; align-items: center; min-height: 24px; \}/);
});
