// LCP obrázek (hero článku/homepage, první karta /clanky/) má eager +
// fetchpriority=high, ale prohlížeč ho najde až při parsování <body>.
// Jediný <link rel="preload" as="image"> v <head> ho pustí ke stažení
// hned — a musí mířit na TENTÝŽ soubor, který si <picture> vybere,
// jinak se stáhne dvakrát.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { preloadHeroObrazku } from '../src/lib/hero-preload.js';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function zdroj(rel) {
  return readFileSync(path.join(KOREN, rel), 'utf8');
}

const SIZES = '(max-width: 1120px) 100vw, 1120px';

test('WebP srcset → preload s imagesrcset, imagesizes a type', () => {
  const out = preloadHeroObrazku({
    src: '/images/clanky/cover.jpg',
    srcset: '/images/clanky/cover-640.jpg 640w, /images/clanky/cover.jpg 1280w',
    webp: '/images/clanky/cover.webp',
    webpSrcset: '/images/clanky/cover-640.webp 640w, /images/clanky/cover.webp 1280w',
    sizes: SIZES,
  });

  assert.deepEqual(out, {
    href: '/images/clanky/cover.webp',
    imagesrcset: '/images/clanky/cover-640.webp 640w, /images/clanky/cover.webp 1280w',
    imagesizes: SIZES,
    type: 'image/webp',
  });
});

test('jen WebP (bez srcsetu) → preload WebP bez imagesrcset', () => {
  const out = preloadHeroObrazku({
    src: '/images/clanky/cover.jpg',
    webp: '/images/clanky/cover.webp',
    sizes: SIZES,
  });

  assert.deepEqual(out, { href: '/images/clanky/cover.webp', type: 'image/webp' });
});

test('bez WebP → preload JPG, imagesrcset jen když ho má i <img>', () => {
  const seSrcsetem = preloadHeroObrazku({
    src: '/images/clanky/cover.jpg',
    srcset: '/images/clanky/cover-640.jpg 640w, /images/clanky/cover.jpg 1280w',
    sizes: SIZES,
  });
  assert.deepEqual(seSrcsetem, {
    href: '/images/clanky/cover.jpg',
    imagesrcset: '/images/clanky/cover-640.jpg 640w, /images/clanky/cover.jpg 1280w',
    imagesizes: SIZES,
  });

  const bezSrcsetu = preloadHeroObrazku({ src: '/images/clanky/cover.jpg', sizes: SIZES });
  assert.deepEqual(bezSrcsetu, { href: '/images/clanky/cover.jpg' });
});

test('video článek bez coveru → preload YouTube maxresdefault', () => {
  const out = preloadHeroObrazku({
    src: 'https://i.ytimg.com/vi/biYMveTpRWc/maxresdefault.jpg',
    sizes: SIZES,
  });
  assert.deepEqual(out, { href: 'https://i.ytimg.com/vi/biYMveTpRWc/maxresdefault.jpg' });
});

test('bez hero obrázku žádný preload', () => {
  assert.equal(preloadHeroObrazku({}), null);
  assert.equal(preloadHeroObrazku({ src: undefined, webp: '/x.webp' }), null);
});

test('šablona článku dává do <head> právě jeden preload hero obrázku', () => {
  const clanek = zdroj('src/pages/clanky/[...id].astro');

  assert.match(clanek, /from '\.\.\/\.\.\/lib\/hero-preload\.js'/);
  assert.match(
    clanek,
    /const heroPreload = preloadHeroObrazku\(\{\s*src: heroLcpSrc,\s*srcset: heroWebp \? undefined : heroSrcset,\s*webp: heroWebp,\s*webpSrcset: heroWebpSrcset,\s*sizes: heroSizes,\s*\}\)/,
    'preload musí počítat ze STEJNÝCH hodnot, které dostane <picture>',
  );
  assert.match(
    clanek,
    /\{heroPreload && \(\s*<link\s+rel="preload"\s+as="image"\s+href=\{heroPreload\.href\}\s+imagesrcset=\{heroPreload\.imagesrcset\}\s+imagesizes=\{heroPreload\.imagesizes\}\s+type=\{heroPreload\.type\}\s+fetchpriority="high"\s+slot="head"\s+\/>\s*\)\}/,
    'článek musí mít <link rel="preload" as="image"> ve slotu head',
  );
  assert.equal(
    (clanek.match(/rel="preload"/g) ?? []).length,
    1,
    'na stránce článku smí být právě jeden preload',
  );
});

