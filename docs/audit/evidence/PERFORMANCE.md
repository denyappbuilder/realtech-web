# RealTech.cz — živý performance baseline, 19. 9. 2026

## Hlavní závěry

- Mobilní mediány: homepage P98 / LCP 2,131 s; archiv P98 / 2,181 s; ChatGPT ve Wordu P98 / 2,254 s; Falcon 9 P94 / 2,947 s; video DJI P84 / 3,824 s. Nejslabší medián je video, následně Falcon 9. Desktop P96–99, LCP 0,765–1,160 s.
- Výrazná nestabilita mobilu: například archiv LCP 2,175–4,810 s a P74–98, homepage 2,112–4,775 s. Jediný dobrý běh by problém maskoval; jediný špatný by nadhodnotil typický stav. Příčina rozptylu není tímto baseline izolována.
- Všech 30 běhů A/BP/SEO 100, TBT 0 ms; CLS zůstává nízké. Nejde o důkaz field INP ani manuální přístupnosti.
- Přenos fontů je 313,2 KiB mobile / přibližně 328,5 KiB desktop, tedy podstatná část článkové návštěvy; vlastní/third-party skripty jsou ve většině vzorků výrazně menší. Výjimkou je Falcon 9 desktop s Giscus komentářovým embedem: network.json zachycuje ve třech desktop bězích 57 požadavků na giscus.app a 3 na github.githubassets.com; medián všech skriptů 102,2 KiB. Video DJI během všech šesti běhů nemá požadavek na YouTube ani ytimg host (fasáda nepřehraná).
- Homepage: image-delivery odhaduje 317 KiB mobile / 376 KiB desktop; archiv 181–307 KiB mobile / 214 KiB desktop. `starlink-v-cesku-pruvodce-960.webp` má 143 366 B a v home/mobile/run-1 odhad úspory 105 325 B. Přínos primárně v datech, nikoli automaticky ve LCP.
- Mobilní render-blocking odhad se mění mezi běhy: archiv run-1 FCP/LCP 2 000 ms, run-2/3 0; video run-1 FCP 2 000 ms, run-2 1 550 ms, run-3 0, ve všech třech odhad LCP 0. Neprodávat optimalizaci CSS jako garantované snížení video LCP o dvě sekundy.

### Ověřené asset hlavičky

- `asset-1.headers`: Base.DddzJay0.css HTTP 200, gzip, cache-control public/max-age=31536000/immutable, CF HIT. Komprese a dlouhá cache fingerprintovaného CSS již fungují.
- `asset-3.headers`: IBM Plex WOFF2 HTTP 200, cache-control public/max-age=31536000/immutable. `asset-2.headers`: Starlink WebP HTTP 200, 143 366 B, cache-control public/max-age=14400/must-revalidate; bez hashované URL nejde automaticky doporučit roční immutable TTL.
- Záznam mapování konkrétních URL na hlavičky: `asset-headers.json`.

## Rozsah a metoda

30 sériových Lighthouse měření, 5 URL × mobile/desktop × 3 opakování; 2026-09-19T07:12:25.130Z až 2026-09-19T07:18:05.048Z. Lighthouse 13.4.1, Chrome 152, Node v22.23.1, macOS 26.6.2. Žádné paralelní Lighthouse instance tohoto runneru. Jinou aktivitu stroje nelze zcela vyloučit.

Použit dostupný Lighthouse CLI, nikoli Chrome DevTools MCP trace (MCP není v této relaci dostupný). Mobil používá výchozí simulated throttling (RTT 150 ms, throughput 1638,4 kbit/s, CPU ×4), 412×823, DPR 1,75. Desktop používá `--preset=desktop`; přesné konfigurace, user-agent a benchmarkIndex jsou v každém raw JSON. Nový Chrome pro každý běh, výchozí reset storage; CDN cache nebyla purgována. Žádné změny zdrojů, konfigurace, závislostí ani deploymentu.

