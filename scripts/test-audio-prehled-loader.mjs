import { readFile } from 'node:fs/promises';

const articlePagePathname = decodeURIComponent(new URL(
  '../src/pages/clanky/[...id].astro',
  import.meta.url,
).pathname);
const astroContentMockUrl = new URL(
  './test-audio-prehled-mocks/astro-content.mjs',
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
    const casti = astroSource.split(/^---\s*$/m);
    if (casti.length < 3 || casti[0].trim() !== '') {
      throw new Error('[...id].astro nezačíná skriptovou částí ohraničenou ---');
    }

    return {
      format: 'module',
      source: `${casti[1]}\nexport { audioLd, jsonLd, articleUrl, audio };`,
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
