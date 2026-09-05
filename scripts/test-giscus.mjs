// Komentáře pod články (giscus, GitHub Discussions).
//
//  1. Konfigurace z env (src/lib/giscus.js): bez PUBLIC_GISCUS_REPO_ID nebo
//     PUBLIC_GISCUS_CATEGORY_ID žádná konfigurace → žádný widget.
//  2. Skutečné HTML komponenty (Giscus.astro přes @astrojs/compiler +
//     astro/container): sekce je v HTML jen s kompletním env, bez něj
//     komponenta nevydá NIC — ani modul skriptu.
//  3. Klientský modul (src/lib/giscus-klient.js): vkládá client.js se
//     správnými data-*, drží téma v souladu s webem, je idempotentní.
//  4. Umístění v šabloně článku, CSS, CSP v public/_headers, dokumentace.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test, { beforeEach } from 'node:test';
import { fileURLToPath } from 'node:url';

import './test-giscus-register.mjs';

import {
  GISCUS_CLIENT_SRC,
  GISCUS_ORIGIN,
  GISCUS_PEVNE,
  GISCUS_POVINNE,
  GISCUS_VYCHOZI_REPO,
  giscusChybejici,
  giscusDiskuzeUrl,
  giscusKonfigurace,
  giscusTema,
  resetVarovaniGiscus,
  varujGiscus,
} from '../src/lib/giscus.js';
import {
  atributySkriptu,
  inicializujGiscus,
  poslatTemaGiscus,
} from '../src/lib/giscus-klient.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const PAGE = cti('src/pages/clanky/[...id].astro');
const KOMPONENTA = cti('src/components/Giscus.astro');
const CSS = cti('src/styles/global.css');
const HEADERS = cti('public/_headers');
const DOCS = cti('docs/giscus.md');
const README = cti('README.md');
const GITIGNORE = cti('.gitignore');

const ENV_KOMPLETNI = Object.freeze({
  PUBLIC_GISCUS_REPO_ID: 'R_kgDOtest',
  PUBLIC_GISCUS_CATEGORY_ID: 'DIC_kwDOtest',
  PUBLIC_GISCUS_CATEGORY: 'Komentáře',
});

beforeEach(() => {
  resetVarovaniGiscus();
});

// ── 1. Konfigurace z env ─────────────────────────────────────────────

test('bez repo ID nebo category ID není konfigurace (žádný rozbitý iframe)', () => {
  assert.equal(giscusKonfigurace(undefined), null);
  assert.equal(giscusKonfigurace({}), null);
  assert.equal(giscusKonfigurace({ PUBLIC_GISCUS_REPO_ID: 'R_x' }), null);
  assert.equal(giscusKonfigurace({ PUBLIC_GISCUS_CATEGORY_ID: 'DIC_x' }), null);
  assert.equal(
    giscusKonfigurace({ PUBLIC_GISCUS_REPO_ID: '   ', PUBLIC_GISCUS_CATEGORY_ID: 'DIC_x' }),
    null,
    'prázdná hodnota (mezery) je stejně chybějící',
  );
  assert.equal(
    giscusKonfigurace({ PUBLIC_GISCUS_REPO_ID: 'R_x', PUBLIC_GISCUS_CATEGORY_ID: '' }),
    null,
  );
  assert.deepEqual(GISCUS_POVINNE, ['PUBLIC_GISCUS_REPO_ID', 'PUBLIC_GISCUS_CATEGORY_ID']);
  assert.deepEqual(giscusChybejici({}), GISCUS_POVINNE);
  assert.deepEqual(giscusChybejici({ PUBLIC_GISCUS_REPO_ID: 'R_x' }), ['PUBLIC_GISCUS_CATEGORY_ID']);
  assert.deepEqual(giscusChybejici(ENV_KOMPLETNI), []);
});

