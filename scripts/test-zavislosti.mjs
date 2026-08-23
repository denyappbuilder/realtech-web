import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROHLEDEJ = ["scripts", "src"];
const PRIPONY = new Set([".mjs", ".js", ".ts", ".astro"]);
const PRESKOC_SLOZKY = new Set(["test-rss-mocks", "test-sitemap-mocks", "test-audio-prehled-mocks"]);

const IMPORT_Z_FROM = /^(?:import|export)\b[\s\S]*?\bfrom\s+['"]([^'"]+)['"]/;
const IMPORT_STRANY = /^import\s+['"]([^'"]+)['"]/;

function nactiPackageJson(koren = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(koren, "package.json"), "utf8"));
}

function deklarovaneBalicky(pkg) {
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
}

function jmenoBalicku(spec) {
  if (!spec) return null;
  if (spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("node:")) {
    return null;
  }
  if (spec.startsWith("astro:")) return "astro";
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/");
    return name ? `${scope}/${name}` : scope;
  }
  return spec.split("/")[0];
}

function specifikaceZRadku(radek) {
  const orez = radek.replace(/\/\/.*$/, "").trim();
  if (!orez) return null;
  return orez.match(IMPORT_Z_FROM)?.[1] ?? orez.match(IMPORT_STRANY)?.[1] ?? null;
}

function souboryKeKontrole(koren = ROOT) {
  const vysledek = [];
  for (const slozka of PROHLEDEJ) {
    const start = path.join(koren, slozka);
    if (!fs.existsSync(start)) continue;
    const zasobnik = [start];
    while (zasobnik.length) {
      const aktualni = zasobnik.pop();
      for (const zaznam of fs.readdirSync(aktualni, { withFileTypes: true })) {
        if (zaznam.isDirectory()) {
          if (PRESKOC_SLOZKY.has(zaznam.name) || zaznam.name === "node_modules") {
            continue;
          }
          zasobnik.push(path.join(aktualni, zaznam.name));
          continue;
        }
        if (PRIPONY.has(path.extname(zaznam.name))) {
          vysledek.push(path.join(aktualni, zaznam.name));
        }
      }
    }
  }
  return vysledek.sort();
}

export function nedeklarovaneImporty(koren = ROOT) {
  const zname = deklarovaneBalicky(nactiPackageJson(koren));
  const chybejici = [];
  for (const soubor of souboryKeKontrole(koren)) {
    const rel = path.relative(koren, soubor);
    for (const [index, radek] of fs.readFileSync(soubor, "utf8").split(/\r?\n/).entries()) {
      const spec = specifikaceZRadku(radek);
      const balicek = jmenoBalicku(spec);
      if (!balicek || zname.has(balicek)) continue;
      chybejici.push({ soubor: rel, radek: index + 1, spec, balicek });
    }
  }
  return chybejici;
}

test("Z10049: každý holý import v scripts/ a src/ je v package.json", () => {
  const chybejici = nedeklarovaneImporty();
  assert.deepEqual(
    chybejici,
    [],
    `nedeklarované importy:\n${chybejici
      .map((x) => `${x.soubor}:${x.radek} → ${x.balicek} (${x.spec})`)
      .join("\n")}`,
  );
});

test("Z10049: js-yaml i typescript jsou přímé devDependencies, ne jen tranzitivní", () => {
  const dev = nactiPackageJson().devDependencies ?? {};
  assert.ok(dev["js-yaml"], "js-yaml musí být v devDependencies — prebuild ho importuje přímo");
  assert.ok(
    dev.typescript,
    "typescript musí být v devDependencies — prebuild jím transpiluje content.config.ts",
  );
});
