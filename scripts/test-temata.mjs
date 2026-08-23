import assert from 'node:assert/strict';
import { register } from 'node:module';
import test, { beforeEach } from 'node:test';

import {
  bothInputOrders,
  sameDateArticles,
  SAME_DATE_EXPECTED_IDS,
} from './test-fixtures/same-date-articles.mjs';

register('./test-temata-loader.mjs', import.meta.url);

const [{ default: TemataPage, getStaticPaths }, {
  getMockState,
  resetTemataMocks,
  setCollection,
}] = await Promise.all([
  import('../src/pages/temata/[slug].astro'),
  import('./test-temata-mocks/state.mjs'),
]);

const site = new URL('https://realtech.cz/');

function article({
  id,
  category,
  date = new Date('2026-01-01T00:00:00.000Z'),
  draft = false,
  title = id,
}) {
  return {
    id,
    data: { category, date, draft, title },
  };
}

async function evaluatePage(category) {
  const result = {
    createAstro(_baseAstro, props) {
      return { props, site };
    },
  };

  return TemataPage(result, { category }, {});
}

beforeEach(() => {
  resetTemataMocks();
});

test('getStaticPaths mapuje URL slug na přesnou frontmatter kategorii', async () => {
  setCollection([
    article({ id: 'report', category: 'AI Report' }),
    article({ id: 'agenti', category: 'AI Agenti' }),
    article({ id: 'drony', category: 'Drony' }),
    article({ id: 'vesmir', category: 'Vesmír' }),
    article({ id: 'hardware', category: 'Hardware' }),
    article({ id: 'mobily', category: 'Mobily' }),
    article({ id: 'site', category: 'Sítě' }),
    article({ id: 'druhy-report', category: 'AI Report' }),
  ]);

  const paths = await getStaticPaths();

  assert.deepEqual(paths, [
    { params: { slug: 'ai-report' }, props: { category: 'AI Report' } },
    { params: { slug: 'ai-agenti' }, props: { category: 'AI Agenti' } },
    { params: { slug: 'drony' }, props: { category: 'Drony' } },
    { params: { slug: 'vesmir' }, props: { category: 'Vesmír' } },
    { params: { slug: 'hardware' }, props: { category: 'Hardware' } },
    { params: { slug: 'mobily' }, props: { category: 'Mobily' } },
    { params: { slug: 'site' }, props: { category: 'Sítě' } },
  ]);
  assert.equal(getMockState().collectionCalls.length, 1);
  assert.equal(getMockState().collectionCalls[0].name, 'clanky');
});

test('getStaticPaths vynechá draft-only kategorii a nevytvoří cestu pro neznámý slug', async () => {
  setCollection([
    article({ id: 'publikovany', category: 'Hardware' }),
    article({ id: 'tajny', category: 'Tajné téma', draft: true }),
  ]);

  const paths = await getStaticPaths();

  assert.deepEqual(paths, [
    { params: { slug: 'hardware' }, props: { category: 'Hardware' } },
  ]);
  assert.equal(paths.find(({ params }) => params.slug === 'tajne-tema'), undefined);
  assert.equal(paths.find(({ params }) => params.slug === 'nezname-tema'), undefined);
});

test('stránka vybírá přesnou kategorii, vyřadí drafty a řadí sestupně podle data', async () => {
  setCollection([
    article({ id: 'jina-kategorie', category: 'AI Agenti', date: new Date('2026-12-31T00:00:00.000Z') }),
    article({ id: 'starsi', category: 'AI Report', date: new Date('2025-03-04T00:00:00.000Z') }),
    article({ id: 'draft', category: 'AI Report', date: new Date('2027-01-01T00:00:00.000Z'), draft: true }),
    article({ id: 'nejnovejsi', category: 'AI Report', date: new Date('2026-08-09T00:00:00.000Z') }),
    article({ id: 'odlisna-velikost', category: 'ai report', date: new Date('2026-10-01T00:00:00.000Z') }),
    article({ id: 'prostredni', category: 'AI Report', date: new Date('2026-01-02T00:00:00.000Z') }),
  ]);

  const { clanky, collectionLd } = await evaluatePage('AI Report');

  assert.deepEqual(clanky.map(({ id }) => id), [
    'nejnovejsi',
    'prostredni',
    'starsi',
  ]);
  assert.equal(collectionLd.mainEntity.numberOfItems, 3);
  assert.deepEqual(
    collectionLd.mainEntity.itemListElement.map(({ position, name }) => ({ position, name })),
    [
      { position: 1, name: 'nejnovejsi' },
      { position: 2, name: 'prostredni' },
      { position: 3, name: 'starsi' },
    ],
  );
  assert.deepEqual(
    getMockState().collectionCalls.map(({ name }) => name),
    ['clanky', 'clanky'],
  );
});

test('stránka kategorie řadí shodné datum stabilně podle ID bez ohledu na pořadí kolekce', async () => {
  const outputs = [];

  for (const entries of bothInputOrders(sameDateArticles(article))) {
    setCollection(entries);
    const { clanky } = await evaluatePage('AI Report');
    outputs.push(clanky.map(({ id }) => id));
  }

  assert.deepEqual(outputs[0], SAME_DATE_EXPECTED_IDS);
  assert.deepEqual(outputs[1], outputs[0]);
});

test('ostatní témata tiše zahodí draft-only kategorie, duplicity a aktuální kategorii', async () => {
  setCollection([
    article({ id: 'aktualni', category: 'Mobily' }),
    article({ id: 'hardware-1', category: 'Hardware' }),
    article({ id: 'hardware-2', category: 'Hardware' }),
    article({ id: 'site', category: 'Sítě' }),
    article({ id: 'draft-only', category: 'Neveřejné', draft: true }),
  ]);

  const { ostatni } = await evaluatePage('Mobily');

  assert.deepEqual(ostatni, ['Hardware', 'Sítě']);
});
