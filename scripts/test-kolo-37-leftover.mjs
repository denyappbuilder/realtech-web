// Kolo 37: živý audit 12. 9. 2026 (úvodka, /clanky/, článek s embedem X,
// produkční CSS) proti kódu.
//
// P0: LCP cover úvodky šel ven s alt="" — jediný cover na webu bez altu
//     (karty i hlava článku titulek nesou). Kolo 29 ho z dobrého důvodu
//     schovalo před čtečkou (aria-hidden + tabindex=-1 na odkazu, titulek
//     se nečetl třikrát); aria-hidden schová i alt, takže titulek na <img>
//     čtečce nic nepřidá — ale vyhledávačům obrázků a čtenáři bez obrázků
//     (spadlé CDN) popis LCP obrázku dá.
// P1: hledání na úvodce bylo jen dialog ⌘K: bez JS mrtvé tlačítko a žádná
//     cesta k GET formuláři archivu (/clanky/?q=, kolo 36). Bez skriptu
//     stojí na místě tlačítka odkaz na archivní formulář; hlava dialogu je
//     sama GET formulář se stejným cílem a parametrem — Enter bez výsledku
//     pošle dotaz do archivu.
// P1: produkční CSS neslo 16 @font-face včetně vietnamského subsetu
//     Archivo (fontsource pro variabilní font subsetové entrypointy nemá).
//     Vlastní deklarace latin + latin-ext ze stejných woff2: −1 @font-face,
//     −363 B CSS (−78 B gzip), −34 464 B woff2 v dist/_astro.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { nactiModal } from "./test-search-modal-loader.mjs";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const uvodka = cti("src/pages/index.astro");
const base = cti("src/layouts/Base.astro");
const modalZdroj = cti("src/components/SearchModal.astro");
const fontyArchivo = cti("src/styles/fonts-archivo.css");
const fontsourceWdth = cti("node_modules/@fontsource-variable/archivo/wdth.css");

// ── P0: alt LCP coveru úvodky ────────────────────────────────────────────

test("kolo 37: cover úvodky nese titulek hero článku jako alt, odkaz zůstává pro čtečku skrytý", () => {
  const odkaz = uvodka.match(/<a [^>]*class="hero-visual"[^>]*>/)?.[0];
  assert.ok(odkaz, "odkaz .hero-visual na úvodce chybí");
  assert.match(odkaz, /aria-hidden="true"/, "bez aria-hidden by alt = h1 četl titulek třikrát (kolo 29)");
  assert.match(odkaz, /tabindex="-1"/);
  const img = uvodka.match(/class="hero-visual"[^>]*>[\s\S]*?(<img [^>]*>)/)?.[1];
  assert.ok(img, "<img> coveru úvodky chybí");
  assert.match(img, /alt=\{hero\.data\.title\}/, "LCP cover úvodky musí mít alt s titulkem");
  assert.doesNotMatch(img, /alt=""/, "živě 12. 9. 2026 šel LCP obrázek ven s alt=\"\"");
  assert.match(img, /fetchpriority="high"/, "LCP zůstává eager + high");
});

// ── P1: hledání bez JS ───────────────────────────────────────────────────

test("kolo 37: hlavička drží tlačítko ⌘K a bez JS ho nahradí odkaz na GET hledání v archivu", () => {
  assert.match(base, /<button class="search-trigger" data-search-open aria-label="Hledat v článcích \(⌘K\)"/, "tlačítko s dialogem zůstává (Space, role button)");
  const noscript = base.match(/<noscript>\s*<a class="search-trigger" href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*<\/noscript>/);
  assert.ok(noscript, "<noscript> s odkazem .search-trigger v hlavičce chybí");
  // Bez fragmentu: nový cíl #fragment v Base by chtěl scroll-margin-top
  // pod sticky hlavičkou (test-kolo-31) a .search-form archivu je nahoře i tak.
  assert.equal(noscript[1], "/clanky/", "odkaz vede na archiv s GET formulářem (kolo 36)");
  assert.match(noscript[0], /aria-label="Hledat v článcích"/, "odkaz bez textu potřebuje jméno");
  assert.doesNotMatch(noscript[0], /st-kbd|⌘K/, "klávesová zkratka bez skriptu nefunguje — nesmí se slibovat");
  assert.doesNotMatch(noscript[0], /data-search-open/, "odkaz nesmí chytit klientský handler dialogu");
});

test("kolo 37: <noscript><style> skrývá mrtvé tlačítko a stojí v <head>, kde <style> v noscript smí být", () => {
  // Komentáře {/* … */} v Base zmiňují <body> i <noscript><style> — pryč s nimi, než se markup dělí.
  const bezKomentaru = base.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const head = bezKomentaru.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  assert.match(head, /<noscript><style>\.search-trigger\[data-search-open\]\{display:none\}<\/style><\/noscript>/);
  const body = bezKomentaru.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
  for (const noscript of body.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)) {
    assert.doesNotMatch(noscript[1], /<style/, "<style> v <noscript> mimo <head> validátor neuznává");
  }
});

