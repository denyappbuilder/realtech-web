import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCalendarDateCs, parseCalendarDate, parsePublishDate } from '../src/lib/calendarDate.js';

test('platná kalendářní data vrací přesnou půlnoc UTC', () => {
  const cases = [
    ['běžné datum', '2026-07-14', '2026-07-14T00:00:00.000Z'],
    ['rok nula', '0000-01-01', '0000-01-01T00:00:00.000Z'],
    ['rok 99', '0099-12-31', '0099-12-31T00:00:00.000Z'],
  ];

  for (const [description, input, expectedIso] of cases) {
    const actual = parseCalendarDate(input);

    assert.ok(actual instanceof Date, `${description}: očekáván objekt Date`);
    assert.equal(actual.toISOString(), expectedIso, description);
    assert.equal(actual.getUTCHours(), 0, description);
    assert.equal(actual.getUTCMinutes(), 0, description);
    assert.equal(actual.getUTCSeconds(), 0, description);
    assert.equal(actual.getUTCMilliseconds(), 0, description);
  }
});

test('přestupné roky respektují gregoriánské pravidlo včetně století', () => {
  const cases = [
    ['2000-02-29', '2000-02-29T00:00:00.000Z'],
    ['2024-02-29', '2024-02-29T00:00:00.000Z'],
    ['1900-02-29', undefined],
    ['2100-02-29', undefined],
  ];

  for (const [input, expected] of cases) {
    const actual = parseCalendarDate(input);

    if (expected === undefined) {
      assert.equal(actual, undefined, input);
    } else {
      assert.equal(actual?.toISOString(), expected, input);
    }
  }
});

test('odmítá neexistující dny a přetečení měsíců nebo dnů', () => {
  const invalidDates = [
    '2023-02-29',
    '2024-04-31',
    '2024-00-15',
    '2024-13-01',
    '2024-01-00',
    '2024-01-32',
  ];

  for (const input of invalidDates) {
    assert.equal(parseCalendarDate(input), undefined, input);
  }
});

test('vyžaduje přesný formát YYYY-MM-DD bez trimování a časové části', () => {
  const invalidFormats = [
    ' 2026-07-14',
    '2026-07-14 ',
    '2026-7-14',
    '26-07-14',
    '2026/07/14',
    '2026-07-14T00:00:00Z',
  ];

  for (const input of invalidFormats) {
    assert.equal(parseCalendarDate(input), undefined, JSON.stringify(input));
  }
});

test('parsePublishDate bere den i ISO čas; date-only je půlnoc UTC', () => {
  const den = parsePublishDate('2026-08-27');
  assert.equal(den?.toISOString(), '2026-08-27T00:00:00.000Z');

  const praha = parsePublishDate('2026-08-27T15:18:00+02:00');
  assert.equal(praha?.toISOString(), '2026-08-27T13:18:00.000Z');
  assert.ok(praha.valueOf() > den.valueOf(), 'čas vydání musí být později než date-only téhož dne');

  const utc = parsePublishDate('2026-08-27T13:18:00.000Z');
  assert.equal(utc?.toISOString(), '2026-08-27T13:18:00.000Z');

  assert.equal(formatCalendarDateCs(praha), '27. 08. 2026');
  assert.equal(formatCalendarDateCs(den), '27. 08. 2026');
});

test('parsePublishDate odmítne čas bez pásma, neplatný den i Date objekt', () => {
  for (const input of [
    '2026-08-27T15:18:00',
    '2026-08-27 15:18:00+02:00',
    '2026-08-27T25:00:00Z',
    '2025-02-29T12:00:00Z',
    '2026-08-27T15:18+02:00',
  ]) {
    assert.equal(parsePublishDate(input), undefined, input);
  }
  assert.equal(parsePublishDate(new Date('2026-08-27T13:18:00.000Z')), undefined);
});
