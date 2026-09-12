// Kolo 37 (2. část): živý audit 12. 9. 2026 archivu /clanky/ proti kódu.
//
// P1: /clanky/?q=… i ?kat=… vracely 15 nefiltrovaných karet s čipem „Vše“ —
//     filtr běžel jen v klientském skriptu. Teď filtruje Pages Function
//     (functions/clanky/index.js) nad statickým HTML a search-index.json:
//     stejný index, stejná shoda, stejná karta jako klient.
// P1: karta skládaná z indexu po filtru měla jen <img src=-640.webp> bez
//     srcset/sizes — horší než SSR karta vedle. Index nese `is` (srcset
//     WebP 640w+1280w), klient i edge staví <source> jako ArticleCard.
// P1: čipy strany 1 byly tlačítka jen pro skript — bez JS mrtvé. <noscript>
//     nese odkazy /clanky/?kat=… jako strana/2+, edge označí aktivní.
// P2: <strong> se sázel syntetickým 700 — Plex Sans má jen 400/500/600.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

import {
  MAX_DELKA_DOTAZU,
  aktivniCipVOdkazech,
  escapeHtml,
  filtrujIndex,
  kartaHtml,
  parametryFiltru,
  platnyIndex,
} from "../src/lib/archiv-filtr.js";
import { handleryFiltru, onRequestGet } from "../functions/clanky/index.js";
import { nahledProIndex, srcsetProIndex } from "../src/pages/search-index.json.js";
import { KARTA_SIZES_ARCHIVE } from "../src/lib/karta-nahled.js";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const archiv = cti("src/components/ArticleArchivePage.astro");
const indexZdroj = cti("src/pages/search-index.json.js");
const css = cti("src/styles/global.css");

