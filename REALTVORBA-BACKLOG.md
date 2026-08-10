# REALTVORBA backlog

## Sitemap má ignorovat neplatné datum ve frontmatteru

`astro.config.mjs` přijme hodnotu odpovídající tvaru `YYYY-MM-DD`, i když nejde
o platné kalendářní datum. Takový článek uloží jako `Invalid Date` a serializace
jeho URL skončí výjimkou místo bezpečného `lastmod`.

Kritérium dokončení: odstranit `todo` z testu „neplatné datum se ignoruje…“ a
ověřit příkazem
`node --test --import ./scripts/test-sitemap-register.mjs scripts/test-sitemap.mjs`,
že soubory bez data a s neplatným datem neovlivní sitemapu a URL článku,
kategorie i statická URL dostanou nejnovější platné datum.

## Sitemap bez platných dat má vynechat lastmod

Pokud žádný článek nemá datum, `Math.max()` vytvoří `-Infinity` a statické URL
pak při serializaci skončí výjimkou `Invalid time value`.

Kritérium dokončení: odstranit `todo` z testu „bez jediného platného data…“ a
ověřit příkazem
`node --test --import ./scripts/test-sitemap-register.mjs scripts/test-sitemap.mjs`,
že serializované položky článku i statické URL vlastnost `lastmod` neobsahují.
