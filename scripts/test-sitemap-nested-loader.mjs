const configPathname = new URL('../astro.config.mjs', import.meta.url).pathname;
const mocksDirectoryUrl = new URL('./test-sitemap-nested-mocks/', import.meta.url);

const replacements = new Map([
  ['astro/config', new URL('astro-config.mjs', mocksDirectoryUrl).href],
  ['@astrojs/sitemap', new URL('astro-sitemap.mjs', mocksDirectoryUrl).href],
]);

export async function resolve(specifier, context, nextResolve) {
  const parentPathname = context.parentURL
    ? new URL(context.parentURL).pathname
    : undefined;
  const replacement = parentPathname === configPathname
    ? replacements.get(specifier)
    : undefined;

  if (replacement) {
    return { url: replacement, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
