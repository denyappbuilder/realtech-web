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
const FETCH_CAPTURE_PREFIX = "__INDEXNOW_FETCH__";

function createFixture(t, {
  keyFile = KEY_FILE,
  sitemap = "<urlset><url><loc>https://realtech.cz/</loc></url></urlset>",
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "realtech-indexnow-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, "public"));
  fs.copyFileSync(INDEXNOW_SOURCE, path.join(root, "scripts", "indexnow.mjs"));

  if (keyFile !== null) {
    fs.writeFileSync(path.join(root, "public", keyFile), KEY);
  }
  if (sitemap !== null) {
    fs.mkdirSync(path.join(root, "dist"));
    fs.writeFileSync(path.join(root, "dist", "sitemap-0.xml"), sitemap);
  }

  return root;
}

function runIndexNow(root, args = [], {
  fetch = "respond",
  status = 200,
  responseBody = "",
} = {}) {
  const script = path.join(root, "scripts", "indexnow.mjs");
  const runner = `
    import { pathToFileURL } from "node:url";
    const fetchMode = ${JSON.stringify(fetch)};
    const responseStatus = ${JSON.stringify(status)};
    const responseBody = ${JSON.stringify(responseBody)};
    globalThis.fetch = async (url, options) => {
      if (fetchMode === "forbid") {
        throw new Error("fetch se v tomto scénáři nesmí zavolat");
      }
      console.log(${JSON.stringify(FETCH_CAPTURE_PREFIX)} + JSON.stringify({
        url: String(url),
        method: options?.method,
        headers: options?.headers,
        body: JSON.parse(options?.body),
      }));
      return new Response(responseBody, { status: responseStatus });
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

function capturedRequest(result) {
  const line = result.stdout
    .split("\n")
    .find((candidate) => candidate.startsWith(FETCH_CAPTURE_PREFIX));
  assert.ok(line, `Chybí záznam požadavku ve stdout:\n${result.stdout}`);
  return JSON.parse(line.slice(FETCH_CAPTURE_PREFIX.length));
}

test("načte všechny URL z vygenerované sitemapy", (t) => {
  const root = createFixture(t, {
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>
      <urlset>
        <url><loc>https://realtech.cz/</loc></url>
        <url><loc>https://realtech.cz/clanky/prvni/</loc></url>
        <url><loc>https://realtech.cz/testy/druhy/?varianta=1</loc></url>
      </urlset>`,
  });

  const result = runIndexNow(root);

  assertExit(result, 0);
  assert.deepEqual(capturedRequest(result).body.urlList, [
    "https://realtech.cz/",
    "https://realtech.cz/clanky/prvni/",
    "https://realtech.cz/testy/druhy/?varianta=1",
  ]);
});

test("explicitní cesty normalizuje s úvodním lomítkem i bez něj", (t) => {
  const root = createFixture(t, { sitemap: null });

  const result = runIndexNow(root, ["/clanky/s-lomitkem/", "testy/bez-lomitka/"]);

  assertExit(result, 0);
  const request = capturedRequest(result);
  assert.deepEqual(request.body.urlList, [
    "https://realtech.cz/clanky/s-lomitkem/",
    "https://realtech.cz/testy/bez-lomitka/",
  ]);
  assert.deepEqual(request.body, {
    host: "realtech.cz",
    key: KEY,
    keyLocation: `https://realtech.cz/${KEY_FILE}`,
    urlList: request.body.urlList,
  });
});

test("dry-run vypíše URL a neprovede síťový požadavek", (t) => {
  const root = createFixture(t, { sitemap: null });

  const result = runIndexNow(root, ["--dry-run", "clanky/navrh/"], {
    fetch: "forbid",
  });

  assertExit(result, 0);
  assert.match(result.stdout, /  https:\/\/realtech\.cz\/clanky\/navrh\//);
  assert.match(result.stdout, /\(dry-run, nic se neodeslalo\)/);
  assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE_PREFIX));
});

test("skončí s chybou, když v public chybí IndexNow klíč", (t) => {
  const root = createFixture(t, { keyFile: null });

  const result = runIndexNow(root, [], { fetch: "forbid" });

  assertExit(result, 1);
  assert.match(result.stderr, /V public\/ chybí soubor s IndexNow klíčem/);
  assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE_PREFIX));
});

test("skončí s chybou, když sitemap neexistuje", (t) => {
  const root = createFixture(t, { sitemap: null });

  const result = runIndexNow(root, [], { fetch: "forbid" });

  assertExit(result, 1);
  assert.match(result.stderr, /dist\/sitemap-0\.xml neexistuje/);
  assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE_PREFIX));
});

test("skončí s chybou, když sitemap neobsahuje žádnou URL", (t) => {
  const root = createFixture(t, { sitemap: "<urlset></urlset>" });

  const result = runIndexNow(root, [], { fetch: "forbid" });

  assertExit(result, 1);
  assert.match(result.stderr, /Žádné URL k odeslání/);
  assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE_PREFIX));
});

for (const status of [200, 202]) {
  test(`HTTP ${status} API odpověď považuje za úspěch`, (t) => {
    const root = createFixture(t, { sitemap: null });

    const result = runIndexNow(root, ["clanky/uspech/"], { status });

    assertExit(result, 0);
    assert.match(result.stdout, new RegExp(`Odesláno \\(HTTP ${status}\\)`));
    const request = capturedRequest(result);
    assert.equal(request.url, "https://api.indexnow.org/indexnow");
    assert.equal(request.method, "POST");
    assert.deepEqual(request.headers, {
      "Content-Type": "application/json; charset=utf-8",
    });
  });
}

test("chybnou HTTP odpověď ukončí chybou a omezí tělo na 200 znaků", (t) => {
  const root = createFixture(t, { sitemap: null });
  const visibleBody = "x".repeat(200);
  const hiddenBody = "TOTO_UZ_SE_NESMI_VYPSAT";

  const result = runIndexNow(root, ["clanky/chyba/"], {
    status: 429,
    responseBody: visibleBody + hiddenBody,
  });

  assertExit(result, 1);
  assert.match(result.stderr, /❌ HTTP 429:/);
  assert.ok(result.stderr.includes(visibleBody));
  assert.ok(!result.stderr.includes(hiddenBody));
});
