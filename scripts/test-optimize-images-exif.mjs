import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

import { optimizeImages } from './optimize-images.mjs';

const sourceWidth = 800;
const sourceHeight = 1200;
const orientations = [6, 8];
const derivatives = [
  { suffix: '-640.jpg', width: 640, height: 360, format: 'jpeg', quality: 80 },
  { suffix: '.webp', width: undefined, height: undefined, format: 'webp', quality: 80 },
  { suffix: '-640.webp', width: 640, height: 360, format: 'webp', quality: 78 },
];

function asymmetricPixels() {
  const colors = [
    [220, 20, 60],
    [255, 215, 0],
    [0, 128, 255],
    [40, 180, 90],
    [145, 70, 210],
    [245, 125, 30],
  ];
  const pixels = Buffer.alloc(sourceWidth * sourceHeight * 3);

  for (let y = 0; y < sourceHeight; y++) {
    for (let x = 0; x < sourceWidth; x++) {
      const column = Math.min(2, Math.floor((x * 3) / sourceWidth));
      const row = Math.min(1, Math.floor((y * 2) / sourceHeight));
      const color = colors[(row * 3) + column];
      const offset = ((y * sourceWidth) + x) * 3;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
    }
  }

  return pixels;
}

async function writeExifSource(file, orientation) {
  await sharp(asymmetricPixels(), {
    raw: { width: sourceWidth, height: sourceHeight, channels: 3 },
  })
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
    .withMetadata({ orientation })
    .toFile(file);

  const metadata = await sharp(file).metadata();
  assert.equal(metadata.orientation, orientation, 'testovací JPG musí nést požadovanou EXIF orientaci');
  assert.deepEqual(
    { width: metadata.width, height: metadata.height },
    { width: sourceWidth, height: sourceHeight },
    'uložené rozměry fixture musí zůstat před aplikací EXIF orientace nezměněné',
  );
}

async function expectedDerivative(source, derivative) {
  let pipeline = sharp(source).autoOrient();
  if (derivative.width !== undefined) {
    pipeline = pipeline.resize(derivative.width, derivative.height);
  }

  return derivative.format === 'jpeg'
    ? pipeline.jpeg({ quality: derivative.quality }).toBuffer()
    : pipeline.webp({ quality: derivative.quality }).toBuffer();
}

async function visualSignature(input) {
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const positions = [1, 3, 5];
  const samples = [];

  for (const yPart of positions) {
    for (const xPart of positions) {
      const x = Math.floor((info.width * xPart) / 6);
      const y = Math.floor((info.height * yPart) / 6);
      const offset = ((y * info.width) + x) * info.channels;
      samples.push([...data.subarray(offset, offset + 3)]);
    }
  }

  return {
    width: info.width,
    height: info.height,
    channels: info.channels,
    samples,
  };
}

test(
  'TODO codex-testy-web/IMG-EXIF-001: deriváty respektují EXIF rotace 90° a zachovají vizuální orientaci i rozměry',
  { todo: 'optimizeImages zatím před odstraněním EXIF metadat neaplikuje orientaci zdrojového JPG' },
  async (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimize-images-exif-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

    for (const orientation of orientations) {
      await writeExifSource(path.join(dir, `orientation-${orientation}.jpg`), orientation);
    }

    assert.deepEqual(await optimizeImages(dir), { covers: orientations.length, updated: 6 });

    const actual = {};
    const expected = {};
    for (const orientation of orientations) {
      const base = `orientation-${orientation}`;
      const source = path.join(dir, `${base}.jpg`);
      actual[orientation] = {};
      expected[orientation] = {};

      for (const derivative of derivatives) {
        const name = `${base}${derivative.suffix}`;
        actual[orientation][name] = await visualSignature(path.join(dir, name));
        expected[orientation][name] = await visualSignature(
          await expectedDerivative(source, derivative),
        );
      }
    }

    assert.deepEqual(
      actual,
      expected,
      'pixely a rozměry všech derivátů musí odpovídat zdroji po aplikaci EXIF orientace',
    );
  },
);
