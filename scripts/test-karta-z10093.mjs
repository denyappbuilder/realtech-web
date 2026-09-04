import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const karta = readFileSync(
  path.join(REPOSITORY_ROOT, "src/components/ArticleCard.astro"),
  "utf8",
);

test("Z10093: hasWebp z coveru nesmí jít rovnou do <source> u videa", () => {
  const primoDoSablony =
    /\{\s*localThumb,\s*thumbW:\s*localW,\s*thumbH:\s*localH,\s*thumbWebp,\s*hasWebp\s*\}\s*=\s*nahledKarty\(image\)/.test(
      karta,
    );
  assert.equal(
    primoDoSablony,
    false,
    "hasWebp/thumbWebp z nahledKarty jdou rovnou do <picture> — u videa přebije YouTube náhled",
  );
});

test("Z10093: po volbě YouTube náhledu se WebP vynuluje", () => {
  const vynulujeWebp =
    /thumbWebp\s*=\s*useYtThumb\s*\?\s*null/.test(karta) ||
    /hasWebp\s*=\s*useYtThumb\s*\?\s*false/.test(karta) ||
    /hasWebp\s*=\s*!useYtThumb/.test(karta);
  assert.ok(
    vynulujeWebp,
    "chybí `thumbWebp = useYtThumb ? null` / `hasWebp = useYtThumb ? false` po volbě náhledu",
  );
});

test("Z10093: karta dál bere nahledKarty(image) a pouští <source> jen při hasWebp (Z1071)", () => {
  assert.match(karta, /nahledKarty\(image\)/);
  assert.match(
    karta,
    /hasWebp && thumbWebpSrcset && <source srcset=\{thumbWebpSrcset\}/,
  );
  assert.match(
    karta,
    /hasWebp && !thumbWebpSrcset && <source srcset=\{thumbWebp\} type="image\/webp" \/>/,
  );
  // YouTube je až fallback — lokální cover (existující soubor) má přednost
  // i u videa, viz KARTA-VIDEO-001 v test-karta-render.mjs.
  assert.match(
    karta,
    /const useYtThumb = Boolean\(videoId\) && !hasLocalThumb/,
  );
  assert.match(
    karta,
    /thumbUrl = useYtThumb \? `https:\/\/i\.ytimg\.com\/vi\/\$\{videoId\}\/maxresdefault\.jpg` : localThumb/,
  );
});
