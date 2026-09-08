/**
 * Počet článků česky: 1 článek, 2–4 články, 0 a 5+ článků.
 *
 * Kolo 32: hub /temata/ skloňoval správně (vlastní helper), stránka tématu
 * psala natvrdo „{n} článků“ — živě 8. 9. 2026 /temata/drony/ ukazovalo
 * „2 článků“. Jedno místo pro obě šablony; klientský skript archivu má
 * stejnou logiku vlastní (inline <script> se bez importů testuje ve vm).
 *
 * @param {number} pocet
 * @returns {string}
 */
export function textPoctuClanku(pocet) {
  if (pocet === 1) return '1 článek';
  if (pocet >= 2 && pocet <= 4) return `${pocet} články`;
  return `${pocet} článků`;
}
