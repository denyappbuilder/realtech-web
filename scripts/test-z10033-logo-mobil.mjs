import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");

function blokMedia(maxPx) {
  const start = css.search(new RegExp(`@media\\s*\\(max-width:\\s*${maxPx}px\\)\\s*\\{`));
  if (start < 0) return "";
  let i = css.indexOf("{", start);
  let hloubka = 0;
  for (; i < css.length; i += 1) {
    if (css[i] === "{") hloubka += 1;
    else if (css[i] === "}") {
      hloubka -= 1;
      if (hloubka === 0) return css.slice(start, i + 1);
    }
  }
  return "";
}

function fontSize(blok, selektor) {
  const m = blok.match(new RegExp(`${selektor}\\s*\\{([^}]*)\\}`));
  if (!m) return null;
  const f = m[1].match(/font-size:\s*([0-9.]+)rem/);
  return f ? Number(f[1]) : null;
}

const mobil = blokMedia(900);

test("Z10033: header na mobilu pořád nese logo i hlavní navigaci", () => {
  assert.match(base, /class="logo"/, "Base.astro ztratila logo");
  assert.match(base, /nav class="main"/, "Base.astro ztratila hlavní navigaci");
  assert.ok(mobil.includes(".logo"), "v @media (max-width: 900px) chybí úprava .logo");
});

test("Z10033: logo na úzkém viewportu musí být menší než desktopových 1.45rem", () => {
  const velikost = fontSize(mobil, "\\.logo");
  assert.ok(velikost != null, "v mobilním bloku není .logo { font-size }");
  assert.ok(
    velikost <= 1.15,
    `logo na mobilu je ${velikost}rem — pořád bere výšku jako na desktopu`,
  );
});

test("Z10033: navigace na mobilu nesmí zůstat stísněná na 0.85rem", () => {
  const velikost = fontSize(mobil, "nav\\.main a");
  assert.ok(velikost != null, "v mobilním bloku není nav.main a { font-size }");
  assert.ok(
    velikost >= 0.92,
    `navigace na mobilu je ${velikost}rem — pořád stísněná pod logem`,
  );
});
