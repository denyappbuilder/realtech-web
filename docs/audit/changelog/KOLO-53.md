# Kolo 53: dotažení redesignu + technika (Atlas, 25. 9. 2026)

Zadání: Daniel 25. 9. „Udělej další hluboký vylepšovací kolo webu“. Podklady: design kritika všech typů stránek a technický/SEO audit (dva nezávislí subagenti, /tmp/k53).

## Design (redesign kola 52 dotažen do všech stránek)
- **Tokeny poloměrů zploštěny** (premium.css, DESIGN.md): thumb 8→4, field 12→6, media 16→6, control 24→6 px. Žádné pilulky: tlačítka, filtry, sdílení, komentáře, ⌘K/téma jsou obdélníky 6px jako „Odebírat“. Jediný kruh = červené play.
- **Tlačítka** (redesign.css): primární červené, sekundární s rámečkem inkoustu. Hero úvodky dál textová výzva se šipkou.
- **Archiv**: filtry jako textová lišta s červeným podtržením aktivní položky, hledání jako podtržené pole.
- **Článek**: bloky pod textem (výzva YouTube, autorský box, starší/novější, komentáře, karta Audio přehled) ploché s horní linkou místo bílých karet s rámečkem. Karta Audio přehled zůstává celá (nativní přehrávač, stažení, přepis).
- **Hub témat**: náhled nahoru, 2px linka, nejnovější článek čitelně.
- **Úvodka**: jedna dělicí linka kolem témat, hero obrázek zarovnaný nahoru, newsletter sedí v mřížce, patička bez mrtvého místa.
- **O nás**: čísla v inkoustu a Archivu (červená jen akcent).
- **Mobil**: štítek kategorie přes malý náhled skrytý (zakrýval fotku).

## Technika
- **Záložní fonty nadpisů**: jedna rodina `Archivo Display Fallback`, dva řezy — 750–900 → 122 % (Archivo 800/114–118 % ≈ 1,17–1,21× Arial Bold), 600–749 → 105 % (Archivo 700/106 % ≈ 1,05×). Cíl CLS úvodky na desktopu 0,047 → ~0.
- **`sizes` karet** = skutečná šířka slotu (calc, strop 341px) místo 100vw/50vw/33vw: menší obrázky na tématech a úvodce.
- **Hledání**: když přesná shoda nic nenajde, zkusí kmeny slov („raketě“ → raketa, „dronů“ → drony).
- **JSON-LD článku**: `articleSection`, drobečky přes téma (Novinky › Vesmír › článek).
- **Nadpisy článku**: jméno pro čtečku bez „Odkaz na sekci …“ (aria-label = text nadpisu).
- **RSS**: `dc:creator`.

## Změny testů
| test | starý assert | nový assert | proč |
|---|---|---|---|
| test-kolo-21-leftover | KARTA_SIZES 100vw/50vw/33vw | calc šířky slotu, 341px | plýtvání 290–350 KB na tématech; kolo 21 technické, ne rozhodnutí člověka |
| test-design-ux-round5 | HOME_COMPACT …50vw, 33vw | …calc, 341px | totéž pro úvodku |
| test-kolo-47-leftover, test-kolo-43-leftover | tokeny 8/12/16/24 px, DESIGN.md | 4/6/6/6 px | redesign kola 52 (Daniel „vypadá to líp, dej to live“) nahrazuje pilulky; role tokenů stejné |
| test-clanek-jsonld | drobeček 2 = Články | drobeček 2 = téma článku | SEO signál hubu témat |
| test-rss | xmlns jen atom | + dc | dc:creator |
Nové testy: kmeny v hledání (3), articleSection (1), test-kolo-53-review (4).

## Opravy po nezávislém review (Atlas, 25. 9.)
- **Fonty**: původně dvě rodiny (Display, Card). Prohlížeč vybírá rodinu před vahou → 700 brala 122 % (změřeno +17 % šířky titulků karet oproti Archivu, CLS místo zlepšení). Teď jedna rodina se dvěma řezy, 700 = 105 %.
- **Chipy archivu a „Další témata“**: `padding-inline: 2px` dával 27–41 px šířky; teď `min-width: 44px`, padding 8px, mezera 10px.
- **Herohero výzva**: hover padal na inkoust (premium `:root …:hover`); teď červený hover stejné specificity.
- **Štítek na mobilu**: skrývá se jen u kompaktních řádků úvodky a archivu, velké karty ho mají.
- **Hledání**: když modal najde výsledky jen přes kmeny, „Všechny výsledky“ vede na `/clanky/?q=<kmeny>` (archiv hledá podřetězcem → stejné výsledky). Bez zkráceného slova se druhý průchod nedělá.
- **Srcset pásku videí vrácen** (mqdefault 320w by se nevybral nikdy nad 368 px okna — slot 341 px > 320w).
- Zastaralé hlášky testů (12px, 8/12/16/24, „pod 5 znaků“) opraveny.

## Co NENÍ v tomto kole (rozhodnutí Daniela)
- `preload="none"` u karty Audio přehled (−94 KB/článek, ale délka v nativním přehrávači 0:00 do kliknutí; UX volba kola 36).
- Plex Mono jen kvůli pár znakům (typografie).
- Duplicitní propagace videa na video článcích (4×) — sahá na B19 a výzvy kola 44/50.
- Shodný čas vydání JetBrains/Meta (redakce Grokbota), `updated` u článků, obsah Dronů/Sítí.
