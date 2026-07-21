// Generuje brandované OG obrázky (1200×630) pro články s lokálním coverem:
// cover + tmavý gradient + titulek + REALTECH.CZ badge → public/images/og/SLUG.jpg
// Existující soubory přeskakuje (při změně titulku smaž soubor a nech přegenerovat).
// Články s videem OG neřeší — YT maxresdefault je pro ně v pořádku.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src/content/clanky';
const OUT = 'public/images/og';
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
  if (fs.existsSync(out) || !fs.existsSync(srcImg)) continue;

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
  made++;
}
console.log(`[generate-og] nově vygenerováno: ${made}`);
