import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const INDEXNOW_SOURCE = fileURLToPath(new URL("./indexnow.mjs", import.meta.url));
const FETCH_CAPTURE = "__INDEXNOW_FETCH_CALLED__";

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

function runIndexNow(root, args) {
  const script = path.join(root, "scripts", "indexnow.mjs");
  const runner = `
    import { pathToFileURL } from "node:url";
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

test.todo(
  "[codex-testy-web/INDEXNOW-CLI-001] neznámý přepínač --dry-rnu skončí s exit 1 bez fetch (produkce jej zatím tiše ignoruje)",
  (t) => {
    const root = createFixture(t, {
      sitemap: "<urlset><url><loc>https://realtech.cz/</loc></url></urlset>",
    });

    const result = runIndexNow(root, ["--dry-rnu"]);

    assertExit(result, 1);
    assertFetchWasNotCalled(result);
  },
);
