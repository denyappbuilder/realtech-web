import assert from 'node:assert/strict';
import test from 'node:test';

import './test-article-chrono-register.mjs';

import { setCollection } from './test-article-chrono-mocks/state.mjs';

let fixtureNumber = 0;

function article(id, date, { draft = false } = {}) {
  return {
    id,
    data: {
      date: new Date(date),
      draft,
    },
  };
}

async function navigate(currentId, entries) {
  setCollection(entries);
  globalThis.Astro = { props: { article: { id: currentId } } };
  fixtureNumber += 1;

  const { chrono, newer, older } = await import(
    `../src/pages/clanky/[...id].astro?chrono-test=${fixtureNumber}`
  );

  return {
    chronology: chrono.map(({ id }) => id),
    newer: newer?.id ?? null,
    older: older?.id ?? null,
  };
}

test('chronologie vyřadí drafty, nezávisle seřadí vstup a propojí prostřední článek', async () => {
  const entries = [
    article('nejstarsi', '2024-01-05T08:00:00.000Z'),
    article('draft-nejnovejsi', '2030-12-31T08:00:00.000Z', { draft: true }),
    article('nejnovejsi', '2026-07-20T08:00:00.000Z'),
    article('prostredni', '2025-03-12T08:00:00.000Z'),
    article('draft-mezi', '2025-12-24T08:00:00.000Z', { draft: true }),
  ];

  assert.deepEqual(await navigate('prostredni', entries), {
    chronology: ['nejnovejsi', 'prostredni', 'nejstarsi'],
    newer: 'nejnovejsi',
    older: 'nejstarsi',
  });
});

test('shodné datum skutečných článků má deterministické novější/starší sousedy v obou pořadích vstupu', async () => {
  const chatgpt = article('chatgpt-pro-teenagery', '2026-08-18T00:00:00.000Z');
  const starship = article('starship-ship-40-vanocni-ostrov', '2026-08-18T00:00:00.000Z');
  const newer = article('novejsi', '2026-08-19T00:00:00.000Z');
  const older = article('starsi', '2026-08-17T00:00:00.000Z');

  for (const tiedArticles of [[chatgpt, starship], [starship, chatgpt]]) {
    const entries = [older, ...tiedArticles, newer];

    assert.deepEqual(await navigate('chatgpt-pro-teenagery', entries), {
      chronology: [
        'novejsi',
        'chatgpt-pro-teenagery',
        'starship-ship-40-vanocni-ostrov',
        'starsi',
      ],
      newer: 'novejsi',
      older: 'starship-ship-40-vanocni-ostrov',
    });
    assert.deepEqual(await navigate('starship-ship-40-vanocni-ostrov', entries), {
      chronology: [
        'novejsi',
        'chatgpt-pro-teenagery',
        'starship-ship-40-vanocni-ostrov',
        'starsi',
      ],
      newer: 'chatgpt-pro-teenagery',
      older: 'starsi',
    });
  }
});

test('nejnovější článek nemá novějšího souseda', async () => {
  const entries = [
    article('nejstarsi', '2024-01-05T08:00:00.000Z'),
    article('nejnovejsi', '2026-07-20T08:00:00.000Z'),
    article('prostredni', '2025-03-12T08:00:00.000Z'),
  ];

  assert.deepEqual(await navigate('nejnovejsi', entries), {
    chronology: ['nejnovejsi', 'prostredni', 'nejstarsi'],
    newer: null,
    older: 'prostredni',
  });
});

test('nejstarší článek nemá staršího souseda', async () => {
  const entries = [
    article('prostredni', '2025-03-12T08:00:00.000Z'),
    article('nejstarsi', '2024-01-05T08:00:00.000Z'),
    article('nejnovejsi', '2026-07-20T08:00:00.000Z'),
  ];

  assert.deepEqual(await navigate('nejstarsi', entries), {
    chronology: ['nejnovejsi', 'prostredni', 'nejstarsi'],
    newer: 'prostredni',
    older: null,
  });
});

test('chybějící aktuální ID bezpečně vrátí oba sousedy jako null', async () => {
  const entries = [
    article('starsi', '2024-01-05T08:00:00.000Z'),
    article('novejsi', '2026-07-20T08:00:00.000Z'),
  ];

  assert.deepEqual(await navigate('neni-v-kolekci', entries), {
    chronology: ['novejsi', 'starsi'],
    newer: null,
    older: null,
  });
});
