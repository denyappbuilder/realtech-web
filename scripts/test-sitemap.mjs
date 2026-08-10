import assert from 'node:assert/strict';
import test from 'node:test';

import './test-sitemap-register.mjs';

const { getSitemapOptions, setArticles } = await import(
  './test-sitemap-mocks/state.mjs'
);

let fixtureNumber = 0;

function article(filename, lines) {
  return { filename: `${filename}.md`, frontmatter: lines };
}

async function loadSitemapOptions(entries) {
  setArticles(entries);
  fixtureNumber += 1;
  await import(`../astro.config.mjs?sitemap-test=${fixtureNumber}`);
  return getSitemapOptions();
}

function serialize(options, url) {
  return options.serialize({ url });
}

test('lastmod článku použije updated před původním date', async () => {
  const options = await loadSitemapOptions([
    article('priorita-updated', [
      'date: "2025-01-02"',
      'updated: "2025-07-08"',
      'category: "AI"',
    ]),
  ]);

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/priorita-updated/').lastmod,
    '2025-07-08T00:00:00.000Z',
  );
});

test('lastmod kategorie odpovídá nejpozdějšímu datu jejích článků', async () => {
  const options = await loadSitemapOptions([
    article('starsi', ['date: "2025-02-03"', 'category: "Umělá inteligence"']),
    article('nejnovejsi', ['date: "2025-09-10"', 'category: "Umělá inteligence"']),
    article('jina-kategorie', ['date: "2026-01-01"', 'category: "Hardware"']),
  ]);

  assert.equal(
    serialize(options, 'https://realtech.cz/temata/umela-inteligence/').lastmod,
    '2025-09-10T00:00:00.000Z',
  );
});

test('statické URL dostanou nejnovější datum ze všech článků', async () => {
  const options = await loadSitemapOptions([
    article('starsi', ['date: "2024-12-31"', 'category: "AI"']),
    article('nejnovejsi', ['date: "2026-03-04"', 'category: "Hardware"']),
  ]);

  for (const url of [
    'https://realtech.cz/',
    'https://realtech.cz/clanky/',
    'https://realtech.cz/o-nas/',
  ]) {
    assert.equal(serialize(options, url).lastmod, '2026-03-04T00:00:00.000Z');
  }
});

test('filter vyřadí /vitej a ponechá běžné URL', async () => {
  const options = await loadSitemapOptions([
    article('platny', ['date: "2025-05-06"', 'category: "AI"']),
  ]);

  assert.equal(options.filter('https://realtech.cz/vitej/'), false);
  assert.equal(options.filter('https://realtech.cz/clanky/platny/'), true);
});

test('chybějící hodnoty data nevytvoří vadný lastmod', async () => {
  const options = await loadSitemapOptions([
    article('bez-data', ['title: "Bez data"', 'category: "AI"']),
    article('platny', ['date: "2025-11-12"', 'category: "Hardware"']),
  ]);

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/bez-data/').lastmod,
    '2025-11-12T00:00:00.000Z',
  );
  assert.equal(
    serialize(options, 'https://realtech.cz/temata/ai/').lastmod,
    '2025-11-12T00:00:00.000Z',
  );
});

test(
  'neplatné datum se ignoruje a do lastmod se nepropíše Invalid Date',
  async () => {
    const options = await loadSitemapOptions([
      article('neplatny', ['date: "2025-99-40"', 'category: "AI"']),
      article('bez-data', ['title: "Bez data"', 'category: "AI"']),
      article('platny', ['date: "2025-08-09"', 'category: "AI"']),
    ]);

    const urls = [
      'https://realtech.cz/clanky/neplatny/',
      'https://realtech.cz/clanky/bez-data/',
      'https://realtech.cz/temata/ai/',
      'https://realtech.cz/',
    ];
    const actual = urls.map((url) => {
      try {
        return serialize(options, url).lastmod;
      } catch (error) {
        return `${error.name}: ${error.message}`;
      }
    });

    assert.deepEqual(actual, [
      undefined,
      '2025-08-09T00:00:00.000Z',
      '2025-08-09T00:00:00.000Z',
      '2025-08-09T00:00:00.000Z',
    ]);
  },
);

test(
  'bez jediného platného data se lastmod vynechá',
  async () => {
    const options = await loadSitemapOptions([
      article('bez-data', ['title: "Bez data"', 'category: "AI"']),
    ]);

    assert.deepEqual(
      serialize(options, 'https://realtech.cz/clanky/bez-data/'),
      { url: 'https://realtech.cz/clanky/bez-data/' },
    );
    assert.deepEqual(
      serialize(options, 'https://realtech.cz/'),
      { url: 'https://realtech.cz/' },
    );
  },
);
