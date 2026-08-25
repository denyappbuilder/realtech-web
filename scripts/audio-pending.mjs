// Audio se generuje dávkově mimo repo (Ada+Orus batch). Čerstvá zpráva smí
// vyjít bez audia — slug tu čeká, dokud další dávka MP3 nedoplní frontmatter.
// NotebookLM Deep Dive nemá Ada+Petr transcript; last10/transcript testy
// pořád chtějí v3, proto jsou tyhle slugy ve stejné výjimce.
export const AUDIO_PENDING = new Set([
  'claude-vybadek-24-srpna',
  'anthropic-ipo-dva-biliony-investori',
  'gemini-plus-rok-zdarma-studenti',
  'openai-pauza-rl-treninku-astra',
  'chatgpt-pro-teenagery',
  'starship-ship-40-vanocni-ostrov',
]);