test('homepage dává do <head> právě jeden preload hero obrázku', () => {
  const uvodka = zdroj('src/pages/index.astro');

  assert.match(uvodka, /from '\.\.\/lib\/hero-preload\.js'/);
  assert.match(
    uvodka,
    /const heroPreload = preloadHeroObrazku\(\{\s*src: heroLcpSrc,\s*srcset: heroHasWebp \? undefined : heroSrcset,\s*webp: heroHasWebp \? heroWebp : undefined,\s*webpSrcset: heroWebpSrcset,\s*sizes: HERO_SIZES,\s*\}\)/,
    'homepage smí preloadovat WebP jen když ho <picture> opravdu použije',
  );
  assert.match(
    uvodka,
    /\{heroPreload && \(\s*<link\s+rel="preload"\s+as="image"\s+href=\{heroPreload\.href\}\s+imagesrcset=\{heroPreload\.imagesrcset\}\s+imagesizes=\{heroPreload\.imagesizes\}\s+type=\{heroPreload\.type\}\s+fetchpriority="high"\s+slot="head"\s+\/>\s*\)\}/,
    'homepage musí mít <link rel="preload" as="image"> ve slotu head',
  );
  assert.equal(
    (uvodka.match(/rel="preload"/g) ?? []).length,
    1,
    'na homepage smí být právě jeden preload',
  );
  assert.match(
    uvodka,
    /<source srcset=\{heroWebpSrcset\} sizes=\{HERO_SIZES\}/,
    'imagesizes preloadu a sizes <picture> musí sdílet jednu konstantu',
  );
});

// Karta u videa preferuje lokální cover (KARTA-VIDEO-001) a YouTube bere
// jen jako fallback — preload musí volit STEJNOU podmínkou, jinak stáhne
// jiný soubor, než si <picture> karty vybere, a LCP se stáhne dvakrát.
const VYBER_PRELOADU_KARTY =
  /preloadHeroObrazku\(prvniVideoId && !prvniNahled\.hasLocalThumb\s*\?\s*\{ src: `https:\/\/i\.ytimg\.com\/vi\/\$\{prvniVideoId\}\/maxresdefault\.jpg` \}\s*:\s*\{ src: prvniNahled\.localThumb, webp: prvniNahled\.hasWebp \? prvniNahled\.thumbWebp : undefined \}\)/;
const LINK_PRELOADU_KARTY =
  /\{kartaPreload && \(\s*<link\s+rel="preload"\s+as="image"\s+href=\{kartaPreload\.href\}\s+type=\{kartaPreload\.type\}\s+fetchpriority="high"\s+slot="head"\s+\/>\s*\)\}/;

test('archiv preloaduje první kartu jen na straně 1 — a ze stejných helperů jako karta', () => {
  const archiv = zdroj('src/components/ArticleArchivePage.astro');

  assert.match(archiv, /from '\.\.\/lib\/hero-preload\.js'/);
  assert.match(archiv, /from '\.\.\/lib\/karta-nahled\.js'/);
  assert.match(archiv, /from '\.\.\/lib\/youtube\.js'/);
  assert.match(
    archiv,
    /const prvni = page === 1 \? articles\[0\] : undefined;/,
    '/clanky/strana/2+ nemá eager kartu, takže nesmí mít ani preload',
  );
  assert.match(
    archiv,
    VYBER_PRELOADU_KARTY,
    'preload musí mířit na tentýž soubor jako <picture> karty (WebP > JPG > ytimg fallback)',
  );
  assert.match(
    archiv,
    LINK_PRELOADU_KARTY,
    'archiv musí mít <link rel="preload" as="image"> ve slotu head',
  );
  assert.equal(
    (archiv.match(/rel="preload"/g) ?? []).length,
    1,
    'na archivu smí být právě jeden preload',
  );
});

