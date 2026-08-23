// Vyhledávání ⌘K: klientský skript SearchModal.astro + index, ze kterého čte.
//
// src/components/SearchModal.astro nespouštěl dosud ŽÁDNÝ test —
// skórování, spojka mezi výrazy dotazu i vykreslení výsledků byly bez sítě.
// Loader (test-search-modal-loader.mjs) spouští skutečný <script> komponenty,
// takže tyhle testy nejsou kopie logiky.
//
// Část testů jde přes SKUTEČNÝ generátor indexu (src/pages/search-index.json.js),
// protože obě strany si tentýž text vykládají jinak — viz WEB-SEARCH-002 / Z10026.
import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

import { nactiModal } from './test-search-modal-loader.mjs';
import { resetRssMocks, setCollection } from './test-rss-mocks/state.mjs';
import { GET } from '../src/pages/search-index.json.js';

/**
 * Slugy výsledků jako pole z tohoto realmu.
 *
 * `search()` běží ve vm kontextu, takže jeho pole má cizí Array.prototype
 * a `deepStrictEqual` by ho odmítl i při shodném obsahu.
 */
function slugy(vysledky) {
  return Array.from(vysledky, (it) => it.s);
}

/** Položka indexu v přesně tom tvaru, jaký posílá search-index.json.js. */
function polozka({ s, t, d = 'Popis', k = 'AI', b = '', p = '2025-04-05' }) {
  return { s, t, d, k, b, p };
}

/** Postaví index skutečným generátorem, ne ručně — ať sedí obě strany. */
async function indexZGeneratoru(clanky) {
  setCollection(
    clanky.map(({ id, title, body = '', description = 'Popis', category = 'AI', date = '2025-04-05' }) => ({
      id,
      body,
      data: { title, description, category, date: new Date(`${date}T00:00:00.000Z`), draft: false },
    })),
  );
  return (await GET()).json();
}

beforeEach(() => {
  resetRssMocks();
});

function klavesa(key, extra = {}) {
  return {
    key,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
    ...extra,
  };
}

function kliknuti(currentTarget) {
  return {
    currentTarget,
    target: currentTarget,
    preventDefault() {},
  };
}

// ---------------------------------------------------------------------------
// Co má vyhledávání držet
// ---------------------------------------------------------------------------

test('dokud se index nenačte, hledání nevrací nic (ne výjimku)', () => {
  const modal = nactiModal();

  assert.equal(modal.dejIndex(), null);
  assert.deepEqual(slugy(modal.search('starlink')), []);
});

