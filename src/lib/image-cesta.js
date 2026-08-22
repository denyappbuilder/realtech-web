/**
 * Tvar cesty `image` ve frontmatteru článku.
 *
 * Validátor dřív skládal `public${image}` a ptal se jen na existenci.
 * Tím prošly traversal (`/../package.json`), externí URL, cesta bez
 * úvodního lomítka i soubor mimo `/images/clanky/` (Z1066).
 *
 * @param {string} [image]
 * @returns {string | null} chybová hláška, nebo null když je tvar v pořádku
 */
export function chybaTvaruImage(image) {
  const hodnota = String(image ?? '');
  if (!hodnota) return null;
  if (hodnota.includes('://') || hodnota.includes('..')) {
    return `image "${hodnota}" nemá povolený tvar`;
  }
  if (!hodnota.startsWith('/images/clanky/')) {
    return `image "${hodnota}" musí začínat /images/clanky/`;
  }
  return null;
}
