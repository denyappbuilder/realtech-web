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

test("premium round 3: photo has no duplicated headline or broadcast overlay", () => {
  const src = readFileSync(path.join(REPOSITORY_ROOT, "src/pages/index.astro"), "utf8");
  assert.doesNotMatch(src, /class="(?:headline-mark|rec|tc)"/);
  assert.match(src, /<h1[\s\S]*?hero\.data\.title/);
});

test("overlay nesmí opakovat primární CTA tlačítka", () => {
  const src = readFileSync(path.join(REPOSITORY_ROOT, "src/pages/index.astro"), "utf8");
  assert.match(
    src,
    /class="btn-primary">\{heroCta\}</,
    "tlačítko v hero musí zůstat — léčba je overlay, ne smazání výzvy",
  );
  assert.match(
    src,
    /const heroCta = heroJeZprava \? 'Přečíst zprávu' : 'Přečíst analýzu';/,
    "kolo 34: CTA sleduje zprava: true",
  );
  const overlay = textNaHeroObrazku({
    title: "Novinky ze světa umělé inteligence",
  });
  assert.notEqual(
    overlay,
    "Přečíst analýzu",
    "Z555: stejná výzva na tlačítku i na obrázku",
  );
  assert.equal(
    overlay,
    "",
    "bez videa stačí tlačítko; overlay by zdvojil tutéž výzvu",
  );
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
