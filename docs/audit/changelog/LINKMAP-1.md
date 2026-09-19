# LINKMAP dávka 1 — prvních 10 interních odkazů (19. 9. 2026, dávka 2)

**Stav:** PR, **NEMERGOVAT** (Daniel: „prvních 10 odkazů jako PR s preview,
zbytek po mém schválení“). Jediná položka běhu, která sahá do souborů článků.

## Co se mění
10 odkazů z `docs/audit/LINKMAP.md` (PR #480) v pořadí dokumentu, ve 3 článcích.
Pouze obalení existující fráze `[kotva](/clanky/<cíl>/)` — **žádné slovo,
věta ani URL se nemění** (skript ověřuje, že po odstranění markdown odkazu je
soubor bajt po bajtu shodný s originálem).

| # | Zdroj | Cíl | Kotva |
|---|---|---|---|
| 1 | chatgpt-ads-sponsored-agents-shopify-checklist | chatgpt-reklamy-nove-trhy | další krok u reklam v ChatGPT |
| 2 | chatgpt-ads-sponsored-agents-shopify-checklist | openai-agents-api-harness | sponzorované agenty |
| 3 | chatgpt-ads-sponsored-agents-shopify-checklist | meta-muse-agent-usa | agent placený obchodníkem není nezávislý poradce |
| 4 | chatgpt-ve-wordu-zdarma-checklist-osvc | gpt-5-6-sol-zlevneni | bezplatný náhled modelu GPT-5.6 Sol |
| 5 | chatgpt-ve-wordu-zdarma-checklist-osvc | chatgpt-zdarma-neomezene-chaty | funguje i na účtu zdarma |
| 6 | chatgpt-ve-wordu-zdarma-checklist-osvc | claude-cowork-docs-slides-checklist | První verze nabídky nebo průvodního dopisu |
| 7 | chatgpt-ve-wordu-zdarma-checklist-osvc | openai-misalignment-reports-pet-pravidel-agenti | Fakta a čísla si ověř |
| 8 | claude-cowork-docs-slides-checklist | claude-cowork-sandbox-utek | oddělený prostor pro agentní úkoly |
| 9 | claude-cowork-docs-slides-checklist | claude-code-tydenni-limit-zari | Claude Code zůstává oddělený produkt |
| 10 | claude-cowork-docs-slides-checklist | chatgpt-ve-wordu-zdarma-checklist-osvc | šablony nabídek nebo schvalovací proces |

**Vyřazen** návrh LINKMAP #2 u chatgpt-ads („trhů, kde ChatGPT reklamy
fungují“ → chatgpt-reklamy-nove-trhy): fráze je v článku 2× (ř. 22 a 52),
LINKMAP nespecifikuje kterou; nahrazen dalším v pořadí (claude-cowork #3).
Doporučení k LINKMAP: doplnit u nejednoznačných kotev číslo řádku.

## Pojistky ve skriptu (`/tmp/lh/linkmap-apply.mjs`, jednorázový)
cíl existuje · kotva doslovně v těle právě 1× (ne frontmatter, ne nadpis) ·
ne uvnitř existujícího `[..](..)` · zdroj na cíl dosud neodkazuje · text
beze změny (round-trip).

## Ověření
- `validate-content` 119 OK, build OK, `astro check` v CI.
- Unikátní interní odkazy v HTML článku: chatgpt-ads 9, chatgpt-ve-wordu 8,
  claude-cowork 8 (audit: jen 8 ze 118 článků mělo ≥ 3 v textu).
- Preview 390/1280 + odkazy vrací 200 — v PR.
