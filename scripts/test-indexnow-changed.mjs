// B18: IndexNow oznamuje jen změněné URL proti předchozímu ověřenému
// produkčnímu běhu. Offline — žádný živý POST, fake API i fake git.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { digest } from './indexnow-marker.mjs';
import { cestyZeSouboru, kategorieClanku, predchoziProdukcniSha, vyberUrl, zmeneneSoubory } from './indexnow-changed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = 'denyappbuilder/realtech-web';
const api = `https://api.github.com/repos/${repo}`;
const sha = 'a'.repeat(40);
const prev = 'b'.repeat(40);
const origin = 'https://abcd1234.realtech-web.pages.dev';
const URLS = ['https://realtech.cz/', 'https://realtech.cz/clanky/', 'https://realtech.cz/clanky/dji-ban-usa/', 'https://realtech.cz/clanky/starlink-1gbs-2026/', 'https://realtech.cz/temata/drony/', 'https://realtech.cz/o-nas/', 'https://realtech.cz/gdpr/'];

function fixture({ changed = [], previousRuns = [{ head_branch: 'main', conclusion: 'success', head_sha: prev }], ancestor = true } = {}) {
  const xml = `<urlset>${URLS.map(u => `<url><loc>${u}</loc></url>`).join('')}</urlset>`;
  const run = { id: 123, name: 'npm test', path: '.github/workflows/npm-test.yml', workflow_id: 337523728, event: 'push', status: 'completed', conclusion: 'success', head_branch: 'main', head_sha: sha, repository: { full_name: repo }, head_repository: { full_name: repo } };
  const check = { id: 456, url: `${api}/check-runs/456`, head_sha: sha, app: { id: 85455 }, status: 'completed', conclusion: 'success', check_suite: { id: 789 }, details_url: 'https://dash.cloudflare.com/?to=/c521101b68ea535f22125c6a9a94d0a3/pages/view/realtech-web/11111111-2222-4333-8444-555555555555', output: { summary: `<a href='${origin}'>${origin}</a>` } };
  const suite = { head_sha: sha, repository: { full_name: repo }, app: { id: 85455 }, head_branch: 'main' };
  const marker = { version: 1, branch: 'main', sha, deploymentUrl: origin, sitemapSha256: digest(xml) };
  const f = { run, check, suite, marker, xml, posts: [], gitCalls: [], main: sha };
  f.fetch = async (input, options) => {
    const u = new URL(input);
    if (options.method === 'POST') { f.posts.push(JSON.parse(options.body)); return new Response('', { status: 202 }); }
    if (u.origin === 'https://api.github.com') {
      let data;
      if (u.pathname.endsWith('/actions/runs/123')) data = f.run;
      else if (u.pathname.endsWith('/git/ref/heads/main')) data = { object: { sha: f.main } };
      else if (u.pathname.endsWith('/check-runs/456')) data = f.check;
      else if (u.pathname.endsWith('/check-suites/789')) data = f.suite;
      else if (u.pathname.endsWith('/check-runs')) data = { total_count: 1, check_runs: [f.check] };
      else if (u.pathname.endsWith('/actions/workflows/indexnow-after-deploy.yml/runs')) {
        assert.equal(u.searchParams.get('branch'), 'main');
        assert.equal(u.searchParams.get('status'), 'success');
        data = { workflow_runs: previousRuns };
      } else throw new Error(`unexpected fake API ${u.pathname}`);
      return Response.json(data);
    }
    const headers = { Date: new Date().toUTCString(), 'Cache-Control': 'public, max-age=0, must-revalidate' };
    return new Response(u.pathname === '/sitemap-0.xml' ? f.xml : JSON.stringify(f.marker), { headers });
  };
  f.git = args => {
    f.gitCalls.push(args.join(' '));
    if (args[0] === 'merge-base') { if (!ancestor) throw new Error('not ancestor'); return ''; }
    if (args[0] === 'diff') { assert.equal(args.at(-1), `${prev}..${sha}`); return changed.join('\n') + '\n'; }
    throw new Error(`unexpected git ${args[0]}`);
  };
  return f;
}
async function notify(f) {
  const { notifyDeployment } = await import(new URL('./indexnow-after-deploy.mjs', import.meta.url));
  return notifyDeployment({ event: { repository: { full_name: repo }, workflow_run: f.run }, token: 'fake-test-token', key: '0123456789abcdef', fetchImpl: f.fetch, sleep: async () => {}, attempts: 2, zmenene: { root: ROOT, git: f.git } });
}

test('mapování: článek → detail + / + /clanky/ + téma; videos.json → /; šablony/CSS/docs → nic', () => {
  const kat = slug => (slug === 'dji-ban-usa' ? 'Drony' : null);
  assert.deepEqual(cestyZeSouboru(['src/content/clanky/dji-ban-usa.md'], kat), ['/', '/clanky/', '/clanky/dji-ban-usa/', '/temata/drony/']);
  assert.deepEqual(cestyZeSouboru(['src/data/videos.json'], kat), ['/']);
  assert.deepEqual(cestyZeSouboru(['src/pages/o-nas.astro'], kat), ['/o-nas/']);
  assert.deepEqual(cestyZeSouboru(['src/pages/index.astro'], kat), ['/']);
  assert.deepEqual(cestyZeSouboru(['src/pages/clanky/[...id].astro', 'src/styles/global.css', 'src/components/Giscus.astro', 'docs/audit/RULES.md', '.github/workflows/indexnow-after-deploy.yml', 'scripts/indexnow-changed.mjs', 'public/images/clanky/x.webp'], kat), []);
});

