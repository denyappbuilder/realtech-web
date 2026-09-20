// Kolo 45: hluboký audit po kolech 43–44 (živě 20. 9. 2026, realtech.cz
// + preview 320–900px, light i dark, axe bez nálezů). Nálezy, které tu
// zůstávají zamčené:
//
// P0 Článek na mobilu: `.article-layout .article-body { margin-inline: auto }`
//    (premium round 3, ≤ 900px) dělá z položky mřížky shrink-to-fit box —
//    šířka = min-content obsahu. Tabulka (min-width buněk 6em) nebo dlouhá
//    URL ve „Zdrojích“ ho na 390px roztáhly na 448px v 342px sloupci a
//    CELÝ text článku odjel za pravý okraj (scrollWidth 492 > 390; oba
//    články z 20. 9. 2026). width: 100% drží šířku sloupce, overflow-wrap:
//    anywhere láme URL/`code` bez mezer, obal tabulky se vrací do sloupce
//    (kolo 17 ho táhl -20px k okraji karty, která od #447 nemá padding).
// P1 Osnova článku: kolo 44 počítalo hloubku proti nejmělčímu nadpisu
//    v celém poli. Články psané v ### s jediným `## Zdroje` na konci měly
//    zase 8 sekcí odsazených jako podsekce bez rodiče a „Zdroje“ jako
//    jedinou sekci. Podsekce je jen nadpis, před kterým už mělčí stojí.
// P1 Pořadí: úvodka, 404 a llms.txt řadily jen podle data; dva články se
//    stejným časem vydání (20. 9. 2026 10:04) pak řadilo pořadí, v jakém
//    content layer soubory načetl. Archiv, RSS, témata i „Novější →“ mají
//    id jako poslední rozřešení — teď všude tentýž komparátor.
// P1 Checklist v článku: GFM `- [ ]` (Custom GPT, 12 položek) šel ven jako
//    `<input type="checkbox" disabled>` bez popisku — axe „label“ critical,
//    čtečka u každé odrážky „políčko, nezaškrtnuto, neaktivní“, v textu UA
//    formulářový prvek bez stylu. rehype-checklist.js dává dekorativní
//    .task-box (aria-hidden), zaškrtnuté „Hotovo:“ pro čtečku.
// P2 Mrtvé CSS: `.reading-entry > a` (odkaz je od #462 v .article-credit),
//    `.related .card-body h2` (related karty jsou h3), featured h3 (featured
//    je h2), `.newsletter .mono` (žádný .mono v newsletteru).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { articleOutline } from '../src/lib/article-outline.js';
import { compareArticlesByDateDescThenId } from '../src/lib/article-order.js';
import { nahradCheckboxy, rehypeChecklist, TEXT_HOTOVO, TRIDA_BOXU, TRIDA_BOXU_HOTOVO } from '../src/lib/rehype-checklist.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const premium = bezCssKomentaru(cti('src/styles/premium.css'));
const global = bezCssKomentaru(cti('src/styles/global.css'));
const editorial = bezCssKomentaru(cti('src/styles/editorial.css'));

