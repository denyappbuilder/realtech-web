# Technické SEO a celowebový obsahový graf — REALTECH CZ

## Rozsah a důvěryhodnost důkazů

Audit 19. 9. 2026, read-only clone `/Users/realtech/realtech-web-audit-20260919`, HEAD `061540c3f4ac7de31dcdca90a5894a48044bde8a`. Žádné opravy, změny obsahu/URL, commity, instalace, submissions ani změny nastavení. Závěrečný `git status --short` čistý. Build poskytl rodičovský agent.

**141/141 unikátních URL ze živé sitemap bylo načteno skutečným headless Chrome, každá má samostatný JSON v `pages/000.json` až `pages/140.json`. Všechny odpověděly HTTP 200.** Prvotní urllib vrátil WAF 403; tento výsledek není vydáván za nedostupnost webu nebo blokování Googlebota. Browser crawl blokoval obrázky/fonty/média kvůli nákladům, nikoli dokumenty/JS; neměří tedy rychlost, dostupnost každého obrázku ani přehrávání videí.

Programatická agregace kontroluje počet, unikátnost i přesnou shodu množiny URL. Živá metadata a JSON-LD souhlasí s právě sestaveným frozen `dist` na **141/141 URL**: title, description, canonical i JSON-LD. Šest dodatečných renderovaných kontrol po doběhnutí JS potvrzuje stejné JSON-LD: homepage, archiv, AI téma, O nás, YouTube článek Starlink Mini a článek Flight 14 s X embedem. Nejde o Google Rich Results Test/certifikaci ani o potvrzení skutečné indexace v Google. GSC, rankingy, návštěvnost a soukromé analytiky nebyly k dispozici.

Hlavní důkazy: `sitemap-urls.json`, `pages/*.json`, `summary.json`, `additional-summary.json`, `metadata-all.csv`, `static-pages.json`, `live-build-parity.json`, `rendered-spots.json`, `rendered-spot-parity.json`. Všechny cesty níže jsou relativní k této složce `seo/`.

## Inventář a metadata všech typů

| Typ | Počet | Výsledek základních SEO kontrol |
|---|---:|---|
| Homepage | 1 | 200, jedinečný title/description, self-canonical, 1 H1, cs, OG/Twitter |
| Archiv včetně stránkování | 8 | totéž; každá strana vlastní canonical |
| Článek | 118 | totéž; všech 118 obsahuje NewsArticle |
| Rozcestník témat | 1 | totéž |
| Tématický hub | 7 | totéž |
| Další stránky témat | 4 | totéž; každá strana vlastní canonical |
| O nás | 1 | totéž; AboutPage + Organization/Person |
| GDPR | 1 | totéž; WebPage |
| **Celkem** | **141** | **141/141 prošlo** |

Lokální dist obsahuje **144 HTML souborů**, nikoli 144 sitemap stránek: navíc `404.html` (noindex, bez canonical), `vitej/index.html` (noindex, self-canonical) a `googlecc970d81245c4afb.html` (ověřovací soubor). Jejich absence v sitemap je očekávaná; `/vitej/` nebylo samostatně živě procházeno. Důkazy: `dist-html-inventory.json`, `dist-excluded-meta.json`.

Přesný title, jeho délka, description a její délka, canonical, robots, jazyk, počet H1, typy schémat a odkazové počty pro **každou jednotlivou URL včetně všech 118 článků** jsou v `metadata-all.csv`; kompletní OG/Twitter a nadpisy jsou v per-page JSON.

- Chybějící nebo násobný title: **0/141**. Chybějící description: **0/141**. Duplicitní title/description: **0/141** (přesná shoda textu).
- Ne-self-canonical nebo chybějící canonical: **0/141**. `noindex` v meta či X-Robots-Tag: **0/141**. `lang=cs`: **141/141**.
- Právě jeden H1: **141/141**. OG title/description/url/image/type a Twitter card/title/description/image vyplněny **141/141**.
- Title nad 60 znaků: **100/141**; samo o sobě to NENÍ chyba ani pevný Google limit. Automaticky nezkracovat kompletní redakční titulky.
- Description pod 70 znaků: **10/141**, z toho šest článků a čtyři témata. Obsahově konkrétní věty, nikoli prázdná metadata; jen heuristický seznam pro případnou redakční revizi, ne plošný backlog. Například Gemini 3.8: „Google vypustil Gemini 3.8 Flash a variantu Cyber.“

