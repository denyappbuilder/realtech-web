let articles = new Map();
let sitemapCalls = [];

export function setArticles(entries) {
  articles = new Map(
    entries.map(({ filename, frontmatter }) => [
      filename,
      `---\n${frontmatter.join('\n')}\n---\n\nTest body.\n`,
    ]),
  );
  sitemapCalls = [];
}

export function getSitemapOptions() {
  if (sitemapCalls.length !== 1) {
    throw new Error(`Expected one sitemap() call, got ${sitemapCalls.length}`);
  }
  return sitemapCalls[0];
}

export function defineConfig(config) {
  return config;
}

export function sitemap(options) {
  sitemapCalls.push(options);
  return { name: 'sitemap-test-double' };
}

export const mockFs = {
  readdirSync(directory) {
    if (directory !== './src/content/clanky') {
      throw new Error(`Unexpected readdirSync path: ${directory}`);
    }
    return [...articles.keys()];
  },
  readFileSync(file, encoding) {
    if (encoding !== 'utf8') {
      throw new Error(`Unexpected readFileSync encoding: ${encoding}`);
    }
    const prefix = './src/content/clanky/';
    if (!file.startsWith(prefix)) {
      throw new Error(`Unexpected readFileSync path: ${file}`);
    }
    const content = articles.get(file.slice(prefix.length));
    if (content === undefined) {
      throw new Error(`Unknown sitemap fixture: ${file}`);
    }
    return content;
  },
};
