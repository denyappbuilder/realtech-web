# Backlog realtech.cz — čeká na schválení

Výchozí audit: [AUDIT.md](AUDIT.md), commit `061540c3f4ac7de31dcdca90a5894a48044bde8a`, 19. 9. 2026. **Stav při auditu: žádná položka nebyla implementována. Aktuální stav B10 je v dodatku níže.**

Dopad1–5 a pracnost1–5 jsou expertní pořadové odhady, ne naměřený růst návštěvnosti ani kalendářní dny. Pořadí je programově seřazeno sestupně podle dopad/pracnost; při shodě stabilní ID. Riziko a závislosti mohou změnit schválenou sekvenci. **B10 je technický prerequisite prvního implementačního PR**, i když poměrem není první.

## Skutečný stav k 20. 9. 2026 00:00 (aktuální; níže historické zápisy z 19. 9.)

Zdroj: merged PR v repu, `docs/audit/changelog/<ID>.md`, produkce marker `1ded1126` → `050715c7`.

**Hotové, živě na produkci**
| ID | Co | PR |
|---|---|---|
| B01 | VideoObject.contentUrl | #473 |
| B02 | hierarchie nadpisů | #474 |
| B04 | komentáře (giscus) až po kliknutí, bez preconnectu; aria-busy fix; privacy text pravdivě (komentáře po kliknutí, X hned) | #487, #491, #492 |
| B05 | IndexNow až po ověřeném produkčním nasazení | #475 |
| B06 | malé WebP varianty + oprava PNG hero (částečné, viz B06 níže) | #477 |
| B10 | strict astro check + build gate | #472 |
| B18 | IndexNow jen změněné URL (baseline = poslední úspěšný produkční běh; jen šablony ⇒ 0 URL) | #486 — ověřeno živě: 0/0/0/6/9/9/5 URL, vše HTTP 200 |
| B19 | YouTube výzva za úvodním odstavcem (s videem „Přehrát video“, bez videa „Odebírat kanál“); video nahoře už platí přes hero fasádu | #481 |
| B11 (část) | LINKMAP: 37 z 39 navržených interních odkazů v 10 článcích (2 přeskočeny — duplicitní cíl z téhož článku) | #480 dokument, #489, #494, #495, #496 |
| pravidla | RULES.md: pravidlo pro úpravu existujících testů | #485 |

