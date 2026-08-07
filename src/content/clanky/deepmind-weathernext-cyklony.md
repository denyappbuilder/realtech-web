---
title: "DeepMind uvolnil model, který předpovídá hurikány o den dřív. Váhy jsou zdarma na GitHubu"
description: "WeatherNext dostal článek v Nature: tříd­enní předpověď dráhy i síly cyklonu je stejně přesná jako dřívější dvoudenní. Google k tomu otevřel kód i váhy modelu."
category: "AI Report"
date: 2026-08-07
zprava: true
image: "/images/clanky/deepmind-weathernext-cyklony.jpg"
---

Google DeepMind ve čtvrtek 6. srpna zveřejnil v **Nature** práci k modelu **WeatherNext** — a rovnou k ní **otevřel kód i váhy** na GitHubu. Podstata: model předpovídá u tropických cyklonů zároveň **dráhu, sílu i strukturu větru** a dělá to zhruba o **jeden celý den** přesněji než dosavadní špička. Tříd­enní předpověď z WeatherNextu je podle měření tak dobrá jako to, co předchozí modely zvládly na dva dny dopředu.

DeepMind ten skok popisuje jako **ekvivalent deseti let pokroku** v meteorologii — a to není marketingová nadsázka vycucaná z prstu, ale porovnání s trendem zpřesňování předpovědí za posledních 20 let.

## Proč je to velká věc

Cyklony (hurikány, tajfuny) mají za posledních 50 let na svědomí **přes 700 000 mrtvých a 1,4 bilionu dolarů škod**. U evakuace přitom rozhoduje každá hodina — den navíc je rozdíl mezi „stihli jsme to" a „nestihli".

Technicky to bylo dosud rozdvojené. **Kam** cyklon poletí, řídí obří globální proudění, které se nejlíp modeluje hrubými globálními modely. **Jak silný** bude, závisí na jemné fyzice přímo v jádru bouře, na což se nasazovaly detailní lokální modely. WeatherNext to spojil do jednoho modelu.

A tady je ta překvapivá část: model si vystačí s rozlišením **28 × 28 km**, tedy asi **100× hrubším**, než na jaké byly zvyklé tradiční modely. Menší verze WeatherNext 2-mini jede dokonce na 111 × 111 km a pořád funguje dobře. DeepMind sám přiznává, že **úplně nechápe, jak to jde** — je to podle nich otevřená výzkumná otázka.

## Už to běželo naostro

Není to laboratorní demo. Model se podílel na předpovědi hurikánu **Melissa** v sezoně 2025, kde správně předpověděl rychlé zesílení a přistání na Jamajce, takže Národní centrum pro hurikány mohlo varovat s předstihem. Letos systém počítá **1 000 možných scénářů** pro každý cyklon — loni jich bylo 50. Jednu patnáctidenní předpověď zvládne na jedné TPU pod minutu.

Trénovalo se na **20 terabajtech** atmosférických dat a databázi zhruba **5 000 historických bouří** (IBTrACS). Na projektu dělal DeepMind s americkým Národním centrem pro hurikány, s CIRA a s britským Met Office.

Otevřené jsou modely **WeatherNext Cyclones** a **WeatherNext 2**, plus mini verze, která se rozjede v bezplatném Colabu. Předpovědi jsou k vidění na Weather Labu.

**Zdroj:** [Google DeepMind](https://deepmind.google/blog/weathernext-ai-model-achieves-breakthrough-in-forecasting-cyclones/), [Nature](https://www.nature.com/articles/s41586-026-10953-2), [GitHub](https://github.com/google-deepmind/weathernext)
