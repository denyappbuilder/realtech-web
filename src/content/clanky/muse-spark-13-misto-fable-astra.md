---
title: "Muse Spark 1.3: kdy dát Meta místo Fable nebo Astry"
description: "Meta Muse Spark 1.3 (xhigh) stojí 1,25 / 4,25 dolarů za milion tokenů a AA ji počítá na ~0,55 dolaru za úlohu. Astra je 10 / 50. Pravidlo: levný model na většinu kroků, frontier jen na hard gate."
category: "AI Report"
date: "2026-09-04T11:15:00+02:00"
zprava: true
image: "/images/clanky/muse-spark-13-misto-fable-astra.jpg"
audio:
  url: "https://audio.realtech.cz/muse-spark-13-misto-fable-astra-nlm.mp3?v=37b731d915ac"
  duration: 981
---

Meta vypustila **Muse Spark 1.3**. Režim **xhigh** běží ode dneška v Muse Code a v Meta Model API. Silnější režim **max** zůstává v uzavřeném náhledu pro partnery a čeká na dokončení bezpečnostních testů. Ceník xhigh se nemění: **1,25 dolaru** za milion vstupních tokenů a **4,25 dolaru** za výstupní, čtení z cache **0,15 dolaru**.

Pro OSVČ a malou firmu je ale hlavní číslo jinde než v žebříčku. Artificial Analysis počítá Muse Spark 1.3 (xhigh) na **asi 0,55 dolaru za úlohu** ve svém Intelligence Indexu, což z ní dělá nejlevnější model se skóre nad 59. GPT-6 Astra stojí v API **10 a 50 dolarů** za milion tokenů. Claude Fable 5.1 sedí na podobné tokenové úrovni jako Astra, základní karta je taky **10 a 50 dolarů**.

My jsme nic z toho neměřili. Čísla Artificial Analysis i Mety ber jako jejich vlastní tvrzení a spočítej si své vlastní prompty.

## Co běží dnes a co je zatím v náhledu

- **Muse Spark 1.3 xhigh** (dnes v API a v Muse Code): Intelligence Index **61**, τ³-Banking **47 %**, Terminal-Bench 2.1 **asi 85 %**
- **Muse Spark 1.3 max** (uzavřený náhled): index **62**, τ³-Banking **52 %**, což je podle Artificial Analysis první místo, Terminal-Bench 2.1 **asi 86 %**
- **Muse Spark 1.2** (předchozí verze): index 57, τ³-Banking 35 %, Terminal-Bench 2.1 80 %

Čísla jsou z Artificial Analysis (2. 9. 2026) a z The Decoder (3. 9.). Pro srovnání: Claude Fable 5.1 v režimu max má na indexu **66**, tedy pořád nad oběma variantami Muse Spark. Astra je jiná kategorie použití, ovládání počítače a práh Critical v kyberbezpečnosti; tady ji bereme jen kvůli ceně a routingu, zbytek je v článku o [vydání GPT-6 Astra](/clanky/gpt-6-astra-vysla/).

Meta k verzi 1.3 dodává, že zvládne delší agentní vlákna, u jejich inženýrů udělá asi o 20 % méně zbytečných volání nástrojů a spotřebuje asi o 25 % méně tokenů než 1.2, plus lépe spolupracuje na společné práci. Zase jejich text a jejich čísla.

## Cena za úlohu

- **Muse Spark 1.3 xhigh:** 1,25 a 4,25 dolaru za milion tokenů, podle Artificial Analysis asi 0,55 dolaru za úlohu
- **GPT-6 Astra:** 10 a 50 dolarů za milion tokenů
- **Claude Fable 5.1:** základní karta taky 10 a 50 dolarů
- Ostatní modely se srovnatelným skóre (index 61) vycházejí podle Artificial Analysis na 0,94 až 0,95 dolaru za úlohu

Za úlohu je 1.3 dražší než 1.2, která vyšla na 0,40 dolaru. Podle Artificial Analysis za tím stojí asi o 57 % víc vstupních tokenů na agentních testech. Vyšší skóre tedy něco stojí i u levné třídy modelů.

## Praktické pravidlo pro routing

1. Většinu kroků nech na levné třídě, tedy Muse Spark nebo podobný model kategorie Flash.
2. Na rozhodující krok, který ostatní kroky odblokuje, pošli frontier model (Fable, Astra, Opus), a to jen na ten jediný krok.
3. Režim max u Muse Spark nedávej jako výchozí. Je zatím v náhledu a podle Artificial Analysis spálí na uvažování víc tokenů.

Test do praxe: když levný model třikrát v řadě spadne na stejném kroku, eskaluj právě ten krok na frontier model a zbytek vlákna nech, jak je.

## Co s tím dnes udělat

Zapni si v Muse Code nebo v API režim xhigh a proměř na deseti svých typických úlohách, kolik to stojí a kolik z toho projde. V routeru nastav levný model jako výchozí a frontier drž pro kroky, které si sám označíš jako `hard`. Režim max a otevřené váhy jsou zatím jen roadmapa, na dnešní provoz s nimi nepočítej.

## Zdroje

- [Introducing Muse Spark 1.3 (Meta AI Research)](https://research.meta.ai/blog/introducing-muse-spark-1-3)
- [Muse Spark 1.3 (Artificial Analysis, 2. 9. 2026)](https://artificialanalysis.ai/articles/muse-spark-1-3)
- [Meta closes in on the top with Muse Spark 1.3 and undercuts rivals on price (The Decoder, 3. 9. 2026)](https://the-decoder.com/meta-closes-in-on-the-top-with-muse-spark-1-3-and-undercuts-rivals-on-price/)