/** Tělo prvního pravidla se selektorem přesně na začátku řádku (i odsazeného v @media). */
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
const blok = (css, hlavicka) => css.match(new RegExp(`${hlavicka.source}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';

// ── P0: tělo článku nesmí na mobilu přetéct za okraj displeje ─────────────────

test('kolo 45: .article-body v mřížce má width: 100% — auto okraje bez ní dají šířku min-content', () => {
  const mobil = blok(premium, /@media \(max-width: 900px\)/);
  const telo = pravidlo(mobil, '.article-layout .article-body');
  assert.ok(telo, '.article-layout .article-body v @media (max-width: 900px) chybí');
  assert.match(telo, /width:\s*100%/, 'bez width: 100% je grid item s margin-inline: auto shrink-to-fit (živě 448px v 342px sloupci)');
  assert.match(telo, /max-width:\s*700px/, 'strop 700px pro 701–900px zůstává');
  assert.match(telo, /margin-inline:\s*auto/, 'centrování v 701–900px zůstává');
  // Desktop: sloupec dává minmax(0, 700px), tělo se roztahuje — beze změny.
  assert.match(pravidlo(premium, '.article-layout'), /grid-template-columns:\s*minmax\(0, 700px\) minmax\(220px, 1fr\)/);
});

test('kolo 45: dlouhé URL a code v textu článku se lámou (overflow-wrap: anywhere)', () => {
  assert.match(pravidlo(premium, '.article-body'), /overflow-wrap:\s*anywhere/);
  // Osnova to má od #447 — stejné pravidlo, stejný důvod.
  assert.match(pravidlo(editorial, '.article-contents a, .article-contents-mobile nav a'), /overflow-wrap:\s*anywhere/);
});

test('kolo 45: obal tabulky pod 580px stojí ve sloupci — karta s paddingem 20px, ke které ho kolo 17 táhlo, už není', () => {
  const uzky = blok(premium, /@media \(max-width: 580px\)/);
  const obal = pravidlo(uzky, '.article-layout .article-body .table-wrap');
  assert.ok(obal, '.article-layout .article-body .table-wrap v @media (max-width: 580px) premium.css chybí');
  assert.match(obal, /margin-inline:\s*0/);
  assert.match(obal, /border-inline:\s*1px solid var\(--line\)/);
  assert.match(obal, /border-radius:\s*8px/, 'stejný poloměr jako .article-body .table-wrap v global.css');
  // Důvod: editorial vrstva bere tělu článku padding; global.css pravidlo (kolo 17) zůstává, jen ho premium přebije.
  assert.match(pravidlo(editorial, '.article-layout .article-body'), /padding:\s*0/);
  assert.match(pravidlo(blok(global, /@media \(max-width: 580px\)/), '.article-body .table-wrap'), /margin-inline:\s*-20px/, 'global.css se neupravuje (test-kolo-17-leftover)');
  // Rolování obalu zůstává (kolo 17 / kolo 30).
  assert.match(pravidlo(global, '.article-body .table-wrap'), /overflow-x:\s*auto/);
});

// ── P1: osnova — podsekce jen s rodičem před sebou ────────────────────────────

test('kolo 45: článek v ### s jediným ## Zdroje na konci má sekce, ne osm podsekcí bez rodiče', () => {
  const zdrojeNaKonci = articleOutline([
    { depth: 3, text: 'Co se přesně změnilo', slug: 'a' },
    { depth: 3, text: 'Čtyři režimy v /config', slug: 'b' },
    { depth: 2, text: 'Zdroje', slug: 'z' },
  ]);
  assert.deepEqual(zdrojeNaKonci.map((h) => h.depth), [2, 2, 2], 'h3 před prvním h2 nemají rodiče — jsou sekce');
  assert.deepEqual(zdrojeNaKonci.map((h) => h.id), ['co-se-presne-zmenilo', 'ctyri-rezimy-v-config', 'zdroje'], 'kotvy se nemění');
  // Rodič před podsekcí ji dál odsazuje — i když článek začal v h3.
  const smiseny = articleOutline([
    { depth: 3, text: 'Úvodní bod', slug: 'u' },
    { depth: 2, text: 'Sekce', slug: 's' },
    { depth: 3, text: 'Podsekce', slug: 'p' },
    { depth: 2, text: 'Zdroje', slug: 'z' },
  ]);
  assert.deepEqual(smiseny.map((h) => h.depth), [2, 2, 3, 2]);
  // Kolo 44 zůstává: jen h3 → samé sekce; h2 + h3 → sekce + podsekce.
  assert.deepEqual(articleOutline([{ depth: 3, text: 'A', slug: 'a' }, { depth: 3, text: 'B', slug: 'b' }]).map((h) => h.depth), [2, 2]);
  assert.deepEqual(articleOutline([{ depth: 2, text: 'A', slug: 'a' }, { depth: 3, text: 'B', slug: 'b' }]).map((h) => h.depth), [2, 3]);
});

test('kolo 45: živé články z 20. 9. 2026 (### + ## Zdroje) — validate-content na ně nesahá, osnova ano', () => {
  for (const slug of ['claude-code-agents-md-jeden-soubor-pokynu', 'custom-gpt-konec-migrace-na-pluginy-checklist']) {
    const telo = cti(`src/content/clanky/${slug}.md`).split(/^---\s*$/m).slice(2).join('---');
    const nadpisy = [...telo.matchAll(/^(##|###) (.+)$/gm)].map((m) => ({ depth: m[1].length, text: m[2], slug: '' }));
    assert.ok(nadpisy.filter((h) => h.depth === 3).length >= 7, `${slug}: článek má být psaný v ###`);
    assert.deepEqual(nadpisy.filter((h) => h.depth === 2).map((h) => h.text), ['Zdroje'], `${slug}: jediný ## je Zdroje`);
    const osnova = articleOutline(nadpisy);
    assert.equal(osnova.filter((h) => h.depth === 3).length, 0, `${slug}: žádná položka osnovy nesmí být podsekce`);
  }
});

