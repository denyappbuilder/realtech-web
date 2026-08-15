import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { parse } from '@astrojs/compiler';
import ts from 'typescript';

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const ARTICLE_PAGE = path.join(
  REPOSITORY_ROOT,
  'src/pages/clanky/[...id].astro',
);
const VIDEO_ID = 'dQw4w9WgXcQ';
const SITE = new URL('https://realtech.example/');

function findElement(node, name) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === 'element' && node.name === name) return node;

  for (const value of Object.values(node)) {
    if (!Array.isArray(value)) continue;
    for (const child of value) {
      const found = findElement(child, name);
      if (found) return found;
    }
  }
  return undefined;
}

function declaredIdentifier(statement) {
  if (!ts.isVariableStatement(statement)) return undefined;
  const [declaration] = statement.declarationList.declarations;
  if (
    statement.declarationList.declarations.length !== 1
    || !ts.isIdentifier(declaration.name)
  ) {
    return undefined;
  }
  return declaration.name.text;
}

async function loadProductionHarness() {
  const astroSource = readFileSync(ARTICLE_PAGE, 'utf8');
  const parsed = await parse(astroSource, { position: true });
  assert.deepEqual(parsed.diagnostics, []);

  const frontmatter = parsed.ast.children.find(
    (node) => node.type === 'frontmatter',
  );
  assert.ok(frontmatter, 'Stranka musi mit Astro frontmatter');

  const sourceFile = ts.createSourceFile(
    ARTICLE_PAGE,
    frontmatter.value,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );
  const requiredDeclarations = [
    'videoId',
    'brandedOg',
    'ogImage',
    'isoDuration',
    'videoLd',
  ];
  const statements = new Map(
    sourceFile.statements
      .map((statement) => [declaredIdentifier(statement), statement])
      .filter(([name]) => name !== undefined),
  );
  for (const name of requiredDeclarations) {
    assert.ok(statements.has(name), `Ve frontmatteru chybi deklarace ${name}`);
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const instrumentedTypescript = [
    ...requiredDeclarations.map((name) =>
      printer.printNode(ts.EmitHint.Unspecified, statements.get(name), sourceFile)),
    'globalThis.__result = { videoId, ogImage, videoLd };',
  ].join('\n');
  const { outputText } = ts.transpileModule(instrumentedTypescript, {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: ARTICLE_PAGE,
  });

  const iframe = findElement(parsed.ast, 'iframe');
  assert.ok(iframe, 'Stranka musi mit iframe pro video');
  const iframeSrc = iframe.attributes.find(
    (attribute) => attribute.name === 'src' && attribute.kind === 'expression',
  );
  assert.ok(iframeSrc, 'Video iframe musi mit dynamicky src atribut');

  return function evaluate(video) {
    const context = {
      Astro: { site: SITE },
      URL,
      article: { id: 'testovaci-clanek' },
      date: new Date('2026-01-15T12:00:00.000Z'),
      description: 'Deterministicky test YouTube URL.',
      fs: { existsSync: () => false },
      image: '/fallback.jpg',
      title: 'Testovaci video',
      video,
      videoLength: '9:04',
    };
    vm.runInNewContext(outputText, context, { filename: ARTICLE_PAGE });

    const result = context.__result;
    return {
      videoId: result.videoId,
      iframeUrl: result.videoId
        ? vm.runInNewContext(iframeSrc.value, { videoId: result.videoId })
        : undefined,
      ogImage: result.ogImage,
      videoLd: result.videoLd
        ? JSON.parse(JSON.stringify(result.videoLd))
        : result.videoLd,
    };
  };
}

const evaluateVideo = await loadProductionHarness();

function assertVideoConsumers(actual, expectedId, label) {
  assert.equal(actual.videoId, expectedId, `${label}: videoId`);
  assert.equal(
    actual.iframeUrl,
    `https://www.youtube-nocookie.com/embed/${expectedId}`,
    `${label}: iframe`,
  );
  assert.equal(
    actual.ogImage,
    `https://i.ytimg.com/vi/${expectedId}/maxresdefault.jpg`,
    `${label}: OG obrazek`,
  );
  assert.deepEqual(
    {
      thumbnailUrl: actual.videoLd?.thumbnailUrl,
      contentUrl: actual.videoLd?.contentUrl,
      embedUrl: actual.videoLd?.embedUrl,
    },
    {
      thumbnailUrl: [`https://i.ytimg.com/vi/${expectedId}/maxresdefault.jpg`],
      contentUrl: `https://www.youtube.com/watch?v=${expectedId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${expectedId}`,
    },
    `${label}: VideoObject`,
  );
}

function rejectedProjection(video) {
  const result = evaluateVideo(video);
  return {
    videoId: result.videoId,
    iframeUrl: result.iframeUrl,
    ogImage: result.ogImage,
    videoLd: result.videoLd,
  };
}

const REJECTED_RESULT = {
  videoId: undefined,
  iframeUrl: undefined,
  ogImage: 'https://realtech.example/fallback.jpg',
  videoLd: undefined,
};

test('watch, youtu.be, shorts a embed URL propisuji stejne ID do vsech konzumentu', () => {
  const validUrls = [
    ['watch', `https://www.youtube.com/watch?v=${VIDEO_ID}`],
    ['watch s dalsimi parametry', `https://youtube.com/watch?feature=share&v=${VIDEO_ID}&t=42`],
    ['youtu.be', `https://youtu.be/${VIDEO_ID}?si=abc123&t=5`],
    ['shorts', `https://www.youtube.com/shorts/${VIDEO_ID}?feature=share`],
    ['embed', `https://www.youtube.com/embed/${VIDEO_ID}?start=9`],
  ];

  for (const [label, url] of validUrls) {
    assertVideoConsumers(evaluateVideo(url), VIDEO_ID, label);
  }
});

test('chybejici, kratke a syntakticky neplatne ID nevytvori video vystupy', () => {
  const rejectedUrls = [
    undefined,
    'https://www.youtube.com/watch?feature=share',
    'https://www.youtube.com/watch?v=abc123_-XY',
    'https://youtu.be/abc123_-XY',
    'https://www.youtube.com/shorts/abc.123_XYZ',
    'https://www.youtube.com/video/dQw4w9WgXcQ',
  ];

  for (const url of rejectedUrls) {
    assert.deepEqual(rejectedProjection(url), REJECTED_RESULT, String(url));
  }
});

test.todo(
  '[codex-testy-web/YOUTUBE-URL-001] parser musi odmitnout dlouhe ID a YouTube vzory mimo povoleny hostname nebo parametr',
  () => {
    const falseMatches = {
      'ID delsi nez 11 znaku': `https://www.youtube.com/watch?v=${VIDEO_ID}X`,
      'v= na cizim hostu': `https://example.com/watch?v=${VIDEO_ID}`,
      'youtu.be v ceste ciziho hostu': `https://example.com/youtu.be/${VIDEO_ID}`,
      'embed v ceste ciziho hostu': `https://example.com/embed/${VIDEO_ID}`,
      'hostname pouze konci na youtu.be': `https://not-youtu.be/${VIDEO_ID}`,
      'v= je soucast jineho parametru': `https://www.youtube.com/watch?notv=${VIDEO_ID}`,
    };

    assert.deepEqual(
      Object.fromEntries(
        Object.entries(falseMatches).map(([label, url]) => [
          label,
          rejectedProjection(url),
        ]),
      ),
      Object.fromEntries(
        Object.keys(falseMatches).map((label) => [label, REJECTED_RESULT]),
      ),
    );
  },
);
