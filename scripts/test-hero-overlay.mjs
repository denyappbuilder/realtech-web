import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { textNaHeroObrazku } from "../src/lib/hero-overlay.js";

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function overlayVyrazVIndexu() {
  const src = readFileSync(path.join(REPOSITORY_ROOT, "src/pages/index.astro"), "utf8");
  const match = src.match(/class="headline-mark"[^>]*>\{([^}]+)\}/);
  return match?.[1]?.trim() ?? null;
}

test("overlay na hero obrázku nesmí opakovat titulek článku", () => {
  const src = readFileSync(path.join(REPOSITORY_ROOT, "src/pages/index.astro"), "utf8");
  const vyraz = overlayVyrazVIndexu();
  assert.ok(vyraz, "homepage musí mít .headline-mark s dynamickým textem");
  assert.notEqual(
    vyraz,
    "hero.data.title",
    "Z1005: stejný titulek v <h1> i na obrázku",
  );
  assert.match(
    src,
    /textNaHeroObrazku\(hero\.data\)/,
    "overlay musí jít z textNaHeroObrazku, ne z titulku",
  );
  assert.doesNotMatch(
    src,
    /class="headline-mark">\{hero\.data\.title\}/,
    "Z1005: stejný titulek v <h1> i na obrázku",
  );
});

test("výzva na obrázku je jiná než titulek článku", () => {
  const titulek = "Novinky ze světa umělé inteligence";
  const overlay = textNaHeroObrazku({ title: titulek });
  assert.equal(overlay, "Přečíst analýzu");
  assert.notEqual(overlay, titulek);
});

test("článek s videem nabízí pustit video, ne titulek", () => {
  const titulek = "Starlink míří na 1 Gb/s";
  const overlay = textNaHeroObrazku({
    title: titulek,
    video: "https://www.youtube.com/watch?v=abcdefghijk",
  });
  assert.equal(overlay, "Pustit video");
  assert.notEqual(overlay, titulek);
});

test("když je titulek shodný s výzvou, overlay se schová", () => {
  assert.equal(textNaHeroObrazku({ title: "Přečíst analýzu" }), "");
  assert.equal(
    textNaHeroObrazku({ title: "Pustit video", video: "https://youtu.be/abcdefghijk" }),
    "",
  );
});
