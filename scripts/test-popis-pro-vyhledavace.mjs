import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LIMIT_POPISU,
  popisProVyhledavace,
} from '../src/lib/popis-pro-vyhledavace.js';

test('výchozí limit 160 znaků je včetně a první znak nad ním se neztratí potichu', () => {
  const presneNaLimitu = 'x'.repeat(160);
  const nadLimitem = 'x'.repeat(161);

  assert.equal(LIMIT_POPISU, 160);
  assert.equal(popisProVyhledavace(presneNaLimitu), presneNaLimitu);
  assert.equal(popisProVyhledavace(presneNaLimitu).length, 160);
  assert.equal(popisProVyhledavace(nadLimitem), `${'x'.repeat(159)}…`);
  assert.equal(popisProVyhledavace(nadLimitem).length, 160);
});

test('nad limitem zachová až poslední celou větu, která se ještě vejde', () => {
  const prvni = `${'A'.repeat(50)}?`;
  const druha = `${'B'.repeat(50)}!`;
  const treti = `${'C'.repeat(50)}.`;
  const nevejdeSe = `${'D'.repeat(10)}.`;
  const vstup = `${prvni} ${druha} ${treti} ${nevejdeSe}`;
  const ocekavany = `${prvni} ${druha} ${treti}`;
  const vysledek = popisProVyhledavace(vstup);

  assert.equal(vstup.length, 167);
  assert.equal(ocekavany.length, 155);
  assert.equal(vysledek, ocekavany);
  assert.match(vysledek, /\? .+! .+\.$/);
  assert.doesNotMatch(vysledek, /D|…/);
});

test('jednu dlouhou větu zkrátí na poslední vhodné mezeře a nepřesekne slovo', () => {
  const prvniSlovo = 'A'.repeat(55);
  const vstup = `${prvniSlovo} pokracovani dlouhe vety.`;
  const ocekavany = `${prvniSlovo}…`;

  assert.equal(popisProVyhledavace(vstup, 60), ocekavany);
  assert.equal(ocekavany.length, 56);
  assert.doesNotMatch(popisProVyhledavace(vstup, 60), /pok/);
});

test('bez vhodné mezery využije celý limit, ale text označí výpustkou', () => {
  const vstup = 'x'.repeat(80);
  const ocekavany = `${'x'.repeat(59)}…`;

  assert.equal(popisProVyhledavace(vstup, 60), ocekavany);
  assert.equal(ocekavany.length, 60);
});

test('prázdný, chybějící a pouze bílý vstup vrátí prázdný řetězec', () => {
  for (const vstup of [undefined, '', ' \n\t ']) {
    assert.equal(popisProVyhledavace(vstup), '', JSON.stringify(vstup));
  }
});
