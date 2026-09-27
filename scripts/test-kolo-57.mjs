import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { filtrujIndex, shodaSPreklepem } from '../src/lib/archiv-filtr.js';
import { pripravPokracovani } from '../src/lib/souvisejici.js';

// Kolo 57 (26. 9. 2026): překlepy v hledání, „Co se dělo dál“, newsletter, drobnosti.
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = cti('src/styles/redesign.css');
const telo = (zdroj) => zdroj.match(/function shodaSPreklepem\(term[^)]*\) \{[\s\S]*?\n\s*return false;\n\s*\}/)?.[0]
  .replace(/: (string|number\[\]\[\])/g, '').replace(/\s+/g, ' ');

test('kolo 57: překlep najde článek, číslo verze ani krátké slovo ne', () => {
  assert.ok(shodaSPreklepem('tset', 'starlink mini v testu'));
  assert.ok(shodaSPreklepem('strlink', 'starlink v cesku'));
  assert.ok(shodaSPreklepem('antropic', 'anthropic claude'), 'vynechané písmeno');
  assert.ok(shodaSPreklepem('nvdia', 'nvidia rtx'), 'prohozená písmena');
  assert.equal(shodaSPreklepem('gpt-6', 'gpt-5 je tady'), false, 'model s číslem se neohýbá');
  assert.equal(shodaSPreklepem('ai', 'at'), false, 'slovo pod 4 znaky bez tolerance');
  assert.equal(shodaSPreklepem('kamera', 'kosmicka raketa'), false);
});

test('kolo 57: filtrujIndex bere překlep jen jako zálohu při nule', () => {
  const index = [
    { s: 'a', t: 'Starlink Mini v testu', d: '', k: 'Sítě', b: '', p: '2026-09-01' },
    { s: 'b', t: 'Starship Flight 14', d: '', k: 'Vesmír', b: '', p: '2026-09-02' },
  ];
  assert.deepEqual(filtrujIndex(index, { kat: '', q: 'starlink mini tset' }).map((x) => x.s), ['a']);
  assert.deepEqual(filtrujIndex(index, { kat: '', q: 'starlink' }).map((x) => x.s), ['a'], 'přesná shoda nepřibírá podobné (starship)');
});

test('kolo 57: stejné tělo funkce na edge, v archivu i v ⌘K (bez importů kvůli vm testům)', () => {
  const lib = telo(cti('src/lib/archiv-filtr.js'));
  assert.ok(lib);
  assert.equal(telo(cti('src/components/ArticleArchivePage.astro')), lib, 'archiv');
  assert.equal(telo(cti('src/components/SearchModal.astro')), lib, 'hledání ⌘K');
  assert.match(cti('src/components/SearchModal.astro'), /if \(presnyPocet === 0\) return hledej\(q, 'preklep'\);/);
});

test('kolo 57: „Co se dělo dál“ = jen novější články, které sem odkazují', () => {
  const d = (s) => new Date(s);
  const vsechny = [
    { id: 'stary', body: '', data: { date: d('2026-09-01') } },
    { id: 'novy', body: 'viz [dřív](/clanky/stary/)', data: { date: d('2026-09-10') } },
    { id: 'jeste-starsi', body: '[x](/clanky/stary/)', data: { date: d('2026-08-01') } },
    { id: 'bez-odkazu', body: '', data: { date: d('2026-09-20') } },
  ];
  const p = pripravPokracovani(vsechny);
  assert.deepEqual(p(vsechny[0]).map((c) => c.id), ['novy']);
  assert.deepEqual(p(vsechny[1]), []);
  const sablona = cti('src/pages/clanky/[...id].astro');
  assert.match(sablona, /<nav class="co-dal" aria-labelledby="co-dal-nadpis">/);
  assert.ok(sablona.indexOf('class="co-dal"') > sablona.indexOf('<Content />'), 'pod textem');
});

test('kolo 57: newsletter — první selhání ukáže chybu u pole, ne odchod na Kit', () => {
  const base = cti('src/layouts/Base.astro');
  assert.match(base, /chyba\.setAttribute\('role', 'alert'\);/);
  assert.match(base, /btn\.disabled = false;/);
  assert.match(css, /\.nl-chyba \{[^}]*color: inherit;/, 'kontrast = barva textu desky, červená jen linka');
});

test('kolo 57: štítky ve výpisech na mobilu ≥ 12 px, rytmus úvodky 64/48', () => {
  assert.match(css, /\[data-archive\] \.card-thumb \.lt \.k \{ font-size: 0\.75rem;/);
  assert.match(css, /\.video-strip, \.mimo-ai, \.articles \.herohero-cta \{ margin-top: 64px; \}/);
});
