import assert from 'node:assert/strict';
import test from 'node:test';

import './test-sitemap-register.mjs';

const { getSitemapOptions, setArticles } = await import(
  './test-sitemap-mocks/state.mjs'
);

let fixtureNumber = 0;

function article(filename, categoryLine) {
  return {
    filename: `${filename}.md`,
    frontmatter: ['date: "2025-04-05"', categoryLine],
  };
}

async function hardwareTopicLastmod(categoryLine) {
  setArticles([
    article('hardware', categoryLine),
    {
      filename: 'novejsi-ai-report.md',
      frontmatter: ['date: "2026-06-07"', 'category: "AI Report"'],
    },
  ]);
  fixtureNumber += 1;
  await import(
    `../astro.config.mjs?sitemap-category-comments-test=${fixtureNumber}`
  );
  const options = getSitemapOptions();

  return options.serialize({
    url: 'https://realtech.cz/temata/hardware/',
  }).lastmod;
}

const expectedHardwareLastmod = '2025-04-05T00:00:00.000Z';

test('nequoted category bez komentáře určí lastmod tématu', async () => {
  assert.equal(
    await hardwareTopicLastmod('category: Hardware'),
    expectedHardwareLastmod,
  );
});

test('double-quoted category s YAML inline komentářem určí lastmod tématu', async () => {
  assert.equal(
    await hardwareTopicLastmod('category: "Hardware" # redakční poznámka'),
    expectedHardwareLastmod,
  );
});

test('single-quoted category s YAML inline komentářem určí lastmod tématu', async () => {
  assert.equal(
    await hardwareTopicLastmod("category: 'Hardware' # redakční poznámka"),
    expectedHardwareLastmod,
  );
});

test.skip(
  '[codex-testy-web/SITEMAP-CATEGORY-003] nequoted category s YAML inline komentářem určí lastmod tématu',
  async () => {
    assert.equal(
      await hardwareTopicLastmod('category: Hardware # redakční poznámka'),
      expectedHardwareLastmod,
      'inline komentář nesmí způsobit fallback na novější článek jiné kategorie',
    );
  },
);
