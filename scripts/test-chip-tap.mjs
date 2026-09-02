import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

function teloPravidla(selektor) {
  const escaped = selektor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`\\n${escaped} \\{([\\s\\S]*?)\\}`))?.[1] ?? "";
}

function assertMinHeight44(selektor) {
  const telo = teloPravidla(selektor);
  assert.ok(telo, `global.css ztratil pravidlo ${selektor}`);
  assert.match(
    telo,
    /min-height:\s*44px/,
    `${selektor} musí mít min-height: 44px — jinak je zásah pod WCAG 2.5.5`,
  );
}

test(".chip má minimální zásah 44 px", () => {
  assertMinHeight44(".chip");
});

test(".share-btn má minimální zásah 44 px", () => {
  assertMinHeight44(".share-btn");
});

test(".theme-toggle má 44×44 i mimo media query", () => {
  const telo = teloPravidla(".theme-toggle");
  assert.ok(telo, "global.css ztratil základní .theme-toggle");
  assert.match(
    telo,
    /width:\s*44px/,
    "základní .theme-toggle musí mít width: 44px, ne jen v max-width 900/580",
  );
  assert.match(
    telo,
    /height:\s*44px/,
    "základní .theme-toggle musí mít height: 44px, ne jen v max-width 900/580",
  );
  assert.doesNotMatch(
    telo,
    /width:\s*38px/,
    "základní .theme-toggle pořád drží 38px",
  );
});

test(".search-trigger má minimální zásah 44 px", () => {
  assertMinHeight44(".search-trigger");
});

test(".search-input má minimální zásah 44 px", () => {
  assertMinHeight44(".search-input");
});

test("a.tag má minimální zásah 44 px", () => {
  assertMinHeight44("a.tag");
});

test(".nl-form button má minimální zásah 44 px", () => {
  assertMinHeight44(".nl-form button");
  const telo = teloPravidla(".nl-form button");
  assert.match(telo, /display:\s*inline-flex/, "padding 13px nestačí — flex drží 44px i s kratším textem");
  assert.match(telo, /align-items:\s*center/);
});

test(".nl-form input má minimální zásah 44 px", () => {
  assertMinHeight44(".nl-form input");
});

test(".btn-ghost má minimální zásah 44 px i mimo archive/author", () => {
  assertMinHeight44(".btn-ghost");
  const telo = teloPravidla(".btn-ghost");
  assert.match(telo, /display:\s*inline-flex/, "404, zpět a o-nas potřebují flex, ne jen padding");
  assert.match(telo, /align-items:\s*center/);
});

test(".btn-primary má minimální zásah 44 px (hero, O nás, 404)", () => {
  assertMinHeight44(".btn-primary");
  const telo = teloPravidla(".btn-primary");
  assert.match(telo, /display:\s*inline-flex/, "min-height 44px bez flexu nesedí na text");
  assert.match(telo, /align-items:\s*center/);
});
