import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const og = path.join(root, 'public/og-default.jpg');
const generator = readFileSync(path.join(root, 'scripts/generate-og-default.mjs'), 'utf8');

test('og-default.jpg je 1200×630 JPEG, ne černá horor karta', async () => {
  const meta = await sharp(og).metadata();
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  assert.ok(statSync(og).size > 8_000, 'soubor je podezřele malý');
});

test('průměr kanálu og-default.jpg je světlý (> 180), ať zase nesklouzne do černé', async () => {
  const { data, info } = await sharp(og)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  let r = 0;
  let g = 0;
  let b = 0;
  let dark = 0;
  for (let i = 0; i < n; i++) {
    const rr = data[i * 3];
    const gg = data[i * 3 + 1];
    const bb = data[i * 3 + 2];
    r += rr;
    g += gg;
    b += bb;
    if (0.2126 * rr + 0.7152 * gg + 0.0722 * bb < 40) dark++;
  }
  const meanR = r / n;
  const meanG = g / n;
  const meanB = b / n;
  const mean = (r + g + b) / (n * 3);
  assert.ok(meanR > 180, `mean R ${meanR.toFixed(1)} — karta není světlá`);
  assert.ok(meanG > 180, `mean G ${meanG.toFixed(1)} — karta není světlá`);
  assert.ok(meanB > 180, `mean B ${meanB.toFixed(1)} — karta není světlá`);
  assert.ok(mean > 180, `mean kanál ${mean.toFixed(1)} — černá karta by prošla pod 50`);
  assert.ok((dark / n) * 100 < 8, `${((dark / n) * 100).toFixed(1)} % skoro černých pixelů`);
});

test('generátor je Sharp/SVG s tokeny webu, ne černá výplň a ne AI prompt', () => {
  assert.match(generator, /#F6F7F9/, 'pozadí musí být --bg');
  assert.match(generator, /#14171C/, 'REAL musí být --ink');
  assert.match(generator, /#D42622/, 'TECH musí být --signal');
  assert.match(generator, /#4A515C/, 'CZ a slogan musí být --ink-soft');
  assert.match(generator, /IBM Plex Mono/, 'slogan a CZ patří do IBM Plex Mono');
  assert.match(generator, /TECH BEZ MARKETINGOVÝCH ŘEČÍ/);
  assert.match(generator, /realtech\.cz – novinky a analýzy/);
  assert.match(generator, /from 'sharp'/);
  assert.match(generator, /<svg /);
  assert.doesNotMatch(generator, /fill=["']#0[dD]0707["']/);
  assert.doesNotMatch(generator, /fill=["']#000(?:000)?["']/);
  assert.doesNotMatch(generator, /openai|dall-e|imagen|generateImage/i);
});
