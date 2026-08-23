/**
 * Popisy témat sdílené hubem /temata/ a stránkami /temata/[slug]/,
 * aby obě místa říkala o tématu totéž.
 */
export const POPISY_TEMAT = {
  'AI Report': 'Novinky a analýzy ze světa umělé inteligence — modely, nástroje a kauzy, které reálně něco mění.',
  'AI Agenti': 'AI agenti a automatizace — co už dnes zvládnou udělat za vás.',
  'Drony': 'Drony bez marketingových řečí — DJI, zákazy, srovnání a novinky.',
  'Vesmír': 'Vesmír a kosmické technologie — SpaceX, Starlink a satelitní internet.',
  'Hardware': 'Hardware — procesory, notebooky a komponenty, které stojí za pozornost.',
  'Mobily': 'Mobily a skládačky — novinky, srovnání a jestli se vyplatí.',
  'Sítě': 'Sítě a konektivita — Starlink, 5G a internet v Česku.',
};

/** @param {string} category */
export const popisTematu = (category) =>
  POPISY_TEMAT[category] ?? `Články z kategorie ${category} — tech bez marketingových řečí.`;
