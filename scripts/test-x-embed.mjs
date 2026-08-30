// Oficiální embed X (Twitter) — vykresluje se hned při načtení stránky.
//
// Click-to-load bránu („Kliknutím se načte oficiální vložený příspěvek…“,
// prázdný panel s logem X) Maky zrušil: čtenář má kartu příspěvku
// s náhledem videa vidět rovnou, bez kliknutí navíc. Dřívější kontrakt
// „nic na platform.twitter.com před kliknutím“ tím padá.
//
// Co se tu hlídá a proč:
//  1. Parser bere jen https status URL na x.com/twitter.com a kanonizuje
//     href na twitter.com — widgets.js historicky ignoroval x.com odkazy.
//  2. První HTML článku nese jen krátkou kostru (logo X + titulek) —
//     blockquote staví až skript při načtení, protože data-theme se musí
//     spočítat z aktuálního tématu webu. Žádné tlačítko, žádná výzva
//     ke kliknutí.
//  3. Fasáda žije v textu článku (.article-body, před <Content />), ne
//     přes cover — cover jako play tlačítko Maky živě vrátil (náhledovka
//     widget „schovávala“). Cover je vždy normální fotka.
//  4. Inicializace hned ukáže stav načítání a vloží oficiální embed
//     (blockquote.twitter-tweet + widgets.js) s data-dnt, data-conversation
//     none a tématem podle webu. Soubor videa zůstává u X — nerehostujeme.
//     widgets.js se načítá jen na stránkách, kde fasáda opravdu je.
//  5. Po vložení iframe fasáda odloží panel (x-facade-loaded), aby si
//     tweet určil výšku sám a nezbyla kolem něj prázdná studna. Když
//     widget nenaběhne (adblock), zůstává únik „Otevřít na X“ z #361.
//  6. YouTube cesta (`video` ve frontmatteru) včetně click-to-load fasády
//     zůstává beze změny.
//  7. CSP v public/_headers povoluje přesně to, co widget po kliknutí
//     potřebuje (ověřeno runtime v Chrome: script + frame na
//     platform.twitter.com; zbytek si widget řeší ve vlastním iframe,
//     na který se CSP rodiče nevztahuje) — a nic navíc.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { xPostEmbed } from '../src/lib/x-post.js';
import {
  aktivujXFacade,
  dokonciXFacade,
  inicializujXFacades,
  nactiWidgetsJs,
  oznacSelhaniXFacade,
  temaWidgetu,
  WIDGETS_SRC,
} from '../src/lib/x-embed.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/[...id].astro'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8');
const HEADERS = fs.readFileSync(path.join(ROOT, 'public/_headers'), 'utf8');
const FLIGHT14 = fs.readFileSync(
  path.join(ROOT, 'src/content/clanky/starship-flight-14-super-heavy-static-fire.md'),
  'utf8',
);

const FLIGHT14_URL = 'https://x.com/SpaceX/status/2093477720638341395';

function xEmbedTemplate(source) {
  const start = source.indexOf('{xEmbedy.map((post) => (');
  const end = source.indexOf('<Content />', start);
  assert.notEqual(start, -1, 'šablona nemá větev pro embed X');
  assert.notEqual(end, -1, 'nejde vymezit větev pro embed X');
  return source.slice(start, end);
}

// ── 1. Parser ────────────────────────────────────────────────────────

test('parser bere x.com i twitter.com status URL a kanonizuje href na twitter.com', () => {
  for (const url of [
    FLIGHT14_URL,
    'https://www.x.com/SpaceX/status/2093477720638341395',
    'https://twitter.com/SpaceX/status/2093477720638341395',
    'https://www.twitter.com/SpaceX/status/2093477720638341395',
    'https://mobile.twitter.com/SpaceX/status/2093477720638341395',
    'https://x.com/SpaceX/status/2093477720638341395?s=20&t=abc',
  ]) {
    const post = xPostEmbed(url);
    assert.ok(post, url);
    assert.equal(post.id, '2093477720638341395', url);
    assert.equal(post.ucet, 'SpaceX', url);
    assert.equal(post.href, 'https://twitter.com/SpaceX/status/2093477720638341395', url);
    assert.equal(post.webHref, 'https://x.com/SpaceX/status/2093477720638341395', url);
  }
});

