/** Last section whose heading has reached the reading edge; null in the lede. */
export function currentSection(headings, readingEdge) {
  let current = null;
  for (const heading of headings) {
    if (heading.top <= readingEdge) current = heading.id;
  }
  return current;
}
