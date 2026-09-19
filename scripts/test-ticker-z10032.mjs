import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const index = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

// Owner's September premium redesign supersedes August's moving-ticker
// preference. Keep correctness: chronological, keyboard-accessible reports,
// no duplicated marquee links, and reduced motion for the remaining feedback.
test('premium: moving ticker is retired rather than hidden from assistive technology', () => {
  assert.doesNotMatch(index, /class="ticker(?:-track)?"/);
  assert.doesNotMatch(index, /all\.slice\(0, 6\)/);
});
test('premium: newest report rail retains chronological source and native links', () => {
  assert.match(index, /const hero = all\[0\]/);
  assert.match(index, /const rail = candidates\.slice\(0, 3\)/);
  assert.match(index, /<a href=\{`\/clanky\/\$\{article\.id\}\/`\} class="hero-rail-item">/);
});
test('premium: compact screens retain the same supporting reports', () => {
  assert.match(index, /const railCards = rail/);
  assert.match(index, /railCards\.map\(\(article, index\) => <ArticleCard article=\{article\} class="card-rail-mobile"/);
});
test('premium: reduced motion remains a global guarantee', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none !important; transition:\s*none !important/);
});
