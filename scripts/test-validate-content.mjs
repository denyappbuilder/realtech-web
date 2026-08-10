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
const FIXTURE_PREFIX = path.join(tmpdir(), 'realtech-validate-content-');

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

function writeImage(root, slug) {
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

test('platný článek s existujícím obrázkem projde', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'platny', [
    ...validFrontmatter(),
    'image: "/images/clanky/platny.jpg"',
  ]);
  writeImage(root, 'platny');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /\[validate-content\] 1 článků OK/);
});

test('odkaz na chybějící obrázek ukončí validaci chybou', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'bez-obrazku', [
    ...validFrontmatter(),
    'image: "/images/clanky/neexistuje.jpg"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /\[validate-content\] ❌ bez-obrazku: image "\/images\/clanky\/neexistuje\.jpg" neexistuje/,
  );
  assert.doesNotMatch(result.stdout, /článků OK/);
});

test('chybějící image se doplní jen do fixture, pokud cover existuje', (t) => {
  const root = createFixture(t);
  const articlePath = writeArticle(root, 'automaticky-cover', validFrontmatter());
  writeImage(root, 'automaticky-cover');

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stderr,
    /AUTO-OPRAVA automaticky-cover: doplněn chybějící image/,
  );
  assert.match(result.stdout, /1 článků OK, 1 auto-opraveno/);
  assert.match(
    readFileSync(articlePath, 'utf8'),
    /date: "2026-01-15"\nimage: "\/images\/clanky\/automaticky-cover\.jpg"/,
  );
});

test('duplicitní titulek vypíše varování, ale validace projde', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'prvni', validFrontmatter({ title: 'Stejný titulek' }));
  writeArticle(root, 'druhy', validFrontmatter({ title: 'Stejný titulek' }));

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /Duplicitní titulek: "Stejný titulek"/);
  assert.match(result.stderr, /prvni/);
  assert.match(result.stderr, /druhy/);
  assert.match(result.stdout, /2 článků OK/);
});

for (const field of ['date', 'updated']) {
  test(`neplatné kalendářní pole ${field} ukončí validaci chybou`, (t) => {
    const root = createFixture(t);
    writeArticle(root, `spatne-${field}`, validFrontmatter({ [field]: '2026-02-31' }));

    const result = runValidator(root);

    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      new RegExp(`spatne-${field}\\.md: pole "${field}" není platné kalendářní datum: 2026-02-31`),
    );
  });
}

for (const requiredField of ['title', 'description', 'category', 'date']) {
  test(
    `chybějící povinné pole ${requiredField} má ukončit validaci chybou`,
    (t) => {
      const root = createFixture(t);
      const frontmatter = validFrontmatter().filter(
        (line) => !line.startsWith(`${requiredField}:`),
      );
      writeArticle(root, `chybi-${requiredField}`, frontmatter);

      const result = runValidator(root);

      assert.equal(result.status, 1);
      assert.match(result.stderr, new RegExp(`chybi-${requiredField}\\.md`));
      assert.match(result.stderr, new RegExp(`pole "${requiredField}"`));
    },
  );
}

test(
  'kategorie mimo povolený výčet má ukončit validaci chybou',
  (t) => {
    const root = createFixture(t);
    writeArticle(
      root,
      'spatna-kategorie',
      validFrontmatter({ category: 'Neexistující kategorie' }),
    );

    const result = runValidator(root);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /spatna-kategorie\.md/);
    assert.match(result.stderr, /pole "category"/);
  },
);
