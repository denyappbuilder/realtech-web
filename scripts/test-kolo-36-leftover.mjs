// Kolo 36: živý audit 10. 9. 2026 (článek s NotebookLM Deep Dive, /clanky/,
// úvodka na 390px) proti kódu. Jen kód — MP3 v R2 se nemění.
//
// P1: „ČTENÍ 4 MIN“ v hlavě článku vedle „Délka 17:42“ u přehrávače vypadalo
//     jako chyba. Popisek u přehrávače říká, že Deep Dive je celý rozbor
//     (delší než čtení) a krátký přehled jen to hlavní — podle -nlm.mp3.
// P2: mezi „Délka“ a <time> je textový uzel — kompilátor mezeru mezi
//     elementy vyhodil a čtečka četla „Délka17:42“.
// P2: <audio preload="metadata"> — nativní ovládání ukáže délku bez stažení
//     celého souboru (none ji nechávalo prázdnou do kliknutí).
// P2: #art-search na straně 1 stojí v GET formuláři jako na strana/2+ —
//     Enter/odeslání funguje i bez JS a URL /clanky/?q=… je sdílitelná.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  POPIS_DEEP_DIVE,
  POPIS_KRATKY,
  audioPrehledPohled,
  jeNotebookLmDeepDive,
  popisAudioPrehledu,
} from "../src/lib/audio-prehled.js";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const cti = (rel) => readFileSync(join(koren, rel), "utf8");
const css = cti("src/styles/global.css");
const audio = cti("src/components/AudioPrehled.astro");
const archiv = cti("src/components/ArticleArchivePage.astro");

const SITE = new URL("https://realtech.cz");

// ── P1: Deep Dive vs. krátký přehled ─────────────────────────────────────

test("kolo 36: -nlm.mp3 je NotebookLM Deep Dive, -v3.mp3 krátký přehled", () => {
  assert.equal(jeNotebookLmDeepDive("https://audio.realtech.cz/chatgpt-images-2-5-sketch-nlm.mp3?v=2ee83f97f959"), true);
  assert.equal(jeNotebookLmDeepDive("https://audio.realtech.cz/anthropic-fable-mythos-v3.mp3?v=f463236cc5ca"), false);
  assert.equal(jeNotebookLmDeepDive("https://audio.realtech.cz/nlm-uvod-v3.mp3"), false, "„nlm“ jinde v názvu nestačí");
  assert.equal(jeNotebookLmDeepDive("https://audio.realtech.cz/slug-nlm.m4a"), true, "jiná přípona, stejná konvence");
  assert.equal(jeNotebookLmDeepDive(undefined), false);
  assert.equal(jeNotebookLmDeepDive("javascript:alert(1)"), false);
});

test("kolo 36: pohled přehrávače nese popis podle formátu, bez smyšlené kratší délky", () => {
  const deepDive = audioPrehledPohled(
    { url: "https://audio.realtech.cz/chatgpt-images-2-5-sketch-nlm.mp3?v=2ee83f97f959", duration: 1062 },
    SITE,
  );
  assert.equal(deepDive.deepDive, true);
  assert.equal(deepDive.popis, POPIS_DEEP_DIVE);
  assert.equal(deepDive.delkaText, "17:42", "délka zůstává skutečná délka souboru");

  const kratky = audioPrehledPohled(
    { url: "https://audio.realtech.cz/anthropic-fable-mythos-v3.mp3?v=f463236cc5ca", duration: 145 },
    SITE,
  );
  assert.equal(kratky.deepDive, false);
  assert.equal(kratky.popis, POPIS_KRATKY);
  assert.equal(kratky.delkaText, "2:25");

  assert.equal(popisAudioPrehledu(true), POPIS_DEEP_DIVE);
  assert.equal(popisAudioPrehledu(false), POPIS_KRATKY);
  assert.match(POPIS_DEEP_DIVE, /Celý audio přehled/, "posluchač musí hned vědět, že jde o celý přehled");
  assert.match(POPIS_DEEP_DIVE, /NotebookLM Deep Dive/);
  assert.match(POPIS_DEEP_DIVE, /déle než přečtení/, "vysvětluje rozdíl proti ČTENÍ N MIN");
  for (const popis of [POPIS_DEEP_DIVE, POPIS_KRATKY]) {
    assert.doesNotMatch(popis, /\d+\s*(?:min|:\d)/, "popisek nesmí uvádět vlastní (smyšlenou) délku");
    assert.doesNotMatch(popis, /AI hlas|uměl[aá] inteligence|ElevenLabs/i);
  }
});

