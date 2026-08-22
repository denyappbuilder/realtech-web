import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articleDir = path.join(root, 'src/content/clanky');
const audioDir = path.join(root, 'public/audio/clanky');
const slugs = [
  'anthropic-risk-report-misalignment',
  'chatgpt-pro-teenagery',
  'chatgpt-reklamy-nove-trhy',
  'claude-vodoznak-ai-text',
  'gemini-plus-rok-zdarma-studenti',
  'glm-5-3-kybernalezy',
  'meta-australie-zakaz-do-16-let',
  'openai-pauza-rl-treninku-astra',
  'pixel-watch-detekce-dechu',
  'starship-ship-40-vanocni-ostrov',
];

function frontmatter(slug) {
  const source = fs.readFileSync(path.join(articleDir, `${slug}.md`), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, `${slug}: chybí čitelný frontmatter`);
  return load(match[1]);
}

test('posledních deset článků má publikovatelný audio přehled v R2', () => {
  for (const slug of slugs) {
    const data = frontmatter(slug);
    assert.match(
      data.audio?.url ?? '',
      new RegExp(`^https://audio\\.realtech\\.cz/${slug}-v3\\.mp3\\?v=[0-9a-f]{12}$`),
      `${slug}: URL musí mířit na verzované MP3 v R2`,
    );
    assert.ok(
      Number.isInteger(data.audio?.duration) && data.audio.duration >= 120 && data.audio.duration <= 180,
      `${slug}: délka má být reálných 2–3 minuty`,
    );
    assert.ok(data.audio?.transcript?.length > 500, `${slug}: chybí plný přepis`);
    assert.match(data.audio.transcript, /Zdroj informací:/, `${slug}: přepis musí uvést zdroj`);
  }
});

test('repo už neobsahuje binární MP3 pilotu', () => {
  const files = fs.existsSync(audioDir)
    ? fs.readdirSync(audioDir).filter((name) => name.endsWith('.mp3')).sort()
    : [];
  assert.deepEqual(files, []);
});
