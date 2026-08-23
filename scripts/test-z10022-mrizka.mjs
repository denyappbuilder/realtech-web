import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");
const archiv = readFileSync(join(koren, "src/pages/clanky/index.astro"), "utf8");
const tema = readFileSync(join(koren, "src/pages/temata/[slug].astro"), "utf8");

test("Z10022: úvodka pořád bere šest posledních reportů", () => {
  assert.match(
    index,
    /const rest = candidates\.slice\(3,\s*9\)/,
    "úvodka už neomezuje reporty na dalších 6 karet po railu",
  );
  assert.match(index, /<section class="articles">/, "úvodka ztratila sekci articles");
});

test("Z10022: obecný featured span nesmí platit na každou první kartu v .articles", () => {
  assert.doesNotMatch(
    css,
    /\.articles \.wrap > \.grid > \.card:first-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    "featured span pořád platí na úvodku i archiv — šest karet proto není 3×2",
  );
});

test("Z10022: featured první karta zůstává jen na výpisu tématu (Z1002)", () => {
  assert.match(
    tema,
    /class="grid featured-lead"/,
    "stránka tématu ztratila featured-lead — Z1002 by přestalo platit",
  );
  assert.match(
    css,
    /\.featured-lead\s*>\s*\.card:first-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
    "CSS featured-lead nemá span první karty",
  );
  assert.doesNotMatch(
    index,
    /featured-lead/,
    "úvodka má featured-lead — mřížka Poslední reporty zase nebude 3×2",
  );
  assert.doesNotMatch(
    archiv,
    /featured-lead/,
    "archiv má featured-lead — po featured zbude neúplná poslední řada",
  );
});
