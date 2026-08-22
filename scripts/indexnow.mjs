#!/usr/bin/env node
// Oznámí nové/změněné URL vyhledávačům přes protokol IndexNow.
// Zapojené vyhledávače: Seznam.cz, Bing, Yandex, Naver, Yep — stačí poslat
// jednomu, ostatním se to přepošle. Pro české publikum je klíčový Seznam.
//
// Použití:
//   node scripts/indexnow.mjs                      → pošle všechny URL ze sitemapy
//   node scripts/indexnow.mjs /clanky/neco/ ...    → pošle jen uvedené cesty
//   node scripts/indexnow.mjs --dry-run            → jen vypíše, co by poslal

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'realtech.cz';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const keyFile = fs
  .readdirSync(path.join(ROOT, 'public'))
  .find((f) => /^[0-9a-f]{16,128}\.txt$/.test(f));
if (!keyFile) {
  console.error('❌ V public/ chybí soubor s IndexNow klíčem (<klíč>.txt).');
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, '');

const args = process.argv.slice(2);
const unknownFlags = args.filter((a) => a.startsWith('--') && a !== '--dry-run');
if (unknownFlags.length) {
  console.error(`❌ Neznámý přepínač: ${unknownFlags.join(', ')}`);
  process.exit(1);
}
const dryRun = args.includes('--dry-run');
const paths = args.filter((a) => !a.startsWith('--'));

let urlList;
if (paths.length) {
  urlList = paths.map((p) => `https://${HOST}${p.startsWith('/') ? p : `/${p}`}`);
} else {
  const sitemap = path.join(ROOT, 'dist', 'sitemap-0.xml');
  if (!fs.existsSync(sitemap)) {
    console.error('❌ dist/sitemap-0.xml neexistuje — nejdřív spusť `npm run build`.');
    process.exit(1);
  }
  urlList = [...fs.readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

if (!urlList.length) {
  console.error('❌ Žádné URL k odeslání.');
  process.exit(1);
}

console.log(`IndexNow → ${urlList.length} URL, klíč ${key.slice(0, 8)}…`);
if (dryRun) {
  urlList.forEach((u) => console.log('  ' + u));
  console.log('(dry-run, nic se neodeslalo)');
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${keyFile}`,
    urlList,
  }),
});

// 200 = přijato, 202 = přijato, klíč se ověřuje
if (res.status === 200 || res.status === 202) {
  console.log(`✅ Odesláno (HTTP ${res.status}).`);
} else {
  console.error(`❌ HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  process.exit(1);
}
