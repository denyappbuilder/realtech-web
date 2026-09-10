// Kolo 35: leftover po kolech 33–34 (#426, #428) a nové /gdpr/ (#431 živě).
// Živý audit 10. 9. 2026 (/gdpr/, newsletter v patě, /clanky/ s filtrem,
// /clanky/strana/2, úvodka) proti kódu.
//
// P0: v „Když nám napíšeš“ na /gdpr/ stál holý text adresy bez email_off —
//     Cloudflare Email Obfuscation z něj udělal /cdn-cgi/l/email-protection
//     (404 bez JS). Hlídá test-gdpr.mjs (žádný e-mail mimo obal).
// P1: poznámka u Kit formuláře odkazuje na /gdpr/ (test-newsletter-kit-disclosure).
// P1: karty doplněné z search-index.json na /clanky/ byly jen text — nižší
//     než SSR karty (CLS při filtru), mřížka nejednotná. Index nese i/z/v,
//     klientská karta staví .card-thumb jako ArticleCard.
// P2: štítek kategorie v heru úvodky je a.tag na /temata/{slug}/ (jako článek).
// P2: /clanky/strana/2+ mají filtr bez JS — čipy jako odkazy na /clanky/?kat=…
//     a GET formulář na /clanky/?q=…, které skript strany 1 čte při načtení.
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
const uvodka = cti("src/pages/index.astro");
const clanek = cti("src/pages/clanky/[...id].astro");
const archiv = cti("src/components/ArticleArchivePage.astro");
const karta = cti("src/components/ArticleCard.astro");
const indexJs = cti("src/pages/search-index.json.js");

// ── P2: hero úvodky — kategorie je proklik na téma ───────────────────────

