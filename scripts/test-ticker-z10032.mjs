import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");

function pravidla(trida) {
  const m = css.match(new RegExp(`\\.${trida}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
}

test("Z10032: ticker nesmí běžet jako marquee", () => {
  assert.match(index, /class="ticker"/, "úvodka ztratila ticker úplně");
  const track = pravidla("ticker-track");
  assert.ok(track, "styles.css nemá .ticker-track");
  assert.doesNotMatch(
    track,
    /animation\s*:/,
    "ticker-track pořád má animation — retro marquee z počátku 2000s",
  );
  assert.doesNotMatch(
    css,
    /@keyframes\s+ticker-scroll/,
    "keyframes ticker-scroll pořád existují",
  );
});

test("Z10032: titulky se nesmí zdvojovat kvůli nekonečnému scrollu", () => {
  assert.doesNotMatch(
    index,
    /\[\s*\.\.\.all\.slice\(\s*0\s*,\s*6\s*\)\s*,\s*\.\.\.all\.slice\(\s*0\s*,\s*6\s*\)\s*\]/,
    "úvodka pořád zdvojuje 6 titulků pro marquee smyčku",
  );
  assert.match(
    index,
    /all\.slice\(\s*0\s*,\s*6\s*\)/,
    "ticker ztratil seznam článků",
  );
});

test("Z10032: ticker je skutečný obsah, ne dekorace", () => {
  assert.doesNotMatch(
    index,
    /class="ticker"[^>]*aria-hidden\s*=\s*["']true["']/,
    "ticker je pořád aria-hidden — skrytý před čtečkou, přitom nese odkazy",
  );
  assert.doesNotMatch(
    index,
    /ticker-track[\s\S]*tabindex\s*=\s*["']-1["']/,
    "odkazy v tickeru mají tabindex=-1, takže z klávesnice nejdou",
  );
});
