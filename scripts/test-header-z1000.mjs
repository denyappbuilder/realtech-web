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

test("premium round 3: no duplicated live strip above the lead story", () => {
  assert.doesNotMatch(index, /class="ticker"/);
  assert.match(index, /class="edition-heading wrap"/);
  assert.match(index, /class="hero-rail" aria-label="Další reporty"/);
});
