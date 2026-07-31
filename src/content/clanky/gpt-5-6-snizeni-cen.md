---
title: "OpenAI srazilo cenu GPT-5.6 Luna o 80 %. Levnější AI je tu, ale je v tom háček"
description: "Luna zlevnila o 80 %, Terra o 20 %. Zároveň se mění, jak rychle ti v Codexu a ChatGPT Work ubývají kredity. Co to znamená v praxi."
category: "AI Report"
date: 2026-07-31
image: "/images/clanky/gpt-5-6-snizeni-cen.jpg"
zprava: true
---

OpenAI oznámilo 30. července zlevnění dvou ze tří modelů rodiny GPT-5.6. A nejde o kosmetiku — **Luna, nejrychlejší a nejlevnější model, spadla o 80 %**. Vyvážená **Terra zlevnila o 20 %**. Nejsilnější Sol zůstává na stejné ceně.

## Konkrétní čísla

Od 30. července stojí v API:

- **Terra** — 2 dolary za milion vstupních tokenů, 12 dolarů za milion výstupních
- **Luna** — 0,20 dolaru za vstupní milion, 1,20 dolaru za výstupní
- **Sol** — beze změny

Pro srovnání: milion výstupních tokenů z Luny tě teď vyjde na něco přes 25 korun (kurz ČNB 21,05 Kč za dolar). Rozjezd cen v AWS měl podle OpenAI začít ještě týž den.

## Proč by tě to mělo zajímat, i když API nepoužíváš

Tohle je ta zajímavější část. Snížené ceny se promítají i do toho, **jak se u tebe počítá spotřeba v Codexu a ChatGPT Work**. Ceny předplatného ani velikost kvót se nemění — ale Terra a Luna teď ukrojí z tvého měsíčního rozpočtu **míň kreditů než dřív**. Prakticky: za stejné peníze uděláš víc práce, pokud netlačíš všechno přes Sol.

Kdo má Free nebo Go, dostane se v Codexu a ChatGPT Work k Terře. Plus, Pro, Business a Enterprise si můžou vybrat mezi Terrou a Lunou.

## A ten háček

Zároveň OpenAI mění placený rychlostní režim. **Fast mode nahrazuje dosavadní Priority Processing** — u modelu Sol slibuje až 2,5× vyšší rychlost proti standardnímu zpracování, ale **za dvojnásobnou cenu**. Inteligence modelu je prý stejná, platíš čistě za rychlost. Staré požadavky označené `priority` budou automaticky používat Fast mode, takže se nic nerozbije.

Takže shrnuto: levné modely výrazně zlevnily, ale za rychlost u toho nejsilnějšího si teď připlatíš explicitně.

## Odkud ty úspory jsou

OpenAI tvrdí, že mu s optimalizací pomohl vlastní model. Sol podle firmy autonomně přepsal a optimalizoval produkční kernely a navrhl stovky experimentů na zlepšení generování tokenů. Výsledek: **o 20 % nižší koncové náklady na provoz modelu** a o víc než 15 % efektivnější generování tokenů. Celé to běželo pod lidským dohledem, ne samo o sobě.

Jestli je pravda i marketingově znějící tvrzení, že Luna překonává Fable 5 na profesních úlohách při zhruba o 99 % nižší ceně za úlohu, si ověříme sami. Ale i kdyby to bylo z poloviny, na hromadné rutinní úlohy to mění matematiku dost zásadně.

## Zdroj

[OpenAI — Advancing the price-performance frontier with GPT-5.6](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/)
