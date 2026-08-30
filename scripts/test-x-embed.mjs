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
//  3. Fasáda žije v textu článku, ne přes cover (cover jako play tlačítko
//     Maky živě vrátil — náhledovka widget „schovávala“; cover je vždy
//     normální fotka) — a NE jako první uzel těla článku: karta nad prvním
//     odstavcem Makymu vadila, napřed má být text, pak widget. Kostru
//     vkládá do vyrenderovaného markdownu rehype plugin už v BUILDU
//     (za první odstavec, u miniaturního prvního za druhý), takže karta
//     nahoře ani neblikne — žádný klientský přesun.
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
import {
  indexProEmbed,
  MIN_ZNAKU_PRVNIHO_ODSTAVCE,
  rehypeXEmbedy,
  xEmbedHtml,
} from '../src/lib/rehype-x-embed.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/[...id].astro'), 'utf8');
const CONFIG = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8');
const HEADERS = fs.readFileSync(path.join(ROOT, 'public/_headers'), 'utf8');
const FLIGHT14 = fs.readFileSync(
  path.join(ROOT, 'src/content/clanky/starship-flight-14-super-heavy-static-fire.md'),
  'utf8',
);

const FLIGHT14_URL = 'https://x.com/SpaceX/status/2093477720638341395';

// Kostra fasády, jak ji rehype plugin vkládá do HTML článku.
const SKELETON = xEmbedHtml(xPostEmbed(FLIGHT14_URL));

// Pomocníci na hast strom, jaký plugin dostává od Astra (mezi bloky
// stojí textové uzly s \n).
const p = (text) => ({ type: 'element', tagName: 'p', children: [{ type: 'text', value: text }] });
const h2 = (text) => ({ type: 'element', tagName: 'h2', children: [{ type: 'text', value: text }] });
const nl = () => ({ type: 'text', value: '\n' });
const strom = (...children) => ({ type: 'root', children });
const soubor = (xPosts) => ({ data: { astro: { frontmatter: xPosts ? { xPosts } : {} } } });

const DLOUHY = 'x'.repeat(MIN_ZNAKU_PRVNIHO_ODSTAVCE);

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

// ── 2. Kostra fasády a její místo v článku (rehype, build-time) ──────

test('kostra fasády nese jen logo X a titulek — bez tlačítka, výzvy ke kliknutí, iframe i blockquote', () => {
  assert.match(SKELETON, /class="x-facade" data-x-facade/);
  assert.match(SKELETON, /data-x-post-id="2093477720638341395"/);
  assert.match(SKELETON, /data-x-post-href="https:\/\/twitter\.com\/SpaceX\/status\/2093477720638341395"/,
    'href v datech je kanonický twitter.com — widgets.js historicky ignoroval x.com');
  assert.doesNotMatch(SKELETON, /<button\b/i, 'click-to-load tlačítko Maky zrušil — widget se vkládá sám');
  assert.doesNotMatch(SKELETON, /Kliknutím se načte|x-facade-button|x-facade-note/,
    'žádná výzva ke kliknutí — prázdný panel „klikni a načtu“ je pryč');
  assert.doesNotMatch(SKELETON, /<iframe\b/i, 'iframe vkládá widgets.js, ne kostra');
  assert.doesNotMatch(SKELETON, /<blockquote\b/i,
    'blockquote staví až skript při načtení — data-theme se počítá z tématu webu');
  assert.doesNotMatch(SKELETON, /platform\.twitter\.com|widgets\.js/i,
    'widgets.js načítá skript (jen na stránkách s fasádou), ne HTML kostra');
  assert.doesNotMatch(SKELETON, /twimg\.com/i, 'fasáda nesmí stahovat nic z twimg');
  assert.doesNotMatch(SKELETON, /<picture>|<img /, 'fasáda X nenese žádnou fotku');
  assert.match(SKELETON, /x-facade-skeleton/, 'kostra drží místo, než ji skript vymění');
  assert.match(SKELETON, /x-facade-mark/);
  assert.match(SKELETON, /Video z příspěvku @SpaceX/);
  assert.match(PAGE, /import \{ inicializujXFacades \} from '\.\.\/\.\.\/lib\/x-embed\.js'/);
  assert.match(PAGE, /inicializujXFacades\(\)/);
});

test('fallback „Otevřít na X“ stojí mimo fasádu a funguje i bez JS', () => {
  // Fallback stojí MIMO [data-x-facade], takže přežije výměnu obsahu fasády.
  const facade = SKELETON.indexOf('data-x-facade');
  const konecFasady = SKELETON.indexOf('</div></div>', facade);
  const fallback = SKELETON.indexOf('x-embed-fallback');
  assert.notEqual(konecFasady, -1);
  assert.ok(fallback > konecFasady, 'fallback musí stát mimo fasádu, ne uvnitř');
  assert.match(SKELETON, /<a href="https:\/\/x\.com\/SpaceX\/status\/2093477720638341395" target="_blank" rel="noopener">Otevřít na X/);
});