test('parser odmítá junk — cizí hosty, http, ne-status cesty i nečíselná ID', () => {
  for (const url of [
    undefined,
    null,
    '',
    'not a url',
    'http://x.com/SpaceX/status/2093477720638341395',
    'javascript:alert(1)',
    'https://example.com/SpaceX/status/2093477720638341395',
    'https://x.com.evil.com/SpaceX/status/2093477720638341395',
    'https://notx.com/SpaceX/status/2093477720638341395',
    'https://x.com/SpaceX',
    'https://x.com/SpaceX/status/',
    'https://x.com/SpaceX/status/abc',
    'https://x.com/SpaceX/status/209347772063834139512345678901',
    'https://x.com/SpaceX/status/2093477720638341395/photo/1',
    'https://x.com/uzivatel-s-pomlckou/status/2093477720638341395',
    'https://x.com/i/web/status/2093477720638341395',
    'https://youtu.be/l-S4MR27JaE',
  ]) {
    assert.equal(xPostEmbed(url), undefined, String(url));
  }
});

// ── 2. Šablona: kostra bez brány ke kliknutí ─────────────────────────

test('produkční šablona posílá v prvním HTML jen kostru fasády — bez tlačítka a výzvy ke kliknutí', () => {
  const template = xEmbedTemplate(PAGE);

  assert.match(template, /class="x-facade"[\s\S]*data-x-facade/);
  assert.match(template, /data-x-post-id=\{post\.id\}/);
  assert.match(template, /data-x-post-href=\{post\.href\}/);
  assert.doesNotMatch(template, /<button\b/i, 'click-to-load tlačítko Maky zrušil — widget se vkládá sám');
  assert.doesNotMatch(template, /Kliknutím se načte|x-facade-button|x-facade-note/,
    'žádná výzva ke kliknutí — prázdný panel „klikni a načtu“ je pryč');
  assert.doesNotMatch(template, /<iframe\b/i, 'iframe vkládá widgets.js, ne šablona');
  assert.doesNotMatch(template, /<blockquote\b/i,
    'blockquote staví až skript při načtení — data-theme se počítá z tématu webu');
  assert.doesNotMatch(template, /platform\.twitter\.com|widgets\.js/i,
    'widgets.js načítá skript (jen na stránkách s fasádou), ne HTML šablona');
  assert.doesNotMatch(template, /twimg\.com/i, 'fasáda nesmí stahovat nic z twimg');
  assert.match(template, /x-facade-skeleton/, 'kostra drží místo, než ji skript vymění');
  assert.match(PAGE, /import \{ inicializujXFacades \} from '\.\.\/\.\.\/lib\/x-embed\.js'/);
  assert.match(PAGE, /inicializujXFacades\(\)/);
});

