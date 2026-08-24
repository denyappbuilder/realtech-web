import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(join(koren, "src/pages/index.astro"), "utf8");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

const hero = index.match(/<section class="hero">([\s\S]*?)<\/section>/)?.[0] ?? "";
const h1 = hero.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "";
const clanekHref = "`/clanky/${hero.id}/`";

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.").replaceAll(" ", "\\s+")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("hero h1 je odkaz na článek, stejný cíl jako Přečíst analýzu", () => {
  assert.ok(hero, "úvodka ztratila <section class=\"hero\">");
  assert.ok(h1, "hero ztratil <h1>");
  assert.match(
    h1,
    /<a href=\{`\/clanky\/\$\{hero\.id\}\/`\}>\{hero\.data\.title\}<\/a>/,
    "h1 musí obsahovat a[href^=\"/clanky/\"] přes celý titulek, ne holý text",
  );
  assert.doesNotMatch(
    h1,
    /hero\.data\.video/,
    "nadpis musí jít na článek, ne na video",
  );

  const tlacitkoHref = hero.match(
    /<a href=\{(`\/clanky\/\$\{hero\.id\}\/`)\} class="btn-primary">Přečíst analýzu<\/a>/,
  )?.[1];
  assert.equal(
    tlacitkoHref,
    clanekHref,
    "tlačítko Přečíst analýzu musí vést na /clanky/${hero.id}/",
  );

  const nadpisHref = h1.match(/<a href=\{(`\/clanky\/\$\{hero\.id\}\/`)\}>/)?.[1];
  assert.equal(
    nadpisHref,
    tlacitkoHref,
    "href nadpisu se musí shodovat s tlačítkem Přečíst analýzu",
  );
});

test("hero nadpis je klikatelný po celé ploše, hover bez podtržení", () => {
  const odkaz = pravidlo(".hero h1 a");
  assert.ok(odkaz, "global.css ztratil .hero h1 a");
  assert.match(
    odkaz,
    /display:\s*block/,
    ".hero h1 a musí být block, jinak jde kliknout jen slova, ne celá plocha nadpisu",
  );

  const stav = css.match(
    /\.hero h1 a:hover,\s*\.hero h1 a:focus-visible\s*\{([^}]+)\}/,
  )?.[1] ?? "";
  assert.ok(stav.trim(), "chybí hover/focus styl .hero h1 a");
  assert.match(stav, /color:\s*var\(--signal-dark\)/, "hover/focus musí být signal-dark");
  assert.match(stav, /text-decoration:\s*none/, "nadpisový odkaz nesmí mít underline");
  assert.doesNotMatch(
    `${odkaz}\n${stav}`,
    /outline:\s*none/,
    "focus-visible outline z globálního a:focus-visible musí zůstat",
  );
});