**Uzavřené bez opravy (rozhodnutí Daniela 19. 9.)**
- **B07** — neprovádět, stačí RSS autodiscovery (Maky #337 nechce klikací RSS; viz §7).
- **B09** — „měřeno, bez levné opravy“. LCP mobil (produkce, medián): 2 098 / 2 360 / 2 999 / 3 794 / 3 976 ms u 5 článků; příčina = 75 KB render-blocking CSS + soutěž o pásmo s preloadovanými fonty; experiment kritického CSS (beasties) LCP zhoršil o 150–300 ms (#488 zavřen, #490 changelog).
- **B20** — vyřešeno v rámci B04 (#487): prázdná plocha pod „Komentáře“ byla `min-height: 340px` lazy iframu; teď placeholder bez výšky.
- **B21 (audio preload)** — bez změny: `preload="metadata"` stahuje před kliknutím 0–63 KB (< 200 KB práh), délka jde z dat článku; `none` už bylo (#285) a Kolo 36 (#437) ho vědomě vrátilo.

**Zaparkované**
- **B04 — X embedy click-to-load**: test-x-embed.mjs a rehype-x-embed.js nesou rozhodnutí Makyho (#364, 30. 8.: „click-to-load bránu Maky zrušil“). Čeká na Danielův rozhovor s Makym. Privacy text zatím pravdivě říká, že X se načítá hned.

**Zbývá (neschváleno / nezahájeno)**
- B03 (výchozí metrika), B08 (funnel web→YouTube — B19 je první krok), B11 zbytek (LINKMAP pro dalších 108 článků), B12, B13, B14, B15, B16, B17, B06 okrajové vady (viz níže).

---

## Dodatek B10 — 19. 9. 2026

Původní tabulka a stav výše jsou snapshot dokončeného auditu. B10 je nyní lokálně opravené a ověřené, dosud bez commit/PR; přesná evidence a popsaná výjimka raw HTML parity kvůli schválenému null guardu jsou v [CHANGELOG.md](CHANGELOG.md). Původní auditní manifest neověřuje tuto pozdější aktualizaci backlogu. Ostatní implementace zůstávají nezahájené.

### B06 — částečný draft PNG + malé varianty (19. 9. 2026)

Lokálně implementována oprava PNG source/preload + JPG srcset derivace a přidány WebP 192/384w; před nezávislým review/commit/PR. Evidence v [CHANGELOG.md](CHANGELOG.md). **B06 není celé hotové: politika chybějící truthy image zůstává beze změny, odložena; dle závěrečného pokynu se validátor ani prebuild nemění a fallback se nepřidává.** Níže uvedená reprodukce chybějící cesty stále platí; PNG reprodukci nyní pokrývá regression test.

### B06 — původní reprodukované okrajové vady

- Truthy `image` ukazující na neexistující soubor: detail nepoužije YouTube fallback ani s videem; homepage a karta bez videa rovněž předají chybějící cestu. Není to chyba `image === undefined`; absence image má bezpečné guardy. Budoucí AC: explicitně ověřit neexistující cestu s/bez videa a zvolit schválenou fallback politiku.
- Existující PNG na homepage: jpg-only `.replace()` ponechá `.png`; jeho existence se vyhodnotí jako WebP a source/preload dostane `image/webp`. Budoucí AC: ověřit PNG/JPG a MIME zdroje bez změn master obrázků.
- Nezávislá kontrola původního SHA: 8 boundary skupin PASS; baseline deklarované obrázky jsou existující JPG. Vady jsou reprodukované pro okrajová data, nikoli doložené aktuální publikované selhání. B10 pouze zachovává chování a opravuje typový kontrakt null srcset; B06 vyžaduje nové samostatné zadání.

### B17 — posoudit 35 existujících astro check hintů (nový návrh)

- **Stav:** Nezahájeno, čeká na schválení; není součást B10 oprav ani původního seřazeného scoringu.
- **Inventář:** 25 deprecation hintů Zod/schema, 5 nepoužitých deklarací (4 testy + vitej), 2 chybějící runtime typy `HTMLRewriter`, 2 deprecated `execCommand` a 1 deprecated `navigator.platform`.
- **Ověření B10:** Stejných 35 identit soubor/kód/zpráva před a po, bez potlačení. Souhrn CLI je 0 warnings / 35 hints, i když diagnostické řádky říkají warning.
- **Budoucí AC:** Nejprve rozlišit deklarace typu pro Cloudflare runtime, bezpečný úklid nepoužitých jmen a případné behaviorální změny deprecated API. Nenahrazovat clipboard/platform fallbacky ani schema migraci bez vlastních regression testů a samostatného souhlasu; žádné hromadné potlačení hintů.

## Pořadí

| Pořadí | ID | Oblast | Dopad | Pracnost | Poměr |
|---:|---|---|---:|---:|---:|
| 1 | B01 ✅ #473 | Opravit význam VideoObject.contentUrl | 4 | 1 | 4.00 |
| 2 | B02 ✅ #474 | Srovnat hierarchii nadpisů tří článků | 3 | 1 | 3.00 |
| 3 | B03 | Doložit organickou a konverzní výchozí metriku | 5 | 2 | 2.50 |
| 4 | B04 ✅ #487/#491/#492 (X ⏸ Maky) | Sjednotit načítání třetích stran s vysvětlením soukromí | 5 | 2 | 2.50 |
| 5 | B05 ✅ #475 | Zprovoznit doložitelnou IndexNow návaznost na produkční deploy | 4 | 2 | 2.00 |
| 6 | B06 ✅ #477 (část) | Dodat malé obrazové varianty pro skutečné sloty karet | 4 | 2 | 2.00 |
| 7 | B07 | **Neprovádět — stačí autodiscovery** (rozhodnutí 19. 9.) | 2 | 1 | 2.00 |
| 8 | B08 | Definovat a ověřit web→YouTube funnel v existujícím stacku | 4 | 2 | 2.00 |
| 9 | B09 ⛔ uzavřeno bez opravy (#490) | Změřit příčinu a snížit mobilní LCP článků | 5 | 3 | 1.67 |
| 10 | B10 ✅ #472 | Zavést skutečný astro check před implementačními PR | 5 | 3 | 1.67 |
| 11 | B11 🔶 LINKMAP 37 odkazů (#489–#496) | Redakčně posílit relevantní kontextové odkazy | 4 | 3 | 1.33 |
| 12 | B12 | Ověřit skutečná metadata čtrnácti videí | 3 | 3 | 1.00 |
| 13 | B13 | Zkrátit objevitelnost šesti hlubších článků | 2 | 2 | 1.00 |
| 14 | B14 | Ověřit cyklus aktualizace obrázků a cache | 2 | 2 | 1.00 |
| 15 | B15 | Cílená údržba závislostí, nikoli hromadný upgrade | 2 | 3 | 0.67 |
| 16 | B16 | Případné zpřísnění CSP bez unsafe-inline | 2 | 4 | 0.50 |

## Podrobnosti

### 1. B01 — Opravit význam VideoObject.contentUrl

- **Popis:** Pokud nemáme legitimní stabilní přímý video soubor, vynechat optional contentUrl; zachovat embedUrl, viditelné odkazy i fasádu. Žádné rehostování nebo změna URL článků.
- **Důvod/důkaz:** 14/14 VideoObject obsahuje URL HTML watch stránky místo médiových bytes (AUDIT §2; SEO/video-contenturl-checks.json).
- **Dopad/pracnost/poměr:** 4/5; 1/5; 4.00.
- **Riziko:** Nízké; regrese schema nebo odstranění správného embedUrl.
- **Dotčené soubory:** `src/pages/clanky/[...id].astro`; `scripts/test-*.mjs (nový cílený schema test)`.
- **Ověření a cílový výsledek:** 14/14 schema zachová potřebná pole/fasádu/CTA; žádné contentUrl na HTML stránku; validátor na reprezentativním videu a úplná kontrola buildu.
- **Rozhodnutí/závislost:** Technická oprava po schválení položky; žádné video metadata nevymýšlet.
- **Navržená větev:** `improve/video-schema`. Samostatný PR dané oblasti; nic nemergovat.

### 2. B02 — Srovnat hierarchii nadpisů tří článků

- **Popis:** Pouze opravit úrovně existujících nadpisů, beze změny znění, faktů, pořadí sekcí a fragmentových cílů.
- **Důvod/důkaz:** 3/118 textů začínají H3 po H1,1 existující prebuild warning (AUDIT §3,7).
- **Dopad/pracnost/poměr:** 3/5; 1/5; 3.00.
- **Riziko:** Nízké; změna anchor ID musí být vyloučena.
- **Dotčené soubory:** `src/content/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc.md`; `src/content/clanky/claude-cowork-docs-slides-checklist.md`; `src/content/clanky/openai-misalignment-reports-pet-pravidel-agenti.md`; `scripts/validate-content.mjs`; `scripts/test-*.mjs`.
- **Ověření a cílový výsledek:** 0 skoků H1→H3 v těchto3 tělech; odstranit existující warning, zachovat původní anchor odkazy i text.
- **Rozhodnutí/závislost:** Jde o povolenou formátovací oblast, ale provést až po schválení backlogu.
- **Navržená větev:** `improve/heading-structure`. Samostatný PR dané oblasti; nic nemergovat.

### 3. B03 — Doložit organickou a konverzní výchozí metriku

- **Popis:** Z existujících nástrojů dodat read-only export za28/90d: Google Search Console pages/queries/impressions/clicks/CTR/indexace/CWV; Cloudflare landing/referrer; existující Seznam/Bing data, pokud jsou. Zapsat definici návštěvy a konverze; neinstalovat další službu.
- **Důvod/důkaz:** Živý Cloudflare beacon funguje, ale audit nemá ani jedno ověřené číslo organic visits/CTR/YouTube funnelu; field INP blokuje PSI429 (AUDIT §1,6).
- **Dopad/pracnost/poměr:** 5/5; 2/5; 2.50.
- **Riziko:** Nízké technicky; export může obsahovat citlivé dotazy, nepřenášet osobní identifikátory.
- **Dotčené soubory:** `docs/audit/MEASUREMENT.md (nový dokument)`; `docs/audit/evidence/ (redigované agregace)`.
- **Ověření a cílový výsledek:** Reprodukovatelná baseline se zdrojem/obdobím a jasně odděleným Google,Seznam/Bing,AI referral a direct; chybějící data označena. Ověřený field INP jen pokud skutečně dostupný.
- **Rozhodnutí/závislost:** Daniel dodá exporty nebo povolí konkrétní read-only přístup; žádné secrets do chatu/repa. Nevyžaduje změnu webu.
- **Navržená větev:** `improve/measurement-baseline`. Samostatný PR dané oblasti; nic nemergovat.

### 4. B04 — Sjednotit načítání třetích stran s vysvětlením soukromí

- **Popis:** Doporučení: explicitní click-to-load X a komentáře s odkazovým fallbackem, přesný disclosure thumbnailů/analytics; posoudit stávající vlastní lokální náhledy. Nepřidávat automaticky cookie lištu ani jiný tracker.
- **Důvod/důkaz:** Bez media kliknutí:3 ytimg thumbnails na homepage; X článek načetl X domény a __cf_bm cookies; giscus se načetl na3/3 vzorkových článků. GDPR slibuje až po použití (AUDIT §6; UX-P01).
- **Dopad/pracnost/poměr:** 5/5; 2/5; 2.50.
- **Riziko:** Střední; změna chování komentářů/X, právní text musí být odsouhlasen.
- **Dotčené soubory:** `src/pages/gdpr.astro`; `src/pages/clanky/[...id].astro`; `src/lib/rehype-x-embed.js`; `src/lib/x-embed.js`; `src/components/Giscus.astro`; `src/lib/giscus-klient.js`; `src/pages/index.astro`.
- **Ověření a cílový výsledek:** Před souhlasnou aktivací žádné requesty/cookies od zvolených volitelných služeb; po aktivaci funkční obsah a klávesnice; text popisuje skutečný stav. Právní závěr dodá odpovědná osoba.
- **Rozhodnutí/závislost:** Schválit click-to-load X/giscus vs. jiné odůvodněné řešení a konečný privacy text. Nepotvrzuje se nezákonnost současných cookies.
- **Navržená větev:** `improve/privacy-embeds`. Samostatný PR dané oblasti; nic nemergovat.

### 5. B05 — Zprovoznit doložitelnou IndexNow návaznost na produkční deploy

- **Popis:** Použít skutečný signál úspěšného Pages nasazení se striktní kontrolou main/produkce/exact SHA. Doplnit XML entity/whitespace a URL validaci; nezměnit stávající klíč. Neoznamovat pouze na push před deployem.
- **Důvod/důkaz:** Workflow active, ale API total_count0 běhů a0 GitHub deployments; úspěšný Pages check existuje.6 TODO parsování/validace (AUDIT §7).
- **Dopad/pracnost/poměr:** 4/5; 2/5; 2.00.
- **Riziko:** Střední; nesmí oznamovat preview, cizí SHA nebo nepublikované URL.
- **Dotčené soubory:** `.github/workflows/indexnow-after-deploy.yml`; `scripts/indexnow.mjs`; `scripts/test-indexnow*.mjs`.
- **Ověření a cílový výsledek:** Offline payload testy a6TODO převedených na skutečný PASS; preview/cizíSHA odmítnuty. Ostré oznámení teprve po samostatně schváleném nasazení, s doloženou HTTP odpovědí.
- **Rozhodnutí/závislost:** Schválit integraci. Nyní žádný POST; konečný produkční smoke vyžaduje pozdější deploy souhlas. Bez nových secrets/služeb.
- **Navržená větev:** `improve/indexnow`. Samostatný PR dané oblasti; nic nemergovat.

### 6. B06 — Dodat malé obrazové varianty pro skutečné sloty karet

- **Popis:** Doplnit odvozené menší WebP varianty podle skutečných slotů/DPR do existující Sharp pipeline; správné srcset, beze změny master obrázků, autorské ilustrace nebo designu. Neplést datovou úsporu s garantovaným LCP ziskem.
- **Důvod/důkaz:** 72/96px karty stahují nejméně640w. Homepage mobil image-delivery odhad317KiB, Amodei640w31 458B s29 290B odhadovanou úsporou (AUDIT §1).
- **Dopad/pracnost/poměr:** 4/5; 2/5; 2.00.
- **Riziko:** Nízké až střední; ostrost, crop a srcset kontrakty nesmějí utrpět.
- **Dotčené soubory:** `scripts/optimize-images.mjs`; `src/lib/karta-nahled.js`; `src/components/ArticleCard.astro`; `src/pages/search-index.json.js`; `scripts/test-*.mjs`.
- **Ověření a cílový výsledek:** Pokles skutečných transferred bytes na shodných stránkách/viewportech, čitelnost/ostrost 1x/2x ověřena, hero/preload i všechny existující asset URL zachovány; žádné LCP/CLS zhoršení.
- **Rozhodnutí/závislost:** Technická oblast po schválení; bez nové závislosti.
- **Navržená větev:** `improve/responsive-images`. Samostatný PR dané oblasti; nic nemergovat.

### 7. B07 — neprovádět, stačí autodiscovery

- **Rozhodnutí Daniela 19. 9. 2026:** Neimplementovat viditelný RSS odkaz, nevytvářet PR; lokální návrh odkazu a nový test zahozeny. Původní ochranný test zůstává beze změny. Níže uvedený původní návrh je historický a není platným zadáním.
- **Původ konkrétního testu na řádku 33:** commit [`fc507f710513b4a5db27a275a7025913561689e8`](https://github.com/denyappbuilder/realtech-web/commit/fc507f710513b4a5db27a275a7025913561689e8), 26. 8. 2026, commitový čas `2026-08-26T09:21:36-07:00`, zpráva **„fix(web): pryč viditelné RSS odkazy z archivu a patičky (#337)“**. Tělo zprávy: „Maky nechce klikací RSS na webu. H1 Všechny články zůstává, feed /rss.xml i rel=alternate v <head> taky — jen tlačítka z UI.“ Diff tohoto commitu přidává právě negativní footer RSS test a pozitivní head autodiscovery kontrolu; nejde o nahodilý starý test. Samotný soubor vznikl již v `06fd14785fbc65f2df31157cd23b5636b87dcef1` (#333), ne však tato RSS kontrola.
- **Živě ověřeno 19. 9. 2026:** homepage `https://realtech.cz/`, archiv `https://realtech.cz/clanky/` a článek `https://realtech.cz/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc/` mají každý právě jeden skutečný `<head>` odkaz `<link rel="alternate" type="application/rss+xml" title="REALTECH CZ" href="/rss.xml">`. Ověřeno parsováním načteného produkčního HTML, nikoli jen zdrojovou šablonou. Evidence: `state/realtech-batch2-20260919/B07/autodiscovery-live.json`.

- **Popis:** Jeden textový odkaz RSS do existující patičky/odběru; žádný nový blok/redesign.
- **Důvod/důkaz:** RSS autodiscovery141/141 a50 validních feed položek; na5/5 browser vzorcích0 viditelných RSS odkazů (AUDIT §2,4).
- **Dopad/pracnost/poměr:** 2/5; 1/5; 2.00.
- **Riziko:** Nízké; nezahlcovat navigaci.
- **Dotčené soubory:** `src/layouts/Base.astro`; `scripts/test-*.mjs`.
- **Ověření a cílový výsledek:** Klávesnicí dostupný pojmenovaný link na správný feed, žádný overflow320px, žádné duplicity head RSS.
- **Rozhodnutí/závislost:** Schválit drobný distribuční kanál; žádná služba nebo tracking.
- **Navržená větev:** `improve/rss-discovery`. Samostatný PR dané oblasti; nic nemergovat.

### 8. B08 — Definovat a ověřit web→YouTube funnel v existujícím stacku

- **Popis:** Po B03 definovat article_view,video_outbound,facade_start,channel_outbound bez osobních ID; nejprve prověřit možnosti současných nástrojů a jejich agregaci. Odebraný kanál nelze vyvozovat z outbound click. Zkontrolovat v Studio manuálně vazbu video→článek.
- **Důvod/důkaz:** CTA118/118 a14/14 video fasád existují; ve zdroji/payloadu není doložen outbound/play/subscribe conversion event. RUM routing události vznikají i při filtru/kotvě (AUDIT §4,6).
- **Dopad/pracnost/poměr:** 4/5; 2/5; 2.00.
- **Riziko:** Střední; nové eventy jsou měření, nutný souhlas a minimalizace dat.
- **Dotčené soubory:** `docs/audit/MEASUREMENT.md`; `src/layouts/Base.astro (jen bude-li event řešení schváleno)`; `src/lib/youtube-facade.js`; `src/pages/clanky/[...id].astro`.
- **Ověření a cílový výsledek:** Jedna kontrolovaná návštěva → očekávané počty událostí bez duplikace při filtrování; redigované agregace, žádné osobní ID. Oddělit skutečný odběr od kliknutí; přínos vyhodnotit až na datech.
- **Rozhodnutí/závislost:** Nejdřív rozhodnout, zda vůbec přidávat měření a jak. Žádný nový tracker/služba bez výslovného souhlasu; YouTube popisky upravuje Daniel/Sam, ne agent.
- **Navržená větev:** `improve/youtube-measurement`. Samostatný PR dané oblasti; nic nemergovat.

### 9. B09 — Změřit příčinu a snížit mobilní LCP článků

- **Popis:** Nejprve izolovaný opakovatelný trace experiment bez souběžné zátěže: TTFB/discovery/render delay/font/CSS. Potom pouze potvrzená oprava bottlenecku, žádný nový design ani slepé odstranění CSS. Zachovat glyph/šířkové osy loga.
- **Důvod/důkaz:** Video mediánP84/LCP3,824s; FalconP94/2,947s;0/5 mobilních mediánů LCP<2s. Rozptyl až4,8s,9 font requests/313,2KiB. Aktuální data neurčila jedinou příčinu (AUDIT §1).
- **Dopad/pracnost/poměr:** 5/5; 3/5; 1.67.
- **Riziko:** Střední; globální CSS/font/preload změna může rozbít typografii, CLS či dark mode.
- **Dotčené soubory:** `src/layouts/Base.astro`; `src/styles/fonts-archivo.css`; `src/styles/fonts-plex.css`; `src/styles/premium.css`; `src/lib/hero-preload.js`; `src/pages/clanky/[...id].astro (výběr podle trace)`.
- **Ověření a cílový výsledek:** Shodné5URL mobile/desktop po3bězích; cílitP≥95,LCP<2s,CLS<0,05 bez zhoršení ostatních metrik. Pokud žádná příčina není potvrzena, jen evidence, ne spekulativní patch.
- **Rozhodnutí/závislost:** Schválit diagnosticko-opravnou oblast; font/design změna nad rámec bezezměnové optimalizace vyžaduje další souhlas.
- **Navržená větev:** `improve/mobile-lcp`. Samostatný PR dané oblasti; nic nemergovat.

### 10. B10 — Zavést skutečný astro check před implementačními PR

- **Popis:** Doplnit nutnou @astrojs/check devDependency s odůvodněním, tsconfig a npm script/CI gate; nejprve inventář baseline chyb. Bez plošného přepisování kódu nebo potlačování typů, které by skrylo chyby.
- **Důvod/důkaz:** Chybí @astrojs/check i tsconfig; astro check vypíše ERROR přesto exit0, tsc exit1/help. CI pouze test+build (AUDIT §7).
- **Dopad/pracnost/poměr:** 5/5; 3/5; 1.67.
- **Riziko:** Střední; nová devDependency a může odhalit větší existující TS dluh.
- **Dotčené soubory:** `package.json`; `package-lock.json`; `tsconfig.json (nový)`; `.github/workflows/npm-test.yml`; `pouze soubory s doloženými TS chybami`.
- **Ověření a cílový výsledek:** Reálný astro check končí bez diagnostických errors, build bez nových warnings,1035 stávajících PASS zachováno; CLI exit není jediný signál. Všechny další PR mají check i build.
- **Rozhodnutí/závislost:** Nutný technický prerequisite před první implementační PR bez ohledu na poměr. Schválit právě tuto devDependency; při širokém baseline dluhu nejprve dodat rozsah místo velkého refactoru.
- **Navržená větev:** `improve/typecheck`. Samostatný PR dané oblasti; nic nemergovat.

### 11. B11 — Redakčně posílit relevantní kontextové odkazy

- **Popis:** Po schválení redakčního seznamu začít relevantní dávkou článků, ne všech110 automaticky. Zachovat tvrzení a faktické znění; navrhnout přirozené anchor texty a propojení s průvodci.
- **Důvod/důkaz:** 8/118 článků má≥3 odkazy v textu;21 bez odchozího,53 bez příchozího kontextového odkazu,110pod3. Celostránkově118/118 splňuje a skuteční sirotci0 (AUDIT §3).
- **Dopad/pracnost/poměr:** 4/5; 3/5; 1.33.
- **Riziko:** Střední redakční; mechanické doplňování může měnit smysl nebo vytvářet nerelevantní vazby.
- **Dotčené soubory:** `src/content/clanky/*.md (jen schválený explicitní seznam)`; `docs/audit/evidence/internal-links-plan.md (návrh)`.
- **Ověření a cílový výsledek:** U schválené dávky skutečně relevantní interní odkazy a nový obousměrný body graph; žádné404/fragment regressions. Bez kvótového spamování.
- **Rozhodnutí/závislost:** Upřesnit, zda cíl≥3 znamená kontextové odkazy. Schválit redakční vazby, protože to není čistě technická volba.
- **Navržená větev:** `improve/internal-links`. Samostatný PR dané oblasti; nic nemergovat.

### 12. B12 — Ověřit skutečná metadata čtrnácti videí

- **Popis:** Vyžádat ověřený seznam datumů/délek existujících videí, rozšířit content schema jen při potřebě; nepřepisovat fakta z odhadu. Zároveň jen read-only ověřit viditelné video→article linky nebo převzít export od Daniela.
- **Důvod/důkaz:** 14/14 uploadDate je z article.date; skutečné datum neověřeno;1/14 chybí doporučená duration (AUDIT §2).
- **Dopad/pracnost/poměr:** 3/5; 3/5; 1.00.
- **Riziko:** Střední faktické; nelze datum článku svévolně zaměnit za datum videa.
- **Dotčené soubory:** `src/content.config.ts`; `src/content/clanky/*.md (14video položek dle evidence)`; `src/pages/clanky/[...id].astro`; `scripts/validate-content.mjs`.
- **Ověření a cílový výsledek:** 14/14 datumů porovnáno s důvěryhodným zdrojem; doplnit1 délku jen skutečně ověřenou; žádná změna videa na YouTube.
- **Rozhodnutí/závislost:** Daniel/Sam potvrdí zdroj metadata a vlastnictví vazeb; absence duration není kritický rich-results blocker.
- **Navržená větev:** `improve/video-metadata`. Samostatný PR dané oblasti; nic nemergovat.

### 13. B13 — Zkrátit objevitelnost šesti hlubších článků

- **Popis:** Relevantní odkazy/hub selection bez nových URL, přestavby menu nebo vytváření tenkých SEO stránek. Koordinovat s B11, nevytvořit duplicitní PR za stejnou věc.
- **Důvod/důkaz:** 6/118 článků4 kliky od homepage, všechny však dosažitelné a žádný orphan;7 témat už existuje (AUDIT §3).
- **Dopad/pracnost/poměr:** 2/5; 2/5; 1.00.
- **Riziko:** Nízké technicky, střední editorial relevance.
- **Dotčené soubory:** `src/components/TemaPage.astro`; `src/lib/tema-souvisi.js`; `src/content/clanky/*.md (jen bude-li schváleno)`.
- **Ověření a cílový výsledek:** Dotčených6 článků v≤3 klikových cestách bez nepřirozeného globálního seznamu; současné cíle a canonical zachovány.
- **Rozhodnutí/závislost:** Schválit konkrétní tematické vazby, alternativně zahrnout do B11 a neduplikovat práci.
- **Navržená větev:** `improve/topic-discovery`. Samostatný PR dané oblasti; nic nemergovat.

### 14. B14 — Ověřit cyklus aktualizace obrázků a cache

- **Popis:** Read-only vysvětlit účinnou hlavičku; pro budoucí přepis obrázků zvážit verzovaný asset odkaz v kódu, ne změnu článkové URL. Žádné CF account/DNS změny.
- **Důvod/důkaz:** Live images max-age14400 vs source_headers max-age0, konkrétní Word cover; hashed assets již immutable správně (AUDIT §7).
- **Dopad/pracnost/poměr:** 2/5; 2/5; 1.00.
- **Riziko:** Střední; nevhodné TTL může držet staré covers nebo zvednout provoz.
- **Dotčené soubory:** `public/_headers`; `src/lib/karta-nahled.js`; `src/lib/hero-obrazek.js`; `scripts/optimize-images.mjs (až dle zjištěné příčiny)`.
- **Ověření a cílový výsledek:** Opakované načtení aktualizované asset verze prokazatelně čerstvé, staré asset URL funkční; nezhoršit cache fingerprintovaných souborů.
- **Rozhodnutí/závislost:** Pokud příčina leží v CF účtu, pouze report Danielovi; mandát zásah do účtu nezahrnuje.
- **Navržená větev:** `improve/asset-cache`. Samostatný PR dané oblasti; nic nemergovat.

### 15. B15 — Cílená údržba závislostí, nikoli hromadný upgrade

- **Popis:** Changelog/compatibility audit; pouze konkrétní potřebný bezpečný patch v samostatném PR. Major TypeScript/compiler/js-yaml a fonty oddělit a odůvodnit; žádný bump pro skóre.
- **Důvod/důkaz:** npm audit0;8 npm outdated balíčků, aktuální Astro7.3.3. Není prokázaná bezpečnostní nutnost upgrade (AUDIT §7).
- **Dopad/pracnost/poměr:** 2/5; 3/5; 0.67.
- **Riziko:** Střední až vysoké u major/compiler/font změn.
- **Dotčené soubory:** `package.json`; `package-lock.json`; `scripts/test-*.mjs (případné regresní krytí)`.
- **Ověření a cílový výsledek:** Konkrétní zdůvodněný přínos, test/build/check a vizuální parity při fontech, žádné nové warnings/vulnerabilities.
- **Rozhodnutí/závislost:** Odložit, dokud není jasný přínos; nové knihovny ani framework upgrade nejsou součástí schválení auditu.
- **Navržená větev:** `improve/dependency-maintenance`. Samostatný PR dané oblasti; nic nemergovat.

### 16. B16 — Případné zpřísnění CSP bez unsafe-inline

- **Popis:** Inventář inline skriptů a návrh hashované politiky; nejprve preview test všech interakcí. Neoznačovat to za SEO blocker a nevypínat funkce, aby test prošel.
- **Důvod/důkaz:** Živá CSP obsahuje script/style unsafe-inline, ale má object-src none/base-uri self/frame-ancestors none; audit neprokázal exploataci (AUDIT §7).
- **Dopad/pracnost/poměr:** 2/5; 4/5; 0.50.
- **Riziko:** Vysoké regresní; theme bootstrap, schema, search a embed integrace.
- **Dotčené soubory:** `public/_headers`; `src/layouts/Base.astro`; `src/pages/clanky/[...id].astro`; `src/components/*.astro`; `build scripts podle navržené hash pipeline`.
- **Ověření a cílový výsledek:** Bez CSP violation u všech schválených funkcí, zachovat ochrany, monitorovat jen existujícími prostředky; žádná účtová CF změna.
- **Rozhodnutí/závislost:** Samostatné schválení po prioritních oblastech; nejde o rychlou jednorázovou změnu řetězce.
- **Navržená větev:** `improve/csp-hardening`. Samostatný PR dané oblasti; nic nemergovat.

## Nové položky od Daniela — pouze backlog, 19. 9. 2026

### B19 — Kompaktní YouTube CTA po úvodu a související video nahoře

- **Stav: HOTOVO — #481 (19. 9. 2026), viz changelog/B19.md.** Původní zápis níže je historický.
- **Podnět uživatele:** CTA na YouTube je jen na konci článku. Toto je vstupní pozorování, nikoli nový plošný audit všech článků.
- **Budoucí práce:** Navrhnout kompaktní CTA po úvodu; u článků s existujícím souvisejícím videem navrhnout jeho embed nahoře. Nevymýšlet video ani vazbu k článku, nepřidávat embed tam, kde video neexistuje.
- **Budoucí ověření:** Mobil/desktop, čitelnost úvodu, nenarušení layoutu a stávajícího CTA; zachování lazy/click-to-load a soukromí, žádný autoplay ani nové měření bez schválení. Koordinovat s B04/B08/B12. Dnes pouze zápis, žádná změna UI/obsahu.

### B20 — Prázdná plocha pod „Komentáře“ na desktopu

- **Stav: VYŘEŠENO v B04 — #487 (19. 9. 2026).** Příčina: `min-height: 340px` na kontejneru lazy iframu; teď nízký placeholder, výška až po kliknutí. Původní zápis níže je historický.
- **Podnět uživatele:** Pod nadpisem „Komentáře“ je na desktopu velká prázdná plocha. Příčina ani univerzálnost zatím nezjištěna.
- **Budoucí práce:** Ověřit naživo před načtením, během načítání a po načtení komentářů, včetně nedostupné/blokované služby; zaznamenat URL, viewport, screenshot a skutečné rozměry. Pokud se potvrdí zbytečně rezervované místo, navrhnout sbalení do načtení komentářů, bez zakrytí chybového stavu nebo přístupného ovládání.
- **Budoucí ověření:** Desktop i mobil, úspěšné načtení, pomalá síť, blokace/selhání, klávesnice a případné layout shifts. Koordinovat s B04. Dnes pouze backlog — živé šetření ani oprava této položky nezahájeny.

## Rozhodnutí pro Daniela

1. **Schválit výběr oblastí.** Doporučená první technická dávka: B10 (nutná brána), potom B01, B02, B05, B06, B07 — každá samostatná větev/PR. B09 je měřená optimalizace, ne nový redesign. Samotné schválení dávky není merge/deploy souhlas.
2. **Data a definice úspěchu:** dodat existující GSC/Cloudflare/Seznam/Bing exporty nebo konkrétní read-only přístup (B03). Odsouhlasit, zda a jak přidat měření outbound/fasády (B08); žádný nový tracker bez dalšího souhlasu.
3. **Soukromí:** zvolit chování volitelných X a giscus embedů (doporučen click-to-load) a schválit právně přesný disclosure (B04). Audit právní základ nepotvrzuje.
4. **Interní odkazy:** potvrdit, zda „min.3“ znamená kontextové odkazy v textu. Celostránkově už platí118/118; body8/118. Případné redakční doplnění jen podle schváleného seznamu (B11/B13).
5. **Video fakta:** ověřená data14 videí/délka1 videa, pravidlo obousměrné vazby a konkrétní materiál, který má divák najít jen na webu (B12). Změny YouTube popisků/metadata dělá Daniel/Sam, nikoli tento agent.
6. **Závislosti:** souhlas s nutnou devDependency @astrojs/check v B10. Žádný blanket souhlas s osmi outdated aktualizacemi, jinou analytikou nebo font redesignem.

## Dodatek B02 — implementační překryvy, 19. 9. 2026

B02 je lokálně ověřené, před nezávislým review / commit / PR; přesné výsledky v [CHANGELOG.md](CHANGELOG.md). Tento dodatek aktualizuje pouze B02, historický auditní snapshot výše zůstává zachován.

- Vlastnictví: pouze tři články z B02, nový cílený test a tato implementační dokumentace. Validátor není třeba měnit: původní Word warning mizí opravou heading prefixů. Text, fakta, pořadí a anchor ID zůstávají.
- B01 nemá s B02 source překryv; společný je CHANGELOG. B02 stojí samostatně na main, ne na otevřeném B01 headu. B05/B06/B07 nemají s těmito třemi Markdown opravami source překryv; společné dokumentační hunks je nutné při integraci zachovat, ne přepsat.
- Pořadí případných samostatně schválených mergů: **B01 → B02 → B05 → B06 → B07**. Schválení implementace ani toto pořadí neopravňuje k merge/deploy; každý merge vyžaduje výslovné číslo PR.
- Po integraci novějšího main zopakovat exact-source review a gates; nepřenášet hotové dist důkazy na jiné SHA. Další backlog položky se tímto dodatkem neimplementují.

## Implementační kontrakt po schválení

- Jedna oblast = `improve/<oblast>` = jeden PR. Malé atomické commity. Nikdy přímý commit do main, žádný merge.
- Před každým PR skutečný build a astro check, bez **nových** warnings; existující warning je výše transparentně uveden a řeší jej B02. Test suite nesmí regredovat; žádné nové TODO/skip místo oprav.
- PR: co/proč, stejné metriky před/po, immutable Cloudflare Pages preview pro přesný SHA a návod ručního ověření. Není-li preview dostupné, není release gate splněn.
- Po dokončení každé schválené větve přidat záznam do `docs/audit/CHANGELOG.md`. První záznam B10 je v CHANGELOG.md; další položky čekají na nové OK.
- Žádné změny tvrzení/smyslu článků, existujících URL nebo mazání obsahu. Větší vizuální nápad jen návrh. Žádné DNS/CF account/env/secrets zásahy, placené služby ani trackery.
- Čísla „po“ až ze skutečného opakovaného měření. Odhady Lighthouse nelze vydat za dosažené úspory; změnu traffic/CTR vyhodnotit až za srovnatelné období s limity kauzality.

**STOP: pokračování pouze na Danielovo schválení konkrétního scope.**

## Dodatek B18 — IndexNow: jen změněné URL (19. 9. 2026)

- **Stav: NÁVRH — NEIMPLEMENTOVÁNO (PROPOSAL NOT IMPLEMENTED).** Schválen je pouze zápis do backlogu; implementace vyžaduje samostatný souhlas. Původní historická tabulka, pořadí a scoring zůstávají beze změny.
- **Cíl:** Po úspěšném produkčním deployi oznamovat pouze nové a změněné obsahové URL, nikoli celý web při každém nasazení. Zachovat stávající kontroly main/produkce/exact SHA; preview nesmí odeslat ping.
- **Preferovaný návrh:** `git diff` mezi předchozím a novým skutečně nasazeným **PRODUKČNÍM commitem** vybere nové a změněné obsahové zdrojové soubory. Ty se namapují podle existujících pravidel webu na jejich publikované canonical routes; žádné nové URL ani změna routingu. Nezaměňovat předchozí produkční commit za libovolného rodiče commitu nebo poslední push.
- **Otevřená technická validace:** Teprve ověřit, odkud lze v existující infrastruktuře spolehlivě a read-only identifikovat předchozí úspěšně nasazený produkční commit. Zdroj zde není doložen; nevymýšlet ani nezavádět perzistentní stav. Pokud dvojici produkčních SHA nelze ověřit, STOP a navrhnout jednodušší variantu, nikoli hádat baseline nebo poslat celý web.
- **Výslovné hranice:** Změny pouze v šablonách/komponentách ⇒ **ŽÁDNÝ ping**; prázdný výběr obsahových URL ⇒ žádný POST. Žádné úložiště stavu, nové secrets, služby ani změny konfigurace účtů. Mazání/přejmenování a nepublikované zdroje nejprve vymezit při validaci; bez automatického rozšíření scope.
- **Budoucí ověření:** Offline testy pro nový obsah, změněný obsah, nezměněný obsah, pouze šablony/komponenty, prázdný výběr a neověřenou produkční baseline; ověřit existující canonical mapování a zachování preview/exact-SHA ochran. Žádný živý POST v rámci návrhu ani offline ověřování.
- **Odhad a STOP:** 30–45 minut pro případnou schválenou minimální implementaci včetně technické validace a cílených testů, nejvýše 45 minut. Jakmile řešení vyžaduje více než 45 minut, **STOP a předložit jednodušší variantu ke schválení**; nepřidávat stav ani secrets jako obchvat.
- **Tento PR:** Pouze dodatek v `docs/audit/BACKLOG.md` na větvi `improve/indexnow-backlog`; žádné změny skriptů, runtime ani workflows. Samostatný dokumentační PR bez merge, oddělený od B06/B07; zápis nemění současné chování IndexNow.
