---
title: "OpenAI zveřejnilo první čísla Jalapeña. Násobky na watt jsou firemní, čip jsme neměli"
description: "Na Hot Chips OpenAI ukázalo první InferenceX výsledky vlastního inference čipu. 1,5 až 1,9× práce na watt a nižší latenci bereme jako firemní nárok. Nasazení uvnitř firmy do konce roku."
category: "Hardware"
date: "2026-08-25"
zprava: true
image: "/images/clanky/openai-jalapeno-hot-chips.jpg"
audio:
  url: "https://audio.realtech.cz/openai-jalapeno-hot-chips-nlm.mp3?v=e09caeb681b8"
  duration: 1975
---

OpenAI 25. srpna na konferenci Hot Chips ve Stanfordu zveřejnilo první naměřené výsledky Jalapeña, prvního vlastního inference čipu. Srovnání jde přes veřejný bench SemiAnalysis InferenceX na modelech GPT-OSS 120B, DeepSeek R1 670B a Kimi K2.5 1T.

Čísla, která k tomu firma přikládá, nejsou naše. OpenAI tvrdí 1,5 až 1,9× víc AI práce na watt při špičkové propustnosti a 1,7 až 3,6× nižší end-to-end latenci než srovnávací systémy. U vysoce interaktivních zátěží hlásí 2,1 až 4,1× vyšší výkon. To jsou firemní násobky. Čip jsme neměli v ruce a nezávisle jsme ho netestovali.

## Co InferenceX ukazuje

InferenceX je veřejný bench SemiAnalysis. OpenAI na něm srovnává práci na watt a latenci, ne surový výkon čipu. Výkon normalizuje podle zveřejněného příkonu pouzdra. Jalapeño má jmenovitých 700 W. Na testovaných zátěžích firma naměřila trvalý příkon 550 W nebo méně. Srovnání v dodatku dává GB200 na 1 200 W a GB300 na 1 400 W.

The Register k tomu doplňuje, že srovnávací stroje jsou GB200 NVL72 a GB300 NVL72 a že z porovnání vypadlo spekulativní dekódování. To není věta z newsroomu OpenAI. Bereme ji jako údaj The Register.

## Tři otevřené modely, tři firemní tabulky

Dodatek k GPT-OSS 120B, InferenceX, nominálně 8k vstup a 1k výstup, single-token prediction. Špičková smíšená propustnost na kilowatt je podle OpenAI zhruba 1,9×, 85 448 proti 44 960. End-to-end latence zhruba 1,7×, 1,03 s proti 1,80 s. Minimální čas mezi tokeny zhruba 2,7×, 0,69 ms proti 1,87 ms, tedy 1 459 proti 535 tokenům za sekundu na uživatele.

DeepSeek R1 v MXFP4. Špička na kilowatt zhruba 1,7×, 19 641 proti 11 781. End-to-end zhruba 3,6×, 1,65 s proti 5,99 s. Minimální čas mezi tokeny zhruba 4,1×, 1,43 ms proti 5,90 ms, tedy 700 proti 169 tokenům za sekundu na uživatele.

Kimi K2.5 s bilionem parametrů. OpenAI říká zhruba 1,5× vyšší špičku na watt a 3,4× nižší end-to-end latenci než srovnávací systém. Konkrétní TPS na kilowatt u tohoto modelu v dodatku neuvedlo, tak ho nedoplňujeme.

Interní testy na vlastních frontier modelech podle OpenAI náskok ještě rozšířily. To je zase firemní tvrzení, ne veřejný bench.

## Prefill i decode na jednom čipu

Jalapeño je podle OpenAI stavěné na prefill, který žere výpočet, i na decode, který žere paměťovou propustnost. Stav modelu včetně KV cache má zůstat lokální. Systém má podle firmy zapínat kombinaci výpočtu, paměti a sítě podle fáze inference.

