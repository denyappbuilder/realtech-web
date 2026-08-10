import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

import { optimizeImages } from './optimize-images.mjs';

const derivativeNames = ['cover-640.jpg', 'cover.webp', 'cover-640.webp'];

function snapshots(dir) {
  return derivativeNames.map((file) => {
    const output = path.join(dir, file);
    return {
      digest: createHash('sha256').update(fs.readFileSync(output)).digest('hex'),
      mtimeNs: fs.statSync(output, { bigint: true }).mtimeNs,
    };
  });
}

async function writeSource(file, background) {
  await sharp({
    create: {
      width: 800,
      height: 450,
      channels: 3,
      background,
    },
  }).jpeg({ quality: 90 }).toFile(file);
}

test('změna zdrojového JPG obnoví všechny deriváty a další běh je idempotentní', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'cover.jpg');

  await writeSource(source, '#d71920');
  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 3 });
  const initial = snapshots(dir);

  await writeSource(source, '#0057b8');
  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 3 });
  const refreshed = snapshots(dir);

  for (const [index, derivative] of derivativeNames.entries()) {
    assert.notEqual(
      refreshed[index].digest,
      initial[index].digest,
      `${derivative} musí odpovídat změněnému zdroji`,
    );
  }

  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 0 });
  assert.deepEqual(snapshots(dir), refreshed);
});
