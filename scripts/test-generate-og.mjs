import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-og.mjs', import.meta.url));
const oldDate = new Date('2001-01-01T00:00:00.000Z');

function createFixture(t, title = 'Původní titulek') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'realtech-og-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
  writeArticle(root, title);
  writeCover(root, '#345678');

  return root;
}

function writeCover(root, color) {
  fs.writeFileSync(path.join(root, 'public/images/cover.svg'), `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="${color}"/>
    </svg>
  `);
}

function writeArticle(root, title) {
  fs.writeFileSync(path.join(root, 'src/content/clanky/clanek.md'), `---
title: "${title}"
image: "/images/cover.svg"
---
`);
}

function runGenerator(root) {
  return execFileSync(process.execPath, [generator], {
    cwd: root,
    encoding: 'utf8',
  });
}

function expectedFingerprint(root, title) {
  const imageHash = createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'public/images/cover.svg')))
    .digest('hex');
  return createHash('sha256')
    .update(JSON.stringify({ recipe: 1, title, imageHash }))
    .digest('hex');
}

test('změna titulku přegeneruje existující OG obrázek', (t) => {
  const root = createFixture(t);
  const out = path.join(root, 'public/images/og/clanek.jpg');
  const fingerprint = `${out}.sha256`;

  runGenerator(root);
  const originalImage = fs.readFileSync(out);
  const originalFingerprint = fs.readFileSync(fingerprint, 'utf8');
  fs.utimesSync(out, oldDate, oldDate);

  writeArticle(root, 'Nový titulek');
  assert.match(runGenerator(root), /vygenerováno: 1/);

  assert.notDeepEqual(fs.readFileSync(out), originalImage);
  assert.notEqual(fs.readFileSync(fingerprint, 'utf8'), originalFingerprint);
  assert.notEqual(fs.statSync(out).mtimeMs, oldDate.getTime());
});

test('nezměněné vstupy ponechají existující OG obrázek beze změny', (t) => {
  const root = createFixture(t);
  const out = path.join(root, 'public/images/og/clanek.jpg');
  const fingerprint = `${out}.sha256`;

  runGenerator(root);
  const originalImage = fs.readFileSync(out);
  const originalFingerprint = fs.readFileSync(fingerprint);
  fs.utimesSync(out, oldDate, oldDate);
  fs.utimesSync(fingerprint, oldDate, oldDate);

  assert.match(runGenerator(root), /vygenerováno: 0/);

  assert.deepEqual(fs.readFileSync(out), originalImage);
  assert.deepEqual(fs.readFileSync(fingerprint), originalFingerprint);
  assert.equal(fs.statSync(out).mtimeMs, oldDate.getTime());
  assert.equal(fs.statSync(fingerprint).mtimeMs, oldDate.getTime());
});

test('změna obsahu zdrojového coveru přegeneruje OG obrázek i fingerprint', (t) => {
  const root = createFixture(t);
  const out = path.join(root, 'public/images/og/clanek.jpg');
  const fingerprint = `${out}.sha256`;

  runGenerator(root);
  const originalImage = fs.readFileSync(out);
  const originalFingerprint = fs.readFileSync(fingerprint, 'utf8');
  fs.utimesSync(out, oldDate, oldDate);
  fs.utimesSync(fingerprint, oldDate, oldDate);

  writeCover(root, '#abcdef');
  assert.match(runGenerator(root), /vygenerováno: 1/);

  const currentFingerprint = fs.readFileSync(fingerprint, 'utf8');
  assert.notDeepEqual(fs.readFileSync(out), originalImage);
  assert.notEqual(currentFingerprint, originalFingerprint);
  assert.equal(currentFingerprint, `${expectedFingerprint(root, 'Původní titulek')}\n`);
  assert.notEqual(fs.statSync(out).mtimeMs, oldDate.getTime());
  assert.notEqual(fs.statSync(fingerprint).mtimeMs, oldDate.getTime());
});

test('existující OG bez fingerprintu se bezpečně přegeneruje', (t) => {
  const root = createFixture(t);
  const out = path.join(root, 'public/images/og/clanek.jpg');
  const fingerprint = `${out}.sha256`;

  runGenerator(root);
  const originalImage = fs.readFileSync(out);
  fs.rmSync(fingerprint);
  fs.utimesSync(out, oldDate, oldDate);

  assert.match(runGenerator(root), /vygenerováno: 1/);

  assert.deepEqual(fs.readFileSync(out), originalImage);
  assert.equal(fs.readFileSync(fingerprint, 'utf8'), `${expectedFingerprint(root, 'Původní titulek')}\n`);
  assert.notEqual(fs.statSync(out).mtimeMs, oldDate.getTime());
  assert.ok(fs.statSync(fingerprint).mtimeMs > oldDate.getTime());
});

test('existující OG s poškozeným fingerprintem se bezpečně přegeneruje', (t) => {
  const root = createFixture(t);
  const out = path.join(root, 'public/images/og/clanek.jpg');
  const fingerprint = `${out}.sha256`;

  runGenerator(root);
  const originalImage = fs.readFileSync(out);
  fs.writeFileSync(fingerprint, 'toto-neni-platny-fingerprint\n');
  fs.utimesSync(out, oldDate, oldDate);
  fs.utimesSync(fingerprint, oldDate, oldDate);

  assert.match(runGenerator(root), /vygenerováno: 1/);

  assert.deepEqual(fs.readFileSync(out), originalImage);
  assert.equal(fs.readFileSync(fingerprint, 'utf8'), `${expectedFingerprint(root, 'Původní titulek')}\n`);
  assert.notEqual(fs.statSync(out).mtimeMs, oldDate.getTime());
  assert.notEqual(fs.statSync(fingerprint).mtimeMs, oldDate.getTime());
});

test('video článek s lokálním coverem dostane brandovaný OG z coveru', (t) => {
  const root = createFixture(t);
  const articles = path.join(root, 'src/content/clanky');
  fs.rmSync(path.join(articles, 'clanek.md'));
  fs.writeFileSync(path.join(articles, 'video.md'), `---
title: "Video článek"
image: "/images/cover.svg"
video: "https://www.youtube.com/watch?v=aaaabbbbccc"
---
`);

  assert.match(runGenerator(root), /vygenerováno: 1/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'public/images/og')).sort(), [
    'video.jpg',
    'video.jpg.sha256',
  ]);
});

test('chybějící nebo neexistující lokální cover bez videa nevytvoří žádný výstup', (t) => {
  const root = createFixture(t);
  const articles = path.join(root, 'src/content/clanky');
  fs.rmSync(path.join(articles, 'clanek.md'));
  fs.writeFileSync(path.join(articles, 'bez-coveru.md'), `---
title: "Článek bez coveru"
---
`);
  fs.writeFileSync(path.join(articles, 'neexistujici-cover.md'), `---
title: "Článek s neexistujícím coverem"
image: "/images/neexistuje.svg"
---
`);

  assert.match(runGenerator(root), /vygenerováno: 0/);
  assert.deepEqual(fs.readdirSync(path.join(root, 'public/images/og')), []);
});
