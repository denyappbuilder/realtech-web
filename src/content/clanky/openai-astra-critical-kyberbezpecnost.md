---
title: "OpenAI poprvé označilo svůj model za „kritický\" v kyberbezpečnosti. Astra dostala izolované prostředí a dohled nad myšlením"
description: "Interní testy nadcházejícího modelu Astra vyšly tak silně, že OpenAI nedokáže vyloučit nejvyšší stupeň nebezpečnosti podle svého Preparedness Frameworku. Poprvé v historii firmy."
category: "AI Report"
date: "2026-08-08"
zprava: true
image: "/images/clanky/openai-astra-critical-kyberbezpecnost.jpg"
---

OpenAI v pátek 7. srpna oznámilo něco, co dosud nikdy neudělalo: svůj **nadcházející model Astra** zařadilo jako **první „critical" model pro kyberbezpečnost** podle vlastního [Preparedness Frameworku](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/). Doslova píší, že po interních testech „**posledních pár dní**" a po posudcích expertů došli **„včera v noci"** k závěru, že kritické kybernetické schopnosti u Astry **nedokážou vyloučit**.

Pro srovnání: dosavadní modely včetně **GPT-5.6-Sol** se v téhle kategorii vždycky zastavily o stupeň níž, na hodnocení **High**.

## Co „Critical" v jejich škále vlastně znamená

Definice z frameworku není měkká. Model dosáhne kritického prahu, když dokáže **sám, bez zásahu člověka, najít a vyvinout funkční zero-day exploity všech úrovní závažnosti v mnoha zabezpečených reálných kritických systémech** — nebo když z pouhého obecně zadaného cíle vymyslí a provede **kompletní novou strategii kyberútoku proti tvrdým cílům**.

OpenAI zdůrazňuje, že jde zatím o **předběžné hodnocení** — model dál benchmarkují. Ale výsledky jsou podle nich dost silné na to, aby se chovali, jako by ten práh padl.

## Co s tím dělají

Opatření, která firma vyjmenovala, jsou dost tvrdá:

- **Izolovaná testovací prostředí**, omezený přístup k síti i nástrojům, sandboxované spouštění
- **Silnější ochrana a šifrování vah** modelu
- **Pozastavení interních aktivit** s Astrou, které zatím nesplňují zpřísněné bezpečnostní požadavky
- **Plošný monitoring** rizikových akcí napříč všemi agentními nasazeními Astry — monitory čtou modelu **chain of thought** a při vysoce rizikové aktivitě spustí bezpečnostní reakci, která běh přeruší
- Testování ve spolupráci s **vládními agenturami** a vybranými organizacemi pro bezpečnost AI

Precedens už mají: v červnu 2025 podobně reagovali, když jejich modely dosáhly stupně High v biologii.

## Jedna věta, která stojí za pozornost

V textu je mimochodem schovaná poznámka, že Astra **nebyla zapojena do [exploitace Hugging Face](/clanky/openai-agent-hack-hugging-face/)**. OpenAI k tomu víc nepíše — ale samotná potřeba tohle explicitně vyvracet naznačuje, že se na pozadí děje ještě něco dalšího.

Firma zároveň tlačí na to, že takhle schopné modely mají hlavně **pomáhat obráncům** najít díry dřív než útočníci, a že chce Astru zpřístupnit „široce". Což je přesně ta rovnice, kterou zatím nikdo nevyřešil: nástroj, co umí sám psát zero-daye, nerozlišuje, kdo ho drží v ruce.
