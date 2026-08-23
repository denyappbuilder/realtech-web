import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import './test-audio-prehled-register.mjs';

import { setCollection } from './test-audio-prehled-mocks/state.mjs';
import {
  audioPrehledPohled,
  audioTtsScript,
  jsonLdText,
  parseAudioDuration,
  pripojAudioKClanku,
  vytvorAudioObject,
} from '../src/lib/audio-prehled.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA = fs.readFileSync(path.join(ROOT, 'src/content.config.ts'), 'utf8');
const PAGE = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/[...id].astro'), 'utf8');
const KOMPONENTA = fs.readFileSync(
  path.join(ROOT, 'src/components/AudioPrehled.astro'),
  'utf8',
);
const CSS = fs.readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8');

let fixtureNumber = 0;
const SITE = new URL('https://realtech.cz/');

function clanek({ id = 'audio-fixture', audio, title = 'Fixture článek' } = {}) {
  return {
    id,
    body: 'Tělo článku.',
    data: {
      title,
      seoTitle: title,
      description: 'Popis fixture článku.',
      category: 'AI Report',
      date: new Date('2026-08-22T00:00:00.000Z'),
      draft: false,
      audio,
    },
  };
}

async function nactiStranku(current) {
  setCollection([current]);
  globalThis.Astro = {
    props: { article: current },
    site: SITE,
    url: new URL(`https://realtech.cz/clanky/${current.id}/`),
  };
  fixtureNumber += 1;
  return import(`../src/pages/clanky/[...id].astro?audio-test=${fixtureNumber}`);
}

test('schema odděluje veřejný transcript od volitelného ttsScript a audio zůstává volitelné', () => {
  assert.match(SCHEMA, /`transcript` je veřejný čitelný přepis/);
  assert.match(SCHEMA, /ttsScript:\s*z\.string\(\)\.min\(1\)\.optional\(\)/);
  assert.match(SCHEMA, /audio:\s*audioPrehled\.optional\(\)/);
});

