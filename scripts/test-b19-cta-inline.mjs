// B19 (19. 9. 2026): kompaktní výzva na YouTube za úvodním odstavcem.
// Do té doby stála jediná výzva až pod zdroji (článek s videem: videobar
// nad textem, bez videa: pruh za textem). Výzva se vkládá v buildu rehype
// pluginem na stejné místo jako embed X (indexProEmbed), takže nic neskáče.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  KANAL_ODBER_URL,
  ctaInlineHtml,
  rehypeCtaInline,
  youtubeOdkaz,
} from '../src/lib/rehype-cta-inline.js';
import { rehypeXEmbedy } from '../src/lib/rehype-x-embed.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS = fs.readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8');
const CONFIG = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
const PAGE = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/[...id].astro'), 'utf8');

const p = (text) => ({ type: 'element', tagName: 'p', children: [{ type: 'text', value: text }] });
const h2 = (text) => ({ type: 'element', tagName: 'h2', children: [{ type: 'text', value: text }] });
const LEDE = 'Dlouhý úvodní odstavec, který má víc než sto dvacet znaků, aby výzva stála hned za ním a ne až za druhým odstavcem článku.';
const strom = (...children) => ({ type: 'root', children });
const file = (frontmatter) => ({ data: { astro: { frontmatter } } });

test('youtubeOdkaz bere jen YouTube URL z frontmatteru', () => {
  assert.equal(youtubeOdkaz('https://youtu.be/biYMveTpRWc'), 'https://youtu.be/biYMveTpRWc');
  assert.equal(youtubeOdkaz('https://www.youtube.com/watch?v=biYMveTpRWc'), 'https://www.youtube.com/watch?v=biYMveTpRWc');
  assert.equal(youtubeOdkaz('https://x.com/realtech/status/1'), null);
  assert.equal(youtubeOdkaz(undefined), null);
});

test('s videem vede tlačítko na video, bez videa na odběr kanálu', () => {
  const sVideem = ctaInlineHtml({ video: 'https://youtu.be/biYMveTpRWc' });
  assert.match(sVideem, /data-cta-inline="video"/);
  assert.match(sVideem, /href="https:\/\/youtu\.be\/biYMveTpRWc"/);
  assert.match(sVideem, /Přehrát video/);

  const bez = ctaInlineHtml({});
  assert.match(bez, /data-cta-inline="kanal"/);
  assert.match(bez, /href="https:\/\/www\.youtube\.com\/@realtech-cz\?sub_confirmation=1"/);
  assert.match(bez, /Odebírat kanál/);
  assert.equal(KANAL_ODBER_URL, 'https://www.youtube.com/@realtech-cz?sub_confirmation=1');
});

test('výzva používá jen existující třídy (.mono, .yt-btn) a je aside s názvem', () => {
  const html = ctaInlineHtml({});
  assert.match(html, /^<aside class="article-cta-inline" aria-label="YouTube kanál REALTECH CZ"/);
  // Kolo 45: bez .live-dot — tečka „live“ u výzvy na kanál nic neoznačovala.
  assert.match(html, /<span class="mono">(?!<span class="live-dot")/);
  assert.doesNotMatch(html, /live-dot/);
  assert.match(html, /class="yt-btn"/);
  assert.doesNotMatch(html, /style=/, 'žádné inline styly, žádný nový vizuální styl');
});

test('plugin vloží výzvu za první odstavec, nikdy jako první uzel', () => {
  const tree = strom(p(LEDE), p('Druhý odstavec.'), h2('Mezititulek'), p('Třetí.'));
  rehypeCtaInline()(tree, file({}));
  assert.equal(tree.children.length, 5);
  assert.equal(tree.children[0].tagName, 'p');
  assert.equal(tree.children[1].type, 'raw');
  assert.match(tree.children[1].value, /article-cta-inline/);
});

test('miniaturní první odstavec: výzva jde až za druhý (stejně jako embed X)', () => {
  const tree = strom(p('Krátký.'), p(LEDE), p('Třetí.'));
  rehypeCtaInline()(tree, file({}));
  assert.equal(tree.children[2].type, 'raw');
});

test('článek bez odstavce výzvu nedostane', () => {
  const tree = strom(h2('Jen nadpis'));
  rehypeCtaInline()(tree, file({}));
  assert.equal(tree.children.length, 1);
});

test('s xPosts: pořadí odstavec → karta X → výzva (výzva zapsaná v konfiguraci před X embedem)', () => {
  assert.match(CONFIG, /rehypePlugins: \[rehypeAsciiHeadingIds, rehypeCtaInline, rehypeXEmbedy, rehypeTabulky(?:, rehypeChecklist)?\]/);
  const tree = strom(p(LEDE), p('Druhý.'));
  const f = file({ xPosts: ['https://x.com/realtech/status/1234567890'] });
  rehypeCtaInline()(tree, f);
  rehypeXEmbedy()(tree, f);
  assert.equal(tree.children[0].tagName, 'p');
  assert.match(tree.children[1].value, /x-embed/, 'karta X hned za odstavcem (Maky: napřed text, pak widget)');
  assert.match(tree.children[2].value, /article-cta-inline/, 'výzva až za kartou X');
  assert.equal(tree.children[3].tagName, 'p');
});

test('CSS: výzva sedí na stejném povrchu jako tělo článku (Z1003), tiskne se ne', () => {
  const blok = CSS.match(/\.article-cta-inline\s*\{([^}]+)\}/)?.[1] ?? '';
  assert.match(blok, /background:\s*var\(--surface\)/);
  assert.match(blok, /border:\s*1px solid var\(--line\)/);
  assert.doesNotMatch(blok, /var\(--panel\)|#fff/);
  assert.match(CSS, /@media print \{[\s\S]*\.article-cta-inline/);
});

// Kolo 56: pruh bez videa zrušen — odběr po textu nese autorský box.
test('spodní výzvy zůstávají: videobar s videem a author-box s odběrem', () => {
  assert.match(PAGE, /\{video && \(\s*<div class="article-videobar">/);
  assert.doesNotMatch(PAGE, /article-videobar-bez-videa/);
  assert.match(PAGE, /class="author-box"/);
});
