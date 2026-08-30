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
 * Tutéž logiku nese inline skript u embedu (rehype-x-embed.js), který téma
 * opraví už při parsování HTML — tady slouží jako pojistka, kdyby inline
 * skript nedoběhl.
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
 * Převezme fasádu z serverového HTML a hlídá render oficiálního widgetu.
 *
 * Blockquote.twitter-tweet už NESTAVÍ — nese ho serverové HTML
 * (rehype-x-embed.js) a widgets.js startuje defer z <head> šablony
 * článku, takže karta se načítá po naparsování dokumentu a nečeká
 * na tenhle deferred modul. Tady zbývá jen to, co bez JS nejde:
 * MutationObserver na iframe (úklid spinneru a panelu), 15s únik
 * „Otevřít na X“ při selhání, pojistka tématu a pojistka widgets.js
 * (nactiWidgetsJs je idempotentní — skript z <head> najde a nic nepřidá).
 *
 * Když widgets.js stihl iframe vložit ještě před námi, jen se uklidí
 * stav načítání. Podvržená data-* (hand-written HTML v markdownu) fasádu
 * neaktivují — z dataset href se staví odkaz úniku a nesmí do něj utéct
 * nic mimo twitter.com status URL.
 *
 * @param {HTMLElement} facade
 * @returns {HTMLQuoteElement | null}
 */
export function aktivujXFacade(facade) {
  const id = facade.dataset.xPostId ?? '';
  const href = facade.dataset.xPostHref ?? '';
  if (!STATUS_ID.test(id) || !TWITTER_HREF.test(href)) return null;
  if (facade.querySelector('iframe')) {
    dokonciXFacade(facade);
    return null;
  }
  const blockquote = facade.querySelector('blockquote');
  if (!blockquote || facade.dataset.xFacadeBezi) return null;
  facade.dataset.xFacadeBezi = '1';

  // Pojistka tématu: inline skript u embedu ho nastavil už při parsování;
  // kdyby nedoběhl, oprava tady stále stihne widgets.js (čte blockquote
  // až po DOM ready). Po vložení iframe by už nic nezměnila — proto jen
  // dokud iframe neexistuje (kontrola výš).
  blockquote.setAttribute('data-theme', temaWidgetu(facade.ownerDocument));

  facade.classList.add('x-facade-loading');
  sledujRenderWidgetu(facade);
  nactiWidgetsJs(facade.ownerDocument);
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
 * v blockquote i fallback pod fasádou fungují dál. JS je jednovláknový,
 * takže mezi kontrolou iframe v aktivujXFacade a observe() nemůže
 * widgets.js nic vložit — pozorovateli nic neuteče.
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
 * Pojistka načtení widgets.js — primárně ho nese defer <script> v <head>
 * šablony článku (jen na stránkách s xPosts), který tahle funkce najde
 * a nic nepřidá. Když už widgets.js běží, stačí říct widgetu, ať znovu
 * projde dokument.
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
  script.defer = true;
  (doc.head ?? doc.body).appendChild(script);
  return script;
}

/**
 * Převezme všechny fasády X ze serverového HTML. Na stránce bez fasád se
 * nic neděje — widgets.js na ni nepatří (v <head> je jen při xPosts a ani
 * pojistka tady ho bez fasády nenačte).
 *
 * @param {Document | ParentNode} [root]
 */
export function inicializujXFacades(root = document) {
  root.querySelectorAll('[data-x-facade]').forEach((facade) => {
    aktivujXFacade(facade);
  });
}
