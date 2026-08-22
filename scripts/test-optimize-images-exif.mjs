import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

import { optimizeImages } from "./optimize-images.mjs";

const derivatives = [
  ["cover-640.jpg", (img) => img.resize(640, 360).jpeg({ quality: 80 })],
  ["cover.webp", (img) => img.webp({ quality: 80 })],
  ["cover-640.webp", (img) => img.resize(640, 360).webp({ quality: 78 })],
];

async function writeOrientedSource(file, orientation) {
  const raw = await sharp({
    create: {
      width: 120,
      height: 80,
      channels: 3,
      background: "#101010",
    },
  })
    .composite([
      { input: { create: { width: 24, height: 24, channels: 3, background: "#e10600" } }, left: 0, top: 0 },
      { input: { create: { width: 24, height: 24, channels: 3, background: "#00a651" } }, left: 96, top: 0 },
      { input: { create: { width: 24, height: 24, channels: 3, background: "#0033a0" } }, left: 0, top: 56 },
      { input: { create: { width: 24, height: 24, channels: 3, background: "#f5c400" } }, left: 96, top: 56 },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  await sharp(raw).withMetadata({ orientation }).jpeg({ quality: 95 }).toFile(file);
}

async function sample(file) {
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const { data } = await image
    .clone()
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { width, height, corner: [...data] };
}

for (const orientation of [6, 8]) {
  test(`deriváty sedí s autoOrient referencí při EXIF ${orientation} [Z1067 / IMG-EXIF-001]`, async (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `optimize-exif-${orientation}-`));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const source = path.join(dir, "cover.jpg");
    await writeOrientedSource(source, orientation);

    assert.deepEqual(await optimizeImages(dir), { covers: 1, updated: 3 });

    for (const [name, apply] of derivatives) {
      const actual = path.join(dir, name);
      const expectedBuf = await apply(sharp(source).autoOrient()).toBuffer();
      const expectedFile = path.join(dir, `expected-${name}`);
      fs.writeFileSync(expectedFile, expectedBuf);

      assert.deepEqual(
        await sample(actual),
        await sample(expectedFile),
        `${name} musí mít rozměry i rohový pixel jako reference po autoOrient()`,
      );
    }
  });
}
