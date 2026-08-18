import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const karta = readFileSync(join(koren, "src/components/ArticleCard.astro"), "utf8");

const KATEGORIE = [
  "ai-report",
  "ai-agenti",
  "drony",
  "vesmir",
  "hardware",
  "mobily",
  "site",
];

test("Z1002: štítek kategorie nesmí být všude stejná --signal", () => {
  assert.doesNotMatch(
    css,
    /\.card-thumb\s+\.lt\s+\.k\s*\{[^}]*background:\s*var\(--signal\)/,
    "štítek kategorie pořád bere --signal — všechny karty vypadají stejně",
  );
});

test("Z1002: každá kategorie má vlastní barvu štítku", () => {
  for (const slug of KATEGORIE) {
    assert.match(
      css,
      new RegExp(`\\.th-${slug}\\s+\\.lt\\s+\\.k\\s*\\{[^}]*background:`),
      `chybí barva štítku pro .th-${slug} .lt .k — bez .lt prohraje specificitu proti fallbacku`,
    );
  }
});

test("Z1002: první karta ve výpisu je featured, ať se na tématu neslévají", () => {
  assert.match(
    css,
    /\.articles \.wrap > \.grid > \.card:first-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    "výpis nemá featured první kartu — na /temata/ zůstane stejnorodý grid",
  );
});
