import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import test, { beforeEach } from 'node:test';

import {
  bothInputOrders,
  sameDateArticles,
  SAME_DATE_EXPECTED_IDS,
} from './test-fixtures/same-date-articles.mjs';

register('./test-temata-loader.mjs', import.meta.url);

const [
  { default: TemaPage },
  { getStaticPaths },
  { getStaticPaths: getStaticPathsStrana },
  { getMockState, resetTemataMocks, setCollection },
] = await Promise.all([
  import('../src/components/TemaPage.astro'),
  import('../src/pages/temata/[slug].astro'),
  import('../src/pages/temata/[slug]/strana/[page].astro'),
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

function reportSeries(count) {
  return Array.from({ length: count }, (_, index) => article({
    id: `report-${String(index + 1).padStart(2, '0')}`,
    category: 'AI Report',
    date: new Date(Date.UTC(2026, 0, count - index)),
    title: `Report ${index + 1}`,
  }));
}

async function evaluatePage(category, page = 1) {
  const result = {
    createAstro(_baseAstro, props) {
      return { props, site };
    },
  };

  return TemaPage(result, { category, page }, {});
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

test('téma do plné stránky (15 článků) nevytvoří žádnou /strana/ cestu', async () => {
  setCollection([
    ...reportSeries(15),
    article({ id: 'dron', category: 'Drony' }),
  ]);

  const paths = await getStaticPathsStrana();

  assert.deepEqual(paths, []);
});

test('téma s 37 články vytvoří strany 2 a 3 — nikdy stranu 1', async () => {
  setCollection([
    ...reportSeries(37),
    article({ id: 'dron', category: 'Drony' }),
    article({ id: 'draft-report', category: 'AI Report', draft: true }),
  ]);

  const paths = await getStaticPathsStrana();

  assert.deepEqual(paths, [
    { params: { slug: 'ai-report', page: '2' }, props: { category: 'AI Report', page: 2 } },
    { params: { slug: 'ai-report', page: '3' }, props: { category: 'AI Report', page: 3 } },
  ]);
  assert.equal(paths.find(({ params }) => params.page === '1'), undefined);
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

  const { clanky, articles, collectionLd } = await evaluatePage('AI Report');

  assert.deepEqual(clanky.map(({ id }) => id), [
    'nejnovejsi',
    'prostredni',
    'starsi',
  ]);
  assert.deepEqual(articles.map(({ id }) => id), clanky.map(({ id }) => id));
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

test('stránkování tématu: strana 2 nese karty 16+, pozice navazují a numberOfItems zůstává za celé téma', async () => {
  const entries = [
    ...reportSeries(37),
    article({ id: 'dron', category: 'Drony' }),
  ];

  setCollection(entries);
  const page1 = await evaluatePage('AI Report', 1);
  setCollection(entries);
  const page2 = await evaluatePage('AI Report', 2);
  setCollection(entries);
  const page3 = await evaluatePage('AI Report', 3);

  assert.equal(page1.totalPages, 3);
  assert.equal(page1.start, 0);
  assert.equal(page1.articles.length, 15);
  assert.equal(page1.collectionLd.url, 'https://realtech.cz/temata/ai-report/');

  assert.equal(page2.start, 15);
  assert.equal(page2.articles.length, 15);
  assert.deepEqual(page2.articles.map(({ id }) => id).slice(0, 2), ['report-16', 'report-17']);
  assert.equal(page2.collectionLd.url, 'https://realtech.cz/temata/ai-report/strana/2/');
  assert.equal(page2.collectionLd.name, 'AI Report – strana 2');
  assert.equal(page2.collectionLd.mainEntity.numberOfItems, 37);
  assert.deepEqual(page2.collectionLd.mainEntity.itemListElement[0], {
    '@type': 'ListItem',
    position: 16,
    url: 'https://realtech.cz/clanky/report-16/',
    name: 'Report 16',
  });

  assert.equal(page3.articles.length, 7);
  assert.equal(page3.collectionLd.mainEntity.itemListElement.at(-1).position, 37);
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

// Kolo 42: RTX Spark PC (AI Report) se v mřížce Hardware neobjeví, ale hub
// Hardware na něj odkazuje z kurátorovaného bloku „Souvisí s tématem“ —
// jen strana 1, jen když článek existuje a není draft, mřížka beze změny.
test('hub Hardware dostane cross-link na RTX Spark (AI Report) jen na straně 1; mřížka i další huby beze změny', async () => {
  const rtx = article({
    id: 'rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat',
    category: 'AI Report',
    date: new Date('2026-09-17T06:15:00.000Z'),
    title: 'RTX Spark PC s Windows v říjnu',
  });
  const hardware = Array.from({ length: 16 }, (_, i) => article({
    id: `hw-${String(i + 1).padStart(2, '0')}`,
    category: 'Hardware',
    date: new Date(Date.UTC(2026, 0, 16 - i)),
  }));
  setCollection([...hardware, rtx]);

  const page1 = await evaluatePage('Hardware');
  assert.deepEqual(page1.souvisi.map(({ id }) => id), [rtx.id]);
  assert.ok(!page1.articles.some(({ id }) => id === rtx.id), 'mřížka Hardware drží jen články kategorie Hardware');
  // Kolo 46: cross-link je na straně 1 opravdu vypsaný, tak patří i do ItemList —
  // za všechny články tématu (pozice 17 až za stranou 2), počet za téma + cross-linky.
  assert.equal(page1.collectionLd.mainEntity.numberOfItems, 17, 'JSON-LD počítá články tématu + cross-linky');
  assert.deepEqual(page1.collectionLd.mainEntity.itemListElement.at(-1), {
    '@type': 'ListItem', position: 17, url: `https://realtech.cz/clanky/${rtx.id}/`, name: rtx.data.title,
  });
  assert.equal(page1.collectionLd.mainEntity.itemListElement.length, 16, '15 karet strany 1 + 1 cross-link');

  const page2 = await evaluatePage('Hardware', 2);
  assert.deepEqual(page2.souvisi, [], 'strana 2 je pokračování mřížky, blok tam nepatří');

  const aiReport = await evaluatePage('AI Report');
  assert.deepEqual(aiReport.souvisi, [], 'AI Report článek už ve svém tématu je');

  setCollection([...hardware, { ...rtx, data: { ...rtx.data, draft: true } }]);
  const bezDraftu = await evaluatePage('Hardware');
  assert.deepEqual(bezDraftu.souvisi, [], 'draft se do bloku nedostane (getCollection ho odfiltruje)');
});

test('hub /temata/ kreslí náhled nejnovějšího článku, ne zeď prázdných karet', () => {
  const hub = readFileSync(new URL('../src/pages/temata/index.astro', import.meta.url), 'utf8');
  assert.match(hub, /from '\.\.\/\.\.\/lib\/karta-nahled\.js'/);
  assert.match(hub, /nahledKarty\(nejnovejsi\.data\.image\)/);
  assert.match(hub, /<picture>/);
  assert.match(hub, /<img src=\{t\.nahled\.lcpSrc\}/);
  assert.match(hub, /class="grid temata-hub"/, 'hub musí držet 16:9 náhledy v řadě');
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  assert.match(css, /\.temata-hub \.card-thumb \{[^}]*aspect-ratio:\s*16\s*\/\s*9/,
    'hub náhledy musí být 16:9, ať tituly v řadě sedí');
  const odkazy = hub.match(/<article class="card"[\s\S]*?<\/article>/)?.[0]?.match(/<a\s/g) ?? [];
  assert.equal(odkazy.length, 1, 'hub karta musí mít jediný <a>');
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
