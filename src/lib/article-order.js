/**
 * Řazení článků pro veřejné výpisy: nejnovější vydání první.
 * `date` je buď kalendářní den (půlnoc UTC), nebo ISO čas — pozdější
 * timestamp proto předběhne date-only sourozence téhož dne. ID je jen
 * poslední rozřešení úplně stejného okamžiku, ne primární klíč stejného dne.
 * Porovnání ID používá přímo pořadí Unicode code units.
 */
export function compareArticlesByDateDescThenId(a, b) {
  const dateOrder = b.data.date.valueOf() - a.data.date.valueOf();
  if (dateOrder !== 0) return dateOrder;

  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

const DEN_MS = 24 * 60 * 60 * 1000;

/** Nejdelší pin od data vydání — trvalý pin („featured“ visel jako hero týdny). */
export const PIN_MAX_DNI = 7;

/**
 * `pinnedUntil` je kalendářní den (půlnoc UTC) včetně: pin platí do konce
 * toho dne UTC v okamžiku buildu. Statický web se přepíná až dalším buildem.
 * @param {{ data: { pinnedUntil?: Date } }} article
 * @param {Date} [now]
 */
export function jePripnuty(article, now = new Date()) {
  const until = article.data.pinnedUntil;
  return Boolean(until) && now.valueOf() < until.valueOf() + DEN_MS;
}

/**
 * Aktivně připnuté články dopředu, zbytek v původním pořadí. Vstup má být
 * už seřazený (compareArticlesByDateDescThenId) — mezi sebou zůstávají
 * připnuté chronologicky.
 * @template {{ data: { pinnedUntil?: Date } }} T
 * @param {T[]} articles
 * @param {Date} [now]
 * @returns {T[]}
 */
export function pripnuteNapred(articles, now = new Date()) {
  const pripnute = articles.filter((a) => jePripnuty(a, now));
  if (pripnute.length === 0) return articles;
  return [...pripnute, ...articles.filter((a) => !jePripnuty(a, now))];
}
