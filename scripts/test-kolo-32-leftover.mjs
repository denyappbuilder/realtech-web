// Kolo 32: leftover po kolech 29–31 (#415, #419, #420 živě). Živý audit
// 8. 9. 2026 (úvodka, /clanky/, /temata/, /temata/drony/, /o-nas/, 404)
// proti kódu.
//
// P2: /temata/drony/ ukazovalo „2 článků“ — stránka tématu skloňovala
//     natvrdo, hub /temata/ měl vlastní správný helper. Jeden sdílený.
// P2: Enter na tlačítku „Zavřít hledání“ (Tab z pole ⌘K) s výsledky
//     v listboxu poslal čtenáře na první článek — keydown handler sedí na
//     document a navigoval dřív, než click tlačítka dialog zavřel.
// P3: theme-color při uloženém tématu měnil až deferred modul na konci
//     <body> — rám prohlížeče na telefonu při každém načtení bliknul barvou
//     OS. Inline skript v <head> ho přepíše před prvním nátěrem.
// P3: 404 měla za „pracujeme na tom" rovné uvozovky; O nás počítalo do
//     „článků na webu“ i drafty.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { textPoctuClanku } from "../src/lib/pocet-clanku.js";
import { nactiModal } from "./test-search-modal-loader.mjs";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const base = cti("src/layouts/Base.astro");
const tema = cti("src/components/TemaPage.astro");
const hub = cti("src/pages/temata/index.astro");
const archiv = cti("src/components/ArticleArchivePage.astro");
const oNas = cti("src/pages/o-nas.astro");
const notfound = cti("src/pages/404.astro");

// ── Počet článků česky ────────────────────────────────────────────────────

test("kolo 32: textPoctuClanku skloňuje 1 článek / 2–4 články / 0 a 5+ článků", () => {
  assert.equal(textPoctuClanku(0), "0 článků");
  assert.equal(textPoctuClanku(1), "1 článek");
  assert.equal(textPoctuClanku(2), "2 články");
  assert.equal(textPoctuClanku(4), "4 články");
  assert.equal(textPoctuClanku(5), "5 článků");
  assert.equal(textPoctuClanku(53), "53 článků");
});

test("kolo 32: stránka tématu i hub berou počet ze sdíleného helperu, ne natvrdo „článků“", () => {
  assert.match(tema, /import \{ textPoctuClanku \} from '\.\.\/lib\/pocet-clanku\.js'/);
  assert.match(tema, /<span class="time">\{textPoctuClanku\(clanky\.length\)\.toUpperCase\(\)\}<\/span>/);
  assert.doesNotMatch(tema, /\{clanky\.length\} článků/, "„2 článků“ z /temata/drony/ (živě 8. 9. 2026)");
  assert.match(hub, /import \{ textPoctuClanku \} from '\.\.\/\.\.\/lib\/pocet-clanku\.js'/);
  assert.match(hub, /\{textPoctuClanku\(t\.pocet\)\.toUpperCase\(\)\}/);
  assert.doesNotMatch(hub, /const pocetClankuText/, "lokální kopie helperu v hubu má být pryč");
});

test("kolo 32: klientský skript archivu drží stejnou českou shodu (kolo 29) — inline <script> importovat nemůže", () => {
  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  assert.match(skript, /if \(pocet === 1\) return '1 článek';/);
  assert.match(skript, /if \(pocet >= 2 && pocet <= 4\) return `\$\{pocet\} články`;/);
  assert.match(skript, /return `\$\{pocet\} článků`;/);
});

// ── ⌘K: Enter jen z pole ──────────────────────────────────────────────────

const VYSLEDKY = [
  { s: "claude-opus-5", t: "Claude Opus 5", d: "", k: "AI Report", b: "", p: "2026-09-01" },
  { s: "gemini-38", t: "Gemini 3.8", d: "", k: "AI Report", b: "", p: "2026-08-20" },
];

function keydown(modal, udalost) {
  for (const fn of modal.dokument.posluchaci.get("keydown") ?? []) {
    fn({ preventDefault() {}, metaKey: false, ctrlKey: false, shiftKey: false, ...udalost });
  }
}

test("kolo 32: Enter na tlačítku „Zavřít hledání“ s výsledky NEnaviguje — nechá tlačítko zavřít dialog", () => {
  const modal = nactiModal({ hledatelne: VYSLEDKY });
  modal.overlay.hidden = false;
  modal.nastavCurrent(VYSLEDKY);
  modal.nastavActive(0);
  // Tab z pole na tlačítko: e.target je tlačítko, ne input.
  keydown(modal, { key: "Enter", target: modal.odkaz });
  assert.equal(modal.sandbox.location.href, "", "Enter mimo pole nesmí otevřít první výsledek");
});

