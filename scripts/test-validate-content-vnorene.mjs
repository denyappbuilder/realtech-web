import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
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
const FIXTURE_PREFIX = path.join(tmpdir(), 'realtech-validate-content-vnorene-');
const REGRESSION = '[codex-testy-web/VALIDATE-NESTED-001]';

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

function writeArticle(
  root,
  relativeSlug,
  extraFrontmatter = [],
  body = 'Text článku.',
) {
  const articlePath = path.join(
    root,
    'src/content/clanky',
    `${relativeSlug}.md`,
  );
  mkdirSync(path.dirname(articlePath), { recursive: true });
  writeFileSync(
    articlePath,
    [
      '---',
      `title: "Testovací článek ${relativeSlug}"`,
      'description: "Izolovaná fixture produkčního validátoru."',
      'category: "AI Report"',
      'date: "2020-01-15"',
      ...extraFrontmatter,
      '---',
      '',
      body,
      '',
    ].join('\n'),
  );
}

function runValidator(root) {
  const result = spawnSync(process.execPath, [VALIDATOR], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.error, undefined);
  return result;
}

test('baseline: produkční validator zachytí obě vady v přímém článku', (t) => {
  const root = createFixture(t);
  writeArticle(
    root,
    'primy',
    ['image: "/images/clanky/neexistujici.jpg"'],
    'Odkaz na [neexistující článek](/clanky/neexistujici/).',
  );

  const result = runValidator(root);

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /primy: image "\/images\/clanky\/neexistujici\.jpg" neexistuje/,
  );
  assert.match(
    result.stderr,
    /primy: odkaz na neexistující článek \/clanky\/neexistujici\//,
  );
  assert.doesNotMatch(result.stdout, /článků OK/);
});

test.todo(
  `${REGRESSION} vnořený článek s chybějícím image nesmí být přeskočen`,
  (t) => {
    const root = createFixture(t);
    writeArticle(root, 'baseline');
    writeArticle(root, 'archiv/vnoreny-bez-image', [
      'image: "/images/clanky/neexistujici.jpg"',
    ]);

    const result = runValidator(root);

    assert.equal(result.status, 1, [result.stdout, result.stderr].join('\n'));
    assert.match(
      result.stderr,
      /vnoreny-bez-image: image "\/images\/clanky\/neexistujici\.jpg" neexistuje/,
    );
    assert.doesNotMatch(result.stdout, /článků OK/);
  },
);

test.todo(
  `${REGRESSION} neplatný interní odkaz ve vnořeném článku nesmí být přeskočen`,
  (t) => {
    const root = createFixture(t);
    writeArticle(root, 'baseline');
    writeArticle(
      root,
      'archiv/vnoreny-odkaz',
      [],
      'Odkaz na [neexistující článek](/clanky/neexistujici/).',
    );

    const result = runValidator(root);

    assert.equal(result.status, 1, [result.stdout, result.stderr].join('\n'));
    assert.match(
      result.stderr,
      /vnoreny-odkaz: odkaz na neexistující článek \/clanky\/neexistujici\//,
    );
    assert.doesNotMatch(result.stdout, /článků OK/);
  },
);
