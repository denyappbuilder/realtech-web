import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import fs from 'node:fs';

export async function GET(context) {
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'REALTECH CZ',
    description: 'Tech novinky a analýzy bez marketingových řečí.',
    site: context.site,
    items: clanky.map((c) => {
      const localPath = c.data.image ? `public${c.data.image}` : null;
      const enclosure = localPath && fs.existsSync(localPath)
        ? {
            url: new URL(c.data.image, context.site).href,
            type: 'image/jpeg',
            length: fs.statSync(localPath).size,
          }
        : undefined;
      return {
        title: c.data.title,
        description: c.data.description,
        pubDate: c.data.date,
        link: `/clanky/${c.id}/`,
        categories: [c.data.category],
        enclosure,
      };
    }),
    customData: '<language>cs</language>',
  });
}
