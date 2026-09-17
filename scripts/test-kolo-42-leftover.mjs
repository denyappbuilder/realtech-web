// Kolo 42: živý audit 17. 9. 2026 (po #462 premium redesignu, hero RTX
// Spark) proti kódu. Hero = nejnovější, audio/TOC/aside/share OK, archiv
// filtruje bez JS, kolo 41 drží. Co zbylo a je tady zamčené:
//
// P1 Base.astro emitoval design brief „<!-- THESIS: … -->“ jako HTML
//    komentář do KAŽDÉ stránky (home, archiv, články). Kolo 41 zakázalo
//    HTML komentáře jen v tělech článků — layout jím prošel. Teď je to
//    Astro komentář {/* … */} (do HTML se nekompiluje) a validate-content
//    shodí build za raw `<!--` v src/layouts/** a src/components/**.
// P1 Slug `gemini-notebook-external-sharing-admin`: titulek i lead od kola
//    40 mluví k běžnému uživateli („tvůj účet“), URL říkala admin. Přejmenováno
//    na `gemini-notebook-external-sharing` + 301; audio zůstává na starém
//    klíči CDN (přehrávač 200 bez přejmenování v R2).
// P1 Nav „Videa“ míří na YouTube, ale hádané /videa/ vracelo 404 — stejný
//    dluh jako /kontakt, /blog. 301 na kanál.
// P2 Hero rail: holý <img src=-640.webp> do slotu 100px; karty jinde mají
//    <picture> + sizes. Teď stejný vzor s HERO_RAIL_SIZES.
// P2 /temata/ai/ 404 — hub je /temata/ai-report/. 301.
// P2 RTX Spark (lokální AI PC) je AI Report a ve filtru Hardware chybí —
//    category zůstává (pravidlo jedné kategorie), hub /temata/hardware/
//    dostal kurátorovaný cross-link.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const base = cti('src/layouts/Base.astro');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezFrontmatteru = (zdroj) => zdroj.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
/** Direktivy Cloudflare (kolo 26) v HTML stát musí — jediná povolená výjimka. */
const bezEmailOff = (zdroj) => zdroj.replace(/<!--\/?email_off-->/g, '');
const sablona = (zdroj) => bezEmailOff(bezKomentaru(bezFrontmatteru(zdroj)));

// ── P1: design brief není HTML komentář ─────────────────────────────────────

test('kolo 42: THESIS v Base.astro je Astro komentář {/* … */}, ne raw <!-- -->', () => {
  assert.doesNotMatch(bezFrontmatteru(base), /<!--\s*THESIS/, 'THESIS jako HTML komentář jde do každé stránky');
  const astroKomentare = [...base.matchAll(/\{\/\*([\s\S]*?)\*\/\}/g)].map((m) => m[1]);
  const thesis = astroKomentare.find((k) => /THESIS:/.test(k));
  assert.ok(thesis, 'design brief má zůstat v kódu — jako Astro komentář');
  for (const radek of ['OWN-WORLD:', 'STORY:', 'FIRST VIEWPORT:', 'FORM:', 'FINISH:']) {
    assert.match(thesis, new RegExp(radek), `brief přišel o řádek ${radek}`);
  }
});

test('kolo 42: kompilát Base.astro neobsahuje THESIS ani žádný <!-- (Astro komentář se do HTML nekompiluje)', async () => {
  const { transform } = await import('@astrojs/compiler');
  const { code } = await transform(base, { filename: 'Base.astro', resolvePath: async (s) => s });
  assert.doesNotMatch(code, /THESIS/, 'brief v kompilátu = brief v HTML');
  assert.doesNotMatch(code, /<!--/, 'raw HTML komentář v kompilátu Base');
  // Kolo 41: </head> musí dál stát až za slotem head a beaconem.
  const konecHlavy = code.indexOf('</head>');
  assert.ok(code.indexOf('$$slots["head"]') < konecHlavy, 'slot head musí zůstat v <head>');
  assert.ok(code.indexOf('static.cloudflareinsights.com/beacon.min.js') < konecHlavy, 'beacon musí zůstat v <head>');
});

const astroSoubory = (dir) =>
  readdirSync(join(koren, dir), { recursive: true })
    .filter((f) => f.endsWith('.astro'))
    .map((f) => `${dir}/${f}`);

test('kolo 42: žádný raw <!-- v src/layouts/** ani src/components/** (mimo <!--email_off-->)', () => {
  const soubory = [...astroSoubory('src/layouts'), ...astroSoubory('src/components')];
  assert.ok(soubory.length >= 7, `čekám ≥ 7 .astro souborů, je ${soubory.length}`);
  for (const f of soubory) {
    assert.doesNotMatch(sablona(cti(f)), /<!--/, `${f}: HTML komentář jde do HTML — použij {/* … */}`);
  }
});