## Crawlability, robots, sitemap, RSS, 404 a redirecty

- `robots.txt` HTTP 200, `User-agent: *`, `Allow: /`, jediný zákaz `/cdn-cgi/`, odkaz na správný `sitemap-index.xml`. Publikovaný obsah není robots.txt blokován.
- XML index + sitemap validně parsovány; **141/141** URL má `lastmod`, **141/141** směřuje na načtenou indexovatelnou self-canonical stránku. Sitemap nemá 404 ani feed.
- RSS HTTP 200, validní XML, **50/50** unikátních položek s title/link/pubDate/content:encoded a URL v sitemap. Limit 50 je výslovná implementace `src/pages/rss.xml.js:10–12`, nikoli ztracených 68 článků. Discovery RSS v head je **141/141**.
- Náhodná neexistující `/audit-nonexistent-20260919/`: skutečné **404**, `noindex, follow`, bez canonical — nikoli soft 404.
- `www` → bez www **301**, URL bez trailing slash `/clanky` a `/o-nas` → canonical **308**. `/sitemap.xml`, `/feed`, `/clanky/strana/1/`, `/temata/ai-report/strana/1/` a starý slug `gemini-notebook-external-sharing-admin` mají **301** v jednom serverovém skoku na finální 200.
- Chrome u HTTP homepage zaznamenal **307 → HTTPS 200**. Browser/HSTS může vyvolat interní upgrade: toto není důkaz serverového HTTP statusu ani důvod měnit CF nastavení.
- Z celého crawlu byly nalezeny pouze **7** unikátních interních href mimo přesné sitemap URL, všechny jsou archivní filtry `?kat=...`; všechny načteny 200 a canonical správně na `/clanky/`. Nejsou další rozbité odkazované HTML cíle v tomto rozsahu. Kontrola neověřuje každý fragment/kotvu ani externí odkazy.

Důkazy: `transport.json`, `redirects-and-outside-links.json`, `final-checks.json`, source `public/robots.txt`, `public/_redirects`, `src/pages/rss.xml.js`.

## JSON-LD: syntaktická, strukturální a částečná sémantická kontrola

**0 chyb JSON.parse.** Auditní kontrolní profil ověřil neprázdné klíče: NewsArticle/Article headline/image/datePublished/author (u NewsArticle také dateModified/publisher/mainEntityOfPage); VideoObject name/thumbnailUrl/uploadDate; BreadcrumbList itemListElement; Organization/Person name. Jde o auditní profil, nikoli tvrzení, že Google všechny tyto položky požaduje jako povinné. U VideoObject odpovídá minimální trojice povinným vlastnostem Google; u článků je část vlastností doporučená.

| Typ | Stránky s typem / 141 | Počet objektů v celém crawlu |
|---|---:|---:|
| NewsArticle | 118 | 118 |
| Article (doslovně) | 0 | 0 |
| VideoObject | 14 | 14 |
| BreadcrumbList | 140 | 140 |
| Organization (včetně nested publisher) | 120 | 134 |
| Person (včetně nested author/founder) | 119 | 240 |

NewsArticle je odpovídající konkrétnější typ článku; nepřítomnost doslovného Article není závada. Breadcrumb není na homepage, proto 140/141 není chybějící implementace. Další typy: CollectionPage/ItemList 20 stránek, AudioObject 118 článků.

U všech 118 článků kontrolovány syntakticky platné datumy, dateModified ne starší než datePublished, mainEntityOfPage = URL a struktura breadcrumb položek name/item/position. U 14 videí kontrolovány ID proti fasádě, embedUrl, contentUrl, description a duration. **Povinné pole VideoObject nechybí 0/14; doporučená duration chybí 1/14**, `/clanky/starlink-v-cesku-pruvodce/`. U všech 14 uploadDate vychází z data článku: datum skutečného vydání YouTube videa nebylo externě ověřeno; proto netvrdíme, že je chybné.

