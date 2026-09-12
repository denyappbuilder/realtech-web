// Kolo 38: leftover po kole 37 — živý audit 12. 9. 2026 (po #448,
// /_astro/index.uxu0SAnY.css) proti kódu. Žádné P0, žádná regrese.
//
// P1: 10 @font-face IBM Plex Sans/Mono nemělo unicode-range (subsetové
//     entrypointy fontsource latin-400.css… ho nenesou), Archivo ano.
//     Prohlížeč tak tahal latin-ext i latin řez každé váhy i pro čistě
//     ASCII text. fonts-plex.css = tytéž soubory s rozsahy z kombinovaných
//     entrypointů fontsource (400.css) — žádný vlastní subset.
// P1: „Zrušit filtr“ na /clanky/?q= a ?kat= zůstávalo `hidden`, dokud ho
//     neodkryl skript — bez JS nikdy. Edge tlačítko odkryje a vedle něj
//     vloží <noscript> odkaz na /clanky/; tlačítko bez JS schová
//     <noscript><style> v <head>.
// P1 (přeskočeno): <link rel=preload as=font> pro Archivo — hero H1 má
//     font-display: swap a LCP je cover; 176 kB (latin-ext 86 + latin 90)
//     s vysokou prioritou by soupeřilo s CSS a LCP obrázkem. Není to
//     jasná výhra, preload se nepřidává.
// P2: prefers-reduced-motion — .live-dot i .x-facade-spinner už zastavuje
//     globální vypínač (*, *::before, *::after { animation: none !important })
//     z hlavičky global.css; hypotéza auditu se nepotvrdila, test to hlídá.
// P2: klient na straně vyfiltrované edgem (data-filtr-edge) index při
//     startu nestahuje (108 kB / 38 kB gzip) — filtr až s první interakcí.
// P2: „Kopírovat odkaz“ bez JS: tlačítko se schová, <noscript> nese odkaz
//     na článek.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

import { ODKAZ_ZRUSIT_FILTR, escapeHtml } from "../src/lib/archiv-filtr.js";
import { handleryFiltru } from "../functions/clanky/index.js";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const base = cti("src/layouts/Base.astro");
const fontyPlex = cti("src/styles/fonts-plex.css");
const archiv = cti("src/components/ArticleArchivePage.astro");
const edge = cti("functions/clanky/index.js");
const clanek = cti("src/pages/clanky/[...id].astro");
const css = cti("src/styles/global.css");

// ── P1: Plex s unicode-range ─────────────────────────────────────────────

