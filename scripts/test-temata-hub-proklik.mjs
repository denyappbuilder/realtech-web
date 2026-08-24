import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const hub = readFileSync(join(koren, "src/pages/temata/index.astro"), "utf8");

const karta = hub.match(/<article class="card"[\s\S]*?<\/article>/)?.[0] ?? "";
const styl = hub.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? "";

test("karta tématu má právě jeden odkaz a ten vede na /temata/{slug}/", () => {
  assert.ok(karta, "hub /temata/ ztratil <article class=\"card\">");
  const odkazy = karta.match(/<a\s/g) ?? [];
  assert.equal(odkazy.length, 1, "karta musí mít jediný <a> (stretched link nesmí mít vnořené interaktivní prvky)");
  assert.match(karta, /<h3><a href=\{`\/temata\/\$\{t\.slug\}\/`\}>/, "titulek karty neodkazuje na detail tématu");
});

test("odkaz v titulku je roztažený přes celou kartu (stretched link)", () => {
  assert.ok(styl, "hub /temata/ ztratil <style> se stretched linkem — karty nejsou celé klikací");
  assert.match(styl, /\.grid \.card \{ position: relative; \}/, "karta musí být position: relative, jinak se ::after roztáhne mimo ni");
  const stretched = styl.match(/\.card-body h3 a::after \{([\s\S]*?)\}/)?.[1] ?? "";
  assert.match(stretched, /content: ''/, "::after bez content se nevykreslí");
  assert.match(stretched, /position: absolute/, "::after musí být absolutně pozicovaný");
  assert.match(stretched, /inset: 0/, "::after musí pokrýt celou kartu (inset: 0)");
});
