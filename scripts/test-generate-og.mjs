import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
  fs.writeFileSync(path.join(root, 'public/images/cover.svg'), `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="#345678"/>
    </svg>
  `);

  return root;
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
