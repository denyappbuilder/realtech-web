import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from '@astrojs/compiler';
import ts from 'typescript';

const pageUrl = new URL('../src/components/ArticleArchivePage.astro', import.meta.url).href;
const pagePath = fileURLToPath(pageUrl);
const mocksUrl = new URL('./test-archive-mocks/', import.meta.url);
const astroContentUrl = new URL('astro-content.mjs', mocksUrl).href;
const astroComponentUrl = new URL('astro-component.mjs', mocksUrl).href;
const astroRuntimeUrl = new URL('astro-runtime.mjs', mocksUrl).href;

export async function resolve(specifier, context, nextResolve) {
  const parentIsPage = context.parentURL?.startsWith('file:')
    && fileURLToPath(context.parentURL) === pagePath;

  if (parentIsPage && specifier === 'astro:content') {
    return { url: astroContentUrl, shortCircuit: true };
  }

  if (parentIsPage && specifier === 'astro/runtime/server/index.js') {
    return { url: astroRuntimeUrl, shortCircuit: true };
  }

  if (parentIsPage && specifier.endsWith('.astro')) {
    return { url: astroComponentUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith('file:') || fileURLToPath(url) !== pagePath) {
    return nextLoad(url, context);
  }

  const source = await readFile(new URL(url), 'utf8');
  const { code } = await transform(source, {
    filename: 'src/components/ArticleArchivePage.astro',
    sourcemap: false,
  });
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: 'src/components/ArticleArchivePage.astro.js',
  });
  const componentStart = outputText.indexOf('const $$ArticleArchivePage = $$createComponent');
  const templateReturn = outputText.search(/\n\s*return \$\$render\s*`/);

  if (componentStart === -1 || templateReturn === -1) {
    throw new Error('Kompilovaný modul archivu nemá očekávanou strukturu.');
  }

  const testReturn = '\nreturn { all, articles, categories, collectionLd, start, totalPages, page };';
  const instrumented = `${outputText.slice(0, templateReturn)}${testReturn}${outputText.slice(templateReturn)}`;

  return {
    format: 'module',
    source: instrumented,
    shortCircuit: true,
  };
}
