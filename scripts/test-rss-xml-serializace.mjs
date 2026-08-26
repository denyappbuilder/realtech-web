import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const helpersDirectory = new URL(
  "./test-rss-xml-serializace-mocks/",
  import.meta.url,
);

async function renderActualRss() {
  const registerPath = new URL("register.mjs", helpersDirectory);
  const childPath = new URL("child.mjs", helpersDirectory);
  const { stdout } = await execFileAsync(process.execPath, [
    "--import",
    registerPath.pathname,
    childPath.pathname,
  ]);

  return JSON.parse(stdout);
}

const rendered = await renderActualRss();

test("skutečný RSS Response XML escapuje textová metadata článku", () => {
  assert.equal(rendered.isResponse, true);
  assert.equal(rendered.contentType, "application/xml");
  assert.equal(typeof rendered.xml, "string");
  assert.match(rendered.xml, /^<\?xml version="1\.0" encoding="UTF-8"\?><rss\b/);

  assert.ok(rendered.xml.includes(
    "<title>Titulek &amp; &lt;title-node&gt; &gt; &quot;citace&quot;</title>",
  ));
  assert.ok(rendered.xml.includes(
    "<description>Popis &amp; &lt;description-node&gt; &gt; &quot;citace&quot;</description>",
  ));
  assert.ok(rendered.xml.includes(
    "<category>Kategorie &amp; &lt;category-node&gt; &gt; &quot;citace&quot;</category>",
  ));

  assert.equal(rendered.xml.includes("<title-node>"), false);
  assert.equal(rendered.xml.includes("<description-node>"), false);
  assert.equal(rendered.xml.includes("<category-node>"), false);
});

test("kanál deklaruje atom self link a lastBuildDate v RFC-822 formátu", () => {
  assert.match(rendered.xml, /<rss [^>]*xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/);
  assert.ok(rendered.xml.includes(
    '<atom:link href="https://realtech.cz/rss.xml" rel="self" type="application/rss+xml"/>',
  ));

  const lastBuildDate = rendered.xml.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/)?.[1];
  assert.ok(lastBuildDate, "kanálu chybí <lastBuildDate>");
  assert.equal(new Date(lastBuildDate).toUTCString(), lastBuildDate);
});

test("markdown a raw HTML se bezpečně serializují a kořenové URL se absolutizují", () => {
  const expectedContent = [
    "<content:encoded>&lt;p&gt;Markdown: A &amp;amp; B &amp;lt; C &amp;gt; D &amp;quot;quoted&amp;quot;.&lt;/p&gt;",
    "&lt;p data-note=&quot;A &amp;amp; B&quot;&gt;Raw HTML: A &amp;amp; B &amp;lt; C &amp;gt; D &amp;quot;quoted&amp;quot;.&lt;/p&gt;",
    "&lt;a href=&quot;https://realtech.cz/clanky/cil/?a=1&amp;b=2&quot;&gt;Kořenový odkaz&lt;/a&gt;",
    "&lt;img src=&quot;https://realtech.cz/images/root.png?x=1&amp;y=2&quot; alt=&quot;Kořenový obrázek&quot;&gt;",
    "&lt;a href=&quot;https://external.example/path?ref=outside&quot;&gt;Externí odkaz&lt;/a&gt;</content:encoded>",
  ].join("\n");

  assert.equal(typeof rendered.xml, "string");
  assert.ok(rendered.xml.includes(expectedContent));
  assert.equal(rendered.xml.includes('href=&quot;/clanky/cil/'), false);
  assert.equal(rendered.xml.includes('src=&quot;/images/root.png'), false);
  assert.ok(rendered.xml.includes(
    'href=&quot;https://external.example/path?ref=outside&quot;',
  ));
});
