// Z10036 + Z10037: validate-content.mjs čte frontmatter přes split('---').
// Oddělovač je řádek ---, ne výskyt v hodnotě. Tentýž rozpor už Z1267
// opravil v astro.config.mjs; tady je horší, protože skript soubor i zapisuje.
//
// Z10037: naivní split(/^---\s*$/m) + join('---') sežere prázdné řádky
// kolem každé vodorovné čáry v těle. Past musí padnout na naivní opravě
// a projít na léčbě, která tělo neskládá.
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
const FIXTURE_PREFIX = path.join(tmpdir(), 'realtech-validate-oddelovac-');

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

function writeRaw(root, slug, raw) {
  const articlePath = path.join(root, 'src/content/clanky', `${slug}.md`);
  writeFileSync(articlePath, raw);
  return articlePath;
}

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

test(
  'Z10036: článek s --- uvnitř hodnoty frontmatteru projde validací',
  (t) => {
    const root = createFixture(t);
    writeRaw(
      root,
      'pomlcka-a',
      '---\n' +
        'title: "Pomlckovy rozbor"\n' +
        'description: "Rozbor --- dil prvni"\n' +
        'date: "2025-03-04"\n' +
        'category: "Hardware"\n' +
        '---\n' +
        '\n' +
        'Prvni odstavec.\n',
    );

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 článků OK/);
    assert.doesNotMatch(result.stderr, /unexpected end of the stream/);
  },
);

test(
  'Z10036: --- v titulku před date: neschová chybějící cover před auto-opravou',
  (t) => {
    const root = createFixture(t);
    const articlePath = writeRaw(
      root,
      'pomlcka-cover',
      '---\n' +
        'title: "Rozbor --- dil prvni"\n' +
        'description: "Popis"\n' +
        'date: "2025-03-04"\n' +
        'category: "Hardware"\n' +
        '---\n' +
        '\n' +
        'Prvni odstavec.\n',
    );
    writeCover(root, 'pomlcka-cover');

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /AUTO-OPRAVA pomlcka-cover/);
    assert.match(
      readFileSync(articlePath, 'utf8'),
      /date: "2025-03-04"\nimage: "\/images\/clanky\/pomlcka-cover\.jpg"/,
    );
  },
);

test(
  'Z10037: auto-oprava přeživší horizontální linku v těle nechá tělo bajt po bajtu beze změny',
  (t) => {
    const root = createFixture(t);
    const telo = 'Prvni odstavec.\n\n---\n\nDruhy odstavec.\n';
    const articlePath = writeRaw(
      root,
      'pomlcka-b',
      '---\n' +
        'title: "Pomlcka v tele"\n' +
        'description: "Popis"\n' +
        'date: "2025-03-04"\n' +
        'category: "Hardware"\n' +
        '---\n' +
        '\n' +
        telo,
    );
    writeCover(root, 'pomlcka-b');
    const pred = readFileSync(articlePath, 'utf8');
    const teloPred = pred.slice(pred.indexOf('Prvni'));

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /AUTO-OPRAVA pomlcka-b/);
    const po = readFileSync(articlePath, 'utf8');
    const teloPo = po.slice(po.indexOf('Prvni'));
    assert.equal(
      teloPo,
      teloPred,
      `tělo se změnilo:\nPRED=${JSON.stringify(teloPred)}\nPO=${JSON.stringify(teloPo)}`,
    );
    assert.match(po, /image: "\/images\/clanky\/pomlcka-b\.jpg"/);
  },
);