test("kolo 35: štítek kategorie v heru úvodky je a.tag na /temata/{slug}/ jako v hlavě článku", () => {
  const lowerThird = uvodka.match(/<div class="lower-third">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.ok(lowerThird, "hero ztratil .lower-third");
  assert.match(
    lowerThird,
    /<a class="tag" href=\{`\/temata\/\$\{slugify\(hero\.data\.category\)\}\/`\}>\{hero\.data\.category\}<\/a>/,
    "kategorie v heru musí být odkaz na téma",
  );
  assert.doesNotMatch(lowerThird, /<span class="tag">\{hero\.data\.category\}<\/span>/, "holý <span class=tag> byl slepý");
  assert.match(clanek, /<a class="tag" href=\{`\/temata\/\$\{slugify\(category\)\}\/`\}>\{category\}<\/a>/, "vzor z hlavy článku zůstává");
  assert.match(uvodka, /import \{ slugify \} from '\.\.\/lib\/slugify\.js';/, "hero bere slugify z lib jako patička a čipy témat");
  // a.tag má 44px cíl a sourozenci v .lower-third se k němu natahují (kolo 15).
  assert.match(css, /a\.tag \{[^}]*min-height: 44px/);
  assert.match(css, /\.lower-third \{ display: inline-flex; align-items: stretch;/);
});

// ── P2: /clanky/strana/2+ nejsou slepé ───────────────────────────────────

test("kolo 35: strana 2+ má filtr jako odkazy na /clanky/?kat=… a GET formulář /clanky/?q=…", () => {
  assert.match(archiv, /\{page === 1 \? \(\s*<div class="filter-bar">/, "strana 1 drží interaktivní pruh (tlačítka + #art-search)");
  const odkazy = (archiv.match(/<div class="filter-bar" data-filter-odkaz>([\s\S]*?)<\/div>\s*\)\}/)?.[1] ?? "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  assert.ok(odkazy, "strana 2+ nemá .filter-bar[data-filter-odkaz]");
  assert.match(odkazy, /<nav class="cat-filter" aria-label="Filtr podle kategorie">/);
  assert.match(odkazy, /<a class="chip active" href="\/clanky\/">Vše<\/a>/, "„Vše“ vede na čistý /clanky/");
  assert.match(
    odkazy,
    /<a class="chip" href=\{`\/clanky\/\?kat=\$\{encodeURIComponent\(category\)\}`\}>\{category\}<\/a>/,
    "čipy kategorií jsou odkazy na /clanky/?kat=…",
  );
  assert.doesNotMatch(odkazy, /aria-pressed/, "aria-pressed patří jen tlačítkům strany 1, ne odkazům");
  assert.match(
    odkazy,
    /<form class="search-form" action="\/clanky\/" method="get" role="search" aria-label="[^"]+">\s*<input type="search" name="q" class="search-input"/,
    "pole hledání je GET formulář na /clanky/ s name=q",
  );
  assert.doesNotMatch(odkazy, /id="art-search"/, "#art-search je jen na straně 1 — skript by ho na straně 2+ stejně neobsloužil");
  // Skript strany 1 čte ?kat a ?q — cíl odkazů i formuláře.
  assert.match(archiv, /const initialCategory = params\.get\('kat'\);/);
  assert.match(archiv, /const initialQuery = params\.get\('q'\);/);
  assert.match(archiv, /if \(initialCategory \|\| initialQuery\) void apply\(\);/);
  // Formulář se v pruhu chová jako pole samo — jinak by ≤580px width: 100 % neplatilo.
  assert.match(css, /\.filter-bar \.search-form \{ display: contents; \}/);
});

test("kolo 35: CSP form-action 'self' pouští GET formulář archivu, img-src pouští náhledy z indexu", () => {
  const hlavicky = cti("public/_headers");
  const csp = hlavicky.match(/Content-Security-Policy: ([^\n]+)/)?.[1] ?? "";
  assert.match(csp, /form-action 'self'/);
  assert.match(csp, /img-src 'self' https:\/\/i\.ytimg\.com/);
});

// ── P1: karty z indexu mají náhled jako SSR karta ────────────────────────

test("kolo 35: search-index.json.js dává i (náhled jako <img src> karty), z (Zpráva) a v (délka videa)", () => {
  assert.match(indexJs, /import \{ nahledKarty \} from '\.\.\/lib\/karta-nahled\.js';/);
  assert.match(indexJs, /import \{ youtubeId \} from '\.\.\/lib\/youtube\.js';/);
  assert.match(indexJs, /export function nahledProIndex\(data\)/);
  assert.match(indexJs, /i: nahledProIndex\(c\.data\),/);
  assert.match(indexJs, /z: c\.data\.zprava \? 1 : undefined,/);
  assert.match(indexJs, /v: c\.data\.videoLength \|\| undefined,/);
  // Stejné rozhodnutí jako ArticleCard: lokální cover má přednost, YouTube jen bez něj.
  assert.match(indexJs, /if \(videoId && !nahled\.hasLocalThumb\) return `https:\/\/i\.ytimg\.com\/vi\/\$\{videoId\}\/maxresdefault\.jpg`;/);
  assert.match(karta, /const useYtThumb = Boolean\(videoId\) && !hasLocalThumb;/);
});

/** Klientský skript archivu v holém DOM (jako test-kolo-33-leftover), karty z indexu se zkoumají do hloubky. */
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
    /** Hloubkové hledání podle tagu a/nebo třídy — jen pro asserty testu. */
    najdi(tag, trida) {
      const shoda = (p) => (!tag || p.tagName === tag.toUpperCase()) && (!trida || p.className.split(/\s+/).includes(trida));
      const vysledky = [];
      const projdi = (p) => { for (const d of p.children) { if (shoda(d)) vysledky.push(d); projdi(d); } };
      projdi(this);
      return vysledky;
    }
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

const INDEX = [
  { s: "na-strane-1", t: "Na straně 1", d: "Popis", k: "AI Report", b: "", p: "2026-09-01", i: "/images/clanky/na-strane-1-640.webp" },
  { s: "zprava-video", t: "Starship Flight 14 letí", d: "Popis zprávy", k: "Vesmír", b: "", p: "2026-08-10", i: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", z: 1, v: "12:34" },
  { s: "bez-nahledu", t: "Bez coveru", d: "Popis", k: "AI Agenti", b: "", p: "2026-06-01" },
];

test("kolo 35: karta z indexu nese .card-thumb th-* s <picture><img lazy alt=titulek> a štítky .lt jako SSR ArticleCard", async () => {
  const dom = spustArchiv({ index: INDEX, karty: ["na-strane-1"] });
  dom.search.value = "popis";
  dom.search.dispatch("input");
  await dom.dobehni();

  const zIndexu = dom.grid.children.filter((c) => c.hasAttribute("data-from-index"));
  assert.deepEqual(zIndexu.map((c) => c.getAttribute("data-slug")), ["zprava-video", "bez-nahledu"], "karta ze strany 1 se nezdvojuje");

  const [video, bez] = zIndexu;
  // Pořadí jako v ArticleCard: náhled před tělem — jinak by karta měla text nahoře.
  assert.equal(video.children[0].className, "card-thumb th-vesmir", ".th-* z kategorie bez diakritiky, jako slugify v ArticleCard");
  assert.equal(video.children[1].className, "card-body");
  const [img] = video.najdi("img");
  assert.ok(img, "karta s `i` musí mít <img>");
  assert.equal(img.parent.tagName, "PICTURE", "<img> stojí v <picture> jako SSR karta");
  assert.equal(img.getAttribute("src"), "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg");
  assert.equal(img.getAttribute("alt"), "Starship Flight 14 letí", "alt = titulek (#310), ne prázdný");
  assert.equal(img.getAttribute("loading"), "lazy", "karta vzniká až po interakci — LCP to není");
  assert.equal(img.getAttribute("decoding"), "async");
  assert.deepEqual([img.getAttribute("width"), img.getAttribute("height")], ["1280", "720"], "YouTube maxresdefault = 1280×720");
  const lt = video.najdi("div", "lt")[0];
  assert.ok(lt, "štítky .lt chybí");
  assert.deepEqual(
    lt.children.map((s) => [s.className, s.textContent]),
    [["k", "Vesmír"], ["z", "Zpráva"], ["t", "12:34"]],
    "kategorie → Zpráva → délka videa, stejné třídy jako ArticleCard (.k, .z, .t)",
  );

  // Bez `i` zůstává barevný .th-* blok se štítkem — výška karty sedí i tak.
  assert.equal(bez.children[0].className, "card-thumb th-ai-agenti");
  assert.equal(bez.najdi("img").length, 0, "bez cesty k náhledu žádný <img src=undefined>");
  assert.deepEqual(bez.najdi("div", "lt")[0].children.map((s) => [s.className, s.textContent]), [["k", "AI Agenti"]]);
});

test("kolo 35: -640 derivát dostane width/height 640×360 jako nahledKarty na serveru", async () => {
  const dom = spustArchiv({ index: INDEX, karty: [] });
  dom.chipy.find((c) => c.getAttribute("data-cat") === "AI Report").dispatch("click");
  await dom.dobehni();
  const [karta] = dom.grid.children.filter((c) => c.hasAttribute("data-from-index"));
  assert.equal(karta.getAttribute("data-slug"), "na-strane-1");
  const [img] = karta.najdi("img");
  assert.equal(img.getAttribute("src"), "/images/clanky/na-strane-1-640.webp");
  assert.deepEqual([img.getAttribute("width"), img.getAttribute("height")], ["640", "360"]);
});
