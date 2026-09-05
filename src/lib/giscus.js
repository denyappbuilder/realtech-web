// Komentáře pod článkem přes giscus (GitHub Discussions).
//
// Konfigurace jde výhradně z veřejných env proměnných Astra
// (PUBLIC_GISCUS_*, viz docs/giscus.md) — žádná ID v kódu. Když repo ID
// nebo category ID chybí, komponenta se NEVYKRESLÍ: giscus by jinak ukázal
// rozbitý iframe s chybou API. Repo má výchozí hodnotu, ID výchozí mít
// nemohou — jsou to GraphQL node ID konkrétního repozitáře a kategorie.

export const GISCUS_ORIGIN = 'https://giscus.app';
export const GISCUS_CLIENT_SRC = `${GISCUS_ORIGIN}/client.js`;
export const GISCUS_VYCHOZI_REPO = 'denyappbuilder/realtech-web';

/** Env proměnné, bez kterých widget nemá smysl vykreslovat. */
export const GISCUS_POVINNE = ['PUBLIC_GISCUS_REPO_ID', 'PUBLIC_GISCUS_CATEGORY_ID'];

// GitHub: vlastník (uživatel/organizace) je alfanumerický s pomlčkami,
// název repozitáře smí mít i tečku a podtržítko. Nic jiného do data-repo
// nepustíme — hodnota končí v URL iframu.
const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\/[A-Za-z0-9._-]{1,100}$/;

/**
 * Pevná část konfigurace widgetu — stejná pro každý článek.
 *
 * mapping=pathname: diskuze se páruje podle cesty URL (/clanky/slug/), ne
 * podle titulku, který se může redakčně měnit. strict=0: pathname je sám
 * dost jednoznačný. Vše jako řetězce — giscus je čte z data-* atributů.
 */
export const GISCUS_PEVNE = Object.freeze({
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'cs',
  loading: 'lazy',
});

function orez(hodnota) {
  return typeof hodnota === 'string' ? hodnota.trim() : '';
}

/**
 * Které povinné proměnné v env chybí (prázdný řetězec = chybí).
 *
 * @param {Record<string, unknown> | undefined} env
 * @returns {string[]}
 */
export function giscusChybejici(env) {
  return GISCUS_POVINNE.filter((jmeno) => !orez(env?.[jmeno]));
}

/**
 * Konfigurace widgetu z env, nebo null, když se komentáře nemají vykreslit.
 *
 * @param {Record<string, unknown> | undefined} env `import.meta.env`
 * @returns {{ repo: string, repoId: string, category: string, categoryId: string } | null}
 */
export function giscusKonfigurace(env) {
  if (giscusChybejici(env).length > 0) return null;
  const repo = orez(env.PUBLIC_GISCUS_REPO) || GISCUS_VYCHOZI_REPO;
  if (!REPO.test(repo)) return null;
  return {
    repo,
    repoId: orez(env.PUBLIC_GISCUS_REPO_ID),
    category: orez(env.PUBLIC_GISCUS_CATEGORY),
    categoryId: orez(env.PUBLIC_GISCUS_CATEGORY_ID),
  };
}

/**
 * Odkaz na diskuze repozitáře — únik pro čtenáře bez JavaScriptu.
 *
 * @param {string} repo `vlastnik/repozitar`
 */
export function giscusDiskuzeUrl(repo) {
  return `https://github.com/${repo}/discussions`;
}

let varovano = false;

/**
 * Jednorázové varování do konzole dev serveru, proč komentáře chybí.
 * V produkčním buildu se nevolá (komponenta ho podmiňuje `import.meta.env.DEV`).
 *
 * @param {Record<string, unknown> | undefined} env
 * @param {{ warn: (zprava: string) => void }} [konzole]
 * @returns {boolean} jestli se varování vypsalo
 */
export function varujGiscus(env, konzole = console) {
  const chybi = giscusChybejici(env);
  if (chybi.length === 0 || varovano) return false;
  varovano = true;
  konzole.warn(
    `[giscus] Komentáře pod články se nevykreslí — chybí ${chybi.join(' a ')}. ` +
      'Postup je v docs/giscus.md.',
  );
  return true;
}

/** Jen pro testy — resetuje jednorázové varování. */
export function resetVarovaniGiscus() {
  varovano = false;
}

/**
 * Téma widgetu podle webu.
 *
 * Ruční přepnutí (data-theme na <html>, viz toggle v Base.astro) má
 * přednost a mapuje se na pevné giscus téma. Bez ručního přepnutí web
 * sleduje OS — a totéž umí giscus sám přes `preferred_color_scheme`,
 * včetně reakce na změnu schématu za běhu. Není tedy potřeba hlídat
 * matchMedia z naší strany.
 *
 * @param {string | undefined} datasetTheme `document.documentElement.dataset.theme`
 * @returns {'light' | 'dark' | 'preferred_color_scheme'}
 */
export function giscusTema(datasetTheme) {
  if (datasetTheme === 'light' || datasetTheme === 'dark') return datasetTheme;
  return 'preferred_color_scheme';
}
