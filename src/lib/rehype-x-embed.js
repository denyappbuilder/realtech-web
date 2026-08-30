import { xPostEmbed } from './x-post.js';

/**
 * Vloží fasádu oficiálního embedu X do vyrenderovaného markdownu článku —
 * v BUILDU, ne na klientovi. Maky živě potvrdil vzhled karty („Super, to je
 * ono“), ale nechtěl ji jako první věc v těle článku: napřed má být text,
 * pak widget. Klientské přesouvání (`firstP.after(embed)`) by kartu nejdřív
 * vykreslilo nahoře a pak s ní škublo — proto rehype plugin: embed stojí
 * za prvním odstavcem už v HTML ze serveru a nic neskáče.
 *
 * Plugin čte `xPosts` z frontmatteru (Astro ho dává do file.data.astro),
 * URL pouští přes stejný parser jako dřív šablona (x-post.js) a vkládá
 * tutéž kostru fasády (logo X + titulek + fallback „Otevřít na X“), kterou
 * si při načtení stránky převezme src/lib/x-embed.js a vymění za
 * blockquote.twitter-tweet + widgets.js. Jeden článek = jeden seznam
 * embedů z xPosts, nic navíc.
 */

// Kam přesně embed patří: za první odstavec článku. Když je první odstavec
// miniaturní (jednověté uvození), karta by visela hned pod nadpisem skoro
// bez textu — pak jde až za druhý odstavec. U Flight 14 je první odstavec
// plnohodnotný lede o static fire, takže embed sedí hned za ním.
export const MIN_ZNAKU_PRVNIHO_ODSTAVCE = 120;

const X_LOGO_PATH = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';

/**
 * HTML jedné fasády — stejná kostra, jakou dřív nesla šablona článku.
 * Hodnoty jdou z parseru x-post.js (účet [A-Za-z0-9_]{1,15}, id jen číslice,
 * href/webHref složené z nich), takže do atributů nemůže utéct nic škodlivého.
 * Žádné tlačítko, žádná výzva ke kliknutí, žádný iframe/blockquote —
 * to všechno staví až skript při načtení (data-theme podle tématu webu).
 *
 * @param {{ id: string, ucet: string, href: string, webHref: string }} post
 * @returns {string}
 */
export function xEmbedHtml(post) {
  return [
    '<div class="x-embed">',
    `<div class="x-facade" data-x-facade data-x-post-id="${post.id}" data-x-post-href="${post.href}" data-x-post-title="Příspěvek @${post.ucet} na X">`,
    '<div class="x-facade-skeleton">',
    `<span class="x-facade-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${X_LOGO_PATH}"/></svg></span>`,
    `<span class="x-facade-title">Video z příspěvku @${post.ucet}</span>`,
    '</div>',
    '</div>',
    // Fallback stojí MIMO [data-x-facade]: přežije výměnu obsahu fasády
    // a funguje i bez JS.
    `<p class="x-embed-fallback mono">Nenačítá se? <a href="${post.webHref}" target="_blank" rel="noopener">Otevřít na X →</a></p>`,
    '</div>',
  ].join('');
}

function textUzlu(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textUzlu).join('');
}

/**
 * Index v tree.children, KAM embed vložit: za první odstavec, u miniaturního
 * prvního odstavce za druhý. Nikdy index 0 — embed nesmí být první uzel
 * těla článku. Bez jediného odstavce vrací konec stromu (článek bez prózy
 * validace obsahu stejně nepustí).
 *
 * @param {{ children?: Array<{ type: string, tagName?: string }> }} tree
 * @returns {number}
 */
export function indexProEmbed(tree) {
  const deti = tree.children ?? [];
  let prvni = -1;
  for (let i = 0; i < deti.length; i += 1) {
    const node = deti[i];
    if (node.type !== 'element' || node.tagName !== 'p') continue;
    if (prvni === -1) {
      if (textUzlu(node).trim().length >= MIN_ZNAKU_PRVNIHO_ODSTAVCE) return i + 1;
      prvni = i;
      continue;
    }
    return i + 1;
  }
  return prvni === -1 ? deti.length : prvni + 1;
}

/**
 * Rehype plugin pro astro.config.mjs. `raw` uzly serializuje Astro doslovně
 * (stejná cesta jako HTML psané přímo v markdownu), takže kostra dojde do
 * statického HTML beze změny a klientský skript ji najde přes [data-x-facade].
 */
export function rehypeXEmbedy() {
  return (tree, file) => {
    const xPosts = file?.data?.astro?.frontmatter?.xPosts;
    const posts = (xPosts ?? []).flatMap((url) => xPostEmbed(url) ?? []);
    if (posts.length === 0) return;

    const embedy = posts.map((post) => ({ type: 'raw', value: xEmbedHtml(post) }));
    tree.children.splice(indexProEmbed(tree), 0, ...embedy);
  };
}
