import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { applyCspHashes, inlineHandlers, inlineScriptHashes, run, MAX_HASHES } from './csp-hashes.mjs';

// Kolo 59: sha256 hashe inline skriptů ve script-src (dist/_headers po buildu).
const h = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const HEADERS = `/*\n  X-Frame-Options: DENY\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://giscus.app; style-src 'self'\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n`;

test('kolo 59: hashuje jen vykonatelné inline skripty (ne src, ne JSON-LD, ne prázdné)', () => {
  const html = `<script>var a=1</script><script type="module">b()</script><script src="/x.js"></script>
    <script type="application/ld+json">{"@type":"X"}</script><script> </script>`;
  assert.deepEqual([...inlineScriptHashes(html)].sort(), [h('var a=1'), h('b()')].sort());
});

test('kolo 59: hashe jdou za self do script-src, zbytek CSP i ostatní hlavičky beze změny, idempotentní', () => {
  const once = applyCspHashes(HEADERS, new Set([h('b()'), h('var a=1')]));
  const line = once.match(/Content-Security-Policy: (.*)/)[1];
  assert.match(line, new RegExp(`script-src 'self' '${'sha256-'}`));
  assert.ok(line.includes("'unsafe-inline' https://giscus.app"), "unsafe-inline zůstává jako fallback pro prohlížeče bez CSP2");
  assert.ok(line.endsWith("style-src 'self'"));
  assert.ok(once.includes('Cache-Control: public, max-age=31536000, immutable'));
  assert.equal(applyCspHashes(once, new Set([h('b()'), h('var a=1')])), once, 'druhý běh nic nepřidá');
  assert.throws(() => applyCspHashes('/*\n  X-Frame-Options: DENY\n', new Set()), /nenalezena/);
});

test('kolo 59: on*= atributy a javascript: odkazy build zastaví (hash je nepokryje)', () => {
  assert.equal(inlineHandlers('<button onclick="x()">a</button>').length, 1);
  assert.equal(inlineHandlers('<a href="javascript:void(0)">a</a>').length, 1);
  assert.equal(inlineHandlers('<a href="/o-nas/" data-onclick="x">ok</a><p>onclick=</p>').length, 0);
});

test('kolo 59: run() nad mini dist zapíše hashe; příliš mnoho různých skriptů selže', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csp-'));
  fs.writeFileSync(path.join(dir, '_headers'), HEADERS);
  fs.mkdirSync(path.join(dir, 'a'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<script>theme()</script>');
  fs.writeFileSync(path.join(dir, 'a', 'index.html'), '<script>theme()</script><script type="module">k()</script>');
  assert.equal(run(dir), 2);
  assert.ok(fs.readFileSync(path.join(dir, '_headers'), 'utf8').includes(h('theme()')));
  for (let i = 0; i <= MAX_HASHES; i++) fs.writeFileSync(path.join(dir, `p${i}.html`), `<script>x${i}()</script>`);
  assert.throws(() => run(dir), /různých inline skriptů/);
  fs.rmSync(dir, { recursive: true });
});

test('kolo 59: build spouští csp-hashes nad dist před IndexNow markerem', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.build, /astro build && node scripts\/csp-hashes\.mjs dist && node scripts\/indexnow-marker\.mjs/);
});
