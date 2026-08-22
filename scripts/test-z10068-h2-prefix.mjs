import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("Z10068: nadpis článku nesmí dostávat prefix // z CSS", () => {
  const telo = pravidlo(".article-body h2::before");
  if (telo) {
    assert.doesNotMatch(
      telo,
      /content:\s*["']\/\/\s*["']/,
      ".article-body h2::before pořád maluje // před nadpis — na snímku to vypadá jako zapomenutý kód",
    );
  }
  assert.doesNotMatch(
    css,
    /\.article-body\s+h2::before\s*\{[^}]*content:\s*["']\/\/\s*["']/,
    "prefix // u h2 článku musí zmizet i kdyby pravidlo změnilo tvar",
  );
});

test("Z10068: stránka O nás si svůj prefix nechá — tohle není ta položka", () => {
  const about = pravidlo(".about h2::before");
  assert.match(
    about,
    /content:\s*["']\/\/\s*["']/,
    ".about h2::before ztratilo // — Z10068 sahá jen na článek",
  );
});
