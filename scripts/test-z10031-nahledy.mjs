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

test("Z10031: náhledy nesmí sdílet tutéž hnědočervenou clonu", () => {
  assert.doesNotMatch(
    css,
    /\.card-thumb::after\s*\{[^}]*rgba\(\s*13\s*,\s*7\s*,\s*7/,
    "všechny karty pořád mají tutéž clonu #0d0707 — i různé covery splývají",
  );
});

test("Z10031: clona je neutrální, mírná a nechá většinu coveru čistou", () => {
  const telo = pravidlo(".card-thumb::after");
  const rgba = telo.match(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/,
  );
  assert.ok(rgba, "clona náhledu nemá čitelnou RGBA barvu");

  const kanaly = rgba.slice(1, 4).map(Number);
  const alpha = Number(rgba[4]);
  assert.ok(
    Math.max(...kanaly) - Math.min(...kanaly) <= 10,
    `clona není neutrální: rgb(${kanaly.join(",")}) barví všechny covery stejným odstínem`,
  );
  assert.ok(alpha <= 0.16, `clona je příliš silná (${alpha}) a přebíjí fotoreálové covery`);
  assert.ok(alpha <= 0.14 + 1e-9, `kolo 9: clona má být ~0.14, ne 0.38 (${alpha})`);
  assert.match(
    telo,
    /transparent\s+6[0-9]%/,
    "clona začíná příliš vysoko a zbytečně tónuje celý cover",
  );
});

test("Z10031: náhled nepřidává druhý kategoriální proužek", () => {
  assert.doesNotMatch(
    css,
    /\.card-thumb::before\s*\{/,
    "kategorie už odlišuje levý okraj celé karty — druhý proužek na náhledu je duplicitní",
  );
});

test("kolo 12: YouTube facade nenosí leftover černou clonu přes poster", () => {
  const telo = pravidlo(".youtube-facade-button::after");
  assert.ok(telo, ".youtube-facade-button::after v CSS chybí");
  assert.doesNotMatch(
    telo,
    /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.14/,
    "facade pořád tahá 14% černý závoj přes poster — leftover z kola 10",
  );
  assert.doesNotMatch(
    telo,
    /linear-gradient/,
    "facade ::after pořád kreslí gradientní clonu přes cover",
  );
  assert.match(
    telo,
    /background:\s*transparent/,
    "výchozí clona facade musí být průhledná, ať poster zůstane čistý",
  );
});
