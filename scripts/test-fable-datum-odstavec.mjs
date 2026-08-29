// Živě 28. 8. 2026 Markdown sežral „26. června“ na začátku řádku
// jako <ol start="26">. Čtenář viděl „června ministr…". Jediný slug z 83.
// Escape musí být 26\. června (lomítko před tečkou). 26.\ června nechá \ v HTML.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLANEK = path.join(ROOT, "src/content/clanky/anthropic-fable-mythos.md");

function teloClanku(soubor) {
  const raw = fs.readFileSync(soubor, "utf8");
  const casti = raw.split(/^---\s*$/m);
  assert.ok(casti.length >= 3, `${path.basename(soubor)} nemá frontmatter`);
  return casti.slice(2).join("---").trim();
}

test("Fable/Mythos: 26. června na začátku řádku zůstane odstavcem, ne <ol start>", () => {
  const html = String(marked.parse(teloClanku(CLANEK)));
  assert.doesNotMatch(
    html,
    /<ol\b/i,
    "marked: Markdown pořád vyrábí <ol> z „26. června“ — čtenář uvidí jen „června ministr…\"",
  );
  assert.doesNotMatch(
    html,
    /26\.\\\s*června/,
    "marked: v HTML zůstal escape backslash — čtenář vidí 26.\\ června",
  );
  assert.match(html, /26\. června ministr obchodu Howard Lutnick/);
});
