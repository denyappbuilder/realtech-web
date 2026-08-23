/**
 * Řazení článků pro veřejné výpisy: nejnovější datum první, při shodě
 * stabilně podle ID. Porovnání ID používá přímo pořadí Unicode code units,
 * takže výsledek nezávisí na locale ani prostředí buildu.
 */
export function compareArticlesByDateDescThenId(a, b) {
  const dateOrder = b.data.date.valueOf() - a.data.date.valueOf();
  if (dateOrder !== 0) return dateOrder;

  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}
