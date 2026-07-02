import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'REALTECH CZ',
    description: 'Tech novinky a analýzy bez marketingových řečí.',
    site: context.site,
    items: clanky.map((c) => ({
      title: c.data.title,
      description: c.data.description,
      pubDate: c.data.date,
      link: `/clanky/${c.id}`,
    })),
    customData: '<language>cs</language>',
  });
}
