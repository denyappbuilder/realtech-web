# REALTECH — UX, přístupnost, konverze a soukromí (19. 9. 2026)

## Rozsah a výsledek
Read-only produkční prohlížeč Chromium + zdrojový commit `061540c3f4ac7de31dcdca90a5894a48044bde8a`. Produkční SHA nelze z tohoto běhu dokázat; zdrojové odkazy jsou k uvedenému checkoutu. Žádná úprava repozitáře, odeslání formuláře, komentář ani aktivace YouTube přehrávače. Neprobíhal Lighthouse ani změna služeb.

Programově ověřeno (`summary.json`): **5 stránek × 4 stavy = 20 skenů**, **0 axe WCAG violations**, **0 vodorovných overflow stavů**, **0 zachycených pageerror**, **19 screenshotů**. Stavy: desktop 1440 light/dark, mobil 390 light a 320 dark. Home, archiv a tři odlišné články: DJI vs. Insta360 (YouTube), Gemini agentic video understanding (X), DeepSeek únik nahrávky (zpráva/audio). Navíc search modal, klávesnice, TOC, filtr archivu a živá stránka GDPR. Nejde o kompletní kartézský test všech viewportů a obou témat, ani o certifikaci WCAG nebo právní posudek.

## Nálezy k řešení — bez redesignu

### UX-P01 — P1 / důvěra: popis třetích stran neodpovídá skutečnému načítání
**Důkaz:** `/gdpr/` říká „a to až když je použiješ“, „Do té doby s Googlem nekomunikuješ“ a vysvětluje absenci lišty slovy „není co odklikávat“. Běh bez kliknutí na média přesto na home při scrollu vyžádal 3 obrázky z `i.ytimg.com`. Článek Gemini s X načetl `platform.twitter.com`, syndication domény, obrázky a `video.twimg.com`; kontext obsahoval cookies `__cf_bm` pro `.twitter.com` a `.x.com`. Na všech třech článcích se bez aktivace komentářů načetl giscus. Počty v JSON jsou za celý test stránky včetně změn tématu/scrollu, nikoli jednorázový cold-load waterfall.

**Zdroj:** `src/pages/gdpr.astro:195–219`; `src/pages/index.astro:312` (lazy externí thumbnails); `src/pages/clanky/[...id].astro:193–199` (automatický X skript); `src/components/Giscus.astro:43–46`. **Evidence:** `browser.json`, `summary.json`, `followup.json.gdpr`.

**Náprava:** nejprve zpřesnit disclosure podle skutečných služeb a rozlišit YouTube player od thumbnailů. Volitelný X obsah a komentáře posoudit pro explicitní načtení až na požádání; zachovat obyčejný odkaz jako fallback. Není nutný plošný redesign ani automatické přidání generické cookie lišty. S právníkem ověřit právní základ, účely cookies a předávání mimo EU. Samotná technická cookie ani externí požadavek nejsou tímto auditem prohlášeny za protiprávní; tvrzení „bez cookies = bez povinností“ však technické měření nepodporuje.

### UX-P02 — P2 / měření: navigační zásahy vytvářejí další RUM navigační události
**Důkaz:** živý Cloudflare beacon skutečně odesílá POST `/cdn-cgi/rum`, nejde jen o mrtvý snippet. `followup.json.requests` zachycuje po filtrování archivu další `eventType:1`, `nt:"routing-apis"`, nové `pageloadId`, `n:2` a `n:3` pro `/clanky/`; podobný event vznikl po skip-link kotvě na home. Zdroj archivu používá `history.pushState/replaceState` (`ArticleArchivePage.astro:384–385`), článek používá historii pro kotvy (`[...id].astro:521,546`). Na začátku každé stránky byl jeden beacon script, ne dva.

**Dopad:** při interpretaci „čtenosti“ je nutné oddělit skutečné načtení článku od navigačních událostí při práci s filtrem/kotvou. Nelze z klientského payloadu dokázat, jak dashboard události agreguje; **není to potvrzený počet duplicit v dashboardu**.

**Náprava:** ověřit v existujícím Cloudflare měření kontrolovanou session (jeden vstup, filtr, kotva) a definici pageview. Teprve podle výsledku upravit zacházení s routingem či report. Nepřidávat další analytics službu.

### UX-P03 — P2 / YouTube konverze: CTA existují, ale jejich výsledek není doložen měřením
**Důkaz:** funkční přímé odkazy na video; header a autorská karta odkazují na `@realtech-cz?sub_confirmation=1`. Video článek má lokální façade s play tlačítkem, délku 9:04 a „Přehrát na YouTube“ pod ní (`video-390.png`, `browser.json`). Ve zdroji nalezen Cloudflare beacon (`Base.astro:237`), nikoli vlastní události kliknutí na YouTube/fasádu/odběr. Zachycené analytické requesty obsahují navigaci a technická data, nikoli doloženou YouTube konverzi. Bez kliknutí na YouTube záměrně nelze tvrdit úplný audit outbound eventů třetí strany.

