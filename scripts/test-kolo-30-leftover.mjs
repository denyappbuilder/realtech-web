// Kolo 30: leftover po kolech 23–29 (#394 … #414, #415 v draftu). Živý audit
// 8. 9. 2026 (úvodka, /clanky/openai-research-intern-zari-2026/, /clanky/,
// /temata/ai-report/) proti kódu. Nic z #415 se tu neopakuje.
//
// P2: placeholder newsletteru (42 % bílé na poli = 72 % --panel) měl
//     4,31:1 light / 4,40:1 dark — pod AA 4,5.
// P2: tisk článku nechával .article-aside (Sdílej dál, Kopírovat odkaz,
//     Další reporty) a dvousloupcový .article-layout; tabulky a <pre>
//     s overflow-x: auto se na papíře řezaly.
// P2: play fasády YouTube nebyl v seznamu hover transformů pro
//     prefers-reduced-motion — při reduce skočil na scale(1.06).
// P3: chipy témat na úvodce a stránce tématu byly v holém <div> — bez
//     jména, mimo landmarky.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const uvodka = cti("src/pages/index.astro");
const tema = cti("src/components/TemaPage.astro");

function pravidlo(blok, selektor) {
  const shoda = blok.match(
    new RegExp(`(?:^|[}\\s/])${selektor.replaceAll(".", "\\.").replaceAll(" ", "\\s+")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

/** Všechny bloky @media s daným dotazem (bez vnořených závorek v těle). */
function mediaBloky(dotaz) {
  const re = new RegExp(`@media\\s*${dotaz}\\s*\\{([\\s\\S]*?)\\n\\}`, "g");
  return [...css.matchAll(re)].map((m) => m[1]);
}

// ── Kontrast placeholderu newsletteru ────────────────────────────────────

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, pa, b) => a.map((c, i) => c * pa + b[i] * (1 - pa));
const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const kontrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// Kolo 47: newsletter už nesedí na --panel (kolo 43 → --surface) a pole nebere
// color-mix s --panel — placeholder je --ink-faint na --bg. Záměr testu (AA
// 4,5:1 v obou tématech, a přitom tlumenější než psaný text --ink) zůstává,
// jen se počítá z tokenů obou témat.
test("kolo 30: placeholder newsletteru má AA 4,5:1 v obou tématech", () => {
  const placeholder = pravidlo(css, ".nl-form input::placeholder");
  const pole = pravidlo(css, ".nl-form input");
  assert.match(placeholder, /color:\s*var\(--ink-faint\)/, "placeholder bere token, ne color-mix s --panel");
  assert.match(pole, /background:\s*var\(--bg\)/, "pozadí pole je --bg");
  const token = (blok, jmeno) => blok.match(new RegExp(`${jmeno}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
  const light = css.match(/:root\s*\{([^}]*)\}/)[1];
  const dark = css.match(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/)[1];
  for (const [nazev, blok] of [["light", light], ["dark", dark]]) {
    const faint = token(blok, "--ink-faint");
    const bg = token(blok, "--bg");
    const ink = token(blok, "--ink");
    assert.ok(faint && bg && ink, `${nazev}: chybí token`);
    const pomer = kontrast(hex(faint), hex(bg));
    assert.ok(pomer >= 4.5, `${nazev}: placeholder ${pomer.toFixed(2)}:1 < 4,5`);
    assert.ok(pomer < kontrast(hex(ink), hex(bg)), `${nazev}: placeholder nesmí být kontrastnější než psaný text`);
  }
});

// ── Tisk článku ──────────────────────────────────────────────────────────

const tisk = mediaBloky("print");

test("kolo 30: tisk skrývá aside článku i chipy témat", () => {
  assert.equal(tisk.length, 1, "očekávám jeden @media print blok");
  const skryte = tisk[0].match(/([^{}]+)\{\s*display:\s*none\s*!important;?\s*\}/)?.[1] ?? "";
  for (const selektor of [".article-aside", ".topics", ".article-share", ".related", ".komentare"]) {
    assert.ok(
      skryte.split(",").map((s) => s.trim()).includes(selektor),
      `${selektor} chybí v seznamu display: none pro tisk`,
    );
  }
});

