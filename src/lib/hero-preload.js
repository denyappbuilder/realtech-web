/**
 * Atributy pro <link rel="preload" as="image"> LCP obrázku.
 *
 * LCP obrázek (hero článku/homepage, první karta archivu) má
 * `loading="eager"` + `fetchpriority="high"`, ale prohlížeč ho najde až
 * při parsování <body> — preload v <head> ho pustí do fronty hned se
 * skenem hlavičky. Musí mířit na STEJNÝ soubor, který si <picture>
 * nakonec vybere, jinak se stáhne dvakrát:
 *
 * - WebP srcset → imagesrcset/imagesizes + type, ať prohlížeč vybere
 *   stejnou šířku jako u <source>. `href` je fallback pro prohlížeče
 *   bez podpory imagesrcset.
 * - jen WebP (bez srcsetu) → preload WebP; `type` zajistí, že prohlížeč
 *   bez WebP preload přeskočí a stáhne si JPG z <img>.
 * - jinak JPG / YouTube maxresdefault, s imagesrcset jen když ho má i <img>.
 *
 * Jeden preload na stránku — nic dalšího (další karty, loga) se nepreloaduje.
 *
 * @param {{
 *   src?: string | null,
 *   srcset?: string,
 *   webp?: string | null,
 *   webpSrcset?: string,
 *   sizes?: string,
 * }} hero — přesně to, co dostane <picture> (viz hero-obrazek.js / homepage).
 * @returns {{ href: string, imagesrcset?: string, imagesizes?: string, type?: string } | null}
 */
export function preloadHeroObrazku({ src, srcset, webp, webpSrcset, sizes } = {}) {
  if (!src) return null;

  if (webpSrcset && webp) {
    return { href: webp, imagesrcset: webpSrcset, imagesizes: sizes, type: 'image/webp' };
  }
  if (webp) {
    return { href: webp, type: 'image/webp' };
  }
  if (srcset) {
    return { href: src, imagesrcset: srcset, imagesizes: sizes };
  }
  return { href: src };
}
