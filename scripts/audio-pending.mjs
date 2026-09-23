export const AUDIO_PENDING = new Set([
  // 2026-09-23: publikováno bez podcastu na výslovné přání Deny (SKIPPED_BY_DENY).
  'grok-bot-astra-tym-agentu',
]);

/**
 * Slug článku → klíč MP3 v R2, když se liší. Konvence je `<slug>-nlm.mp3`;
 * po přejmenování slugu (kolo 42: `-admin` pryč z URL) ale audio zůstává
 * na původním klíči — přehrávač vrací 200 bez přejmenování v R2 a bez
 * nového `?v=`. Až se soubor v R2 přejmenuje, záznam odsud zmizí.
 */
export const AUDIO_R2_KLIC = new Map([
  ['gemini-notebook-external-sharing', 'gemini-notebook-external-sharing-admin'],
]);
