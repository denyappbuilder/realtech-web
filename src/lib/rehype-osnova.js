/**
 * Kolo 58: článek psaný v `###` s jediným `## Zdroje` na konci (Grokbot
 * občas píše sekce o úroveň níž) vykresloval pod <h1> rovnou <h3> — axe
 * `heading-order` na živém webu (claude-code-agents-md…, custom-gpt-konec…).
 * Osnova (kolo 45) to už srovnávala jen v obsahu článku; teď se srovná
 * i samotné HTML: nadpisy PŘED prvním <h2> se posunou o úroveň výš
 * (h3 → h2, h4 → h3). Článek, který začíná <h2>, zůstává beze změny.
 * Mění jen tagName nadpisů na nejvyšší úrovni těla — id, obsah a pořadí
 * uzlů zůstávají (X embed, CTA i tabulky na pořadí závisí).
 */
export function rehypeOsnovaUrovne() {
  return (tree) => {
    const nadpisy = (tree.children ?? []).filter(
      (node) => node.type === 'element' && /^h[2-6]$/.test(node.tagName),
    );
    if (!nadpisy.length || nadpisy[0].tagName === 'h2') return;
    for (const node of nadpisy) {
      if (node.tagName === 'h2') break;
      node.tagName = `h${Number(node.tagName[1]) - 1}`;
    }
  };
}
