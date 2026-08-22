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
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("Z10069: pod herem musí být dvousloupec, ne 760px tělo uprostřed wrapu", () => {
  const layout = pravidlo(".article-layout");
  assert.ok(layout, ".article-layout v CSS chybí — vpravo od těla zůstává díra 1120−760");
  assert.match(
    layout,
    /display:\s*grid/,
    ".article-layout není grid",
  );
  assert.match(
    layout,
    /grid-template-columns:/,
    ".article-layout nemá sloupce",
  );
  assert.doesNotMatch(
    layout,
    /grid-template-columns:\s*1fr\s*;/,
    ".article-layout má jen jeden sloupec — prázdno vpravo zůstává",
  );
});

test("Z10069: tělo článku už není samostatný 760px sloupec s margin auto", () => {
  const telo = pravidlo(".article-body");
  assert.ok(telo, ".article-body v CSS chybí");
  assert.doesNotMatch(
    telo,
    /max-width:\s*760px/,
    ".article-body pořád drží 760px — pod 1120px herem vzniká bílá díra",
  );
  assert.doesNotMatch(
    telo,
    /margin:\s*0\s+auto/,
    ".article-body je pořád vycentrované — prázdno zůstává po stranách",
  );
});

test("Z10069: šablona skládá tělo a aside vedle sebe", () => {
  assert.match(clanek, /class="article-layout"/, "šablona nemá .article-layout");
  assert.match(clanek, /class="article-aside"/, "šablona nemá sidebar, který díru vyplní");
  const layout = clanek.indexOf('class="article-layout"');
  const body = clanek.indexOf('class="article-body"');
  const aside = clanek.indexOf('class="article-aside"');
  assert.ok(body > layout && aside > layout, "tělo nebo aside leží mimo layout");
});

test("Z10069: pod 900px se sloupce složí, ať mobil nedrží úzký sloupec vedle prázdna", () => {
  assert.match(
    css,
    /@media \(max-width: 900px\)[\s\S]*?\.article-layout\s*\{[^}]*grid-template-columns:\s*1fr/,
    "chybí mobilní skládání .article-layout do jednoho sloupce",
  );
});