test("kolo 32: Enter v poli otvírá aktivní výsledek dál (šipky + Enter z kola 28 fungují)", () => {
  const modal = nactiModal({ hledatelne: VYSLEDKY });
  modal.overlay.hidden = false;
  modal.nastavCurrent(VYSLEDKY);
  modal.nastavActive(1);
  keydown(modal, { key: "Enter", target: modal.input });
  assert.equal(modal.sandbox.location.href, "/clanky/gemini-38/");
});

test("kolo 32: zavřený modal Enter ignoruje (handler končí na overlay.hidden)", () => {
  const modal = nactiModal({ hledatelne: VYSLEDKY });
  modal.nastavCurrent(VYSLEDKY);
  keydown(modal, { key: "Enter", target: modal.input });
  assert.equal(modal.sandbox.location.href, "");
});

// ── theme-color před prvním nátěrem ──────────────────────────────────────

test("kolo 32: theme-color meta stojí v <head> PŘED inline skriptem tématu a ten je při uloženém tématu přepíše", () => {
  const hlava = base.slice(base.indexOf("<head>"), base.indexOf("</head>"));
  const metaLight = hlava.indexOf('<meta name="theme-color" content="#F6F7F9" media="(prefers-color-scheme: light)"');
  const metaDark = hlava.indexOf('<meta name="theme-color" content="#0F1216" media="(prefers-color-scheme: dark)"');
  const inline = hlava.indexOf("<script is:inline>");
  assert.ok(metaLight > -1 && metaDark > -1, "obě media theme-color (kolo 12) musí zůstat");
  assert.ok(inline > -1, "inline skript tématu v <head> chybí");
  assert.ok(metaLight < inline && metaDark < inline, "querySelectorAll v inline skriptu vidí jen to, co už je naparsované — meta musí být před ním");
  assert.equal(hlava.match(/<meta name="theme-color"/g)?.length, 2, "theme-color jen jednou pro každé schéma");

  const skript = hlava.slice(inline, hlava.indexOf("</script>", inline));
  assert.match(skript, /localStorage\.getItem\('theme'\)/);
  assert.match(skript, /document\.documentElement\.dataset\.theme = t;/, "data-theme pro CSS zůstává první");
  assert.match(skript, /t === 'dark' \? '#0F1216' : '#F6F7F9'/, "barvy = --bg light/dark z global.css");
  assert.match(skript, /querySelectorAll\('meta\[name="theme-color"\]'\)/);
  assert.match(skript, /setAttribute\('content', barva\)/);
  assert.doesNotMatch(skript, /=>|\bconst\b|\blet\b/, "inline skript bez transpilace zůstává ES5 (var, function) jako dosud");
  assert.match(skript, /\} catch \(e\) \{\}/, "localStorage bez povolení (privátní režim, blokované cookies) nesmí shodit skript");
});

test("kolo 32: barvy v inline skriptu odpovídají --bg tokenům v global.css", () => {
  const css = cti("src/styles/global.css");
  const bezMedia = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");
  assert.match(bezMedia, /:root\s*\{[^}]*--bg:\s*#F6F7F9;/, "light --bg");
  assert.match(css, /:root\[data-theme="dark"\]\s*\{[^}]*--bg:\s*#0F1216;/, "dark --bg");
});

test("kolo 32: deferred modul dál srovnává theme-color s CSS (kolo 18) — inline skript ho nenahrazuje, jen předbíhá", () => {
  const modul = base.slice(base.lastIndexOf("<script>"));
  assert.match(modul, /if \(document\.documentElement\.dataset\.theme\) nastavThemeColor\(\);/);
});

// ── Drobnosti: 404 a O nás ────────────────────────────────────────────────

test("kolo 32: perex 404 má české uvozovky „…“ (dřív „pracujeme na tom\")", () => {
  assert.match(notfound, /„pracujeme na tom“/);
  assert.doesNotMatch(notfound, /„[^“]*"/, "otevírací „ bez zavírací “");
});

test("kolo 32: „článků na webu“ na O nás počítá jen publikované (drafty filtrují všechny ostatní výpisy)", () => {
  assert.match(oNas, /const pocetClanku = \(await getCollection\('clanky', \(\{ data \}\) => !data\.draft\)\)\.length;/);
  assert.doesNotMatch(oNas, /getCollection\('clanky'\)\)/, "getCollection bez filtru draftů");
});
