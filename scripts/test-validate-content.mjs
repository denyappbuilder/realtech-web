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

test('platné nequoted YAML datum projde', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'platne-nequoted-datum', [
    ...validFrontmatter().filter((line) => !line.startsWith('date:')),
    'date: 2026-01-15',
    'updated: 2026-01-16',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\[validate-content\] 1 článků OK/);
});

test('datum 9999-12-31 vypíše varování o budoucnosti, ale validace projde', (t) => {
  const root = createFixture(t);
  writeArticle(
    root,
    'budouci-datum',
    validFrontmatter({ date: '9999-12-31' }),
  );

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stderr,
    /\[validate-content\] ⚠️  budouci-datum: datum 9999-12-31 je v budoucnosti/,
  );
  assert.match(result.stdout, /\[validate-content\] 1 článků OK/);
});

test('historické datum nevypíše varování o budoucnosti', (t) => {
  const root = createFixture(t);
  writeArticle(
    root,
    'historicke-datum',
    validFrontmatter({ date: '2000-01-01' }),
  );

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /je v budoucnosti/);
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

test(
  'category odmítne YAML skaláry, které nejsou řetězce',
  (t) => {
    const root = createFixture(t);
    const cases = [
      ['category-boolean', 'true'],
      ['category-number', '7'],
      ['category-null', 'null'],
    ];

    for (const [slug, yamlValue] of cases) {
      writeArticle(root, slug, [
        ...validFrontmatter().filter((line) => !line.startsWith('category:')),
        `category: ${yamlValue}`,
      ]);
    }

    const result = runValidator(root);

    assert.equal(result.status, 1);
    for (const [slug] of cases) {
      assert.match(
        result.stderr,
        new RegExp(`${slug}\\.md: pole "category" je neplatné`),
      );
    }
  },
);

test(
  'volitelná pole odmítnou hodnoty nesprávného YAML typu',
  (t) => {
    const root = createFixture(t);
    writeArticle(root, 'spatne-volitelne-typy', [
      ...validFrontmatter(),
      'video: false',
      'videoLength: 90',
      'image: null',
      'featured: "false"',
      'zprava: 0',
      'evergreen: []',
      'draft: "no"',
    ]);

    const result = runValidator(root);

    assert.equal(result.status, 1);
    for (const field of [
      'video',
      'videoLength',
      'image',
      'featured',
      'zprava',
      'evergreen',
      'draft',
    ]) {
      assert.match(
        result.stderr,
        new RegExp(`spatne-volitelne-typy\\.md: pole "${field}" je neplatné`),
      );
    }
  },
);

test(
  'kalendářně neplatná data ani nedatové YAML skaláry se nesmějí zkoercovat',
  (t) => {
    const root = createFixture(t);
    writeArticle(
      root,
      'neprestupny-unor',
      [
        ...validFrontmatter().filter((line) => !line.startsWith('date:')),
        'date: 2025-02-29',
      ],
    );
    writeArticle(root, 'pretekl-updated', [
      ...validFrontmatter(),
      'updated: 2025-04-31',
    ]);
    writeArticle(root, 'boolean-misto-data', [
      ...validFrontmatter().filter((line) => !line.startsWith('date:')),
      'date: true',
    ]);
    writeArticle(root, 'null-misto-updated', [
      ...validFrontmatter(),
      'updated: null',
    ]);

    const result = runValidator(root);

    assert.equal(result.status, 1);
    for (const [slug, field, value] of [
      ['neprestupny-unor', 'date', '2025-02-29'],
      ['pretekl-updated', 'updated', '2025-04-31'],
    ]) {
      assert.match(
        result.stderr,
        new RegExp(
          `${slug}\\.md: pole "${field}" není platné kalendářní datum: ${value}`,
        ),
      );
    }
    for (const [slug, field] of [
      ['boolean-misto-data', 'date'],
      ['null-misto-updated', 'updated'],
    ]) {
      assert.match(
        result.stderr,
        new RegExp(`${slug}\\.md: pole "${field}" je neplatné`),
      );
    }
  },
);

test(
  'překlep v názvu volitelného pole se nesmí tiše zahodit',
  (t) => {
    const root = createFixture(t);
    writeArticle(root, 'preklep-volitelneho-pole', [
      ...validFrontmatter(),
      'feature: true',
      'video-length: "PT1M30S"',
    ]);

    const result = runValidator(root);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /preklep-volitelneho-pole\.md/);
  },
);

test('syntakticky chybné YAML označí chybu ve frontmatter', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'chybne-yaml', [
    'title: "Neuzavřený řetězec',
    'description: "Popis článku."',
    'category: "AI Report"',
    'date: "2026-01-15"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /chybne-yaml\.md/);
  assert.match(result.stderr, /pole "frontmatter"/);
});

test('category odmítne chybnou velikost písmen i okrajovou mezeru', (t) => {
  const root = createFixture(t);
  writeArticle(
    root,
    'category-mala-pismena',
    validFrontmatter({ category: 'ai report' }),
  );
  writeArticle(
    root,
    'category-okrajova-mezera',
    validFrontmatter({ category: 'AI Report ' }),
  );

  const result = runValidator(root);

  assert.equal(result.status, 1);
  for (const slug of ['category-mala-pismena', 'category-okrajova-mezera']) {
    assert.match(result.stderr, new RegExp(`${slug}\\.md: pole "category"`));
  }
});

test('ne-boolean YAML hodnoty odmítne na konkrétních polích', (t) => {
  const root = createFixture(t);
  const booleanFields = ['featured', 'draft', 'zprava', 'evergreen'];

  for (const field of booleanFields) {
    writeArticle(root, `ne-boolean-${field}`, [
      ...validFrontmatter(),
      `${field}: "false"`,
    ]);
  }

  const result = runValidator(root);

  assert.equal(result.status, 1);
  for (const field of booleanFields) {
    assert.match(
      result.stderr,
      new RegExp(`ne-boolean-${field}\\.md: pole "${field}"`),
    );
  }
});

test('neplatná video URL označí chybu v poli video', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'neplatne-video', [
    ...validFrontmatter(),
    'video: "neni-platna-url"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /neplatne-video\.md: pole "video"/);
});
