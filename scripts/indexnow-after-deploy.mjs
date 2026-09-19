#!/usr/bin/env node
// Scheduling is not deployment evidence. See docs/audit/INDEXNOW.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { ORIGIN, MAX_SITEMAP_BYTES, MAX_URLS_PER_REQUEST, parseSitemap, readKey, sendBatch } from './indexnow.mjs';
import { MARKER_PATH, SHA, digest, deploymentOrigin } from './indexnow-marker.mjs';

const REPO = 'denyappbuilder/realtech-web';
const API = `https://api.github.com/repos/${REPO}`;
const WORKFLOW_ID = 337523728;
const CF_APP = 85455;
const DETAILS = /^https:\/\/dash\.cloudflare\.com\/\?to=\/c521101b68ea535f22125c6a9a94d0a3\/pages\/view\/realtech-web\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const ensure = (value, message) => { if (!value) throw new Error(message); };

export function validateRun(event) {
  const r = event?.workflow_run;
  ensure(event?.repository?.full_name === REPO && r?.repository?.full_name === REPO && r?.head_repository?.full_name === REPO, 'Untrusted run repository');
  ensure(r.event === 'push' && r.head_branch === 'main' && r.status === 'completed' && r.conclusion === 'success', 'Run is not successful main push');
  ensure(r.name === 'npm test' && r.path === '.github/workflows/npm-test.yml' && r.workflow_id === WORKFLOW_ID && Number.isSafeInteger(r.id) && r.id > 0 && SHA.test(r.head_sha), 'Unexpected workflow identity');
  return { id: r.id, sha: r.head_sha };
}
function checkIdentity(check, sha) {
  ensure(Number.isSafeInteger(check?.id) && check.id > 0 && check.url === `${API}/check-runs/${check.id}`, 'Untrusted check repository');
  ensure(check.app?.id === CF_APP && check.head_sha === sha && check.status === 'completed' && check.conclusion === 'success', 'Cloudflare check is not successful for exact SHA');
  ensure(DETAILS.test(check.details_url), 'Unexpected Cloudflare account/project');
  ensure(Number.isSafeInteger(check.check_suite?.id) && check.check_suite.id > 0, 'Missing check suite');
  const links = [...(check.output?.summary ?? '').matchAll(/<a\s+href=(['"])([^'"<>]+)\1\s*>/g)].map(m => m[2]);
  // Any format change or multiple candidate URLs is deliberately ambiguous.
  ensure(links.length === 1, 'Ambiguous Cloudflare deployment URL');
  return { id: check.id, suiteId: check.check_suite.id, detailsUrl: check.details_url, deploymentUrl: deploymentOrigin(links[0]) };
}
function validateMarker(marker, sha, deploymentUrl) {
  ensure(marker && Object.keys(marker).sort().join(',') === 'branch,deploymentUrl,sha,sitemapSha256,version', 'Invalid marker schema');
  ensure(marker.version === 1 && marker.branch === 'main' && marker.sha === sha && marker.deploymentUrl === deploymentUrl && /^[a-f0-9]{64}$/.test(marker.sitemapSha256), 'Marker identity mismatch');
  return marker;
}
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function sameMarker(a, b) {
  return a.version === b.version && a.branch === b.branch && a.sha === b.sha && a.deploymentUrl === b.deploymentUrl && a.sitemapSha256 === b.sitemapSha256;
}
function fresh(headers) {
  const age = headers.get('age');
  const date = Date.parse(headers.get('date') ?? '');
  ensure(age === null || /^0$/.test(age), 'Cached evidence Age');
  ensure(Number.isFinite(date) && Math.abs(Date.now() - date) < 60_000, 'Stale evidence Date');
  ensure(!headers.has('warning') && /(?:no-store|no-cache|max-age=0)(?:\s*[,;]|$)/i.test(headers.get('cache-control') ?? ''), 'Evidence not revalidated');
}
export async function boundedRead(url, { fetchImpl = fetch, token, limit = 1024 * 1024, evidence = false, timeoutMs = 10_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let reader;
  try {
    const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } : { 'Cache-Control': 'no-cache, no-store, max-age=0', Pragma: 'no-cache' };
    const res = await fetchImpl(url, { method: 'GET', redirect: 'error', signal: controller.signal, headers });
    ensure(res.status === 200 && !res.redirected && (!res.url || res.url === String(url)), 'Evidence HTTP failure/redirect');
    if (evidence) fresh(res.headers);
    const length = res.headers.get('content-length');
    ensure(length === null || (/^\d+$/.test(length) && Number(length) <= limit), 'Response too large');
    ensure(res.body, 'Missing response body');
    reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      ensure(size <= limit, 'Response too large');
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally {
    controller.abort();
    if (reader) await reader.cancel().catch(() => {});
    clearTimeout(timer);
  }
}
export async function notifyDeployment({ event, token, key, fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), attempts = 30, dryRun = false }) {
  const { id, sha } = validateRun(event);
  ensure(typeof token === 'string' && token.length > 0 && /^[A-Za-z0-9-]{8,128}$/.test(key), 'Missing authorization/key');
  ensure(Number.isInteger(attempts) && attempts > 0 && attempts <= 30, 'Invalid poll bound');
  const deadline = Date.now() + 10 * 60_000;
  const checkDeadline = () => ensure(Date.now() < deadline, 'Production evidence deadline exceeded');
  const api = async suffix => {
    checkDeadline();
    return JSON.parse((await boundedRead(`${API}${suffix}`, { fetchImpl, token })).toString());
  };
  const publicRead = async (origin, suffix, limit) => {
    checkDeadline();
    return boundedRead(`${origin}${suffix}?indexnow=${randomUUID()}`, { fetchImpl, evidence: true, limit });
  };
  const markerAt = async origin => JSON.parse((await publicRead(origin, MARKER_PATH, 4096)).toString());
  const currentMain = async () => ensure((await api('/git/ref/heads/main')).object?.sha === sha, 'Main advanced');
  const checkSuite = async identity => {
    const suite = await api(`/check-suites/${identity.suiteId}`);
    ensure(suite.repository?.full_name === REPO && suite.app?.id === CF_APP && suite.head_sha === sha, 'Untrusted check suite');
    // suite.head_branch is deliberately NOT production evidence.
  };
  const liveRun = validateRun({ repository: event.repository, workflow_run: await api(`/actions/runs/${id}`) });
  ensure(same(liveRun, { id, sha }), 'Workflow run changed');
  await currentMain();
  let selected;
  for (let attempt = 0; attempt < attempts; attempt++) {
    let total;
    const checks = [];
    for (let page = 1; page <= 10; page++) {
      const result = await api(`/commits/${sha}/check-runs?filter=all&per_page=100&page=${page}`);
      ensure(Number.isInteger(result.total_count) && result.total_count >= 0 && result.total_count <= 1000 && Array.isArray(result.check_runs), 'Invalid checks pagination');
      total ??= result.total_count;
      ensure(result.total_count === total && result.check_runs.length <= 100, 'Checks changed during pagination');
      checks.push(...result.check_runs);
      if (checks.length === total) break;
      ensure(result.check_runs.length === 100 && checks.length < total, 'Incomplete checks pagination');
    }
    ensure(checks.length === total && new Set(checks.map(c => c.id)).size === total, 'Incomplete/duplicate checks');
    const candidates = checks.filter(c => c.app?.id === CF_APP && c.status === 'completed' && c.conclusion === 'success');
    for (const check of candidates) {
      const identity = checkIdentity(check, sha);
      await checkSuite(identity);
      const marker = await markerAt(identity.deploymentUrl);
      // An honest preview is not authority, even when suite.head_branch says main.
      if (marker.branch !== 'main') continue;
      validateMarker(marker, sha, identity.deploymentUrl);
      const production = validateMarker(await markerAt(ORIGIN), sha, identity.deploymentUrl);
      ensure(sameMarker(marker, production), 'Production digest mismatch');
      ensure(!selected, 'Multiple production candidates');
      selected = { identity, marker };
    }
    if (selected) break;
    if (attempt + 1 < attempts) { await sleep(20_000); await currentMain(); }
  }
  ensure(selected, 'No verified production deployment within poll bound');
  const { identity, marker } = selected;
  const bytes = await publicRead(ORIGIN, '/sitemap-0.xml', MAX_SITEMAP_BYTES);
  ensure(digest(bytes) === marker.sitemapSha256, 'Production sitemap digest mismatch');
  const urls = parseSitemap(bytes);
  const statuses = [];
  for (let offset = 0; offset < urls.length; offset += MAX_URLS_PER_REQUEST) {
    // Every POST gets its own final checks. These observations are NOT atomic.
    await currentMain();
    const current = checkIdentity(await api(`/check-runs/${identity.id}`), sha);
    ensure(same(current, identity), 'Selected deployment identity changed');
    await checkSuite(identity);
    const production = validateMarker(await markerAt(ORIGIN), sha, identity.deploymentUrl);
    ensure(sameMarker(production, marker), 'Production changed before notification');
    checkDeadline();
    if (!dryRun) statuses.push(await sendBatch(urls.slice(offset, offset + MAX_URLS_PER_REQUEST), key, fetchImpl));
  }
  return { dryRun, sha, checkId: identity.id, deploymentUrl: identity.deploymentUrl, sitemapSha256: marker.sitemapSha256, urls: urls.length, statuses };
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    ensure(process.argv.slice(2).every(arg => arg === '--dry-run'), 'Unknown argument');
    const result = await notifyDeployment({ event, token: process.env.GITHUB_TOKEN, key: readKey(root), dryRun: process.argv.includes('--dry-run') });
    console.log(JSON.stringify(result));
  } catch {
    // Do not expose API bodies, environment, reflected tokens, or arbitrary errors.
    console.error('IndexNow stopped: deployment evidence unavailable or validation failed.');
    process.exitCode = 1;
  }
}
