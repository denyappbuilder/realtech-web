import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

import { seoTitulek } from '../src/lib/seo-titulek.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_DIR = path.join(ROOT, 'src/content/clanky');

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? markdownFiles(entryPath)
      : entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

function frontmatter(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(match, `${path.relative(ROOT, file)} nemá platný frontmatter`);
  return yaml.load(match[1]);
}

test('<title> článku bez seoTitle nese celý redakční titulek bez výpustky', () => {
  for (const file of markdownFiles(CONTENT_DIR)) {
    const data = frontmatter(file);
    const title = data.seoTitle ?? seoTitulek(data.title, { zachovatCely: true });
    if (data.seoTitle === undefined) {
      assert.equal(
        title,
        data.title.trim(),
        `${path.relative(ROOT, file)}: <title> se liší od plného titulku`,
      );
    }
    assert.ok(
      !title.endsWith('…'),
      `${path.relative(ROOT, file)} má odseknutý SEO titulek: ${title}`,
    );
  }
});

test('ruční seoTitle zůstává krátký — jinak nemá důvod existovat', () => {
  for (const file of markdownFiles(CONTENT_DIR)) {
    const { seoTitle } = frontmatter(file);
    if (seoTitle === undefined) continue;
    assert.ok(
      [...seoTitle].length <= 60,
      `${path.relative(ROOT, file)} má seoTitle dlouhý ${[...seoTitle].length} znaků: ${seoTitle}`,
    );
  }
});

test('ruční SEO titulky zachovají hlavní hledané entity', () => {
  const expected = new Map([
    ['anthropic-fable-mythos.md', ['Claude Mythos 5', 'Anthropicu']],
    ['claude-voice-mode-opus-sonnet.md', ['Claude Voice Mode', 'Gmail', 'Slack', 'Opus', 'Sonnet']],
    ['fable-5-je-zpatky.md', ['Claude Fable 5']],
    ['google-vids-avatary.md', ['Google Vids', 'Gemini Omni']],
    ['notebooklm-gemini-notebook.md', ['NotebookLM', 'Gemini Notebook']],
  ]);

  for (const [name, entities] of expected) {
    const { seoTitle } = frontmatter(path.join(CONTENT_DIR, name));
    assert.equal(typeof seoTitle, 'string', `${name} nemá seoTitle`);
    for (const entity of entities) {
      assert.ok(seoTitle.includes(entity), `${name}: v seoTitle chybí ${entity}`);
    }
  }
});

test('šablona článku používá seoTitle s fallbackem na celý titulek', () => {
  const source = fs.readFileSync(path.join(ROOT, 'src/pages/clanky/[...id].astro'), 'utf8');
  assert.match(source, /title=\{seoTitle \?\? seoTitulek\(title, \{ zachovatCely: true \}\)\}/);
});
