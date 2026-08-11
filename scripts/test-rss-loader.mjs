const rssModuleUrl = new URL("../src/pages/rss.xml.js", import.meta.url).href;
const searchIndexModuleUrl = new URL(
  "../src/pages/search-index.json.js",
  import.meta.url,
).href;
const mocksDirectoryUrl = new URL("./test-rss-mocks/", import.meta.url);

const replacements = new Map([
  ["astro:content", new URL("astro-content.mjs", mocksDirectoryUrl).href],
  ["@astrojs/rss", new URL("astro-rss.mjs", mocksDirectoryUrl).href],
  ["node:fs", new URL("node-fs.mjs", mocksDirectoryUrl).href],
  ["marked", new URL("marked.mjs", mocksDirectoryUrl).href],
]);

export async function resolve(specifier, context, nextResolve) {
  const replacement = context.parentURL === rssModuleUrl
    ? replacements.get(specifier)
    : context.parentURL === searchIndexModuleUrl && specifier === "astro:content"
      ? replacements.get(specifier)
      : undefined;

  if (replacement) {
    return { url: replacement, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
