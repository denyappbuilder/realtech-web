/**
 * Parser status URL pro oficiální embed příspěvku z X (Twitteru).
 *
 * Video zůstává u X — nic nestahujeme, nerehostujeme ani nelinkujeme
 * video.twimg.com. Embed je vždy oficiální widget (blockquote.twitter-tweet
 * + widgets.js), který si soubor přehraje ve vlastním iframe.
 *
 * `href` se kanonizuje na twitter.com, protože widgets.js historicky
 * ignoroval x.com odkazy v blockquote. `webHref` je lidský odkaz na x.com
 * pro viditelný fallback „Otevřít na X“.
 *
 * @param {string | null | undefined} url
 * @returns {{ id: string, ucet: string, href: string, webHref: string } | undefined}
 */
const POVOLENE_HOSTY = new Set([
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'mobile.twitter.com',
]);

const UCET = /^[A-Za-z0-9_]{1,15}$/;
const STATUS_ID = /^\d{1,25}$/;

export function xPostEmbed(url) {
  if (url == null || url === '') return undefined;

  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    return undefined;
  }

  if (parsed.protocol !== 'https:') return undefined;
  if (!POVOLENE_HOSTY.has(parsed.hostname.toLowerCase())) return undefined;

  // Jen /<ucet>/status/<id>. Přívěsky jako /photo/1 nebo /video/1 odmítáme —
  // embed vždy míří na celý příspěvek a autor má dát čistou status URL.
  const casti = parsed.pathname.split('/').filter(Boolean);
  if (casti.length !== 3 || casti[1] !== 'status') return undefined;

  const [ucet, , id] = casti;
  if (!UCET.test(ucet) || !STATUS_ID.test(id)) return undefined;

  return {
    id,
    ucet,
    href: `https://twitter.com/${ucet}/status/${id}`,
    webHref: `https://x.com/${ucet}/status/${id}`,
  };
}
