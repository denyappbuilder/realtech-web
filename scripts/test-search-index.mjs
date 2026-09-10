import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import {
  getMockState,
  resetRssMocks,
  setCollection,
} from "./test-rss-mocks/state.mjs";
import {
  bothInputOrders,
  sameDateArticles,
  SAME_DATE_EXPECTED_IDS,
} from "./test-fixtures/same-date-articles.mjs";
import { GET, nahledProIndex } from "../src/pages/search-index.json.js";

function article({
  id,
  date,
  draft = false,
  title = id,
  description = `Popis ${id}`,
  category = "Testy",
  body = "",
  image,
  video,
  videoLength,
  zprava,
}) {
  return {
    id,
    body,
    data: { title, description, category, date, draft, image, video, videoLength, zprava },
  };
}

beforeEach(() => {
  resetRssMocks();
});

test("GET vynechá drafty a seřadí publikované články od nejnovějšího", async () => {
  setCollection([
    article({ id: "starsi", date: new Date("2024-02-03T00:00:00.000Z") }),
    article({
      id: "draft",
      date: new Date("2026-12-31T00:00:00.000Z"),
      draft: true,
    }),
    article({ id: "nejnovejsi", date: new Date("2025-07-08T00:00:00.000Z") }),
    article({ id: "prostredni", date: new Date("2025-01-02T00:00:00.000Z") }),
  ]);

  const response = await GET();
  const items = await response.json();

  assert.deepEqual(items.map(({ s }) => s), [
    "nejnovejsi",
    "prostredni",
    "starsi",
  ]);
  assert.equal(getMockState().collectionCalls.length, 1);
  assert.equal(getMockState().collectionCalls[0].name, "clanky");
});

test("GET řadí shodné datum stabilně podle ID bez ohledu na pořadí kolekce", async () => {
  const outputs = [];

  for (const entries of bothInputOrders(sameDateArticles(article))) {
    setCollection(entries);
    const response = await GET();
    outputs.push((await response.json()).map(({ s }) => s));
  }

  assert.deepEqual(outputs[0], SAME_DATE_EXPECTED_IDS);
  assert.deepEqual(outputs[1], outputs[0]);
});

test("GET vrátí přesný minifikovaný JSON kontrakt a Content-Type", async () => {
  setCollection([
    article({
      id: "presny-kontrakt",
      title: "Přesný titulek",
      description: "Přesný popis",
      category: "Hardware",
      date: new Date("2025-04-05T23:59:58.000Z"),
      body: "Obsah článku",
    }),
  ]);

  const response = await GET();

  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(
    await response.text(),
    '[{"s":"presny-kontrakt","t":"Přesný titulek","d":"Přesný popis","k":"Hardware","b":"Obsah článku","p":"2025-04-05"}]',
  );
});

test("GET odstraní Markdown, HTML, code fence a cíle odkazů, ale zachová čitelný text", async () => {
  setCollection([
    article({
      id: "cisteni",
      date: new Date("2025-03-04T00:00:00.000Z"),
      body: [
        "# Nadpis",
        "<p>HTML <strong>tučně</strong>.</p>",
        "[Dokumentace](https://example.com/cil)",
        "```js\nconst tajne = '<tag>';\n```",
        "`inline` > citace - seznam | tabulka **kurziva** _podtržení_",
      ].join("\n"),
    }),
  ]);

  const response = await GET();
  const [item] = await response.json();

  assert.equal(
    item.b,
    "Nadpis HTML tučně . Dokumentace inline citace seznam tabulka kurziva podtržení",
  );
  assert.doesNotMatch(item.b, /example\.com|const tajne|<[^>]+>|[#*_>`|\[\]()]/);
});

// ── Kolo 35: náhled a štítky karty pro filtr /clanky/ ─────────────────────
// Karty doplněné z indexu byly jen text (CLS, nejednotná mřížka). Index
// nese `i` = TÝŽ soubor, jaký dává ArticleCard do <img src>, a volitelné
// `z` (Zpráva) / `v` (délka videa) pro štítky .lt. Bez hodnoty klíč v JSON
// není — index se nenafukuje kvůli článkům bez videa.

test("kolo 35: nahledProIndex volí soubor jako ArticleCard — WebP -640 z public/, YouTube jen bez lokálního coveru", () => {
  // Skutečný cover v repu (test-z1072 hlídá, že derivát -640.webp je commitnutý).
  assert.equal(
    nahledProIndex({ image: "/images/clanky/anthropic-claude-opus-5.jpg" }),
    "/images/clanky/anthropic-claude-opus-5-640.webp",
  );
  // Lokální cover má přednost i u videa.
  assert.equal(
    nahledProIndex({ image: "/images/clanky/anthropic-claude-opus-5.jpg", video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
    "/images/clanky/anthropic-claude-opus-5-640.webp",
  );
  // Cover ve frontmatteru, ale soubor v public/ chybí → YouTube maxresdefault (ne 404).
  assert.equal(
    nahledProIndex({ image: "/images/clanky/neexistuje.jpg", video: "https://youtu.be/dQw4w9WgXcQ" }),
    "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  );
  // Bez videa zůstává cesta z frontmatteru (stejně jako <img src> SSR karty).
  assert.equal(nahledProIndex({ image: "/images/clanky/neexistuje.png" }), "/images/clanky/neexistuje.png");
  assert.equal(nahledProIndex({}), undefined);
  assert.equal(nahledProIndex({ video: "https://example.com/ne-youtube" }), undefined);
});

test("kolo 35: GET dává i/z/v jen tam, kde článek hodnotu má; kontrakt s/t/d/k/b/p zůstává", async () => {
  setCollection([
    article({
      id: "zprava-s-videem",
      title: "Zpráva",
      description: "Popis",
      category: "Vesmír",
      date: new Date("2026-09-01T00:00:00.000Z"),
      video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoLength: "12:34",
      zprava: true,
    }),
    article({
      id: "holy",
      title: "Holý",
      description: "Popis",
      category: "AI Report",
      date: new Date("2026-08-01T00:00:00.000Z"),
      zprava: false,
    }),
  ]);

  const response = await GET();
  const text = await response.text();
  const [zprava, holy] = JSON.parse(text);

  assert.deepEqual(zprava, {
    s: "zprava-s-videem",
    t: "Zpráva",
    d: "Popis",
    k: "Vesmír",
    b: "",
    p: "2026-09-01",
    i: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    z: 1,
    v: "12:34",
  });
  assert.deepEqual(Object.keys(holy), ["s", "t", "d", "k", "b", "p"], "bez coveru, videa a zprávy žádný i/z/v");
  assert.doesNotMatch(text, /"z":false|"v":""|"i":null|undefined/, "prázdné hodnoty se do JSON nedostanou");
});

test("GET po normalizaci whitespace neponechá na hranici 400 znaků koncovou mezeru [WEB-SEARCH-001]", async () => {
  setCollection([
    article({
      id: "hranice",
      date: new Date("2025-02-03T00:00:00.000Z"),
      body: ` \n${"x".repeat(399)}\n\t posledni-slovo  `,
    }),
  ]);

  const response = await GET();
  const [item] = await response.json();

  assert.equal(item.b.length <= 400, true);
  assert.doesNotMatch(item.b, /^\s|\s$|\s{2,}/);
});
