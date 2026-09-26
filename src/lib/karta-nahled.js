import fs from 'node:fs';
import { youtubeId } from './youtube.js';

/**
 * `sizes` pro srcset 640w+1280w karty. Jedna konstanta pro <source> karty
 * i pro imagesizes preloadu v <head> — když se liší, prohlížeč si z
 * preloadu vybere jiný soubor než z <picture> a LCP se stáhne dvakrát
 * (kolo 21, živě 5. 9. 2026: /clanky/, /temata/ i /temata/{slug}/ na
 * telefonu preloadovaly -640.webp a karta pak tahala plný .webp).
 *
 * Mřížka .grid: 1 col ≤580, 2 col ≤900, 3 col desktop (~341px z 1072).
 */
export const KARTA_SIZES = '(max-width: 580px) calc(100vw - 48px), (max-width: 900px) calc((100vw - 72px) / 2), (max-width: 1120px) calc((100vw - 96px) / 3), 341px';
// Supporting homepage reports use compact rows only on phones.
export const KARTA_SIZES_HOME_COMPACT = '(max-width: 360px) 72px, (max-width: 580px) 96px, (max-width: 900px) calc((100vw - 72px) / 2), (max-width: 1120px) calc((100vw - 96px) / 3), 341px';

// Kolo 56: hero úvodky na desktopu zase vyplňuje výšku textového sloupce
// (redesign.css, dřív 321 px prázdna pod obrázkem). Sloupec 508 × ~600 px
// je užší než 16:9, object-fit: cover potřebuje šířku výška × 16/9 ≈
// 1070 px → na desktopu 1280w. Mobil zůstává 16:9 bez ořezu.
// (Kolo 54 mělo 45vw / 508px pro 16:9 bez ořezu.)
export const HOMEPAGE_HERO_SIZES = '(max-width: 900px) calc(100vw - 48px), 1080px';

/**
 * WebP srcset z derivátů, které v public/ opravdu leží: `-640.webp 640w`,
 * volitelně `-960.webp 960w` (kolo 39, viz scripts/optimize-images.mjs)
 * a plný `.webp 1280w`. Chybějící 960 (starší cover bez přegenerování)
 * srcset nerozbije — sada se jen vrátí k 640w+1280w.
 * Volitelné 192/384w slouží malým kartám; původní 640/full guard zůstává.
 *
 * @param {string} fullWebp — cesta k plnému .webp (/images/clanky/x.webp)
 * @param {(cesta: string) => boolean} exists
 * @returns {string | null} srcset, nebo null když chybí 640 nebo 1280
 */
export function webpSrcsetZDerivatu(fullWebp, exists = (cesta) => fs.existsSync(cesta)) {
  if (!fullWebp || !fullWebp.endsWith('.webp')) return null;
  const small = fullWebp.replace(/\.webp$/, '-640.webp');
  const mid = fullWebp.replace(/\.webp$/, '-960.webp');
  if (!exists(`public${small}`) || !exists(`public${fullWebp}`)) return null;
  const parts = [];
  for (const width of [192, 384]) {
    const candidate = fullWebp.replace(/\.webp$/, `-${width}.webp`);
    if (exists(`public${candidate}`)) parts.push(`${candidate} ${width}w`);
  }
  parts.push(`${small} 640w`);
  if (exists(`public${mid}`)) parts.push(`${mid} 960w`);
  parts.push(`${fullWebp} 1280w`);
  return parts.join(', ');
}

// Mobile boxes are 72/96px square: object-fit: cover needs 16/9 times
// their width from the landscape source (128/171px), before DPR scaling.
export const KARTA_SIZES_ARCHIVE = '(max-width: 360px) 128px, (max-width: 580px) 171px, (max-width: 900px) calc((100vw - 72px) / 2), (max-width: 1120px) calc((100vw - 96px) / 3), 341px';

/**
 * Featured první karta na /temata/{slug}/ (.featured-lead > .card:first-child):
 * od 581px přes celou šířku mřížky, náhled 1.2fr z 2.2fr ≈ 55 % karty,
 * na 1120px wrapu 582px. S obecnými 33vw bral na DPR 1,5 (Windows 150 %)
 * 640w do 873px slotu — měkký obrázek.
 */
export const KARTA_SIZES_FEATURED = '(max-width: 580px) calc(100vw - 48px), (max-width: 1168px) 55vw, 582px';

/**
 * Karty „Další reporty“ pod článkem (.related .grid): 3 col v 760px
 * bloku = 241px, 1 col pod 701px. S obecnými 33vw (422px) si retina
 * desktop bral 1280w plný WebP na tři 236px náhledy (živě 5. 9. 2026,
 * DPR 2: 3× 43–91 KB místo 3× ~20 KB).
 */
export const KARTA_SIZES_RELATED = '(max-width: 700px) calc(100vw - 48px), (max-width: 808px) 30vw, 241px';

/**
 * Kolo 42: náhled v hero railu úvodky (.hero-rail-item img, premium.css:
 * width 100px, aspect-ratio 16/9). Rail se kreslí jen od 901px (pod tím
 * display: none a lazy <img> se nestáhne), takže jediná šířka slotu stačí.
 * Dřív šel do slotu holý <img src=-640.webp> bez srcset/sizes — jediná
 * karta na webu bez <picture>; s sizes si prohlížeč vybere podle DPR
 * a přibude-li menší derivát, vezme ho sám.
 */
export const HERO_RAIL_SIZES = '100px';

/**
 * Náhled položky hero railu — stejná volba zdroje jako ArticleCard:
 * lokální cover (WebP <source> se srcset 640/960/1280w) má přednost,
 * YouTube maxresdefault je jen fallback pro video článek bez coveru
 * (frontmatter `image` mířící na neexistující soubor nesmí poslat rail
 * na 404). Bez coveru i videa → null, rail položku kreslí bez obrázku.
 *
 * @param {{ image?: string | null, video?: string | null }} data
 * @param {(cesta: string) => boolean} [exists]
 * @returns {{ src: string, width: number, height: number, webp: string | null, webpSrcset: string | null } | null}
 */
export function nahledRailu({ image, video }, exists = (cesta) => fs.existsSync(cesta)) {
  const nahled = nahledKarty(image, exists);
  if (nahled.hasLocalThumb) {
    return {
      src: nahled.lcpSrc,
      width: nahled.thumbW,
      height: nahled.thumbH,
      webp: nahled.hasWebp ? nahled.thumbWebp : null,
      webpSrcset: nahled.hasWebp ? nahled.thumbWebpSrcset : null,
    };
  }
  const videoId = youtubeId(video);
  if (!videoId) return null;
  return {
    src: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    width: 1280,
    height: 720,
    webp: null,
    webpSrcset: null,
  };
}

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
  const thumbWebpSrcset = hasFullWebp ? webpSrcsetZDerivatu(fullWebp, exists) : null;
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
