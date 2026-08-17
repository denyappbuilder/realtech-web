import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { asciiHeadingId } from '../src/lib/heading-id.js';

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
    /asciiHeadingId\(text\(node\)\)/,
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
    /\.slice\(0,\s*60\)\.replace\(\/\^-\|-\$\/g,\s*''\)/,
    'kotva v článku musí ořezat PŘED odstraněním krajní pomlčky',
  );
  assert.doesNotMatch(
    clanekSrc,
    /\.replace\(\/\^-\|-\$\/g,\s*''\)\.slice\(0,\s*60\)/,
    'staré pořadí nesmí zůstat v kotvě článku',
  );
});