**Náprava:** dohodnout minimální definici funnelu: návštěva článku → odchod na konkrétní video / aktivace façade → případný odběr ověřovaný v YouTube Studio. Výstupní klik není odběr. Případné měření navrhnout až po schválení, v existujícím stacku, bez osobních identifikátorů. Očekávané zlepšení CTR zde není naměřeno a nelze ho slibovat.

**Doplňující UX hypotéza:** vizuální header CTA říká „YouTube“, ačkoli accessible name a URL říkají „Odebírat“. Explicitní text odběru může být srozumitelnější na desktopu; na 320 px je ikonová varianta prostorově přiměřená. Není to doložená WCAG chyba ani důvod přestavět header.

### UX-P04 — P3 / návratnost: RSS existuje jen jako autodiscovery, ne viditelná cesta
**Důkaz:** `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` je živě přítomen, ale žádný viditelný RSS odkaz na všech pěti vzorcích. `followup.json.rss`, `summary.json`; `Base.astro:199`, patička `Base.astro:354–381`.

**Náprava:** přidat malý textový odkaz RSS do existující patičky / nabídky odběru, nikoli nový blok či redesign. Přijímací test: klávesnicí dostupný „RSS“, platný feed a popsaný obsah. Fungování XML feedu nebylo v tomto dílčím běhu samostatně validováno.

## Co už funguje — neopakovat staré závady
- Axe po ustálení tématu nemá na testovaných stavech WCAG 2 A/AA, 2.1 AA a 2.2 AA violations. Některé `color-contrast` uzly zůstávají `incomplete` (typicky obsah přes obraz či vložené komponenty); nejsou tím automaticky prohlášeny za vyhovující. Při vizuální kontrole screenshotů není vidět plošný kontrastní nebo layoutový problém. Manuální přeměření všech barevných dvojic ani screen reader test neproběhl.
- Klávesnice: první Tab nabídne viditelný skip-link; Enter + další Tab přeskočí header na odkaz v hlavním obsahu. `activeElement=BODY` těsně po skipu není samo o sobě závada, následná tab sekvence je správná.
- Hledání: focus do comboboxu, šipka aktualizuje `aria-activedescendant`, Tab cykluje input → zavřít → všechny výsledky → input, Escape vrací focus na spouštěč. Search modal axe bez violations. Input nemá vlastní outline, ale rodič má při focusu červený inset indikátor — **nehlásit neviditelný focus na základě samotného input outline**.
- Mobilní TOC otevře obsah, klik přesune focus na cílový H2; naměřený top 176 px vs. spodní okraj sticky headeru 96 px. Nadpis není zakrytý (`toc-390.png`, `interactions.json`).
- Archiv „Starlink“ vrací 9 shod a mění URL; nulový výsledek po debounce správně ukazuje nápovědu (`followup.json.empty`). Prvotní odběr po 300 ms zachytil předchozí stav — **není to potvrzená chyba**.
- Přepínač tématu aktualizuje `aria-pressed=true` a ukládá pouze `theme=dark` do first-party localStorage. Čisté kontexty nezačínaly s dalšími first-party klíči.
- Video DJI před aktivací nenahrálo YouTube iframe ani Google požadavky: façade funguje. Zdroj `youtube-facade.js:16` vloží `youtube-nocookie.com/embed/...?...autoplay=1` teprve při kliknutí. Tlačítko je nativní a pojmenované. Post-click chování/cookies nebylo testováno; `nocookie` není právní garance. Zvažovat krátké vysvětlení předání YouTube přímo u přehrávače, ne znovu tvrdit, že je nutné vše předem načítat.
- Newsletter má e-mailový input s účelem, explicitní tlačítko, Kit disclosure, odhlášení a privacy odkaz. Double opt-in je deklarován na webu, **neověřen odesláním**.
- Důvod k návratu existuje: navazující tematické reporty, nejnovější reporty, newsletter a odkazy na kanál. Článek → konkrétní video doložen. Video → článek v popiscích YouTube nebylo prověřeno; nezaměňovat existenci webových CTA za ověřenou obousměrnou vazbu.

## Metodika / limity / artefakty
`audit.mjs`, `interactions.mjs`, `followup.mjs`, `summarize.py` jsou reprodukovatelné skripty; `browser.json`, `interactions.json`, `followup.json`, `summary.json` měření. PNG jsou viewportové důkazy, nikoli stovky celostránkových screenshotů. Vše pouze v tomto evidence adresáři.

První automatický běh změnil téma a spustil axe během CSS transition; vznikly falešné kontrastní nálezy. Zachován jako **`browser-transient-discarded.json` — NEPOUŽÍVAT pro závěry**. Finální `audit.mjs` čeká 600 ms na ustálení tématu a úplný opakovaný běh má nulu violations. Žádný současný nález není převzat ze starého #469. Audit omezen na Chromium, bez VoiceOver/NVDA, reálné mobilní klávesnice, post-submit toku, přihlášení nebo playbacku. Finální `git status --short` byl prázdný.
