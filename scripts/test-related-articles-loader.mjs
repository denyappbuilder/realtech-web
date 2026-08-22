import { readFile } from 'node:fs/promises';

const articlePagePathname = decodeURIComponent(new URL(
  '../src/pages/clanky/[...id].astro',
  import.meta.url,
).pathname);
const astroContentMockUrl = new URL(
  './test-related-articles-mocks/astro-content.mjs',
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
    const frontmatterStart = astroSource.indexOf('---') + 3;
    const selectionEnd = astroSource.indexOf(
      '\n// Chronologická navigace',
      frontmatterStart,
    );

    if (frontmatterStart < 3 || selectionEnd === -1) {
      throw new Error('Nelze najít logiku souvisejících článků v [...id].astro');
    }

    return {
      format: 'module',
      source: `${astroSource.slice(frontmatterStart, selectionEnd)}\nexport { related };`,
      shortCircuit: true,
    };
  }

  if (pathname.endsWith('.astro')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }

  return nextLoad(url, context);
}