Zdrojový referenční checkout: `/Users/realtech/realtech-web-audit-20260919`, commit `061540c3f4ac7de31dcdca90a5894a48044bde8a`, čistý při vstupu. Měřena výhradně produkce https://realtech.cz, nikoli checkout nebo staré preview. Produkční build SHA není z HTTP nezávisle ověřen.

Výběr: homepage, první stránka archivu; AI novinka ChatGPT ve Wordu (19. 9., hero + audio), vesmírný článek Falcon 9 (jiné téma/hero, audio), DJI vs. Insta360 (video s YouTube fasádou, audio). Jde o vzorek, ne měření všech článků. Video ani audio se neaktivovalo a formuláře se neodesílaly. Lighthouse automatické požadavky webové analytiky mohou běžet jako při běžné návštěvě.

## Výsledky — medián každé metriky samostatně

P/A/BP/SEO jsou skóre 0–100. LCP je laboratorní simulace, CLS laboratorní navigační hodnota. **TBT není INP.** TBT=0 nedokazuje rychlost reálných interakcí. Nejde o terénní p75 Core Web Vitals. A=100 není úplný manuální audit přístupnosti.

| URL | Režim | n | P | A | BP | SEO | LCP ms | CLS | TBT ms | rozsah P | rozsah LCP ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| https://realtech.cz/ | mobile | 3 | 98 | 100 | 100 | 100 | 2131.0 | 0.00018 | 0.0 | 82–99 | 2111.9–4775.5 |
| https://realtech.cz/ | desktop | 3 | 99 | 100 | 100 | 100 | 863.8 | 0.00018 | 0.0 | 99–99 | 803.9–871.1 |
| https://realtech.cz/clanky/ | mobile | 3 | 98 | 100 | 100 | 100 | 2181.4 | 0.00033 | 0.0 | 74–98 | 2175.2–4809.8 |
| https://realtech.cz/clanky/ | desktop | 3 | 96 | 100 | 100 | 100 | 1160.4 | 0.00111 | 0.0 | 95–100 | 708.0–1388.1 |
| https://realtech.cz/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc/ | mobile | 3 | 98 | 100 | 100 | 100 | 2253.8 | 0.00025 | 0.0 | 80–99 | 2059.1–4017.3 |
| https://realtech.cz/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc/ | desktop | 3 | 99 | 100 | 100 | 100 | 765.0 | 0.01741 | 0.0 | 99–100 | 709.7–869.0 |
| https://realtech.cz/clanky/falcon-9-narazil-do-mesice/ | mobile | 3 | 94 | 100 | 100 | 100 | 2946.7 | 0.00033 | 0.0 | 77–98 | 2224.6–4390.9 |
| https://realtech.cz/clanky/falcon-9-narazil-do-mesice/ | desktop | 3 | 99 | 100 | 100 | 100 | 866.2 | 0.00019 | 0.0 | 97–100 | 472.1–1166.8 |
| https://realtech.cz/clanky/dji-vs-insta360/ | mobile | 3 | 84 | 100 | 100 | 100 | 3823.7 | 0.00033 | 0.0 | 77–98 | 2225.8–4325.1 |
| https://realtech.cz/clanky/dji-vs-insta360/ | desktop | 3 | 99 | 100 | 100 | 100 | 911.6 | 0.00019 | 0.0 | 99–100 | 675.9–944.6 |

## Požadavky a přenos

Mediány `network-requests` z Lighthouse: buňka = počet / KiB přenosu (1024 B). Zahrnuje požadavky zachycené v auditním okně včetně zdrojů dočtených auditorem, není to HAR celé uživatelské návštěvy. `transferSize` není dekomprimovaná velikost. Nulový přenos u nedokončeného media requestu neznamená nulovou velikost MP3. Third-party = HTTP(S) host mimo realtech.cz a jeho subdomény; je podmnožinou celku, ne další přičitatelnou kategorií. Celkem obsahuje navíc dokument, média a další typy.

