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

test(".search-trigger má minimální zásah 44 px", () => {
  assertMinHeight44(".search-trigger");
});

test(".search-input má minimální zásah 44 px", () => {
  assertMinHeight44(".search-input");
});
