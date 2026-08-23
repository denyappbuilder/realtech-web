// Video článek bez lokálního coveru: OG se skládá ze staženého YouTube
// náhledu (maxres → sd → hq) a otiskem je videoId — beze změny článku se
// při dalším běhu nic nestahuje ani negeneruje.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-og.mjs', import.meta.url));
const register = fileURLToPath(new URL('./test-generate-og-mocks/register.mjs', import.meta.url));
const fetchMock = fileURLToPath(new URL('./test-generate-og-mocks/fetch.mjs', import.meta.url));

function createFixture(t, { image } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'realtech-og-video-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/clanky/video.md'), `---
title: "Video článek"
${image ? `image: "${image}"\n` : ''}video: "https://www.youtube.com/watch?v=aaaabbbbccc"
---
`);

  return root;
}

function runGenerator(root, missingVariants = '') {
  return execFileSync(process.execPath, ['--import', register, '--import', fetchMock, generator], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, OG_TEST_MISSING_VARIANTS: missingVariants },
  });
}

function fetchedUrls(root) {
  const logFile = path.join(root, 'fetched-urls.txt');
  return fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean) : [];
}

test('video článek bez coveru dostane OG ze staženého YouTube náhledu', (t) => {
  const root = createFixture(t);

  assert.match(runGenerator(root), /vygenerováno: 1/);

  assert.ok(fs.existsSync(path.join(root, 'public/images/og/video.jpg')));
  assert.deepEqual(fetchedUrls(root), ['https://i.ytimg.com/vi/aaaabbbbccc/maxresdefault.jpg']);
  assert.equal(fs.readFileSync(path.join(root, 'sharp-input.bin'), 'utf8'), 'náhled maxresdefault\n');
});

test('chybějící maxresdefault a sddefault spadne na hqdefault', (t) => {
  const root = createFixture(t);

  assert.match(runGenerator(root, 'maxresdefault,sddefault'), /vygenerováno: 1/);

  assert.deepEqual(fetchedUrls(root), [
    'https://i.ytimg.com/vi/aaaabbbbccc/maxresdefault.jpg',
    'https://i.ytimg.com/vi/aaaabbbbccc/sddefault.jpg',
    'https://i.ytimg.com/vi/aaaabbbbccc/hqdefault.jpg',
  ]);
  assert.equal(fs.readFileSync(path.join(root, 'sharp-input.bin'), 'utf8'), 'náhled hqdefault\n');
});

test('nezměněný video článek se při dalším běhu nestahuje ani negeneruje', (t) => {
  const root = createFixture(t);

  runGenerator(root);
  fs.rmSync(path.join(root, 'fetched-urls.txt'));

  assert.match(runGenerator(root), /vygenerováno: 0/);
  assert.deepEqual(fetchedUrls(root), []);
});

test('video článek s lokálním coverem nic nestahuje — cover má přednost', (t) => {
  const root = createFixture(t, { image: '/images/cover.jpg' });
  fs.writeFileSync(path.join(root, 'public/images/cover.jpg'), 'cover fixture\n');

  assert.match(runGenerator(root), /vygenerováno: 1/);
  assert.deepEqual(fetchedUrls(root), []);
});
