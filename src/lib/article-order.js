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
