/**
 * Filtr archivu /clanky/?q=…&kat=… mimo prohlížeč.
 *
 * Kolo 37: /clanky/?q=starlink i ?kat=Drony vracely živě (12. 9. 2026)
 * stejných 15 nefiltrovaných karet s čipem „Vše“ — filtr běžel jen
 * v klientském skriptu ArticleArchivePage. Bez JS (a pro crawlery, kteří
 * ctí SearchAction z JSON-LD úvodky) tak query parametry nedělaly nic.
 *
 * Web je statický (Cloudflare Pages), ale requesty už procházejí Pages
 * Function (functions/_middleware.js — kanonizace hostu). Tenhle modul je
 * čistá logika pro functions/clanky/index.js: parametry z URL, výběr ze
 * search-index.json (stejný index a stejná shoda jako klientský filtr) a
 * HTML karty z indexu ve tvaru SSR ArticleCard. Klientský skript má tutéž
 * logiku vlastní (inline <script> se bez importů testuje ve vm) —
 * test-kolo-37-archiv.mjs hlídá, že obě strany dávají stejnou kartu.
 */

/** Delší dotaz nemá smysl a nepatří ani do URL, ani do <input value>. */
export const MAX_DELKA_DOTAZU = 200;

/**
 * Kolo 38: „Zrušit filtr“ pro čtenáře bez skriptu — odkaz na čistý archiv,
 * který edge vloží za tlačítko .filter-reset jen na vyfiltrované straně
 * (bez filtru není co rušit). Tlačítko samo bez JS schová <noscript><style>
 * v <head> archivu; s JS <noscript> nic nevykreslí a tlačítko zůstává.
 */
export const ODKAZ_ZRUSIT_FILTR =
  '<noscript><a class="btn-ghost filter-reset" href="/clanky/">Zrušit filtr</a></noscript>';

/** @param {string} s */
export const normalizuj = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * `kat` a `q` z URL archivu, oříznuté. Prázdné = bez filtru.
 *
 * @param {URL} url
 * @returns {{ kat: string, q: string }}
 */
export function parametryFiltru(url) {
  const kat = (url.searchParams.get('kat') ?? '').trim().slice(0, MAX_DELKA_DOTAZU);
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, MAX_DELKA_DOTAZU);
  return { kat, q };
}

/**
 * Položka search-index.json (tvar drží search-index.json.js).
 * @typedef {{ s: string, t: string, d: string, k: string, b: string, p: string,
 *   m?: number, i?: string, is?: string, z?: 1, v?: string }} PolozkaIndexu
 */

/**
 * Stejná kontrola tvaru jako klientský loadIndex — cizí/rozbitý JSON
 * nesmí do HTML.
 *
 * @param {unknown} candidate
 * @returns {candidate is PolozkaIndexu[]}
 */
export function platnyIndex(candidate) {
  return Array.isArray(candidate) && candidate.every((item) =>
    item && typeof item === 'object'
    && ['s', 't', 'd', 'k', 'b', 'p'].every((key) => typeof item[key] === 'string')
    && (item.m === undefined || (Number.isFinite(item.m) && item.m > 0))
    && (item.i === undefined || typeof item.i === 'string')
    && (item.is === undefined || typeof item.is === 'string')
    && (item.z === undefined || item.z === 1)
    && (item.v === undefined || typeof item.v === 'string'));
}

/**
 * Výběr z indexu — shoda 1:1 s klientským apply(): kategorie přesně,
 * dotaz jako podřetězec bez diakritiky v titulku, popisu, kategorii a
 * začátku textu. Pořadí indexu (nejnovější první) se drží.
 *
 * @param {PolozkaIndexu[]} index
 * @param {{ kat: string, q: string }} filtr
 * @returns {PolozkaIndexu[]}
 */
export function filtrujIndex(index, { kat, q }) {
  const nq = normalizuj(q.trim());
  return index.filter((it) => {
    if (kat && it.k !== kat) return false;
    if (!nq) return true;
    return normalizuj(`${it.t} ${it.d} ${it.k} ${it.b}`).includes(nq);
  });
}

