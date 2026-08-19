// Oddělovač frontmatteru ve scripts/validate-content.mjs.
//
// Validátor si frontmatter ukrajuje textově (ř. 72):
//
//     const casti = raw.split('---');
//     const fm = casti[1] ?? '';
//
// Jenže oddělovač frontmatteru je ŘÁDEK `---`, ne libovolný výskyt `---`
// uvnitř hodnoty. `split('---')` se utne na první trojpomlčce kdekoli —
// i uprostřed uzavřené uvozované hodnoty. Astro tentýž soubor čte podruhé,
// pořádným YAML parserem přes `glob()` loader v src/content.config.ts,
// takže se obě čtení rozejdou: článek se vyrenderuje, ale prebuild na něm
// spadne.
//
// Přesně tenhle rozpor se 19. 8. opravil v astro.config.mjs
// (commit 2fd62f5, Z1267) na `split(/^---\s*$/m)`. Ve validate-content.mjs
// oprava NENÍ — a tady je to horší, protože tenhle skript zdrojový soubor
// článku i PŘEPISUJE (auto-oprava chybějícího coveru).
//
// Testy níž drží hranici na obou stranách:
//   - co validátor vidí stejně jako YAML parser (musí procházet i dnes),
//   - a kde se rozchází (todo, VALIDATE-ODDELOVAC-001 — v tomhle běhu
//     se neopravuje, jen se popisuje správné chování).
//
// Helpery jsou zkopírované z test-validate-content-autooprava.mjs — ten
// soubor nic neexportuje, importovat je z něj nejde.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_SCHEMA, load as parseYaml } from 'js-yaml';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = path.join(REPOSITORY_ROOT, 'scripts/validate-content.mjs');
const FIXTURE_PREFIX = path.join(tmpdir(), 'realtech-oddelovac-');

const TODO_ODDELOVAC = 'VALIDATE-ODDELOVAC-001 — viz data/nalezy/codex-testy-web.md';

function createFixture(t) {
  const root = mkdtempSync(FIXTURE_PREFIX);
  mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  mkdirSync(path.join(root, 'public/images/clanky'), { recursive: true });

  t.after(() => {
    assert.ok(
      root.startsWith(FIXTURE_PREFIX),
      `Odmítnuto odstranění neočekávané cesty: ${root}`,
    );
    rmSync(root, { recursive: true, force: true });
  });

  return root;
}

function writeArticle(root, slug, frontmatter, body = 'Text článku.') {
  const articlePath = path.join(root, 'src/content/clanky', `${slug}.md`);
  writeFileSync(articlePath, `---\n${frontmatter.join('\n')}\n---\n\n${body}\n`);
  return articlePath;
}

/** Cover na disku. Auto-oprava se ptá jen na .jpg. */
function writeCover(root, slug) {
  writeFileSync(path.join(root, 'public/images/clanky', `${slug}.jpg`), 'fixture');
}

function runValidator(root) {
  const result = spawnSync(process.execPath, [VALIDATOR], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.error, undefined);
  return result;
}

/**
 * Jak soubor čte Astro: oddělovačem je samostatný řádek `---`.
 * Vrací frontmatter už proparsovaný stejným YAML nastavením, jaké
 * validate-content.mjs používá na svém (useknutém) řetězci.
 */
function frontmatterPodleRadku(articlePath) {
  const raw = readFileSync(articlePath, 'utf8');
  return parseYaml(raw.split(/^---\s*$/m)[1] ?? '', { schema: CORE_SCHEMA }) ?? {};
}

// ---------------------------------------------------------------------------
// Fixture je platná — chyba je ve validátoru, ne ve vstupu
// ---------------------------------------------------------------------------

test('trojpomlčka v uzavřené hodnotě je platný YAML a řádkové čtení ji vrátí celou', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'popis-s-pomlckou', [
    'title: "Rozbor trhu"',
    'date: "2026-01-15"',
    'category: "AI Report"',
    'description: "Rozbor --- díl první"',
  ]);

  const podleRadku = frontmatterPodleRadku(articlePath);
  assert.equal(podleRadku.description, 'Rozbor --- díl první', 'hodnota se nesmí useknout');
  assert.equal(podleRadku.date, '2026-01-15', 'date leží za trojpomlčkou a musí přežít');
  assert.equal(podleRadku.category, 'AI Report');

  // A takhle tentýž vstup vidí validátor: useknutě, s neuzavřenou uvozovkou.
  const podleSplit = readFileSync(articlePath, 'utf8').split('---')[1];
  assert.match(podleSplit, /description: "Rozbor $/, 'split(---) se utne uvnitř hodnoty');
  assert.throws(
    () => parseYaml(podleSplit, { schema: CORE_SCHEMA }),
    /double quoted scalar/,
    'useknutý řetězec už není platný YAML — odtud falešná chyba buildu',
  );
});

