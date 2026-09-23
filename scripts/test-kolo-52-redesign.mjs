import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const cti = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const base = cti("src/layouts/Base.astro");
const index = cti("src/pages/index.astro");
const clanek = cti("src/pages/clanky/[...id].astro");
const player = cti("src/components/RtPlayer.astro");
const css = cti("src/styles/redesign.css");

test("kolo 52: přehrávač nestahuje MP3 před kliknutím a bez JS zůstává odkaz", () => {
  assert.match(player, /<audio preload="none"/, "preload musí být none — úvodka nesmí tahat MP3");
  assert.match(player, /<a class="rt-play" href=\{pohled\.src\}/, "bez JS musí tlačítko vést na MP3");
  assert.match(player, /aria-label=\{`Přehrát audio přehled, \$\{pohled\.delkaText\}`\}/, "tlačítko potřebuje jméno pro čtečku");
  assert.match(player, /audio\.play\(\)\.catch\(\(\) => \{ window\.location\.href = btn\.href; \}\)/, "odmítnuté přehrávání musí spadnout na odkaz MP3");
  assert.match(player, /e\.button !== 0 \|\| e\.metaKey \|\| e\.ctrlKey/, "ctrl/⌘/prostřední klik otevírá MP3 jako odkaz");
  assert.match(player, /setAttribute\('aria-pressed'/, "stav přehrávání musí být v aria-pressed");
  assert.match(player, /class="rt-wave" aria-hidden="true"/, "vlnovka je dekorace");
});

test("kolo 52: úvodka dává přehrávač k hero článku jen když má audio", () => {
  assert.match(index, /\{hero\.data\.audio && <RtPlayer audio=\{hero\.data\.audio\} seed=\{hero\.id\}/);
  assert.match(index, /const hero = all\[0\];/, "hero dál = nejnovější článek (lock #343)");
});

test("kolo 52: blok Mimo AI bere jen články mimo AI kategorie a neopakuje úvodku", () => {
  assert.match(index, /AI_KATEGORIE = new Set\(\['AI Report', 'AI Agenti'\]\)/);
  assert.match(index, /!AI_KATEGORIE\.has\(c\.data\.category\) && !naUvodce\.has\(c\.id\)/);
  assert.match(index, /<h2>Mimo AI<\/h2>/);
});

test("kolo 52: článek má přehrávač v hlavě a plná karta audia s přepisem zůstává", () => {
  assert.match(clanek, /\{audio && <RtPlayer audio=\{audio\} seed=\{article\.id\}/);
  assert.match(clanek, /<AudioPrehled audio=\{audio\} \/>/, "přepis a stažení MP3 nesmí zmizet");
});

test("kolo 52: hlavička má jednu hlavní výzvu k newsletteru, YouTube zůstává", () => {
  assert.match(base, /<a href="#newsletter" class="nl-btn">Odebírat<\/a>/);
  assert.match(base, /class="yt-btn" aria-label="Odebírat na YouTube"/);
  assert.match(base, /id="newsletter"/, "cíl odkazu musí existovat");
});

test("kolo 52: redesign používá jen tokeny webu, takže tmavý režim drží", () => {
  const bezKomentaru = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const barvy = [...bezKomentaru.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual([...new Set(barvy)], ["#fff"], "jediná natvrdo barva je bílá na červeném tlačítku");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.rt-play\s*\{[^}]*height: var\(--rd-play\)/, "tlačítko 52px ≥ 44px cíl");
});

test("kolo 52: newsletter na 320px nepřetéká (review: slovo v h2 a formulář roztáhly stránku na 326px)", () => {
  assert.match(css, /\.newsletter > \.wrap > \* \{ min-width: 0; \}/, "položky mřížky newsletteru musí umět být užší než obsah");
  assert.match(css, /\.newsletter h2 \{\s*overflow-wrap: anywhere; hyphens: auto;/, "dlouhé slovo v nadpisu se musí umět zlomit");
  assert.match(css, /\.newsletter > \.wrap \{[^}]*grid-template-columns: minmax\(0, 1fr\)/, "mobilní sloupec newsletteru minmax(0, 1fr)");
});

test("kolo 52: karta Audio přehled zůstává celá — nativní přehrávač se neschovává", () => {
  const bezKomentaru = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(bezKomentaru, /\.audio-prehled[^{]*audio[^{]*\{[^}]*display:\s*none/, "posun, hlasitost a rychlost nesmí zmizet");
});