| Stránka | Režim | Celkem | JS | CSS | img | font | Third-party |
|---|---|---|---|---|---|---|---|
| home | mobile | 31 / 801.7 | 3 / 15.2 | 1 / 15.6 | 13 / 446.0 | 9 / 313.2 | 3 / 10.1 |
| home | desktop | 35 / 930.5 | 3 / 15.2 | 1 / 15.6 | 16 / 559.5 | 10 / 328.5 | 6 / 198.7 |
| archive | mobile | 34 / 718.8 | 4 / 18.4 | 1 / 15.6 | 15 / 359.6 | 9 / 313.2 | 3 / 10.1 |
| archive | desktop | 35 / 734.2 | 4 / 18.4 | 1 / 15.6 | 15 / 359.6 | 10 / 328.5 | 3 / 10.1 |
| ai-news | mobile | 23 / 413.5 | 5 / 21.0 | 2 / 16.2 | 1 / 21.5 | 9 / 313.2 | 5 / 12.8 |
| ai-news | desktop | 24 / 474.3 | 5 / 21.0 | 2 / 16.2 | 1 / 37.4 | 10 / 328.6 | 5 / 12.8 |
| space | mobile | 23 / 454.5 | 5 / 21.0 | 2 / 16.2 | 1 / 41.3 | 9 / 313.2 | 5 / 12.8 |
| space | desktop | 45 / 683.6 | 16 / 102.2 | 4 / 27.1 | 5 / 199.0 | 10 / 328.6 | 23 / 127.1 |
| video | mobile | 23 / 393.5 | 5 / 21.0 | 2 / 16.2 | 1 / 27.0 | 9 / 313.2 | 5 / 12.8 |
| video | desktop | 24 / 459.9 | 5 / 21.0 | 2 / 16.2 | 1 / 48.5 | 10 / 328.5 | 5 / 12.8 |

## Neúspěšné audity a konkrétní soubory

Níže je pro každou kombinaci skutečný běh nejbližší mediánu skóre P (při shodě první), nikoli syntetický mediánový report. Všechny neúspěšné audity všech opakování, včetně detailů elementů, jsou ve `failed-audits.json`. Úspory jsou odhady Lighthouse, ne dosažený výsledek; různé úspory se nesčítají. Doba requestu není automaticky úspora LCP. Nulový modelovaný dopad uvádím bez doporučení k okamžité optimalizaci.

### home — mobile
Raw: `home/mobile/run-1.json`.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
- **image-delivery-insight**: Est savings of 317 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/starlink-v-cesku-pruvodce-960.webp` — {"totalBytes": 143366, "wastedBytes": 105325}.
  - `https://realtech.cz/images/clanky/amodei-altman-tempo-ai-640.webp` — {"totalBytes": 31458, "wastedBytes": 29290}.
  - `https://realtech.cz/images/clanky/gemini-3-8-live-docs-gmail-keep-640.webp` — {"totalBytes": 30926, "wastedBytes": 28795}.
  - `https://realtech.cz/images/clanky/starlink-mini-vs-standard-960.webp` — {"totalBytes": 37754, "wastedBytes": 21131}.
  - `https://realtech.cz/images/clanky/rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat-640.webp` — {"totalBytes": 22424, "wastedBytes": 20879}.
  - `https://realtech.cz/images/clanky/jak-delame-videa-s-ai-960.webp` — {"totalBytes": 35600, "wastedBytes": 19926}.
  - `https://realtech.cz/images/clanky/claude-cowork-docs-slides-checklist-960.webp` — {"totalBytes": 35536, "wastedBytes": 19890}.
  - `https://realtech.cz/images/clanky/iphone-18-pro-a20-ai-640.webp` — {"totalBytes": 21156, "wastedBytes": 19698}.
  - `https://realtech.cz/images/clanky/google-pics-scheduled-release-workspace-640.webp` — {"totalBytes": 17984, "wastedBytes": 16745}.
  - `https://realtech.cz/images/clanky/gemini-notebook-external-sharing-640.webp` — {"totalBytes": 15794, "wastedBytes": 14706}.
  - `https://realtech.cz/images/clanky/openai-bez-ipo-2026-640.webp` — {"totalBytes": 15592, "wastedBytes": 14518}.
  - `https://realtech.cz/images/clanky/openai-misalignment-reports-pet-pravidel-agenti-640.webp` — {"totalBytes": 14354, "wastedBytes": 13365}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 50}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 460}.