test("kolo 37: hlava dialogu ⌘K je GET formulář na /clanky/ s polem q — stejný cíl jako .search-form archivu", () => {
  const form = modalZdroj.match(/<form class="search-head"([^>]*)>/)?.[1];
  assert.ok(form, "<form class=\"search-head\"> v SearchModal.astro chybí");
  assert.match(form, /action="\/clanky\/"/);
  assert.match(form, /method="get"/);
  assert.doesNotMatch(modalZdroj, /<div class="search-head">/, "hlava už není holý <div>");
  const input = modalZdroj.match(/<input\s+type="search"\s+id="search-q"[\s\S]*?\/>/)?.[0] ?? "";
  assert.match(input, /\bname="q"/, "pole musí mít name=q, jinak GET nic nepošle");
  assert.match(input, /role="combobox"/, "combobox z kola 28 zůstává");
  const esc = modalZdroj.match(/<button [^>]*class="search-esc"[^>]*>/)?.[0] ?? "";
  assert.match(esc, /type="button"/, "tlačítko ESC ve formuláři nesmí odesílat");
  assert.match(modalZdroj, /<\/button>\s*<\/form>/, "formulář končí za tlačítkem ESC — jediné textové pole = implicitní odeslání Enterem");
});

const VYSLEDKY = [
  { s: "claude-opus-5", t: "Claude Opus 5", d: "", k: "AI Report", b: "", p: "2026-09-01" },
];

function submit(modal) {
  let zastaveno = false;
  modal.form.dispatch("submit", { preventDefault() { zastaveno = true; } });
  return zastaveno;
}

test("kolo 37: Enter bez výsledku pošle dotaz na /clanky/?q= (encodeURIComponent), prázdné pole nikam", () => {
  const modal = nactiModal({ hledatelne: [] });
  modal.overlay.hidden = false;
  modal.input.value = "  Starlink v Česku ";
  assert.equal(submit(modal), true, "nativní GET se zastaví a naviguje skript");
  assert.equal(modal.sandbox.location.href, "/clanky/?q=Starlink%20v%20%C4%8Cesku");

  const prazdny = nactiModal({ hledatelne: [] });
  prazdny.overlay.hidden = false;
  prazdny.input.value = "   ";
  assert.equal(submit(prazdny), true);
  assert.equal(prazdny.sandbox.location.href, "", "prázdný dotaz do archivu neposílat");
});

test("kolo 37: Enter s aktivním výsledkem otvírá článek (keydown z kola 32) a submit ho nepředběhne archivem", () => {
  const modal = nactiModal({ hledatelne: VYSLEDKY });
  modal.overlay.hidden = false;
  modal.input.value = "claude";
  modal.nastavCurrent(VYSLEDKY);
  modal.nastavActive(0);
  for (const fn of modal.dokument.posluchaci.get("keydown") ?? []) {
    fn({ preventDefault() {}, metaKey: false, ctrlKey: false, shiftKey: false, key: "Enter", target: modal.input });
  }
  assert.equal(modal.sandbox.location.href, "/clanky/claude-opus-5/");
  assert.equal(submit(modal), true, "implicitní odeslání formuláře se musí zastavit");
  assert.equal(modal.sandbox.location.href, "/clanky/claude-opus-5/", "submit nesmí přepsat cíl na archiv");
});

test("kolo 37: past fokusu z #443 formulář nemění — <form> není fokusovatelný a selektor zůstává", () => {
  assert.match(
    modalZdroj,
    /'a\[href\], button:not\(\[disabled\]\), input:not\(\[disabled\]\), select:not\(\[disabled\]\), ' \+\s*'textarea:not\(\[disabled\]\), \[tabindex\]:not\(\[tabindex="-1"\]\)'/,
  );
  assert.doesNotMatch(modalZdroj, /<form[^>]*tabindex/, "formulář nesmí být zastávkou tabulátoru");
});

// ── P1: Archivo bez vietnamského subsetu ─────────────────────────────────

/** @font-face bloky souboru jako pole textů. */
const fontFaces = (css) => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
const vlastnost = (blok, nazev) => blok.match(new RegExp(`${nazev}:\\s*([^;]+);`))?.[1].trim();

test("kolo 37: Base importuje vlastní fonts-archivo.css místo wdth.css s vietnamštinou", () => {
  assert.match(base, /import '\.\.\/styles\/fonts-archivo\.css';/);
  assert.doesNotMatch(base, /@fontsource-variable\/archivo\/wdth\.css/);
  assert.equal(fontFaces(fontsourceWdth).length, 3, "fontsource wdth.css = vietnamese + latin-ext + latin; při změně srovnat fonts-archivo.css");
});

test("kolo 37: fonts-archivo.css = přesně latin-ext + latin z fontsource wdth.css, bez vietnamese", () => {
  const nase = fontFaces(fontyArchivo);
  assert.equal(nase.length, 2);
  for (const blok of nase) assert.doesNotMatch(blok, /vietnamese/, "vietnamský subset se nesmí vrátit");
  const puvodni = fontFaces(fontsourceWdth).filter((b) => !/vietnamese/.test(b));
  assert.equal(puvodni.length, 2);
  for (const [i, blok] of nase.entries()) {
    const vzor = puvodni[i];
    for (const p of ["font-family", "font-style", "font-display", "font-weight", "font-stretch", "unicode-range"]) {
      assert.equal(vlastnost(blok, p), vlastnost(vzor, p), `${p} v bloku ${i + 1} se liší od fontsource`);
    }
    const soubor = vlastnost(vzor, "src").match(/\/files\/([^)'"]+)/)?.[1];
    assert.ok(soubor);
    assert.equal(
      vlastnost(blok, "src"),
      `url('@fontsource-variable/archivo/files/${soubor}') format('woff2-variations')`,
      "woff2 jde přímo z balíčku — žádná kopie v public/",
    );
  }
  assert.match(nase[0], /latin-ext/, "latin-ext první — priorita překrývajících se unicode-range (U+0304, U+0308, U+0329)");
  assert.match(nase[1], /archivo-latin-wdth-normal/);
});
