# Audit realtech.cz — výchozí stav 19. 9. 2026

## Stav zakázky a hranice
**Fáze 1 dokončena; fáze 2 je v [BACKLOG.md](BACKLOG.md). Fáze 3 NEZAČALA.**
Audit je read-only vůči aplikaci i produkci; jediným výstupem v repu je tato dokumentace a auditní evidence. Žádný commit, push, PR, merge, deploy, změna URL/obsahu, účtu Cloudflare, DNS, env nebo secrets. Není údaj „po optimalizaci“: nic se neoptimalizovalo.

- Repo: https://github.com/denyappbuilder/realtech-web
- Izolovaný pracovní klon: `/Users/realtech/realtech-web-audit-20260919`, lokální dokumentační větev `improve/audit-baseline`.
- Frozen výchozí main: `061540c3f4ac7de31dcdca90a5894a48044bde8a`. Již obsahuje #470 a #471; staré nálezy z #469 nebyly automaticky přebírány.
- Produkční deployment baseline: `01da21f3-11f4-4336-b120-d75b833404e0`; úspěšný Pages check na přesném SHA, homepage obsahově totožná s immutable deploymentem (SHA256 HTML v [headers.json](evidence/headers.json)). Metadata a JSON-LD živých 141 stránek se shodují s frozen buildem.
- Priorita rozhodování: organické hledání → YouTube návaznost → důvěra/rychlost/čitelnost. Skóre Lighthouse není náhradou organické návštěvnosti nebo konverze.

## Shrnutí
**Základní indexovatelnost funguje, redesign není potřeba.** 141/141 sitemap URL odpovídá 200, mají jedinečné title/description, self-canonical, `lang=cs`, jeden H1, OG a Twitter metadata. 118 článků má NewsArticle. Nejsou skutečné orphan stránky ani rozbité interní cíle v kontrolovaném buildu.

Potvrzené mezery:
1. **Video schema:** 14/14 `VideoObject.contentUrl` odkazuje na HTML watch stránku, nikoli video soubor. Přítomné embedUrl/fasádu/CTA zachovat.
2. **Mobilní rychlost:** video DJI medián Performance 84 / LCP 3,824 s; Falcon 9 94 / 2,947 s. Ani jeden z pěti mobilních mediánů nesplnil přísnější LCP <2 s. Výrazný rozptyl vyžaduje oddělit síť/font/CSS/image příčiny, ne naslepo přepisovat layout.
3. **Soukromí/disclosure:** text GDPR slibuje načítání třetích stran až při použití; browser před kliknutím zaznamenal YouTube thumbnails, X a giscus, u X také cookies. To je doložený nesoulad vysvětlení a chování, nikoli právní závěr o nezákonnosti.
4. **Měřitelnost:** chybí doložená baseline organických návštěv/CTR a web→YouTube funnelu; INP není ověřen. IndexNow workflow existuje, ale API dokládá 0 běhů a 0 GitHub deployment záznamů.
5. **Udržitelnost:** build běží, ale neexistuje funkční `astro check` brána; schází @astrojs/check a tsconfig. Tři články mají skok H1→H3.

## 1. Výkon — skutečná produkce
30 sériových běhů Lighthouse 13.4.1, Chrome 152, Node 22.23.1, macOS 26.6.2: **5 URL × 2 režimy × 3 opakování**. 19. 9. 2026 07:12:25–07:18:05 UTC. Každý hlavní dokument HTTP 200, žádná runtimeError. Výchozí Lighthouse mobile simulated throttling (RTT 150 ms, 1638,4 kbit/s, CPU ×4, 412×823 DPR1,75); desktop preset. Chrome reset mezi běhy, CDN nepurgujeme. Ostatní browser audity na stejném stroji mohly část doby běžet souběžně; příčinu variance nelze z tohoto měření izolovat.

Vzorky:
- `home`: https://realtech.cz/
- `archive`: https://realtech.cz/clanky/
- `ai-news`: https://realtech.cz/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc/
- `space`: https://realtech.cz/clanky/falcon-9-narazil-do-mesice/
- `video`: https://realtech.cz/clanky/dji-vs-insta360/