- Pozorovaný LCP element: `div.hero-grid > a.hero-visual > picture > img` — ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist pro OSVČ. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### home — desktop
Raw: `home/desktop/run-1.json`.
- **unused-css-rules**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 14906, "wastedBytes": 10916}.
- **cache-insight**: Est savings of 145 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://i.ytimg.com/vi/biYMveTpRWc/sddefault.jpg` — {"totalBytes": 65391, "wastedBytes": 49043.25, "cacheLifetimeMs": 7200000}.
  - `https://i.ytimg.com/vi/dyU7RAa5l0Y/sddefault.jpg` — {"totalBytes": 65159, "wastedBytes": 48869.25, "cacheLifetimeMs": 7200000}.
  - `https://i.ytimg.com/vi/ytDd3Uj8LKw/sddefault.jpg` — {"totalBytes": 62513, "wastedBytes": 46884.75, "cacheLifetimeMs": 7200000}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
- **image-delivery-insight**: Est savings of 376 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/starlink-v-cesku-pruvodce-640.webp` — {"totalBytes": 71636, "wastedBytes": 60713}.
  - `https://i.ytimg.com/vi/biYMveTpRWc/sddefault.jpg` — {"totalBytes": 65271, "wastedBytes": 50709}.
  - `https://i.ytimg.com/vi/dyU7RAa5l0Y/sddefault.jpg` — {"totalBytes": 64703, "wastedBytes": 50141}.
  - `https://i.ytimg.com/vi/ytDd3Uj8LKw/sddefault.jpg` — {"totalBytes": 62411, "wastedBytes": 47847}.
  - `https://realtech.cz/images/clanky/amodei-altman-tempo-ai-640.webp` — {"totalBytes": 31458, "wastedBytes": 22510}.
  - `https://realtech.cz/images/clanky/gemini-3-8-live-docs-gmail-keep-640.webp` — {"totalBytes": 30926, "wastedBytes": 22130}.
  - `https://realtech.cz/images/clanky/rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat-640.webp` — {"totalBytes": 22424, "wastedBytes": 21877}.
  - `https://realtech.cz/images/clanky/claude-cowork-docs-slides-checklist-640.webp` — {"totalBytes": 19994, "wastedBytes": 19506}.
  - `https://realtech.cz/images/clanky/starlink-mini-vs-standard-640.webp` — {"totalBytes": 22640, "wastedBytes": 16201}.
  - `https://realtech.cz/images/clanky/jak-delame-videa-s-ai-640.webp` — {"totalBytes": 21898, "wastedBytes": 15670}.
  - `https://realtech.cz/images/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc.webp` — {"totalBytes": 60216, "wastedBytes": 15452}.
  - `https://realtech.cz/images/clanky/iphone-18-pro-a20-ai-640.webp` — {"totalBytes": 21156, "wastedBytes": 15139}.
  - `https://realtech.cz/images/clanky/openai-misalignment-reports-pet-pravidel-agenti-640.webp` — {"totalBytes": 14354, "wastedBytes": 14004}.
  - `https://realtech.cz/images/clanky/google-pics-scheduled-release-workspace-640.webp` — {"totalBytes": 17984, "wastedBytes": 12868}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 197}.