/**
 * Aktivní čip v odkazech z <noscript> strany 1. HTMLRewriter (lol-html)
 * bere obsah <noscript> jako text, ne elementy — selektor `.chip` se ho
 * nedotkne. Proto se jeho text přepisuje jako řetězec: `active` dostane
 * jediný odkaz, jehož href je zvolená kategorie (encodeURIComponent jako
 * v šabloně), bez kategorie „Vše“ (/clanky/). Text bez čipů (noscript se
 * <style> v <head>) projde beze změny.
 *
 * @param {string} html   obsah <noscript>
 * @param {string} kat    zvolená kategorie ('' = Vše)
 * @returns {string}
 */
export function aktivniCipVOdkazech(html, kat) {
  const cil = kat ? `/clanky/?kat=${encodeURIComponent(kat)}` : '/clanky/';
  return html.replace(
    /<a class="chip(?: active)?" href="([^"]+)"/g,
    (_shoda, href) => `<a class="chip${href === cil ? ' active' : ''}" href="${href}"`,
  );
}

/** @param {string} s */
export const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Třída .th-* jako slugify v ArticleCard (bez diakritiky, mezery → -). */
export const slugKategorie = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

/**
 * width/height náhledu z cesty: -640 derivát = 640×360, jinak 1280×720
 * (nahledKarty na serveru dává totéž).
 *
 * @param {string} cesta
 * @returns {[number, number]}
 */
export const rozmeryNahledu = (cesta) =>
  /-640\.(?:webp|jpg)$/.test(cesta) ? [640, 360] : [1280, 720];

/** Datum YYYY-MM-DD → „DD. MM. YYYY“ jako karta z indexu na klientu. */
export const datumKarty = (p) => p.split('-').reverse().join('. ');

/**
 * HTML karty z indexu — TÝŽ tvar jako SSR ArticleCard a klientský
 * kartaZIndexu: <picture> se <source type=image/webp> (srcset 640w+1280w
 * + sizes archivu, když index nese `is`), <img lazy alt=titulek>, štítky
 * .lt, h2 s odkazem, perex, datum a „ČTENÍ N MIN“.
 *
 * @param {PolozkaIndexu} it
 * @param {string} sizes  KARTA_SIZES_ARCHIVE — stejné jako <source> SSR karet
 * @returns {string}
 */
export function kartaHtml(it, sizes) {
  const casti = [
    `<article class="card" data-category="${escapeHtml(it.k)}" data-slug="${escapeHtml(it.s)}" data-from-index="">`,
    `<div class="card-thumb th-${escapeHtml(slugKategorie(it.k))}">`,
  ];
  if (it.i) {
    const [w, h] = rozmeryNahledu(it.i);
    casti.push('<picture>');
    if (/\.webp$/.test(it.i)) {
      casti.push(
        it.is
          ? `<source srcset="${escapeHtml(it.is)}" sizes="${escapeHtml(sizes)}" type="image/webp">`
          : `<source srcset="${escapeHtml(it.i)}" type="image/webp">`,
      );
    }
    casti.push(
      `<img src="${escapeHtml(it.i)}" alt="${escapeHtml(it.t)}" width="${w}" height="${h}" loading="lazy" decoding="async">`,
      '</picture>',
    );
  }
  casti.push(`<div class="lt"><span class="k">${escapeHtml(it.k)}</span>`);
  if (it.z) casti.push('<span class="z">Zpráva</span>');
  if (it.v) casti.push(`<span class="t">${escapeHtml(it.v)}</span>`);
  casti.push(
    '</div></div>',
    '<div class="card-body">',
    `<h2><a href="/clanky/${escapeHtml(it.s)}/">${escapeHtml(it.t)}</a></h2>`,
    `<p>${escapeHtml(it.d)}</p>`,
    `<div class="card-meta"><time datetime="${escapeHtml(it.p)}">${escapeHtml(datumKarty(it.p))}</time>`,
  );
  if (it.m) casti.push(`<span>ČTENÍ ${it.m} MIN</span>`);
  casti.push('</div></div></article>');
  return casti.join('');
}
