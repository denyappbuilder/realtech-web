// Testy pro AUTO-OPRAVU chybějícího coveru ve scripts/validate-content.mjs
// (blok „1. chybí image, ale cover existuje → doplnit").
//
// PROČ zrovna tahle větev: je to jediné místo v repu, kde prebuild SÁM PŘEPÍŠE
// zdrojový soubor článku. Stávající test-validate-content.mjs ověřuje jen
// šťastnou cestu (cover existuje, frontmatter má `date:`). Zbytek větve —
// kdy se auto-oprava spustit NEMÁ a co přesně zapíše, když se vstup liší od
// očekávaného tvaru — testovaný nebyl. Chyba tady je tichá: hlášení vždycky
// tvrdí „doplněn chybějící image", i když se do frontmatteru nic nedostalo.
//
// Helpery jsou zkopírované z test-validate-content.mjs — ten soubor nic
// neexportuje, importovat je z něj nejde.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const VALIDATOR = path.join(REPOSITORY_ROOT, 'scripts/validate-content.mjs');
const FIXTURE_PREFIX = path.join(tmpdir(), 'realtech-autooprava-');

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

/** Cover na disku. Přípona je součástí testu — validátor se ptá jen na .jpg. */
function writeCover(root, slug, pripona = 'jpg') {
  writeFileSync(path.join(root, 'public/images/clanky', `${slug}.${pripona}`), 'fixture');
}

function runValidator(root) {
  const result = spawnSync(process.execPath, [VALIDATOR], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.error, undefined);
  return result;
}

function validFrontmatter(overrides = {}) {
  const values = {
    title: 'Platný článek',
    description: 'Popis platného článku.',
    category: 'AI Report',
    date: '2026-01-15',
    ...overrides,
  };

  return Object.entries(values).map(([key, value]) => `${key}: "${value}"`);
}

/**
 * Rozdělí článek na frontmatter a tělo. Auto-oprava má sahat výhradně do
 * frontmatteru, takže se obě části posuzují zvlášť.
 */
function rozdelClanek(obsah) {
  assert.ok(obsah.startsWith('---\n'), 'fixture musí začínat frontmatterem');
  const konec = obsah.indexOf('\n---\n');
  assert.ok(konec > 0, 'fixture musí mít uzavřený frontmatter');
  return {
    frontmatter: obsah.slice(4, konec + 1),
    telo: obsah.slice(konec + 5),
  };
}

/** Kolikrát je ve frontmatteru klíč na začátku řádku. */
function pocetKlicu(frontmatter, klic) {
  return frontmatter
    .split('\n')
    .filter((radek) => radek.startsWith(`${klic}:`))
    .length;
}

// ---------------------------------------------------------------------------
// A) Co auto-oprava dělá dnes — regresní síť
// ---------------------------------------------------------------------------

test('auto-oprava vloží image hned za date a tělo článku nechá být', (t) => {
  const root = createFixture(t);
  const telo = 'První odstavec.\n\n## Nadpis\n\nDruhý odstavec.';
  const articlePath = writeArticle(root, 'doplneny-cover', validFrontmatter(), telo);
  writeCover(root, 'doplneny-cover');
  const pred = rozdelClanek(readFileSync(articlePath, 'utf8'));

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /AUTO-OPRAVA doplneny-cover: doplněn chybějící image/);
  assert.match(result.stdout, /1 článků OK, 1 auto-opraveno/);

  const po = rozdelClanek(readFileSync(articlePath, 'utf8'));
  assert.equal(
    po.frontmatter,
    pred.frontmatter.replace(
      'date: "2026-01-15"\n',
      'date: "2026-01-15"\nimage: "/images/clanky/doplneny-cover.jpg"\n',
    ),
    'image se musí vložit přesně za řádek date, jinak nic',
  );
  assert.equal(po.telo, pred.telo, 'tělo článku se auto-opravou nesmí změnit');
});

test('druhý běh už nic nepřidá — auto-oprava je idempotentní', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'dvakrat', validFrontmatter());
  writeCover(root, 'dvakrat');

  const prvni = runValidator(root);
  assert.equal(prvni.status, 0, prvni.stderr);
  const poPrvnim = readFileSync(articlePath, 'utf8');

  const druhy = runValidator(root);

  assert.equal(druhy.status, 0, druhy.stderr);
  assert.doesNotMatch(druhy.stderr, /AUTO-OPRAVA/);
  assert.doesNotMatch(druhy.stdout, /auto-opraveno/);
  assert.equal(
    readFileSync(articlePath, 'utf8'),
    poPrvnim,
    'opakovaný běh nesmí přidat další řádek image',
  );
  assert.equal(pocetKlicu(rozdelClanek(poPrvnim).frontmatter, 'image'), 1);
});

