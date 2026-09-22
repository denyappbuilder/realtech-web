// Rozhodnutí majitele (2026-09-22): produkt RealTvorba nefunguje, web ho
// přestává propagovat. Do té doby na signup vedla patička (Base) a /o-nas/
// (odstavec, CTA i aside „Kam dál“) a článek o AI ve videích jmenoval kanál
// REALTVORBA. Test hlídá, aby se zmínka ani odkaz nevrátily nikde v `src/`.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const onas = readFileSync(join(koren, "src/pages/o-nas.astro"), "utf8");

const ZMINKA = /realtvorba/i;
const ODKAZ = /https?:\/\/(?:app\.)?realtvorba\.cz/i;

function soubory(slozka) {
  return readdirSync(slozka).flatMap((jmeno) => {
    const cesta = join(slozka, jmeno);
    return statSync(cesta).isDirectory() ? soubory(cesta) : [cesta];
  });
}

test("patička (Base) nemá odkaz ani konstantu na RealTvorbu", () => {
  const paticka = base.match(/<footer class="site">[\s\S]*?<\/footer>/)?.[0] ?? "";
  assert.ok(paticka, "Base.astro nemá <footer class=\"site\">");
  assert.doesNotMatch(paticka, ZMINKA, "patička pořád zmiňuje RealTvorbu");
  assert.doesNotMatch(base, /const RTV\b/, "Base.astro nese mrtvou konstantu RTV");
  assert.doesNotMatch(base, ODKAZ, "Base.astro pořád odkazuje na realtvorba.cz");
});

test("o-nas: žádný odstavec, CTA ani aside na RealTvorbu", () => {
  assert.doesNotMatch(onas, ODKAZ, "o-nas pořád odkazuje na realtvorba.cz");
  assert.doesNotMatch(onas, ZMINKA, "o-nas pořád zmiňuje RealTvorbu");
  assert.ok(!onas.includes("Nahraj video. Dostaneš hotové animace do střihu."), "produktová věta zůstala");
  assert.ok(!onas.includes("Nástroj, který jsme si postavili"), "nadpis produktové sekce zůstal");
  // Aside „Kam dál“ drží zbývající položky, žádná prázdná <li>.
  assert.doesNotMatch(onas, /<li>\s*<\/li>/, "v o-nas zůstala prázdná položka seznamu");
});

test("nikde v src/ (šablony, stránky, obsah, styly) se RealTvorba neobjevuje", () => {
  const zasahy = soubory(join(koren, "src"))
    .filter((cesta) => /\.(astro|md|mdx|ts|js|mjs|css|json|txt|xml)$/.test(cesta))
    .filter((cesta) => ZMINKA.test(readFileSync(cesta, "utf8")))
    .map((cesta) => relative(koren, cesta));
  assert.deepEqual(zasahy, [], `RealTvorba se pořád zmiňuje v: ${zasahy.join(", ")}`);
});