**Potvrzená sémantická chyba: 14/14 VideoObject má `contentUrl=https://www.youtube.com/watch?v=...`, tedy HTML watch stránku, ne adresu video souboru.** Google u contentUrl výslovně požaduje „actual content bytes“ a zakazuje link na stránku, kde video žije. Správný `embedUrl` již přítomen je. Náprava po schválení: pokud není legitimní stabilní přímý video soubor, neuvádět zavádějící optional contentUrl; zachovat embedUrl a běžný viditelný odkaz na YouTube. Nestahovat/nehostovat video jen kvůli tomuto poli.

Důkazy: `schema-checks.json`, `semantic-checks.json`, `video-contenturl-checks.json`, source `src/pages/clanky/[...id].astro:106–121`, `google-video-guidance.md`; autoritativní pravidlo: https://developers.google.com/search/docs/appearance/structured-data/video . Toto **není certifikace rich results ani garance video indexace**; vhodnost watch-page, skutečné upload datum, dostupnost náhledu Googlu a Googlebot fetch videa nebyly potvrzeny.

## Články, videa a CTA — přesné průniky

- **118/118** publikovaných článků odpovídá 118 source markdown souborům a 118 NewsArticle.
- **14/118** má vlastní YouTube `video:` ve frontmatteru. Všech **14/14** má YouTube fasádu (`data-youtube-facade`), VideoObject a channel CTA v author-boxu. Průnik **embed/fasáda + VideoObject + CTA = 14/14 video článků, resp. 14/118 všech článků**.
- Channel CTA v author-boxu je **118/118**, nikoli pouze obecný link v globální navigaci. Přítomnost CTA neznamená měření kliknutí/konverze.
- **11/118** má X `xPosts`, žádný zároveň vlastní YouTube `video:`. Sjednocení YouTube nebo X asociace je **25/118**. X post může být i jiný než video; těchto 11 nelze bez kontroly médií přejmenovat na „11 dalších video článků“ ani jim automaticky přidat VideoObject.
- Embed měřen jako existující lazy YouTube fasáda a odpovídající embedUrl, nikoli iframe přítomný ihned nebo otestované přehrávání. Nepřítomnost okamžitého iframe je zamýšlená lazy implementace.

Důkazy: `content-inventory.json`, `additional-summary.json`, `pages/*.json`, source `src/pages/clanky/[...id].astro:260–300,422–434`.

## Celowebový graf a kontextové odkazy

Graf pracuje s unikátními interními cílovými URL, odstraněnými fragmenty/query a bez self-linků. Rozlišuje **všechny `<a>` v dokumentu** (včetně navigace, karet, doporučení a chronologických odkazů) od **odkazů uvnitř `.article-body`**. Body metrika zahrnuje ručně vložené redakční odkazy/sekce souvisejícího čtení v textu, nikoli automatická doporučení pod/vedle článku. Odkazy na externí zdroje se do interního počtu nepřičítají.

| Metrika | Výsledek |
|---|---:|
| Sitemap stránky bez příchozího odkazu z jiného sitemap dokumentu | **0/141** |
| Nedosažitelné z homepage přes HTML odkazy | **0/141** |
| Články s alespoň třemi různými interními cíli v celém dokumentu | **118/118** |
| Články s alespoň třemi různými interními cíli v textu | **8/118** |
| Totéž při omezení cílů pouze na jiné články | **8/118** |
| Články s méně než třemi různými interními cíli v textu | **110/118** |
| Články s nulovým odchozím interním odkazem v textu | **21/118** |
| Články bez příchozího odkazu z textu jiného článku | **53/118** |
| Články v nejkratší vzdálenosti přes 3 kliky od homepage | **6/118**, každý 4 kliky |