test("kolo 36: komponenta vykreslí popisek pod hlavou a přehrávač na něj odkazuje", () => {
  assert.match(
    audio,
    /<\/div>\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)?<p class="audio-prehled-popis" id="audio-prehled-popis">\{pohled\.popis\}<\/p>\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)?<audio\b/,
    "popisek stojí mezi hlavou karty a <audio>",
  );
  assert.match(audio, /<audio\b[^>]*\baria-describedby="audio-prehled-popis"[^>]*>/);
  assert.match(audio, /<h2 id="audio-prehled-nadpis">Audio přehled<\/h2>/, "nadpis karty zůstává");
  assert.match(css, /\.audio-prehled-popis \{[^}]*color: var\(--ink-soft\)/);
  assert.match(css, /\.audio-prehled-popis \{[^}]*font-size: 0\.9rem/);
});

// ── P2: čtečka čte „Délka 17:42“, ne „Délka17:42“ ─────────────────────────

test("kolo 36: mezi „Délka“ a <time> je explicitní textový uzel", () => {
  assert.match(
    audio,
    /<span class="mono">Délka<\/span>\{' '\}\s*<time datetime=\{pohled\.iso\}>\{pohled\.delkaText\}<\/time>/,
    "holá mezera mezi elementy v šabloně nestačí — kompilátor ji vyhodil",
  );
});

// ── P2: <audio preload="metadata"> ───────────────────────────────────────

test("kolo 36: přehrávač načte jen metadata — délku ukáže bez stažení souboru", () => {
  assert.match(audio, /<audio\b[^>]*\bcontrols\b[^>]*\bpreload="metadata"[^>]*\bsrc=\{pohled\.src\}[^>]*>/);
  assert.doesNotMatch(audio, /preload="(?:none|auto)"/, "none nechává délku prázdnou, auto tahá celý MP3");
  assert.doesNotMatch(audio, /autoplay/i);
});

// ── P2: hledání na /clanky/ (strana 1) je GET formulář ────────────────────

test("kolo 36: #art-search na straně 1 stojí ve stejném GET formuláři jako strana/2+", () => {
  const strana1 = (archiv.match(/\{page === 1 \? \(([\s\S]*?)\) : \(/)?.[1] ?? "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  assert.ok(strana1, "archiv ztratil větev strany 1");
  assert.match(
    strana1,
    /<form class="search-form" action="\/clanky\/" method="get" role="search" aria-label="[^"]+">\s*<input type="search" name="q" class="search-input" id="art-search"/,
    "vstup musí mít name=q, jinak GET nic nepošle",
  );
  const strana2 = (archiv.match(/<div class="filter-bar" data-filter-odkaz>([\s\S]*?)<\/div>\s*\)\}/)?.[1] ?? "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  assert.ok(strana2, "archiv ztratil větev strany 2+");
  assert.match(strana2, /<form class="search-form" action="\/clanky\/" method="get" role="search"/, "vzor ze strany 2+ zůstává");
  assert.match(css, /\.filter-bar \.search-form \{ display: contents; \}/, "formulář nesmí rozbít rozložení .filter-bar");
});

test("kolo 36: odeslání formuláře s JS filtruje hned, bez reloadu", () => {
  const skript = archiv.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  assert.match(skript, /const searchForm = document\.querySelector<HTMLFormElement>\('\.filter-bar \.search-form'\);/);
  assert.match(
    skript,
    /searchForm\?\.addEventListener\('submit', \(event\) => \{\s*event\.preventDefault\(\);[\s\S]*?window\.clearTimeout\(debounceTimer\);\s*void apply\(\);/,
    "Enter má přeskočit debounce a spustit filtr, ne znovu načíst stránku",
  );
});
