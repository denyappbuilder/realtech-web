// Oficiální embed X (Twitter) — vykresluje se hned při načtení stránky
// a NEČEKÁ na náš deferred modul.
//
// Click-to-load bránu („Kliknutím se načte oficiální vložený příspěvek…“,
// prázdný panel s logem X) Maky zrušil: čtenář má kartu příspěvku
// s náhledem videa vidět rovnou, bez kliknutí navíc. Dřívější kontrakt
// „nic na platform.twitter.com před kliknutím“ tím padá.
//
// Kolo 7: karta se „někdy načítala dlouho“, protože serverové HTML neslo
// jen kostru a blockquote + widgets.js čekaly na náš deferred modul
// (HTML → náš bundle → widgets.js → iframe). Nový kontrakt: blockquote
// je v serverovém HTML a widgets.js startuje async z <head> — stahování
// se překryje s prvním vykreslením.
//
// Kolo 8: po #364 pořád CLS — `.x-facade-loading` nemělo min-height, takže
// čtenář viděl krátký spinner pruh a karta pak vyskočila na ~550 px.
// Rezervovaná výška (~560 px) drží tvar, dokud iframe nepřijde.
// widgets.js je defer (ne async) a sahá i na cdn.syndication.twimg.com
// a syndication.twitter.com — preconnect + dns-prefetch jen na článku
// s xPosts, ne na celý web. data-theme se nehardcoduje na light.
//
// Co se tu hlídá a proč:
//  1. Parser bere jen https status URL na x.com/twitter.com a kanonizuje
//     href na twitter.com — widgets.js historicky ignoroval x.com odkazy.
//  2. První HTML článku nese rovnou blockquote.twitter-tweet (data-dnt,
//     data-conversation none, default light) + stav načítání se spinnerem.
//     Tiny inline skript hned za fasádou opraví data-theme podle tématu
//     webu ještě při parsování — dávno před async widgets.js, takže na
//     tmavém webu nesvítí bílá karta. Žádné tlačítko, žádná výzva
//     ke kliknutí.
//  3. Fasáda žije v textu článku, ne přes cover (cover jako play tlačítko
//     Maky živě vrátil — náhledovka widget „schovávala“; cover je vždy
//     normální fotka) — a NE jako první uzel těla článku: karta nad prvním
//     odstavcem Makymu vadila, napřed má být text, pak widget. Fasádu
//     vkládá do vyrenderovaného markdownu rehype plugin už v BUILDU
//     (za první odstavec, u miniaturního prvního za druhý), takže karta
//     nahoře ani neblikne — žádný klientský přesun.
//  4. widgets.js jde defer z <head> šablony článku JEN při xPosts
//     (s preconnectem na platform.twitter.com + syndication hosty, které
//     widgets.js tahá dál) — nenačítá se na celý web a mimo článek
//     s embedem na ty hosty nesáhne nic.
//  5. Klientský modul blockquote nestaví — jen hlídá render: spinner
//     do vložení iframe, po něm fasáda odloží panel (x-facade-loaded),
//     aby si tweet určil výšku sám. Když widget nenaběhne (adblock),
//     zůstává 15s únik „Otevřít na X“ z #361.
//  6. YouTube cesta (`video` ve frontmatteru) včetně click-to-load fasády
//     zůstává beze změny.
//  7. CSP v public/_headers povoluje přesně to, co widget potřebuje
//     (script + frame na platform.twitter.com, inline skripty už dřív) —
//     a nic navíc. Soubor videa zůstává u X — nerehostujeme, nic z twimg.
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
const BASE = fs.readFileSync(path.join(ROOT, 'src/layouts/Base.astro'), 'utf8');
const INDEX = fs.readFileSync(path.join(ROOT, 'src/pages/index.astro'), 'utf8');
const ARCHIV = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/index.astro'), 'utf8');
const CONFIG = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8');
const HEADERS = fs.readFileSync(path.join(ROOT, 'public/_headers'), 'utf8');
const FLIGHT14 = fs.readFileSync(
  path.join(ROOT, 'src/content/clanky/starship-flight-14-super-heavy-static-fire.md'),
  'utf8',
);

const FLIGHT14_URL = 'https://x.com/SpaceX/status/2093477720638341395';

// HTML embedu, jak ho rehype plugin vkládá do článku už v buildu.
const EMBED_HTML = xEmbedHtml(xPostEmbed(FLIGHT14_URL));

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

// ── 2. Serverové HTML embedu a jeho místo v článku (rehype, build) ───

