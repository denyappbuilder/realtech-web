import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const KIT_ACTION = "https://app.kit.com/forms/9640609/subscriptions";

function newsletter() {
  // Kolo 28 přidal aria-labelledby — sekce smí mít další atributy.
  const shoda = base.match(
    /<section\s+class="newsletter"\s+id="newsletter"[^>]*>[\s\S]*?<\/section>/,
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

test("kolo 35: poznámka u Kit formuláře odkazuje na /gdpr/ (Ochrana údajů)", () => {
  // Formulář sbírá e-mail — hned u něj má být cesta k tomu, co se s ním
  // děje (/gdpr/, #431), ne až v patičce. Odkaz stojí v .nl-note vedle vět
  // o Kitu / potvrzení / odhlášení, které zůstávají doslova (test výš).
  const poznamka = newsletter().match(
    /<p\s+class="nl-note"\s+data-nl-note>([\s\S]*?)<\/p>/,
  );
  assert.ok(poznamka, "u Kit formuláře chybí viditelná informační poznámka");
  assert.match(
    poznamka[1],
    /<a href="\/gdpr\/">Ochrana údajů<\/a>/,
    "poznámka u newsletteru nevede na /gdpr/",
  );
});
