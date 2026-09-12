import { asciiHeadingId, nextUniqueHeadingId } from './heading-id.js';

/** Mirror the existing h2–h4 ID pipeline, including collisions with h4.
 * Astro's render metadata carries real heading text; never parse markdown twice.
 */
export function articleOutline(headings = []) {
  const seen = new Map();
  return headings.flatMap(({ depth, text, slug }) => {
    if (depth < 2 || depth > 4) return [];
    const id = nextUniqueHeadingId(asciiHeadingId(text), seen) || slug;
    return depth <= 3 && id ? [{ depth, text, id }] : [];
  });
}