/** @font-face bloky souboru jako pole textů. */
const fontFaces = (zdroj) => [...zdroj.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
const vlastnost = (blok, nazev) => blok.match(new RegExp(`${nazev}:\\s*([^;]+);`))?.[1].trim();

/** Fontsource kombinované entrypointy, které nesou unicode-range: jen latin-ext + latin. */
const PLEX = [
  ["ibm-plex-sans", "IBM Plex Sans", [400, 500, 600]],
  ["ibm-plex-mono", "IBM Plex Mono", [400, 500]],
];

test("kolo 38: Base importuje fonts-plex.css místo subsetových entrypointů fontsource bez unicode-range", () => {
  assert.match(base, /import '\.\.\/styles\/fonts-plex\.css';/);
  assert.doesNotMatch(base, /@fontsource\/ibm-plex-(?:sans|mono)\//, "latin-400.css & spol. unicode-range nenesou");
  const importy = [...base.matchAll(/^import '([^']+\.css)';/gm)].map((m) => m[1]);
  assert.deepEqual(importy, [
    "../styles/fonts-archivo.css",
    "../styles/fonts-plex.css",
    "../styles/global.css",
    "../styles/editorial.css",
  ], "fonty před global.css jako dřív");
  for (const [balicek, , vahy] of PLEX) {
    for (const vaha of vahy) {
      const subset = cti(`node_modules/@fontsource/${balicek}/latin-${vaha}.css`);
      assert.doesNotMatch(subset, /unicode-range/, `fontsource ${balicek}/latin-${vaha}.css už unicode-range má — fonts-plex.css se dá vrátit k importům`);
    }
  }
});

test("kolo 38: fonts-plex.css = přesně latin-ext + latin z fontsource {400,500,600}.css, včetně unicode-range a pořadí", () => {
  // Komentář v hlavičce nesmí předčasně skončit (`*/` uvnitř textu, třeba
  // ve vzoru cesty „ibm-plex-*/400.css“) — zbytek by se stal neplatným
  // selektorem a spolkl první @font-face (Sans 400 latin-ext → české
  // glyfy těla z Arialu). Po odstranění komentářů musí zbýt jen @font-face.
  const bezKomentaru = fontyPlex.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  assert.match(bezKomentaru, /^@font-face/, "před prvním @font-face zůstal text mimo komentář");
  assert.equal((bezKomentaru.match(/\*\//g) ?? []).length, 0, "osamocené */ mimo komentář");
  const nase = fontFaces(fontyPlex);
  assert.equal(nase.length, 10, "Sans 400/500/600 + Mono 400/500, každý latin-ext + latin");
  assert.equal((bezKomentaru.match(/@font-face/g) ?? []).length, 10);
  let i = 0;
  for (const [balicek, rodina, vahy] of PLEX) {
    for (const vaha of vahy) {
      const kombinovany = fontFaces(cti(`node_modules/@fontsource/${balicek}/${vaha}.css`));
      const latinExt = kombinovany.find((b) => /latin-ext-/.test(b));
      const latin = kombinovany.find((b) => new RegExp(`${balicek}-latin-${vaha}`).test(b));
      assert.ok(latinExt && latin, `fontsource ${balicek}/${vaha}.css nemá latin-ext/latin blok`);
      assert.ok(kombinovany.indexOf(latinExt) < kombinovany.indexOf(latin), "fontsource: latin-ext před latin");
      for (const [vzor, subset] of [[latinExt, "latin-ext"], [latin, "latin"]]) {
        const blok = nase[i++];
        assert.match(blok, new RegExp(`${balicek}-${subset}-${vaha}-normal`), `blok ${i} má být ${subset} ${vaha}`);
        assert.equal(vlastnost(blok, "font-family"), `'${rodina}'`);
        for (const p of ["font-style", "font-display", "font-weight", "unicode-range"]) {
          assert.equal(vlastnost(blok, p), vlastnost(vzor, p), `${p} v bloku ${i} se liší od fontsource ${balicek}/${vaha}.css`);
        }
        assert.ok(vlastnost(blok, "unicode-range"), "unicode-range je celý smysl souboru");
        assert.equal(
          vlastnost(blok, "src"),
          `url('@fontsource/${balicek}/files/${balicek}-${subset}-${vaha}-normal.woff2') format('woff2'), url('@fontsource/${balicek}/files/${balicek}-${subset}-${vaha}-normal.woff') format('woff')`,
          "woff2 + woff přímo z balíčku jako ve fontsource — žádná kopie v public/",
        );
      }
    }
  }
  assert.doesNotMatch(fontyPlex, /cyrillic|greek|vietnamese/, "jen latin + latin-ext (kolo 37)");
});

// ── P1: Zrušit filtr bez JS ──────────────────────────────────────────────

/** Falešný element HTMLRewriteru — jen to, co handlery volají. */
function element(attrs = {}) {
  return {
    attrs: new Map(Object.entries(attrs)),
    za: [],
    getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; },
    setAttribute(n, v) { this.attrs.set(n, String(v)); },
    removeAttribute(n) { this.attrs.delete(n); },
    after(html, opts) { this.za.push([html, opts]); },
    onEndTag() {},
  };
}

test("kolo 38: edge odkryje tlačítko Zrušit filtr a vloží za něj <noscript> odkaz na čistý archiv", () => {
  const h = new Map(handleryFiltru({ vybrane: [], prvniSlug: undefined, kat: "Drony", q: "" }));
  const reset = element({ type: "button", class: "btn-ghost filter-reset", hidden: "" });
  h.get(".filter-reset").element(reset);
  assert.equal(reset.getAttribute("hidden"), null, "živě 12. 9. 2026 zůstávalo hidden do doběhnutí skriptu");
  assert.deepEqual(reset.za, [[ODKAZ_ZRUSIT_FILTR, { html: true }]]);
});

test("kolo 38: ODKAZ_ZRUSIT_FILTR je <noscript> s odkazem a.filter-reset na /clanky/, ne tlačítko", () => {
  assert.match(ODKAZ_ZRUSIT_FILTR, /^<noscript><a class="btn-ghost filter-reset" href="\/clanky\/">Zrušit filtr<\/a><\/noscript>$/);
  assert.doesNotMatch(ODKAZ_ZRUSIT_FILTR, /<button|type="button"|data-cat/);
  assert.match(edge, /import \{\s*ODKAZ_ZRUSIT_FILTR,/, "edge bere odkaz z archiv-filtr.js (jediný zdroj)");
});

test("kolo 38: archiv bez JS schová jen tlačítko (button.filter-reset), odkaz z edge zůstává; SSR tlačítko dál hidden", () => {
  assert.match(
    archiv,
    /\{page === 1 && <noscript slot="head"><style is:inline>button\.filter-reset\{display:none\}<\/style><\/noscript>\}/,
    "<style> v <noscript> smí stát jen v <head> (kolo 37)",
  );
  assert.doesNotMatch(archiv, /<style[^>]*>[^<]*(?<!button)\.filter-reset\{display:none\}/, "holé .filter-reset by schovalo i odkaz");
  assert.match(archiv, /<button type="button" class="btn-ghost filter-reset" hidden>Zrušit filtr<\/button>/, "bez filtru není co rušit — odkrývá edge / skript");
  assert.match(archiv, /reset\?\.toggleAttribute\('hidden', true\);/, "čistý filtr tlačítko zase schová (skript)");
  assert.match(archiv, /\{page === 1 && <noscript slot="head"><style is:inline>\.filter-bar \.cat-filter\[role="group"\]\{display:none\}<\/style><\/noscript>\}/, "noscript čipů z kola 37 zůstává");
});

// ── P2: klient nestahuje index, když už filtroval edge ───────────────────

/** Klientský skript archivu v holém DOM; vrací počet fetchů indexu. */
function spustArchiv({ search, filtrEdge }) {
  class Prvek {
    constructor(tag, attrs = {}) {
      this.tagName = tag.toUpperCase();
      this.attrs = new Map(Object.entries(attrs));
      this.children = [];
      this.parent = null;
      this.listeners = new Map();
      this.textContent = "";
      this.value = "";
      this.classList = {
        add: (n) => this.setAttribute("class", `${this.getAttribute("class") ?? ""} ${n}`.trim()),
        remove: (n) => this.setAttribute("class", (this.getAttribute("class") ?? "").split(/\s+/).filter((c) => c && c !== n).join(" ")),
      };
    }
    set className(v) { this.setAttribute("class", v); }
    get className() { return this.getAttribute("class") ?? ""; }
    getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; }
    setAttribute(n, v) { this.attrs.set(n, String(v)); }
    removeAttribute(n) { this.attrs.delete(n); }
    hasAttribute(n) { return this.attrs.has(n); }
    toggleAttribute(n, force) {
      const on = force === undefined ? !this.attrs.has(n) : force;
      if (on) this.setAttribute(n, ""); else this.removeAttribute(n);
      return on;
    }
    append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this); }
    addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]); }
    dispatch(type) { for (const fn of this.listeners.get(type) ?? []) fn({ type, target: this, preventDefault() {} }); }
    focus() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }

  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const js = ts.transpileModule(skript, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

  const chipVse = new Prvek("button", { class: "chip active", "data-cat": "", "aria-pressed": "true" });
  const chipDrony = new Prvek("button", { class: "chip", "data-cat": "Drony", "aria-pressed": "false" });
  const chipy = [chipVse, chipDrony];
  const grid = new Prvek("div", { id: "articles-grid", "aria-busy": "false", "data-sizes": "", ...(filtrEdge ? { "data-filtr-edge": "" } : {}) });
  const naStrane = new Prvek("article", { class: "card", "data-slug": "na-strane", "data-category": "AI Report", hidden: "" });
  const zEdge = new Prvek("article", { class: "card", "data-slug": "z-edge", "data-category": "Drony", "data-from-index": "" });
  grid.append(naStrane, zEdge);
  const reset = new Prvek("button", { class: "btn-ghost filter-reset" });
  const pole = new Prvek("input", { id: "art-search" });
  const count = new Prvek("p", { "data-filter-count": "", "data-vychozi": "Zobrazeno 1–15 z 40 článků" });
  const pagination = new Prvek("nav", { class: "archive-pagination", hidden: "" });

  const document = {
    createElement: (tag) => new Prvek(tag),
    getElementById: (id) => ({ "articles-grid": grid, "art-search": pole })[id] ?? null,
    querySelector: (sel) => ({
      ".filter-reset": reset,
      "[data-filter-count]": count,
      ".archive-pagination": pagination,
      ".chip.active": chipy.find((c) => (c.getAttribute("class") ?? "").includes("active")) ?? null,
    })[sel] ?? null,
    querySelectorAll: (sel) => {
      if (sel === ".cat-filter .chip") return chipy;
      if (sel === "#articles-grid .card") return [...grid.children];
      throw new Error(`Neočekávaný selektor: ${sel}`);
    },
  };
  const casovace = [];
  let fetchu = 0;
  const INDEX = [
    { s: "na-strane", t: "Na straně", d: "", k: "AI Report", b: "", p: "2026-09-01" },
    { s: "z-edge", t: "Z edge", d: "", k: "Drony", b: "", p: "2026-08-01" },
  ];
  const historie = [];
  vm.runInNewContext(js, {
    document,
    window: { setTimeout(fn) { casovace.push(fn); return casovace.length; }, clearTimeout() {} },
    fetch: async () => { fetchu += 1; return { ok: true, json: async () => INDEX }; },
    URLSearchParams,
    location: { pathname: "/clanky/", search },
    history: { replaceState(_s, _t, url) { historie.push(url); } },
  }, { filename: "ArticleArchivePage.client.js" });

  const dobehni = async () => {
    for (let i = 0; i < 20; i++) {
      while (casovace.length) casovace.shift()();
      await new Promise((r) => setImmediate(r));
    }
  };
  return { chipy, grid, pole, reset, count, pagination, historie, dobehni, fetchu: () => fetchu, html: (el) => `<${el.tagName.toLowerCase()}${[...el.attrs].map(([k, v]) => ` ${k}="${escapeHtml(v)}"`).join("")}>` };
}

