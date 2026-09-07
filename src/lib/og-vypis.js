import fs from 'node:fs';

/**
 * OG náhled výpisu: brandovaný /images/og/{id}.jpg prvního článku,
 * jinak jeho cover. Bez článku / bez souboru vrací prázdný objekt —
 * Base pak padá na /og-default.jpg.
 *
 * Listingy (/clanky/, /temata/, /temata/{slug}/) živě posílaly jen
 * og-default, i když brandovaný OG prvního článku už v public/ byl.
 *
 * @param {{ id?: string, data?: { title?: string, image?: string } } | undefined} article
 * @returns {{ image?: string, imageAlt?: string }}
 */
export function ogObrazekClanku(article) {
  if (!article?.id) return {};
  const branded = `/images/og/${article.id}.jpg`;
  if (fs.existsSync(`public${branded}`)) {
    return { image: branded, imageAlt: article.data?.title };
  }
  if (typeof article.data?.image === 'string' && article.data.image) {
    return { image: article.data.image, imageAlt: article.data.title };
  }
  return {};
}
