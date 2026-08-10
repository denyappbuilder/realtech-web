# REALTVORBA — fronta práce

## Připraveno k práci

### Validace frontmatteru: odmítat neplatná data · stav: `volné`

`z.coerce.date()` dnes přijme kalendářně neexistující datum (např.
`2025-02-29`), boolean v povinném `date` i `null` ve volitelném `updated`.

- **Kritérium:** odstranit příslušné `todo` v
  `scripts/test-validate-content.mjs` a spustit
  `node --test --test-name-pattern="kalendářně neplatná data" scripts/test-validate-content.mjs`;
  příkaz skončí s exit kódem 0.

### Validace frontmatteru: odmítat neznámá pole · stav: `volné`

Objektové schéma dnes tiše zahodí neznámé klíče, takže například překlepy
`feature` a `video-length` projdou validací, ale jejich hodnoty se nepoužijí.

- **Kritérium:** odstranit příslušné `todo` v
  `scripts/test-validate-content.mjs` a spustit
  `node --test --test-name-pattern="překlep v názvu volitelného pole" scripts/test-validate-content.mjs`;
  příkaz skončí s exit kódem 0.
