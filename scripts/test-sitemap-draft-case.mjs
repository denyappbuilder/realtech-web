import assert from 'node:assert/strict';
import test from 'node:test';

import { load as parseYaml } from 'js-yaml';

import './test-sitemap-register.mjs';

const { getSitemapOptions, setArticles } = await import(
  './test-sitemap-mocks/state.mjs'
);

let fixtureNumber = 0;

function article(filename, frontmatter) {
  return { filename: `${filename}.md`, frontmatter };
}

async function loadSitemapOptions(draftValue) {
  setArticles([
    article('publikovany', ['date: "2025-03-04"', 'category: "AI Report"']),
    article('budouci-draft', [
      'date: "2025-03-04"',
      'updated: "2026-12-31"',
      `draft: ${draftValue}`,
      'category: "AI Report"',
    ]),
  ]);
  fixtureNumber += 1;
  await import(`../astro.config.mjs?sitemap-draft-case=${fixtureNumber}`);
  return getSitemapOptions();
}

function assertDraftDoesNotAffectLastmod(options, draftValue) {
  for (const url of [
    'https://realtech.cz/',
    'https://realtech.cz/clanky/',
    'https://realtech.cz/o-nas/',
    'https://realtech.cz/temata/ai-report/',
    'https://realtech.cz/clanky/budouci-draft/',
  ]) {
    assert.equal(
      options.serialize({ url }).lastmod,
      '2025-03-04T00:00:00.000Z',
      `${url} dostalo lastmod z draftu zapsaného jako ${draftValue}`,
    );
  }
}

for (const draftValue of ['true', 'TRUE', 'True']) {
  test(`\`draft: ${draftValue}\` neovlivní sitemap lastmod`, async () => {
    assert.equal(
      parseYaml(`draft: ${draftValue}\n`).draft,
      true,
      `${draftValue} musí Astro/js-yaml chápat jako boolean true`,
    );

    const options = await loadSitemapOptions(draftValue);

    assertDraftDoesNotAffectLastmod(options, draftValue);
  });
}
