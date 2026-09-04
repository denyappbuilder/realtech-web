import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  getMockState,
  resetRssMocks,
  setCollection,
  setExistingFiles,
} from "./test-rss-mocks/state.mjs";
import { GET } from "../src/pages/rss.xml.js";

const site = new URL("https://realtech.cz/");
const publishedAt = new Date("2025-04-05T06:07:08.000Z");

function article(overrides = {}) {
  return {
    id: "hranice-url",
    body: "",
    data: {
      title: "Hranice URL",
      description: "Test rizikových vstupů RSS",
      date: publishedAt,
      category: "Testy",
      draft: false,
    },
    ...overrides,
  };
}

beforeEach(() => {
  resetRssMocks();
});

test("GET přepisuje jen kořenové HTML URL a ostatní typy odkazů zachová přesně", async () => {
  setCollection([article({
    body: [
      '<a href="/clanky/cil/?strana=2#sekce">Kořenový odkaz</a>',
      '<img src="/images/nahled.jpg?v=3#nahled" alt="Náhled">',
      '<a href="relativni/cil">Relativní odkaz</a>',
      '<a href="#sekce">Fragment</a>',
      '<a href="mailto:redakce@example.com">E-mail</a>',
      '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Data URL">',
    ].join("\n"),
  })]);

  await GET({ site });

  assert.equal(
    getMockState().rssCalls[0].items[0].content,
    [
      '<a href="https://realtech.cz/clanky/cil/?strana=2#sekce">Kořenový odkaz</a>',
      '<img src="https://realtech.cz/images/nahled.jpg?v=3#nahled" alt="Náhled">',
      '<a href="relativni/cil">Relativní odkaz</a>',
      '<a href="#sekce">Fragment</a>',
      '<a href="mailto:redakce@example.com">E-mail</a>',
      '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Data URL">',
    ].join("\n"),
  );
});

test("GET zachová protocol-relative URL beze změny [codex-testy-web/RSS-URL-001]", async () => {
  setCollection([article({
    body: [
      '<a href="//cdn.example.com/clanek">CDN odkaz</a>',
      '<img src="//cdn.example.com/obrazek.jpg" alt="CDN obrázek">',
    ].join("\n"),
  })]);

  await GET({ site });

  assert.equal(
    getMockState().rssCalls[0].items[0].content,
    [
      '<a href="//cdn.example.com/clanek">CDN odkaz</a>',
      '<img src="//cdn.example.com/obrazek.jpg" alt="CDN obrázek">',
    ].join("\n"),
  );
});

test("GET nečte enclosure mimo public přes nadřazené segmenty [codex-testy-web/RSS-PATH-002]", async () => {
  setExistingFiles([["public/../package.json", 777]]);
  setCollection([article({
    data: {
      title: "Hranice URL",
      description: "Test rizikových vstupů RSS",
      date: publishedAt,
      category: "Testy",
      draft: false,
      image: "/../package.json",
    },
  })]);

  await GET({ site });

  const state = getMockState();
  assert.deepEqual(state.existsCalls, []);
  assert.deepEqual(state.statCalls, []);
  assert.equal(state.rssCalls[0].items[0].enclosure, undefined);
});

test("GET odvodí MIME enclosure z přípony obrázku [codex-testy-web/RSS-MIME-005]", async () => {
  setExistingFiles([
    ["public/images/nahled.png", 201],
    ["public/images/nahled.webp", 202],
  ]);
  setCollection([
    article({
      id: "png",
      data: {
        title: "PNG",
        description: "Test rizikových vstupů RSS",
        date: publishedAt,
        category: "Testy",
        draft: false,
        image: "/images/nahled.png",
      },
    }),
    article({
      id: "webp",
      data: {
        title: "WebP",
        description: "Test rizikových vstupů RSS",
        date: publishedAt,
        category: "Testy",
        draft: false,
        image: "/images/nahled.webp",
      },
    }),
  ]);

  await GET({ site });

  const [png, webp] = getMockState().rssCalls[0].items;
  assert.deepEqual(
    [png.enclosure.type, webp.enclosure.type],
    ["image/png", "image/webp"],
  );
});

test("GET odmítne zpětné parent segmenty, ale přijme dvě tečky uvnitř názvu", async () => {
  setExistingFiles([
    ["public/images/archive..preview.jpg", 301],
    ["public\\..\\package.json", 302],
  ]);
  setCollection([
    article({
      id: "bezpecny-nazev",
      data: {
        title: "Bezpečný název",
        description: "Test rizikových vstupů RSS",
        date: publishedAt,
        category: "Testy",
        draft: false,
        image: "/images/archive..preview.jpg",
      },
    }),
    article({
      id: "windows-traversal",
      data: {
        title: "Windows traversal",
        description: "Test rizikových vstupů RSS",
        date: publishedAt,
        category: "Testy",
        draft: false,
        image: "\\..\\package.json",
      },
    }),
  ]);

  await GET({ site });

  const state = getMockState();
  assert.deepEqual(state.existsCalls, ["public/images/archive..preview.jpg"]);
  assert.deepEqual(state.statCalls, ["public/images/archive..preview.jpg"]);
  assert.deepEqual(state.rssCalls[0].items[0].enclosure, {
    url: "https://realtech.cz/images/archive..preview.jpg",
    type: "image/jpeg",
    length: 301,
  });
  assert.equal(state.rssCalls[0].items[1].enclosure, undefined);
});
