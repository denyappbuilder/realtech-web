# Kolo 52: redesign „Poslouchej, čti, odeber“

Zadání: Daniel 23. 9. 2026 v Telegramu po finálním návrhu Atlase (gdrive:obsah/web/design-finalni-2026-09-23/): „to vypadá líp, dej to live“.

## Co se mění
- **Signaturní přehrávač** `src/components/RtPlayer.astro`: červené tlačítko + vlnovka + délka. Na úvodce pod perexem hero článku (jen když má audio), v článku v hlavě pod perexem. `<audio preload="none">` = MP3 se nestahuje před kliknutím. Bez JS je tlačítko odkaz na MP3. `aria-pressed`, mezerník, jedno přehrávání naráz.
- **Karta Audio přehled** zůstává celá (nativní přehrávač s posunem, hlasitostí a rychlostí, stažení MP3, přepis). Signaturní přehrávač je rychlý start, ne náhrada.
- **Úvodka**: hero bez panelu, velký titulek (Archivo 800 / 118 %), obrázek vpravo. Rail „Další reporty“ jako textový sloupec (bez náhledů). Nový blok **Mimo AI** (3 nejnovější články mimo AI Report / AI Agenti, které nejsou v heru ani v 9 kartách). Věta „Technologie v souvislostech“ nad hero skrytá.
- **Hlavička**: jedna hlavní výzva „Odebírat“ (→ #newsletter). YouTube zůstává jako ikona (trychtýř kola 48 platí).
- **Newsletter**: tmavý blok z tokenů (--ink/--bg), takže tmavý režim se prohodí správně.
- **Typografie**: titulky Archivo 700–800 s rozšířením, text článku 18/1,65, podtržení odkazů červeně, 2px linky nad sekcemi.
- Všechno ve vrstvě `src/styles/redesign.css` nad premium.css. Jediná natvrdo barva je bílá na červeném tlačítku (test).

## Co se nemění
URL, obsah článků, hero = nejnovější článek (#343), rail = první 3 kandidáti, landmarky, skip link, no-JS stavy, giscus po kliknutí (B04), YouTube výzva za prvním odstavcem (B19), X embed (Maky), fonty (žádný nový soubor), strukturovaná data.

## Změny testů
| test | starý assert | nový assert | proč |
|---|---|---|---|
| test-kolo-38-leftover | importy CSS končí `premium.css` | …`premium.css`, `redesign.css` | nová vrstva designu je záměr položky; pořadí fontů před global.css drží |
| test-kolo-31-leftover | fragmenty v Base = kontakt, obsah | kontakt, newsletter, obsah | nový odkaz „Odebírat“ → #newsletter; #newsletter dostal `scroll-margin-top` v global.css (stejné pravidlo jako #obsah) |
| test-homepage-loader | mock pro ArticleCard, HeroheroCta | + RtPlayer | loader úvodky neumí .astro komponenty, mockuje je všechny |
Nový test: `scripts/test-kolo-52-redesign.mjs` (6 testů).

## Nezávislé review (subagent, 58a356a) a opravy
- Blokující: na 320 px newsletter roztáhl stránku na 326 px. Oprava: `min-width: 0` položek mřížky, `overflow-wrap: anywhere` v h2, mobilní sloupec `minmax(0, 1fr)`. Ověřeno CDP: scrollWidth 320/390 na úvodce a 2 článcích.
- Doporučení přijata: nativní přehrávač v kartě se neschovává (posun, hlasitost, rychlost), `play().catch` padá na odkaz MP3, ctrl/⌘/prostřední klik otevírá MP3, jméno tlačítka „Přehrát audio přehled, 2:10“, bez `as never`.
- Hlavička ≤ 580 px: mezery akcí 0, 44px ikony, bez „CZ“ u loga, bez ⌘K štítku (dotýkaly se).
- Regresní testy přidány do test-kolo-52-redesign.mjs (8 testů).
- Re-review (ec27ac9): YouTube ikona v hlavičce 28×44 na 361–580 px. Oprava: min-width 44px všude, na mobilu 44×44. Změřeno CDP 320/360/390/480/580/700/1280: všechny akce hlavičky 44×44, scrollWidth = šířka okna.
