// Strukturovaná data a OG obrázek stránky článku (src/pages/clanky/[...id].astro).
//
// Proč právě tohle: NewsArticle, BreadcrumbList a VideoObject jsou jediné, co
// z článku čte Google pro rich results, a kaskáda `ogImage` rozhoduje, jaký
// náhled se ukáže na sítích. Ani jeden z těch výpočtů dosud NEPOKRÝVAL žádný
// test — 66 článků se generuje bez sítě pod nejvíc viditelným výstupem webu.
//
// Testy běží nad SKUTEČNÝM frontmatterem .astro souboru (viz
// test-clanek-jsonld-loader.mjs), takže nejsou kopií produkční logiky.
import assert from 'node:assert/strict';
import test from 'node:test';

import './test-clanek-jsonld-register.mjs';

import {
  dotazy,
  resetMocks,
  setCestu,
  setClanek,
  setExistujiciSoubory,
  setKolekce,
} from './test-clanek-jsonld-mocks/state.mjs';

const STRANKA = new URL('../src/pages/clanky/[...id].astro', import.meta.url).href;
let poradiFixture = 0;

function clanek({
  id = 'ukazka',
  title = 'Titulek článku',
  description = 'Popis článku.',
  category = 'Hardware',
  date = '2025-04-05',
  updated,
  video,
  videoLength,
  image,
  audio,
  body = 'Text článku.',
} = {}) {
  return {
    id,
    body,
    data: {
      title,
      description,
      category,
      date: new Date(`${date}T00:00:00.000Z`),
      updated: updated ? new Date(`${updated}T00:00:00.000Z`) : undefined,
      video,
      videoLength,
      image,
      audio,
      draft: false,
    },
  };
}

/**
 * Spustí frontmatter stránky nad fixture a vrátí jeho výsledky.
 *
 * Každá fixture dostane vlastní číslo, jinak by druhý import vrátil modul
 * z cache i s výsledky té první.
 */
async function nactiStranku({ article, soubory = [], cesta } = {}) {
  resetMocks();
  setClanek(article);
  setKolekce([article]);
  setExistujiciSoubory(soubory);
  setCestu(cesta ?? `/clanky/${article.id}/`);

  poradiFixture += 1;
  return import(`${STRANKA}?jsonld=${poradiFixture}`);
}

// ---------------------------------------------------------------------------
// Kaskáda OG obrázku: značkový OG → video → cover z frontmatteru → nic
// ---------------------------------------------------------------------------

test('značkový OG přebije YouTube náhled i cover — generuje se i pro video články', async () => {
  const { ogImage, jsonLd } = await nactiStranku({
    article: clanek({
      id: 'ukazka',
      video: 'https://www.youtube.com/watch?v=abcdefghijk',
      videoLength: '9:04',
      image: '/images/clanky/ukazka.jpg',
    }),
    soubory: ['public/images/og/ukazka.jpg', 'public/images/clanky/ukazka.jpg'],
  });

  assert.equal(ogImage, 'https://realtech.cz/images/og/ukazka.jpg');
  assert.deepEqual(jsonLd.image, ['https://realtech.cz/images/og/ukazka.jpg']);
  assert.deepEqual(dotazy(), ['public/images/og/ukazka.jpg']);
});

test('video článek bez značkového OG spadne na syrový YouTube maxresdefault', async () => {
  const { ogImage, jsonLd } = await nactiStranku({
    article: clanek({
      id: 'ukazka',
      video: 'https://www.youtube.com/watch?v=abcdefghijk',
      videoLength: '9:04',
      image: '/images/clanky/ukazka.jpg',
    }),
    soubory: ['public/images/clanky/ukazka.jpg'],
  });

  assert.equal(ogImage, 'https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg');
  assert.deepEqual(jsonLd.image, ['https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg']);
});

test('bez videa vyhraje značkový OG z /images/og/ nad coverem z frontmatteru', async () => {
  const { ogImage, jsonLd } = await nactiStranku({
    article: clanek({ id: 'ukazka', image: '/images/clanky/ukazka.jpg' }),
    soubory: ['public/images/og/ukazka.jpg', 'public/images/clanky/ukazka.jpg'],
  });

  assert.equal(ogImage, 'https://realtech.cz/images/og/ukazka.jpg');
  assert.deepEqual(jsonLd.image, ['https://realtech.cz/images/og/ukazka.jpg']);
  assert.deepEqual(dotazy(), ['public/images/og/ukazka.jpg']);
});

