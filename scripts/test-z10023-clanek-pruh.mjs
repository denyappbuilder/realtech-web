import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const clanek = readFileSync(join(koren, "src/pages/clanky/[...id].astro"), "utf8");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("Z10023: datum a čtení v hlavičce článku nesmí sedět na --panel", () => {
  const telo = pravidlo(".article-head .lower-third .time");
  assert.ok(telo, ".article-head .lower-third .time v CSS chybí");
  assert.doesNotMatch(
    telo,
    /background:\s*var\(--panel\)/,
    "metadata článku pořád berou --panel, na světlé stránce to vypadá jako nalepený pruh",
  );
  assert.doesNotMatch(
    telo,
    /color:\s*#fff/,
    "metadata článku pořád tlačí bílý text na černém pruhu",
  );
  assert.match(
    telo,
    /background:\s*var\(--surface\)/,
    "metadata článku musí sedět na stejném povrchu jako tělo",
  );
  assert.match(
    telo,
    /color:\s*var\(--ink-soft\)/,
    "text metadat musí číst inkoust, ne bílou na černé",
  );
});

test("Z10023: článek pořád skládá metadata přes lower-third", () => {
  const hlava = clanek.indexOf('class="article-head"');
  const pruh = clanek.indexOf('class="lower-third"');
  assert.notEqual(hlava, -1, "šablona ztratila hlavičku článku");
  assert.notEqual(pruh, -1, "šablona ztratila pruh metadat");
  assert.ok(pruh > hlava, "pruh metadat už neleží v hlavičce článku");
});

test("Z10023: hero úvodky si černý --panel nechá", () => {
  assert.match(index, /class="lower-third"/, "úvodka ztratila lower-third");
  const globalni = pravidlo(".lower-third .time");
  assert.match(
    globalni,
    /background:\s*var\(--panel\)/,
    "globální .lower-third .time už nebere --panel — rozbila by se úvodka",
  );
});
