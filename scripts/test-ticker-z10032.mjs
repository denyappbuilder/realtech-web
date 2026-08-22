import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// 🔴 22. 8. 2026 — TENHLE SOUBOR ZMĚNIL ZADÁNÍ, ne kvalitu.
//
// Z10032 (19. 8., PR #202) ticker zastavilo a napsalo sem tři stráže. Dvě
// z nich hlídaly ZÁSADNÍ věc — že ticker nese skutečné odkazy dostupné
// čtečce i klávesnici. Třetí hlídala NÁZOR na design („žádný marquee").
//
// Deny 22. 8.: „na webu se zastavil řádek živě, normálně má být v pohybu."
// Pohyb je jeho rozhodnutí, ne agentovo — animace se tedy vrací.
// Přístupnost ale zůstává v platnosti, takže se testy nemažou, jen mění:
// pohybovat se smí, ALE prvních šest odkazů musí být dostupných a duplicitní
// sada (nutná pro plynulou smyčku přes -50 %) musí být skrytá.
//
// Poučení, kvůli kterému je tenhle komentář dlouhý: když test kodifikuje
// vkus, musí jít poznat od testu, který kodifikuje správnost. Jinak se při
// změně zadání smaže obojí najednou.

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");

function pravidla(trida) {
  const m = css.match(new RegExp(`\\.${trida}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
}

test("ticker se hýbe (Denyho zadání 22. 8.)", () => {
  assert.match(index, /class="ticker"/, "úvodka ztratila ticker úplně");
  const track = pravidla("ticker-track");
  assert.ok(track, "global.css nemá .ticker-track");
  assert.match(track, /animation\s*:/, "ticker-track nemá animation — pruh stojí");
  assert.match(css, /@keyframes\s+ticker-scroll/, "chybí keyframes ticker-scroll");
});

test("pohyb se dá zastavit a respektuje systémové nastavení", () => {
  assert.match(
    css,
    /\.ticker:hover\s+\.ticker-track/,
    "ticker se nezastaví při najetí myší — nejde si ho přečíst",
  );
  assert.match(
    css,
    /\.ticker:focus-within\s+\.ticker-track/,
    "ticker se nezastaví při zaměření z klávesnice — tabulátor by honil pohyblivý cíl",
  );
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]{0,200}\.ticker-track[\s\S]{0,120}animation:\s*none/,
    "chybí prefers-reduced-motion — komu se z pohybu dělá zle, tomu se hýbat nesmí",
  );
});

test("smyčka je plynulá: obsah je zdvojený", () => {
  // Animace posouvá o -50 %, takže bez druhé sady pruh na konci cyklu poskočí.
  const vyskyty = index.match(/all\.slice\(\s*0\s*,\s*6\s*\)/g) || [];
  assert.ok(
    vyskyty.length >= 2,
    `ticker vykresluje sadu ${vyskyty.length}× — při -50 % musí být zdvojená, jinak to poskakuje`,
  );
});

test("ticker je skutečný obsah, ne dekorace (Z10032 — platí dál)", () => {
  assert.doesNotMatch(
    index,
    /class="ticker"[^>]*aria-hidden\s*=\s*["']true["']/,
    "celý ticker je aria-hidden — skrytý před čtečkou, přitom nese odkazy",
  );
  // Skrytá smí být JEN ta duplicitní sada, a musí být skrytá obojím způsobem:
  // `tabindex=-1` (klávesnice) i `aria-hidden` (čtečka). Kdyby měla jen jedno,
  // čtečka nebo tabulátor projdou odkazy dvakrát.
  const usek = index.slice(index.indexOf("ticker-track"));
  const odkazy = usek.match(/<a\b[^>]*>/g) || [];
  const skryte = odkazy.filter((a) => a.includes('tabindex="-1"'));
  const dostupne = odkazy.filter((a) => !a.includes('tabindex="-1"'));
  assert.ok(dostupne.length > 0, "v tickeru není ani jeden odkaz dostupný z klávesnice");
  for (const a of skryte) {
    assert.match(
      a,
      /aria-hidden\s*=\s*["']true["']/,
      `odkaz s tabindex=-1 není aria-hidden → čtečka ho přečte dvakrát: ${a}`,
    );
  }
});
