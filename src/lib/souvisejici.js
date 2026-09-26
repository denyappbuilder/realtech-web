/**
 * Kolo 56: „Další reporty“ pod článkem podle obsahu, ne tři nejnovější
 * z kategorie.
 *
 * Dřív: stejná kategorie seřazená od nejnovějšího → 393 slotů (131 × 3)
 * obsadilo jen 26 různých článků, 105 článků se nenabídlo nikdy a tři
 * nejnovější zabraly 236 slotů (audit 26. 9. 2026). Pod evergreen „Kdo
 * porazí Starlink“ stály zprávy o letech Starship, ne průvodce Starlinkem.
 *
 * Skóre dvojice (a = čtený článek, c = kandidát):
 *  - shoda slov titulku a slugu vážená IDF (vzácné slovo váží víc než
 *    „ai“ nebo „openai“, které má půlka webu),
 *  - +3 za odkaz jedním či druhým směrem v textu (autor je spojil sám),
 *  - +1 za stejnou kategorii, +1,5 za evergreen kandidáta ve stejné kategorii
 *    (průvodce má vyhrát nad zprávou dne),
 *  - −1 za každých 60 dní rozdílu data (zprávy stárnou, návaznost ne).
 * Kandidát bez společného tématu (součet IDF < 2 a bez odkazu) se nebere.
 * Chybějící místa doplní články ze stejné kategorie nejblíž datem, pak
 * evergreen průvodci, pak ostatní — blok má vždy 3 karty.
 *
 * Čistá funkce bez astro:content — testovatelná v node:test.
 */

const STOP = new Set((
  'a aby ale ani anebo asi az bez bude budou byl byla bylo byt co coz do dnes ho i jak jako je jeho jej jen jeji jiz jsou jsme jste k ke kde kdo kdy kdyz ktera ktere ktery kterou mu ma maji mezi mi mit mu na nad nam nas ne nebo nez nic nove novy nova o od po pod pro proc pred pri s se si sve ta tak take ten tento to toho tom tu tuto tvuj tve u uz v ve vs z za ze zatim ze co hned jde chce '
  // Česko ve všech pádech, číslovky a slova titulků, která nenesou téma
  // (review kola 56: „pěti“ spojilo Starlink konkurenty s reklamami v ChatGPT,
  // „Česka“ Ray-Ban brýle s Gemini v Chrome).
  + 'cesko ceska cesku ceskem ceske cesky ceskou cr jedna dva dve tri ctyri pet peti sest sedm osm deset sto tisic tisice milion miliard miliardy '
  + 'prvni druhy treti dalsi vsechno vsichni cely cela proti mimo kolik venku tady tohle toto teto tyto tech techto '
  + 'umi muze muzes mas dat dava dostane dostal ukazal ukazala rika rekl spousti pousti chysta konci zacina vyplati test testu testy driv pozdeji '
  + 'the and for with you your new how what why'
).split(/\s+/));

/** @param {string} s */
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** @param {{ id: string, data: { title: string } }} a */
function slova(a) {
  const text = `${norm(a.data.title)} ${a.id.replace(/-/g, ' ')}`;
  // Letopočet a čísla verzí (2026, 5, 14) spojují náhodně, ne tématem.
  return new Set(text.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)));
}

/** @param {string | undefined} body */
function odkazy(body) {
  return new Set([...(body ?? '').matchAll(/\/clanky\/([a-z0-9-]+)/g)].map((m) => m[1]));
}

/**
 * Předpočítá slova, odkazy a IDF pro celou kolekci jednou (131 článků ×
 * 131 stránek by jinak tokenizovalo 17 000×).
 *
 * @template {{ id: string, body?: string, data: { title: string, category: string, date: Date, evergreen?: boolean } }} A
 * @param {A[]} vsechny
 */
export function pripravSouvisejici(vsechny) {
  const tokeny = new Map(vsechny.map((a) => [a.id, slova(a)]));
  const odkazyZ = new Map(vsechny.map((a) => [a.id, odkazy(a.body)]));
  const df = new Map();
  for (const t of tokeny.values()) for (const w of t) df.set(w, (df.get(w) ?? 0) + 1);
  const n = Math.max(vsechny.length, 1);
  const idf = (w) => Math.log(n / (df.get(w) ?? 1));

  /** @param {A} a @param {A} c */
  function skore(a, c) {
    let s = 0, shod = 0;
    const ta = tokeny.get(a.id), tc = tokeny.get(c.id);
    for (const w of ta) if (tc.has(w)) { s += idf(w); shod++; }
    const odkaz = odkazyZ.get(a.id).has(c.id) || odkazyZ.get(c.id).has(a.id);
    const kategorie = a.data.category === c.data.category;
    // Společné téma = odkaz, nebo aspoň dvě shodná slova, nebo jedno
    // vzácné slovo ve stejné kategorii. Jediné slovo napříč kategoriemi
    // spojovalo náhodně („dřív“: iPhone Duo → hurikány, „testu“: Starlink
    // Mini → Mac mini). Bez tématu nastoupí doplněk z kategorie.
    if (!odkaz && shod < 2 && !(kategorie && s >= 2)) return 0;
    if (odkaz) s += 3;
    if (a.data.category === c.data.category) s += c.data.evergreen ? 2.5 : 1;
    s -= Math.abs(a.data.date.getTime() - c.data.date.getTime()) / 864e5 / 60;
    return s;
  }

  /**
   * @param {A} a        čtený článek
   * @param {A[]} ostatni  kandidáti bez `a`, seřazení od nejnovějšího
   * @param {number} [pocet]
   * @returns {A[]}
   */
  return function souvisejici(a, ostatni, pocet = 3) {
    const podleSkore = ostatni
      .map((c) => ({ c, s: skore(a, c) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .slice(0, pocet)
      .map((x) => x.c);
    const vybrane = new Set(podleSkore.map((c) => c.id));
    // Doplněk: stejná kategorie od nejbližšího data (ne od nejnovějšího —
    // jinak by tři čerstvé kusy zase obsadily stovky stránek), pak evergreen
    // průvodci odjinud, pak zbytek.
    const odstup = (c) => Math.abs(c.data.date.getTime() - a.data.date.getTime());
    const stejna = ostatni.filter((c) => c.data.category === a.data.category).sort((x, y) => odstup(x) - odstup(y));
    const doplnek = [
      ...stejna,
      ...ostatni.filter((c) => c.data.category !== a.data.category && c.data.evergreen),
      ...ostatni.filter((c) => c.data.category !== a.data.category && !c.data.evergreen),
    ].filter((c) => !vybrane.has(c.id));
    return [...podleSkore, ...doplnek].slice(0, pocet);
  };
}