const INDEX = [
  { s: "na-strane-1", t: "Na straně 1: Starlink v Česku", d: "Popis", k: "AI Report", b: "text o Starlinku", p: "2026-09-01", m: 3,
    i: "/images/clanky/na-strane-1-640.webp", is: "/images/clanky/na-strane-1-640.webp 640w, /images/clanky/na-strane-1.webp 1280w" },
  { s: "jen-webp", t: "Jediný WebP", d: "Popis", k: "Drony", b: "", p: "2026-08-20", i: "/images/clanky/jen-webp.webp" },
  { s: "zprava-video", t: "Starship Flight 14 letí", d: "Popis zprávy", k: "Vesmír", b: "", p: "2026-08-10", m: 4,
    i: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", z: 1, v: "12:34" },
  { s: "bez-nahledu", t: "Bez coveru <a> & \"uvozovky\"", d: "Popis dronu", k: "Drony", b: "", p: "2026-06-01" },
];

// ── Čistá logika filtru ──────────────────────────────────────────────────

test("kolo 37: parametryFiltru ořeže mezery a délku, prázdné = bez filtru", () => {
  assert.deepEqual(parametryFiltru(new URL("https://realtech.cz/clanky/")), { kat: "", q: "" });
  assert.deepEqual(parametryFiltru(new URL("https://realtech.cz/clanky/?q=%20starlink%20&kat=AI%20Report")), { kat: "AI Report", q: "starlink" });
  const dlouhy = parametryFiltru(new URL(`https://realtech.cz/clanky/?q=${"a".repeat(500)}`));
  assert.equal(dlouhy.q.length, MAX_DELKA_DOTAZU);
});

test("kolo 37: filtrujIndex = shoda klientského apply(): kategorie přesně, dotaz bez diakritiky v t/d/k/b", () => {
  assert.deepEqual(filtrujIndex(INDEX, { kat: "Drony", q: "" }).map((it) => it.s), ["jen-webp", "bez-nahledu"]);
  assert.deepEqual(filtrujIndex(INDEX, { kat: "", q: "STARLÍNK" }).map((it) => it.s), ["na-strane-1"], "diakritika a velikost písmen nerozhodují");
  assert.deepEqual(filtrujIndex(INDEX, { kat: "Drony", q: "dronu" }).map((it) => it.s), ["bez-nahledu"], "kategorie a dotaz zároveň");
  assert.deepEqual(filtrujIndex(INDEX, { kat: "Drony", q: "starlink" }), [], "dotaz mimo kategorii = nic");
  assert.equal(filtrujIndex(INDEX, { kat: "", q: "" }).length, INDEX.length);
});

test("kolo 37: platnyIndex bere `is` jako volitelný řetězec a odmítá cizí tvar", () => {
  assert.equal(platnyIndex(INDEX), true);
  assert.equal(platnyIndex([{ ...INDEX[0], is: 5 }]), false);
  assert.equal(platnyIndex([{ s: "x" }]), false);
  assert.equal(platnyIndex({ not: "array" }), false);
});

test("kolo 37: kartaHtml escapuje titulek, perex i atributy a staví <source> jen pro WebP", () => {
  const html = kartaHtml(INDEX[3], KARTA_SIZES_ARCHIVE);
  assert.match(html, /<h2><a href="\/clanky\/bez-nahledu\/">Bez coveru &lt;a&gt; &amp; &quot;uvozovky&quot;<\/a><\/h2>/);
  assert.doesNotMatch(html, /<picture>/, "bez `i` žádný <img src=undefined>");
  assert.match(html, /<div class="card-thumb th-drony"><div class="lt"><span class="k">Drony<\/span><\/div><\/div>/);
  assert.doesNotMatch(html, /ČTENÍ/, "bez `m` žádné „ČTENÍ undefined MIN“");

  const youtube = kartaHtml(INDEX[2], KARTA_SIZES_ARCHIVE);
  assert.doesNotMatch(youtube, /<source/, "YouTube JPEG nemá WebP <source>");
  assert.match(youtube, /<img src="https:\/\/i\.ytimg\.com\/vi\/dQw4w9WgXcQ\/maxresdefault\.jpg" alt="Starship Flight 14 letí" width="1280" height="720" loading="lazy" decoding="async">/);
  assert.match(youtube, /<span class="z">Zpráva<\/span><span class="t">12:34<\/span>/);
  assert.match(youtube, /<time datetime="2026-08-10">10\. 08\. 2026<\/time><span>ČTENÍ 4 MIN<\/span>/);

  const jenWebp = kartaHtml(INDEX[1], KARTA_SIZES_ARCHIVE);
  assert.match(jenWebp, /<source srcset="\/images\/clanky\/jen-webp\.webp" type="image\/webp">/, "jediný WebP bez sizes jako ArticleCard");
  assert.match(jenWebp, /width="1280" height="720"/);

  const srcset = kartaHtml(INDEX[0], KARTA_SIZES_ARCHIVE);
  assert.match(srcset, new RegExp(`<source srcset="${escapeHtml(INDEX[0].is).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" sizes="${escapeHtml(KARTA_SIZES_ARCHIVE).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" type="image/webp">`));
  assert.match(srcset, /width="640" height="360"/);
});

test("kolo 37: aktivniCipVOdkazech přesune active na odkaz zvolené kategorie, jiný text nechá", () => {
  const noscript = '<nav class="cat-filter"><a class="chip active" href="/clanky/">Vše</a> <a class="chip" href="/clanky/?kat=AI%20Report">AI Report</a></nav>';
  assert.equal(
    aktivniCipVOdkazech(noscript, "AI Report"),
    '<nav class="cat-filter"><a class="chip" href="/clanky/">Vše</a> <a class="chip active" href="/clanky/?kat=AI%20Report">AI Report</a></nav>',
  );
  assert.equal(aktivniCipVOdkazech(noscript, ""), noscript, "bez kategorie zůstává aktivní Vše");
  assert.equal(aktivniCipVOdkazech(aktivniCipVOdkazech(noscript, "AI Report"), "Drony"), noscript.replace(' active', ''), "neznámá kategorie = žádný aktivní");
  const styl = "<style>.filter-bar .cat-filter[role=\"group\"]{display:none}</style>";
  assert.equal(aktivniCipVOdkazech(styl, "Drony"), styl);
});

// ── Parita: klientská karta z indexu = kartaHtml ─────────────────────────

/** Klientský skript archivu v holém DOM; karty z indexu se serializují do HTML. */
function spustArchiv({ index, karty, sizes }) {
  const VOID = new Set(["IMG", "SOURCE"]);
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
    dispatch(type) { for (const fn of this.listeners.get(type) ?? []) fn({ type, target: this }); }
    focus() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    html() {
      const tag = this.tagName.toLowerCase();
      const attrs = [...this.attrs].map(([k, v]) => ` ${k}="${escapeHtml(v)}"`).join("");
      if (VOID.has(this.tagName)) return `<${tag}${attrs}>`;
      const inner = this.children.length ? this.children.map((c) => c.html()).join("") : escapeHtml(this.textContent);
      return `<${tag}${attrs}>${inner}</${tag}>`;
    }
  }

  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const js = ts.transpileModule(skript, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

  const chipVse = new Prvek("button", { class: "chip active", "data-cat": "" });
  const chipy = [chipVse, ...new Set(index.map((it) => it.k))].map((c) =>
    typeof c === "string" ? new Prvek("button", { class: "chip", "data-cat": c }) : c,
  );
  const grid = new Prvek("div", { id: "articles-grid", "aria-busy": "false", "data-sizes": sizes });
  for (const slug of karty) grid.append(new Prvek("article", { class: "card", "data-slug": slug }));
  const empty = new Prvek("p", { class: "filter-empty", hidden: "" });
  const reset = new Prvek("button", { class: "btn-ghost filter-reset", hidden: "" });
  const loading = new Prvek("p", { class: "filter-loading", hidden: "" });
  const count = new Prvek("p", { class: "filter-count", role: "status", "data-filter-count": "" });
  const pagination = new Prvek("nav", { class: "archive-pagination" });
  const search = new Prvek("input", { id: "art-search" });

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
    window: { setTimeout(fn) { casovace.push(fn); return casovace.length; }, clearTimeout() {} },
    fetch: async () => ({ ok: true, json: async () => index }),
    URLSearchParams,
    location: { pathname: "/clanky/", search: "" },
    history: { replaceState() {} },
  }, { filename: "ArticleArchivePage.client.js" });

  const dobehni = async () => {
    for (let i = 0; i < 20; i++) {
      while (casovace.length) casovace.shift()();
      await new Promise((r) => setImmediate(r));
    }
  };
  return { chipy, grid, search, dobehni };
}

