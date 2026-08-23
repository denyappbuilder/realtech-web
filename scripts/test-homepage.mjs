import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

import './test-homepage-register.mjs';
import snapshot from './test-homepage-mocks/videos-snapshot.mjs';
import {
  getHomepageMockState,
  resetHomepageMocks,
  setCollection,
} from './test-homepage-mocks/state.mjs';

const FIXED_NOW = new Date('2026-01-20T12:00:00.000Z');
let fixtureNumber = 0;

function article({
  id,
  date,
  category,
  draft = false,
  evergreen = false,
  featured = false,
}) {
  return {
    id,
    data: {
      title: `Titulek ${id}`,
      description: `Popis ${id}`,
      date: new Date(date),
      category,
      draft,
      evergreen,
      featured,
    },
  };
}

function rssResponse(xml, ok = true) {
  return {
    ok,
    async text() {
      return xml;
    },
  };
}

async function executeHomepage(t, collection, fetchImplementation) {
  t.mock.timers.enable({ apis: ['Date'], now: FIXED_NOW });
  t.mock.method(globalThis, 'fetch', fetchImplementation);
  setCollection(collection);
  fixtureNumber += 1;

  const homepage = await import(
    `../src/pages/index.astro?homepage-test=${fixtureNumber}`
  );
  return homepage.default(
    {
      createAstro() {
        return { site: new URL('https://realtech.cz/') };
      },
    },
    {},
    {},
  );
}

beforeEach(() => {
  resetHomepageMocks();
});

test('frontmatter vynechá draft, řadí sestupně a odvodí hero, rest, průvodce a kategorie', async (t) => {
  const entries = [
    article({ id: 'stary-featured', date: '2025-12-20T00:00:00Z', category: 'Sítě', featured: true }),
    article({ id: 'pruvodce-ctvrty', date: '2026-01-11T00:00:00Z', category: 'Vesmír', evergreen: true }),
    article({ id: 'nejnovejsi', date: '2026-01-19T00:00:00Z', category: 'Hardware' }),
    article({ id: 'aktivni-featured', date: '2026-01-10T12:00:00Z', category: 'AI Report', featured: true }),
    article({ id: 'pruvodce-druhy', date: '2026-01-16T00:00:00Z', category: 'Hardware', evergreen: true }),
    article({ id: 'draft', date: '2026-12-31T00:00:00Z', category: 'Mobily', draft: true, evergreen: true, featured: true }),
    article({ id: 'pruvodce-prvni', date: '2026-01-18T00:00:00Z', category: 'Sítě', evergreen: true }),
    article({ id: 'bez-priznaku', date: '2026-01-15T00:00:00Z', category: 'Drony' }),
    article({ id: 'pruvodce-treti', date: '2026-01-14T00:00:00Z', category: 'AI Report', evergreen: true }),
  ];

  const result = await executeHomepage(
    t,
    entries,
    async () => rssResponse('<feed></feed>'),
  );

  assert.deepEqual(result.all.map(({ id }) => id), [
    'nejnovejsi',
    'pruvodce-prvni',
    'pruvodce-druhy',
    'bez-priznaku',
    'pruvodce-treti',
    'pruvodce-ctvrty',
    'aktivni-featured',
    'stary-featured',
  ]);
  assert.equal(result.hero.id, 'aktivni-featured');
  assert.deepEqual(result.candidates.map(({ id }) => id), [
    'nejnovejsi',
    'pruvodce-prvni',
    'pruvodce-druhy',
    'bez-priznaku',
    'pruvodce-treti',
    'pruvodce-ctvrty',
    'stary-featured',
  ]);
  assert.deepEqual(result.rail.map(({ id }) => id), [
    'nejnovejsi',
    'pruvodce-prvni',
    'pruvodce-druhy',
  ]);
  assert.deepEqual(result.rest.map(({ id }) => id), [
    'bez-priznaku',
    'pruvodce-treti',
    'pruvodce-ctvrty',
    'stary-featured',
  ]);
  assert.deepEqual(result.pruvodci.map(({ id }) => id), [
    'pruvodce-prvni',
    'pruvodce-druhy',
    'pruvodce-treti',
  ]);
  assert.deepEqual(result.categories, [
    'Hardware',
    'Sítě',
    'Drony',
    'AI Report',
    'Vesmír',
  ]);
  assert.equal(result.all.some(({ id }) => id === 'draft'), false);

  const state = getHomepageMockState();
  assert.equal(state.collectionCalls.length, 1);
  assert.equal(state.collectionCalls[0].name, 'clanky');
});

