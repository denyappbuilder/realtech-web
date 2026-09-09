/**
 * Kopírování odkazu do schránky bez navigace.
 *
 * Kolo 34: tlačítko „Kopírovat odkaz“ mělo v catch `location.href = url`
 * — když Clipboard API selže (http bez TLS, zamítnuté oprávnění, starý
 * WebView, `navigator.clipboard` undefined), stránka se znovu načetla
 * a čtenář přišel o pozici i o vysvětlení. Tady: Clipboard API, při
 * selhání execCommand('copy') přes dočasný textarea, a když nejde ani
 * to, vrací false — hlášení nese volající (živá oblast + text tlačítka).
 * Nikdy nehází, nikdy nenaviguje.
 */

/**
 * @param {string} text
 * @param {Document} [doc]
 * @returns {Promise<boolean>} true = text je ve schránce
 */
export async function zkopirujText(text, doc = globalThis.document) {
  const clipboard = doc?.defaultView?.navigator?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      /* spadne na execCommand níž */
    }
  }
  return zkopirujExecCommand(text, doc);
}

/**
 * Zastaralý, ale jediný synchronní fallback bez oprávnění: vybrat text
 * v dočasném poli a zavolat copy. Pole je mimo tok i mimo čtečku
 * (aria-hidden, tabindex -1) a hned zase zmizí; fokus se vrací na prvek,
 * kde byl před kliknutím, aby klávesnice neskončila na <body>.
 *
 * @param {string} text
 * @param {Document} [doc]
 * @returns {boolean}
 */
export function zkopirujExecCommand(text, doc = globalThis.document) {
  if (!doc?.body || typeof doc.execCommand !== 'function') return false;
  const pole = doc.createElement('textarea');
  pole.value = text;
  pole.setAttribute('readonly', '');
  pole.setAttribute('aria-hidden', 'true');
  pole.setAttribute('tabindex', '-1');
  pole.style.position = 'fixed';
  pole.style.top = '0';
  pole.style.left = '-9999px';
  pole.style.opacity = '0';
  const predtim = doc.activeElement;
  doc.body.appendChild(pole);
  let ok = false;
  try {
    pole.select();
    ok = doc.execCommand('copy') === true;
  } catch {
    ok = false;
  }
  pole.remove();
  if (predtim && typeof predtim.focus === 'function') predtim.focus();
  return ok;
}