test('s oběma ID vzniká konfigurace; repo má výchozí hodnotu, kategorie je volitelná', () => {
  assert.equal(GISCUS_VYCHOZI_REPO, 'denyappbuilder/realtech-web');
  assert.deepEqual(giscusKonfigurace(ENV_KOMPLETNI), {
    repo: 'denyappbuilder/realtech-web',
    repoId: 'R_kgDOtest',
    category: 'Komentáře',
    categoryId: 'DIC_kwDOtest',
  });
  assert.deepEqual(
    giscusKonfigurace({ PUBLIC_GISCUS_REPO_ID: ' R_x ', PUBLIC_GISCUS_CATEGORY_ID: ' DIC_x ' }),
    { repo: GISCUS_VYCHOZI_REPO, repoId: 'R_x', category: '', categoryId: 'DIC_x' },
    'hodnoty se ořezávají, kategorie bez env je prázdná (giscus bere jen ID)',
  );
  assert.equal(
    giscusKonfigurace({ ...ENV_KOMPLETNI, PUBLIC_GISCUS_REPO: 'jiny-ucet/jiny.repo_1' }).repo,
    'jiny-ucet/jiny.repo_1',
  );
  assert.equal(
    giscusKonfigurace({ ...ENV_KOMPLETNI, PUBLIC_GISCUS_REPO: '  ' }).repo,
    GISCUS_VYCHOZI_REPO,
    'prázdné PUBLIC_GISCUS_REPO = výchozí repo',
  );
});

test('repo mimo tvar vlastnik/repozitar konfiguraci shodí — hodnota končí v URL iframu', () => {
  for (const repo of ['realtech-web', 'a/b/c', 'javascript:alert(1)', 'deny app/realtech', '-deny/realtech', 'deny/realtech web']) {
    assert.equal(giscusKonfigurace({ ...ENV_KOMPLETNI, PUBLIC_GISCUS_REPO: repo }), null, repo);
  }
});

test('varování o chybějícím env se vypíše jednou, jmenuje proměnné a ukáže na docs', () => {
  const zpravy = [];
  const konzole = { warn: (z) => zpravy.push(z) };

  assert.equal(varujGiscus(ENV_KOMPLETNI, konzole), false, 'kompletní env nevaruje');
  assert.equal(varujGiscus({ PUBLIC_GISCUS_REPO_ID: 'R_x' }, konzole), true);
  assert.equal(varujGiscus({}, konzole), false, 'druhé volání už nevaruje (dev server renderuje každý článek)');
  assert.equal(zpravy.length, 1);
  assert.match(zpravy[0], /^\[giscus\] /);
  assert.match(zpravy[0], /PUBLIC_GISCUS_CATEGORY_ID/);
  assert.doesNotMatch(zpravy[0], /PUBLIC_GISCUS_REPO_ID/, 'jmenuje jen to, co opravdu chybí');
  assert.match(zpravy[0], /docs\/giscus\.md/);
});

test('téma: ruční přepnutí webu má přednost, jinak preferred_color_scheme', () => {
  assert.equal(giscusTema('dark'), 'dark');
  assert.equal(giscusTema('light'), 'light');
  assert.equal(giscusTema(undefined), 'preferred_color_scheme');
  assert.equal(giscusTema(''), 'preferred_color_scheme');
  assert.equal(giscusTema('purple'), 'preferred_color_scheme', 'neznámá hodnota nesmí utéct do URL widgetu');
});

test('odkaz na diskuze a pevná konfigurace widgetu podle zadání', () => {
  assert.equal(giscusDiskuzeUrl('denyappbuilder/realtech-web'), 'https://github.com/denyappbuilder/realtech-web/discussions');
  assert.equal(GISCUS_ORIGIN, 'https://giscus.app');
  assert.equal(GISCUS_CLIENT_SRC, 'https://giscus.app/client.js');
  assert.equal(GISCUS_PEVNE.lang, 'cs');
  assert.equal(GISCUS_PEVNE.mapping, 'pathname');
  assert.equal(GISCUS_PEVNE.reactionsEnabled, '1');
  assert.equal(GISCUS_PEVNE.inputPosition, 'top');
  assert.equal(GISCUS_PEVNE.loading, 'lazy');
  assert.ok(Object.isFrozen(GISCUS_PEVNE));
});

