import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'src/layouts/Base.astro');
const PAGE_404 = path.join(ROOT, 'src/pages/404.astro');

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

function propsInterface(ast) {
  const statement = ast.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === 'Props',
  );
  if (!statement) {
    throw new Error('Base.astro ztratilo interface Props.');
  }
  return statement;
}

function propMember(props, name) {
  return props.members.find(
    (member) => ts.isPropertySignature(member) && member.name.getText() === name,
  );
}

function isOptionalBoolean(member) {
  if (!member?.questionToken || !member.type) return false;
  return member.type.kind === ts.SyntaxKind.BooleanKeyword;
}

function firstBaseTag(template) {
  const match = template.match(/<Base\b[\s\S]*?>/);
  if (!match) {
    throw new Error('404.astro neotevírá produkční <Base>.');
  }
  return match[0];
}

function attribute(tag, name) {
  const quoted = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  if (quoted) return quoted[1];
  const expression = tag.match(new RegExp(`\\b${name}=\\{([^}]+)\\}`));
  if (!expression) return undefined;
  const value = expression[1].trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

/** Spustí skutečný frontmatter Base.astro s řízenými props a URL. */
async function renderBaseHead({ props, pathname }) {
  const source = fs.readFileSync(BASE, 'utf8');
  const { script } = extractFrontmatter(source, 'Base.astro');
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
      url: new URL(pathname, 'https://realtech.cz'),
      site: new URL('https://realtech.cz'),
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
      globalThis.__head = {
        robots,
        includeCanonical: typeof includeCanonical === 'undefined' ? undefined : includeCanonical,
        canonicalHref: typeof canonical === 'undefined' ? undefined : String(canonical),
        preconnectYtimg: typeof preconnectYtimg === 'undefined' ? undefined : preconnectYtimg,
        preconnectAudio: typeof preconnectAudio === 'undefined' ? undefined : preconnectAudio,
      };
    })()
  `;

  await vm.runInNewContext(program, sandbox, { filename: BASE });
  return sandbox.__head;
}

test('404: stránka předá Base noindex, follow a vypne self-canonical', () => {
  const { template } = extractFrontmatter(
    fs.readFileSync(PAGE_404, 'utf8'),
    '404.astro',
  );
  const tag = firstBaseTag(template);

  assert.equal(attribute(tag, 'robots'), 'noindex, follow');
  assert.equal(attribute(tag, 'includeCanonical'), false);
  assert.doesNotMatch(tag, /\bcanonical=/);
  assert.doesNotMatch(tag, /preconnectYtimg|preconnectAudio/,
    '404 nepředává ytimg/audio preconnect — karty berou lokální webp a mp3 tu není');
});

test('Base: includeCanonical je volitelný boolean a kanonický odkaz je podmíněný', () => {
  const source = fs.readFileSync(BASE, 'utf8');
  const { script, template } = extractFrontmatter(source, 'Base.astro');
  const props = propsInterface(parseTs(BASE, script));
  const includeCanonical = propMember(props, 'includeCanonical');
  assert.ok(isOptionalBoolean(propMember(props, 'preconnectYtimg')),
    'preconnectYtimg musí být typově `boolean | undefined`');
  assert.ok(isOptionalBoolean(propMember(props, 'preconnectAudio')),
    'preconnectAudio musí být typově `boolean | undefined`');

  assert.ok(includeCanonical, 'Base.astro musí mít volitelný prop includeCanonical');
  assert.ok(
    isOptionalBoolean(includeCanonical),
    'includeCanonical musí být typově `boolean | undefined`',
  );
  assert.match(
    template,
    /\{includeCanonical && <link rel="canonical" href=\{canonical\} \/>\}/,
    'self-canonical se musí vypnout propsem, ne smazáním odkazu pro všechny stránky',
  );
  assert.match(
    template,
    /\{includeCanonical && <meta property="og:url" content=\{canonical\} \/>\}/,
    'og:url nesmí kanonizovat chybějící URL na /404, když je canonical vypnutý',
  );
});

test('Base: výchozí stránka pořád emituje canonical své vlastní URL', async () => {
  const head = await renderBaseHead({
    props: { title: 'REALTECH CZ' },
    pathname: '/clanky/existujici-clanek/',
  });

  assert.equal(head.includeCanonical, true);
  assert.equal(head.robots, 'max-image-preview:large');
  assert.equal(head.canonicalHref, 'https://realtech.cz/clanky/existujici-clanek/');
  assert.equal(head.preconnectYtimg, false, 'bez flagu se i.ytimg.com nesmí předpojovat');
  assert.equal(head.preconnectAudio, false, 'bez flagu se audio.realtech.cz nesmí předpojovat');
});

test('404: HTML z /404 nesmí kanonizovat chybějící URL na sebe', async () => {
  const { template } = extractFrontmatter(
    fs.readFileSync(PAGE_404, 'utf8'),
    '404.astro',
  );
  const tag = firstBaseTag(template);
  const head = await renderBaseHead({
    props: {
      title: attribute(tag, 'title'),
      description: attribute(tag, 'description'),
      robots: attribute(tag, 'robots'),
      includeCanonical: attribute(tag, 'includeCanonical'),
    },
    pathname: '/404/',
  });

  assert.equal(head.robots, 'noindex, follow');
  assert.equal(head.includeCanonical, false);
  assert.equal(head.preconnectYtimg, false);
  assert.equal(head.preconnectAudio, false);
});

test('Base: zapnuté flagy předají ytimg i audio preconnect', async () => {
  const head = await renderBaseHead({
    props: { title: 'YouTube článek', preconnectYtimg: true, preconnectAudio: true },
    pathname: '/clanky/starlink-v-cesku-pruvodce/',
  });
  assert.equal(head.preconnectYtimg, true);
  assert.equal(head.preconnectAudio, true);
});
