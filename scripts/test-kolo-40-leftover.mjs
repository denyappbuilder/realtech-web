// Kolo 40: hlas pro běžné Čechy + leftover po kole 39 — živý audit
// 16. 9. 2026 (po #458, hero Gemini 3.8 Live) proti kódu.
//
// Obsah: tři články o Google (Gemini 3.8 Live, Gemini Notebook sdílení,
//   Google Pics) mluvily k OSVČ / adminovi Workspace. Přepis míří na
//   běžného člověka s Google účtem; fakta, data, audio a cover zůstávají.
//   Test hlídá, že se OSVČ rámec nevrátí a limity z kola 39 platí.
// P2 (potvrzeno živě): aside „Další reporty“ vedle textu vypisoval na
//   ≥ 901px totéž pole `related` jako mřížka „Další reporty“ pod textem —
//   tytéž tři odkazy dvakrát na jedné stránce. Aside teď nese tři
//   nejnovější články MIMO related („Nejnovější reporty“).
// Nepotvrzeno (neměněno): rail „Další reporty“ na úvodce — na desktopu
//   mřížka tři railové karty skrývá (.card.card-rail-mobile), na mobilu
//   rail nekreslí; duplicita v DOM je jen pro chronologii mobilu (kolo 27).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import './test-kolo-40-register.mjs';

import { setCollection } from './test-related-articles-mocks/state.mjs';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const clanek = cti('src/pages/clanky/[...id].astro');

// ── Obsah: tři Google články pro běžného čtenáře ─────────────────────────

const GOOGLE_CLANKY = [
  'gemini-3-8-live-docs-gmail-keep',
  'gemini-notebook-external-sharing-admin',
  'google-pics-scheduled-release-workspace',
];
/** Rámec, který kolo 40 z těch tří článků odstranilo. */
const OSVC_RAMEC = /OSVČ|živnost|malá firma|malou firmu|malé firmy|klientovi|klientsk|call cent|neprodávej|checklist admina/i;
const frontmatter = (slug) => {
  const zdroj = cti(`src/content/clanky/${slug}.md`);
  const fm = zdroj.split(/^---\s*$/m)[1] ?? '';
  const pole = (klic) => fm.match(new RegExp(`^${klic}:\\s*"?(.+?)"?\\s*$`, 'm'))?.[1];
  return { zdroj, fm, telo: zdroj.split(/^---\s*$/m).slice(2).join('---'), pole };
};

