# Audit — implementační evidence

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
