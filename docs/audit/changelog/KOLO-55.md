# Kolo 55 — údržba po kole 54 (Atlas, 26. 9. 2026)

Zadání: Daniel 26. 9. „vylepši a dodělej na webu vše co je potřeba“.
Měřeno na produkci (`249c908`):
- Lighthouse 3× na 8 typech stránek (mobil);
- statický audit všech 158 stránek `dist/`;
- reflow a cíle pod 24 px na 11 stránkách při 320–1280 px;
- kontrast, landmarky a nadpisy ve světlém i tmavém režimu;
- funkční smoke test (hledání, filtr, téma, přepis, kopírování odkazu, bez JS);
- 249 externích odkazů v článcích.

## Výchozí stav (produkce, medián 3 běhů, mobil)
| stránka | perf | a11y | BP | SEO | LCP |
|---|---|---|---|---|---|
| úvodka | 98 | 100 | 100 | 100 | 2,14 s |
| archiv | 99 | 100 | 100 | 100 | 2,10 s |
| článek | 98 | 100 | 100 | 100 | 2,29 s |
| video článek | 97 | 100 | 100 | 100 | 2,55 s |
| téma (Vesmír) | 97 | 100 | 100 | 100 | 2,41 s |
| hub témat | 99 | 100 | 100 | 100 | 2,13 s |
| O nás / Herohero | 99 | 100 | 100 | 100 | 2,11 / 1,91 s |

Statický audit `dist/`: 0 rozbitých interních odkazů, 0 chybějících obrázků, 0 duplicitních title/description, žádný přeskok úrovně nadpisu, reflow bez přetečení na 320–1280 px.

## Opraveno
| # | Vada (měřeno) | Oprava |
|---|---|---|
| 1 | Hledání ⌘K: „dronů“ našlo 1 článek, rubrika Drony chyběla; „raketa“ 3 vs. „raketě“ 6. Kmeny se zkoušely jen při nulovém výsledku. | `SearchModal.astro`: kmenový průchod se použije, když najde víc; přesný tvar slova má vyšší skóre (zůstává nahoře). Slova s číslicí se nekrátí (`gpt-5` nesmí najít GPT-6). |
| 2 | Cíle pod 24 px (WCAG 2.5.8): štítek rubriky v článku („Sítě“ 23 × 44), odkaz „nebo otevřít diskuzi na GitHubu“ 220 × 23 | `redesign.css`: `a.tag { min-width: 44px }`, odkaz v placeholderu komentářů `min-height: 44px` |
| 3 | Meta description témat AI Agenti / Drony / Mobily / Sítě / Vesmír / Hardware měly 53–71 znaků | `tema-popis.js`: 93–117 znaků, jen o to, co články rubriky pokrývají |

## Zkontrolováno, beze změny (a proč)
- `image-delivery-insight` 52–226 KB: Lighthouse emuluje DPR 1,75 → slot 364 px potřebuje 637w; 640w je správně. Deriváty mají jednotnou kvalitu q78, těžší jsou jen detailní fotky.
- `legacy-javascript`, `uses-long-cache-ttl`: beacon Cloudflare (třetí strana) a audio `max-age=14400` (subdoména audia, B09).
- `unused-css-rules` 10–14 KB: jeden sdílený CSS soubor pro všechny typy stránek; dělení by přidalo požadavek (měřeno negativně v kole 19, beasties).
- 57 titulků článků 71–75 znaků: pod limitem 75 z validátoru obsahu; je to redakce Grokbota.
- 6 článků s description pod 70 znaků: obsah Grokbota → předáno v reportu, ne v kódu.
- 28 externích odkazů vrací 401/403 (Reuters, Bloomberg, FT, NYT, The Information, openai.com): paywall a ochrana proti botům, ne mrtvé odkazy.

## Změny testů
Žádný existující assert se nemění. Nové testy: `test-search-modal.mjs` (2 testy, kolo 55), `test-kolo-55.mjs`.
