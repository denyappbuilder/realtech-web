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

// `.about` i `.wrap` mají stejnou specificitu (0,1,0) a `.about` je v souboru
// níž → jeho `padding` shorthand přebije `.wrap`. Když `.about` použije
// `padding: 56px 0`, vynuluje tím vodorovné odsazení, které `.wrap` dává
// (`padding: 0 24px`), a obsah O nás (nadpis „Tech bez marketingových řečí.")
// se přisaje na x=0 a zleva se ořízne.
test("Z10254: .wrap dává vodorovné odsazení, které O nás potřebuje", () => {
  const wrap = pravidlo(".wrap");
  assert.match(
    wrap,
    /padding:\s*0\s+24px/,
    ".wrap přestal dávat vodorovné odsazení 24px — .about už nemá co zdědit",
  );
});

test("Z10254: .about nesmí vynulovat vodorovné odsazení z .wrap", () => {
  const about = pravidlo(".about");
  assert.ok(about, ".about v CSS chybí");
  // Shorthand `padding: <cokoli> 0` = vodorovné odsazení 0 → přebije .wrap.
  assert.doesNotMatch(
    about,
    /padding:\s*[^;]*\s0(px)?\s*;/,
    ".about má `padding` shorthand s nulou vodorovně — přebíjí .wrap a ořezává nadpis zleva",
  );
  // Svislé odsazení musí zůstat, jen bez zásahu do vodorovné osy.
  assert.match(
    about,
    /padding-block:\s*56px/,
    ".about ztratilo svislé odsazení 56px",
  );
});
