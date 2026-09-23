// Kolo 51: hluboký live audit 23. 9. 2026 (realtech.cz po #511 Astra a #510
// kolo 50, CSS Base.BW4X5r7-.css). Co zůstalo a tu se zamyká:
//
// P1 Slug `chatgpt-ve-wordu-zdarma-checklist-osvc`: titulek a perex jsou od
//    kola 50 bez OSVČ (hlas webu je běžný Čech s AI), URL, cover i OG ale
//    pořád -osvc. Přejmenováno stejně jako -admin v kole 42: content file,
//    cover s deriváty, OG + otisk (slug v otisku není → bez regenerace),
//    301 ze staré URL. Audio zůstává na starém klíči R2 (AUDIO_R2_KLIC).
// P1 twitter:site chyběl na všech stránkách (card/image/title byly). Účet
//    na X je @REALTECHCZ, v Base malými (kolo 22 hlídá slitý název velkými).
// P1 Článek bez MP3 (AUDIO_PENDING, Astra) nesmí mít mrtvý přehrávač ani
//    díru: AudioPrehled se bez audia nevykreslí vůbec, preconnect ani
//    AudioObject nevznikne a mezeru mezi videobarem a textem drží
//    .article-layout sám (margin audio karty se do něj stejně slil).
// P1 /herohero/: výzvy stály až pod třemi odstavci (390px: pod první
//    obrazovkou) a „primární“ Herohero kreslil premium jako podtržený text —
//    vizuálně slabší než dvě obrysové pilulky vedle. Teď hned pod perexem:
//    Herohero plná pilulka, YouTube obrysová, články odkaz v poznámce.
//    Nic nevymyšleného (test-kolo-48-herohero hlídá ceny, termíny, …).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { AUDIO_PENDING, AUDIO_R2_KLIC } from './audio-pending.mjs';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const bezAstroKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezCssKomentaru = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const pravidlo = (css, selektor) => {
  const re = new RegExp(`^\\s*${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'm');
  return css.match(re)?.[1] ?? '';
};

const STARY_SLUG = 'chatgpt-ve-wordu-zdarma-checklist-osvc';
const NOVY_SLUG = 'chatgpt-ve-wordu-zdarma-checklist';

function pravidlaRedirectu() {
  const rules = new Map();
  for (const radek of cti('public/_redirects').split(/\r?\n/)) {
    const line = radek.trim();
    if (!line || line.startsWith('#')) continue;
    const [source, destination, status] = line.split(/\s+/);
    rules.set(source, { destination, status });
  }
  return rules;
}

// ── P1: slug bez -osvc ───────────────────────────────────────────────────────

test('kolo 51: článek o ChatGPT ve Wordu žije na slugu bez -osvc; cover, deriváty i OG jdou s ním', () => {
  assert.ok(existsSync(join(koren, `src/content/clanky/${NOVY_SLUG}.md`)), 'nový content file chybí');
  assert.ok(!existsSync(join(koren, `src/content/clanky/${STARY_SLUG}.md`)), 'starý content file má být pryč (dva články = duplicitní obsah)');
  const fm = cti(`src/content/clanky/${NOVY_SLUG}.md`).split(/^---\s*$/m)[1] ?? '';
  assert.match(fm, /^title: "ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist před odesláním"$/m, 'titulek z kola 50 se nemění');
  assert.doesNotMatch(fm.replace(/^  url: .*$/m, ''), /OSVČ|osvc|živnost/i, 'frontmatter bez OSVČ (mimo klíč MP3 v R2)');
  assert.match(fm, new RegExp(`^image: "/images/clanky/${NOVY_SLUG}\\.jpg"$`, 'm'), 'cover míří na přejmenovaný soubor');
  for (const pripona of ['.jpg', '.webp', '-192.webp', '-384.webp', '-640.jpg', '-640.webp', '-960.webp']) {
    assert.ok(existsSync(join(koren, `public/images/clanky/${NOVY_SLUG}${pripona}`)), `chybí derivát ${NOVY_SLUG}${pripona}`);
    assert.ok(!existsSync(join(koren, `public/images/clanky/${STARY_SLUG}${pripona}`)), `starý derivát ${STARY_SLUG}${pripona} zůstal`);
  }
  assert.ok(existsSync(join(koren, `public/images/og/${NOVY_SLUG}.jpg`)), 'OG obrázek chybí');
  assert.ok(existsSync(join(koren, `public/images/og/${NOVY_SLUG}.jpg.sha256`)), 'otisk OG chybí — generate-og by ho přegeneroval');
  assert.ok(!existsSync(join(koren, `public/images/og/${STARY_SLUG}.jpg`)), 'starý OG zůstal');
});

test('kolo 51: audio zůstává na původním klíči R2, AUDIO_R2_KLIC to eviduje', () => {
  const fm = cti(`src/content/clanky/${NOVY_SLUG}.md`).split(/^---\s*$/m)[1] ?? '';
  assert.match(fm, new RegExp(`^  url: "https://audio\\.realtech\\.cz/${STARY_SLUG}-nlm\\.mp3\\?v=7a3c784bd81a"$`, 'm'), 'audio.url se nemění — soubor v R2 leží pod starým klíčem');
  assert.match(fm, /^  duration: 1535$/m);
  assert.equal(AUDIO_R2_KLIC.get(NOVY_SLUG), STARY_SLUG, 'test-audio-last10 potřebuje výjimku z konvence <slug>-nlm.mp3');
});

test('kolo 51: stará URL /clanky/…-osvc/ jde 301 na nový slug; v src/ ani scripts/ nezůstal odkaz na starý slug', () => {
  const rules = pravidlaRedirectu();
  for (const source of [`/clanky/${STARY_SLUG}`, `/clanky/${STARY_SLUG}/`]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects: chybí pravidlo pro ${source}`);
    assert.equal(rule.destination, `/clanky/${NOVY_SLUG}/`);
    assert.equal(rule.status, '301');
  }
  const zdroje = [
    ...readdirSync(join(koren, 'src'), { recursive: true }).filter((f) => /\.(astro|md|mdx|js|ts|json)$/.test(f)).map((f) => `src/${f}`),
    ...readdirSync(join(koren, 'scripts'), { recursive: true }).filter((f) => /\.mjs$/.test(f) && !/^test-kolo-51-leftover\.mjs$|^audio-pending\.mjs$/.test(f)).map((f) => `scripts/${f}`),
  ];
  for (const f of zdroje) {
    const bezAudia = cti(f).replace(new RegExp(`https://audio\\.realtech\\.cz/${STARY_SLUG}-nlm\\.mp3[^"\\s]*`, 'g'), '');
    assert.doesNotMatch(bezAudia, new RegExp(STARY_SLUG), `${f}: odkaz na starý slug`);
  }
});

