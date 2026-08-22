import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { youtubeId } from '../src/lib/youtube.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const STARY_REGEX = /(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/;

const PLATNE = [
  'https://www.youtube.com/watch?v=AbC12_def-3',
  'https://youtu.be/AbC12_def-3',
  'https://www.youtube.com/shorts/AbC12_def-3',
  'https://www.youtube.com/embed/AbC12_def-3',
];

const NEPLATNE = [
  'https://youtu.be/AbC12_def-3X',
  'https://example.com/x?v=AbC12_def-3',
  'https://not-youtu.be/AbC12_def-3',
  'https://example.com/embed/AbC12_def-3',
  'https://example.com/?notv=AbC12_def-3',
];

test('Z1069: pět falešných URL nesmí vrátit ID', () => {
  for (const url of NEPLATNE) {
    assert.equal(youtubeId(url), undefined, url);
  }
});

test('Z1069: čtyři platné tvary vrátí celé 11znakové ID', () => {
  for (const url of PLATNE) {
    assert.equal(youtubeId(url), 'AbC12_def-3', url);
  }
});

test('Z1069: prázdný a rozbitý vstup je undefined', () => {
  assert.equal(youtubeId(undefined), undefined);
  assert.equal(youtubeId(''), undefined);
  assert.equal(youtubeId('není-url'), undefined);
});

test('Z1069: starý regex by tyhle vstupy pustil — past tedy kouše na reparátu', () => {
  for (const url of NEPLATNE) {
    assert.equal(
      url.match(STARY_REGEX)?.[1],
      'AbC12_def-3',
      `starý regex musí na ${url} pořád brát falešné ID, jinak past neměří`,
    );
  }
});

test('Z1069: detail i karta berou sdílený helper, ne kopii regexu', () => {
  const detail = readFileSync(
    path.join(REPOSITORY_ROOT, 'src/pages/clanky/[...id].astro'),
    'utf8',
  );
  const karta = readFileSync(
    path.join(REPOSITORY_ROOT, 'src/components/ArticleCard.astro'),
    'utf8',
  );

  assert.match(detail, /from '\.\.\/\.\.\/lib\/youtube\.js'/);
  assert.match(detail, /youtubeId\(video\)/);
  assert.doesNotMatch(detail, STARY_REGEX);

  assert.match(karta, /from '\.\.\/lib\/youtube\.js'/);
  assert.match(karta, /youtubeId\(video\)/);
  assert.doesNotMatch(karta, STARY_REGEX);
});
