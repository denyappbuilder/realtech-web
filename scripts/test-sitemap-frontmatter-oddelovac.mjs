// astro.config.mjs si frontmatter článků čte sám — textově, přes
// `readFileSync(...).split('---')[1]` — protože v době načítání konfigurace
// ještě žádná kolekce obsahu neexistuje. Astro tentýž soubor čte podruhé,
// YAML parserem (js-yaml) přes `glob()` loader v src/content.config.ts.
//
// Dva různé způsoby čtení téhož vstupu se mohou rozejít. `split('---')`
// nezná uvozovky, takže se utne na prvním `---` UVNITŘ hodnoty — YAML
// parser takovou hodnotu přečte správně a stránka se vyrenderuje.
//
// Tyhle testy drží hranici právě tam: co ještě obě čtení vidí stejně
// a od čeho se rozcházejí. Sousední soubor test-sitemap.mjs pokrývá
// tytéž funkce na dobře tvarovaném frontmatteru.

import assert from 'node:assert/strict';
import test from 'node:test';

import './test-sitemap-register.mjs';

const { getSitemapOptions, setArticles } = await import(
  './test-sitemap-mocks/state.mjs'
);

let fixtureNumber = 0;

function article(filename, lines) {
  return { filename: `${filename}.md`, frontmatter: lines };
}

async function loadSitemapOptions(entries) {
  setArticles(entries);
  fixtureNumber += 1;
  await import(`../astro.config.mjs?sitemap-frontmatter-test=${fixtureNumber}`);
  return getSitemapOptions();
}

function serialize(options, url) {
  return options.serialize({ url });
}

test('běžná interpunkce v hodnotách frontmatteru lastmod nerozbije', async () => {
  const options = await loadSitemapOptions([
    article('interpunkce', [
      'title: "Nvidia RTX 5090 -- první test: co umí"',
      'description: "Pomlčka — středník; dvojtečka: nic z toho nevadí"',
      'date: "2025-03-04"',
      'category: "Hardware"',
    ]),
  ]);

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/interpunkce/').lastmod,
    '2025-03-04T00:00:00.000Z',
  );
  assert.equal(
    serialize(options, 'https://realtech.cz/temata/hardware/').lastmod,
    '2025-03-04T00:00:00.000Z',
  );
});

test('`---` v hodnotě ZA posledním čteným klíčem ještě nevadí', async () => {
  // Ukazuje, že vada níž je poziční, ne obecná: dokud oddělovač spadne až
  // za `date:` i `category:`, textové čtení stihne obojí přečíst.
  const options = await loadSitemapOptions([
    article('oddelovac-na-konci', [
      'title: "Konec"',
      'date: "2025-03-04"',
      'category: "Hardware"',
      'description: "Rozbor --- díl první"',
    ]),
  ]);

  assert.equal(
    serialize(options, 'https://realtech.cz/clanky/oddelovac-na-konci/').lastmod,
    '2025-03-04T00:00:00.000Z',
  );
  assert.equal(
    serialize(options, 'https://realtech.cz/temata/hardware/').lastmod,
    '2025-03-04T00:00:00.000Z',
  );
});

test.todo(
  'codex-testy-web/SITEMAP-FM-001: `---` v hodnotě před `draft:` nesmí pustit draft do lastmod (Z1070)',
  async () => {
    // js-yaml přečte `draft: true` správně a stránka se nevyrenderuje.
    // Textové čtení v astro.config.mjs se utne v description a draft nevidí,
    // takže jeho budoucí datum posune celý web — přesně regrese Z1070,
    // kterou stávající test v test-sitemap.mjs hlídá jen na čistém vstupu.
    const options = await loadSitemapOptions([
      article('publikovany', ['date: "2025-03-04"', 'category: "AI Report"']),
      article('chystany-draft', [
        'title: "Chystaný test"',
        'date: "2026-12-31"',
        'category: "AI Report"',
        'description: "Rozbor --- díl první"',
        'draft: true',
      ]),
    ]);

    for (const url of [
      'https://realtech.cz/',
      'https://realtech.cz/clanky/',
      'https://realtech.cz/o-nas/',
      'https://realtech.cz/temata/ai-report/',
    ]) {
      assert.equal(
        serialize(options, url).lastmod,
        '2025-03-04T00:00:00.000Z',
        `${url} dostalo datum z nepublikovaného draftu`,
      );
    }
  },
);

test.todo(
  'codex-testy-web/SITEMAP-FM-001: článek s `---` v hodnotě před `date:` nesmí zdědit cizí lastmod',
  async () => {
    // Datum se neztratí do `invalidLastmodSlugs` (tam vede jen datum, které
    // se přečte a neobstojí v parseCalendarDate) — spadne rovnou do větve
    // `newestArticle`. Sitemapa tedy sebejistě ohlásí datum jiného článku.
    const options = await loadSitemapOptions([
      article('utnute-datum', [
        'title: "Rozbor --- díl první"',
        'date: "2025-01-02"',
        'category: "Hardware"',
      ]),
      article('novejsi', ['date: "2026-05-06"', 'category: "AI Report"']),
    ]);

    assert.equal(
      serialize(options, 'https://realtech.cz/clanky/utnute-datum/').lastmod,
      '2025-01-02T00:00:00.000Z',
    );
  },
);

test.todo(
  'codex-testy-web/SITEMAP-FM-001: `---` v hodnotě před `category:` nesmí zestárnout stránku tématu',
  async () => {
    // Článek se do své kategorie nezapočítá, kategorie tedy nemá vlastní
    // lastmod a spadne na `newestArticle` — datum článku z JINÉ kategorie.
    const options = await loadSitemapOptions([
      article('utnuta-kategorie', [
        'title: "Rozbor"',
        'date: "2025-01-02"',
        'description: "Díl --- první"',
        'category: "Hardware"',
      ]),
      article('jina-kategorie', ['date: "2026-05-06"', 'category: "AI Report"']),
    ]);

    assert.equal(
      serialize(options, 'https://realtech.cz/temata/hardware/').lastmod,
      '2025-01-02T00:00:00.000Z',
    );
  },
);
