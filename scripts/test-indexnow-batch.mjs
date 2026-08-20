import assert from "node:assert/strict";
import test from "node:test";

import {
  createIndexNowFixture,
  runIndexNowAndCaptureRequests,
} from "./indexnow-test-harness.mjs";

const INDEXNOW_MAX_URLS_PER_REQUEST = 10_000;

function orderedUrls(count) {
  return Array.from(
    { length: count },
    (_, index) => `https://realtech.cz/testy/indexnow/${String(index).padStart(5, "0")}/`,
  );
}

test("přesně 10 000 URL odešle v jediném requestu beze ztráty", (t) => {
  const urls = orderedUrls(INDEXNOW_MAX_URLS_PER_REQUEST);
  const root = createIndexNowFixture(t, urls);

  const requests = runIndexNowAndCaptureRequests(root);

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.indexnow.org/indexnow");
  assert.equal(requests[0].method, "POST");
  assert.deepEqual(requests[0].body.urlList, urls);
});

test.todo(
  "[codex-testy-web/INDEXNOW-BATCH-001] 10 001 URL rozdělí do requestů po nejvýše 10 000",
  (t) => {
    const urls = orderedUrls(INDEXNOW_MAX_URLS_PER_REQUEST + 1);
    const root = createIndexNowFixture(t, urls);

    const requests = runIndexNowAndCaptureRequests(root);
    const batches = requests.map((request) => request.body.urlList);

    assert.deepEqual(batches.map((batch) => batch.length), [10_000, 1]);
    assert.ok(batches.every((batch) => batch.length <= INDEXNOW_MAX_URLS_PER_REQUEST));
    assert.deepEqual(batches.flat(), urls);
  },
);
