import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = path.join(ROOT, 'src/pages/404.astro');

function extractFrontmatter(source) {
  const match = source.match(
    /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/,
  );
  if (!match) {
    throw new Error(
      '404.astro nemá očekávaný úvodní frontmatter — loader odmítá pokračovat.',
    );
  }
  return match[1];
}

function prepareFrontmatter() {
  const frontmatter = extractFrontmatter(fs.readFileSync(PAGE, 'utf8'));
  const ast = ts.createSourceFile(
    PAGE,
    frontmatter,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );

  if (ast.parseDiagnostics.length > 0) {
    throw new Error(
      `Frontmatter 404.astro nelze parsovat: ${ast.parseDiagnostics[0].messageText}`,
    );
  }

  const imports = ast.statements.filter(ts.isImportDeclaration);
  const contentImports = imports.filter(
    (statement) => statement.moduleSpecifier.text === 'astro:content',
  );
  if (contentImports.length !== 1) {
    throw new Error(
      `404.astro má ${contentImports.length} importů z astro:content, očekáván je právě 1.`,
    );
  }

  const bindings = contentImports[0].importClause?.namedBindings;
  const getCollectionBindings = ts.isNamedImports(bindings)
    ? bindings.elements.filter(
        (element) => (element.propertyName ?? element.name).text === 'getCollection',
      )
    : [];
  if (getCollectionBindings.length !== 1) {
    throw new Error(
      '404.astro musí importovat getCollection z astro:content právě jednou.',
    );
  }
  const getCollectionName = getCollectionBindings[0].name.text;

  const latestDeclarations = [];
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === 'latest') {
        latestDeclarations.push(declaration);
      }
    }
  }
  if (latestDeclarations.length !== 1 || !latestDeclarations[0].initializer) {
    throw new Error(
      'Produkční výběr musí být právě v jedné inicializované deklaraci `latest`.',
    );
  }

  let productionCalls = 0;
  function inspect(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === getCollectionName
    ) {
      productionCalls += 1;
    }
    ts.forEachChild(node, inspect);
  }
  inspect(latestDeclarations[0].initializer);
  if (productionCalls !== 1) {
    throw new Error(
      'Deklarace `latest` musí přímo vykonat právě jedno produkční volání getCollection.',
    );
  }

  let executable = '';
  let cursor = 0;
  for (const statement of imports) {
    executable += frontmatter.slice(cursor, statement.getStart(ast));
    cursor = statement.end;
  }
  executable += frontmatter.slice(cursor);

  return { executable, getCollectionName };
}

/** Spustí skutečný frontmatter 404.astro s řízenou kolekcí článků. */
export async function loadLatest(entries) {
  const { executable, getCollectionName } = prepareFrontmatter();
  let collectionCalls = 0;
  let predicateCalls = 0;

  const getCollection = async (collection, predicate) => {
    collectionCalls += 1;
    if (collection !== 'clanky') {
      throw new Error(`404.astro načítá neočekávanou kolekci ${String(collection)}.`);
    }
    if (typeof predicate !== 'function') {
      throw new Error('404.astro přestalo filtrovat kolekci callbackem.');
    }
    return entries.filter((entry) => {
      predicateCalls += 1;
      return predicate(entry);
    });
  };

  const sandbox = { __getCollection: getCollection };
  sandbox.globalThis = sandbox;
  const program = `
    (async () => {
      const ${getCollectionName} = globalThis.__getCollection;
      ${executable}
      globalThis.__latest = latest;
    })()
  `;

  await vm.runInNewContext(program, sandbox, { filename: PAGE });

  if (collectionCalls !== 1) {
    throw new Error(
      `Produkční deklarace latest zavolala getCollection ${collectionCalls}×, očekáváno 1×.`,
    );
  }
  if (predicateCalls !== entries.length) {
    throw new Error(
      `Produkční filtr byl vykonán pro ${predicateCalls} z ${entries.length} článků.`,
    );
  }
  if (!Array.isArray(sandbox.__latest)) {
    throw new Error('Produkční deklarace `latest` nevrátila pole.');
  }

  return sandbox.__latest;
}