**53 kontextově izolovaných článků nejsou skuteční sirotci webu.** Nula orphanů v celém grafu nesmí maskovat slabší redakční propojení. Požadavek ≥3 je zde auditní/redakční cíl, nikoli zákon Google; nedoplňovat nesouvisející odkazy jen na kvótu.

Konkrétní příklady nulového odchozího propojení: `anthropic-insights-250-tisic`, `apple-openai-schema-agent`, `claude-cowork-docs-slides-checklist`, `openai-agents-api-harness`. Přesné seznamy všech 21/53/110 v `summary.json`; matice obou grafů v `graph.json`, článek-po-článku metriky v `metadata-all.csv`.

Šest článků ve vzdálenosti 4: `glm-5-3-kybernalezy`, `meta-muse-instagram-fotky`, `chatgpt-zdarma-neomezene-chaty`, `gemini-mac-hlasove-ovladani`, `google-earth-nano-banana`, `claude-vodoznak-ai-text`. Nejhlubší archivní stránka je `/clanky/strana/8/` ve vzdálenosti 8; to není osm kliků pro všechny její články, protože témata a ostatní odkazy poskytují kratší cesty.

## Obsahové heuristiky a nadpisy

- Počet slov textu článku podle whitespace: **303–1574**, **0/118** pod orientační hranicí 300. Není to důkaz kvality ani důvod prodlužovat krátkou zprávu. Body obsahuje též titulky tabulek, zdrojové poznámky a X fallback text; nejde o lingvistickou tokenizaci.
- Near-duplicate heuristika: Jaccard množiny slov ≥0,65 nad všemi dvojicemi textů: **žádný pár**. Není to plagiátorský test, sémantická deduplikace ani důkaz absence keyword cannibalization. Přesné title/description duplicity nebyly nalezeny.
- **3/118 článků** začínají v těle H3 po H1 bez předchozího H2: `chatgpt-ve-wordu-zdarma-checklist-osvc`, `claude-cowork-docs-slides-checklist`, `openai-misalignment-reports-pet-pravidel-agenti`. Globální H2 z navigace nebo automatického obsahu nepovažujeme za nadřazený nadpis těla. Malá informačně-architektonická/a11y vada, nikoli kritický indexační blocker.

Důkazy: `additional-summary.json` (`headingBodySkips`), `summary.json`, `details.py`, `aggregate.py`.

## Seřazené závěry pro BACKLOG — implementace až po schválení

1. **P2 / potvrzená chyba / malý rozsah: VideoObject.contentUrl ve 14/14 videích.** Opravit význam optional pole, zachovat embedUrl. AC: 14/14 stále name/thumbnailUrl/uploadDate/embedUrl + odpovídající facade ID, žádný contentUrl ukazující na HTML watch stránku; všechny existující URL beze změny. Důkaz výše.
2. **P2 / redakční zlepšení / postupné dávky: kontextové propojení.** Prioritně 21 článků bez odchozího interního odkazu a 53 bez kontextového příchozího odkazu; pracovat jen tam, kde je tematická relevance, preferovat také šest článků ve vzdálenosti 4. AC: u schválené dávky ručně ověřené relevantní anchor texty a nový report obou grafů; nesplnit cíl pouze nav/related blokem. Žádný automatický zásah do všech 110 článků.
3. **P3 / potvrzená struktura / malý rozsah: H1→H3 v 3 článcích.** Po schválení upravit hierarchii existujících sekcí, nikoli přepis obsahu. AC: body nadpisy neskáčou z H1 na H3; title/H1/URL a obsah sekcí zachovány.
4. **P3 / volitelná úplnost: duration u 1/14 videí.** Jen pokud lze délku ověřit z důvěryhodného zdroje. AC: správná ISO 8601 délka; není blocker rich results a nevymýšlet číslo. UploadDate všech 14 je samostatná neověřená skutečnost, ne potvrzená chyba.

**Žádný prokázaný P0/P1 indexační blocker.** Nedoporučujeme znovu opravovat metadata, canonical, chybějící schema, 404, RSS ani channel CTA, které tato aktuální verze již má. Nenavrhovat placené nástroje, nové trackery nebo CF změny na základě tohoto auditu.
