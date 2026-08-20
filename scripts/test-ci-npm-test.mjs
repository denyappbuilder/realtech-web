import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WORKFLOWS = path.join(ROOT, ".github", "workflows");

function nactiWorkflowy() {
  if (!fs.existsSync(WORKFLOWS)) return [];
  return fs
    .readdirSync(WORKFLOWS)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .map((name) => ({
      name,
      text: fs.readFileSync(path.join(WORKFLOWS, name), "utf8"),
    }));
}

test("Z10247: CI po testech pouští i npm run build", () => {
  const workflowy = nactiWorkflowy();
  const sBuildem = workflowy.filter((wf) => /npm\s+(?:run\s+)?build\b/.test(wf.text));

  assert.ok(
    sBuildem.length > 0,
    "v .github/workflows/ musí být workflow, které volá npm run build — jinak rozbitý Astro/dist projde zeleně",
  );

  const sTestemIBuildem = workflowy.filter(
    (wf) =>
      /npm test|npm run test/.test(wf.text) &&
      /npm\s+(?:run\s+)?build\b/.test(wf.text),
  );
  assert.ok(
    sTestemIBuildem.length > 0,
    "stejné workflow musí po npm test pouštět i npm run build",
  );
});

test("Z10035: CI pouští npm test na pull_request i na push do main", () => {
  const workflowy = nactiWorkflowy();
  const sTestem = workflowy.filter((wf) => /npm test|npm run test/.test(wf.text));

  assert.ok(
    sTestem.length > 0,
    "v .github/workflows/ musí být workflow, které volá npm test — jinak rozbitá logika projde jen přes Cloudflare Pages build",
  );

  const pokryvaPr = sTestem.some((wf) => /pull_request/.test(wf.text));
  const pokryvaPushMain = sTestem.some((wf) => {
    if (!/push:/.test(wf.text)) return false;
    const poPush = wf.text.slice(wf.text.indexOf("push:"));
    return /branches:[\s\S]*main/.test(poPush) || /branches:\s*\[\s*main\s*\]/.test(poPush);
  });

  assert.ok(pokryvaPr, "workflow s npm test musí běžet na pull_request");
  assert.ok(pokryvaPushMain, "workflow s npm test musí běžet na push do main");
});
