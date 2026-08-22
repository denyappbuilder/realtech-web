import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

function blokyReducedMotion(zdroj) {
  const bloky = [];
  const re = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/g;
  let shoda;
  while ((shoda = re.exec(zdroj))) {
    const start = zdroj.indexOf("{", shoda.index);
    let hloubka = 0;
    let konec = start;
    for (; konec < zdroj.length; konec++) {
      const znak = zdroj[konec];
      if (znak === "{") hloubka += 1;
      else if (znak === "}") {
        hloubka -= 1;
        if (hloubka === 0) {
          konec += 1;
          break;
        }
      }
    }
    bloky.push(zdroj.slice(shoda.index, konec));
  }
  return bloky;
}

function cssBezReducedMotion() {
  let zbytek = css;
  for (const blok of blokyReducedMotion(css)) {
    zbytek = zbytek.replace(blok, "");
  }
  return zbytek;
}

const reduce = blokyReducedMotion(css).join("\n");
const bezReduce = cssBezReducedMotion();

test("webu zbývá účinný prefers-reduced-motion blok", () => {
  assert.ok(reduce.length > 0, "global.css nemá @media (prefers-reduced-motion: reduce)");
  assert.match(
    reduce,
    /animation\s*:\s*none/,
    "reduced-motion nevypíná animation — ticker a pulse se pořád točí",
  );
  assert.match(
    reduce,
    /transition\s*:\s*none/,
    "reduced-motion nevypíná transition — pohyb jen zrychlí, nezmizí",
  );
  assert.match(
    reduce,
    /scroll-behavior\s*:\s*auto/,
    "html pořád scrolluje plynule i při reduce",
  );
});

test("ticker a hover transformy se při reduce zastaví, centrování play zůstane", () => {
  assert.match(
    reduce,
    /\.ticker-track[\s\S]{0,160}animation\s*:\s*none/,
    "ticker-track se při reduce pořád hýbe",
  );
  assert.match(
    reduce,
    /\.card:hover[\s\S]{0,80}transform\s*:\s*none/,
    "karta se při reduce pořád zvedá o translateY",
  );
  assert.match(
    reduce,
    /\.card:hover\s+\.card-thumb\s+img[\s\S]{0,80}transform\s*:\s*none/,
    "náhled karty se při reduce pořád zvětšuje",
  );
  assert.match(
    reduce,
    /\.video-card:hover\s+\.vc-thumb\s+img[\s\S]{0,80}transform\s*:\s*none/,
    "video náhled se při reduce pořád zvětšuje",
  );
  assert.match(
    reduce,
    /\.hero-visual:hover\s+\.play[\s\S]{0,120}transform\s*:\s*translate\(\s*-50%\s*,\s*-60%\s*\)/,
    "hero play při reduce ztratilo centrování nebo pořád skaluje",
  );
  assert.doesNotMatch(
    reduce,
    /\.hero-visual:hover\s+\.play[\s\S]{0,160}scale\s*\(/,
    "hero play má při reduce pořád scale",
  );
  assert.match(
    reduce,
    /\.video-card:hover\s+\.vc-play[\s\S]{0,120}transform\s*:\s*translate\(\s*-50%\s*,\s*-50%\s*\)/,
    "vc-play při reduce ztratilo centrování nebo pořád skaluje",
  );
  assert.doesNotMatch(
    reduce,
    /\.video-card:hover\s+\.vc-play[\s\S]{0,160}scale\s*\(/,
    "video play má při reduce pořád scale",
  );
});

test("mimo reduce pohyb zůstává a stavový hover se nemaže", () => {
  assert.match(
    bezReduce,
    /\.ticker-track[\s\S]{0,220}animation\s*:/,
    "výchozí ticker přišel o animation — pruh stojí i bez reduce",
  );
  assert.match(
    bezReduce,
    /\.card:hover[\s\S]{0,80}transform\s*:\s*translateY/,
    "výchozí karta ztratila hover lift",
  );
  assert.match(
    bezReduce,
    /\.card:hover\s+\.card-thumb\s+img[\s\S]{0,80}transform\s*:\s*scale/,
    "výchozí náhled karty ztratil hover zoom",
  );
  assert.match(
    bezReduce,
    /\.hero-visual:hover\s+\.play[\s\S]{0,80}scale\s*\(/,
    "výchozí hero play ztratil hover scale",
  );
  assert.match(
    bezReduce,
    /\.video-card:hover\s+\.vc-play[\s\S]{0,80}scale\s*\(/,
    "výchozí video play ztratil hover scale",
  );
  assert.match(
    bezReduce,
    /nav\.main a:hover/,
    "navigace ztratila hover stav — to není pohyb, to je fokus",
  );
  assert.match(
    bezReduce,
    /\.yt-btn:hover[\s\S]{0,60}background\s*:/,
    "tlačítko ztratilo hover barvu",
  );
  assert.doesNotMatch(
    reduce,
    /nav\.main a:hover[\s\S]{0,80}(?:color|border)\s*:\s*(?:inherit|none|transparent)/,
    "reduced-motion omylem maže stavový hover navigace",
  );
});