To je jiná cesta než [Groq 3 LPX](/clanky/nvidia-groq-3-lpx/). Tam Nvidia skládá prefill na GPU Rubin a decode citlivý na latenci na LPU. OpenAI u Jalapeña říká, že obě fáze drží na jednom čipu. Ani jeden z těch strojů jsme neměřili. Jde o dva firemní popisy rozdělení práce.

The Register uvádí rack se 128 akcelerátory, 1,7 EFLOPS ve 4bitovém výpočtu, 27,5 TB HBM4 a zhruba 2 PB/s propustnosti. Na čip dává 13,4 PFLOPS MXFP4, 216 GB HBM4 a 15,4 TB/s. To jsou specifikace z The Register, ne z našeho labu.

## Návrh za devět měsíců

Od prvního návrhu k tape-outu uplynulo podle OpenAI devět měsíců. Při návrhu firma použila vlastní AI. Codex a GPT-Astra pak prý dostaly na vysoký výkon tři open-weight modely, které v původním plánu nebyly, a to za dva měsíce.

U vybraných bloků attention a MoE v GPT-OSS prý AI kernely běžely 1,5 až 1,8× rychleji než implementace lidských expertů. OpenAI samo říká, že to platí pro vybrané bloky, ne pro celý model.

V červnu, když čip poprvé ukázali, šlo o první Intelligence Processor. Broadcom dodal křemík a síť Tomahawk, Celestica desky a racky. Vzorky tehdy běžely GPT-5.3-Codex-Spark na cílové výrobní frekvenci a příkonu.

Greg Brockman v červnovém textu řekl, že Jalapeño je součást dlouhodobé full-stack infrastruktury, která má udělat výpočet hojnějším. Richard Ho tam psal, že architekturu stavěli od země pro LLM inferenci podle kernelů, pohybu paměti, sítě a serving vzorů, které u frontier modelů rozhodují. Hock Tan z Broadcomu slíbil gigawattová datacentra s Microsoftem a dalšími partnery od roku 2026. To jsou věty z červnového oznámení, ne z Hot Chips.

## Do konce roku uvnitř, víc až 2027

Srpnový text je konkrétnější než červnový. OpenAI chce Jalapeño nasadit ve vlastním výpočetním zázemí do konce roku. Druhá generace je podle firmy hluboko ve vývoji, třetí se teprve rýsuje. Nvidii a další partnery bude dál široce nasazovat na trénink i inferenci.

TechCrunch z tiskového hovoru cituje Richarda Ho. Do konce roku 2026 prý půjde o velmi malé objemy, výraznější nasazení až v roce 2027. Srovnání na Hot Chips je proti Nvidii Blackwell. Ho podle TechCrunche připouští, že než Jalapeño naběhne naplno, konkurence může být dál.

Ceny, termín dodávky zákazníkům mimo OpenAI ani počet objednaných racků v těch textech nejsou. Nevymýšlíme je.

## Co z toho plyne

Potvrzené je, že OpenAI zveřejnilo první InferenceX tabulky a slíbilo interní nasazení do konce roku. Násobky 1,5 až 1,9× na watt, 1,7 až 3,6× nižší latence i 2,1 až 4,1× u interaktivní zátěže jsou firemní. My hardware neměli a netestovali.

## Zdroje

- [Jalapeño's first results show industry-leading speed and efficiency in AI inference — OpenAI (25. 8. 2026)](https://openai.com/index/jalapeno-first-results/)
- [OpenAI and Broadcom unveil LLM-optimized inference chip — OpenAI (24. 6. 2026)](https://openai.com/index/openai-broadcom-jalapeno-inference-chip/)
- [OpenAI's Jalapeño chip is built for fast inference at scale, benchmarks show — TechCrunch (25. 8. 2026)](https://techcrunch.com/2026/08/25/openais-jalapeno-chip-is-built-for-fast-inference-at-scale-benchmarks-show/)
- [OpenAI's upcoming Jalapeño chip looks like it'll be an inference beast — The Register (25. 8. 2026)](https://www.theregister.com/systems/2026/08/25/openais-upcoming-jalapeno-chip-looks-like-itll-be-an-inference-beast/5292052)
