// Z10065: vztah `updated` a `date` musí být vidět z validátoru.
// Dnes projde článek s updated před date i s lastmod v roce 2099 —
// structured data i sitemap jdou ven zeleně.
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
const FIXTURE_PREFIX = path.join(tmpdir(), 'realtech-clanek-updated-');

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

function writeArticle(root, slug, extraLines) {
  const articlePath = path.join(root, 'src/content/clanky', `${slug}.md`);
  const frontmatter = [
    'title: "Fixture updated"',
    'description: "Vztah updated a date."',
    'category: "AI Report"',
    ...extraLines,
  ];
  writeFileSync(
    articlePath,
    `---\n${frontmatter.join('\n')}\n---\n\nTělo.\n`,
  );
  return articlePath;
}

function runValidator(root) {
  const result = spawnSync(process.execPath, [VALIDATOR], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.error, undefined);
  return result;
}

test('Z10065: updated před date ukončí validaci chybou', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'zz-a', [
    'date: "2026-01-15"',
    'updated: "2025-01-01"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(
    result.stderr,
    /zz-a\.md: pole "updated" \(2025-01-01\) nesmí předcházet poli "date" \(2026-01-15\)/,
  );
  assert.doesNotMatch(result.stdout, /článků OK/);
});

test('Z10065: updated v budoucnosti ukončí validaci chybou', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'zz-b', [
    'date: "2026-01-15"',
    'updated: "2099-12-31"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(
    result.stderr,
    /zz-b: updated 2099-12-31 je v budoucnosti/,
  );
  assert.doesNotMatch(result.stdout, /článků OK/);
});

test('Z10065: updated po date v minulosti projde', (t) => {
  const root = createFixture(t);
  writeArticle(root, 'zz-ok', [
    'date: "2026-01-15"',
    'updated: "2026-02-01"',
  ]);

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\[validate-content\] 1 článků OK/);
  assert.doesNotMatch(result.stderr, /updated/);
});
