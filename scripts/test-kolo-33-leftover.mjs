// Kolo 33: leftover po kolech 31–32 (#420, #421 živě). Živý audit
// 9. 9. 2026 (úvodka s Muse, /clanky/, článek s xPosts) proti kódu.
//
// P1: přepínač tématu měl statický title „Světlý/tmavý režim“ — myš
//     nevěděla, co klik udělá. aria-label zůstává stálý „Tmavý režim“
//     (APG: u toggle buttonu s aria-pressed se jméno nemění), mění se
//     jen title = popis akce.
// P2: 76znakový titulek Muse byl bez .h1-dlouhy — práh 90 z kola 27 byl
//     moc vysoko (živě 5 řádků na 1280px, 6 na 1024px, sloupec 2× cover).
//     Měřením všech titulků v živém heru vyšel práh 75.
// P2: prázdný filtr v archivu (/clanky/?kat=…&q=… bez shody) končil jen
//     větou „Nic nenalezeno“ — chybělo Zrušit filtr.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const base = cti("src/layouts/Base.astro");
const uvodka = cti("src/pages/index.astro");
const archiv = cti("src/components/ArticleArchivePage.astro");
const muse = cti("src/content/clanky/meta-muse-agent-usa.md");

const skriptBase = base.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)?.[1] ?? "";

// ── P1: title přepínače sleduje stav, jméno zůstává ──────────────────────