// ── P1: jedno pořadí článků na celém webu ─────────────────────────────────────

test('kolo 45: úvodka, 404 a llms.txt řadí sdíleným komparátorem jako archiv, RSS a chrono navigace', () => {
  for (const soubor of ['src/pages/index.astro', 'src/pages/404.astro', 'src/pages/llms.txt.js']) {
    const zdroj = bezKomentaru(cti(soubor));
    assert.match(zdroj, /import \{ compareArticlesByDateDescThenId \} from '\.\.\/lib\/article-order\.js';/, `${soubor}: import komparátoru`);
    assert.match(zdroj, /\.sort\(compareArticlesByDateDescThenId\)/, `${soubor}: řazení komparátorem`);
    assert.doesNotMatch(zdroj, /\.sort\(\(a, b\) => b\.data\.date\.valueOf\(\) - a\.data\.date\.valueOf\(\)\)/, `${soubor}: inline řazení jen podle data`);
  }
  // Žádný veřejný výpis neřadí jinak.
  for (const soubor of ['src/components/ArticleArchivePage.astro', 'src/components/TemaPage.astro', 'src/pages/temata/index.astro', 'src/pages/rss.xml.js', 'src/pages/search-index.json.js', 'src/pages/clanky/[...id].astro']) {
    assert.match(cti(soubor), /compareArticlesByDateDescThenId/, `${soubor}: komparátor`);
  }
});

test('kolo 45: dva články se stejným časem vydání mají stálé pořadí (id), čas vydání dál vede', () => {
  const kdy = new Date('2026-09-20T08:04:00.000Z');
  const a = { id: 'claude-code-agents-md-jeden-soubor-pokynu', data: { date: kdy } };
  const b = { id: 'custom-gpt-konec-migrace-na-pluginy-checklist', data: { date: kdy } };
  const c = { id: 'aaa-starsi', data: { date: new Date('2026-09-19T00:00:00.000Z') } };
  assert.deepEqual([b, c, a].sort(compareArticlesByDateDescThenId).map((x) => x.id), [a.id, b.id, c.id]);
  assert.deepEqual([a, c, b].sort(compareArticlesByDateDescThenId).map((x) => x.id), [a.id, b.id, c.id]);
  // Živý stav: oba články z 20. 9. 2026 mají v repu stejný `date` do minuty.
  const datum = (slug) => cti(`src/content/clanky/${slug}.md`).match(/^date:\s*"?([^"\n]+)"?/m)?.[1];
  assert.equal(datum(a.id), datum(b.id), 'test dokumentuje důvod změny; když se data rozejdou, klidně smaž tento assert');
});

// ── P1: checklist bez formulářového <input> ───────────────────────────────────

const li = (...children) => ({ type: 'element', tagName: 'li', properties: { className: ['task-list-item'] }, children });
const checkbox = (checked) => ({ type: 'element', tagName: 'input', properties: { type: 'checkbox', disabled: true, ...(checked ? { checked: true } : {}) }, children: [] });
const text = (value) => ({ type: 'text', value });

