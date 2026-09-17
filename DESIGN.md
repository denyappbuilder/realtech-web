---
name: REALTECH CZ
description: Reading-led premium editorial candidate; restrained REALTECH identity, normal-width headlines and image-first discovery.
colors:
  bg: "#F6F7F9"
  surface: "#FFFFFF"
  ink: "#14171C"
  ink-soft: "#4A515C"
  ink-faint: "#656D79"
  line: "#E2E6EB"
  signal: "#D42622"
  signal-dark: "#B7211D"
  signal-fill: "#D42622"
  signal-fill-hover: "#B7211D"
  dark-bg: "#0F1216"
  dark-surface: "#171B21"
  dark-ink: "#E8ECF1"
  dark-ink-soft: "#A9B2BF"
  dark-ink-faint: "#828B98"
  dark-line: "#262C35"
  dark-signal: "#E5322D"
  dark-signal-dark: "#F0554F"
typography:
  headline:
    fontFamily: "Archivo Variable, Archivo Editorial Fallback, Arial, sans-serif"
    fontWeight: 650
    fontSize: "clamp(2.1rem, 4.5vw, 3.5rem)"
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo Variable, Archivo Editorial Fallback, Arial, sans-serif"
    fontWeight: 650
    fontSize: "1.2rem"
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "IBM Plex Sans, Arial, Roboto, Liberation Sans, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  reading:
    fontFamily: "IBM Plex Sans, Arial, Roboto, Liberation Sans, sans-serif"
    fontSize: "1.2rem"
    lineHeight: 1.8
  label:
    fontFamily: "IBM Plex Sans, Arial, Roboto, Liberation Sans, sans-serif"
    fontSize: "0.8rem"
rounded:
  badge: "4px"
  outline: "6px"
  thumbnail: "8px"
  compact-control: "10px"
  field: "12px"
  media: "16px"
  control: "24px"
spacing:
  small: "12px"
  content: "24px"
  group: "28px"
  section: "48px"
  major: "64px"
components:
  archive-submit:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.field}"
  archive-submit-hover:
    backgroundColor: "{colors.signal-fill-hover}"
    textColor: "#FFFFFF"
---

# Design System: REALTECH CZ

## Overview

A reading-led technology journal. The owner's September brief explicitly replaces the expanded broadcast-style presentation with Apple-level restraint, not Apple branding. The recognizable Archivo REALTECH wordmark and red accent are unchanged. Editorial facts, headlines, image associations and existing functions remain authoritative.

**Candidate, not production approval:** this records the built round-three source after its bounded visual correction batch. Parent independent review has two open hover-contrast findings and a reduced-motion image-transform finding; those are defects, not system rules. Parent owns the next fix context, final review and any later deployment. No claim of whole-surface approval is made here.

Implementation order: `fonts-archivo.css`, `fonts-plex.css`, `global.css`, `editorial.css`, then `premium.css`. The last layer is the new visual authority; earlier layers still own progressive behavior and unmodified utility/media states.

## Colors

Restrained cool-neutral light/dark surfaces with REALTECH red. Existing semantic colors are retained so early theme initialization and browser theme-color stay synchronized. Red text and white-on-red fills remain separate roles. The newsletter is now a theme-aware surface rather than a permanently dark band. Cards use surface contrast rather than rainbow category borders.

## Typography

Headlines use the existing local Archivo variable at normal width, weight 650, rather than expanded 850–870. The logo retains 900/115%. No font package or dependency was added. Display tracking is -0.035em, section -0.03em, card -0.02em. Real Czech titles wrap without line clamps or content edits.

Article headings reach 56px; archive/topic/about page headings reach 60px. Homepage headline reaches 44.8px, with a 40px long-headline role. Mobile homepage is 32.8px; article title 33.6px; archive/topic/about title 40px. Article prose is 19.2px/1.8 on desktop and 17.28px/1.8 on mobile. Plex supplies controls, prose and editorial metadata; monospace remains for code and incumbent specialist utilities, not the main metadata rhythm.

