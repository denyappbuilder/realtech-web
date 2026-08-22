const article = {
  id: "xml-serializace",
  body: [
    'Markdown: A & B < C > D "quoted".',
    "",
    '<p data-note="A &amp; B">Raw HTML: A &amp; B &lt; C &gt; D &quot;quoted&quot;.</p>',
    '<a href="/clanky/cil/?a=1&b=2">Kořenový odkaz</a>',
    '<img src="/images/root.png?x=1&y=2" alt="Kořenový obrázek">',
    '<a href="https://external.example/path?ref=outside">Externí odkaz</a>',
  ].join("\n"),
  data: {
    title: 'Titulek & <title-node> > "citace"',
    description: 'Popis & <description-node> > "citace"',
    category: 'Kategorie & <category-node> > "citace"',
    date: new Date("2025-04-05T06:07:08.000Z"),
    draft: false,
  },
};

export async function getCollection(name, filter) {
  if (name !== "clanky") {
    throw new Error(`Neočekávaná kolekce: ${name}`);
  }

  return [article].filter(filter);
}
