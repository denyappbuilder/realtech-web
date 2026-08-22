// Spustí frontmatter (skriptovou část) src/components/ArticleCard.astro
// a vrátí hodnoty, které karta předává do šablony.
//
// Proč takhle: `.astro` se v Node neimportuje a jsdom je nová závislost
// (zakázaná). Stejnou dvojici `typescript` + `node:vm` používá v repu
// scripts/validate-content.mjs (tahá schéma z content.config.ts) i
// scripts/test-search-modal-loader.mjs (klientský <script> modalu).
//
// Testuje se tím SKUTEČNÝ kód komponenty i skutečné knihovny, na které volá
// (reading-time.js, youtube.js, karta-nahled.js) — ne jejich kopie.
// ArticleCard.astro dosud NESPOUŠTĚL žádný test: tři soubory, které ho zmiňují
// (test-karty-z1002, test-karta-png, test-youtube-id), si ho jen čtou jako text.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { readingTime } from '../src/lib/reading-time.js';
import { youtubeId } from '../src/lib/youtube.js';
import { nahledKarty } from '../src/lib/karta-nahled.js';

export const KOREN = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
export const KOMPONENTA = path.join(KOREN, 'src/components/ArticleCard.astro');

const zdroj = fs.readFileSync(KOMPONENTA, 'utf8');

/**
 * Skriptová část komponenty (mezi prvními dvěma řádky `---`).
 *
 * Oddělovač je řádek `---`, ne libovolný výskyt v textu — stejné pravidlo
 * jako u frontmatteru článků (Z10036).
 */
export function skript(text = zdroj) {
  const casti = text.split(/^---\s*$/m);
  if (casti.length < 3 || casti[0].trim() !== '') {
    throw new Error(
      'ArticleCard.astro nezačíná skriptovou částí ohraničenou řádky ---; ' +
        'uprav loader, jinak by testy tiše testovaly prázdno.',
    );
  }
  return casti[1];
}

/** Šablona komponenty (všechno za skriptovou částí). */
export function sablona(text = zdroj) {
  const casti = text.split(/^---\s*$/m);
  return casti.slice(2).join('---');
}

/**
 * Článek v tom tvaru, v jakém ho karta dostává z `getCollection('clanky')`.
 *
 * @param {object} vstup
 */
export function clanek({
  id = 'testovaci-clanek',
  body = 'Text článku.',
  title = 'Titulek',
  description = 'Popis',
  category = 'Hardware',
  date = '2026-08-19',
  video,
  videoLength,
  zprava = false,
  image,
} = {}) {
  return {
    id,
    body,
    data: {
      title,
      description,
      category,
      // Stejný tvar data, jaký dá schéma kolekce: půlnoc v UTC.
      date: new Date(`${date}T00:00:00.000Z`),
      video,
      videoLength,
      zprava,
      image,
    },
  };
}

/**
 * Vykoná skriptovou část karty nad daným článkem.
 *
 * @param {ReturnType<typeof clanek>} article
 * @returns {{
 *   thumbClass: string, dateStr: string, videoId: string | null,
 *   localThumb: string | undefined, thumbWebp: string | null, hasWebp: boolean,
 *   thumbUrl: string | undefined, thumbW: number, thumbH: number,
 *   readMinutes: number, datetime: string,
 * }}
 */
export function vykresliKartu(article) {
  const { outputText } = ts.transpileModule(skript(), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: KOMPONENTA,
  });

  const modul = { exports: {} };
  const requireZKarty = (specifier) => {
    if (specifier === '../lib/reading-time.js') return { readingTime };
    if (specifier === '../lib/youtube.js') return { youtubeId };
    if (specifier === '../lib/karta-nahled.js') return { nahledKarty };
    throw new Error(`Nepodporovaný import v ArticleCard.astro: ${specifier}`);
  };

  // Most ven ze scope skriptu — jinak jsou spočtené hodnoty uzavřené uvnitř.
  // `datetime` je přesně ten výraz, který je v šabloně u <time>; testy pak
  // porovnávají obě data karty proti sobě, ne proti vlastnímu přepočtu.
  const most = `
    exports.__karta = {
      thumbClass, dateStr, videoId,
      localThumb, thumbWebp, hasWebp,
      thumbUrl, thumbW, thumbH,
      readMinutes,
      datetime: date.toISOString().slice(0, 10),
    };
  `;

  vm.runInNewContext(
    outputText + most,
    {
      exports: modul.exports,
      module: modul,
      require: requireZKarty,
      Astro: { props: { article } },
    },
    { filename: KOMPONENTA },
  );

  const hodnoty = modul.exports.__karta;
  if (!hodnoty) {
    throw new Error('Skriptová část ArticleCard.astro nevydala žádné hodnoty.');
  }
  return hodnoty;
}
