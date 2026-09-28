import { getCollection } from 'astro:content';
import { slugify } from '../../../lib/slugify.js';
import { popisTematu } from '../../../lib/tema-popis.js';
import { rssFeed } from '../../rss.xml.js';

/**
 * Kolo 58: RSS pro každé téma (/temata/drony/rss.xml …). Čtenář, kterého
 * zajímají jen drony nebo vesmír, dřív musel odebírat všech ~130 článků.
 * Builder a tvar položek sdílí hlavní /rss.xml.
 */
export async function getStaticPaths() {
  const all = await getCollection('clanky', ({ data }) => !data.draft);
  return [...new Set(all.map((c) => c.data.category))].map((category) => ({
    params: { slug: slugify(category) },
    props: { category },
  }));
}

export async function GET(context) {
  const { category } = context.props;
  return rssFeed(context, {
    title: `REALTECH CZ — ${category}`,
    description: popisTematu(category),
    self: `/temata/${slugify(category)}/rss.xml`,
    category,
  });
}