test("kolo 37: karta z indexu na klientu = kartaHtml z edge, byte po bytu (srcset, jediný WebP, YouTube, bez náhledu)", async () => {
  const dom = spustArchiv({ index: INDEX, karty: [], sizes: KARTA_SIZES_ARCHIVE });
  dom.search.value = "popis";
  dom.search.dispatch("input");
  await dom.dobehni();
  const zIndexu = dom.grid.children.filter((c) => c.hasAttribute("data-from-index"));
  assert.equal(zIndexu.length, INDEX.length, "všechny položky mají „Popis“");
  for (const [i, karta] of zIndexu.entries()) {
    assert.equal(karta.html(), kartaHtml(INDEX[i], KARTA_SIZES_ARCHIVE), `karta ${INDEX[i].s} se liší mezi klientem a edge`);
  }
  const [seSrcset] = zIndexu;
  const source = seSrcset.children[0].children[0].children[0];
  assert.equal(source.tagName, "SOURCE", "<source> před <img> jako v ArticleCard");
  assert.equal(source.getAttribute("sizes"), KARTA_SIZES_ARCHIVE, "sizes z data-sizes mřížky = KARTA_SIZES_ARCHIVE SSR karet");
});

test("kolo 37: klient maže karty z indexu až po načtení indexu — karty z edge nezmizí do díry", () => {
  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  const apply = skript.match(/const apply = async \(\) => \{([\s\S]*?)\n {6}\};/)?.[1] ?? "";
  assert.ok(apply, "apply() v archivu chybí");
  const prvniMazani = apply.indexOf("odstranKartyZIndexu();");
  const nacteni = apply.indexOf("await loadIndex();");
  const druheMazani = apply.indexOf("odstranKartyZIndexu();", nacteni);
  assert.ok(prvniMazani !== -1 && prvniMazani < apply.indexOf("if (!category && !nq) {") + 200, "čistý filtr karty z indexu maže hned");
  assert.ok(druheMazani > nacteni, "s filtrem se karty z indexu mažou až po await loadIndex()");
  assert.equal((apply.match(/card\.remove\(\)/g) ?? []).length, 1, "mazání jen v helperu odstranKartyZIndexu, ne přímo před větvením");
});

