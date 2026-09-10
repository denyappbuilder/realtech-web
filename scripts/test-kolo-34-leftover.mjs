// Kolo 34: leftover po kole 33 (#426 živě). Živý audit 9. 9. 2026
// (úvodka s Muse — zprava: true, článek na 1280×600 a 1280×800) proti kódu.
//
// P1: Muse je krátká zpráva (zprava: true, karta i hlava článku nesou chip
//     „Zpráva“), ale CTA úvodky slibovalo „Přečíst analýzu“. Text sleduje
//     frontmatter: „Přečíst zprávu“ / „Přečíst analýzu“.
// P1: kolo 29 skrylo .article-share jen tam, kde je aside sticky
//     (≥ 901px a ≥ 640px na výšku). Na desktopu nižším než 640px zůstal
//     aside i .article-share — šest tlačítek sdílení. Teď v každé výšce
//     desktopu je vidět přesně jedna skupina.
// P2: serverový title přepínače tématu „Světlý/tmavý režim“ neseděl
//     s aria-pressed="false" — bez JS říkal stav, ne akci.
// P2: hero úvodky ukazuje chip „Zpráva“ jako hlava článku a karta.
// P2: poznámka o selhání widgetu X přichází po 15 s — bez role="status"
//     o ní čtečka nevěděla.
// P3: Kopírovat odkaz při selhání Clipboard API dělalo location.href = url
//     (reload, ztráta pozice). Teď execCommand fallback a hlášení.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { textNaHeroObrazku, CTA_TLACITKA } from "../src/lib/hero-overlay.js";
import { zkopirujExecCommand, zkopirujText } from "../src/lib/kopirovat-odkaz.js";
import { oznacSelhaniXFacade } from "../src/lib/x-embed.js";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const base = cti("src/layouts/Base.astro");
const uvodka = cti("src/pages/index.astro");
const clanek = cti("src/pages/clanky/[...id].astro");
const muse = cti("src/content/clanky/meta-muse-agent-usa.md");

/** Celý blok @media včetně vnořených závorek (jako v kolech 19 a 29). */
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

// ── P1: CTA úvodky sleduje zprava ────────────────────────────────────────

test("kolo 34: heroCta = „Přečíst zprávu“ u zprava: true, jinak „Přečíst analýzu“", () => {
  assert.match(uvodka, /const heroJeZprava = Boolean\(hero\?\.data\.zprava\);/);
  assert.match(uvodka, /const heroCta = heroJeZprava \? 'Přečíst zprávu' : 'Přečíst analýzu';/);
  assert.match(
    uvodka,
    /<a href=\{`\/clanky\/\$\{hero\.id\}\/`\} class="btn-primary">\{heroCta\}<\/a>/,
    "tlačítko nese heroCta, cíl zůstává /clanky/${hero.id}/",
  );
  assert.doesNotMatch(uvodka, /class="btn-primary">Přečíst analýzu</, "natvrdo „Přečíst analýzu“ už v šabloně nesmí být");
  // Živý audit 9. 9. 2026: hero byl Muse se zprava: true.
  assert.match(muse, /^zprava: true$/m, "Muse je zpráva — právě u něj živě CTA lhalo");
});

test("kolo 34: overlay hero nezdvojí ani jednu z obou CTA", () => {
  assert.deepEqual(CTA_TLACITKA, ["Přečíst analýzu", "Přečíst zprávu"]);
  assert.equal(textNaHeroObrazku({ title: "X", video: "https://youtu.be/abc" }), "Pustit video");
  assert.equal(textNaHeroObrazku({ title: "X", zprava: true }), "", "bez videa overlay mlčí — CTA nese tlačítko");
  assert.equal(textNaHeroObrazku({ title: "Přečíst zprávu" }), "");
});

// ── P2: chip „Zpráva“ v lower-third hera ─────────────────────────────────

