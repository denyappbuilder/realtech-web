import { xPostEmbed } from './x-post.js';

/**
 * Vloží oficiální embed X do vyrenderovaného markdownu článku — v BUILDU,
 * ne na klientovi. Maky živě potvrdil vzhled karty („Super, to je ono“),
 * ale nechtěl ji jako první věc v těle článku: napřed má být text, pak
 * widget. Klientské přesouvání (`firstP.after(embed)`) by kartu nejdřív
 * vykreslilo nahoře a pak s ní škublo — proto rehype plugin: embed stojí
 * za prvním odstavcem už v HTML ze serveru a nic neskáče.
 *
 * Od kola 7 nese serverové HTML rovnou blockquote.twitter-tweet, ne jen
 * kostru. Dřív blockquote stavěl až klientský modul (deferred) a teprve
 * potom sáhl pro widgets.js — karta tak čekala na HTML → náš bundle →
 * widgets.js → iframe a „někdy se načítala dlouho“. Teď widgets.js
 * (async v <head> šablony článku, jen na stránkách s xPosts) najde
 * blockquote hned po naparsování dokumentu; náš modul už jen hlídá
 * render (spinner, 15s únik „Otevřít na X“).
 *
 * Plugin čte `xPosts` z frontmatteru (Astro ho dává do file.data.astro),
 * URL pouští přes stejný parser jako dřív šablona (x-post.js). Jeden
 * článek = jeden seznam embedů z xPosts, nic navíc.
 */

// Kam přesně embed patří: za první odstavec článku. Když je první odstavec
// miniaturní (jednověté uvození), karta by visela hned pod nadpisem skoro
// bez textu — pak jde až za druhý odstavec. U Flight 14 je první odstavec
// plnohodnotný lede o static fire, takže embed sedí hned za ním.
export const MIN_ZNAKU_PRVNIHO_ODSTAVCE = 120;

// Téma widgetu se musí trefit dřív, než widgets.js blockquote přečte —
// jinak na tmavém webu blikne bílá karta. Server téma čtenáře nezná,
// tak blockquote nese default light a tenhle inline skript (běží
// synchronně hned při parsování, dávno před async widgets.js) ho opraví
// stejnou logikou jako temaWidgetu v x-embed.js: ruční data-theme na
// <html> (inline skript v Base ho nastavuje z localStorage ještě v <head>)
// má přednost, jinak systémové schéma. Statický řetězec bez interpolace —
// z frontmatteru do něj nic nevede. CSP: script-src má 'unsafe-inline'.
const THEME_SCRIPT =
  '<script>(function(s){try{'
  + 'var b=s.previousElementSibling.querySelector("blockquote.twitter-tweet");'
  + 'var t=document.documentElement.dataset.theme;'
  + 'if(t!=="dark"&&t!=="light")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";'
  + 'b.setAttribute("data-theme",t)'
  + '}catch(e){}})(document.currentScript)</script>';

/**
 * HTML jedné fasády s oficiálním blockquote uvnitř. Hodnoty jdou z parseru
 * x-post.js (účet [A-Za-z0-9_]{1,15}, id jen číslice, href/webHref složené
 * z nich), takže do atributů nemůže utéct nic škodlivého. Žádné tlačítko,
 * žádná výzva ke kliknutí — widget se hydratuje sám; iframe vkládá až
 * widgets.js. Fasáda startuje ve stavu načítání (spinner + odkaz
 * z blockquote), který drží tvar, dokud iframe neexistuje.
 *
 * href v blockquote je kanonický twitter.com — widgets.js historicky
 * ignoroval x.com odkazy. data-dnt, data-conversation none a default
 * light téma (opravené inline skriptem výš) drží zamčený kontrakt.
 *
 * @param {{ id: string, ucet: string, href: string, webHref: string }} post
 * @returns {string}
 */
export function xEmbedHtml(post) {
  return [
    '<div class="x-embed">',
    `<div class="x-facade x-facade-loading" data-x-facade data-x-post-id="${post.id}" data-x-post-href="${post.href}">`,
    '<p class="x-facade-loading-note mono">',
    '<span class="x-facade-spinner" aria-hidden="true"></span>',
    '<span>Načítá se oficiální příspěvek z X…</span>',
    '</p>',
    '<blockquote class="twitter-tweet" data-dnt="true" data-lang="cs" data-conversation="none" data-theme="light">',
    `<a href="${post.href}">Příspěvek @${post.ucet} na X</a>`,
    '</blockquote>',
    '</div>',
    THEME_SCRIPT,
    // Fallback stojí MIMO [data-x-facade]: přežije úklid obsahu fasády
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
 * (stejná cesta jako HTML psané přímo v markdownu), takže blockquote
 * i inline skript dojdou do statického HTML beze změny a klientský skript
 * fasádu najde přes [data-x-facade].
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
