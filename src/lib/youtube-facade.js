const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

/**
 * Nahradí lokální náhled YouTube iframe až po výslovné aktivaci uživatelem.
 * Do té doby stránka nepošle žádný požadavek na YouTube ani Google.
 *
 * @param {HTMLElement} facade
 * @returns {HTMLIFrameElement | null}
 */
export function aktivujYoutubeFacade(facade) {
  const videoId = facade.dataset.videoId ?? '';
  if (!VIDEO_ID.test(videoId) || facade.querySelector('iframe')) return null;

  const iframe = facade.ownerDocument.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  iframe.title = facade.dataset.videoTitle || 'YouTube video';
  iframe.allow = ALLOW;
  iframe.allowFullscreen = true;
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

  facade.replaceChildren(iframe);
  iframe.focus?.();
  return iframe;
}

/**
 * Nativní button zajišťuje aktivaci kliknutím, Enterem i mezerníkem.
 *
 * @param {Document | ParentNode} [root]
 */
export function inicializujYoutubeFacades(root = document) {
  root.querySelectorAll('[data-youtube-facade]').forEach((facade) => {
    const button = facade.querySelector('.youtube-facade-button');
    button?.addEventListener('click', () => aktivujYoutubeFacade(facade), { once: true });
  });
}
