// Kolo 42: živý audit 17. 9. 2026 (po #462 premium redesignu, hero RTX
// Spark) proti kódu. Hero = nejnovější, audio/TOC/aside/share OK, archiv
// filtruje bez JS, kolo 41 drží. Co zbylo a je tady zamčené:
//
// P1 Base.astro emitoval design brief „<!-- THESIS: … -->“ jako HTML
//    komentář do KAŽDÉ stránky (home, archiv, články). Kolo 41 zakázalo
//    HTML komentáře jen v tělech článků — layout jím prošel. Teď je to
//    Astro komentář {/* … */} (do HTML se nekompiluje) a validate-content
//    shodí build za raw `<!--` v src/layouts/** a src/components/**.
// P1 Slug `gemini-notebook-external-sharing-admin`: titulek i lead od kola
//    40 mluví k běžnému uživateli („tvůj účet“), URL říkala admin. Přejmenováno
//    na `gemini-notebook-external-sharing` + 301; audio zůstává na starém
//    klíči CDN (přehrávač 200 bez přejmenování v R2).
// P1 Nav „Videa“ míří na YouTube, ale hádané /videa/ vracelo 404 — stejný
//    dluh jako /kontakt, /blog. 301 na kanál.
// P2 Hero rail: holý <img src=-640.webp> do slotu 100px; karty jinde mají
//    <picture> + sizes. Teď stejný vzor s HERO_RAIL_SIZES.
// P2 /temata/ai/ 404 — hub je /temata/ai-report/. 301.
// P2 RTX Spark (lokální AI PC) je AI Report a ve filtru Hardware chybí —
//    category zůstává (pravidlo jedné kategorie), hub /temata/hardware/
//    dostal kurátorovaný cross-link.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const cti = (rel) => readFileSync(join(koren, rel), 'utf8');
const base = cti('src/layouts/Base.astro');
const bezKomentaru = (zdroj) => zdroj.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const bezFrontmatteru = (zdroj) => zdroj.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
/** Direktivy Cloudflare (kolo 26) v HTML stát musí — jediná povolená výjimka. */
const bezEmailOff = (zdroj) => zdroj.replace(/<!--\/?email_off-->/g, '');
const sablona = (zdroj) => bezEmailOff(bezKomentaru(bezFrontmatteru(zdroj)));

// ── P1: design brief není HTML komentář ─────────────────────────────────────

test('kolo 42: THESIS v Base.astro je Astro komentář {/* … */}, ne raw <!-- -->', () => {
  assert.doesNotMatch(bezFrontmatteru(base), /<!--\s*THESIS/, 'THESIS jako HTML komentář jde do každé stránky');
  const astroKomentare = [...base.matchAll(/\{\/\*([\s\S]*?)\*\/\}/g)].map((m) => m[1]);
  const thesis = astroKomentare.find((k) => /THESIS:/.test(k));
  assert.ok(thesis, 'design brief má zůstat v kódu — jako Astro komentář');
  for (const radek of ['OWN-WORLD:', 'STORY:', 'FIRST VIEWPORT:', 'FORM:', 'FINISH:']) {
    assert.match(thesis, new RegExp(radek), `brief přišel o řádek ${radek}`);
  }
});

test('kolo 42: kompilát Base.astro neobsahuje THESIS ani žádný <!-- (Astro komentář se do HTML nekompiluje)', async () => {
  const { transform } = await import('@astrojs/compiler');
  const { code } = await transform(base, { filename: 'Base.astro', resolvePath: async (s) => s });
  assert.doesNotMatch(code, /THESIS/, 'brief v kompilátu = brief v HTML');
  assert.doesNotMatch(code, /<!--/, 'raw HTML komentář v kompilátu Base');
  // Kolo 41: </head> musí dál stát až za slotem head a beaconem.
  const konecHlavy = code.indexOf('</head>');
  assert.ok(code.indexOf('$$slots["head"]') < konecHlavy, 'slot head musí zůstat v <head>');
  assert.ok(code.indexOf('static.cloudflareinsights.com/beacon.min.js') < konecHlavy, 'beacon musí zůstat v <head>');
});

const astroSoubory = (dir) =>
  readdirSync(join(koren, dir), { recursive: true })
    .filter((f) => f.endsWith('.astro'))
    .map((f) => `${dir}/${f}`);

test('kolo 42: žádný raw <!-- v src/layouts/** ani src/components/** (mimo <!--email_off-->)', () => {
  const soubory = [...astroSoubory('src/layouts'), ...astroSoubory('src/components')];
  assert.ok(soubory.length >= 7, `čekám ≥ 7 .astro souborů, je ${soubory.length}`);
  for (const f of soubory) {
    assert.doesNotMatch(sablona(cti(f)), /<!--/, `${f}: HTML komentář jde do HTML — použij {/* … */}`);
  }
});

