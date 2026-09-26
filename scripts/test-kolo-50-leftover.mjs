// Kolo 50: hluboký live audit 23. 9. 2026 (realtech.cz, CSS Base.BLtb-dLf.css
// — úvodka, /clanky/, dva články, /temata/, /herohero/, /o-nas/). Co zůstalo
// a tu se zamyká:
//
// P1 Poloměry: tokeny škály (kolo 43/47) existovaly, ale global.css držel
//    natvrdo 10px (.audio-prehled, .article-videobar, .article-cta-inline,
//    .hero-visual), 8px (pre, img, .table-wrap v těle článku), 14px (.card,
//    .article-body, .article-aside, .about-aside, .search-box, .vc-thumb
//    s druhým pravidlem v premium) a .share-btn/.yt-btn na --radius 8px.
//    Mapa rolí: panely čtecího sloupce, pole, aside = field 12; cover, karta,
//    náhled videa, modal, obrázek v textu = media 16; tlačítka a čipy =
//    control 24; štítky a kbd = badge 4; náhled v řádku = thumb 8.
// P1 Dvě sady „Sdílej dál“ v HTML (aside + .article-share pod textem); CSS
//    kreslilo vždy jednu, ale čtečka bez stylů, režim čtení i crawler viděly
//    dvě. Teď jediná, v aside; kde se kreslí, řídí CSS.
// P1 Pásek „Nejnovější videa“: sddefault (4:3, 640×480) v 16:9 rámu →
//    hq720 WebP 1280×720 (~85 KB), sddefault jen u videa bez 720p.
// P1 Řada „video není“: obrysová pilulka s logem YouTube hned nad plným
//    „Odebírat na YouTube“ v autorském boxu → věta + textový odkaz.
// P2 OSVČ v titulku (ChatGPT ve Wordu) a v perexu Gemini/Workspace karty —
//    hlas webu je běžný Čech s AI. Slug a soubory obrázků zůstávají.
// P2 global.css sázel nadpisy natvrdo 'Archivo Variable' s fallbacky 850/108,
//    750/105 a 870/110 %, které premium round 3 přepsal --editorial-face →
//    token všude (mimo značku), mrtvé @font-face pryč.
// P2 Červený text v darku přes token --signal-text místo dvou dark přepisů
//    u každého selektoru.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const bezAstroKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const global = bezCssKomentaru(cti('src/styles/global.css'));
const editorial = bezCssKomentaru(cti('src/styles/editorial.css'));
const premium = bezCssKomentaru(cti('src/styles/premium.css'));
const clanek = bezAstroKomentaru(cti('src/pages/clanky/[...id].astro'));

