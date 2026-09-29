// Kolo 60: AVIF deriváty coverů — SLUG{-192,-384,-640,-960,}.avif vedle WebP.
//
// Měřeno na 45 coverech 28. 9. 2026: q55 = −32 až −37 % proti WebP ve všech
// šířkách, vizuálně bez rozdílu při 2× zvětšení (q50 by dal −43 %, ale na
// jemných texturách už ztrácí). <picture> dává <source type="image/avif">
// před WebP; prohlížeč bez AVIF (≈ 5 % návštěv) bere WebP jako dosud.
//
// Samostatný skript, ne součást optimize-images.mjs: AVIF kódování je ~10×
// pomalejší než WebP (135 coverů ≈ 3 min), takže se NEkóduje při každém
// buildu. Manifest `avif-zdroje.json` drží sha256 zdrojového JPG + verzi
// nastavení; kóduje se jen nový / vyměněný cover nebo chybějící soubor
// (běh bez změn ≈ 20 s, jen hashování). Kontrakt WebP/JPG derivátů
// (optimize-images + jeho testy) zůstává beze změny.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const AVIF_NASTAVENI = { quality: 55, effort: 4 };
export const AVIF_SIRKY = [[192, 108], [384, 216], [640, 360], [960, 540], [1280, 720]];
export const AVIF_MANIFEST = 'avif-zdroje.json';
const DIR = 'public/images/clanky';

export const avifNazev = (base, sirka) => (sirka === 1280 ? `${base}.avif` : `${base}-${sirka}.avif`);
const klic = (buffer) => `${createHash('sha256').update(buffer).digest('hex')}:q${AVIF_NASTAVENI.quality}e${AVIF_NASTAVENI.effort}`;

/** Stejný výběr vstupů jako optimize-images: JPG cover (ne -640), jen skutečně uvnitř dir (bez symlinků ven). */
function jeCover(dir, file) {
  if (!file.endsWith('.jpg') || file.endsWith('-640.jpg')) return false;
  try {
    const root = `${fs.realpathSync(dir)}${path.sep}`;
    return fs.realpathSync(path.join(dir, file)).startsWith(root);
  } catch {
    return false;
  }
}

function zapisPriZmene(file, contents) {
  if (fs.existsSync(file) && fs.readFileSync(file).equals(contents)) return false;
  fs.writeFileSync(file, contents);
  return true;
}

export async function optimizeAvif(dir = DIR) {
  const covers = fs.readdirSync(dir).filter((f) => jeCover(dir, f)).sort();
  const manifestSoubor = path.join(dir, AVIF_MANIFEST);
  const manifest = fs.existsSync(manifestSoubor) ? JSON.parse(fs.readFileSync(manifestSoubor, 'utf8')) : {};
  let updated = 0;
  let encoded = 0;
  for (const file of covers) {
    const base = file.slice(0, -4);
    const source = path.join(dir, file);
    const k = klic(fs.readFileSync(source));
    const soubory = AVIF_SIRKY.map(([w]) => path.join(dir, avifNazev(base, w)));
    if (manifest[base] === k && soubory.every((f) => fs.existsSync(f))) continue;
    encoded++;
    for (const [i, [w, h]] of AVIF_SIRKY.entries()) {
      const pipeline = w === 1280 ? sharp(source).autoOrient() : sharp(source).autoOrient().resize(w, h);
      if (zapisPriZmene(soubory[i], await pipeline.avif(AVIF_NASTAVENI).toBuffer())) updated++;
    }
    manifest[base] = k;
  }
  // Jen existující covery, seřazené klíče → deterministický soubor (Z1072:
  // prebuild nesmí nechat public/images špinavé).
  const cisty = Object.fromEntries(Object.keys(manifest).filter((b) => covers.includes(`${b}.jpg`)).sort().map((b) => [b, manifest[b]]));
  if (covers.length && zapisPriZmene(manifestSoubor, Buffer.from(`${JSON.stringify(cisty, null, 1)}\n`))) updated++;
  return { covers: covers.length, encoded, updated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { covers, encoded, updated } = await optimizeAvif();
  console.log(`[optimize-avif] covers: ${covers}, kódováno: ${encoded}, aktualizováno: ${updated}`);
}