test("kolo 30: tisk skládá .article-layout do jednoho sloupce", () => {
  assert.match(pravidlo(tisk[0], ".article-layout"), /display:\s*block/, "grid 1.7fr/0.8fr by na papíře nechal tělu ~63 % šířky");
});

test("kolo 30: tabulky a kód se v tisku neřežou", () => {
  assert.match(pravidlo(tisk[0], ".article-body .table-wrap"), /overflow:\s*visible/);
  const pre = tisk[0].match(/\.article-body pre\s*\{([^}]+)\}/g) ?? [];
  const spojene = pre.join(" ");
  assert.match(spojene, /white-space:\s*pre-wrap/, "kód se má na papíře zlomit");
  assert.match(spojene, /overflow:\s*visible/, "overflow-x: auto na papíře nic neroluje");
  assert.match(spojene, /color:\s*#000/, "tisk kódu z kola 21 (černý text) zůstává");
});

test("kolo 30: mimo tisk zůstává aside i dvousloupcový layout", () => {
  const bezTisku = css.replace(/@media print\s*\{[\s\S]*?\n\}/, "");
  assert.match(pravidlo(bezTisku, ".article-layout"), /grid-template-columns:\s*minmax\(0, 1\.7fr\)/);
  assert.match(pravidlo(bezTisku, ".article-body .table-wrap"), /overflow-x:\s*auto/);
  assert.match(pravidlo(bezTisku, ".article-body pre"), /overflow-x:\s*auto/);
});

// ── prefers-reduced-motion: play fasády YouTube ───────────────────────────

test("kolo 30: play fasády YouTube při reduce neskaluje a reset stojí ZA hover pravidlem", () => {
  const hover = css.indexOf(".youtube-facade-button:hover .youtube-facade-play { transform: translate(-50%, -50%) scale(1.06); }");
  assert.ok(hover > -1, "výchozí hover scale fasády chybí — to je záměrný pohyb mimo reduce");
  const reduce = mediaBloky("\\(prefers-reduced-motion:\\s*reduce\\)");
  const blok = reduce.find((b) => b.includes(".youtube-facade-button:hover .youtube-facade-play"));
  assert.ok(blok, "reduce blok pro .youtube-facade-play chybí");
  assert.match(blok, /\.youtube-facade-button:hover\s+\.youtube-facade-play\s*\{\s*transform:\s*translate\(-50%,\s*-50%\)\s*;?\s*\}/);
  assert.doesNotMatch(blok, /scale\(/, "reset má nechat jen centrování");
  assert.doesNotMatch(blok, /!important/, "pořadí v souboru stačí, !important sem nepatří");
  assert.ok(css.indexOf(blok) > hover, "reset musí stát až ZA hover pravidlem (stejná specificita, rozhoduje pořadí)");
});

// ── Chipy témat jako <nav> ────────────────────────────────────────────────

test("kolo 30: chipy témat na úvodce jsou <nav aria-label=\"Témata\">", () => {
  assert.match(uvodka, /<nav class="topic-navigation" aria-label="Témata">/);
  assert.doesNotMatch(uvodka, /<div class="topics">/);
  const blok = uvodka.match(/<nav class="topic-navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  assert.match(blok, /<a href=\{`\/temata\/\$\{slugify\(cat\)\}\/`\}>/, "odkazy na témata zůstávají nativní navigací");
});

test("kolo 30: „Další témata“ na stránce tématu jsou <nav aria-label=\"Další témata\">", () => {
  assert.match(tema, /<nav class="topics" aria-label="Další témata">/);
  assert.doesNotMatch(tema, /<div class="topics">/);
  const blok = tema.match(/<nav class="topics"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  assert.match(blok, /<a class="chip" href="\/temata\/">Všechna témata<\/a>/);
});

test("kolo 30: hlavní navigace v Base má jiné jméno než nav témat (dvě nav se stejným jménem by čtečka nerozlišila)", () => {
  const base = cti("src/layouts/Base.astro");
  const jmena = [...base.matchAll(/<nav[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(jmena.length >= 2, "Base má hlavní navigaci a patičku");
  assert.ok(!jmena.includes("Témata") && !jmena.includes("Další témata"));
});
