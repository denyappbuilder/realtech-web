import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ARTICLE_CATEGORIES } from './content-categories.mjs';

const clanky = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clanky' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(ARTICLE_CATEGORIES),
    date: z.coerce.date(),
    video: z.string().url().optional(),
    videoLength: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    zprava: z.boolean().default(false),
    evergreen: z.boolean().default(false),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { clanky };
