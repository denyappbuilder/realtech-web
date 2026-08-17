import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const html = readFileSync(join(koren, "src/pages/index.astro"), "utf8");

function pravidla(trida) {
  const m = css.match(new RegExp(`\\.${trida}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
}

test("Z1007: ticker text nesmí vjíždět pod štítek ŽIVĚ", () => {
  assert.match(html, /ticker-label/, "chybí štítek ŽIVĚ");
  assert.match(html, /ticker-viewport/, "chybí viewport tickeru");

  const viewport = pravidla("ticker-viewport");
  assert.ok(viewport, "styles.css nemá .ticker-viewport");

  const maPadding = /padding-left:\s*([1-9]\d*)px/.test(viewport);
  const maMasku = /mask-image:/.test(viewport) || /-webkit-mask-image:/.test(viewport);
  const maMargin = /margin-left:\s*([1-9]\d*)px/.test(viewport);

  assert.ok(
    maPadding || maMasku || maMargin,
    "viewport nemá levý odstup ani masku — text vjede pod ŽIVĚ",
  );
});
