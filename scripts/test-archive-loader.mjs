import { readFile } from "node:fs/promises";

import { transform } from "@astrojs/compiler";

const archiveModuleUrl = new URL(
  "../src/pages/clanky/index.astro",
  import.meta.url,
).href;
const mocksDirectoryUrl = new URL("./test-archive-mocks/", import.meta.url);
const baseMockUrl = new URL("BaseMock.astro", mocksDirectoryUrl).href;
const articleCardMockUrl = new URL("ArticleCardMock.astro", mocksDirectoryUrl).href;

const archiveReplacements = new Map([
  ["astro:content", new URL("astro-content.mjs", mocksDirectoryUrl).href],
  ["../../layouts/Base.astro", baseMockUrl],
  ["../../components/ArticleCard.astro", articleCardMockUrl],
]);

export async function resolve(specifier, context, nextResolve) {
  if (context.parentURL === archiveModuleUrl) {
    const replacement = archiveReplacements.get(specifier);
    if (replacement) {
      return { url: replacement, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url !== archiveModuleUrl && url !== baseMockUrl && url !== articleCardMockUrl) {
    return nextLoad(url, context);
  }

  const source = await readFile(new URL(url), "utf8");
  const compiled = await transform(source, {
    filename: new URL(url).pathname,
    normalizedFilename: new URL(url).pathname,
    internalURL: "astro/compiler-runtime",
    astroGlobalArgs: JSON.stringify("https://realtech.cz"),
    resultScopedSlot: true,
    sourcemap: "inline",
    async resolvePath(specifier) {
      return specifier.startsWith(".")
        ? new URL(specifier, url).pathname
        : specifier;
    },
  });

  return {
    format: "module",
    source: compiled.code,
    shortCircuit: true,
  };
}
