/**
 * Text na hero obrázku homepage.
 *
 * Titulek článku už je v `<h1>` hned vedle. Stejný řetězec v overlay
 * (`.headline-mark`) zdvojoval první dojem — vidět na snímcích
 * `web-svetly-uvod.png` / `web-uvod.png` / `web-mobil-uvod.png` (Z1005).
 *
 * Overlay proto nese jen výzvu k akci, nikdy titulek.
 *
 * Po Z1005 ale výzva bez videa znovu zdvojila tlačítko
 * „Přečíst analýzu“ (Z555, `web-mobil-uvod.png`). Bez videa
 * proto overlay mlčí — tlačítko tu výzvu už nese. S videem
 * smí říct „Pustit video“, protože to tlačítko neříká.
 */

function normalizuj(hodnota) {
  return String(hodnota ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

const CTA_TLACITKA = "Přečíst analýzu";

/**
 * @param {{ title?: string, video?: string }} [clanek]
 * @returns {string} text do `.headline-mark`, nebo prázdný řetězec
 */
export function textNaHeroObrazku(clanek = {}) {
  const titulek = String(clanek.title ?? "").trim();
  const overlay = String(clanek.video ?? "").trim() ? "Pustit video" : "";
  if (!overlay) return "";
  if (titulek && normalizuj(overlay) === normalizuj(titulek)) return "";
  if (normalizuj(overlay) === normalizuj(CTA_TLACITKA)) return "";
  return overlay;
}
