// Audio se generuje dávkově mimo repo (Ada+Orus batch). Čerstvá zpráva smí
// vyjít bez audia — slug tu čeká, dokud další dávka MP3 nedoplní frontmatter.
// Článek, který už audio má (v3 i NotebookLM), sem nepatří.
export const AUDIO_PENDING = new Set([
  'nasa-roman-falcon-heavy',
]);
