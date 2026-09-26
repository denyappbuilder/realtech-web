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

// Kolo 56: pruh „video není“ po textu zrušen (YouTube nese výzva za úvodem,
// B19, a autorský box). Z1003 dál platí: žádná výzva mezi hero a textem.
test("Z1003: mezi hero a prvním odstavcem nestojí žádná YouTube výzva", () => {
  const telo = clanek.indexOf('class="article-body"');
  assert.notEqual(telo, -1, "šablona ztratila tělo článku");
  assert.doesNotMatch(clanek.slice(0, telo), /sub_confirmation=1|Odebírat kanál/, "výzva k odběru před textem přerušuje čtení");
  assert.doesNotMatch(clanek, /K tomuhle článku video není/, "pruh zrušen v kole 56");
});

test("Z1003: YouTube výzva po textu nesmí tvrdit zastaralé číslo videí", () => {
  const telo = clanek.indexOf('class="article-body"');
  const autor = clanek.slice(clanek.indexOf('<div class="author-box">'), clanek.indexOf('<HeroheroCta />'));
  assert.ok(autor.length > 0);
  assert.match(autor, /sub_confirmation=1/, "odběr kanálu po textu nese autorský box");
  assert.doesNotMatch(autor, /\b82\b/, "hardcoded 82 zastará hned po dalším videu");
  assert.ok(clanek.indexOf('<div class="author-box">') > telo);
  assert.match(clanek, /Z1003: pruh nesmí sedět mezi hero a prvním odstavcem/, "komentář musí dál držet Z1003 — výzva až po textu");
});
