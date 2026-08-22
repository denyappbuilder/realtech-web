import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseCalendarDate } from './lib/calendarDate.js';

const calendarDateString = z
  .string()
  .refine((value) => parseCalendarDate(value) !== undefined, {
    message: 'Expected a valid calendar date in YYYY-MM-DD format',
  })
  .transform((value) => parseCalendarDate(value)!);

// js-yaml default schema turns an unquoted YYYY-MM-DD into Date and rolls
// invalid civil days (2025-02-29 → 2025-03-01T00:00:00.000Z). From that Date
// the original day is gone, so the schema must not accept Date at all.
// Quoted strings stay strings and go through parseCalendarDate.
const calendarDate = calendarDateString;

const clanky = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clanky' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
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
