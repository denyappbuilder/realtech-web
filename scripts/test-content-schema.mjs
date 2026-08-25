import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { CORE_SCHEMA, load as parseYaml } from 'js-yaml';
import ts from 'typescript';
import { z } from 'astro/zod';
import { parseCalendarDate } from '../src/lib/calendarDate.js';
import { jeAudioUrl, parseAudioDuration } from '../src/lib/audio-prehled.js';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

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

const articleSchema = loadProductionArticleSchema();
const REQUIRED_FRONTMATTER = {
  title: 'Schema kontrakt',
  description: 'Deterministicky test produkcniho schematu.',
  category: 'AI Report',
  date: '2026-01-15',
};

test('category ma presne produkcni enum bez volnejsich variant', () => {
  const expectedCategories = [
    'AI Report',
    'AI Agenti',
    'Drony',
    'Vesmír',
    'Hardware',
    'Mobily',
    'Sítě',
  ];

  assert.deepEqual(
    Array.from(articleSchema.shape.category.options),
    expectedCategories,
  );

  for (const category of expectedCategories) {
    assert.equal(
      articleSchema.safeParse({ ...REQUIRED_FRONTMATTER, category }).success,
      true,
      category,
    );
  }
  for (const category of ['ai report', 'AI Report ', 'Site', 'Software']) {
    assert.equal(
      articleSchema.safeParse({ ...REQUIRED_FRONTMATTER, category }).success,
      false,
      category,
    );
  }
});

test('schema odmita nezname pole a doplni vsechny boolean defaulty', () => {
  const parsed = articleSchema.parse(REQUIRED_FRONTMATTER);

  assert.deepEqual(
    {
      featured: parsed.featured,
      zprava: parsed.zprava,
      evergreen: parsed.evergreen,
      draft: parsed.draft,
    },
    { featured: false, zprava: false, evergreen: false, draft: false },
  );

  const withUnknownField = articleSchema.safeParse({
    ...REQUIRED_FRONTMATTER,
    feature: true,
  });
  assert.equal(withUnknownField.success, false);
  assert.deepEqual(withUnknownField.error.issues[0], {
    code: 'unrecognized_keys',
    keys: ['feature'],
    path: [],
    message: "Unrecognized key(s) in object: 'feature'",
  });
});

test('quoted YYYY-MM-DD ma striktni meze a pro date i updated vraci UTC Date', () => {
  const parsed = articleSchema.parse({
    ...REQUIRED_FRONTMATTER,
    date: '0000-01-01',
    updated: '9999-12-31',
  });

  assert.equal(parsed.date.toISOString(), '0000-01-01T00:00:00.000Z');
  assert.equal(parsed.updated.toISOString(), '9999-12-31T00:00:00.000Z');

  for (const [field, value] of [
    ['date', '2025-02-29'],
    ['date', '10000-01-01'],
    ['updated', '1900-02-29'],
    ['updated', '2026-01-15T00:00:00Z'],
  ]) {
    assert.equal(
      articleSchema.safeParse({
        ...REQUIRED_FRONTMATTER,
        [field]: value,
      }).success,
      false,
      `${field}: ${value}`,
    );
  }
});

test('Date v date i updated se odmitne — z yaml timestampu puvodni den neni', () => {
  const date = new Date('2026-01-15T12:34:56.789Z');
  const updated = new Date('2026-01-16T23:59:59.999Z');

  assert.equal(
    articleSchema.safeParse({
      ...REQUIRED_FRONTMATTER,
      date,
      updated,
    }).success,
    false,
  );

  for (const field of ['date', 'updated']) {
    assert.equal(
      articleSchema.safeParse({
        ...REQUIRED_FRONTMATTER,
        [field]: new Date(Number.NaN),
      }).success,
      false,
      field,
    );
    assert.equal(
      articleSchema.safeParse({
        ...REQUIRED_FRONTMATTER,
        [field]: new Date('2025-03-01T00:00:00.000Z'),
      }).success,
      false,
      `${field}: rolled yaml Date`,
    );
  }
});

test('volitelny audio blok je zpetne kompatibilni a odmitne neplatnou URL i nulu', () => {
  const bezAudia = articleSchema.parse(REQUIRED_FRONTMATTER);
  assert.equal(bezAudia.audio, undefined);

  const sAudiem = articleSchema.parse({
    ...REQUIRED_FRONTMATTER,
    audio: {
      url: '/audio/clanky/schema.mp3',
      duration: 'PT2M5S',
      transcript: 'Krátký přehled.',
      ttsScript: 'Krátký přehled pro té-té-es.',
    },
  });
  assert.equal(sAudiem.audio.url, '/audio/clanky/schema.mp3');
  assert.equal(sAudiem.audio.duration, 'PT2M5S');
  assert.equal(sAudiem.audio.transcript, 'Krátký přehled.');
  assert.equal(sAudiem.audio.ttsScript, 'Krátký přehled pro té-té-es.');

  assert.equal(
    articleSchema.safeParse({
      ...REQUIRED_FRONTMATTER,
      audio: { url: 'javascript:alert(1)', duration: 120 },
    }).success,
    false,
  );
  assert.equal(
    articleSchema.safeParse({
      ...REQUIRED_FRONTMATTER,
      audio: { url: '/audio/clanky/schema.mp3', duration: 0 },
    }).success,
    false,
  );
  assert.equal(
    articleSchema.safeParse({
      ...REQUIRED_FRONTMATTER,
      audio: {
        url: '/audio/clanky/schema.mp3',
        duration: 120,
        voice: 'Sal',
      },
    }).success,
    false,
  );

  const nlm = articleSchema.parse({
    ...REQUIRED_FRONTMATTER,
    audio: {
      url: 'https://audio.realtech.cz/fixture-nlm.mp3?v=38ac2d883a92',
      duration: 2180,
    },
  });
  assert.equal(nlm.audio.url, 'https://audio.realtech.cz/fixture-nlm.mp3?v=38ac2d883a92');
  assert.equal(nlm.audio.duration, 2180);
  assert.equal(nlm.audio.transcript, undefined);
  assert.equal(nlm.audio.ttsScript, undefined);
});

test(
  'codex-testy-web/CONTENT-SCHEMA-001: produkcni schema ma odmitnout nequoted neplatny kalendarni den stejne jako pomocny validator',
  () => {
    const yaml = [
      'title: Schema kontrakt',
      'description: Neplatny den.',
      'category: AI Report',
      'date: 2025-02-29',
    ].join('\n');
    const validatorInput = parseYaml(yaml, { schema: CORE_SCHEMA });
    const productionInput = parseYaml(yaml);

    assert.equal(articleSchema.safeParse(validatorInput).success, false);
    assert.ok(productionInput.date instanceof Date);
    assert.equal(productionInput.date.toISOString(), '2025-03-01T00:00:00.000Z');
    assert.equal(articleSchema.safeParse(productionInput).success, false);
  },
);
