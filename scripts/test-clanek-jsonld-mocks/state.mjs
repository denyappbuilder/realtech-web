// Stav pro testy strukturovaných dat článku. Drží fixture kolekce, seznam
// souborů, které „leží na disku“, a Astro objekt, který stránka čte.
const SITE = new URL('https://realtech.cz/');

let clanek = null;
let kolekce = [];
let existujici = new Set();
let cesta = '/clanky/ukazka/';
let dotazyNaSoubory = [];

export function resetMocks() {
  clanek = null;
  kolekce = [];
  existujici = new Set();
  cesta = '/clanky/ukazka/';
  dotazyNaSoubory = [];
}

export function setClanek(article) {
  clanek = article;
}

export function setKolekce(entries) {
  kolekce = entries;
}

export function setExistujiciSoubory(soubory) {
  existujici = new Set(soubory);
}

export function setCestu(pathname) {
  cesta = pathname;
}

export function dotazy() {
  return [...dotazyNaSoubory];
}

/** Astro globál, jak ho vidí frontmatter stránky článku. */
export function getAstro() {
  return {
    props: { article: clanek },
    site: SITE,
    url: new URL(cesta, SITE),
  };
}

export function existsSync(soubor) {
  dotazyNaSoubory.push(String(soubor));
  return existujici.has(String(soubor));
}

export async function getCollection(name, filter) {
  if (name !== 'clanky') {
    throw new Error(`Neočekávaná kolekce: ${name}`);
  }
  return kolekce.filter((entry) => filter(entry));
}

export async function render() {
  return { Content: () => undefined };
}
