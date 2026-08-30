import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

// Živě 28. 8. 2026 odpoledne: Falcon Heavy na LC-39A (Florida), ne Starbase Louisiana.
const FORBIDDEN_STARBASE_SHA =
  'd2440c46239f71d65d15a48836112e8790f5509506fcf11bc65bc969761976f3';

const SLUGS = [
  'spacex-starbase-louisiana',
  'starlink-grok-voice-hovory',
  'starlink-mini-vs-standard',
  'jak-delame-videa-s-ai',
  'anthropic-ipo-dva-biliony-investori',
  'chatgpt-pro-teenagery',
  'gemini-plus-rok-zdarma-studenti',
  'gpt-5-6-sol-zlevneni',
  'openai-pauza-rl-treninku-astra',
];

// Živě 28. 8. 2026 večer: /clanky/strana/2/ pořád černo-červený 3D neon.
// Pixel Watch byl živě tma/neon, proto zůstává v sadě (ne meta-australie).
// Druhý audit: ask-maps (černá mapa, červený pin) — max 9 slugů, ne strana 3+.
const STRANA2_SLUGS = [
  'chatgpt-reklamy-nove-trhy',
  'chatgpt-zdarma-neomezene-chaty',
  'glm-5-3-kybernalezy',
  'openai-astra-critical-kyberbezpecnost',
  'pixel-11-tensor-g6',
  'grok-imagine-image-2-zdarma',
  'anthropic-risk-report-misalignment',
  'pixel-watch-detekce-dechu',
  'ask-maps-agent-objednavani-jidla',
];

// Živě 29. 8. 2026: #355 je nechalo jako „product shots".
// strana 4 galaxy-card (černá deska, neon-červená hrana),
// strana 5 flex-titanium (3D skládačka, červená hrana + modrý vent)
// a unpacked-cervenec (clamshell na černé, červené/modré pruhy).
const SAMSUNG_LEFTOVER_SLUGS = [
  'samsung-galaxy-card',
  'samsung-flex-titanium-skladacky',
  'samsung-galaxy-unpacked-cervenec',
];

// Kolo 7 (audit jasu všech coverů po #356–#363): poslední čtyři černo-červené
// covery — dva Samsungy (černé desky, rudě podsvícené hrany, luma 15 a 25),
// whatsapp (tmavý panel, 36) a starmind (černý vesmír, 37). Nahrazeno
// denním NB2 fotoreálem z audio.realtech.cz/tmp-covers-nb2-r7/.
const R7_LEFTOVER_SLUGS = [
  'samsung-galaxy-z-fold8-flip8-prodej',
  'samsung-unpacked-fold8-watch9',
  'whatsapp-skupiny-all-ankety',
  'spacex-nvidia-starmind-ai1',
];

function coverPath(slug, name) {
  return path.join(root, 'public/images/clanky', name ?? `${slug}.jpg`);
}

