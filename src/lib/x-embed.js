const STATUS_ID = /^\d{1,25}$/;
const TWITTER_HREF = /^https:\/\/twitter\.com\/[A-Za-z0-9_]{1,15}\/status\/\d{1,25}$/;

export const WIDGETS_SRC = 'https://platform.twitter.com/widgets.js';

/**
 * Nahradí lokální fasádu oficiálním embedem X až po výslovné aktivaci
 * uživatelem. Do té doby stránka neposílá nic na platform.twitter.com,
 * syndication.twitter.com ani twimg.
 *
 * Vloží blockquote.twitter-tweet s data-dnt a kanonickým twitter.com
 * odkazem (widgets.js historicky ignoroval x.com URL) a jednou načte
 * widgets.js. Widget si video přehraje ve vlastním iframe na
 * platform.twitter.com — soubor videa zůstává u X, nic nerehostujeme.
 *
 * @param {HTMLElement} facade
 * @returns {HTMLQuoteElement | null}
 */
export function aktivujXFacade(facade) {
  const id = facade.dataset.xPostId ?? '';
  const href = facade.dataset.xPostHref ?? '';
  if (!STATUS_ID.test(id) || !TWITTER_HREF.test(href)) return null;
  if (facade.querySelector('blockquote')) return null;

  const doc = facade.ownerDocument;
  const blockquote = doc.createElement('blockquote');
  blockquote.className = 'twitter-tweet';
  blockquote.setAttribute('data-dnt', 'true');
  blockquote.setAttribute('data-lang', 'cs');

  const odkaz = doc.createElement('a');
  odkaz.href = href;
  odkaz.textContent = facade.dataset.xPostTitle || 'Příspěvek na X';
  blockquote.appendChild(odkaz);

  facade.replaceChildren(blockquote);
  nactiWidgetsJs(doc);
  return blockquote;
}

/**
 * widgets.js se načítá nejvýš jednou. Když už běží (druhá fasáda na
 * stránce), stačí říct widgetu, ať znovu projde dokument.
 *
 * @param {Document} doc
 * @returns {HTMLScriptElement | null}
 */
export function nactiWidgetsJs(doc) {
  const twttr = doc.defaultView?.twttr ?? globalThis.twttr;
  if (twttr?.widgets?.load) {
    twttr.widgets.load();
    return null;
  }
  if (doc.querySelector(`script[src="${WIDGETS_SRC}"]`)) return null;

  const script = doc.createElement('script');
  script.src = WIDGETS_SRC;
  script.async = true;
  (doc.head ?? doc.body).appendChild(script);
  return script;
}

/**
 * Nativní button zajišťuje aktivaci kliknutím, Enterem i mezerníkem.
 *
 * @param {Document | ParentNode} [root]
 */
export function inicializujXFacades(root = document) {
  root.querySelectorAll('[data-x-facade]').forEach((facade) => {
    const button = facade.querySelector('.x-facade-button');
    button?.addEventListener('click', () => aktivujXFacade(facade), { once: true });
  });
}
