#!/usr/bin/env node
// Kolo 59: CSP bez spoléhání na 'unsafe-inline'.
//
// public/_headers nese `script-src 'self' 'unsafe-inline' …`. Celý web má ale
// jen pár inline skriptů (theme v Base, ⌘K popisek, formát času přehrávače,
// theme u embedu X, slova z adresy na 404, případně inline chunk giscusu) a
// žádné on*= atributy ani javascript: odkazy (sken dist 27. 9. 2026: 5–6
// různých těl na 161 stránkách). Po buildu proto spočítáme sha256 každého
// inline <script> ve vyrenderovaném HTML a přidáme je do script-src
// v dist/_headers.
//
// Proč po buildu a ne ručně: obsah inline skriptů dělá Vite/Astro — hash
// z lokálního buildu se lišil od buildu na Cloudflare (giscus chunk tam byl
// inline, lokálně ne). Počítá se vždy na stroji, který nasazuje.
//
// 'unsafe-inline' ve zdrojovém public/_headers zůstává: prohlížeč s CSP
// Level 2+ ho při přítomnosti hashe IGNORUJE (CSP3 §6.7.3.5), takže platí
// jen hashe; starý prohlížeč bez podpory hashů spadne zpět na unsafe-inline
// a web se mu nerozbije. Test test-x-embed / kolo-23 dál vidí zdroj beze změny.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Max délka hodnoty hlavičky v _headers (Cloudflare Pages: 2 000 znaků). */
export const MAX_HEADER = 2000;
/** Víc různých inline skriptů = něco se změnilo (per-page data v inline skriptu) → build selže, ať to někdo vidí. */
export const MAX_HASHES = 16;

/** sha256 hashe (CSP formát) všech inline <script> kromě JSON-LD a skriptů se src. */
export function inlineScriptHashes(html) {
  const out = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attrs, body] = m;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/type\s*=\s*["']?application\/(?:ld\+)?json/i.test(attrs)) continue;
    if (!body.trim()) continue;
    out.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return out;
}

/** Nevykonatelné inline JS mimo <script> (atributy on*=, javascript: URL) — hash je nepokryje. */
export function inlineHandlers(html) {
  return [...html.matchAll(/<[a-z][^>]*?\s(on[a-z]+)\s*=|href\s*=\s*["']\s*javascript:/gi)].map((m) => m[0].slice(0, 80));
}

/** Vloží hashe do script-src v textu _headers (za 'self'). Idempotentní. */
export function applyCspHashes(headers, hashes) {
  const list = [...hashes].sort();
  let hits = 0;
  const next = headers.replace(/^(\s*Content-Security-Policy:\s*)(.*)$/gim, (line, prefix, value) => {
    const directives = value.split(';').map((d) => d.trim()).filter(Boolean);
    const i = directives.findIndex((d) => /^script-src\s/.test(d));
    if (i === -1) return line;
    hits++;
    const parts = directives[i].split(/\s+/).filter((p) => !/^'sha256-/.test(p));
    const self = parts.indexOf("'self'");
    parts.splice(self === -1 ? 1 : self + 1, 0, ...list);
    directives[i] = parts.join(' ');
    const joined = directives.join('; ');
    if (joined.length > MAX_HEADER) throw new Error(`CSP má ${joined.length} znaků, limit ${MAX_HEADER}`);
    return prefix + joined;
  });
  if (!hits) throw new Error('_headers: nenalezena Content-Security-Policy se script-src');
  return next;
}

function htmlFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

export function run(dist) {
  const hashes = new Set();
  const handlers = [];
  for (const f of htmlFiles(dist)) {
    const html = fs.readFileSync(f, 'utf8');
    for (const h of inlineScriptHashes(html)) hashes.add(h);
    for (const h of inlineHandlers(html)) handlers.push(`${path.relative(dist, f)}: ${h}`);
  }
  if (handlers.length) throw new Error(`inline handlery by CSP s hashi zablokovala:\n${handlers.slice(0, 5).join('\n')}`);
  if (hashes.size > MAX_HASHES) throw new Error(`${hashes.size} různých inline skriptů (limit ${MAX_HASHES}) — nejspíš per-page data v inline skriptu`);
  const file = path.join(dist, '_headers');
  fs.writeFileSync(file, applyCspHashes(fs.readFileSync(file, 'utf8'), hashes));
  return hashes.size;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const n = run(process.argv[2] || 'dist');
  console.log(`[csp-hashes] script-src: ${n} sha256 hashů inline skriptů`);
}
