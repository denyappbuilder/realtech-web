import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const onas = readFileSync(join(koren, "src/pages/o-nas.astro"), "utf8");
const vitej = readFileSync(join(koren, "src/pages/vitej.astro"), "utf8");

function pravidlo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("Z10137: O nás musí mít dvousloupec, který vyplní wrap 1120px", () => {
  assert.match(onas, /class="[^"]*about-wide[^"]*"/, "stránka O nás nemá .about-wide — zůstává 720px sloupec");
  assert.match(onas, /class="about-layout"/, "šablona nemá .about-layout");
  assert.match(onas, /class="about-aside"/, "šablona nemá aside, který vyplní prázdné strany");
  const layout = onas.indexOf('class="about-layout"');
  const main = onas.indexOf('class="about-main"');
  const aside = onas.indexOf('class="about-aside"');
  assert.ok(main > layout && aside > layout, "tělo nebo aside leží mimo layout");
});

test("Z10137: .about-wide nesmí držet 720px uprostřed wrapu", () => {
  const wide = pravidlo(".about.about-wide");
  assert.ok(wide, ".about.about-wide v CSS chybí — 720px na .about pořád řeže strany");
  assert.match(wide, /max-width:\s*none/, ".about.about-wide nemá max-width: none");
  assert.doesNotMatch(wide, /max-width:\s*720px/, ".about.about-wide pořád drží 720px");
});

test("Z10137: .about-layout je grid o víc než jednom sloupci", () => {
  const layout = pravidlo(".about-layout");
  assert.ok(layout, ".about-layout v CSS chybí");
  assert.match(layout, /display:\s*grid/, ".about-layout není grid");
  assert.match(layout, /grid-template-columns:/, ".about-layout nemá sloupce");
  assert.doesNotMatch(
    layout,
    /grid-template-columns:\s*1fr\s*;/,
    ".about-layout má jen jeden sloupec — prázdno po stranách zůstává",
  );
});

test("Z10137: pod 900px se sloupce složí, ať mobil nedrží úzký sloupec vedle prázdna", () => {
  assert.match(
    css,
    /@media \(max-width: 900px\)[\s\S]*?\.about-layout\s*\{[^}]*grid-template-columns:\s*1fr/,
    "chybí mobilní skládání .about-layout do jednoho sloupce",
  );
});

test("Z10137: uvítací stránka si nechá úzký sloupec — tohle není ta položka", () => {
  const about = pravidlo(".about");
  assert.match(about, /max-width:\s*720px/, ".about ztratilo 720px — vitej by se rozlil přes celý wrap");
  assert.doesNotMatch(vitej, /about-wide/, "vitej dostalo about-wide — Z10137 sahá jen na O nás");
});
