import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INDEXNOW_SOURCE = fileURLToPath(new URL("./indexnow.mjs", import.meta.url));
const KEY_FILE = "0123456789abcdef.txt";
const FETCH_CAPTURE_PREFIX = "__INDEXNOW_FETCH__";

export function createIndexNowFixture(t, urls) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "realtech-indexnow-batch-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, "public"));
  fs.mkdirSync(path.join(root, "dist"));
  fs.copyFileSync(INDEXNOW_SOURCE, path.join(root, "scripts", "indexnow.mjs"));
  fs.writeFileSync(path.join(root, "public", KEY_FILE), KEY_FILE.replace(/\.txt$/, ""));
  fs.writeFileSync(
    path.join(root, "dist", "sitemap-0.xml"),
    `<urlset>${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`,
  );

  return root;
}

export function runIndexNowAndCaptureRequests(root, args = []) {
  const script = path.join(root, "scripts", "indexnow.mjs");
  const runner = `
    import { pathToFileURL } from "node:url";
    globalThis.fetch = async (url, options) => {
      console.log(${JSON.stringify(FETCH_CAPTURE_PREFIX)} + JSON.stringify({
        url: String(url),
        method: options?.method,
        body: JSON.parse(options?.body),
      }));
      return new Response("", { status: 200 });
    };
    await import(pathToFileURL(process.argv[1]).href);
  `;

  const result = spawnSync(process.execPath, [
    "--input-type=module",
    "--eval",
    runner,
    script,
    ...args,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });

  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  return result.stdout
    .split("\n")
    .filter((line) => line.startsWith(FETCH_CAPTURE_PREFIX))
    .map((line) => JSON.parse(line.slice(FETCH_CAPTURE_PREFIX.length)));
}
