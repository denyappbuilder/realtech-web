# Kolo 54 — technický / SEO / výkon / a11y audit (Atlas, 25. 9. 2026)

Zadání: Daniel 25. 9. „Hloubkový TECHNICKÝ / SEO / výkon / přístupnost audit“ → „ano“ (opravit) → „Merge obojí“.
Měřeno Playwrightem (390/1280 × DPR 1/2, světlý/tmavý), Lighthouse 3× medián, vlastní CLS/LCP s omezenou sítí.

## Opraveno
| # | Vada (měřeno) | Oprava |
|---|---|---|
| 1 | „Mimo AI“ na úvodce: 342px slot bral 192w (DPR 2 = 28 % potřeby) | `index.astro`: `KARTA_SIZES` místo `KARTA_SIZES_HOME_COMPACT` |
| 2 | Hero úvodky na desktopu: 399–508px 16:9 slot bral 1280w (30,7 KB) | `HOMEPAGE_HERO_SIZES` = `…, (max-width: 1120px) 45vw, 508px` → 640w (10,4 KB) |
| 3 | Archivo 90 + 87 KB na každé stránce, web používá jen wght 650–900 / wdth 100–118 % | výseč os wght 600–900 / wdth 100–125 % (`scripts/archivo-instance.py`, `src/assets/fonts/`) → 43,5 + 40,5 KB, **−93 KB/stránka**; stejné glyfy (230 + 262), features i unicode-range |
| 4 | CLS 0,027 na `/clanky/` mobil (čip „Vesmír“ skočil po swapu Plex 500 na 2. řádek) | `redesign.css`: `Plex Chip Fallback` 500, `size-adjust: 105%` (okno shody 104,5–105,5 % změřeno na 320–1280 px) → CLS 0 (3/3) |
| 5 | Related karty pod článkem na mobilu `100vw` | `calc(100vw - 48px)` |
| 6 | `<audio>` fokus = modrý UA ring | `audio:focus-visible` signální 2px |
| 7 | Archiv: JSON-LD popis ≠ meta description; strana N bez drobečku | `popisArchivu`, BreadcrumbList pozice 3 „Strana N“ |
| 8 | NewsArticle.publisher bez `@id` | `@id: …/#org` (tatáž entita jako úvodka / O nás) |

Screenshoty bez obrázků (36 kombinací: 9 stránek × 390/1280 × světlý/tmavý): beze změny vzhledu (font výseč).

## Vyzkoušeno a vráceno
- Pásek videí: srcset `sddefault.webp 640w` + hq720. Vlastní náhledy YouTube mají sddefault jako **výřez 4:3**, ne letterbox — v 16:9 slotu ořízl text náhledu („VLASTNÍ“, „GROK BOT“). hq720 zůstává (kolo 50/53).

## Změny testů
| test | starý assert | nový assert | proč |
|---|---|---|---|
| test-design-ux-round5 | `HOMEPAGE_HERO_SIZES … 1280px` | `… 45vw, 508px` | hero už není ořez 579px (redesign 16:9) |
| test-premium-review-density | totéž | totéž | totéž |
| test-kolo-37-leftover | weight/stretch/src 1:1 s fontsource | family/style/display/unicode-range 1:1, weight `600 900`, stretch `100% 125%`, src výseč | výseč os |
| test-clanek-jsonld | publisher bez `@id` | s `@id #org` | jedna Organization |
| test-kolo-21-leftover | related `100vw` | `calc(100vw - 48px)` | šířka wrapu |

Nový `scripts/test-kolo-54.mjs` (vč. hlídače: `font-stretch` ve stylech nesmí vyjet z 100–125 %).

## Není v tomto kole
- Hero článku DPR 2 na 1280 (1520w potřeba, zdroj 1280w) — chce větší originály.
- `/images/*` cache (rozhodnutí B09).
