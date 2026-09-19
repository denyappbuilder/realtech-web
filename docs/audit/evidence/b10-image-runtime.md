# B10 — nezávislá kontrola image/srcset

**Závěr:** nullable typy samy o sobě neprokazují rozbitý runtime. `image` je skutečně volitelné; absence obrázku a absence derivátů mají existující fallbacky a renderovací guardy. B10 má opravit popis/narrowing typů, nikoli měnit tuto politiku. Dva odlišné existující okrajové problémy níže patří do B06.

## Rozsah a ověření

Pouze zdroje přes `git show 061540c3f4ac7de31dcdca90a5894a48044bde8a:<path>`; živé editace implementátora nebyly použity. Bez změn repozitáře, instalací, commitů, síťových požadavků či čtení secrets.

Spuštěno mimo repo:

```sh
node /Users/realtech/.hermes/state/realtech-b10-20260919/image-runtime-check.mjs
```

Exit 0, **8 skupin boundary assertions PASS**. Harness načítá původní helpery přímo z baseline, homepage vyhodnocuje z přesného úseku ř. 53–77; existence souborů je řízený testovací vstup. Testuje chybějící image, video fallback, JPG bez derivátů, null srcset, kompletní WebP, neexistující deklarovaný soubor s/bez videa a PNG. Jde o deterministický JS test, ne prohlížečový/HTTP test.

Cílený scan jednořádkových `image:` ve frontmatteru baseline proti `git ls-tree` nenašel chybějící image, chybějící odkazovaný soubor ani jinou příponu než `.jpg`. Není to validace dekódování obrázků ani dostupnosti webu; reprodukované okraje níže nejsou doloženou vadou aktuálně publikovaných dat.

## Existující kontrakty a guardy

- **Schema:** `src/content.config.ts:78`: `image: z.string().optional()`. Vynechání je legální, explicitní `null` schema nepovoluje; samotné schema neověřuje existenci souboru ani příponu. Helpery navíc výslovně přijímají `null`.
- **Homepage:** `index.astro:58`: `Boolean(hero?.data.image && fs.existsSync(\`public${hero.data.image}\`))`. Pokud je alias true, `hero` i `image` již runtime existují; `.replace()` na ř. 63/67 není dosažitelné s `undefined`. Obdobně `heroHasWebp = Boolean(heroWebp && fs.existsSync(...))` (69) zaručuje truthy `heroWebp`. Typový checker ale nemusí tuto vazbu přes `Boolean(...)` zachovat. Guard `hero && (` (172) obaluje hero a `heroThumb && (` (214) obaluje `<picture>`; `heroPreload && (` (156) obaluje preload. Žádný článek / článek bez image a videa tedy nevede k renderu `<img src=undefined>`.
- **Detail:** `hero-obrazek.js:33–42`: `if (!image)` vrací YouTube URL, pokud je `videoId`, jinak `src` i `lcpSrc: undefined`. `src/pages/clanky/[...id].astro:250` používá `!videoId && heroSrc`; video fasáda má vlastní `heroSrc && (` na ř. 272. Bez zdroje se obrázek nevykreslí. WebP vzniká jen pro `.jpg`; `hasWebp && hasWebpSmall` (55) chrání volání helperu.
- **Karta/rail:** `karta-nahled.js:119–128` při `!image` vrací `localThumb: undefined`, `hasLocalThumb: false`, `hasWebp: false`; `lcpSrc` zde vůbec není. To je legitimní absence, nikoli nutně chyba. `ArticleCard.astro:56–62` řeší YouTube fallback a `thumbUrl && (` (76) chrání `<picture>`. `nahledRailu` pouští lokální zdroj jen přes `if (nahled.hasLocalThumb)` (85), jinak YouTube, nebo `if (!videoId) return null` (95). Homepage rail vykresluje obrázek pouze při `nahled && (` (239).
- **Srcset:** `webpSrcsetZDerivatu` má výslovně návrat `string | null` (30); ř. 33 odmítá prázdnou/ne-WebP cestu, ř. 36 vrací null při chybějícím 640/full derivátu. Chybějící 960 jen vynechá kandidáta. Null zde znamená „bez responsive sady“, nikoli rozbitý zdroj.
- **Preload:** `hero-preload.js:29`: `if (!src) return null`; dále precedence `webpSrcset && webp` → `webp` → `srcset` → samotné `src`. Vstupní JSDoc pro `srcset`/`webpSrcset` povoluje jen `string | undefined`, ale producenti legitimně vracejí také null. Test potvrdil bezpečný single-URL fallback pro null. To je nesoulad deklarovaného typu s již podporovaným runtime. Samotné `webp` bez `src` záměrně preload nevytvoří.

## B06 — reprodukované existující okraje, v B10 neměnit

1. **Deklarované image míří na neexistující soubor:** detail `heroObrazekClanku` při truthy image neověřuje originál a nepadá na YouTube ani s platným videem; vrátí chybějící cestu. Homepage i karta bez videa rovněž ponechají truthy chybějící cestu, renderovací guard ji nezachytí. Rail bez souboru a bez videa správně vrátí null; homepage/karta s videem používají YouTube fallback. Jde o skutečně reprodukovanou slabinu pro vadná data, **ne o `image === undefined`**. Síťová 404 nebyla testována; prokázáno je předání neexistující lokální cesty.
2. **Homepage s existujícím PNG:** `.replace(/\.jpg$/, '.webp')` na ř. 67 ponechá PNG; existence PNG pak nastaví `heroHasWebp = true`. Helper vrátí null, ale ř. 217 vytvoří `<source srcset="…png" type="image/webp">` a preload dostane také nesprávný typ. Detail a karta už mají `image.endsWith('.jpg')` guard a tento omyl nedělají. Prokázána je chybná metadata/volba větve, nikoli selhání dekódování v konkrétním prohlížeči. V baseline frontmatteru PNG nalezeno nebylo.

## Úzké doporučení B10

Popsat v typech skutečné sentinelové hodnoty (zejména null u vstupních srcsetů preloadu), zachovat optional image a vracenou absenci náhledu. U aliasů doložit výše uvedené invarianty a provést jen typové narrowing/JSDoc úpravy bez změny větvení. Nenahrazovat `undefined`/`null` prázdným řetězcem, nevyrábět povinný obrázek, nepřidávat nové fallbacky/existence guardy ani potichu neopravovat PNG či broken-path chování. Chybějící obrázek je legitimní stav; truthy cesta na chybějící soubor je jiný problém pro B06.
