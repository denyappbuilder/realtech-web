import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { TRIDA_OBALU, obalTabulky, rehypeTabulky } from "../src/lib/rehype-tabulky.js";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");
const karta = readFileSync(join(koren, "src/components/ArticleCard.astro"), "utf8");
const config = readFileSync(join(koren, "astro.config.mjs"), "utf8");

function blokMedia(dotaz) {
  const start = css.search(new RegExp(`@media\\s*\\(${dotaz}\\)\\s*\\{`));
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

function pravidlo(zdroj, selektor) {
  const shoda = zdroj.match(
    new RegExp(`(?:^|[\\s}])${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`, "m"),
  );
  return shoda?.[1] ?? "";
}

// ── P0: Poslední reporty pod 901px nesmí přeskočit rail ─────────────────

test("kolo 17: tři články z railu jdou pod 901px i do mřížky Poslední reporty", () => {
  assert.match(index, /const rail = candidates\.slice\(0,\s*3\)/, "rail zůstává první tři kandidáti");
  assert.match(index, /const rest = candidates\.slice\(3,\s*9\)/, "desktopových 6 karet zůstává dalších šest");
  assert.match(index, /const railCards = rail;/, "karty pro mobil musí být tytéž články jako rail");

  const mrizka = index.slice(index.indexOf('<h2>Poslední reporty</h2>'));
  const railKarty = mrizka.indexOf('railCards.map');
  const restKarty = mrizka.indexOf('rest.map');
  assert.ok(railKarty > -1, "mřížka Poslední reporty nekreslí railCards");
  assert.ok(restKarty > -1, "mřížka Poslední reporty nekreslí rest");
  assert.ok(railKarty < restKarty, "railové karty musí být před rest — chronologie");
  assert.match(
    mrizka.slice(railKarty, restKarty),
    /<ArticleCard article=\{article\} class="card-rail-mobile" \/>/,
    "railové karty musí nést .card-rail-mobile, aby je desktop skryl",
  );
  assert.doesNotMatch(
    mrizka.slice(restKarty, restKarty + 80),
    /card-rail-mobile/,
    "rest karty nesmí mít .card-rail-mobile",
  );
});

test("kolo 17: .card-rail-mobile skrývá jen desktop (≥901px), kde rail vidí", () => {
  assert.equal(
    pravidlo(css.replaceAll(blokMedia("min-width:\\s*901px"), ""), ".card-rail-mobile"),
    "",
    ".card-rail-mobile nesmí mít pravidlo mimo @media (min-width: 901px) — na mobilu by karty zmizely",
  );
  const desktop = blokMedia("min-width:\\s*901px");
  assert.match(
    pravidlo(desktop, ".card.card-rail-mobile"),
    /display:\s*none/,
    "od 901px musí být duplicitní karty skryté — a to selektorem .card.card-rail-mobile, samotná třída prohrává s pozdějším .card { display: flex }",
  );
  assert.equal(pravidlo(desktop, ".card-rail-mobile"), "", "samotný .card-rail-mobile nestačí (specificita vs .card)");
  assert.match(pravidlo(desktop, ".hero-rail"), /display:\s*block/, "rail se od 901px musí ukázat");
});

test("kolo 17: ArticleCard přijímá class a bez ní vrací přesně class=\"card\"", () => {
  assert.match(karta, /class\?: string;/, "Props musí mít volitelný class");
  assert.match(
    karta,
    /const cardClass = extraClass \? `card \$\{extraClass\}` : 'card';/,
    "bez class musí zůstat přesně \"card\" (testy archivu a hubu na to parsují)",
  );
  assert.match(karta, /<article class=\{cardClass\} data-category=\{category\}>/);
});

// ── P1: markdown tabulky v článku ───────────────────────────────────────

const el = (tagName, children = [], properties = {}) => ({ type: "element", tagName, properties, children });
const tabulka = () => el("table", [el("tbody", [el("tr", [el("td", [{ type: "text", value: "x" }])])])]);

test("kolo 17: rehypeTabulky obalí tabulku do div.table-wrap a neobaluje dvakrát", () => {
  const tree = { type: "root", children: [el("p"), tabulka(), { type: "raw", value: "<b>x</b>" }, el("section", [tabulka()])] };
  rehypeTabulky()(tree);

  const [, obal, raw, section] = tree.children;
  assert.equal(obal.tagName, "div");
  assert.deepEqual(obal.properties.className, [TRIDA_OBALU]);
  assert.equal(obal.children.length, 1);
  assert.equal(obal.children[0].tagName, "table");
  assert.equal(raw.type, "raw", "raw uzly (X embed) musí projít beze změny");
  assert.equal(section.children[0].tagName, "div", "tabulka vnořená hlouběji se obalí taky");

  assert.equal(obalTabulky(tree), 0, "druhý průchod nesmí přidat další obal");
  assert.equal(tree.children[1].children[0].tagName, "table");
});

test("kolo 17: rehypeTabulky je zaregistrovaný v astro.config za X embedy", () => {
  assert.match(config, /import \{ rehypeTabulky \} from '\.\/src\/lib\/rehype-tabulky\.js';/);
  assert.match(
    config,
    /rehypePlugins:\s*\[rehypeAsciiHeadingIds,\s*rehypeXEmbedy,\s*rehypeTabulky\]/,
    "rehypeTabulky musí být poslední — X embed počítá indexy odstavců v tree.children",
  );
});

test("kolo 17: .article-body má styly tabulky s rolovacím obalem", () => {
  const obal = pravidlo(css, ".article-body .table-wrap");
  assert.match(obal, /overflow-x:\s*auto/, "obal musí rolovat vodorovně");
  assert.match(obal, /border:\s*1px solid var\(--line\)/);

  const table = pravidlo(css, ".article-body table");
  assert.match(table, /width:\s*100%/);
  assert.match(table, /border-collapse:\s*collapse/);
  assert.doesNotMatch(table, /display:\s*block/, "display: block by tabulce vzal sémantiku");

  const th = pravidlo(css, ".article-body th");
  assert.match(th, /IBM Plex Mono/, "hlavička drží mono štítky jako card-meta");
  assert.match(th, /background:\s*var\(--bg\)/, "hlavička bere token, ne pevnou barvu (dark mode)");
  assert.match(th, /border-bottom:\s*2px solid var\(--ink\)/);
  assert.match(css, /\n\.article-body td \{ border-top: 1px solid var\(--line\); \}/, "buňky dělí linka tokenem --line");
  assert.doesNotMatch(
    css.slice(css.indexOf(".article-body .table-wrap"), css.indexOf(".article-back {")),
    /#[0-9a-fA-F]{3,8}\b/,
    "styly tabulky nesmí mít pevné hex barvy — dark mode jde přes tokeny",
  );

  const mobil = blokMedia("max-width:\\s*580px");
  assert.match(
    pravidlo(mobil, ".article-body .table-wrap"),
    /margin-inline:\s*-20px/,
    "na 375px má tabulka jít k okraji karty článku (padding 20px)",
  );
  assert.match(pravidlo(mobil, ".article-body"), /padding:\s*20px/, "mobilní padding .article-body se změnil — přepočítej margin-inline obalu");
});