test('embed X žije v textu článku před <Content />, cover je vždy normální fotka', () => {
  const template = xEmbedTemplate(PAGE);

  // Umístění: uvnitř .article-body, před obsahem — v toku čtení, ne pod hero.
  const body = PAGE.indexOf('<div class="article-body">');
  const map = PAGE.indexOf('{xEmbedy.map((post) => (');
  const content = PAGE.indexOf('<Content />', body);
  assert.notEqual(body, -1);
  assert.ok(map > body, 'fasáda X musí stát uvnitř .article-body');
  assert.ok(content > map, 'fasáda X musí stát před <Content />, ne za ním');

  // Cover NIKDY nefunguje jako play tlačítko embedu — Maky to živě vrátil,
  // náhledovka widget „schovávala“. article-hero se renderuje vždy,
  // když je image a není YouTube video.
  assert.match(PAGE, /\{!videoId && heroSrc && \(\s*\n\s*<div class="article-hero">/);
  assert.doesNotMatch(PAGE, /heroVeXFacade|x-facade-photo|x-facade-button-photo|x-facade-play|x-facade-badge/);
  assert.doesNotMatch(template, /<picture>|<img /, 'fasáda X nenese žádnou fotku');

  // Kostra: značka X + titulek — nic víc, skript ji hned vymění.
  assert.match(template, /x-facade-mark/);
  assert.match(template, /Video z příspěvku @\{post\.ucet\}/);
});

test('fallback „Otevřít na X“ stojí mimo fasádu a funguje i bez JS', () => {
  const template = xEmbedTemplate(PAGE);

  // Fallback stojí MIMO [data-x-facade], takže přežije výměnu obsahu fasády.
  const facade = template.indexOf('data-x-facade');
  const konecFasady = template.indexOf('</div>', facade);
  const fallback = template.indexOf('x-embed-fallback');
  assert.ok(fallback > konecFasady, 'fallback musí stát mimo fasádu, ne uvnitř');
  assert.match(template, /<a href=\{post\.webHref\} target="_blank" rel="noopener">Otevřít na X/);
});

// ── 3. Načtení stránky vloží oficiální embed ─────────────────────────

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.dataset = {};
    this.children = [];
    this.attributes = new Map();
    this.className = '';
    this.textContent = '';
    this.parentNode = null;
    const tridy = new Set();
    this.classList = {
      add: (c) => tridy.add(c),
      remove: (c) => tridy.delete(c),
      contains: (c) => tridy.has(c),
    };
  }

  querySelector(selector) {
    if (selector === 'blockquote') {
      return this.children.find((child) => child.tagName === 'BLOCKQUOTE') ?? null;
    }
    if (selector === '.x-facade-loading-note') {
      return this.children.find((child) => child.className.includes('x-facade-loading-note')) ?? null;
    }
    if (selector === '.x-facade-failed-note') {
      return this.children.find((child) => child.className.includes('x-facade-failed-note')) ?? null;
    }
    return null;
  }

  replaceChildren(...children) {
    this.children = children;
    for (const child of children) child.parentNode = this;
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

function fixture({ tema, systemDark } = {}) {
  const created = [];
  const ownerDocument = {
    defaultView: systemDark === undefined ? undefined : {
      matchMedia: (dotaz) => ({
        matches: dotaz === '(prefers-color-scheme: dark)' && systemDark,
      }),
    },
    documentElement: { dataset: tema ? { theme: tema } : {} },
    head: null,
    createElement(tagName) {
      const element = new FakeElement(tagName, ownerDocument);
      created.push(element);
      return element;
    },
    querySelector(selector) {
      if (selector === `script[src="${WIDGETS_SRC}"]`) {
        return ownerDocument.head.children.find(
          (child) => child.tagName === 'SCRIPT' && child.src === WIDGETS_SRC,
        ) ?? null;
      }
      return null;
    },
  };
  ownerDocument.head = new FakeElement('head', ownerDocument);

  const facade = new FakeElement('div', ownerDocument);
  facade.dataset.xPostId = '2093477720638341395';
  facade.dataset.xPostHref = 'https://twitter.com/SpaceX/status/2093477720638341395';
  facade.dataset.xPostTitle = 'Příspěvek @SpaceX na X';
  const skeleton = new FakeElement('div', ownerDocument);
  skeleton.className = 'x-facade-skeleton';
  facade.children = [skeleton];
  const root = { querySelectorAll: () => [facade] };
  return { root, facade, created, ownerDocument };
}

test('inicializace hned vloží blockquote.twitter-tweet s data-dnt a widgets.js — bez kliknutí', () => {
  const { root, facade, ownerDocument } = fixture();

  inicializujXFacades(root);

  const blockquote = facade.querySelector('blockquote');
  assert.ok(blockquote, 'načtení stránky musí vložit blockquote — žádná brána ke kliknutí');
  assert.equal(blockquote.className, 'twitter-tweet');
  assert.equal(blockquote.attributes.get('data-dnt'), 'true');
  assert.equal(blockquote.attributes.get('data-conversation'), 'none', 'vlákno pod tweetem nechceme');

  const odkaz = blockquote.children[0];
  assert.equal(odkaz.tagName, 'A');
  assert.equal(odkaz.href, 'https://twitter.com/SpaceX/status/2093477720638341395');

  const script = ownerDocument.head.children.find((child) => child.tagName === 'SCRIPT');
  assert.ok(script, 'inicializace musí načíst widgets.js');
  assert.equal(script.src, 'https://platform.twitter.com/widgets.js');
  assert.equal(script.async, true);
});

test('stránka bez fasád X nenačte widgets.js — skript se nevkládá na celý web', () => {
  const { created, ownerDocument } = fixture();
  const prazdnyRoot = { querySelectorAll: () => [] };

  inicializujXFacades(prazdnyRoot);
  assert.equal(created.length, 0, 'bez fasády se nesmí nic vytvořit');
  assert.equal(ownerDocument.head.children.length, 0, 'bez fasády se widgets.js nenačítá');
});

test('mezi načtením a iframem je viditelný stav načítání, dokonciXFacade ho uklidí', () => {
  const { facade } = fixture();

  aktivujXFacade(facade);

  assert.ok(facade.classList.contains('x-facade-loading'), 'fasáda musí hlásit načítání');
  const note = facade.querySelector('.x-facade-loading-note');
  assert.ok(note, 'aktivace musí ukázat poznámku o načítání — kostra nesmí zmizet do prázdna');
  assert.ok(note.children.some((child) => child.className === 'x-facade-spinner'));
  assert.equal(facade.children[0], note, 'poznámka stojí nad blockquote');

  // Jakmile widget vloží iframe (v prohlížeči přes MutationObserver),
  // spinner zmizí a fasáda odloží 16:9 rám, aby si tweet určil výšku sám.
  dokonciXFacade(facade);
  assert.equal(facade.classList.contains('x-facade-loading'), false);
  assert.ok(facade.classList.contains('x-facade-loaded'));
  assert.equal(facade.querySelector('.x-facade-loading-note'), null);
  assert.ok(facade.querySelector('blockquote'), 'blockquote musí úklid přežít');
});

test('když widget nenaběhne, fasáda ukáže zřetelný únik „Otevřít na X“ — a pozdní hydratace ho uklidí', () => {
  const { facade } = fixture();

  aktivujXFacade(facade);
  oznacSelhaniXFacade(facade);

  assert.equal(facade.classList.contains('x-facade-loading'), false, 'spinner nesmí točit donekonečna');
  assert.ok(facade.classList.contains('x-facade-failed'));
  assert.equal(facade.querySelector('.x-facade-loading-note'), null);

  const note = facade.querySelector('.x-facade-failed-note');
  assert.ok(note, 'čtenář nesmí zůstat v mrtvé krabici bez viditelného úniku');
  const odkaz = note.children.find((child) => child.tagName === 'A');
  assert.equal(odkaz.href, 'https://x.com/SpaceX/status/2093477720638341395',
    'viditelný únik vede na lidský x.com, twitter.com href je jen pro widgets.js');
  assert.equal(odkaz.target, '_blank');
  assert.equal(odkaz.rel, 'noopener');
  assert.ok(facade.querySelector('blockquote'), 'blockquote zůstává — widget může zhydratovat dodatečně');

  // Druhé selhání nesmí přidat druhou poznámku.
  oznacSelhaniXFacade(facade);
  assert.equal(
    facade.children.filter((child) => child.className.includes('x-facade-failed-note')).length,
    1,
  );

  // Pozdní hydratace (pozorovatel běží dál): úklid selhání i poznámky.
  dokonciXFacade(facade);
  assert.equal(facade.classList.contains('x-facade-failed'), false);
  assert.ok(facade.classList.contains('x-facade-loaded'));
  assert.equal(facade.querySelector('.x-facade-failed-note'), null);
});

test('téma widgetu sleduje web: data-theme na <html> má přednost, jinak systémové schéma', () => {
  const { facade } = fixture({ tema: 'dark' });
  const blockquote = aktivujXFacade(facade);
  assert.equal(blockquote.attributes.get('data-theme'), 'dark');

  const svetly = fixture({ tema: 'light', systemDark: true });
  assert.equal(aktivujXFacade(svetly.facade).attributes.get('data-theme'), 'light',
    'ruční přepnutí na light má přednost před systémovým dark');

  const systemovy = fixture({ systemDark: true });
  assert.equal(aktivujXFacade(systemovy.facade).attributes.get('data-theme'), 'dark');

  const vychozi = fixture();
  assert.equal(aktivujXFacade(vychozi.facade).attributes.get('data-theme'), 'light',
    'bez matchMedia i bez data-theme padáme na light');

  assert.equal(temaWidgetu({ documentElement: { dataset: {} } }), 'light');
});

test('druhá aktivace nic nepřidá a widgets.js se načítá nejvýš jednou', () => {
  const { facade, ownerDocument } = fixture();

  assert.ok(aktivujXFacade(facade));
  assert.equal(aktivujXFacade(facade), null, 'druhý klik nesmí vložit druhý blockquote');
  assert.equal(
    ownerDocument.head.children.filter((child) => child.tagName === 'SCRIPT').length,
    1,
  );

  // Když už widgets.js běží (window.twttr), jen se znovu projde dokument.
  let loadCalls = 0;
  const doc = {
    defaultView: { twttr: { widgets: { load: () => { loadCalls += 1; } } } },
    head: new FakeElement('head', null),
    querySelector: () => null,
  };
  assert.equal(nactiWidgetsJs(doc), null);
  assert.equal(loadCalls, 1);
  assert.equal(doc.head.children.length, 0);
});

test('podvržená data-* fasádu neaktivují', () => {
  const { facade } = fixture();
  facade.dataset.xPostId = 'javascript:alert(1)';
  assert.equal(aktivujXFacade(facade), null);

  const { facade: facade2 } = fixture();
  facade2.dataset.xPostHref = 'https://evil.com/SpaceX/status/2093477720638341395';
  assert.equal(aktivujXFacade(facade2), null);
});

// ── 4. Vzhled fasády: žádný černý panel ─────────────────────────────

test('styly fasády X stojí na tokenech webu, ne na černém #090b0e panelu', () => {
  const start = CSS.indexOf('/* ── X (Twitter) embed');
  assert.notEqual(start, -1, 'global.css nemá sekci pro X');
  const sekce = CSS.slice(start);

  assert.doesNotMatch(sekce, /#090b0e|#14171c|#f3ece7|#a9b2bf/i,
    'černý panel s napevno danými barvami Maky vykázal — fasáda bere tokeny webu');
  assert.match(sekce, /\.x-facade \{[^}]*background: var\(--surface\)/);
  assert.doesNotMatch(sekce, /x-facade-photo|x-facade-play|x-facade-badge|aspect-ratio: 16/,
    'cover jako fasáda je pryč — kompaktní panel v textu, žádná 16:9 fotovarianta');
  assert.match(sekce, /\.x-facade-skeleton \{/, 'kostra drží tvar, než skript vloží blockquote');
  assert.doesNotMatch(sekce, /x-facade-button|x-facade-note|cursor: pointer/,
    'click-to-load tlačítko Maky zrušil — žádné interaktivní styly fasády');
  assert.match(sekce, /\.x-facade-loading \{/);
  assert.match(sekce, /\.x-facade-spinner \{/);
  assert.match(sekce, /\.x-facade\.x-facade-loaded \{[^}]*background: transparent/,
    'po vložení iframe musí panel zmizet, aby tweet neseděl v orámované studně');
  assert.match(sekce, /\.x-facade \.twitter-tweet \{[^}]*max-width: 550px/,
    'zhydratovaný widget drží sloupec ~550 px na střed, ne přes celou šířku');
  assert.match(sekce, /\.x-facade-failed \{/);
  assert.match(sekce, /\.x-facade-open \{/, 'stav selhání potřebuje zřetelný odkaz, ne drobnou poznámku');
});

// ── 5. Článek Flight 14 ──────────────────────────────────────────────

test('Flight 14 má právě jeden xPost, žádné video ve frontmatteru a žádný obsahový embed', () => {
  assert.match(FLIGHT14, /^xPosts:\n  - "https:\/\/x\.com\/SpaceX\/status\/2093477720638341395"$/m);
  assert.equal(
    (FLIGHT14.match(/^  - "https:\/\/(x|twitter)\.com\//gm) ?? []).length,
    1,
    'v článku má být embed jen na 33motorový static fire, ne ostatní posty SpaceX',
  );
  assert.doesNotMatch(FLIGHT14, /^video:/m, 'pole video je jen YouTube');
  assert.match(FLIGHT14, /^image: "\/images\/clanky\/starship-flight-14-super-heavy-static-fire\.jpg"$/m);
  assert.doesNotMatch(FLIGHT14, /<iframe\b|<blockquote\b|widgets\.js|platform\.twitter\.com|twimg\.com/i);
});

test('článek s embedem X a bez videa nedostane výzvu „K tomuhle článku video není“', () => {
  assert.match(PAGE, /\{!video && xEmbedy\.length === 0 && \(/);
  const vetev = PAGE.slice(PAGE.indexOf('{!video && xEmbedy.length === 0 && ('));
  assert.match(vetev, /K tomuhle článku video není/);
});

// ── 6. YouTube cesta zůstává beze změny ──────────────────────────────

test('YouTube fasáda i videobar zůstávají v šabloně nedotčené', () => {
  assert.match(PAGE, /\{videoId && \(/);
  assert.match(PAGE, /class="video-embed youtube-facade"/);
  assert.match(PAGE, /class="youtube-facade-button"/,
    'YouTube zůstává click-to-load — zrušení brány platí jen pro embed X');
  assert.match(PAGE, /\{video && \(\n\s*<div class="article-videobar">/);
  assert.match(PAGE, /Přehrát na YouTube/);
  assert.match(PAGE, /import \{ inicializujYoutubeFacades \} from '\.\.\/\.\.\/lib\/youtube-facade\.js'/);
});

// ── 7. CSP ───────────────────────────────────────────────────────────

function cspDirectives() {
  const line = HEADERS.split(/\r?\n/).find((l) => l.trim().startsWith('Content-Security-Policy:'));
  assert.ok(line, 'public/_headers musí mít Content-Security-Policy');
  const directives = new Map();
  for (const part of line.replace(/^\s*Content-Security-Policy:\s*/, '').split(';')) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) directives.set(name, values);
  }
  return directives;
}

test('CSP povoluje přesně to, co oficiální widget po kliknutí potřebuje', () => {
  const csp = cspDirectives();

  // Runtime ověřeno (Chrome headless, viz PR): rodičovský dokument po kliku
  // stáhne jen widgets.js (script-src) a widget vloží iframy na
  // platform.twitter.com (frame-src). Vše ostatní — pbs.twimg.com,
  // syndication, video — běží uvnitř cross-origin iframe mimo naši CSP.
  assert.ok(csp.get('script-src').includes('https://platform.twitter.com'));
  assert.ok(csp.get('frame-src').includes('https://platform.twitter.com'));

  // YouTube a audio zůstávají.
  assert.ok(csp.get('frame-src').includes('https://www.youtube-nocookie.com'));
  assert.deepEqual(csp.get('media-src'), ["'self'", 'https://audio.realtech.cz'],
    'media-src nesmí přibrat twimg — mp4 z X nikdy nepřehráváme sami');

  // Žádné bobtnání: img/connect/font widget v rodiči nepotřebuje.
  for (const directive of ['img-src', 'connect-src', 'font-src', 'style-src']) {
    for (const value of csp.get(directive)) {
      assert.doesNotMatch(value, /twitter\.com|twimg\.com|x\.com/, `${directive}: ${value}`);
    }
  }
  assert.doesNotMatch(HEADERS, /video\.twimg\.com|syndication/);

  // Tvrdé zámky zůstávají.
  assert.deepEqual(csp.get('object-src'), ["'none'"]);
  assert.deepEqual(csp.get('frame-ancestors'), ["'none'"]);
  assert.deepEqual(csp.get('base-uri'), ["'self'"]);
});
