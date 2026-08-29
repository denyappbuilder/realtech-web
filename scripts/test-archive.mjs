import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import test, { beforeEach } from 'node:test';

import {
  bothInputOrders,
  sameDateArticles,
  SAME_DATE_EXPECTED_IDS,
} from './test-fixtures/same-date-articles.mjs';

register('./test-archive-loader.mjs', import.meta.url);

const [{ default: ArchivePage }, {
  getMockState,
  resetArchiveMocks,
  setCollection,
}] = await Promise.all([
  import('../src/components/ArticleArchivePage.astro'),
  import('./test-archive-mocks/state.mjs'),
]);

const SITE = new URL('https://realtech.cz/');

function article({
  id,
  date,
  category,
  draft = false,
  title = `Titulek ${id}`,
}) {
  return {
    id,
    data: { title, category, date: new Date(date), draft },
  };
}

function publishedSeries(count) {
  return Array.from({ length: count }, (_, index) => article({
    id: `p${String(index + 1).padStart(2, '0')}`,
    date: `2026-03-${String(28 - index).padStart(2, '0')}T00:00:00.000Z`,
    category: index % 2 === 0 ? 'AI' : 'Drony',
    title: `Článek ${index + 1}`,
  }));
}

async function evaluateArchive(entries, page = 1) {
  setCollection(entries);
  return ArchivePage({
    createAstro(_baseAstro, props) {
      return { props, site: SITE };
    },
  }, { page }, {});
}

beforeEach(() => {
  resetArchiveMocks();
});

test('archiv požádá o clanky, vyfiltruje drafty a seřadí publikované články sestupně podle data', async () => {
  const result = await evaluateArchive([
    article({ id: 'starsi', date: '2024-03-02T00:00:00.000Z', category: 'AI' }),
    article({
      id: 'draft-nejnovejsi',
      date: '2027-01-01T00:00:00.000Z',
      category: 'Tajné',
      draft: true,
    }),
    article({ id: 'nejnovejsi', date: '2026-06-15T00:00:00.000Z', category: 'Drony' }),
    article({ id: 'prostredni', date: '2025-11-20T00:00:00.000Z', category: 'AI' }),
  ]);

  assert.deepEqual(result.all.map(({ id }) => id), [
    'nejnovejsi',
    'prostredni',
    'starsi',
  ]);
  assert.deepEqual(result.articles.map(({ id }) => id), [
    'nejnovejsi',
    'prostredni',
    'starsi',
  ]);
  assert.equal(result.all.some(({ id }) => id === 'draft-nejnovejsi'), false);
  assert.equal(getMockState().collectionCalls.length, 1);
  assert.equal(getMockState().collectionCalls[0].name, 'clanky');
});

test('archiv řadí shodné datum stabilně podle ID bez ohledu na pořadí kolekce', async () => {
  const outputs = [];

  for (const entries of bothInputOrders(sameDateArticles(article))) {
    const result = await evaluateArchive(entries);
    outputs.push(result.articles.map(({ id }) => id));
  }

  assert.deepEqual(outputs[0], SAME_DATE_EXPECTED_IDS);
  assert.deepEqual(outputs[1], outputs[0]);
});

test('kategorie odvodí pouze z publikovaných článků a každou vykreslí jednou', async () => {
  const result = await evaluateArchive([
    article({ id: 'ai-starsi', date: '2024-01-01T00:00:00.000Z', category: 'AI' }),
    article({ id: 'drony', date: '2025-05-01T00:00:00.000Z', category: 'Drony' }),
    article({ id: 'ai-novejsi', date: '2026-02-01T00:00:00.000Z', category: 'AI' }),
    article({
      id: 'draft-kategorie',
      date: '2027-03-01T00:00:00.000Z',
      category: 'Jen draft',
      draft: true,
    }),
  ]);

  assert.deepEqual(result.categories, ['AI', 'Drony']);
  assert.equal(result.categories.includes('Jen draft'), false);
});

