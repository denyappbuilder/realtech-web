import assert from 'node:assert/strict';
import test from 'node:test';
import { slugify } from '../src/lib/slugify.js';

test('všechny povolené kategorie mají přesný stabilní ASCII slug', () => {
  const categories = [
    ['AI Report', 'ai-report'],
    ['AI Agenti', 'ai-agenti'],
    ['Drony', 'drony'],
    ['Vesmír', 'vesmir'],
    ['Hardware', 'hardware'],
    ['Mobily', 'mobily'],
    ['Sítě', 'site'],
  ];

  for (const [category, expectedSlug] of categories) {
    const actual = slugify(category);

    assert.equal(actual, expectedSlug, category);
    assert.match(actual, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, category);
  }
});

test('odstraní českou diakritiku a převede různou velikost písmen', () => {
  const cases = [
    ['ŽLUŤOUČKÝ KŮŇ', 'zlutoucky-kun'],
    ['Česká Síť', 'ceska-sit'],
    ['vEsMíR', 'vesmir'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(slugify(input), expected, input);
  }
});

test('víceslovné názvy normalizuje přes různé běžné whitespace', () => {
  const cases = [
    ['AI   Agenti', 'ai-agenti'],
    ['AI\tReport', 'ai-report'],
    ['Umělá\ninteligence', 'umela-inteligence'],
    ['Mobilní\u00a0sítě', 'mobilni-site'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(slugify(input), expected, JSON.stringify(input));
  }
});

test('kanonicky ekvivalentní Unicode vstupy vytvoří stejný slug', () => {
  const composed = 'Sítě';
  const decomposed = 'Si\u0301te\u030c';

  assert.equal(slugify(composed), 'site');
  assert.equal(slugify(decomposed), 'site');
  assert.equal(slugify(composed), slugify(decomposed));
});

test('prázdný název zůstane prázdný', () => {
  assert.equal(slugify(''), '');
});
