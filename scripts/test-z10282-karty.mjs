import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");
const karta = readFileSync(join(koren, "src/components/ArticleCard.astro"), "utf8");

const KATEGORIE = [
  { slug: "ai-report", nazev: "AI Report", pomer: "16 / 9", barva: "#2B4A6F" },
  { slug: "ai-agenti", nazev: "AI Agenti", pomer: "4 / 3", barva: "#8A6420" },
  { slug: "drony", nazev: "Drony", pomer: "3 / 2", barva: "#8B3A22" },
  { slug: "vesmir", nazev: "Vesmír", pomer: "16 / 9", barva: "#3A4570" },
  { slug: "hardware", nazev: "Hardware", pomer: "4 / 3", barva: "#2F5546" },
  { slug: "mobily", nazev: "Mobily", pomer: "3 / 2", barva: "#5A2B6F" },
  { slug: "site", nazev: "Sítě", pomer: "16 / 9", barva: "#1F6A7A" },
];

function pomerRe(pomer) {
  return pomer.replace(" / ", "\\s*/\\s*");
}

test("Z10282: karta pořád nese data-category, ať jde akcent na celou kartu", () => {
  assert.match(
    karta,
    /data-category=\{category\}/,
    "ArticleCard ztratila data-category — akcent karty by neměl na co viset",
  );
});

test("Z10282: každá kategorie má vlastní poměr náhledu", () => {
  for (const k of KATEGORIE) {
    assert.match(
      css,
      new RegExp(`\\.th-${k.slug}\\s*\\{[^}]*aspect-ratio:\\s*${pomerRe(k.pomer)}`),
      `chybí aspect-ratio ${k.pomer} u .th-${k.slug} — náhledy zase splývají`,
    );
  }
});

test("Z10282: v mřížce jsou aspoň tři různé poměry — jinak karty zase splývají", () => {
  const pomery = new Set();
  for (const k of KATEGORIE) {
    const m = css.match(
      new RegExp(`\\.th-${k.slug}\\s*\\{[^}]*aspect-ratio:\\s*([0-9]+\\s*/\\s*[0-9]+)`),
    );
    if (m) pomery.add(m[1].replace(/\s+/g, ""));
  }
  assert.ok(
    pomery.size >= 3,
    `jen ${pomery.size} poměrů (${[...pomery].join(", ")}) — mřížka zůstane jednou šablonou`,
  );
});

test("Z10282: každá kategorie má na kartě vlastní barevný akcent", () => {
  for (const k of KATEGORIE) {
    assert.match(
      css,
      new RegExp(
        `\\.card\\[data-category="${k.nazev}"\\]\\s*\\{[^}]*border-left:\\s*4px\\s+solid\\s+${k.barva}`,
        "i",
      ),
      `chybí akcent karty pro ${k.nazev}`,
    );
  }
});
