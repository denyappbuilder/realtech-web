/**
 * Obalí každou markdown tabulku v těle článku do <div class="table-wrap">.
 *
 * Proč v buildu, ne CSS `table { display: block; overflow-x: auto }`: změna
 * display na tabulce shazuje v Safari/VoiceOveru sémantiku tabulky (řádky
 * a sloupce se nečtou), a bez obalu by široká tabulka na 375px roztáhla
 * .article-body a celý sloupec článku. Obal nese rolování, tabulka zůstává
 * tabulkou. Styly: .article-body .table-wrap v global.css.
 *
 * Tabulka, kterou už obal má (ruční HTML v markdownu), se neobaluje dvakrát.
 */
export const TRIDA_OBALU = 'table-wrap';

function jeObal(node) {
  return (
    node?.type === 'element'
    && node.tagName === 'div'
    && (node.properties?.className ?? []).includes(TRIDA_OBALU)
  );
}

/**
 * Projde strom a tabulky bez obalu zabalí. Vrací počet obalených tabulek.
 * @param {{ type: string, tagName?: string, children?: any[], properties?: any }} node
 * @returns {number}
 */
export function obalTabulky(node) {
  const deti = node.children ?? [];
  let pocet = 0;
  for (let i = 0; i < deti.length; i += 1) {
    const dite = deti[i];
    if (dite.type !== 'element') continue;
    if (dite.tagName === 'table' && !jeObal(node)) {
      deti[i] = {
        type: 'element',
        tagName: 'div',
        properties: { className: [TRIDA_OBALU] },
        children: [dite],
      };
      pocet += 1;
      continue;
    }
    pocet += obalTabulky(dite);
  }
  return pocet;
}

/** Rehype plugin pro astro.config.mjs (markdown.rehypePlugins). */
export function rehypeTabulky() {
  return (tree) => {
    obalTabulky(tree);
  };
}