// ── 2. Skutečné HTML komponenty ──────────────────────────────────────

let cisloFixture = 0;

async function vykresliKomponentu(env) {
  globalThis.__giscusEnv = env;
  cisloFixture += 1;
  const { default: Giscus } = await import(`../src/components/Giscus.astro?giscus-test=${cisloFixture}`);
  const { experimental_AstroContainer: AstroContainer } = await import('astro/container');
  const container = await AstroContainer.create();
  return container.renderToString(Giscus);
}

test('s kompletním env je v HTML sekce Komentáře s konfigurací v data-* a modulem skriptu', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const html = await vykresliKomponentu({ ...ENV_KOMPLETNI, DEV: true });

  assert.match(html, /<section class="komentare" id="komentare" aria-labelledby="komentare-nadpis">/);
  assert.match(html, /<h2 id="komentare-nadpis">Komentáře<\/h2>/, 'nadpis česky, h2 = stejná úroveň jako „Další reporty“ a „Audio přehled“');
  assert.equal((html.match(/<h[1-6]\b/g) ?? []).length, 1, 'v sekci je jediný nadpis');
  assert.match(html, /<a href="https:\/\/github\.com\/denyappbuilder\/realtech-web\/discussions" rel="noopener">Diskuze na GitHubu →<\/a>/);

  const kontejner = html.match(/<div class="giscus"[^>]*><\/div>/)?.[0];
  assert.ok(kontejner, 'prázdný kontejner .giscus — client.js si ho najde přes querySelector(".giscus")');
  assert.match(kontejner, / data-giscus/);
  assert.match(kontejner, / data-repo="denyappbuilder\/realtech-web"/);
  assert.match(kontejner, / data-repo-id="R_kgDOtest"/);
  assert.match(kontejner, / data-category="Komentáře"/);
  assert.match(kontejner, / data-category-id="DIC_kwDOtest"/);
  assert.equal((html.match(/class="giscus"/g) ?? []).length, 1, 'jen jeden .giscus na stránce');

  assert.match(html, /<noscript>[\s\S]*href="https:\/\/github\.com\/denyappbuilder\/realtech-web\/discussions"[\s\S]*<\/noscript>/, 'únik bez JavaScriptu');
  assert.match(html, /<script type="module" src="[^"]*Giscus\.astro\?astro&type=script[^"]*"><\/script>/, 'klientský modul se renderuje');
  assert.doesNotMatch(html, /giscus\.app\/client\.js/, 'client.js vkládá až klientský modul (kvůli tématu), ne serverové HTML');
  assert.equal(warn.mock.callCount(), 0, 'kompletní env nevaruje');
});

test('bez env komponenta nevydá nic — ani sekci, ani skript; dev server jednou varuje', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});

  const bezVseho = await vykresliKomponentu({ DEV: true });
  assert.equal(bezVseho.trim(), '', `bez env má být HTML prázdné, je:\n${bezVseho}`);
  assert.equal(warn.mock.callCount(), 1);
  assert.match(String(warn.mock.calls[0].arguments[0]), /PUBLIC_GISCUS_REPO_ID a PUBLIC_GISCUS_CATEGORY_ID/);

  const jenRepoId = await vykresliKomponentu({ PUBLIC_GISCUS_REPO_ID: 'R_x', DEV: true });
  assert.equal(jenRepoId.trim(), '', 'jen repo ID nestačí');
  assert.equal(warn.mock.callCount(), 1, 'varování je jednorázové');
});

test('v produkčním buildu (DEV=false) se bez env nevaruje, HTML je stejně prázdné', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const html = await vykresliKomponentu({ DEV: false, PROD: true });
  assert.equal(html.trim(), '');
  assert.equal(warn.mock.callCount(), 0);
});