test('featured starší než čtrnáct dní nepřebije nejnovější článek v hero', async (t) => {
  const result = await executeHomepage(
    t,
    [
      article({ id: 'stary-featured', date: '2026-01-06T11:59:59.999Z', category: 'Sítě', featured: true }),
      article({ id: 'nejnovejsi', date: '2026-01-20T11:00:00.000Z', category: 'Hardware' }),
      article({ id: 'dalsi', date: '2026-01-18T00:00:00.000Z', category: 'Drony' }),
    ],
    async () => rssResponse('<feed></feed>'),
  );

  assert.equal(result.hero.id, 'nejnovejsi');
  assert.deepEqual(result.rail.map(({ id }) => id), ['dalsi', 'stary-featured']);
  assert.deepEqual(result.rest.map(({ id }) => id), []);
});

test('použitelný YouTube RSS odfiltruje Shorts, omezí videa a dekóduje XML entity', async (t) => {
  const xml = `
    <feed>
      <entry><yt:videoId>aaaaaaaaaaa</yt:videoId><title>Alpha &amp; Beta &lt;C&gt; &quot;Q&quot; &#39;X&#39;</title></entry>
      <entry><yt:videoId>bbbbbbbbbbb</yt:videoId><title>#Shorts: přeskočit</title></entry>
      <entry><yt:videoId>ccccccccccc</yt:videoId><title>Druhé běžné video</title></entry>
      <entry><title>Bez ID</title></entry>
      <entry><yt:videoId>ddddddddddd</yt:videoId><title>Třetí běžné video</title></entry>
      <entry><yt:videoId>eeeeeeeeeee</yt:videoId><title>Čtvrté běžné video</title></entry>
    </feed>
  `;
  const fetchCalls = [];

  const result = await executeHomepage(t, [], async (...args) => {
    fetchCalls.push(args);
    return rssResponse(xml);
  });

  assert.deepEqual(result.videos, [
    { id: 'aaaaaaaaaaa', title: 'Alpha & Beta <C> "Q" \'X\'' },
    { id: 'ccccccccccc', title: 'Druhé běžné video' },
    { id: 'ddddddddddd', title: 'Třetí běžné video' },
  ]);
  assert.equal(fetchCalls.length, 1);
  assert.equal(
    fetchCalls[0][0],
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCwWvw3SkWgfDinhnAHpceeA',
  );
  assert.ok(fetchCalls[0][1].signal instanceof AbortSignal);
});

test('nepoužitelný nebo chybový YouTube RSS vždy použije lokální snapshot', async (t) => {
  const cases = [
    ['HTTP chyba', async () => rssResponse('', false)],
    ['prázdný feed', async () => rssResponse('<feed></feed>')],
    ['jen Shorts', async () => rssResponse('<entry><yt:videoId>sssssssssss</yt:videoId><title>SHORTS ukázka</title></entry>')],
    ['chyba fetch', async () => { throw new Error('síť není dostupná'); }],
  ];

  for (const [description, fetchImplementation] of cases) {
    await t.test(description, async (subtest) => {
      resetHomepageMocks();
      const result = await executeHomepage(subtest, [], fetchImplementation);
      assert.deepEqual(result.videos, snapshot);
    });
  }
});