// Živě 26. 8. 2026: /vitej/ i 404 dávaly první kartě priority (eager +
// fetchpriority=high), ale v <head> neměly žádný <link rel="preload"> —
// prohlížeč našel LCP obrázek až při parsování <body>. Obě stránky nemají
// hero, takže preload patří první kartě — stejný výpočet jako archiv.
test('vitej preloaduje první kartu — ze stejných helperů jako karta', () => {
  const vitej = zdroj('src/pages/vitej.astro');

  assert.match(vitej, /from '\.\.\/lib\/hero-preload\.js'/);
  assert.match(vitej, /from '\.\.\/lib\/karta-nahled\.js'/);
  assert.match(vitej, /from '\.\.\/lib\/youtube\.js'/);
  assert.match(
    vitej,
    VYBER_PRELOADU_KARTY,
    'preload musí mířit na tentýž soubor jako <picture> karty (WebP > JPG > ytimg fallback)',
  );
  assert.match(
    vitej,
    LINK_PRELOADU_KARTY,
    'vitej musí mít <link rel="preload" as="image"> ve slotu head',
  );
  assert.equal(
    (vitej.match(/rel="preload"/g) ?? []).length,
    1,
    'na /vitej/ smí být právě jeden preload',
  );
});

// Živě 26. 8. 2026: /temata/{slug}/ dával první kartě priority (eager +
// fetchpriority=high), ale v <head> neměl žádný <link rel="preload"> —
// stejný dluh, jaký měly /vitej/ a 404. Preload jen na straně 1, strana 2+
// nemá eager LCP nad foldem jistou a preload by soupeřil o pásmo.
test('téma preloaduje první kartu jen na straně 1 — ze stejných helperů jako karta', () => {
  const tema = zdroj('src/components/TemaPage.astro');

  assert.match(tema, /from '\.\.\/lib\/hero-preload\.js'/);
  assert.match(tema, /from '\.\.\/lib\/karta-nahled\.js'/);
  assert.match(tema, /from '\.\.\/lib\/youtube\.js'/);
  assert.match(
    tema,
    /const prvni = page === 1 \? articles\[0\] : undefined;/,
    '/temata/{slug}/strana/2+ nesmí mít preload',
  );
  assert.match(
    tema,
    VYBER_PRELOADU_KARTY,
    'preload musí mířit na tentýž soubor jako <picture> karty (WebP > JPG > ytimg fallback)',
  );
  assert.match(
    tema,
    LINK_PRELOADU_KARTY,
    'téma musí mít <link rel="preload" as="image"> ve slotu head',
  );
  assert.equal(
    (tema.match(/rel="preload"/g) ?? []).length,
    1,
    'na stránce tématu smí být právě jeden preload',
  );
});

test('404 preloaduje první kartu — ze stejných helperů jako karta', () => {
  const notfound = zdroj('src/pages/404.astro');

  assert.match(notfound, /from '\.\.\/lib\/hero-preload\.js'/);
  assert.match(notfound, /from '\.\.\/lib\/karta-nahled\.js'/);
  assert.match(notfound, /from '\.\.\/lib\/youtube\.js'/);
  assert.match(
    notfound,
    VYBER_PRELOADU_KARTY,
    'preload musí mířit na tentýž soubor jako <picture> karty (WebP > JPG > ytimg fallback)',
  );
  assert.match(
    notfound,
    LINK_PRELOADU_KARTY,
    '404 musí mít <link rel="preload" as="image"> ve slotu head',
  );
  assert.equal(
    (notfound.match(/rel="preload"/g) ?? []).length,
    1,
    'na 404 smí být právě jeden preload',
  );
});

test('ostatní šablony nic nepreloadují — LCP preload má homepage, článek, /clanky/, /temata/{slug}/, /vitej/ a 404', () => {
  for (const rel of [
    'src/components/ArticleCard.astro',
    'src/pages/clanky/index.astro',
    'src/pages/clanky/strana/[page].astro',
    'src/pages/temata/[slug].astro',
    'src/pages/temata/[slug]/strana/[page].astro',
    'src/pages/temata/index.astro',
    'src/layouts/Base.astro',
  ]) {
    assert.doesNotMatch(
      zdroj(rel),
      /rel="preload"/,
      `${rel} nesmí preloadovat náhledy výpisů`,
    );
  }
});
