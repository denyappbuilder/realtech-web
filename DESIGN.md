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
  thumbnail: "4px"
  field: "6px"
  media: "6px"
  control: "6px"
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

**Candidate, not production approval:** this records the built round-three source after independent review corrections. Parent execution passed all 30 targeted browser cases covering hover contrasts, reduced motion, navigation feedback and cover-image delivery. The final combined Pages preview and CI remain separate gates; production requires Daniel’s explicit approval.

Implementation order: `fonts-archivo.css`, `fonts-plex.css`, `global.css`, `editorial.css`, then `premium.css`. The last layer is the new visual authority; earlier layers still own progressive behavior and unmodified utility/media states.

## Colors

Restrained cool-neutral light/dark surfaces with REALTECH red. Existing semantic colors are retained so early theme initialization and browser theme-color stay synchronized. Red text and white-on-red fills remain separate roles. The newsletter is now a theme-aware surface rather than a permanently dark band. Cards use surface contrast rather than rainbow category borders.

## Typography

Headlines use the existing local Archivo variable at normal width, weight 650, rather than expanded 850–870. The logo retains 900/115%. No font package or dependency was added. Display tracking is -0.035em, section -0.03em, card -0.02em. Real Czech titles wrap without line clamps or content edits.

Article headings reach 56px; archive/topic/about page headings reach 60px. Homepage headline reaches 44.8px, with a 40px long-headline role. Mobile homepage is 32.8px; article title 33.6px; archive/topic/about title 40px. Article prose is 19.2px/1.8 on desktop and 17.28px/1.8 on mobile. Plex supplies controls, prose and editorial metadata; monospace remains for code and incumbent specialist utilities, not the main metadata rhythm.

`Archivo Editorial Fallback` uses a measured 96.67% size adjustment: median canvas width ratio of the 115 real article titles at Archivo 650/100px to Arial Bold. Old expanded-role fallbacks are retained for unchanged components. Latin and Latin-ext unicode ranges and display-swap declarations remain intact.

## Layout

Shared wrapper remains 1120px including 24px side padding. About now explicitly uses that wrapper rather than the former full-viewport width. Desktop header is 76px; compact header retains its accessible two-row structure.

Homepage: quiet edition heading, then a 54:46 image/copy feature. Image fills the desktop photo column with `object-fit: cover`; mobile returns full 16:9 media below the complete title/deck/actions. Hero source and preload share the exact cover-specific responsive sizes string: desktop uses the existing 1280w asset to cover the taller crop without sub-1x delivery, while mobile retains the 640/960 choices. The original 1280w image limits full 2x density in the desktop crop; it is not artificially upscaled. No ticker, fake live indicator or image headline overlays. Three supporting reports have 100px 16:9 thumbnails and complete headlines. Below 901px they remain the first three cards, preserving chronology.

Discovery: three-column grid, two below 901px, one below 581px. Grid row gaps are 44px desktop and 28px mobile. Below 581px the homepage's first latest-report card remains image-led; the next eight are flat compact rows with complete 1.05rem headlines, metadata and 96px thumbnails, without decks. At 360px and below, both those rows and archive rows use 72px thumbnails and a 12px gap, giving headlines more room. Supporting homepage image sizes follow those slots; the hero, first card and guides retain their existing image contracts. Desktop rail and chronological order are unchanged. Other home cards are tonal surfaces; archive cards stay flat and unboxed. Guides have their own separated, unboxed section. Topic hub cards lead with the durable subject description, then explicitly identify the newest story before its associated image. Images still come from real incumbent articles; no category-specific documentary assets were invented.

Reading: 880px introductory measure, 700px text column plus 64px gap and outside outline. The early brand/contact route and jump-to-text sit immediately below the title, before the deck. This is a publication credit, not an invented story-level human byline. Native mobile outline, existing section tracking and focus transfer remain intact. Sticky aside is at 101px with viewport-bounded scrolling only above 900px and 640px height; scroll chaining is retained.

## Elevation & Depth

Opaque header, flat cards, no hover lift or card shadows. Modal retains its existing protective overlay and soft offset shadow, with no duplicate border. Motion is feedback: navigation underline, small CTA arrow movement, restrained 1.025 media scale. Nothing enters from an invisible state or requires JS to become readable. Reduced motion disables transitions, animation and decorative image/arrow transforms while preserving the immediate navigation underline.

## Shapes

Five radius tokens in `premium.css`, one per role. Since round 53 (redesign „Poslouchej, čti, odeber“) they are flattened to the new language: `--radius-badge` 4px, `--radius-thumb` 4px, `--radius-field` 6px, `--media-radius` 6px and `--radius-control` 6px. Controls are no longer pills — buttons, filter chips, share buttons, comments button and ⌘K/theme controls are 6px rectangles like the header „Odebírat“ action; the only circle is the red audio play button. Roles are unchanged: badge (thumbnail labels, kbd), thumb (rail and compact-row thumbnails), field (archive fields, newsletter, audio/video surfaces, reading-column panels, code/table wrappers), media (covers, cards, video thumbnails, in-text images, modal), control (every button-like element). The former 10px compact stop is gone. Since round 50 `global.css` uses the same tokens as `premium.css` — no hard-coded 8/10/14px radii remain; the legacy `--radius` 8px is left only on the skip link's corner. Reading prose and desktop aside have no card enclosure; reading-column panels and in-text separators (blockquote rule, table header rule) use `--line-strong`, fields and cards keep `--line`. Native `<details>` markers are replaced by a currentColor chevron.

## Components

- Header preserves accessible logo words, current-page navigation, search focus trap/return, theme pressed state and no-JS fallbacks. The subscription link explicitly names YouTube; below 361px it becomes a 44px icon control with its accessible channel label, reserving intrinsic logo width and separation. Tablet search is at least 44px wide. The newsletter action names email separately.
- Search keeps async response validation, pending-query replay, loading/error/retry, empty states and archive navigation fallback. Visual changes do not alter its script.
- Archive keeps the real Cloudflare edge/no-JS GET filtering, `data-filtr-edge` hydration optimization, reset/count/pagination and shared SSR/client/edge card rendering. Search has a persistent visible label and precedes category controls in both DOM and visual order, on every archive page. No edge code was changed.
- Article keeps generated heading IDs, desktop/mobile outlines, native details, reduced-motion-aware focus navigation, audio transcript, YouTube/X fallback paths and copy-link handling.
- Newsletter retains the existing Kit action, consent/disclosure, error fallback and status focus. No form was submitted for design testing.
- SEO preserves metadata/schema/image semantics and fixes the observed `vs.` sentence-boundary truncation without changing authorial decks. Additional abbreviation/date edge cases noted by review remain pending.

## Do's and Don'ts

- Preserve the REALTECH logo, Czech content, real links, image associations and source attribution.
- Use the new restrained type/spacing system across surfaces rather than restoring broadcast slabs or category-color borders.
- Keep content visible without JS and retain all edge archive semantics.
- Do not truncate headlines to make cards fit, invent human coauthorship, add unsupported claims, replace imagery with fake product renders, or introduce new services.
- Existing generic imagery is a documented editorial limitation. No new raster was created, copied or relicensed in this round; existing asset origin records remain authoritative.
- Keep the verified theme-aware hover pairs, reduced-motion resets, shared cover/preload contract and Czech abbreviation/year metadata regressions. Regression scripts record these guarantees; a screenshot alone does not certify them.
