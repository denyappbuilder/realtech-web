import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const INDEXNOW_SOURCE = fileURLToPath(new URL("./indexnow.mjs", import.meta.url));
const KEY_FILE = "0123456789abcdef.txt";
const KEY = KEY_FILE.replace(/\.txt$/, "");
const FETCH_CAPTURE_PREFIX = "__INDEXNOW_XML_FETCH__";

function createFixture(t, sitemap) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "realtech-indexnow-xml-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, "public"));
  fs.copyFileSync(INDEXNOW_SOURCE, path.join(root, "scripts", "indexnow.mjs"));
  fs.writeFileSync(path.join(root, "public", KEY_FILE), KEY);

  if (sitemap !== null) {
    fs.mkdirSync(path.join(root, "dist"));
    fs.writeFileSync(path.join(root, "dist", "sitemap-0.xml"), sitemap);
  }

  return root;
}

function runIndexNow(root, args = [], { forbidFetch = false } = {}) {
  const script = path.join(root, "scripts", "indexnow.mjs");
  const runner = `
    import { pathToFileURL } from "node:url";
    const forbidFetch = ${JSON.stringify(forbidFetch)};
    globalThis.fetch = async (url, options) => {
      console.log(${JSON.stringify(FETCH_CAPTURE_PREFIX)} + JSON.stringify({
        url: String(url),
        body: JSON.parse(options.body),
      }));
      if (forbidFetch) throw new Error("fetch se v tomto scénáři nesmí zavolat");
      return new Response("", { status: 200 });
    };
    await import(pathToFileURL(process.argv[1]).href);
  `;

  return spawnSync(process.execPath, [
    "--input-type=module",
    "--eval",
    runner,
    script,
    ...args,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
}

function assertExit(result, expectedStatus) {
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
}

function capturedUrlList(result) {
  const line = result.stdout
    .split("\n")
    .find((candidate) => candidate.startsWith(FETCH_CAPTURE_PREFIX));
  assert.ok(line, `Chybí záznam požadavku ve stdout:\n${result.stdout}`);
  return JSON.parse(line.slice(FETCH_CAPTURE_PREFIX.length)).body.urlList;
}

function assertNoFetch(result) {
  assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE_PREFIX));
}

test("načte přesné loc hodnoty i v běžně strukturované namespaced sitemapě", (t) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Pořadí URL musí zůstat stabilní. -->
      <url>
        <loc>https://realtech.cz/testy/telefon/?dotaz=a%26b</loc>
        <lastmod>2026-08-20</lastmod>
      </url>
      <url><changefreq>weekly</changefreq><loc>https://realtech.cz/clanky/druhy/</loc></url>
    </urlset>`;
  const root = createFixture(t, sitemap);

  const result = runIndexNow(root);

  assertExit(result, 0);
  assert.deepEqual(capturedUrlList(result), [
    "https://realtech.cz/testy/telefon/?dotaz=a%26b",
    "https://realtech.cz/clanky/druhy/",
  ]);
});

test("explicitní platné cesty zachová včetně query oddělovačů a percent-encodingu", (t) => {
  const root = createFixture(t, null);

  const result = runIndexNow(root, [
    "/testy/telefon/?model=a%2Fb&radit=cena",
    "clanky/vyber/?zdroj=indexnow%20test",
  ]);

  assertExit(result, 0);
  assert.deepEqual(capturedUrlList(result), [
    "https://realtech.cz/testy/telefon/?model=a%2Fb&radit=cena",
    "https://realtech.cz/clanky/vyber/?zdroj=indexnow%20test",
  ]);
});

test("samotný přepínač dry-run stále čte sitemapu a nic neodešle", (t) => {
  const root = createFixture(
    t,
    "<urlset><url><loc>https://realtech.cz/testy/z-xml/</loc></url></urlset>",
  );

  const result = runIndexNow(root, ["--dry-run"], { forbidFetch: true });

  assertExit(result, 0);
  assert.match(result.stdout, /  https:\/\/realtech\.cz\/testy\/z-xml\//);
  assertNoFetch(result);
});

test.todo(
  "[codex-testy-web/INDEXNOW-XML-001] dekóduje XML entity v loc před odesláním",
  (t) => {
    const root = createFixture(
      t,
      `<urlset>
        <url><loc>https://realtech.cz/hledat/?a=1&amp;b=2</loc></url>
        <url><loc>https://realtech.cz/hledat/?a=1&#38;b=2</loc></url>
        <url><loc>https://realtech.cz/hledat/?a=1&#x26;b=2</loc></url>
      </urlset>`,
    );

    const result = runIndexNow(root);

    assertExit(result, 0);
    assert.deepEqual(capturedUrlList(result), [
      "https://realtech.cz/hledat/?a=1&b=2",
      "https://realtech.cz/hledat/?a=1&b=2",
      "https://realtech.cz/hledat/?a=1&b=2",
    ]);
  },
);
