import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");

test("Z1000: dekorativní topbar nesmí přidávat třetí pruh nad navigaci", () => {
  assert.doesNotMatch(
    base,
    /class="topbar"/,
    "Base.astro pořád kreslí topbar — tři pruhy nad obsahem",
  );
});

test("Z1000: ticker zůstává na desktopu, na úzkém viewportu mizí", () => {
  assert.match(index, /class="ticker"/, "úvodka ztratila ticker úplně");
  assert.match(
    css,
    /@media\s*\(max-width:\s*900px\)[\s\S]*?\.ticker\s*\{[^}]*display:\s*none/,
    "ticker se na tabletu a mobilu pořád kreslí jako třetí pruh",
  );
});
