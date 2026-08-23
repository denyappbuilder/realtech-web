// Generuje brandované OG obrázky (1200×630) pro články:
// cover + tmavý gradient + titulek + REALTECH.CZ badge → public/images/og/SLUG.jpg
// Zdroj obrázku: lokální cover z frontmatteru (`image:`), u video článků bez
// coveru náhled z YouTube (maxres → sd → hq). Existující soubory přeskakuje,
// pokud se nezměnil titulek ani zdroj — u YouTube náhledu je otiskem videoId,
// takže se při buildu nic nestahuje, dokud se článek nezmění.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { youtubeId } from '../src/lib/youtube.js';

const SRC = 'src/content/clanky';
const OUT = 'public/images/og';
// Zvyš při změně renderovacího receptu, která má invalidovat existující OG obrázky.
const RECIPE_VERSION = 1;
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Zalom titulek na max 3 řádky po ~30 znacích
function wrap(title, max = 30, maxLines = 3) {
  const words = title.split(/\s+/);
  const lines = [''];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if ((cur + ' ' + w).trim().length <= max) lines[lines.length - 1] = (cur + ' ' + w).trim();
    else if (lines.length < maxLines) lines.push(w);
    else { lines[maxLines - 1] = lines[maxLines - 1].replace(/\.*$/, '…'); break; }
  }
  return lines;
}

function fingerprint(title, source) {
  return createHash('sha256')
    .update(JSON.stringify({ recipe: RECIPE_VERSION, title, ...source }))
    .digest('hex');
}

// maxresdefault u některých videí neexistuje (404) — padáme na menší varianty.
const THUMB_VARIANTS = ['maxresdefault', 'sddefault', 'hqdefault'];

async function fetchThumbnail(videoId) {
  for (const variant of THUMB_VARIANTS) {
    const url = `https://i.ytimg.com/vi/${videoId}/${variant}.jpg`;
    const res = await fetch(url);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status !== 404) throw new Error(`[generate-og] ${url}: HTTP ${res.status}`);
  }
  throw new Error(`[generate-og] žádný YouTube náhled pro video ${videoId}`);
}

let made = 0;
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  // Oddělovač je řádek `---`, ne libovolný výskyt v hodnotě (stejně jako sitemap/validate-content).
  // `split('---')` uřízne `description: "Rozbor --- díl první"` a ztratí `image` za ním.
  const fm = raw.split(/^---\s*$/m)[1] ?? '';
  const title = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const image = fm.match(/^image:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const videoId = youtubeId(fm.match(/^video:\s*["']?(.+?)["']?\s*$/m)?.[1]);
  if (!title) continue;

  // Lokální cover má přednost; video článek bez coveru dostane YouTube náhled.
  const srcImg = image && fs.existsSync(`public${image}`) ? `public${image}` : null;
  if (!srcImg && !videoId) continue;

  const out = path.join(OUT, `${slug}.jpg`);
  const fingerprintFile = `${out}.sha256`;
  const currentFingerprint = srcImg
    ? fingerprint(title, { imageHash: createHash('sha256').update(fs.readFileSync(srcImg)).digest('hex') })
    : fingerprint(title, { videoId });
  const savedFingerprint = fs.existsSync(fingerprintFile)
    ? fs.readFileSync(fingerprintFile, 'utf8').trim()
    : '';
  if (fs.existsSync(out) && savedFingerprint === currentFingerprint) continue;

  const lines = wrap(esc(title));
  const textY = 630 - 64 - (lines.length - 1) * 58;
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0.35" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0707" stop-opacity="0"/>
      <stop offset="1" stop-color="#0d0707" stop-opacity="0.94"/>
    </linearGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <rect x="0" y="0" width="1200" height="10" fill="#D42622"/>
    <text x="64" y="86" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="30" fill="#ffffff" letter-spacing="2">REAL<tspan fill="#F0554F">TECH</tspan>.CZ</text>
    ${lines.map((l, i) => `<text x="64" y="${textY + i * 58}" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="50" fill="#ffffff">${l}</text>`).join('\n')}
  </svg>`;

  await sharp(srcImg ?? await fetchThumbnail(videoId))
    .resize(1200, 630, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 84 })
    .toFile(out);
  fs.writeFileSync(fingerprintFile, `${currentFingerprint}\n`);
  made++;
}
console.log(`[generate-og] vygenerováno: ${made}`);
