// Spustí SKUTEČNÝ frontmatter stránky článku (src/pages/clanky/[...id].astro)
// jako modul a zpřístupní jeho výsledky testům.
//
// Proč takhle: strukturovaná data (NewsArticle, BreadcrumbList, VideoObject)
// i kaskáda OG obrázku se počítají ve frontmatteru .astro souboru, který Node
// neumí importovat, a jsdom je nová závislost (zakázaná). Stejný postup —
// module loader, který .astro přeloží na modul — už v repu používá
// scripts/test-related-articles-loader.mjs pro výběr souvisejících článků.
//
// Testuje se tím produkční kód, ne jeho kopie: když se výpočet v .astro změní,
// testy se změnou spadnou.
import { readFile } from 'node:fs/promises';

const strankaClanku = decestuj(
  new URL('../src/pages/clanky/[...id].astro', import.meta.url),
);
const stavUrl = new URL('./test-clanek-jsonld-mocks/state.mjs', import.meta.url).href;
const nahrady = new Map([
  ['astro:content', new URL('./test-clanek-jsonld-mocks/astro-content.mjs', import.meta.url).href],
  ['node:fs', new URL('./test-clanek-jsonld-mocks/node-fs.mjs', import.meta.url).href],
]);

// `[...id]` se v URL enkóduje, porovnávat se musí dekódovaná cesta.
function decestuj(url) {
  return decodeURIComponent(new URL(url).pathname);
}

/** Hodnoty frontmatteru, které testy čtou. */
const EXPORTY = [
  'ogImage',
  'videoId',
  'jsonLd',
  'breadcrumbLd',
  'videoLd',
  'readMinutes',
  'preconnectYtimg',
  'preconnectAudio',
];

/**
 * Vyřízne frontmatter mezi řádkovými `---`.
 *
 * Dělí se na řádkovém `---`, ne na libovolném výskytu (Z1267/Z10036) — jinak by
 * `---` uvnitř hodnoty nebo v těle šablony uřízlo kus počítané logiky a testy
 * by tiše kontrolovaly jen její začátek.
 */
export function frontmatterStranky(zdroj) {
  const casti = zdroj.split(/^---\s*$/m);
  if (casti.length < 3) {
    throw new Error(
      '[...id].astro nemá frontmatter ohraničený řádky `---` — uprav loader, ' +
        'jinak by testy běžely nad prázdným modulem.',
    );
  }

  const frontmatter = casti[1];
  const chybi = EXPORTY.filter(
    (jmeno) => !new RegExp(`\\bconst ${jmeno}\\b`).test(frontmatter),
  );
  if (chybi.length) {
    throw new Error(
      `Ve frontmatteru [...id].astro chybí ${chybi.join(', ')} — přejmenovaná ` +
        'proměnná by testy nechala projít nad starým očekáváním.',
    );
  }

  return frontmatter;
}

export async function resolve(specifier, context, nextResolve) {
  const rodic = context.parentURL ? decestuj(context.parentURL) : undefined;
  if (rodic === strankaClanku && nahrady.has(specifier)) {
    return { url: nahrady.get(specifier), shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const cesta = decestuj(url);

  if (cesta === strankaClanku) {
    const frontmatter = frontmatterStranky(await readFile(cesta, 'utf8'));
    return {
      format: 'module',
      source: [
        `import { getAstro as __getAstro } from ${JSON.stringify(stavUrl)};`,
        'const Astro = __getAstro();',
        frontmatter,
        `export { ${EXPORTY.join(', ')} };`,
      ].join('\n'),
      shortCircuit: true,
    };
  }

  // Base.astro a ArticleCard.astro se jen importují, nic z nich se nepočítá.
  if (cesta.endsWith('.astro')) {
    return { format: 'module', source: 'export default {};', shortCircuit: true };
  }

  return nextLoad(url, context);
}