test('hodnoty z env se v HTML escapují (env je vstup, ne kód)', async () => {
  const html = await vykresliKomponentu({
    ...ENV_KOMPLETNI,
    PUBLIC_GISCUS_CATEGORY: 'Komentáře" onmouseover="alert(1)',
  });
  assert.doesNotMatch(html, /onmouseover="alert/);
  assert.match(html, /data-category="Komentáře(?:&quot;|&#34;) onmouseover=(?:&quot;|&#34;)alert\(1\)"/);
});

// ── 3. Klientský modul ───────────────────────────────────────────────

/** Minimální DOM: jen to, co giscus-klient.js opravdu volá. */
function prvek(tag, { dataset = {}, classes = [], attrs = {} } = {}) {
  const el = {
    tagName: tag.toUpperCase(),
    dataset: { ...dataset },
    children: [],
    _attrs: { ...attrs },
    _classes: new Set(classes),
    classList: {
      contains: (c) => el._classes.has(c),
      add: (c) => el._classes.add(c),
      remove: (c) => el._classes.delete(c),
    },
    appendChild(dite) { el.children.push(dite); return dite; },
    getAttribute: (n) => el._attrs[n] ?? null,
    setAttribute(n, v) { el._attrs[n] = String(v); },
  };
  return el;
}

function dokument({ kontejner, iframe, theme, mutationObserver = true } = {}) {
  const pozorovatele = [];
  const root = prvek('html', { dataset: theme ? { theme } : {} });
  const doc = {
    documentElement: root,
    _vytvorene: [],
    createElement(tag) {
      const el = prvek(tag);
      doc._vytvorene.push(el);
      return el;
    },
    querySelector(selektor) {
      if (selektor === '.giscus[data-giscus]') return kontejner ?? null;
      if (selektor === 'iframe.giscus-frame') return iframe ?? null;
      throw new Error(`Neočekávaný selektor: ${selektor}`);
    },
    defaultView: {
      MutationObserver: mutationObserver
        ? class {
            constructor(cb) { this.cb = cb; pozorovatele.push(this); }
            observe(cil, volby) { this.cil = cil; this.volby = volby; }
          }
        : undefined,
    },
  };
  return { doc, root, pozorovatele };
}

function kontejnerZEnv(env = ENV_KOMPLETNI) {
  const k = giscusKonfigurace(env);
  return prvek('div', {
    classes: ['giscus'],
    dataset: { giscus: '', repo: k.repo, repoId: k.repoId, category: k.category, categoryId: k.categoryId },
  });
}

test('atributy skriptu: konfigurace z kontejneru + pevná část + téma, bez ID nic', () => {
  const a = atributySkriptu({ repo: 'a/b', repoId: 'R', category: 'Kat', categoryId: 'D' }, 'dark');
  assert.deepEqual(a, {
    repo: 'a/b', repoId: 'R', category: 'Kat', categoryId: 'D',
    mapping: 'pathname', strict: '0', reactionsEnabled: '1', emitMetadata: '0',
    inputPosition: 'top', lang: 'cs', loading: 'lazy', theme: 'dark',
  });
  assert.equal(atributySkriptu({ repo: 'a/b', repoId: 'R', categoryId: 'D' }, undefined).category, '', 'kategorie chybí → prázdná, giscus bere ID');
  assert.equal(atributySkriptu({ repo: 'a/b', repoId: 'R', categoryId: 'D' }, undefined).theme, 'preferred_color_scheme');
  assert.equal(atributySkriptu({ repo: 'a/b', categoryId: 'D' }, 'dark'), null);
  assert.equal(atributySkriptu({ repo: 'a/b', repoId: 'R' }, 'dark'), null);
  assert.equal(atributySkriptu({ repoId: 'R', categoryId: 'D' }, 'dark'), null);
});

test('inicializace vloží client.js do kontejneru se všemi data-* a tématem webu', () => {
  const kontejner = kontejnerZEnv();
  const { doc, pozorovatele } = dokument({ kontejner, theme: 'dark' });

  const skript = inicializujGiscus(doc);
  assert.ok(skript, 'vrací vložený skript');
  assert.equal(skript.tagName, 'SCRIPT');
  assert.equal(skript.src, 'https://giscus.app/client.js');
  assert.equal(skript.async, true);
  assert.equal(skript.crossOrigin, 'anonymous');
  assert.deepEqual(kontejner.children, [skript], 'skript sedí v .giscus — client.js pak iframe vloží do téhož kontejneru');
  assert.deepEqual(skript.dataset, {
    repo: 'denyappbuilder/realtech-web',
    repoId: 'R_kgDOtest',
    category: 'Komentáře',
    categoryId: 'DIC_kwDOtest',
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    lang: 'cs',
    loading: 'lazy',
    theme: 'dark',
  });
  assert.equal(kontejner.dataset.giscusBezi, '1');
  assert.equal(pozorovatele.length, 1, 'sleduje data-theme na <html>');
  assert.deepEqual(pozorovatele[0].volby, { attributes: true, attributeFilter: ['data-theme'] });
  assert.equal(pozorovatele[0].cil, doc.documentElement);
});

test('bez ručního přepnutí jde widgetu preferred_color_scheme — OS sleduje sám', () => {
  const kontejner = kontejnerZEnv();
  const { doc } = dokument({ kontejner });
  assert.equal(inicializujGiscus(doc).dataset.theme, 'preferred_color_scheme');
});

test('inicializace je idempotentní a bez kontejneru / bez ID nic nevkládá', () => {
  const kontejner = kontejnerZEnv();
  const { doc } = dokument({ kontejner });
  assert.ok(inicializujGiscus(doc));
  assert.equal(inicializujGiscus(doc), null, 'druhé volání nesmí vložit druhý client.js');
  assert.equal(kontejner.children.length, 1);

  assert.equal(inicializujGiscus(dokument({}).doc), null, 'stránka bez komentářů');

  const bezId = prvek('div', { classes: ['giscus'], dataset: { giscus: '', repo: 'a/b' } });
  const { doc: docBezId } = dokument({ kontejner: bezId });
  assert.equal(inicializujGiscus(docBezId), null);
  assert.equal(bezId.children.length, 0);
  assert.equal(bezId.dataset.giscusBezi, undefined);
  assert.equal(docBezId._vytvorene.length, 0, 'ani se nevytváří <script>');
});

test('inicializace přežije prostředí bez MutationObserver', () => {
  const kontejner = kontejnerZEnv();
  const { doc } = dokument({ kontejner, mutationObserver: false });
  assert.ok(inicializujGiscus(doc));
});

test('přepnutí tématu za běhu: načtený iframe dostane setConfig jen na origin giscus.app', () => {
  const zpravy = [];
  const iframe = prvek('iframe', { classes: ['giscus-frame'], attrs: { src: 'https://giscus.app/cs/widget?theme=light' } });
  iframe.contentWindow = { postMessage: (data, origin) => zpravy.push({ data, origin }) };
  const kontejner = kontejnerZEnv();
  const { doc, root, pozorovatele } = dokument({ kontejner, iframe, theme: 'light' });

  inicializujGiscus(doc);
  root.dataset.theme = 'dark';
  pozorovatele[0].cb([]);

  assert.deepEqual(zpravy, [{ data: { giscus: { setConfig: { theme: 'dark' } } }, origin: 'https://giscus.app' }]);
  assert.equal(iframe.getAttribute('src'), 'https://giscus.app/cs/widget?theme=light', 'načtený iframe se nepřenačítá');
});

test('přepnutí tématu před načtením lazy iframu přepíše theme v src (zpráva by propadla)', () => {
  const iframe = prvek('iframe', {
    classes: ['giscus-frame', 'giscus-frame--loading'],
    attrs: { src: 'https://giscus.app/cs/widget?origin=https%3A%2F%2Frealtech.cz%2Fclanky%2Fx%2F&theme=light&lang=cs' },
  });
  iframe.contentWindow = { postMessage: () => assert.fail('zpráva do nenačteného iframu') };
  const { doc } = dokument({ iframe });

  assert.equal(poslatTemaGiscus(doc, 'dark'), 'src');
  const src = new URL(iframe.getAttribute('src'));
  assert.equal(src.origin, 'https://giscus.app');
  assert.equal(src.searchParams.get('theme'), 'dark');
  assert.equal(src.searchParams.get('origin'), 'https://realtech.cz/clanky/x/', 'ostatní parametry zůstávají');
  assert.equal(src.searchParams.get('lang'), 'cs');

  assert.equal(poslatTemaGiscus(dokument({}).doc, 'dark'), null, 'bez iframu není komu');
});

// ── 4. Šablona článku, CSS, CSP, dokumentace ─────────────────────────

test('článek vkládá <Giscus /> pod autorský box, „Další reporty“ a chronologickou navigaci', () => {
  assert.match(PAGE, /^import Giscus from '\.\.\/\.\.\/components\/Giscus\.astro';$/m);
  assert.equal((PAGE.match(/<Giscus \/>/g) ?? []).length, 1);

  const autorskyBox = PAGE.indexOf('<div class="author-box">');
  const giscus = PAGE.indexOf('<Giscus />');
  const related = PAGE.indexOf('{related.length > 0 && (\n        <div class="related">');
  const nav = PAGE.indexOf('<nav class="article-nav"');
  const zpet = PAGE.indexOf('<div class="article-back">');
  const telo = PAGE.indexOf('<Content />');
  const sdileni = PAGE.indexOf('<div class="article-share">');
  assert.ok(telo > 0 && sdileni > telo && autorskyBox > sdileni, 'předpoklad o pořadí šablony');
  assert.ok(giscus > autorskyBox, 'komentáře až za autorským boxem');
  // Kolo 23: lazy iframe s vlastní výškou odsouval „Další reporty“ a navigaci.
  assert.ok(giscus > related, 'komentáře až za „Další reporty“');
  assert.ok(giscus > nav, 'komentáře až za chronologickou navigací');
  assert.ok(zpet > giscus, 'komentáře před „Zpět na články“');
});

test('komponenta: sekce s id a aria-labelledby, skript uvnitř podmínky', () => {
  assert.match(KOMPONENTA, /\{konfigurace && \(\s*<section class="komentare" id="komentare" aria-labelledby="komentare-nadpis">/);
  assert.match(KOMPONENTA, /giscusKonfigurace\(import\.meta\.env\)/, 'konfigurace jen z env, žádná ID v kódu');
  assert.doesNotMatch(KOMPONENTA, /R_kgDO|DIC_kwDO/, 'žádná (ani falešná) ID v kódu');
  assert.match(KOMPONENTA, /import\.meta\.env\.DEV\) varujGiscus/);
  const podminka = KOMPONENTA.indexOf('{konfigurace && (');
  const skript = KOMPONENTA.indexOf('<script>');
  const konecPodminky = KOMPONENTA.lastIndexOf(')}');
  assert.ok(podminka < skript && skript < konecPodminky, 'skript je uvnitř podmínky — bez env se modul nestahuje');
  assert.match(KOMPONENTA, /import \{ inicializujGiscus \} from '\.\.\/lib\/giscus-klient\.js'/);
});

test('CSS: sekce má vlastní styl ve stejném rytmu jako .related a v tisku mizí', () => {
  assert.match(CSS, /^\.komentare \{\n\s*max-width: 760px; margin: 44px auto 0;/m);
  assert.match(CSS, /^\.komentare \.section-head h2 \{ font-size: 1\.15rem; \}/m);
  assert.match(CSS, /^\.komentare-note \{/m);
  const tisk = CSS.slice(CSS.indexOf('@media print'));
  assert.match(tisk, /\.komentare,?[\s\S]*?display: none !important;/, 'komentáře se netisknou');
});

function cspDirektivy() {
  const radek = HEADERS.split(/\r?\n/).find((l) => l.trim().startsWith('Content-Security-Policy:'));
  assert.ok(radek, 'public/_headers musí mít Content-Security-Policy');
  const direktivy = new Map();
  for (const cast of radek.replace(/^\s*Content-Security-Policy:\s*/, '').split(';')) {
    const [jmeno, ...hodnoty] = cast.trim().split(/\s+/);
    if (jmeno) direktivy.set(jmeno, hodnoty);
  }
  return direktivy;
}

test('CSP povoluje giscus.app přesně tam, kde ho client.js potřebuje, a nikde jinde', () => {
  const csp = cspDirektivy();

  // client.js (script-src) vloží <link rel=stylesheet href=giscus.app/default.css>
  // (style-src) a iframe na giscus.app/cs/widget (frame-src). GitHub API,
  // avatary i fonty běží uvnitř cross-origin iframu mimo naši CSP.
  assert.ok(csp.get('script-src').includes('https://giscus.app'), 'script-src');
  assert.ok(csp.get('style-src').includes('https://giscus.app'), 'style-src (default.css)');
  assert.ok(csp.get('frame-src').includes('https://giscus.app'), 'frame-src');

  for (const direktiva of ['img-src', 'connect-src', 'font-src', 'media-src', 'form-action', 'default-src']) {
    for (const hodnota of csp.get(direktiva)) {
      assert.doesNotMatch(hodnota, /giscus|github/, `${direktiva}: ${hodnota}`);
    }
  }
  assert.equal((HEADERS.match(/giscus\.app/g) ?? []).length, 3, 'jen tři výskyty giscus.app v _headers');
  assert.doesNotMatch(HEADERS, /api\.github\.com|githubusercontent/);

  // Tvrdé zámky a stávající povolení zůstávají.
  assert.deepEqual(csp.get('object-src'), ["'none'"]);
  assert.deepEqual(csp.get('frame-ancestors'), ["'none'"]);
  assert.deepEqual(csp.get('base-uri'), ["'self'"]);
  assert.ok(csp.get('frame-src').includes('https://www.youtube-nocookie.com'));
  assert.ok(csp.get('frame-src').includes('https://platform.twitter.com'));
  assert.ok(csp.get('script-src').includes('https://platform.twitter.com'));
});

test('dokumentace: postup pro Denyho a všechny env proměnné; README na ni odkazuje', () => {
  for (const jmeno of ['PUBLIC_GISCUS_REPO', 'PUBLIC_GISCUS_REPO_ID', 'PUBLIC_GISCUS_CATEGORY', 'PUBLIC_GISCUS_CATEGORY_ID']) {
    assert.ok(DOCS.includes(`\`${jmeno}\``), `docs/giscus.md zmiňuje ${jmeno}`);
    assert.ok(README.includes(`\`${jmeno}\``), `README zmiňuje ${jmeno}`);
  }
  assert.match(DOCS, /https:\/\/github\.com\/apps\/giscus/, 'instalace aplikace giscus');
  assert.match(DOCS, /https:\/\/giscus\.app/, 'kde vzít ID');
  assert.match(DOCS, /Discussions/, 'zapnutí Discussions');
  assert.match(DOCS, /Cloudflare Pages/, 'kde nastavit env');
  assert.match(DOCS, /Environment variables/);
  assert.match(DOCS, /Announcements/, 'doporučený formát kategorie');
  assert.match(README, /\[`docs\/giscus\.md`\]\(docs\/giscus\.md\)/);
  assert.match(GITIGNORE, /^\.env$/m, 'lokální .env s ID nepatří do repa');
});
