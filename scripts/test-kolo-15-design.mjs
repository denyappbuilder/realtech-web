import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const ctyristactyri = readFileSync(join(koren, "src/pages/404.astro"), "utf8");

function telo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.").replaceAll(">", "\\>").replaceAll("*", "\\*")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

function blokMedia(maxPx) {
  const start = css.search(new RegExp(`@media\\s*\\(max-width:\\s*${maxPx}px\\)\\s*\\{`));
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

test("kolo 15: .notfound nesmí vynulovat vodorovné odsazení z .wrap (Z10254 znovu)", () => {
  const notfound = telo(".notfound");
  assert.ok(notfound, ".notfound v CSS chybí");
  assert.doesNotMatch(
    notfound,
    /padding:\s*[^;]*\s0(px)?\s*;/,
    ".notfound má `padding` shorthand s nulou vodorovně — na mobilu sedí nadpis na x=0",
  );
  assert.match(notfound, /padding-block:\s*90px/);
});

test("kolo 15: h1 a perex 404 mají typografii webu, ne UA výchozí", () => {
  const h1 = telo(".notfound h1");
  assert.match(h1, /Archivo Variable/, "404 h1 pořád padá na Plex Sans 2em bold");
  assert.match(h1, /font-stretch/);
  assert.match(telo(".notfound .lead"), /var\(--ink-soft\)/, "perex 404 je prostý odstavec");
  assert.doesNotMatch(ctyristactyri, /style="margin-top/, "inline margin patří do třídy");
  assert.match(ctyristactyri, /class="wrap notfound-more"/);
  assert.match(telo(".notfound-more"), /margin-top:\s*48px/);
});

test("kolo 15: na 375px se logo nesmí kreslit pod tlačítko hledání", () => {
  const blok = blokMedia(400);
  assert.ok(blok, "chybí @media (max-width: 400px) pro header na 371–400px");
  assert.match(blok, /header\.site \.logo \{\s*font-size:\s*0\.95rem/);
  assert.match(blok, /header\.site \.header-actions \{\s*gap:\s*4px/);
  assert.match(blok, /header\.site \.yt-btn \{\s*padding-inline:\s*10px/);
  const uzky = blokMedia(370);
  assert.doesNotMatch(uzky, /\.logo \{\s*font-size/, "velikost loga se duplikuje v bloku 370px");
});

test("kolo 15: odkaz v .section-head neláme šipku a má 44px cíl bez posunu linky", () => {
  assert.match(telo(".section-head"), /gap:\s*16px/);
  const odkaz = telo(".section-head a");
  assert.match(odkaz, /white-space:\s*nowrap/);
  assert.match(odkaz, /flex-shrink:\s*0/);
  assert.match(odkaz, /padding-block:\s*11px/);
  assert.match(odkaz, /margin-block:\s*-11px/, "bez záporného marginu se section-head zvýší");
});

test("kolo 15: obsah .lower-third je svisle vycentrovaný k 44px a.tag", () => {
  const deti = telo(".lower-third > *");
  assert.ok(deti, ".lower-third > * v CSS chybí");
  assert.match(deti, /display:\s*inline-flex/);
  assert.match(deti, /align-items:\s*center/);
});

test("kolo 15: odkaz na téma v aside článku má afordanci odkazu", () => {
  assert.match(telo(".article-aside-meta a"), /color:\s*var\(--signal-dark\)/);
  assert.match(telo(".article-aside-meta a:hover"), /text-decoration:\s*underline/);
});

test("kolo 15: štítek délky videa bere --panel, ne rgba light panelu", () => {
  const t = telo(".card-thumb .lt .t");
  assert.match(t, /color-mix\(in srgb,\s*var\(--panel\)\s+85%/);
  assert.doesNotMatch(t, /rgba\(\s*20\s*,\s*23\s*,\s*28/);
});

test("kolo 15: čísla na O nás drží Archivo jako ostatní titulky", () => {
  const stat = telo(".stat strong");
  assert.match(stat, /'Archivo Variable',\s*'Archivo'/);
  assert.match(stat, /font-stretch:\s*108%/);
  assert.doesNotMatch(stat, /letter-spacing:\s*0\.5px/, "kladný proklad je leftover");
});

test("kolo 15: fokus ring pokrývá i summary, dead token --steel je pryč", () => {
  assert.match(css, /a:focus-visible,\s*button:focus-visible,\s*summary:focus-visible\s*\{/);
  assert.doesNotMatch(css, /--steel/, "--steel nikdo nečte");
  assert.match(telo(".nl-note"), /color:\s*#828B98/i, ".nl-note má brát dark --ink-faint, ne šedou mimo paletu");
});

test("kolo 15: mobilní patička a archiv", () => {
  assert.match(
    css,
    /@media \(max-width: 900px\) \{\s*\n\s*footer\.site \.f-nav ul \{ gap: 0; \}/,
    "gap 0 musí být až za základním pravidlem .f-nav ul (stejná specificita)",
  );
  assert.match(blokMedia(580), /\.filter-bar \.search-input \{\s*width:\s*100%/);
});