test("kolo 34: hero úvodky nese chip „Zpráva“ hned za kategorií, stejně jako hlava článku", () => {
  const lowerThird = uvodka.match(/<div class="lower-third">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.ok(lowerThird, "hero ztratil .lower-third");
  // Kolo 35: štítek kategorie je a.tag na /temata/{slug}/ (jako v článku), ne <span>.
  assert.match(
    lowerThird,
    /<a class="tag" href=\{`\/temata\/\$\{slugify\(hero\.data\.category\)\}\/`\}>\{hero\.data\.category\}<\/a>\s*\{heroJeZprava && <span class="tag tag-zprava">Zpráva<\/span>\}\s*<time class="time"/,
    "pořadí kategorie → Zpráva → datum jako v článku",
  );
  assert.match(clanek, /\{zprava && <span class="tag tag-zprava">Zpráva<\/span>\}/, "vzor z hlavy článku zůstává");
  assert.match(css, /\.lower-third \.tag-zprava \{ background: var\(--ink\); color: var\(--bg\); \}/, "chip má styl společný pro hero i článek");
});

// ── P1: na desktopu je vidět přesně jedna skupina sdílení ────────────────

test("kolo 34: aside má sdílení v obalu .article-aside-share, .article-share pod textem zůstává", () => {
  const aside = clanek.match(/<aside class="article-aside">([\s\S]*?)<\/aside>/)?.[1] ?? "";
  assert.ok(aside, "aside článku chybí");
  assert.match(
    aside,
    /<div class="article-aside-share">\s*<p class="mono">Sdílej dál<\/p>\s*<div class="share-btns">[\s\S]*?<\/div>\s*<\/div>/,
    "popisek i tlačítka v jednom obalu — CSS skrývá celek, ne jen tlačítka",
  );
  assert.equal((clanek.match(/class="share-btns"/g) ?? []).length, 2, "markup nese obě místa — vybírá CSS (kolo 29)");
  assert.match(clanek, /<div class="article-share">\s*<span class="mono">\/\/ Sdílej dál<\/span>/);
  // První .mono v aside je „V článku“ přímo v aside; „Sdílej dál“ je první
  // v obalu a nesmí přijít o odstup — proto přímý potomek.
  assert.match(css, /\.article-aside > \.mono:first-child \{ margin-top: 0; \}/);
  assert.doesNotMatch(css, /\.article-aside \.mono:first-child/, "obecný :first-child by srazil odstup „Sdílej dál“ v obalu");
});

test("kolo 34: výšky desktopu se dělí na 640px — sticky aside skryje .article-share, nižší okno skryje sdílení v aside", () => {
  const vysoke = css.match(/@media\s*\(min-width: 901px\) and \(min-height: 640px\)\s*\{\s*\.article-share\s*\{\s*display:\s*none;?\s*\}\s*\}/);
  assert.ok(vysoke, "skrytí .article-share z kola 29 zůstává");
  const nizke = css.match(/@media\s*\(min-width: 901px\) and \(max-height: 639px\)\s*\{\s*\.article-aside-share\s*\{\s*display:\s*none;?\s*\}\s*\}/);
  assert.ok(nizke, "chybí doplněk: pod 640px na výšku se skrývá .article-aside-share");
  // Doplněk dotazu: min-height 640 ∪ max-height 639 = všechny celočíselné
  // výšky, průnik prázdný — v žádné výšce obě skupiny, v každé jedna.
  const sticky = blokMedia("\\(min-width: 901px\\) and \\(min-height: 640px\\)");
  assert.match(sticky, /\.article-aside\s*\{\s*position:\s*sticky;\s*top:\s*81px;?\s*\}/, "sticky aside sedí přesně s výškou, kde .article-share mizí");
  assert.ok(nizke.index > css.search(/\n\.article-share\s*\{/), "oba dotazy stojí za základním .article-share");
  const tablet = blokMedia("\\(max-width: 900px\\)");
  assert.match(tablet, /\.article-aside\s*\{\s*display:\s*none;?\s*\}/, "pod 901px je jediná cesta .article-share (kolo 19)");
  assert.doesNotMatch(tablet, /\.article-aside-share/, "pod 901px obal nic neřeší — aside tam není celý");
});

// ── P2: serverový title přepínače ────────────────────────────────────────

test("kolo 34: #theme-toggle ze serveru: aria-pressed=false + title „Přepnout na tmavý režim“, aria-label stálý", () => {
  const tlacitko = base.match(/<button id="theme-toggle"[^>]*>/)?.[0];
  assert.ok(tlacitko, "#theme-toggle v Base chybí");
  assert.match(tlacitko, /aria-label="Tmavý režim"/, "jméno zůstává (kolo 33, APG)");
  assert.match(tlacitko, /aria-pressed="false"/);
  assert.match(tlacitko, /title="Přepnout na tmavý režim"/, "title = akce pro výchozí světlý stav, ne „Světlý/tmavý režim“");
  assert.doesNotMatch(tlacitko, /title="Světlý\/tmavý režim"/);
  // Skript z kola 33 title dál přepisuje podle skutečného stavu.
  assert.match(base, /toggle\?\.setAttribute\('title', tmavy \? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'\);/);
});

// ── P2: poznámka o selhání X jako živá oblast ────────────────────────────

/** Holý DOM jen pro oznacSelhaniXFacade — stejný tvar jako v test-x-embed. */
function fasadaX() {
  class Prvek {
    constructor(tag, doc) {
      this.tagName = tag.toUpperCase();
      this.ownerDocument = doc;
      this.dataset = {};
      this.children = [];
      this.attrs = new Map();
      this.className = "";
      this.textContent = "";
      this.parentNode = null;
      const tridy = new Set();
      this.classList = { add: (c) => tridy.add(c), remove: (c) => tridy.delete(c), contains: (c) => tridy.has(c) };
    }
    setAttribute(n, v) { this.attrs.set(n, String(v)); }
    getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; }
    appendChild(dite) { this.children.push(dite); dite.parentNode = this; return dite; }
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((c) => c !== this); }
    querySelector(sel) {
      const trida = sel.startsWith(".") ? sel.slice(1) : null;
      return this.children.find((c) => (trida ? c.className === trida : c.tagName === sel.toUpperCase())) ?? null;
    }
  }
  const doc = { createElement: (tag) => new Prvek(tag, doc) };
  const facade = new Prvek("div", doc);
  facade.dataset.xPostHref = "https://twitter.com/SpaceX/status/2093477720638341395";
  facade.appendChild(new Prvek("blockquote", doc));
  return facade;
}

test("kolo 34: .x-facade-failed-note je role=status + aria-live=polite, jinak beze změny", () => {
  const facade = fasadaX();
  oznacSelhaniXFacade(facade);
  const note = facade.querySelector(".x-facade-failed-note");
  assert.ok(note, "poznámka o selhání chybí");
  assert.equal(note.getAttribute("role"), "status");
  assert.equal(note.getAttribute("aria-live"), "polite");
  assert.equal(note.children.length, 2, "věta + odkaz, jako v kole 31");
  assert.equal(note.children[1].href, "https://x.com/SpaceX/status/2093477720638341395");
  assert.ok(facade.classList.contains("x-facade-failed"));
  // Druhé selhání nepřidá druhou živou oblast.
  oznacSelhaniXFacade(facade);
  assert.equal(facade.children.filter((c) => c.className === "x-facade-failed-note").length, 1);
});

// ── P3: Kopírovat odkaz bez reloadu ──────────────────────────────────────

/** Holý Document pro kopirovat-odkaz.js: clipboard volitelný, execCommand volitelný. */
function dokument({ clipboard, execCommand } = {}) {
  const zaznam = { pridano: [], odebrano: [], vybrano: 0, exec: [], fokus: 0 };
  const tlacitko = { focus: () => { zaznam.fokus += 1; } };
  const doc = {
    defaultView: { navigator: clipboard === undefined ? {} : { clipboard } },
    activeElement: tlacitko,
    body: { appendChild: (el) => { zaznam.pridano.push(el); el.parentNode = doc.body; }, children: [] },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      value: "",
      attrs: new Map(),
      style: {},
      parentNode: null,
      setAttribute(n, v) { this.attrs.set(n, String(v)); },
      select() { zaznam.vybrano += 1; },
      remove() { zaznam.odebrano.push(this); this.parentNode = null; },
    }),
  };
  if (execCommand) doc.execCommand = (cmd) => { zaznam.exec.push(cmd); return execCommand(cmd); };
  return { doc, zaznam };
}

