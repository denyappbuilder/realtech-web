/**
 * Náhled videa v pásku „Nejnovější videa“ na úvodce.
 *
 * .vc-thumb je 16:9. sddefault (640×480) je 4:3 s černými pruhy, které
 * dořezával object-fit — ostrých zbylo jen 640×360. hq720 je nativní
 * 1280×720, ale jako JPEG ~185 KB na kus (tři thumby ~560 KB, stejná past
 * jako maxresdefault v srpnu 2026). WebP varianta z i.ytimg.com/vi_webp/ má
 * tentýž 1280×720 za ~85 KB, JPEG zůstává jen fallbackem <picture>.
 *
 * hq720 existuje jen u videí nahraných aspoň v 720p. Build proto hlavičkou
 * ověří, že tam je; na 404 padá pásek na sddefault se svými rozměry.
 * Chyba sítě hq720 neshodí — bez sítě běží úvodka na snapshotu videí
 * a ta hq720 mají.
 */
const YTIMG = 'https://i.ytimg.com';

/**
 * @param {string} id
 * @param {{ hd?: boolean }} [volby]
 */
export function videoPasekNahled(id, { hd = true } = {}) {
  const nazev = hd ? 'hq720' : 'sddefault';
  return {
    webp: `${YTIMG}/vi_webp/${id}/${nazev}.webp`,
    jpg: `${YTIMG}/vi/${id}/${nazev}.jpg`,
    width: hd ? 1280 : 640,
    height: hd ? 720 : 480,
    // Kolo 53: slot pásku je 341 px (mobil ~342 px). mqdefault (320×180,
    // nativní 16:9) stačí pro DPR 1, hq720 zůstává pro DPR 2 a širší.
    webpSrcset: hd ? `${YTIMG}/vi_webp/${id}/mqdefault.webp 320w, ${YTIMG}/vi_webp/${id}/${nazev}.webp 1280w` : undefined,
  };
}

/**
 * @param {string} id
 * @param {typeof fetch} [fetchFn]
 */
export async function maHq720(id, fetchFn = globalThis.fetch) {
  try {
    const res = await fetchFn(`${YTIMG}/vi/${id}/hq720.jpg`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return res.status !== 404;
  } catch {
    return true;
  }
}

/**
 * @template {{ id: string }} V
 * @param {V[]} videa
 * @param {typeof fetch} [fetchFn]
 */
export async function videaSNahledem(videa, fetchFn = globalThis.fetch) {
  return Promise.all(
    videa.map(async (v) => ({ ...v, nahled: videoPasekNahled(v.id, { hd: await maHq720(v.id, fetchFn) }) })),
  );
}
