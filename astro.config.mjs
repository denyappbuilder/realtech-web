import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { slugify } from './src/lib/slugify.js';
import { parseCalendarDate } from './src/lib/calendarDate.js';
import { asciiHeadingId } from './src/lib/heading-id.js';

// slug → lastmod (updated ?? date) z frontmatteru článků — pro sitemap <lastmod>
const lastmods = {};
const categoryLastmods = {};
const invalidLastmodSlugs = new Set();
for (const f of fs.readdirSync('./src/content/clanky').filter((f) => f.endsWith('.md'))) {
  const fm = fs.readFileSync(`./src/content/clanky/${f}`, 'utf8').split('---')[1] ?? '';
  const d = fm.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1]
    ?? fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (d) {
    const slug = f.replace(/\.md$/, '');
    const lastmod = parseCalendarDate(d);
    if (!lastmod) {
      invalidLastmodSlugs.add(slug);
      continue;
    }
    lastmods[slug] = lastmod;
    const category = fm.match(/^category:\s*["']?([^\n"']+)/m)?.[1]?.trim();
    if (category) {
      const categorySlug = slugify(category);
      if (!categoryLastmods[categorySlug] || lastmod > categoryLastmods[categorySlug]) {
        categoryLastmods[categorySlug] = lastmod;
      }
    }
  }
}
const timestamps = Object.values(lastmods).map((date) => date.valueOf());
const newestArticle = timestamps.length ? new Date(Math.max(...timestamps)) : undefined;

// Astro generuje id nadpisů i s diakritikou („#aktuální-ceny-v-česku"), což se
// v odkazech enkóduje na nečitelné %C3%A1… Přepíšeme je na ASCII podobu.
function rehypeAsciiHeadingIds() {
  const text = (node) =>
    node.type === 'text' ? node.value : (node.children ?? []).map(text).join('');
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
        const id = asciiHeadingId(text(node));
        if (id) node.properties = { ...node.properties, id };
      }
      (node.children ?? []).forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://realtech.cz',
  markdown: { rehypePlugins: [rehypeAsciiHeadingIds] },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      // /vitej/ je noindex (potvrzení newsletteru) — do sitemapy nepatří
      filter: (page) => !page.includes('/vitej'),
      serialize: (item) => {
        const slug = item.url.match(/\/clanky\/([^/]+)\/$/)?.[1];
        const category = item.url.match(/\/temata\/([^/]+)\/$/)?.[1];
        if (slug && invalidLastmodSlugs.has(slug)) {
          return item;
        } else if (slug && lastmods[slug]) {
          item.lastmod = lastmods[slug].toISOString();
        } else if (category && categoryLastmods[category]) {
          item.lastmod = categoryLastmods[category].toISOString();
        } else if (newestArticle) {
          // Homepage, archiv a statické přehledy se mění spolu s publikací článků.
          item.lastmod = newestArticle.toISOString();
        }
        return item;
      },
    }),
  ],
});
