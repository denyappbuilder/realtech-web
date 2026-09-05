import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");

function blok(od, doKonce) {
  const start = css.indexOf(od);
  assert.notEqual(start, -1, `global.css nemá blok začínající ${od}`);
  const konec = doKonce ? css.indexOf(doKonce, start + od.length) : css.length;
  return css.slice(start, konec === -1 ? undefined : konec);
}

function telo(selektor) {
  const shoda = css.match(
    new RegExp(`${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]+)\\}`),
  );
  return shoda?.[1] ?? "";
}

test("kolo 12: forced dark nese --signal stejně jako prefers-color-scheme dark", () => {
  const system = blok("@media (prefers-color-scheme: dark)", ':root[data-theme="dark"]');
  const forced = blok(':root[data-theme="dark"]', "* { margin: 0;");
  assert.match(
    system,
    /--signal:\s*#E5322D;/,
    "systémový dark ztratil --signal #E5322D",
  );
  assert.match(
    forced,
    /--signal:\s*#E5322D;/,
    "forced dark (OS light + toggle) pořád dědí světlé --signal #D42622",
  );
  assert.match(forced, /--signal-dark:\s*#F0554F;/);
  assert.match(forced, /--bg:\s*#0F1216;/);
});

test("kolo 12: .video-embed a .article-hero berou --line-panel/--panel, ne cream+black", () => {
  for (const selektor of [".video-embed", ".article-hero"]) {
    const shoda = css.match(
      new RegExp(
        `${selektor.replaceAll(".", "\\.")}\\s*\\{([^}]*aspect-ratio:[^}]+)\\}`,
      ),
    );
    const rule = shoda?.[1] ?? "";
    assert.ok(rule, `${selektor} (16/9 blok) v CSS chybí`);
    // Kolo 23: rámeček na --panel bere --line-panel (ve světlém = --line).
    assert.match(rule, /border:\s*1px solid var\(--line-panel\)/, `${selektor} nemá var(--line-panel)`);
    assert.match(rule, /background:\s*var\(--panel\)/, `${selektor} nemá var(--panel)`);
    assert.doesNotMatch(
      rule,
      /rgba\(\s*243\s*,\s*236\s*,\s*231/,
      `${selektor} pořád drží leftover cream rámeček`,
    );
    assert.doesNotMatch(rule, /background:\s*#000/, `${selektor} pořád má černé #000`);
  }
});

test("kolo 12: YouTube fasáda bez černo-červeného neonu, play zůstává #e00000", () => {
  const facade = telo(".youtube-facade");
  assert.ok(facade, ".youtube-facade v CSS chybí");
  assert.match(facade, /background:\s*var\(--panel\)/);
  assert.doesNotMatch(
    facade,
    /radial-gradient|#090b0e|rgba\(\s*226\s*,\s*0\s*,\s*0/,
    ".youtube-facade pořád maluje černo-červený neon",
  );
  const play = telo(".youtube-facade-play path:first-child");
  assert.match(play, /fill:\s*#e00000/, "YouTube play tlačítko musí zůstat #e00000");
});

test("kolo 12: search overlay není hororové černo-červené rgba(13,7,7)", () => {
  const overlay = telo(".search-overlay");
  assert.ok(overlay, ".search-overlay v CSS chybí");
  assert.doesNotMatch(
    overlay,
    /rgba\(\s*13\s*,\s*7\s*,\s*7/,
    "search overlay pořád tahá leftover red-black scrim",
  );
  assert.match(
    overlay,
    /color-mix\(in srgb,\s*var\(--ink\)/,
    "scrim musí míchat --ink",
  );
  assert.match(
    overlay,
    /var\(--panel\)/,
    "scrim musí míchat --panel",
  );
});

test("kolo 12: X widget se nerestyluje", () => {
  const start = css.indexOf("/* ── X (Twitter) embed");
  assert.notEqual(start, -1, "global.css ztratil sekci X");
  const sekce = css.slice(start);
  assert.match(sekce, /\.x-facade \{[^}]*background: var\(--surface\)/);
  assert.match(sekce, /\.x-facade-loading \{[^}]*background: var\(--surface\)/);
});

test("kolo 12: přepínač tématu nastaví meta theme-color na aktivní --bg", () => {
  assert.match(
    base,
    /<meta name="theme-color" content="#F6F7F9" media="\(prefers-color-scheme: light\)"/,
    "první nátěr musí nechat světlé theme-color přes media",
  );
  assert.match(
    base,
    /<meta name="theme-color" content="#0F1216" media="\(prefers-color-scheme: dark\)"/,
    "první nátěr musí nechat tmavé theme-color přes media",
  );
  assert.match(
    base,
    /getPropertyValue\('--bg'\)/,
    "toggle musí číst aktivní --bg, ne natvrdo jen OS schéma",
  );
  assert.match(
    base,
    /meta\[name="theme-color"\]/,
    "toggle musí sahat na meta theme-color",
  );
  const klik = base.slice(base.indexOf("toggle?.addEventListener('click'"));
  assert.match(
    klik,
    /nastavThemeColor\(\)/,
    "theme-color se musí nastavit v existujícím click handleru",
  );
});
