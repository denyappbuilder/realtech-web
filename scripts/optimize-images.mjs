// Před buildem synchronizuje varianty coverů: SLUG-640.jpg, SLUG.webp a WebP 192/384/640/960w.
// Kolo 39: 960w WebP — karta 340–360 px na DPR 2 potřebuje ~700 px; se sadou
// 640w+1280w si prohlížeč bral plných 1280 (Lighthouse 14. 9. 2026: 327–397 KB
// navíc na úvodce). 960 sedí i pro hero úvodky na mobilu (342 px × 2 = 684).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DIR = 'public/images/clanky';

function isInboundCover(dir, file) {
  if (!file.endsWith('.jpg') || file.endsWith('-640.jpg')) return false;
  try {
    const root = `${fs.realpathSync(dir)}${path.sep}`;
    return fs.realpathSync(path.join(dir, file)).startsWith(root);
  } catch {
    return false;
  }
}

function writeIfChanged(file, contents) {
  if (fs.existsSync(file) && fs.readFileSync(file).equals(contents)) {
    return false;
  }

  fs.writeFileSync(file, contents);
  return true;
}

export async function optimizeImages(dir = DIR) {
  const jpgs = fs.readdirSync(dir)
    .filter((file) => isInboundCover(dir, file))
    .sort();

  let updated = 0;
  for (const file of jpgs) {
    const base = file.replace(/\.jpg$/, '');
    const source = path.join(dir, file);
    const oriented = () => sharp(source).autoOrient();
    const derivatives = [
      [path.join(dir, `${base}-640.jpg`), await oriented().resize(640, 360).jpeg({ quality: 80 }).toBuffer()],
      [path.join(dir, `${base}.webp`), await oriented().webp({ quality: 80 }).toBuffer()],
      [path.join(dir, `${base}-640.webp`), await oriented().resize(640, 360).webp({ quality: 78 }).toBuffer()],
      [path.join(dir, `${base}-960.webp`), await oriented().resize(960, 540).webp({ quality: 78 }).toBuffer()],
      [path.join(dir, `${base}-192.webp`), await oriented().resize(192, 108).webp({ quality: 78 }).toBuffer()],
      [path.join(dir, `${base}-384.webp`), await oriented().resize(384, 216).webp({ quality: 78 }).toBuffer()],
    ];

    for (const [output, contents] of derivatives) {
      if (writeIfChanged(output, contents)) updated++;
    }
  }

  return { covers: jpgs.length, updated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { covers, updated } = await optimizeImages();
  console.log(`[optimize-images] covers: ${covers}, aktualizováno: ${updated}`);
}