- Pozorovaný LCP element: `div.hero-grid > a.hero-visual > picture > img` — ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist pro OSVČ. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### archive — mobile
Raw: `archive/mobile/run-2.json`.
- **unused-css-rules**: Est savings of 10 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 14909, "wastedBytes": 10636}.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
- **image-delivery-insight**: Est savings of 181 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/claude-code-tydenni-limit-zari-640.webp` — {"totalBytes": 36892, "wastedBytes": 28530}.
  - `https://realtech.cz/images/clanky/amodei-altman-tempo-ai-640.webp` — {"totalBytes": 31458, "wastedBytes": 23096}.
  - `https://realtech.cz/images/clanky/gemini-3-8-live-docs-gmail-keep-640.webp` — {"totalBytes": 30926, "wastedBytes": 22564}.
  - `https://realtech.cz/images/clanky/anthropic-threat-report-ai-orchestruje-kampane-640.webp` — {"totalBytes": 29326, "wastedBytes": 20964}.
  - `https://realtech.cz/images/clanky/enisa-testuje-mythos-5-astra-640.webp` — {"totalBytes": 27598, "wastedBytes": 19236}.
  - `https://realtech.cz/images/clanky/chatgpt-images-2-5-sketch-640.webp` — {"totalBytes": 25902, "wastedBytes": 17540}.
  - `https://realtech.cz/images/clanky/rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat-640.webp` — {"totalBytes": 22424, "wastedBytes": 14062}.
  - `https://realtech.cz/images/clanky/openai-agents-api-harness-640.webp` — {"totalBytes": 21926, "wastedBytes": 13564}.
  - `https://realtech.cz/images/clanky/iphone-18-pro-a20-ai-640.webp` — {"totalBytes": 21156, "wastedBytes": 12998}.
  - `https://realtech.cz/images/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc-640.webp` — {"totalBytes": 21010, "wastedBytes": 12908}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15964, "wastedMs": 466}.
- Pozorovaný LCP element: `section.articles > div.wrap > div.section-head > p` — Novinky, analýzy a průvodci. Najdi téma, které tě zajímá.. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### archive — desktop
Raw: `archive/desktop/run-3.json`.
- **unused-css-rules**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 50}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 14906, "wastedBytes": 11649}.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
- **image-delivery-insight**: Est savings of 214 KiB; metricSavings {"FCP": 0, "LCP": 100}.
  - `https://realtech.cz/images/clanky/claude-code-tydenni-limit-zari-640.webp` — {"totalBytes": 36892, "wastedBytes": 26399}.
  - `https://realtech.cz/images/clanky/amodei-altman-tempo-ai-640.webp` — {"totalBytes": 31458, "wastedBytes": 22511}.
  - `https://realtech.cz/images/clanky/gemini-3-8-live-docs-gmail-keep-640.webp` — {"totalBytes": 30926, "wastedBytes": 22130}.
  - `https://realtech.cz/images/clanky/anthropic-threat-report-ai-orchestruje-kampane-640.webp` — {"totalBytes": 29326, "wastedBytes": 20984}.
  - `https://realtech.cz/images/clanky/enisa-testuje-mythos-5-astra-640.webp` — {"totalBytes": 27598, "wastedBytes": 19748}.
  - `https://realtech.cz/images/clanky/chatgpt-images-2-5-sketch-640.webp` — {"totalBytes": 25902, "wastedBytes": 18535}.
  - `https://realtech.cz/images/clanky/rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat-640.webp` — {"totalBytes": 22424, "wastedBytes": 16046}.
  - `https://realtech.cz/images/clanky/openai-agents-api-harness-640.webp` — {"totalBytes": 21926, "wastedBytes": 15690}.
  - `https://realtech.cz/images/clanky/iphone-18-pro-a20-ai-640.webp` — {"totalBytes": 21156, "wastedBytes": 15138}.
  - `https://realtech.cz/images/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc-640.webp` — {"totalBytes": 21010, "wastedBytes": 15034}.
  - `https://realtech.cz/images/clanky/claude-cowork-docs-slides-checklist-640.webp` — {"totalBytes": 19994, "wastedBytes": 14307}.
  - `https://realtech.cz/images/clanky/google-pics-scheduled-release-workspace-640.webp` — {"totalBytes": 17984, "wastedBytes": 12869}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 242}.