test('kolo 51: build (když existuje) — canonical, og:url a og:image nového slugu, stará URL jen v _redirects', () => {
  const html = join(koren, `dist/clanky/${NOVY_SLUG}/index.html`);
  if (!existsSync(html)) return;
  const stranka = readFileSync(html, 'utf8');
  assert.match(stranka, new RegExp(`<link rel="canonical" href="https://realtech\\.cz/clanky/${NOVY_SLUG}/">`));
  assert.match(stranka, new RegExp(`<meta property="og:url" content="https://realtech\\.cz/clanky/${NOVY_SLUG}/">`));
  assert.match(stranka, new RegExp(`<meta property="og:image" content="https://realtech\\.cz/images/og/${NOVY_SLUG}\\.jpg">`));
  assert.ok(!existsSync(join(koren, `dist/clanky/${STARY_SLUG}`)), 'stará stránka se nesmí generovat');
  for (const soubor of ['rss.xml', 'sitemap-0.xml']) {
    const cesta = join(koren, 'dist', soubor);
    if (existsSync(cesta)) assert.doesNotMatch(readFileSync(cesta, 'utf8'), new RegExp(`/clanky/${STARY_SLUG}`), soubor);
  }
});

// ── P1: twitter:site ─────────────────────────────────────────────────────────

test('kolo 51: Base posílá twitter:site @realtechcz na každé stránce, hned za twitter:card', () => {
  const base = cti('src/layouts/Base.astro');
  assert.match(base, /const X_HANDLE = '@realtechcz';/);
  assert.match(base, /<meta name="twitter:card" content="summary_large_image" \/>\s*<meta name="twitter:site" content=\{X_HANDLE\} \/>/);
  assert.equal((base.match(/twitter:site/g) ?? []).length, 1, 'jediná deklarace — žádná stránka ji nepřepisuje');
  assert.doesNotMatch(base, /twitter:creator/, 'twitter:creator jen s konvencí autorů — web ji nemá');
  const uvodka = join(koren, 'dist/index.html');
  if (existsSync(uvodka)) assert.match(readFileSync(uvodka, 'utf8'), /<meta name="twitter:site" content="@realtechcz">/);
});

// ── P1: AUDIO_PENDING bez mrtvého přehrávače ─────────────────────────────────

