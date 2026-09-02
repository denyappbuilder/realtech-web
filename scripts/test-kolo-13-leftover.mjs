import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const onas = readFileSync(join(koren, "src/pages/o-nas.astro"), "utf8");
const archiv = readFileSync(join(koren, "src/components/ArticleArchivePage.astro"), "utf8");
const hub = readFileSync(join(koren, "src/pages/temata/index.astro"), "utf8");
const redirects = readFileSync(join(koren, "public/_redirects"), "utf8");
const grokImagine = readFileSync(
  join(koren, "src/content/clanky/grok-imagine-image-2-zdarma.md"),
  "utf8",
);

function telo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("kolo 13: .vc-play bere --signal, ne leftover #D42622", () => {
  const play = telo(".vc-play");
  assert.ok(play, ".vc-play v CSS chybí");
  assert.match(
    play,
    /background:\s*color-mix\(in srgb,\s*var\(--signal\)\s+92%/,
    ".vc-play musí míchat --signal, ať forced dark nedědí leftover #D42622",
  );
  assert.doesNotMatch(
    play,
    /#D42622|#d42622|rgba\(\s*212\s*,\s*38\s*,\s*34/,
    ".vc-play pořád hardcoduje leftover light --signal #D42622",
  );
});

test("kolo 13: O nás sdílí Organization @id #org s homepage a nese AboutPage + breadcrumb", () => {
  assert.match(
    onas,
    /const orgId = `\$\{Astro\.site\?\.href\}#org`/,
    "O nás musí použít stejné #org jako homepage WebSite.publisher",
  );
  assert.match(onas, /'@id': orgId/, "Organization na /o-nas/ musí mít @id #org");
  assert.match(onas, /'@type': 'AboutPage'/, "/o-nas/ musí být AboutPage, ne jen holá Organization");
  assert.match(onas, /mainEntity: \{ '@id': orgId \}/, "AboutPage musí ukazovat na #org");
  assert.match(onas, /'@type': 'BreadcrumbList'/, "/o-nas/ musí mít BreadcrumbList jako /temata/");
  assert.match(
    onas,
    /name: 'O nás',\s*item: onasUrl/,
    "breadcrumb musí končit na /o-nas/",
  );
});

test("kolo 13: archiv /clanky/ má BreadcrumbList jako hub /temata/", () => {
  assert.match(archiv, /const breadcrumbLd = \{/, "archiv ztratil breadcrumbLd");
  assert.match(archiv, /'@type': 'BreadcrumbList'/);
  assert.match(
    archiv,
    /name: 'Články',\s*item: new URL\('\/clanky\/', Astro\.site\)\.href/,
    "breadcrumb archivu musí končit na /clanky/",
  );
  assert.match(
    archiv,
    /set:html=\{JSON\.stringify\(breadcrumbLd\)\}/,
    "breadcrumb se musí vykreslit do <head>",
  );
});

test("kolo 13: hub /temata/ preloaduje první náhled", () => {
  assert.match(hub, /preloadHeroObrazku/);
  assert.match(hub, /rel="preload"/);
  assert.match(hub, /loading=\{i === 0 \? 'eager' : 'lazy'\}/);
});

test("kolo 13: Grok Imagine má xPost na oznámení ze Zdrojů, cover zůstává fotka", () => {
  assert.match(
    grokImagine,
    /^xPosts:\n  - "https:\/\/x\.com\/imagine\/status\/2086142677481930861"$/m,
    "článek cituje tenhle status v Zdrojích, ale neměl embed",
  );
  assert.equal(
    (grokImagine.match(/^  - "https:\/\/(x|twitter)\.com\//gm) ?? []).length,
    1,
    "jen oznámení Image 2.0, žádný další post",
  );
  assert.match(
    grokImagine,
    /^image: "\/images\/clanky\/grok-imagine-image-2-zdarma\.jpg"$/m,
    "cover musí zůstat fotka — widget je v textu, ne přes hero",
  );
  assert.doesNotMatch(grokImagine, /^video:/m, "pole video je jen YouTube");
  assert.match(
    grokImagine,
    /\[Grok Imagine na X — oznámení Image 2\.0 \(8\. 8\. 2026\)\]\(https:\/\/x\.com\/imagine\/status\/2086142677481930861\)/,
    "stejné status URL musí zůstat v Zdrojích",
  );
});

test("kolo 13: /about a /blog se 301 na české stránky, /newsletter se nestaví", () => {
  assert.match(redirects, /^\/about\/?\s+\/o-nas\/\s+301$/m);
  assert.match(redirects, /^\/blog\/?\s+\/clanky\/\s+301$/m);
  assert.doesNotMatch(
    redirects,
    /\/newsletter/,
    "newsletter žije na /#newsletter — žádná nová stránka ani redirect, pokud ho nic neslibuje",
  );
});
