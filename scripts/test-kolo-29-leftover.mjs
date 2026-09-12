// Kolo 29: leftover po kolech 23–28 — přístupnost ovládacích prvků, které
// měnily stav jen vizuálně (živě ověřeno 7. 9. 2026 na úvodce, článku
// /clanky/openai-research-intern-zari-2026/ a archivu).
//
// P1: přepínač tématu #theme-toggle neměl žádný stav pro čtečku — jen
//     „Přepnout světlý/tmavý režim“. Kdo ikonu nevidí, nevěděl, v jakém
//     režimu je ani co klik udělá. Toggle button (WAI-ARIA APG) = stálé
//     jméno + aria-pressed.
// P1: potvrzení newsletteru nahradilo formulář přes innerHTML — tlačítko
//     s fokusem zmizelo, fokus spadl na <body>, čtečka o výsledku nevěděla.
// P0: na desktopu (≥ 901px) stála tři tlačítka sdílení dvakrát — v aside
//     u textu i v .article-share pod ním (pod 900px aside nekreslíme).
// P1: na úvodce vedly na hero článek tři odkazy za sebou (h1, CTA, cover
//     s alt = h1) — čtečka titulek třikrát, tabulátor tři zastávky.
// P2: sdílení na Facebook nemělo popisek (X „Sdílet na X“ má od dřív) —
//     odkaz se jmenoval jen „Facebook“ a v novém okně; nebylo jasné, že sdílí.
//     Kopírovat odkaz měnilo jméno na „Zkopírováno ✓“ — stálý popisek,
//     výsledek hlásí živá oblast z kola 22.
// P2: filtr archivu ohlašoval jen „Nic nenalezeno“ a načítání; při shodě
//     čtečka slyšela ticho (⌘K hledání hlásí „3 výsledky“ od kola 28).
// P2: WebSite JSON-LD bez SearchAction, ač archiv ?q= čte; /security.txt
//     404, zatímco /.well-known/security.txt (Cloudflare) odpovídá.
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
const clanek = cti("src/pages/clanky/[...id].astro");
const archiv = cti("src/components/ArticleArchivePage.astro");

