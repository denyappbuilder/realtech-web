import test from "node:test";
import assert from "node:assert/strict";

import { onRequest } from "../functions/_middleware.js";

async function assertRedirect(source, destination) {
  const response = await onRequest({
    request: new Request(source),
    next() {
      assert.fail("context.next() se při přesměrování nesmí zavolat");
    },
  });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), destination);
}

async function assertPassThrough(source) {
  const assetResponse = new Response("ASSET");
  let nextCalls = 0;

  const response = await onRequest({
    request: new Request(source),
    next() {
      nextCalls += 1;
      return assetResponse;
    },
  });

  assert.strictEqual(response, assetResponse);
  assert.equal(nextCalls, 1);
}

test("www doména vrací trvalé přesměrování na kanonickou doménu", async () => {
  await assertRedirect("https://www.realtech.cz/", "https://realtech.cz/");
});

test("www doména zachová cestu a query string", async () => {
  await assertRedirect(
    "https://www.realtech.cz/clanky/neco/?a=1",
    "https://realtech.cz/clanky/neco/?a=1",
  );
});

test("produkční pages.dev doména se přesměruje", async () => {
  await assertRedirect(
    "https://realtech-web.pages.dev/",
    "https://realtech.cz/",
  );
});

test("explicitní port aliasu se odstraní a cesta s query se zachovají", async (t) => {
  const cases = [
    "https://www.realtech.cz:8443/clanky/port/?a=1&b=dva",
    "https://realtech-web.pages.dev:8443/clanky/port/?a=1&b=dva",
  ];

  for (const source of cases) {
    await t.test(new URL(source).host, async () => {
      await assertRedirect(
        source,
        "https://realtech.cz/clanky/port/?a=1&b=dva",
      );
    });
  }
});

test("percent-encoded cesta a query se zachovají beze změny bajtů", async () => {
  const encodedSuffix =
    "/%C4%8Desk%C3%BD%20text/%2Fliteral%3F/%25?q=%C5%BElu%C5%A5ou%C4%8Dk%C3%BD%20k%C5%AF%C5%88&next=%2Ffoo%3Fa%3D1%26b%3D2&plus=a%2Bb+";

  await assertRedirect(
    `https://www.realtech.cz${encodedSuffix}`,
    `https://realtech.cz${encodedSuffix}`,
  );
});

test("porovnání hostname nerozlišuje velikost písmen", async () => {
  await assertRedirect("https://WWW.REALTECH.CZ/", "https://realtech.cz/");
});

test("kanonická doména pokračuje přes context.next()", async () => {
  await assertPassThrough("https://realtech.cz/");
});

test("preview pages.dev doména pokračuje přes context.next()", async () => {
  await assertPassThrough("https://abc123.realtech-web.pages.dev/");
});

test("hostname obsahující pouze text povoleného aliasu se nepřesměruje", async (t) => {
  const deceptiveHosts = [
    "www.realtech.cz.example.com",
    "prefix-www.realtech.cz",
    "www.realtech.cz-suffix.example.com",
    "realtech-web.pages.dev.example.com",
    "prefix-realtech-web.pages.dev",
    "realtech-web.pages.dev-suffix.example.com",
  ];

  for (const hostname of deceptiveHosts) {
    await t.test(hostname, async () => {
      await assertPassThrough(`https://${hostname}/citliva-cesta/?redirect=1`);
    });
  }
});

test(
  "absolutní www hostname s koncovou tečkou se přesměruje",
  { todo: "[codex-testy-web/CANONICAL-HOST-001]" },
  async () => {
    await assertRedirect(
      "https://www.realtech.cz./clanky/fqdn/?a=1",
      "https://realtech.cz/clanky/fqdn/?a=1",
    );
  },
);

test(
  "absolutní pages.dev hostname s koncovou tečkou se přesměruje",
  { todo: "[codex-testy-web/CANONICAL-HOST-001]" },
  async () => {
    await assertRedirect(
      "https://realtech-web.pages.dev./clanky/fqdn/?a=1",
      "https://realtech.cz/clanky/fqdn/?a=1",
    );
  },
);

test("localhost pokračuje přes context.next()", async () => {
  await assertPassThrough("http://localhost:4321/");
});
