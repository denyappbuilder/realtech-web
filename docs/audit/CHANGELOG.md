# Audit — implementační evidence

## B05 — lokálně ověřeno 19. 9. 2026, před nezávislým review / commit / PR

Baseline `dd9ad4ecfc6d85bb902dfae9352f5ef0c9224316`, samostatná větev `improve/indexnow`. B02/#474 nebylo do tohoto stromu převzato. Žádný commit, push, PR, merge, deploy ani živý IndexNow POST touto prací.

- Náhrada nefunkčního `deployment_status` scheduling za ověřený `npm test` workflow_run z main push: explicitní read-only práva, živá identita run/repo/workflow, current-main equality, checkout exact SHA bez persistent credentials. Žádný checkout PR/fork head ani stažení jeho artifactů.
- Skutečný trusted Cloudflare check (app/account/project/repo/full SHA) → marker na jeho immutable URL → nezávislý marker produkce → SHA-256 skutečných produkčních sitemap bytes. Final main/check/suite/production-marker recheck před **každou** dávkou. Stejné SHA samo nestačí; check-suite branch není důkaz produkce. Host se neodvozuje z UUID prefixu.
- Marker vzniká po Astro buildu v existujícím build příkazu jen z platformových `CF_PAGES*`; žádné nastavení dashboard/env/secrets. Kontrola Git HEAD, odstranění stale markeru, bez metadat lokálně žádný marker. Veřejný nový asset `/indexnow-deployment.json` není v sitemapě/nav/IndexNow URL.
- Oznamuje se **celá validovaná produkční sitemap**, nikoli pouze změněné URL; dávky maximálně 10 000. Stávající veřejný klíč beze změny. XML entity/whitespace a canonical HTTPS URL validace, všech šest původních TODO nyní PASS (RED: 6 skutečných selhání).
- Limity: 10 minut na ověření, nejvýše 30 poll průchodů, bounded GET/POST timeouty i stream sizes, nonredirecting reads, odmítnutí stale/cache ambiguity. Nenastane-li ověřená produkce v limitu, **ZERO POST, nonzero exit / workflow FAIL**, žádný success fallback či cleanup deploy. Skutečně spuštěné offline dry-runy production vs preview a CLI timeout jsou v samostatném logu. Fake HTTP fixtures nejsou reálný CF preview.
- Review-fix 1: původní security review FAIL je zachován; nový frozen patch čeká na opakované nezávislé review. Tokenizace odmítá komentáře uvnitř tagů/entity a zakázané `]]>` v character data; fatální UTF-8 dekódování raw bytes také v manuálním CLI zabrání náhradě neplatných bajtů za U+FFFD. Přesné review repro testy nejprve RED (mocked POST=1), nyní GREEN (reject, POST=0); zachován legitimní BOM/Unicode/entity/comment behavior. Nová evidence: `B05/fix1/`, původní `implementation/` beze změny.
- Finální lokální suite po fix1: **1137 PASS / 0 FAIL / 0 SKIP / 0 TODO**; řádná baseline s existujícím dist: **1036 PASS / 6 TODO**. Check před/po: **0 errors / 0 warnings / 35 shodných hintů**. Buildy včetně hooku PASS. Původní Word H3 prebuild warning zůstává pro B02. První baseline test bez dist měl jeden skip; izolovaný archive-only pokus měl Git-context failure. Oba jsou zachovány jako mezikroky, autoritativní baseline je `baseline-final-tests.log` z detached worktree stejného SHA s původním dist.
- Úplný dist: lokálně **1012 → 1012**, všech **144 HTML byte-identických**, pouze `rss.xml/lastBuildDate` clock. Samostatný **OFFLINE fixture build** s test-only subprocess metadaty: **1012 → 1013**, jediný nový soubor marker; všechny existující HTML opět identické, jediná další změna RSS clock. Poslední běžný build marker znovu bezpečně odstranil. Žádný fixture marker není commitnut nebo vydáván za platformovou evidenci.
- Podrobný trust model, omezení cache/final-read race, bounds, manuální dry-run a přesný první schválený live-deploy runbook: [INDEXNOW.md](INDEXNOW.md). Před publikací nelze ověřit skutečný CF build hook/metadata a jejich shodu; před schváleným produkčním deployem nelze doložit produkční identitu ani skutečnou HTTP 200/202. Tyto gate vlastní parent. HTTP acceptance není důkaz indexace.
- Evidence: `/Users/realtech/.hermes/state/realtech-batch2-20260919/B05/implementation/` — `ready.patch`, `ready-source/`, `ready.json`, `static-scan.json`, `dist-comparison.json`, `hint-parity.json`, všechny test/check/build/dry-run logy a úplné dist snapshoty. Historický broad STOP v `B05/BLOCKER.md` je nahrazen plným `blocker-assessment.md`; důvodné preview/race warningy zůstávají, původní důkazy se nemažou.
- Pořadí dávky **B01 → B02 → B05 → B06 → B07**; parent začlení #474 až po připravení B05 PR/preview, před B06. B05 zůstává na výše uvedené baseline; další větve až z aktuálního main. Sdílený CHANGELOG zachovat při integraci, B06 může sdílet prebuild/build pipeline a B07 mění HTML — jejich parity nevydávat za B05 parity. B05 nemění šablony/obsah ani B06/B07 funkce. Při případném rebase znovu ověřit exact source/SHA. Nezávislé review této frozen revize ještě není hotové.

