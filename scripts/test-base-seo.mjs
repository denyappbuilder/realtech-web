import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'src/layouts/Base.astro');
const SITE = 'https://realtech.cz/';

function extractFrontmatter(source, label) {
  const match = source.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${label} nemá očekávaný úvodní frontmatter.`);
  }
  return { script: match[1], template: source.slice(match[0].length) };
}

function parseTs(filename, source) {
  const ast = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );
  if (ast.parseDiagnostics.length > 0) {
    throw new Error(
      `${path.basename(filename)} nelze parsovat: ${ast.parseDiagnostics[0].messageText}`,
    );
  }
  return ast;
}

/** Spustí skutečný frontmatter Base.astro s řízenými props a příchozí URL. */
async function renderBaseSeo({ props, requestUrl }) {
  const source = fs.readFileSync(BASE, 'utf8');
  const { script, template } = extractFrontmatter(source, 'Base.astro');
  const ast = parseTs(BASE, script);
  const imports = ast.statements.filter(ts.isImportDeclaration);

  let executable = '';
  let cursor = 0;
  for (const statement of imports) {
    executable += script.slice(cursor, statement.getStart(ast));
    cursor = statement.end;
  }
  executable += script.slice(cursor);

  const { outputText } = ts.transpileModule(executable, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
    fileName: BASE,
  });

  const sandbox = {
    URL,
    Astro: {
      props,
      url: new URL(requestUrl),
      site: new URL(SITE),
    },
    getCollection: async () => [],
    slugify: (value) => value,
    popisProVyhledavace: (value) => value ?? '',
    SearchModal: {},
  };
  sandbox.globalThis = sandbox;

  const program = `
    (async () => {
      ${outputText}
      globalThis.__seo = {
        includeCanonical: typeof includeCanonical === 'undefined' ? undefined : includeCanonical,
        canonicalHref: typeof canonical === 'undefined' || canonical == null
          ? undefined
          : String(canonical),
        ogImageHref: typeof ogImage === 'undefined' || ogImage == null
          ? undefined
          : String(ogImage),
      };
    })()
  `;

  await vm.runInNewContext(program, sandbox, { filename: BASE });
  return { ...sandbox.__seo, template };
}

test('canonical používá Astro.site a pathname bez query/hash a og:url je totožné', async () => {
  const { includeCanonical, canonicalHref, template } = await renderBaseSeo({
    props: {
      title: 'SEO URL test',
      image: '/images/social/seo-hranice.jpg',
    },
    requestUrl: 'https://prichozi.example/clanky/seo-hranice/?utm_source=test#fragment',
  });

  assert.equal(includeCanonical, true);
  assert.equal(canonicalHref, 'https://realtech.cz/clanky/seo-hranice/');
  assert.match(
    template,
    /\{includeCanonical && <link rel="canonical" href=\{canonical\} \/>\}/,
  );
  assert.match(
    template,
    /\{includeCanonical && <meta property="og:url" content=\{canonical\} \/>\}/,
  );
});

test('kořenový image vstup převede na absolutní og:image vůči Astro.site', async () => {
  const { ogImageHref, template } = await renderBaseSeo({
    props: {
      title: 'SEO URL test',
      image: '/images/social/produkt.jpg',
    },
    requestUrl: 'https://prichozi.example/produkty/?varianta=2#detail',
  });

  assert.equal(ogImageHref, 'https://realtech.cz/images/social/produkt.jpg');
  assert.match(template, /<meta property="og:image" content=\{ogImage\} \/>/);
});

test('absolutní image vstup zachová jako og:image beze změny', async () => {
  const { ogImageHref } = await renderBaseSeo({
    props: {
      title: 'SEO URL test',
      image: 'https://i.ytimg.com/vi/seo-test/maxresdefault.jpg',
    },
    requestUrl: 'https://prichozi.example/video/?autoplay=1#prehravac',
  });

  assert.equal(
    ogImageHref,
    'https://i.ytimg.com/vi/seo-test/maxresdefault.jpg',
  );
});

test('vypnutý includeCanonical nesmí kanonizovat URL, og:image se pořád vyřeší', async () => {
  const { includeCanonical, canonicalHref, ogImageHref } = await renderBaseSeo({
    props: {
      title: '404 — REALTECH CZ',
      image: '/images/social/produkt.jpg',
      includeCanonical: false,
    },
    requestUrl: 'https://prichozi.example/neexistuje/?utm=1#hash',
  });

  assert.equal(includeCanonical, false);
  assert.equal(canonicalHref, undefined);
  assert.equal(ogImageHref, 'https://realtech.cz/images/social/produkt.jpg');
});
