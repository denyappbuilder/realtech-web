import test from 'node:test';
import assert from 'node:assert/strict';

import { slugify } from '../src/lib/slugify.js';

test('slugify převádí název kategorie do stabilního URL tvaru', () => {
  const cases = [
    ['AI Report', 'ai-report'],
    ['Vesmír', 'vesmir'],
    ['AI Agenti', 'ai-agenti'],
    ['Hardware & software', 'hardware-&-software'],
    ['Sítě/novinky', 'site/novinky'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(slugify(input), expected, `slugify(${JSON.stringify(input)})`);
  }
});
