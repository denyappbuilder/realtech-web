import {
  ODKAZ_ZRUSIT_FILTR,
  aktivniCipVOdkazech,
  filtrujIndex,
  parametryFiltru,
  platnyIndex,
  kartaHtml,
} from '../../src/lib/archiv-filtr.js';
import { textPoctuClanku } from '../../src/lib/pocet-clanku.js';

/*
 * Kolo 37: /clanky/?q=… a /clanky/?kat=… filtrují už na edgi.
 *
 * Živě 12. 9. 2026 vracely obě URL stejných 15 nefiltrovaných karet
 * s čipem „Vše“ — filtr byl jen v klientském skriptu. Přitom na ně vede
 * GET formulář archivu (kolo 36), čipy strany/2+ (kolo 35), SearchAction
 * v JSON-LD úvodky (kolo 29) a od kola 37 i hledání z hlavičky bez JS.
 *
 * Web zůstává statický: Pages Function vezme statické /clanky/ (strana 1)
 * a search-index.json — TÝŽ index a TÁŽ shoda jako klientský filtr — a
 * přes HTMLRewriter (streamuje, nedrží HTML v paměti):
 *   - karty strany 1 mimo výběr dostanou `hidden` (ne remove — klientský
 *     „Zrušit filtr“ je pak zase odkryje),
 *   - vybrané články mimo stranu 1 se připojí na konec mřížky jako karty
 *     z indexu (data-from-index, stejný tvar jako klientská karta),
 *   - počet, „Nic nenalezeno“, skryté stránkování, hodnota pole a aktivní
 *     čip odpovídají filtru,
 *   - preload LCP první karty zmizí, když první karta ve výběru není.
 * Skript strany 1 pak nad tím běží dál (initialQuery/initialCategory →
 * apply()) a karty z edge nechá stát, dokud nemá index.
 *
 * Bez parametrů, při chybě indexu nebo mimo HTML jde odpověď beze změny
 * (context.next()) — nikdy 500 místo archivu.
 */

/**
 * Handlery HTMLRewriteru pro vyfiltrovaný archiv. Oddělené od
 * onRequestGet, aby šly testovat bez HTMLRewriteru (test-kolo-37-archiv.mjs
 * jim podstrčí falešné elementy).
 *
 * @param {{ vybrane: import('../../src/lib/archiv-filtr.js').PolozkaIndexu[],
 *   prvniSlug: string | undefined, kat: string, q: string }} stav
 * @returns {Array<[string, { element(el: any): void }]>}
 */
