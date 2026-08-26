// Patička, sloupec Web: hlavička odkazuje na hub /temata/, ale v patičce
// odkaz chyběl (živě 26. 8. 2026: YouTube, Články, O nás, Kontakt, RSS,
// RealTvorba — Témata nikde). Sloupec Témata vedle vypisuje jen jednotlivé
// kategorie, na samotný hub se z patičky nedalo dostat.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const paticka = base.match(/<footer class="site">[\s\S]*?<\/footer>/)?.[0] ?? "";
const sloupecWeb = paticka.match(/<span class="mono f-nav-head">Web<\/span>[\s\S]*?<\/ul>/)?.[0] ?? "";

test("sloupec Web v patičce odkazuje na hub /temata/", () => {
  assert.ok(sloupecWeb, "patičce chybí sloupec Web");
  assert.match(
    sloupecWeb,
    /<li><a href="\/temata\/">Témata<\/a><\/li>/,
    "sloupec Web v patičce ztratil odkaz na /temata/",
  );
});

test("Témata stojí mezi Články a O nás — stejné pořadí jako v hlavičce", () => {
  const clanky = sloupecWeb.indexOf('href="/clanky/"');
  const temata = sloupecWeb.indexOf('href="/temata/"');
  const oNas = sloupecWeb.indexOf('href="/o-nas/"');
  assert.ok(clanky !== -1 && temata !== -1 && oNas !== -1, "sloupci Web chybí některá z položek");
  assert.ok(clanky < temata && temata < oNas, "Témata nejsou mezi Články a O nás");
});
