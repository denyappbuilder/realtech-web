// Živě 24. 8. 2026: všech 15 náhledů karet na /clanky/ šlo ven s alt="",
// včetně první eager karty (LCP obrázek archivu). Stejně tak náhledy karet
// na úvodce a u souvisejících článků. Karty jsou odkazy na články — náhled
// nese titulek článku jako alt, stejné pravidlo jako hero článku (#310).
// Frontmatter vlastní alt obrázku nemá, alt je data.title.
//
// Pásek videí na úvodce prázdný alt mít smí: jméno odkazu dává viditelný
// vc-title a náhled je aria-hidden — jinak by čtečka jméno zdvojila.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const karta = readFileSync(join(koren, 'src/components/ArticleCard.astro'), 'utf8');
const uvodka = readFileSync(join(koren, 'src/pages/index.astro'), 'utf8');

test('náhled karty (ArticleCard) nese titulek článku jako alt', () => {
  assert.doesNotMatch(
    karta,
    /<img [^>]*alt=""/,
    'náhled karty má prázdný alt — karta je odkaz na článek, alt nese titulek',
  );
  assert.match(
    karta,
    /<img [^>]*alt=\{title\}/,
    'náhled karty musí mít alt s titulkem článku (data.title)',
  );
});

test('náhled v pásku videí je bez altu jen jako skutečná dekorace', () => {
  const strip = uvodka.match(/class="video-grid">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(strip, 'blok .video-grid na úvodce chybí');
  assert.match(
    strip,
    /<img [^>]*alt="" aria-hidden="true"/,
    'náhled videa s prázdným altem musí být aria-hidden — jinak potřebuje titulek',
  );
});
