import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import test from 'node:test';
import { avifSrcsetZWebp, nahledKarty } from '../src/lib/karta-nahled.js';
import { preloadHeroObrazku } from '../src/lib/hero-preload.js';
import { kartaHtml } from '../src/lib/archiv-filtr.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { AVIF_NASTAVENI, AVIF_SIRKY, AVIF_MANIFEST, avifNazev, optimizeAvif } from './optimize-avif.mjs';

// Kolo 60 (29. 9. 2026): AVIF deriváty — −32 až −37 % proti WebP ve všech šířkách.
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const WEBP = '/images/clanky/x-192.webp 192w, /images/clanky/x-384.webp 384w, /images/clanky/x-640.webp 640w, /images/clanky/x-960.webp 960w, /images/clanky/x.webp 1280w';

test('kolo 60: avifSrcsetZWebp = stejné šířky, jen když leží VŠECHNY AVIF soubory', () => {
  const vse = () => true;
  assert.equal(avifSrcsetZWebp(WEBP, vse), WEBP.replaceAll('.webp', '.avif'));
  assert.equal(avifSrcsetZWebp(WEBP, (c) => !c.endsWith('x-960.avif')), null, 'chybí jeden → celý AVIF pryč, zůstane WebP');
  assert.equal(avifSrcsetZWebp(null, vse), null);
  assert.equal(avifSrcsetZWebp('/a.jpg 640w', vse), null, 'jen z .webp kandidátů');
});

test('kolo 60: preload míří na AVIF, když ho <picture> nabízí (jinak LCP stažen dvakrát)', () => {
  const avif = WEBP.replaceAll('.webp', '.avif');
  assert.deepEqual(
    preloadHeroObrazku({ src: '/images/clanky/x.webp', webp: '/images/clanky/x.webp', webpSrcset: WEBP, avifSrcset: avif, sizes: '100vw' }),
    { href: '/images/clanky/x.avif', imagesrcset: avif, imagesizes: '100vw', type: 'image/avif' },
  );
  assert.equal(preloadHeroObrazku({ src: '/x.webp', webp: '/x.webp', webpSrcset: WEBP, sizes: '1px' }).type, 'image/webp', 'bez AVIF beze změny');
});

test('kolo 60: každá šablona s WebP srcsetem nabízí AVIF <source> PŘED WebP', () => {
  for (const [f, n] of [['src/components/ArticleCard.astro', 1], ['src/pages/index.astro', 2], ['src/pages/clanky/[...id].astro', 2], ['src/pages/temata/index.astro', 1]]) {
    const src = cti(f);
    const avif = [...src.matchAll(/type="image\/avif"/g)].map((m) => m.index);
    assert.equal(avif.length, n, `${f}: ${n}× AVIF <source>`);
    for (const i of avif) assert.ok(src.indexOf('type="image/webp"', i) > i, `${f}: AVIF musí být před WebP (prohlížeč bere první podporovaný)`);
  }
  for (const f of ['src/components/ArticleArchivePage.astro', 'src/components/TemaPage.astro', 'src/pages/vitej.astro', 'src/pages/temata/index.astro']) {
    assert.match(cti(f), /avifSrcset: prvni(?:Nahled|Hub\.nahled)\.thumbAvifSrcset \?\? undefined/, `${f}: preload první karty zná AVIF`);
  }
});

