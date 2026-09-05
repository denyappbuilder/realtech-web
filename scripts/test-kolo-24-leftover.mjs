// Kolo 24: hygiene po zveřejnění repa + leftover z auditu (po kolu 23).
// .env.example bez reálných ID, docs/giscus.md v souladu s živým stavem
// (kategorie Announcements, public repo, ops checklist), Dependabot.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import yaml from 'js-yaml';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');

const ENV_PROMENNE = [
  'PUBLIC_GISCUS_REPO',
  'PUBLIC_GISCUS_REPO_ID',
  'PUBLIC_GISCUS_CATEGORY',
  'PUBLIC_GISCUS_CATEGORY_ID',
];

// Skutečná giscus ID jsou base64 GraphQL node ID: po prefixu následuje
// dalších ~10+ znaků [A-Za-z0-9_-] (živě např. R_kgDOTL2n…). Placeholder
// smí za prefixem mít jen výpustku „…“ nebo nic.
const REALNE_REPO_ID = /R_kgDO[A-Za-z0-9_-]/;
const REALNE_CATEGORY_ID = /DIC_kwDO[A-Za-z0-9_-]/;

function hodnoty(env) {
  const out = new Map();
  for (const radek of env.split('\n')) {
    const m = radek.match(/^([A-Z_]+)=(.*)$/);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

// ── 1) .env.example ────────────────────────────────────────────────────────

test('kolo 24: .env.example existuje a .gitignore ho z pravidla .env.* vyjímá', () => {
  assert.ok(existsSync(join(koren, '.env.example')), '.env.example v kořeni chybí');
  const gitignore = cti('.gitignore');
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m, 'bez negace by .env.* šablonu ignorovalo');
});

test('kolo 24: .env.example má všechny čtyři PUBLIC_GISCUS_* proměnné', () => {
  const env = hodnoty(cti('.env.example'));
  for (const jmeno of ENV_PROMENNE) {
    assert.ok(env.has(jmeno), `.env.example nemá řádek ${jmeno}=`);
  }
  assert.equal(env.get('PUBLIC_GISCUS_REPO'), 'denyappbuilder/realtech-web');
  assert.equal(env.get('PUBLIC_GISCUS_CATEGORY'), 'Announcements', 'živá kategorie je Announcements');
});

test('kolo 24: .env.example nese jen placeholdery, žádné reálné ID tvaru R_kgDOTL2n / DIC_kwDO…', () => {
  const env = cti('.env.example');
  assert.doesNotMatch(env, REALNE_REPO_ID, 'za R_kgDO smí být jen výpustka');
  assert.doesNotMatch(env, REALNE_CATEGORY_ID, 'za DIC_kwDO smí být jen výpustka');
  assert.doesNotMatch(env, /R_kgDOTL2n/, 'reálné repo ID webu do šablony nepatří');

  const h = hodnoty(env);
  assert.match(h.get('PUBLIC_GISCUS_REPO_ID'), /^R_kgDO…?$/);
  assert.match(h.get('PUBLIC_GISCUS_CATEGORY_ID'), /^DIC_kwDO…?$/);
});

test('kolo 24: detektor reálných ID chytí R_kgDOTL2n…, placeholder s výpustkou pustí', () => {
  assert.match('PUBLIC_GISCUS_REPO_ID=R_kgDOTL2nAbc', REALNE_REPO_ID);
  assert.match('PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOTL2nAc4C', REALNE_CATEGORY_ID);
  assert.doesNotMatch('PUBLIC_GISCUS_REPO_ID=R_kgDO…', REALNE_REPO_ID);
  assert.doesNotMatch('PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDO…', REALNE_CATEGORY_ID);
});

// ── 2) docs/giscus.md v souladu s live ─────────────────────────────────────

test('kolo 24: docs/giscus.md popisuje kategorii Announcements jako záměr, ne vlastní „Komentáře“', () => {
  const docs = cti('docs/giscus.md');
  assert.match(docs, /^## 3\. Kategorie pro komentáře: Announcements$/m);
  assert.doesNotMatch(docs, /Název: `Komentáře`/, 'návod na založení kategorie „Komentáře“ neodpovídá live');
  assert.doesNotMatch(docs, /PUBLIC_GISCUS_CATEGORY=Komentáře/);
  assert.match(docs, /PUBLIC_GISCUS_CATEGORY=Announcements/);
  assert.match(docs, /zakládá nová\s+vlákna jen giscus app/, 'proč Announcements: vlákna zakládá jen giscus');
  assert.match(docs, /\*\*public\*\*/, 'repo je veřejné');
  assert.match(docs, /\.env\.example/, 'odkaz na šablonu env');
});

test('kolo 24: docs/giscus.md má ops checklist — jeden Insights beacon, ACAO je CF dashboard', () => {
  const docs = cti('docs/giscus.md');
  assert.match(docs, /^## Ops checklist \(Cloudflare Pages\)$/m);
  assert.match(docs, /Web Analytics beacon jen jednou/);
  assert.match(docs, /přesně jeden `static\.cloudflareinsights\.com\/beacon\.min\.js`/);
  assert.match(docs, /Access-Control-Allow-Origin: \*/);
});

// ── 3) Dependabot ──────────────────────────────────────────────────────────

test('kolo 24: .github/dependabot.yml hlídá npm i github-actions týdně v kořeni', () => {
  const konfig = yaml.load(cti('.github/dependabot.yml'));
  assert.equal(konfig.version, 2);
  assert.ok(Array.isArray(konfig.updates));

  const podle = new Map(konfig.updates.map((u) => [u['package-ecosystem'], u]));
  for (const eko of ['npm', 'github-actions']) {
    const u = podle.get(eko);
    assert.ok(u, `dependabot.yml nemá ekosystém ${eko}`);
    assert.equal(u.directory, '/', `${eko}: package.json i .github/workflows jsou v kořeni`);
    assert.equal(u.schedule?.interval, 'weekly', `${eko}: týdenní interval`);
  }
  assert.equal(podle.size, 2, 'jen npm a github-actions — jiný ekosystém v repu není');
});

// ── 5) ACAO není z repa ────────────────────────────────────────────────────

test('kolo 24: repo samo Access-Control-Allow-Origin nenastavuje (_headers ani middleware)', () => {
  assert.doesNotMatch(cti('public/_headers'), /Access-Control-Allow-Origin/i);
  assert.doesNotMatch(cti('functions/_middleware.js'), /Access-Control-Allow-Origin/i);
});