test('serverové HTML nese rovnou blockquote.twitter-tweet — karta nečeká na náš modul', () => {
  assert.match(EMBED_HTML, /class="x-facade x-facade-loading" data-x-facade/);
  assert.match(EMBED_HTML, /data-x-post-id="2093477720638341395"/);
  assert.match(EMBED_HTML, /data-x-post-href="https:\/\/twitter\.com\/SpaceX\/status\/2093477720638341395"/,
    'href v datech je kanonický twitter.com — widgets.js historicky ignoroval x.com');

  const blockquote = EMBED_HTML.match(/<blockquote[^>]*>/)?.[0];
  assert.ok(blockquote, 'blockquote musí být už v serverovém HTML, ne stavěný klientem');
  assert.match(blockquote, /class="twitter-tweet"/);
  assert.match(blockquote, /data-dnt="true"/);
  assert.match(blockquote, /data-lang="cs"/);
  assert.match(blockquote, /data-conversation="none"/, 'vlákno pod tweetem nechceme');
  assert.doesNotMatch(blockquote, /data-theme=/,
    'data-theme se nehardcoduje — inline skript ho nastaví podle webu');
  assert.match(EMBED_HTML,
    /<blockquote[^>]*><a href="https:\/\/twitter\.com\/SpaceX\/status\/2093477720638341395">Příspěvek @SpaceX na X<\/a><\/blockquote>/);

  assert.doesNotMatch(EMBED_HTML, /<button\b/i, 'click-to-load tlačítko Maky zrušil — widget se vkládá sám');
  assert.doesNotMatch(EMBED_HTML, /Kliknutím se načte|x-facade-button|x-facade-note/,
    'žádná výzva ke kliknutí — prázdný panel „klikni a načtu“ je pryč');
  assert.doesNotMatch(EMBED_HTML, /<iframe\b/i, 'iframe vkládá widgets.js, ne serverové HTML');
  assert.doesNotMatch(EMBED_HTML, /widgets\.js/i,
    'widgets.js startuje defer z <head> šablony článku (jen při xPosts), ne z HTML embedu');
  assert.doesNotMatch(EMBED_HTML, /twimg\.com/i, 'fasáda nesmí stahovat nic z twimg');
  assert.doesNotMatch(EMBED_HTML, /<picture>|<img /, 'fasáda X nenese žádnou fotku');

  assert.match(EMBED_HTML, /x-facade-loading-note/, 'stav načítání drží tvar, než widget vloží iframe');
  assert.match(EMBED_HTML, /x-facade-spinner/);
  assert.match(PAGE, /import \{ inicializujXFacades \} from '\.\.\/\.\.\/lib\/x-embed\.js'/);
  assert.match(PAGE, /inicializujXFacades\(\)/);
});