test('embed vkládá rehype plugin v buildu — šablona ho už nenese a .article-body začíná obsahem', () => {
  // Plugin je registrovaný v markdown pipeline — kostra dojde do statického
  // HTML a nic se nepřesouvá na klientovi (žádné bliknutí karty nahoře).
  assert.match(CONFIG, /import \{ rehypeXEmbedy \} from '\.\/src\/lib\/rehype-x-embed\.js'/);
  assert.match(CONFIG, /rehypePlugins: \[[^\]]*rehypeXEmbedy[^\]]*\]/);

  // Šablona samotná fasádu nerenderuje — takže embed NEMŮŽE být první
  // dítě .article-body: uvnitř je jen <Content /> s článkem.
  assert.doesNotMatch(PAGE, /xEmbedy\.map|data-x-facade|x-facade-skeleton|x-embed-fallback/,
    'fasádu vkládá rehype plugin do markdownu, ne šablona');
  const body = PAGE.indexOf('<div class="article-body">');
  const content = PAGE.indexOf('<Content />', body);
  const konecTela = PAGE.indexOf('</div>', body);
  assert.notEqual(body, -1);
  assert.ok(content > body && content < konecTela,
    '.article-body nese <Content /> — článek začíná textem, ne widgetem');
  const predContentem = PAGE.slice(body + '<div class="article-body">'.length, content);
  assert.doesNotMatch(predContentem, /<\w|class=/,
    'před <Content /> nesmí v .article-body stát žádný element — jen komentář');

  // Cover NIKDY nefunguje jako play tlačítko embedu — Maky to živě vrátil,
  // náhledovka widget „schovávala“. article-hero se renderuje vždy,
  // když je image a není YouTube video.
  assert.match(PAGE, /\{!videoId && heroSrc && \(\s*\n\s*<div class="article-hero">/);
  assert.doesNotMatch(PAGE, /heroVeXFacade|x-facade-photo|x-facade-button-photo|x-facade-play|x-facade-badge/);
});

test('plugin vloží kostru za první odstavec — nikdy jako první uzel těla článku', () => {
  const tree = strom(p(DLOUHY), nl(), p('Druhý odstavec.'), nl(), h2('Sekce'));
  rehypeXEmbedy()(tree, soubor([FLIGHT14_URL]));

  assert.equal(tree.children.length, 6);
  assert.notEqual(tree.children[0].type, 'raw', 'embed nesmí být první uzel — napřed text, pak widget');
  assert.equal(tree.children[0].tagName, 'p', 'článek začíná odstavcem');
  assert.equal(tree.children[1].type, 'raw', 'embed stojí hned za prvním odstavcem');
  assert.equal(tree.children[1].value, SKELETON);
});

test('miniaturní první odstavec kartu neunese — embed jde až za druhý', () => {
  const kratky = strom(p('Krátké uvození.'), nl(), p(DLOUHY), nl(), p('Třetí.'));
  rehypeXEmbedy()(kratky, soubor([FLIGHT14_URL]));
  assert.equal(kratky.children[3].type, 'raw', 'za miniaturním prvním odstavcem jde embed až za druhý');

  // Nadpis ani jiný blok před prvním odstavcem se nepočítá — embed patří
  // za PRÓZU, ne za první uzel stromu.
  const sNadpisem = strom(h2('Nadpis'), nl(), p(DLOUHY), nl(), p('Dál.'));
  rehypeXEmbedy()(sNadpisem, soubor([FLIGHT14_URL]));
  assert.equal(sNadpisem.children[0].tagName, 'h2');
  assert.equal(sNadpisem.children[3].type, 'raw', 'embed stojí za prvním odstavcem, ne za nadpisem');

  // Jediný miniaturní odstavec: embed za ním — pořád ne jako první uzel.
  const jediny = strom(p('Krátké.'));
  rehypeXEmbedy()(jediny, soubor([FLIGHT14_URL]));
  assert.equal(jediny.children[0].tagName, 'p');
  assert.equal(jediny.children[1].type, 'raw');
});

test('bez xPosts (nebo s junk URL) plugin strom nechá být', () => {
  const bez = strom(p(DLOUHY), nl(), p('Druhý.'));
  rehypeXEmbedy()(bez, soubor(undefined));
  assert.equal(bez.children.length, 3);
  assert.ok(bez.children.every((child) => child.type !== 'raw'));

  const junk = strom(p(DLOUHY));
  rehypeXEmbedy()(junk, soubor(['https://example.com/SpaceX/status/2093477720638341395']));
  assert.equal(junk.children.length, 1);

  // Jiné markdown soubory (bez astro frontmatteru) projdou bez pádu.
  const cizi = strom(p(DLOUHY));
  rehypeXEmbedy()(cizi, { data: {} });
  assert.equal(cizi.children.length, 1);
});

test('víc xPosts drží pořadí z frontmatteru na jednom místě vložení', () => {
  const tree = strom(p(DLOUHY), nl(), p('Druhý.'));
  rehypeXEmbedy()(tree, soubor([
    FLIGHT14_URL,
    'https://x.com/SpaceX/status/2092372845544321445',
  ]));
  assert.equal(tree.children[1].type, 'raw');
  assert.match(tree.children[1].value, /2093477720638341395/);
  assert.equal(tree.children[2].type, 'raw');
  assert.match(tree.children[2].value, /2092372845544321445/);
});

test('Flight 14 má plnohodnotný lede — embed sedí hned za prvním odstavcem', () => {
  const telo = FLIGHT14.split(/^---\s*$/m)[2] ?? '';
  const prvniOdstavec = telo.split(/\n{2,}/).map((blok) => blok.trim()).find(Boolean);
  assert.ok(prvniOdstavec, 'článek musí mít text');
  assert.ok(prvniOdstavec.length >= MIN_ZNAKU_PRVNIHO_ODSTAVCE,
    'lede o static fire je dost dlouhý, aby karta stála hned za ním — ne až za druhým odstavcem');
  assert.equal(indexProEmbed(strom(p(prvniOdstavec), nl(), p('Druhý odstavec.'))), 1,
    'embed jde hned za první odstavec Flight 14');
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
