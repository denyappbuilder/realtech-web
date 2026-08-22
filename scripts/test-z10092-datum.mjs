import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { formatCalendarDateCs, parseCalendarDate } from '../src/lib/calendarDate.js';

const SOUBORY = [
  'src/components/ArticleCard.astro',
  'src/pages/index.astro',
  'src/pages/clanky/[...id].astro',
];

test('KARTA-DATUM-001 / Z10092: viditelné datum v Los Angeles je stejný den jako datetime', () => {
  const puvodni = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  try {
    const d = parseCalendarDate('2026-08-19');
    assert.ok(d instanceof Date);
    const datetime = d.toISOString().slice(0, 10);
    const viditelne = formatCalendarDateCs(d);
    assert.equal(datetime, '2026-08-19');
    assert.match(viditelne, /19/);
    assert.doesNotMatch(viditelne, /18/);
  } finally {
    if (puvodni === undefined) delete process.env.TZ;
    else process.env.TZ = puvodni;
  }
});

test('Z10092: holé toLocaleDateString bez UTC v Los Angeles lže o den (past na starý kód)', () => {
  const puvodni = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  try {
    const d = parseCalendarDate('2026-08-19');
    const stare = d.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    assert.match(stare, /18/, 'starý vzorec musí v Pacificu ukázat 18. — jinak past nic neměří');
    assert.notEqual(stare, formatCalendarDateCs(d));
  } finally {
    if (puvodni === undefined) delete process.env.TZ;
    else process.env.TZ = puvodni;
  }
});

test('Z10092: čtyři místa formátují přes formatCalendarDateCs, ne holé toLocaleDateString', () => {
  for (const cesta of SOUBORY) {
    const src = fs.readFileSync(new URL(`../${cesta}`, import.meta.url), 'utf8');
    assert.match(src, /formatCalendarDateCs/, `${cesta} musí volat formatCalendarDateCs`);
    assert.doesNotMatch(
      src,
      /toLocaleDateString\(/,
      `${cesta} nesmí formátovat datum holým toLocaleDateString`,
    );
  }

  const lib = fs.readFileSync(new URL('../src/lib/calendarDate.js', import.meta.url), 'utf8');
  assert.match(lib, /timeZone:\s*['"]UTC['"]/, 'formatovač musí pinovat UTC');
});
