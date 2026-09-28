---
title: "Claude spočítal amplitudu na devět smyček. Co to znamená pro AI agenty"
seoTitle: "Claude spočítal 9 smyček: kdy nechat AI agenta běžet dny"
description: "Claude několik dní počítal amplitudu na devět smyček, Lance Dixon výsledek ověřil. Co se stalo, jaké to má limity a náš checklist pro dlouhé běhy agentů."
category: "AI Agenti"
date: "2026-09-28"
zprava: true
image: "/images/clanky/claude-devet-smycek-amplituda-agent-checklist.jpg"
audio:
  url: "https://audio.realtech.cz/claude-devet-smycek-amplituda-agent-checklist-nlm-e68773821703.mp3"
  duration: 676
---

**Anthropic 25. září 2026 oznámil, že Claude dostal jedno zadání a pak několik dní skoro bez dohledu počítal rozptylovou amplitudu na devět smyček. Dosavadní rekord byl osm smyček. Výsledek nezávisle ověřil fyzik Lance Dixon ze SLAC a Stanfordu. Nejde o novou fyziku ani o recenzovaný článek, je to ale dobrá případová studie. Ukazuje, co musíš mít připravené, když chceš nechat AI agenta pracovat samotného celé dny.**

## Co se stalo

Hlavní text vyšel na vědeckém blogu Anthropicu. Nenapsal ho ale Anthropic. Je to příspěvek hostujícího autora Matta von Hippela, bývalého teoretického fyzika a vědeckého novináře, a na konci je dodatek Lance Dixona. Podle prohlášení (disclosure) na konci textu dostal von Hippel od Anthropicu za psaní zaplaceno, zaměstnanci Anthropicu k textu dávali připomínky a obsah i názory jsou jeho. Dixon dostal kredity na používání Clauda. Přímo za firmu mluví jen tweet @AnthropicAI z 25. září.

Celé to začalo 7. srpna. Von Hippel tehdy na svém blogu 4gravitons.com vyhlásil výzvu, ať AI spočítá něco na hraně jeho bývalého oboru. A to jen s výpočetním výkonem, jaký má běžný akademik. Úlohu převzali Liam Fitzpatrick a Siddharth Mishra-Sharma, dva fyzici z Anthropicu. Nejdřív se Clauda zeptali, kterou ze dvou nabízených úloh zvládne spíš. Pak mu dali jednoduché zadání (anglicky prompt): spočítat šesticásticovou amplitudu v planární teorii N=4 SYM na devět smyček.

Použili model **[Fable 5.1](/clanky/claude-fable-5-1-bedrock/)** v prostředí **Claude Science**. To je placená platforma, která k jazykovému modelu přidává pevná pravidla a zadání, aby se choval spolehlivěji. Anglicky se takovému obalu říká harness.

## Fyzika srozumitelně a bez přehánění

Rozptylové amplitudy jsou vzorce. Z energií a hybností částic spočítáš, jak pravděpodobné jsou určité reakce. Počítají se přibližně a useknou se na určitém počtu „smyček“. Smyčky jsou míra složitosti interakcí, které do výpočtu zahrneš. Víc smyček znamená přesnější výsledek, ale náročnost výpočtu roste exponenciálně. V praxi je většina amplitud spočítaná jen na dvě smyčky, několik na tři. Nejpřesnější známá předpověď, magnetický moment elektronu, použila pět.

N=4 super Yang-Mills je zkušební teorie. Ve skutečném světě se nepoužívá. Fyzici na ní ladí techniky, protože se s ní paradoxně lépe počítá. Předchozí rekord osm smyček drželi Dixon a spolupracovníci, článek je z roku 2023.

Claude použil metodu zvanou bootstrap. Neprochází se každá možná interakce. Nejdřív se odhadne, jak by odpověď měla zhruba vypadat, a pak se podle známých podmínek škrtají možnosti. Von Hippel to přirovnává k sudoku. Důležité je, že šlo o **známé metody** Dixonova týmu. Jen s o něco větším výpočetním výkonem, než s jakým to lidé dosud zkoušeli. Všechen kód ale Claude podle Dixona napsal od nuly.

## Jak byl běh nastavený

Po úvodním zadání lidé Claudovi hlavně psali, ať pokračuje. Jeden z citovaných pokynů v našem překladu zní: „Jdu spát a několik hodin nebudu k zastižení. Pracuj na tom dál, dokud ti neřeknu, ať přestaneš. Každé 4–6 hodin mi pošli přehled.“ Von Hippel píše, že kromě „pokračuj“ neměl Claude žádný odbornější vědecký dohled.

Tweet Anthropicu uvádí celkové náklady „a few thousand dollars“, tedy pár tisíc dolarů. Von Hippel uvádí, že každá ze dvou výpočetních cest by koncového uživatele stála zhruba 1–2 tisíce dolarů. Většinu tvoří cena za to, že Claude běžel tak dlouho. Samotný bootstrap v Pythonu s knihovnou SymPy vyšel asi na 100 dolarů, což odpovídá 96 procesorům na týden. To číslo platí jen pro bootstrap, ne pro délku celého běhu. Ta je uvedená jen jako „několik dní“.

## Jak se to ověřovalo

