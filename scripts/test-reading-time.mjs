import assert from 'node:assert/strict';
import test from 'node:test';
import { readingTime } from '../src/lib/reading-time.js';

test('prázdný, vynechaný a whitespace vstup mají minimální dobu jedné minuty', () => {
  assert.equal(readingTime(), 1);
  assert.equal(readingTime(''), 1);
  assert.equal(readingTime(' \n\t  \r\n'), 1);
});

test('zaokrouhluje kolem půlminutové hranice při 180 slovech za minutu', () => {
  const justBelowNinetySeconds = Array(269).fill('slovo').join(' ');
  const exactlyNinetySeconds = Array(270).fill('slovo').join(' ');

  assert.equal(readingTime(justBelowNinetySeconds), 1);
  assert.equal(readingTime(exactlyNinetySeconds), 2);
});

test('vrací více minut pro delší čitelný text', () => {
  const twoMinutes = Array(360).fill('slovo').join(' ');
  const threeMinutes = Array(540).fill('slovo').join(' ');

  assert.equal(readingTime(twoMinutes), 2);
  assert.equal(readingTime(threeMinutes), 3);
});

test('obsah Markdown code fence se do čitelných slov nezapočítá', () => {
  const readableProse = Array(269).fill('text').join(' ');
  const fencedCode = Array(180).fill('nečitelné').join(' ');
  const markdown = `${readableProse}\n\n\`\`\`js\n${fencedCode}\n\`\`\``;

  assert.equal(readingTime(markdown), 1);
});

test('inline Markdown značky neubírají čitelná slova ani nepřidávají syntaxi', () => {
  const plainWords = Array(266).fill('text').join(' ');
  const formattedReadableWords = '**tučné** _zdůrazněné_ `kód`';
  const syntaxOnly = Array(12).fill('# > --- |').join('\n');
  const markdown = `${plainWords} ${formattedReadableWords}\n${syntaxOnly}`;

  // 266 běžných + 3 formátovaná čitelná slova = 269 slov, tedy stále 1 minuta.
  assert.equal(readingTime(markdown), 1);
});

test('u Markdown odkazu počítá text odkazu, ale ne jeho cíl ani title', () => {
  const plainWords = Array(267).fill('text').join(' ');
  const link =
    '[viditelný popisek](https://example.test/skryty-cil "skrytý popis cíle")';
  const markdown = `${plainWords} ${link}`;

  // 267 běžných + 2 viditelná slova odkazu = 269 slov.
  assert.equal(readingTime(markdown), 1);
});

test('HTML značky a atributy ignoruje, ale jejich čitelný obsah počítá', () => {
  const plainWords = Array(268).fill('text').join(' ');
  const html =
    '<span class="skrytá třída" aria-label="skrytý popis">viditelné</span>';
  const markdown = `${plainWords} ${html}`;

  // 268 běžných + 1 viditelné slovo uvnitř elementu = 269 slov.
  assert.equal(readingTime(markdown), 1);
});
