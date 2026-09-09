---
title: "NSA, FBI a CISA: čínské AI firmy průmyslově destilují americké modely"
description: "Joint advisory AA26-251A (8. 9.): DeepSeek, Moonshot, Alibaba, MiniMax, StepFun a Z.AI od konce 2024 tahaly miliardy tokenů z Claude, GPT, Gemini a Groku. Destilace má být jádro strategie, ne doplněk."
category: "AI Report"
date: "2026-09-09T09:30:00+02:00"
zprava: true
image: "/images/clanky/cisa-cinske-ai-destilace-us-modelu.jpg"
---

Tři americké bezpečnostní agentury, NSA, CISA a FBI, vydaly 8. září společné varování s označením AA26-251A. Tvrdí v něm, že šest čínských AI firem, konkrétně **DeepSeek, Moonshot AI, Alibaba, MiniMax, StepFun a Z.AI**, od konce roku 2024 systematicky vytahuje schopnosti z amerických špičkových modelů technikou destilace znalostí. Podle agentur šlo o miliardy tokenů v milionech dotazů na varianty modelů Claude, GPT, Gemini a Grok, a to „pravděpodobně s vědomím čínské vlády“.

Všechno níže jsou tvrzení tří agentur, ne ověřená fakta. Advisory neuvádí zdroje jednotlivých zjištění a jmenované firmy v něm slovo nedostaly. My jsme nic z toho nezávisle neověřovali.

## O co jde

Destilace znalostí je běžná a legitimní metoda: menší model se učí z odpovědí většího a schopnějšího. Agentury to samy připouštějí. Rozdíl podle nich dělá měřítko a záměr. Čínské firmy prý cíleně dolují chráněné funkce a schopnosti amerických modelů v průmyslovém objemu, v rozporu s podmínkami použití a s obcházením zeměpisných omezení. Destilace podle agentur tvoří jádro vývojové strategie těchto firem a zásadně jim zkracuje čas i náklady na trénink vlastního špičkového modelu.

## Kdo z čeho čerpal

**DeepSeek** vede podle advisory organizovanou kampaň nejméně od konce roku 2024. Syntetická trénovací data pro modely **R1 a V3** měl získávat mezi koncem 2024 a polovinou 2025 z modelů Claude 3.7, Claude Sonnet 4 a 4.5, Claude Opus 4.1, Gemini 2.5 Pro a Flash, GPT-4, GPT-4o, GPT-5 a Grok 4. Cílil na uvažování, právní specializaci, agentní funkce, psaní s pomocí řetězce myšlenek nebo optimalizaci pro dolaďování. Veřejně uváděných **5,6 milionu dolarů** za trénink je podle agentur zavádějící číslo, protože nezahrnuje skutečnou cenu takto získaných dat. Agentury v poznámce odkazují na technickou zprávu DeepSeek-V3, odkud částka pochází.

**Moonshot AI** měl podle dokumentu od poloviny 2025 získat „významný objem“ dat z modelu **Claude Fable 5** pro trénink svého **Kimi K3** a data z GPT-4o pro Kimi K2. Seznam zdrojů je u Moonshotu nejdelší: řada modelů Claude, GPT-5 včetně variant Codex a Pro, Gemini 2.5, obrazový model Nano Banana i Grok Code Fast-1. Šlo o dolaďování, posilované učení, softwarové inženýrství a matematiku. Kimi K3 jsme [popisovali v červenci](/clanky/kimi-k3-stop-predplatne/), když Moonshot kvůli návalu zájemců zastavil nová předplatná.

**Alibaba** podle agentur na konci roku 2025 destilovala Claude 4, Claude Opus a Sonnet a GPT-5 pro zlepšení rodiny **Qwen** v programování, zákaznických dialozích, tvorbě virtuálních postav a agentních postupech.

**MiniMax** měl ve stejné době vylepšovat model **M2** z Claude Code, Claude Sonnet 4 a Opus, Gemini 2.5 Pro a Gemini 3 Pro. Advisory k tomu přidává detail: MiniMax prý používal Claude Code i k vlastnímu internímu vývoji a pomocí injektovaných promptů se snažil nástroj přesvědčit, že je produktem MiniMaxu. Na nový model Claude měl MiniMax přesměrovat dotazy do 24 hodin od vydání.

