import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { chybaTvaruImage } from '../src/lib/image-cesta.js';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');

test('odmítá skutečný parent segment v Unix i Windows zápisu', () => {
  const traversalCesty = [
    '/images/clanky/../tajne.jpg',
    '/images/clanky/..\\tajne.jpg',
  ];

  for (const image of traversalCesty) {
    assert.equal(
      chybaTvaruImage(image),
      `image "${image}" nemá povolený tvar`,
      image,
    );
  }
});

test('povoluje jen prefix /images/clanky/', () => {
  assert.equal(chybaTvaruImage('/images/clanky/nahled.jpg'), null);

  for (const image of [
    'images/clanky/nahled.jpg',
    '/images/nahled.jpg',
    '/images/clanky-jine/nahled.jpg',
  ]) {
    assert.equal(
      chybaTvaruImage(image),
      `image "${image}" musí začínat /images/clanky/`,
      image,
    );
  }
});

test('prázdná a null hodnota znamenají chybějící volitelný obrázek', () => {
  assert.equal(chybaTvaruImage(''), null);
  assert.equal(chybaTvaruImage(null), null);
  assert.equal(chybaTvaruImage(undefined), null);
});

test(
  'povoluje dvě tečky uvnitř bezpečného názvu souboru [codex-testy-web/IMAGE-CESTA-001]',
  { todo: '[codex-testy-web/IMAGE-CESTA-001]' },
  () => {
    assert.equal(chybaTvaruImage('/images/clanky/nahled..final.jpg'), null);
  },
);

// ---------------------------------------------------------------------------
// Skutečný obsah repa: `image:` ve frontmatteru musí mířit na existující
// soubor. validate-content to hlídá až v prebuildu — test to chytí dřív.
// ---------------------------------------------------------------------------

// Stejný parser frontmatteru jako validate-content/generate-og (Z10036):
// oddělovač je řádek ---, ne výskyt v hodnotě.
function frontmatter(slug) {
  const raw = readFileSync(join(koren, 'src/content/clanky', `${slug}.md`), 'utf8');
  return raw.split(/^---\s*$/m)[1] ?? '';
}

function imageZFrontmatteru(slug) {
  return frontmatter(slug).match(/^image:\s*["']?(.+?)["']?\s*$/m)?.[1];
}

test('image každého článku má povolený tvar a existující soubor', () => {
  const clanky = readdirSync(join(koren, 'src/content/clanky'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
  assert.ok(clanky.length >= 70, `kolekce článků vypadá useknutě: ${clanky.length}`);

  for (const slug of clanky) {
    const image = imageZFrontmatteru(slug);
    if (!image) continue;
    assert.equal(chybaTvaruImage(image), null, slug);
    assert.ok(
      existsSync(join(koren, `public${image}`)),
      `${slug}: image "${image}" v public/ neexistuje`,
    );
  }
});

// Živě 26. 8. 2026: 13 video článků nemělo žádný lokální cover — hero LCP
// stahoval i.ytimg.com maxresdefault (150–190 KB) a lokální WebP vracel 404.
// Cover + deriváty (optimize-images) jsou teď v repu a frontmatter `image`
// je zapojuje do <picture> + preload jako u starlink-v-cesku-pruvodce.
test('video články z nálezu 26. 8. 2026 mají lokální cover včetně derivátů', () => {
  const slugy = [
    'starlink-mini-vs-standard',
    'dji-vs-insta360',
    'nvidia-n1x-notebooky',
    'claude-anthropic-pentagon',
    'dji-ban-usa',
    'poco-m8-vs-m8-pro',
    'proc-je-spacex-tak-napred',
    'spacex-starfall-raketova-doprava',
    'starlink-1gbs-2026',
    'starlink-konkurenti',
    'starlink-mini-test',
    'windows-arm-vs-macbook',
    'xiaomi-kdo-ma-kontrolu',
  ];

  for (const slug of slugy) {
    assert.equal(
      imageZFrontmatteru(slug),
      `/images/clanky/${slug}.jpg`,
      `${slug}: frontmatter nemá image na lokální cover`,
    );
    for (const soubor of [
      `${slug}.jpg`,
      `${slug}-640.jpg`,
      `${slug}.webp`,
      `${slug}-640.webp`,
    ]) {
      assert.ok(
        existsSync(join(koren, 'public/images/clanky', soubor)),
        `${slug}: chybí public/images/clanky/${soubor}`,
      );
    }
  }
});
