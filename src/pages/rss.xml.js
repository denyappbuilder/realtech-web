import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import fs from 'node:fs';
import { marked } from 'marked';

export async function GET(context) {
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 50);

  return rss({
    title: 'REALTECH CZ',
    description: 'Tech novinky a analýzy bez marketingových řečí.',
    site: context.site,
    items: clanky.map((c) => {
      const hasParentSegment = c.data.image?.split(/[\\/]/).includes('..');
      const localPath = c.data.image && !hasParentSegment ? `public${c.data.image}` : null;
      const enclosure = localPath && fs.existsSync(localPath)
        ? {
            url: new URL(c.data.image, context.site).href,
            type: 'image/jpeg',
            length: fs.statSync(localPath).size,
          }
        : undefined;
      // Plný text (HTML) — čtečky i Kit digest z něj poskládají hezčí výstup.
      // Relativní odkazy v markdownu na absolutní.
      const html = marked
        .parse(c.body ?? '')
        .replaceAll(/href="\/(?!\/)/g, `href="${context.site}`)
        .replaceAll(/src="\/(?!\/)/g, `src="${context.site}`);
      return {
        title: c.data.title,
        description: c.data.description,
        pubDate: c.data.date,
        link: `/clanky/${c.id}/`,
        categories: [c.data.category],
        enclosure,
        content: html,
      };
    }),
    customData: '<language>cs</language>',
  });
}