test('inline skript u embedu opraví data-theme podle webu — statický, bez interpolace', () => {
  const skript = EMBED_HTML.match(/<script>[\s\S]*?<\/script>/)?.[0];
  assert.ok(skript, 'embed musí nést tiny inline skript na téma — jinak na dark webu blikne bílá karta');
  assert.match(skript, /documentElement\.dataset\.theme/, 'ruční přepnutí na <html> má přednost');
  assert.match(skript, /prefers-color-scheme: dark/, 'jinak systémové schéma');
  assert.match(skript, /setAttribute\("data-theme",t\)/);
  assert.match(skript, /document\.currentScript/,
    'skript si najde SVŮJ embed — víc embedů na stránce si nesmí lézt do zelí');
  assert.doesNotMatch(skript, /\$\{|SpaceX|2093477720638341395/,
    'statický řetězec — z frontmatteru do inline skriptu nic nevede');

  // Stejný skript pro každý post: žádná interpolace hodnot.
  const jiny = xEmbedHtml(xPostEmbed('https://x.com/NASA/status/2092372845544321445'));
  assert.equal(jiny.match(/<script>[\s\S]*?<\/script>/)?.[0], skript);

  // Skript stojí hned ZA fasádou (previousElementSibling) a PŘED fallbackem.
  const fasada = EMBED_HTML.indexOf('data-x-facade');
  const konecFasady = EMBED_HTML.indexOf('</blockquote></div>', fasada);
  assert.notEqual(konecFasady, -1);
  const indexSkriptu = EMBED_HTML.indexOf('<script>');
  assert.ok(indexSkriptu > konecFasady, 'skript stojí až za fasádou');
});

test('widgets.js startuje defer z <head> jen při xPosts — s preconnectem, ne na celý web', () => {
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <link rel="preconnect" href="https:\/\/platform\.twitter\.com" slot="head" \/>\}/,
    'preconnect šetří DNS+TLS — Base preconnectuje jen ytimg/audio/insights');
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <link rel="dns-prefetch" href="https:\/\/platform\.twitter\.com" slot="head" \/>\}/);
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <link rel="preconnect" href="https:\/\/cdn\.syndication\.twimg\.com" slot="head" \/>\}/,
    'widgets.js tahá karty z cdn.syndication.twimg.com — hint jen u článku s embedem');
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <link rel="dns-prefetch" href="https:\/\/cdn\.syndication\.twimg\.com" slot="head" \/>\}/);
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <link rel="preconnect" href="https:\/\/syndication\.twitter\.com" slot="head" \/>\}/,
    'widgets.js sahá i na syndication.twitter.com — stejný hint, stejná podmínka xPosts');
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <link rel="dns-prefetch" href="https:\/\/syndication\.twitter\.com" slot="head" \/>\}/);
  assert.match(PAGE, /\{xEmbedy\.length > 0 && <script is:inline defer src="https:\/\/platform\.twitter\.com\/widgets\.js" slot="head"><\/script>\}/,
    'widgets.js jde defer — až po naparsování blockquote, ne async závod');
  assert.doesNotMatch(PAGE, /<link rel="preconnect" href="https:\/\/platform\.twitter\.com" slot="head" \/>\s*$/m,
    'preconnect nesmí být bez podmínky xPosts');
  assert.doesNotMatch(PAGE, /<link rel="preconnect" href="https:\/\/cdn\.syndication\.twimg\.com" slot="head" \/>\s*$/m,
    'syndication preconnect nesmí být bez podmínky xPosts');
  assert.doesNotMatch(PAGE, /<link rel="preconnect" href="https:\/\/syndication\.twitter\.com" slot="head" \/>\s*$/m,
    'syndication.twitter.com preconnect nesmí být bez podmínky xPosts');
  assert.doesNotMatch(BASE, /platform\.twitter\.com|syndication\.twimg\.com|syndication\.twitter\.com/,
    'Base nesmí widgets.js ani preconnect nést — na stránky bez xPosts nepatří');
  assert.doesNotMatch(INDEX, /platform\.twitter\.com|syndication\.twimg\.com|syndication\.twitter\.com/,
    'homepage nesmí preconnectovat X — widgets.js je jen u článku s xPosts');
  assert.doesNotMatch(ARCHIV, /platform\.twitter\.com|syndication\.twimg\.com|syndication\.twitter\.com/,
    'archiv nesmí preconnectovat X');
});

test('serverové HTML nese jeden únik — blockquote, ne druhý řádek „Nenačítá se?“', () => {
  assert.doesNotMatch(EMBED_HTML, /x-embed-fallback|Nenačítá se\?/,
    'druhý řádek pod kartou padl — po 15 s zůstane jen věta + .x-facade-open');
  assert.match(EMBED_HTML, /<a href="https:\/\/twitter\.com\/SpaceX\/status\/2093477720638341395">Příspěvek @SpaceX na X<\/a>/);
});

