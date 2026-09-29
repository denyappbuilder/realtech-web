import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { filtrujIndex, hledejVIndexu } from '../src/lib/archiv-filtr.js';

// Kolo 60 (29. 9. 2026): archiv hledá stejně jako ⌘K; „gpt 5“ = „gpt-5“.
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const telo = (zdroj) => zdroj.match(/function hledejVIndexu\([^)]*\) \{[\s\S]*?\n\s*return nejlepsi\.length \? nejlepsi : kolo\('preklep'\);\n\s*\}/)?.[0]
  .replace(/: PolozkaIndexu\[\]|: string|: 'presne' \| 'kmen' \| 'preklep'|\): r is \{ it: PolozkaIndexu; skore: number \}/g, (m) => (m.startsWith('):') ? ')' : ''))
  .replace(/\s+/g, ' ');

const I = (s, t, p, extra = {}) => ({ s, t, d: '', k: 'AI Report', b: '', p, ...extra });
const INDEX = [
  I('gpt6', 'Opus 5.5 vs GPT-6 Sol', '2026-09-20', { b: '5 tipů' }),
  I('gpt56', 'OpenAI srazilo cenu GPT-5.6 Sol', '2026-09-10'),
  I('images', 'ChatGPT Images 2.5: 5 tipů', '2026-09-25'),
  I('starlink', 'Starlink v Česku', '2026-07-20', { k: 'Sítě' }),
  I('flight', 'Starship vysadila satelity', '2026-09-26', { k: 'Vesmír', b: 'družice Starlinku míří na orbitu' }),
  I('dron', 'Konec DJI v USA', '2026-07-02', { k: 'Drony', b: 'zákaz dronů' }),
  I('drony2', 'DJI vs. Insta360', '2026-06-14', { k: 'Drony', b: 'kamery a drony' }),
];

test('kolo 60: „gpt 5“ / „gpt5“ / „gpt-5“ najdou totéž a GPT-6 ani „5 tipů“ ne', () => {
  for (const q of ['gpt 5', 'gpt5', 'gpt-5', 'GPT 5']) {
    assert.deepEqual(filtrujIndex(INDEX, { kat: '', q }).map((x) => x.s), ['gpt56'], q);
  }
});

test('kolo 60: archiv má kmeny — „starlinku“ najde i „Starlink“, „dronů“ i „drony“', () => {
  assert.deepEqual(filtrujIndex(INDEX, { kat: '', q: 'starlinku' }).map((x) => x.s).sort(), ['flight', 'starlink']);
  assert.deepEqual(filtrujIndex(INDEX, { kat: '', q: 'dronů' }).map((x) => x.s).sort(), ['dron', 'drony2']);
});

test('kolo 60: s dotazem řadí skóre (shoda v titulku nad shodou v textu), bez dotazu pořadí indexu', () => {
  assert.equal(filtrujIndex(INDEX, { kat: '', q: 'starlink' })[0].s, 'starlink', 'titulek nad textem, i když je starší');
  assert.deepEqual(filtrujIndex(INDEX, { kat: 'Drony', q: '' }).map((x) => x.s), ['dron', 'drony2'], 'jen kategorie = pořadí indexu');
  assert.deepEqual(hledejVIndexu(INDEX, 'strlink', '').map((x) => x.s), ['starlink'], 'překlep dál jen jako záloha (celé slovo / stejně dlouhý začátek)');
});

test('kolo 60: TOTÉŽ tělo hledejVIndexu na edge (lib) a v klientském archivu; ⌘K sdílí normalizaci', () => {
  const lib = telo(cti('src/lib/archiv-filtr.js'));
  assert.ok(lib, 'lib');
  assert.equal(telo(cti('src/components/ArticleArchivePage.astro')), lib, 'archiv klient');
  assert.match(cti('src/components/ArticleArchivePage.astro'), /const vybrane = hledejVIndexu\(index \?\? \[\], query, category\);/);
  assert.match(cti('src/components/SearchModal.astro'), /\.replace\(\/\(\[a-z\]\)\[\\s-\]\*\(\?=\\d\)\/g, '\$1-'\);/, '⌘K spojuje písmeno a číslici stejně');
});