**StepFun** podle agentur mezi koncem 2025 a začátkem 2026 čerpal z Claude Opus 4.1 a 4.5, Claude Sonnet a Haiku 4.5 a z řady GPT-5 až GPT-5.2 pro programovací a agentní funkce modelu **Step 4**. **Z.AI**, autor modelů GLM, měl do poloviny 2026 vytáhnout miliardy tokenů z **GPT-5.5 a Claude Opus 4.8** pro schopnost uvažování svého modelu.

## Jak to podle agentur probíhá

Dokument mapuje postupy na rámec MITRE ATLAS a přidává čtyři, které v něm zatím nejsou. Základem je šedý trh proxy služeb, kterým se v Číně říká „přestupní stanice“ (transfer stations). Ty přeprodávají přístup k americkým modelům za zlomek oficiální ceny a zároveň obcházejí regionální blokace a zametají stopy. Dotazy proudí přes několik cest zároveň: přímá API, cloudové poskytovatele, agregátory třetích stran a fondy účtů, aby se nedaly odhalit z jednoho místa.

Firmy si podle agentur hromadně kupují prémiová předplatná a sdílejí je mezi týmy vývojářů. StepFun měl provozovat celé fondy účtů, kde zaměstnanci běželi v mnoha paralelních sezeních s rozložením zátěže, aby nevyčerpali kvóty. Speciálně upravené prompty měly modely přimět k vypsání skrytého řetězce uvažování, který americké modely uživatelům běžně neukazují. DeepSeek prý žádal modely, aby si „představily“ vnitřní uvažování za hotovou odpovědí a krok po kroku ho popsaly. Infrastruktura automaticky odstraňovala z metadat identifikátory firem a při zablokování jedné cesty sama přepnula na jinou. Kontrolní pipeline měly rozeznat, kdy provozovatel modelu tajně vrací zhoršené odpovědi.

## Tři doporučení

Agentury adresují americkým AI firmám tři kroky. Zaprvé detekci: sledovat podezřelé prompty, účty a sítě, poměr předplatného k reálnému využití, nové účty okamžitě na maximálním limitu a provoz v objemu velké firmy. Zadruhé cílené úpravy odpovědí. Podezřelým dotazům odpovídat nenápadně jinak, třeba méně hlubokým uvažováním, jiným postupem ke správnému výsledku nebo levnějším modelem, a hlavně to podezřelému uživateli neoznamovat, aby nevěděl, kdy trénink vrátit zpět. Bezpečnostní výzkumníci a nezávislí hodnotitelé by naopak o změnách vědět měli. Zatřetí sdílení informací mezi poskytovateli modelů, cloudy a agregátory, protože distribuovanou kampaň jeden hráč sám nevidí.

Advisory nic nezakazuje a nic neukládá koncovým uživatelům. Kdo v Česku staví na Qwenu, Kimi nebo DeepSeeku, může dál. Je ale dobré vědět, že americká vláda teď oficiálně tvrdí, že část schopností těchto modelů pochází z modelů konkurence. V referencích dokument uvádí i text Anthropicu o odhalování destilačních útoků, zprávu Googlu o hrozbách kolem AI a memorandum Bílého domu k „nepřátelské destilaci“ amerických modelů. Jaké kroky budou následovat, z advisory nevyplývá.

## Zdroje

- [Joint Cybersecurity Advisory AA26-251A: China-Based AI Companies Conducting Industrial-Scale Distillation Campaigns Against U.S. AI Companies (CISA, NSA, FBI, 8. 9. 2026)](https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-251a)
- [CISA, NSA and FBI Warn of China-Based AI Companies Targeting US AI Models (tisková zpráva CISA, 8. 9. 2026)](https://www.cisa.gov/news-events/news/cisa-nsa-and-fbi-warn-china-based-ai-companies-targeting-us-ai-models-industrial-scale-knowledge)
- [US Says Alibaba, DeepSeek Have 'Systematically' Siphoned AI Models (Bloomberg, 9. 9. 2026)](https://www.bloomberg.com/news/articles/2026-09-09/us-says-alibaba-deepseek-have-systematically-siphoned-ai-models)
- [Intelligence agencies warn of China's large-scale AI model distillation efforts (Nextgov/FCW, 8. 9. 2026)](https://www.nextgov.com/artificial-intelligence/2026/09/intelligence-agencies-warn-chinas-large-scale-ai-model-distillation-efforts/415851/)
