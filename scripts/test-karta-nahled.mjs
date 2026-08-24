import './test-karta-nahled-register.mjs';

import assert from 'node:assert/strict';
import test from 'node:test';

import { reset, setFiles } from './test-karta-nahled-mocks/state.mjs';

let fixtureNumber = 0;

async function loadThumbnail({
  category = 'Hardware',
  video,
  image,
  date = new Date('2026-01-15T00:00:00.000Z'),
  files = [],
} = {}) {
  reset();
  setFiles(files);
  globalThis.__KARTA_NAHLED__ = { category, video, image, date };
  fixtureNumber += 1;
  return import(
    `../src/components/ArticleCard.astro?karta-nahled=${fixtureNumber}`
  );
}

test('běžný JPG použije existující variantu 640 px a její WebP náhled', async () => {
  const image = '/images/clanky/cover.jpg';
  const thumbnail = await loadThumbnail({
    image,
    files: [
      'public/images/clanky/cover-640.jpg',
      'public/images/clanky/cover-640.webp',
    ],
  });

  assert.equal(thumbnail.localThumb, '/images/clanky/cover-640.jpg');
  assert.deepEqual([thumbnail.thumbW, thumbnail.thumbH], [640, 360]);
  assert.equal(thumbnail.thumbWebp, '/images/clanky/cover-640.webp');
  assert.equal(thumbnail.hasWebp, true);
});

test('JPG bez varianty 640 px použije původní obrázek a rozměry 1280 × 720', async () => {
  const image = '/images/clanky/cover.jpg';
  const thumbnail = await loadThumbnail({ image });

  assert.equal(thumbnail.localThumb, image);
  assert.equal(thumbnail.thumbUrl, image);
  assert.deepEqual([thumbnail.thumbW, thumbnail.thumbH], [1280, 720]);
});

test('platné tvary YouTube URL vyhrají nad obrázkem a použijí video náhled', async () => {
  const videoId = 'AbC12_def-3';
  const urls = [
    `https://youtu.be/${videoId}`,
    `https://www.youtube.com/watch?v=${videoId}`,
    `https://www.youtube.com/shorts/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
  ];

  for (const video of urls) {
    const thumbnail = await loadThumbnail({
      video,
      image: '/images/clanky/cover.jpg',
      files: ['public/images/clanky/cover-640.jpg'],
    });

    assert.equal(thumbnail.videoId, videoId, video);
    assert.equal(
      thumbnail.thumbUrl,
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      video,
    );
    assert.deepEqual([thumbnail.thumbW, thumbnail.thumbH], [1280, 720], video);
    assert.equal(thumbnail.thumbWebp, null, video);
  }
});

test('neplatné video ID a neznámý tvar URL zachovají současný fallback obrázku', async () => {
  const image = '/images/clanky/cover.jpg';
  for (const video of [
    'https://youtu.be/short-id',
    'https://www.youtube.com/video/AbC12_def-3',
  ]) {
    const thumbnail = await loadThumbnail({ video, image });

    assert.equal(thumbnail.videoId, undefined, video);
    assert.equal(thumbnail.thumbUrl, image, video);
    assert.deepEqual([thumbnail.thumbW, thumbnail.thumbH], [1280, 720], video);
  }
});

test('12znakové YouTube ID se nekrátí na cizí video [codex-testy-web/KARTA-NAHLED-002]', async () => {
  const image = '/images/clanky/cover.jpg';
  const longer = await loadThumbnail({
    video: 'https://youtu.be/AbC12_def-3X',
    image,
  });

  assert.equal(longer.videoId, undefined);
  assert.equal(longer.thumbUrl, image);
});

test('bez obrázku a videa nevznikne náhled ani WebP a výpočet nespadne', async () => {
  const thumbnail = await loadThumbnail();

  assert.equal(thumbnail.localThumb, undefined);
  assert.equal(thumbnail.thumbUrl, undefined);
  assert.equal(thumbnail.thumbWebp, null);
  assert.equal(Boolean(thumbnail.hasWebp), false);
});

// Ne-JPG nemá variantu 640 px: plný obrázek nesmí zmenšit layout a PNG se
// nesmí vydávat za WebP ve <source type="image/webp">.
test('ne-JPG obrázek zachová plné rozměry a správný typ [codex-testy-web/KARTA-NAHLED-001]', async () => {
  for (const image of [
    '/images/clanky/cover.png',
    '/images/clanky/cover.webp',
  ]) {
    const thumbnail = await loadThumbnail({
      image,
      files: [`public${image}`],
    });

    assert.equal(thumbnail.localThumb, image, image);
    assert.deepEqual([thumbnail.thumbW, thumbnail.thumbH], [1280, 720], image);

    if (image.endsWith('.png')) {
      assert.equal(thumbnail.hasWebp, false, image);
    }
  }
});

test('slugify odstraní z kategorie diakritiku a mezery převede na pomlčku', async () => {
  for (const [category, expected] of [
    ['Sítě', 'th-site'],
    ['Vesmír', 'th-vesmir'],
    ['AI Report', 'th-ai-report'],
  ]) {
    const thumbnail = await loadThumbnail({ category });
    assert.equal(thumbnail.thumbClass, expected, category);
  }
});
