import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const hub = readFileSync(join(koren, "src/pages/temata/index.astro"), "utf8");
const archiv = readFileSync(join(koren, "src/components/ArticleArchivePage.astro"), "utf8");
const tema = readFileSync(join(koren, "src/components/TemaPage.astro"), "utf8");

function telo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("kolo 14: header je --surface, ne skleněná clona", () => {
  const head = telo("header.site").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(head.trim(), "header.site v CSS chybí");
  assert.match(head, /background:\s*var\(--surface\)/, "header musí držet --surface");
  assert.doesNotMatch(
    head,
    /backdrop-filter|saturate/,
    "header pořád maluje glassmorphism",
  );
});

test("kolo 14: hero play bere --signal, ne leftover rgba(229,50,45)", () => {
  const play = telo(".hero-visual .play");
  assert.ok(play, ".hero-visual .play v CSS chybí");
  assert.match(
    play,
    /background:\s*color-mix\(in srgb,\s*var\(--signal\)\s+92%/,
    ".hero-visual .play musí míchat --signal stejně jako .vc-play",
  );
  assert.doesNotMatch(
    play,
    /rgba\(\s*229\s*,\s*50\s*,\s*45|#E5322D|#e5322d/,
    ".hero-visual .play pořád hardcoduje leftover dark --signal",
  );
});

test("kolo 14: newsletter input nesplývá s --panel v darku", () => {
  const input = telo(".nl-form input");
  assert.ok(input, ".nl-form input v CSS chybí");
  assert.doesNotMatch(
    input,
    /background:\s*#1D232C/,
    "input pořád hardcoduje #1D232C = dark --panel",
  );
  assert.match(
    input,
    /background:\s*color-mix\(in srgb,\s*#000/,
    "input musí být tmavší mix --panel, ať v darku zůstane pole",
  );
  assert.match(input, /var\(--panel\)/);
});

test("kolo 14: .btn-primary hover není leftover #000", () => {
  const hover = telo(".btn-primary:hover");
  assert.ok(hover, ".btn-primary:hover v CSS chybí");
  assert.doesNotMatch(hover, /background:\s*#000\b/, "hover pořád padá na černou fasádu");
  assert.match(hover, /color-mix\(in srgb,\s*#000\s+22%,\s*var\(--ink\)/);
});

test("kolo 14: karta hover stín z --ink, ne leftover cream/black", () => {
  const hover = telo(".card:hover");
  assert.match(
    hover,
    /box-shadow:[^;]*var\(--ink\)/,
    "hover stín karty musí brát --ink, ať light i dark sedí",
  );
  assert.doesNotMatch(
    hover,
    /rgba\(\s*20\s*,\s*23\s*,\s*28|rgba\(\s*0\s*,\s*0\s*,\s*0/,
    "karta pořád hardcoduje cream/black stín",
  );
  assert.doesNotMatch(
    css,
    /\.card:hover \{[^}]*rgba\(0,0,0,0\.8\)/,
    "dark override leftover černého stínu zůstal",
  );
});

test("kolo 14: perex a meta karty jsou čitelné", () => {
  const perex = telo(".card-body p");
  const meta = telo(".card-meta");
  const chip = telo(".chip");
  assert.match(perex, /font-size:\s*0\.95rem/, "perex karty zůstal na leftover 0.88rem");
  assert.match(meta, /font-size:\s*0\.75rem/, "meta karty zůstal na leftover 0.68rem");
  assert.match(chip, /font-size:\s*0\.76rem/, "chip zůstal na leftover 0.72rem");
});

test("kolo 14: tělo článku drží míru řádku 68ch", () => {
  assert.match(
    css,
    /\.article-body p,\s*\n\s*\.article-body li,\s*\n\s*\.article-body blockquote \{\s*\n\s*max-width:\s*68ch;/,
    "odstavce článku musí mít max-width 68ch — na tabletu jinak jdou k 90 znakům",
  );
});

test("kolo 14: hub/archiv/téma berou .articles.hub, ne inline padding", () => {
  assert.match(hub, /<section class="articles hub">/);
  assert.match(archiv, /<section class="articles hub"/);
  assert.match(tema, /<section class="articles hub">/);
  assert.match(tema, /class="section-head with-tag"/);
  assert.doesNotMatch(hub, /style="padding-top/);
  assert.doesNotMatch(archiv, /style="padding-top/);
  assert.doesNotMatch(tema, /style="padding-top/);
  assert.doesNotMatch(tema, /style="margin-top/);
  const hubCss = telo(".articles.hub");
  assert.match(hubCss, /padding-top:\s*56px/);
});
