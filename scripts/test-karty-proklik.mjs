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

test("ArticleCard má právě jeden odkaz a náhled není <a>", () => {
  const sablona = karta.split(/^---\s*$/m).slice(2).join("---");
  const odkazy = sablona.match(/<a\s[^>]*>/g) ?? [];
  assert.equal(odkazy.length, 1, "karta smí mít jen odkaz v titulku — náhled jako <a> je vnořený interaktivní prvek");
  assert.match(sablona, /<div class=\{`card-thumb \$\{thumbClass\}`\}>/, "náhled musí být <div class=card-thumb>");
  assert.doesNotMatch(sablona, /<a\s[^>]*card-thumb/, "náhled nesmí být odkaz na stejné URL jako titulek");
  assert.match(sablona, /<h3><a href=\{`\/clanky\/\$\{article\.id\}\/`\}>\{title\}<\/a><\/h3>/, "titulek karty musí být odkaz — na něm sedí stretched ::after");
});
