// /gdpr/ — ochrana osobních údajů. Stránka smí tvrdit jen to, co web
// opravdu dělá: newsletter přes Kit s potvrzením a odhlášením jedním
// klikem, hosting Cloudflare Pages, Cloudflare Web Analytics bez cookies,
// žádná cookie lišta. Když se Base.astro změní (jiný newsletter, nová
// analytika), musí padnout tenhle test, ne až čtenář.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import "./test-sitemap-register.mjs";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (cesta) => readFileSync(join(koren, cesta), "utf8");
const gdpr = cti("src/pages/gdpr.astro");
const base = cti("src/layouts/Base.astro");
const onas = cti("src/pages/o-nas.astro");
const css = cti("src/styles/global.css");

const paticka = base.match(/<footer class="site">[\s\S]*?<\/footer>/)?.[0] ?? "";
const sloupecWeb =
  paticka.match(/<span class="mono f-nav-head">Web<\/span>[\s\S]*?<\/ul>/)?.[0] ?? "";

test("gdpr: patička (sloupec Web) vede na /gdpr/ hned za Kontaktem", () => {
  assert.match(sloupecWeb, /<li><a href="\/gdpr\/">Ochrana údajů<\/a><\/li>/);
  const kontakt = sloupecWeb.indexOf('href="/o-nas/#kontakt"');
  const gdprOdkaz = sloupecWeb.indexOf('href="/gdpr/"');
  const rtv = sloupecWeb.indexOf("href={RTV}");
  assert.ok(kontakt !== -1 && gdprOdkaz !== -1 && rtv !== -1, "sloupci Web chybí položka");
  assert.ok(kontakt < gdprOdkaz && gdprOdkaz < rtv, "Ochrana údajů nestojí mezi Kontaktem a RealTvorbou");
  assert.doesNotMatch(paticka, /mailto:info@realtech\.cz/, "kolo 26: mailto v patičce CF přepisuje na 404");
});

test("gdpr: správce, IČO, sídlo a kontakt na stránce", () => {
  assert.match(gdpr, /Daniel Jan Soukup/);
  assert.match(gdpr, /29973911/);
  assert.match(gdpr, /Netunic/);
  assert.match(gdpr, /<!--email_off--><a href="mailto:info@realtech\.cz">info@realtech\.cz<\/a><!--\/email_off-->/);
  assert.match(gdpr, /<noscript>\s*<p><!--email_off-->E-mail: info@realtech\.cz<!--\/email_off--><\/p>\s*<\/noscript>/);
  assert.equal(
    (gdpr.match(/<!--email_off-->/g) ?? []).length,
    (gdpr.match(/<!--\/email_off-->/g) ?? []).length,
    "každé <!--email_off--> musí mít svůj konec",
  );
});

test("gdpr: kolo 35 — žádný e-mail mimo email_off (CF Email Obfuscation přepisuje i holý text na 404)", () => {
  // Živě 10. 9. 2026: v „Když nám napíšeš“ stál holý text info@realtech.cz
  // bez obalu a Cloudflare z něj udělal /cdn-cgi/l/email-protection#… (404
  // bez JS, nečitelné pro crawlery). Obfuscation bere i prostý text, ne
  // jen mailto — obalený musí být každý výskyt adresy v šabloně.
  const sablona = gdpr.slice(gdpr.indexOf("---", 3) + 3);
  const mimoObal = sablona.replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, "");
  assert.doesNotMatch(mimoObal, /[\w.+-]+@realtech\.cz/, "e-mail mimo <!--email_off-->…<!--/email_off-->");
  assert.match(
    gdpr,
    /Když pošleš e-mail na <!--email_off--><a href="mailto:info@realtech\.cz">info@realtech\.cz<\/a><!--\/email_off-->,/,
    "„Když nám napíšeš“ má e-mail jako mailto v email_off, stejně jako ostatní výskyty",
  );
  const onasMimoObal = onas.slice(onas.indexOf("---", 3) + 3).replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, "");
  assert.doesNotMatch(onasMimoObal, /[\w.+-]+@realtech\.cz/, "O nás: e-mail mimo email_off");
});

test("gdpr: newsletter — Kit jako zpracovatel, double opt-in, odhlášení, USA, odkaz na Kit privacy", () => {
  // Stránka popisuje formulář z Base.astro — ten musí pořád jít na Kit.
  assert.match(base, /action="https:\/\/app\.kit\.com\/forms\/\d+\/subscriptions"/);
  assert.match(gdpr, /<h2 id="newsletter">Newsletter<\/h2>/);
  assert.match(gdpr, /<strong>Kit<\/strong>/);
  assert.match(gdpr, /zpracovatel/i);
  assert.match(gdpr, /double opt-in/i);
  assert.match(gdpr, /Odhlášení jedním klikem/);
  assert.match(gdpr, /souhlas/i, "newsletter musí mít právní základ souhlas");
  assert.match(gdpr, /americká firma/, "Kit sídlí v USA — předání mimo EU se musí říct");
  assert.match(gdpr, /const KIT_PRIVACY = 'https:\/\/kit\.com\/privacy'/);
  assert.match(gdpr, /href=\{KIT_PRIVACY\}/);
});

