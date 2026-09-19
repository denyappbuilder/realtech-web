/** Scroll through the authored body only: media before and discovery after
 * the text never inflate a reader's progress. Short text fits in one view. */
export function articleProgress({ top, bottom }, viewportHeight, readingEdge) {
  if (top > readingEdge) return 0;
  const travel = bottom - top - (viewportHeight - readingEdge);
  if (travel <= 0) return 100;
  return Math.max(0, Math.min(100, ((readingEdge - top) / travel) * 100));
}

/** Last section whose heading has reached the reading edge; null in the lede. */
export function currentSection(headings, readingEdge) {
  let current = null;
  for (const heading of headings) {
    if (heading.top <= readingEdge) current = heading.id;
  }
  return current;
}