- Pozorovaný LCP element: `article.card > div.card-thumb > picture > img` — Modely OpenAI při tréninku klamaly. Pět pravidel, než agentovi svěříš poštu. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### ai-news — mobile
Raw: `ai-news/mobile/run-3.json`.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
  - `https://audio.realtech.cz/chatgpt-ve-wordu-zdarma-checklist-osvc-nlm.mp3?v=7a3c784bd81a` — {"totalBytes": 0, "wastedBytes": 0, "cacheLifetimeMs": 14400000}.
- **image-delivery-insight**: Est savings of 14 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc-640.webp` — {"totalBytes": 21010, "wastedBytes": 14214}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 412}.
- Pozorovaný LCP element: `div.wrap > div.article-hero > picture > img` — ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist pro OSVČ. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### ai-news — desktop
Raw: `ai-news/desktop/run-1.json`.
- **unused-css-rules**: Est savings of 10 KiB; metricSavings {"FCP": 0, "LCP": 50}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 14906, "wastedBytes": 10412}.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
  - `https://audio.realtech.cz/chatgpt-ve-wordu-zdarma-checklist-osvc-nlm.mp3?v=7a3c784bd81a` — {"totalBytes": 0, "wastedBytes": 0, "cacheLifetimeMs": 14400000}.
- **image-delivery-insight**: Est savings of 14 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc-960.webp` — {"totalBytes": 37192, "wastedBytes": 13882}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 189}.
- Pozorovaný LCP element: `div.wrap > div.article-hero > picture > img` — ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist pro OSVČ. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### space — mobile
Raw: `space/mobile/run-1.json`.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 200}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
  - `https://audio.realtech.cz/falcon-9-narazil-do-mesice-v3.mp3?v=b7d7a695b333` — {"totalBytes": 0, "wastedBytes": 0, "cacheLifetimeMs": 14400000}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 200}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 390}.
- Pozorovaný LCP element: `div.wrap > div.article-hero > picture > img` — Kus Falconu 9 narazil do Měsíce. Dalekohled v Chile našel v prachu sodík. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### space — desktop
Raw: `space/desktop/run-2.json`.
- **unused-css-rules**: Est savings of 10 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 14906, "wastedBytes": 10401}.
- **cache-insight**: Est savings of 22 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://github.githubassets.com/images/mona-loading-default.gif` — {"totalBytes": 18733, "wastedBytes": 18733, "cacheLifetimeMs": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
  - `https://audio.realtech.cz/falcon-9-narazil-do-mesice-v3.mp3?v=b7d7a695b333` — {"totalBytes": 0, "wastedBytes": 0, "cacheLifetimeMs": 14400000}.
- **image-delivery-insight**: Est savings of 112 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/falcon-9-narazil-do-mesice-v2-960.webp` — {"totalBytes": 82460, "wastedBytes": 30779}.
  - `https://realtech.cz/images/clanky/starship-flight-14-prvni-orbita-640.webp` — {"totalBytes": 35784, "wastedBytes": 30697}.
  - `https://realtech.cz/images/clanky/starship-flight-14-super-heavy-static-fire-640.webp` — {"totalBytes": 34984, "wastedBytes": 30010}.
  - `https://realtech.cz/images/clanky/nasa-roman-falcon-heavy-640.webp` — {"totalBytes": 27576, "wastedBytes": 23655}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 330}.
- Pozorovaný LCP element: `div.wrap > div.article-hero > picture > img` — Kus Falconu 9 narazil do Měsíce. Dalekohled v Chile našel v prachu sodík. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### video — mobile
Raw: `video/mobile/run-2.json`.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
  - `https://audio.realtech.cz/dji-vs-insta360-v3.mp3?v=b0338bacc87c` — {"totalBytes": 0, "wastedBytes": 0, "cacheLifetimeMs": 14400000}.