test('kolo 40: tři Google články nemluví k OSVČ / adminovi jako výchozímu čtenáři', () => {
  for (const slug of GOOGLE_CLANKY) {
    const { zdroj, pole } = frontmatter(slug);
    assert.doesNotMatch(zdroj, OSVC_RAMEC, `${slug}: OSVČ / klientský rámec se vrátil`);
    assert.doesNotMatch(pole('title'), /Checklist|admina/i, `${slug}: titulek nesmí být checklist admina`);
    assert.match(zdroj, /\n\*\*Zdroj informací:\*\* \[/, `${slug}: chybí řádek Zdroj informací`);
  }
});

test('kolo 40: přepsané články drží limity kola 39 (titulek ≤ 75, popisek ≤ 180 znaků)', () => {
  for (const slug of GOOGLE_CLANKY) {
    const { pole } = frontmatter(slug);
    assert.ok([...pole('title')].length <= 75, `${slug}: titulek má ${[...pole('title')].length} znaků`);
    assert.ok([...pole('description')].length <= 180, `${slug}: popisek má ${[...pole('description')].length} znaků`);
  }
});

test('kolo 40: fakta, která řídí úvodku a přehrávač, zůstala (date, audio.url ve tvaru CI, duration, cover)', () => {
  const ocekavane = {
    'gemini-3-8-live-docs-gmail-keep': { date: '2026-09-16T13:05:04+02:00', v: '6d76534aa9fd', duration: '1086' },
    'gemini-notebook-external-sharing-admin': { date: '2026-09-15T23:06:00+02:00', v: '6bc339e18708', duration: '991' },
    'google-pics-scheduled-release-workspace': { date: '2026-09-15T23:05:00+02:00', v: 'c50e546a9578', duration: '1369' },
  };
  for (const [slug, o] of Object.entries(ocekavane)) {
    const { fm, pole } = frontmatter(slug);
    assert.equal(pole('date'), o.date, `${slug}: date řídí pořadí úvodky — neměnit`);
    assert.match(fm, new RegExp(`url: "https://audio\\.realtech\\.cz/${slug}-nlm\\.mp3\\?v=${o.v}"`), `${slug}: audio.url`);
    assert.match(fm, new RegExp(`duration: ${o.duration}\\b`), `${slug}: audio.duration`);
    assert.equal(pole('image'), `/images/clanky/${slug}.jpg`, `${slug}: cover`);
  }
});

test('kolo 40: přepis drží klíčová fakta z oficiálních postů Google', () => {
  const live = frontmatter('gemini-3-8-live-docs-gmail-keep').telo;
  for (const fakt of [/15\. (září|9\.) 2026/, /Pro\*\* a \*\*Ultra\*\*/, /Plus, Pro i Ultra/, /coming soon/, /SynthID/, /82,6/, /68,6 %/, /35,1 %/, /97,7 %/, /97 jazyk/]) {
    assert.match(live, fakt, `gemini-3-8-live: chybí ${fakt}`);
  }
  const notebook = frontmatter('gemini-notebook-external-sharing-admin').telo;
  for (const fakt of [/10\. (září|9\.) 2026/, /\*\*Off\*\*/, /Trusted Domains/, /public notebook sharing/, /NotebookLM/, /až 15 dní/]) {
    assert.match(notebook, fakt, `gemini-notebook: chybí ${fakt}`);
  }
  const pics = frontmatter('google-pics-scheduled-release-workspace').telo;
  for (const fakt of [/1\. (září|9\.) 2026/, /15\. (září|9\.) 2026/, /Starter/, /28\. 2\. 2027/, /Google AI Pro/]) {
    assert.match(pics, fakt, `google-pics: chybí ${fakt}`);
  }
});

// ── P2: aside „Nejnovější reporty“ ≠ mřížka „Další reporty“ ──────────────

function article({ id, category, date, draft = false }) {
  return { id, body: '', data: { title: id, description: `Popis ${id}`, category, date: new Date(date), draft } };
}

let fixture = 0;
async function vyber(current, entries) {
  setCollection(entries);
  globalThis.Astro = {
    props: { article: current },
    site: new URL('https://realtech.cz/'),
    url: new URL(`https://realtech.cz/clanky/${current.id}/`),
  };
  fixture += 1;
  const { related, asideNejnovejsi } = await import(`../src/pages/clanky/[...id].astro?kolo40=${fixture}`);
  return { related: related.map((c) => c.id), aside: asideNejnovejsi.map((c) => c.id) };
}

test('kolo 40: aside bere tři nejnovější články mimo related — žádný odkaz dvakrát', async () => {
  const current = article({ id: 'aktualni', category: 'AI Report', date: '2026-09-16T11:00:00Z' });
  const entries = [
    current,
    article({ id: 'ai-1', category: 'AI Report', date: '2026-09-15T21:06:00Z' }),
    article({ id: 'ai-2', category: 'AI Report', date: '2026-09-15T21:05:00Z' }),
    article({ id: 'ai-3', category: 'AI Report', date: '2026-09-14T09:30:00Z' }),
    article({ id: 'mobily-1', category: 'Mobily', date: '2026-09-13T06:25:00Z' }),
    article({ id: 'ai-4', category: 'AI Report', date: '2026-09-12T19:40:00Z' }),
    article({ id: 'ai-5', category: 'AI Report', date: '2026-09-12T05:39:00Z' }),
    article({ id: 'draft', category: 'AI Report', date: '2026-09-17T00:00:00Z', draft: true }),
  ];
  const { related, aside } = await vyber(current, entries);
  assert.deepEqual(related, ['ai-1', 'ai-2', 'ai-3'], 'výběr podle tématu pod textem se nemění');
  assert.deepEqual(aside, ['mobily-1', 'ai-4', 'ai-5'], 'aside = další tři nejnovější, chronologicky napříč kategoriemi');
  assert.equal(aside.filter((id) => related.includes(id)).length, 0, 'živě 16. 9. 2026: tytéž tři odkazy v aside i v mřížce');
  assert.ok(!aside.includes('draft') && !aside.includes('aktualni'));
});

test('kolo 40: aside je chronologický zbytek po related — i když zbývají méně než tři články', async () => {
  const current = article({ id: 'aktualni', category: 'Vesmír', date: '2026-09-10T00:00:00Z' });
  const entries = [
    current,
    article({ id: 'vesmir-1', category: 'Vesmír', date: '2026-09-09T00:00:00Z' }),
    article({ id: 'ai-1', category: 'AI Report', date: '2026-09-08T00:00:00Z' }),
    article({ id: 'ai-2', category: 'AI Report', date: '2026-09-07T00:00:00Z' }),
    article({ id: 'ai-3', category: 'AI Report', date: '2026-09-06T00:00:00Z' }),
    article({ id: 'vesmir-2', category: 'Vesmír', date: '2026-09-05T00:00:00Z' }),
  ];
  const { related, aside } = await vyber(current, entries);
  assert.deepEqual(related, ['vesmir-1', 'vesmir-2', 'ai-1']);
  assert.deepEqual(aside, ['ai-2', 'ai-3']);
});

test('kolo 40: s málo články je aside prázdný a blok se nevykreslí', async () => {
  const current = article({ id: 'aktualni', category: 'AI Report', date: '2026-09-10T00:00:00Z' });
  const { related, aside } = await vyber(current, [
    current,
    article({ id: 'jediny', category: 'AI Report', date: '2026-09-09T00:00:00Z' }),
  ]);
  assert.deepEqual(related, ['jediny']);
  assert.deepEqual(aside, []);
  assert.match(clanek, /\{asideNejnovejsi\.length > 0 && \(\s*<>\s*<p class="mono">Nejnovější reporty<\/p>/, 'blok v aside se vykreslí jen s obsahem');
});

test('kolo 40: šablona — aside vypisuje asideNejnovejsi, mřížka .related dál related; oba popisky se liší', () => {
  const aside = clanek.match(/<aside class="article-aside">([\s\S]*?)<\/aside>/)?.[1] ?? '';
  assert.match(aside, /<ul class="article-aside-related">\s*\{asideNejnovejsi\.map\(/, 'aside musí mapovat asideNejnovejsi');
  assert.doesNotMatch(aside, /related\.map\(/, 'aside nesmí znovu mapovat related');
  assert.doesNotMatch(aside, /Další reporty/, 'stejný popisek pro dva různé seznamy by mátl');
  const mrizka = clanek.match(/<div class="related">([\s\S]*?)<nav class="article-nav"/)?.[1] ?? '';
  assert.match(mrizka, /<h2>Další reporty<\/h2>/, 'h2 pod textem zůstává (test-giscus, kolo 23)');
  assert.match(mrizka, /\{related\.map\(\(c\) => <ArticleCard article=\{c\} sizes=\{KARTA_SIZES_RELATED\} \/>\)\}/);
  assert.match(clanek, /const relatedIds = new Set\(related\.map\(\(c\) => c\.id\)\);\s*const asideNejnovejsi = others\.filter\(\(c\) => !relatedIds\.has\(c\.id\)\)\.slice\(0, 3\);/);
});
