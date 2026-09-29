---
title: "Claude Sonnet 5.5: rychlejší a levnější. Kdy přejít z Opusu a Sonnetu 5"
seoTitle: "Claude Sonnet 5.5: kdy přejít z Opusu a Sonnetu 5"
description: "Sonnet 5.5 stojí stejně jako Sonnet 5, je podle Anthropicu o víc než 30 % rychlejší a na úlohu až o 30 % levnější. Kdy zůstat u Opusu a jak přepnout."
category: "AI Report"
date: "2026-09-29"
zprava: true
image: "/images/clanky/claude-sonnet-5-5-kdy-prejit.jpg"
audio:
  url: "https://audio.realtech.cz/claude-sonnet-5-5-kdy-prejit-nlm-259aaa4d1632.mp3"
  duration: 1653
---

Anthropic 28. září 2026 vydal Claude Sonnet 5.5, druhý model řady Claude 5.5 po [Opusu 5.5](/clanky/opus-5-5-vs-gpt-6-sol-ktery-vzit-dnes/). Cena za token zůstává stejná jako u Sonnetu 5. Podle Anthropicu ale nový model generuje výstup o víc než 30 % rychleji a na stejnou práci potřebuje tolik méně tokenů, že na úlohu vyjde až o 30 % levněji.

Sonnet 5.5 nemá nahradit Opus. Anthropic ho staví jako rychlejší a levnější doplněk na dobře zadanou každodenní práci: opravy chyb, menší funkce, dokumenty, prezentace a tabulky.

Všechna čísla níže jsou údaje Anthropicu nebo GitHubu. Sami jsme model neměřili a nezávislé srovnání jsme zatím nenašli.

## Co je nového ve zkratce

- **Cena:** 2 $ za milion vstupních tokenů, 10 $ za milion výstupních, čtení z cache 0,20 $, zápis do cache (5minutové TTL) 2,50 $. Stejně jako Sonnet 5. Batch API má 50% slevu. Celý 1M kontext je za standardní cenu.
- **Rychlost:** podle Anthropicu nejrychlejší Sonnet vůbec, výstup o 30+ % rychlejší než u Sonnetu 5.
- **Parametry:** kontext 1M tokenů, výstup až 128k tokenů, spolehlivé znalosti do června 2026.
- **Model ID:** `claude-sonnet-5-5`, na Amazon Bedrock `anthropic.claude-sonnet-5-5`. Běží na Claude API, Amazon Bedrock, Google Cloud, Microsoft Foundry a Claude Platform on AWS.
- **Haiku 5.5** má dorazit „v následujících týdnech“. Přesné datum Anthropic neuvádí.

## Co říkají benchmarky Anthropicu

| | Sonnet 5.5 | Sonnet 5 | Opus 5.5 |
|---|---|---|---|
| Terminal-Bench 4.0 | 70,6 % | 10,3 % | 66,4 % (Xhigh) |
| CursorBench 4.0 | 55,5 % | 34,1 % | 57,8 % |
| FrontierCode 1.1 (Main) | 46,2 % (Max) / 52,1 % (Xhigh) | 42,4 % | 54,4 % |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 |
| OSWorld 2.1 (partial) | 80,1 % | 57,0 % | 81,8 % |
| Humanity's Last Exam (s nástroji) | 64,5 % | 54,9 % | 67,7 % |

Poznámky k tabulce podle Anthropicu: Opus 5.5 má na Terminal-Bench 4.0 uvedené skóre při effortu Xhigh, což je jeho nejlepší výsledek. Sonnet 5.5 dosáhl na FrontierCode při effortu Max nižšího skóre než při Xhigh, protože častěji spouštěl code-review skill Claude Code a ve dvou případech to skončilo timeoutem nebo úpravami mimo zadání. GDPval-AA měřila firma Artificial Analysis na předběžné verzi Sonnetu 5.5 s chybou ve strukturovaných výstupech. Chyba je už opravená a Anthropic čeká jen malý vliv na skóre. Sloupec GPT-6 Sol a testy AA-Briefcase a Chartography jsme z tabulky vynechali.

Na papíře je Sonnet 5.5 skoro na úrovni Opusu 5.5 a Sonnet 5 nechává daleko za sebou. Anthropic navíc tvrdí, že na několika testech Sonnet 5.5 při nízkém nebo středním úsilí (effort) překoná nejlepší výsledek Sonnetu 5 zhruba za desetinu ceny za úlohu.

