import fs from 'node:fs';

/**
 * Hero obrázek článku bez videa.
 *
 * Homepage už dává do WebP `srcset` existující `-640.webp` a 1280 jako
 * fallback. Detail článku dřív nabízel jen plné `.webp`, takže mobil
 * stahoval 1280 i když 640 v `public/` bylo.
 *
 * 640 do srcset jen když soubor opravdu existuje. Jinak zůstane samotné
 * 1280.webp (nebo JPG) — chybějící derivát nesmí rozbít <picture>.
 *
 * Článek je přes celou šířku `.wrap` (1120 px), ne 40vw jako homepage.
 */
export const CLANEK_HERO_SIZES = '(max-width: 1120px) 100vw, 1120px';

/**
 * @param {string | null | undefined} image
 * @param {(cesta: string) => boolean} [exists]
 */
export function heroObrazekClanku(image, exists = (cesta) => fs.existsSync(cesta)) {
  if (!image) {
    return {
      src: undefined,
      srcset: undefined,
      webp: undefined,
      webpSrcset: undefined,
      sizes: CLANEK_HERO_SIZES,
    };
  }

  const jeJpg = image.endsWith('.jpg');
  const jpgSmall = jeJpg ? image.replace(/\.jpg$/, '-640.jpg') : null;
  const srcset = jpgSmall && exists(`public${jpgSmall}`)
    ? `${jpgSmall} 640w, ${image} 1280w`
    : undefined;

  const webp = jeJpg ? image.replace(/\.jpg$/, '.webp') : null;
  const webpSmall = webp ? webp.replace(/\.webp$/, '-640.webp') : null;
  const hasWebp = Boolean(webp && exists(`public${webp}`));
  const hasWebpSmall = Boolean(webpSmall && exists(`public${webpSmall}`));
  const webpSrcset = hasWebp && hasWebpSmall
    ? `${webpSmall} 640w, ${webp} 1280w`
    : undefined;

  return {
    src: image,
    srcset,
    webp: hasWebp ? webp : undefined,
    webpSrcset,
    sizes: CLANEK_HERO_SIZES,
  };
}
