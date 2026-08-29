// Světlá brand karta 1200×630 → public/og-default.jpg.
// Sharp + SVG, ne AI: text musí zůstat ostrý. Tokeny ze :root v global.css.
// REAL #14171C, TECH #D42622, CZ + slogan + patička IBM Plex Mono / #4A515C.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/og-default.jpg');
const FONT_DIR = path.join(ROOT, 'scripts/og-fonts');

const BG = '#F6F7F9';
const INK = '#14171C';
const SIGNAL = '#D42622';
const INK_SOFT = '#4A515C';

const FONTS = [
  {
    file: 'IBMPlexSans-Bold.ttf',
    family: 'IBM Plex Sans',
    url: 'https://github.com/IBM/plex/raw/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-Bold.ttf',
  },
  {
    file: 'IBMPlexMono-Medium.ttf',
    family: 'IBM Plex Mono',
    url: 'https://github.com/IBM/plex/raw/master/packages/plex-mono/fonts/complete/ttf/IBMPlexMono-Medium.ttf',
  },
];

function fontFace(family, ttf) {
  const data = fs.readFileSync(ttf).toString('base64');
  return `@font-face{font-family:'${family}';src:url('data:font/ttf;base64,${data}') format('truetype');font-weight:500 700;font-style:normal;}`;
}

async function ensureFont(spec) {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const dest = path.join(FONT_DIR, spec.file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000) return dest;
  const res = await fetch(spec.url);
  if (!res.ok) throw new Error(`[generate-og-default] ${spec.url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10_000) throw new Error(`[generate-og-default] ${spec.file} je příliš malý`);
  fs.writeFileSync(dest, buf);
  return dest;
}

export async function renderOgDefault(out = OUT) {
  const faces = [];
  for (const spec of FONTS) {
    faces.push(fontFace(spec.family, await ensureFont(spec)));
  }

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs><style type="text/css">${faces.join('')}</style></defs>
    <rect width="1200" height="630" fill="${BG}"/>
    <rect x="0" y="0" width="1200" height="10" fill="${SIGNAL}"/>
    <rect x="80" y="214" width="8" height="88" fill="${SIGNAL}"/>
    <text x="108" y="282" font-family="IBM Plex Sans, Helvetica, Arial, sans-serif" font-weight="700" font-size="86" letter-spacing="-1.5">
      <tspan fill="${INK}">REAL</tspan><tspan fill="${SIGNAL}">TECH</tspan>
    </text>
    <text x="572" y="282" font-family="IBM Plex Mono, ui-monospace, monospace" font-weight="500" font-size="28" letter-spacing="4" fill="${INK_SOFT}">CZ</text>
    <text x="108" y="338" font-family="IBM Plex Mono, ui-monospace, monospace" font-weight="500" font-size="22" letter-spacing="1.4" fill="${INK_SOFT}">// TECH BEZ MARKETINGOVÝCH ŘEČÍ</text>
    <circle cx="116" cy="548" r="6" fill="${SIGNAL}"/>
    <text x="136" y="554" font-family="IBM Plex Mono, ui-monospace, monospace" font-weight="500" font-size="20" letter-spacing="0.4" fill="${INK_SOFT}">realtech.cz – novinky a analýzy</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await renderOgDefault();
  console.log('[generate-og-default] zapsáno public/og-default.jpg');
}
