// Karta článku (src/components/ArticleCard.astro) — výpočty, které rozhodují
// o vykreslení: výběr náhledu, jeho rozměry, WebP varianta, třída kategorie
// a datum.
//
// Karta se vykresluje na úvodce, v archivu i na každé stránce tématu, ale
// ŽÁDNÝ test ji dosud nespouštěl — tři soubory, které ji zmiňují
// (test-karty-z1002, test-karta-png, test-youtube-id), si ji jen čtou jako
// text nebo testují knihovnu vedle ní. Loader v test-karta-render-loader.mjs
// vykonává skutečnou skriptovou část komponenty i skutečné knihovny.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { slugify } from '../src/lib/slugify.js';
import { readingTime } from '../src/lib/reading-time.js';
import {
  KOREN,
  clanek,
  sablona,
  vykresliKartu,
} from './test-karta-render-loader.mjs';

const CSS = fs.readFileSync(path.join(KOREN, 'src/styles/global.css'), 'utf8');
const SABLONA = sablona();

/** Cover, jehož všechny tři deriváty jsou v gitu (viz test-z1072). */
const COVER = '/images/clanky/claude-vodoznak-ai-text.jpg';
/** Cesta, která v repu nemá ani soubor, ani deriváty. */
const COVER_BEZ_DERIVATU = '/images/clanky/karta-render-fixture-bez-derivatu.jpg';

const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function existuje(verejnaCesta) {
  return fs.existsSync(path.join(KOREN, 'public', verejnaCesta));
}

