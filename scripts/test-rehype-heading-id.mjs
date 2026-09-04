// Chování rehype pluginu `rehypeAsciiHeadingIds` z astro.config.mjs.
//
// Plugin přepisuje `id` u nadpisů h2–h4 v KAŽDÉM vykresleném článku, takže
// rozhoduje o tom, kam míří kotvy a odkazy zvenčí. Dosud ho hlídal jen
// textový regex nad zdrojákem (test-heading-id.mjs), který projde i tehdy,
// když plugin nefunguje vůbec — sám průchod stromem otestovaný nebyl.
//
// Pořadí v pipeline @astrojs/markdown-remark: uživatelské rehype pluginy
// běží PŘED interním `rehypeHeadingIds`. Astro pak vidí `properties.id`
// už jako string a nechá ho být (`if (typeof node.properties.id !== 'string')`),
// takže výsledek tohohle pluginu je to, co se dostane do HTML i do getHeadings().
import assert from 'node:assert/strict';
import test from 'node:test';

import './test-sitemap-register.mjs';

import { asciiHeadingId } from '../src/lib/heading-id.js';

const { setArticles } = await import('./test-sitemap-mocks/state.mjs');

// astro.config.mjs čte při načtení src/content/clanky přes node:fs; loader
// ho podstrčí z mocku, prázdný seznam článků pluginu nevadí.
setArticles([]);
const { default: config } = await import('../astro.config.mjs?rehype-heading-test=1');

const plugins = config.markdown.rehypePlugins;
assert.equal(plugins.length, 3,
  'astro.config.mjs má mít tři rehype pluginy: ASCII id nadpisů, embed X (rehype-x-embed) a obal tabulek (rehype-tabulky)');
const headingPlugin = plugins.find((plugin) => plugin.name === 'rehypeAsciiHeadingIds');
assert.ok(headingPlugin, 'astro.config.mjs ztratil plugin rehypeAsciiHeadingIds');

/** Vyrobí transformer — plugin je factory, volá se jednou za dokument. */
const transform = () => headingPlugin();

const text = (value) => ({ type: 'text', value });
const el = (tagName, children, properties) => ({
  type: 'element',
  tagName,
  ...(properties ? { properties } : {}),
  children,
});
const root = (children) => ({ type: 'root', children });

/** Projde strom a vrátí `id` daného nadpisu (undefined = plugin ho nenastavil). */
function idOf(node) {
  return node.properties?.id;
}

test('h2–h4 dostanou ASCII id bez diakritiky', () => {
  const h2 = el('h2', [text('Aktuální ceny v Česku')]);
  const h3 = el('h3', [text('Kolik stojí příprava')]);
  const h4 = el('h4', [text('Shrnutí')]);
  transform()(root([h2, h3, h4]));

  assert.equal(idOf(h2), 'aktualni-ceny-v-cesku');
  assert.equal(idOf(h3), 'kolik-stoji-priprava');
  assert.equal(idOf(h4), 'shrnuti');
});

test('text nadpisu se skládá i z vnořených inline prvků', () => {
  // `## Ceny **2026** v <em>Česku</em>` → jeden souvislý text, ne jen první uzel
  const h2 = el('h2', [
    text('Ceny '),
    el('strong', [text('2026')]),
    text(' v '),
    el('em', [text('Česku')]),
  ]);
  transform()(root([h2]));

  assert.equal(idOf(h2), 'ceny-2026-v-cesku');
});

test('inline `code` v nadpisu se do id započítá', () => {
  const h2 = el('h2', [text('Nastavení '), el('code', [text('robots.txt')])]);
  transform()(root([h2]));

  assert.equal(idOf(h2), 'nastaveni-robotstxt');
});

test('syrové HTML (raw uzly) se do id nezapočítá', () => {
  // remark-rehype běží s allowDangerousHtml, `rehypeRaw` až za námi — v téhle
  // fázi je `<br>` ještě uzel typu raw s .value, ne element. Kdyby text()
  // začal brát .value bez ohledu na typ, id by obsahovalo kus značky.
  const h2 = el('h2', [
    text('Ceny '),
    { type: 'raw', value: '<br>' },
    text(' a slevy'),
  ]);
  transform()(root([h2]));

  assert.equal(idOf(h2), 'ceny-a-slevy');
  assert.equal(idOf(h2).includes('br'), false);
});