test("kolo 34: zkopirujText — Clipboard API projde, execCommand se nesahá", async () => {
  let zapsano = "";
  const { doc, zaznam } = dokument({
    clipboard: { writeText: async (t) => { zapsano = t; } },
    execCommand: () => { throw new Error("nesmí se volat"); },
  });
  assert.equal(await zkopirujText("https://realtech.cz/clanky/x/", doc), true);
  assert.equal(zapsano, "https://realtech.cz/clanky/x/");
  assert.equal(zaznam.exec.length, 0);
  assert.equal(zaznam.pridano.length, 0, "žádný dočasný textarea");
});

test("kolo 34: zkopirujText — Clipboard API zamítne → execCommand('copy') přes dočasný textarea, pole zmizí, fokus zpět", async () => {
  const { doc, zaznam } = dokument({
    clipboard: { writeText: async () => { throw new DOMException("denied", "NotAllowedError"); } },
    execCommand: () => true,
  });
  assert.equal(await zkopirujText("https://realtech.cz/clanky/x/", doc), true);
  assert.deepEqual(zaznam.exec, ["copy"]);
  assert.equal(zaznam.pridano.length, 1);
  const pole = zaznam.pridano[0];
  assert.equal(pole.tagName, "TEXTAREA");
  assert.equal(pole.value, "https://realtech.cz/clanky/x/");
  assert.equal(pole.attrs.get("aria-hidden"), "true", "pole nesmí do čtečky");
  assert.equal(pole.attrs.get("tabindex"), "-1");
  assert.equal(pole.attrs.get("readonly"), "", "readonly — iOS by jinak vyjel klávesnici");
  assert.equal(zaznam.vybrano, 1);
  assert.deepEqual(zaznam.odebrano, [pole], "dočasné pole hned zase pryč");
  assert.equal(zaznam.fokus, 1, "fokus se vrací na tlačítko, ne na <body>");
});

