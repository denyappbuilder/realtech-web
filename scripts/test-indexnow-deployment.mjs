import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { digest } from './indexnow-marker.mjs';

const moduleUrl = new URL('./indexnow-after-deploy.mjs', import.meta.url);
const repo = 'denyappbuilder/realtech-web';
const api = `https://api.github.com/repos/${repo}`;
const sha = 'a'.repeat(40);
const origin = 'https://abcd1234.realtech-web.pages.dev';
function fixture(count = 2) {
  const xml = `<urlset>${Array.from({ length: count }, (_, i) => `<url><loc>https://realtech.cz/page/${i}/</loc></url>`).join('')}</urlset>`;
  const run = { id: 123, name: 'npm test', path: '.github/workflows/npm-test.yml', workflow_id: 337523728, event: 'push', status: 'completed', conclusion: 'success', head_branch: 'main', head_sha: sha, repository: { full_name: repo }, head_repository: { full_name: repo } };
  const check = { id: 456, url: `${api}/check-runs/456`, head_sha: sha, app: { id: 85455 }, status: 'completed', conclusion: 'success', check_suite: { id: 789 }, details_url: 'https://dash.cloudflare.com/?to=/c521101b68ea535f22125c6a9a94d0a3/pages/view/realtech-web/11111111-2222-4333-8444-555555555555', output: { summary: `<a href='${origin}'>${origin}</a>` } };
  const suite = { head_sha: sha, repository: { full_name: repo }, app: { id: 85455 }, head_branch: 'main' };
  const marker = { version: 1, branch: 'main', sha, deploymentUrl: origin, sitemapSha256: digest(xml) };
  const f = { run, check, suite, marker, xml, posts: [], reads: [], main: sha };
  f.fetch = async (input, options) => {
    const u = new URL(input);
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    f.reads.push(u.pathname);
    if (options.method === 'POST') {
      assert.equal(String(input), 'https://api.indexnow.org/indexnow');
      assert.equal(options.headers.Authorization, undefined);
      f.posts.push(JSON.parse(options.body));
      return new Response('', { status: 202 });
    }
    if (u.origin === 'https://api.github.com') {
      assert.equal(options.headers.Authorization, 'Bearer fake-test-token');
      let data;
      if (u.pathname.endsWith('/actions/runs/123')) data = f.run;
      else if (u.pathname.endsWith('/git/ref/heads/main')) data = { object: { sha: f.main } };
      else if (u.pathname.endsWith('/check-runs/456')) data = f.check;
      else if (u.pathname.endsWith('/check-suites/789')) data = f.suite;
      else if (u.pathname.endsWith('/check-runs')) data = { total_count: 1, check_runs: [f.check] };
      else throw new Error(`unexpected fake API ${u.pathname}`);
      return Response.json(data);
    }
    assert.ok([origin, 'https://realtech.cz'].includes(u.origin));
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.headers['Cache-Control'], 'no-cache, no-store, max-age=0');
    assert.ok(u.searchParams.has('indexnow'));
    const headers = { Date: new Date().toUTCString(), 'Cache-Control': 'public, max-age=0, must-revalidate', 'CF-Cache-Status': 'DYNAMIC' };
    return new Response(u.pathname === '/sitemap-0.xml' ? f.xml : JSON.stringify(f.marker), { headers });
  };
  return f;
}
async function notify(f, options = {}) {
  assert.ok(fs.existsSync(moduleUrl), 'deployment gate required');
  const { notifyDeployment } = await import(moduleUrl);
  return notifyDeployment({ event: { repository: { full_name: repo }, workflow_run: f.run }, token: 'fake-test-token', key: '0123456789abcdef', fetchImpl: f.fetch, sleep: async () => {}, attempts: 2, ...options });
}
for (const [name, mutate] of [
  ['fork', f => { f.run.head_repository.full_name = 'fork/realtech-web'; }],
  ['wrong repository', f => { f.run.repository.full_name = 'other/repo'; }],
  ['PR named main', f => { f.run.event = 'pull_request'; }],
  ['workflow dispatch', f => { f.run.event = 'workflow_dispatch'; }],
  ['wrong workflow', f => { f.run.workflow_id++; }],
  ['wrong path', f => { f.run.path = '.github/workflows/evil.yml'; }],
  ['failed run', f => { f.run.conclusion = 'failure'; }],
  ['malformed SHA', f => { f.run.head_sha = 'abc'; }],
  ['advanced main', f => { f.main = 'b'.repeat(40); }],
  ['wrong app', f => { f.check.app.id = 123; }],
  ['wrong check repo', f => { f.check.url = f.check.url.replace('denyappbuilder', 'fork'); }],
  ['wrong suite repo', f => { f.suite.repository.full_name = 'fork/realtech-web'; }],
  ['wrong suite app', f => { f.suite.app.id = 123; }],
  ['wrong check SHA', f => { f.check.head_sha = 'b'.repeat(40); }],
  ['wrong project', f => { f.check.details_url = f.check.details_url.replace('/realtech-web/', '/other/'); }],
  ['wrong account', f => { f.check.details_url = f.check.details_url.replace('c521101b68ea535f22125c6a9a94d0a3', 'a'.repeat(32)); }],
  ['failed deploy', f => { f.check.conclusion = 'failure'; }],
  ['pending deploy', f => { f.check.status = 'in_progress'; }],
  ['same-SHA preview main-looking suite', f => { f.marker.branch = 'feature'; }],
  ['wrong marker SHA', f => { f.marker.sha = 'b'.repeat(40); }],
  ['wrong marker deployment', f => { f.marker.deploymentUrl = 'https://deadbeef.realtech-web.pages.dev'; }],
  ['wrong sitemap digest', f => { f.xml += ' '; }],
  ['bad marker digest', f => { f.marker.sitemapSha256 = 'not-a-digest'; }],
  ['alias', f => { f.check.output.summary = "<a href='https://main.realtech-web.pages.dev'>link</a>"; }],
  ['ambiguous URLs', f => { f.check.output.summary += f.check.output.summary; }],
  ['credentials in deployment URL', f => { f.check.output.summary = `<a href='https://user@abcd1234.realtech-web.pages.dev'>link</a>`; }],
]) {
  test(`no POST: ${name}`, async () => {
    const f = fixture(); mutate(f);
    await assert.rejects(notify(f));
    assert.equal(f.posts.length, 0);
  });
}
for (const [name, xml] of [
  ['invalid UTF-8', Buffer.concat([Buffer.from('<urlset><url><loc>https://realtech.cz/'), Buffer.from([255]), Buffer.from('/</loc></url></urlset>')])],
  ['comment splitting entity', '<urlset><url><loc>https://realtech.cz/?q=&am<!---->p;</loc></url></urlset>'],
  ['comment inside tag name', '<urlset><url><lo<!---->c>https://realtech.cz/example/</loc></url></urlset>'],
  ['forbidden character data', '<urlset><url><loc>https://realtech.cz/?q=]]></loc></url></urlset>'],
]) {
  test(`no POST: matching-digest malformed XML ${name}`, async () => {
    const f = fixture(); f.xml = xml; f.marker.sitemapSha256 = digest(xml);
    const error = await notify(f).then(() => null, e => e);
    assert.equal(f.posts.length, 0, 'invalid XML must never reach POST');
    assert.ok(error, 'must reject malformed XML');
  });
}
for (const mode of ['cached', 'stale', 'missing freshness', 'redirect', '404', 'oversize', 'timeout', 'bad XML']) {
  test(`no POST: ${mode} public evidence`, async () => {
    const f = fixture();
    const original = f.fetch;
    f.fetch = async (url, options) => {
      const r = await original(url, options);
      if (!String(url).startsWith(origin)) return r;
      if (mode === 'cached') r.headers.set('CF-Cache-Status', 'HIT');
      if (mode === 'stale') r.headers.set('Age', '15');
      if (mode === 'missing freshness') r.headers.delete('Date');
      if (mode === 'redirect') return new Response('', { status: 302, headers: { Location: origin } });
      if (mode === '404') return new Response('', { status: 404 });
      if (mode === 'oversize') r.headers.set('content-length', '999999');
      if (mode === 'timeout') throw new DOMException('test timeout', 'TimeoutError');
      if (mode === 'bad XML') { f.xml = '<bad>'; f.marker.sitemapSha256 = digest(f.xml); return new Response(JSON.stringify(f.marker), { headers: r.headers }); }
      return r;
    };
    await assert.rejects(notify(f));
    assert.equal(f.posts.length, 0);
  });
}
for (const mode of ['main', 'rollback', 'check', 'check identity', 'digest']) {
  test(`final recheck stops ${mode} before first batch`, async () => {
    const f = fixture(); const original = f.fetch;
    f.fetch = async (url, options) => {
      const r = await original(url, options);
      if (String(url).includes('/sitemap-0.xml')) {
        if (mode === 'main') f.main = 'b'.repeat(40);
        if (mode === 'rollback') f.marker.sha = 'b'.repeat(40);
        if (mode === 'check') f.check.conclusion = 'failure';
        if (mode === 'check identity') f.check.details_url = f.check.details_url.replace('11111111-', '99999999-');
        if (mode === 'digest') f.marker.sitemapSha256 = '0'.repeat(64);
      }
      return r;
    };
    await assert.rejects(notify(f)); assert.equal(f.posts.length, 0);
  });
}
test('advance between batches prevents second POST; valid rerun may resubmit', async () => {
  const f = fixture(10001); const original = f.fetch;
  f.fetch = async (url, options) => { const r = await original(url, options); if (options.method === 'POST') f.main = 'b'.repeat(40); return r; };
  await assert.rejects(notify(f)); assert.equal(f.posts.length, 1);
  const replay = fixture(); await notify(replay); await notify(replay); assert.equal(replay.posts.length, 2);
});
test('polls pending deployment with bounded attempts', async () => {
  const f = fixture(); f.check.status = 'in_progress'; let sleeps = 0;
  await notify(f, { sleep: async () => { sleeps++; f.check.status = 'completed'; } });
  assert.equal(sleeps, 1); assert.equal(f.posts.length, 1);
});
test('paginates all checks, no reliance on first page', async () => {
  const f = fixture(); const original = f.fetch;
  f.fetch = async (url, options) => {
    if (String(url).includes('/commits/')) {
      const first = new URL(url).searchParams.get('page') === '1';
      return Response.json({ total_count: 101, check_runs: first ? Array.from({ length: 100 }, (_, i) => ({ id: 1000 + i, app: { id: 42 } })) : [f.check] });
    }
    return original(url, options);
  };
  await notify(f); assert.equal(f.posts.length, 1);
});
test('production dry-run verifies complete chain but performs zero POSTs', async () => {
  const f = fixture();
  const result = await notify(f, { dryRun: true });
  assert.equal(result.dryRun, true);
  assert.equal(result.urls, 2);
  assert.equal(f.posts.length, 0);
  console.log('OFFLINE production dry-run: verified exact SHA and payload; POST=0');
});
test('preview dry-run fails closed with zero POSTs', async () => {
  const f = fixture(); f.marker.branch = 'improve/indexnow';
  await assert.rejects(notify(f, { dryRun: true }));
  assert.equal(f.posts.length, 0);
  console.log('OFFLINE same-SHA preview dry-run: rejected; POST=0');
});
test('absolute ten-minute evidence deadline fails with ZERO POSTs', async t => {
  const f = fixture(); f.check.status = 'in_progress';
  let now = Date.now();
  t.mock.method(Date, 'now', () => now);
  await assert.rejects(notify(f, { sleep: async () => {
    now += 600001;
    f.check.status = 'completed';
  } }), /deadline/);
  assert.equal(f.posts.length, 0);
});
test('production not ready by poll deadline FAILS with ZERO POST and no fallback', async () => {
  const f = fixture(); f.marker.branch = 'preview'; let sleeps = 0;
  await assert.rejects(notify(f, { sleep: async () => { sleeps++; }, attempts: 2 }), /poll bound/);
  assert.equal(sleeps, 1);
  assert.equal(f.posts.length, 0);
  console.log('OFFLINE production deadline exhausted: FAIL; POST=0; no fallback/deploy');
});
test('trusted exact-main build bound to production; unrelated UUID never guessed; batches recheck', async () => {
  const f = fixture(10001);
  const result = await notify(f);
  assert.equal(result.sha, sha);
  assert.deepEqual(f.posts.map(p => p.urlList.length), [10000, 1]);
  assert.equal(f.reads.filter(p => p.endsWith('/git/ref/heads/main')).length, 3);
  assert.equal(f.reads.filter(p => p === '/indexnow-deployment.json').length, 4);
  assert.equal(f.reads.filter(p => p.endsWith('/check-runs/456')).length, 2);
});