test('kolo 60: karta z indexu (edge i klient) dává AVIF před WebP jen se srcsetem', () => {
  const it = { s: 'x', t: 'T', d: '', k: 'AI Report', b: '', p: '', i: '/images/clanky/x-640.webp', is: WEBP, ia: WEBP.replaceAll('.webp', '.avif') };
  const html = kartaHtml(it, '100vw');
  assert.ok(html.indexOf('type="image/avif"') > -1 && html.indexOf('type="image/avif"') < html.indexOf('type="image/webp"'));
  assert.doesNotMatch(kartaHtml({ ...it, ia: undefined }, '100vw'), /image\/avif/);
  const klient = cti('src/components/ArticleArchivePage.astro');
  assert.match(klient, /if \(it\.ia && it\.is\) \{[\s\S]*?avif\.setAttribute\('type', 'image\/avif'\);/);
  assert.match(cti('src/pages/search-index.json.js'), /ia: avifSrcsetProIndex\(c\.data\),/);
});

test('kolo 60: každý JPG cover má 5 AVIF derivátů a záznam v manifestu (kóduje se jen změna)', () => {
  const dir = new URL('../public/images/clanky/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL(AVIF_MANIFEST, dir), 'utf8'));
  const covers = readdirSync(dir).filter((f) => f.endsWith('.jpg') && !f.endsWith('-640.jpg')).map((f) => f.slice(0, -4));
  assert.ok(covers.length >= 130);
  for (const b of covers) {
    for (const [w] of AVIF_SIRKY) assert.ok(existsSync(new URL(avifNazev(b, w), dir)), `${b}: chybí ${avifNazev(b, w)}`);
    assert.match(manifest[b] ?? '', new RegExp(`^[0-9a-f]{64}:q${AVIF_NASTAVENI.quality}e${AVIF_NASTAVENI.effort}$`), `${b}: manifest`);
  }
  assert.deepEqual(Object.keys(manifest), [...Object.keys(manifest)].sort(), 'manifest seřazený = deterministický');
  const n = nahledKarty(`/images/clanky/${covers[0]}.jpg`);
  assert.ok(n.thumbAvifSrcset?.includes('.avif 1280w'), 'reálná karta dostane AVIF srcset');
});

test('kolo 60: optimizeAvif — 5 šířek, idempotentní, kóduje znovu jen vyměněný cover, symlink ven ignoruje', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avif-'));
  const cover = (barva) => sharp({ create: { width: 1280, height: 720, channels: 3, background: barva } }).jpeg().toFile(path.join(dir, 'a.jpg'));
  await cover('#3366aa');
  await sharp({ create: { width: 640, height: 360, channels: 3, background: '#000' } }).jpeg().toFile(path.join(dir, 'a-640.jpg'));
  const venku = fs.mkdtempSync(path.join(os.tmpdir(), 'avif-out-'));
  await sharp({ create: { width: 1280, height: 720, channels: 3, background: '#fff' } }).jpeg().toFile(path.join(venku, 'b.jpg'));
  fs.symlinkSync(path.join(venku, 'b.jpg'), path.join(dir, 'b.jpg'));
  assert.deepEqual(await optimizeAvif(dir), { covers: 1, encoded: 1, updated: 6 });
  for (const [w, h] of AVIF_SIRKY) {
    const m = await sharp(path.join(dir, avifNazev('a', w))).metadata();
    assert.deepEqual([m.width, m.height, m.format], [w, h, 'heif']);
  }
  assert.ok(!fs.existsSync(path.join(dir, 'b.avif')), 'symlink mimo vstup se nezpracuje');
  assert.ok(!fs.existsSync(path.join(dir, 'a-640-640.avif')), '-640.jpg není cover');
  assert.deepEqual(await optimizeAvif(dir), { covers: 1, encoded: 0, updated: 0 }, 'druhý běh nic nekóduje');
  await cover('#aa3333');
  assert.equal((await optimizeAvif(dir)).encoded, 1, 'vyměněný zdroj → nové AVIF');
  fs.rmSync(path.join(dir, 'a-960.avif'));
  assert.equal((await optimizeAvif(dir)).encoded, 1, 'chybějící soubor se doplní');
  fs.rmSync(dir, { recursive: true }); fs.rmSync(venku, { recursive: true });
});

test('kolo 60: prebuild spouští optimize-avif po WebP derivátech', () => {
  const pkg = JSON.parse(cti('package.json'));
  assert.match(pkg.scripts.prebuild, /optimize-images\.mjs && node scripts\/optimize-avif\.mjs && node scripts\/generate-og\.mjs/);
});
