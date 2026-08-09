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

test("porovnání hostname nerozlišuje velikost písmen", async () => {
  await assertRedirect("https://WWW.REALTECH.CZ/", "https://realtech.cz/");
});

test("kanonická doména pokračuje přes context.next()", async () => {
  await assertPassThrough("https://realtech.cz/");
});

test("preview pages.dev doména pokračuje přes context.next()", async () => {
  await assertPassThrough("https://abc123.realtech-web.pages.dev/");
});

test("localhost pokračuje přes context.next()", async () => {
  await assertPassThrough("http://localhost:4321/");
});
