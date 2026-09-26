import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Kolo 56 (audity design + cesta čtenáře, 26. 9. 2026).
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const bezKomentaru = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const css = cti('src/styles/redesign.css');
const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));

test('kolo 56: tmavý newsletter je theme-aware plocha, ne světlá deska', () => {
  assert.match(css, /:root\[data-theme="dark"\] \.newsletter > \.wrap[^{]*\{[^}]*background: var\(--surface\)/);
  assert.match(css, /prefers-color-scheme: dark\)[\s\S]{0,200}:root:not\(\[data-theme="light"\]\) \.newsletter > \.wrap/);
});

test('kolo 56: konec článku — související hned za textem, pak autor, Herohero, chronologie, diskuze', () => {
  const poradi = ['<AudioPrehled audio={audio} />', 'class="related"', 'class="author-box"', '<HeroheroCta', 'class="article-nav"', '<Giscus'];
  const pozice = poradi.map((m) => clanek.indexOf(m));
  pozice.forEach((p, i) => assert.ok(p > 0, `${poradi[i]} chybí`));
  for (let i = 1; i < pozice.length; i++) assert.ok(pozice[i - 1] < pozice[i], `${poradi[i - 1]} musí být před ${poradi[i]}`);
  assert.ok(clanek.indexOf('<AudioPrehled') > clanek.indexOf('<Content />'), 'plná karta audia až pod textem (nahoře zůstává RtPlayer)');
  assert.doesNotMatch(clanek, /article-videobar-bez-videa/, 'pruh „video není“ zrušen');
  assert.doesNotMatch(clanek, /Zpět na články/, 'duplicitní tlačítko zrušeno');
});

test('kolo 56: související články podle obsahu (souvisejici.js), ne tři nejnovější z kategorie', () => {
  const zdroj = cti('src/pages/clanky/[...id].astro');
  assert.match(zdroj, /import \{ pripravSouvisejici \} from '\.\.\/\.\.\/lib\/souvisejici\.js'/);
  assert.match(zdroj, /const related = pripravSouvisejici\(vsechnyClanky\)\(article, others, 3\);/);
});

test('kolo 56: 404 nabízí hledání (GET, bez JS) a témata', () => {
  const s = cti('src/pages/404.astro');
  assert.match(s, /<form class="notfound-search" action="\/clanky\/" method="get" role="search">/);
  assert.match(s, /<label for="notfound-q">/);
  assert.match(s, /name="q"/);
  assert.match(s, /Object\.keys\(POPISY_TEMAT\)/);
  const archiv = cti('src/components/ArticleArchivePage.astro') + cti('src/pages/clanky/index.astro');
  assert.match(archiv, /[?&]q=|searchParams\.get\('q'\)|get\("q"\)/, 'archiv musí ?q= opravdu číst');
});

test('kolo 56: evergreen průvodci na straně 1 tématu a cross-linky Starlinku', async () => {
  const tema = cti('src/components/TemaPage.astro');
  assert.match(tema, /const pruvodci = chronologicky\.slice\(1\)\.filter\(\(c\) => c\.data\.evergreen\)/);
  const { SOUVISI_S_TEMATEM } = await import('../src/lib/tema-souvisi.js');
  assert.deepEqual(SOUVISI_S_TEMATEM['Vesmír'], ['starlink-v-cesku-pruvodce', 'starlink-mini-vs-standard']);
  assert.deepEqual(SOUVISI_S_TEMATEM['Sítě'], ['starlink-konkurenti']);
});

test('kolo 56: míra textu článku ≤ 33em na desktopu, hero úvodky zdroj pro 607px výšku', async () => {
  assert.match(css, /\.article-body > :is\(p, ul, ol, blockquote, h2, h3, h4, dl\) \{ max-width: 33em; \}/);
  const { HOMEPAGE_HERO_SIZES } = await import('../src/lib/karta-nahled.js');
  assert.equal(HOMEPAGE_HERO_SIZES, '(max-width: 900px) calc(100vw - 48px), 1080px');
});
