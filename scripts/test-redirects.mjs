import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const REDIRECTS_PATH = path.join(ROOT, "public", "_redirects");

function parseRedirects(text) {
  const rules = new Map();

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const [source, destination, status] = line.split(/\s+/);
    rules.set(source, { destination, status });
  }

  return rules;
}

const rules = parseRedirects(fs.readFileSync(REDIRECTS_PATH, "utf8"));

test("/sitemap.xml se trvale přesměruje na /sitemap-index.xml", () => {
  const rule = rules.get("/sitemap.xml");
  assert.ok(rule, "public/_redirects musí obsahovat pravidlo pro /sitemap.xml");
  assert.equal(rule.destination, "/sitemap-index.xml");
  assert.equal(rule.status, "301");
});

// Paginace archivu začíná na strana/2 — první stránka žije na /clanky/,
// takže /clanky/strana/1(/) musí trvale přesměrovat místo 404.
test("/clanky/strana/1 i varianta s lomítkem se trvale přesměrují na /clanky/", () => {
  for (const source of ["/clanky/strana/1", "/clanky/strana/1/"]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
    assert.equal(rule.destination, "/clanky/");
    assert.equal(rule.status, "301");
  }
});

// Paginace témat začíná stejně jako archiv na strana/2 — první stránka žije
// na /temata/{slug}/, takže /temata/:slug/strana/1(/) musí 301 místo 404.
test("/temata/:slug/strana/1 i varianta s lomítkem se trvale přesměrují na /temata/:slug/", () => {
  for (const source of ["/temata/:slug/strana/1", "/temata/:slug/strana/1/"]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
    assert.equal(rule.destination, "/temata/:slug/");
    assert.equal(rule.status, "301");
  }
});

// Feed žije na /rss.xml — konvenční URL (/feed, /rss, /atom.xml) vracely 404.
test("konvenční RSS URL se trvale přesměrují na /rss.xml", () => {
  for (const source of ["/feed", "/feed/", "/feed.xml", "/rss", "/rss/", "/atom.xml"]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
    assert.equal(rule.destination, "/rss.xml");
    assert.equal(rule.status, "301");
  }
});

// Stránka /kontakt neexistuje (kontakt je mailto v patičce) a lidé ji zkoušejí
// ručně — kontaktní údaje žijí na /o-nas/, takže tam musí vést 301 místo 404.
test("/kontakt i varianta s lomítkem se trvale přesměrují na /o-nas/", () => {
  for (const source of ["/kontakt", "/kontakt/"]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
    assert.equal(rule.destination, "/o-nas/");
    assert.equal(rule.status, "301");
  }
});
