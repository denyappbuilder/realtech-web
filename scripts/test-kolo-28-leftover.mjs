// Kolo 28: leftover po živém auditu 7. 9. 2026 (po kolech 26 #411, 27 #413
// a článku #412). Lighthouse + axe + měření posunu layoutu s blokovanými
// woff2 na úvodce, dvou článcích, archivu a O nás při 390/768/1024/1280px.
//
// P1: h1 článku (Archivo 850/108 %) swapoval bez size-adjust fallbacku —
//     cover (LCP článku) pod ním poskočil +31/+40/+49 px (768/1024/1280)
//     a −24 px (390) na každém článku; kolo 27 srovnalo jen hero úvodky.
// P1: body font stack měl system-ui hned za Plex Sans — na Linuxu (kde
//     běží i PageSpeed) DejaVu Sans, 1,13× širší; perex hero na 1024px
//     odskočil o řádek a s ním CTA i výpis. Arial/Roboto/Liberation Sans
//     jsou proti Plex Sans 0,98–1,01×.
// P1: kdo v ⌘K začal psát dřív, než dorazil search-index.json, viděl
//     „Nic nenalezeno“ až do dalšího stisku — po načtení indexu nikdo
//     výsledky nepřekreslil.
// P2: nápověda a „Nic nenalezeno“ stály UVNITŘ role=listbox jako <p>
//     (axe aria-required-children, critical) a čtečka o stavu nevěděla.
// P2: <section class="newsletter"> bez jména = mimo landmarky (axe region
//     ×3 na každé stránce).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { nactiModal } from "./test-search-modal-loader.mjs";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const base = cti("src/layouts/Base.astro");
const search = cti("src/components/SearchModal.astro");
const headers = cti("public/_headers");

