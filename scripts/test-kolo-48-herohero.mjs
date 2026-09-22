// Kolo 48 (22. 9. 2026): struktura webu jako trychtýř YouTube → články →
// Herohero. Herohero (návody, hlubší obsah, podpora) je hlavní cesta
// k monetizaci, ale zatím se PŘIPRAVUJE — web to říká narovinu, nic
// nevymýšlí (ceny, úrovně, počty podporovatelů, termín, čekací listina).
//
//  1. /herohero/ — poctivá stránka „připravujeme“ (skutečné HTML přes
//     @astrojs/compiler + astro/container, Base stub): štítek Připravujeme,
//     primární CTA herohero.co/realtechcz, sekundární YouTube + /clanky/.
//  2. Hlavička a patička (Base): Herohero za Videa / Témata, před O nás;
//     aria-current jako ostatní položky. Žádná RealTvorba (#506).
//  3. Úvodka: „Nejnovější videa“ hned pod posledními reporty (dřív až za
//     průvodci), pás Herohero jako poslední blok před newsletterem; LCP
//     preload hero coveru beze změny.
//  4. Článek: jediná měkká výzva (HeroheroCta) za autorským boxem, před
//     „Další reporty“ — ne v textu (Z1003).
//  5. O nás: jedna věta + odkaz na /herohero/, položka v „Kam dál“.
//  6. llms.txt: /herohero/ v rozcestníku, profil v „Jinde“.
//  7. CSS jen v premium.css, stejný kit jako výzva „video není“ (kolo 44):
//     hairline --line-strong, žádný --panel ani #fff; levá hrana čtecího
//     sloupce od 901px.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import './test-kolo-48-herohero-register.mjs';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};

const HEROHERO = 'https://herohero.co/realtechcz';
const YT_SUB = 'https://www.youtube.com/@realtech-cz?sub_confirmation=1';

const base = cti('src/layouts/Base.astro');
const stranka = cti('src/pages/herohero.astro');
const komponenta = cti('src/components/HeroheroCta.astro');
const uvodka = bezKomentaru(cti('src/pages/index.astro'));
const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
const onas = bezKomentaru(cti('src/pages/o-nas.astro'));
const llms = cti('src/pages/llms.txt.js');
const premium = bezCssKomentaru(cti('src/styles/premium.css'));
const global = bezCssKomentaru(cti('src/styles/global.css'));

async function vykresli(Komponenta, options) {
  const { experimental_AstroContainer: AstroContainer } = await import('astro/container');
  const container = await AstroContainer.create({ astroConfig: { site: 'https://realtech.cz' } });
  return container.renderToString(Komponenta, options);
}

// ── 1. /herohero/ ─────────────────────────────────────────────────────────

test('kolo 48: /herohero/ se vykreslí — štítek Připravujeme, primární CTA na herohero.co/realtechcz, sekundární YouTube a /clanky/', async () => {
  const { default: Herohero } = await import('../src/pages/herohero.astro');
  const html = await vykresli(Herohero, { request: new Request('https://realtech.cz/herohero/') });

  assert.match(html, /data-title="Herohero — návody připravujeme — REALTECH CZ"/, 'title česky, s Herohero i „připravujeme“');
  assert.match(html, /data-description="[^"]*Zatím připravujeme[^"]*"/, 'description říká, že se připravuje');
  assert.match(html, /<span class="tag tag-zprava">Připravujeme<\/span>/, 'štítek Připravujeme v lower-third');
  assert.match(html, /<span class="tag">Herohero<\/span>/, 'štítek značky — Herohero jedním slovem');
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'právě jeden h1');
  assert.match(html, /<h1>[^<]*Herohero[^<]*<\/h1>/);
  assert.match(html, new RegExp(`<a href="${HEROHERO.replace(/[./]/g, '\\$&')}" class="btn-primary">`), 'primární CTA vede na veřejný profil');
  assert.match(html, new RegExp(`<a href="${YT_SUB.replace(/[.?/]/g, '\\$&')}" class="btn-ghost">Odebírat na YouTube</a>`));
  assert.match(html, /<a href="\/clanky\/" class="btn-ghost">Přečíst články<\/a>/);
  assert.match(html, /"@type":"WebPage"[^<]*"url":"https:\/\/realtech\.cz\/herohero\/"/, 'JSON-LD WebPage s URL stránky');
  assert.match(html, /"@type":"BreadcrumbList"[^<]*"name":"Herohero"/, 'breadcrumb končí na Herohero');
  assert.match(html, /class="about about-wide wrap"/, 'stejný layout jako O nás — žádný nový kit');
  assert.match(html, /class="hero-actions"/);
  assert.doesNotMatch(html, /realtvorba/i, 'RealTvorba se nesmí vrátit (#506)');
});

