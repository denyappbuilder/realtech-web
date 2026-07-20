// Před buildem dogeneruje chybějící varianty coverů: SLUG-640.jpg, SLUG.webp, SLUG-640.webp.
// Existující soubory nepřepisuje — bezpečné pouštět opakovaně (běží jako prebuild).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = 'public/images/clanky';
const jpgs = fs.readdirSync(DIR).filter((f) => f.endsWith('.jpg') && !f.endsWith('-640.jpg'));

let made = 0;
for (const f of jpgs) {
  const base = f.replace(/\.jpg$/, '');
  const src = path.join(DIR, f);
  const out640 = path.join(DIR, `${base}-640.jpg`);
  const outWebp = path.join(DIR, `${base}.webp`);
  const out640Webp = path.join(DIR, `${base}-640.webp`);

  if (!fs.existsSync(out640)) {
    await sharp(src).resize(640, 360).jpeg({ quality: 80 }).toFile(out640);
    made++;
  }
  if (!fs.existsSync(outWebp)) {
    await sharp(src).webp({ quality: 80 }).toFile(outWebp);
    made++;
  }
  if (!fs.existsSync(out640Webp)) {
    await sharp(src).resize(640, 360).webp({ quality: 78 }).toFile(out640Webp);
    made++;
  }
}
console.log(`[optimize-images] covers: ${jpgs.length}, nově vygenerováno: ${made}`);
