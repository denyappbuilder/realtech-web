// Kolo 49: živý audit po kole 48 (22. 9. 2026, realtech.cz — úvodka, dva
// nejnovější články, /clanky/, /temata/, /herohero/, /o-nas/, 404; 360/390/
// 1440px, light i dark; axe bez nálezů, žádný vodorovný přetok dokumentu,
// sitemap/robots/llms.txt v pořádku, žádná mrtvá třída ani nečtený token
// v CSS). Co zůstalo a tu se zamyká:
//
// P1 Hlavní navigace pod 400px: kolo 48 přidalo šestou položku (Herohero)
//    a <ul> měřil 402px v 342px obsahu wrapu — na 390px stálo „O nás“ celé
//    za okrajem (na /o-nas/ nebyla aktivní položka vůbec vidět), na 360px
//    zbylo „O“ bez náznaku, že řada roluje. Přesně to, čemu kolo 16 u pěti
//    položek předcházelo. Řada jde od kola 49 přes celou šířku displeje
//    (záporný okraj = padding wrapu), pod 440px 0.9rem + 5px bez mezery:
//    všech šest se vejde od 360px. Kde ne (320px), ukáže stín na okraji,
//    že se dá rolovat (čisté CSS: krycí pruhy attachment: local nad stínem
//    attachment: scroll), a skript doroluje k aktivní položce. 44px cíle
//    zůstávají, tablet a desktop se nemění, žádný hamburger.
// P2 Pás Herohero na úvodce stál hned za „Průvodci a srovnání“ (border-block)
//    s vlastní hairline — dvě linky nad sebou s 88px (mobil 52px) prázdna.
//    Za průvodci dělí pás jejich spodní linka; vlastní si nechává jen tam,
//    kde před ním žádná není (článek).
// P2 h1 stránek (/herohero/, O nás, /gdpr/) lámalo bez text-wrap: balance —
//    „Návody a hlubší obsah / chystáme na / Herohero.“ na 1440px. Hero a
//    hlava článku balance mají od round 3; stejné pravidlo pro celý kit.
//
// Ověřeno, ponecháno (bez změny kódu):
// – Tři výzvy k odběru kanálu v článku bez videa (za prvním odstavcem,
//   „video není“, autorský box) — vědomé rozhodnutí kol 43/44 (Z1003,
//   test-b19, test-kolo-43); Herohero výzva je v článku jedna.
// – Odkazy v .about-aside-meta 19px vysoké s roztečí 27px — WCAG 2.5.8
//   výjimka pro rozestup platí; patička má pod 900px 44px řádky.
// – Náhledy „Nejnovější videa“ (i.ytimg.com sddefault) živě 200 OK —
//   tmavé plochy v celostránkovém snímku jsou jen lazy loading.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const global = bezCssKomentaru(cti('src/styles/global.css'));
const premium = bezCssKomentaru(cti('src/styles/premium.css'));
const base = cti('src/layouts/Base.astro');

