import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from '@astrojs/compiler';
import ts from 'typescript';

// Logika tématu žije v komponentě TemaPage (sdílí ji /temata/{slug}/
// i /temata/{slug}/strana/{n}/) — instrumentuje se ona. Obě routy se
// kompilují taky, ale jen kvůli getStaticPaths.
const componentPath = fileURLToPath(new URL('../src/components/TemaPage.astro', import.meta.url).href);
const slugPagePath = fileURLToPath(new URL('../src/pages/temata/[slug].astro', import.meta.url).href);
const stranaPagePath = fileURLToPath(new URL('../src/pages/temata/[slug]/strana/[page].astro', import.meta.url).href);
const mockedPaths = new Set([componentPath, slugPagePath, stranaPagePath]);
const mocksUrl = new URL('./test-temata-mocks/', import.meta.url);
const astroContentUrl = new URL('astro-content.mjs', mocksUrl).href;
const astroComponentUrl = new URL('astro-component.mjs', mocksUrl).href;
const astroRuntimeUrl = new URL('astro-runtime.mjs', mocksUrl).href;

export async function resolve(specifier, context, nextResolve) {
  const parentIsMocked = context.parentURL?.startsWith('file:')
    && mockedPaths.has(fileURLToPath(context.parentURL));

  if (parentIsMocked && specifier === 'astro:content') {
    return { url: astroContentUrl, shortCircuit: true };
  }

  if (parentIsMocked && specifier === 'astro/runtime/server/index.js') {
    return { url: astroRuntimeUrl, shortCircuit: true };
  }

  if (parentIsMocked && specifier.endsWith('.astro')) {
    return { url: astroComponentUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith('file:') || !mockedPaths.has(fileURLToPath(url))) {
    return nextLoad(url, context);
  }

  const path = fileURLToPath(url);
  const source = await readFile(new URL(url), 'utf8');
  const { code } = await transform(source, {
    filename: path,
    sourcemap: false,
  });
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: `${path}.js`,
  });

  if (path !== componentPath) {
    return { format: 'module', source: outputText, shortCircuit: true };
  }

  const componentStart = outputText.indexOf('const $$TemaPage = $$createComponent');
  const templateReturn = outputText.search(/\n\s*return \$\$render\s*`/);

  if (componentStart === -1 || templateReturn === -1) {
    throw new Error('Kompilovaný modul témat nemá očekávanou strukturu.');
  }

  const testReturn = '\nreturn { clanky, articles, ostatni, collectionLd, start, totalPages, page };';
  const instrumented = `${outputText.slice(0, templateReturn)}${testReturn}${outputText.slice(templateReturn)}`;

  return {
    format: 'module',
    source: instrumented,
    shortCircuit: true,
  };
}