- **image-delivery-insight**: Est savings of 18 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/dji-vs-insta360-640.webp` — {"totalBytes": 26576, "wastedBytes": 17979}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Est savings of 1,560 ms; metricSavings {"FCP": 1550, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 411}.
- Pozorovaný LCP element: `div.video-embed > button.youtube-facade-button > picture > img` — DJI vs. Insta360: válka dvou firem z jednoho města, kterou vyhraje zákazník. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

### video — desktop
Raw: `video/desktop/run-2.json`.
- **unused-css-rules**: Est savings of 10 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 14906, "wastedBytes": 10294}.
- **cache-insight**: Est savings of 4 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"totalBytes": 10338, "wastedBytes": 4135.2, "cacheLifetimeMs": 86400000}.
  - `https://audio.realtech.cz/dji-vs-insta360-v3.mp3?v=b0338bacc87c` — {"totalBytes": 0, "wastedBytes": 0, "cacheLifetimeMs": 14400000}.
- **image-delivery-insight**: Est savings of 18 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/images/clanky/dji-vs-insta360-960.webp` — {"totalBytes": 48638, "wastedBytes": 18155}.
- **legacy-javascript-insight**: Est savings of 11 KiB; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://static.cloudflareinsights.com/beacon.min.js` — {"wastedBytes": 10840}.
- **render-blocking-insight**: Render-blocking requests; metricSavings {"FCP": 0, "LCP": 0}.
  - `https://realtech.cz/_astro/Base.DddzJay0.css` — {"totalBytes": 15961, "wastedMs": 206}.
- Pozorovaný LCP element: `div.video-embed > button.youtube-facade-button > picture > img` — DJI vs. Insta360: válka dvou firem z jednoho města, kterou vyhraje zákazník. Rozpad v tomto insightu je pozorovaná trace časová osa, nesčítat k simulovanému LCP v tabulce.

## Asset evidence a interpretace

### Skutečně stahované fonty (rozsah přenosu napříč běhy)

- `https://realtech.cz/_astro/archivo-latin-ext-wdth-normal.7khWdh9v.woff2`: 87306–87326 B.
- `https://realtech.cz/_astro/archivo-latin-wdth-normal.DY7AcnAa.woff2`: 91166–91207 B.
- `https://realtech.cz/_astro/ibm-plex-mono-latin-400-normal.DMJ8VG8y.woff2`: 15760–15769 B.
- `https://realtech.cz/_astro/ibm-plex-mono-latin-500-normal.DSY6xOcd.woff2`: 15938–15945 B.
- `https://realtech.cz/_astro/ibm-plex-sans-latin-400-normal.CDDApCn2.woff2`: 23005–23646 B.
- `https://realtech.cz/_astro/ibm-plex-sans-latin-500-normal.6ng42L7E.woff2`: 25249–25257 B.
- `https://realtech.cz/_astro/ibm-plex-sans-latin-600-normal.CuJfVYMP.woff2`: 25305–25312 B.
- `https://realtech.cz/_astro/ibm-plex-sans-latin-ext-400-normal.C5H60-Va.woff2`: 16339–17037 B.
- `https://realtech.cz/_astro/ibm-plex-sans-latin-ext-500-normal.DakdToA3.woff2`: 17507–17516 B.
- `https://realtech.cz/_astro/ibm-plex-sans-latin-ext-600-normal.DOrvGEcy.woff2`: 17496–17501 B.

### Hosty zachycené ve všech bězích

- `audio.realtech.cz`: 18 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).
- `cloudflareinsights.com`: 60 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).
- `giscus.app`: 87 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).
- `github.githubassets.com`: 3 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).
- `i.ytimg.com`: 9 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).
- `realtech.cz`: 684 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).
- `static.cloudflareinsights.com`: 30 zachycených požadavků ve 30 bězích (součet, nikoli na jednu návštěvu).

### Návrhy k zařazení do backlogu, nikoli schválené opravy