Claude nakonec počítal dvěma různými cestami. Jednou byl přímý bootstrap, druhou nepřímý výpočet přes takzvaný form factor. Obě cesty se shodly na všech 107 053 porovnaných nenulových koeficientech. Stejné programy spočítaly i osmou smyčku. Při porovnání s publikovaným výsledkem sedělo všech 1 000 z 1 000 náhodně vybraných členů. Kontrola proti datům, která se při výpočtu nepoužila, našla 0 porušených rovnic ze 135.

Dixonův tým měl nástroje na kontrolu připravené dopředu. Výsledek dostal ve formátu, který už používal. Dva týdny ho ověřoval, hlavně převodem zpět na form factor. Data jsou veřejně na stránce Mishra-Sharmy.

## Limity a souběžný výsledek

- Zhruba 0,38 % nenulových koeficientů (3 821 z 1 018 297) není certifikováno.
- Celá funkce, nejen její zjednodušená podoba zvaná symbol, se spočítala jen jednou. Druhý, nezávislý výpočet funkce neexistuje.
- Programy nejsou zveřejněné.
- Během výpočtu se našla chyba ve výpočtu jednoho faktoru s desetinnými čísly (v plovoucí řádové čárce). Opravila se dřív, než vznikly kontrolní výsledky.
- Von Hippel přiznává, že neví, kolik chyb Claude cestou udělal.
- Nejde o recenzovaný článek. Publikovat budou lidé.

Souběžně a nezávisle spočítala symbol amplitudy na devět smyček skupina **Song He** z Čínské akademie věd (Jirong Jing, Xiang Li). Na Zenodo ho zveřejnila 17. září. Na část omezení použila GPT-6, na celkový rámec ne. Přímé srovnání obou výsledků zdroje nepopisují. Von Hippel to shrnuje tak, že Claude udělal něco, co zvládli i lidé. Dixon výsledek označuje za triumf, víc k zamyšlení ale podle něj bude, až modely začnou přicházet s novými fyzikálními principy a poznatky dřív než lidé.

## Náš checklist: kdy nechat agenta běžet dny

**Pozor, tohle je náš výklad a rada odvozená z tohoto případu.** Není to tvrzení Anthropicu ani autorů zdrojů. Firma o přenosu na jiné úlohy nic neříká. Ani von Hippel si není jistý, jak moc se to dá zobecnit.

1. **Ověřitelný výstup.** Předem urči formát a kritérium správnosti. Tady to byl formát, který Dixon už znal, plus kontrolní součty a vzorek 20 630 členů na porovnání.
2. **Dvě nezávislé cesty.** Pokud jde úloha vyřešit dvěma způsoby, nech agenta udělat oba. Shoda je silnější důkaz než jeden výsledek.
3. **Známý výsledek jako test.** Ať agent nejdřív zopakuje něco, co už znáš. Tady to byla osmá smyčka.
4. **Data stranou.** Část dat si nech na konečnou kontrolu, agent je při výpočtu nesmí použít.
5. **Pevný rozpočet.** Stanov strop na peníze, výpočetní výkon i čas. Výzva tady výslovně žádala takové výpočetní zdroje, jaké má k dispozici běžný akademik. Pokud agenta pouštíš přes předplatné, hlídej i [týdenní limity](/clanky/claude-code-tydenni-limit-zari/).
6. **Pravidelné přehledy.** Chtěj průběžná hlášení v pevných intervalech, tady každé 4–6 hodin.
7. **Člověk s nástroji na validaci.** Někdo musí umět výsledek zkontrolovat. A musí na to mít čas, tady to byly dva týdny.
8. **Úloha s jasnou odpovědí.** Nejlépe funguje tam, kde je „správně“ jednoznačné.

## V čem se to liší od chatbotu

U chatbotu vidíš každou odpověď hned a opravuješ ji průběžně. Dlouhý běh agenta je spíš zakázka. Zadáš ji a necháš agenta pracovat. Kvalitu pak zajistíš kontrolami, které jsi připravil předem, ne tím, že budeš číst každý krok. Když ty kontroly nemáš, dostaneš po několika dnech hromadu výstupu, u kterého nepoznáš, jestli je správně. Pokyny pro agenta si drž v souboru přímo v projektu, třeba v [AGENTS.md](/clanky/claude-code-agents-md-jeden-soubor-pokynu/).

## Co zatím nevíme

- Přesnou délku běhu, počet tokenů ani kolikrát lidé napsali „pokračuj“.
- Skutečnou fakturovanou částku a hardware, na kterém výpočet běžel.
- Jaké konkrétní nástroje Claude Science v běhu použil, kromě Pythonu a SymPy.
- Kolik slepých uliček a chyb běh obsahoval.
- Jak dopadne srovnání s výsledkem skupiny Song He a recenzní řízení.
- Jestli postup funguje i mimo zkušební teorie.

## Zdroje

- https://www.anthropic.com/research/yes-claude-can-do-nine-loops
- https://smsharma.io/cosmic-nine-loops/
- https://claude.com/product/claude-science
- https://x.com/AnthropicAI/status/2103541577083719888
- https://4gravitons.com/2026/08/07/it-only-counts-when-ai-gets-to-my-field/
- https://doi.org/10.5281/zenodo.22800071