## B02 — lokálně ověřeno 19. 9. 2026, před nezávislým review / commit / PR

Baseline čerstvě fetchnutého `origin/main`: `e271a9979b2e587b2191287a00f9c7b93e7ed9bd`, izolovaná větev `improve/heading-structure`. B01 (`a50d28ebab17b7f28ebdbb530fff1dc91afa4029`) není součástí této větve.

- Pouze 19 prefixů `###` → `##`: Word 8, Claude Cowork 5, OpenAI misalignment 6. Existující `## Zdroje` zůstávají. Veškeré ostatní bytes článků včetně frontmatter, textu, faktů a pořadí jsou shodné.
- `scripts/test-b02-heading-structure.mjs`: skutečný RED 3 selhání na původních H3, GREEN 3 PASS. Ověřuje skutečné Markdown heading tokeny a výslednou osnovu všech tří článků.
- `npm run check` i `npm run build` před/po exit 0; 0 errors, 0 warnings, stejných 35 hintů (identity soubor/kód/zpráva). `npm test`: 1036 → 1039 PASS, 0 FAIL, původních 6 TODO. Žádná oprava ani potlačení hintů. Existující Node test-runner warning je zachován.
- Word prebuild warning zmizel opravou obsahu, nikoli změnou či oslabením `scripts/validate-content.mjs`; validátor zůstává byte-identický.

### Úplné dist srovnání a důsledky osnovy

Oba skutečné snapshoty mají 1012 souborů, z toho 144 HTML; 1008 souborů byte-identických. Přesný allowlist transformací vysvětluje všechny 4 změněné soubory, žádná obecná normalizace HTML:

- Word HTML: pouze 8 párů H3 → H2. Osnova beze změny díky existující relativní hloubce.
- Claude HTML: 5 párů H3 → H2 a odstranění 10 `contents-subsection` tříd (5 v mobilní + 5 v desktop osnově).
- OpenAI HTML: 6 párů H3 → H2 a odstranění 12 stejných tříd (6 + 6). Jde o záměrné odstranění falešného odsazení podsekcí; nezměněné `Zdroje` už nejsou jedinou vrcholovou položkou.
- RSS: stejných 19 párů escapovaných heading tagů ve třech odpovídajících položkách a pouze `lastBuildDate` 08:40:52 → 08:42:51 GMT. Ostatní bytes feedu shodné.

Všechna ID a href v dotčených HTML jsou v původním pořadí byte-identická; každý cíl osnovy existuje právě jednou. Počet i text odkazů a sekcí zůstávají. Stávající navigace, kopírování kotev a reading progress vybírají společně `.article-body h2, .article-body h3`, tedy stejnou množinu v témže pořadí. JS/CSS, URL i navigační logika jsou byte-identické. Nadpisy nyní přirozeně používají existující H2 typografii; tím se mohou změnit výšky a scroll pozice, nikoli cíle či pravidla navigace. Toto není tvrzení o pixelové paritě ani nové browser QA.

Evidence mimo repo: `/Users/realtech/.hermes/state/realtech-batch2-20260919/B02/` — úplné before/after dist, manifesty, check/build/test logy, `red.log`, `green.log`, reprodukovatelný `compare.py`, `dist-comparison.json`, `hint-parity.json` a zmrazené ready artefakty. Nezávislé review zadává parent; žádný commit/push/PR/merge touto implementací.

