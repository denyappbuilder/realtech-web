/**
 * Popisek klávesové zkratky vyhledávání podle platformy návštěvníka.
 *
 * Handler v SearchModal.astro poslouchá metaKey I ctrlKey, ale popisek
 * v hlavičce byl natvrdo ⌘K — na Windows/Linuxu (většina návštěvníků)
 * ukazoval klávesu, která na klávesnici není. Markup nechává ⌘K jako
 * výchozí a klient přes tuhle funkci přepne na Ctrl+K, kde ⌘ nedává smysl.
 *
 * @param {string | undefined} platforma `navigator.userAgentData?.platform`
 *   (např. "macOS", "Windows"), s fallbackem na `navigator.platform`
 *   (např. "MacIntel", "Win32", "Linux x86_64", na iOS "iPhone"/"iPad").
 * @returns {"⌘K" | "Ctrl+K"}
 */
export function zkratkaHledani(platforma) {
  return /mac|iphone|ipad|ipod/i.test(platforma ?? '') ? '⌘K' : 'Ctrl+K';
}
