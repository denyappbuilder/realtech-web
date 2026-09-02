import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ARTICLES_PER_PAGE } from "../src/lib/pagination.js";
import { slugify } from "../src/lib/slugify.js";

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
// Živě 26. 8. 2026 zbývaly /rss.xml/ (lomítko navíc), /atom a /atom/.
test("konvenční RSS URL se trvale přesměrují na /rss.xml", () => {
  for (const source of [
    "/feed", "/feed/", "/feed.xml",
    "/rss", "/rss/", "/rss.xml/",
    "/atom", "/atom/", "/atom.xml",
  ]) {
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

// Živě 2. 9. 2026: /about/ a /blog/ vracely 404. Anglické hádání
// stejných stránek jako /kontakt → /o-nas/.
test("/about i /blog se trvale přesměrují na české stránky", () => {
  for (const source of ["/about", "/about/"]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
    assert.equal(rule.destination, "/o-nas/");
    assert.equal(rule.status, "301");
  }
  for (const source of ["/blog", "/blog/"]) {
    const rule = rules.get(source);
    assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
    assert.equal(rule.destination, "/clanky/");
    assert.equal(rule.status, "301");
  }
});

function kategorieZeSchematu() {
  const zdroj = fs.readFileSync(path.join(ROOT, "src/content.config.ts"), "utf8");
  const blok = zdroj.match(/category:\s*z\.enum\(\[([\s\S]*?)\]\)/)?.[1];
  assert.ok(blok, "v src/content.config.ts nejde najít výčet kategorií");
  return [...blok.matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function pocetClankuPodleKategorie() {
  const dir = path.join(ROOT, "src/content/clanky");
  const counts = new Map();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const fm = fs.readFileSync(path.join(dir, file), "utf8").split(/^---\s*$/m)[1] ?? "";
    if (/^draft:\s*(?:true|True|TRUE)\b/m.test(fm)) continue;
    const category = fm.match(/^category:\s*["']?([^\n"']+)/m)?.[1]?.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return counts;
}

// Živě 28. 8. 2026: /ai-report/ i /ai-report/strana/2/ (a stejně hardware,
// vesmir, …) vracely 404. Témata žijí pod /temata/{slug}/.
test("stará URL každého tématu ze schématu se trvale přesměruje na /temata/{slug}/", () => {
  for (const category of kategorieZeSchematu()) {
    const slug = slugify(category);
    for (const source of [`/${slug}`, `/${slug}/`]) {
      const rule = rules.get(source);
      assert.ok(rule, `public/_redirects musí obsahovat pravidlo pro ${source}`);
      assert.equal(rule.destination, `/temata/${slug}/`, source);
      assert.equal(rule.status, "301", source);
    }
  }
});

test("stará paginace tématu: platné strany 2+ jdou na /temata/{slug}/strana/n/, zbytek na hub", () => {
  const counts = pocetClankuPodleKategorie();
  for (const category of kategorieZeSchematu()) {
    const slug = slugify(category);
    const totalPages = Math.max(1, Math.ceil((counts.get(category) ?? 0) / ARTICLES_PER_PAGE));
    for (const page of Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i + 2)) {
      for (const source of [`/${slug}/strana/${page}`, `/${slug}/strana/${page}/`]) {
        const rule = rules.get(source);
        assert.ok(rule, `chybí 301 pro platnou starou stranu ${source}`);
        assert.equal(rule.destination, `/temata/${slug}/strana/${page}/`, source);
        assert.equal(rule.status, "301", source);
      }
    }
    for (const source of [`/${slug}/strana/:n`, `/${slug}/strana/:n/`]) {
      const rule = rules.get(source);
      assert.ok(rule, `chybí catch-all 301 pro neexistující stranu ${source}`);
      assert.equal(rule.destination, `/temata/${slug}/`, source);
      assert.equal(rule.status, "301", source);
    }
  }
});
