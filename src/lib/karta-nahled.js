import fs from 'node:fs';

/**
 * `sizes` pro srcset 640w+1280w karty. Jedna konstanta pro <source> karty
 * i pro imagesizes preloadu v <head> — když se liší, prohlížeč si z
 * preloadu vybere jiný soubor než z <picture> a LCP se stáhne dvakrát
 * (kolo 21, živě 5. 9. 2026: /clanky/, /temata/ i /temata/{slug}/ na
 * telefonu preloadovaly -640.webp a karta pak tahala plný .webp).
 *
 * Mřížka .grid: 1 col ≤580, 2 col ≤900, 3 col desktop (~341px z 1072).
 */
export const KARTA_SIZES = '(max-width: 580px) 100vw, (max-width: 900px) 50vw, 33vw';

/**
 * Featured první karta na /temata/{slug}/ (.featured-lead > .card:first-child):
 * od 581px přes celou šířku mřížky, náhled 1.2fr z 2.2fr ≈ 55 % karty,
 * na 1120px wrapu 582px. S obecnými 33vw bral na DPR 1,5 (Windows 150 %)
 * 640w do 873px slotu — měkký obrázek.
 */
export const KARTA_SIZES_FEATURED = '(max-width: 580px) 100vw, (max-width: 1168px) 55vw, 582px';

/**
 * Karty „Další reporty“ pod článkem (.related .grid): 3 col v 760px
 * bloku = 241px, 1 col pod 701px. S obecnými 33vw (422px) si retina
 * desktop bral 1280w plný WebP na tři 236px náhledy (živě 5. 9. 2026,
 * DPR 2: 3× 43–91 KB místo 3× ~20 KB).
 */
export const KARTA_SIZES_RELATED = '(max-width: 700px) 100vw, (max-width: 808px) 30vw, 241px';

/**
 * Náhled na kartě článku.
 *
 * `replace(/\.jpg$/, …)` na PNG/WebP nic nenahradí, takže `small === image`,
 * karta dostane `width=640 height=360` na plný obrázek a
 * `<source type="image/webp">` ukáže na PNG (Z1071).
 *
 * Variantu 640px a WebP odvozujeme jen z `.jpg`. Ostatní přípony jdou
 * jako originál s pravdivými rozměry a bez WebP `<source>`.
 *
 * @param {string | null | undefined} image
 * @param {(cesta: string) => boolean} [exists]
 */
export function nahledKarty(image, exists = (cesta) => fs.existsSync(cesta)) {
  if (!image) {
    return {
      localThumb: undefined,
      thumbW: 1280,
      thumbH: 720,
      thumbWebp: null,
      thumbWebpSrcset: null,
      hasWebp: false,
      hasLocalThumb: false,
    };
  }

  const jeJpg = image.endsWith('.jpg');
  const small = jeJpg ? image.replace(/\.jpg$/, '-640.jpg') : null;
  const localThumb = small && exists(`public${small}`) ? small : image;
  const pouzilSmall = Boolean(small) && localThumb === small;

  const thumbWebp = jeJpg && localThumb
    ? localThumb.replace(/\.jpg$/, '.webp')
    : null;

  const hasWebp = Boolean(thumbWebp && exists(`public${thumbWebp}`));
  // Retina / širší karta: když leží plný WebP vedle -640.webp, dej srcset
  // 640w+1280w (stejný vzor jako hero). Jinak single URL beze změny.
  const fullWebp = jeJpg ? image.replace(/\.jpg$/, '.webp') : null;
  const hasFullWebp = Boolean(fullWebp && pouzilSmall && hasWebp && exists(`public${fullWebp}`));
  const thumbWebpSrcset = hasFullWebp ? `${thumbWebp} 640w, ${fullWebp} 1280w` : null;
  return {
    localThumb,
    thumbW: pouzilSmall ? 640 : 1280,
    thumbH: pouzilSmall ? 360 : 720,
    thumbWebp,
    thumbWebpSrcset,
    hasWebp,
    // Stejný důvod jako hero: <img src> musí být WebP, jinak LCP první
    // karty na /clanky/ stáhne -640.jpg i když -640.webp leží vedle.
    lcpSrc: hasWebp ? thumbWebp : localThumb,
    // Rozhoduje, jestli u videa vyhraje lokální cover, nebo YouTube náhled —
    // frontmatter `image` mířící na neexistující soubor nesmí kartu poslat na 404.
    hasLocalThumb: exists(`public${localThumb}`),
  };
}