Medián každé metriky samostatně; P/A/BP/SEO v bodech 0–100:

| Stránka | Režim | P | A | BP | SEO | LCP s | CLS | TBT ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| home | mobile | 98 | 100 | 100 | 100 | 2.131 | 0.00018 | 0 |
| home | desktop | 99 | 100 | 100 | 100 | 0.864 | 0.00018 | 0 |
| archive | mobile | 98 | 100 | 100 | 100 | 2.181 | 0.00033 | 0 |
| archive | desktop | 96 | 100 | 100 | 100 | 1.160 | 0.00111 | 0 |
| ai-news | mobile | 98 | 100 | 100 | 100 | 2.254 | 0.00025 | 0 |
| ai-news | desktop | 99 | 100 | 100 | 100 | 0.765 | 0.01741 | 0 |
| space | mobile | 94 | 100 | 100 | 100 | 2.947 | 0.00033 | 0 |
| space | desktop | 99 | 100 | 100 | 100 | 0.866 | 0.00019 | 0 |
| video | mobile | 84 | 100 | 100 | 100 | 3.824 | 0.00033 | 0 |
| video | desktop | 99 | 100 | 100 | 100 | 0.912 | 0.00019 | 0 |

**TBT není INP.** Veřejný PSI bez credentials v obou režimech odpověděl 429 RESOURCE_EXHAUSTED, kvóta 0. Field INP, field LCP/CLS a p75 nejsou ověřeny. Žádný údaj TBT=0 nebyl vydán za INP<200 ms.

Rozptyl je důležitý: homepage mobil P82–99, LCP2,112–4,775 s; archiv P74–98, LCP2,175–4,810 s; video P77–98, LCP2,226–4,325 s. Dřívější jednotlivé preview skóre99 není dnešní baseline.

### Přenosy, obrázky, fonty a hydratace
- Mobilní JS medián: home15,2 KiB, archiv18,4 KiB, články21,0 KiB. CSS home/archiv15,6 KiB, články16,2 KiB. Fonty **313,2 KiB / 9 requestů** na mobilu. Přesné počty/bajty pro všech 10 kombinací v [lighthouse-summary.json](evidence/lighthouse-summary.json), detail v [PERFORMANCE.md](evidence/PERFORMANCE.md).
- Homepage mobil: obrázky446,0 KiB; celkem801,7 KiB. Lighthouse odhaduje úsporu obrazových variant317 KiB; **nejde o dosaženou úsporu ani slíbený LCP zisk**. Malé 72/96px karty mají jako nejmenší soubor640w. Příklad `amodei-altman-tempo-ai-640.webp`:31 458 B, odhad zbytečných29 290 B. Starlink960w:143 366 B, odhad úspory105 325 B.
- Inventář144 lokálních HTML: **740 výskytů img / 239 unikátních src**, 0 chybějících alt atributů, 0 chybějících width/height; 599 lazy a141 eager. 737 WebP a3 externí JPG náhledy YouTube. Šest prázdných alt je současně aria-hidden u dekorativních náhledů homepage — nikoli šest automatických vad. Responsivní srcset je na737 picture/source, ne přímo na img. Smysluplnost všech autorských alt textů a obrázky dynamicky vložené X/giscus nebyly touto statickou kontrolou certifikovány. [image-summary.json](evidence/image-summary.json).
- Vlastní Sharp pipeline vytváří JPEG640 a WebP640/960/full; obrázky mají responsivní srcset/sizes. Důležitá hero/fasáda je objevitelná v HTML s eager/high prioritou. Není důvod požadovat astro:assets jen pro splnění názvu technologie: **0 importů astro:assets, 0 client:* hydratačních direktiv**.
- Fonty self-hosted WOFF2, unicode-range, `font-display:swap`; žádný Google Fonts request. Jejich datová cena není důkaz nepoužitých řezů. Nezužovat Archivo osu/glyfy bez shody typografie a diakritiky; změna fontu by byla mimo auditní opravu.
- Hashed CSS/JS/fonty mají dlouhou immutable cache; HTML Brotli. Third-party: Cloudflare beacon, YouTube thumbnails, giscus/GitHub; na X článcích další X domény. Vlastní web není nutně původcem Lighthouse varování o legacy JavaScriptu: uvedené11 KiB se týká beaconu Cloudflare.
- Lighthouse unused CSS10–11 KiB platí pro konkrétní viewport/navigaci, **není bezpečný seznam k mazání**. Modelovaná LCP úspora je často0; přínos CSS zásahu musí prokázat samostatný experiment.