test("kolo 38: edge značí mřížku data-filtr-edge — jen na vyfiltrované straně", () => {
  const h = new Map(handleryFiltru({ vybrane: [], prvniSlug: undefined, kat: "Drony", q: "" }));
  const grid = element({ id: "articles-grid", "data-sizes": "" });
  h.get("#articles-grid").element(grid);
  assert.equal(grid.getAttribute("data-filtr-edge"), "");
  assert.doesNotMatch(archiv, /data-filtr-edge=/, "statické HTML značku nenese — jen edge, který opravdu filtroval");
});

test("kolo 38: s data-filtr-edge klient při startu index nestahuje, stav z edge nechá stát a chip/pole srovná", async () => {
  const dom = spustArchiv({ search: "?kat=Drony", filtrEdge: true });
  await dom.dobehni();
  assert.equal(dom.fetchu(), 0, "search-index.json se při startu nesmí stahovat — edge už filtroval");
  assert.equal(dom.grid.children.length, 2, "karta z edge (data-from-index) zůstává");
  assert.equal(dom.grid.children[0].getAttribute("hidden"), "", "karta mimo výběr zůstává hidden z edge");
  assert.equal(dom.chipy[1].getAttribute("aria-pressed"), "true", "aktivní čip se srovná s URL i bez apply()");
  assert.deepEqual(dom.historie, [], "URL už odpovídá filtru — replaceState není třeba");
});