const VALIDATOR = join(koren, 'scripts/validate-content.mjs');
const FIXTURE_PREFIX = join(tmpdir(), 'realtech-kolo-42-');

function fixture(t, { layout, komponenta } = {}) {
  const root = mkdtempSync(FIXTURE_PREFIX);
  for (const dir of ['src/content/clanky', 'public/images/clanky', 'src/layouts', 'src/components']) {
    mkdirSync(join(root, dir), { recursive: true });
  }
  t.after(() => {
    assert.ok(root.startsWith(FIXTURE_PREFIX));
    rmSync(root, { recursive: true, force: true });
  });
  writeFileSync(
    join(root, 'src/content/clanky/pokus.md'),
    ['---', 'title: "Pokus"', 'description: "Popis pokusu."', 'category: "AI Report"', 'date: "2026-01-15"', '---', '', 'Odstavec.', ''].join('\n'),
  );
  if (layout !== undefined) writeFileSync(join(root, 'src/layouts/Pokus.astro'), layout);
  if (komponenta !== undefined) writeFileSync(join(root, 'src/components/Pokus.astro'), komponenta);
  return spawnSync(process.execPath, [VALIDATOR], { cwd: root, encoding: 'utf8' });
}

test('kolo 42: validate-content shodí build kvůli raw HTML komentáři v layoutu', (t) => {
  const vysledek = fixture(t, {
    layout: ['---', "const x = 1; // <!-- ve frontmatteru nevadí", '---', '<body>', '<!-- THESIS: A reading-led journal -->', '<slot />', '</body>', ''].join('\n'),
  });
  assert.equal(vysledek.error, undefined);
  assert.equal(vysledek.status, 1);
  assert.match(vysledek.stderr, /src\/layouts\/Pokus\.astro: HTML komentář jde doslova do HTML každé stránky — použij Astro \{\/\* … \*\/\}: „<!-- THESIS: A reading-led journal -->“/);
});

test('kolo 42: validate-content shodí build i kvůli komentáři v komponentě', (t) => {
  const vysledek = fixture(t, { komponenta: '<div>\n  <!-- TODO -->\n</div>\n' });
  assert.equal(vysledek.status, 1);
  assert.match(vysledek.stderr, /src\/components\/Pokus\.astro: HTML komentář/);
});

test('kolo 42: validate-content pustí Astro komentář, <!--email_off--> i chybějící adresáře layouts/components', (t) => {
  const ok = fixture(t, {
    layout: ['---', 'const a = 1;', '---', '{/* <!-- tohle je jen text v Astro komentáři --> */}', '<p><!--email_off--><a href="mailto:x@y.cz">x</a><!--/email_off--></p>', ''].join('\n'),
  });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /1 článků OK/);
  // Fixture kola 41 nemá src/layouts ani src/components — validator nesmí spadnout.
  const bezAdresaru = mkdtempSync(FIXTURE_PREFIX);
  t.after(() => rmSync(bezAdresaru, { recursive: true, force: true }));
  mkdirSync(join(bezAdresaru, 'src/content/clanky'), { recursive: true });
  mkdirSync(join(bezAdresaru, 'public/images/clanky'), { recursive: true });
  writeFileSync(
    join(bezAdresaru, 'src/content/clanky/pokus.md'),
    ['---', 'title: "Pokus"', 'description: "Popis pokusu."', 'category: "AI Report"', 'date: "2026-01-15"', '---', '', 'Odstavec.', ''].join('\n'),
  );
  const vysledek = spawnSync(process.execPath, [VALIDATOR], { cwd: bezAdresaru, encoding: 'utf8' });
  assert.equal(vysledek.status, 0, vysledek.stderr);
});

// ── Built HTML (jen když dist/ existuje — `npm run build` před testem) ─────

test('kolo 42: build v dist/ nenese žádný HTML komentář mimo <!--email_off-->', { skip: !existsSync(join(koren, 'dist/index.html')) && 'dist/ chybí (spusť npm run build)' }, () => {
  const html = readdirSync(join(koren, 'dist'), { recursive: true }).filter((f) => f.endsWith('.html'));
  assert.ok(html.length > 100, `čekám > 100 HTML souborů, je ${html.length}`);
  for (const f of html) {
    assert.doesNotMatch(bezEmailOff(cti(join('dist', f))), /<!--/, `dist/${f}: HTML komentář v produkčním HTML`);
  }
});
