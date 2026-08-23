import assert from "node:assert/strict";
import test from "node:test";

import {
  createIndexNowFixture,
  runIndexNowAndCaptureRequests,
} from "./indexnow-test-harness.mjs";

const INDEXNOW_MAX_URLS_PER_REQUEST = 10_000;
const KEY = "0123456789abcdef";

function orderedUrls(count) {
  return Array.from(
    { length: count },
    (_, index) => `https://realtech.cz/testy/indexnow/${String(index).padStart(5, "0")}/`,
  );
}

function assertValidIndexNowRequest(request, urlList) {
  assert.equal(request.url, "https://api.indexnow.org/indexnow");
  assert.equal(request.method, "POST");
  assert.deepEqual(request.body, {
    host: "realtech.cz",
    key: KEY,
    keyLocation: `https://realtech.cz/${KEY}.txt`,
    urlList,
  });
}

test("běžný malý vstup odešle jediný request beze změny", (t) => {
  const urls = orderedUrls(3);
  const root = createIndexNowFixture(t, urls);

  const requests = runIndexNowAndCaptureRequests(root);

  assert.equal(requests.length, 1);
  assertValidIndexNowRequest(requests[0], urls);
});

test("explicitní cesty v malém vstupu zůstanou jedním requestem", (t) => {
  const root = createIndexNowFixture(t, orderedUrls(8));

  const requests = runIndexNowAndCaptureRequests(root, [
    "/clanky/prvni/",
    "testy/druhy/",
  ]);

  assert.equal(requests.length, 1);
  assertValidIndexNowRequest(requests[0], [
    "https://realtech.cz/clanky/prvni/",
    "https://realtech.cz/testy/druhy/",
  ]);
});

test("přesně 10 000 URL odešle v jediném requestu beze ztráty", (t) => {
  const urls = orderedUrls(INDEXNOW_MAX_URLS_PER_REQUEST);
  const root = createIndexNowFixture(t, urls);

  const requests = runIndexNowAndCaptureRequests(root);

  assert.equal(requests.length, 1);
  assertValidIndexNowRequest(requests[0], urls);
});

test("10 001 URL rozdělí do requestů po nejvýše 10 000", (t) => {
  const urls = orderedUrls(INDEXNOW_MAX_URLS_PER_REQUEST + 1);
  const root = createIndexNowFixture(t, urls);

  const requests = runIndexNowAndCaptureRequests(root);
  const batches = requests.map((request) => request.body.urlList);

  assert.deepEqual(batches.map((batch) => batch.length), [10_000, 1]);
  assert.ok(batches.every((batch) => batch.length <= INDEXNOW_MAX_URLS_PER_REQUEST));
  assert.deepEqual(batches.flat(), urls);
  assertValidIndexNowRequest(requests[0], urls.slice(0, 10_000));
  assertValidIndexNowRequest(requests[1], urls.slice(10_000));
});
