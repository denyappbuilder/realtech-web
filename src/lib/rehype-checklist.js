/**
 * Kolo 45: GFM checklist (`- [ ] …`) v těle článku.
 *
 * remark-gfm ho vykreslí jako `<input type="checkbox" disabled>` bez popisku
 * — živě 20. 9. 2026 (Custom GPT: 12 políček) axe „label“ critical, čtečka
 * u každé položky hlásí „zaškrtávací políčko, nezaškrtnuto, neaktivní“ a
 * v čtecím sloupci stojí UA formulářový prvek bez stylu. Checklist v článku
 * není formulář — je to odrážka ve tvaru políčka. Prvek se proto nahradí
 * dekorativním <span class="task-box" aria-hidden> (stav nese třída
 * task-box-checked; zaškrtnutá položka dostane pro čtečku text „Hotovo:“).
 * Styly: .article-body .task-box v global.css.
 *
 * Plugin mění jen děti <li>, ne tree.children — pořadí odstavců, se kterým
 * počítá rehype-x-embed, nechává být.
 */
export const TRIDA_BOXU = 'task-box';
export const TRIDA_BOXU_HOTOVO = 'task-box-checked';
export const TEXT_HOTOVO = 'Hotovo: ';

function jeCheckbox(node) {
  return node?.type === 'element' && node.tagName === 'input' && node.properties?.type === 'checkbox';
}

function box(zaskrtnuto) {
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: zaskrtnuto ? [TRIDA_BOXU, TRIDA_BOXU_HOTOVO] : [TRIDA_BOXU],
      ariaHidden: 'true',
    },
    children: [],
  };
}

function srOnly(text) {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['sr-only'] },
    children: [{ type: 'text', value: text }],
  };
}

/**
 * Projde strom a checkboxy v <li> nahradí dekorativním boxem.
 * Vrací počet nahrazených políček.
 * @param {{ type: string, tagName?: string, children?: any[], properties?: any }} node
 * @returns {number}
 */
export function nahradCheckboxy(node) {
  const deti = node.children ?? [];
  let pocet = 0;
  for (let i = 0; i < deti.length; i += 1) {
    const dite = deti[i];
    if (dite.type !== 'element') continue;
    if (node.type === 'element' && node.tagName === 'li' && jeCheckbox(dite)) {
      const zaskrtnuto = Boolean(dite.properties.checked);
      deti.splice(i, 1, ...(zaskrtnuto ? [box(true), srOnly(TEXT_HOTOVO)] : [box(false)]));
      pocet += 1;
      continue;
    }
    pocet += nahradCheckboxy(dite);
  }
  return pocet;
}

/** Rehype plugin pro astro.config.mjs (markdown.rehypePlugins). */
export function rehypeChecklist() {
  return (tree) => {
    nahradCheckboxy(tree);
  };
}
