export const SAME_DATE_ARTICLES = Object.freeze([
  Object.freeze({
    id: 'starship-ship-40-vanocni-ostrov',
    date: '2026-08-18T00:00:00.000Z',
    category: 'AI Report',
  }),
  Object.freeze({
    id: 'chatgpt-pro-teenagery',
    date: '2026-08-18T00:00:00.000Z',
    category: 'AI Report',
  }),
  Object.freeze({
    id: 'older-article',
    date: '2026-08-17T00:00:00.000Z',
    category: 'AI Report',
  }),
]);

export const SAME_DATE_EXPECTED_IDS = Object.freeze([
  'chatgpt-pro-teenagery',
  'starship-ship-40-vanocni-ostrov',
  'older-article',
]);

export function sameDateArticles(createArticle) {
  return SAME_DATE_ARTICLES.map(({ id, date, category }) => createArticle({
    id,
    date: new Date(date),
    category,
  }));
}

export function bothInputOrders(entries) {
  return [entries, [...entries].reverse()];
}
