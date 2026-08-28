import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { slugify } from './src/lib/slugify.js';
import { parsePublishDate } from './src/lib/calendarDate.js';
import { asciiHeadingId, nextUniqueHeadingId } from './src/lib/heading-id.js';

// slug → lastmod (updated ?? date) z frontmatteru článků — pro sitemap <lastmod>
const lastmods = {};
const categoryLastmods = {};
const invalidLastmodSlugs = new Set();
for (const f of fs.readdirSync('./src/content/clanky', { recursive: true }).filter((f) => f.endsWith('.md'))) {
  // Oddělovač je řádek `---`, ne libovolný výskyt v hodnotě (Z1267).
  // `split('---')` uřízne `description: "Rozbor --- díl první"` uprostřed
  // a ztratí `draft`/`date`/`category` za ním — sitemapa pak ohlásí datum
  // článku, který na webu není.
  const fm = fs.readFileSync(`./src/content/clanky/${f}`, 'utf8').split(/^---\s*$/m)[1] ?? '';
  // Draft se na stránkách filtruje, ale lastmod se dřív počítal i z něj —
  // nepublikovaný článek tak posunul homepage, archiv i cizí kategorie (Z1070).
  // YAML 1.2 / js-yaml: jen true, True a TRUE jsou boolean true.
  // i-flag by sekl i tRuE, které parser bere jako řetězec.
  if (/^draft:\s*(?:true|True|TRUE)\b/m.test(fm)) continue;
  // Date-only = půlnoc UTC. ISO čas vydání (Roman 06:30+02) se dřív uřízl
  // na YYYY-MM-DD, takže homepage/listing i článek dostaly lastmod o půlnoci.
  const d = fm.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2}(?:T[^\s"']+)?)/m)?.[1]
    ?? fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2}(?:T[^\s"']+)?)/m)?.[1];
  if (d) {
    const slug = f.replace(/\.md$/, '');
    const lastmod = parsePublishDate(d);
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
    const seen = new Map();
    const walk = (node) => {
      if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
        const id = nextUniqueHeadingId(asciiHeadingId(text(node)), seen);
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
      // /vitej/ je noindex (potvrzení newsletteru) — vyřadit jen přesnou cestu,
      // ne legitimní /vitejte/ nebo články, které mají „vitej“ ve slugu.
      filter: (page) => new URL(page).pathname !== '/vitej/',
      serialize: (item) => {
        const slug = item.url.match(/\/clanky\/(.+)\/$/)?.[1];
        // I stránkované výpisy tématu (/temata/{slug}/strana/2/) se mění
        // spolu s články svého tématu — lastmod dostanou stejný.
        const category = item.url.match(/\/temata\/([^/]+)\/(?:strana\/\d+\/)?$/)?.[1];
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