const VALIDATOR = join(koren, 'scripts/validate-content.mjs');
const FIXTURE_PREFIX = join(tmpdir(), 'realtech-kolo-42-');

function fixture(t, { layout, komponenta } = {}) {
  const root = mkdtempSync(FIXTURE_PREFIX);
  for (const dir of ['src/content/clanky', 'public/images/clanky', 'src/layouts', 'src/components']) {
    mkdirSync(join(root, dir), { recursive: true });
  }
  t.after(() => {
    assert.ok(root.startsWith(FIXTURE_PREFIX));
    rmSync(root, { recursive: true, force: true });
  });
  writeFileSync(
    join(root, 'src/content/clanky/pokus.md'),
    ['---', 'title: "Pokus"', 'description: "Popis pokusu."', 'category: "AI Report"', 'date: "2026-01-15"', '---', '', 'Odstavec.', ''].join('\n'),
  );
  if (layout !== undefined) writeFileSync(join(root, 'src/layouts/Pokus.astro'), layout);
  if (komponenta !== undefined) writeFileSync(join(root, 'src/components/Pokus.astro'), komponenta);
  return spawnSync(process.execPath, [VALIDATOR], { cwd: root, encoding: 'utf8' });
}

test('kolo 42: validate-content shodí build kvůli raw HTML komentáři v layoutu', (t) => {
  const vysledek = fixture(t, {
    layout: ['---', "const x = 1; // <!-- ve frontmatteru nevadí", '---', '<body>', '<!-- THESIS: A reading-led journal -->', '<slot />', '</body>', ''].join('\n'),
  });
  assert.equal(vysledek.error, undefined);
  assert.equal(vysledek.status, 1);
  assert.match(vysledek.stderr, /src\/layouts\/Pokus\.astro: HTML komentář jde doslova do HTML každé stránky — použij Astro \{\/\* … \*\/\}: „<!-- THESIS: A reading-led journal -->“/);
});

test('kolo 42: validate-content shodí build i kvůli komentáři v komponentě', (t) => {
  const vysledek = fixture(t, { komponenta: '<div>\n  <!-- TODO -->\n</div>\n' });
  assert.equal(vysledek.status, 1);
  assert.match(vysledek.stderr, /src\/components\/Pokus\.astro: HTML komentář/);
});

test('kolo 42: validate-content pustí Astro komentář, <!--email_off--> i chybějící adresáře layouts/components', (t) => {
  const ok = fixture(t, {
    layout: ['---', 'const a = 1;', '---', '{/* <!-- tohle je jen text v Astro komentáři --> */}', '<p><!--email_off--><a href="mailto:x@y.cz">x</a><!--/email_off--></p>', ''].join('\n'),
  });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /1 článků OK/);
  // Fixture kola 41 nemá src/layouts ani src/components — validator nesmí spadnout.
  const bezAdresaru = mkdtempSync(FIXTURE_PREFIX);
  t.after(() => rmSync(bezAdresaru, { recursive: true, force: true }));
  mkdirSync(join(bezAdresaru, 'src/content/clanky'), { recursive: true });
  mkdirSync(join(bezAdresaru, 'public/images/clanky'), { recursive: true });
  writeFileSync(
    join(bezAdresaru, 'src/content/clanky/pokus.md'),
    ['---', 'title: "Pokus"', 'description: "Popis pokusu."', 'category: "AI Report"', 'date: "2026-01-15"', '---', '', 'Odstavec.', ''].join('\n'),
  );
  const vysledek = spawnSync(process.execPath, [VALIDATOR], { cwd: bezAdresaru, encoding: 'utf8' });
  assert.equal(vysledek.status, 0, vysledek.stderr);
});

// ── P1: slug bez -admin, audio na starém klíči, 301 ze staré URL ──────────

const STARY_SLUG = 'gemini-notebook-external-sharing-admin';
const NOVY_SLUG = 'gemini-notebook-external-sharing';

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

