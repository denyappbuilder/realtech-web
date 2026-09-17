import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const html = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('premium: no moving text or unsupported live label competes with the lead', () => {
  assert.doesNotMatch(html, /ticker-label|ticker-viewport|>ŽIVĚ</);
  assert.match(html, /class="hero-rail" aria-label="Další reporty"/);
});