test('článek s video: se neauto-opraví, ani když cover leží na disku', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'ma-video', [
    ...validFrontmatter({ title: 'Článek s videem' }),
    'video: "https://youtu.be/abcdefghijk"',
  ]);
  writeCover(root, 'ma-video');
  const pred = readFileSync(articlePath, 'utf8');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /AUTO-OPRAVA/);
  assert.equal(readFileSync(articlePath, 'utf8'), pred);
});

test('bez coveru na disku se soubor nesahá', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'bez-coveru', validFrontmatter({ title: 'Bez coveru' }));
  const pred = readFileSync(articlePath, 'utf8');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /AUTO-OPRAVA/);
  assert.equal(readFileSync(articlePath, 'utf8'), pred);
});

test('článek s platným image: zůstane beze změny', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'uz-ma-image', [
    ...validFrontmatter({ title: 'Už má image' }),
    'image: "/images/clanky/uz-ma-image.jpg"',
  ]);
  writeCover(root, 'uz-ma-image');
  const pred = readFileSync(articlePath, 'utf8');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /AUTO-OPRAVA/);
  assert.equal(readFileSync(articlePath, 'utf8'), pred);
});

test('cover jen jako .png auto-opravu nespustí — podmínka se ptá jen na .jpg', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'jen-png', validFrontmatter({ title: 'Jen PNG cover' }));
  writeCover(root, 'jen-png', 'png');
  const pred = readFileSync(articlePath, 'utf8');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /AUTO-OPRAVA/);
  assert.equal(
    readFileSync(articlePath, 'utf8'),
    pred,
    'auto-oprava nesmí zapsat cestu na .jpg, který neexistuje',
  );
});

// ---------------------------------------------------------------------------
// B) Nálezy — testy tvrdí ŽÁDANÉ chování, dnes selhávají.
//    Chyby se v tomhle běhu neopravují, viz data/nalezy/codex-testy-web.md.
// ---------------------------------------------------------------------------

test(
  'prázdné image: nesmí vzniknout druhý klíč image [codex-testy-web/AUTOOPRAVA-001]',
  (t) => {
    const root = createFixture(t);
    // `image:` bez hodnoty projde regexem `^image:\s*["']?(.+?)["']?\s*$` jako
    // NEnalezené, protože skupina potřebuje aspoň jeden znak. Auto-oprava proto
    // vloží vlastní řádek — a klíč `image` je ve frontmatteru dvakrát.
    const articlePath = writeArticle(root, 'prazdne-image', [
      ...validFrontmatter({ title: 'Prázdné image' }),
      'image:',
    ]);
    writeCover(root, 'prazdne-image');

    runValidator(root);

    const { frontmatter } = rozdelClanek(readFileSync(articlePath, 'utf8'));
    assert.equal(
      pocetKlicu(frontmatter, 'image'),
      1,
      `frontmatter má klíč image víckrát než jednou:\n${frontmatter}`,
    );
  },
);

test(
  'auto-oprava nesmí psát do těla článku [codex-testy-web/AUTOOPRAVA-002]',
  (t) => {
    const root = createFixture(t);
    // Frontmatter bez `date:`, ale v těle je řádek, který `date:` začíná.
    // Náhrada běží nad celým souborem, takže první shoda je až v těle.
    const telo = 'Poznámka k režimu:\ndate: ručně doplnit\n\nZbytek článku.';
    const articlePath = writeArticle(
      root,
      'date-v-tele',
      validFrontmatter({ title: 'Datum v těle' }).filter((r) => !r.startsWith('date:')),
      telo,
    );
    writeCover(root, 'date-v-tele');
    const pred = rozdelClanek(readFileSync(articlePath, 'utf8'));

    runValidator(root);

    const po = rozdelClanek(readFileSync(articlePath, 'utf8'));
    assert.equal(
      po.telo,
      pred.telo,
      `auto-oprava zapsala image do těla článku:\n${po.telo}`,
    );
  },
);
