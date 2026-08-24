import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const koren = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(koren, "src/styles/global.css"), "utf8");

function pravidla(trida) {
  const m = css.match(new RegExp(`\\.${trida}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
}

test("štítek ŽIVĚ vyplní výšku pruhu — ne height:100%", () => {
  const label = pravidla("ticker-label");
  assert.ok(label, "global.css nemá .ticker-label");

  assert.doesNotMatch(
    label,
    /height:\s*100%/,
    "ticker-label má height:100% — u .ticker s min-height to padá a štítek skončí 17px nahoře",
  );

  const ticker = pravidla("ticker");
  assert.ok(ticker, "global.css nemá .ticker");

  const labelMin = label.match(/min-height:\s*(\d+)px/);
  const tickerMin = ticker.match(/min-height:\s*(\d+)px/);
  const maStretch = /align-self:\s*stretch/.test(label);
  const stejneMinHeight =
    labelMin && tickerMin && labelMin[1] === tickerMin[1] && Number(labelMin[1]) >= 48;

  assert.ok(
    stejneMinHeight && maStretch,
    "ticker-label musí mít stejný min-height jako .ticker (≥48px) a align-self:stretch — jinak ŽIVĚ nesedí s headlines",
  );
});

test("písmo štítku ŽIVĚ sedí s pohyblivou řádkou", () => {
  const label = pravidla("ticker-label");
  const odkazy = pravidla("ticker-track a");
  assert.ok(label, "global.css nemá .ticker-label");
  assert.ok(odkazy, "global.css nemá .ticker-track a");

  assert.match(label, /IBM Plex Mono/, "štítek nemá IBM Plex Mono");
  assert.match(odkazy, /IBM Plex Mono/, "ticker-track a nemá IBM Plex Mono");
  assert.match(
    label,
    /font-size:\s*0\.78rem/,
    "štítek nemá 0.78rem — vedle headlines vypadá jako jiná ikona",
  );
});
