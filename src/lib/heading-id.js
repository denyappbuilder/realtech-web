/**
 * ASCII fragment pro `id` nadpisu.
 *
 * Ořez na 60 znaků musí přijít PŘED odstraněním krajních pomlček.
 * Když se nejdřív očistí okraje a až potom ořízne, oddělovač na
 * 60. pozici zůstane na konci (Z1064 / HEADING-ID-001).
 *
 * @param {string} [s]
 * @returns {string}
 */
export function asciiHeadingId(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 60)
    .replace(/^-|-$/g, '');
}

/**
 * Pořadové číslo AŽ PO ořezu na 60 znaků (Z1207 / REHYPE-NADPISY-001).
 * Stejná konvence jako github-slugger: první výskyt bez přípony,
 * druhý `-1`, třetí `-2`. Přípona se nesmí dostat do slice(0, 60),
 * jinak se u dlouhých nadpisů ořízne a kolize zůstane.
 *
 * @param {string} base
 * @param {Map<string, number>} seen
 * @returns {string}
 */
export function nextUniqueHeadingId(base, seen) {
  if (!base) return '';
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}
