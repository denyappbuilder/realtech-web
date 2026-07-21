import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// slug → lastmod (updated ?? date) z frontmatteru článků — pro sitemap <lastmod>
const lastmods = {};
for (const f of fs.readdirSync('./src/content/clanky').filter((f) => f.endsWith('.md'))) {
  const fm = fs.readFileSync(`./src/content/clanky/${f}`, 'utf8').split('---')[1] ?? '';
  const d = fm.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1]
    ?? fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (d) lastmods[f.replace(/\.md$/, '')] = new Date(d);
}

export default defineConfig({
  site: 'https://realtech.cz',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      // /vitej/ je noindex (potvrzení newsletteru) — do sitemapy nepatří
      filter: (page) => !page.includes('/vitej'),
      serialize: (item) => {
        const slug = item.url.match(/\/clanky\/([^/]+)\/$/)?.[1];
        if (slug && lastmods[slug]) item.lastmod = lastmods[slug].toISOString();
        return item;
      },
    }),
  ],
});