test('kolo 48: /herohero/ nic nevymýšlí — bez cen, úrovní podpory, počtů podporovatelů, termínu a čekací listiny', () => {
  // Jen šablona: frontmatter (a jeho komentář, který tyhle zákazy vyjmenovává) stranou.
  const text = bezKomentaru(stranka.split(/^---\s*$/m)[2] ?? '');
  assert.ok(text.includes('<Base'), 'šablona /herohero/ je za druhým ---');
  assert.doesNotMatch(text, /\d+\s*(Kč|€|\$|USD|EUR)\b|\bKč\b|€/, 'žádná cena');
  assert.doesNotMatch(text, /\b(tier|úrove?ň podpory|balíč[ek]k)\b/i, 'žádné úrovně podpory');
  assert.doesNotMatch(text, /\d+\s*(podporovatel|odběratel|členů)/i, 'žádné počty podporovatelů');
  assert.doesNotMatch(text, /čekací listin|waitlist|spouštíme \d|od \d{1,2}\. ?\d{1,2}\./i, 'žádný termín ani čekací listina');
  assert.match(text, /Zatím tam nic hotového není/, 'stránka říká narovinu, že hotový obsah zatím není');
  assert.match(text, /zůstávají volně dostupné/, 'web i YouTube zůstávají zdarma — Herohero není zámek');
  assert.doesNotMatch(text, /HeroHero|Hero Hero|hero-hero/, 'značka se píše Herohero (jedno slovo)');
  assert.doesNotMatch(stranka.match(/<Base\b[\s\S]*?>/)?.[0] ?? '', /preconnectYtimg|preconnectAudio|preconnectGiscus/, 'stránka nenese ytimg/audio/giscus — žádný preconnect');
  assert.doesNotMatch(stranka, /rel="preload"[^>]*as="image"/, 'bez LCP preloadu — stránka nemá cover');
});

// ── 2. Hlavička a patička ─────────────────────────────────────────────────

test('kolo 48: hlavní navigace nese Herohero → /herohero/ s aria-current, za Videa a před O nás; Videa zůstávají YouTube', () => {
  const nav = bezKomentaru(base.match(/<nav class="main"[\s\S]*?<\/nav>/)?.[0] ?? '');
  assert.match(nav, /<a href="\/herohero\/" aria-current=\{current\('\/herohero\/'\)\}>Herohero<\/a>/);
  const videa = nav.indexOf('>Videa</a>');
  const herohero = nav.indexOf('href="/herohero/"');
  const oNas = nav.indexOf('href="/o-nas/"');
  assert.ok(videa !== -1 && herohero !== -1 && oNas !== -1, 'navigaci chybí položka');
  assert.ok(videa < herohero && herohero < oNas, 'Herohero má stát mezi Videa a O nás');
  assert.match(nav, /<a href=\{YT\}>Videa<\/a>/, 'Videa dál vedou na kanál');
  assert.equal((nav.match(/<li>/g) ?? []).length, 6, 'šest položek: Novinky, Články, Témata, Videa, Herohero, O nás');
});

