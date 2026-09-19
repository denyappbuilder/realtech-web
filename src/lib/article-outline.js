import { asciiHeadingId, nextUniqueHeadingId } from './heading-id.js';

/** Mirror the existing h2–h4 ID pipeline, including collisions with h4.
 * Astro's render metadata carries real heading text; never parse markdown twice.
 *
 * Kolo 44: `depth` je relativní k nejmělčímu nadpisu v osnově, ne absolutní
 * úroveň HTML. Článek psaný jen v `###` (živě 19. 9. 2026 ChatGPT ve Wordu:
 * 8× h3, žádné h2) měl v obsahu všech osm položek odsazených jako podsekce
 * bez rodiče. Sekce článku jsou to, co je nejvýš; podsekce jen to pod tím.
 * ID nadpisů zůstávají stejná (kotvy v textu se nemění).
 */
export function articleOutline(headings = []) {
  const seen = new Map();
  const items = headings.flatMap(({ depth, text, slug }) => {
    if (depth < 2 || depth > 4) return [];
    const id = nextUniqueHeadingId(asciiHeadingId(text), seen) || slug;
    return depth <= 3 && id ? [{ depth, text, id }] : [];
  });
  const top = Math.min(...items.map((item) => item.depth));
  return items.map((item) => ({ ...item, depth: item.depth === top ? 2 : 3 }));
}
