// Stub globálního fetch pro testy OG generátoru — žádná síť.
// Zaznamenává požadované URL do fetched-urls.txt v cwd a vrací falešný
// náhled podle varianty; varianty z OG_TEST_MISSING_VARIANTS vrací jako 404.
import fs from 'node:fs';
import path from 'node:path';

const logFile = path.join(process.cwd(), 'fetched-urls.txt');
const missing = new Set((process.env.OG_TEST_MISSING_VARIANTS ?? '').split(',').filter(Boolean));

globalThis.fetch = async (url) => {
  fs.appendFileSync(logFile, `${url}\n`);
  const variant = String(url).match(/\/(\w+default)\.jpg$/)?.[1];
  if (!variant || missing.has(variant)) return new Response('not found', { status: 404 });
  return new Response(Buffer.from(`náhled ${variant}\n`), { status: 200 });
};
