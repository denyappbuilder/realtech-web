import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

// Kolo 58 (26. 9. 2026).
const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const bezKomentaru = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

test('kolo 58: viditelné drobečky na článku a v tématu, stejné cíle jako breadcrumbLd', () => {
  const clanek = bezKomentaru(cti('src/pages/clanky/[...id].astro'));
  assert.match(clanek, /<nav class="drobky" aria-label="Drobečková navigace">/);
  assert.match(clanek, /<li><a href=\{`\/temata\/\$\{slugify\(category\)\}\/`\}>\{category\}<\/a><\/li>/);
  assert.ok(clanek.indexOf('class="drobky"') < clanek.indexOf('class="article-head"'), 'drobky nad hlavou článku');
  const tema = bezKomentaru(cti('src/components/TemaPage.astro'));
  assert.match(tema, /<li><span aria-current="page">\{category\}<\/span><\/li>/);
  assert.match(cti('src/styles/redesign.css'), /\.drobky a \{[^}]*min-height: 44px;/, 'cíl 44 px');
});

test('kolo 58: menu bez duplicitní položky Novinky, Videa označená jako odkaz ven', () => {
  const nav = bezKomentaru(cti('src/layouts/Base.astro').match(/<nav class="main"[\s\S]*?<\/nav>/)[0]);
  assert.doesNotMatch(nav, />Novinky</);
  assert.match(nav, /aria-label="Videa na YouTube \(jiný web\)"/);
});

test('kolo 58: RSS témat sdílí builder hlavního feedu a téma na něj odkazuje', () => {
  assert.ok(existsSync(new URL('../src/pages/temata/[slug]/rss.xml.js', import.meta.url)));
  const feed = cti('src/pages/temata/[slug]/rss.xml.js');
  assert.match(feed, /import \{ rssFeed \} from '\.\.\/\.\.\/rss\.xml\.js';/);
  assert.match(feed, /self: `\/temata\/\$\{slugify\(category\)\}\/rss\.xml`/);
  assert.match(cti('src/pages/rss.xml.js'), /export async function rssFeed\(context, \{ title, description, self, category \}\)/);
  assert.match(cti('src/components/TemaPage.astro'), /<link rel="alternate" type="application\/rss\+xml" title=\{`REALTECH CZ — \$\{category\}`\}/);
});
