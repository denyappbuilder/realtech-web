// Loader pro test-giscus.mjs: zkompiluje src/components/Giscus.astro skutečným
// @astrojs/compiler se stejnými volbami, jaké dává Astro (renderScript,
// compiler-runtime), a nechá ho vykreslit přes `astro/container`. Testuje
// se tedy SKUTEČNÉ HTML komponenty, ne regex nad šablonou.
//
// Jediný zásah do kódu: `import.meta.env` → `globalThis.__giscusEnv`. Vite
// v buildu env doplňuje sám, v Node žádný `import.meta.env` není. Test si
// tak před každým importem (s cache-busting query) nastaví env, jaké chce.
import { readFile } from 'node:fs/promises';

import { transform } from '@astrojs/compiler';

const komponentaUrl = new URL('../src/components/Giscus.astro', import.meta.url);
const komponentaPathname = decodeURIComponent(komponentaUrl.pathname);

function jeKomponenta(url) {
  return Boolean(url) && decodeURIComponent(new URL(url).pathname) === komponentaPathname;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.includes('components/Giscus.astro')) {
    return { url: new URL(specifier, context.parentURL).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!jeKomponenta(url)) return nextLoad(url, context);

  const zdroj = await readFile(komponentaPathname, 'utf8');
  const { code } = await transform(zdroj, {
    filename: 'src/components/Giscus.astro',
    normalizedFilename: 'src/components/Giscus.astro',
    internalURL: 'astro/compiler-runtime',
    resultScopedSlot: true,
    renderScript: true,
    resolvePath: async (specifier) => specifier,
  });

  const nahrazeno = code.replace(/import\.meta\.env/g, 'globalThis.__giscusEnv');
  if (nahrazeno === code) {
    throw new Error('Giscus.astro už nečte import.meta.env — uprav loader i testy.');
  }

  return { format: 'module', source: nahrazeno, shortCircuit: true };
}
