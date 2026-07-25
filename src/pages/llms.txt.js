import { getCollection } from 'astro:content';

export async function GET(context) {
  const site = context.site.href.replace(/\/$/, '');
  const clanky = (await getCollection('clanky', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const podleKategorie = new Map();
  for (const c of clanky) {
    const k = c.data.category;
    if (!podleKategorie.has(k)) podleKategorie.set(k, []);
    podleKategorie.get(k).push(c);
  }

  const sekce = [...podleKategorie.entries()].map(([kategorie, items]) => {
    const radky = items.map((c) => {
      const den = c.data.date.toISOString().slice(0, 10);
      return `- [${c.data.title}](${site}/clanky/${c.id}/) (${den}): ${c.data.description}`;
    });
    return `## ${kategorie}\n\n${radky.join('\n')}`;
  });

  const text = `# REALTECH CZ

> Český web o technologiích a AI bez marketingových řečí. Novinky, analýzy a videa YouTube kanálu REALTECH CZ (Deny & Sam). Psáno česky pro publikum v ČR a SK.

Web je statický (Astro). Níže je kompletní seznam ${clanky.length} článků rozdělený podle kategorie. Každý článek je dostupný jako čisté HTML na uvedené adrese.

## Rozcestník

- [Všechny články](${site}/clanky/): kompletní archiv novinek a analýz
- [RSS feed](${site}/rss.xml): plné texty článků s popisky a obrázky
- [Sitemap](${site}/sitemap-index.xml): mapa webu
- [O nás](${site}/o-nas/): kdo za webem stojí

${sekce.join('\n\n')}

## Jinde

- [YouTube kanál](https://www.youtube.com/@realtech-cz): videa REALTECH CZ
- Kontakt: info@realtech.cz
`;

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
