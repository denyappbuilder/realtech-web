// Kolo 19 — leftover z živého auditu 4. 9. 2026 po #386 (homepage,
// /clanky/, dva nejnovější články, /temata/, /temata/ai-report/, /o-nas/;
// light + dark; 390/768/1280, headless Chrome). Overflow, LCP, focus-visible
// i theme-color už seděly; zbýval kontrast bílého textu na červené v darku,
// odkazy v textu O nás k nerozeznání od textu, dialog hledání bez zavíracího
// tlačítka a aside článku, který na mobilu jen opakoval, co už na stránce je.
// Šablony hlídáme jako text, stejně jako kolo 12–18.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const modal = cti("src/components/SearchModal.astro");
const oNas = cti("src/pages/o-nas.astro");

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

function telo(selektor, zdroj = css) {
  const vzor = selektor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return zdroj.match(new RegExp(`(?:^|\\n)${vzor}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

/** Kontrast WCAG 2.x mezi dvěma hex barvami. */
function kontrast(hexA, hexB) {
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const [l1, l2] = [lum(hexA), lum(hexB)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ── Dark mode: bílý text na červené výplni musí mít AA (4,5:1) ─────────

test("kolo 19: --signal-fill je deklarovaný v :root a tmavé bloky ho nepřepisují", () => {
  const root = css.match(/^:root\s*\{([^}]+)\}/m)?.[1] ?? "";
  const fill = root.match(/--signal-fill:\s*(#[0-9A-Fa-f]{6})/)?.[1];
  const hover = root.match(/--signal-fill-hover:\s*(#[0-9A-Fa-f]{6})/)?.[1];
  assert.ok(fill, ":root nemá --signal-fill");
  assert.ok(hover, ":root nemá --signal-fill-hover");
  assert.ok(kontrast(fill, "#FFFFFF") >= 4.5, `bílý text na --signal-fill ${fill} má jen ${kontrast(fill, "#FFFFFF").toFixed(2)}:1`);
  assert.ok(kontrast(hover, "#FFFFFF") >= 4.5, `bílý text na --signal-fill-hover ${hover} má jen ${kontrast(hover, "#FFFFFF").toFixed(2)}:1`);
  const system = blokMedia("\\(prefers-color-scheme: dark\\)");
  const forced = css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.doesNotMatch(system, /--signal-fill/, "systémový dark nesmí výplň zesvětlit");
  assert.doesNotMatch(forced, /--signal-fill/, "forced dark nesmí výplň zesvětlit");
  // Proč token existuje: dark --signal na bílém textu AA nedává.
  const darkSignal = forced.match(/--signal:\s*(#[0-9A-Fa-f]{6})/)?.[1];
  assert.ok(darkSignal && kontrast(darkSignal, "#FFFFFF") < 4.5, "dark --signal už AA dává — token --signal-fill by šel sloučit");
});

test("kolo 19: tlačítka a štítky s bílým textem berou --signal-fill, ne --signal", () => {
  for (const selektor of [".yt-btn", ".lower-third .tag", ".nl-form button", ".nl-cta", ".si-cat"]) {
    const pravidlo = telo(selektor);
    assert.ok(pravidlo, `${selektor} v CSS chybí`);
    assert.match(pravidlo, /background:\s*var\(--signal-fill\)/, `${selektor} nebere --signal-fill`);
    assert.match(pravidlo, /color:\s*#fff/, `${selektor} test hlídá právě bílý text`);
  }
  for (const selektor of [".yt-btn:hover", "a.tag:hover", ".nl-form button:hover", ".nl-cta:hover"]) {
    assert.match(telo(selektor), /background:\s*var\(--signal-fill-hover\)/, `${selektor} nebere --signal-fill-hover`);
  }
});

test("kolo 19: --signal zůstává pro červený text, tečky a fokus (kolo 12–14 tokeny beze změny)", () => {
  const forced = css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(forced, /--signal:\s*#E5322D;/);
  assert.match(forced, /--signal-dark:\s*#F0554F;/);
  assert.match(telo(".live-dot"), /background:\s*var\(--signal\)/);
  assert.match(css, /a:focus-visible, button:focus-visible, summary:focus-visible \{\s*outline: 2px solid var\(--signal\)/);
});

// ── O nás: odkazy v textu musí jít poznat ───────────────────────────────

test("kolo 19: odkazy v odstavcích O nás mají barvu i podtržení", () => {
  const pravidlo = telo(".about-main p a");
  assert.ok(pravidlo, ".about-main p a v CSS chybí — odkazy dědí color: inherit bez podtržení");
  assert.match(pravidlo, /color:\s*var\(--signal-dark\)/);
  assert.match(pravidlo, /text-decoration:\s*underline/);
  // Test má smysl jen dokud v odstavcích O nás odkazy bez třídy opravdu jsou.
  const main = oNas.slice(oNas.indexOf('class="about-main"'), oNas.indexOf('class="about-aside"'));
  const proste = main.match(/<a href="[^"]+">/g) ?? [];
  assert.ok(proste.length >= 3, `O nás má v textu ${proste.length} prostých odkazů, čekaly se aspoň 3 (RealTvorba ×2, e-mail)`);
});

// ── Hledání (⌘K): dialog má zavírací tlačítko ───────────────────────────

test("kolo 19: ESC v hlavičce hledání je <button data-search-close>, ne pouhý <kbd>", () => {
  assert.doesNotMatch(modal, /<kbd class="search-esc">/, "ESC je pořád jen nápověda bez chování");
  const tlacitko = modal.match(/<button type="button" class="search-esc" data-search-close[^>]*>/)?.[0];
  assert.ok(tlacitko, "zavírací tlačítko chybí");
  assert.match(tlacitko, /aria-label="Zavřít hledání"/);
  assert.match(modal, /<kbd class="search-esc-kbd" aria-hidden="true">ESC<\/kbd>/, "desktop dál ukazuje klávesu ESC");
  assert.match(modal, /<svg class="search-esc-x"[^>]*aria-hidden="true">/, "mobil potřebuje křížek");
});

test("kolo 19: skript hledání zavírá modal z data-search-close", () => {
  const skript = modal.slice(modal.lastIndexOf("<script>"));
  assert.match(skript, /querySelectorAll\('\[data-search-close\]'\)\.forEach\(\(el\) =>\s*el\.addEventListener\('click', \(\) => close\(\)\)/);
});

test("kolo 19: zavírací tlačítko má 44px cíl a pod 900px kreslí křížek místo klávesy", () => {
  const tlacitko = telo(".search-esc");
  assert.match(tlacitko, /min-width:\s*44px/);
  assert.match(tlacitko, /min-height:\s*44px/);
  assert.match(tlacitko, /background:\s*none/, "tlačítko nesmí dostat UA šedé pozadí");
  assert.match(telo(".search-esc-x"), /display:\s*none/, "křížek je na desktopu skrytý");
  const mobil = blokMedia("\\(max-width: 900px\\)\\s*\\{\\s*\\.search-esc-kbd");
  assert.match(mobil, /\.search-esc-kbd\s*\{\s*display:\s*none/, "pod 900px má ESC zmizet");
  assert.match(mobil, /\.search-esc-x\s*\{\s*display:\s*block/, "pod 900px se má ukázat křížek");
  assert.match(css, /\.search-esc-kbd, \.search-foot kbd \{/, "styl klávesy se přesunul na .search-esc-kbd");
  assert.match(
    css,
    /#search-q::-webkit-search-cancel-button\s*\{[^}]*display:\s*none/,
    "nativní křížek type=search by stál vedle zavíracího — dva ✕ s různým významem",
  );
  assert.doesNotMatch(css, /\.search-input::-webkit-search-cancel-button/, "archivní pole si nativní křížek nechává");
});

// ── Článek: aside drží krok s textem a na mobilu se neopakuje ──────────

test("kolo 19: aside článku je na desktopu sticky pod hlavičkou, jen když se vejde na výšku", () => {
  const blok = blokMedia("\\(min-width: 901px\\) and \\(min-height: 640px\\)");
  assert.ok(blok, "chybí @media (min-width: 901px) and (min-height: 640px)");
  assert.match(blok, /\.article-aside\s*\{\s*position:\s*sticky;\s*top:\s*81px;?\s*\}/);
  assert.match(telo(".article-layout"), /align-items:\s*start/, "sticky v gridu potřebuje align-items: start");
  assert.match(telo(".article-aside"), /min-width:\s*0/, "základní pravidlo .article-aside se nezměnilo");
});

test("kolo 19: pod 901px se aside článku nekreslí — všechno z něj už na stránce je", () => {
  const tablet = blokMedia("\\(max-width: 900px\\)");
  assert.match(tablet, /\.article-aside\s*\{\s*display:\s*none;?\s*\}/, "aside na mobilu/tabletu zůstává a opakuje meta, sdílení i Další reporty");
  assert.match(tablet, /\.article-layout\s*\{[^}]*grid-template-columns:\s*1fr/, "Z10069 skládání do jednoho sloupce zůstává");
  const clanek = cti("src/pages/clanky/[...id].astro");
  for (const trida of ["article-share", "related", "lower-third"]) {
    assert.match(clanek, new RegExp(`class="${trida}"`), `${trida} musí v šabloně zůstat — aside na mobilu nahrazuje`);
  }
});
