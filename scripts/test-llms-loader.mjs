const llmsModuleUrl = new URL("../src/pages/llms.txt.js", import.meta.url).href;
const astroContentMockUrl = new URL(
  "./test-llms-mocks/astro-content.mjs",
  import.meta.url,
).href;

export async function resolve(specifier, context, nextResolve) {
  if (context.parentURL === llmsModuleUrl && specifier === "astro:content") {
    return { url: astroContentMockUrl, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
