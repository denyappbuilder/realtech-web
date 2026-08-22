// Před buildem synchronizuje varianty coverů: SLUG-640.jpg, SLUG.webp, SLUG-640.webp.
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
