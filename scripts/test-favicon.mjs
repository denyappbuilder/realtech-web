import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const icoPath = path.join(root, 'public/favicon.ico');
const base = fs.readFileSync(path.join(root, 'src/layouts/Base.astro'), 'utf8');
const redirects = fs.readFileSync(path.join(root, 'public/_redirects'), 'utf8');
const headers = fs.readFileSync(path.join(root, 'public/_headers'), 'utf8');

test('public/favicon.ico je skutečné ICO, ne chybějící soubor', () => {
  assert.ok(fs.existsSync(icoPath), 'chybí public/favicon.ico — prohlížeče ho tahají i bez <link>');
  const body = fs.readFileSync(icoPath);
  assert.ok(body.length > 64, `favicon.ico je příliš malý (${body.length} B)`);
  assert.equal(body.readUInt16LE(0), 0, 'ICO reserved musí být 0');
  assert.equal(body.readUInt16LE(2), 1, 'typ 1 = ICO, ne CUR');
  assert.ok(body.readUInt16LE(4) >= 1, 'ICO musí obsahovat aspoň jeden snímek');
});

test('head odkazuje i /favicon.ico a pořád nechá SVG', () => {
  assert.match(base, /<link rel="icon" href="\/favicon\.ico"/);
  assert.match(base, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);
});

test('favicon.svg se na ico ne301uje', () => {
  assert.doesNotMatch(redirects, /favicon\.svg.*favicon\.ico/);
  assert.doesNotMatch(redirects, /favicon\.ico.*favicon\.svg/);
});

test('_headers dává favicon.ico stejnou týdenní cache jako SVG', () => {
  assert.match(
    headers,
    /\/favicon\.ico\n\s+Cache-Control:\s*public, max-age=604800/,
  );
});

function servePublic() {
  return http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.resolve(root, 'public', rel);
    const publicRoot = `${path.resolve(root, 'public')}${path.sep}`;
    if (!file.startsWith(publicRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end('<html>404</html>');
      return;
    }
    const type = file.endsWith('.ico')
      ? 'image/x-icon'
      : file.endsWith('.svg')
        ? 'image/svg+xml'
        : 'application/octet-stream';
    const body = fs.readFileSync(file);
    res.writeHead(200, { 'content-type': type, 'content-length': body.length });
    res.end(body);
  });
}

test('GET /favicon.ico z public/ vrací 200 image, ne 404 text/html', async () => {
  const server = servePublic();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const missing = await fetch(`http://127.0.0.1:${port}/neexistuje.ico`);
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get('content-type'), /text\/html/);

    const res = await fetch(`http://127.0.0.1:${port}/favicon.ico`);
    assert.equal(res.status, 200, `živě 28. 8. 2026 bylo 404 text/html, teď ${res.status}`);
    assert.match(res.headers.get('content-type'), /^image\//);
    assert.notEqual(res.headers.get('content-type'), 'text/html; charset=utf-8');
    const buf = Buffer.from(await res.arrayBuffer());
    assert.equal(buf.readUInt16LE(0), 0);
    assert.equal(buf.readUInt16LE(2), 1);
  } finally {
    server.close();
  }
});
