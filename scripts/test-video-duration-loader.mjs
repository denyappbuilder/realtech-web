import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const articlePageUrl = new URL(
  '../src/pages/clanky/[...id].astro',
  import.meta.url,
);
const articlePagePath = fileURLToPath(articlePageUrl);
const astroContentMockUrl = new URL(
  './test-video-duration-mocks/astro-content.mjs',
  import.meta.url,
).href;

function isArticlePage(url) {
  const parsedUrl = new URL(url);
  return parsedUrl.protocol === 'file:'
    && fileURLToPath(parsedUrl) === articlePagePath;
}

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier === 'astro:content'
    && context.parentURL
    && isArticlePage(context.parentURL)
  ) {
    return { url: astroContentMockUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const parsedUrl = new URL(url);

  if (isArticlePage(parsedUrl)) {
    const astroSource = await readFile(articlePageUrl, 'utf8');
    const lines = astroSource.split(/\r?\n/);
    const closingFence = lines.indexOf('---', 1);

    if (lines[0] !== '---' || closingFence === -1) {
      throw new Error('Cilova Astro stranka nema ocekavany frontmatter.');
    }

    const instrumentedFrontmatter = [
      ...lines.slice(1, closingFence),
      'export { isoDuration, videoLd };',
    ].join('\n');
    const { outputText } = ts.transpileModule(instrumentedFrontmatter, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: parsedUrl.pathname,
    });

    return {
      format: 'module',
      source: outputText,
      shortCircuit: true,
    };
  }

  if (parsedUrl.pathname.endsWith('.astro')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }

  return nextLoad(url, context);
}
