import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { inicializujYoutubeFacades } from '../src/lib/youtube-facade.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/[...id].astro'), 'utf8');
const BASE = fs.readFileSync(path.join(ROOT, 'src/layouts/Base.astro'), 'utf8');
const STARLINK = fs.readFileSync(
  path.join(ROOT, 'src/content/clanky/starlink-v-cesku-pruvodce.md'),
  'utf8',
);

function videoTemplate(source) {
  const start = source.indexOf('{videoId && (');
  const end = source.indexOf('{video && (', start);
  assert.notEqual(start, -1, 'šablona nemá větev pro video');
  assert.notEqual(end, -1, 'nejde vymezit větev pro video');
  return source.slice(start, end);
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.dataset = {};
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
  }

  querySelector(selector) {
    if (selector === '.youtube-facade-button') {
      return this.children.find((child) => child.className === 'youtube-facade-button') ?? null;
    }
    if (selector === 'iframe') {
      return this.children.find((child) => child.tagName === 'IFRAME') ?? null;
    }
    return null;
  }

  addEventListener(type, callback, options) {
    this.listeners.set(type, { callback, once: Boolean(options?.once) });
  }

  activate() {
    const listener = this.listeners.get('click');
    listener?.callback({ type: 'click' });
    if (listener?.once) this.listeners.delete('click');
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  focus() {
    this.focused = true;
  }
}

function fixture() {
  const created = [];
  const ownerDocument = {
    createElement(tagName) {
      const element = new FakeElement(tagName, ownerDocument);
      created.push(element);
      return element;
    },
  };
  const facade = new FakeElement('div', ownerDocument);
  facade.dataset.videoId = 'l-S4MR27JaE';
  facade.dataset.videoTitle = 'Video: Starlink Standard po půl roce';
  const button = new FakeElement('button', ownerDocument);
  button.className = 'youtube-facade-button';
  facade.children = [button];
  const root = { querySelectorAll: () => [facade] };
  return { root, facade, button, created };
}

test('produkční šablona posílá v prvním HTML lokální facade bez iframe', () => {
  const template = videoTemplate(PAGE);

  assert.match(template, /class="video-embed youtube-facade"/);
  assert.doesNotMatch(template, /<iframe\b/i, 'iframe nesmí existovat před souhlasnou aktivací');
  assert.match(template, /\{heroSrc && \([\s\S]*<img src=\{heroSrc\}/);
  assert.doesNotMatch(template, /ytimg\.com/i, 'facade nesmí stahovat náhled z YouTube');
  assert.match(PAGE, /import \{ inicializujYoutubeFacades \} from '\.\.\/\.\.\/lib\/youtube-facade\.js'/);
  assert.match(PAGE, /inicializujYoutubeFacades\(\)/);
});

test('facade používá nativní tlačítko s přístupným názvem a zachovává fallback odkaz', () => {
  const template = videoTemplate(PAGE);

  assert.match(
    template,
    /<button[\s\S]*type="button"[\s\S]*class="youtube-facade-button"[\s\S]*aria-label=\{`Přehrát video: \$\{title\}`\}/,
  );
  assert.match(PAGE, /<a href=\{video\} class="yt-btn">[\s\S]*Přehrát na YouTube/);
});

test('produkční skript nevytvoří iframe při inicializaci, až při aktivaci tlačítka', () => {
  const { root, facade, button, created } = fixture();

  inicializujYoutubeFacades(root);
  assert.equal(created.length, 0, 'samotné načtení stránky nesmí vytvořit iframe');
  assert.equal(facade.querySelector('iframe'), null);

  button.activate();

  assert.equal(created.length, 1);
  const iframe = facade.querySelector('iframe');
  assert.equal(iframe, created[0]);
  assert.equal(
    iframe.src,
    'https://www.youtube-nocookie.com/embed/l-S4MR27JaE?autoplay=1',
  );
  assert.equal(iframe.title, 'Video: Starlink Standard po půl roce');
  assert.match(iframe.allow, /autoplay/);
  assert.equal(iframe.allowFullscreen, true);
  assert.equal(iframe.attributes.get('allowfullscreen'), '');
  assert.equal(iframe.focused, true);
});

test('Starlink má jediné video ve frontmatteru a žádný obsahový iframe', () => {
  assert.match(STARLINK, /^video: "https:\/\/youtu\.be\/l-S4MR27JaE"$/m);
  assert.match(STARLINK, /^image: "\/images\/clanky\/starlink-v-cesku-pruvodce\.jpg"$/m);
  assert.doesNotMatch(STARLINK, /<iframe\b|youtube-nocookie\.com\/embed/i);
});

test('Base už nepředpojuje i.ytimg.com globálně', () => {
  assert.doesNotMatch(BASE, /<link\s+rel="preconnect"\s+href="https:\/\/i\.ytimg\.com"/i);
});