test("kolo 33: #theme-toggle drží stálé jméno „Tmavý režim“ + aria-pressed (kolo 29) — skript aria-label nemění", () => {
  const tlacitko = base.match(/<button id="theme-toggle"[^>]*>/)?.[0];
  assert.ok(tlacitko, "#theme-toggle v Base chybí");
  assert.match(tlacitko, /aria-label="Tmavý režim"/);
  assert.match(tlacitko, /aria-pressed="false"/);
  assert.doesNotMatch(skriptBase, /toggle\?\.setAttribute\('aria-label'/,
    "APG: „Světlý režim, zapnuto“ by v tmavém režimu lhalo — jméno toggle buttonu se nemění");
});

test("kolo 33: skript nastaví title podle stavu — Přepnout na světlý / tmavý režim", () => {
  const funkce = skriptBase.match(/const nastavStavPrepinace = \(\) => \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";
  assert.ok(funkce, "nastavStavPrepinace v Base chybí");
  assert.match(funkce, /const tmavy = aktualniTema\(\) === 'dark';/);
  assert.match(funkce, /toggle\?\.setAttribute\('aria-pressed', String\(tmavy\)\);/, "aria-pressed z kola 29 zůstává");
  assert.match(
    funkce,
    /toggle\?\.setAttribute\('title', tmavy \? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'\);/,
    "title = akce kliknutí, ne stav; v tmavém režimu „Přepnout na světlý režim“",
  );
  // Stejná funkce běží hned po načtení, po kliknutí i při změně OS tématu —
  // title tak nikdy nezůstane viset na starém stavu.
  const teloKliku = skriptBase.slice(
    skriptBase.indexOf("toggle?.addEventListener('click'"),
    skriptBase.indexOf("});", skriptBase.indexOf("toggle?.addEventListener('click'")),
  );
  assert.match(teloKliku, /nastavStavPrepinace\(\);/);
  assert.match(skriptBase, /addEventListener\?\.\('change', nastavStavPrepinace\)/);
});

// ── P2: práh dlouhého titulku 75 ─────────────────────────────────────────

test("kolo 33: HERO_DLOUHY_TITULEK = 75 a 76znakový Muse třídu dostane", () => {
  assert.match(uvodka, /const HERO_DLOUHY_TITULEK = 75;/, "živě: od ~75 znaků 6–7 řádků na 1024px při 3.1rem");
  assert.match(uvodka, /const heroTitulekDlouhy = Boolean\(hero && hero\.data\.title\.length >= HERO_DLOUHY_TITULEK\);/);
  const titulek = muse.match(/^title:\s*"(.*)"\s*$/m)?.[1];
  assert.ok(titulek, "Muse nemá title ve frontmatteru");
  assert.equal(titulek.length, 76, "audit 9. 9. 2026: Muse ~76 znaků");
  assert.ok(titulek.length >= 75, "Muse musí spadnout do .h1-dlouhy");
  assert.match(css, /práh od kola 33\s+75 znaků/, "komentář v CSS drží stejný práh jako index.astro");
});

// ── P2: Zrušit filtr v prázdném archivu ──────────────────────────────────

test("archiv nese Zrušit filtr v liště výsledků, výchozí stav je skrytý", () => {
  assert.match(
    archiv,
    /<div class="archive-results-bar">[\s\S]*?<button type="button" class="btn-ghost filter-reset" hidden>Zrušit filtr<\/button>/,
    "reset patří k počtu výsledků a je dostupný i s nalezenými články",
  );
  assert.match(css, /\.filter-reset \{ margin-bottom: 12px; \}/);
  assert.match(css, /\[hidden\] \{ display: none !important; \}/, "bez toho by inline-flex .btn-ghost přebil hidden");
});

/** Klientský skript archivu v holém DOM — jako v test-kolo-29-leftover, navíc reset, stránkování a historie. */
function spustArchiv({ index, karty }) {
  class Prvek {
    constructor(tag, attrs = {}) {
      this.tagName = tag.toUpperCase();
      this.attrs = new Map(Object.entries(attrs));
      this.children = [];
      this.parent = null;
      this.listeners = new Map();
      this.textContent = "";
      this.value = "";
      this.fokus = 0;
      this.classList = {
        add: (n) => this.setAttribute("class", `${this.getAttribute("class") ?? ""} ${n}`.trim()),
        remove: (n) => this.setAttribute("class", (this.getAttribute("class") ?? "").split(/\s+/).filter((c) => c && c !== n).join(" ")),
      };
    }
    set className(v) { this.setAttribute("class", v); }
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
    dispatch(type) { for (const fn of this.listeners.get(type) ?? []) fn({ type, target: this }); }
    focus() { this.fokus += 1; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }

  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const js = ts.transpileModule(skript, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

  const chipVse = new Prvek("button", { class: "chip active", "data-cat": "" });
  const chipy = [chipVse, ...new Set(index.map((it) => it.k))].map((c) =>
    typeof c === "string" ? new Prvek("button", { class: "chip", "data-cat": c }) : c,
  );
  const grid = new Prvek("div", { id: "articles-grid", "aria-busy": "false" });
  for (const slug of karty) grid.append(new Prvek("article", { class: "card", "data-slug": slug }));
  const empty = new Prvek("p", { class: "filter-empty", hidden: "" });
  const reset = new Prvek("button", { class: "btn-ghost filter-reset", hidden: "" });
  const loading = new Prvek("p", { class: "filter-loading", hidden: "" });
  const count = new Prvek("p", { class: "filter-count sr-only", role: "status", "data-filter-count": "" });
  const pagination = new Prvek("nav", { class: "archive-pagination" });
  const search = new Prvek("input", { id: "art-search" });
  const historie = [];

  const document = {
    createElement: (tag) => new Prvek(tag),
    getElementById: (id) => ({ "articles-grid": grid, "art-search": search })[id] ?? null,
    querySelector: (sel) => ({
      ".filter-empty": empty,
      ".filter-reset": reset,
      ".filter-loading": loading,
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
  vm.runInNewContext(js, {
    document,
    window: {
      setTimeout(fn) { casovace.push(fn); return casovace.length; },
      clearTimeout() {},
    },
    fetch: async () => ({ ok: true, json: async () => index }),
    URLSearchParams,
    location: { pathname: "/clanky/", search: "" },
    history: { replaceState: (...args) => historie.push(args) },
  }, { filename: "ArticleArchivePage.client.js" });

  const dobehni = async () => {
    for (let i = 0; i < 20; i++) {
      while (casovace.length) casovace.shift()();
      await new Promise((r) => setImmediate(r));
    }
  };
  return { chipy, chipVse, grid, empty, reset, pagination, search, historie, dobehni };
}

const INDEX = [
  { s: "a1", t: "Claude Opus 5", d: "Popis", k: "AI Report", b: "", p: "2026-09-01" },
  { s: "s1", t: "Starship Flight 14", d: "Popis", k: "Vesmír", b: "", p: "2026-08-10" },
  { s: "m1", t: "Pixel 11", d: "Popis", k: "Mobily", b: "", p: "2026-06-01" },
];

test("Zrušit filtr se ukáže u každého filtru a klik vrátí Vše, prázdné pole, karty, stránkování i čistou URL", async () => {
  const dom = spustArchiv({ index: INDEX, karty: ["a1", "s1"] });
  const chip = (kat) => dom.chipy.find((c) => c.getAttribute("data-cat") === kat);

  // Filtr se shodou lze nyní zrušit přímo v liště výsledků.
  chip("Vesmír").dispatch("click");
  await dom.dobehni();
  assert.equal(dom.empty.hasAttribute("hidden"), true);
  assert.equal(dom.reset.hasAttribute("hidden"), false, "i úspěšný filtr musí jít zrušit");

  // Kategorie + dotaz bez shody (živě /clanky/?kat=Vesmír&q=…): věta i tlačítko.
  dom.search.value = "nic-takoveho";
  dom.search.dispatch("input");
  await dom.dobehni();
  assert.equal(dom.empty.hasAttribute("hidden"), false);
  assert.equal(dom.reset.hasAttribute("hidden"), false, "prázdný výsledek musí nabídnout Zrušit filtr");
  assert.equal(dom.pagination.hasAttribute("hidden"), true);
  assert.ok(dom.grid.children.every((c) => c.hasAttribute("hidden")), "karty ze strany 1 jsou schované");

  dom.reset.dispatch("click");
  await dom.dobehni();
  assert.equal(dom.search.value, "", "pole hledání je prázdné");
  assert.match(dom.chipVse.getAttribute("class"), /\bactive\b/, "čip Vše je zase aktivní");
  assert.equal(dom.chipVse.getAttribute("aria-pressed"), "true");
  assert.equal(chip("Vesmír").getAttribute("aria-pressed"), "false");
  assert.equal(dom.empty.hasAttribute("hidden"), true);
  assert.equal(dom.reset.hasAttribute("hidden"), true, "po zrušení se tlačítko schová");
  assert.equal(dom.pagination.hasAttribute("hidden"), false, "stránkování je zpět");
  assert.ok(dom.grid.children.every((c) => !c.hasAttribute("hidden") && !c.hasAttribute("data-from-index")),
    "karty ze strany 1 jsou vidět, karty doplněné z indexu pryč");
  assert.deepEqual(dom.historie.at(-1), [null, "", "/clanky/"], "?kat/?q z URL zmizí");
  assert.equal(dom.chipVse.fokus, 1, "fokus jde na čip Vše — skryté tlačítko by ho pustilo na body");
});
