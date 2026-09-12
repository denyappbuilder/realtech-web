import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Evaluate the actual Base description binding for each page, not a copy.
for (const [file, original] of [
  ['ArticleArchivePage.astro', 'Všechny články a analýzy REALTECH CZ — AI, drony, Starlink, mobily a hardware bez marketingových řečí.'],
  ['TemaPage.astro', 'Popis tématu.'],
]) {
  const source = readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8');
  const binding = source.match(/<Base\b[^>]*\bdescription=("[^"]*"|\{[^\n]*?\})(?=\s+\w+=)/)[1];
  const expression = binding.startsWith('{') ? binding.slice(1, -1) : binding;
  const description = (page) => Function('page', 'popis', `return (${expression});`)(page, original);
  test(`${file}: first-page description is unchanged`, () => {
    assert.equal(description(1), original);
  });
  test(`${file}: later pages have unique numbered descriptions`, () => {
    for (const page of [2, 3, 8]) {
      assert.equal(description(page), `${original} Strana ${page}.`);
    }
  });
}
