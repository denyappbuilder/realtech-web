// B04 (19. 9. 2026): komentáře (giscus) až po kliknutí na „Zobrazit komentáře“.
// Před kliknutím: žádný požadavek na giscus.app (ani preconnect), nízký
// placeholder s odkazem na diskuzi funkční bez JS, žádná rezervovaná výška.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pripravGiscus } from '../src/lib/giscus-klient.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cti = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const KOMPONENTA = cti('src/components/Giscus.astro');
const CSS = cti('src/styles/global.css');
const CLANEK = cti('src/pages/clanky/[...id].astro');

function prvek(tag, { dataset = {}, attrs = {} } = {}) {
  const el = {
    tagName: tag.toUpperCase(), dataset: { ...dataset }, children: [], _attrs: { ...attrs }, _classes: new Set(), _listeners: {}, focused: false,
    classList: { contains: (c) => el._classes.has(c), add: (c) => el._classes.add(c), remove: (c) => el._classes.delete(c) },
    appendChild(d) { el.children.push(d); return d; },
    getAttribute: (n) => el._attrs[n] ?? null,
    setAttribute(n, v) { el._attrs[n] = String(v); },
    addEventListener(typ, cb) { (el._listeners[typ] ??= []).push(cb); },
    click() { for (const cb of el._listeners.click ?? []) cb(); },
    focus() { el.focused = true; },
  };
  return el;
}
function dokument({ tlacitko = prvek('button'), kontejner, placeholder = prvek('div'), sekce = prvek('section') } = {}) {
  const root = prvek('html', { dataset: { theme: 'dark' } });
  const doc = {
    documentElement: root, _vytvorene: [],
    createElement(tag) { const el = prvek(tag); doc._vytvorene.push(el); return el; },
    querySelector(sel) {
      if (sel === '[data-komentare-nacist]') return tlacitko;
      if (sel === '[data-komentare-placeholder]') return placeholder;
      if (sel === '.komentare') return sekce;
      if (sel === '.giscus[data-giscus]') return kontejner ?? null;
      if (sel === 'iframe.giscus-frame') return null;
      throw new Error(`Neočekávaný selektor: ${sel}`);
    },
    defaultView: { MutationObserver: class { observe() {} } },
  };
  return { doc, tlacitko, kontejner, placeholder, sekce };
}
const kontejnerOk = () => prvek('div', { dataset: { giscus: '', repo: 'denyappbuilder/realtech-web', repoId: 'R_kgDOtest', category: 'Komentáře', categoryId: 'DIC_kwDOtest' } });

test('před kliknutím se client.js nevkládá; po kliknutí ano, placeholder zmizí, fokus na kontejner', () => {
  const { doc, tlacitko, kontejner, placeholder, sekce } = dokument({ kontejner: kontejnerOk() });
  assert.equal(pripravGiscus(doc), tlacitko);
  assert.equal(kontejner.children.length, 0, 'žádný <script src=giscus.app> před kliknutím');
  assert.equal(doc._vytvorene.length, 0);
  tlacitko.click();
  assert.equal(kontejner.children.length, 1);
  assert.equal(kontejner.children[0].src, 'https://giscus.app/client.js');
  assert.equal(placeholder.getAttribute('hidden'), '');
  assert.ok(sekce.classList.contains('komentare-aktivni'));
  assert.equal(kontejner.getAttribute('tabindex'), '-1');
  assert.equal(kontejner.focused, true, 'čtenář s klávesnicí nezůstane na zmizelém tlačítku');
});

test('druhé kliknutí ani druhé připravení nevloží client.js dvakrát', () => {
  const { doc, tlacitko, kontejner } = dokument({ kontejner: kontejnerOk() });
  pripravGiscus(doc); pripravGiscus(doc);
  tlacitko.click(); tlacitko.click();
  assert.equal(kontejner.children.length, 1);
  assert.equal(tlacitko._listeners.click.length, 1);
});

test('bez konfigurace v kontejneru kliknutí nic nevloží a placeholder zůstane', () => {
  const { doc, tlacitko, placeholder } = dokument({ kontejner: prvek('div', { dataset: { giscus: '' } }) });
  pripravGiscus(doc); tlacitko.click();
  assert.equal(placeholder.getAttribute('hidden'), null);
});

test('komponenta: nativní button + odkaz na diskuzi v placeholderu, noscript únik zůstává, client.js ne v HTML', () => {
  assert.match(KOMPONENTA, /<div class="komentare-placeholder" data-komentare-placeholder>/);
  assert.match(KOMPONENTA, /<button type="button" class="komentare-nacist" data-komentare-nacist>Zobrazit komentáře<\/button>/);
  assert.match(KOMPONENTA, /<a href=\{giscusDiskuzeUrl\(konfigurace\.repo\)\} rel="noopener">nebo otevřít diskuzi na GitHubu →<\/a>/, 'odkaz funguje bez JS i před kliknutím');
  assert.match(KOMPONENTA, /<noscript>/);
  assert.doesNotMatch(KOMPONENTA, /giscus\.app\/client\.js/);
  const placeholder = KOMPONENTA.indexOf('data-komentare-placeholder');
  const kontejner = KOMPONENTA.indexOf('class="giscus"');
  assert.ok(placeholder < kontejner, 'placeholder je před kontejnerem');
});

test('článek: žádný preconnect na giscus.app před kliknutím', () => {
  assert.match(CLANEK, /const preconnectGiscus = false; \/\/ B04/);
});

test('CSS: placeholder nízký (bez min-height), tlačítko ≥ 44 px a focus-visible, výška kontejneru až po aktivaci', () => {
  const ph = CSS.match(/\.komentare-placeholder \{([^}]+)\}/)?.[1] ?? '';
  assert.ok(ph.length > 0);
  assert.doesNotMatch(ph, /min-height/);
  assert.match(CSS.match(/\.komentare-nacist \{([^}]+)\}/)?.[1] ?? '', /min-height: 44px/);
  assert.match(CSS, /\.komentare-nacist:focus-visible \{ outline: 2px solid var\(--signal\)/);
  assert.match(CSS, /^\.komentare\.komentare-aktivni \.giscus \{ min-height: 340px; \}/m);
  assert.doesNotMatch(CSS, /^\.komentare \.giscus \{[^}]*min-height/m);
  assert.doesNotMatch(ph, /#[0-9a-fA-F]{3,6}/, 'jen tokeny webu (dark mode)');
});
