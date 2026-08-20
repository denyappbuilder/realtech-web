import assert from 'node:assert/strict';
import test from 'node:test';

import './test-sitemap-register.mjs';

const { getSitemapOptions, setArticles } = await import(
  './test-sitemap-mocks/state.mjs'
);

setArticles([]);
await import('../astro.config.mjs?sitemap-filter-hranice=1');

const { filter } = getSitemapOptions();

test('sitemap filter vyřadí přesnou noindex cestu /vitej v URL variantách', () => {
  const noindexUrls = [
    'https://realtech.cz/vitej',
    'https://realtech.cz/vitej/',
    'https://realtech.cz/vitej?zdroj=newsletter',
    'https://realtech.cz/vitej/?zdroj=newsletter',
    'https://realtech.cz/vitej#potvrzeno',
    'https://realtech.cz/vitej/#potvrzeno',
  ];

  for (const url of noindexUrls) {
    assert.equal(filter(url), false, url);
  }
});

test(
  'sitemap filter ponechá URL, které pouze obsahují nebo prefixují text vitej',
  { todo: 'codex-testy-web/SITEMAP-FILTER-001' },
  () => {
    const indexableUrls = [
      'https://realtech.cz/vitejte/',
      'https://realtech.cz/vitej-archiv/',
      'https://realtech.cz/clanky/vitejte-u-nas/',
      'https://realtech.cz/clanky/vitej-do-ai/',
      'https://realtech.cz/clanky/vitej/',
      'https://realtech.cz/sekce/vitej/',
      'https://realtech.cz/clanky/platny/?navrat=/vitej',
      'https://realtech.cz/clanky/platny/#/vitej',
    ];

    assert.deepEqual(
      indexableUrls.map((url) => ({ url, included: filter(url) })),
      indexableUrls.map((url) => ({ url, included: true })),
    );
  },
);
