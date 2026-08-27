import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

import './test-homepage-register.mjs';
import snapshot from './test-homepage-mocks/videos-snapshot.mjs';
import {
  getHomepageMockState,
  resetHomepageMocks,
  setCollection,
  setExistingFiles,
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
  image,
  video,
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
      image,
      video,
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
  assert.equal(result.hero.id, 'nejnovejsi');
  assert.deepEqual(result.candidates.map(({ id }) => id), [
    'pruvodce-prvni',
    'pruvodce-druhy',
    'bez-priznaku',
    'pruvodce-treti',
    'pruvodce-ctvrty',
    'aktivni-featured',
    'stary-featured',
  ]);
  assert.deepEqual(result.rail.map(({ id }) => id), [
    'pruvodce-prvni',
    'pruvodce-druhy',
    'bez-priznaku',
  ]);
  assert.deepEqual(result.rest.map(({ id }) => id), [
    'pruvodce-treti',
    'pruvodce-ctvrty',
    'aktivni-featured',
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

test('featured nepřebije nejnovější článek v hero, ani když je mladší než čtrnáct dní', async (t) => {
  const result = await executeHomepage(
    t,
    [
      article({ id: 'featured-vcera', date: '2026-01-19T00:00:00.000Z', category: 'Sítě', featured: true }),
      article({ id: 'nejnovejsi', date: '2026-01-20T11:00:00.000Z', category: 'Hardware' }),
      article({ id: 'dalsi', date: '2026-01-18T00:00:00.000Z', category: 'Drony' }),
    ],
    async () => rssResponse('<feed></feed>'),
  );

  assert.equal(result.hero.id, 'nejnovejsi');
  assert.deepEqual(result.rail.map(({ id }) => id), ['featured-vcera', 'dalsi']);
  assert.deepEqual(result.rest.map(({ id }) => id), []);
});

// ---------------------------------------------------------------------------
// Hero obrázek — video článek s lokálním coverem nesmí tahat YT maxresdefault
// (~170 KB JPEG), když v public/ leží -640.webp z #335. YT jen jako fallback.
// ---------------------------------------------------------------------------

test('video hero s lokálním coverem používá lokální <picture> cestu, ne YT maxres', async (t) => {
  setExistingFiles([
    'public/images/clanky/video-hero.jpg',
    'public/images/clanky/video-hero-640.jpg',
    'public/images/clanky/video-hero.webp',
    'public/images/clanky/video-hero-640.webp',
  ]);
  const result = await executeHomepage(
    t,
    [article({
      id: 'video-hero',
      date: '2026-01-19T00:00:00Z',
      category: 'AI Report',
      image: '/images/clanky/video-hero.jpg',
      video: 'https://youtu.be/BvVMyDzjY7o',
    })],
    async () => rssResponse('<feed></feed>'),
  );

  assert.equal(result.heroVideoId, 'BvVMyDzjY7o');
  assert.equal(result.heroThumb, '/images/clanky/video-hero.jpg');
  assert.equal(
    result.heroSrcset,
    '/images/clanky/video-hero-640.jpg 640w, /images/clanky/video-hero.jpg 1280w',
  );
  assert.equal(
    result.heroWebpSrcset,
    '/images/clanky/video-hero-640.webp 640w, /images/clanky/video-hero.webp 1280w',
  );
  // Preload musí mířit na tentýž WebP, který si <picture> vybere.
  assert.equal(result.heroPreload.href, '/images/clanky/video-hero.webp');
  assert.equal(result.heroPreload.type, 'image/webp');
});

test('video hero bez lokálního coveru padá na YT maxresdefault', async (t) => {
  const result = await executeHomepage(
    t,
    [article({
      id: 'video-bez-coveru',
      date: '2026-01-19T00:00:00Z',
      category: 'AI Report',
      video: 'https://youtu.be/BvVMyDzjY7o',
    })],
    async () => rssResponse('<feed></feed>'),
  );

  assert.equal(result.heroThumb, 'https://i.ytimg.com/vi/BvVMyDzjY7o/maxresdefault.jpg');
  assert.equal(result.heroSrcset, undefined);
  assert.equal(result.heroWebpSrcset, undefined);
  assert.equal(result.heroPreload.href, 'https://i.ytimg.com/vi/BvVMyDzjY7o/maxresdefault.jpg');
});

test('frontmatter cover mimo disk nesmí video hero poslat na 404 — vyhraje YT maxresdefault', async (t) => {
  const result = await executeHomepage(
    t,
    [article({
      id: 'cover-mimo-disk',
      date: '2026-01-19T00:00:00Z',
      category: 'AI Report',
      image: '/images/clanky/neexistuje.jpg',
      video: 'https://youtu.be/BvVMyDzjY7o',
    })],
    async () => rssResponse('<feed></feed>'),
  );

  assert.equal(result.heroThumb, 'https://i.ytimg.com/vi/BvVMyDzjY7o/maxresdefault.jpg');
  assert.equal(result.heroSrcset, undefined);
  assert.equal(result.heroWebpSrcset, undefined);
});

test('hero bez videa se chová jako dřív — lokální obrázek a WebP jen s oběma variantami', async (t) => {
  setExistingFiles([
    'public/images/clanky/clanek-hero.jpg',
    'public/images/clanky/clanek-hero-640.jpg',
    'public/images/clanky/clanek-hero.webp',
  ]);
  const result = await executeHomepage(
    t,
    [article({
      id: 'clanek-hero',
      date: '2026-01-19T00:00:00Z',
      category: 'Hardware',
      image: '/images/clanky/clanek-hero.jpg',
    })],
    async () => rssResponse('<feed></feed>'),
  );

  assert.equal(result.heroVideoId, undefined);
  assert.equal(result.heroThumb, '/images/clanky/clanek-hero.jpg');
  assert.equal(
    result.heroSrcset,
    '/images/clanky/clanek-hero-640.jpg 640w, /images/clanky/clanek-hero.jpg 1280w',
  );
  // Bez -640.webp se WebP <source> nevyrenderuje — preload jde na JPG.
  assert.equal(result.heroWebpSrcset, undefined);
  assert.equal(result.heroPreload.href, '/images/clanky/clanek-hero.jpg');
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
