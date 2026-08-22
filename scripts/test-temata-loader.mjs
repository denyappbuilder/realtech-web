import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from '@astrojs/compiler';

const pageUrl = new URL('../src/pages/temata/[slug].astro', import.meta.url).href;
const pagePath = fileURLToPath(pageUrl);
const mocksUrl = new URL('./test-temata-mocks/', import.meta.url);
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
    filename: 'src/pages/temata/[slug].astro',
    sourcemap: false,
  });
  const componentStart = code.indexOf('const $$slug = $$createComponent');
  const templateReturn = code.indexOf('\nreturn $$render', componentStart);

  if (componentStart === -1 || templateReturn === -1) {
    throw new Error('Kompilovaný modul témat nemá očekávanou strukturu.');
  }

  const testReturn = '\nreturn { clanky, ostatni, collectionLd };';
  const instrumented = `${code.slice(0, templateReturn)}${testReturn}${code.slice(templateReturn)}`;

  return {
    format: 'module',
    source: instrumented,
    shortCircuit: true,
  };
}