async function lumaStats(file) {
  const { data, info } = await sharp(file)
    .resize(320, 180, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  let luma = 0;
  let dark = 0;
  let redish = 0;
  for (let i = 0; i < n; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luma += l;
    if (l < 40) dark++;
    if (r > 80 && r > g * 1.6 && r > b * 1.6) redish++;
  }
  return {
    luma: luma / n,
    darkPct: (dark / n) * 100,
    redPct: (redish / n) * 100,
  };
}

test('vybrané leftover slugy mají 1280×720 cover, deriváty a OG', () => {
  for (const slug of SLUGS) {
    const files = [
      coverPath(slug, `${slug}.jpg`),
      coverPath(slug, `${slug}.webp`),
      coverPath(slug, `${slug}-640.jpg`),
      coverPath(slug, `${slug}-640.webp`),
      path.join(root, 'public/images/og', `${slug}.jpg`),
      path.join(root, 'public/images/og', `${slug}.jpg.sha256`),
    ];
    for (const file of files) {
      assert.ok(fs.existsSync(file), `chybí ${path.relative(root, file)}`);
    }
  }
});

test('Starbase cover už není Falcon Heavy z LC-39A', async () => {
  const file = coverPath('spacex-starbase-louisiana');
  const sha = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.notEqual(
    sha,
    FORBIDDEN_STARBASE_SHA,
    'cover je pořád otisk živého Falcon Heavy na 39A',
  );
  const meta = await sharp(file).metadata();
  assert.equal(meta.width, 1280);
  assert.equal(meta.height, 720);
});

function assertSvetlyCover(slug, luma, darkPct, redPct) {
  assert.ok(
    luma >= 110,
    `${slug}: luma ${luma.toFixed(1)} je pořád tmavá (limit 110)`,
  );
  // Fotoreál NB2 (kůže, terakota, vlasy) má víc tmavých/červených pixelů
  // než čistý produktový shot. Neon leftover byl desítky % černé + saturace.
  assert.ok(
    darkPct <= 20,
    `${slug}: ${darkPct.toFixed(1)} % skoro černých pixelů`,
  );
  assert.ok(
    redPct <= 10,
    `${slug}: ${redPct.toFixed(1)} % neonově červených pixelů`,
  );
}

test('přegenerované leftover slugy jsou světlé, bez červeného neonu', async () => {
  for (const slug of SLUGS) {
    const file = coverPath(slug);
    const meta = await sharp(file).metadata();
    assert.equal(meta.width, 1280, `${slug} šířka`);
    assert.equal(meta.height, 720, `${slug} výška`);
    const { luma, darkPct, redPct } = await lumaStats(file);
    assertSvetlyCover(slug, luma, darkPct, redPct);
  }
});

test('strana 2 leftover slugy mají 1280×720 cover, deriváty a OG', () => {
  for (const slug of STRANA2_SLUGS) {
    const files = [
      coverPath(slug, `${slug}.jpg`),
      coverPath(slug, `${slug}.webp`),
      coverPath(slug, `${slug}-640.jpg`),
      coverPath(slug, `${slug}-640.webp`),
      path.join(root, 'public/images/og', `${slug}.jpg`),
      path.join(root, 'public/images/og', `${slug}.jpg.sha256`),
    ];
    for (const file of files) {
      assert.ok(fs.existsSync(file), `chybí ${path.relative(root, file)}`);
    }
  }
});

test('strana 2 leftover slugy jsou světlé, bez červeného neonu', async () => {
  for (const slug of STRANA2_SLUGS) {
    const file = coverPath(slug);
    const meta = await sharp(file).metadata();
    assert.equal(meta.width, 1280, `${slug} šířka`);
    assert.equal(meta.height, 720, `${slug} výška`);
    const { luma, darkPct, redPct } = await lumaStats(file);
    assertSvetlyCover(slug, luma, darkPct, redPct);
  }
});

test('tři leftover Samsung coverý mají 1280×720, deriváty a OG', () => {
  for (const slug of SAMSUNG_LEFTOVER_SLUGS) {
    const files = [
      coverPath(slug, `${slug}.jpg`),
      coverPath(slug, `${slug}.webp`),
      coverPath(slug, `${slug}-640.jpg`),
      coverPath(slug, `${slug}-640.webp`),
      path.join(root, 'public/images/og', `${slug}.jpg`),
      path.join(root, 'public/images/og', `${slug}.jpg.sha256`),
    ];
    for (const file of files) {
      assert.ok(fs.existsSync(file), `chybí ${path.relative(root, file)}`);
    }
  }
});

test('tři leftover Samsung coverý jsou světlé, bez červeného neonu', async () => {
  for (const slug of SAMSUNG_LEFTOVER_SLUGS) {
    const file = coverPath(slug);
    const meta = await sharp(file).metadata();
    assert.equal(meta.width, 1280, `${slug} šířka`);
    assert.equal(meta.height, 720, `${slug} výška`);
    const { luma, darkPct, redPct } = await lumaStats(file);
    assertSvetlyCover(slug, luma, darkPct, redPct);
  }
});

test('kolo 7: poslední čtyři leftover covery mají 1280×720, deriváty a OG', () => {
  for (const slug of R7_LEFTOVER_SLUGS) {
    const files = [
      coverPath(slug, `${slug}.jpg`),
      coverPath(slug, `${slug}.webp`),
      coverPath(slug, `${slug}-640.jpg`),
      coverPath(slug, `${slug}-640.webp`),
      path.join(root, 'public/images/og', `${slug}.jpg`),
      path.join(root, 'public/images/og', `${slug}.jpg.sha256`),
    ];
    for (const file of files) {
      assert.ok(fs.existsSync(file), `chybí ${path.relative(root, file)}`);
    }
  }
});

test('kolo 7: poslední čtyři leftover covery jsou světlé, bez červeného neonu', async () => {
  for (const slug of R7_LEFTOVER_SLUGS) {
    const file = coverPath(slug);
    const meta = await sharp(file).metadata();
    assert.equal(meta.width, 1280, `${slug} šířka`);
    assert.equal(meta.height, 720, `${slug} výška`);
    const { luma, darkPct, redPct } = await lumaStats(file);
    assertSvetlyCover(slug, luma, darkPct, redPct);
  }
});