function pravidlo(blok, selektor) {
  const shoda = blok.match(
    new RegExp(`(?:^|[}\\s/])${selektor.replaceAll(".", "\\.").replaceAll(" ", "\\s+")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

const skriptBase = base.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)?.[1] ?? "";

// ── P1: přepínač tématu nese stav ────────────────────────────────────────

test("kolo 29: #theme-toggle je toggle button — stálé jméno „Tmavý režim“ + aria-pressed", () => {
  const tlacitko = base.match(/<button id="theme-toggle"[^>]*>/)?.[0];
  assert.ok(tlacitko, "#theme-toggle v Base chybí");
  assert.match(tlacitko, /aria-label="Tmavý režim"/, "jméno musí říkat, CO je stisknuté (pressed = tmavý režim zapnutý)");
  assert.match(tlacitko, /aria-pressed="false"/, "server posílá výchozí světlé téma; skript dosadí skutečný stav");
  assert.doesNotMatch(tlacitko, /Přepnout světlý\/tmavý/, "APG: u aria-pressed se popisek při přepnutí nemění, akce je ve stavu");
  // Kolo 34: serverový title popisuje akci pro výchozí stav, ne „Světlý/tmavý režim“.
  assert.match(tlacitko, /title="Přepnout na tmavý režim"/, "tooltip pro myš zůstává, sedí s aria-pressed=false");
});

test("kolo 29: skript srovná aria-pressed s OS / localStorage hned a po každém kliknutí", () => {
  assert.ok(skriptBase, "hlavní <script> v Base chybí");
  assert.match(
    skriptBase,
    /const nastavStavPrepinace = \(\) => \{\s*const tmavy = aktualniTema\(\) === 'dark';\s*toggle\?\.setAttribute\('aria-pressed', String\(tmavy\)\);/,
    "aria-pressed = true jen v tmavém režimu (ručním i z OS); kolo 33 přidalo do téže funkce title",
  );
  const definice = skriptBase.indexOf("const nastavStavPrepinace");
  const prvniVolani = skriptBase.indexOf("nastavStavPrepinace();", definice);
  const klik = skriptBase.indexOf("toggle?.addEventListener('click'");
  assert.ok(prvniVolani > definice && prvniVolani < klik, "stav se musí dosadit hned při načtení, ne až po prvním kliknutí");
  const teloKliku = skriptBase.slice(klik, skriptBase.indexOf("});", klik));
  assert.match(teloKliku, /nastavStavPrepinace\(\);/, "po přepnutí musí stav sledovat nové téma");
  assert.match(teloKliku, /nastavThemeColor\(\);/, "theme-color z kola 18 zůstává");
  assert.match(
    skriptBase,
    /matchMedia\('\(prefers-color-scheme: dark\)'\)\.addEventListener\?\.\('change', nastavStavPrepinace\)/,
    "bez ruční volby řídí téma OS — když se přepne, musí se přepnout i stav tlačítka",
  );
});

// ── P1: potvrzení newsletteru pro čtečku ─────────────────────────────────

test("kolo 29: úspěch newsletteru je role=status s fokusem, ne innerHTML", () => {
  assert.doesNotMatch(skriptBase, /nlForm\.innerHTML\s*=/, "innerHTML shodilo fokus z tlačítka na <body>");
  const uspech = skriptBase.match(/const hotovo = document\.createElement\('p'\);([\s\S]*?)hotovo\.focus\(\);/)?.[0];
  assert.ok(uspech, "potvrzení se musí vytvořit jako prvek a dostat fokus");
  assert.match(uspech, /hotovo\.className = 'nl-done';/, "styl .nl-done z dřívějška zůstává");
  assert.match(uspech, /hotovo\.setAttribute\('role', 'status'\);/);
  assert.match(uspech, /hotovo\.tabIndex = -1;/, "fokus programově, ne další zastávka tabulátoru");
  assert.match(uspech, /hotovo\.textContent = '✓ Skoro hotovo — mrkni do mailu a potvrď odběr\.';/, "text beze změny");
  assert.match(uspech, /nlForm\.replaceChildren\(hotovo\);/);
  assert.match(skriptBase, /catch \{\s*nlForm\.submit\(\);/, "únik bez fetch API zůstává");
});

test("kolo 29: .nl-done:focus bez rámečku — není to ovládací prvek", () => {
  assert.match(pravidlo(css, ".nl-done:focus"), /outline:\s*none\s*;/);
  assert.match(pravidlo(css, ".nl-done"), /color:\s*#fff;\s*font-weight:\s*600/, "vzhled zprávy beze změny");
});

// ── P2: sdílení na Facebook má popisek ───────────────────────────────────

test("kolo 29: oba odkazy Facebook mají aria-label „Sdílet na Facebooku“ (aside i patka článku)", () => {
  const facebook = clanek.match(/<a class="share-btn" href=\{`https:\/\/www\.facebook\.com\/sharer[^>]*>Facebook<\/a>/g) ?? [];
  assert.equal(facebook.length, 2, "aside + .article-share");
  for (const odkaz of facebook) {
    assert.match(odkaz, /aria-label="Sdílet na Facebooku"/, odkaz);
    assert.match(odkaz, /target="_blank" rel="noopener"/, "nové okno + noopener zůstává");
  }
  const x = clanek.match(/aria-label="Sdílet na X"/g) ?? [];
  assert.equal(x.length, 2, "X má popisek z dřívějška, oba");
});

// ── P0: sdílení na desktopu jen jednou ───────────────────────────────────

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

