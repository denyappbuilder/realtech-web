import assert from 'node:assert/strict';
import test from 'node:test';
import './test-video-duration-register.mjs';

const pageUrl = new URL('../src/pages/clanky/[...id].astro', import.meta.url);
const site = new URL('https://realtech.cz/');
let importSequence = 0;

async function schemaDuration(videoLength) {
  globalThis.Astro = {
    props: {
      article: {
        id: 'test-video-duration',
        body: 'Deterministicky testovaci obsah.',
        data: {
          title: 'Test délky videa',
          description: 'Test převodu frontmatter do Schema.org.',
          category: 'Hardware',
          date: new Date('2026-01-15T00:00:00.000Z'),
          video: 'https://www.youtube.com/watch?v=abcdefghijk',
          videoLength,
        },
      },
    },
    site,
    url: new URL('/clanky/test-video-duration/', site),
  };

  importSequence += 1;
  const page = await import(`${pageUrl.href}?case=${importSequence}`);
  return page.videoLd.duration;
}

test('videoLength ve formátu MM:SS se převede do Schema.org duration', async () => {
  assert.equal(await schemaDuration('09:04'), 'PT9M4S');
  assert.equal(await schemaDuration('00:07'), 'PT0M7S');
  assert.equal(await schemaDuration('59:59'), 'PT59M59S');
});

test('videoLength ve formátu HH:MM:SS zachová hodiny, minuty i sekundy', async () => {
  assert.equal(await schemaDuration('01:02:03'), 'PT1H2M3S');
  assert.equal(await schemaDuration('10:00:09'), 'PT10H0M9S');
  assert.equal(await schemaDuration('01:59:59'), 'PT1H59M59S');
});

test('nečíselný segment nevytvoří Schema.org duration', async () => {
  assert.equal(await schemaDuration('12:xx'), undefined);
});

const regressionCases = [
  ['chybějící sekundový segment', '12'],
  ['chybějící minutový segment', ':30'],
  ['více než tři segmenty', '1:02:03:04'],
  ['sekundy mimo rozsah', '12:60'],
  ['minuty mimo rozsah v HH:MM:SS', '1:60:00'],
  ['záporné minuty', '-1:30'],
  ['záporné sekundy', '1:-30'],
];

for (const [description, videoLength] of regressionCases) {
  test.todo(
    `[codex-testy-web/VIDEO-DURATION-001] ${description} se odmítne`,
    async () => {
      assert.equal(await schemaDuration(videoLength), undefined, videoLength);
    },
  );
}
