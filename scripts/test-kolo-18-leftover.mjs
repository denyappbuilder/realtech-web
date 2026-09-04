// Kolo 18 (poslední vylepšovací kolo) — leftover z živého auditu 4. 9. 2026
// (homepage, /clanky/, dva nejnovější články, /temata/, /o-nas/; light + dark;
// 390/768/1280). Web už měl LCP eager, Article/Breadcrumb JSON-LD i
// reduced-motion; zbývaly drobnosti přístupnosti a jeden reálný bug
// s theme-color. Šablony hlídáme jako text, stejně jako kolo 12–17.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chybaTvaruImage } from "../src/lib/image-cesta.js";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const base = cti("src/layouts/Base.astro");
const index = cti("src/pages/index.astro");
const oNas = cti("src/pages/o-nas.astro");
const archiv = cti("src/components/ArticleArchivePage.astro");
const validator = cti("scripts/validate-content.mjs");

function blokMedia(dotaz) {
  const start = css.search(new RegExp(`@media\\s*${dotaz}\\s*\\{`));
  if (start < 0) return "";
  let hloubka = 0;
  for (let i = css.indexOf("{", start); i < css.length; i += 1) {
    if (css[i] === "{") hloubka += 1;
    else if (css[i] === "}") {
      hloubka -= 1;
      if (hloubka === 0) return css.slice(start, i + 1);
    }
  }
  return "";
}

// ── A11y: aria-label smí jen na prvek s rolí (axe aria-prohibited-attr) ──

test("kolo 18: ticker na úvodce je <nav> s aria-label, ne pojmenovaný <div>", () => {
  assert.match(index, /<nav class="ticker" aria-label="Nejnovější články">/);
  assert.doesNotMatch(index, /<div class="ticker"/, "aria-label na <div> bez role čtečky ignorují");
  const nav = index.slice(index.indexOf('<nav class="ticker"'));
  const konec = nav.indexOf("</nav>");
  assert.ok(konec > -1, "ticker musí <nav> i zavřít");
  assert.ok(konec < nav.indexOf("<section class=\"hero\">"), "</nav> tickeru musí skončit před herem");
});

test("kolo 18: statistiky na O nás jsou seznam <ul role=list>, ne pojmenovaný <div>", () => {
  assert.match(oNas, /<ul class="stats" role="list" aria-label="Kanál v číslech">/);
  assert.doesNotMatch(oNas, /<div class="stats"/);
  assert.doesNotMatch(oNas, /<div class="stat">/, "položky statistik musí být <li>");
  assert.equal((oNas.match(/<li class="stat">/g) ?? []).length, 3);
  assert.match(css, /\.stats\s*\{[^}]*list-style:\s*none/, ".stats jako <ul> nesmí kreslit odrážky");
});

test("kolo 18: žádný <div>/<span>/<p> bez role nenese aria-label", () => {
  for (const [nazev, zdroj] of [
    ["index.astro", index],
    ["o-nas.astro", oNas],
    ["Base.astro", base],
    ["ArticleArchivePage.astro", archiv],
    ["clanky/[...id].astro", cti("src/pages/clanky/[...id].astro")],
    ["temata/index.astro", cti("src/pages/temata/index.astro")],
    ["TemaPage.astro", cti("src/components/TemaPage.astro")],
    ["SearchModal.astro", cti("src/components/SearchModal.astro")],
  ]) {
    for (const tag of zdroj.match(/<(?:div|span|p)\b[^>]*aria-label=[^>]*>/g) ?? []) {
      assert.match(tag, /\brole=/, `${nazev}: ${tag} — aria-label na generickém prvku`);
    }
  }
});

// ── theme-color: uložené téma musí obarvit rám prohlížeče hned ─────────

test("kolo 18: theme-color se srovná s uloženým tématem už při načtení, ne až po kliku", () => {
  const skript = base.slice(base.lastIndexOf("<script>"));
  const definice = skript.indexOf("const nastavThemeColor");
  const priNacteni = skript.indexOf("if (document.documentElement.dataset.theme) nastavThemeColor();");
  const klik = skript.indexOf("toggle?.addEventListener('click'");
  assert.ok(definice > -1, "helper nastavThemeColor chybí");
  assert.ok(priNacteni > definice, "volání při načtení musí být až za definicí helperu");
  assert.ok(priNacteni < klik, "volání při načtení musí být mimo click handler, před ním");
  assert.match(
    base,
    /<meta name="theme-color" content="#F6F7F9" media="\(prefers-color-scheme: light\)"/,
    "první nátěr dál drží media theme-color (kolo 12)",
  );
});

// ── Formulář, fokus, oznámení ─────────────────────────────────────────