test("kolo 29: .article-share se skrývá přesně tam, kde je aside sticky (≥ 901px a ≥ 640px na výšku)", () => {
  const sticky = blokMedia("\\(min-width: 901px\\) and \\(min-height: 640px\\)");
  assert.ok(sticky, "chybí @media (min-width: 901px) and (min-height: 640px)");
  assert.match(sticky, /\.article-aside\s*\{\s*position:\s*sticky;\s*top:\s*81px;?\s*\}/, "sticky aside z kola 19 zůstává");
  const skryti = css.match(/@media\s*\(min-width: 901px\) and \(min-height: 640px\)\s*\{\s*\.article-share\s*\{\s*display:\s*none;?\s*\}\s*\}/);
  assert.ok(skryti, "tři tlačítka sdílení pod textem byla na desktopu totéž podruhé — chybí blok, který .article-share skryje");
  // Stejná specificita jako základní .article-share { display: flex } —
  // kdyby blok stál dřív (třeba u sticky aside), základní pravidlo by ho
  // přebilo a na 1280px by zůstalo šest tlačítek (první pokus kola 29).
  assert.ok(skryti.index > css.search(/\n\.article-share\s*\{/), "skrytí musí stát v CSS až ZA základním pravidlem .article-share");
  const tablet = blokMedia("\\(max-width: 900px\\)");
  assert.match(tablet, /\.article-aside\s*\{\s*display:\s*none;?\s*\}/, "pod 901px je jediná cesta .article-share (kolo 19)");
  assert.doesNotMatch(tablet, /\.article-share\s*\{[^}]*display:\s*none/, "pod 901px .article-share zůstává — aside tam není");
  const zakladni = css.match(/\n\.article-share\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(zakladni, /max-width:\s*760px/, "základní (neodsazené) pravidlo .article-share v CSS chybí");
  assert.doesNotMatch(zakladni, /display:\s*none/, "základní pravidlo nesmí sdílení skrýt všude");
  assert.equal((clanek.match(/class="share-btns"/g) ?? []).length, 2, "markup nese obě místa — vybírá CSS podle viewportu");
});

test("kolo 29: Kopírovat odkaz má stálé jméno — „Zkopírováno ✓“ v textu hlásí živá oblast", () => {
  const kopirovat = clanek.match(/<button class="share-btn copy-link"[^>]*>Kopírovat odkaz<\/button>/g) ?? [];
  assert.equal(kopirovat.length, 2);
  for (const tlacitko of kopirovat) assert.match(tlacitko, /aria-label="Kopírovat odkaz na článek"/);
  assert.match(clanek, /<p class="sr-only" role="status" aria-live="polite" data-copy-status><\/p>/, "živá oblast z kola 22 zůstává");
  assert.match(clanek, /ohlasKopii\('Odkaz na článek zkopírován'\)/);
});

// ── P1: cover na úvodce jako dekorace ────────────────────────────────────

test("kolo 29: .hero-visual je pro čtečku a tabulátor dekorace, pro myš dál odkaz", () => {
  const odkaz = uvodka.match(/<a [^>]*class="hero-visual"[^>]*>/)?.[0];
  assert.ok(odkaz, "odkaz .hero-visual na úvodce chybí");
  assert.match(odkaz, /href=\{hero\.data\.video \?\? `\/clanky\/\$\{hero\.id\}\/`\}/, "cíl pro myš zůstává (video → YouTube, jinak článek)");
  assert.match(odkaz, /tabindex="-1"/);
  assert.match(odkaz, /aria-hidden="true"/);
  const visual = uvodka.match(/class="hero-visual"[^>]*>([\s\S]*?)<\/a>/)?.[1];
  // Kolo 37: alt nese titulek (viz test-kolo-37-leftover.mjs) — pro čtečku
  // ho dál schovává aria-hidden na odkazu, takže se titulek třikrát nečte.
  assert.match(visual, /<img [^>]*alt=\{hero\.data\.title\}/);
  assert.match(visual, /fetchpriority="high"/, "LCP zůstává eager + high — dekorace pro čtečku, ne pro prohlížeč");
  assert.doesNotMatch(visual, /aria-hidden="true">(?:<span class="live-dot">)?(?:REALTECH|TC)/, "štítky nepotřebují vlastní aria-hidden, skrytý je celý odkaz");
  // Jméno a cíl nesou h1 a CTA — musí zůstat.
  assert.match(uvodka, /<h1 [^>]*><a href=\{`\/clanky\/\$\{hero\.id\}\/`\}>\{hero\.data\.title\}<\/a><\/h1>/);
  assert.match(uvodka, /<a href=\{`\/clanky\/\$\{hero\.id\}\/`\} class="btn-primary">\{heroCta\}<\/a>/, "kolo 34: text CTA nese heroCta");
  assert.match(uvodka, /<a href=\{hero\.data\.video\} class="btn-ghost">/, "s videem je YouTube dostupné z klávesnice přes .btn-ghost");
});

// ── P2: SearchAction a /security.txt ─────────────────────────────────────

test("kolo 29: WebSite JSON-LD má SearchAction na /clanky/?q= (archiv ?q= čte)", () => {
  const website = uvodka.match(/'@type': 'WebSite',([\s\S]*?)\n\s*\},\n\s*\{/)?.[1] ?? "";
  assert.match(website, /'@type': 'SearchAction'/);
  assert.match(website, /urlTemplate: `\$\{new URL\('\/clanky\/', Astro\.site\)\.href\}\?q=\{search_term_string\}`/);
  assert.match(website, /'query-input': 'required name=search_term_string'/);
  assert.match(archiv, /params\.get\('q'\)/, "SearchAction smí ukazovat jen na URL, kterou archiv opravdu čte");
});

test("kolo 29: /security.txt → /.well-known/security.txt 301", () => {
  const redirects = cti("public/_redirects");
  assert.match(redirects, /^\/security\.txt \/\.well-known\/security\.txt 301$/m);
});

// ── P2: filtr archivu hlásí počet ────────────────────────────────────────

test("archiv má viditelný .filter-count a zachovává role=status", () => {
  // Kolo 37: data-vychozi nese výchozí text i pro stránku vyfiltrovanou na edgi.
  assert.match(archiv, /<p class="filter-count" role="status" data-filter-count data-vychozi=\{`Zobrazeno [^`]+`\}>Zobrazeno/);
  assert.equal((archiv.match(/data-filter-count/g) ?? []).length, 2, "markup + querySelector ve skriptu");
});

/** Klientský skript archivu v holém DOM: chipy, mřížka, stavy, pole hledání. */
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

  // Debounce i odložené ohlášení jdou přes window.setTimeout — spustí se ručně.
  const dobehni = async () => {
    for (let i = 0; i < 20; i++) {
      while (casovace.length) casovace.shift()();
      await new Promise((r) => setImmediate(r));
    }
  };
  return { chipy, grid, empty, count, search, dobehni };
}

const INDEX = [
  { s: "a1", t: "Claude Opus 5", d: "Popis", k: "AI Report", b: "", p: "2026-09-01" },
  { s: "a2", t: "Gemini 3.8 Flash", d: "Popis", k: "AI Report", b: "", p: "2026-08-20" },
  { s: "s1", t: "Starship Flight 14", d: "Popis", k: "Vesmír", b: "", p: "2026-08-10" },
  { s: "s2", t: "Starlink Mini test", d: "Popis", k: "Vesmír", b: "", p: "2026-08-01" },
  { s: "s3", t: "Starship Flight 13", d: "Popis", k: "Vesmír", b: "", p: "2026-07-01" },
  { s: "m1", t: "Pixel 11", d: "Popis", k: "Mobily", b: "", p: "2026-06-01" },
];

test("kolo 29: filtr kategorie ohlásí počet shod česky (1 článek / 2–4 články / 5+ článků)", async () => {
  const archivDom = spustArchiv({ index: INDEX, karty: ["a1", "s1"] });
  const chip = (kat) => archivDom.chipy.find((c) => c.getAttribute("data-cat") === kat);

  chip("AI Report").dispatch("click");
  await archivDom.dobehni();
  assert.equal(archivDom.count.textContent, "2 články", "karta na straně + karta doplněná z indexu");
  assert.equal(archivDom.empty.hasAttribute("hidden"), true);

  chip("Vesmír").dispatch("click");
  await archivDom.dobehni();
  assert.equal(archivDom.count.textContent, "3 články");

  chip("Mobily").dispatch("click");
  await archivDom.dobehni();
  assert.equal(archivDom.count.textContent, "1 článek");

  archivDom.search.value = "nic-takoveho";
  archivDom.search.dispatch("input");
  await archivDom.dobehni();
  assert.equal(archivDom.count.textContent, "", "bez shody mluví jen „Nic nenalezeno“ — dvě hlášky by se přebíjely");
  assert.equal(archivDom.empty.hasAttribute("hidden"), false);

  archivDom.search.value = "";
  chip("").dispatch("click");
  await archivDom.dobehni();
  assert.equal(archivDom.count.textContent, "", "bez filtru není co hlásit");
});

test("kolo 29: 5+ článků → „článků“, a stejný počet po sobě se ohlásí znovu (vymazání před zápisem)", async () => {
  const pet = [...INDEX, { s: "s4", t: "Starbase", d: "Popis", k: "Vesmír", b: "", p: "2026-05-01" }, { s: "s5", t: "Starfall", d: "Popis", k: "Vesmír", b: "", p: "2026-04-01" }];
  const archivDom = spustArchiv({ index: pet, karty: [] });
  const chip = (kat) => archivDom.chipy.find((c) => c.getAttribute("data-cat") === kat);

  chip("Vesmír").dispatch("click");
  await archivDom.dobehni();
  assert.equal(archivDom.count.textContent, "5 článků");

  // Skript nejdřív text vymaže a teprve odloženě zapíše — bez toho by
  // čtečka druhé „5 článků“ nepřečetla (žádná změna DOM).
  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  assert.match(skript, /count\.textContent = '';\s*if \(pocet > 0\) countTimer = window\.setTimeout\(\(\) => \{ count\.textContent = textPoctuClanku\(pocet\); \}, 50\);/);
});

// ── Beze změny ───────────────────────────────────────────────────────────

test("kolo 29: hlášky filtru z kola 18 a pořadí .sr-only v CSS zůstávají", () => {
  assert.match(archiv, /<p class="filter-empty" role="status" hidden>/);
  assert.ok(pravidlo(css, ".sr-only"), ".sr-only v CSS chybí — .filter-count by byl vidět");
  assert.match(base, /<section class="newsletter" id="newsletter" aria-labelledby="newsletter-nadpis">/, "landmark z kola 28");
});