test('kolo 51: AudioPrehled se bez audia nevykreslí; preconnect a AudioObject visí na audioLd', () => {
  assert.ok(AUDIO_PENDING.has('grok-bot-astra-tym-agentu'), 'Astra zůstává v AUDIO_PENDING (Deny: SKIPPED podcast)');
  const komponenta = bezAstroKomentaru(cti('src/components/AudioPrehled.astro'));
  const sablona = komponenta.split(/^---\s*$/m)[2] ?? '';
  assert.match(sablona.trim(), /^\{pohled && \(/, 'celá sekce stojí za {pohled && (…)} — bez audia žádný obal ani <audio>');
  const clanek = bezAstroKomentaru(cti('src/pages/clanky/[...id].astro'));
  assert.match(clanek, /const preconnectAudio = Boolean\(audioLd\);/);
  assert.match(clanek, /\{audioLd && <script type="application\/ld\+json"/);
});

test('kolo 51: bez audio karty drží mezeru nad textem .article-layout — žádná díra ani nalepení', () => {
  const global = bezCssKomentaru(cti('src/styles/global.css'));
  const premium = bezCssKomentaru(cti('src/styles/premium.css'));
  // S kartou: margin-bottom karty (36px) se slévá s margin-top layoutu (premium 56px).
  // Bez karty zbude týž margin-top layoutu → stejná mezera.
  assert.match(pravidlo(global, '.audio-prehled'), /margin:\s*28px auto 36px/);
  assert.match(pravidlo(premium, '.article-layout'), /margin-top:\s*56px/);
  assert.match(pravidlo(global, '.article-videobar'), /margin:\s*28px auto 0/, 'videobar dole bez okraje — mezeru dává layout');
});

test('kolo 51: build (když existuje) — články z AUDIO_PENDING bez audio chrome', () => {
  for (const slug of AUDIO_PENDING) {
    const html = join(koren, `dist/clanky/${slug}/index.html`);
    if (!existsSync(html)) continue;
    const stranka = readFileSync(html, 'utf8');
    assert.doesNotMatch(stranka, /class="audio-prehled|<audio\b/, `${slug}: prázdný přehrávač`);
    assert.doesNotMatch(stranka, /audio\.realtech\.cz/, `${slug}: preconnect nebo odkaz na neexistující MP3`);
    assert.doesNotMatch(stranka, /"@type":"AudioObject"/, `${slug}: AudioObject bez souboru`);
    assert.match(stranka, /class="article-layout"/);
  }
});

// ── P1: /herohero/ hierarchie výzev ──────────────────────────────────────────

test('kolo 51: /herohero/ — výzvy hned pod perexem, Herohero plná pilulka, YouTube obrysová, články odkaz v poznámce', () => {
  const stranka = bezAstroKomentaru(cti('src/pages/herohero.astro'));
  const perex = stranka.indexOf('Zatím tam nic hotového není.');
  const akce = stranka.indexOf('<div class="herohero-akce">');
  const layout = stranka.indexOf('<div class="about-layout">');
  assert.ok(perex !== -1 && perex < akce && akce < layout, 'výzvy stojí mezi perexem a sloupci, ne pod odstavci');
  const blok = stranka.slice(akce, layout);
  assert.match(blok, /<div class="hero-actions">\s*<a href=\{HEROHERO\} class="btn-primary">Profil na Herohero<\/a>\s*<a href=\{YT_SUB\} class="btn-ghost">Odebírat na YouTube<\/a>\s*<\/div>/);
  assert.match(blok, /<p class="herohero-akce-note">[\s\S]*Profil je založený, návody do něj teprve chystáme\.[\s\S]*<a href="\/clanky\/">čti články na webu<\/a>/);
  assert.equal((stranka.match(/class="hero-actions"/g) ?? []).length, 1, 'jedna řada výzev');
  assert.equal((stranka.match(/class="btn-/g) ?? []).length, 2, 'dvě tlačítka, články jen odkaz');
  const main = stranka.slice(layout, stranka.indexOf('<aside class="about-aside">'));
  assert.match(main, /<a href="#newsletter">newsletteru<\/a>/, 'newsletter (Kit) v patičce každé stránky — odkaz na kotvu');
  assert.doesNotMatch(main, /hero-actions|btn-/, 'pod odstavci už žádná druhá řada tlačítek');
});

test('kolo 51: .herohero-akce vrací plnou pilulku jen na /herohero/ — .hero-actions .btn-primary jinde zůstává textem', () => {
  const premium = bezCssKomentaru(cti('src/styles/premium.css'));
  assert.match(pravidlo(premium, '.hero-actions .btn-primary'), /background:\s*transparent/, 'sdílený styl úvodky / O nás / 404 beze změny');
  const plna = pravidlo(premium, '.herohero-akce .hero-actions .btn-primary');
  assert.match(plna, /background:\s*var\(--ink\);\s*color:\s*var\(--bg\)/);
  assert.match(plna, /border-radius:\s*var\(--radius-control\)/, 'poloměr z tokenů (kolo 50)');
  assert.match(plna, /text-decoration:\s*none/);
  assert.match(pravidlo(premium, ':root .herohero-akce .hero-actions .btn-primary:hover'), /background:\s*color-mix\(in srgb, var\(--ink\) 86%, var\(--bg\)\)/, 'hover bez průhledného pozadí z .hero-actions a v obou tématech');
  assert.match(pravidlo(premium, '.herohero-akce-note a'), /color:\s*var\(--signal-dark\)/);
  assert.doesNotMatch(bezCssKomentaru(cti('src/styles/global.css')), /herohero/, 'global.css dál bez herohero (kolo 48)');
});
