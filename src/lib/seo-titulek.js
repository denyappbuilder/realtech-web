/**
 * Zkrácení `<title>` na délku, kterou Google neodseká.
 *
 * PROČ: audit 28. 7. 2026 našel, že **44 z 54 stránek má `<title>` přes
 * 60 znaků** — nejdelší 119. Ve výsledcích vyhledávání se z toho ukáže
 * jen začátek, takže se odsekne i ta část, která rozhoduje o kliknutí.
 * Nadpisy samotné jsou v pořádku (pro člověka na stránce jsou dobré),
 * problém je jen v tom, co jde do hlavičky.
 *
 * PRAVIDLO, v tomhle pořadí:
 *   1. Vzít část nadpisu PŘED pomlčkou „—". Naše nadpisy mají tvar
 *      „háček — vysvětlení", takže před pomlčkou je to podstatné.
 *      („Starlink míří na 1 Gb/s. Co chystá SpaceX v roce 2026 — satelity
 *      V3, …" → „Starlink míří na 1 Gb/s. Co chystá SpaceX v roce 2026")
 *   2. Přidat značku, ale JEN když se do limitu vejde. Značka je hezká,
 *      ale ne za cenu odseknuté informace.
 *   3. Když je i tak dlouho, zkrátit na hranici slova a přidat „…".
 *
 * Plný nadpis se NEZTRÁCÍ — zůstává v `og:title` (sociální náhledy snesou
 * víc) a samozřejmě v `h1` na stránce.
 */

const LIMIT = 60;
const ZNACKA = "REALTECH CZ";
/** Pomlčka s mezerami = oddělovač háčku od vysvětlení. Ne spojovník ve slově. */
const ODDELOVAC = /\s+[—–]\s+/;

/**
 * @param {string} nadpis plný nadpis článku nebo stránky
 * @param {{ znacka?: string, limit?: number, zachovatCely?: boolean }} [volby]
 * @returns {string} titulek do `<title>`, nikdy prázdný
 */
export function seoTitulek(nadpis, volby = {}) {
  const limit = volby.limit ?? LIMIT;
  const znacka = volby.znacka ?? ZNACKA;
  const cely = String(nadpis ?? "").trim();
  if (!cely) return znacka;

  // U článků je celý redakční titulek důležitější než pevný znakový limit.
  // Krácení za pomlčkou totiž zahazovalo hledané názvy produktů a služeb.
  if (volby.zachovatCely) return cely;

  // 1) jen část před pomlčkou — ale když by z toho zbyl ohryzek, nech celek
  const prvni = cely.split(ODDELOVAC)[0].trim();
  const jadro = prvni.length >= 15 ? prvni : cely;

  // 2) značka jen když se vejde
  const sZnackou = `${jadro} — ${znacka}`;
  if (sZnackou.length <= limit) return sZnackou;
  if (jadro.length <= limit) return jadro;

  // 3) zkrátit na hranici slova
  const rez = jadro.slice(0, limit - 1);
  const mezera = rez.lastIndexOf(" ");
  const zaklad = (mezera > limit * 0.6 ? rez.slice(0, mezera) : rez).replace(/[\s.,;:–—-]+$/, "");
  return `${zaklad}…`;
}
