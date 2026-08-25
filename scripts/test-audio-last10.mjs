import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { AUDIO_PENDING } from './audio-pending.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articleDir = path.join(root, 'src/content/clanky');
const audioDir = path.join(root, 'public/audio/clanky');

const slugs = fs
  .readdirSync(articleDir)
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -3))
  .sort();

function frontmatter(slug) {
  const source = fs.readFileSync(path.join(articleDir, `${slug}.md`), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, `${slug}: chybí čitelný frontmatter`);
  return load(match[1]);
}

const VERZE_HASH = String.raw`\?v=[0-9a-f]{12}`;

function audioUrl(slug, vydani) {
  return new RegExp(`^https://audio\\.realtech\\.cz/${slug}-${vydani}\\.mp3${VERZE_HASH}$`);
}

test('každý článek má publikovatelný audio přehled v R2', () => {
  assert.ok(slugs.length >= 72, 'čekáme aspoň 72 článků');
  for (const slug of slugs) {
    if (AUDIO_PENDING.has(slug)) continue;
    const data = frontmatter(slug);
    const url = data.audio?.url ?? '';
    const duration = data.audio?.duration;
    const nlm = audioUrl(slug, 'nlm').test(url);

    if (nlm) {
      assert.ok(
        Number.isInteger(duration) && duration >= 600 && duration <= 3600,
        `${slug}: NLM Deep Dive má mít 10–60 minut v celých sekundách`,
      );
      continue;
    }

    assert.match(
      url,
      audioUrl(slug, 'v3'),
      `${slug}: URL musí mířit na verzované MP3 v R2`,
    );
    assert.ok(
      Number.isInteger(duration) && duration >= 60 && duration <= 300,
      `${slug}: délka má být reálných 1–5 minut v celých sekundách`,
    );
    assert.ok(data.audio?.transcript?.length > 500, `${slug}: chybí plný přepis`);
    assert.match(data.audio.transcript, /Zdroj/, `${slug}: přepis musí uvést zdroj`);
  }
});

test('repo už neobsahuje binární MP3 pilotu', () => {
  const files = fs.existsSync(audioDir)
    ? fs.readdirSync(audioDir).filter((name) => name.endsWith('.mp3')).sort()
    : [];
  assert.deepEqual(files, []);
});

test('CSP dovolí přehrávání jen z vlastního webu a audio.realtech.cz', () => {
  const headers = fs.readFileSync(path.join(root, 'public/_headers'), 'utf8');
  assert.match(
    headers,
    /Content-Security-Policy:[^\n]*media-src 'self' https:\/\/audio\.realtech\.cz;/,
  );
  assert.doesNotMatch(headers, /media-src[^;]*\*/);
});
