const rssModuleUrl = new URL("../../src/pages/rss.xml.js", import.meta.url).href;
const astroContentFixtureUrl = new URL("./astro-content.mjs", import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (context.parentURL === rssModuleUrl && specifier === "astro:content") {
    return { url: astroContentFixtureUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
