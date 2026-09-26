# Kolo 56 — design a cesta čtenáře (26. 9. 2026)

Zdroj: dva nezávislé read-only audity živého webu (art-director design/UX;
cesta čtenáře / IA) + JSON-LD kontrola 129 článků. Měřeno Playwrightem
na produkci (DNES) a preview :4341 (NÁVRH).

## Design
- **Tmavý newsletter** — `.newsletter > .wrap` byla v dark režimu světlá
  deska rgb(232,236,241) 1072×377 px (inverze tokenů `--ink`/`--bg`).
  Teď `--surface` + linka `--line-strong`, text `--ink`/`--ink-soft`,
  pole na `--bg`. Světlý režim beze změny. (redesign.css §1)
- **Míra textu článku** — medián 85 znaků na řádek (1280 px). Text 19 px /
  1.7, `max-width: 33em` pro p/ul/ol/blockquote/h2–h4 → ~71 zn.
  Obrázky, tabulky a embedy drží šířku sloupce. (§2)
- **Nadpisy stránek** (hub témat, O nás, 404) sjednocené na 800 / 1.1
  a stejnou stupnici jako článek. (§3)
- **Hero úvodky** — obrázek vyplní sloupec do výšky textu (dřív 321 px
  prázdna pod obrázkem); `HOMEPAGE_HERO_SIZES` → 1080px (607 px výška
  × 16/9). (§4, karta-nahled.js)
- **Konec článku** — jedna linka na blok místo dvojitých 2px linek
  (related, komentáře). (§7)

## Cesta čtenáře
- **Související články podle obsahu** (`src/lib/souvisejici.js`): IDF
  shoda titulku a slugu, +vzájemný odkaz v textu, +stejná kategorie,
  −stáří, práh 2 slova. Dřív 3 nejnovější z kategorie: 393 slotů
  obsadilo 26 článků, 105/131 se nikdy neukázalo. Teď viz měření níž.
- **Pořadí konce článku**: text → Audio přehled → Další reporty → autor
  (s odběrem YouTube) → Herohero → starší/novější → diskuze. Zrušen pruh
  „video není / Odebírat kanál“ (3. výzva k odběru) a „← Zpět na články“.
- **Audio přehled pod textem** — na mobilu stály nad textem 2 přehrávače
  (text od y≈1245). V hlavě zůstává RtPlayer, plná karta s přepisem
  a MP3 je pod textem.
- **404** — pole hledání (GET /clanky/?q=, funguje bez JS, předvyplní
  slova z chybné adresy) + odkazy na 7 témat.
- **Témata** — evergreen průvodci na straně 1 hned za nejnovějším
  článkem; Starlink průvodci křížově ve Vesmíru i Sítích.

## SEO
- JSON-LD `image` článku: vedle značkového OG 1200×630 i čistý 16:9
  cover (Google doporučuje víc poměrů pro Discover).

## Testy
- nové: `scripts/test-kolo-56.mjs`, `scripts/test-souvisejici.mjs`
- upravené asserty svázané se změnou (žádný nevznikl z rozhodnutí
  člověka — ověřeno v historii commitů): b19-cta-inline, z1003, x-embed,
  giscus, kolo-23/43/46/48/50-leftover, design-ux-round5, clanek-jsonld.
- plná sada 1307/1307.

## Mimo kolo (rozhodnutí vlastníka)
- Herohero start 30. 9.: stránka /herohero/ a CTA stále říkají
  „připravujeme“ — text launche dodá Daniel.
- 6 meta popisů pod 70 znaků a 51 článků bez příchozího odkazu =
  obsah Grokbota (brief).
