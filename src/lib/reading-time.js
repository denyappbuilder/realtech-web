// Doba čtení počítaná z reálné délky textu (ne z ručního odhadu ve frontmatteru,
// který se v praxi rozcházel až o 3 minuty). 180 slov/min = běžné tempo čtení češtiny.
// Markdown značky, odkazy a HTML se do počtu nezapočítávají.
export function readingTime(body = '') {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')          // bloky kódu
    .replace(/<[^>]+>/g, ' ')                  // HTML (embedy)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // odkazy → jen text
    .replace(/[#*_>`|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
