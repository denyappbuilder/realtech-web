# Kolo 57 — hledání s překlepy, „Co se dělo dál“, newsletter, drobnosti (26. 9. 2026)

Zbytek auditů kola 56 + otevřený bod z reportu (překlep na 404 nic nenašel).
Baseline produkce po kole 56: Lighthouse mobil výkon 96–98, a11y/BP/SEO 100.

## Hledání s tolerancí překlepu
- `shodaSPreklepem` (Damerau–Levenshtein, OSA): slovo od 4 znaků smí mít
  1 překlep, od 8 znaků 2; porovnává i se začátkem delšího slova
  (skloňování). Slova s číslicí (gpt-5, m8) bez tolerance.
- Jen **záloha při nule** — přesná shoda (a kmeny v ⌘K) mají přednost,
  „starlink“ dál nenajde „starship“.
- Stejné tělo na edge (`archiv-filtr.js` → `functions/clanky`), v klientu
  archivu a v ⌘K; test hlídá shodu textu.
- Měřeno nad indexem 131 článků: „starlink mini tset“ 0 → 3, „antropic“
  0 → 23, „nvida“ 0 → 5, „pentagom“ 0 → 1; „gpt-6“ beze změny (4).

## „Co se dělo dál“
- Pod textem článku max. 3 **novější** články, které na něj odkazují
  (zpětné odkazy spočítané při buildu, staré texty se nepřepisují).
  Blok má 61 ze 131 článků. Z „Dalších reportů“ se neopakují.

## Newsletter
- První selhání odeslání = chyba u pole (`role=alert`), tlačítko se vrátí;
  dřív catch okamžitě poslal čtenáře na stránku Kitu a tlačítko viselo
  na „Odesílám…“. Druhé selhání → klasický POST na Kit (odběr bez skriptu).

## Design
- Štítky kategorie a datum ve výpisech na mobilu 10,4 → 12 px.
- Hlavička na mobilu: rám jen u „Odebírat“, lupa a režim bez rámu.
- Rytmus sekcí úvodky 88/52 px → 64/48 px (stupnice tokenů).

## Testy
- nový `scripts/test-kolo-57.mjs`; upravené asserty: kolo-29 (únik na Kit
  až při 2. selhání), test-souvisejici + kolo-56 (related bez pokračování).
- plná sada 1313/1313, astro check 0 chyb, build OK.

## Mimo kolo
- Herohero launch 30. 9. — text/ceny/odkaz dodá Daniel.
- 51 článků bez příchozího odkazu, 6 krátkých popisů = brief pro Grokbota.