test("kolo 38: bez značky (edge neběžel) klient filtruje hned jako dřív", async () => {
  const dom = spustArchiv({ search: "?kat=Drony", filtrEdge: false });
  await dom.dobehni();
  assert.equal(dom.fetchu(), 1, "bez edge musí index stáhnout a filtrovat klient");
  assert.deepEqual(dom.historie, ["?kat=Drony"]);
});

test("kolo 38: první interakce na straně z edge index stáhne a filtruje; Zrušit filtr karty z edge uklidí bez indexu", async () => {
  const dom = spustArchiv({ search: "?kat=Drony", filtrEdge: true });
  await dom.dobehni();
  dom.chipy[0].dispatch("click");
  await dom.dobehni();
  assert.equal(dom.fetchu(), 0, "čistý filtr (Vše) index nepotřebuje");
  assert.equal(dom.grid.children.length, 1, "karta z edge pryč");
  assert.equal(dom.grid.children[0].getAttribute("hidden"), null, "SSR karta zase vidět");
  assert.equal(dom.reset.getAttribute("hidden"), "", "tlačítko odkryté edgem skript při čistém filtru schová");
  assert.equal(dom.pagination.getAttribute("hidden"), null);
  assert.equal(dom.count.textContent, "Zobrazeno 1–15 z 40 článků", "výchozí text z data-vychozi (kolo 37)");
  assert.deepEqual(dom.historie, ["/clanky/"]);

  dom.chipy[1].dispatch("click");
  await dom.dobehni();
  assert.equal(dom.fetchu(), 1, "první skutečný filtr index stáhne");
  assert.equal(dom.grid.children.length, 2, "karta Drony zpět z indexu");
  assert.equal(dom.grid.children[1].getAttribute("data-slug"), "z-edge");
  assert.equal(dom.reset.getAttribute("hidden"), null);
});