test('h1, h5 a h6 plugin nesahá — id nechává na Astru', () => {
  const h1 = el('h1', [text('Titulek článku')]);
  const h5 = el('h5', [text('Poznámka pod čarou')]);
  const h6 = el('h6', [text('Zdroje')]);
  transform()(root([h1, h5, h6]));

  assert.equal(idOf(h1), undefined);
  assert.equal(idOf(h5), undefined);
  assert.equal(idOf(h6), undefined);
});

test('nadpis bez ASCII zbytku nedostane prázdné id', () => {
  // Tiché přeskočení (`if (id)`) je záměr: prázdné id="" by rozbilo kotvu
  // i fallback v Astru. Test hlídá, že se klíč `id` vůbec nezaloží.
  const h2 = el('h2', [text('… ?! —')]);
  const h3 = el('h3', [text('🚀')]);
  transform()(root([h2, h3]));

  assert.equal(idOf(h2), undefined);
  assert.equal('id' in (h2.properties ?? {}), false);
  assert.equal(idOf(h3), undefined);
});

test('ostatní properties nadpisu zůstanou zachované', () => {
  const h2 = el('h2', [text('Ceny v Česku')], {
    className: ['sekce'],
    'data-poradi': '3',
  });
  transform()(root([h2]));

  assert.equal(idOf(h2), 'ceny-v-cesku');
  assert.deepEqual(h2.properties.className, ['sekce']);
  assert.equal(h2.properties['data-poradi'], '3');
});

test('nadpis vnořený hlouběji ve stromě se najde taky', () => {
  const h2 = el('h2', [text('Vnořený nadpis')]);
  transform()(root([el('div', [el('section', [h2])])]));

  assert.equal(idOf(h2), 'vnoreny-nadpis');
});

test('uzly bez children plugin nerozbijí', () => {
  const h2 = el('h2', [text('Po obrázku')]);
  const img = { type: 'element', tagName: 'img', properties: { src: '/a.jpg' } };
  const komentar = { type: 'comment', value: 'poznámka' };

  assert.doesNotThrow(() => transform()(root([img, komentar, h2])));
  assert.equal(idOf(h2), 'po-obrazku');
});

test('ořez na 60 znaků platí i přes plugin a shoduje se se sdíleným helperem', () => {
  const dlouhy = `${'a'.repeat(59)} zaver`;
  const h2 = el('h2', [text(dlouhy)]);
  transform()(root([h2]));

  assert.equal(idOf(h2), asciiHeadingId(dlouhy));
  assert.equal(idOf(h2).length, 59);
  assert.equal(idOf(h2).endsWith('-'), false);
});

test('každý dokument slugy počítá od začátku (transformer je bezstavový)', () => {
  const prvni = el('h2', [text('Shrnutí')]);
  const druhy = el('h2', [text('Shrnutí')]);
  transform()(root([prvni]));
  transform()(root([druhy]));

  assert.equal(idOf(prvni), 'shrnuti');
  assert.equal(idOf(druhy), 'shrnuti');
});

test('dva nadpisy se stejným textem musí dostat různá id [codex-testy-web/REHYPE-NADPISY-001]', () => {
  const prvni = el('h2', [text('Shrnutí')]);
  const druhy = el('h2', [text('Shrnutí')]);
  const treti = el('h2', [text('Shrnutí')]);
  transform()(root([prvni, druhy, treti]));

  assert.equal(idOf(prvni), 'shrnuti');
  assert.equal(idOf(druhy), 'shrnuti-1');
  assert.equal(idOf(treti), 'shrnuti-2');
});

test('nadpisy shodné v prvních 60 znacích musí dostat různá id [codex-testy-web/REHYPE-NADPISY-001]', () => {
  // Obě varianty se liší až za 60. znakem, ořez je srovná na tentýž slug.
  // Přípona MUSÍ přijít až po ořezu — jinak se `-1` ořízne a kolize zůstane.
  const prvni = el('h2', [text('Kolik stojí realitní web v roce 2026 a co všechno je v ceně zahrnuto')]);
  const druhy = el('h2', [text('Kolik stojí realitní web v roce 2026 a co všechno je v ceně navíc')]);
  transform()(root([prvni, druhy]));

  const zaklad = 'kolik-stoji-realitni-web-v-roce-2026-a-co-vsechno-je-v-cene';
  assert.equal(idOf(prvni), zaklad);
  assert.equal(idOf(druhy), `${zaklad}-1`);
  assert.notEqual(idOf(druhy), idOf(prvni));
  assert.ok(
    idOf(druhy).endsWith('-1'),
    'přípona po ořezu — kdyby šla do slice(0, 60), ořízla by se pryč',
  );
});