const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};
/** Jen neodsazené pravidlo (mimo @media). */
const zaklad = (css, selektor) => css.match(new RegExp(`\\n${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`))?.[1] ?? '';
const blok = (css, hlavicka) => css.match(new RegExp(`${hlavicka.source}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? '';
const TOKEN = /^var\(--(radius-(badge|thumb|field|control)|media-radius)\)$/;

// ── P1: poloměry ─────────────────────────────────────────────────────────────

test('kolo 50: žádný border-radius natvrdo v px — jen tokeny škály, 0 a 50 % (kruh)', () => {
  for (const [soubor, css] of [['global.css', global], ['editorial.css', editorial], ['premium.css', premium]]) {
    const mimo = [...css.matchAll(/border-radius:\s*([^;}]+)[;}]/g)]
      .map((m) => m[1].trim())
      .filter((v) => !TOKEN.test(v) && v !== '0' && v !== '50%' && v !== '0 0 var(--radius) 0');
    assert.deepEqual(mimo, [], `${soubor}: hodnoty mimo škálu`);
  }
  // Jediný zbylý uživatel starého --radius 8px je roh skip-linku.
  assert.equal((global.match(/var\(--radius\)/g) ?? []).length, 1);
  assert.match(pravidlo(global, '.skip-link'), /border-radius:\s*0 0 var\(--radius\) 0/);
});

test('kolo 50: mapa rolí — panely/aside/pole field, média/karty/modal media, tlačítka control', () => {
  const field = ['.audio-prehled', '.article-videobar', '.article-cta-inline', '.article-body', '.article-aside', '.about-aside', '.article-body pre', '.article-body .table-wrap', '.x-facade', '.an-item', '.komentare-placeholder'];
  for (const s of field) assert.match(zaklad(global, s), /border-radius:\s*var\(--radius-field\)/, s);
  const media = ['.hero-visual', '.card', '.vc-thumb', '.search-box', '.video-embed', '.article-hero'];
  for (const s of media) assert.match(zaklad(global, s), /border-radius:\s*var\(--media-radius\)/, s);
  assert.match(global, /\.article-body img \{ max-width: 100%; border-radius: var\(--media-radius\); \}/);
  const control = ['.yt-btn', '.share-btn', '.btn-primary', '.btn-ghost', '.chip', '.search-input', '.theme-toggle', '.search-trigger', '.komentare-nacist', '.x-facade-open'];
  for (const s of control) assert.match(zaklad(global, s), /border-radius:\s*var\(--radius-control\)/, s);
  for (const s of ['.article-body code', '.st-kbd', '.si-cat']) assert.match(zaklad(global, s), /border-radius:\s*var\(--radius-badge\)/, s);
  assert.match(pravidlo(blok(premium, /@media \(max-width: 580px\)/), '.article-layout .article-body .table-wrap'), /border-radius:\s*var\(--radius-field\)/);
});

test('kolo 50: .vc-thumb, .share-btn a .yt-btn mají poloměr jednou — žádná přepisující vrstva', () => {
  assert.doesNotMatch(premium, /^\.vc-thumb\s*\{/m, 'druhé .vc-thumb pravidlo v premium pryč');
  assert.doesNotMatch(pravidlo(global, '.vc-thumb'), /border:/, 'rámeček nuloval premium — pryč z obou');
  assert.doesNotMatch(premium, /^\.share-btn\s*\{/m);
  assert.doesNotMatch(pravidlo(premium, '.yt-btn'), /border-radius/);
  // Mrtvé var(--radius) v editorial, které premium přebíjel.
  assert.doesNotMatch(editorial, /var\(--radius\)/);
});

// ── P1: jedno „Sdílej dál“ ───────────────────────────────────────────────────

test('kolo 50: „Sdílej dál“ je v HTML článku jednou — v aside, s popisky a <noscript> odkazem', () => {
  assert.equal((clanek.match(/Sdílej dál/g) ?? []).length, 1);
  assert.equal((clanek.match(/class="share-btns"/g) ?? []).length, 1);
  assert.doesNotMatch(clanek, /class="article-share"/);
  const aside = clanek.match(/<aside class="article-aside">([\s\S]*?)<\/aside>/)?.[1] ?? '';
  assert.match(aside, /<div class="article-aside-share">\s*<p class="mono">Sdílej dál<\/p>/);
  for (const label of ['Sdílet na X', 'Sdílet na Facebooku', 'Kopírovat odkaz na článek']) {
    assert.equal((clanek.match(new RegExp(`aria-label="${label}"`, 'g')) ?? []).length, 1, label);
  }
  assert.match(aside, /<noscript><a class="share-btn" href=\{articleUrl\}>Odkaz na článek<\/a><\/noscript>/);
});

test('kolo 50: sada se kreslí v každém okně — sticky aside, dole ve sloupci (nízký desktop), pod textem (< 901px)', () => {
  assert.doesNotMatch(global, /\.article-aside-share\s*\{[^}]*display:\s*none/);
  assert.doesNotMatch(global + premium + editorial, /\.article-share\b/);
  const nizky = blok(global, /@media \(min-width: 901px\) and \(max-height: 639px\)/);
  assert.match(nizky, /position:\s*sticky;\s*bottom:\s*0/);
  const tablet = blok(global, /@media \(max-width: 900px\)/);
  assert.match(tablet, /\.article-aside > :not\(\.article-aside-share\) \{ display: none; \}/);
  assert.doesNotMatch(tablet, /\.article-aside \{ display: none; \}/, 'celý aside se skrýt nesmí — nesl by jediné sdílení');
  const mobilPremium = blok(premium, /@media \(max-width: 900px\)/);
  assert.match(pravidlo(mobilPremium, '.article-aside'), /max-width:\s*700px;\s*margin:\s*40px auto 0;\s*padding:\s*0;\s*border-left:\s*0/, 'stejný sloupec jako tělo');
  assert.match(pravidlo(mobilPremium, '.article-aside-share'), /display:\s*flex/);
  // Tisk: aside (a s ním sdílení) se netiskne.
  assert.match(blok(global, /@media print/), /\.article-aside, \.topics/);
});

// ── P1: náhledy videí ────────────────────────────────────────────────────────

test('kolo 50: pásek videí bere hq720 WebP s JPEG fallbackem (test-video-strip-nahled, test-homepage)', () => {
  const index = cti('src/pages/index.astro');
  assert.match(index, /const videaPasek = await videaSNahledem\(videos\);/);
  assert.match(index, /<source srcset=\{v\.nahled\.webp\} type="image\/webp" \/>/);
  assert.doesNotMatch(index, /sddefault\.jpg`/);
});

