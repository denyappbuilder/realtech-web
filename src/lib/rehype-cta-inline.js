import { indexProEmbed } from './rehype-x-embed.js';

/**
 * B19 (19. 9. 2026): kompaktní výzva na YouTube hned za úvodním odstavcem
 * článku. Do té doby stála jediná výzva až pod zdroji (článek s videem:
 * .article-videobar nad textem, bez videa: pruh za textem) — čtenář, který
 * dočetl jen úvod, kanál nikdy neviděl. Cíl webu č. 2 = převádět čtenáře na
 * kanál REALTECHCZ.
 *
 * Vkládá se v BUILDU jako raw uzel za první (plnohodnotný) odstavec — stejné
 * místo a stejná funkce indexProEmbed jako embed X, takže nic neskáče (CLS 0)
 * a bez JS to funguje stejně. Pořadí pluginů v astro.config.mjs: tahle výzva
 * je zapsaná PŘED rehypeXEmbedy — oba počítají index od téhož odstavce a
 * pozdější splice na stejný index skončí PŘED dřívějším uzlem, takže výsledné
 * pořadí u článku s xPosts je odstavec → karta X → výzva (viz test).
 *
 * Jeden řádek + tlačítko z existujících tříd (.mono, .live-dot, .yt-btn),
 * žádný nový vizuální styl. S videem vede tlačítko na samotné video, bez
 * videa na odběr kanálu. Spodní výzvy (videobar, author-box) zůstávají.
 */

export const KANAL_ODBER_URL = 'https://www.youtube.com/@realtech-cz?sub_confirmation=1';

const YT_IKONA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"/></svg>';

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Jen YouTube odkazy (frontmatter `video` je podle KEPLER-PROMPT.md vždy
 * YouTube; cokoli jiného tlačítko na video nedostane a spadne na odběr).
 * @param {unknown} video
 * @returns {string | null}
 */
export function youtubeOdkaz(video) {
  if (typeof video !== 'string') return null;
  return /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(video) ? video : null;
}

/**
 * HTML výzvy. Text i cíl závisí jen na tom, jestli má článek YouTube video.
 * @param {{ video?: unknown }} frontmatter
 * @returns {string}
 */
export function ctaInlineHtml(frontmatter = {}) {
  const video = youtubeOdkaz(frontmatter.video);
  const href = video ?? KANAL_ODBER_URL;
  const text = video
    ? 'K tomuhle článku máme video na YouTube.'
    : 'Víc takových témat máme na YouTube. Bez marketingových řečí.';
  const tlacitko = video ? 'Přehrát video' : 'Odebírat kanál';
  return [
    `<aside class="article-cta-inline" aria-label="YouTube kanál REALTECH CZ" data-cta-inline="${video ? 'video' : 'kanal'}">`,
    `<span class="mono"><span class="live-dot"></span>${text}</span>`,
    `<a href="${escapeAttr(href)}" class="yt-btn">${YT_IKONA}${tlacitko}</a>`,
    '</aside>',
  ].join('');
}

/**
 * Rehype plugin pro astro.config.mjs. Bez odstavce v těle (článek bez prózy)
 * indexProEmbed vrací konec stromu — tam výzva nemá smysl, plugin nic nevloží.
 */
export function rehypeCtaInline() {
  return (tree, file) => {
    const deti = tree.children ?? [];
    if (!deti.some((node) => node.type === 'element' && node.tagName === 'p')) return;
    const frontmatter = file?.data?.astro?.frontmatter ?? {};
    deti.splice(indexProEmbed(tree), 0, { type: 'raw', value: ctaInlineHtml(frontmatter) });
  };
}
