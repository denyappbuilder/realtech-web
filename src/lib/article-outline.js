import { asciiHeadingId, nextUniqueHeadingId } from './heading-id.js';

/** Mirror the existing h2–h4 ID pipeline, including collisions with h4.
 * Astro's render metadata carries real heading text; never parse markdown twice.
 *
 * Kolo 44: `depth` je relativní k nejmělčímu nadpisu v osnově, ne absolutní
 * úroveň HTML. Článek psaný jen v `###` (živě 19. 9. 2026 ChatGPT ve Wordu:
 * 8× h3, žádné h2) měl v obsahu všech osm položek odsazených jako podsekce
 * bez rodiče. Sekce článku jsou to, co je nejvýš; podsekce jen to pod tím.
 * ID nadpisů zůstávají stejná (kotvy v textu se nemění).
 *
 * Kolo 45: „nejmělčí nadpis v osnově“ nestačí — články psané v `###`
 * s jediným `## Zdroje` na konci (živě 20. 9. 2026 AGENTS.md i Custom
 * GPT) měly zase všech 8 sekcí odsazených jako podsekce a jako jedinou
 * sekci „Zdroje“. Podsekce je jen nadpis, před kterým už stojí mělčí
 * nadpis (má rodiče); hloubka se proto počítá proti minimu DOSUD viděných
 * úrovní, ne celého pole.
 */
export function articleOutline(headings = []) {
  const seen = new Map();
  const items = headings.flatMap(({ depth, text, slug }) => {
    if (depth < 2 || depth > 4) return [];
    const id = nextUniqueHeadingId(asciiHeadingId(text), seen) || slug;
    return depth <= 3 && id ? [{ depth, text, id }] : [];
  });
  let top = Infinity;
  return items.map((item) => {
    const podsekce = item.depth > top;
    top = Math.min(top, item.depth);
    return { ...item, depth: podsekce ? 3 : 2 };
  });
}