// ── P1: tichá řada „video není“ ──────────────────────────────────────────────

// Kolo 56: řada „video není“ zrušena; hlavní YouTube cesta po textu je
// plné tlačítko v autorském boxu.
test('kolo 50/56: po textu jediná YouTube výzva — tlačítko v autorském boxu', () => {
  assert.doesNotMatch(clanek, /article-videobar-bez-videa|article-videobar-odkaz/);
  assert.match(clanek, /<div class="ab-actions">\s*<a href="https:\/\/www\.youtube\.com\/@realtech-cz\?sub_confirmation=1" class="yt-btn">/);
});

// ── P2: OSVČ ─────────────────────────────────────────────────────────────────

test('kolo 50: titulek Word článku a perex Gemini/Workspace bez OSVČ framingu (slug přejmenován v kole 51)', () => {
  const word = cti('src/content/clanky/chatgpt-ve-wordu-zdarma-checklist.md');
  const gemini = cti('src/content/clanky/gemini-workspace-konektory-hubspot-quickbooks-checklist.md');
  const fm = (md, pole) => md.match(new RegExp(`^${pole}: "(.*)"$`, 'm'))?.[1] ?? '';
  assert.equal(fm(word, 'title'), 'ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist před odesláním');
  for (const md of [word, gemini]) {
    assert.doesNotMatch(fm(md, 'title'), /OSVČ|živnost/i);
    assert.doesNotMatch(fm(md, 'description'), /OSVČ|živnost/i);
  }
});

// ── P2: typografie a červený text ────────────────────────────────────────────

test('kolo 50: nadpisy v global.css přes var(--editorial-face), surové Archivo jen u značky, žádné mrtvé fallbacky', () => {
  const surove = [...global.matchAll(/([^{}]+)\{([^{}]*'Archivo Variable'[^{}]*)\}/g)].map((m) => m[1].trim().split('\n').pop().trim());
  assert.deepEqual(surove.sort(), ['.ab-logo', '.logo']);
  assert.doesNotMatch(global, /Archivo (Hero|Clanek|Karta) Fallback|@font-face/);
  assert.ok((global.match(/font-family: var\(--editorial-face\);/g) ?? []).length >= 16);
});

test('kolo 50: červený text jde přes --signal-text (dark = --signal-dark), výplně drží --signal-fill', () => {
  const root = pravidlo(global, ':root');
  assert.match(root, /--signal-text:\s*var\(--signal\)/);
  assert.equal((global.match(/--signal-text:\s*var\(--signal-dark\)/g) ?? []).length, 2);
  for (const s of ['.logo .tech', '.ab-logo .tech']) assert.match(pravidlo(global, s), /color:\s*var\(--signal-text\)/);
  assert.match(pravidlo(global, '.stat strong'), /color:\s*var\(--signal-text\)/);
  assert.doesNotMatch(global, /\.(logo|stat)[^{]*\{\s*color:\s*var\(--signal-dark\)/, 'dark přepisy po selektorech pryč');
  assert.match(pravidlo(global, '.yt-btn'), /background:\s*var\(--signal-fill\)/);
  assert.doesNotMatch(editorial, /caret-color/, 'kurzor pole dává premium input (--signal-dark)');
});