test('kolo 42: článek o sdílení Gemini Notebooku žije na slugu bez -admin; cover, deriváty i OG jdou s ním', () => {
  assert.ok(existsSync(join(koren, `src/content/clanky/${NOVY_SLUG}.md`)), 'nový content file chybí');
  assert.ok(!existsSync(join(koren, `src/content/clanky/${STARY_SLUG}.md`)), 'starý content file má být pryč (dva články = duplicitní obsah)');
  const fm = cti(`src/content/clanky/${NOVY_SLUG}.md`).split(/^---\s*$/m)[1] ?? '';
  assert.match(fm, /^title: "Gemini Notebook: 4 úrovně sdílení ven\. Co to znamená pro tvůj účet"$/m, 'titulek se nemění');
  assert.match(fm, new RegExp(`^image: "/images/clanky/${NOVY_SLUG}\\.jpg"$`, 'm'), 'cover míří na přejmenovaný soubor');
  for (const pripona of ['.jpg', '.webp', '-640.jpg', '-640.webp', '-960.webp']) {
    assert.ok(existsSync(join(koren, `public/images/clanky/${NOVY_SLUG}${pripona}`)), `chybí derivát ${NOVY_SLUG}${pripona}`);
    assert.ok(!existsSync(join(koren, `public/images/clanky/${STARY_SLUG}${pripona}`)), `starý derivát ${STARY_SLUG}${pripona} zůstal`);
  }
  assert.ok(existsSync(join(koren, `public/images/og/${NOVY_SLUG}.jpg`)), 'OG obrázek chybí');
  assert.ok(existsSync(join(koren, `public/images/og/${NOVY_SLUG}.jpg.sha256`)), 'otisk OG chybí — generate-og by ho přegeneroval');
  assert.ok(!existsSync(join(koren, `public/images/og/${STARY_SLUG}.jpg`)), 'starý OG zůstal');
});

test('kolo 42: audio zůstává na původním klíči R2 (přehrávač 200 bez přejmenování v R2), AUDIO_R2_KLIC to eviduje', async () => {
  const fm = cti(`src/content/clanky/${NOVY_SLUG}.md`).split(/^---\s*$/m)[1] ?? '';
  assert.match(fm, new RegExp(`^  url: "https://audio\\.realtech\\.cz/${STARY_SLUG}-nlm\\.mp3\\?v=6bc339e18708"$`, 'm'), 'audio.url se nemění — soubor v R2 leží pod starým klíčem');
  assert.match(fm, /^  duration: 991$/m);
  const { AUDIO_R2_KLIC } = await import('./audio-pending.mjs');
  assert.equal(AUDIO_R2_KLIC.get(NOVY_SLUG), STARY_SLUG, 'test-audio-last10 potřebuje výjimku z konvence <slug>-nlm.mp3');
});

test('kolo 42: stará URL /clanky/…-admin/ jde 301 na nový slug; nikde v src/ ani scripts/ nezůstal odkaz na starý slug', () => {
  const rules = pravidlaRedirectu();
  for (const source of [`/clanky/${STARY_SLUG}`, `/clanky/${STARY_SLUG}/`]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects: chybí pravidlo pro ${source}`);
    assert.equal(rule.destination, `/clanky/${NOVY_SLUG}/`);
    assert.equal(rule.status, '301');
  }
  const zdroje = [
    ...readdirSync(join(koren, 'src'), { recursive: true }).filter((f) => /\.(astro|md|mdx|js|ts|json)$/.test(f)).map((f) => `src/${f}`),
    ...readdirSync(join(koren, 'scripts'), { recursive: true }).filter((f) => /\.mjs$/.test(f) && !/^test-kolo-4[02]-leftover\.mjs$|^audio-pending\.mjs$/.test(f)).map((f) => `scripts/${f}`),
  ];
  for (const f of zdroje) {
    const text = cti(f);
    // Jediná povolená stopa starého slugu je klíč MP3 v R2 (audio.url).
    const bezAudia = text.replace(new RegExp(`https://audio\\.realtech\\.cz/${STARY_SLUG}-nlm\\.mp3[^"\\s]*`, 'g'), '');
    assert.doesNotMatch(bezAudia, new RegExp(STARY_SLUG), `${f}: odkaz na starý slug`);
  }
});

// ── P2: hero rail s <picture> + sizes jako karty ───────────────────────────

