// Klientská část komentářů (giscus). Volá se z <script> v Giscus.astro.
//
// Skript giscus.app/client.js nevkládá serverové HTML, ale tenhle modul —
// jediný důvod je téma: client.js čte data-theme jednou při spuštění a
// server neví, jestli má čtenář web ručně přepnutý (localStorage). Serverový
// <script data-theme="preferred_color_scheme"> by čtenáři s OS ve světlém a
// webem v tmavém režimu vykreslil bílý widget a teprve po načtení iframu
// ho přebarvil. Tady se téma spočítá hned a widget se rovnou narodí správně.
//
// Přepnutí toggle za běhu: client.js na změny nereaguje, ale widget přijímá
// zprávu `setConfig` přes postMessage — hlídá to MutationObserver na
// data-theme <html>.
import { GISCUS_CLIENT_SRC, GISCUS_ORIGIN, GISCUS_PEVNE, giscusTema } from './giscus.js';

/**
 * data-* atributy pro <script src="https://giscus.app/client.js">.
 *
 * Konfigurace repozitáře jde z data-* kontejneru (serverové HTML, hodnoty
 * z env), pevná část z GISCUS_PEVNE, téma z aktuálního stavu <html>.
 *
 * @param {{ repo?: string, repoId?: string, category?: string, categoryId?: string }} konfig
 * @param {string | undefined} datasetTheme
 * @returns {Record<string, string> | null} null, když chybí repo ID nebo category ID
 */
export function atributySkriptu(konfig, datasetTheme) {
  const { repo, repoId, category = '', categoryId } = konfig;
  if (!repo || !repoId || !categoryId) return null;
  return {
    repo,
    repoId,
    category,
    categoryId,
    ...GISCUS_PEVNE,
    theme: giscusTema(datasetTheme),
  };
}

/**
 * Předá widgetu nové téma.
 *
 * Načtený iframe dostane zprávu `setConfig` (postMessage, jen na origin
 * giscus.app). Iframe, který se ještě načítá (lazy, pod ohybem — třída
 * giscus-frame--loading od client.js), by zprávu zahodil; tomu se přepíše
 * parametr `theme` v src, takže se rovnou načte správně.
 *
 * @param {Document} doc
 * @param {string} tema
 * @returns {'zprava' | 'src' | null} jak se téma předalo; null = iframe není
 */
export function poslatTemaGiscus(doc, tema) {
  const iframe = doc.querySelector('iframe.giscus-frame');
  if (!iframe) return null;
  if (iframe.classList.contains('giscus-frame--loading')) {
    const src = new URL(iframe.getAttribute('src') ?? '', GISCUS_ORIGIN);
    src.searchParams.set('theme', tema);
    iframe.setAttribute('src', src.href);
    return 'src';
  }
  const okno = iframe.contentWindow;
  if (!okno) return null;
  okno.postMessage({ giscus: { setConfig: { theme: tema } } }, GISCUS_ORIGIN);
  return 'zprava';
}

/**
 * Vloží client.js do kontejneru `.giscus[data-giscus]` a drží téma
 * v souladu s webem.
 *
 * Idempotentní: druhé volání (nebo druhý kontejner) nic nevloží — client.js
 * hledá `document.querySelector('.giscus')`, takže na stránce smí být jen
 * jeden. Vrací vložený <script>, nebo null, když nebylo co dělat.
 *
 * @param {Document} doc
 * @returns {HTMLScriptElement | null}
 */
export function inicializujGiscus(doc = document) {
  const kontejner = doc.querySelector('.giscus[data-giscus]');
  if (!kontejner || kontejner.dataset.giscusBezi) return null;

  const koren = doc.documentElement;
  const atributy = atributySkriptu(
    {
      repo: kontejner.dataset.repo,
      repoId: kontejner.dataset.repoId,
      category: kontejner.dataset.category,
      categoryId: kontejner.dataset.categoryId,
    },
    koren.dataset.theme,
  );
  if (!atributy) return null;
  kontejner.dataset.giscusBezi = '1';

  const skript = doc.createElement('script');
  skript.src = GISCUS_CLIENT_SRC;
  skript.async = true;
  skript.crossOrigin = 'anonymous';
  for (const [klic, hodnota] of Object.entries(atributy)) {
    skript.dataset[klic] = hodnota;
  }
  kontejner.appendChild(skript);

  const okno = doc.defaultView;
  if (okno && typeof okno.MutationObserver === 'function') {
    const pozorovatel = new okno.MutationObserver(() => {
      poslatTemaGiscus(doc, giscusTema(koren.dataset.theme));
    });
    pozorovatel.observe(koren, { attributes: true, attributeFilter: ['data-theme'] });
  }

  return skript;
}