`Archivo Editorial Fallback` uses a measured 96.67% size adjustment: median canvas width ratio of the 115 real article titles at Archivo 650/100px to Arial Bold. Old expanded-role fallbacks are retained for unchanged components. Latin and Latin-ext unicode ranges and display-swap declarations remain intact.

## Layout

Shared wrapper remains 1120px including 24px side padding. About now explicitly uses that wrapper rather than the former full-viewport width. Desktop header is 76px; compact header retains its accessible two-row structure.

Homepage: quiet edition heading, then a 54:46 image/copy feature. Image fills the desktop photo column with `object-fit: cover`; mobile returns full 16:9 media below the complete title/deck/actions. Hero source and preload share the exact responsive sizes string and retain the 640/960/1280 derivatives. No ticker, fake live indicator or image headline overlays. Three supporting reports have 100px 16:9 thumbnails and complete headlines. Below 901px they remain the first three cards, preserving chronology.

Discovery: three-column grid, two below 901px, one below 581px. Grid row gaps are 44px desktop and 28px mobile. Home cards are tonal surfaces; archive cards stay flat and unboxed, with 96px compact mobile thumbnails. Guides have their own separated, unboxed section. Topic hub cards lead with the durable subject description, then explicitly identify the newest story before its associated image. Images still come from real incumbent articles; no category-specific documentary assets were invented.

Reading: 880px introductory measure, 700px text column plus 64px gap and outside outline. The early brand/contact route and jump-to-text sit immediately below the title, before the deck. This is a publication credit, not an invented story-level human byline. Native mobile outline, existing section tracking and focus transfer remain intact. Sticky aside is at 101px with viewport-bounded scrolling only above 900px and 640px height; scroll chaining is retained.

## Elevation & Depth

Opaque header, flat cards, no hover lift or card shadows. Modal retains its existing protective overlay and soft offset shadow, with no duplicate border. Motion is feedback: navigation underline, small CTA arrow movement, restrained 1.025 media scale. Nothing enters from an invisible state or requires JS to become readable. Global reduced-motion disables transitions and animation; the review's remaining hover-transform reset must be resolved before approval.

## Shapes

16px main media/card corners; 12px archive fields/audio surfaces; 10px compact fields and mobile archive thumbnails; 8px rail thumbnails; 4px small category badges. Pills are reserved for controls/category filters. Reading prose and desktop aside have no card enclosure.

## Components

- Header preserves accessible logo words, current-page navigation, search focus trap/return, theme pressed state and no-JS fallbacks.
- Search keeps async response validation, pending-query replay, loading/error/retry, empty states and archive navigation fallback. Visual changes do not alter its script.
- Archive keeps the real Cloudflare edge/no-JS GET filtering, `data-filtr-edge` hydration optimization, reset/count/pagination and shared SSR/client/edge card rendering. No edge code was changed.
- Article keeps generated heading IDs, desktop/mobile outlines, native details, reduced-motion-aware focus navigation, audio transcript, YouTube/X fallback paths and copy-link handling.
- Newsletter retains the existing Kit action, consent/disclosure, error fallback and status focus. No form was submitted for design testing.
- SEO preserves metadata/schema/image semantics and fixes the observed `vs.` sentence-boundary truncation without changing authorial decks. Additional abbreviation/date edge cases noted by review remain pending.

## Do's and Don'ts

- Preserve the REALTECH logo, Czech content, real links, image associations and source attribution.
- Use the new restrained type/spacing system across surfaces rather than restoring broadcast slabs or category-color borders.
- Keep content visible without JS and retain all edge archive semantics.
- Do not truncate headlines to make cards fit, invent human coauthorship, add unsupported claims, replace imagery with fake product renders, or introduce new services.
- Existing generic imagery is a documented editorial limitation. No new raster was created, copied or relicensed in this round; existing asset origin records remain authoritative.
- Do not canonize the two reported hover-contrast defects, the reduced-motion hover jump or remaining metadata abbreviation edge cases. Parent's fix/review stage owns their resolution and must update this record afterward.
