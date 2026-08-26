import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import fs from 'node:fs';
import { marked } from 'marked';
import { compareArticlesByDateDescThenId } from '../lib/article-order.js';
import { mimeTypeProEnclosure } from '../lib/rss-enclosure-mime.js';
import { youtubeId } from '../lib/youtube.js';

export async function GET(context) {
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort(compareArticlesByDateDescThenId)
    .slice(0, 50);

  return rss({
    title: 'REALTECH CZ',
    description: 'Tech novinky a analýzy bez marketingových řečí.',
    site: context.site,
    // atom:link rel=self — RSS best practice (validátor bez něj warnuje),
    // čtečky podle něj poznají kanonickou adresu feedu.
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    items: clanky.map((c) => {
      const hasParentSegment = c.data.image?.split(/[\\/]/).includes('..');
      const mime = c.data.image ? mimeTypeProEnclosure(c.data.image) : undefined;
      const localPath = c.data.image && mime && !hasParentSegment ? `public${c.data.image}` : null;
      // Video článek bez lokálního coveru padá na stejný YouTube náhled,
      // jaký používá stránka článku (hero-obrazek.js): maxresdefault je
      // 1280×720 (16:9), hqdefault jen 480×360 (4:3). Velikost vzdáleného
      // souboru neznáme a stahovat ji při buildu nechceme — length=0 je
      // zavedená konvence pro neznámou délku enclosure.
      const videoId = youtubeId(c.data.video);
      const youtubeThumb = videoId
        ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        : null;
      const enclosure = localPath && fs.existsSync(localPath)
        ? {
            url: new URL(c.data.image, context.site).href,
            type: mime,
            length: fs.statSync(localPath).size,
          }
        : youtubeThumb
          ? {
              url: youtubeThumb,
              type: mimeTypeProEnclosure(youtubeThumb),
              length: 0,
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
    customData: [
      '<language>cs</language>',
      `<atom:link href="${new URL('/rss.xml', context.site).href}" rel="self" type="application/rss+xml"/>`,
      // Čas buildu stačí — feed se mění jen publikací, a ta jde přes build.
      // toUTCString() je validní RFC-822 formát, který RSS 2.0 vyžaduje.
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    ].join(''),
  });
}