test('kolo 48: sloupec Web v patičce nese Herohero mezi Témata a O nás; žádná RealTvorba', () => {
  const paticka = base.match(/<footer class="site">[\s\S]*?<\/footer>/)?.[0] ?? '';
  const sloupecWeb = paticka.match(/<span class="mono f-nav-head">Web<\/span>[\s\S]*?<\/ul>/)?.[0] ?? '';
  assert.match(sloupecWeb, /<li><a href="\/herohero\/">Herohero<\/a><\/li>/);
  const temata = sloupecWeb.indexOf('href="/temata/"');
  const herohero = sloupecWeb.indexOf('href="/herohero/"');
  const oNas = sloupecWeb.indexOf('href="/o-nas/"');
  assert.ok(temata < herohero && herohero < oNas, 'Herohero má stát mezi Témata a O nás');
  assert.doesNotMatch(base, /realtvorba/i);
  assert.equal((base.match(/href="\/herohero\/"/g) ?? []).length, 2, 'Base odkazuje na /herohero/ právě dvakrát: hlavička + patička');
});

// ── 3. Úvodka ─────────────────────────────────────────────────────────────

test('kolo 48: úvodka — Nejnovější videa hned pod posledními reporty, průvodci až za nimi, pás Herohero jako poslední blok', () => {
  const reporty = uvodka.indexOf('class="grid latest-reports"');
  const videa = uvodka.indexOf('class="video-strip films-section"');
  const pruvodci = uvodka.indexOf('class="video-strip guides-section"');
  const herohero = uvodka.indexOf('<HeroheroCta');
  const konecSekce = uvodka.lastIndexOf('</section>');
  assert.ok(reporty !== -1 && videa !== -1 && pruvodci !== -1 && herohero !== -1, 'úvodce chybí některý blok');
  assert.ok(reporty < videa, 'videa stojí až za mřížkou reportů');
  assert.ok(videa < pruvodci, 'Nejnovější videa musí být NAD průvodci — druhá cesta trychtýře');
  assert.ok(pruvodci < herohero && herohero < konecSekce, 'pás Herohero je poslední blok v .articles, hned před newsletterem z Base');
  assert.equal((uvodka.match(/<HeroheroCta\b/g) ?? []).length, 1, 'jeden pás, ne banner farma');
  assert.match(uvodka, /import HeroheroCta from '\.\.\/components\/HeroheroCta\.astro';/);
  assert.match(uvodka, /<HeroheroCta\s+nadpis="[^"]*Herohero[^"]*"/, 'pás má nadpis (h2) — úvodka není článek');
  const props = uvodka.slice(herohero, uvodka.indexOf('/>', herohero));
  assert.match(props, /zůstávají zdarma/, 'pás říká, že web i YouTube zůstávají zdarma');
  assert.match(props, /připravujeme/, 'pás říká, že Herohero připravujeme');
  assert.doesNotMatch(props, /herohero\.co/, 'externí profil je až na /herohero/, pás vede dovnitř webu');
});

