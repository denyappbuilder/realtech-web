import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

const KATEGORIE = [
  "ai-report",
  "ai-agenti",
  "drony",
  "vesmir",
  "hardware",
  "mobily",
  "site",
];

test("Z10031: náhledy nesmí sdílet tutéž hnědočervenou clonu", () => {
  assert.doesNotMatch(
    css,
    /\.card-thumb::after\s*\{[^}]*rgba\(\s*13\s*,\s*7\s*,\s*7/,
    "všechny karty pořád mají tutéž clonu #0d0707 — i různé covery splývají",
  );
});

test("Z10031: každá kategorie má vlastní akcent na náhledu", () => {
  const barvy = new Set();
  for (const slug of KATEGORIE) {
    const shoda = css.match(
      new RegExp(`\\.th-${slug}::before\\s*\\{([^}]+)\\}`),
    );
    assert.ok(shoda, `chybí .th-${slug}::before — náhledy témat splývají`);
    const barva = shoda[1].match(/background:\s*([^;]+)/);
    assert.ok(barva, `.th-${slug}::before nemá background`);
    barvy.add(barva[1].trim());
  }
  assert.equal(
    barvy.size,
    KATEGORIE.length,
    `akcenty se opakují (${[...barvy].join(", ")}) — témata zase splývají`,
  );
});
