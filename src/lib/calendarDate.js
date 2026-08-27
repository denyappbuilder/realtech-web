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

const ISO_DATETIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Datum vydání: buď kalendářní den (půlnoc UTC), nebo ISO čas s pásmem.
 * Date-only = začátek dne — stejný den s pozdějším timestampem ho proto
 * v newest-first řazení předběhne, aniž by se sahalo na slug/id.
 * `updated` zůstává jen kalendářní den (redakční lastmod).
 */
export function parsePublishDate(value) {
  if (typeof value !== 'string') return undefined;

  const calendar = parseCalendarDate(value);
  if (calendar) return calendar;

  const match = ISO_DATETIME.exec(value);
  if (!match) return undefined;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , offset] = match;
  if (!parseCalendarDate(`${yearText}-${monthText}-${dayText}`)) return undefined;

  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (hour > 23 || minute > 59 || second > 59) return undefined;

  if (offset !== 'Z') {
    const offsetHour = Number(offset.slice(1, 3));
    const offsetMinute = Number(offset.slice(4, 6));
    if (offsetHour > 14 || offsetMinute > 59) return undefined;
    if (offsetHour === 14 && offsetMinute !== 0) return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return undefined;
  return parsed;
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