test("kolo 34: zkopirujText — bez navigator.clipboard (http) jde rovnou na execCommand", async () => {
  const { doc, zaznam } = dokument({ execCommand: () => true });
  assert.equal(await zkopirujText("u", doc), true);
  assert.deepEqual(zaznam.exec, ["copy"]);
});

test("kolo 34: zkopirujText — když selže i execCommand (nebo chybí), vrací false a nehází", async () => {
  const bezNiceho = dokument({});
  assert.equal(await zkopirujText("u", bezNiceho.doc), false);
  assert.equal(bezNiceho.zaznam.pridano.length, 0, "bez execCommand se textarea ani nevkládá");

  const odmitne = dokument({ execCommand: () => false });
  assert.equal(await zkopirujText("u", odmitne.doc), false);
  assert.equal(odmitne.zaznam.odebrano.length, 1, "pole se uklidí i po neúspěchu");
  assert.equal(odmitne.zaznam.fokus, 1);

  const hodi = dokument({ execCommand: () => { throw new Error("SecurityError"); } });
  assert.equal(zkopirujExecCommand("u", hodi.doc), false);
  assert.equal(hodi.zaznam.odebrano.length, 1);
  assert.equal(await zkopirujText("u", undefined), false, "bez dokumentu (SSR) false, ne pád");
});

test("kolo 34: skript článku už při selhání nenaviguje — hlásí tlačítkem i živou oblastí", () => {
  const skript = clanek.match(/<script>([\s\S]*?)<\/script>\s*<\/Base>/)?.[1] ?? "";
  assert.ok(skript, "klientský skript článku chybí");
  assert.match(skript, /import \{ zkopirujText \} from '\.\.\/\.\.\/lib\/kopirovat-odkaz\.js';/);
  const kopirovani = skript.slice(skript.indexOf("querySelectorAll<HTMLButtonElement>('.copy-link')"));
  assert.ok(kopirovani, "obsluha .copy-link chybí");
  assert.doesNotMatch(kopirovani, /location\.href\s*=/, "reload stránky při selhání schránky — ztráta pozice čtení (kolo 34)");
  assert.doesNotMatch(kopirovani, /navigator\.clipboard\.writeText/, "Clipboard API volá modul, ne skript");
  assert.match(kopirovani, /const ok = await zkopirujText\(url\);/);
  assert.match(kopirovani, /copyBtn\.textContent = 'Zkopírováno ✓';\s*ohlasKopii\('Odkaz na článek zkopírován'\);/);
  assert.match(kopirovani, /copyBtn\.textContent = 'Kopírování selhalo';\s*ohlasKopii\('Odkaz se nepodařilo zkopírovat\. Zkopíruj adresu z řádku prohlížeče\.'\);/);
  assert.match(kopirovani, /setTimeout\(\(\) => \{ copyBtn\.textContent = 'Kopírovat odkaz'; \}, 2000\)/, "návrat k stálému textu po 2 s v obou větvích");
  assert.match(clanek, /<p class="sr-only" role="status" aria-live="polite" data-copy-status><\/p>/, "živá oblast z kola 22 zůstává");
});
