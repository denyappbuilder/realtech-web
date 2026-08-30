// Preconnect na third-party originy jen tam, kde je stránka opravdu použije.
//
// Do kola 8 Base na každé URL předpojoval i.ytimg.com i audio.realtech.cz.
// 404, /o-nas/, /clanky/ a Flight 14 (jen xPosts) tím platily zbytečný TLS,
// který soupeřil s LCP / widgetem X. Insights beacon zůstává globální.
// Twitter/syndication hinty dál jen u článku s xPosts (hlídá test-x-embed).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function otviraciBase(zdroj) {
  const shoda = zdroj.match(/<Base\b[\s\S]*?>/);
  assert.ok(shoda, 'stránka neotevírá <Base>');
  return shoda[0];
}

const BASE = read('src/layouts/Base.astro');
const INDEX = read('src/pages/index.astro');
const CLANEK = read('src/pages/clanky/[...id].astro');
const PAGE_404 = read('src/pages/404.astro');
const ONAS = read('src/pages/o-nas.astro');
const ARCHIV = read('src/components/ArticleArchivePage.astro');
const TEMATA = read('src/components/TemaPage.astro');
const TEMATA_HUB = read('src/pages/temata/index.astro');
const VITEJ = read('src/pages/vitej.astro');

test('Base: ytimg a audio preconnect jen za flagem, insights vždy, bez crossorigin', () => {
  assert.match(
    BASE,
    /preconnectYtimg\?: boolean/,
    'Base musí mít volitelný prop preconnectYtimg',
  );
  assert.match(
    BASE,
    /preconnectAudio\?: boolean/,
    'Base musí mít volitelný prop preconnectAudio',
  );
  assert.match(BASE, /preconnectYtimg = false/);
  assert.match(BASE, /preconnectAudio = false/);
  assert.match(BASE, /\{preconnectYtimg && <link rel="preconnect" href="https:\/\/i\.ytimg\.com" \/>\}/);
  assert.match(BASE, /\{preconnectAudio && <link rel="preconnect" href="https:\/\/audio\.realtech\.cz" \/>\}/);
  assert.match(BASE, /<link rel="preconnect" href="https:\/\/static\.cloudflareinsights\.com" \/>/);
  assert.equal(
    (BASE.match(/href="https:\/\/i\.ytimg\.com"/g) ?? []).length,
    1,
    'ytimg preconnect smí být v Base jen jednou, a to za flagem',
  );
  assert.equal(
    (BASE.match(/href="https:\/\/audio\.realtech\.cz"/g) ?? []).length,
    1,
    'audio preconnect smí být v Base jen jednou, a to za flagem',
  );
  assert.doesNotMatch(BASE, /preconnect" href="https:\/\/i\.ytimg\.com"[^>]*crossorigin/i);
  assert.doesNotMatch(BASE, /preconnect" href="https:\/\/audio\.realtech\.cz"[^>]*crossorigin/i);
});

test('404 a O nás nepředávají ytimg ani audio preconnect', () => {
  const tag404 = otviraciBase(PAGE_404);
  const tagOnas = otviraciBase(ONAS);
  assert.doesNotMatch(tag404, /preconnectYtimg|preconnectAudio/);
  assert.doesNotMatch(tagOnas, /preconnectYtimg|preconnectAudio/);
  assert.doesNotMatch(PAGE_404, /i\.ytimg\.com|audio\.realtech\.cz/);
  assert.doesNotMatch(ONAS, /i\.ytimg\.com|audio\.realtech\.cz/);
});

test('archiv, témata a vitej nepředávají ytimg ani audio — karty berou lokální webp', () => {
  for (const [jmeno, zdroj] of [
    ['archiv', ARCHIV],
    ['téma', TEMATA],
    ['hub témat', TEMATA_HUB],
    ['vítej', VITEJ],
  ]) {
    const tag = otviraciBase(zdroj);
    assert.doesNotMatch(tag, /preconnectYtimg|preconnectAudio/,
      `${jmeno} nesmí zapínat ytimg/audio preconnect`);
  }
});

test('homepage předpojuje ytimg kvůli video stripu, ne audio', () => {
  const tag = otviraciBase(INDEX);
  assert.match(INDEX, /const preconnectYtimg = videos\.length > 0/,
    'mřížka videí tahá i.ytimg.com/sddefault.jpg — preconnect jen když videa opravdu jsou');
  assert.match(tag, /preconnectYtimg=\{preconnectYtimg\}/);
  assert.doesNotMatch(tag, /preconnectAudio/,
    'homepage nenačítá mp3 — audio přehled je až na článku');
});

test('článek předpojuje ytimg jen když <img> sahá na i.ytimg.com, audio jen s mp3', () => {
  const tag = otviraciBase(CLANEK);
  assert.match(CLANEK, /heroLcpSrc\.includes\('i\.ytimg\.com'\)/,
    'ytimg jen když LCP src je opravdu i.ytimg.com/vi/ — lokální WebP cover ho nesmí zapnout');
  assert.doesNotMatch(CLANEK, /const preconnectYtimg = Boolean\(videoId\)/,
    'článek s video: a lokálním coverem pořád předpojuje ytimg kvůli pouhému videoId');
  assert.match(CLANEK, /const preconnectAudio = Boolean\(audioLd\)/,
    'audio.realtech.cz jen když AudioPrehled opravdu nese mp3');
  assert.match(tag, /preconnectYtimg=\{preconnectYtimg\}/);
  assert.match(tag, /preconnectAudio=\{preconnectAudio\}/);
});
