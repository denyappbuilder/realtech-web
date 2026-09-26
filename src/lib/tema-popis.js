/**
 * Kolo 55: popisy AI Agenti / Drony / Mobily / Sítě / Vesmír / Hardware měly 53–71 znaků
 * (meta description pod ~70 znaků Google doplňuje vlastním výtahem);
 * rozšířeny jen o to, co články rubriky opravdu pokrývají.
 *
 * Popisy témat sdílené hubem /temata/ a stránkami /temata/[slug]/,
 * aby obě místa říkala o tématu totéž.
 */
export const POPISY_TEMAT = {
  'AI Report': 'Novinky a analýzy ze světa umělé inteligence — modely, nástroje a kauzy, které reálně něco mění.',
  'AI Agenti': 'AI agenti a automatizace — Claude, Gemini, OpenAI a Meta: co za tebe reálně udělají, co je v Česku a kde jsou rizika.',
  'Drony': 'Drony bez marketingových řečí — DJI, zákaz v USA a co z něj plyne pro Evropu, srovnání a novinky.',
  'Vesmír': 'Vesmír a kosmické technologie — Starship, Falcon, mise NASA, SpaceX a satelitní internet Starlink.',
  'Hardware': 'Hardware — Mac, Nvidia, Windows na ARM, AI čipy, kamery a hodinky: co je nového a co ukázaly nezávislé testy.',
  'Mobily': 'Mobily a skládačky — iPhone, Pixel, Samsung Galaxy Z a Android: novinky, ceny v Česku a jestli se vyplatí.',
  'Sítě': 'Sítě a konektivita — Starlink v Česku, testy, ceny a spotřeba, 5G a bezpečnost na cizí Wi-Fi.',
};

/** @param {string} category */
export const popisTematu = (category) =>
  POPISY_TEMAT[category] ?? `Články z kategorie ${category} — tech bez marketingových řečí.`;
