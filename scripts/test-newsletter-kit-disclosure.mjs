import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const KIT_ACTION = "https://app.kit.com/forms/9640609/subscriptions";

function newsletter() {
  const shoda = base.match(
    /<section\s+class="newsletter"\s+id="newsletter">[\s\S]*?<\/section>/,
  );
  assert.ok(shoda, "Base.astro nemá očekávanou newsletter sekci");
  return shoda[0];
}

test("newsletter u skutečného Kit formuláře viditelně uvádí Kit a možnosti odběru", () => {
  const sekce = newsletter();
  const formular = sekce.match(/<form\s+class="nl-form"[\s\S]*?<\/form>/);
  assert.ok(formular, "newsletter sekce nemá očekávaný formulář");
  const action = formular[0].match(/\saction="([^"]+)"/);
  assert.ok(action, "newsletter formulář nemá action");
  assert.equal(
    action[1],
    KIT_ACTION,
    "newsletter formulář už neposílá odběr na očekávaný Kit endpoint",
  );

  const poznamka = sekce.match(
    /<p\s+class="nl-note"\s+data-nl-note>([\s\S]*?)<\/p>/,
  );
  assert.ok(poznamka, "u Kit formuláře chybí viditelná informační poznámka");
  const viditelnyText = poznamka[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  assert.match(viditelnyText, /Newsletter posíláme přes Kit\./);
  assert.match(viditelnyText, /Potvrzení ti přijde e-mailem\./);
  assert.match(viditelnyText, /Odhlášení jedním klikem\./);
  assert.doesNotMatch(
    sekce,
    /nikomu nedáme/i,
    "u formuláře zůstalo nepravdivé tvrzení „e-mail nikomu nedáme“",
  );
});
