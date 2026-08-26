// Pravidlo majitele (2026-08-23/24): odkaz na produkt z realtech.cz vede
// rovnou na signup, ne na ceník/landing realtvorba.cz. Web dřív posílal
// lidi z patičky i z /o-nas/ na landing s ceníkem.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const onas = readFileSync(join(koren, "src/pages/o-nas.astro"), "utf8");

const SIGNUP = "https://app.realtvorba.cz/signup";

test("patička (Base) vede na signup, ne na ceník realtvorba.cz", () => {
  assert.match(base, new RegExp(`const RTV = '${SIGNUP}'`));
  assert.doesNotMatch(base, /href="https:\/\/realtvorba\.cz/);
  assert.doesNotMatch(base, /RTV = 'https:\/\/realtvorba\.cz/);
});

test("o-nas: každý RealTvorba odkaz (odstavec, CTA, aside) vede na signup", () => {
  const odkazyNaCenik = onas.match(/href="https:\/\/realtvorba\.cz[^"]*"/g) ?? [];
  assert.deepEqual(odkazyNaCenik, [], "o-nas nesmí odkazovat na ceník/landing realtvorba.cz");

  const odkazyNaSignup = onas.match(/href="https:\/\/app\.realtvorba\.cz\/signup"/g) ?? [];
  assert.equal(odkazyNaSignup.length, 3, "o-nas má mít 3 signup odkazy: zmínku v odstavci, CTA a aside");
});

test("o-nas: schválená produktová věta zůstává", () => {
  assert.ok(onas.includes("Nahraj video. Dostaneš hotové animace do střihu."));
});
