import { popisProVyhledavace } from './popis-pro-vyhledavace.js';

/** Repair only a demonstrable machine cut: the description is an exact prefix
 * of the authored body and ends inside its next word. Never rewrite an
 * independent editorial deck, append invented facts or mutate content. */
export function articleLead(description = '', body = '') {
  const text = description.trim();
  const start = body.trimStart();
  if (text && start.startsWith(text) && /\p{L}$/u.test(text)
      && /^\p{L}/u.test(start.slice(text.length))) {
    return popisProVyhledavace(text, text.length - 1);
  }
  return description;
}
