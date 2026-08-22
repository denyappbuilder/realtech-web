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

function px(telo, vlastnost) {
  const shoda = telo.match(new RegExp(`${vlastnost}\\s*:\\s*([0-9.]+)px`));
  return shoda ? Number(shoda[1]) : null;
}

test("Z10021: akcent pod nadpisem je zřetelný, ale nepřebíjí celou linku", () => {
  const telo = pravidlo(".section-head::after");
  assert.ok(telo, ".section-head::after v CSS chybí");
  assert.match(
    telo,
    /background:\s*var\(--signal\)/,
    "akcent musí zůstat signální červená, ne zmizet",
  );

  const sirka = px(telo, "width");
  const vyska = px(telo, "height");
  assert.notEqual(sirka, null, ".section-head::after nemá width v px");
  assert.notEqual(vyska, null, ".section-head::after nemá height v px");

  assert.ok(
    sirka >= 80,
    `.section-head::after je ${sirka}×${vyska} px — krátká čára pořád vypadá jako útržek`,
  );
  assert.ok(
    sirka <= 120,
    `.section-head::after je ${sirka}×${vyska} px — akcent už soutěží s nadpisem a přebíjí celou linku`,
  );
  assert.equal(
    vyska,
    3,
    `.section-head::after je ${sirka}×${vyska} px — tři pixely působí záměrně bez těžkého bloku`,
  );
});
