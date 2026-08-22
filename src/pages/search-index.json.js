import { getCollection } from 'astro:content';

// Vyhledávací index pro ⌘K modal — malý (jen metadata + začátek textu),
// načítá se až při prvním otevření vyhledávání.
export async function GET() {
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

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
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
