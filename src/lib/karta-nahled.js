import fs from 'node:fs';

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
  return {
    localThumb,
    thumbW: pouzilSmall ? 640 : 1280,
    thumbH: pouzilSmall ? 360 : 720,
    thumbWebp,
    hasWebp,
    // Stejný důvod jako hero: <img src> musí být WebP, jinak LCP první
    // karty na /clanky/ stáhne -640.jpg i když -640.webp leží vedle.
    lcpSrc: hasWebp ? thumbWebp : localThumb,
    // Rozhoduje, jestli u videa vyhraje lokální cover, nebo YouTube náhled —
    // frontmatter `image` mířící na neexistující soubor nesmí kartu poslat na 404.
    hasLocalThumb: exists(`public${localThumb}`),
  };
}
