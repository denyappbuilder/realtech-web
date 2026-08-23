import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

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

test('každý článek má publikovatelný audio přehled v R2', () => {
  assert.ok(slugs.length >= 72, 'čekáme aspoň 72 článků');
  for (const slug of slugs) {
    const data = frontmatter(slug);
    assert.match(
      data.audio?.url ?? '',
      new RegExp(`^https://audio\\.realtech\\.cz/${slug}-v3\\.mp3\\?v=[0-9a-f]{12}$`),
      `${slug}: URL musí mířit na verzované MP3 v R2`,
    );
    assert.ok(
      Number.isInteger(data.audio?.duration) && data.audio.duration >= 60 && data.audio.duration <= 300,
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
