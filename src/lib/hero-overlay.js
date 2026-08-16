/**
 * Text na hero obrázku homepage.
 *
 * Titulek článku už je v `<h1>` hned vedle. Stejný řetězec v overlay
 * (`.headline-mark`) zdvojoval první dojem — vidět na snímcích
 * `web-svetly-uvod.png` / `web-uvod.png` / `web-mobil-uvod.png` (Z1005).
 *
 * Overlay proto nese jen výzvu k akci, nikdy titulek.
 */

function normalizuj(hodnota) {
  return String(hodnota ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

/**
 * @param {{ title?: string, video?: string }} [clanek]
 * @returns {string} text do `.headline-mark`, nebo prázdný řetězec
 */
export function textNaHeroObrazku(clanek = {}) {
  const titulek = String(clanek.title ?? "").trim();
  const cta = String(clanek.video ?? "").trim() ? "Pustit video" : "Přečíst analýzu";
  if (titulek && normalizuj(cta) === normalizuj(titulek)) return "";
  return cta;
}
