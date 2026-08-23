import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { load as parseYaml } from 'js-yaml';
import ts from 'typescript';
import { z } from 'astro/zod';
import { parseCalendarDate } from '../src/lib/calendarDate.js';
import { jeAudioUrl, parseAudioDuration } from '../src/lib/audio-prehled.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const CLANKY_DIR = path.join(REPOSITORY_ROOT, 'src/content/clanky');

function loadProductionArticleSchema() {
  const configPath = path.join(REPOSITORY_ROOT, 'src/content.config.ts');
  const { outputText } = ts.transpileModule(readFileSync(configPath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: configPath,
  });
  const configModule = { exports: {} };

  vm.runInNewContext(
    outputText,
    {
      exports: configModule.exports,
      module: configModule,
      require(specifier) {
        if (specifier === 'astro:content') {
          return { defineCollection: (config) => config, z };
        }
        if (specifier === 'astro/loaders') {
          return { glob: (options) => options };
        }
        if (specifier === './lib/calendarDate.js') {
          return { parseCalendarDate };
        }
        if (specifier === './lib/audio-prehled.js') {
          return { jeAudioUrl, parseAudioDuration };
        }
        throw new Error(`Neocekavany import z content.config.ts: ${specifier}`);
      },
    },
    { filename: configPath },
  );

  const schema = configModule.exports.collections?.clanky?.schema;
  assert.equal(typeof schema?.safeParse, 'function');
  return schema;
}

function frontmatterOf(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, 'clanek musi mit yaml frontmatter');
  return match[1];
}

function parseArticleFrontmatter(raw) {
  // Výchozí js-yaml — stejný parser jako Astro. CORE_SCHEMA by vadu #197
  // neschytil, protože nequoted YYYY-MM-DD nechá stringem.
  return parseYaml(frontmatterOf(raw));
}

export function zkontrolujClankyProtiProdukcimuSchematu(clankyDir = CLANKY_DIR) {
  const articleSchema = loadProductionArticleSchema();
  const files = readdirSync(clankyDir).filter((name) => name.endsWith('.md'));
  assert.ok(files.length > 0, 've src/content/clanky musi byt alespon jeden clanek');

  const failures = [];
  for (const file of files) {
    const raw = readFileSync(path.join(clankyDir, file), 'utf8');
    const frontmatter = parseArticleFrontmatter(raw);
    const result = articleSchema.safeParse(frontmatter);
    if (!result.success) {
      failures.push(
        `${file}: ${result.error.issues.map((issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`).join('; ')}`,
      );
    }
  }
  return { files, failures };
}

test('Z10054: skutecne clanky projdou produkcnim schematem stejne jako astro build', () => {
  const { files, failures } = zkontrolujClankyProtiProdukcimuSchematu();
  assert.ok(files.length >= 66, `ocekavam aspon 66 clanku, mam ${files.length}`);
  assert.deepEqual(failures, []);
});