// ── P2: prefers-reduced-motion už .live-dot a spinner zastavuje ──────────

test("kolo 38: globální vypínač reduced-motion platí i pro .live-dot a .x-facade-spinner (audit se nepotvrdil)", () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{\s*html \{ scroll-behavior: auto; \}\s*\*, \*::before, \*::after \{ animation: none !important; transition: none !important; \}/,
    "vypínač z hlavičky global.css chybí",
  );
  const liveDot = css.match(/\n\.live-dot \{([^}]*)\}/)?.[1] ?? "";
  assert.match(liveDot, /animation: pulse 2s infinite;/, "pulz mimo reduce zůstává");
  assert.doesNotMatch(liveDot, /!important/, "!important by přebilo vypínač");
  const spinner = css.match(/\n\.x-facade-spinner \{([^}]*)\}/)?.[1] ?? "";
  assert.match(spinner, /animation: x-facade-spin 0\.8s linear infinite;/);
  assert.doesNotMatch(spinner, /!important/);
  const editorial = cti("src/styles/editorial.css");
  assert.doesNotMatch(editorial, /animation:[^;]*!important/, "žádné CSS nesmí animaci vynutit přes vypínač");
});

// ── P2: Kopírovat odkaz bez JS ───────────────────────────────────────────

test("kolo 38: článek bez JS schová button.copy-link a u obou .share-btns nese <noscript> odkaz na článek", () => {
  assert.match(clanek, /<noscript slot="head"><style is:inline>button\.copy-link\{display:none\}<\/style><\/noscript>/);
  const dvojice = clanek.match(/<button class="share-btn copy-link"[^>]*>Kopírovat odkaz<\/button>\s*<noscript><a class="share-btn" href=\{articleUrl\}>Odkaz na článek<\/a><\/noscript>/g) ?? [];
  assert.equal(dvojice.length, 2, "aside i .article-share pod textem (kolo 29/34)");
  assert.equal((clanek.match(/class="share-btn copy-link"/g) ?? []).length, 2, "tlačítka pro skript zůstávají");
  const body = clanek.match(/<div class="article-page">[\s\S]*<\/Base>/)?.[0] ?? "";
  for (const noscript of body.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)) {
    assert.doesNotMatch(noscript[1], /<style/, "<style> v <noscript> mimo <head> validátor neuznává");
  }
});
