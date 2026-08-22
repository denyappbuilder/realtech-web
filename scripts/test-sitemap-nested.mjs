import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import './test-sitemap-nested-register.mjs';

const { getSitemapOptions, resetSitemapOptions } = await import(
  './test-sitemap-nested-mocks/state.mjs'
);

let fixtureNumber = 0;

function markdown({ date, draft = false, category = 'AI Report' }) {
  const lines = [
    '---',
    `date: "${date}"`,
    `category: "${category}"`,
  ];
  if (draft) lines.push('draft: true');
  lines.push('---', '', 'Test body.', '');
  return lines.join('\n');
}

async function loadSitemapOptions(files) {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'realtech-sitemap-nested-'),
  );
  const articlesRoot = path.join(fixtureRoot, 'src', 'content', 'clanky');
  const originalCwd = process.cwd();

  try {
    for (const [relativePath, contents] of Object.entries(files)) {
      const target = path.join(articlesRoot, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents, 'utf8');
    }

    resetSitemapOptions();
    fixtureNumber += 1;
    process.chdir(fixtureRoot);
    await import(`../astro.config.mjs?sitemap-nested-test=${fixtureNumber}`);
    return getSitemapOptions();
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function serialize(options, url) {
  return options.serialize({ url });
}

test('plochý článek získá lastmod ze skutečného souboru', async () => {
  const options = await loadSitemapOptions({
    'plochy.md': markdown({ date: '2026-02-03' }),
  });

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/plochy/').lastmod,
    '2026-02-03T00:00:00.000Z',
  );
});

test('vnořený článek získá lastmod ze zdrojového souboru', async () => {
  const options = await loadSitemapOptions({
    'pruvodci/vnoreny.md': markdown({ date: '2026-04-05' }),
  });

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/pruvodci/vnoreny/').lastmod,
    '2026-04-05T00:00:00.000Z',
  );
});

test('vnořený draft neposune lastmod ani nedostane vlastní datum', async () => {
  const options = await loadSitemapOptions({
    'plochy.md': markdown({ date: '2026-02-03' }),
    'pruvodci/vnoreny.md': markdown({ date: '2026-04-05', draft: true }),
  });

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/plochy/').lastmod,
    '2026-02-03T00:00:00.000Z',
  );
  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/pruvodci/vnoreny/').lastmod,
    '2026-02-03T00:00:00.000Z',
    'draft nesmí mít vlastní lastmod z date',
  );
  assert.equal(
    serialize(options, 'https://realtech.cz/').lastmod,
    '2026-02-03T00:00:00.000Z',
  );
});