test('JSON-LD ItemList používá pořadí archivu, souvislé pozice, kanonické URL a nepočítá drafty', async () => {
  const result = await evaluateArchive([
    article({
      id: 'treti',
      date: '2024-08-09T00:00:00.000Z',
      category: 'Hardware',
      title: 'Třetí článek',
    }),
    article({
      id: 'draft',
      date: '2028-12-31T00:00:00.000Z',
      category: 'Hardware',
      title: 'Draft článek',
      draft: true,
    }),
    article({
      id: 'prvni',
      date: '2026-04-05T00:00:00.000Z',
      category: 'AI',
      title: 'První článek',
    }),
    article({
      id: 'druhy',
      date: '2025-01-02T00:00:00.000Z',
      category: 'Drony',
      title: 'Druhý článek',
    }),
  ]);

  assert.equal(result.collectionLd.url, 'https://realtech.cz/clanky/');
  assert.equal(result.collectionLd.mainEntity.numberOfItems, 3);
  assert.deepEqual(result.collectionLd.mainEntity.itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      url: 'https://realtech.cz/clanky/prvni/',
      name: 'První článek',
    },
    {
      '@type': 'ListItem',
      position: 2,
      url: 'https://realtech.cz/clanky/druhy/',
      name: 'Druhý článek',
    },
    {
      '@type': 'ListItem',
      position: 3,
      url: 'https://realtech.cz/clanky/treti/',
      name: 'Třetí článek',
    },
  ]);
});

test('stránkování: numberOfItems je za všechny publikované, itemListElement jen za aktuální stranu', async () => {
  const entries = [
    article({
      id: 'draft-navic',
      date: '2027-12-01T00:00:00.000Z',
      category: 'Tajné',
      draft: true,
    }),
    ...publishedSeries(17),
  ];

  const page1 = await evaluateArchive(entries, 1);
  const page2 = await evaluateArchive(entries, 2);

  assert.equal(page1.totalPages, 2);
  assert.equal(page2.totalPages, 2);
  assert.equal(page1.start, 0);
  assert.equal(page2.start, 15);
  assert.equal(page1.all.length, 17);
  assert.equal(page2.all.length, 17);
  assert.deepEqual(page1.articles.map(({ id }) => id), publishedSeries(17).slice(0, 15).map(({ id }) => id));
  assert.deepEqual(page2.articles.map(({ id }) => id), ['p16', 'p17']);
  assert.equal(page1.collectionLd.mainEntity.numberOfItems, 17);
  assert.equal(page2.collectionLd.mainEntity.numberOfItems, 17);
  assert.equal(page1.collectionLd.mainEntity.itemListElement.length, 15);
  assert.equal(page2.collectionLd.url, 'https://realtech.cz/clanky/strana/2/');
  assert.deepEqual(page2.collectionLd.mainEntity.itemListElement, [
    {
      '@type': 'ListItem',
      position: 16,
      url: 'https://realtech.cz/clanky/p16/',
      name: 'Článek 16',
    },
    {
      '@type': 'ListItem',
      position: 17,
      url: 'https://realtech.cz/clanky/p17/',
      name: 'Článek 17',
    },
  ]);
  assert.deepEqual(
    page1.collectionLd.mainEntity.itemListElement.map(({ position }) => position),
    Array.from({ length: 15 }, (_, index) => index + 1),
  );
  assert.deepEqual(page1.categories, ['AI', 'Drony']);
  assert.deepEqual(page2.categories, ['AI', 'Drony']);
});

test('archiv drží H1 Všechny články a nenabízí klikací RSS', () => {
  const source = readFileSync(new URL('../src/components/ArticleArchivePage.astro', import.meta.url), 'utf8');
  assert.match(source, /<h1>Všechny články<\/h1>/);
  assert.doesNotMatch(source, /RSS →/);
  assert.doesNotMatch(source, /href="\/rss\.xml"/);
});

test('eager + fetchpriority=high má jen první karta strany 1, ne /clanky/strana/2+', () => {
  const source = readFileSync(new URL('../src/components/ArticleArchivePage.astro', import.meta.url), 'utf8');
  assert.match(
    source,
    /priority=\{page === 1 && index === 0\}/,
    'živě 29. 8. 2026 měly strany 2–6 eager/high na první kartě',
  );
  assert.doesNotMatch(
    source,
    /priority=\{index === 0\}/,
    'page === 1 musí být v podmínce, jinak strana 2+ zase stáhne LCP',
  );
});
