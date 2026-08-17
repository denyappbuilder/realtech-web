import { readFile } from 'node:fs/promises';

import { parse } from '@astrojs/compiler';
import ts from 'typescript';

const articleCardUrl = new URL('../src/components/ArticleCard.astro', import.meta.url);
const mockFsUrl = new URL('./test-karta-nahled-mocks/node-fs.mjs', import.meta.url);

function extractThumbnailBlock(frontmatter) {
  const startMarker = 'const slugify = (s: string) =>';
  const start = frontmatter.indexOf(startMarker);
  if (start === -1) {
    throw new Error(
      `V ArticleCard.astro nebyl nalezen zacatek bloku nahledu: ${startMarker}`,
    );
  }

  const remainder = frontmatter.slice(start);
  const endMatch = /^const hasWebp =.*(?:\r?\n|$)/m.exec(remainder);
  if (!endMatch) {
    throw new Error(
      'V ArticleCard.astro nebyl nalezen konec bloku nahledu: const hasWebp =',
    );
  }

  return remainder.slice(0, endMatch.index + endMatch[0].length);
}

export async function load(url, context, nextLoad) {
  const parsedUrl = new URL(url);
  if (parsedUrl.pathname !== articleCardUrl.pathname) {
    return nextLoad(url, context);
  }

  const source = await readFile(articleCardUrl, 'utf8');
  const parsed = await parse(source);
  const frontmatterNode = parsed.ast.children.find(
    (node) => node.type === 'frontmatter',
  );
  if (!frontmatterNode) {
    throw new Error('V ArticleCard.astro nebyl nalezen frontmatter uzel.');
  }

  const productionBlock = extractThumbnailBlock(frontmatterNode.value);
  const virtualModule = [
    `import fs from ${JSON.stringify(mockFsUrl.href)};`,
    'const { category, video, image, date } = globalThis.__KARTA_NAHLED__;',
    productionBlock,
    'export { thumbClass, small, localThumb, videoId, thumbUrl, thumbW, thumbH, thumbWebp, hasWebp };',
  ].join('\n');
  const { outputText } = ts.transpileModule(virtualModule, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: articleCardUrl.pathname,
  });

  return {
    format: 'module',
    source: outputText,
    shortCircuit: true,
  };
}