test('bez značkového OG se použije cover z frontmatteru absolutně', async () => {
  const { ogImage, jsonLd } = await nactiStranku({
    article: clanek({ id: 'ukazka', image: '/images/clanky/ukazka.jpg' }),
    soubory: ['public/images/clanky/ukazka.jpg'],
  });

  assert.equal(ogImage, 'https://realtech.cz/images/clanky/ukazka.jpg');
  assert.deepEqual(jsonLd.image, ['https://realtech.cz/images/clanky/ukazka.jpg']);
});

test('bez videa, OG i coveru zůstane ogImage prázdný a JSON-LD sáhne po /og-default.jpg', async () => {
  const { ogImage, jsonLd } = await nactiStranku({
    article: clanek({ id: 'ukazka' }),
  });

  assert.equal(ogImage, undefined);
  assert.deepEqual(
    jsonLd.image,
    ['https://realtech.cz/og-default.jpg'],
    'NewsArticle bez image pole Google odmítá — fallback musí zůstat',
  );
});

// ---------------------------------------------------------------------------
// NewsArticle
// ---------------------------------------------------------------------------

test('NewsArticle drží povinná pole, autory a vydavatele', async () => {
  const { jsonLd } = await nactiStranku({
    article: clanek({
      id: 'ukazka',
      title: 'Titulek článku',
      description: 'Popis článku.',
      date: '2025-04-05',
    }),
  });

  assert.equal(jsonLd['@context'], 'https://schema.org');
  assert.equal(jsonLd['@type'], 'NewsArticle');
  assert.equal(jsonLd.isAccessibleForFree, true, 'články jsou zdarma — Google to čte z NewsArticle');
  assert.equal(jsonLd.headline, 'Titulek článku');
  assert.equal(jsonLd.description, 'Popis článku.');
  assert.equal(jsonLd.inLanguage, 'cs');
  assert.equal(jsonLd.datePublished, '2025-04-05T00:00:00.000Z');
  assert.deepEqual(
    jsonLd.author.map(({ '@type': typ, name, url }) => [typ, name, url]),
    [
      ['Person', 'Daniel Soukup', 'https://realtech.cz/o-nas/'],
      ['Person', 'Sam', 'https://realtech.cz/o-nas/'],
    ],
  );
  assert.deepEqual(jsonLd.publisher, {
    '@type': 'Organization',
    name: 'REALTECH CZ',
    url: 'https://realtech.cz/',
    logo: {
      '@type': 'ImageObject',
      url: 'https://realtech.cz/apple-touch-icon.png',
      width: 180,
      height: 180,
    },
  });
});

test('dateModified bere updated, bez něj kopíruje datum vydání', async () => {
  const bezUpdated = await nactiStranku({
    article: clanek({ date: '2025-04-05' }),
  });
  assert.equal(bezUpdated.jsonLd.dateModified, '2025-04-05T00:00:00.000Z');

  const sUpdated = await nactiStranku({
    article: clanek({ date: '2025-04-05', updated: '2025-06-30' }),
  });
  assert.equal(sUpdated.jsonLd.datePublished, '2025-04-05T00:00:00.000Z');
  assert.equal(sUpdated.jsonLd.dateModified, '2025-06-30T00:00:00.000Z');
});

test('mainEntityOfPage staví na skutečné cestě stránky, ne na id článku', async () => {
  const { jsonLd } = await nactiStranku({
    article: clanek({ id: 'starlink-mini-test' }),
    cesta: '/clanky/starlink-mini-test/',
  });

  assert.equal(
    jsonLd.mainEntityOfPage,
    'https://realtech.cz/clanky/starlink-mini-test/',
  );
});

test('drobečky mají tři pozice a poslední nese kanonickou URL článku', async () => {
  const { breadcrumbLd } = await nactiStranku({
    article: clanek({ id: 'ukazka', title: 'Titulek článku' }),
    cesta: '/clanky/ukazka/',
  });

  assert.equal(breadcrumbLd['@type'], 'BreadcrumbList');
  assert.deepEqual(breadcrumbLd.itemListElement, [
    { '@type': 'ListItem', position: 1, name: 'Novinky', item: 'https://realtech.cz/' },
    { '@type': 'ListItem', position: 2, name: 'Články', item: 'https://realtech.cz/clanky/' },
    { '@type': 'ListItem', position: 3, name: 'Titulek článku', item: 'https://realtech.cz/clanky/ukazka/' },
  ]);
  const posledni = breadcrumbLd.itemListElement.at(-1);
  assert.equal(
    posledni.item,
    'https://realtech.cz/clanky/ukazka/',
    'poslední drobeček musí nést kanonickou URL stránky, jinak Search Console hlásí chybějící item',
  );
});

// ---------------------------------------------------------------------------
// VideoObject
// ---------------------------------------------------------------------------

