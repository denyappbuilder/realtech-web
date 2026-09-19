#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseSitemap, MAX_SITEMAP_BYTES } from './indexnow.mjs';

export const MARKER_PATH = '/indexnow-deployment.json';
export const SHA = /^[a-f0-9]{40}$/;
export function digest(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export function deploymentOrigin(value) {
  // Allow only immutable Pages host syntax observed in authenticated checks.
  // Never infer this host from a dashboard deployment UUID or accept aliases.
  if (typeof value !== 'string' || !/^https:\/\/[a-f0-9]{8}\.realtech-web\.pages\.dev\/?$/.test(value)) throw new Error('Invalid immutable deployment URL');
  return new URL(value).origin;
}
function gitHead(root) {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim(); }
  catch { return null; }
}
export function generateMarker(root, env = process.env, actualSha = gitHead(root)) {
  const target = path.join(root, 'dist', MARKER_PATH.slice(1));
  fs.rmSync(target, { force: true });
  const names = ['CF_PAGES', 'CF_PAGES_BRANCH', 'CF_PAGES_COMMIT_SHA', 'CF_PAGES_URL'];
  if (names.every(n => env[n] === undefined)) return null;
  if (env.CF_PAGES !== '1' || !SHA.test(env.CF_PAGES_COMMIT_SHA ?? '') || typeof env.CF_PAGES_BRANCH !== 'string' || !/^[^\s\x00-\x1f\x7f]{1,255}$/.test(env.CF_PAGES_BRANCH)) throw new Error('Invalid Cloudflare build metadata');
  if (actualSha !== null && actualSha !== env.CF_PAGES_COMMIT_SHA) throw new Error('Cloudflare SHA differs from Git HEAD');
  const deploymentUrl = deploymentOrigin(env.CF_PAGES_URL);
  const sitemap = path.join(root, 'dist/sitemap-0.xml');
  if (fs.statSync(sitemap).size > MAX_SITEMAP_BYTES) throw new Error('Sitemap too large');
  const bytes = fs.readFileSync(sitemap);
  parseSitemap(bytes);
  const marker = { version: 1, branch: env.CF_PAGES_BRANCH, sha: env.CF_PAGES_COMMIT_SHA, deploymentUrl, sitemapSha256: digest(bytes) };
  fs.writeFileSync(target, JSON.stringify(marker) + '\n');
  return marker;
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const marker = generateMarker(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
    console.log(marker ? 'IndexNow build marker generated.' : 'Local build: no IndexNow deployment marker.');
  } catch { console.error('IndexNow marker failed: invalid build metadata or sitemap.'); process.exitCode = 1; }
}