test('kategorie z frontmatteru skutečného článku; neexistující slug → null', () => {
  assert.equal(kategorieClanku(ROOT, 'dji-ban-usa'), 'Drony');
  assert.equal(kategorieClanku(ROOT, 'neexistuje-' + Date.now()), null);
});

test('průnik se sitemapou: URL mimo produkci se nikdy nepošle, pořadí podle sitemapy', () => {
  assert.deepEqual(vyberUrl(['/clanky/neni-v-sitemape/', '/temata/drony/', '/'], URLS), ['https://realtech.cz/', 'https://realtech.cz/temata/drony/']);
  assert.deepEqual(vyberUrl([], URLS), []);
});

test('baseline: poslední úspěšný běh na main jiný než aktuální SHA; žádný → null', async () => {
  const runs = [{ head_branch: 'main', conclusion: 'success', head_sha: sha }, { head_branch: 'main', conclusion: 'success', head_sha: prev }];
  assert.equal(await predchoziProdukcniSha(async () => ({ workflow_runs: runs }), sha), prev);
  assert.equal(await predchoziProdukcniSha(async () => ({ workflow_runs: [] }), sha), null);
  await assert.rejects(predchoziProdukcniSha(async () => ({}), sha));
});

test('git: baseline mimo historii → STOP; jinak diff --name-only', () => {
  const calls = [];
  const git = args => { calls.push(args[0]); return args[0] === 'diff' ? 'a.md\n\nb.md\n' : ''; };
  assert.deepEqual(zmeneneSoubory(prev, sha, ROOT, git), ['a.md', 'b.md']);
  assert.throws(() => zmeneneSoubory(prev, sha, ROOT, () => { throw new Error('x'); }), /not an ancestor/);
  assert.throws(() => zmeneneSoubory('abc', sha, ROOT, git));
});

test('nový/změněný článek: POST jen detail + výpisy + téma, ne celá sitemapa', async () => {
  const f = fixture({ changed: ['src/content/clanky/dji-ban-usa.md', 'public/images/clanky/dji-ban-usa.webp'] });
  const r = await notify(f);
  assert.equal(r.baseline, prev);
  assert.equal(r.sitemapUrls, 7);
  assert.equal(r.urls, 4);
  assert.deepEqual(f.posts.length, 1);
  assert.deepEqual(f.posts[0].urlList, ['https://realtech.cz/', 'https://realtech.cz/clanky/', 'https://realtech.cz/clanky/dji-ban-usa/', 'https://realtech.cz/temata/drony/']);
});

test('jen šablony/workflow/docs: ověřená produkce, ale ŽÁDNÝ POST', async () => {
  const f = fixture({ changed: ['.github/workflows/indexnow-after-deploy.yml', 'scripts/indexnow-changed.mjs', 'src/pages/clanky/[...id].astro', 'docs/audit/RULES.md'] });
  const r = await notify(f);
  assert.equal(r.urls, 0);
  assert.equal(f.posts.length, 0);
  assert.ok(f.gitCalls.some(c => c.startsWith('diff --name-only')), 'diff se skutečně počítal');
});

test('prázdný diff: žádný POST', async () => {
  const f = fixture({ changed: [] });
  assert.equal((await notify(f)).urls, 0);
  assert.equal(f.posts.length, 0);
});

test('bez předchozího produkčního běhu: STOP, žádný POST (ne celý web)', async () => {
  const f = fixture({ changed: ['src/content/clanky/dji-ban-usa.md'], previousRuns: [] });
  await assert.rejects(notify(f), /No verified previous production run/);
  assert.equal(f.posts.length, 0);
});

test('baseline není předkem nasazeného SHA: STOP, žádný POST', async () => {
  const f = fixture({ changed: ['src/content/clanky/dji-ban-usa.md'], ancestor: false });
  await assert.rejects(notify(f), /not an ancestor/);
  assert.equal(f.posts.length, 0);
});

test('smazaný článek: detail není v sitemapě → nepošle se, výpisy ano', async () => {
  const f = fixture({ changed: ['src/content/clanky/smazany-clanek.md'] });
  const r = await notify(f);
  assert.deepEqual(f.posts[0].urlList, ['https://realtech.cz/', 'https://realtech.cz/clanky/']);
  assert.equal(r.urls, 2);
});

test('CLI zapíná výběr změněných URL; workflow má fetch-depth: 0 pro diff', () => {
  const cli = fs.readFileSync(path.join(ROOT, 'scripts/indexnow-after-deploy.mjs'), 'utf8');
  assert.match(cli, /zmenene: \{ root \}/);
  const wf = fs.readFileSync(path.join(ROOT, '.github/workflows/indexnow-after-deploy.yml'), 'utf8');
  assert.match(wf, /persist-credentials: false\n(\s*#.*\n)*\s*fetch-depth: 0/);
});
