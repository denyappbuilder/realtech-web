# Infrastruktura a kvalita — měření 19. 9. 2026

Výchozí repo `061540c3f4ac7de31dcdca90a5894a48044bde8a` (zahrnuje PR #470/#471). Produkční homepage vrací HTTP 200 a má shodný SHA256 odpovědi jako konkrétní deployment `01da21f3.realtech-web.pages.dev` při kontrolním načtení; `infra/headers.json`. Žádné přenesené výsledky z předchozího kola #469.

## Skutečně spuštěné kontroly
- Node 22.23.1, npm 10.9.8, Astro 7.3.3; `npm ci` instaloval existující lock beze změny sledovaných souborů.
- `npm run build` PASS. 118 článků ověřeno, 118 coverů, 0 aktualizovaných derivátů/OG. **Existující obsahové varování:** `chatgpt-ve-wordu-zdarma-checklist-osvc`: sekce jsou jen `###` bez `##` (gates/build.log:5). Build tedy není bez varování.
- Testy PŘED buildem: 1041 celkem, 1034 PASS, 0 FAIL, 1 SKIP chybějící dist, 6 TODO. Opakování PO buildu: **1035 PASS, 0 FAIL, 0 SKIP, 6 TODO** (`postbuild-gates/gates.json`). Experimentální Node MockTimers warning v testech není build warning.
- `npm audit --json`: 0 známých zranitelností ve všech závažnostech v okamžiku auditu; nikoli obecné potvrzení bezpečnosti.
- **Typecheck není funkční brána.** `npx --no-install astro check` požaduje chybějící `@astrojs/check`; instalace odmítnuta, source/lock nezměněny. CLI paradoxně vrací 0, ale vytiskne `[ERROR] [check] ... required`. Nelze hlásit PASS. `npx --no-install tsc --noEmit` končí 1 a zobrazí help: v repu chybí `tsconfig.json`. TypeScript 5.9.3 přítomen. První chybná diagnostická cesta `astro/astro.js` byla opravena na oficiální `npx astro check`, nikoli interpretována jako vada webu.
- CI `.github/workflows/npm-test.yml:21–23` spouští npm ci → test → build; nikoli astro check. Aktuální baseline GitHub test i Pages check SUCCESS.
- Schéma kolekce striktní Zod, validuje date/updated, kategoriální enum, audio/X atributy. Video zatím obecné URL, runtime youtubeId() odmítá cizí hosty/neplatné ID. Zda mezi současnými články existuje neplatná hodnota, vyhodnocuje SEO inventář; samotná mezera ve schématu není důkaz rozbitého článku.

## IndexNow — doložená mezera v automatizaci
`.github/workflows/indexnow-after-deploy.yml` naslouchá pouze `deployment_status`, navíc přesné environment `Production`. GitHub workflow je active od 9. 8. 2026, ale API workflow runs vrací `total_count:0`; alternativní `gh run list --workflow ...` také []. API repozitářových deployments vrací []. Pages přitom publikuje úspěšné **check-runs** (aktuální SHA potvrzeno). Není doložen jediný běh této automatické cesty. Neznamená to neexistující indexaci ani vyloučení ručního oznámení jinou cestou.
Návrh: po schválení opravit spouštěcí integraci přes skutečný signál úspěšného produkčního nasazení a exact SHA/host guard; ne oznamovat URL před deployem. V auditu nebyl žádný IndexNow POST odeslán.
Šest původních TODO testů v `scripts/indexnow.mjs` pokrývá XML entity/whitespace, absolutní URL a validní kratší/velkopísmenné klíče. Jde o hraniční vstupy, ne prokázané nefunkční URL nynější sitemapy. Opravit parser/validaci v rámci samostatné oblasti, stávající klíč neměnit.

## Hlavičky a cache (živé HTTP odpovědi v Chrome)
- Homepage i `/clanky/?q=Starlink`: CSP, nosniff, DENY, strict-origin-when-cross-origin, Permissions-Policy camera/microphone/geolocation prázdné, HSTS 31536000+includeSubDomains.
- HTML Brotli, `public,max-age=0,must-revalidate`; měřená odpověď CF DYNAMIC není sama o sobě problém latence ani důkaz vypnutého CDN.
- Hashované CSS i JS `/_astro/`: Brotli, `public,max-age=31536000,immutable`, CF HIT.
- Obrázek `/images/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc.webp`: image/webp; živá hlavička `max-age=14400,must-revalidate`, zatímco `public/_headers:13` žádá max-age=0. Přesný původ odlišnosti bez čtení konfigurace účtu **neověřen**. Neměnit CF účet. Prověřit při příští výměně obrázku se stejnou URL a podle potřeby řešit verzovanou asset URL v kódu po schválení; nemění URL článku.
- CSP má `unsafe-inline` u script/style, ale také object-src none, base-uri self, frame-ancestors none a explicitní seznam externích originů. Zpřísnění by vyžadovalo inventář inline skriptů/hashů a test theme/search/JSON-LD/embeds. Neprokazuje exploataci; jde o defense-in-depth s vyšším rizikem regrese, nikoli hlavní SEO prioritu.
- Produkce nemá X-Robots-Tag noindex; immutable Pages preview jej správně má.

## Závislosti, hydratace, mrtvý kód
`npm outdated --json` uvádí **8 přímých balíčků** s novější registry verzí: compiler 2.13.1→4.0.0; sitemap 3.7.3→3.7.4; Archivo 5.2.8→5.3.0; Plex Mono 5.2.7→5.3.0; Plex Sans 5.2.8→5.3.0; js-yaml 4.3.2→5.4.2; marked 18.0.6→18.0.13; TypeScript 5.9.3→7.0.2. Bez auditu changelogů nejde o doporučení hromadné aktualizace; major/compiler/font změny nesou riziko a nemají automaticky měřitelný uživatelský přínos. Astro není v outdated výpisu; manifest/lock/runtime 7.3.3. `.npmrc` engine-strict=true.
Statický inventář src: **0 client:load/idle/visible/media/only direktiv**, **0 importů astro:assets**. To není vada: statické Astro + vlastní Sharp build pipeline vytváří 640/960/full WebP a 640 JPEG; existující obrázky beze změny. Smysl migrace na astro:assets není doložen.
Všech 6 komponent `src/components/*.astro` má skutečné použití v page/layout/component importech; žádná není kandidátem na smazání jen podle názvu. Sdílené ArticleArchivePage/TemaPage mohou mít příbuznou markup strukturu, ale plná sémantická duplicitnost ani bezpečně odstranitelný JS/CSS nebyly prokázány. Nepovažovat coverage jediného viewportu za mrtvý kód; žádný kód nemazán.

## Důkazy
`infra/{headers.json,source-inventory.json,outdated.log,astro-check.log,tsc.log,indexnow-runs.json,workflow.json,deployments.json}`; `gates/build.log`, `postbuild-gates/{gates.json,tests.log,audit.log}`.
Oficiální vysvětlení typechecku: https://docs.astro.build/en/guides/typescript/ — astro build netypecheckuje .astro komponenty.
