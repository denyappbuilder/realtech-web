import test from "node:test";
import assert from "node:assert/strict";

import { isoDuration } from "../src/lib/iso-duration.js";

test("isoDuration přijme MM:SS a HH:MM:SS [Z1068]", () => {
  assert.equal(isoDuration("9:04"), "PT9M4S");
  assert.equal(isoDuration("1:02:03"), "PT1H2M3S");
  assert.equal(isoDuration("0:00"), "PT0M0S");
  assert.equal(isoDuration("00:59"), "PT0M59S");
});

test("isoDuration vynechá neplatný tvar [Z1068 / VIDEO-DURATION-001]", () => {
  assert.equal(isoDuration("12"), undefined);
  assert.equal(isoDuration("1:02:03:04"), undefined);
  assert.equal(isoDuration("12:60"), undefined);
  assert.equal(isoDuration("-1:30"), undefined);
});
