/**
 * Zkrátí popis pro `<meta name="description">` a `og:description`.
 *
 * 🔴 PROČ (audit 30. 7. 2026): 35 ze 46 článků mělo popis nad 160 znaků, jeden
 * 242. Google zobrazuje kolem 155–160 a zbytek uřízne — u Starlink článku tak
 * zmizela celá poslední věta „Rozebíráme, co z toho uvidíme v Česku."
 * Ve výsledku hledání pak stojí věta, která nekončí.
 *
 * ⚠️ ŘEŽE SE PO VĚTÁCH, ne po znacích. Uříznutá věta uprostřed slova vypadá
 * jako chyba a čtenář nepozná, jestli mu web něco tají. Kratší úplná věta je
 * lepší než dlouhá nedokončená — proto tahle funkce raději vrátí 89 znaků,
 * když druhá věta už by se nevešla.
 *
 * Původní `description` se NEMĚNÍ — zůstává na kartách článků jako perex,
 * kde delší text vadí méně. Tohle je jen odvozená verze pro vyhledávače.
 */

/** Kolik znaků Google reálně zobrazí. Nad tím se text uřízne. */
export const LIMIT_POPISU = 160;

/**
 * Pod touto délkou už popis nenese informaci, takže se radši připojí další
 * věta i za cenu tvrdého zkrácení. Prakticky nastává jen u velmi krátkých
 * prvních vět.
 */
const MINIMUM = 50;

/**
 * @param {string | undefined} popis Původní popis (frontmatter `description`).
 * @param {number} limit Volitelný jiný limit (og snese víc, ale držíme jeden).
 * @returns {string} Popis, který se vejde a končí celou větou.
 */
export function popisProVyhledavace(popis, limit = LIMIT_POPISU) {
  const text = (popis ?? '').trim();
  if (text.length <= limit) return text;

  // Rozdělit na věty. Lookbehind na tečku/!/? a mezeru — čísla jako „9 500"
  // se tím nerozdělí, protože po tečce v „200 Mb/s." následuje mezera a velké
  // písmeno, zatímco v desetinných číslech mezera není.
  const vety = text.split(/(?<=[.!?])\s+/);

  let vysledek = '';
  for (const veta of vety) {
    const zkusit = vysledek ? `${vysledek} ${veta}` : veta;
    if (zkusit.length > limit) break;
    vysledek = zkusit;
  }

  if (vysledek.length >= MINIMUM) return vysledek;

  // Nouzová cesta: první věta je delší než limit, nebo v textu žádná tečka
  // není. Řež na hranici slova a přidej výpustku, ať je vidět, že text
  // pokračuje — to je pořád lepší než slovo přeseknuté v polovině.
  const hrube = text.slice(0, limit - 1);
  const mezera = hrube.lastIndexOf(' ');
  return `${(mezera > MINIMUM ? hrube.slice(0, mezera) : hrube).trimEnd()}…`;
}
