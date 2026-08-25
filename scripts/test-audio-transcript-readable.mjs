import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { AUDIO_PENDING } from './audio-pending.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLE_DIR = path.join(ROOT, 'src/content/clanky');

const SLUGS = fs
  .readdirSync(ARTICLE_DIR)
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -3))
  .sort();

function article(slug) {
  const source = fs.readFileSync(path.join(ARTICLE_DIR, `${slug}.md`), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, `${slug}: chybí čitelný frontmatter`);
  return { data: load(match[1]), body: match[2] };
}

test('všechny články oddělují čitelný transcript od TTS skriptu', () => {
  assert.ok(SLUGS.length >= 72, 'čekáme aspoň 72 článků');

  for (const slug of SLUGS) {
    if (AUDIO_PENDING.has(slug)) continue;
    const { data } = article(slug);
    if (/-nlm\.mp3(?:\?|$)/.test(data.audio?.url ?? '')) continue;
    assert.ok(data.audio?.transcript?.length > 500, `${slug}: chybí veřejný transcript`);
    assert.ok(data.audio?.ttsScript?.length > 500, `${slug}: chybí zdroj pro regeneraci TTS`);
    assert.doesNotMatch(
      data.audio.transcript,
      /^(Ada|Petr):/m,
      `${slug}: jmenovky mluvčích unikly do veřejného transcriptu`,
    );
    assert.match(data.audio.ttsScript, /^Ada:/, `${slug}: ttsScript má začínat replikou Ady`);
    assert.match(data.audio.ttsScript, /^Petr:/m, `${slug}: ttsScript má být dialog Ada/Petr`);
    assert.match(data.audio.transcript, /Zdroj/, `${slug}: veřejný transcript musí uvést zdroj`);
  }
});
