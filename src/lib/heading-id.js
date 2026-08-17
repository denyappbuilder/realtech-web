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
