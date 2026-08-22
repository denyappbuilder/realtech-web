import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const INDEXNOW_SOURCE = fileURLToPath(new URL("./indexnow.mjs", import.meta.url));
const FETCH_CAPTURE = "__INDEXNOW_FETCH_CALLED__";
const SITEMAP_MARKER = "__INDEXNOW_SITEMAP_READ__";

function createFixture(t, { sitemap = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "realtech-indexnow-cli-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, "public"));
  fs.copyFileSync(INDEXNOW_SOURCE, path.join(root, "scripts", "indexnow.mjs"));
  fs.writeFileSync(path.join(root, "public", "0123456789abcdef.txt"), "0123456789abcdef");

  if (sitemap !== null) {
    fs.mkdirSync(path.join(root, "dist"));
    fs.writeFileSync(path.join(root, "dist", "sitemap-0.xml"), sitemap);
  }

  return root;
}

function runIndexNow(root, args, { watchSitemap = false } = {}) {
  const script = path.join(root, "scripts", "indexnow.mjs");
  const sitemapPath = path.join(root, "dist", "sitemap-0.xml");
  const runner = `
    import fs from "node:fs";
    import { pathToFileURL } from "node:url";
    const sitemapPath = ${JSON.stringify(sitemapPath)};
    const watchSitemap = ${JSON.stringify(watchSitemap)};
    if (watchSitemap) {
      const originalReadFileSync = fs.readFileSync;
      fs.readFileSync = function patchedReadFileSync(file, options) {
        if (String(file) === sitemapPath) {
          console.log(${JSON.stringify(SITEMAP_MARKER)});
        }
        return originalReadFileSync.apply(this, arguments);
      };
    }
    globalThis.fetch = async () => {
      console.log(${JSON.stringify(FETCH_CAPTURE)});
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

function assertFetchWasNotCalled(result) {
  assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE));
}

test("--dry-run s explicitní cestou skončí úspěšně bez fetch", (t) => {
  const root = createFixture(t);

  const result = runIndexNow(root, ["--dry-run", "/clanky/bezpecny-test/"]);

  assertExit(result, 0);
  assert.match(result.stdout, /https:\/\/realtech\.cz\/clanky\/bezpecny-test\//);
  assert.match(result.stdout, /\(dry-run, nic se neodeslalo\)/);
  assertFetchWasNotCalled(result);
});

test("--dry-run bez cesty čte výchozí sitemapu a nevolá fetch", (t) => {
  const root = createFixture(t, {
    sitemap: "<urlset><url><loc>https://realtech.cz/clanky/ze-sitemapy/</loc></url></urlset>",
  });

  const result = runIndexNow(root, ["--dry-run"], { watchSitemap: true });

  assertExit(result, 0);
  assert.match(result.stdout, new RegExp(SITEMAP_MARKER));
  assert.match(result.stdout, /https:\/\/realtech\.cz\/clanky\/ze-sitemapy\//);
  assert.match(result.stdout, /\(dry-run, nic se neodeslalo\)/);
  assertFetchWasNotCalled(result);
});

test("překlep --dry-rnu skončí nenulově, bez fetch i bez čtení sitemapy", (t) => {
  const root = createFixture(t, {
    sitemap: "<urlset><url><loc>https://realtech.cz/</loc></url></urlset>",
  });

  const result = runIndexNow(root, ["--dry-rnu"], { watchSitemap: true });

  assertExit(result, 1);
  assert.match(result.stderr, /Neznámý přepínač: --dry-rnu/);
  assert.doesNotMatch(result.stderr, /sitemap-0\.xml/);
  assert.doesNotMatch(result.stdout, new RegExp(SITEMAP_MARKER));
  assertFetchWasNotCalled(result);
});

test("neznámý přepínač bez sitemapy nespadne na chybějící sitemap", (t) => {
  const root = createFixture(t);

  const result = runIndexNow(root, ["--unknown-flag"]);

  assertExit(result, 1);
  assert.match(result.stderr, /Neznámý přepínač: --unknown-flag/);
  assert.doesNotMatch(result.stderr, /sitemap-0\.xml/);
  assertFetchWasNotCalled(result);
});
