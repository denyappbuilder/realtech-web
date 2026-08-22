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

test("ze sitemapy zachová Unicode, query parametr a percent-encoding beze změny", (t) => {
  const root = createFixture(t, {
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>
      <urlset>
        <url><loc>https://realtech.cz/hledat/?dotaz=příliš</loc></url>
        <url><loc>https://realtech.cz/clanky/%C4%8Desk%C3%BD-n%C3%A1zev/</loc></url>
      </urlset>`,
  });

  const result = runIndexNow(root);

  assertExit(result, 0);
  assert.deepEqual(capturedRequest(result).body.urlList, [
    "https://realtech.cz/hledat/?dotaz=příliš",
    "https://realtech.cz/clanky/%C4%8Desk%C3%BD-n%C3%A1zev/",
  ]);
});

test("[NÁLEZ INDEXNOW-XML-01] dekóduje XML entity v URL ze sitemapy", {
  todo: "NÁLEZ INDEXNOW-XML-01: obsah <loc> se čte regulárním výrazem bez dekódování XML entit",
}, (t) => {
  const root = createFixture(t, {
    sitemap: "<urlset><url><loc>https://realtech.cz/hledat/?q=čaj&amp;strana=2</loc></url></urlset>",
  });

  const result = runIndexNow(root);

  assertExit(result, 0);
  assert.deepEqual(capturedRequest(result).body.urlList, [
    "https://realtech.cz/hledat/?q=čaj&strana=2",
  ]);
});

test("[NÁLEZ INDEXNOW-XML-02] ořízne XML whitespace kolem hodnoty <loc>", {
  todo: "NÁLEZ INDEXNOW-XML-02: whitespace z formátovaného <loc> se tiše stává součástí odeslané URL",
}, (t) => {
  const root = createFixture(t, {
    sitemap: `<urlset><url><loc>
      https://realtech.cz/clanky/formatovana-url/
    </loc></url></urlset>`,
  });

  const result = runIndexNow(root);

  assertExit(result, 0);
  assert.deepEqual(capturedRequest(result).body.urlList, [
    "https://realtech.cz/clanky/formatovana-url/",
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

test("v explicitních cestách zachová Unicode a query parametry", (t) => {
  const root = createFixture(t, { sitemap: null });
  const input = "/hledat/příliš-žluťoučký/?řazení=nové&štítek=C%2B%2B";

  const result = runIndexNow(root, [input]);

  assertExit(result, 0);
  assert.deepEqual(capturedRequest(result).body.urlList, [
    `https://realtech.cz${input}`,
  ]);
});

test("[NÁLEZ INDEXNOW-URL-01] nezkomolí explicitní absolutní URL stejného hostu", {
  todo: "NÁLEZ INDEXNOW-URL-01: absolutní URL dostane navíc prefix hostu a odešle se jako neexistující cesta",
}, (t) => {
  const root = createFixture(t, { sitemap: null });
  const input = "https://realtech.cz/clanky/absolutni/?varianta=česká";

  const result = runIndexNow(root, [input]);

  assertExit(result, 0);
  assert.deepEqual(capturedRequest(result).body.urlList, [input]);
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

for (const length of [7, 129]) {
  test(`odmítne název IndexNow klíče dlouhý ${length} znaků`, (t) => {
    const root = createFixture(t, { keyFile: `${"a".repeat(length)}.txt` });

    const result = runIndexNow(root, [], { fetch: "forbid" });

    assertExit(result, 1);
    assert.match(result.stderr, /V public\/ chybí soubor s IndexNow klíčem/);
    assert.doesNotMatch(result.stdout, new RegExp(FETCH_CAPTURE_PREFIX));
  });
}

test("přijme název IndexNow klíče na horní hranici 128 znaků", (t) => {
  const key = "a".repeat(128);
  const root = createFixture(t, { keyFile: `${key}.txt`, sitemap: null });

  const result = runIndexNow(root, ["clanky/hranice-klice/"]);

  assertExit(result, 0);
  assert.equal(capturedRequest(result).body.key, key);
});

for (const key of ["abc12345", "ABCD-1234"]) {
  test(`[NÁLEZ INDEXNOW-KEY-01] přijme protokolem povolený klíč ${key}`, {
    todo: "NÁLEZ INDEXNOW-KEY-01: validace názvu odmítá platné klíče délky 8–15 a znaky povolené protokolem",
  }, (t) => {
    const root = createFixture(t, { keyFile: `${key}.txt`, sitemap: null });

    const result = runIndexNow(root, ["clanky/platny-klic/"]);

    assertExit(result, 0);
    assert.equal(capturedRequest(result).body.key, key);
  });
}

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
