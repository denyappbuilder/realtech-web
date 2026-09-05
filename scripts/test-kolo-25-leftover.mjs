// Kolo 25: leftover po živém auditu 5. 9. 2026 (po kolech 15–24).
// Tie-break hledání podle data, Dependabot ignore major Astro, CSP
// connect-src pro giscus.app, Canonical v security.txt, NewsArticle
// isAccessibleForFree, preconnect giscus jen u článku s komentáři.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import yaml from 'js-yaml';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');

const search = cti('src/components/SearchModal.astro');
const headers = cti('public/_headers');
const security = cti('public/.well-known/security.txt');
const clanek = cti('src/pages/clanky/[...id].astro');
const base = cti('src/layouts/Base.astro');

function cspDirektiva(jmeno) {
  const radek = headers.split(/\r?\n/).find((l) => l.trim().startsWith('Content-Security-Policy:'));
  assert.ok(radek, 'public/_headers musí mít Content-Security-Policy');
  const cast = radek.split(';').map((c) => c.trim()).find((c) => (
    c.startsWith(`${jmeno} `) || c.includes(`Content-Security-Policy: ${jmeno} `)
  ));
  return cast ?? '';
}

// ── 1) Hledání: datum jako tie-break, aktuální nápověda ────────────────────

test('kolo 25: search při shodě skóre řadí podle novějšího p, chybějící p ošetří', () => {
  const razeni = search.match(/\.sort\(\(a: any, b: any\) => \{([\s\S]*?)\}\)/)?.[1] ?? '';
  assert.match(razeni, /b\.score - a\.score/, 'primárně pořád skóre');
  assert.match(razeni, /dateB\.localeCompare\(dateA\)/, 'při shodě novější p první');
  assert.match(razeni, /typeof a\.it\?\.p === 'string'/, 'chybějící p nesmí shodit řazení');
  assert.match(razeni, /typeof b\.it\?\.p === 'string'/);
});

test('kolo 25: prázdný stav hledání nabízí Astra / Anthropic / Starlink, ne DJI / Claude', () => {
  assert.match(
    search,
    /Napiš, co hledáš — třeba <em>Astra<\/em>, <em>Anthropic<\/em> nebo <em>Starlink<\/em>\./,
  );
  assert.doesNotMatch(search, /<em>DJI<\/em>/);
  assert.doesNotMatch(search, /<em>Claude<\/em>/);
});

// ── 2) Dependabot: major Astro ignorovat ───────────────────────────────────

test('kolo 25: Dependabot týdně hlídá npm, ale major astro / @astrojs/* ignoruje', () => {
  const konfig = yaml.load(cti('.github/dependabot.yml'));
  assert.equal(konfig.version, 2);
  const npm = konfig.updates.find((u) => u['package-ecosystem'] === 'npm');
  assert.ok(npm, 'npm ekosystém musí zůstat');
  assert.equal(npm.schedule?.interval, 'weekly');
  const ignore = npm.ignore ?? [];
  const podle = new Map(ignore.map((i) => [i['dependency-name'], i]));
  for (const jmeno of ['astro', '@astrojs/*']) {
    const pravidlo = podle.get(jmeno);
    assert.ok(pravidlo, `chybí ignore pro ${jmeno}`);
    assert.deepEqual(pravidlo['update-types'], ['version-update:semver-major']);
  }
  assert.match(
    cti('.github/dependabot.yml'),
    /Major skok Astro/,
    'komentář v češtině — major skok patří do vlastního kola',
  );
});

// ── 3) CSP: connect-src pouští giscus.app, img-src ne ──────────────────────

test('kolo 25: connect-src má giscus.app, img-src ho nemá a ostatní zámky drží', () => {
  assert.match(cspDirektiva('connect-src'), /https:\/\/giscus\.app/);
  assert.match(cspDirektiva('connect-src'), /https:\/\/cloudflareinsights\.com/);
  assert.match(cspDirektiva('connect-src'), /https:\/\/app\.kit\.com/);
  assert.doesNotMatch(cspDirektiva('img-src'), /giscus|github/);
  assert.match(cspDirektiva('script-src'), /https:\/\/giscus\.app/);
  assert.match(cspDirektiva('frame-src'), /https:\/\/giscus\.app/);
  assert.equal((headers.match(/giscus\.app/g) ?? []).length, 4);
});

// ── 4) security.txt Canonical ──────────────────────────────────────────────

test('kolo 25: security.txt má Canonical na vlastní URL a drží Contact / jazyky / Expires', () => {
  assert.match(security, /^Canonical: https:\/\/realtech\.cz\/\.well-known\/security\.txt$/m);
  assert.match(security, /^Contact: mailto:info@realtech\.cz$/m);
  assert.match(security, /^Preferred-Languages: cs, en$/m);
  assert.match(security, /^Expires: 2027-07-18T00:00:00\.000Z$/m);
});

// ── 5) NewsArticle isAccessibleForFree ─────────────────────────────────────

test('kolo 25: NewsArticle JSON-LD nese isAccessibleForFree: true', () => {
  assert.match(clanek, /'@type': 'NewsArticle'/);
  assert.match(clanek, /isAccessibleForFree: true/);
});

// ── 6) Preconnect giscus jen u článku s komentáři ──────────────────────────

test('kolo 25: giscus.app se předpojuje jen když se komentáře vykreslí', () => {
  assert.match(base, /preconnectGiscus\?: boolean/);
  assert.match(base, /preconnectGiscus = false/);
  assert.match(base, /\{preconnectGiscus && <link rel="preconnect" href="https:\/\/giscus\.app" \/>\}/);
  assert.match(clanek, /const preconnectGiscus = Boolean\(giscusKonfigurace\(import\.meta\.env\)\)/);
  assert.match(clanek, /preconnectGiscus=\{preconnectGiscus\}/);
  assert.doesNotMatch(cti('src/pages/index.astro'), /preconnectGiscus/);
});