test('kolo 42: hero rail úvodky kreslí <picture> s WebP srcset a sizes=HERO_RAIL_SIZES, ne holý <img src=lcpSrc>', () => {
  const index = cti('src/pages/index.astro');
  const rail = bezKomentaru(index.slice(index.indexOf('class="hero-rail"'), index.indexOf('</aside>')));
  assert.ok(rail, 'hero-rail v index.astro chybí');
  assert.doesNotMatch(rail, /<img src=\{nahledKarty\(/, 'holý <img> bez srcset (kolo 42)');
  assert.match(rail, /<picture>/);
  assert.match(rail, /<source srcset=\{nahled\.webpSrcset\} sizes=\{HERO_RAIL_SIZES\} type="image\/webp" \/>/, 'WebP <source> se srcset a sizes railu');
  assert.match(rail, /<img src=\{nahled\.src\} alt="" aria-hidden="true" width=\{nahled\.width\} height=\{nahled\.height\} loading="lazy" decoding="async" \/>/, 'img s pravdivými rozměry, lazy, alt="" (jméno nese .hero-rail-title)');
  assert.doesNotMatch(rail, /alt=\{article\.data\.title\}/, 'alt s titulkem by zdvojil jméno odkazu (viditelný .hero-rail-title)');
  assert.match(rail, /class="hero-rail-title"/);
  assert.match(index, /import \{[^}]*\bnahledRailu\b[^}]*\bHERO_RAIL_SIZES\b[^}]*\} from '\.\.\/lib\/karta-nahled\.js'/, 'rail bere helper i sizes z karta-nahled.js');
});

test('kolo 42: HERO_RAIL_SIZES odpovídá slotu .hero-rail-item img v premium.css (100px)', async () => {
  const { HERO_RAIL_SIZES } = await import('../src/lib/karta-nahled.js');
  const premium = cti('src/styles/premium.css');
  const slot = premium.match(/\.hero-rail-item img\s*\{([^}]*)\}/)?.[1] ?? '';
  const sirka = slot.match(/width:\s*(\d+px)/)?.[1];
  assert.ok(sirka, 'premium.css: .hero-rail-item img bez width');
  assert.equal(HERO_RAIL_SIZES, sirka, 'sizes railu musí sedět na šířku slotu v CSS');
  // premium.css se načítá až po editorial.css (Base.astro) — jeho 100px vyhrává nad 80px.
  const importy = cti('src/layouts/Base.astro');
  assert.ok(importy.indexOf("import '../styles/editorial.css'") < importy.indexOf("import '../styles/premium.css'"), 'premium.css musí stát za editorial.css');
});

test('kolo 42: nahledRailu — lokální cover s WebP srcset, YouTube fallback, null bez obojího', async () => {
  const { nahledRailu, HERO_RAIL_SIZES } = await import('../src/lib/karta-nahled.js');
  assert.equal(HERO_RAIL_SIZES, '100px');
  const soubory = new Set([
    'public/images/clanky/x-640.jpg', 'public/images/clanky/x-640.webp', 'public/images/clanky/x-960.webp', 'public/images/clanky/x.webp', 'public/images/clanky/x.jpg',
  ]);
  const exists = (c) => soubory.has(c);
  assert.deepEqual(nahledRailu({ image: '/images/clanky/x.jpg' }, exists), {
    src: '/images/clanky/x-640.webp',
    width: 640,
    height: 360,
    webp: '/images/clanky/x-640.webp',
    webpSrcset: '/images/clanky/x-640.webp 640w, /images/clanky/x-960.webp 960w, /images/clanky/x.webp 1280w',
  });
  // Cover v repu chybí, video je → YouTube maxresdefault (jako ArticleCard), ne 404 na neexistující cover.
  assert.deepEqual(nahledRailu({ image: '/images/clanky/neni.jpg', video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }, exists), {
    src: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    width: 1280,
    height: 720,
    webp: null,
    webpSrcset: null,
  });
  assert.equal(nahledRailu({ image: '/images/clanky/neni.jpg' }, exists), null);
  assert.equal(nahledRailu({}, exists), null);
  // Lokální cover má přednost i u video článku (stejně jako karta a hero).
  assert.equal(nahledRailu({ image: '/images/clanky/x.jpg', video: 'https://youtu.be/dQw4w9WgXcQ' }, exists).src, '/images/clanky/x-640.webp');
});

// ── P2: RTX Spark zůstává AI Report, hub Hardware dostal cross-link ────────

const RTX_SLUG = 'rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat';

