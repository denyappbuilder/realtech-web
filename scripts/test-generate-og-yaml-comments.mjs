import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('./generate-og.mjs', import.meta.url));
const register = fileURLToPath(new URL('./test-generate-og-yaml-comments-mocks/register.mjs', import.meta.url));

function createFixture(t, frontmatter) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'realtech-og-yaml-comment-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, 'src/content/clanky'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/content/clanky/clanek.md'), `---\n${frontmatter}\n---\n`);
  fs.writeFileSync(path.join(root, 'public/images/cover.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>\n');

  return root;
}

function runGenerator(root) {
  const stateFile = path.join(root, 'sharp-state.json');
  const stdout = execFileSync(process.execPath, ['--import', register, generator], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, GENERATE_OG_SHARP_STATE: stateFile },
  });

  return { stdout, ...JSON.parse(fs.readFileSync(stateFile, 'utf8')) };
}

function renderedTitle(svg) {
  return [...svg.matchAll(/font-size="50"[^>]*>(.*?)<\/text>/g)]
    .map((match) => match[1])
    .join(' ');
}

test(
  '[codex-testy-web/OG-YAML-COMMENT-001] nequoted title předá do SVG hodnotu bez inline YAML komentáře',
  { todo: 'Produkční regex zatím zahrnuje inline YAML komentář do title.' },
  (t) => {
    const root = createFixture(t, [
      'title: Skutečný titulek # interní poznámka',
      'image: /images/cover.svg',
    ].join('\n'));

    const { calls } = runGenerator(root);

    assert.equal(calls.length, 1);
    assert.equal(renderedTitle(calls[0].svg), 'Skutečný titulek');
  },
);

test(
  '[codex-testy-web/OG-YAML-COMMENT-002] nequoted image najde existující cover i s inline YAML komentářem',
  { todo: 'Produkční regex zatím zahrnuje inline YAML komentář do cesty image.' },
  (t) => {
    const root = createFixture(t, [
      'title: Skutečný titulek',
      'image: /images/cover.svg # existující cover',
    ].join('\n'));

    const { stdout, calls } = runGenerator(root);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].input, 'public/images/cover.svg');
    assert.match(stdout, /vygenerováno: 1/);
  },
);