// ---------------------------------------------------------------------------
// Kde se čtení rozchází — todo, VALIDATE-ODDELOVAC-001
// ---------------------------------------------------------------------------

test(
  'A) článek s trojpomlčkou v description projde validací',
  { todo: TODO_ODDELOVAC },
  (t) => {
    const root = createFixture(t);
    writeArticle(root, 'pomlcka-pred-date', [
      'title: "Rozbor trhu"',
      'date: "2026-01-15"',
      'category: "AI Report"',
      'description: "Rozbor --- díl první"',
    ]);

    const result = runValidator(root);

    assert.equal(
      result.status,
      0,
      `platný článek nesmí shodit prebuild, ale skončil ${result.status}: ${result.stderr}`,
    );
    assert.doesNotMatch(
      result.stderr,
      /double quoted scalar/,
      'chyba o neuzavřeném skaláru vzniká useknutím, ne vstupem',
    );
  },
);

test(
  'B) auto-oprava coveru se spustí i u článku s trojpomlčkou před date',
  { todo: TODO_ODDELOVAC },
  (t) => {
    const root = createFixture(t);
    // `date:` leží AŽ ZA trojpomlčkou, takže na useknutém fm ho
    // `/^date:/m` nenajde a celá auto-oprava se tiše přeskočí.
    const articlePath = writeArticle(root, 'pomlcka-pred-date-b', [
      'title: "Rozbor trhu"',
      'description: "Rozbor --- díl první"',
      'date: "2026-01-15"',
      'category: "AI Report"',
    ]);
    writeCover(root, 'pomlcka-pred-date-b');

    const result = runValidator(root);

    assert.equal(result.status, 0, `prebuild spadl: ${result.stderr}`);
    assert.match(
      result.stderr,
      /AUTO-OPRAVA pomlcka-pred-date-b: doplněn chybějící image/,
      'cover na disku se nesmí ignorovat bez jediného slova',
    );
    assert.equal(
      frontmatterPodleRadku(articlePath).image,
      '/images/clanky/pomlcka-pred-date-b.jpg',
      'image se měl doplnit',
    );
  },
);

// ---------------------------------------------------------------------------
// Hranice, které platí i dnes — regresní síť pro budoucí opravu
// ---------------------------------------------------------------------------

test('`---` jako horizontální linka v těle článku frontmatter nerozbije', (t) => {
  const root = createFixture(t);
  const telo = 'První odstavec.\n\n---\n\nDruhý odstavec.';
  const articlePath = writeArticle(
    root,
    'linka-v-tele',
    [
      'title: "Článek s linkou"',
      'description: "Popis bez trojpomlčky."',
      'category: "AI Report"',
      'date: "2026-01-15"',
    ],
    telo,
  );

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 článků OK/);
  assert.equal(
    readFileSync(articlePath, 'utf8').split(/^---\s*$/m).slice(2).join('---').includes('Druhý odstavec.'),
    true,
    'tělo za linkou musí zůstat na disku',
  );
});

test('auto-oprava přežije horizontální linku v těle — join(---) tělo nezamíchá', (t) => {
  const root = createFixture(t);
  const telo = 'První odstavec.\n\n---\n\nDruhý odstavec.\n\n---\n\nTřetí odstavec.';
  const articlePath = writeArticle(
    root,
    'linka-a-autooprava',
    [
      'title: "Linka a auto-oprava"',
      'description: "Popis bez trojpomlčky."',
      'category: "AI Report"',
      'date: "2026-01-15"',
    ],
    telo,
  );
  writeCover(root, 'linka-a-autooprava');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /AUTO-OPRAVA linka-a-autooprava/);

  const po = readFileSync(articlePath, 'utf8');
  const konec = po.indexOf('\n---\n');
  assert.equal(
    po.slice(konec + 5),
    `\n${telo}\n`,
    'zápis přes casti.join(---) nesmí tělo přeskládat ani o znak',
  );
  assert.equal(
    frontmatterPodleRadku(articlePath).image,
    '/images/clanky/linka-a-autooprava.jpg',
  );
});

test('dvě pomlčky ani em-dash v hodnotě validaci nerozhodí', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'dve-pomlcky', [
    'title: "Nvidia RTX 5090 -- první test"',
    'description: "Pomlčka — em-dash, dvě pomlčky -- a nic z toho nevadí"',
    'category: "AI Report"',
    'date: "2026-01-15"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 článků OK/);
});

test('dobře tvarovaný článek bez trojpomlčky v hodnotách projde beze změny', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'cisty', [
    'title: "Čistý článek"',
    'description: "Popis bez zvláštností."',
    'category: "AI Report"',
    'date: "2026-01-15"',
  ]);
  const pred = readFileSync(articlePath, 'utf8');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /AUTO-OPRAVA/);
  assert.equal(readFileSync(articlePath, 'utf8'), pred, 'bez coveru se soubor nesahá');
});
