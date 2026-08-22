/**
 * YouTube ID z URL videa ve frontmatteru.
 *
 * Starý regex `/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/`
 * neověřoval hostname ani hranici za 11. znakem. Vzal ID z example.com,
 * z `not-youtu.be` i z parametru `notv`, a 12znakové `youtu.be/…X`
 * ořízl na cizí video (Z1069).
 *
 * @param {string | null | undefined} url
 * @returns {string | undefined}
 */
const POVOLENE_HOSTY = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(url) {
  if (url == null || url === '') return undefined;

  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    return undefined;
  }

  const host = parsed.hostname.toLowerCase();
  if (!POVOLENE_HOSTY.has(host)) return undefined;

  const casti = parsed.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    const id = casti[0];
    return casti.length === 1 && ID.test(id) ? id : undefined;
  }

  if (casti[0] === 'watch') {
    const id = parsed.searchParams.get('v') ?? '';
    return ID.test(id) ? id : undefined;
  }

  if (casti[0] === 'shorts' || casti[0] === 'embed' || casti[0] === 'live') {
    const id = casti[1] ?? '';
    return casti.length === 2 && ID.test(id) ? id : undefined;
  }

  return undefined;
}
