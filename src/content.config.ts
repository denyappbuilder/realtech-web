import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { parseCalendarDate, parsePublishDate } from './lib/calendarDate.js';
import { jeAudioUrl, parseAudioDuration } from './lib/audio-prehled.js';

const calendarDateString = z
  .string()
  .refine((value) => parseCalendarDate(value) !== undefined, {
    message: 'Expected a valid calendar date in YYYY-MM-DD format',
  })
  .transform((value) => parseCalendarDate(value)!);

const publishDateString = z
  .string()
  .refine((value) => parsePublishDate(value) !== undefined, {
    message: 'Expected a valid calendar date (YYYY-MM-DD) or ISO datetime',
  })
  .transform((value) => parsePublishDate(value)!);

// js-yaml default schema turns an unquoted YYYY-MM-DD into Date and rolls
// invalid civil days (2025-02-29 → 2025-03-01T00:00:00.000Z). From that Date
// the original day is gone, so the schema must not accept Date at all.
// Quoted strings stay strings and go through parseCalendarDate / parsePublishDate.
// `date` smí nést ISO čas vydání (řazení úvodky); `updated` zůstává jen den.
const calendarDate = calendarDateString;
const publishDate = publishDateString;

const audioDuration = z
  .union([z.number(), z.string()])
  .refine((value) => parseAudioDuration(value) !== undefined, {
    message: 'Expected audio duration as seconds, ISO-8601, or MM:SS',
  });

// `transcript` je veřejný čitelný přepis. Volitelný `ttsScript` uchovává
// výslovnostní zápis pro regeneraci audia; starší pipeline mohou použít
// `audioTtsScript(audio)`, který bez něj spadne zpět na transcript.
const audioPrehled = z
  .object({
    url: z.string().refine(jeAudioUrl, {
      message: 'Expected an http(s) audio URL',
    }),
    duration: audioDuration,
    transcript: z.string().min(1).optional(),
    ttsScript: z.string().min(1).optional(),
  })
  .strict();

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
    date: publishDate,
    video: z.string().url().optional(),
    videoLength: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    zprava: z.boolean().default(false),
    evergreen: z.boolean().default(false),
    updated: calendarDate.optional(),
    draft: z.boolean().default(false),
    audio: audioPrehled.optional(),
  }).strict(),
});

export const collections = { clanky };
