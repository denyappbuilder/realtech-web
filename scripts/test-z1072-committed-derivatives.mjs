import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const REQUIRED = [
  'public/images/clanky/claude-vodoznak-ai-text-640.jpg',
  'public/images/clanky/claude-vodoznak-ai-text-640.webp',
  'public/images/clanky/claude-vodoznak-ai-text.webp',
  'public/images/clanky/glm-5-3-kybernalezy-640.jpg',
  'public/images/clanky/glm-5-3-kybernalezy-640.webp',
  'public/images/og/claude-vodoznak-ai-text.jpg',
  'public/images/og/claude-vodoznak-ai-text.jpg.sha256',
  'public/images/og/glm-5-3-kybernalezy.jpg',
  'public/images/og/glm-5-3-kybernalezy.jpg.sha256',
];

function trackedImages() {
  const out = execFileSync('git', ['ls-files', '--', 'public/images'], {
    cwd: root,
    encoding: 'utf8',
  });
  return new Set(out.split('\n').filter(Boolean));
}

function porcelainImages() {
  return execFileSync('git', ['status', '--porcelain', '--', 'public/images'], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('Z1072: devět derivátů je v gitu a prebuild nenechá public/images špinavé', () => {
  const tracked = trackedImages();
  for (const file of REQUIRED) {
    assert.ok(fs.existsSync(path.join(root, file)), `chybí soubor ${file}`);
    assert.ok(tracked.has(file), `není v gitu: ${file}`);
  }

  execFileSync(process.execPath, ['scripts/optimize-images.mjs'], { cwd: root });
  execFileSync(process.execPath, ['scripts/generate-og.mjs'], { cwd: root });

  assert.equal(
    porcelainImages(),
    '',
    'po prebuildu musí být git status --porcelain public/images prázdný',
  );
});
