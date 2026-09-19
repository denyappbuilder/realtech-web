import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { boundedRead } from './indexnow-after-deploy.mjs';

const repo = 'denyappbuilder/realtech-web';
const run = { id: 123, name: 'npm test', path: '.github/workflows/npm-test.yml', workflow_id: 337523728, event: 'push', status: 'completed', conclusion: 'success', head_branch: 'main', head_sha: 'a'.repeat(40), repository: { full_name: repo }, head_repository: { full_name: repo } };
const event = { repository: { full_name: repo }, workflow_run: run };
const workflow = yaml.load(fs.readFileSync(new URL('../.github/workflows/indexnow-after-deploy.yml', import.meta.url), 'utf8'));
test('workflow read permissions, successful main scheduling, exact validated checkout, no artifact trust', () => {
  assert.deepEqual(workflow.permissions, { contents: 'read', checks: 'read', actions: 'read' });
  assert.deepEqual(workflow.on, { workflow_run: { workflows: ['npm test'], types: ['completed'], branches: ['main'] } });
  assert.equal(workflow['concurrency']['cancel-in-progress'], true);
  const steps = workflow.jobs['notify-indexnow'].steps;
  assert.match(steps[0].uses, /github-script/);
  assert.equal(steps[1].with.ref, '${{ steps.source.outputs.sha }}');
  assert.equal(steps[1].with['persist-credentials'], false);
  assert.equal(steps[1].with.repository, repo);
  assert.equal(steps.some(s => /download-artifact/.test(s.uses ?? '')), false);
  assert.ok(workflow.jobs['notify-indexnow']['timeout-minutes'] <= 20);
});
for (const scenario of ['valid', 'fork', 'PR', 'advanced', 'wrong workflow', 'wrong live run']) {
  test(`execute actual pre-checkout workflow guard: ${scenario}`, async () => {
    const input = structuredClone(event);
    if (scenario === 'fork') input.workflow_run.head_repository.full_name = 'evil/repo';
    if (scenario === 'PR') input.workflow_run.event = 'pull_request';
    if (scenario === 'wrong workflow') input.workflow_run.workflow_id++;
    const outputs = [];
    const sandbox = {
      context: { payload: input }, core: { setOutput: (...args) => outputs.push(args) },
      process: { env: { GITHUB_TOKEN: 'fake-token' } }, Buffer, AbortSignal,
      fetch: async (url, options) => {
        assert.equal(options.redirect, 'error'); assert.ok(options.signal);
        if (url.endsWith('/actions/runs/123')) return Response.json({ ...run, id: scenario === 'wrong live run' ? 999 : 123 });
        assert.ok(url.endsWith('/git/ref/heads/main'));
        return Response.json({ object: { sha: scenario === 'advanced' ? 'b'.repeat(40) : run.head_sha } });
      },
    };
    // Execute only our local static workflow source, never fetched code/artifacts.
    const result = vm.runInNewContext(`(async () => { ${workflow.jobs['notify-indexnow'].steps[0].with.script} })()`, sandbox);
    if (scenario === 'valid') { await result; assert.deepEqual(outputs, [['sha', run.head_sha]]); }
    else { await assert.rejects(result); assert.deepEqual(outputs, []); }
  });
}
test('stream byte limit applies without Content-Length', async () => {
  await assert.rejects(boundedRead('https://fixture.invalid/', { limit: 10, fetchImpl: async () => new Response('a'.repeat(11)) }), /too large/);
});
test('rejected headers abort response body before any unbounded read', async () => {
  let signal;
  await assert.rejects(boundedRead('https://fixture.invalid/', { evidence: true, fetchImpl: async (_, options) => {
    signal = options.signal;
    return new Response('untrusted body', { headers: { Age: '15' } });
  } }));
  assert.equal(signal.aborted, true);
});
test('network timeout really aborts a pending request', async () => {
  let aborted = false;
  await assert.rejects(boundedRead('https://fixture.invalid/', { timeoutMs: 5, fetchImpl: async (_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); }, { once: true });
  }) }), /aborted/);
  assert.equal(aborted, true);
});
test('CLI poll exhaustion exits nonzero, ZERO POSTs, no fallback', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'indexnow-cli-gate-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'event.json'); fs.writeFileSync(file, JSON.stringify(event));
  const script = fileURLToPath(new URL('./indexnow-after-deploy.mjs', import.meta.url));
  const runner = `
    import { pathToFileURL } from 'node:url';
    const timer = globalThis.setTimeout;
    globalThis.setTimeout = (fn, ms, ...args) => timer(fn, ms === 20000 ? 0 : ms, ...args);
    let posts = 0;
    globalThis.fetch = async (url, options) => {
      if (options.method === 'POST') { posts++; throw new Error('POST forbidden'); }
      if (url.endsWith('/actions/runs/123')) return Response.json(${JSON.stringify(run)});
      if (url.endsWith('/git/ref/heads/main')) return Response.json({object:{sha:${JSON.stringify(run.head_sha)}}});
      if (url.includes('/check-runs?')) return Response.json({total_count:0,check_runs:[]});
      throw new Error('Unexpected fake request');
    };
    process.on('exit', () => console.log('OFFLINE CLI POST_COUNT=' + posts));
    await import(pathToFileURL(process.argv[1]));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', runner, script], {
    encoding: 'utf8', timeout: 5000, env: { ...process.env, GITHUB_TOKEN: 'fake-token', GITHUB_EVENT_PATH: file },
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /POST_COUNT=0/);
  assert.match(result.stderr, /IndexNow stopped/);
  assert.doesNotMatch(result.stdout + result.stderr, /fake-token/);
  console.log('OFFLINE actual CLI: exhausted production polling -> exit=1 POST_COUNT=0');
});
