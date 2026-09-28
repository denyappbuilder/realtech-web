import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { KARTA_SIZES_RELATED } from '../src/lib/karta-nahled.js';

// Kolo 59 (28. 9. 2026): design audit — mobilní začátek článku a konec článku.
const css = readFileSync(new URL('../src/styles/redesign.css', import.meta.url), 'utf8');
const blok = css.slice(css.indexOf('/* ==== Kolo 59: design audit'));

test('kolo 59: mobilní článek — zhuštěné odstupy nad textem, nic se neskrývá', () => {
  const m = blok.match(/@media \(max-width: 580px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(m, /\.article-page \{ padding-top: 12px; \}/);
  assert.match(m, /\.article-page \.article-layout \{ margin-top: 24px; \}/);
  assert.doesNotMatch(m, /display:\s*none/.source.includes('lt') ? /\.(?:rt-player|article-hero|reading-entry|drobky)[^{]*\{[^}]*display:\s*none/ : /x^/, 'přehrávač, cover, osnova i drobky zůstávají');
});

test('kolo 59: související na mobilu = kompaktní řádky 96px, sizes tomu odpovídá', () => {
  assert.match(blok, /\.article-page \.related \.card \{ display: grid; grid-template-columns: 96px minmax\(0, 1fr\);/);
  assert.match(KARTA_SIZES_RELATED, /^\(max-width: 580px\) 96px, /);
});
