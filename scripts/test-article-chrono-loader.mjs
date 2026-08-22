import { readFile } from 'node:fs/promises';

import { parse } from '@astrojs/compiler';

const articlePagePathname = decodeURIComponent(new URL(
  '../src/pages/clanky/[...id].astro',
  import.meta.url,
).pathname);
const astroContentMockUrl = new URL(
  './test-article-chrono-mocks/astro-content.mjs',
  import.meta.url,
).href;

export async function resolve(specifier, context, nextResolve) {
  const parentPathname = context.parentURL
    ? decodeURIComponent(new URL(context.parentURL).pathname)
    : undefined;

  if (parentPathname === articlePagePathname && specifier === 'astro:content') {
    return { url: astroContentMockUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const pathname = decodeURIComponent(new URL(url).pathname);

  if (pathname === articlePagePathname) {
    const astroSource = await readFile(pathname, 'utf8');
    const { ast } = await parse(astroSource, { position: true });
    const frontmatter = ast.children.find((node) => node.type === 'frontmatter');

    if (!frontmatter) {
      throw new Error('Frontmatter v src/pages/clanky/[...id].astro nebyl nalezen');
    }

    const startMarker = '// Chronologická navigace (novější/starší)';
    const endMarker = '// "9:04" -> "PT9M4S"';
    const start = frontmatter.value.indexOf(startMarker);
    const end = frontmatter.value.indexOf(endMarker, start);
    const articleDeclaration = frontmatter.value.match(
      /^const \{ article \} = Astro\.props;$/m,
    )?.[0];

    if (start === -1 || end === -1 || !articleDeclaration) {
      throw new Error('Nelze najít produkční blok chronologické navigace');
    }

    const productionChronology = frontmatter.value.slice(start, end);

    return {
      format: 'module',
      source: [
        "import { getCollection } from 'astro:content';",
        articleDeclaration,
        productionChronology,
        'export { chrono, newer, older };',
      ].join('\n'),
      shortCircuit: true,
    };
  }

  return nextLoad(url, context);
}
