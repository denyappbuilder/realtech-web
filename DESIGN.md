---
name: REALTECH CZ
description: Incumbent Czech technology editorial visual system, documented after editorial experience round 2.
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
  panel: "#14171C"
  line-panel: "#E2E6EB"
  dark-bg: "#0F1216"
  dark-surface: "#171B21"
  dark-ink: "#E8ECF1"
  dark-ink-soft: "#A9B2BF"
  dark-ink-faint: "#828B98"
  dark-line: "#262C35"
  dark-signal: "#E5322D"
  dark-signal-dark: "#F0554F"
  dark-panel: "#1D232C"
  dark-line-panel: "#3A4350"
typography:
  body:
    fontFamily: "IBM Plex Sans, Arial, Roboto, Liberation Sans, system-ui, sans-serif"
    lineHeight: 1.6
  article-body:
    fontFamily: "IBM Plex Sans, Arial, Roboto, Liberation Sans, system-ui, sans-serif"
    fontSize: "1.05rem"
    lineHeight: 1.7
  display-desktop:
    fontFamily: "Archivo Variable, Archivo Hero Fallback, Archivo, sans-serif"
    fontSize: "2.7rem"
    fontWeight: 870
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.78rem"
    letterSpacing: "0.05em"
rounded:
  radius: "8px"
  editorial-small: "4px"
  aside: "14px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.radius}"
    padding: "12px 24px"
  archive-submit:
    backgroundColor: "{colors.signal-fill}"
    textColor: "#FFFFFF"
    rounded: "{rounded.radius}"
    padding: "12px 24px"
  archive-submit-hover:
    backgroundColor: "{colors.signal-fill-hover}"
    textColor: "#FFFFFF"
---

# Design System: REALTECH CZ

## Overview

A Czech technology and AI publication attached to the REALTECH CZ YouTube channel. Product context comes from the implemented `/o-nas/`, not an assumed audience profile or a new product brief. The established identity is red accents, expanded Archivo headlines, Plex reading text and mono editorial metadata; photography and the articles remain the substance.

**Key Characteristics:**
- Strong headline hierarchy with restrained interface decoration.
- Light and dark semantic surfaces, with separate red text and white-on-red fill roles.
- Responsive article discovery and a quieter, navigable reading column.

Maintainer Grokbot: this is an as-built record at source commit `b7035ccca88f256d667094a5a84fba1f500e8011` on `feat/editorial-experience-round2`, for PR #447. `src/layouts/Base.astro` loads `src/styles/global.css` then `src/styles/editorial.css`; scoped editorial overrides win. This round refines homepage composition/topic navigation, archive search/results/mobile rows, and article entry/outline/reading presentation. It is not a rebrand or a new layout proposal. This documentation pass performs no browser audit or tests; parent review owns the rendered evidence and final verification.

## Colors

The frontmatter records actual root light values and explicit dark counterparts; `dark-*` names document overrides, not additional CSS variable names. Primary red marks identity, categories and interaction; cool neutral backgrounds and thin separators carry structure. `panel` and `line-panel` belong to media containers.

System preference applies unless explicitly overridden by `data-theme`; stored light/dark selection is applied before first paint. Native `color-scheme` and browser theme-color follow the theme. Keep `signal-fill` and `signal-fill-hover` unchanged between themes: white text needs the deeper fill, not the lighter dark-mode red intended for text. The archive submit hover explicitly keeps white text over the fill-hover token in both themes.

## Typography

Archivo Variable carries display/headline roles with real width-axis settings (homepage headline 110%, logo 115%, card headlines 105%). Desktop homepage headline uses the frontmatter role; long headlines use 2.4rem. Archive h1 uses `clamp(2rem, 4vw, 3.5rem)` and 1.1 leading, becoming 2rem at 580px and below. Archive card titles are 1.2rem/1.25 on larger screens and 1rem/1.32 in compact rows.

Plex Sans supplies prose and controls; Plex Mono supplies dates, reading metadata and uppercase labels. Article paragraphs, list items and blockquotes are capped at 68ch. Preserve Czech `lang="cs"`, headline balancing, hyphenation and overflow wrapping rather than editing titles to fit.

Fonts are locally bundled through Fontsource. Plex imports are latin/latin-ext subsets; Archivo uses its width entrypoint. Preserve measured Archivo Hero/Clanek/Karta fallback families and their size adjustments (117.6%, 114.6%, 105.9%) and the Plex fallback order: these are layout-shift controls, not interchangeable stylistic choices.

## Layout