/** Povolené kategorie ze skutečného schématu kolekce, ne z ruční kopie. */
function kategorieZeSchematu() {
  const zdroj = fs.readFileSync(path.join(KOREN, 'src/content.config.ts'), 'utf8');
  const blok = zdroj.match(/category:\s*z\.enum\(\[([\s\S]*?)\]\)/)?.[1];
  assert.ok(blok, 'v src/content.config.ts nejde najít výčet kategorií');
  const kategorie = [...blok.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(kategorie.length >= 5, `výčet kategorií vypadá useknutě: ${kategorie}`);
  return kategorie;
}

// ---------------------------------------------------------------------------
// Předpoklady testů: co šablona s vypočtenými hodnotami dělá.
// Bez nich by se dalo tvrdit cokoli o `hasWebp` a šablona ho zatím mohla
// přestat používat.
// ---------------------------------------------------------------------------

test('šablona zapojuje náhled přesně tak, jak testy předpokládají', () => {
  assert.match(
    SABLONA,
    /\{hasWebp && <source srcset=\{thumbWebp\} type="image\/webp" \/>\}/,
    'WebP <source> se řídí jen hodnotou hasWebp',
  );
  assert.match(
    SABLONA,
    /<img src=\{thumbUrl\}[^>]*width=\{thumbW\} height=\{thumbH\}/,
    '<img> bere adresu z thumbUrl a rozměry z thumbW/thumbH',
  );
  assert.match(
    SABLONA,
    /loading=\{loading\} decoding="async" fetchpriority=\{fetchpriority\}/,
    'loading a fetchpriority jdou z vypočtených hodnot, ne hardcoded lazy',
  );
  assert.doesNotMatch(
    SABLONA,
    /loading="lazy"/,
    'šablona nesmí hardcoded lazy na každém náhledu',
  );
  assert.match(
    SABLONA,
    /\{thumbUrl && \(\s*<picture>/,
    'bez thumbUrl se <picture> vůbec nevykreslí',
  );
  assert.match(
    SABLONA,
    /<time datetime=\{date\.toISOString\(\)\.slice\(0, 10\)\}>\{dateStr\}<\/time>/,
    '<time> nese strojové datum v atributu a lidské v textu',
  );
  assert.match(
    SABLONA,
    /class=\{`card-thumb \$\{thumbClass\}`\}/,
    'třída náhledu jde z thumbClass',
  );
});

// ---------------------------------------------------------------------------
// Kategorie → třída náhledu → CSS
// ---------------------------------------------------------------------------

test('každá kategorie schématu dostane třídu náhledu, kterou zná CSS', () => {
  for (const kategorie of kategorieZeSchematu()) {
    const { thumbClass } = vykresliKartu(clanek({ category: kategorie }));

    // Karta má vlastní kopii slugify; musí dávat totéž co sdílená knihovna,
    // jinak se URL tématu a barva karty rozejdou.
    assert.equal(
      thumbClass,
      `th-${slugify(kategorie)}`,
      `kategorie "${kategorie}" má na kartě jiný slug než src/lib/slugify.js`,
    );
    assert.match(
      CSS,
      new RegExp(`\\.${thumbClass}\\s*\\{`),
      `pro kategorii "${kategorie}" chybí v global.css pravidlo .${thumbClass}`,
    );
  }
});

// ---------------------------------------------------------------------------
// Výběr náhledu a jeho rozměry
// ---------------------------------------------------------------------------

test('JPG cover s deriváty jde na kartu jako 640×360 WebP', () => {
  assert.ok(existuje(COVER), `fixture ${COVER} v repu chybí`);
  assert.ok(
    existuje(COVER.replace(/\.jpg$/, '-640.jpg')),
    'derivát -640.jpg v repu chybí — test by tiše ověřoval fallback',
  );
  assert.ok(
    existuje(COVER.replace(/\.jpg$/, '-640.webp')),
    'derivát -640.webp v repu chybí — test by tiše ověřoval fallback',
  );

  const karta = vykresliKartu(clanek({ image: COVER }));

  assert.equal(karta.thumbUrl, '/images/clanky/claude-vodoznak-ai-text-640.jpg');
  assert.equal(karta.thumbWebp, '/images/clanky/claude-vodoznak-ai-text-640.webp');
  assert.equal(karta.hasWebp, true);
  assert.equal(karta.thumbW, 640);
  assert.equal(karta.thumbH, 360);
});

test('cover bez derivátů si nechá originál i jeho pravdivé rozměry', () => {
  assert.equal(
    existuje(COVER_BEZ_DERIVATU),
    false,
    'fixture bez derivátů se v repu objevila — vyber jinou cestu',
  );

  const karta = vykresliKartu(clanek({ image: COVER_BEZ_DERIVATU }));

  assert.equal(karta.thumbUrl, COVER_BEZ_DERIVATU);
  assert.equal(karta.hasWebp, false, 'neexistující .webp se nesmí nabídnout');
  assert.equal(karta.thumbW, 1280);
  assert.equal(karta.thumbH, 720);
});

test('článek bez obrázku nevykreslí <picture> vůbec', () => {
  const karta = vykresliKartu(clanek({}));

  assert.equal(karta.thumbUrl, undefined);
  assert.equal(karta.hasWebp, false);
  assert.equal(karta.thumbWebp, null);
});

test('video bez coveru bere náhled z YouTube v jeho rozměrech', () => {
  const karta = vykresliKartu(clanek({ video: VIDEO }));

  assert.equal(karta.videoId, 'dQw4w9WgXcQ');
  assert.equal(karta.thumbUrl, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  assert.equal(karta.thumbW, 480);
  assert.equal(karta.thumbH, 360);
  assert.equal(karta.hasWebp, false, 'bez lokálního coveru není co nabídnout');
});

// ---------------------------------------------------------------------------
// 🔴 KARTA-VIDEO-001 — nález, v tomhle PR se NEOPRAVUJE
// ---------------------------------------------------------------------------

test.todo(
  'KARTA-VIDEO-001: u videa s coverem přebije lokální WebP náhled z YouTube',
  () => {
    const karta = vykresliKartu(clanek({ video: VIDEO, image: COVER }));

    assert.equal(karta.thumbUrl, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    assert.equal(karta.thumbW, 480);
    assert.equal(karta.thumbH, 360);

    // `hasWebp` se počítá z lokálního coveru, ale `thumbUrl` už ukazuje na
    // YouTube. Šablona pak vydá <source> na lokální 640×360 WebP vedle
    // <img src=YouTube width=480 height=360>: prohlížeč s WebP zobrazí lokální
    // obrázek, ne náhled videa, a natlačí ho do rozměrů toho druhého.
    assert.equal(
      karta.hasWebp,
      false,
      'k náhledu z YouTube se nesmí nabídnout <source> na lokální WebP',
    );
  },
);

// ---------------------------------------------------------------------------
// 🔴 KARTA-DATUM-001 — nález, v tomhle PR se NEOPRAVUJE
// ---------------------------------------------------------------------------

/** Spustí kartu v podprocesu s daným časovým pásmem. */
function kartaVPasmu(TZ, datum) {
  const skript = `
    import { vykresliKartu, clanek } from ${JSON.stringify(
      path.join(KOREN, 'scripts/test-karta-render-loader.mjs'),
    )};
    const k = vykresliKartu(clanek({ date: ${JSON.stringify(datum)} }));
    process.stdout.write(JSON.stringify({ dateStr: k.dateStr, datetime: k.datetime }));
  `;
  const beh = spawnSync(process.execPath, ['--input-type=module', '-e', skript], {
    cwd: KOREN,
    encoding: 'utf8',
    env: { ...process.env, TZ },
  });
  assert.equal(beh.status, 0, `podproces v ${TZ} selhal: ${beh.stderr}`);
  return JSON.parse(beh.stdout);
}

test('v UTC i ve středoevropském pásmu sedí viditelné datum na strojové', () => {
  for (const TZ of ['UTC', 'Europe/Prague']) {
    const { dateStr, datetime } = kartaVPasmu(TZ, '2026-08-19');
    assert.equal(datetime, '2026-08-19');
    assert.equal(dateStr, '19. 08. 2026', `pásmo ${TZ}`);
  }
});

test.todo(
  'KARTA-DATUM-001: viditelné datum se nesmí lišit od atributu datetime',
  () => {
    // Datum článku je půlnoc v UTC (parseCalendarDate), atribut `datetime`
    // se čte v UTC (toISOString), ale viditelný text jde přes
    // toLocaleDateString v MÍSTNÍM pásmu buildu. Kdekoli se staví v záporném
    // posunu, karta ukazuje o den dřív, než tvrdí strojové datum.
    for (const TZ of ['America/Los_Angeles', 'Pacific/Honolulu']) {
      const { dateStr, datetime } = kartaVPasmu(TZ, '2026-08-19');
      const [rok, mesic, den] = datetime.split('-');
      assert.equal(
        dateStr,
        `${den}. ${mesic}. ${rok}`,
        `v pásmu ${TZ} se viditelné datum rozešlo s atributem datetime`,
      );
    }
  },
);

// ---------------------------------------------------------------------------
// Doba čtení
// ---------------------------------------------------------------------------

test('bez priority je náhled lazy a bez fetchpriority', () => {
  const karta = vykresliKartu(clanek({ image: COVER }));
  assert.equal(karta.loading, 'lazy');
  assert.equal(karta.fetchpriority, undefined);
});

test('priority=true dá eager a fetchpriority high', () => {
  const karta = vykresliKartu(clanek({ image: COVER }), { priority: true });
  assert.equal(karta.loading, 'eager');
  assert.equal(karta.fetchpriority, 'high');
});

test('doba čtení jde ze skutečné délky textu a nikdy není nula', () => {
  const telo = `${'slovo '.repeat(540)}`;

  assert.equal(vykresliKartu(clanek({ body: telo })).readMinutes, 3);
  assert.equal(readingTime(telo), 3, 'karta a knihovna musí počítat stejně');
  assert.equal(vykresliKartu(clanek({ body: '' })).readMinutes, 1);
});
