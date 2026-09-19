import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { marked } from 'marked';
import { articleOutline } from '../src/lib/article-outline.js';

const articles = [
  ['chatgpt-ve-wordu-zdarma-checklist-osvc', 8],
  ['claude-cowork-docs-slides-checklist', 6],
  ['openai-misalignment-reports-pet-pravidel-agenti', 7],
];

for (const [slug, count] of articles) {
  test(`B02: ${slug} has peer H2 sections below the page H1`, () => {
    const source = readFileSync(new URL(`../src/content/clanky/${slug}.md`, import.meta.url), 'utf8');
    const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
    const headings = marked.lexer(body).filter((token) => token.type === 'heading');
    assert.equal(headings.length, count);
    assert.deepEqual(headings.map(({ depth }) => depth), Array(count).fill(2),
      'These existing sections are peers, not orphan H3 subsections');
    const outline = articleOutline(headings);
    assert.equal(outline.length, count);
    assert.ok(outline.every(({ depth }) => depth === 2));
    assert.equal(new Set(outline.map(({ id }) => id)).size, count);
  });
}
