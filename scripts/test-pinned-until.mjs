import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { parseCalendarDate } from '../src/lib/calendarDate.js';
import {
  compareArticlesByDateDescThenId,
  jePripnuty,
  pripnuteNapred,
  PIN_MAX_DNI,
} from '../src/lib/article-order.js';

const koren = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function entry(id, date, pinnedUntil) {
  return {
    id,
    data: {
      date: new Date(date),
      ...(pinnedUntil ? { pinnedUntil: parseCalendarDate(pinnedUntil) } : {}),
    },
  };
}

const novejsi = entry('claude-novejsi', '2026-09-28T00:00:00.000Z');
const pripnuty = entry('devday-pripnuty', '2026-09-27T00:00:00.000Z', '2026-09-29');
const starsi = entry('starsi', '2026-09-26T00:00:00.000Z');
const serazene = [starsi, pripnuty, novejsi].sort(compareArticlesByDateDescThenId);

test('aktivní pinnedUntil předběhne novější článek, zbytek zůstane chronologicky', () => {
  const vysledek = pripnuteNapred(serazene, new Date('2026-09-28T15:00:00.000Z'));
  assert.deepEqual(vysledek.map(({ id }) => id), ['devday-pripnuty', 'claude-novejsi', 'starsi']);
});

test('pinnedUntil platí celý uvedený den UTC a pak sám vyprší', () => {
  assert.equal(jePripnuty(pripnuty, new Date('2026-09-29T23:59:59.999Z')), true);
  assert.equal(jePripnuty(pripnuty, new Date('2026-09-30T00:00:00.000Z')), false);
  const poExpiraci = pripnuteNapred(serazene, new Date('2026-09-30T00:00:00.000Z'));
  assert.deepEqual(poExpiraci.map(({ id }) => id), ['claude-novejsi', 'devday-pripnuty', 'starsi']);
});

test('bez pinu vrací stejné pole beze změny', () => {
  const bez = [novejsi, starsi];
  assert.equal(pripnuteNapred(bez, new Date('2026-09-28T00:00:00.000Z')), bez);
});

test('úvodka, /vitej/ a 404 řadí přes pripnuteNapred; archiv a RSS ne', () => {
  for (const soubor of ['src/pages/index.astro', 'src/pages/vitej.astro', 'src/pages/404.astro']) {
    const zdroj = readFileSync(path.join(koren, soubor), 'utf8');
    assert.match(zdroj, /pripnuteNapred\(/, `${soubor} musí respektovat pinnedUntil`);
  }
  for (const soubor of ['src/pages/rss.xml.js', 'src/components/ArticleArchivePage.astro']) {
    const zdroj = readFileSync(path.join(koren, soubor), 'utf8');
    assert.doesNotMatch(zdroj, /pripnuteNapred/, `${soubor} zůstává chronologický`);
  }
});

test('žádný článek nemá pin delší než PIN_MAX_DNI od date', () => {
  const clanky = path.join(koren, 'src/content/clanky');
  for (const f of readdirSync(clanky).filter((s) => s.endsWith('.md'))) {
    const fm = parseYaml(readFileSync(path.join(clanky, f), 'utf8').split(/^---\s*$/m)[1]);
    if (!fm.pinnedUntil) continue;
    const dni = (parseCalendarDate(fm.pinnedUntil) - parseCalendarDate(fm.date.slice(0, 10))) / 86_400_000;
    assert.ok(dni >= 0 && dni <= PIN_MAX_DNI, `${f}: pinnedUntil ${fm.pinnedUntil} je ${dni} dní po date`);
  }
});

function spustValidator(t, pinnedUntil) {
  const prefix = path.join(tmpdir(), 'realtech-pinned-until-');
  const root = mkdtempSync(prefix);
  t.after(() => {
    assert.ok(root.startsWith(prefix));
    rmSync(root, { recursive: true, force: true });
  });
  mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  mkdirSync(path.join(root, 'public/images/clanky'), { recursive: true });
  writeFileSync(
    path.join(root, 'src/content/clanky/pin.md'),
    [
      '---',
      'title: "Připnutý článek"',
      'description: "Popis připnutého článku."',
      'category: "AI Report"',
      'date: "2026-01-15"',
      `pinnedUntil: "${pinnedUntil}"`,
      '---',
      '',
      'Text článku.',
      '',
    ].join('\n'),
  );
  return spawnSync(process.execPath, [path.join(koren, 'scripts/validate-content.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('validátor pustí pin do PIN_MAX_DNI a odmítne delší nebo před date', (t) => {
  assert.equal(spustValidator(t, '2026-01-22').status, 0);
  const dlouhy = spustValidator(t, '2026-01-23');
  assert.notEqual(dlouhy.status, 0);
  assert.match(dlouhy.stdout + dlouhy.stderr, /pinnedUntil 2026-01-23 musí být 0–7 dní po date/);
  assert.notEqual(spustValidator(t, '2026-01-14').status, 0);
});