test('kolo 42: RTX Spark zůstává category AI Report (pravidlo jedné kategorie) a je v kurátorovaném seznamu hubu Hardware', async () => {
  const fm = cti(`src/content/clanky/${RTX_SLUG}.md`).split(/^---\s*$/m)[1] ?? '';
  assert.match(fm, /^category: "AI Report"$/m, 'kategorii neměnit — cross-link řeší tema-souvisi.js');
  const { SOUVISI_S_TEMATEM } = await import('../src/lib/tema-souvisi.js');
  assert.deepEqual(SOUVISI_S_TEMATEM.Hardware, [RTX_SLUG]);
  // Každý kurátorovaný slug musí existovat, nebýt draft a být z JINÉ kategorie než hub.
  for (const [tema, slugy] of Object.entries(SOUVISI_S_TEMATEM)) {
    for (const slug of slugy) {
      const cesta = `src/content/clanky/${slug}.md`;
      assert.ok(existsSync(join(koren, cesta)), `${tema}: ${slug} v obsahu není — odkaz by šel na 404`);
      const fmSlug = cti(cesta).split(/^---\s*$/m)[1] ?? '';
      assert.doesNotMatch(fmSlug, /^draft:\s*true/m, `${tema}: ${slug} je draft`);
      assert.notEqual(fmSlug.match(/^category:\s*["']?([^\n"']+)/m)?.[1]?.trim(), tema, `${tema}: ${slug} už v tématu je — byl by v mřížce dvakrát`);
    }
  }
});

test('kolo 42: souvisejiciClanky drží pořadí seznamu, vynechá chybějící slug i článek ze stejné kategorie', async () => {
  const { souvisejiciClanky } = await import('../src/lib/tema-souvisi.js');
  const a = { id: RTX_SLUG, data: { category: 'AI Report' } };
  const b = { id: 'neco-hardware', data: { category: 'Hardware' } };
  assert.deepEqual(souvisejiciClanky('Hardware', [b, a]), [a]);
  assert.deepEqual(souvisejiciClanky('Hardware', [b]), [], 'chybějící slug (draft/smazaný) se tiše vynechá');
  assert.deepEqual(souvisejiciClanky('Hardware', [{ id: RTX_SLUG, data: { category: 'Hardware' } }]), [], 'přeřazený článek už v mřížce je');
  assert.deepEqual(souvisejiciClanky('Drony', [a, b]), [], 'téma bez seznamu = nic');
});

test('kolo 42: TemaPage kreslí „Souvisí s tématem“ jen na straně 1, pod mřížkou a před „Další témata“; CSS v premium.css', () => {
  const tema = bezKomentaru(cti('src/components/TemaPage.astro'));
  assert.match(tema, /import \{ souvisejiciClanky \} from '\.\.\/lib\/tema-souvisi\.js'/);
  // Kolo 46: cross-linky se počítají pro ItemList každé strany (souvisiVse), blok dál jen na straně 1.
  assert.match(tema, /const souvisiVse = souvisejiciClanky\(category, all\);\s*const souvisi = page === 1 \? souvisiVse : \[\];/, 'strana 2+ je pokračování mřížky, blok patří jen na hub');
  const blok = tema.match(/\{souvisi\.length > 0 && \(\s*<section class="tema-souvisi" aria-labelledby="tema-souvisi-nadpis">([\s\S]*?)<\/section>\s*\)\}/)?.[1];
  assert.ok(blok, '<section class="tema-souvisi"> s aria-labelledby chybí');
  assert.match(blok, /<h2 id="tema-souvisi-nadpis">Souvisí s tématem<\/h2>/);
  assert.match(blok, /<a href=\{`\/clanky\/\$\{c\.id\}\/`\}>/);
  assert.match(blok, /<span class="tema-souvisi-title">\{c\.data\.title\}<\/span>/);
  assert.match(blok, /\{c\.data\.category\} · <time datetime=/, 'meta říká, z jakého tématu článek je');
  assert.ok(tema.indexOf('class="grid featured-lead"') < tema.indexOf('class="tema-souvisi"'), 'blok patří pod mřížku');
  assert.ok(tema.indexOf('class="tema-souvisi"') < tema.indexOf('aria-label="Další témata"'), 'blok patří před chipy dalších témat');
  const premium = cti('src/styles/premium.css');
  assert.match(premium, /\.tema-souvisi-list a \{[^}]*min-height:\s*44px/, '44px dotykový cíl');
  assert.match(premium, /\.tema-souvisi-title \{[^}]*font-family:\s*var\(--editorial-face\)/);
});

// ── Built HTML (jen když dist/ existuje — `npm run build` před testem) ─────

test('kolo 42: build v dist/ nenese žádný HTML komentář mimo <!--email_off-->', { skip: !existsSync(join(koren, 'dist/index.html')) && 'dist/ chybí (spusť npm run build)' }, () => {
  const html = readdirSync(join(koren, 'dist'), { recursive: true }).filter((f) => f.endsWith('.html'));
  assert.ok(html.length > 100, `čekám > 100 HTML souborů, je ${html.length}`);
  for (const f of html) {
    assert.doesNotMatch(bezEmailOff(cti(join('dist', f))), /<!--/, `dist/${f}: HTML komentář v produkčním HTML`);
  }
});