/** Tělo prvního pravidla se selektorem přesně na začátku řádku (i odsazeného v @media). */
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
const blok = (css, hlavicka) => css.match(new RegExp(`${hlavicka.source}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';

const mobil = blok(global, /@media \(max-width: 580px\)/);
const uzky = blok(global, /@media \(max-width: 440px\)/);
const nejuzsi = blok(global, /@media \(max-width: 370px\)/);

// ── P1: navigace pod 580px ───────────────────────────────────────────────────

test('kolo 49: řada navigace jde pod 580px od hrany k hraně — záporný okraj = padding wrapu (--hdr-pad), položky 7px', () => {
  assert.ok(mobil, 'global.css: chybí blok @media (max-width: 580px)');
  const wrap = pravidlo(mobil, 'header.site .wrap');
  assert.match(wrap, /--hdr-pad:\s*24px/, 'wrap má 24px padding (.wrap) — hodnota musí být i v tokenu pro záporný okraj');
  assert.match(wrap, /--nav-item-pad:\s*7px/);
  const nav = pravidlo(mobil, 'header.site nav.main');
  assert.match(nav, /grid-area:\s*nav/);
  assert.match(nav, /width:\s*auto/, 'width: 100% by záporný okraj nerozšířil');
  assert.match(nav, /margin-inline:\s*calc\(-1 \* var\(--hdr-pad\)\)/);
  assert.match(nav, /padding-inline:\s*16px 10px/, '16px vlevo (text blízko hraně loga), 10px vpravo');
  assert.match(nav, /overflow-x:\s*auto/, 'řada dál roluje, žádný hamburger');
  assert.doesNotMatch(mobil, /display:\s*none/, 'pod 580px se nic z headeru neschovává');
  const polozka = pravidlo(mobil, 'header.site nav.main a');
  assert.match(polozka, /min-height:\s*44px/, '44px cíl zůstává');
  assert.match(polozka, /padding:\s*0 var\(--nav-item-pad\)/);
});

test('kolo 49: náznak rolování je čisté CSS — krycí pruhy --surface (attachment local) nad stínem z --ink (attachment scroll)', () => {
  const nav = pravidlo(mobil, 'header.site nav.main');
  const vrstvy = nav.match(/background:\s*([\s\S]*?);/)?.[1] ?? '';
  assert.ok(vrstvy, 'nav.main bez vícevrstvého background');
  const local = vrstvy.match(/no-repeat local/g) ?? [];
  const scroll = vrstvy.match(/no-repeat scroll/g) ?? [];
  assert.equal(local.length, 2, 'dva krycí pruhy rolují s obsahem');
  assert.equal(scroll.length, 2, 'dva stíny stojí u okrajů');
  assert.ok(vrstvy.indexOf('local') < vrstvy.indexOf('scroll'), 'krycí pruhy jsou první = nad stínem');
  assert.match(vrstvy, /var\(--surface\)/, 'pruh v barvě headeru');
  assert.match(vrstvy, /color-mix\(in srgb, var\(--ink\) 14%, transparent\)/, 'stín z tokenu, funguje v obou tématech');
  assert.doesNotMatch(vrstvy, /#[0-9a-f]{3,8}\b/i, 'žádná natvrdo barva');
  assert.doesNotMatch(global, /nav\.main[^{]*\{[^}]*mask-image/, 'žádná maska — ta by vybledla i text a border-top');
});

test('kolo 49: pod 440px 0.9rem + 5px bez mezery (šest položek od 368px), pod 370px 8px odsazení řady', () => {
  assert.ok(uzky, 'global.css: chybí blok @media (max-width: 440px)');
  assert.match(pravidlo(uzky, 'header.site .wrap'), /--nav-item-pad:\s*5px/);
  assert.match(pravidlo(uzky, 'header.site nav.main ul'), /gap:\s*0/);
  assert.match(pravidlo(uzky, 'header.site nav.main a'), /font-size:\s*0\.9rem/);
  assert.doesNotMatch(uzky, /min-height/, 'výšku cíle řídí ≤580px, tady se nezmenšuje');
  assert.ok(nejuzsi, 'global.css: chybí blok @media (max-width: 370px)');
  assert.match(pravidlo(nejuzsi, 'header.site .wrap'), /--hdr-pad:\s*8px;\s*padding-inline:\s*8px/, 'token sleduje skutečný padding');
  assert.match(pravidlo(nejuzsi, 'header.site nav.main'), /padding-inline:\s*8px/);
  // Staré pravidlo z kola 16 (7px natvrdo v ≤400px) je pryč — řídí to token.
  const ctyrista = blok(global, /@media \(max-width: 400px\)/);
  assert.doesNotMatch(ctyrista, /nav\.main/, 'nav pod 400px řídí ≤440px blok, ne duplicitní pravidlo');
});

test('kolo 49: skript doroluje řadu k aktivní položce — jen scrollLeft řady, žádný scrollIntoView (kotva #kontakt by hnula stránkou)', () => {
  const skript = base
    .slice(base.lastIndexOf('<script>'), base.lastIndexOf('</script>'))
    .replace(/^\s*\/\/.*$/gm, '');
  assert.match(skript, /querySelector<HTMLElement>\('nav\.main a\[aria-current\]'\)/);
  assert.match(skript, /closest<HTMLElement>\('nav\.main'\)/);
  assert.match(skript, /scrollWidth > \w+\.clientWidth/, 'roluje se jen když řada opravdu přetéká');
  assert.match(skript, /\.scrollLeft \+=/);
  assert.match(skript, /\.scrollLeft -=/, 'aktivní položka vlevo mimo řadu (po zpětném rolování) se doroluje také');
  assert.doesNotMatch(skript, /scrollIntoView/);
  // Stojí před přepínačem tématu — nezávisí na něm a nepadá s ním.
  assert.ok(skript.indexOf("a[aria-current]") < skript.indexOf("getElementById('theme-toggle')"));
});

// ── P2: pás Herohero na úvodce ───────────────────────────────────────────────

test('kolo 49: za průvodci nemá pás Herohero vlastní hairline ani padding — dělí ho spodní linka průvodců', () => {
  assert.match(pravidlo(premium, '.guides-section + .herohero-cta'), /border-top:\s*0;\s*padding-top:\s*0/);
  assert.match(pravidlo(premium, '.guides-section'), /border-block:\s*1px solid var\(--line\)/, 'průvodci si linky nechávají');
  const uvodka = pravidlo(premium, '.articles .herohero-cta');
  assert.match(uvodka, /margin-top:\s*88px/, 'rytmus .video-strip zůstává');
  assert.doesNotMatch(uvodka, /padding-top/, 'padding-top tu by přebil sourozenecké pravidlo');
  const mobilPremium = blok(premium, /@media \(max-width: 580px\)/);
  assert.match(mobilPremium, /\.articles \.herohero-cta \{ margin-top: 52px; \}/);
  assert.doesNotMatch(mobilPremium, /\.articles \.herohero-cta \{[^}]*padding-top/);
  // Základní pravidlo (článek) hairline drží — test-kolo-48 to hlídá, tady jen pořadí kaskády.
  assert.ok(premium.indexOf('.herohero-cta {') < premium.indexOf('.guides-section + .herohero-cta {'), 'sourozenecké pravidlo až za základním (stejná specificita jako .articles .herohero-cta)');
  assert.ok(premium.indexOf('.articles .herohero-cta {') < premium.indexOf('.guides-section + .herohero-cta {'));
});

// ── P2: h1 stránek ───────────────────────────────────────────────────────────

test('kolo 49: .about h1 láme s text-wrap: balance jako hero a hlava článku', () => {
  assert.match(pravidlo(premium, '.about h1'), /text-wrap:\s*balance/);
  assert.match(pravidlo(premium, '.article-head h1'), /text-wrap:\s*balance/, 'předpoklad: hlava článku balance má');
});
