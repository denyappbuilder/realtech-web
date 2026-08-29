import { transform } from '@astrojs/compiler';

const homepageUrl = new URL('../src/pages/index.astro', import.meta.url);
const homepagePathname = homepageUrl.pathname;
const mocksUrl = new URL('./test-homepage-mocks/', import.meta.url);

const replacements = new Map([
  ['astro/runtime/server/index.js', new URL('astro-runtime.mjs', mocksUrl).href],
  ['astro:content', new URL('astro-content.mjs', mocksUrl).href],
  ['node:fs', new URL('node-fs.mjs', mocksUrl).href],
  ['../layouts/Base.astro', new URL('astro-component.mjs', mocksUrl).href],
  ['../components/ArticleCard.astro', new URL('astro-component.mjs', mocksUrl).href],
  ['../data/videos.json', new URL('videos-snapshot.mjs', mocksUrl).href],
]);

function isHomepage(url) {
  return url && new URL(url).pathname === homepagePathname;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(homepageUrl.href)) {
    return { url: specifier, shortCircuit: true };
  }

  const replacement = isHomepage(context.parentURL)
    ? replacements.get(specifier)
    : undefined;
  if (replacement) {
    return { url: replacement, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!isHomepage(url)) return nextLoad(url, context);

  const source = await nextLoad(homepageUrl.href, {
    ...context,
    format: 'module',
  }).catch(async () => {
    const { readFile } = await import('node:fs/promises');
    return { source: await readFile(homepageUrl, 'utf8') };
  });
  const compiled = await transform(String(source.source), {
    filename: 'src/pages/index.astro',
  });
  const renderReturn = 'return $$render`';
  const captureReturn = [
    'return {',
    '  all, pruvodci, hero, candidates, rail, rest, categories, videos,',
    '  dateStr, heroVideoId, heroThumb, heroSrcset, heroWebp, heroWebpSrcset,',
    '  heroHasWebp, heroLcpSrc, heroPreload, heroOg, jsonLd,',
    '};',
    renderReturn,
  ].join('\n');
  const instrumented = compiled.code.replace(renderReturn, captureReturn);

  if (instrumented === compiled.code) {
    throw new Error('Homepage test loader nenasel renderovaci navrat compileru.');
  }

  return { format: 'module', source: instrumented, shortCircuit: true };
}
