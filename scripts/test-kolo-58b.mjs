import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { rehypeOsnovaUrovne } from '../src/lib/rehype-osnova.js';
import { WEBP_STROP, webpSeStropem } from './optimize-images.mjs';
import sharp from 'sharp';

// Kolo 58b (27. 9. 2026): technický audit živého webu — Atlas.
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const bezKomentaru = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const el = (tagName, text = 'x') => ({ type: 'element', tagName, properties: {}, children: [{ type: 'text', value: text }] });

test('kolo 58: článek v ### bez úvodního ## dostane pod h1 rovnou h2 (axe heading-order)', () => {
  const tree = { type: 'root', children: [el('p'), el('h3', 'A'), el('p'), el('h4', 'A1'), el('h3', 'B'), el('h2', 'Zdroje'), el('h3', 'Z1')] };
  rehypeOsnovaUrovne()(tree);
  assert.deepEqual(tree.children.filter((n) => /^h\d$/.test(n.tagName)).map((n) => n.tagName), ['h2', 'h3', 'h2', 'h2', 'h3'],
    'před prvním h2 o úroveň výš, od h2 dál beze změny');
  const ok = { type: 'root', children: [el('h2'), el('h3'), el('h2')] };
  rehypeOsnovaUrovne()(ok);
  assert.deepEqual(ok.children.map((n) => n.tagName), ['h2', 'h3', 'h2'], 'článek začínající h2 se nemění');
  const config = cti('astro.config.mjs');
  assert.match(config, /rehypeChecklist, rehypeOsnovaUrovne\]/, 'plugin běží poslední (id nadpisů už jsou přidělená)');
});

test('kolo 58: karta Audio přehled před kliknutím nestahuje MP3 (preload none), délka je v hlavičce', () => {
  const audio = bezKomentaru(cti('src/components/AudioPrehled.astro'));
  assert.match(audio, /<audio controls preload="none" src=\{pohled\.src\}/);
  assert.match(audio, /<time datetime=\{pohled\.iso\}>\{pohled\.delkaText\}<\/time>/);
});

test('kolo 58: žádný text v Plex Mono 500 — logo „CZ“ je 400', () => {
  const css = cti('src/styles/global.css');
  const logo = css.match(/\.logo \.cz \{[^}]*\}/)[0];
  assert.match(logo, /font-weight: 400;/);
});

test('kolo 58: <aside> landmarky mají přístupné jméno', () => {
  assert.match(cti('src/pages/clanky/[...id].astro'), /<aside class="article-aside" aria-label="O článku">/);
  for (const f of ['o-nas', 'gdpr', 'herohero']) {
    const src = bezKomentaru(cti(`src/pages/${f}.astro`));
    assert.doesNotMatch(src, /<aside(?![^>]*aria-label)[^>]*>/, `${f}: aside bez aria-label`);
  }
});

test('kolo 58: téma strana 2+ — drobek „Strana N“ a CollectionPage.description = meta description', () => {
  const tema = cti('src/components/TemaPage.astro');
  assert.match(tema, /\.\.\.\(page > 1 \? \[\{ '@type': 'ListItem', position: 4, name: `Strana \$\{page\}`, item: new URL\(pagePath\(page\), Astro\.site\)\.href \}\] : \[\]\)/);
  assert.match(tema, /description: page > 1 \? `\$\{popis\} Strana \$\{page\}\.` : popis,/);
});

test('kolo 58: VideoObject — každé video má délku a den nahrání, uploadDate z něj', () => {
  const dir = new URL('../src/content/clanky/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const fm = readFileSync(new URL(f, dir), 'utf8').split('\n---\n')[0];
    if (!/^video:/m.test(fm)) continue;
    assert.match(fm, /^videoLength: "\d{1,2}:\d{2}(?::\d{2})?"$/m, `${f}: chybí videoLength`);
    assert.match(fm, /^videoUploaded: "\d{4}-\d{2}-\d{2}"$/m, `${f}: chybí videoUploaded`);
  }
  assert.match(cti('src/pages/clanky/[...id].astro'), /uploadDate: \(videoUploaded \?\? date\)\.toISOString\(\),/);
  assert.match(cti('src/content.config.ts'), /videoUploaded: calendarDate\.optional\(\),/);
});

test('kolo 58: WebP strop — těžký zdroj spadne pod strop, lehký zůstane na q78', async () => {
  // Šum = nejhorší případ pro kompresi; hladký gradient = běžná fotka.
  const noise = Buffer.alloc(640 * 360 * 3); for (let i = 0; i < noise.length; i++) noise[i] = (i * 2654435761) >>> 24;
  const tezky = () => sharp(noise, { raw: { width: 640, height: 360, channels: 3 } });
  const q78 = (await tezky().webp({ quality: 78 }).toBuffer()).length;
  const sStropem = (await webpSeStropem(tezky, 640, 78)).length;
  assert.ok(sStropem < q78, `strop má zmenšit těžký soubor (${q78} → ${sStropem})`);
  const lehky = () => sharp({ create: { width: 640, height: 360, channels: 3, background: '#88aacc' } });
  assert.equal((await webpSeStropem(lehky, 640, 78)).length, (await lehky().webp({ quality: 78 }).toBuffer()).length, 'pod stropem beze změny');
  assert.deepEqual(Object.keys(WEBP_STROP), ['192', '384', '640', '960', '1280']);
});
