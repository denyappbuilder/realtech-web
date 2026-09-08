---
title: "AA Index v4.3: Astra i Fable 5.1 mají 53. Rozdíl je v ceně úlohy"
description: "Artificial Analysis srovnal frontier. Oba top na 53 bodech. Astra stojí asi 3,26 dolaru za úlohu indexu, Fable 7,63. Nový Terminal-Bench 4.0 a AutomationBench od Zapieru."
category: "AI Report"
date: "2026-09-08T09:30:00+02:00"
zprava: true
image: "/images/clanky/aa-index-v43-astra-fable.jpg"
xPosts:
  - "https://x.com/ArtificialAnlys/status/2097025638695940590"
---

Artificial Analysis vydal 7. září verzi 4.3 svého Intelligence Indexu. Na špici je remíza: **Claude Fable 5.1** (max, s fallbackem) i **GPT-6 Astra** (max) mají shodně **53 bodů**. Rozdíl je v účtu. Průměrná úloha indexu stojí u Astry asi **3,26 dolaru**, u Fable 5.1 **7,63 dolaru**. Za stejné skóre zaplatíš u Astry o 57 % méně.

Čísla jsou od Artificial Analysis, my jsme nic z toho neměřili. Prompty, konfigurace i váhy testů si volí oni. Ber to jako jejich tvrzení, které stojí za to si ověřit na vlastních úlohách.

## Pořadí ve verzi 4.3

- **Claude Fable 5.1 (max, s fallbackem):** 53
- **GPT-6 Astra (max):** 53
- **Claude Opus 5 (max):** 51
- **Claude Fable 5 (fallback):** 50
- **Muse Spark 1.3 (max):** 48
- **GPT-5.6 Sol (max):** 47

U otevřených vah vede **GLM-5.3 Flash** se 42 body, za ním **Qwen3.8 2.4T A95B** se 40 a **DeepSeek V4 Pro 0813** (max) s 36.

Jedno upozornění k číslům, která jsme tu psali dřív. U [Muse Spark 1.3](/clanky/muse-spark-13-misto-fable-astra/) jsme před pár dny uváděli index 61 a 62 a u Fable 5.1 max 66. To byly starší verze indexu (4.1 a 4.2) s jinou skladbou testů a jinými váhami. Skóre z verze 4.3 se s nimi nedá porovnávat jedna ku jedné a pokles na 48 a 53 nic nevypovídá o modelech. Index zkrátka přitvrdil.

## Kde vede Astra a kde Fable

Artificial Analysis to shrnuje jednoduše. Fable 5.1 je silnější v AA-Briefcase a v SciCode, tedy v kancelářské agentní práci s dokumenty a ve vědeckém kódu. Astra vede v Terminal-Bench 4.0 a ve skóre AutomationBench.

Srovnávací stránka AA to dokládá po složkách. AA-Briefcase: Fable 5.1 má Elo **1662**, Astra 1562. GDPval-AA v2 (profesní kancelářská práce): Fable **1763**, Astra 1580. SciCode: Fable **63 %**, Astra 56 %. V dokumentech, tabulkách a vědeckém kódu je tedy náskok Fable zřetelný, o celkovou remízu se stará agentní část.

**Terminal-Bench 4.0**, agentní úlohy v příkazové řádce:

- GPT-6 Astra: 59,1 %
- Claude Fable 5.1: 52,0 %
- Claude Opus 5: 49,0 %
- GPT-5.6 Sol: 39,9 %

**AutomationBench-AA** je nový test. Zapier pro něj dal k dispozici 657 automatizačních úloh, které nejsou veřejné, takže na nich modely nemohly trénovat. Ve skóre má Astra **68,5 %**, Grok 4.6 (high) 66,7 % a GLM-5.3 (max) 62,2 %. Fable 5.1 je podle srovnávací stránky AA kolem 59 %. Přísnější metrika je podíl úloh dotažených celých: Astra **41,6 %**, Fable 5.1 **32,1 %**, Opus 5 **28,3 %**. I nejlepší model tedy dokončí méně než polovinu automatizací. Na bezobslužný provoz je to pořád málo.

## Co se ve verzi 4.3 změnilo

Index verze 4.3 skládá deset testů: AA-Briefcase, GDPval-AA v2, AutomationBench-AA, Terminal-Bench 4.0, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, AA-Omniscience a AA-LCR v1.1. Proti předchozí verzi jsou čtyři posuny:

1. Terminal-Bench 2.1 nahradil Terminal-Bench 4.0.
2. τ³-Banking vypadl, místo něj přišel AutomationBench-AA.
3. Váha neveřejných testů stoupla ze 40 na 45 %. Na neveřejné sady se hůř trénuje na míru.
4. Kategorie mají váhy Agenti 30 %, Kódování 20 %, Obecné 30 %, Věda 20 %.

Silnější agentní část a výměna dvou testů vysvětlují, proč se skóre všech modelů posunula dolů.

## Co s tím v praxi

Cena za úlohu je pro OSVČ a malou firmu užitečnější číslo než cena za token. [GPT-6 Astra](/clanky/gpt-6-astra-vysla/) i [Claude Fable 5.1](/clanky/claude-fable-5-1-bedrock/) mají v API stejnou kartu 10 a 50 dolarů za milion tokenů, přesto vychází úloha indexu u Astry na 3,26 a u Fable na 7,63 dolaru. Rozdíl dělá spotřeba tokenů, hlavně na uvažování. Kdo pouští dlouhé agentní běhy, zaplatí u Fable víc, i když je ceník na papíře shodný. Jedna položka jde opačným směrem: čtení z cache stojí podle AA u Fable 5.1 **0,25 dolaru** za milion tokenů, u Astry **1 dolar**. Kdo dokola posílá stejný dlouhý kontext, část rozdílu tím u Fable dohoní.

Pravidlo z článku o Muse Spark 1.3 platí dál: levný model na většinu kroků, frontier jen tam, kde levný model padá. Při výběru frontier modelu se koukni na typ práce. Terminál, automatizace a klikání v cizích systémech mluví podle Artificial Analysis pro Astru. Dokumenty, tabulky a vědecký kód pro Fable 5.1. A pak si to proměř na vlastních deseti úlohách. Cena za úlohu u Artificial Analysis vychází z jejich promptů a jejich konfigurací, u tvých dat může být poměr jiný.

## Zdroje

- [Artificial Analysis Intelligence Index v4.3 (Artificial Analysis, 7. 9. 2026)](https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v4-3)
- [GPT-6 Astra vs Claude Fable 5.1, srovnání (Artificial Analysis)](https://artificialanalysis.ai/models/comparisons/gpt-6-astra-vs-claude-fable-5-1)
- [Artificial Analysis na X, 7. 9. 2026](https://x.com/ArtificialAnlys/status/2097025638695940590)
