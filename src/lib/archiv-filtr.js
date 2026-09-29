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
 * Kolo 46: kategorie z URL proti kategoriím v indexu. Živě 20. 9. 2026
 * dávalo /clanky/?kat=AI (kategorie, která neexistuje — překlep, starý odkaz,
 * jiná velikost písmen) „0 článků“, „Nic nenalezeno“ a role=group čipů BEZ
 * jediného stisknutého — edge porovnával přesně (`it.k !== kat`), zatímco
 * klientský skript neznámou kategorii ignoruje (žádný čip → apply() bere
 * „Vše“). Dvě různá chování na téže URL. Teď obě strany dělají totéž:
 * shoda bez diakritiky a velikosti písmen vrátí kanonický název z indexu
 * („ai report“ → „AI Report“), neznámá kategorie = bez filtru kategorie.
 * Sedí i slug tématu z /temata/{slug}/ („ai-agenti“ → „AI Agenti“, „site“ →
 * „Sítě“) — stejné slugify jako .th-* a URL hubu. Samotné „ai“ je
 * nejednoznačné (AI Report i AI Agenti) a zůstává „Vše“; žádná hádaná mapa.
 *
 * @param {string} kat          hodnota ?kat= z URL (oříznutá)
 * @param {Iterable<string>} kategorie  názvy kategorií (z indexu nebo čipů)
 * @returns {string}            kanonický název, nebo '' (Vše)
 */
export function kanonickaKategorie(kat, kategorie) {
  const hledana = slugKategorie(kat.trim());
  if (!hledana) return '';
  for (const k of kategorie) {
    if (slugKategorie(k) === hledana) return k;
  }
  return '';
}

/**
 * Položka search-index.json (tvar drží search-index.json.js).
 * @typedef {{ s: string, t: string, d: string, k: string, b: string, p: string,
 *   m?: number, i?: string, is?: string, ia?: string, z?: 1, v?: string }} PolozkaIndexu
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
    && (item.ia === undefined || typeof item.ia === 'string')
    && (item.z === undefined || item.z === 1)
    && (item.v === undefined || typeof item.v === 'string'));
}

/**
 * Výběr z indexu — shoda 1:1 s klientským apply() archivu i s ⌘K
 * (hledejVIndexu, text funkce hlídá test-kolo-60-hledani.mjs). Bez dotazu
 * jen kategorie a pořadí indexu (nejnovější první); s dotazem podle skóre.
 *
 * @param {PolozkaIndexu[]} index
 * @param {{ kat: string, q: string }} filtr
 * @returns {PolozkaIndexu[]}
 */
export function filtrujIndex(index, { kat, q }) {
  return hledejVIndexu(index, q, kat);
}

/**
 * @param {PolozkaIndexu[]} index
 * @param {string} q
 * @param {string} kat
 * @returns {PolozkaIndexu[]}
 */
export function hledejVIndexu(index, q, kat) {
  // Kolo 60: archiv řadil jen chronologicky a kmeny neznal — /clanky/?q=
  // vracel méně a jinak než ⌘K („starlinku“ 4 vs 11, „agenti“ 14 vs 26,
  // „dronů“ 1 vs 3; živě 29. 9. 2026). Teď TOTÉŽ tělo na edge, v archivu
  // i v ⌘K: skóre titulek 10/12, zbytek 3/4, překlep 2/1, shoda → novější.
  // „gpt 5“, „gpt5“ i „gpt-5“ = „gpt-5“ (písmeno + číslice spojí pomlčka),
  // jinak se dotaz rozpadl na „gpt“ a samotné „5“ (13 výsledků, první GPT-6).
  const priprav = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])[\s-]*(?=\d)/g, '$1-');
  const kmen = (t) => (t.length < 5 || /\d/.test(t) ? t : t.slice(0, t.length >= 7 ? -2 : -1));
  const vKategorii = index.filter((it) => !kat || it.k === kat);
  const nq = priprav(q.trim());
  if (!nq) return vKategorii;
  const slova = nq.split(/\s+/);
  const kolo = (rezim) => vKategorii
    .map((it) => {
      const titulek = priprav(it.t);
      const zbytek = priprav(`${it.d} ${it.k} ${it.b}`);
      let skore = 0;
      for (const slovo of slova) {
        const t = rezim === 'kmen' ? kmen(slovo) : slovo;
        if (rezim === 'kmen' && titulek.includes(slovo)) skore += 12;
        else if (titulek.includes(t)) skore += 10;
        else if (rezim === 'kmen' && zbytek.includes(slovo)) skore += 4;
        else if (zbytek.includes(t)) skore += 3;
        else if (rezim === 'preklep' && shodaSPreklepem(slovo, titulek)) skore += 2;
        else if (rezim === 'preklep' && shodaSPreklepem(slovo, zbytek)) skore += 1;
        else return null;
      }
      return { it, skore };
    })
    .filter((r) => r !== null)
    .sort((a, b) => b.skore - a.skore || String(b.it.p ?? '').localeCompare(String(a.it.p ?? '')))
    .map((r) => r.it);
  const presne = kolo('presne');
  const sKmeny = slova.map(kmen).join(' ') !== nq ? kolo('kmen') : presne;
  const nejlepsi = sKmeny.length > presne.length ? sKmeny : presne;
  return nejlepsi.length ? nejlepsi : kolo('preklep');
}

/**
 * Kolo 57: shoda slova dotazu s textem s tolerancí překlepu. TOTÉŽ tělo
 * je v klientském skriptu ArticleArchivePage.astro a SearchModal.astro
 * (bez importů kvůli vm testům) — test-kolo-57.mjs hlídá shodu textu.
 *
 * @param {string} term  normalizované slovo dotazu
 * @param {string} text  normalizovaný text
 * @returns {boolean}
 */
export function shodaSPreklepem(term, text) {
  // Kolo 57: záloha, když přesná shoda nenajde nic („starlink mini tset“ →
  // 0 výsledků). Slovo dotazu od 4 znaků smí mít 1 překlep (od 8 znaků 2):
  // záměna, vynechání, přidání písmene nebo prohození sousedních (OSA).
  // Porovnává se s celým slovem textu i s jeho začátkem stejné délky, takže
  // sedí i skloňované tvary („strlinku“). Slova s číslicí (modely, verze)
  // se neohýbají — „gpt-5“ nesmí najít „gpt-6“.
  if (term.length < 4 || /\d/.test(term)) return false;
  const max = term.length >= 8 ? 2 : 1;
  const osa = (a, b) => {
    const d = [];
    for (let i = 0; i <= a.length; i++) d.push([i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cena = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cena);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  };
  for (const slovo of text.split(/[^a-z0-9]+/)) {
    if (slovo.length < 4 || /\d/.test(slovo)) continue;
    if (Math.abs(slovo.length - term.length) <= max && osa(term, slovo) <= max) return true;
    if (slovo.length > term.length && osa(term, slovo.slice(0, term.length)) <= max) return true;
  }
  return false;
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
 * .lt, h2 s odkazem, perex, datum a „Čtení N min“ (kolo 47: věta, ne verzálky).
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
      // Kolo 60: AVIF před WebP, jen se srcsetem (index `ia`) — jako SSR karta.
      if (it.ia && it.is) casti.push(`<source srcset="${escapeHtml(it.ia)}" sizes="${escapeHtml(sizes)}" type="image/avif">`);
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
  if (it.m) casti.push(`<span>Čtení ${it.m} min</span>`);
  casti.push('</div></div></article>');
  return casti.join('');
}
