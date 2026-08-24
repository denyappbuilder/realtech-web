import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const nav = base.match(/<nav class="main"[\s\S]*?<\/nav>/)?.[0] ?? "";

test("hlavní navigace odkazuje na hub /temata/ s aria-current jako ostatní položky", () => {
  assert.match(
    nav,
    /<a href="\/temata\/" aria-current=\{current\('\/temata\/'\)\}>Témata<\/a>/,
    "header ztratil odkaz na /temata/ (nebo mu chybí aria-current)",
  );
});

test("Témata stojí mezi Články a Videa", () => {
  const clanky = nav.indexOf('href="/clanky/"');
  const temata = nav.indexOf('href="/temata/"');
  const videa = nav.indexOf(">Videa</a>");
  assert.ok(clanky !== -1 && temata !== -1 && videa !== -1, "navigaci chybí některá z položek");
  assert.ok(clanky < temata && temata < videa, "Témata nejsou mezi Články a Videa");
});
