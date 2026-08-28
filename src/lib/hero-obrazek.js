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
 *
 * Video článek bez frontmatter `image:` dřív vracel prázdné `src` a YouTube
 * facade se renderovala bez náhledu — LCP byl prázdný 16:9 box s play ikonou
 * (živě např. /clanky/dji-vs-insta360/). Karty (ArticleCard) přitom už dávno
 * padají na i.ytimg.com. Tady bereme maxresdefault (1280×720, 16:9) — facade
 * je 1120 px široká a šablona už na maxres spoléhá u og:image i VideoObject.
 * Lokální cover má přednost, YouTube thumb je jen fallback.
 */
export const CLANEK_HERO_SIZES = '(max-width: 1120px) 100vw, 1120px';

/**
 * @param {string | null | undefined} image
 * @param {string | null | undefined} [videoId]
 * @param {(cesta: string) => boolean} [exists]
 */
export function heroObrazekClanku(image, videoId, exists = (cesta) => fs.existsSync(cesta)) {
  if (!image) {
    const src = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined;
    return {
      src,
      lcpSrc: src,
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
    // Chrome s fetchpriority=high spekulativně tahá <img src> dřív, než
    // vyhodnotí <source type="image/webp">. Živě 28. 8. 2026 proto LCP
    // hlásil .jpg, i když .webp v public/ bylo.
    lcpSrc: hasWebp ? webp : image,
    srcset,
    webp: hasWebp ? webp : undefined,
    webpSrcset,
    sizes: CLANEK_HERO_SIZES,
  };
}
