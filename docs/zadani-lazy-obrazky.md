# Zadání: obrázky bez `loading="lazy"` (položka W1)

**Repo:** `realtech-web` · **větev:** `kepler/lazy-obrazky`

## Co je špatně

Audit 30. 7. našel **34 obrázků bez `loading="lazy"`**. Prohlížeč je tedy stahuje
i tehdy, když jsou daleko pod okrajem obrazovky. Publikum RealTechu čte hlavně
**na mobilu a mobilních datech**, takže je to zbytečně stažených dat.

⚠️ **Nejdřív to číslo ověř sám** na postaveném výstupu (`npm run build`, pak
grep v `dist/`). Audit se dnes už dvakrát spletl v tom, co měřil — když ti vyjde
jiné číslo, napiš to a řiď se tím svým.

## Co udělat

Doplnit `loading="lazy"` tam, kde chybí — **ale ne všude.**

🔴 **První obrázek nad okrajem obrazovky (hero / náhled prvního článku) musí
zůstat bez `lazy`**, jinak se zpomalí to, co divák vidí první (LCP). Rozhodni,
které to jsou, a **napiš do reportu, které jsi vědomě vynechal a proč.**

Zvaž `decoding="async"` a `fetchpriority` u toho hlavního obrázku, když už u toho
budeš — ale jen když to nezkomplikuje šablonu.

## Ověření (na postaveném `dist/`, ne na zdrojácích)

- kolik `<img>` je v `dist/` celkem
- kolik má `loading="lazy"` před opravou a po ní
- kolik je vědomě bez `lazy` a které to jsou
- `npm run build` musí projít (`prebuild` dělá validaci obsahu + obrázky + og)

## Tvrdé zákazy

- 🔴 Nesahej na obsah článků v `src/content/`.
- 🔴 Neměň obrázky samotné ani jejich generování (`scripts/optimize-images.mjs`,
  `generate-og.mjs`).
- 🔴 `git add` **jmenovitě, NIKDY `git add -A`** — v repu mohou ležet netrackované
  soubory, které do commitu nepatří.
- 🔴 `.env` nečti. Nenasazuj. **Nepushuj.**

## Povinné minimum

Doplněné `lazy` mimo první viditelný obrázek + čtyři čísla z `dist/` výše.
