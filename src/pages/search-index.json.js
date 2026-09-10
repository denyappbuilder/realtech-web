import { getCollection } from 'astro:content';
import { compareArticlesByDateDescThenId } from '../lib/article-order.js';
import { nahledKarty } from '../lib/karta-nahled.js';
import { youtubeId } from '../lib/youtube.js';
import { readingTime } from '../lib/reading-time.js';

/**
 * Náhled karty pro klientský filtr archivu — TÝŽ soubor, jaký dává
 * ArticleCard do <img src> (WebP -640, když derivát leží v public/, jinak
 * originál; YouTube maxresdefault jen u videa bez lokálního coveru).
 * Bez něj byly karty doplněné z indexu na /clanky/ jen text: jiná výška
 * než SSR karty (CLS při filtru) a nejednotná mřížka (živě 10. 9. 2026).
 *
 * @param {{ image?: string | null; video?: string | null }} data
 * @returns {string | undefined}
 */
export function nahledProIndex(data) {
  const nahled = nahledKarty(data.image);
  const videoId = youtubeId(data.video);
  // Stejná volba jako ArticleCard: lokální cover má přednost i u videa,
  // YouTube je jen fallback, když soubor v public/ chybí.
  if (videoId && !nahled.hasLocalThumb) return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  return nahled.lcpSrc ?? undefined;
}

// Vyhledávací index pro ⌘K modal a filtr /clanky/ — malý (metadata,
// začátek textu, cesta k náhledu), načítá se až při prvním hledání / filtru.
// Klíče (s, t, d, k, b, p, m, i, z, v) čtou SearchModal.astro i
// ArticleArchivePage.astro; volitelné i/z/v se do JSON dostanou, jen když
// článek hodnotu má (JSON.stringify undefined vynechá).
export async function GET() {
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort(compareArticlesByDateDescThenId);

  const items = clanky.map((c) => ({
    s: c.id,
    t: c.data.title,
    d: c.data.description,
    k: c.data.category,
    // prvních ~400 znaků čistého textu pro fulltext
    // trim AŽ PO řezu: 400. znak umí padnout doprostřed mezislovní mezery
    // a úryvek by jinak končil mezerou (limit 400 by přitom tvrdil, že drží).
    b: (c.body ?? '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Markdown značky pryč; pomlčku ber jen jako odrážku / oddělovač
      // na hranici slova. Uvnitř tokenu (GPT-5, Wi-Fi, zero-day) musí zůstat,
      // jinak klientský search() výraz v těle nenajde (Z10026).
      .replace(/[#*_>`|]/g, ' ')
      .replace(/(^|\s)-+(?=\s|$)/gm, '$1')
      .replace(/\s+/g, ' ')
      .slice(0, 400)
      .trim(),
    p: c.data.date.toISOString().slice(0, 10),
    // Kolo 35: doba čtení, náhled a štítky .lt karty (Zpráva, délka videa)
    // — stejná karta jako SSR ArticleCard, ne holý text.
    m: readingTime(c.body),
    i: nahledProIndex(c.data),
    z: c.data.zprava ? 1 : undefined,
    v: c.data.videoLength || undefined,
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
