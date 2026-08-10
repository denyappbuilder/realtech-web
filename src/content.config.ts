import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseCalendarDate } from './lib/calendarDate.js';

const calendarDateString = z
  .string()
  .refine((value) => parseCalendarDate(value) !== undefined, {
    message: 'Expected a valid calendar date in YYYY-MM-DD format',
  })
  .transform((value) => parseCalendarDate(value)!);

// Astro's YAML parser resolves an unquoted YYYY-MM-DD scalar to Date before
// schema validation. Quoted dates arrive as strings and need strict calendar
// validation; both accepted representations leave the schema as Date.
const calendarDate = z.union([z.date(), calendarDateString]);

const clanky = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clanky' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      'AI Report',
      'AI Agenti',
      'Drony',
      'Vesmír',
      'Hardware',
      'Mobily',
      'Sítě',
    ]),
    date: calendarDate,
    video: z.string().url().optional(),
    videoLength: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    zprava: z.boolean().default(false),
    evergreen: z.boolean().default(false),
    updated: calendarDate.optional(),
    draft: z.boolean().default(false),
  }).strict(),
});

export const collections = { clanky };
