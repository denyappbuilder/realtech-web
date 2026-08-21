import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-og.mjs', import.meta.url));
const sharpLoader = fileURLToPath(
  new URL('./test-generate-og-frontmatter-loader.mjs', import.meta.url),
);

function createFixture(t, frontmatter) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'realtech-og-frontmatter-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'src/content/clanky/clanek.md'),
    `---\n${frontmatter.join('\n')}\n---\n\nObsah článku.\n`,
  );
  fs.writeFileSync(path.join(root, 'public/images/cover.jpg'), 'fixture-cover\n');

  return root;
}

function runGenerator(root) {
  return execFileSync(
    process.execPath,
    ['--no-warnings', '--experimental-loader', sharpLoader, generator],
    { cwd: root, encoding: 'utf8' },
  );
}

function generatedImage(root) {
  return path.join(root, 'public/images/og/clanek.jpg');
}

test('standardní frontmatter vytvoří OG bez skutečného obrazového renderu', (t) => {
  const root = createFixture(t, [
    'title: "Běžný článek"',
    'description: "Standardní popis"',
    'image: "/images/cover.jpg"',
  ]);

  assert.match(runGenerator(root), /\[generate-og\] vygenerováno: 1/);
  assert.equal(fs.readFileSync(generatedImage(root), 'utf8'), 'mock-sharp-output\n');
});

test(
  '`---` v quoted YAML hodnotě před image nesmí zabránit vytvoření OG',
  {
    todo: '[codex-testy-web/OG-FRONTMATTER-001] produkční parser ukončí frontmatter uvnitř quoted hodnoty',
  },
  (t) => {
    const root = createFixture(t, [
      'title: "Rozbor grafických karet"',
      'description: "Rozbor --- díl první"',
      'image: "/images/cover.jpg"',
    ]);

    assert.match(runGenerator(root), /\[generate-og\] vygenerováno: 1/);
    assert.equal(fs.readFileSync(generatedImage(root), 'utf8'), 'mock-sharp-output\n');
  },
);
