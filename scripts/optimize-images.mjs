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

/**
 * Kolo 58: bajtový strop pro WebP deriváty. Medián -640.webp je 27 KB, ale
 * detailní fotky (Starlink 69 KB, Meta Austrálie 67 KB, Starship Ship 40
 * 54 KB) při q78 vycházely 2–2,5× těžší — a -640 je LCP obrázek článku na
 * mobilu (/clanky/starlink-v-cesku-pruvodce/ LCP 2,9 s, nejhorší typ stránky).
 * Nad stropem se kvalita snižuje po krocích 70 → 64 → 58; pod stropem zůstává
 * q78/q80 beze změny, takže běžné covery se nepřepíšou. Deterministické:
 * stejný zdroj → stejné bajty (writeIfChanged dál nic nepřepisuje zbytečně).
 */
export const WEBP_STROP = { 192: 10_000, 384: 28_000, 640: 45_000, 960: 90_000, 1280: 160_000 };
const WEBP_KROKY = [70, 64, 58];

export async function webpSeStropem(pipeline, sirka, kvalita) {
  let buffer = await pipeline().webp({ quality: kvalita }).toBuffer();
  const strop = WEBP_STROP[sirka];
  for (const q of WEBP_KROKY) {
    if (!strop || buffer.length <= strop || q >= kvalita) break;
    buffer = await pipeline().webp({ quality: q }).toBuffer();
  }
  return buffer;
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
      [path.join(dir, `${base}.webp`), await webpSeStropem(oriented, 1280, 80)],
      [path.join(dir, `${base}-640.webp`), await webpSeStropem(() => oriented().resize(640, 360), 640, 78)],
      [path.join(dir, `${base}-960.webp`), await webpSeStropem(() => oriented().resize(960, 540), 960, 78)],
      [path.join(dir, `${base}-192.webp`), await webpSeStropem(() => oriented().resize(192, 108), 192, 78)],
      [path.join(dir, `${base}-384.webp`), await webpSeStropem(() => oriented().resize(384, 216), 384, 78)],
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
