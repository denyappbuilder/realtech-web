/**
 * Kolik karet posílá jedna stránka výpisu. Sdílí ho archiv (/clanky/)
 * i témata (/temata/{slug}/) — jedna konstanta, aby se velikost stránky
 * obou výpisů nemohla rozjet a odkazy „Starší →" vždy mířily na
 * existující stranu.
 */
export const ARTICLES_PER_PAGE = 15;
