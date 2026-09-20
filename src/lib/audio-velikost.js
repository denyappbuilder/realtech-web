/**
 * Kolo 45: velikost MP3 pro řadu „Stáhnout MP3“ pod přehrávačem.
 *
 * Deep Dive má živě 21–31 MB (20. 9. 2026) a čtenář to před klikem
 * neviděl — jen délku. Kolo 36/44 zakázalo smyšlenou velikost (odhad
 * z délky × bitrate), takže se bere skutečná: HEAD na soubor při buildu,
 * Content-Length z R2. Bez sítě, při chybě nebo po timeoutu se velikost
 * jen neukáže (undefined) — build ani přehrávač na tom nestojí. Žádný
 * re-encode historie: UI jen říká pravdu o tom, co se stáhne.
 */
export const VELIKOST_TIMEOUT_MS = 4000;

/**
 * @param {string | undefined} src — absolutní URL MP3
 * @param {{ fetchFn?: typeof fetch, timeoutMs?: number }} [volby]
 * @returns {Promise<number | undefined>} bajty, nebo undefined
 */
export async function velikostAudia(src, { fetchFn = globalThis.fetch, timeoutMs = VELIKOST_TIMEOUT_MS } = {}) {
  if (typeof src !== 'string' || !/^https?:\/\//.test(src) || typeof fetchFn !== 'function') return undefined;
  try {
    const res = await fetchFn(src, { method: 'HEAD', signal: AbortSignal.timeout(timeoutMs) });
    if (!res?.ok) return undefined;
    const bajty = Number(res.headers.get('content-length'));
    return Number.isFinite(bajty) && bajty > 0 ? bajty : undefined;
  } catch {
    return undefined;
  }
}

/**
 * „31 MB“ (SI, celé MB; pod 1 MB „0,8 MB“). Bez hodnoty undefined —
 * šablona pak řadu s velikostí nevykreslí.
 * @param {number | undefined} bajty
 * @returns {string | undefined}
 */
export function formatVelikost(bajty) {
  if (!Number.isFinite(bajty) || bajty <= 0) return undefined;
  const mb = bajty / 1e6;
  const text = mb >= 10 ? String(Math.round(mb)) : (Math.round(mb * 10) / 10).toFixed(1).replace('.', ',');
  return `${text} MB`;
}
