const STATUS_ID = /^\d{1,25}$/;
const TWITTER_HREF = /^https:\/\/twitter\.com\/[A-Za-z0-9_]{1,15}\/status\/\d{1,25}$/;

export const WIDGETS_SRC = 'https://platform.twitter.com/widgets.js';

// Pojistka pro případ, že widgets.js nenaběhne (adblock, výpadek): spinner
// nesmí točit donekonečna a čtenář nesmí zůstat v mrtvé krabici s holým
// odkazem — po limitu fasáda ukáže viditelný únik „Otevřít na X“.
const LIMIT_NACITANI_MS = 15000;

/**
 * Widget X umí dark/light — bez toho by na tmavém webu svítila bílá karta.
 * Ruční přepnutí (data-theme na <html>) má přednost, jinak systémové schéma.
 *
 * @param {Document} doc
 * @returns {'dark' | 'light'}
 */
export function temaWidgetu(doc) {
  const rucni = doc.documentElement?.dataset?.theme;
  if (rucni === 'dark' || rucni === 'light') return rucni;
  return doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'dark'
    : 'light';
}

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
 * Mezi klikem a iframem fasáda drží tvar se spinnerem a odkazem — tlačítko
 * nesmí zmizet do prázdného paddingu. Jakmile widget vloží iframe, fasáda
 * (dokonciXFacade) odloží panel i rámeček a tweet si výšku řídí sám.
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
  blockquote.setAttribute('data-conversation', 'none');
  blockquote.setAttribute('data-theme', temaWidgetu(doc));

  const odkaz = doc.createElement('a');
  odkaz.href = href;
  odkaz.textContent = facade.dataset.xPostTitle || 'Příspěvek na X';
  blockquote.appendChild(odkaz);

  const spinner = doc.createElement('span');
  spinner.className = 'x-facade-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  const text = doc.createElement('span');
  text.textContent = 'Načítá se oficiální příspěvek z X…';
  const nacitani = doc.createElement('p');
  nacitani.className = 'x-facade-loading-note mono';
  nacitani.appendChild(spinner);
  nacitani.appendChild(text);

  facade.classList.add('x-facade-loading');
  facade.replaceChildren(nacitani, blockquote);
  sledujRenderWidgetu(facade);
  nactiWidgetsJs(doc);
  return blockquote;
}

/**
 * Konec načítání: pryč spinner i panel (třída x-facade-loaded shodí
 * rámeček a pozadí), aby si tweet určil výšku sám a kolem něj nezbyla
 * prázdná studna. Uklidí i případný stav selhání — widget může
 * zhydratovat dodatečně (pomalá síť), pozorovatel běží dál.
 *
 * @param {HTMLElement} facade
 */
export function dokonciXFacade(facade) {
  facade.classList.remove('x-facade-loading');
  facade.classList.remove('x-facade-failed');
  facade.classList.add('x-facade-loaded');
  facade.querySelector('.x-facade-loading-note')?.remove();
  facade.querySelector('.x-facade-failed-note')?.remove();
}

/**
 * Widget nenaběhl (adblock na widgets.js, výpadek X): čtenář nesmí zůstat
 * v mrtvé krabici s holým odkazem a drobnou poznámkou pod ní. Spinner
 * končí a fasáda ukáže zřetelný únik „Otevřít na X“ (x.com — lidský odkaz,
 * twitter.com href v blockquote je jen pro widgets.js). Blockquote zůstává:
 * kdyby widgets.js dorazil pozdě, pozorovatel selhání zase uklidí.
 *
 * @param {HTMLElement} facade
 */
export function oznacSelhaniXFacade(facade) {
  facade.classList.remove('x-facade-loading');
  facade.classList.add('x-facade-failed');
  facade.querySelector('.x-facade-loading-note')?.remove();
  if (facade.querySelector('.x-facade-failed-note')) return;

  const doc = facade.ownerDocument;
  const text = doc.createElement('span');
  text.textContent = 'Vložený příspěvek z X se nenačetl.';
  const odkaz = doc.createElement('a');
  odkaz.className = 'x-facade-open';
  odkaz.href = (facade.dataset.xPostHref ?? '').replace('https://twitter.com/', 'https://x.com/');
  odkaz.target = '_blank';
  odkaz.rel = 'noopener';
  odkaz.textContent = 'Otevřít na X →';

  const note = doc.createElement('p');
  note.className = 'x-facade-failed-note';
  note.appendChild(text);
  note.appendChild(odkaz);
  facade.appendChild(note);
}

/**
 * widgets.js nedává callback do našeho kódu — vložený iframe hlídá
 * MutationObserver. Bez něj (testy) se stav načítání nechá být; odkaz
 * v blockquote i fallback pod fasádou fungují dál.
 *
 * @param {HTMLElement} facade
 */
function sledujRenderWidgetu(facade) {
  const win = facade.ownerDocument.defaultView;
  if (!win?.MutationObserver) return;

  const observer = new win.MutationObserver(() => {
    if (!facade.querySelector('iframe')) return;
    observer.disconnect();
    win.clearTimeout(pojistka);
    dokonciXFacade(facade);
  });
  observer.observe(facade, { childList: true, subtree: true });
  const pojistka = win.setTimeout(() => oznacSelhaniXFacade(facade), LIMIT_NACITANI_MS);
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