Dvě věci ale k tabulce patří. Anthropic sám píše, že benchmarky ukazují jen část schopností a že Opus 5.5 zůstává „jasně silnější“ (náš překlad) v komplexní otevřené práci. A GitHub ve svém oznámení působí střídměji: v jeho prvních testech Sonnet 5.5 na programovacích úlohách **vyrovnal** Sonnet 5, jen k tomu potřeboval výrazně méně kroků, tokenů a volání nástrojů a byl znatelně rychlejší. Hlavní přínos tak může být spíš v úspoře než ve skoku kvality.

## Kdy zůstat u Opusu 5.5

Opus 5.5 stojí za token dvojnásobek: 4 $ za vstup, 20 $ za výstup a 5 $ za zápis do cache. Jen čtení z cache vyjde u obou modelů stejně, na 0,20 $. Ten příplatek dává smysl, když:

- **řešíš otevřené a složité úlohy** – návrh architektury, velké refaktory, práci, kde model musí dlouho sám rozhodovat. Právě tady podle Anthropicu Opus vede.
- **chceš Sonnet pouštět na maximum.** Anthropic uvádí, že Sonnet 5.5 doplňuje Opus nejlépe při nižším effortu, kde je levnější. Při vyšších nastaveních dosahuje srovnatelného výkonu za podobnou cenu za úlohu. Úspora se tedy rozplyne.

Na bezpečnostní práci ti přechod na Opus nepomůže. Sonnet 5.5 je první Sonnet s kybernetickými pojistkami podobnými těm, které má Opus 5.5. Rizikovější kyberbezpečnostní požadavky se u něj viditelně přepnou na Sonnet 5. Běžné hledání a opravy chyb v kódu to podle Anthropicu neomezuje.

Jeden z testerů, které Anthropic cituje, popisuje rozumné rozdělení práce: Opus 5.5 navrhne architekturu, Sonnet 5.5 ji implementuje.

## Kdy přejít ze Sonnetu 5

Při stejné ceně za token, menší spotřebě a vyšší rychlosti je přechod ze Sonnetu 5 pro většinu lidí logický krok. Citovaní testeři k tomu přidávají konkrétní čísla: Slack uvádí asi o 14 % méně výstupních tokenů ve Slackbotu, Zendesk o 20 % rychlejší vyřizování tiketů. Jde o jejich vlastní interní testy.

V API si ale nejdřív ověř změny popsané níž.

## Jak přejít

### API

Stačí změnit model na `claude-sonnet-5-5`, ale dokumentace uvádí pět změn, kvůli kterým kód psaný pro Sonnet 5 může přestat fungovat:

1. **Vypnuté přemýšlení:** `thinking: {"type": "disabled"}` vrátí chybu 400. Nejnižší nastavení je nově `between_tools`, které vypne přemýšlení na začátku odpovědi. Funguje jen při effortu `low`, `medium` a `high`.
2. **Vynucené volání nástroje:** `tool_choice` typu `any` nebo `tool` vrátí chybu 400. Náhradou je `auto` a nástroj označený `strict: true`. Na Bedrocku jen `auto` bez `strict` a kontrola vstupu ve vlastním kódu.
3. **Thinking bloky** jsou svázané s modelem a konverzací. U účtů založených od 31. srpna 2026 00:00 UTC (2:00 SELČ) API ve výchozím stavu vrátí chybu 400, když přehraješ blok po úpravě starší historie. Konverzace proto jen prodlužuj, nepřepisuj.
4. **Computer use** na Claude API a Google Cloud jede jen přes `computer_toolset_20260801`. Starší `computer_20251124` tam vrátí chybu.
5. **Advisor tool** už nepřijme jako poradce Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 5 ani Sonnet 4.6 a radu vrací zašifrovanou.

Šestá změna nic neshodí: delší text mezi voláními nástrojů chodí v `thinking` blocích. Aplikace, která ho streamuje uživatelům, pak mezi kroky „oněmí“, dokud nenastavíš `display` nebo nepoužiješ `between_tools`.

Dál se vyplatí vědět:

