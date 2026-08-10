// Generuje brandované OG obrázky (1200×630) pro články s lokálním coverem:
// cover + tmavý gradient + titulek + REALTECH.CZ badge → public/images/og/SLUG.jpg
// Existující soubory přeskakuje, jen pokud se nezměnil titulek ani cover.
// Články s videem OG neřeší — YT maxresdefault je pro ně v pořádku.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

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

function fingerprint(title, srcImg) {
  const imageHash = createHash('sha256').update(fs.readFileSync(srcImg)).digest('hex');
  return createHash('sha256')
    .update(JSON.stringify({ recipe: RECIPE_VERSION, title, imageHash }))
    .digest('hex');
}

let made = 0;
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const fm = raw.split('---')[1] ?? '';
  const title = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const image = fm.match(/^image:\s*["']?(.+?)["']?\s*$/m)?.[1];
  const hasVideo = /^video:/m.test(fm);
  if (!title || !image || hasVideo) continue;

  const out = path.join(OUT, `${slug}.jpg`);
  const srcImg = `public${image}`;
  if (!fs.existsSync(srcImg)) continue;

  const fingerprintFile = `${out}.sha256`;
  const currentFingerprint = fingerprint(title, srcImg);
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

  await sharp(srcImg)
    .resize(1200, 630, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 84 })
    .toFile(out);
  fs.writeFileSync(fingerprintFile, `${currentFingerprint}\n`);
  made++;
}
console.log(`[generate-og] vygenerováno: ${made}`);