test('kolo 45: rehypeChecklist nahradí checkbox v <li> dekorativním boxem, zaškrtnutý dostane „Hotovo:“ pro čtečku', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'element', tagName: 'p', properties: {}, children: [text('Úvod.')] },
      { type: 'element', tagName: 'ul', properties: { className: ['contains-task-list'] }, children: [
        li(checkbox(false), text(' '), { type: 'element', tagName: 'strong', properties: {}, children: [text('Sepiš si GPT.')] }),
        li(checkbox(true), text(' Hotová položka.')),
      ] },
      { type: 'raw', value: '<blockquote class="twitter-tweet"></blockquote>' },
    ],
  };
  const pocetDeti = tree.children.length;
  assert.equal(nahradCheckboxy(tree), 2);
  assert.equal(tree.children.length, pocetDeti, 'plugin nemění tree.children — X embed počítá indexy odstavců');
  const [prvni, druha] = tree.children[1].children;
  assert.deepEqual(prvni.children[0], { type: 'element', tagName: 'span', properties: { className: [TRIDA_BOXU], ariaHidden: 'true' }, children: [] });
  assert.equal(prvni.children[1].value, ' ', 'text za políčkem zůstává');
  assert.equal(druha.children[0].properties.className.join(' '), `${TRIDA_BOXU} ${TRIDA_BOXU_HOTOVO}`);
  assert.deepEqual(druha.children[1], { type: 'element', tagName: 'span', properties: { className: ['sr-only'] }, children: [text(TEXT_HOTOVO)] });
  assert.equal(druha.children[2].value, ' Hotová položka.');
  assert.equal(JSON.stringify(tree).includes('"tagName":"input"'), false, 'žádný <input> v článku');
  assert.equal(nahradCheckboxy(tree), 0, 'druhý průchod nic nemění');
  // Checkbox mimo <li> (ruční HTML) se nechává být.
  const mimo = { type: 'root', children: [{ type: 'element', tagName: 'p', properties: {}, children: [checkbox(false)] }] };
  assert.equal(nahradCheckboxy(mimo), 0);
  assert.equal(typeof rehypeChecklist(), 'function');
});

test('kolo 45: rehypeChecklist je v astro.config poslední a CSS kreslí box místo odrážky', () => {
  const config = cti('astro.config.mjs');
  assert.match(config, /import \{ rehypeChecklist \} from '\.\/src\/lib\/rehype-checklist\.js';/);
  assert.match(config, /rehypePlugins: \[rehypeAsciiHeadingIds, rehypeCtaInline, rehypeXEmbedy, rehypeTabulky, rehypeChecklist\]/);
  assert.match(pravidlo(global, '.article-body .contains-task-list'), /list-style:\s*none/);
  assert.match(pravidlo(global, '.article-body .task-list-item'), /padding-left/);
  const boxCss = pravidlo(global, '.article-body .task-box');
  assert.match(boxCss, /border:\s*1\.5px solid var\(--line-strong/);
  assert.match(boxCss, /background:\s*var\(--surface\)/);
  assert.match(pravidlo(global, '.article-body .task-box-checked'), /background:\s*var\(--signal-fill\)/);
  assert.doesNotMatch(global, /input\[type="?checkbox"?\]/, 'checkbox v článku se nestyluje — v HTML není');
});

// ── P2: mrtvé CSS ─────────────────────────────────────────────────────────────

test('kolo 45: CSS bez selektorů, pro které na webu není markup', () => {
  for (const mrtvy of [/\.reading-entry\s*>\s*a\b/, /\.related \.card-body h2\b/, /\.featured-lead > \.card:first-child \.card-body h3\b/, /\.newsletter \.mono\b/]) {
    for (const [nazev, css] of [['global', global], ['premium', premium], ['editorial', editorial]]) {
      assert.doesNotMatch(css, mrtvy, `${nazev}.css: ${mrtvy} — selektor bez markupu`);
    }
  }
  // Co markup má, v CSS zůstává.
  const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
  assert.match(clanek, /<div class="reading-entry">\s*<details class="article-contents-mobile">/, '.reading-entry nese jen <details>');
  assert.match(clanek, /<a class="article-read-link" href="#article-text">/, 'odkaz „Přejít rovnou na text“ je v .article-credit');
  assert.match(pravidlo(premium, '.article-credit .article-read-link'), /color:\s*var\(--signal-dark\)/);
  assert.match(pravidlo(global, '.related .card-body h3'), /font-size:\s*0\.95rem/, 'related karty jsou h3 (ArticleCard výchozí)');
  assert.match(cti('src/components/TemaPage.astro'), /titleTag="h2"/, 'featured karta tématu je h2');
});