- **Nejdřív mobilní LCP archivu a článků:** vycházet z mediánů a rozptylu výše. Render-blocking `/_astro/Base.DddzJay0.css` má v některých bězích nenulový modelovaný dopad; hypotézu kritického CSS ověřit odděleným experimentem. Nezaměnit 450ms trvání requestu za garantovanou úsporu. V tomto auditu není příčina všech rozdílů mezi běhy izolována.
- **Obrázkové listy:** Lighthouse přímo detekuje nadměrné varianty u malých karet; konkrétní URL a wastedBytes jsou výše. Priorita je přenos dat; nulová úspora LCP není důkaz zhoršeného LCP. Zvažovat varianty podle reálných slotů, bez degradace ostrosti; DPR a crop ověřit před změnou. Článkové hero obrázky již mají eager/high priority a discovery v počátečním HTML (raw `lcp-discovery-insight`).
- **CSS coverage:** reportovaná nepoužitá pravidla platí jen pro auditovanou navigaci/viewport. Nelze je bezpečně smazat bez ověření dialogů, vyhledávání, dark/light režimů a dalších rout.
- **Cloudflare beacon:** legacy JavaScript a kratší cache TTL jsou u third-party `https://static.cloudflareinsights.com/beacon.min.js`, ne vlastního Astro bundlu. Odhady legacy payloadu a cache úspory jsou různé veličiny, nesčítat; neodstraňovat analytiku bez samostatného rozhodnutí.
- **Fonty:** velikosti doloženy výše; samotná velikost nedokazuje nepoužité glyfy/řezy. Zdrojové `src/styles/fonts-archivo.css` a `fonts-plex.css` deklarují `font-display: swap`. Žádné doporučení k destruktivnímu subsetování bez vizuální regresní kontroly.
- **YouTube fasáda:** initial-load měření neprokazuje cenu po přehrání. Ověřit skutečné hosty v network.json; absence YouTube requestů v tomto režimu není tvrzení o celé návštěvě.

## INP / CrUX: NEOVĚŘENO

Veřejný PageSpeed Insights v5 bez credentials pro homepage, strategie mobile i desktop, odpověděl HTTP 429 RESOURCE_EXHAUSTED (denní kvóta veřejného consumer projektu, quota_limit_value 0). Raw `psi-mobile.body`, `psi-desktop.body` a odpovídající metadata jsou zachována. Není dostupné ověřené origin ani URL field INP, ani field LCP/CLS. U ostatních URL nebyla po blokaci kvóty opakována stejná API cesta. **TBT výše není zástupný výsledek INP.**

## Omezení a reprodukovatelnost

- Počáteční pomocné urllib fetches dostaly HTTP 403; nejde o výsledek Lighthouse. Následný curl vrátil pro všech pět URL HTTP 200; raw HTML/hlavičky `curl-*.html`, `curl-*.headers`. Každý LH report je programově ověřen proti finální URL, HTTP 200 hlavního dokumentu a absenci runtimeError.
- Bez ruční interakce, post-click videa/audio, dlouhého scrollování uživatele a RUM dat. P/A/BP/SEO platí pro konkrétní stránky a okamžik měření, ne obecnou certifikaci.
- HTTP hlavičky homepage obsahují preconnect na i.ytimg.com i Cloudflare Insights. O případné nevyužitosti rozhodovat podle konkrétní stránky a interakcí, ne automatickým globálním odstraněním.
- `lighthouse.py` je adaptovaná kopie dřívějšího runneru; npm používá offline již instalovaný Lighthouse, bez instalací či změn lockfile. `progress.jsonl` obsahuje přesné příkazy a návratové kódy.
- Evidence: 30 raw `*/{mobile,desktop}/run-{1,2,3}.json` + logy; `samples.json/.csv`, `summary.json`, `network.json/.csv`, `failed-audits.json`, HTML/headers, prostředí, PSI chyby a skripty. Vše výhradně v tomto adresáři.
