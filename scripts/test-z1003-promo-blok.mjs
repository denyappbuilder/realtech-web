import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const clanek = readFileSync(join(koren, "src/pages/clanky/[...id].astro"), "utf8");

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replace(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("Z1003: videobar nesmí být tmavý panel uprostřed světlého článku", () => {
  const telo = pravidlo(".article-videobar");
  assert.ok(telo, ".article-videobar v CSS chybí");
  assert.doesNotMatch(
    telo,
    /background:\s*var\(--panel\)/,
    "videobar pořád bere --panel, na světlém článku to vypadá jako reklama",
  );
  assert.doesNotMatch(
    telo,
    /color:\s*#fff/,
    "videobar pořád tlačí bílý text na tmavém pruhu",
  );
  assert.match(
    telo,
    /background:\s*var\(--surface\)/,
    "videobar musí sedět na stejném povrchu jako tělo článku",
  );
  assert.match(
    telo,
    /border:\s*1px solid var\(--line\)/,
    "videobar musí mít stejný rámeček jako tělo článku, ne cizí plakát",
  );
});

test("Z1003: výzva bez videa nesmí sedět mezi hero a prvním odstavcem", () => {
  const telo = clanek.indexOf('class="article-body"');
  const bezVidea = clanek.indexOf("{!video && (");
  assert.notEqual(telo, -1, "šablona ztratila tělo článku");
  assert.notEqual(bezVidea, -1, "šablona ztratila větev bez videa");
  assert.ok(
    bezVidea > telo,
    "výzva bez videa pořád leží před tělem článku a přerušuje čtení",
  );
});
