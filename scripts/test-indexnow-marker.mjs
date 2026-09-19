import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

const moduleUrl = new URL('./indexnow-marker.mjs', import.meta.url);
const sha = 'a'.repeat(40);
const env = { CF_PAGES: '1', CF_PAGES_BRANCH: 'main', CF_PAGES_COMMIT_SHA: sha, CF_PAGES_URL: 'https://abcd1234.realtech-web.pages.dev' };
test('real build metadata creates digest marker; local build removes stale marker', async t => {
  assert.ok(fs.existsSync(moduleUrl), 'build marker generator required');
  const { generateMarker } = await import(moduleUrl);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'indexnow-marker-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(`${root}/dist`);
  const xml = '<urlset><url><loc>https://realtech.cz/</loc></url></urlset>';
  fs.writeFileSync(`${root}/dist/sitemap-0.xml`, xml);
  const marker = generateMarker(root, env, sha);
  assert.deepEqual(marker, { version: 1, branch: 'main', sha, deploymentUrl: env.CF_PAGES_URL, sitemapSha256: createHash('sha256').update(xml).digest('hex') });
  assert.deepEqual(JSON.parse(fs.readFileSync(`${root}/dist/indexnow-deployment.json`)), marker);
  assert.equal(generateMarker(root, {}, sha), null);
  assert.equal(fs.existsSync(`${root}/dist/indexnow-deployment.json`), false);
  for (const bad of [{ CF_PAGES: '0' }, { CF_PAGES_BRANCH: '' }, { CF_PAGES_COMMIT_SHA: 'short' }, { CF_PAGES_URL: 'https://main.realtech-web.pages.dev' }, { CF_PAGES_URL: 'https://abcd1234.other.pages.dev' }, { CF_PAGES_URL: 'https://abcd1234.realtech-web.pages.dev:443' }, { CF_PAGES_URL: 'https://abcd1234.realtech-web.pages.dev/path' }]) {
    fs.writeFileSync(`${root}/dist/indexnow-deployment.json`, 'stale');
    assert.throws(() => generateMarker(root, { ...env, ...bad }, sha));
    assert.equal(fs.existsSync(`${root}/dist/indexnow-deployment.json`), false);
  }
  assert.throws(() => generateMarker(root, env, 'b'.repeat(40)));
  assert.equal(generateMarker(root, { ...env, CF_PAGES_BRANCH: 'improve/indexnow' }, sha).branch, 'improve/indexnow');
  assert.equal(generateMarker(root, env, null).sha, sha, 'no Git is not permission to invent SHA');
});
