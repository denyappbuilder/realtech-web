import assert from 'node:assert/strict';
import test from 'node:test';

import { chybaTvaruImage } from '../src/lib/image-cesta.js';

test('odmítá skutečný parent segment v Unix i Windows zápisu', () => {
  const traversalCesty = [
    '/images/clanky/../tajne.jpg',
    '/images/clanky/..\\tajne.jpg',
  ];

  for (const image of traversalCesty) {
    assert.equal(
      chybaTvaruImage(image),
      `image "${image}" nemá povolený tvar`,
      image,
    );
  }
});

test('povoluje jen prefix /images/clanky/', () => {
  assert.equal(chybaTvaruImage('/images/clanky/nahled.jpg'), null);

  for (const image of [
    'images/clanky/nahled.jpg',
    '/images/nahled.jpg',
    '/images/clanky-jine/nahled.jpg',
  ]) {
    assert.equal(
      chybaTvaruImage(image),
      `image "${image}" musí začínat /images/clanky/`,
      image,
    );
  }
});

test('prázdná a null hodnota znamenají chybějící volitelný obrázek', () => {
  assert.equal(chybaTvaruImage(''), null);
  assert.equal(chybaTvaruImage(null), null);
  assert.equal(chybaTvaruImage(undefined), null);
});

test(
  'povoluje dvě tečky uvnitř bezpečného názvu souboru [codex-testy-web/IMAGE-CESTA-001]',
  { todo: '[codex-testy-web/IMAGE-CESTA-001]' },
  () => {
    assert.equal(chybaTvaruImage('/images/clanky/nahled..final.jpg'), null);
  },
);