test('embed vkládá rehype plugin v buildu — šablona ho už nenese a .article-body začíná obsahem', () => {
  // Plugin je registrovaný v markdown pipeline — blockquote dojde do
  // statického HTML a nic se nepřesouvá na klientovi (žádné bliknutí karty).
  assert.match(CONFIG, /import \{ rehypeXEmbedy \} from '\.\/src\/lib\/rehype-x-embed\.js'/);
  assert.match(CONFIG, /rehypePlugins: \[[^\]]*rehypeXEmbedy[^\]]*\]/);

  // Šablona samotná fasádu nerenderuje — takže embed NEMŮŽE být první
  // dítě .article-body: uvnitř je jen <Content /> s článkem.
  assert.doesNotMatch(PAGE, /xEmbedy\.map|data-x-facade|x-facade-loading-note|x-embed-fallback/,
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

test('plugin vloží embed za první odstavec — nikdy jako první uzel těla článku', () => {
  const tree = strom(p(DLOUHY), nl(), p('Druhý odstavec.'), nl(), h2('Sekce'));
  rehypeXEmbedy()(tree, soubor([FLIGHT14_URL]));

  assert.equal(tree.children.length, 6);
  assert.notEqual(tree.children[0].type, 'raw', 'embed nesmí být první uzel — napřed text, pak widget');
  assert.equal(tree.children[0].tagName, 'p', 'článek začíná odstavcem');
  assert.equal(tree.children[1].type, 'raw', 'embed stojí hned za prvním odstavcem');
  assert.equal(tree.children[1].value, EMBED_HTML);
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

// ── 3. Klientský modul jen hlídá render — blockquote nestaví ────────

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
    if (selector === 'iframe') {
      return this.children.find((child) => child.tagName === 'IFRAME') ?? null;
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

// Fasáda tak, jak přichází ze serverového HTML: stav načítání + blockquote
// s default light tématem — klient nic z toho nestaví.
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
  facade.className = 'x-facade x-facade-loading';
  facade.classList.add('x-facade-loading');
  facade.dataset.xPostId = '2093477720638341395';
  facade.dataset.xPostHref = 'https://twitter.com/SpaceX/status/2093477720638341395';

  const note = new FakeElement('p', ownerDocument);
  note.className = 'x-facade-loading-note mono';
  const blockquote = new FakeElement('blockquote', ownerDocument);
  blockquote.className = 'twitter-tweet';
  blockquote.setAttribute('data-theme', 'light');
  facade.replaceChildren(note, blockquote);

  const root = { querySelectorAll: () => [facade] };
  return { root, facade, blockquote, created, ownerDocument };
}

test('inicializace převezme serverový blockquote — nestaví druhý a načte widgets.js', () => {
  const { root, facade, blockquote, created, ownerDocument } = fixture();

  inicializujXFacades(root);

  assert.equal(facade.querySelector('blockquote'), blockquote,
    'blockquote ze serverového HTML zůstává — klient nesmí stavět druhý');
  assert.equal(created.filter((el) => el.tagName === 'BLOCKQUOTE').length, 0);
  assert.ok(facade.classList.contains('x-facade-loading'), 'do vložení iframe drží stav načítání');
  assert.ok(facade.querySelector('.x-facade-loading-note'), 'spinner ze serveru zůstává');

  // Pojistka: fixture nemá widgets.js v <head> (na reálné stránce ho nese
  // šablona), tak ho modul doplní — nejvýš jednou.
  const script = ownerDocument.head.children.find((child) => child.tagName === 'SCRIPT');
  assert.ok(script, 'bez skriptu v <head> musí pojistka widgets.js načíst');
  assert.equal(script.src, 'https://platform.twitter.com/widgets.js');
  assert.equal(script.defer, true);
  assert.equal(script.async, undefined);
});

test('stránka bez fasád X nenačte widgets.js — skript se nevkládá na celý web', () => {
  const { created, ownerDocument } = fixture();
  const prazdnyRoot = { querySelectorAll: () => [] };

  inicializujXFacades(prazdnyRoot);
  assert.equal(created.length, 0, 'bez fasády se nesmí nic vytvořit');
  assert.equal(ownerDocument.head.children.length, 0, 'bez fasády se widgets.js nenačítá');
});

test('když widgets.js vloží iframe před naším modulem, aktivace jen uklidí stav načítání', () => {
  const { facade, ownerDocument } = fixture();
  const iframe = new FakeElement('iframe', ownerDocument);
  facade.replaceChildren(facade.children[0], iframe);

  assert.equal(aktivujXFacade(facade), null);
  assert.equal(facade.classList.contains('x-facade-loading'), false);
  assert.ok(facade.classList.contains('x-facade-loaded'), 'panel končí — tweet si výšku řídí sám');
  assert.equal(facade.querySelector('.x-facade-loading-note'), null, 'spinner nesmí zůstat vedle iframe');
  assert.equal(facade.querySelector('iframe'), iframe);
});

test('mezi načtením a iframem je viditelný stav načítání, dokonciXFacade ho uklidí', () => {
  const { facade } = fixture();

  aktivujXFacade(facade);

  assert.ok(facade.classList.contains('x-facade-loading'), 'fasáda musí hlásit načítání');
  assert.ok(facade.querySelector('.x-facade-loading-note'),
    'poznámka o načítání ze serveru zůstává — kostra nesmí zmizet do prázdna');

  // Jakmile widget vloží iframe (v prohlížeči přes MutationObserver),
  // spinner zmizí a fasáda odloží panel, aby si tweet určil výšku sám.
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
  assert.equal(odkaz.className, 'x-facade-open');
  assert.equal(odkaz.href, 'https://x.com/SpaceX/status/2093477720638341395',
    'viditelný únik vede na lidský x.com, twitter.com href je jen pro widgets.js');
  assert.equal(odkaz.target, '_blank');
  assert.equal(odkaz.rel, 'noopener');
  assert.equal(note.children.length, 2, 'jedna věta + jedno tlačítko, ne druhý řádek pod kartou');
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

test('pojistka tématu: modul srovná data-theme blockquote podle webu, dokud iframe neexistuje', () => {
  // Server posílá default light a inline skript ho opraví při parsování;
  // modul je druhá pojistka se stejnou logikou (temaWidgetu).
  const tmavy = fixture({ tema: 'dark' });
  assert.equal(aktivujXFacade(tmavy.facade), tmavy.blockquote);
  assert.equal(tmavy.blockquote.attributes.get('data-theme'), 'dark');

  const svetly = fixture({ tema: 'light', systemDark: true });
  aktivujXFacade(svetly.facade);
  assert.equal(svetly.blockquote.attributes.get('data-theme'), 'light',
    'ruční přepnutí na light má přednost před systémovým dark');

  const systemovy = fixture({ systemDark: true });
  aktivujXFacade(systemovy.facade);
  assert.equal(systemovy.blockquote.attributes.get('data-theme'), 'dark');

  const vychozi = fixture();
  aktivujXFacade(vychozi.facade);
  assert.equal(vychozi.blockquote.attributes.get('data-theme'), 'light',
    'bez matchMedia i bez data-theme padáme na light');

  assert.equal(temaWidgetu({ documentElement: { dataset: {} } }), 'light');
});

test('druhá aktivace nic nepřidá a widgets.js se načítá nejvýš jednou', () => {
  const { facade, ownerDocument } = fixture();

  assert.ok(aktivujXFacade(facade));
  assert.equal(aktivujXFacade(facade), null, 'druhá aktivace je no-op');
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
  assert.doesNotMatch(sekce, /x-facade-skeleton|x-facade-mark|x-facade-title/,
    'mezikostra s logem X padla — serverové HTML nese rovnou stav načítání s blockquote');
  assert.doesNotMatch(sekce, /x-facade-button|x-facade-note \{|cursor: pointer/,
    'click-to-load tlačítko Maky zrušil — žádné interaktivní styly fasády');
  const loading = sekce.match(/\.x-facade-loading \{([^}]+)\}/)?.[1];
  assert.ok(loading, 'chybí blok .x-facade-loading');
  const minHeight = loading.match(/min-height:\s*(\d+)px/);
  assert.ok(minHeight, '.x-facade-loading musí rezervovat výšku karty — jinak spinner pruh a CLS');
  const reserved = Number(minHeight[1]);
  assert.ok(reserved >= 480 && reserved <= 560,
    `.x-facade-loading min-height ${reserved}px má být 480–560 px (typická karta tweetu)`);
  assert.match(sekce, /\.x-facade-spinner \{/);
  assert.match(sekce, /\.x-facade\.x-facade-loaded \{[^}]*background: transparent/,
    'po vložení iframe musí panel zmizet, aby tweet neseděl v orámované studně');
  assert.doesNotMatch(sekce, /\.x-facade\.x-facade-loaded \{[^}]*min-height/,
    'x-facade-loaded shodí chrome — iframe si výšku řídí sám, min-height tam nepatří');
  assert.match(sekce, /\.x-facade \.twitter-tweet \{[^}]*max-width: 550px/,
    'zhydratovaný widget drží sloupec ~550 px na střed, ne přes celou šířku');
  assert.match(sekce, /\.x-facade-failed \{/);
  assert.match(sekce, /\.x-facade-open \{[^}]*min-height:\s*44px/,
    'únik „Otevřít na X“ musí mít zásah 44 px');
  assert.doesNotMatch(sekce, /x-embed-fallback/,
    'druhý řádek pod kartou nesmí zůstat ve stylech');
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

test('CSP povoluje přesně to, co oficiální widget potřebuje', () => {
  const csp = cspDirectives();

  // Runtime ověřeno (Chrome headless, viz PR #359): rodičovský dokument
  // stáhne jen widgets.js (script-src) a widget vloží iframy na
  // platform.twitter.com (frame-src). Vše ostatní — pbs.twimg.com,
  // syndication, video — běží uvnitř cross-origin iframe mimo naši CSP.
  // Inline theme skript u embedu kryje 'unsafe-inline', které script-src
  // nese odjakživa (theme skript v Base).
  assert.ok(csp.get('script-src').includes('https://platform.twitter.com'));
  assert.ok(csp.get('script-src').includes("'unsafe-inline'"),
    'inline theme skript u embedu (a v Base) musí projít');
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