test('kolo 48: úvodka drží LCP — preload hero coveru a ytimg preconnect beze změny, video náhledy lazy', () => {
  assert.match(uvodka, /const heroPreload = preloadHeroObrazku\(/);
  assert.match(uvodka, /\{heroPreload && \([\s\S]*?rel="preload"[\s\S]*?as="image"[\s\S]*?fetchpriority="high"[\s\S]*?slot="head"/);
  assert.match(uvodka, /const preconnectYtimg = videos\.length > 0;/);
  assert.match(uvodka, /i\.ytimg\.com\/vi\/\$\{v\.id\}\/sddefault\.jpg`\}[^>]*loading="lazy"/);
  assert.equal((uvodka.match(/fetchpriority="high"/g) ?? []).length, 2, 'fetchpriority=high jen preload + hero <img>');
  // Homepage loader musí novou komponentu nahradit stejně jako Base/ArticleCard,
  // jinak by test-homepage spadl na importu .astro.
  assert.match(cti('scripts/test-homepage-loader.mjs'), /\['\.\.\/components\/HeroheroCta\.astro', new URL\('astro-component\.mjs', mocksUrl\)\.href\]/);
});

// ── 4. Článek ─────────────────────────────────────────────────────────────

test('kolo 48: článek má jedinou měkkou výzvu Herohero — za autorským boxem, před „Další reporty“, ne v textu', () => {
  assert.match(clanek, /import HeroheroCta from '\.\.\/\.\.\/components\/HeroheroCta\.astro';/);
  assert.equal((clanek.match(/<HeroheroCta\b/g) ?? []).length, 1, 'právě jedna výzva');
  const telo = clanek.indexOf('class="article-body"');
  const autor = clanek.indexOf('class="author-box"');
  const herohero = clanek.indexOf('<HeroheroCta />');
  const related = clanek.indexOf('{related.length > 0 && (');
  assert.ok(telo !== -1 && autor !== -1 && herohero !== -1 && related !== -1, 'šabloně článku chybí blok');
  assert.ok(telo < autor && autor < herohero && herohero < related, 'výzva stojí až za autorským boxem a před souvisejícími');
  assert.doesNotMatch(clanek, /herohero\.co/, 'externí profil je až na /herohero/');
});

test('kolo 48: HeroheroCta — výchozí věta pro článek, volitelný nadpis pro úvodku, odkaz jen na /herohero/', async () => {
  const { default: HeroheroCta } = await import('../src/components/HeroheroCta.astro');

  const vClanku = await vykresli(HeroheroCta);
  assert.match(vClanku, /^<aside class="herohero-cta" aria-label="Herohero">/, 'bez nadpisu pojmenuje landmark aria-label');
  assert.match(vClanku, /<p class="mono">Herohero · připravujeme<\/p>/);
  assert.match(vClanku, /<p>Hledáš návody\? Na Herohero je připravujeme\.<\/p>/);
  assert.doesNotMatch(vClanku, /<h2/, 'v článku žádný h2 — osnova článku patří jeho nadpisům');
  assert.match(vClanku, /<a href="\/herohero\/" class="btn-ghost">Co chystáme <span aria-hidden="true">→<\/span><\/a>/);

  const naUvodce = await vykresli(HeroheroCta, { props: { nadpis: 'Nadpis pásu', text: 'Věta.', odkaz: 'Odkaz' } });
  assert.match(naUvodce, /^<aside class="herohero-cta" aria-labelledby="herohero-cta-nadpis">/, 's nadpisem pojmenuje landmark nadpis');
  assert.doesNotMatch(naUvodce, /aria-label=/, 'aria-label a aria-labelledby se nesmí sejít');
  assert.match(naUvodce, /<h2 id="herohero-cta-nadpis">Nadpis pásu<\/h2>/);
  assert.match(naUvodce, /<p>Věta\.<\/p>/);
  assert.match(naUvodce, /class="btn-ghost">Odkaz <span/);

  for (const html of [vClanku, naUvodce]) {
    assert.equal((html.match(/<a\s/g) ?? []).length, 1, 'jediný odkaz, a to na /herohero/');
    assert.doesNotMatch(html, /herohero\.co|realtvorba/i);
  }
  assert.doesNotMatch(komponenta, /<!--/, 'Astro komentáře, ne HTML (kolo 42)');
});

// ── 5. O nás ──────────────────────────────────────────────────────────────

test('kolo 48: O nás — jedna věta s odkazem na /herohero/ v „Co tady najdeš“ a položka v „Kam dál“; žádná RealTvorba', () => {
  const main = onas.match(/<div class="about-main">[\s\S]*?<aside class="about-aside">/)?.[0] ?? '';
  const aside = onas.match(/<aside class="about-aside">[\s\S]*?<\/aside>/)?.[0] ?? '';
  assert.match(main, /chystáme na <a href="\/herohero\/">Herohero<\/a> — zatím\s+připravujeme, web i YouTube zůstávají zdarma\./);
  assert.match(aside, /<li><a href="\/herohero\/">Herohero \(připravujeme\)<\/a><\/li>/);
  assert.equal((onas.match(/href="\/herohero\/"/g) ?? []).length, 2, 'dva odkazy: věta + Kam dál');
  assert.doesNotMatch(onas, /realtvorba|herohero\.co/i, 'externí profil je až na /herohero/');
});

// ── 6. llms.txt ───────────────────────────────────────────────────────────

test('kolo 48: llms.txt zná /herohero/ v rozcestníku a profil v „Jinde“ — oboje označené jako připravujeme', () => {
  assert.match(llms, /- \[Herohero\]\(\$\{site\}\/herohero\/\): návody a hlubší obsah — připravujeme/);
  assert.match(llms, /- \[Herohero\]\(https:\/\/herohero\.co\/realtechcz\): profil pro podporovatele \(připravujeme\)/);
  const oNas = llms.indexOf('/o-nas/): kdo za webem stojí');
  const herohero = llms.indexOf('/herohero/): návody');
  assert.ok(oNas !== -1 && oNas < herohero, 'Herohero je poslední položka rozcestníku, za O nás');
});

// ── 7. CSS ────────────────────────────────────────────────────────────────

test('kolo 48: .herohero-cta jen v premium.css — kit výzvy „video není“ (hairline --line-strong, obrysová pilulka), žádný --panel ani #fff', () => {
  assert.doesNotMatch(global, /herohero/, 'global.css: nic — kolo 47 dal poslední vrstvu do premium.css');
  const cta = pravidlo(premium, '.herohero-cta');
  assert.ok(cta, 'premium.css: chybí .herohero-cta');
  assert.match(cta, /display:\s*flex/);
  assert.match(cta, /border-top:\s*1px solid var\(--line-strong\)/, 'stejný oddělovač jako .article-videobar-bez-videa a .related');
  assert.doesNotMatch(cta, /background|border-radius|box-shadow/, 'žádný panel — hairline a text');
  const blok = premium.slice(premium.indexOf('.herohero-cta {'), premium.indexOf('.articles .herohero-cta {'));
  assert.doesNotMatch(blok, /var\(--panel\)|#fff|#A9B2BF|color-mix/i);
  assert.match(pravidlo(premium, '.herohero-cta h2'), /font-family:\s*var\(--editorial-face\)[^}]*font-weight:\s*650/);
  assert.match(pravidlo(premium, '.herohero-cta-text > p:last-child'), /color:\s*var\(--ink-soft\)/);
  assert.match(pravidlo(premium, '.herohero-cta .btn-ghost'), /border-color:\s*var\(--line\)/);
  assert.match(pravidlo(premium, '.article-page .herohero-cta'), /max-width:\s*760px/, 'v článku drží čtecí sloupec');
  assert.match(pravidlo(premium, '.articles .herohero-cta'), /margin-top:\s*88px/, 'na úvodce stejný rytmus jako .video-strip');
  assert.match(
    premium,
    /@media \(min-width: 901px\)\s*\{\s*\.article-page \.article-head,[\s\S]*?\.author-box, \.herohero-cta, \.related[^}]*margin-left:\s*0;/,
    'od 901px levá hrana wrapu jako ostatní bloky čtecího sloupce (kolo 46)',
  );
  const mobil = premium.match(/@media \(max-width: 580px\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  // Kolo 49: padding-top pásu na úvodce řeší `.guides-section + .herohero-cta` (test-kolo-49-leftover).
  assert.match(mobil, /\.articles \.herohero-cta \{ margin-top: 52px; \}/, 'na mobilu stejné 52px jako .video-strip');
});