Překryvy a pořadí: viz dodatek B02 v BACKLOG.md; **B01 → B02 → B05 → B06 → B07**. Každá větev samostatně z main, žádné přebírání B01 patche.


## B01 — lokálně ověřeno 19. 9. 2026, čeká na nezávislé review před commitem

Baseline aktuálního main `e271a9979b2e587b2191287a00f9c7b93e7ed9bd`, izolovaná větev `improve/video-schema`.

- Odstraněno pouze nepovinné `VideoObject.contentUrl`: YouTube watch HTML není přímý soubor videa. Žádné rehostování, změna video metadat ani článkových URL; `embedUrl`, fasáda a viditelné odkazy beze změny.
- Dvě existující regression assertions nyní vyžadují nepřítomnost pole, včetně videa bez platné délky. RED: oba testy skutečně selhaly na přítomném `contentUrl`; GREEN: celá suite 1036 PASS, 0 FAIL, 0 SKIP, 6 původních IndexNow TODO, stejně jako baseline.
- Před i po: `npm run check` 0 errors / 0 warnings / 35 hints; identita všech hintů shodná. `npm run build` exit 0, původní obsahové varování Word H3 ponecháno pro B02. Žádné nové warnings.
- Úplné dist snapshoty: 1012 → 1012 souborů, 144 HTML. 997 souborů byte-identických; 14 HTML se liší výhradně odstraněním jediného contentUrl, zbývající bytes včetně fasády, CTA, kotev a ostatních schema shodné. Poslední změna je pouze `rss.xml/lastBuildDate` (automatický čas buildu); přesné hodnoty v JSON evidenci.
- Úplná offline validace renderovaného JSON-LD: 14 → 0 watch HTML contentUrl; všech 14 VideoObject zachovává name, description, thumbnailUrl, uploadDate, embedUrl a publisher. To není externí Rich Results certifikace; externí validátor a immutable preview čekají na publikaci exact SHA po nezávislém review.
- Evidence mimo repo: `/Users/realtech/.hermes/state/realtech-batch2-20260919/B01/` (`before/after-*.log`, `before/after-dist/`, `before/after-manifest.json`, `red-schema-red.log`, `dist-comparison.json`, `hint-parity.json`).
- Merge pořadí schválené dávky B01 → B02 → B05 → B06 → B07. Každá větev z aktuálního main, nikoli stacked. Sdílený `docs/audit/CHANGELOG.md` vyžaduje při pozdější integraci zachovat všechny záznamy; B06 může sdílet šablonu detailu, ale tato oprava je pouze odstranění pole schema. Žádný merge touto evidencí není autorizován.


## B10 — lokálně ověřeno 19. 9. 2026, před commit/PR

Baseline `061540c3f4ac7de31dcdca90a5894a48044bde8a`, větev `improve/typecheck`.

- Zachována připravená `@astrojs/check` 0.9.10 + lock, `check: astro check` a strict `tsconfig.json`. Build gate `astro check && astro build` patří do **posledního samostatného revertovatelného commitu**.
- Opraveno všech 12 diagnostických errors: explicitní Promise typu indexu, bezpečný null guard SearchModal, typově zúžitelné boolean aliasy obrázků homepage, typ decoderu a videí s predikátem stávajícího RSS filtru; JSDoc preloadu přijímá již podporovaný null srcset. Detail článku není nutné editovat: společný opravený kontrakt odstranil i jeho chybu.
- Žádné nové `any`, `ts-ignore`, `ts-expect-error` ani non-null assertions. Bez změn obsahu, URL politiky, obrázkových fallbacků, privacy nebo features. Jediná zamýšlená změna runtime: klávesa Tab bez overlay už nevyhodí výjimku. Nový regression test nejdříve selhal právě na null `querySelectorAll`, potom prošel. Homepage test loader nyní maže TypeScript typy stejně jako build, bez nové závislosti.

### Skutečné výsledky