test('Tab na posledním prvku zůstane v modalu a vrátí fokus na první', () => {
  const modal = nactiModal({ hledatelne: [] });
  modal.spoustec.dispatch('click', kliknuti(modal.spoustec));
  modal.odkaz.focus();

  const event = klavesa('Tab');
  modal.dokument.dispatch('keydown', event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(modal.dokument.activeElement, modal.input);
  assert.equal(modal.overlay.hidden, false);
});

test('Shift+Tab na prvním prvku zůstane v modalu a přesune fokus na poslední', () => {
  const modal = nactiModal({ hledatelne: [] });
  modal.spoustec.dispatch('click', kliknuti(modal.spoustec));

  const event = klavesa('Tab', { shiftKey: true });
  modal.dokument.dispatch('keydown', event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(modal.dokument.activeElement, modal.odkaz);
  assert.equal(modal.overlay.hidden, false);
});

test('Escape zavře modal a vrátí fokus spouštěči', () => {
  const modal = nactiModal({ hledatelne: [] });
  modal.spoustec.dispatch('click', kliknuti(modal.spoustec));
  assert.equal(modal.dokument.activeElement, modal.input);

  modal.dokument.dispatch('keydown', klavesa('Escape'));

  assert.equal(modal.overlay.hidden, true);
  assert.equal(modal.dokument.activeElement, modal.spoustec);
  assert.equal(modal.spoustec.fokusovan, 1);
});

test('kliknutí mimo dialog zavře modal a vrátí fokus spouštěči', () => {
  const modal = nactiModal({ hledatelne: [] });
  modal.spoustec.dispatch('click', kliknuti(modal.spoustec));

  modal.overlay.dispatch('click', { target: modal.overlay });

  assert.equal(modal.overlay.hidden, true);
  assert.equal(modal.dokument.activeElement, modal.spoustec);
});

test('⌘K otevře i zavře modal a po zavření vrátí původní fokus', () => {
  const modal = nactiModal({ hledatelne: [] });

  modal.dokument.dispatch('keydown', klavesa('k', { metaKey: true }));
  assert.equal(modal.overlay.hidden, false);
  assert.equal(modal.dokument.activeElement, modal.input);

  modal.dokument.dispatch('keydown', klavesa('k', { metaKey: true }));
  assert.equal(modal.overlay.hidden, true);
  assert.equal(modal.dokument.activeElement, modal.spoustec);
});

test('prázdný dotaz i dotaz ze samých mezer vrací prázdný výsledek', () => {
  const modal = nactiModal({
    hledatelne: [polozka({ s: 'a', t: 'Starlink v Česku' })],
  });

  assert.deepEqual(slugy(modal.search('')), []);
  assert.deepEqual(slugy(modal.search('   ')), []);
  assert.deepEqual(slugy(modal.search('\t \n')), []);
});

test('dotaz ignoruje diakritiku i velikost písmen v obou směrech', () => {
  const modal = nactiModal({
    hledatelne: [
      polozka({ s: 's-diakritikou', t: 'Česká pošta zdražuje' }),
      polozka({ s: 'bez-diakritiky', t: 'Ceska drahni sit' }),
    ],
  });

  assert.deepEqual(slugy(modal.search('ceska')), ['s-diakritikou', 'bez-diakritiky']);
  assert.deepEqual(slugy(modal.search('ČESKÁ')), ['s-diakritikou', 'bez-diakritiky']);
});

test('více výrazů v dotazu je spojka AND — částečná shoda článek zahodí', () => {
  const modal = nactiModal({
    hledatelne: [
      polozka({ s: 'oba', t: 'Starlink a DJI v jednom testu' }),
      polozka({ s: 'jen-jeden', t: 'Starlink v Česku', b: 'O dronech tu nepadne ani slovo' }),
    ],
  });

  assert.deepEqual(slugy(modal.search('starlink dji')), ['oba']);
  assert.deepEqual(slugy(modal.search('starlink')), ['oba', 'jen-jeden']);
});

test('shoda v titulku má přednost před shodou v popisu, kategorii i úryvku', () => {
  const modal = nactiModal({
    hledatelne: [
      polozka({ s: 'v-uryvku', t: 'Nesouvisející titulek', b: 'Zmínka o starlinku až v textu' }),
      polozka({ s: 'v-popisu', t: 'Jiný titulek', d: 'Popis zmiňuje starlink' }),
      polozka({ s: 'v-titulku', t: 'Starlink v Česku' }),
    ],
  });

  // 10 bodů za titulek vs. 3 za zbytek — titulek musí být první.
  assert.equal(modal.search('starlink')[0].s, 'v-titulku');
  assert.equal(modal.search('starlink').length, 3);
});

test('kategorie je prohledávatelná stejně jako popis a úryvek', () => {
  const modal = nactiModal({
    hledatelne: [polozka({ s: 'a', t: 'Bez klíčového slova v titulku', k: 'Hardware' })],
  });

  assert.deepEqual(slugy(modal.search('hardware')), ['a']);
});

test('výsledků se vypisuje nejvýš 8, i když vyhoví víc článků', () => {
  const modal = nactiModal({
    hledatelne: Array.from({ length: 12 }, (_, i) => polozka({ s: `clanek-${i}`, t: `Test číslo ${i}` })),
  });

  assert.equal(modal.search('test').length, 8);
});

test('bez dotazu se vypíše nápověda, ne prázdný seznam', () => {
  const modal = nactiModal({ hledatelne: [] });

  modal.render([], '');

  assert.match(modal.results.innerHTML, /Napiš, co hledáš/);
});

test('dotaz bez výsledku vypíše hlášku, ne nápovědu', () => {
  const modal = nactiModal({ hledatelne: [] });

  modal.render([], 'nesmysl');

  assert.match(modal.results.innerHTML, /Nic nenalezeno/);
  assert.doesNotMatch(modal.results.innerHTML, /Napiš, co hledáš/);
});

test('vykreslený výsledek odkazuje na /clanky/<slug>/ a značí aktivní položku', () => {
  const modal = nactiModal({ hledatelne: [] });
  const vysledky = [
    polozka({ s: 'prvni', t: 'První' }),
    polozka({ s: 'druhy', t: 'Druhý' }),
  ];

  modal.nastavActive(1);
  modal.render(vysledky, 'q');

  const odkazy = [...modal.results.innerHTML.matchAll(/<a class="([^"]+)" href="([^"]+)"/g)];
  assert.deepEqual(odkazy.map((m) => m[2]), ['/clanky/prvni/', '/clanky/druhy/']);
  assert.deepEqual(odkazy.map((m) => m[1]), ['search-item', 'search-item active']);
});

test('datum se ve výsledku otáčí z ISO na český pořádek', () => {
  const modal = nactiModal({ hledatelne: [] });

  modal.render([polozka({ s: 'a', t: 'Titulek', p: '2025-04-05' })], 'q');

  assert.match(modal.results.innerHTML, /<span class="si-date mono">05\. 04\. 2025<\/span>/);
});

test('generátor indexu a modal se shodnou na tvaru položky', async () => {
  const [polozkaIndexu] = await indexZGeneratoru([
    { id: 'kontrakt', title: 'Titulek', body: 'Tělo článku' },
  ]);
  const modal = nactiModal({ hledatelne: [polozkaIndexu] });

  // Kdyby generátor přejmenoval klíč, hledání i výpis tiše zmlknou.
  assert.deepEqual(Object.keys(polozkaIndexu).sort(), ['b', 'd', 'k', 'p', 's', 't']);
  assert.deepEqual(slugy(modal.search('tělo')), ['kontrakt']);
  modal.render(modal.search('tělo'), 'tělo');
  assert.match(modal.results.innerHTML, /href="\/clanky\/kontrakt\/"/);
});

// ---------------------------------------------------------------------------
// Z10026 / WEB-SEARCH-002 — pomlčka uvnitř slova musí v indexu zůstat
// ---------------------------------------------------------------------------

test(
  'codex-testy-web/WEB-SEARCH-002: generátor indexu nesmí rozbít pomlčku uvnitř slova',
  async () => {
    const [polozkaIndexu] = await indexZGeneratoru([
      {
        id: 'pomlcka',
        title: 'Nový model je venku',
        body: '- seznam\n\nGPT-5 a Wi-Fi 7 v jednom zero-day testu.',
      },
    ]);

    // Odrážka je markdown a pryč patří.
    assert.doesNotMatch(polozkaIndexu.b, /(^|\s)-(\s|$)/);
    // Pomlčka uvnitř slova ale nese význam — bez ní se výraz nedá vyhledat.
    assert.match(polozkaIndexu.b, /GPT-5/);
    assert.match(polozkaIndexu.b, /Wi-Fi/);
    assert.match(polozkaIndexu.b, /zero-day/);
  },
);

test(
  'codex-testy-web/WEB-SEARCH-002: dotaz „gpt-5" musí najít článek, který GPT-5 zmiňuje v textu',
  async () => {
    const index = await indexZGeneratoru([
      {
        id: 'v-textu',
        title: 'Anthropic vydal novinku',
        body: 'Konkurenční GPT-5 zatím vede v žebříčcích.',
      },
      {
        id: 'v-titulku',
        title: 'GPT-5 je venku',
        body: 'Bez zkratek.',
      },
    ]);
    const modal = nactiModal({ hledatelne: index });

    // Titulek pomlčku drží, takže tenhle článek se najde…
    assert.deepEqual(slugy(modal.search('gpt-5')), ['v-titulku', 'v-textu']);
    // …a stejný výraz v těle nesmí článek z výsledků vyřadit úplně.
    assert.deepEqual(slugy(modal.search('anthropic gpt-5')), ['v-textu']);
  },
);

// ---------------------------------------------------------------------------
// Z10027 / WEB-SEARCH-003 — titulek a kategorie nesmí téct do innerHTML
// ---------------------------------------------------------------------------

test(
  'codex-testy-web/WEB-SEARCH-003: titulek s ostrými závorkami nesmí vytéct do innerHTML',
  () => {
    const modal = nactiModal({ hledatelne: [] });

    modal.render(
      [
        {
          s: 'sonda',
          t: 'Sonda <img src=x> a Ostrava & okolí',
          d: 'Popis',
          k: '<b>AI</b>',
          b: '',
          p: '2025-04-05',
        },
      ],
      'q',
    );

    const html = modal.results.innerHTML;
    assert.doesNotMatch(html, /<img src=x>/);
    assert.doesNotMatch(html, /<span class="si-cat"><b>AI<\/b><\/span>/);
    assert.match(
      html,
      /<span class="si-title">Sonda &lt;img src=x&gt; a Ostrava &amp; okolí<\/span>/,
    );
    assert.match(html, /<span class="si-cat">&lt;b&gt;AI&lt;\/b&gt;<\/span>/);
  },
);
