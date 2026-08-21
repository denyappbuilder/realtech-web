import assert from 'node:assert/strict';
import fs from 'node:fs';
import { register } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

register('./test-fixtures/optimize-images-symlink-loader.mjs', import.meta.url);

const { optimizeImages } = await import('./optimize-images.mjs');
const { resetSharpCalls, sharpCalls } = await import(
  './test-fixtures/optimize-images-symlink-sharp.mjs'
);

const derivativeNames = (base) => [
  `${base}-640.jpg`,
  `${base}.webp`,
  `${base}-640.webp`,
];

test('symlinkovaný JPG mířící mimo vstup se nezpracuje', {
  todo: '[codex-testy-web/OPTIMIZE-SYMLINK-001]',
}, async (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-symlink-'));
  const inputDir = path.join(fixtureRoot, 'input');
  const regularSource = path.join(inputDir, 'regular.jpg');
  const externalSource = path.join(fixtureRoot, 'external.jpg');
  const symlinkSource = path.join(inputDir, 'external-link.jpg');

  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  fs.mkdirSync(inputDir);
  fs.writeFileSync(regularSource, 'regular fixture');
  fs.writeFileSync(externalSource, 'external fixture');
  fs.symlinkSync(externalSource, symlinkSource);
  resetSharpCalls();

  const result = await optimizeImages(inputDir);
  const calls = sharpCalls();

  assert.deepEqual({
    result,
    sharpSources: calls.map(({ source }) => source),
    regularDerivatives: derivativeNames('regular').map((name) => (
      fs.existsSync(path.join(inputDir, name))
    )),
    symlinkDerivatives: derivativeNames('external-link').map((name) => (
      fs.existsSync(path.join(inputDir, name))
    )),
  }, {
    result: { covers: 1, updated: 3 },
    sharpSources: [regularSource, regularSource, regularSource],
    regularDerivatives: [true, true, true],
    symlinkDerivatives: [false, false, false],
  });
});