- Shared wrapper: 1120px maximum with 24px horizontal padding. Desktop header has a 64px inner row and an opaque sticky surface.
- Homepage desktop hero: `minmax(0, 1fr) minmax(0, 1.15fr)`, 40px gap. Editorial override removes the old dotted backdrop, uses a surface fill, and sets 44px/28px vertical padding. Three supporting stories form a rail with 80×96px cropped thumbnails and unclamped titles. At 900px and below the hero becomes one column and rail stories return as cards.
- Base card grid: three columns, 24px gaps; two columns at 900px and below, one at 580px and below. Topic featured-card behavior remains separate from the archive.
- Archive: full-width search-first stack (form capped at 680px), category controls, then a visible result/reset bar. At 580px and below cards become divider-separated rows with a 96px square thumbnail, 16px gap and no description; title, category and date/reading metadata remain.
- Article: `minmax(0, 1.7fr) minmax(220px, 0.8fr)` with a 28px gap. Editorial body removes the old panel, border and padding. At 900px and below it becomes a single column and hides the desktop aside. Above 900px, the aside is scroll-bounded to `calc(100dvh - 112px)`; sticky positioning at 81px requires viewport height at least 640px.
- Mobile outline uses native details/summary (48px minimum summary height) and a scrollable list capped at 55dvh. Reading entry scroll margins are 112px desktop and 128px at 900px and below.

Other incumbent component-specific breakpoints remain in global.css; these are the principal editorial transitions, not a replacement global breakpoint scale.

## Elevation & Depth

The header is opaque, not blurred glass. Editorial archive cards are flat with bottom dividers and explicitly disable hover lift/shadow; reading prose has no enclosing card. Other incumbent cards retain a 4px hover lift and `0 14px 32px -18px color-mix(in srgb, var(--ink) 42%, transparent)` shadow. Do not promote the archive exception into a site-wide removal of card behavior.

State transitions are generally 0.15s; base card motion is 0.22s. The existing ticker animates over 45s and pauses on hover/focus-within. Reduced motion disables animations and transitions globally and turns smooth scrolling off; preserve the reduced-motion check in article navigation too.

## Shapes

Controls and media primarily use the 8px radius token. Editorial chips and outline links use 4px corners; the desktop aside retains 14px. Archive outer cards are square, with rounded thumbnails. Maintain the existing 16:9 media presentation except the explicit editorial rail and mobile archive thumbnail crops; do not impose fixed-height strips on hero photography.

## Components

- **Buttons:** the global primary is ink on background-colored text, not universally red. Archive submit and subscription fills use the separate red fill tokens. Ghost controls use surface fill and line border, changing to ink border/text on hover. Typical buttons have a 44px minimum height.
- **Archive controls and states:** page one has category buttons with `aria-pressed`; later pages have category links back to page one. Search is a labeled GET form, enhanced with a 300ms debounce and a fetched static `/search-index.json`. Preserve default paginated range, filtered count, reset, loading, empty, error/retry and `aria-busy` states. Status messages use live status roles. The GET form is a navigation fallback, not a claim of server-side search without JavaScript.
- **Reading navigation:** outline derives from rendered article headings; no outline is shown when empty. Desktop and mobile links point to existing section IDs, with `aria-current="location"` for the current section. Reading entry and outline navigation transfer focus to the target without double scrolling. Keep heading nesting and the quiet lede state rather than selecting a section before reaching it.
- **Navigation/accessibility:** preserve semantic labeled navigation, current-page indication, skip link, named search controls and theme toggle state. Logo accessible name includes its visibly separated REAL TECH CZ words. Links/buttons/summary use a 2px signal focus outline with 3px offset; search and reading target have their own offsets. Avoid nested duplicate card links: the heading link supplies the stretched card target.
- **Editorial imagery:** retain existing real-photo assets and their article associations unchanged. This round adds no raster images and makes no new photographer, license or ownership claims. Existing article content/source attribution remains authoritative; a retained repository asset is not proof of a particular license. Current card image alt derives from the editorial title. Local covers take precedence; YouTube maxres thumbnails are fallback when local cover is absent.
- **Image delivery:** preserve explicit dimensions, async decoding, existing WebP/JPEG derivatives and responsive sizes. Prioritize the actual LCP hero/first archive card, not every above-fold image. The helper in `src/lib/hero-preload.js` permits one image preload matching the rendered picture's source/srcset/sizes/type. Archive preload is only on page one; first card is eager/high on each page. Other cards remain lazy. Keep preconnects conditional on actual media/comments usage; add no services.

## Do's and Don'ts

- Do treat global.css plus later editorial.css and the route/component markup as implementation authority.
- Do preserve Czech authorial headlines, prose, metadata, links and existing image provenance.
- Do retain dark, keyboard, reduced-motion, loading, empty and retry behavior when maintaining these surfaces.
- Don't replace Archivo/Plex or collapse red text and red fill into a single theme-dependent role.
- Don't generalize scoped archive/reading changes to older topic cards, embeds or unrelated pages.
- Don't add fabricated product claims, a publishing cadence, new image credits, new services or invented design tokens.
