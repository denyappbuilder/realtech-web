import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const karta = readFileSync(join(koren, "src/components/ArticleCard.astro"), "utf8");

test("globální .card je position: relative, jinak se stretched link roztáhne mimo kartu", () => {
  const pravidlo = css.match(/\n\.card \{([\s\S]*?)\}/)?.[1] ?? "";
  assert.ok(pravidlo, "global.css ztratil pravidlo .card");
  assert.match(pravidlo, /position: relative/, ".card musí být position: relative");
});

test("odkaz v titulku karty je roztažený přes celou kartu (stretched link)", () => {
  const stretched = css.match(/\.card-body h3 a::after \{([^}]*)\}/)?.[1] ?? "";
  assert.ok(stretched, "global.css ztratil stretched link .card-body h3 a::after — popis a meta karet jsou mrtvá zóna");
  assert.match(stretched, /content: ''/, "::after bez content se nevykreslí");
  assert.match(stretched, /position: absolute/, "::after musí být absolutně pozicovaný");
  assert.match(stretched, /inset: 0/, "::after musí pokrýt celou kartu (inset: 0)");
});

test("ArticleCard má jen dva odkazy na stejný článek a náhled je aria-hidden", () => {
  const sablona = karta.split("---").slice(2).join("---");
  const odkazy = sablona.match(/<a\s[^>]*>/g) ?? [];
  assert.equal(odkazy.length, 2, "karta smí mít jen odkaz na náhledu a v titulku — stretched link nesmí překrýt jiný interaktivní prvek");
  const cile = odkazy.map((a) => a.match(/href=\{([^}]*)\}/)?.[1]);
  assert.equal(cile[0], cile[1], "oba odkazy v kartě musí vést na stejný článek");
  assert.match(odkazy[0], /aria-hidden="true"/, "odkaz na náhledu musí být aria-hidden (jméno karty dává titulek)");
  assert.match(odkazy[0], /tabindex="-1"/, "odkaz na náhledu nesmí být v tab pořadí");
  assert.match(sablona, /<h3><a href=\{`\/clanky\/\$\{article\.id\}\/`\}>\{title\}<\/a><\/h3>/, "titulek karty musí být odkaz — na něm sedí stretched ::after");
});