function pravidlo(blok, selektor) {
  const shoda = blok.match(
    new RegExp(`(?:^|[}\\s/])${selektor.replaceAll(".", "\\.").replaceAll(" ", "\\s+")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

/** Jako pravidlo(), ale selektor musí stát na začátku pravidla (ne jako
 *  ocas `.a:hover .b {`) — .hero-rail-title má dřív hover pravidlo. */
function pravidloSamostatne(blok, selektor) {
  const shoda = blok.match(
    new RegExp(`(?:^|\\}|\\n)\\s*${selektor.replaceAll(".", "\\.").replaceAll(" ", "\\s+")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

function fontFace(rodina) {
  return css.match(new RegExp(`@font-face\\s*\\{([^}]*font-family:\\s*'${rodina}'[^}]*)\\}`))?.[1] ?? "";
}

/** Položka indexu v přesně tom tvaru, jaký posílá search-index.json.js. */
function polozka({ s, t, d = "Popis", k = "AI", b = "", p = "2025-04-05" }) {
  return { s, t, d, k, b, p };
}

function kliknuti(currentTarget) {
  return { currentTarget, target: currentTarget, preventDefault() {} };
}

// ── P1: fallback fonty proti CLS mimo hero ───────────────────────────────

test("kolo 28: 'Archivo Clanek Fallback' = lokální Arial Bold se size-adjust ≈ 114 %", () => {
  const face = fontFace("Archivo Clanek Fallback");
  assert.ok(face, "@font-face 'Archivo Clanek Fallback' v CSS chybí");
  assert.match(face, /src:\s*local\('Arial Bold'\),\s*local\('Arial'\)/, "Arial Bold první, jako u hero fallbacku");
  assert.match(face, /local\('Roboto Bold'\)/, "Android nemá Arial");
  assert.match(face, /local\('Liberation Sans Bold'\)/, "Linux (PageSpeed) má Liberation = metriky Arialu");
  assert.match(face, /font-weight:\s*100 1000\s*;/);
  const adjust = Number(face.match(/size-adjust:\s*([\d.]+)%/)?.[1]);
  assert.ok(adjust >= 113 && adjust <= 115.5, `size-adjust ${adjust}% — Archivo 850/108 % je proti Arial Bold medián 1,146× (98 titulků)`);
  assert.doesNotMatch(face, /url\(/, "fallback je jen local(), nic se nestahuje");
});

test("kolo 28: 'Archivo Karta Fallback' má vlastní size-adjust ≈ 105,6 % (750/105 %)", () => {
  const face = fontFace("Archivo Karta Fallback");
  assert.ok(face, "@font-face 'Archivo Karta Fallback' v CSS chybí");
  assert.match(face, /src:\s*local\('Arial Bold'\),\s*local\('Arial'\)/);
  assert.match(face, /font-weight:\s*100 1000\s*;/);
  const adjust = Number(face.match(/size-adjust:\s*([\d.]+)%/)?.[1]);
  assert.ok(adjust >= 105 && adjust <= 106.5, `size-adjust ${adjust}% — karty 750/105 % jsou proti Arial Bold medián 1,059× (98 titulků)`);
  const hero = Number(fontFace("Archivo Hero Fallback").match(/size-adjust:\s*([\d.]+)%/)?.[1]);
  const clanek = Number(fontFace("Archivo Clanek Fallback").match(/size-adjust:\s*([\d.]+)%/)?.[1]);
  assert.ok(hero > clanek && clanek > adjust, "tři rodiny, tři poměry: hero 870/110 > článek 850/108 > karta 750/105");
});

test("kolo 28: fallback článku berou všechny h1 s Archivo 850/108 % (článek, O nás, 404)", () => {
  for (const selektor of [".article-head h1", ".about h1", ".notfound h1"]) {
    const r = pravidlo(css, selektor);
    assert.ok(r, `${selektor} v CSS chybí`);
    assert.match(
      r,
      /font-family:\s*'Archivo Variable',\s*'Archivo Clanek Fallback',\s*'Archivo',\s*sans-serif\s*;/,
      `${selektor}: fallback musí být hned za Archivo Variable`,
    );
    assert.match(r, /font-weight:\s*850\s*;/, `${selektor} má jinou váhu než 850 — poměr 114,3 % by neseděl`);
    assert.match(r, /font-stretch:\s*108%\s*;/, `${selektor} má jinou šířku než 108 % — poměr 114,3 % by neseděl`);
  }
  const vyskyty = css.match(/'Archivo Clanek Fallback'/g) ?? [];
  assert.equal(vyskyty.length, 4, "@font-face + 3 selektory; jiná váha/šířka potřebuje jiný poměr");
});

test("kolo 28: fallback karet berou titulky karet, rail úvodky a video strip (750/105 %)", () => {
  const karta = pravidlo(css, ".card-body h2, .card-body h3");
  assert.match(karta, /font-family:\s*'Archivo Variable',\s*'Archivo Karta Fallback',\s*'Archivo',\s*sans-serif\s*;/);
  assert.match(karta, /font-weight:\s*750;\s*font-stretch:\s*105%/);
  for (const selektor of [".hero-rail-title", ".vc-title"]) {
    const r = pravidloSamostatne(css, selektor);
    assert.ok(r, `${selektor} v CSS chybí`);
    assert.match(r, /'Archivo Variable',\s*'Archivo Karta Fallback',\s*'Archivo',\s*sans-serif/, selektor);
    assert.match(r, /font-weight:\s*750\s*;/, `${selektor} musí zůstat 750, jinak poměr nesedí`);
    assert.match(r, /font-stretch:\s*105%\s*;/, `${selektor} musí zůstat 105 %, jinak poměr nesedí`);
  }
  const vyskyty = css.match(/'Archivo Karta Fallback'/g) ?? [];
  assert.equal(vyskyty.length, 4, "@font-face + karty + rail + video strip");
});

test("kolo 28: hero h1 drží svůj fallback z kola 27 (jiný poměr, jiná rodina)", () => {
  assert.match(pravidlo(css, ".hero h1"), /'Archivo Variable',\s*'Archivo Hero Fallback',\s*'Archivo',\s*sans-serif/);
  assert.doesNotMatch(pravidlo(css, ".hero h1"), /Clanek Fallback|Karta Fallback/);
});

test("kolo 28: body font stack má Arial, Roboto a Liberation Sans před system-ui", () => {
  const body = pravidlo(css, "body");
  assert.ok(body, "body v CSS chybí");
  assert.match(
    body,
    /font-family:\s*'IBM Plex Sans',\s*Arial,\s*Roboto,\s*'Liberation Sans',\s*system-ui,\s*sans-serif\s*;/,
    "system-ui je na Linuxu DejaVu Sans (Plex je 0,88× užší) — Arial/Roboto/Liberation jsou 0,98–1,01×",
  );
  // Plex Sans ≈ Arial, žádný size-adjust: fallback rodina s local() by
  // tu byla jen šum a rozbila tučné řezy (600 → syntetický bold).
  assert.equal(fontFace("Plex Sans Fallback"), "", "Plex Sans size-adjust nepotřebuje");
});

// ── P1: hledání — psaní dřív, než dorazí index ───────────────────────────

test("kolo 28: dotaz napsaný před doručením indexu se po načtení přehledá sám", async () => {
  const idx = [polozka({ s: "starship-14", t: "Starship Flight 14 míří na první orbitu" })];
  let uvolni;
  const modal = nactiModal({
    fetch: () => new Promise((resolve) => {
      uvolni = () => resolve({ ok: true, json: async () => idx });
    }),
  });

  const otevreni = modal.open(modal.spoustec);
  modal.input.value = "star";
  modal.input.dispatch("input");

  // Index ještě letí: žádné „Nic nenalezeno“, ale „Načítám“.
  assert.match(modal.hint.innerHTML, /Načítám články/);
  assert.doesNotMatch(modal.hint.innerHTML, /Nic nenalezeno/);
  assert.equal(modal.results.hidden, true);

  uvolni();
  await otevreni;
  await new Promise((r) => setImmediate(r));

  assert.match(modal.results.innerHTML, /href="\/clanky\/starship-14\/"/, "po doručení indexu se výsledky vykreslí bez dalšího stisku");
  assert.equal(modal.results.hidden, false);
  assert.equal(modal.input.getAttribute("aria-expanded"), "true");
  assert.equal(modal.hint.innerHTML, "1 výsledek");
  assert.equal(modal.hint.classList.contains("sr-only"), true, "počet je jen pro čtečku");
});

test("kolo 28: souběžné open() a psaní stáhnou index jen jednou", async () => {
  let fetchCount = 0;
  const modal = nactiModal({
    fetch: async () => {
      fetchCount++;
      return { ok: true, json: async () => [] };
    },
  });
  const otevreni = modal.open(modal.spoustec);
  modal.input.value = "a";
  modal.input.dispatch("input");
  modal.input.value = "ab";
  modal.input.dispatch("input");
  await otevreni;
  assert.equal(fetchCount, 1, "in-flight promise se sdílí");
  assert.match(modal.hint.innerHTML, /Nic nenalezeno/, "index prázdný → po doručení už Nic nenalezeno, ne Načítám");
});

test("kolo 28: když index selže, hlásí to stav a další stisk zkusí fetch znovu", async () => {
  let fetchCount = 0;
  const modal = nactiModal({
    fetch: async () => {
      fetchCount++;
      if (fetchCount === 1) throw new Error("výpadek");
      return { ok: true, json: async () => [polozka({ s: "ok", t: "Claude po výpadku" })] };
    },
  });
  await modal.open(modal.spoustec);
  assert.equal(modal.dejIndexSelhal(), true);

  modal.input.value = "claude";
  modal.input.dispatch("input");
  assert.match(modal.hint.innerHTML, /Index článků se nepodařilo načíst/, "ne „Načítám“ donekonečna, ne „Nic nenalezeno“");
  assert.equal(modal.hint.classList.contains("sr-only"), false);

  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.equal(fetchCount, 2, "druhý pokus proběhl při psaní, ne až po zavření modalu");
  assert.match(modal.results.innerHTML, /href="\/clanky\/ok\/"/);
  assert.equal(modal.dejIndexSelhal(), false);
});

test("kolo 28: zavřený modal se po doručení indexu nepřekresluje", async () => {
  let uvolni;
  const modal = nactiModal({
    fetch: () => new Promise((resolve) => {
      uvolni = () => resolve({ ok: true, json: async () => [polozka({ s: "x", t: "Starlink" })] });
    }),
  });
  const otevreni = modal.open(modal.spoustec);
  modal.input.value = "star";
  modal.input.dispatch("input");
  modal.close();
  uvolni();
  await otevreni;
  assert.equal(modal.results.hidden, true, "index dorazil po Escape — do zavřeného modalu se nekreslí");
  assert.equal(modal.results.innerHTML, "");
});

// ── P2: stav hledání pro čtečku, listbox jen s option ────────────────────

test("kolo 28: #search-hint je role=status vedle listboxu, listbox startuje hidden", () => {
  assert.match(search, /<p class="search-hint" id="search-hint" role="status"><\/p>\s*<div class="search-results" id="search-results" role="listbox" aria-label="Výsledky" hidden><\/div>/);
  assert.doesNotMatch(search, /innerHTML = `<p class="search-hint"/, "nápověda už nesmí jít do listboxu jako <p>");
  assert.match(search, /const hint = document\.getElementById\('search-hint'\);/);
});

test("kolo 28: s výsledky nese stav jen počet pro čtečku (.sr-only), listbox se ukáže", () => {
  const modal = nactiModal({ hledatelne: [] });
  const tri = [1, 2, 3].map((i) => polozka({ s: `s${i}`, t: `Titulek ${i}` }));
  modal.render(tri, "titulek");
  assert.equal(modal.results.hidden, false);
  assert.equal((modal.results.innerHTML.match(/role="option"/g) ?? []).length, 3);
  assert.equal(modal.hint.innerHTML, "3 výsledky");
  assert.equal(modal.hint.classList.contains("sr-only"), true);

  modal.render([], "");
  assert.equal(modal.hint.classList.contains("sr-only"), false, "nápověda je zase vidět");
  assert.equal(modal.results.hidden, true);
});

test("kolo 28: česká shoda počtu výsledků (1 výsledek, 2–4 výsledky, 5+ výsledků)", () => {
  const { textPoctuVysledku } = nactiModal({ hledatelne: [] });
  assert.equal(textPoctuVysledku(1), "1 výsledek");
  assert.equal(textPoctuVysledku(2), "2 výsledky");
  assert.equal(textPoctuVysledku(4), "4 výsledky");
  assert.equal(textPoctuVysledku(5), "5 výsledků");
  assert.equal(textPoctuVysledku(8), "8 výsledků");
});

test("kolo 28: .search-hint.sr-only nuluje padding (pořadí .sr-only vs .search-hint v CSS)", () => {
  assert.match(pravidlo(css, ".search-hint.sr-only"), /padding:\s*0\s*;/);
  assert.ok(css.indexOf(".sr-only {") < css.indexOf(".search-hint {"), "test předpokládá .sr-only před .search-hint");
});

// ── P2: newsletter jako landmark ─────────────────────────────────────────

test("kolo 28: newsletter <section> má aria-labelledby na svůj h2", () => {
  assert.match(base, /<section class="newsletter" id="newsletter" aria-labelledby="newsletter-nadpis">/);
  assert.match(base, /<h2 id="newsletter-nadpis">Tech bez marketingových řečí\.<br \/>Přímo do mailu\.<\/h2>/);
  assert.equal((base.match(/id="newsletter-nadpis"/g) ?? []).length, 1, "id musí být v Base jedinečné");
});

// ── Logo a cache beze změny ──────────────────────────────────────────────

test("kolo 28: logo drží aria-label z kola 22 — Lighthouse label-content-name-mismatch je tu vědomě", () => {
  // Bez aria-label čte Chrome flex položky s mezerami: „REAL TECH CZ — domů“.
  // Lighthouse audit je bez váhy; mluvené jméno „REALTECH CZ“ je lepší.
  const loga = base.match(/<a href="\/" class="logo" aria-label="REALTECH CZ — domů">/g) ?? [];
  assert.equal(loga.length, 2);
});

test("kolo 28: /images/* Cache-Control max-age=0 zůstává", () => {
  assert.match(headers, /^\/images\/\*\n\s+Cache-Control: public, max-age=0, must-revalidate$/m);
});
