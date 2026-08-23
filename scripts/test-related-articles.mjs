import assert from 'node:assert/strict';
import test from 'node:test';

import './test-related-articles-register.mjs';

import { setCollection } from './test-related-articles-mocks/state.mjs';

let fixtureNumber = 0;

function article({ id, category, date, draft = false }) {
  return {
    id,
    body: '',
    data: {
      title: id,
      description: `Popis ${id}`,
      category,
      date: new Date(date),
      draft,
    },
  };
}

async function selectRelated(current, entries) {
  setCollection(entries);
  globalThis.Astro = {
    props: { article: current },
    site: new URL('https://realtech.cz/'),
    url: new URL(`https://realtech.cz/clanky/${current.id}/`),
  };
  fixtureNumber += 1;

  const { related } = await import(
    `../src/pages/clanky/[...id].astro?related-test=${fixtureNumber}`
  );
  return related.map(({ id }) => id);
}

test('související články vyloučí draft a aktuální článek a upřednostní stejnou kategorii', async () => {
  const current = article({
    id: 'aktualni',
    category: 'AI',
    date: '2025-06-15T12:00:00.000Z',
  });
  const entries = [
    article({ id: 'jina-starsi', category: 'Hardware', date: '2025-03-01T12:00:00.000Z' }),
    article({ id: 'stejna-starsi', category: 'AI', date: '2025-01-01T12:00:00.000Z' }),
    article({ id: 'draft-stejna', category: 'AI', date: '2030-01-01T12:00:00.000Z', draft: true }),
    current,
    article({ id: 'jina-nejnovejsi', category: 'Hardware', date: '2025-12-01T12:00:00.000Z' }),
    article({ id: 'stejna-novejsi', category: 'AI', date: '2025-02-01T12:00:00.000Z' }),
    article({ id: 'jina-prostredni', category: 'Vesmír', date: '2025-04-01T12:00:00.000Z' }),
  ];

  assert.deepEqual(await selectRelated(current, entries), [
    'stejna-novejsi',
    'stejna-starsi',
    'jina-nejnovejsi',
  ]);
});

test('shodné datum skutečných článků je stabilní v obou pořadích vstupu a kategorie zůstává první', async () => {
  const current = article({
    id: 'aktualni-vesmir',
    category: 'Vesmír',
    date: '2026-08-19T00:00:00.000Z',
  });
  const chatgpt = article({
    id: 'chatgpt-pro-teenagery',
    category: 'AI Report',
    date: '2026-08-18T00:00:00.000Z',
  });
  const starship = article({
    id: 'starship-ship-40-vanocni-ostrov',
    category: 'Vesmír',
    date: '2026-08-18T00:00:00.000Z',
  });

  for (const tiedArticles of [[chatgpt, starship], [starship, chatgpt]]) {
    assert.deepEqual(await selectRelated(current, [
      ...tiedArticles,
      article({ id: 'starsi-ai', category: 'AI Report', date: '2026-08-17T00:00:00.000Z' }),
      current,
    ]), [
      'starship-ship-40-vanocni-ostrov',
      'chatgpt-pro-teenagery',
      'starsi-ai',
    ]);
  }
});

test('při nedostatku stejné kategorie doplní nejnovější jiné články a výsledek omezí na tři', async () => {
  const current = article({
    id: 'aktualni-bez-shody',
    category: 'AI',
    date: '2025-06-15T12:00:00.000Z',
  });
  const entries = [
    article({ id: 'jiny-2', category: 'Hardware', date: '2025-02-01T12:00:00.000Z' }),
    article({ id: 'jiny-4', category: 'Vesmír', date: '2025-04-01T12:00:00.000Z' }),
    current,
    article({ id: 'jiny-1', category: 'Mobily', date: '2025-01-01T12:00:00.000Z' }),
    article({ id: 'jiny-3', category: 'Software', date: '2025-03-01T12:00:00.000Z' }),
  ];

  assert.deepEqual(await selectRelated(current, entries), [
    'jiny-4',
    'jiny-3',
    'jiny-2',
  ]);
});