test("gdpr: web — Cloudflare Pages, Web Analytics bez cookies, embedy jen ty, co v repu jsou", () => {
  assert.match(gdpr, /Cloudflare Pages/);
  assert.match(gdpr, /Cloudflare Web Analytics/);
  assert.match(base, /static\.cloudflareinsights\.com\/beacon\.min\.js/, "GDPR tvrdí, že měříme přes Cloudflare Web Analytics — beacon v Base chybí");
  assert.doesNotMatch(base, /googletagmanager|google-analytics|gtag\(/, "GDPR tvrdí, že Google Analytics nemáme");
  assert.match(gdpr, /youtube-nocookie\.com/);
  assert.match(gdpr, /giscus/);
  assert.match(gdpr, /href=\{CF_PRIVACY\}/);
  assert.match(gdpr, /href=\{UOOU\}/);
  assert.match(gdpr, /const UOOU = 'https:\/\/uoou\.gov\.cz\/'/);
});

test("gdpr: cookies — bez lišty, protože web sám cookies nenastavuje", () => {
  assert.match(gdpr, /<h2 id="cookies">Cookies<\/h2>/);
  assert.match(gdpr, /žádné cookies nenastavuje/);
  assert.doesNotMatch(base, /document\.cookie/, "Base nastavuje cookie — GDPR tvrdí opak");
  assert.doesNotMatch(gdpr, /nikomu nedáme/i, "stejné nepravdivé tvrzení, které kolo newsletteru vyhodilo");
});

test("gdpr: práva — přístup, oprava, výmaz, omezení, námitka, ÚOOÚ", () => {
  assert.match(gdpr, /<h2 id="prava">Tvoje práva<\/h2>/);
  for (const pravo of ["přístup", "opravit", "vymazat", "omezit", "námitku", "odvolat souhlas"]) {
    assert.match(gdpr, new RegExp(`<strong>${pravo}<\\/strong>`), `chybí právo „${pravo}“`);
  }
  assert.match(gdpr, /Úřad pro ochranu osobních údajů/);
});

test("gdpr: layout jako O nás — Base, about-wide, lower-third tag, h1, JSON-LD, indexovatelná", () => {
  assert.match(gdpr, /import Base from '\.\.\/layouts\/Base\.astro'/);
  assert.match(gdpr, /<section class="about about-wide wrap">/);
  assert.match(gdpr, /<div class="lower-third">\s*<span class="tag">Ochrana údajů<\/span>/);
  assert.equal((gdpr.match(/<h1>/g) ?? []).length, 1);
  assert.match(gdpr, /<Base title="Ochrana osobních údajů — REALTECH CZ" description=\{popis\}>/);
  assert.doesNotMatch(gdpr, /noindex/, "/gdpr/ má být indexovatelná");
  assert.match(gdpr, /'@type': 'WebPage'/);
  assert.match(gdpr, /'@type': 'BreadcrumbList'/);
  assert.match(gdpr, /about: \{ '@id': orgId \}/, "WebPage má ukazovat na Organization #org z /o-nas/");
  const layout = gdpr.indexOf('class="about-layout"');
  const main = gdpr.indexOf('class="about-main"');
  const aside = gdpr.indexOf('class="about-aside"');
  assert.ok(layout !== -1 && main > layout && aside > main, "Z10137 dvousloupec jako O nás");
  // Kolo 18: aria-label smí jen na prvek s rolí.
  for (const tag of gdpr.match(/<(?:div|span|p)\b[^>]*aria-label=[^>]*>/g) ?? []) {
    assert.match(tag, /\brole=/, `${tag} — aria-label na generickém prvku`);
  }
});

test("gdpr: odrážky v .about-main mají styl a odkazy stejnou afordanci jako odstavce", () => {
  assert.match(css, /\.about-main ul,\s*\n\.about-main ol \{[^}]*margin: 0 0 1\.1em 1\.4em/);
  const liA = css.match(/\.about-main li a \{([^}]+)\}/)?.[1] ?? "";
  assert.match(liA, /color:\s*var\(--signal-dark\)/);
  assert.match(liA, /text-decoration:\s*underline/);
});

test("gdpr: sitemap /gdpr/ nefiltruje (indexovatelná)", async () => {
  const { getSitemapOptions, setArticles } = await import("./test-sitemap-mocks/state.mjs");
  setArticles([{ filename: "platny.md", frontmatter: ['date: "2025-05-06"', 'category: "AI"'] }]);
  await import("../astro.config.mjs?sitemap-gdpr=1");
  const options = getSitemapOptions();
  assert.equal(options.filter("https://realtech.cz/gdpr/"), true);
  assert.equal(options.filter("https://realtech.cz/vitej/"), false);
});

test("gdpr: O nás u kontaktu zmíní provozovatele a odkáže na /gdpr/, e-mail zůstává 3×", () => {
  const kontakt = onas.slice(onas.indexOf('<h2 id="kontakt">'), onas.indexOf('<div class="hero-actions">'));
  assert.match(kontakt, /Daniel Jan Soukup \(živnost\), IČO 29973911, se sídlem v Netunicích/);
  assert.match(kontakt, /<a href="\/gdpr\/">Ochrana údajů<\/a>/);
  // kolo 26 počítá email_off přesně 3× — věta o provozovateli nesmí přidat další mailto.
  assert.equal((onas.match(/<!--email_off-->/g) ?? []).length, 3);
});