test('VideoObject nese nocookie embed, watch URL a ISO trvání', async () => {
  const { videoLd } = await nactiStranku({
    article: clanek({
      title: 'Titulek článku',
      description: 'Popis článku.',
      date: '2025-04-05',
      video: 'https://youtu.be/abcdefghijk',
      videoLength: '1:02:03',
    }),
  });

  assert.equal(videoLd['@type'], 'VideoObject');
  assert.equal(videoLd.name, 'Titulek článku');
  assert.equal(videoLd.description, 'Popis článku.');
  assert.equal(videoLd.uploadDate, '2025-04-05T00:00:00.000Z');
  assert.equal(videoLd.duration, 'PT1H2M3S');
  assert.equal(videoLd.contentUrl, 'https://www.youtube.com/watch?v=abcdefghijk');
  assert.equal(videoLd.embedUrl, 'https://www.youtube-nocookie.com/embed/abcdefghijk');
  assert.deepEqual(videoLd.thumbnailUrl, [
    'https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg',
  ]);
  assert.equal(videoLd.inLanguage, 'cs');
});

test('cizí video adresa VideoObject nevyrobí a náhled spadne zpátky na cover [Z1069]', async () => {
  const { videoId, videoLd, ogImage } = await nactiStranku({
    article: clanek({
      id: 'ukazka',
      video: 'https://example.com/watch?v=abcdefghijk',
      videoLength: '9:04',
      image: '/images/clanky/ukazka.jpg',
    }),
    soubory: ['public/images/clanky/ukazka.jpg'],
  });

  assert.equal(videoId, undefined);
  assert.ok(
    !videoLd,
    'VideoObject s odkazem mimo YouTube by sliboval video, které se nikde nepřehraje',
  );
  assert.equal(ogImage, 'https://realtech.cz/images/clanky/ukazka.jpg');
});

test('neplatné videoLength nevyrobí rozbité trvání — klíč z JSON zmizí', async () => {
  const { videoLd } = await nactiStranku({
    article: clanek({
      video: 'https://www.youtube.com/watch?v=abcdefghijk',
      videoLength: '12:60',
    }),
  });

  assert.equal(videoLd.duration, undefined);
  assert.ok(
    !('duration' in JSON.parse(JSON.stringify(videoLd))),
    'raději VideoObject bez trvání než s hodnotou, které Google nerozumí',
  );
  assert.equal(videoLd.contentUrl, 'https://www.youtube.com/watch?v=abcdefghijk');
});

test('YouTube článek předpojí ytimg jen bez lokálního coveru, článek jen s xPosts/audiem ne', async () => {
  const youtube = await nactiStranku({
    article: clanek({
      video: 'https://www.youtube.com/watch?v=abcdefghijk',
      audio: {
        url: 'https://audio.realtech.cz/ukazka.mp3?v=1',
        duration: 90,
      },
    }),
  });
  assert.equal(youtube.preconnectYtimg, true, 'video bez coveru padá na i.ytimg.com/vi/ — preconnect patří');
  assert.equal(youtube.preconnectAudio, true, 'platné audio musí předpojit audio.realtech.cz');
  assert.equal(youtube.preconnectGiscus, false, 'jsonld fixture nemá PUBLIC_GISCUS_* — sekce se nevykreslí');

  const sCoverem = await nactiStranku({
    article: clanek({
      video: 'https://www.youtube.com/watch?v=abcdefghijk',
      image: '/images/clanky/starlink-v-cesku-pruvodce.jpg',
    }),
    soubory: [
      'public/images/clanky/starlink-v-cesku-pruvodce.jpg',
      'public/images/clanky/starlink-v-cesku-pruvodce.webp',
    ],
  });
  assert.equal(sCoverem.preconnectYtimg, false,
    'facade poster je lokální WebP — i.ytimg.com se nestahuje, preconnect je zbytečný TLS');

  const flight = await nactiStranku({
    article: clanek({
      id: 'starship-flight-14-super-heavy-static-fire',
      audio: {
        url: 'https://audio.realtech.cz/starship-flight-14-super-heavy-static-fire-nlm.mp3?v=e8a345e9046d',
        duration: 1351,
      },
    }),
  });
  assert.equal(flight.preconnectYtimg, false, 'Flight 14 nemá YouTube — ytimg preconnect by byl zbytečný TLS');
  assert.equal(flight.preconnectAudio, true, 'Flight 14 má mp3 přehrávač');

  const tichy = await nactiStranku({
    article: clanek({ id: 'bez-videa-i-audia' }),
  });
  assert.equal(tichy.preconnectYtimg, false);
  assert.equal(tichy.preconnectAudio, false);
  assert.equal(tichy.preconnectGiscus, false);
});
