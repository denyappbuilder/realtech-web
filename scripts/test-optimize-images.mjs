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

function fileState(file) {
  return {
    contents: fs.readFileSync(file),
    mtimeNs: fs.statSync(file, { bigint: true }).mtimeNs,
  };
}

async function writeSource(file, background, { width = 800, height = 450 } = {}) {
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background,
    },
  }).jpeg({ quality: 90 }).toFile(file);
}

async function derivativeMetadata(dir) {
  return Object.fromEntries(await Promise.all(derivativeNames.map(async (file) => {
    const { width, height, format } = await sharp(path.join(dir, file)).metadata();
    return [file, { width, height, format }];
  })));
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

test('deriváty dodrží rozměrový a formátový kontrakt pro nestandardní poměr stran', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-metadata-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  await writeSource(path.join(dir, 'cover.jpg'), '#6f42c1', { width: 731, height: 509 });
  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 3 });

  assert.deepEqual(await derivativeMetadata(dir), {
    'cover-640.jpg': { width: 640, height: 360, format: 'jpeg' },
    'cover.webp': { width: 731, height: 509, format: 'webp' },
    'cover-640.webp': { width: 640, height: 360, format: 'webp' },
  });
});

test('částečně zastaralý stav obnoví pouze chybějící a obsahově chybný derivát', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-partial-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'cover.jpg');
  const missing = path.join(dir, 'cover-640.jpg');
  const wrong = path.join(dir, 'cover.webp');

  await writeSource(source, '#198754', { width: 913, height: 527 });
  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 3 });

  const outputs = Object.fromEntries(derivativeNames.map((name) => [name, path.join(dir, name)]));
  const expectedContents = Object.fromEntries(
    derivativeNames.map((name) => [name, fs.readFileSync(outputs[name])]),
  );
  for (const output of Object.values(outputs)) {
    fs.utimesSync(output, 1_700_000_000, 1_700_000_000);
  }

  const beforeMissing = Object.fromEntries(
    derivativeNames.map((name) => [name, fileState(outputs[name])]),
  );
  fs.rmSync(missing);
  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 1 });

  for (const name of derivativeNames) {
    assert.deepEqual(fs.readFileSync(outputs[name]), expectedContents[name], `${name} má správný obsah`);
  }
  for (const name of ['cover.webp', 'cover-640.webp']) {
    assert.deepEqual(
      fileState(outputs[name]),
      beforeMissing[name],
      `${name} se při doplnění chybějícího derivátu nesmí přepsat ani změnit mtime`,
    );
  }

  for (const output of Object.values(outputs)) {
    fs.utimesSync(output, 1_700_000_000, 1_700_000_000);
  }
  const beforeWrong = Object.fromEntries(
    derivativeNames.map((name) => [name, fileState(outputs[name])]),
  );
  await sharp({
    create: {
      width: 913,
      height: 527,
      channels: 3,
      background: '#dc3545',
    },
  }).webp({ quality: 80 }).toFile(wrong);

  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 1 });

  for (const name of derivativeNames) {
    assert.deepEqual(fs.readFileSync(outputs[name]), expectedContents[name], `${name} má správný obsah`);
  }
  for (const name of ['cover-640.jpg', 'cover-640.webp']) {
    assert.deepEqual(
      fileState(outputs[name]),
      beforeWrong[name],
      `${name} se při opravě chybného derivátu nesmí přepsat ani změnit mtime`,
    );
  }
});

test('poškozený zdrojový JPG propaguje chybu a zachová existující deriváty', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-corrupt-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'cover.jpg');

  await writeSource(source, '#fd7e14');
  assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 3 });

  const derivativesBeforeFailure = Object.fromEntries(
    derivativeNames.map((name) => [name, fileState(path.join(dir, name))]),
  );
  fs.writeFileSync(source, Buffer.from('not-a-valid-jpeg', 'ascii'));

  await assert.rejects(optimizeImages(dir));

  for (const name of derivativeNames) {
    assert.deepEqual(
      fileState(path.join(dir, name)),
      derivativesBeforeFailure[name],
      `${name} se při selhání z poškozeného zdroje nesmí přepsat ani odstranit`,
    );
  }
});