export function handleryFiltru({ vybrane, prvniSlug, kat, q }) {
  const slugy = new Set(vybrane.map((it) => it.s));
  const naStrane = new Set();
  let noscriptText = '';

  const nastavTridu = (el, aktivni) => {
    const tridy = (el.getAttribute('class') ?? '').split(/\s+/).filter((t) => t && t !== 'active');
    if (aktivni) tridy.push('active');
    el.setAttribute('class', tridy.join(' '));
  };

  return [
    // Preload v <head> míří na první kartu strany 1 — když ta ve výběru není,
    // stáhl by obrázek, který je hidden.
    ['link[rel="preload"][as="image"]', {
      element(el) {
        if (!prvniSlug || !slugy.has(prvniSlug)) el.remove();
      },
    }],
    ['#articles-grid .card', {
      element(el) {
        const slug = el.getAttribute('data-slug') ?? '';
        if (slugy.has(slug)) naStrane.add(slug);
        else el.setAttribute('hidden', '');
      },
    }],
    ['#articles-grid', {
      element(el) {
        const sizes = el.getAttribute('data-sizes') ?? '';
        // Kolo 38: značka „tuhle stranu už vyfiltroval edge“ — skript strany 1
        // pak při startu index (108 kB, 38 kB gzip) nestahuje a filtruje až
        // po první interakci (čip, pole, Zrušit filtr).
        el.setAttribute('data-filtr-edge', '');
        // Karty mimo stranu 1 až za poslední SSR kartou — handler .card
        // (výš) do té doby posbíral, co na straně už je.
        el.onEndTag((konec) => {
          const html = vybrane
            .filter((it) => !naStrane.has(it.s))
            .map((it) => kartaHtml(it, sizes))
            .join('');
          if (html) konec.before(html, { html: true });
        });
      },
    }],
    ['[data-filter-count]', {
      element(el) {
        el.setInnerContent(textPoctuClanku(vybrane.length));
      },
    }],
    ['.filter-empty', {
      element(el) {
        if (vybrane.length === 0) el.removeAttribute('hidden');
      },
    }],
    ['.archive-pagination', {
      element(el) {
        el.setAttribute('hidden', '');
      },
    }],
    // Kolo 38: „Zrušit filtr“ stálo na vyfiltrované straně `hidden`, dokud ho
    // neodkryl skript (živě 12. 9. 2026) — bez JS nikdy. Tlačítko odkrýt
    // (skript ho pak řídí dál: čistý filtr ho zase schová) a pro čtenáře bez
    // skriptu vedle něj odkaz na čistý archiv; tlačítko samo bez JS schová
    // <noscript><style> v <head> archivu (ArticleArchivePage.astro).
    // HTMLRewriter vložený obsah znovu neparsuje — handler `noscript` níž
    // ho nedostane.
    ['.filter-reset', {
      element(el) {
        el.removeAttribute('hidden');
        el.after(ODKAZ_ZRUSIT_FILTR, { html: true });
      },
    }],
    ['#art-search', {
      element(el) {
        if (q) el.setAttribute('value', q);
      },
    }],
    // Čipy-tlačítka strany 1 (data-cat, aria-pressed): aktivní je čip zvolené
    // kategorie, bez kategorie „Vše“. Odkazy strany/2+ tímto filtrem
    // neprocházejí (edge přepisuje jen /clanky/).
    ['.cat-filter .chip', {
      element(el) {
        const aktivni = (el.getAttribute('data-cat') ?? '') === kat;
        nastavTridu(el, aktivni);
        el.setAttribute('aria-pressed', String(aktivni));
      },
    }],
    // Odkazy čipů v <noscript>: lol-html vidí obsah noscript jako text
    // (ověřeno ve wrangler pages dev — selektor .chip ho míjí), takže se
    // skládá z chunků a přepisuje jako řetězec (aktivniCipVOdkazech).
    ['noscript', {
      text(chunk) {
        noscriptText += chunk.text;
        if (!chunk.lastInTextNode) {
          chunk.remove();
          return;
        }
        const cely = noscriptText;
        noscriptText = '';
        chunk.replace(aktivniCipVOdkazech(cely, kat), { html: true });
      },
    }],
  ];
}

/**
 * @param {{ request: Request, env: { ASSETS?: { fetch(input: Request | URL | string): Promise<Response> } },
 *   next(): Promise<Response> | Response }} context
 */
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const filtr = parametryFiltru(url);
  if (!filtr.kat && !filtr.q) return context.next();
  if (typeof HTMLRewriter === 'undefined' || !context.env?.ASSETS) return context.next();

  let index;
  try {
    const odpoved = await context.env.ASSETS.fetch(new URL('/search-index.json', url));
    if (!odpoved.ok) return context.next();
    index = await odpoved.json();
  } catch {
    return context.next();
  }
  if (!platnyIndex(index)) return context.next();

  const stranka = await context.next();
  if (!stranka.ok || !(stranka.headers.get('content-type') ?? '').includes('text/html')) return stranka;

  const vybrane = filtrujIndex(index, filtr);
  const rewriter = new HTMLRewriter();
  for (const [selektor, handler] of handleryFiltru({ vybrane, prvniSlug: index[0]?.s, ...filtr })) {
    rewriter.on(selektor, handler);
  }
  const prepsana = rewriter.transform(stranka);
  const headers = new Headers(prepsana.headers);
  // ETag/Content-Length patří statickému souboru, ne přepsanému tělu.
  headers.delete('etag');
  headers.delete('content-length');
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  return new Response(prepsana.body, { status: prepsana.status, headers });
}