test('šablona článku zapojuje přehrávač a AudioObject jen přes produkční helpery', () => {
  assert.match(PAGE, /import AudioPrehled from '\.\.\/\.\.\/components\/AudioPrehled\.astro'/);
  assert.match(PAGE, /<AudioPrehled audio=\{audio\} \/>/);
  assert.match(PAGE, /const audioLd = vytvorAudioObject\(audio,/);
  assert.match(PAGE, /const jsonLd = pripojAudioKClanku\(/);
  assert.match(PAGE, /\{audioLd && <script type="application\/ld\+json" set:html=\{jsonLdText\(audioLd\)\}/);
  assert.match(PAGE, /set:html=\{jsonLdText\(jsonLd\)\}/);
  assert.doesNotMatch(PAGE, /set:html=\{JSON\.stringify\(/);
});

test('přehrávač je přístupný, bez autoplay a s nativním přepisem', () => {
  assert.match(KOMPONENTA, /<h2 id="audio-prehled-nadpis">Audio přehled<\/h2>/);
  assert.match(KOMPONENTA, /<audio controls preload="none" src=\{pohled\.src\}>/);
  assert.match(KOMPONENTA, /<a href=\{pohled\.src\}>Stáhnout audio přehled<\/a>/);
  assert.match(KOMPONENTA, /<details class="audio-prehled-prepis">/);
  assert.match(KOMPONENTA, /<summary>Přepis<\/summary>/);
  assert.doesNotMatch(KOMPONENTA, /autoplay/i);
  assert.doesNotMatch(KOMPONENTA, /AI hlas|uměl[aá] inteligence|ElevenLabs|Sal/i);
  assert.doesNotMatch(PAGE, /AI hlas|uměl[aá] inteligence|ElevenLabs|Sal/i);
});

test('reálná komponenta nepřednačítá audio před kliknutím na přehrání', () => {
  assert.match(KOMPONENTA, /<audio\b[^>]*\bcontrols\b[^>]*\bpreload="none"[^>]*\bsrc=\{pohled\.src\}[^>]*>/);
  assert.doesNotMatch(KOMPONENTA, /<audio\b[^>]*\bpreload="(?:metadata|auto)"/i);
});

test('styly berou existující tokeny a tisk přehrávač schová', () => {
  assert.match(CSS, /\.audio-prehled\s*\{[\s\S]*background:\s*var\(--surface\)/);
  assert.match(CSS, /\.audio-prehled\s*\{[\s\S]*border:\s*1px solid var\(--line\)/);
  assert.match(CSS, /@media print \{[\s\S]*\.audio-prehled/);
});

test('parseAudioDuration přijme sekundy, ISO i MM:SS a odmítne nulu', () => {
  assert.deepEqual(parseAudioDuration(192), { seconds: 192, iso: 'PT3M12S' });
  assert.deepEqual(parseAudioDuration('PT3M12S'), { seconds: 192, iso: 'PT3M12S' });
  assert.deepEqual(parseAudioDuration('3:12'), { seconds: 192, iso: 'PT3M12S' });
  assert.equal(parseAudioDuration(0), undefined);
  assert.equal(parseAudioDuration('PT0S'), undefined);
  assert.equal(parseAudioDuration('javascript:alert(1)'), undefined);
});

test('bez audio bloku není player ani AudioObject', async () => {
  const { audioLd, jsonLd, audio } = await nactiStranku(clanek());
  assert.equal(audio, undefined);
  assert.equal(audioLd, null);
  assert.equal(jsonLd.audio, undefined);
  assert.equal(audioPrehledPohled(audio, SITE), null);
  assert.doesNotMatch(JSON.stringify(jsonLd), /AudioObject/);
});

test('player a JSON-LD používají čitelný transcript, TTS pipeline výslovnostní ttsScript', async () => {
  const audio = {
    url: '/audio/clanky/fixture.mp3',
    duration: '3:12',
    transcript: 'Google a Gemini. <script>alert(1)</script>.',
    ttsScript: 'Gůgl a Džeminy.',
  };
  const { audioLd, jsonLd, articleUrl } = await nactiStranku(clanek({ audio }));
  const pohled = audioPrehledPohled(audio, SITE);

  assert.equal(articleUrl, 'https://realtech.cz/clanky/audio-fixture/');
  assert.equal(pohled.src, 'https://realtech.cz/audio/clanky/fixture.mp3');
  assert.equal(pohled.iso, 'PT3M12S');
  assert.equal(pohled.delkaText, '3:12');
  assert.equal(pohled.prepis, audio.transcript);
  assert.equal(audioTtsScript(audio), audio.ttsScript);
  assert.equal(audioLd['@type'], 'AudioObject');
  assert.equal(audioLd.contentUrl, pohled.src);
  assert.equal(audioLd.duration, 'PT3M12S');
  assert.equal(audioLd.mainEntityOfPage, articleUrl);
  assert.equal(audioLd['@id'], `${articleUrl}#audio`);
  assert.equal(audioLd.transcript, audio.transcript);
  assert.doesNotMatch(JSON.stringify(audioLd), /Gůgl|Džeminy/);
  assert.deepEqual(jsonLd.audio, { '@id': audioLd['@id'] });
  assert.match(jsonLdText(audioLd), /\\u003cscript/);
  assert.doesNotMatch(jsonLdText(audioLd), /<script/);
});

test('TTS helper je zpětně kompatibilní s článkem bez ttsScript', () => {
  assert.equal(audioTtsScript({ transcript: 'Starší čitelný přepis.' }), 'Starší čitelný přepis.');
  assert.equal(audioTtsScript({ ttsScript: 'Fonetický skript.', transcript: 'Čitelný přepis.' }), 'Fonetický skript.');
  assert.equal(audioTtsScript(undefined), undefined);
});

test('vytvorAudioObject bez platného audia nic nevrátí a nepropojí článek', () => {
  const jsonLd = { '@type': 'NewsArticle' };
  assert.equal(vytvorAudioObject(undefined, { articleUrl: 'https://realtech.cz/x/' }), null);
  assert.deepEqual(pripojAudioKClanku(jsonLd, null), jsonLd);
});
