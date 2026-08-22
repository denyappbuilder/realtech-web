---
title: "Čínský model našel 2 436 reálných děr v softwaru. Váhy vyjdou až za dva týdny, prý kvůli bezpečnosti"
description: "Z.ai vydala GLM-5.3. Kromě skoku v programování jí při tréninku vyrostla schopnost, kterou nečekali — hledání a zneužívání zranitelností. Nejstarší nalezená chyba je z roku 1981."
category: "AI Report"
date: "2026-08-14"
zprava: true
image: "/images/clanky/glm-5-3-kybernalezy.jpg"
audio:
  url: "https://realtech.cz/audio/clanky/glm-5-3-kybernalezy.mp3"
  duration: 140
  transcript: |-
    Čínská laboratoř Zet ej aj ráno vypustila model Dží el em pět tečka tři a ten našel dva tisíce čtyři sta třicet šest reálných děr v softwaru. Otevřené váhy ale ven pustí až za dva týdny, prý kvůli bezpečnosti.

    Novinka stojí na stejném základu jako Dží el em pět tečka dva. Rozdíl vznikl až doladěním po tréninku. Na Terminl benči tři nula šel model ze čtyř celých šesti na dvacet osm celých tři bodu, na Díp es vé í ze šestačtyřiceti celých dvou na šedesát šest celých devět. Na vlastním Zet ej aj Koud benči dá při nastavení haj jednatřicet celých čtyři procenta s asi padesáti tisíci tokeny na úlohu. Klaud Oupus čtyři tečka osm zvládne devětadvacet celých pět, ale spálí sto dvacet tisíc tokenů. Klaud Fejbl pět zůstává napřed s devětatřiceti celými pěti, jenže za jinou cenu.

    Do tréninku přidali data o hledání zranitelností. Čekali mírné zlepšení. Místo toho se model přestal zastavovat u izolovaných děr a začal skládat řetězce zneužití. Na Sajbr džimu dává osmdesát čtyři celých pět procent a je nejlepší ze všech. Předběhl Mýtos pět i Dží pí tý pět tečka šest Sol. Na Eksploit benči výsledek víc než zdvojnásobil, ze čtyřiadvaceti celých čtyř na čtyřiapadesát celých čtyři. Na Mýtos pět se sedmdesáti osmi procenty pořád nemá. Sama laboratoř to říká narovinu. Schopnosti rostou nejrychleji tam, kde nejvíc zaostávají.

    S čínskými bezpečnostními týmy pak model pustili na ostré kódové báze. Po expertní kontrole a odstranění duplicit vyšlo dva tisíce čtyři sta třicet šest zranitelností ve dvou stech šedesáti devíti projektech. Tisíc devadesát sedm z nich je střední až vysoké závažnosti. Jádra systémů, prohlížečové endžiny i síťové protokoly. Nejstarší chyba se do kódu dostala v roce tisíc devět set osmdesát jedna a průměrně tam nález ležel nevšimnutý šestadvacet celých šest roku. Model je od dneška dostupný přes Dží el em Kouding plán a Zet kód. Váhy slibují až dva týdny po startu.

    Zdroj informací: oficiální blog Zet ej aj ze čtrnáctého srpna roku dva tisíce dvacet šest.
---

Čínská Z.ai (dřív Zhipu) dnes ráno vydala **GLM-5.3** a je to zvláštní release. Nový model totiž **stojí na úplně stejném základu jako GLM-5.2** — celý rozdíl vznikl až doladěním po tréninku. A ten rozdíl je pořádný.

## Skok v agentním kódování

Na Terminal-Bench 3.0 šel model **z 4,6 na 28,3 bodu**, na DeepSWE z 46,2 na 66,9. Zajímavější než čísla je ale efektivita: na vlastním interním benchmarku Z.ai Code Bench dosáhne GLM-5.3 při „high" nastavení **31,4 % s asi 50 tisíci vygenerovanými tokeny na úlohu** — zatímco Claude Opus 4.8 zvládne 29,5 %, ale spotřebuje na to 120 tisíc tokenů. Claude Fable 5 zůstává napřed (39,5 %), jenže za jinou cenu.

## Co jim vyrostlo nechtěně

Do tréninkové směsi přidali data o hledání zranitelností. Čekali, že model bude o něco lepší v analýze chyb. Podle vlastních slov je překvapilo, **jak rychle ta schopnost rostla dál** — model se přestal zastavovat u izolovaných chyb a začal skládat celé řetězce zneužití.

Na CyberGym, kde jde o nalezení a potvrzení díry ve zdrojáku, dává GLM-5.3 **84,5 %** a je na tom benchmarku nejlepší ze všech — před Mythosem 5 (83,8 %) i GPT-5.6 Sol (83,6 %). O patro výš, na ExploitBench, sice svůj výsledek proti GLM-5.2 víc než zdvojnásobil (24,4 → 54,4 %), ale na Mythos 5 se 78 % pořád nemá. Sama Z.ai to shrnuje nepříjemně přesně: **schopnosti rostou nejrychleji přesně tam, kde nejvíc zaostávají.**

A pak je tu ta část, co není z laboratoře. S bezpečnostními týmy v Číně model pustili na reálné kódové báze. Po expertní kontrole a odstranění duplicit z toho vyšlo **2 436 zranitelností ve 269 projektech**, z toho 1 097 se střední až vysokou závažností — v jádrech systémů, prohlížečových enginech i síťových protokolech. Nejstarší chyba se do kódu dostala **v roce 1981** a průměrně tam nález ležel nevšimnutý **26,6 roku**.

## Váhy až za dva týdny

Model je od dneška dostupný přes GLM Coding Plan a ZCode. **Otevřené váhy ale Z.ai slibuje až dva týdny po startu — „až bude hotové bezpečnostní vyhodnocení a hardening".** Předchozí GLM šly ven pod MIT licencí prakticky hned. Čínská laboratoř, která sama zdrží vydání vah kvůli bezpečnosti, je docela nový obrázek.

## Zdroj

- [GLM-5.3: Frontier Coding with Emergent Cyber Capabilities — Z.ai (14. 8. 2026)](https://z.ai/blog/glm-5.3)
