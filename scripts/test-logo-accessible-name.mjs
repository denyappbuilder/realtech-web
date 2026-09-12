import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The flex children render as separate words in axe's visible-text algorithm.
// Browser reproduction: axe 4.13 label-content-name-mismatch (experimental).
test('header and footer logo names include the rendered REAL TECH CZ label', () => {
  const source = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
  const logos = [...source.matchAll(/<a\b[^>]*class="logo"[^>]*aria-label="([^"]+)"/g)];
  assert.equal(logos.length, 2);
  for (const [, label] of logos) assert.equal(label, 'REAL TECH CZ — domů');
  assert.equal(source.split('<span class="real">REAL</span> <span class="tech">TECH</span> <span class="cz">CZ</span>').length - 1, 2);
});
