import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { transform } from '@astrojs/compiler';
import { transformWithEsbuild } from 'vite';

const contentMockUrl = new URL('./base-astro-mocks/astro-content.mjs', import.meta.url).href;
const compilerRuntimeUrl = new URL('./base-astro-mocks/compiler-runtime.mjs', import.meta.url).href;
const stylesheetMockUrl = new URL('./base-astro-mocks/stylesheet.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'base-astro:compiler-runtime') {
    return { url: compilerRuntimeUrl, shortCircuit: true };
  }

  if (specifier === 'astro:content') {
    return { url: contentMockUrl, shortCircuit: true };
  }

  if (specifier.endsWith('.css')) {
    return { url: stylesheetMockUrl, shortCircuit: true };
  }

  if (specifier.endsWith('.astro')) {
    return {
      url: new URL(specifier, context.parentURL).href,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!new URL(url).pathname.endsWith('.astro')) {
    return nextLoad(url, context);
  }

  const filename = fileURLToPath(url);
  const source = await readFile(filename, 'utf8');
  const compiled = await transform(source, {
    filename,
    internalURL: 'base-astro:compiler-runtime',
    pathname: filename,
    sourcemap: false,
  });
  const javascript = await transformWithEsbuild(compiled.code, filename, {
    format: 'esm',
    loader: 'ts',
    sourcemap: false,
    target: 'es2022',
  });

  return {
    format: 'module',
    source: javascript.code,
    shortCircuit: true,
  };
}