test("kolo 18: e-mail v newsletteru má autocomplete=email (WCAG 1.3.5)", () => {
  const vstup = base.match(/<input type="email"[^>]*>/)?.[0];
  assert.ok(vstup, "newsletter <input type=email> chybí");
  assert.match(vstup, /autocomplete="email"/);
  assert.match(vstup, /aria-label="Tvůj e-mail"/, "jméno pole zůstává");
});

test("kolo 18: hledání (⌘K) má viditelný fokus i s outline: none na poli", () => {
  assert.match(css, /#search-q\s*\{[^}]*outline:\s*none/, "test hlídá právě tuhle kombinaci");
  assert.match(
    css,
    /\.search-head:focus-within\s*\{[^}]*var\(--signal\)/,
    "hlavička modalu musí fokus v poli ukázat signální barvou",
  );
});

test("kolo 18: archiv hlásí „Nic nenalezeno“ jako role=status, stejně jako načítání", () => {
  assert.match(archiv, /<p class="filter-empty" role="status" hidden>/);
  assert.match(archiv, /<p class="filter-loading" role="status" hidden>/);
});

// ── Dark mode: nativní UA prvky (audio, search křížek, posuvníky) ─────

test("kolo 18: color-scheme sleduje tokeny — light v :root, dark v obou tmavých blocích", () => {
  const rootBlok = css.match(/^:root\s*\{([^}]+)\}/m)?.[1] ?? "";
  assert.match(rootBlok, /color-scheme:\s*light/, ":root musí deklarovat color-scheme: light");
  const system = blokMedia("\\(prefers-color-scheme: dark\\)");
  assert.match(system, /:root:not\(\[data-theme="light"\]\)\s*\{[^}]*color-scheme:\s*dark/, "systémový dark bez color-scheme: dark");
  const forced = css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(forced, /color-scheme:\s*dark/, "forced dark bez color-scheme: dark");
  assert.match(forced, /--bg:\s*#0F1216/, "tokeny forced dark zůstávají");
});

// ── Článek: Audio přehled nesmí sedět nalepený na coveru ──────────────

test("kolo 18: .audio-prehled má horní odstup ve stejném rytmu jako cover a tělo", () => {
  const karta = css.match(/\.audio-prehled\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(karta, /margin:\s*28px auto 36px/, "desktop: 28px nad kartou (jako .article-hero/.article-layout)");
  const mobil = blokMedia("\\(max-width: 580px\\)");
  assert.match(
    mobil,
    /\.audio-prehled\s*\{[^}]*margin-top:\s*20px[^}]*margin-bottom:\s*20px/,
    "mobil: 20px nad kartou (jako .article-hero pod 580px)",
  );
  assert.match(css, /\.article-hero\s*\{\s*margin:\s*28px 0 0/, "rytmus .article-hero se nezměnil");
});

// ── Tisk ─────────────────────────────────────────────────────────────

test("kolo 18: tisk skrývá kotvy nadpisů a skip link", () => {
  const tisk = blokMedia("print");
  assert.ok(tisk, "@media print chybí");
  const skryte = tisk.match(/([^{}]+)\{\s*display:\s*none\s*!important;?\s*\}/)?.[1] ?? "";
  for (const selektor of [".heading-anchor", ".skip-link", ".read-progress"]) {
    assert.ok(skryte.includes(selektor), `${selektor} musí být v tisku skrytý`);
  }
  assert.match(tisk, /\.article-body a::after\s*\{\s*content: " \(" attr\(href\) "\)"/, "tisk dál doplňuje href k odkazům");
});

// ── Validátor obsahu: uzavřené TODO ─────────────────────────────────────

test("kolo 18: traversal je jen celý segment `..`, dvě tečky v názvu projdou", () => {
  assert.equal(chybaTvaruImage("/images/clanky/nahled..final.jpg"), null);
  for (const image of ["/images/clanky/../tajne.jpg", "/images/clanky/..\\tajne.jpg", "/../package.json"]) {
    assert.equal(chybaTvaruImage(image), `image "${image}" nemá povolený tvar`, image);
  }
});

test("kolo 18: validátor vidí interní odkaz i s cílem v úhlových závorkách", () => {
  assert.match(validator, /\\\]\\\(<\?\\\/clanky\\\/\(\[\^\/\)#\?>\]\+\)/, "regex musí přijmout `](</clanky/x/>)`");
});

test("kolo 18: v testech nezůstal žádný TODO, který už prochází", () => {
  // Zbývající TODO (IndexNow XML/URL/KEY) jsou skutečně neimplementované —
  // ty tu záměrně nehlídáme. Hlídáme jen, že se zpět nevrátily ty uzavřené.
  for (const [soubor, vzor] of [
    ["scripts/test-validate-content.mjs", /todo:/],
    ["scripts/test-rss-edge-cases.mjs", /todo:/],
    ["scripts/test-image-cesta.mjs", /todo:/],
  ]) {
    assert.doesNotMatch(cti(soubor), vzor, `${soubor} má zpět TODO flag`);
  }
});
