#!/usr/bin/env node
// Manual CLI remains available; automatic notifications use indexnow-after-deploy.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ORIGIN = 'https://realtech.cz';
export const ENDPOINT = 'https://api.indexnow.org/indexnow';
export const MAX_URLS_PER_REQUEST = 10_000;
export const MAX_SITEMAP_BYTES = 5 * 1024 * 1024;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}
export function validateUrl(value) {
  requireValue(typeof value === 'string' && value.startsWith(`${ORIGIN}/`) && value.length <= 2048, 'Invalid canonical URL');
  requireValue(!/[\s\x00-\x1f\x7f\\#]/u.test(value) && !/%(?![\da-f]{2})/i.test(value), 'Invalid URL characters');
  requireValue(!/[\x00-\x1f\x7f]/.test(decodeURIComponent(value)), 'Encoded URL control');
  const url = new URL(value);
  requireValue(url.origin === ORIGIN && !url.username && !url.password, 'Invalid URL origin');
  const rawPath = value.slice(ORIGIN.length).split('?')[0];
  const decoded = decodeURIComponent(rawPath);
  requireValue(!decoded.includes('%') && !decoded.includes('//') && !/[\\\x00-\x20\x7f?#]/.test(decoded) && !decoded.split('/').some(p => p === '.' || p === '..'), 'Invalid URL path');
  requireValue(decoded !== '/indexnow-deployment.json', 'Marker is not an indexable URL');
  return value; // Preserve Unicode/query/percent encoding, never silently repair input.
}
function decodeXml(text) {
  requireValue(!/&(?!(?:amp|lt|gt|apos|quot|#\d+|#x[\da-fA-F]+);)/.test(text), 'Invalid XML entity');
  return text.replace(/&(amp|lt|gt|apos|quot|#\d+|#x[\da-fA-F]+);/g, (_, entity) => {
    const named = { amp: '&', lt: '<', gt: '>', apos: "'", quot: '"' };
    if (entity in named) return named[entity];
    const n = entity.startsWith('#x') ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    requireValue(n === 9 || n === 10 || n === 13 || (n >= 32 && n <= 0xd7ff) || (n >= 0xe000 && n <= 0xfffd) || (n >= 0x10000 && n <= 0x10ffff), 'Invalid XML codepoint');
    return String.fromCodePoint(n);
  });
}
// Deliberately accept only the simple urlset vocabulary emitted by this site.
// No DTD, external entities, CDATA, extensions or recovery of malformed XML.
export function parseSitemap(input) {
  requireValue(typeof input === 'string' || ArrayBuffer.isView(input), 'Invalid sitemap input');
  requireValue(Buffer.byteLength(input) <= MAX_SITEMAP_BYTES, 'Sitemap too large');
  // Decode raw byte views fatally; never replace invalid bytes with a different URL.
  // TextDecoder consumes a legitimate leading UTF-8 BOM, but no other bytes.
  let xml = typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true }).decode(input);
  requireValue(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(xml), 'Invalid XML characters');
  xml = xml.replace(/^<\?xml version="1\.0"(?: encoding="UTF-8")?\?>\s*/, '');
  // Tokenize before discarding comments: a comment cannot split a tag or attribute.
  const tokens = /<!--([\s\S]*?)-->|<[^<>]*>|[^<]+/gy;
  let clean = '';
  let offset = 0;
  while (offset < xml.length) {
    const token = tokens.exec(xml);
    requireValue(token && token.index === offset, 'Invalid XML markup');
    if (token[1] !== undefined) {
      requireValue(!token[1].includes('--') && !token[1].endsWith('-'), 'Invalid XML comment');
    } else {
      requireValue(!token[0].startsWith('<!--'), 'Invalid XML comment');
      if (!token[0].startsWith('<')) {
        requireValue(!token[0].includes(']]>'), 'Invalid XML character data');
        decodeXml(token[0]); // Validate each text token before comments can join it.
      }
      clean += token[0];
    }
    offset = tokens.lastIndex;
  }
  xml = clean.trim();
  const root = /^<urlset((?:\s+xmlns(?::[a-z]+)?="[^"<>]*")*)\s*>([\s\S]*)<\/urlset>$/.exec(xml);
  requireValue(root, 'Invalid sitemap XML');
  const attrs = [...root[1].matchAll(/\s+(xmlns(?::[a-z]+)?)="([^"]*)"/g)];
  requireValue(new Set(attrs.map(m => m[1])).size === attrs.length, 'Duplicate XML namespace');
  for (const [, name, value] of attrs) {
    decodeXml(value);
    if (name === 'xmlns') requireValue(value === 'http://www.sitemaps.org/schemas/sitemap/0.9', 'Invalid sitemap namespace');
  }
  const urls = [];
  let rest = root[2].trim();
  while (rest) {
    const entry = /^<url>([\s\S]*?)<\/url>\s*/.exec(rest);
    requireValue(entry, 'Invalid sitemap entry');
    let fields = entry[1].trim();
    const seen = new Set();
    let loc;
    while (fields) {
      const field = /^<(loc|lastmod|changefreq|priority)>([^<]*)<\/\1>\s*/.exec(fields);
      requireValue(field && !seen.has(field[1]), 'Invalid sitemap field');
      seen.add(field[1]);
      const value = decodeXml(field[2]).trim();
      if (field[1] === 'loc') loc = validateUrl(value);
      fields = fields.slice(field[0].length);
    }
    requireValue(loc, 'Missing sitemap loc');
    urls.push(loc);
    rest = rest.slice(entry[0].length);
  }
  requireValue(urls.length, 'Žádné URL k odeslání.');
  return urls;
}
export function readKey(root) {
  const files = fs.readdirSync(path.join(root, 'public')).filter(f => /^[A-Za-z0-9-]{8,128}\.txt$/.test(f));
  requireValue(files.length === 1, 'V public/ chybí soubor s IndexNow klíčem (nebo není jednoznačný).');
  return files[0].slice(0, -4);
}
export async function sendBatch(urlList, key, fetchImpl = fetch) {
  requireValue(/^[A-Za-z0-9-]{8,128}$/.test(key) && urlList.length > 0 && urlList.length <= MAX_URLS_PER_REQUEST, 'Invalid IndexNow batch');
  urlList.forEach(validateUrl);
  const res = await fetchImpl(ENDPOINT, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'realtech.cz', key, keyLocation: `${ORIGIN}/${key}.txt`, urlList }),
  });
  // Never log a remote body (it can reflect credentials or arbitrary HTML).
  if (res.body) await res.body.cancel();
  requireValue(!res.redirected && [200, 202].includes(res.status), `HTTP ${res.status}: IndexNow rejected request`);
  return res.status;
}
async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const args = process.argv.slice(2);
  const unknown = args.filter(a => a.startsWith('--') && a !== '--dry-run');
  requireValue(!unknown.length, `Neznámý přepínač: ${unknown.join(', ')}`);
  const key = readKey(root);
  const paths = args.filter(a => !a.startsWith('--'));
  let urls;
  if (paths.length) urls = paths.map(p => {
    requireValue(!p.startsWith('//') && (!p.includes(':') || p.startsWith(`${ORIGIN}/`)), 'Invalid explicit URL');
    return validateUrl(p.startsWith(`${ORIGIN}/`) ? p : `${ORIGIN}/${p.replace(/^\//, '')}`);
  });
  else {
    const sitemap = path.join(root, 'dist/sitemap-0.xml');
    requireValue(fs.existsSync(sitemap), 'dist/sitemap-0.xml neexistuje — nejdřív spusť npm run build.');
    requireValue(fs.statSync(sitemap).size <= MAX_SITEMAP_BYTES, 'Sitemap too large');
    urls = parseSitemap(fs.readFileSync(sitemap));
  }
  if (args.includes('--dry-run')) {
    urls.forEach(u => console.log('  ' + u));
    console.log('(dry-run, nic se neodeslalo)');
    return;
  }
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    console.log(`✅ Odesláno (HTTP ${await sendBatch(urls.slice(i, i + MAX_URLS_PER_REQUEST), key)}).`);
  }
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`❌ ${error.message}`); process.exitCode = 1; });
}
