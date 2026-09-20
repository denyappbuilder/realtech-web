import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

function px(telo, vlastnost) {
  const shoda = telo.match(new RegExp(`${vlastnost}\\s*:\\s*([0-9.]+)px`));
  return shoda ? Number(shoda[1]) : null;
}

// Kolo 47: 2px linka pod nadpisem sekce a červený 96×3px akcent ::after byly od
// round 3 (premium.css) jen schované `display: none` — dekorace ve dvou
// vrstvách, z toho jedna mrtvá. Kit „reading-led journal“ dekoraci nadpisu
// nemá (DESIGN.md: žádné broadcast slaby). Test hlídá, že se nevrátí ani
// jedna z vrstev; typografii .section-head h2 drží premium (650/100 %).
const premium = readFileSync(join(koren, "src/styles/premium.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

test("Z10021 → kolo 47: nadpis sekce bez linky a červeného akcentu v obou vrstvách", () => {
  assert.equal(pravidlo(".section-head::after"), "", ".section-head::after se do global.css vrátil");
  assert.doesNotMatch(premium, /\.section-head::after/, "premium.css nemá co schovávat — mrtvý display: none");
  const hlava = pravidlo(".section-head");
  assert.ok(hlava, ".section-head v global.css chybí");
  assert.doesNotMatch(hlava, /border-bottom|position:\s*relative/, "linka pod nadpisem se vrátila");
  assert.match(hlava, /display:\s*flex/);
  assert.match(hlava, /gap:\s*16px/, "kolo 15: mezera hlavy zůstává");
  assert.match(premium, /^\.section-head \{ margin-bottom: 28px; gap: 20px; \}/m, "premium nechává jen rytmus, žádné border: 0 / padding-bottom: 0 přepisy");
});
