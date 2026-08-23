import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import "./test-llms-register.mjs";

const {
  getCollectionCalls,
  resetLlmsMocks,
  setCollection,
} = await import("./test-llms-mocks/state.mjs");
const { GET } = await import("../src/pages/llms.txt.js");

function article({
  id,
  date,
  category,
  draft = false,
  title = id,
  description = `Popis ${id}`,
}) {
  return {
    id,
    data: {
      title,
      description,
      date: new Date(date),
      category,
      draft,
    },
  };
}

beforeEach(() => {
  resetLlmsMocks();
});

test("GET vrátí úplný textový kontrakt pro prázdnou kolekci", async () => {
  setCollection([]);

  const response = await GET({ site: new URL("https://realtech.cz/") });

  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(
    await response.text(),
    `# REALTECH CZ

> Český web o technologiích a AI bez marketingových řečí. Novinky, analýzy a videa YouTube kanálu REALTECH CZ (Deny & Sam). Psáno česky pro publikum v ČR a SK.

Web je statický (Astro). Níže je kompletní seznam 0 článků rozdělený podle kategorie. Každý článek je dostupný jako čisté HTML na uvedené adrese.

## Rozcestník

- [Všechny články](https://realtech.cz/clanky/): kompletní archiv novinek a analýz
- [Témata](https://realtech.cz/temata/): rozcestník článků podle kategorií
- [RSS feed](https://realtech.cz/rss.xml): plné texty článků s popisky a obrázky
- [Sitemap](https://realtech.cz/sitemap-index.xml): mapa webu
- [O nás](https://realtech.cz/o-nas/): kdo za webem stojí



## Jinde

- [YouTube kanál](https://www.youtube.com/@realtech-cz): videa REALTECH CZ
- Kontakt: info@realtech.cz
`,
  );

  const calls = getCollectionCalls();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "clanky");
  assert.equal(typeof calls[0].filter, "function");
});

test("GET filtruje draft callbackem, řadí a zachová všechny články v kategoriích", async () => {
  setCollection([
    article({
      id: "ai-starsi",
      title: "Starší AI",
      description: "Druhý článek v AI",
      date: "2025-02-03T23:59:58.000Z",
      category: "AI",
    }),
    article({
      id: "hardware",
      title: "Hardware",
      description: "Samostatná kategorie",
      date: "2025-05-06T12:30:00.000Z",
      category: "Hardware",
    }),
    article({
      id: "draft",
      title: "Nezveřejněný článek",
      description: "Nesmí se objevit",
      date: "2027-01-01T00:00:00.000Z",
      category: "AI",
      draft: true,
    }),
    article({
      id: "ai-nejstarsi",
      title: "Nejstarší AI",
      description: "Třetí článek v AI",
      date: "2024-11-12T08:00:00.000Z",
      category: "AI",
    }),
    article({
      id: "ai-nejnovejsi",
      title: "Nejnovější AI",
      description: "První článek v AI",
      date: "2026-07-08T01:02:03.000Z",
      category: "AI",
    }),
  ]);

  const response = await GET({ site: new URL("https://realtech.cz/") });

  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(
    await response.text(),
    `# REALTECH CZ

> Český web o technologiích a AI bez marketingových řečí. Novinky, analýzy a videa YouTube kanálu REALTECH CZ (Deny & Sam). Psáno česky pro publikum v ČR a SK.

Web je statický (Astro). Níže je kompletní seznam 4 článků rozdělený podle kategorie. Každý článek je dostupný jako čisté HTML na uvedené adrese.

## Rozcestník

- [Všechny články](https://realtech.cz/clanky/): kompletní archiv novinek a analýz
- [Témata](https://realtech.cz/temata/): rozcestník článků podle kategorií
- [RSS feed](https://realtech.cz/rss.xml): plné texty článků s popisky a obrázky
- [Sitemap](https://realtech.cz/sitemap-index.xml): mapa webu
- [O nás](https://realtech.cz/o-nas/): kdo za webem stojí

## AI

- [Nejnovější AI](https://realtech.cz/clanky/ai-nejnovejsi/) (2026-07-08): První článek v AI
- [Starší AI](https://realtech.cz/clanky/ai-starsi/) (2025-02-03): Druhý článek v AI
- [Nejstarší AI](https://realtech.cz/clanky/ai-nejstarsi/) (2024-11-12): Třetí článek v AI

## Hardware

- [Hardware](https://realtech.cz/clanky/hardware/) (2025-05-06): Samostatná kategorie

## Jinde

- [YouTube kanál](https://www.youtube.com/@realtech-cz): videa REALTECH CZ
- Kontakt: info@realtech.cz
`,
  );

  const calls = getCollectionCalls();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "clanky");
  assert.equal(calls[0].filter({ data: { draft: false } }), true);
  assert.equal(calls[0].filter({ data: { draft: true } }), false);
});
