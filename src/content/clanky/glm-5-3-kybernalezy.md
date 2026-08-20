---
title: "Čínský model našel 2 436 reálných děr v softwaru. Váhy vyjdou až za dva týdny, prý kvůli bezpečnosti"
description: "Z.ai vydala GLM-5.3. Kromě skoku v programování jí při tréninku vyrostla schopnost, kterou nečekali — hledání a zneužívání zranitelností. Nejstarší nalezená chyba je z roku 1981."
category: "AI Report"
date: "2026-08-14"
zprava: true
image: "/images/clanky/glm-5-3-kybernalezy.jpg"
---

Čínská Z.ai (dřív Zhipu) dnes ráno vydala **GLM-5.3** a je to zvláštní release. Nový model totiž **stojí na úplně stejném základu jako GLM-5.2** — celý rozdíl vznikl až doladěním po tréninku. A ten rozdíl je pořádný.

## Skok v agentním kódování

Na Terminal-Bench 3.0 šel model **z 4,6 na 28,3 bodu**, na DeepSWE z 46,2 na 66,9. Zajímavější než čísla je ale efektivita: na vlastním interním benchmarku Z.ai Code Bench dosáhne GLM-5.3 při „high" nastavení **31,4 % s asi 50 tisíci vygenerovanými tokeny na úlohu** — zatímco Claude Opus 4.8 zvládne 29,5 %, ale spotřebuje na to 120 tisíc tokenů. Claude Fable 5 zůstává napřed (39,5 %), jenže za jinou cenu.

## Co jim vyrostlo nechtěně

Do tréninkové směsi přidali data o hledání zranitelností. Čekali, že model bude o něco lepší v analýze chyb. Podle vlastních slov je překvapilo, **jak rychle ta schopnost rostla dál** — model se přestal zastavovat u izolovaných chyb a začal skládat celé řetězce zneužití.

Na CyberGym, kde jde o nalezení a potvrzení díry ve zdrojáku, dává GLM-5.3 **84,5 %** a je na tom benchmarku nejlepší ze všech — před Mythosem 5 (83,8 %) i GPT-5.6 Sol (83,6 %). O patro výš, na ExploitBench, sice svůj výsledek proti GLM-5.2 víc než zdvojnásobil (24,4 → 54,4 %), ale na Mythos 5 se 78 % pořád nemá. Sama Z.ai to shrnuje nepříjemně přesně: **schopnosti rostou nejrychleji přesně tam, kde nejvíc zaostávají.**

A pak je tu ta část, co není z laboratoře. S bezpečnostními týmy v Číně model pustili na reálné kódové báze. Po expertní kontrole a odstranění duplicit z toho vyšlo **2 436 zranitelností ve 269 projektech**, z toho 1 097 se střední až vysokou závažností — v jádrech systémů, prohlížečových enginech i síťových protokolech. Nejstarší chyba se do kódu dostala **v roce 1981** a průměrně tam nález ležel nevšimnutý **26,6 roku**.

## Váhy až za dva týdny

Model je od dneška dostupný přes GLM Coding Plan a ZCode. **[Otevřené váhy](/clanky/cina-exportni-kontroly-ai-modely/) ale Z.ai slibuje až dva týdny po startu — „až bude hotové bezpečnostní vyhodnocení a hardening".** Předchozí GLM šly ven pod MIT licencí prakticky hned. Čínská laboratoř, která sama zdrží vydání vah kvůli bezpečnosti, je docela nový obrázek.

## Zdroj

- [GLM-5.3: Frontier Coding with Emergent Cyber Capabilities — Z.ai (14. 8. 2026)](https://z.ai/blog/glm-5.3)
