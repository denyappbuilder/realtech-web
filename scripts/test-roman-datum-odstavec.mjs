// Živě 28. 8. 2026 Markdown sežral „21. srpna“ na začátku řádku
// jako <ol start="21">. Čtenář i RSS content:encoded viděli „srpna týmy…".
// Escape musí být 21\. srpna (lomítko před tečkou). 21.\ srpna nechá \ v HTML.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLANEK = path.join(ROOT, "src/content/clanky/nasa-roman-falcon-heavy.md");

function teloClanku(soubor) {
  const raw = fs.readFileSync(soubor, "utf8");
  const casti = raw.split(/^---\s*$/m);
  assert.ok(casti.length >= 3, `${path.basename(soubor)} nemá frontmatter`);
  return casti.slice(2).join("---").trim();
}

function assertDatumOdstavec(html, zdroj) {
  assert.doesNotMatch(
    html,
    /<ol\b/i,
    `${zdroj}: Markdown pořád vyrábí <ol> z „21. srpna“ — čtenář uvidí jen „srpna týmy…"`,
  );
  assert.doesNotMatch(
    html,
    /21\.\\\s*srpna/,
    `${zdroj}: v HTML zůstal escape backslash — čtenář vidí 21.\\ srpna`,
  );
  assert.match(html, /21\. srpna týmy/);
  assert.match(html, /24\. srpna v noci/);
  assert.match(html, /20\. srpna týmy/);
  assert.match(html, /10\. srpna NASA/);
}

test("Roman: české datum na začátku řádku zůstane odstavcem (marked = RSS)", () => {
  assertDatumOdstavec(String(marked.parse(teloClanku(CLANEK))), "marked");
});

test("Roman: české datum na začátku řádku zůstane odstavcem (remark = stránka)", async () => {
  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(teloClanku(CLANEK)),
  );
  assertDatumOdstavec(html, "remark");
});
