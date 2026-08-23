import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HEADERS_PATH = path.join(ROOT, "public", "_headers");

function parseHeaders(text) {
  const rules = new Map();
  let currentPath;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;

    if (!/^\s/.test(rawLine)) {
      currentPath = rawLine.trim();
      rules.set(currentPath, new Map());
      continue;
    }

    const match = rawLine.trim().match(/^([^:]+):\s*(.+)$/);
    if (!match || !currentPath) continue;
    rules.get(currentPath).set(match[1].toLowerCase(), match[2]);
  }

  return rules;
}

function cacheDirectives(rule) {
  return new Map(
    rule
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .map((directive) => {
        const [name, ...value] = directive.split("=");
        return [name, value.length ? value.join("=") : true];
      }),
  );
}

const rules = parseHeaders(fs.readFileSync(HEADERS_PATH, "utf8"));

test("hashed Astro assets keep long-lived immutable browser caching", () => {
  const cacheControl = rules.get("/_astro/*")?.get("cache-control");
  assert.ok(cacheControl, "public/_headers must define Cache-Control for /_astro/*");

  const directives = cacheDirectives(cacheControl);
  assert.equal(directives.get("public"), true);
  assert.equal(directives.get("max-age"), "31536000");
  assert.equal(directives.get("immutable"), true);
});

test("mutable images never receive a positive browser TTL or immutable caching", () => {
  const cacheControl = rules.get("/images/*")?.get("cache-control");
  assert.ok(cacheControl, "public/_headers must define Cache-Control for /images/*");

  const directives = cacheDirectives(cacheControl);
  const maxAge = Number(directives.get("max-age"));

  assert.ok(Number.isFinite(maxAge), "/images/* must define a numeric max-age");
  assert.equal(maxAge, 0, "/images/* browser max-age must be zero");
  assert.equal(directives.has("immutable"), false, "/images/* must not be immutable");
  assert.equal(
    directives.get("must-revalidate"),
    true,
    "/images/* must require revalidation before reuse",
  );
});