| Kontrola | Před | Po |
|---|---|---|
| `npm run check` | exit 1; 12 errors, 0 warnings, 35 hints / 314 souborů | exit 0; 0 errors, 0 warnings, 35 hints / 314 souborů |
| `npm test` | 1035 pass, 0 fail, 6 TODO | 1036 pass, 0 fail, 6 TODO |
| `npm run build` | exit 0 | exit 0, včetně check gate |
| `npm audit --json` | 0 vulnerabilities | 0 vulnerabilities |
| Negativní build probe | — | dočasné přiřazení string do number: exit 1, TS2322, build fáze nespustila; probe přesunut mimo repo, čistý build znovu exit 0 |

Všech 35 hintů má shodnou identitu soubor + kód + zpráva; nejsou opraveny ani potlačeny. CLI některé označuje v řádcích jako warning, ale oficiální souhrn je 0 warnings / 35 hints. Zachován i původní prebuild warning o H3 článku `chatgpt-ve-wordu-zdarma-checklist-osvc` a šest IndexNow TODO. Nový B17 je pouze návrh backlogu.

### Úplné dist srovnání — raw HTML parity NENÍ splněna

Oba úplné snapshoty mají 1012 souborů a 144 HTML souborů (Astro hlásí 143 generovaných stránek).

- 1 HTML je byte-identické; **143 HTML se liší výhradně URL skriptu SearchModal**, hash `DlpD_zYR` → `BMsKkYrw`. Po jediné přesné substituci této URL jsou všechny bytes shodné, včetně homepage videí. To není raw byte-identita ani obecná normalizace HTML. Jde o důsledek výslovně schváleného null guardu; výjimka je transparentně uvedena v PR a musí být posouzena před případným merge.
- Odstraněný `SearchModal.astro_astro_type_script_index_0_lang.DlpD_zYR.js` nahrazuje `SearchModal.astro_astro_type_script_index_0_lang.BMsKkYrw.js`. Jediný rozdíl JS je minifikované `if(!e?.hidden)` → `if(e&&!e.hidden)`, tedy schválený guard.
- `rss.xml`: pouze automatické `lastBuildDate` obou buildů. Úplné datumy a každý změněný soubor jsou uvedeny v JSON srovnání.
- Ostatní soubory, včetně ostatních JS/CSS a obrázků, jsou byte-identické. Žádné nevysvětlené rozdíly; žádná úprava hashů, buildu či outputu pro předstírání parity.

### Obrázky — zjištěné okraje pouze do B06

Nezávislý baseline harness ověřil osm skupin boundary assertions. Optional `undefined` image a null srcset mají bezpečné existující guardy/fallbacky, nejde samo o sobě o chybu runtime. Zvlášť reprodukovány dvě jiné slabiny: truthy cesta na chybějící lokální soubor a homepage PNG omylem označené jako WebP. V baseline jsou deklarované obrázky existující JPG, proto nejde o tvrzení o aktuálně rozbitých publikovaných obrázcích. V B10 se tyto slabiny **neopravují**, viz dodatek B06 v BACKLOG.md.

### Evidence a předání

Úplné lokální logy a snapshoty jsou mimo repo v `/Users/realtech/.hermes/state/realtech-b10-20260919/`: `before-dist/`, `after-dist/`, `before-manifest.json`, `after-manifest.json`, `dist-comparison-final.json`, reprodukovatelný `compare-dist.py`, `check-before.log`, `check-after.log`, `hints-comparison.json`, `build-before.log`, `build-after-final.log`, `tests-before.log`, `tests-final-isolated.log`, `modal-red.log`, `gate-negative.log`, `audit-before.log`, `audit-after.log`, `image-runtime-review.md`.

První plný test po typových anotacích odhalil JS-only homepage loader; opraven jeho testovací transpile krok. Jedna nástrojová dávka překročila timeout při drahém textovém diffu; mezilehlý sdílený test log měl překryv zapisovačů, proto není finálním důkazem. Poslední test běžel po ověření absence dalších test procesů do nového `tests-final-isolated.log`, exit 0.

Původní audit/evidence se nemění: manifest auditu dokládá původní snapshot, nikoli následné změny živého BACKLOG/CHANGELOG. Commitování dokumentační baseline a řešení jejích odkazů vlastní parent. Implementátor předal změny bez commitu. Nezávislé review exact source snapshotu prošlo bez výhrad. Koordinátor provádí oddělené commity a jeden B10 PR s preview; merge ani produkční deploy nejsou povoleny. Žádná další položka B01–B09/B11–B17 nebyla implementována.
