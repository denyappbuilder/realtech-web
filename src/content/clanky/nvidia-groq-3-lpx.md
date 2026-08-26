---
title: "Nvidia má Groq 3 LPX v plné výrobě. Rychlost tokenů zatím jen z firemních a třetích testů"
description: "Na Hot Chips Nvidia oznámila, že akcelerátor Groq 3 LPX pro inferenci agentů je v plné výrobě. Rekord Artificial Analysis i čtyřnásobek odezvy bereme jako číslo třetí strany, respektive firemní nárok."
category: "Hardware"
date: "2026-08-24"
zprava: true
image: "/images/clanky/nvidia-groq-3-lpx.jpg"
---

Nvidia 24. srpna na konferenci Hot Chips oznámila, že akcelerátor Groq 3 LPX je v plné výrobě. Oficiálně ho označuje za stroj na interaktivní AI inferenci. Má rozšířit platformu Vera Rubin a zrychlit tu část běhu, která agentům generuje tokeny.

Čísla, která k tomu firma přikládá, nejsou naše. Třetí strana Artificial Analysis naměřila 3 400 výstupních tokenů za sekundu na modelu Gemma 4 31B s kontextem 100 000 tokenů. Nvidia to označuje za nejrychlejší výsledek, jaký u tohoto modelu vůbec zaznamenali. Čtyřnásobek odezvy u agentů a úloh citlivých na latenci proti nejbližší alternativní platformě je firemní tvrzení Nvidie. Nezávisle jsme to neměřili a hardware jsme neměli v ruce.

## Co LPX přidává k Vera Rubin

Vera Rubin NVL72 zůstává obecnou platformou na trénink i inferenci. Groq 3 LPX k ní podle tiskové zprávy přidává vyšší tempo generování tokenů. Nvidia to cílí na agentní systémy, které v jednom běhu udělají stovky nebo tisíce inference kroků. Tam se pomalé generování násobí. Rychlejší výstup má agentovi nechat víc času na čtení souborů, psaní a test kódu, volání nástrojů a kontrolu výsledku, aniž by uživatel čekal.

Šéf Nvidie Jensen Huang v tiskové zprávě řekl, že inference je růstový motor AI. Vera Rubin podle něj rozšiřuje tu vizi o konfigurace továren na AI podle typu zátěže a LPX má posunout výkonnostní hranici ultrarychlým generováním tokenů. To je firemní věta z Newsroomu, ne nezávislé hodnocení.

Sama platforma Vera Rubin stojí na sedmi čipech a pěti účelových racích. V tiskové zprávě Nvidia jmenuje BlueField-4, racky s procesorem Vera, úložiště Vera BlueField-4 STX a ethernet Spectrum-6 SPX. Značky Groq a LPU přitom Nvidia používá v licenci od Groq, Inc. Funkce, ceny i dostupnost se podle patičky tiskové zprávy můžou změnit. Produkty můžou přijít, až a pokud budou k dispozici.

## Co je v jednom racku

Oficiální technický blog Nvidie popisuje rack se 256 propojenými akcelerátory Groq 3 LPU. Specifikační tabulka uvádí 315 PFLOPS inference výpočtu, 128 GB SRAM dohromady, 40 PB/s propustnosti on-chip SRAM a 640 TB/s scale-up propustnosti. To jsou firemní specifikace, ne náš bench.

Fyzicky je to 32 kapalinou chlazených 1U šuplíků, v každém osm LPU. Na čipu LPU je 500 MB SRAM jako primární pracovní paměť. Kompilátor tam data pokládá sám. Není to hardwarová cache, která by se za běhu sama rozhodovala, co držet blízko výpočtu.

## Čísla, která Nvidia prodává

Rekord 3 400 výstupních tokenů za sekundu je výsledek Artificial Analysis na Gemma 4 31B a kontextu 100 000 tokenů. Nvidia ho cituje ve vlastní tiskové zprávě a říká, že jde o nejrychlejší zaznamenaný běh tohoto modelu. Je to číslo třetí strany, ne náš test. Konkurenci v tom odstavci Newsroom nejmenuje.

Čtyřnásobek odezvy pro agenty a úlohy citlivé na latenci proti nejbližší alternativní platformě je firemní násobek z téže tiskové zprávy. Nvidia v něm neříká, proti kterému konkrétnímu stroji se srovnává. Psaní kódu „v minutách místo hodin“ je ze stejného odstavce. Bereme to jako firemní slib, ne jako naměřený čas z naší redakce.

Technický blog jde ještě dál. Nvidia tam tvrdí až 35× vyšší inference propustnost na megawatt a až 10× větší příležitost k tržbám u modelů s bilionem parametrů. Srovnání je proti vlastnímu GB200 NVL72. Obě čísla bereme jako firemní nárok, ne jako nezávislé měření.

## Dva motory v jednom decode

Blog to kreslí jednoduše. GPU Rubin berou prefill a attention. LPU berou tu část decode, která je citlivá na latenci, tedy FFN a MoE. Orchestraci má dělat Dynamo. Víc do učebnice zacházet nebudeme. Jde o firemní popis rozdělení práce, ne o tok, který bychom viděli na vlastní kůži.

## Nebius první, Groq hned za ním

První AI cloud, který LPX podle Nvidie bere, je Nebius. Chce ho dostat do své inference platformy Nebius Token Factory. Technický ředitel Nebiusu Danila Shtan říká, že generování je ta fáze inference, která rozhoduje, jak odezvu systému vůbec vnímáte. Stejné API, žádná migrace na nový stack.

Po Nebiusu plánuje být mezi prvními, kdo ho nasadí, i účelový AI inference cloud Groq. To je podle tiskové zprávy pořadí, ne počet zákazníků.

CNBC 24. srpna doplňuje čas. Dion Harris z Nvidie novinářům řekl, že Groq rack s Verou a Rubinem poběží u Nebiusu později letos. V prosinci podle CNBC Nvidia koupila aktiva Groqu za 20 miliard dolarů, což CNBC označuje za dosud největší akvizici Nvidie. To není fakt z Newsroomu. Čipy Groq podle CNBC vyrábí Samsung, GPU Nvidie TSMC.

České ceny, termín dodání do Česka ani počet objednaných racků v těch textech nejsou. Nevymýšlíme je.

## Co z toho plyne

Potvrzené je oznámení plné výroby a jména prvních zájemců. Rychlost 3 400 tokenů za sekundu je bench třetí strany, který Nvidia cituje. Čtyřnásobek, 35× na megawatt i 10× tržební příležitost jsou firemní násobky. My hardware neměli a netestovali.

Patička tiskové zprávy to říká napřímo. Specifikace, ceny i dostupnost se můžou změnit a produkty můžou přijít, až a pokud budou k dispozici.

## Zdroj

- [NVIDIA Groq 3 LPX Now in Full Production With World-Class Speed for Agentic AI — NVIDIA Newsroom (24. 8. 2026)](https://nvidianews.nvidia.com/news/nvidia-groq-3-lpx-now-in-full-production-with-world-class-speed-for-agentic-ai)
- [Inside NVIDIA Groq 3 LPX: The Low-Latency Inference Accelerator for the NVIDIA Vera Rubin Platform — NVIDIA Technical Blog](https://developer.nvidia.com/blog/inside-nvidia-groq-3-lpx-the-low-latency-inference-accelerator-for-the-nvidia-vera-rubin-platform/)
- [Nvidia says Groq racks will be online this year after $20 billion deal — CNBC (24. 8. 2026)](https://www.cnbc.com/2026/08/24/nvidia-says-groq-racks-will-be-online-this-year-after-20-billion-deal.html)
