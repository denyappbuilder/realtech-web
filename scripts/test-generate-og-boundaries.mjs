import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-og.mjs', import.meta.url));
const register = fileURLToPath(new URL('./test-generate-og-mocks/register.mjs', import.meta.url));

function runGenerator(t, title) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'realtech-og-boundaries-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/clanky/clanek.md'), `---
title: "${title}"
image: "/images/cover.jpg"
---
`);
  fs.writeFileSync(path.join(root, 'public/images/cover.jpg'), 'cover fixture\n');

  const stdout = execFileSync(process.execPath, ['--import', register, generator], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(stdout, /\[generate-og\] vygenerováno: 1/);

  return fs.readFileSync(path.join(root, 'sharp-composite.svg'), 'utf8');
}

function titleLines(svg) {
  return Array.from(
    svg.matchAll(/<text x="64" y="\d+"[^>]*font-size="50"[^>]*>(.*?)<\/text>/g),
    (match) => match[1],
  );
}

test('dlouhý OG titulek se zalomí nejvýše do tří řádků a poslední řádek se ořízne', (t) => {
  const svg = runGenerator(
    t,
    'Jedna dva tři čtyři pět šest sedm osm devět deset jedenáct dvanáct třináct čtrnáct patnáct',
  );

  assert.deepEqual(titleLines(svg), [
    'Jedna dva tři čtyři pět šest',
    'sedm osm devět deset jedenáct',
    'dvanáct třináct čtrnáct…',
  ]);
  assert.doesNotMatch(svg, /patnáct/);
});

test('OG titulek je před vložením do SVG bezpečně XML escapovaný', (t) => {
  const svg = runGenerator(t, 'Výzkum & <AI> > "bezpečný" titulek');

  assert.deepEqual(titleLines(svg), [
    'Výzkum &amp; &lt;AI&gt; &gt;',
    '&quot;bezpečný&quot; titulek',
  ]);
  assert.doesNotMatch(svg, /Výzkum & <AI>/);
  assert.doesNotMatch(svg, />"bezpečný" titul/);
});