- Výchozí effort v API je `high` a úrovně jsou překalibrované. Dokumentace doporučuje znovu projet testy nákladů. Na agentní programování začni na `medium` u dobře zadaných úloh a u těžších nebo delších přejdi na `high`. Na chat a úlohy citlivé na odezvu na `medium` nebo `low`.
- Minimální délka promptu pro cache klesla z 1 024 na 512 tokenů.
- Beta volba `fallbacks: "default"` (jen Claude API) zkusí odmítnuté požadavky v kategoriích `cyber` a `frontier_llm` znovu na Sonnetu 5.
- V Claude Code můžeš migraci projektu nechat na příkazu `/claude-api migrate this project to claude-sonnet-5-5`. Skill vymění model a upraví parametry a pak vypíše, co zkontrolovat ručně.

### Claude aplikace a Claude Code

Podle Anthropicu je Sonnet 5.5 dostupný na všech platformách. V aplikacích Claude i v Claude Code má výchozí effort Medium. V Claude Code je výchozím modelem dál Opus 5.5. Na Sonnet 5.5 přepneš příkazem `/model sonnet` (od verze 2.1.284, podle Anthropicu na Claude API) a přemýšlení u něj vypnout nejde. Jak effort ovlivňuje limity v Claude Code, jsme rozebírali u [týdenních limitů](/clanky/claude-code-tydenni-limit-zari/).

Oznámení nerozepisuje, jak rychle se model objeví u jednotlivých tarifů. Ceník uvádí modely Sonnet ve všech tarifech včetně Free, ale bez čísla verze. Jestli ho ve svém tarifu už máš, ověř si přímo v aplikaci. Pokud v Claude Code měníš účty uprostřed session, Anthropic odkazuje na změnu v zachovávání thinking bloků mezi účty.

### Cursor

Anthropic uvádí výsledek na CursorBench 4.0, testu z reálných session v Cursoru: 55,5 % proti 57,8 % u Opusu 5.5 a 34,1 % u Sonnetu 5. Při nízkém effortu má Sonnet 5.5 překonat nejlepší skóre Sonnetu 5 za méně než desetinu ceny za úlohu.

Jestli a od kdy je Sonnet 5.5 v model pickeru Cursoru a za kolik, ale naše zdroje nepotvrzují. Zkontroluj si seznam modelů přímo v editoru.

### GitHub Copilot

GitHub 28. září oznámil, že Sonnet 5.5 je v Copilotu obecně dostupný pro tarify Pro, Pro+, Max, Business a Enterprise. Vybereš ho v přepínači modelů ve VS Code, Visual Studiu, Copilot CLI, Copilot coding agentu, aplikaci GitHub Copilot, na github.com, v GitHub Mobile, JetBrains IDE, Xcode a Eclipse.

- Nasazuje se postupně. Když ho ještě nevidíš, GitHub radí zkusit to později.
- Účtuje se podle ceníku poskytovatele v rámci účtování podle spotřeby.
- V Business a Enterprise ho spravuje administrátor přes model policy. Nové modely jsou ve výchozím stavu zapnuté, pokud je admin globálně nebo konkrétně tenhle nevypnul.

## Shrnutí

Sonnet 5.5 je hlavně levnější a rychlejší způsob, jak dělat běžnou práci. Pokud jedeš na Sonnetu 5, přechod dává smysl. Pokud jedeš na Opusu 5.5, zkus Sonnet na rutinní úlohy při nižším effortu a Opus si nech na těžké věci. Kolik ušetříš doopravdy, ukáže až tvoje vlastní faktura, ne tabulka výrobce.

## Zdroje

- [Anthropic: Introducing Claude Sonnet 5.5 (28. 9. 2026)](https://www.anthropic.com/claude-sonnet-5-5)
- [GitHub Changelog: Claude Sonnet 5.5 in GitHub Copilot (28. 9. 2026)](https://github.blog/changelog/2026-09-28-claude-sonnet-5-5-in-github-copilot/)
- [Claude Docs: Claude Sonnet 5.5 – přehled modelu](https://platform.claude.com/docs/en/models/sonnet-5-5/overview)
- [Claude Docs: Migration guide pro Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide)
- [Claude Docs: Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Claude: Pricing](https://claude.com/pricing)
- [Claude Docs: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [claude.dev: Building with Claude Sonnet 5.5 (28. 9. 2026)](https://claude.dev/blog/building-with-claude-sonnet-5-5/)