## 2. Technické SEO a strukturovaná data
Rozsah: homepage1, archiv8, články118, témata rozcestník1 + huby7 + pagination4, O nás1, GDPR1 = **141**. Každá sitemap URL má uloženou živou odpověď/DOM metadata; počty i množiny jsou kontrolovány kódem. Detail jednotlivých URL: [metadata-all.csv](evidence/metadata-all.csv), [SEO.md](evidence/SEO.md).

- Chybějící title/description/canonical, duplicitní title/description, ne-self canonical, chybné cs, více/méně H1, chybějící OG/Twitter: **0/141**.
- Robots umožňuje veřejný web, blokuje jen `/cdn-cgi/`; sitemap index i XML validní,141 indexovatelných canonical URL se lastmod. Neprokazuje to přijetí do Google/Seznam indexu nebo citace AI vyhledávači.
- RSS validní XML,50 unikátních položek, všechny cíle v sitemap. Limit50 je vědomá implementace, nikoli chyba. Autodiscovery141/141, ale viditelný RSS odkaz chybí na pěti testovaných typech.
- Neexistující URL skutečná404 s noindex a bez canonical. `www`→canonical301; `/clanky` a `/o-nas`→slash308; starý admin slug, `/feed`, `/sitemap.xml` a stránka1 výpisů301 na správný cíl. Browser HTTP→HTTPS307 může být HSTS upgrade, neověřuje původní serverový status.
- 144 HTML souborů v dist: mimo141 sitemap navíc404, newsletter `/vitej/` a Google verification HTML. Jejich vynechání je očekávané. Astro build hlásí143 page(s), lokální parser počítá i verification HTML kopírované z public.
- 100/141 title přes60 znaků a10 descriptions pod70 znaků jsou pouze redakční heuristiky, **ne pevný limit Googlu či automatická chyba**. Bez GSC dat nekrátit titulky hromadně.

### Schema — co je a není validováno
118/118 NewsArticle,140/141 BreadcrumbList (homepage nepotřebuje), Organization na120 stránkách, Person na119 stránkách (včetně vnořených autorů). AudioObject118, VideoObject14. JSON.parse i auditní kontrola přítomnosti polí bez chyb; šest renderovaných spot-checků potvrzuje schema po JS.

