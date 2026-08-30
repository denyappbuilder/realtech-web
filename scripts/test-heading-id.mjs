import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { asciiHeadingId, nextUniqueHeadingId } from '../src/lib/heading-id.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const configSrc = readFileSync(path.join(REPOSITORY_ROOT, 'astro.config.mjs'), 'utf8');
const clanekSrc = readFileSync(
  path.join(REPOSITORY_ROOT, 'src/pages/clanky/[...id].astro'),
  'utf8',
);

test('Z1064: ořez na 60 znacích nenechá pomlčku na konci', () => {
  const id = asciiHeadingId(`${'a'.repeat(59)} zaver`);
  assert.equal(id, 'a'.repeat(59));
  assert.equal(id.endsWith('-'), false);
  assert.equal(id.startsWith('-'), false);
});

test('Z1064: žádný slug nesmí začínat ani končit pomlčkou', () => {
  for (const vstup of [
    `${'a'.repeat(59)} zaver`,
    `- ${'b'.repeat(70)}`,
    `${'c'.repeat(70)} -`,
    'Příliš žluťoučký kůň: ceny, slevy & FAQ?!',
  ]) {
    const id = asciiHeadingId(vstup);
    assert.equal(id.startsWith('-'), false, vstup);
    assert.equal(id.endsWith('-'), false, vstup);
  }
  assert.equal(asciiHeadingId('a'.repeat(60)).length, 60);
  assert.equal(
    asciiHeadingId('Příliš žluťoučký kůň: ceny, slevy & FAQ?!'),
    'prilis-zlutoucky-kun-ceny-slevy-faq',
  );
});

test('Z1064: prázdný vstup po vyčištění zůstane prázdný', () => {
  assert.equal(asciiHeadingId('… ?! —'), '');
  assert.equal(asciiHeadingId(''), '');
});

test('Z1064: plugin i kotva v článku berou ořez PŘED čištěním okrajů', () => {
  assert.match(
    configSrc,
    /nextUniqueHeadingId\(asciiHeadingId\(text\(node\)\), seen\)/,
    'rehype plugin musí pouštět sdílený helper, ne kopii slugu',
  );
  assert.match(
    configSrc,
    /from '\.\/src\/lib\/heading-id\.js'/,
  );
  assert.doesNotMatch(
    configSrc,
    /\.replace\(\/\^-\|-\$\/g,\s*''\)\.slice\(0,\s*60\)/,
    'staré pořadí replace → slice nesmí zůstat v pluginu',
  );
  assert.match(
    clanekSrc,
    /from '\.\.\/\.\.\/lib\/heading-id\.js'/,
    'kotva v článku musí brát sdílený helper, ne druhou kopii slugu',
  );
  assert.match(
    clanekSrc,
    /nextUniqueHeadingId\(asciiHeadingId\(/,
    'kotva musí deduplikovat stejným helperem jako plugin (Z1207)',
  );
  assert.doesNotMatch(
    clanekSrc,
    /\.replace\(\/\^-\|-\$\/g,\s*''\)\.slice\(0,\s*60\)/,
    'staré pořadí nesmí zůstat v kotvě článku',
  );
  assert.match(
    clanekSrc,
    /scrollIntoView\([\s\S]{0,200}prefers-reduced-motion:\s*reduce/,
    'kotva nadpisu nesmí smooth-scrollovat při prefers-reduced-motion',
  );
});

test('Z1207: přípona jde ZA ořez, první výskyt zůstane bez čísla', () => {
  const seen = new Map();
  const dlouhy = `${'Kolik stojí realitní web v roce 2026 a co všechno je v ceně zahrnuto'}`;
  const druhy = `${'Kolik stojí realitní web v roce 2026 a co všechno je v ceně navíc'}`;
  const a = nextUniqueHeadingId(asciiHeadingId(dlouhy), seen);
  const b = nextUniqueHeadingId(asciiHeadingId(druhy), seen);
  assert.equal(a, 'kolik-stoji-realitni-web-v-roce-2026-a-co-vsechno-je-v-cene');
  assert.equal(b, 'kolik-stoji-realitni-web-v-roce-2026-a-co-vsechno-je-v-cene-1');
  assert.equal(a.length, 59);
  assert.ok(b.endsWith('-1'));
});
