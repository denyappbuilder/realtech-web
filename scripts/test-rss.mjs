import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  getMockState,
  resetRssMocks,
  setCollection,
  setExistingFiles,
} from "./test-rss-mocks/state.mjs";
import {
  bothInputOrders,
  sameDateArticles,
  SAME_DATE_EXPECTED_IDS,
} from "./test-fixtures/same-date-articles.mjs";
import { GET } from "../src/pages/rss.xml.js";

const site = new URL("https://realtech.cz/");

function article({
  id,
  date,
  draft = false,
  title = id,
  description = `Popis ${id}`,
  category = "Testy",
  image,
  body = "",
}) {
  return {
    id,
    body,
    data: {
      title,
      description,
      date,
      category,
      draft,
      image,
    },
  };
}

beforeEach(() => {
  resetRssMocks();
});

test("GET vynechá drafty, seřadí články od nejnovějšího a omezí feed na 50", async () => {
  const published = Array.from({ length: 55 }, (_, index) => article({
    id: `article-${String(index).padStart(2, "0")}`,
    date: new Date(Date.UTC(2025, 0, index + 1)),
  }));
  const deliberatelyUnsorted = [
    ...published.filter((_, index) => index % 2 === 0),
    article({
      id: "newest-draft",
      date: new Date("2026-01-02T00:00:00.000Z"),
      draft: true,
    }),
    ...published.filter((_, index) => index % 2 === 1),
    article({
      id: "older-draft",
      date: new Date("2024-01-01T00:00:00.000Z"),
      draft: true,
    }),
  ];
  setCollection(deliberatelyUnsorted);

  await GET({ site });

  const state = getMockState();
  assert.equal(state.collectionCalls.length, 1);
  assert.equal(state.collectionCalls[0].name, "clanky");
  assert.equal(state.rssCalls.length, 1);

  const { items } = state.rssCalls[0];
  assert.equal(items.length, 50);
  assert.deepEqual(
    items.map(({ link }) => link),
    Array.from(
      { length: 50 },
      (_, index) => `/clanky/article-${String(54 - index).padStart(2, "0")}/`,
    ),
  );
  assert.ok(items.every(({ title }) => !title.includes("draft")));
});

test("GET řadí shodné datum stabilně podle ID bez ohledu na pořadí kolekce", async () => {
  const outputs = [];

  for (const entries of bothInputOrders(sameDateArticles(article))) {
    setCollection(entries);
    await GET({ site });
    outputs.push(getMockState().rssCalls.at(-1).items.map(({ link }) => (
      link.replace(/^\/clanky\//, "").replace(/\/$/, "")
    )));
  }

  assert.deepEqual(outputs[0], SAME_DATE_EXPECTED_IDS);
  assert.deepEqual(outputs[1], outputs[0]);
});

test("GET mapuje metadata, kategorie a odkazy a absolutizuje kořenové href a src", async () => {
  const rssResult = getMockState().rssResult;
  setCollection([
    article({
      id: "mapovani",
      title: "Mapovaný článek",
      description: "Přesný popis",
      category: "Hardware",
      date: new Date("2025-04-05T06:07:08.000Z"),
      body: [
        '<a href="/clanky/cil/">Interní odkaz</a>',
        '<img src="/images/inline.jpg" alt="Inline">',
        '<a href="https://example.com/cil">Externí odkaz</a>',
      ].join("\n"),
    }),
  ]);

  const result = await GET({ site });

  assert.strictEqual(result, rssResult);
  const options = getMockState().rssCalls[0];
  assert.equal(options.title, "REALTECH CZ");
  assert.equal(options.description, "Tech novinky a analýzy bez marketingových řečí.");
  assert.strictEqual(options.site, site);
  assert.equal(options.customData, "<language>cs</language>");
  assert.equal(options.items.length, 1);

  const [item] = options.items;
  assert.equal(item.title, "Mapovaný článek");
  assert.equal(item.description, "Přesný popis");
  assert.equal(item.pubDate.toISOString(), "2025-04-05T06:07:08.000Z");
  assert.equal(item.link, "/clanky/mapovani/");
  assert.deepEqual(item.categories, ["Hardware"]);
  assert.match(item.content, /href="https:\/\/realtech\.cz\/clanky\/cil\/"/);
  assert.match(item.content, /src="https:\/\/realtech\.cz\/images\/inline\.jpg"/);
  assert.match(item.content, /href="https:\/\/example\.com\/cil"/);
});

test("GET vytvoří enclosure jen pro obrázek, který existuje na filesystému", async () => {
  setExistingFiles([["public/images/existing.jpg", 321]]);
  setCollection([
    article({
      id: "existing",
      date: new Date("2025-03-03T00:00:00.000Z"),
      image: "/images/existing.jpg",
    }),
    article({
      id: "missing",
      date: new Date("2025-03-02T00:00:00.000Z"),
      image: "/images/missing.jpg",
    }),
    article({
      id: "without-image",
      date: new Date("2025-03-01T00:00:00.000Z"),
    }),
  ]);

  await GET({ site });

  const state = getMockState();
  const [existing, missing, withoutImage] = state.rssCalls[0].items;
  assert.deepEqual(existing.enclosure, {
    url: "https://realtech.cz/images/existing.jpg",
    type: "image/jpeg",
    length: 321,
  });
  assert.equal(missing.enclosure, undefined);
  assert.equal(withoutImage.enclosure, undefined);
  assert.deepEqual(state.existsCalls, [
    "public/images/existing.jpg",
    "public/images/missing.jpg",
  ]);
  assert.deepEqual(state.statCalls, ["public/images/existing.jpg"]);
});