**Cíl „100 % validní schema“ zatím nelze označit splněný:** u14/14 VideoObject `contentUrl` míří na youtube.com/watch (HTML), ač [Google vyžaduje skutečné bytes videa](https://developers.google.com/search/docs/appearance/structured-data/video). `embedUrl` již správně existuje; oprava má odstranit zavádějící optional pole, pokud přímé médium legitimně nemáme, ne rehostovat YouTube. Jednomu videu chybí doporučená duration — není povinná ani sama o sobě invalidita. U všech14 se uploadDate bere z data článku; skutečné datum videa není porovnáno s ověřeným zdrojem. Google Rich Results Test ani Search Console video indexace neověřeny; syntaktický PASS není certifikace rich results.

## 3. Obsah, provázanost a důvod vracet se
- 118 publikovaných článků. **0 orphanů / 141 sitemap stránek**, všechny dosažitelné z homepage. **6914 interních odkazů/kotev na144 HTML bez chyb**, včetně duplicitních ID; nejde o audit všech externích odkazů.
- Celostránkově má ≥3 unikátní interní cíle118/118 článků (navigace/recommendations se počítají). V samotném textu má ≥3 jen **8/118**; **110/118** méně, **21/118** žádný odchozí a **53/118** žádný příchozí kontextový odkaz. Tyto53 nejsou skuteční sirotci. Nutno rozhodnout, zda cílem jsou právě kontextové odkazy; nedoplňovat nerelevantní linky na kvótu.
- 6 článků leží4 kliky od homepage; odkazy z relevantních hubů mohou zkrátit cestu. Archivní strana8 je8 kliků, což není hloubka všech jejích článků.
- 303–1574 slov na článek;0 pod heuristikou300 slov. Near-duplicate Jaccard≥0,65 nenašel pár; nejde o sémantický audit, fakt-check, plagiátorský test ani vyloučení keyword cannibalization.
- 3 články začínají bodyH3 poH1 bezH2: Word, Claude checklist a OpenAI misalignment. Zachovat věty/fakta a opravit pouze úrovně nadpisů po souhlasu.
- Topic hubs existují a mají vlastní obsah/metadata; doporučení článků a chronologická navigace fungují. Návratnost lze podpořit dostupností existujícího RSS, kvalitnějšími kontextovými odkazy a konkrétními doplňky k videím; nový formát obsahu je redakční rozhodnutí.

## 4. YouTube konverze
**14/14 článků s vlastním YouTube video polem má fasádu + VideoObject + CTA na kanál**, CTA v autorském boxu navíc118/118 článků. Façade aktivuje iframe youtube-nocookie až kliknutím; thumbnail videa je na vzorku lokální. Všechny články nejsou video scénáře: dalších11 článků má X posty, jejich médium/práva nelze automaticky přejmenovat na vlastní video nebo doplnit VideoObject.

Header i autorský box vedou na kanál s parametrem odběru, video články také na konkrétní video. Newsletter má jasné označení e-mailu a existující Kit integraci, RSS je jen v head. Článek→video ověřeno; **video→článek v YouTube popiscích neověřeno** (žádný zásah do kanálu). Přehrávání, subscriptions ani newsletter double opt-in nebyly aktivně dokončeny.

Chybí doložené měření funnelu návštěva článku→klik/přehrání→odběr. Poslední krok nelze vydávat za kliknutí na CTA. Nový tracker/eventy bez souhlasu nepřidávat; nejdříve definovat metriky a ověřit možnosti existujícího stacku.

## 5. UX a přístupnost
5 stránek ×4 stavy = **20** browser skenů (desktop1440 light/dark,390light,320dark). **0 axe WCAG violations,0 overflow,0 pageerror**;19 screenshotů. Nejde o všechna zařízení ani WCAG2.1AA certifikaci. Část kontrastů axe označila incomplete; všechna barevná párování, screen reader a fyzická mobilní klávesnice nejsou ověřeny.

Klávesnicí ověřen skip-link, search combobox/šipky/focus trap/Escape return, archivní hledání a nápověda nulových výsledků, theme persistence, mobilní TOC focus/closure a cílový nadpis pod sticky headerem (top176px vs header96px). Mobilní screenshot videočlánku ukazuje čitelný titulek/text a zřetelnou video fasádu. Není doložen důvod pro redesign. Původní kontrastní transient během přepnutí tématu byl odhalen, počkalo se na ustálení a celý sken zopakován; nehlásíme jej jako vadu webu.

## 6. Analytika a soukromí
Cloudflare Web Analytics není jen snippet: zachycen skutečný beacon/RUM POST. Při filtru archivu a kotvě vznikají další routing-apis navigation events; **jak je agreguje dashboard není ověřeno**, nelze tvrdit konkrétní počet duplicitních návštěv. Organické návštěvy, CTR/SERP dotazy, Seznam/Bing/AI referraly a konverze nejsou z veřejného webu dostupné. Vyžádat export/readonly report, ne secrets.

GDPR text „až když je použiješ“/„Do té doby s Googlem nekomunikuješ“ nekryje live chování: homepage při scrollu3 ytimg thumbnails, X článek automatické X requesty a dvě cookie jména/domény __cf_bm (.twitter.com,.x.com); giscus na3/3 vzorkových článků bez aktivace komentáře. Čisté first-party úložiště kromě theme preference, na ostatních testovaných stránkách žádné cookies. Není to úplný souhlasový/legal audit. Rozhodnout klikací načtení volitelných embedů a přesný disclosure s právním posouzením; nepřidávat naslepo cookie lištu. [UX.md](evidence/UX.md) uvádí konkrétní důkazy a rozsah.

## 7. Bezpečnost, infrastruktura a kvalita kódu
- Živě ověřeno CSP, HSTS, nosniff, DENY, referrer/permissions policies na homepage i edge hledání. CSP povoluje unsafe-inline; defense-in-depth backlog, nikoli důkaz XSS. Knihovní audit0 známých zranitelností.
- Cache hashed assets31536000immutable; images veřejný live max-age14400, source `_headers` požaduje0. Původ rozdílu bez CF účtu neověřen; nic v účtu neměněno. Dlouhou immutable cache nezavádět na přepisované URL bez verzování.
- Astro7.3.3, Node22.23.1, npm10.9.8, engine-strict. `npm outdated`8 balíčků; žádný hromadný upgrade, major/font/compiler změny bez prokázaného přínosu nejsou priorita.
- Build PASS:143 generovaných pages a **1 již existující obsahové varování** Word H3 bez H2. Po buildu testy **1035 PASS,0 FAIL,0 SKIP,6 existujících TODO** z1041. TODO jsou IndexNow hraniční parsovací/validační případy.
- **Astro check neproběhl:** @astrojs/check chybí; instalaci jsem odmítl. CLI sice vrátilo0, ale explicitně hlásí ERROR. `tsc --noEmit` bez tsconfig vrací help/exit1. Nelze tvrdit0 TS chyb. Současné CI typecheck nemá. Nutný prerequisite před první implementační PR podle zadání.
- Content collection strict Zod a prebuild validace fungují. Všech6 komponent má použití; byte-identické duplicity zdrojů nenalezeny. Obecnou nepřítomnost mrtvého kódu nelze statickým inventářem dokázat; refactor/mazání bez nálezu se nenavrhuje.
- IndexNow workflow active, API total_count0 běhů a0 deployment records; Pages používá doložené check-runs. Nápravu spouštěcí integrace navrhnout s exact-SHA produkčním guardem, nepovažovat push do main za úspěšný deploy. V auditu nic IndexNow neodesláno.

## 8. Cíle — splnění výchozího stavu
| Cíl | Baseline |
|---|---|
| Mobilní P≥95 | 3/5 mediánů splňuje; Falcon94 a video84 ne |
| A≥95, BP100, SEO100 | Všech30 LH běhů splňuje automatické skóre |
| Mobilní LCP<2s | 0/5 mediánů; field stav neověřen |
| CLS<0,05 | Všech10 mediánů splňuje; field stav neověřen |
| INP<200ms | Neověřeno, PSI429; TBT nelze dosadit |
| Validní schema100% | Syntakticky118/118 článků;14 VideoObject sémantická chyba, rich-results neověřeno |
| Žádní sirotci | 0/141 v kompletním HTML grafu |
| ≥3 interní odkazy/článek | 118/118 celostránkově;8/118 v textu — upřesnit cíl |
| Video embed+VideoObject+CTA | 14/14 YouTube článků, existenci splňuje; význam contentUrl opravit |
| Organický růst / YouTube konverze | Výchozí soukromá data chybí; žádná tvrzená změna |

## Důkazy a reprodukce
Souhrnné přenositelné důkazy jsou v `docs/audit/evidence/`; plné30 Lighthouse JSON,141 per-page JSON, screenshoty a skripty mimo repo: `/Users/realtech/.hermes/state/realtech-audit-20260919/`. Přehled SHA256 vybraných artefaktů v `evidence/manifest.json`. Citované specializované reporty mohou relativními odkazy odkazovat do původního evidence rootu; manifest uvádí zdrojovou cestu.

Neověřeno: GSC/index coverage/rankingy, organické návštěvy/CTR, actual YT odběry, field CWV/INP, Rich Results validator, externí video metadata/Googlebot fetch, VoiceOver/NVDA, přehrávání/odesílání formulářů, úplný právní soulad, příčina síťové variance a CF cache override. Žádný chybějící údaj není nula ani automatický FAIL.

**Další krok: schválit konkrétní položky BACKLOG.md a uvedená rozhodnutí. Bez toho žádná implementace.**
