export const slugify = (s) =>
  s.toLowerCase()
   .normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/\s+/g, '-');
