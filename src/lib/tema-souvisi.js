/**
 * Kolo 42: kurátorované cross-linky na hubu tématu /temata/{slug}/.
 *
 * Každý článek má JEDNU kategorii (schéma, filtr `?kat=` v archivu). Když
 * článek věcně patří i jinam — RTX Spark PC (nákupní průvodce lokálním AI
 * počítačem) je AI Report, ale čtenář ho hledá pod Hardware — kategorie se
 * nemění; hub druhého tématu dostane odkaz odsud. Redakční seznam, ne
 * heuristika: slugy článků z JINÉ kategorie v pořadí, v jakém se mají ukázat.
 *
 * @type {Record<string, string[]>}
 */
export const SOUVISI_S_TEMATEM = {
  Hardware: ['rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat'],
};

/**
 * Články pro blok „Souvisí s tématem“ na hubu. Drží pořadí seznamu; vynechá
 * slug, který v kolekci není (draft, smazaný) nebo už v tématu je (pak by
 * byl v mřížce dvakrát).
 *
 * @template {{ id: string, data: { category: string } }} T
 * @param {string} category
 * @param {T[]} vsechny — nedraftové články (getCollection s filtrem !draft)
 * @returns {T[]}
 */
export function souvisejiciClanky(category, vsechny) {
  const slugy = SOUVISI_S_TEMATEM[category] ?? [];
  const podleId = new Map(vsechny.map((c) => [c.id, c]));
  return slugy
    .map((slug) => podleId.get(slug))
    .filter((c) => c !== undefined && c.data.category !== category);
}
