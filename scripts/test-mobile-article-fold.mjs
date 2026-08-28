import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");
const audio = readFileSync(join(koren, "src/components/AudioPrehled.astro"), "utf8");

function blokyMedia(maxPx) {
  const bloky = [];
  const re = new RegExp(`@media\\s*\\(max-width:\\s*${maxPx}px\\)\\s*\\{`, "g");
  let shoda;
  while ((shoda = re.exec(css))) {
    const start = shoda.index;
    let i = css.indexOf("{", start);
    let hloubka = 0;
    for (; i < css.length; i += 1) {
      if (css[i] === "{") hloubka += 1;
      else if (css[i] === "}") {
        hloubka -= 1;
        if (hloubka === 0) {
          bloky.push(css.slice(start, i + 1));
          re.lastIndex = i + 1;
          break;
        }
      }
    }
  }
  return bloky.join("\n");
}

const mobil = blokyMedia(580);
const tablet = blokyMedia(900);
const uzkyMobil = blokyMedia(370);

test("mobilní header má dvě kompaktní řady bez skrytí navigace nebo CTA", () => {
  assert.match(base, /nav class="main"/, "hlavní navigace zmizela ze šablony");
  assert.match(base, /class="yt-btn"/, "YouTube CTA zmizelo ze šablony");
  assert.match(mobil, /grid-template-areas:\s*"logo actions"\s*"nav nav"/, "header nemá dvě určené řady");
  assert.match(mobil, /header\.site nav\.main\s*\{[^}]*overflow-x:\s*auto/, "navigace se na úzkém mobilu nedá vodorovně rolovat");
  assert.doesNotMatch(mobil, /(?:nav\.main|\.header-actions|\.yt-btn)[^{]*\{[^}]*display:\s*none/, "mobilní pravidla skrývají navigaci nebo CTA");
});

test("tablet 581–900px dává nav.main a stejný 44px cíl jako mobil", () => {
  const nav = tablet.match(/nav\.main a\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.ok(nav, "v @media (max-width: 900px) chybí nav.main a");
  assert.match(nav, /min-height:\s*44px/, "tabletová navigace nemá min-height: 44px");
  assert.match(nav, /display:\s*flex/, "tabletová navigace musí být flex, ať 44px sedí");
  assert.match(nav, /align-items:\s*center/, "tabletová navigace musí centrovat text v 44px");
});

test("mobilní header zachovává alespoň 44px dotykové cíle", () => {
  assert.match(mobil, /header\.site \.logo\s*\{[^}]*min-height:\s*44px/, "logo odkaz nemá 44px dotykový cíl");
  assert.match(mobil, /header\.site \.header-actions > \*\s*\{[^}]*min-height:\s*44px/, "akce nemají 44px dotykový cíl");
  assert.match(mobil, /header\.site nav\.main a\s*\{[^}]*min-height:\s*44px/, "odkazy navigace nemají 44px dotykový cíl");
});

test("úzký 320–360px fallback komprimuje šířku, ne obsah nebo dotykové cíle", () => {
  assert.match(uzkyMobil, /header\.site \.wrap\s*\{[^}]*padding-inline:\s*8px/, "úzký mobil nemá menší bezpečné okraje headeru");
  assert.match(uzkyMobil, /header\.site \.yt-btn\s*\{[^}]*padding-inline:\s*6px/, "CTA se na úzkém mobilu nevejde kompaktně");
  assert.doesNotMatch(uzkyMobil, /display:\s*none/, "úzký fallback schovává ovládání nebo text");
});

test("mobilní článek zhušťuje fold, ale ponechává audio i přepis", () => {
  assert.match(mobil, /\.article-page\s*\{[^}]*padding:\s*28px 0 48px/, "horní mezera článku není mobilně zhuštěná");
  assert.match(mobil, /\.article-head\s*\{[^}]*margin-bottom:\s*20px/, "hlavička článku má příliš velkou spodní mezeru");
  assert.match(mobil, /\.audio-prehled\s*\{[^}]*margin-bottom:\s*20px[^}]*padding:\s*12px 14px/, "audio karta není mobilně zhuštěná");
  assert.doesNotMatch(mobil, /\.audio-prehled[^{]*\{[^}]*display:\s*none/, "audio karta se na mobilu skrývá");
  assert.match(audio, /<audio controls/, "přehrávač zmizel z AudioPrehled");
  assert.match(audio, /<details class="audio-prehled-prepis">/, "přepis zmizel z AudioPrehled");
});
