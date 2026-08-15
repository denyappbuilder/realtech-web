import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import { renderToString } from "astro/runtime/server/index.js";

import "./test-archive-register.mjs";

import {
  getMockState,
  resetArchiveMocks,
  setCollection,
} from "./test-archive-mocks/state.mjs";

const { default: ArchivePage } = await import(
  "../src/pages/clanky/index.astro"
);

const SITE = new URL("https://realtech.cz/");

function article({
  id,
  date,
  category,
  draft = false,
  title = `Titulek ${id}`,
}) {
  return {
    id,
    data: { title, category, date: new Date(date), draft },
  };
}

function createRenderResult() {
  return {
    partial: true,
    cancelled: false,
    clientDirectives: new Map(),
    componentMetadata: new Map(),
    _metadata: {
      propagators: new Set(),
      extraHead: [],
      hasRenderedHead: false,
      headInTree: false,
      renderedScripts: new Set(),
      rendererSpecificHydrationScripts: new Set(),
    },
    createAstro(astroStatic, props, slots) {
      return {
        ...astroStatic,
        site: SITE,
        props,
        slots,
      };
    },
  };
}

async function renderArchive(entries) {
  setCollection(entries);
  return renderToString(createRenderResult(), ArchivePage, {}, {});
}

function renderedArticleIds(html) {
  return [...html.matchAll(/data-test-article-id="([^"]+)"/g)]
    .map((match) => match[1]);
}

function renderedCategories(html) {
  const filter = html.match(/<div class="cat-filter"[\s\S]*?<\/div>/)?.[0];
  assert.ok(filter, "renderovaný archiv obsahuje filtr kategorií");
  return [...filter.matchAll(/<button class="chip" data-cat="([^"]+)"/g)]
    .map((match) => match[1]);
}

function renderedJsonLd(html) {
  const json = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(json, "renderovaný archiv obsahuje JSON-LD");
  return JSON.parse(json);
}

beforeEach(() => {
  resetArchiveMocks();
});

test("archiv požádá o clanky, vyfiltruje drafty a seřadí publikované články sestupně podle data", async () => {
  const html = await renderArchive([
    article({ id: "starsi", date: "2024-03-02T00:00:00.000Z", category: "AI" }),
    article({
      id: "draft-nejnovejsi",
      date: "2027-01-01T00:00:00.000Z",
      category: "Tajné",
      draft: true,
    }),
    article({ id: "nejnovejsi", date: "2026-06-15T00:00:00.000Z", category: "Drony" }),
    article({ id: "prostredni", date: "2025-11-20T00:00:00.000Z", category: "AI" }),
  ]);

  assert.deepEqual(renderedArticleIds(html), [
    "nejnovejsi",
    "prostredni",
    "starsi",
  ]);
  assert.doesNotMatch(html, /draft-nejnovejsi|Tajné/);
  assert.equal(getMockState().collectionCalls.length, 1);
  assert.equal(getMockState().collectionCalls[0].name, "clanky");
});

test("kategorie odvodí pouze z publikovaných článků a každou vykreslí jednou", async () => {
  const html = await renderArchive([
    article({ id: "ai-starsi", date: "2024-01-01T00:00:00.000Z", category: "AI" }),
    article({ id: "drony", date: "2025-05-01T00:00:00.000Z", category: "Drony" }),
    article({ id: "ai-novejsi", date: "2026-02-01T00:00:00.000Z", category: "AI" }),
    article({
      id: "draft-kategorie",
      date: "2027-03-01T00:00:00.000Z",
      category: "Jen draft",
      draft: true,
    }),
  ]);

  assert.deepEqual(renderedCategories(html), ["AI", "Drony"]);
  assert.doesNotMatch(html, /Jen draft/);
});

test("JSON-LD ItemList používá pořadí archivu, souvislé pozice, kanonické URL a nepočítá drafty", async () => {
  const html = await renderArchive([
    article({
      id: "treti",
      date: "2024-08-09T00:00:00.000Z",
      category: "Hardware",
      title: "Třetí článek",
    }),
    article({
      id: "draft",
      date: "2028-12-31T00:00:00.000Z",
      category: "Hardware",
      title: "Draft článek",
      draft: true,
    }),
    article({
      id: "prvni",
      date: "2026-04-05T00:00:00.000Z",
      category: "AI",
      title: "První článek",
    }),
    article({
      id: "druhy",
      date: "2025-01-02T00:00:00.000Z",
      category: "Drony",
      title: "Druhý článek",
    }),
  ]);

  const jsonLd = renderedJsonLd(html);
  assert.equal(jsonLd.url, "https://realtech.cz/clanky/");
  assert.equal(jsonLd.mainEntity.numberOfItems, 3);
  assert.deepEqual(jsonLd.mainEntity.itemListElement, [
    {
      "@type": "ListItem",
      position: 1,
      url: "https://realtech.cz/clanky/prvni/",
      name: "První článek",
    },
    {
      "@type": "ListItem",
      position: 2,
      url: "https://realtech.cz/clanky/druhy/",
      name: "Druhý článek",
    },
    {
      "@type": "ListItem",
      position: 3,
      url: "https://realtech.cz/clanky/treti/",
      name: "Třetí článek",
    },
  ]);
});
