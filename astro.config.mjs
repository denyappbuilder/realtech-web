import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://realtech.cz',
  integrations: [
    // /vitej/ je noindex (potvrzení newsletteru) — do sitemapy nepatří
    sitemap({ filter: (page) => !page.includes('/vitej') }),
  ],
});