// ── Markup archivu ───────────────────────────────────────────────────────

test("kolo 37: strana 1 nese <noscript> odkazy čipů jako strana/2+ a skryje tlačítka bez JS", () => {
  const strana1 = archiv.match(/\{page === 1 \? \(([\s\S]*?)\) : \(/)?.[1] ?? "";
  assert.match(strana1, /<button class="chip active" data-cat="" aria-pressed="true">Vše<\/button>/, "tlačítka pro skript zůstávají");
  const noscript = strana1.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
  assert.match(noscript, /<nav class="cat-filter" aria-label="Filtr podle kategorie">/);
  assert.match(noscript, /<a class="chip active" href="\/clanky\/">Vše<\/a>/);
  assert.match(noscript, /<a class="chip" href=\{`\/clanky\/\?kat=\$\{encodeURIComponent\(category\)\}`\}>\{category\}<\/a>/, "stejný vzor jako strana/2+ (kolo 35)");
  assert.match(archiv, /\{page === 1 && <noscript slot="head"><style is:inline>\.filter-bar \.cat-filter\[role="group"\]\{display:none\}<\/style><\/noscript>\}/);
  assert.match(archiv, /<div class="grid" id="articles-grid" aria-busy="false" data-sizes=\{KARTA_SIZES_ARCHIVE\}>/, "sizes pro karty z indexu čte klient z mřížky");
  assert.match(archiv, /&& \(item\.is === undefined \|\| typeof item\.is === 'string'\)/, "loadIndex musí `is` pustit");
});

test("kolo 37: search-index.json nese `is` = srcset WebP jen u lokálního coveru se dvěma deriváty", () => {
  assert.match(indexZdroj, /is: srcsetProIndex\(c\.data\),/);
  const lokalni = { image: "/images/clanky/claude-code-tydenni-limit-zari.jpg" };
  assert.equal(nahledProIndex(lokalni), "/images/clanky/claude-code-tydenni-limit-zari-640.webp");
  assert.equal(
    srcsetProIndex(lokalni),
    "/images/clanky/claude-code-tydenni-limit-zari-640.webp 640w, /images/clanky/claude-code-tydenni-limit-zari.webp 1280w",
  );
  assert.equal(srcsetProIndex({ image: "/images/clanky/neexistuje.jpg", video: "https://youtu.be/dQw4w9WgXcQ" }), undefined, "YouTube náhled srcset nemá");
  assert.equal(srcsetProIndex({}), undefined);
});

// ── Pages Function ───────────────────────────────────────────────────────

/** Falešný element HTMLRewriteru — jen to, co handlery volají. */
function element(attrs = {}) {
  const el = {
    attrs: new Map(Object.entries(attrs)),
    odstranen: false,
    vnitrek: null,
    naKonci: [],
    getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; },
    setAttribute(n, v) { this.attrs.set(n, String(v)); },
    removeAttribute(n) { this.attrs.delete(n); },
    remove() { this.odstranen = true; },
    setInnerContent(t) { this.vnitrek = t; },
    onEndTag(fn) { this.naKonci.push(fn); },
  };
  return el;
}

function handlery(stav) {
  return new Map(handleryFiltru(stav));
}

test("kolo 37: handlery skryjí karty mimo výběr, připojí zbytek z indexu za mřížku a srovnají počet/prázdno/stránkování", () => {
  const vybrane = filtrujIndex(INDEX, { kat: "Drony", q: "" });
  const h = handlery({ vybrane, prvniSlug: INDEX[0].s, kat: "Drony", q: "" });

  const preload = element({ rel: "preload", as: "image" });
  h.get('link[rel="preload"][as="image"]').element(preload);
  assert.equal(preload.odstranen, true, "první karta (AI Report) ve výběru není → preload pryč");

  const karty = ["na-strane-1", "jen-webp"].map((s) => element({ class: "card", "data-slug": s }));
  for (const k of karty) h.get("#articles-grid .card").element(k);
  assert.equal(karty[0].getAttribute("hidden"), "", "karta mimo výběr je hidden, ne smazaná (Zrušit filtr ji odkryje)");
  assert.equal(karty[1].getAttribute("hidden"), null);

  const grid = element({ id: "articles-grid", "data-sizes": KARTA_SIZES_ARCHIVE });
  h.get("#articles-grid").element(grid);
  let vlozeno = null;
  for (const fn of grid.naKonci) fn({ before(html, opts) { vlozeno = { html, opts }; } });
  assert.ok(vlozeno, "za poslední kartu se má vložit HTML");
  assert.deepEqual(vlozeno.opts, { html: true });
  assert.equal(vlozeno.html, kartaHtml(INDEX[3], KARTA_SIZES_ARCHIVE), "jen-webp už na straně je, přidá se jen bez-nahledu");

  const pocet = element({ "data-filter-count": "" });
  h.get("[data-filter-count]").element(pocet);
  assert.equal(pocet.vnitrek, "2 články");
  const prazdno = element({ class: "filter-empty", hidden: "" });
  h.get(".filter-empty").element(prazdno);
  assert.equal(prazdno.getAttribute("hidden"), "", "2 výsledky → „Nic nenalezeno“ zůstává skryté");
  const strankovani = element({ class: "archive-pagination" });
  h.get(".archive-pagination").element(strankovani);
  assert.equal(strankovani.getAttribute("hidden"), "");
  const pole = element({ id: "art-search" });
  h.get("#art-search").element(pole);
  assert.equal(pole.getAttribute("value"), null, "bez dotazu se value nenastavuje");

  const vse = element({ class: "chip active", "data-cat": "", "aria-pressed": "true" });
  const drony = element({ class: "chip", "data-cat": "Drony", "aria-pressed": "false" });
  h.get(".cat-filter .chip").element(vse);
  h.get(".cat-filter .chip").element(drony);
  assert.deepEqual([vse.getAttribute("class"), vse.getAttribute("aria-pressed")], ["chip", "false"]);
  assert.deepEqual([drony.getAttribute("class"), drony.getAttribute("aria-pressed")], ["chip active", "true"]);
});

test("kolo 37: handlery bez shody ukážou „Nic nenalezeno“, nechají preload první karty ve výběru a vyplní pole", () => {
  const h = handlery({ vybrane: [], prvniSlug: INDEX[0].s, kat: "", q: "xyzzy" });
  const prazdno = element({ class: "filter-empty", hidden: "" });
  h.get(".filter-empty").element(prazdno);
  assert.equal(prazdno.getAttribute("hidden"), null);
  const pocet = element({});
  h.get("[data-filter-count]").element(pocet);
  assert.equal(pocet.vnitrek, "0 článků");
  const pole = element({ id: "art-search" });
  h.get("#art-search").element(pole);
  assert.equal(pole.getAttribute("value"), "xyzzy");

  const sPrvni = handlery({ vybrane: [INDEX[0]], prvniSlug: INDEX[0].s, kat: "", q: "starlink" });
  const preload = element({ rel: "preload" });
  sPrvni.get('link[rel="preload"][as="image"]').element(preload);
  assert.equal(preload.odstranen, false, "první karta ve výběru = LCP zůstává preloadovaný");
});

test("kolo 37: text <noscript> se skládá z chunků a active dostane odkaz zvolené kategorie", () => {
  const h = handlery({ vybrane: [], prvniSlug: undefined, kat: "AI Report", q: "" });
  const noscript = h.get("noscript");
  const vysledky = [];
  const chunk = (text, lastInTextNode) => ({
    text, lastInTextNode,
    remove() { vysledky.push(["remove", text]); },
    replace(html, opts) { vysledky.push(["replace", html, opts]); },
  });
  noscript.text(chunk('<nav><a class="chip active" href="/clanky/">Vše</a> ', false));
  noscript.text(chunk('<a class="chip" href="/clanky/?kat=AI%20Report">AI Report</a></nav>', true));
  assert.deepEqual(vysledky, [
    ["remove", '<nav><a class="chip active" href="/clanky/">Vše</a> '],
    ["replace", '<nav><a class="chip" href="/clanky/">Vše</a> <a class="chip active" href="/clanky/?kat=AI%20Report">AI Report</a></nav>', { html: true }],
  ]);
});

test("kolo 37: onRequestGet bez parametrů (a bez HTMLRewriteru) pustí statický archiv beze změny", async () => {
  const asset = new Response("ASSET", { headers: { "content-type": "text/html" } });
  let nextCalls = 0;
  const context = {
    request: new Request("https://realtech.cz/clanky/"),
    env: { ASSETS: { fetch: async () => { assert.fail("bez parametrů se index nesmí stahovat"); } } },
    next() { nextCalls += 1; return asset; },
  };
  assert.strictEqual(await onRequestGet(context), asset);
  assert.equal(nextCalls, 1);

  // Node HTMLRewriter nemá — s parametry jde odpověď taky beze změny (žádný pád, žádná 500).
  assert.equal(typeof globalThis.HTMLRewriter, "undefined");
  const sParametry = { ...context, request: new Request("https://realtech.cz/clanky/?q=starlink") };
  assert.strictEqual(await onRequestGet(sParametry), asset);
});

test("kolo 37: onRequestGet s rozbitým indexem nebo chybou ASSETS vrací statický archiv, ne 500", async () => {
  const puvodni = globalThis.HTMLRewriter;
  globalThis.HTMLRewriter = class { on() { return this; } transform(r) { return r; } };
  try {
    const asset = new Response("ASSET", { headers: { "content-type": "text/html" } });
    const context = (fetchImpl) => ({
      request: new Request("https://realtech.cz/clanky/?kat=Drony"),
      env: { ASSETS: { fetch: fetchImpl } },
      next: () => asset,
    });
    assert.strictEqual(await onRequestGet(context(async () => new Response("[{\"s\":1}]", { status: 200 }))), asset, "neplatný index");
    assert.strictEqual(await onRequestGet(context(async () => new Response("nope", { status: 404 }))), asset, "index 404");
    assert.strictEqual(await onRequestGet(context(async () => { throw new Error("síť"); })), asset, "výjimka fetch");
  } finally {
    if (puvodni === undefined) delete globalThis.HTMLRewriter;
    else globalThis.HTMLRewriter = puvodni;
  }
});

// ── P2: strong bez syntetického tučného ──────────────────────────────────

test("kolo 37: <strong>/<b> mají 600 — jediný tučný řez Plex Sans, který web načítá", () => {
  assert.match(css, /\nstrong, b \{ font-weight: 600; \}/);
  assert.match(css, /\.article-body strong \{ font-weight: 600; \}/);
  assert.doesNotMatch(css, /strong[^{]*\{[^}]*font-weight:\s*700/, "700 by prohlížeč jen syntetizoval");
  const base = cti("src/layouts/Base.astro");
  assert.doesNotMatch(base, /ibm-plex-sans\/(?:latin-ext-|latin-)?700/, "žádný nový woff2 — 600 už web má");
});
