// Loader pro test-kolo-48-herohero.mjs: zkompiluje src/pages/herohero.astro
// a src/components/HeroheroCta.astro skutečným @astrojs/compiler (stejné
// volby jako test-giscus-loader) a nechá je vykreslit přes `astro/container`.
// Testuje se tedy SKUTEČNÉ HTML stránky /herohero/, ne regex nad šablonou.
//
// Jediná náhrada: `../layouts/Base.astro` → stub v test-kolo-48-herohero-mocks/.
// Skutečný Base tahá fonty přes `?url`, CSS a astro:content — v Node se
// nespustí a hlavičku/patičku webu hlídají jiné testy. Stub vykreslí title,
// description a oba sloty, nic víc.
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { transform } from '@astrojs/compiler';
import ts from 'typescript';

const KOREN = fileURLToPath(new URL('..', import.meta.url));
const STRANKA = fileURLToPath(new URL('../src/pages/herohero.astro', import.meta.url));
const BASE_STUB = new URL('./test-kolo-48-herohero-mocks/Base.astro', import.meta.url);

const cesta = (url) => fileURLToPath(new URL(url));

export async function resolve(specifier, context, nextResolve) {
  const rodic = context.parentURL ? cesta(context.parentURL) : undefined;
  if (rodic === STRANKA && specifier === '../layouts/Base.astro') {
    return { url: BASE_STUB.href, shortCircuit: true };
  }
  if (specifier.endsWith('.astro')) {
    return { url: new URL(specifier, context.parentURL).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!new URL(url).pathname.endsWith('.astro')) return nextLoad(url, context);

  const soubor = cesta(url);
  const filename = relative(KOREN, soubor);
  const zdroj = await readFile(soubor, 'utf8');
  const { code } = await transform(zdroj, {
    filename,
    normalizedFilename: filename,
    internalURL: 'astro/compiler-runtime',
    resultScopedSlot: true,
    renderScript: true,
    resolvePath: async (s) => s,
  });

  // Astro 7 staví přes @astrojs/compiler-rs, kde komponenta volá
  // `$$result.createAstro($$props, $$slots)`. Dev závislost @astrojs/compiler
  // 2.13 (společná pro všechny loadery v repu) ještě emituje starý tvar se
  // třemi argumenty — runtime by pak za props dostal globální $$Astro a
  // Astro.props by bylo prázdné (title, nadpis, text… by tiše propadly na
  // výchozí hodnoty). Přepis na nový tvar; když kompilátor tvar změní,
  // test spadne hned tady, ne až tichým renderem výchozích hodnot.
  const VOLANI_STARE = /\$\$result\.createAstro\(\$\$Astro, \$\$props, \$\$slots\)/g;
  const VOLANI_NOVE = '$$result.createAstro($$props, $$slots)';
  if (!VOLANI_STARE.test(code) && !code.includes(VOLANI_NOVE)) {
    throw new Error(`${filename}: kompilát nevolá $$result.createAstro v žádném známém tvaru — uprav loader.`);
  }
  // Funkce, ne řetězec: `$$` by String.replace zkrátil na jediný `$`.
  const sRuntimeAstra7 = code.replace(VOLANI_STARE, () => VOLANI_NOVE);

  // Frontmatter komponenty nese TypeScript (`interface Props`) — stejné
  // smazání typů jako v buildu (viz test-homepage-loader).
  const { outputText } = ts.transpileModule(sRuntimeAstra7, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: `${filename}.ts`,
  });
  return { format: 'module', source: outputText, shortCircuit: true };
}
