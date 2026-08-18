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
      .replace(/[#*_>`|-]/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 400)
      .trim(),
    p: c.data.date.toISOString().slice(0, 10),
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
