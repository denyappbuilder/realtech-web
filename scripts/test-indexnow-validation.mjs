import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseSitemap } from './indexnow.mjs';
import { generateMarker, digest } from './indexnow-marker.mjs';
import { createIndexNowFixture } from './indexnow-test-harness.mjs';

const invalidUtf8 = Buffer.concat([Buffer.from('<urlset><url><loc>https://realtech.cz/'), Buffer.from([255]), Buffer.from('/</loc></url></urlset>')]);
const markerEnv = { CF_PAGES: '1', CF_PAGES_BRANCH: 'main', CF_PAGES_COMMIT_SHA: 'a'.repeat(40), CF_PAGES_URL: 'https://abcd1234.realtech-web.pages.dev' };
test('invalid UTF-8 bytes reject without replacement in parser', () => {
  for (const bad of [[255], [0xc0, 0xaf], [0xe2, 0x82], [0xed, 0xa0, 0x80]]) {
    const bytes = Buffer.concat([Buffer.from('<urlset><url><loc>https://realtech.cz/'), Buffer.from(bad), Buffer.from('/</loc></url></urlset>')]);
    assert.throws(() => parseSitemap(bytes));
    assert.throws(() => parseSitemap(new Uint8Array(bytes)));
  }
});
test('invalid UTF-8 bytes cannot create a marker', t => {
  const root = createIndexNowFixture(t, []);
  fs.writeFileSync(`${root}/dist/sitemap-0.xml`, invalidUtf8);
  assert.throws(() => generateMarker(root, markerEnv, markerEnv.CF_PAGES_COMMIT_SHA));
  assert.equal(fs.existsSync(`${root}/dist/indexnow-deployment.json`), false);
});
test('invalid UTF-8 manual notification fails with POST=0', t => {
  const root = createIndexNowFixture(t, []);
  fs.writeFileSync(`${root}/dist/sitemap-0.xml`, invalidUtf8);
  const runner = `
    import { pathToFileURL } from 'node:url';
    let posts = 0;
    globalThis.fetch = async () => { posts++; return new Response('', { status: 202 }); };
    process.on('exit', () => console.log('POST=' + posts));
    await import(pathToFileURL(process.argv[1]).href);
  `;
  const r = spawnSync(process.execPath, ['--input-type=module', '--eval', runner, `${root}/scripts/indexnow.mjs`], { encoding: 'utf8' });
  assert.match(r.stdout, /POST=0/);
  assert.equal(r.status, 1, r.stderr);
});
test('UTF-8 byte views preserve Unicode and legitimate BOM', t => {
  const xml = '\ufeff<?xml version="1.0" encoding="UTF-8"?><urlset><url><loc>https://realtech.cz/český/</loc></url></urlset>';
  const bytes = Buffer.from(xml);
  const padded = Buffer.concat([Buffer.from([255]), bytes, Buffer.from([255])]);
  const view = new Uint8Array(padded.buffer, padded.byteOffset + 1, bytes.length);
  assert.deepEqual(parseSitemap(bytes), ['https://realtech.cz/český/']);
  assert.deepEqual(parseSitemap(view), ['https://realtech.cz/český/']);
  const root = createIndexNowFixture(t, []);
  fs.writeFileSync(`${root}/dist/sitemap-0.xml`, bytes);
  assert.equal(generateMarker(root, markerEnv, markerEnv.CF_PAGES_COMMIT_SHA).sitemapSha256, digest(bytes));
  assert.equal(dry(t, bytes).status, 0);
});

function dry(t, xml, args = ['--dry-run']) {
  const root = createIndexNowFixture(t, []);
  fs.writeFileSync(`${root}/dist/sitemap-0.xml`, xml);
  return spawnSync(process.execPath, [`${root}/scripts/indexnow.mjs`, ...args], { encoding: 'utf8' });
}
for (const url of ['http://realtech.cz/', 'https://evil.test/', 'https://realtech.cz:443/', 'https://u@realtech.cz/', 'https://realtech.cz/a/../b', 'https://realtech.cz//evil', 'https://realtech.cz/%2e%2e/a', 'https://realtech.cz/a#x', 'https://realtech.cz/a b', 'https://realtech.cz/%zz', 'https://realtech.cz/indexnow-deployment.json']) {
  test(`reject sitemap URL ${url}`, t => assert.equal(dry(t, `<urlset><url><loc>${url}</loc></url></urlset>`).status, 1));
}
for (const xml of ['<urlset><url><loc>https://realtech.cz/</loc></url>', '<urlset><url><loc>https://realtech.cz/</loc></url></urlset>junk', '<!DOCTYPE urlset [<!ENTITY x "https://realtech.cz/">]><urlset><url><loc>&x;</loc></url></urlset>', '<urlset><url><loc>https://realtech.cz/?a&b</loc></url></urlset>', '<urlset><loc>https://realtech.cz/</loc></urlset>', '<urlset><url><loc>https://realtech.cz/</loc><loc>https://realtech.cz/x</loc></url></urlset>', '<urlset><url><loc>https://realtech.cz/&#0;</loc></url></urlset>']) {
  test(`reject malformed XML ${xml.slice(0, 60)}`, t => assert.equal(dry(t, xml).status, 1));
}
for (const input of ['https://evil.test/', '//evil.test', 'http://realtech.cz/', '/a/../b', '/a#fragment']) {
  test(`reject explicit input ${input}`, t => assert.equal(dry(t, '', ['--dry-run', input]).status, 1));
}
  ['https://realtech.cz/%zz', 'https://realtech.cz/?q=%0a', 'https://realtech.cz/%252e%252e/'].forEach(url => {
    test(`reject escaped control/ambiguous path ${url}`, t => assert.equal(dry(t, `<urlset><url><loc>${url}</loc></url></urlset>`).status, 1));
  });

test('legal comments preserve text and encoded character-data delimiter', () => {
  assert.deepEqual(parseSitemap('<!-- ]]> & < > --><urlset><!-- between elements --><url><loc>https://realtech.cz/č<!-- text comment -->eský/?q=]]&gt;</loc></url></urlset><!-- after root -->'), ['https://realtech.cz/český/?q=]]>']);
});
test('all XML entities decoded once; comments ignored', t => {
  const r = dry(t, '<urlset><!-- <loc>https://evil.test/</loc> --><url><loc>https://realtech.cz/?q=&quot;&apos;&lt;&gt;&amp;&#65;&#x42;</loc></url></urlset>');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('https://realtech.cz/?q="\'<>\u0026AB'));
});
