import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { pripravSouvisejici } from '../src/lib/souvisejici.js';

// Kolo 56: „Další reporty“ podle obsahu (src/lib/souvisejici.js).

const cl = (id, title, category, date, extra = {}) => ({ id, body: extra.body ?? '', data: { title, category, date: new Date(date), evergreen: extra.evergreen } });

test('kolo 56: související = shodné téma, ne nejnovější z kategorie', () => {
  const vse = [
    cl('starlink-mini-test', 'Starlink Mini v testu', 'Sítě', '2026-07-01'),
    cl('starlink-mini-vs-standard', 'Starlink Mini vs. Standard', 'Sítě', '2026-07-05'),
    cl('hotel-wifi', 'Hotelová Wi-Fi jako past', 'Sítě', '2026-09-20'),
    cl('grok-voice', 'Grok Voice bere hovory', 'Sítě', '2026-09-22'),
    cl('starlink-pruvodce', 'Starlink v Česku: průvodce', 'Sítě', '2026-06-01', { evergreen: true }),
  ];
  const souv = pripravSouvisejici(vse);
  const a = vse[0];
  const vysledek = souv(a, vse.filter((c) => c.id !== a.id)).map((c) => c.id);
  assert.deepEqual(vysledek.slice(0, 2).sort(), ['starlink-mini-vs-standard', 'starlink-pruvodce']);
  assert.equal(vysledek.length, 3, 'blok má vždy 3 karty');
});

test('kolo 56: odkaz v textu spojí články i bez shodných slov', () => {
  const vse = [
    cl('a', 'Nvidia postavila procesor', 'Hardware', '2026-09-01', { body: 'viz [test](/clanky/b/)' }),
    cl('b', 'Qualcomm odpovídá', 'Mobily', '2026-08-01'),
    cl('c', 'Sony FX5 kamera', 'Hardware', '2026-09-02'),
  ];
  const souv = pripravSouvisejici(vse);
  assert.equal(souv(vse[0], vse.slice(1))[0].id, 'b');
});

test('kolo 56: jediné shodné slovo napříč kategoriemi nestačí (iPhone Duo → hurikány „dřív“)', () => {
  const vse = [
    cl('iphone-duo', 'iPhone Duo: v prodeji dřív', 'Mobily', '2026-09-10'),
    cl('hurikany', 'Model předpovídá hurikány o den dřív', 'AI Report', '2026-09-11'),
    cl('pixel', 'Pixel 11 je venku', 'Mobily', '2026-08-01'),
  ];
  const souv = pripravSouvisejici(vse);
  const r = souv(vse[0], vse.slice(1)).map((c) => c.id);
  assert.equal(r[0], 'pixel', 'doplněk ze stejné kategorie má přednost před náhodnou shodou');
});

test('kolo 56: nad skutečnou kolekcí žádný článek neobsadí víc než 10 % bloků a nabízí se ≥ 85 % článků', () => {
  const D = new URL('../src/content/clanky/', import.meta.url);
  const fm = (raw, k) => raw.match(new RegExp(`^${k}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1];
  const vse = readdirSync(D).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = readFileSync(new URL(f, D), 'utf8');
    const [, head = '', body = ''] = raw.split(/^---$/m);
    return { id: f.replace(/\.md$/, ''), body, draft: /^draft:\s*true/m.test(head), data: { title: fm(head, 'title') ?? '', category: fm(head, 'category') ?? '', date: new Date(fm(head, 'date')), evergreen: /^evergreen:\s*true/m.test(head) } };
  }).filter((a) => !a.draft).sort((a, b) => b.data.date - a.data.date);
  const souv = pripravSouvisejici(vse);
  const pocty = new Map();
  for (const a of vse) for (const c of souv(a, vse.filter((x) => x.id !== a.id))) pocty.set(c.id, (pocty.get(c.id) ?? 0) + 1);
  const max = Math.max(...pocty.values());
  assert.ok(max <= Math.ceil(vse.length * 0.1), `nejčastější související článek ${max}× z ${vse.length}`);
  assert.ok(pocty.size >= vse.length * 0.85, `nabízí se ${pocty.size} z ${vse.length} článků`);
});

test('kolo 56: šablona článku bere related z pripravSouvisejici', () => {
  const s = readFileSync(new URL('../src/pages/clanky/[...id].astro', import.meta.url), 'utf8');
  assert.match(s, /const related = pripravSouvisejici\(vsechnyClanky\)\(article, others, 3\);/);
});
