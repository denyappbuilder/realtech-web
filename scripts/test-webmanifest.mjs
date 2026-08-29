import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "public/site.webmanifest"), "utf8"),
);

test("site.webmanifest background_color je světlé --bg, ne horor #0F1216", () => {
  assert.equal(
    manifest.background_color,
    "#F6F7F9",
    "splash/background musí sedět se světlým --bg, ne s dark #0F1216",
  );
});
