let sitemapOptions;

export function resetSitemapOptions() {
  sitemapOptions = undefined;
}

export function getSitemapOptions() {
  if (!sitemapOptions) {
    throw new Error('Expected astro.config.mjs to call sitemap() once');
  }
  return sitemapOptions;
}

export function defineConfig(config) {
  return config;
}

export function sitemap(options) {
  if (sitemapOptions) {
    throw new Error('Expected astro.config.mjs to call sitemap() only once');
  }
  sitemapOptions = options;
  return { name: 'sitemap-nested-test-double' };
}
