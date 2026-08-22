export function parseCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date;
}

/**
 * Viditelné české datum ze stejné půlnoci UTC, kterou vrací parseCalendarDate.
 * Bez timeZone: 'UTC' by toLocaleDateString v pásmu západně od UTC ukázalo den předtím
 * (Z10092 — KARTA-DATUM-001).
 */
export function formatCalendarDateCs(date) {
  if (!date) return undefined;
  return date.toLocaleDateString('cs-CZ', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
