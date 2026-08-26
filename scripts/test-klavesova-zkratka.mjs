// Popisek zkratky vyhledávání: handler v SearchModal.astro poslouchá
// metaKey i ctrlKey, ale hlavička ukazovala natvrdo ⌘K i na Windows/Linuxu
// (živě 26. 8. 2026: <kbd class="st-kbd">⌘K</kbd> + aria-label
// „Hledat v článcích (⌘K)" pro všechny). Popisek musí sedět na platformu.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { zkratkaHledani } from "../src/lib/klavesova-zkratka.js";

test("Apple platformy dostanou ⌘K", () => {
  // navigator.userAgentData?.platform i starší navigator.platform.
  for (const platforma of ["macOS", "MacIntel", "iPhone", "iPad", "iPod touch"]) {
    assert.equal(zkratkaHledani(platforma), "⌘K", platforma);
  }
});

test("Windows a Linux dostanou Ctrl+K", () => {
  for (const platforma of ["Windows", "Win32", "Linux x86_64", "Android", "Chrome OS"]) {
    assert.equal(zkratkaHledani(platforma), "Ctrl+K", platforma);
  }
});

test("neznámá platforma padá na Ctrl+K — ⌘ mimo Apple nedává smysl", () => {
  assert.equal(zkratkaHledani(""), "Ctrl+K");
  assert.equal(zkratkaHledani(undefined), "Ctrl+K");
});

// Funkce sama o sobě nestačí — Base.astro ji musí opravdu volat a přepsat
// všechna tři místa, kde je zkratka vidět (kbd, aria-label, title).
test("Base.astro přepíná popisek spouštěče podle platformy", () => {
  const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
  const base = readFileSync(join(koren, "src/layouts/Base.astro"), "utf8");

  assert.match(base, /import \{ zkratkaHledani \} from '\.\.\/lib\/klavesova-zkratka\.js';/);
  assert.match(base, /userAgentData\?\.platform \?\? navigator\.platform/);
  assert.match(base, /kbdHledani\.textContent = zkratka;/);
  assert.match(base, /setAttribute\('aria-label', `Hledat v článcích \(\$\{zkratka\}\)`\)/);
  assert.match(base, /\.title = `Hledat \(\$\{zkratka\}\)`/);
});
