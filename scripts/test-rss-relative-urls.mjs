import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  getMockState,
  resetRssMocks,
  setCollection,
} from "./test-rss-mocks/state.mjs";
import { GET } from "../src/pages/rss.xml.js";

const site = new URL("https://realtech.cz/");

function article(body) {
  return {
    id: "hranice-relativnich-url",
    body,
    data: {
      title: "Hranice relativních URL",
      description: "Převod URL v HTML obsahu RSS",
      date: new Date("2025-04-05T06:07:08.000Z"),
      category: "Testy",
      draft: false,
    },
  };
}

beforeEach(() => {
  resetRssMocks();
});

test("GET absolutizuje skutečně relativní href a src vůči stránce článku [codex-testy-web/RSS-RELATIVE-001]", {
  todo: "Produkce převádí pouze URL s úvodním lomítkem; viz [codex-testy-web/RSS-RELATIVE-001].",
}, async () => {
  setCollection([article([
    '<a href="souvisejici/clanek?zdroj=rss#detail">Související článek</a>',
    '<a href="./prehled.html?rezim=plny#obsah">Přehled</a>',
    '<img src="../images/nahled.v2.webp?width=1200#hero" alt="Náhled">',
  ].join("\n"))]);

  await GET({ site });

  assert.equal(
    getMockState().rssCalls[0].items[0].content,
    [
      '<a href="https://realtech.cz/clanky/hranice-relativnich-url/souvisejici/clanek?zdroj=rss#detail">Související článek</a>',
      '<a href="https://realtech.cz/clanky/hranice-relativnich-url/prehled.html?rezim=plny#obsah">Přehled</a>',
      '<img src="https://realtech.cz/clanky/images/nahled.v2.webp?width=1200#hero" alt="Náhled">',
    ].join("\n"),
  );
});

test("GET nepřepisuje absolutní, protocol-relative, mailto ani fragmentové URL", async () => {
  const content = [
    '<a href="http://example.com/clanek?zdroj=rss#detail">HTTP</a>',
    '<a href="https://example.com/clanek?zdroj=rss#detail">HTTPS</a>',
    '<a href="//cdn.example.com/clanek?zdroj=rss#detail">Protocol-relative</a>',
    '<img src="https://cdn.example.com/nahled.v2.webp?width=1200#hero" alt="HTTPS obrázek">',
    '<img src="//cdn.example.com/nahled.v2.webp?width=1200#hero" alt="Protocol-relative obrázek">',
    '<a href="mailto:redakce@example.com?subject=RSS">E-mail</a>',
    '<a href="#detail">Fragment</a>',
  ].join("\n");
  setCollection([article(content)]);

  await GET({ site });

  assert.equal(getMockState().rssCalls[0].items[0].content, content);
});
