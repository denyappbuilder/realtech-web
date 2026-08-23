---
title: "OpenAI přiznal dvoutýdenní pauzu v trénování. A největší plánovaný běh drží zastavený dodnes"
description: "Po hacku Hugging Face a zjištění, že model Astra může být kyberkriticky nebezpečný, OpenAI zastavil RL trénink svých nejnovějších modelů. Monitoring ho teď stojí pětinu výpočetního výkonu."
category: "AI Report"
date: "2026-08-19"
image: "/images/clanky/openai-pauza-rl-treninku-astra.jpg"
zprava: true
audio:
  url: "https://audio.realtech.cz/openai-pauza-rl-treninku-astra-v3.mp3?v=5cff8f07637b"
  duration: 151
  transcript: |-
    OpenAI přiznalo, že samo zpomalilo vývoj: na dva týdny zastavilo trénink posilovaným učením a největší plánovaný běh drží vypnutý dodnes.

    Osmnáctého srpna zveřejnilo text, který se v branži nevidí často. Jde o třetí díl příběhu, který běží od července. Sešly se dvě věci. Nejdřív incident s Hugging Face, kdy si agent OpenAI sám otevřel cestu do cizí infrastruktury. Pak zjištění, že chystaný model Astra může splňovat hranici Critical v kyberbezpečnosti podle vlastního Preparedness Frameworku firmy. Tohle OpenAI podle nového textu určilo sedmého srpna.

    Reakce byla tvrdá. Dvoutýdenní pauza v tréninku posilovaným učením u modelů určených k nasazení. Mezitím firma zpevňovala a bezpečnostně testovala své výzkumné prostředí. Většina méně rizikových běhů se už rozjela zpátky. Jedna věta ale stojí za zopakování: největší plánovaný frontier RL běh zůstává pozastaven.

    Takže pauza neskončila úplně. Nejvýkonnější trénink pořád stojí. Firma zatím jede menší běhy, aby si ověřila chování modelu a doložila soulad modelu, než pustí ten velký.

    Nejzajímavější číslo je provozní. Nový monitoring začíná aktivačními klasifikátory, které kontrolují vnitřní aktivitu modelu při každém vzorkovaném tokenu a podezření eskalují k automatickým vyšetřovatelům. Cílem je vydat poplach do třiceti minut. A když tým do dalších třiceti minut nedokáže potvrdit, že jde o planý poplach, má činnost zastavit.

    Ten dohled něco stojí. OpenAI odhaduje režii monitoringu na zhruba dvacet procent výpočetního výkonu, který hlídá. Pětina výkonu jde na dohled nad zbytkem. Nové bezpečnostní standardy pro výzkumná prostředí si podle firmy vyžádaly náklady a zdržení nejpokročilejšího výzkumu.

    Preparedness Framework se bude přepisovat. OpenAI samo říká, že současný rámec nestačí a je potřeba širší přístup. Technickou zprávu o poučení z Hugging Face slibuje v nejbližších týdnech.

    Tohle je poprvé, co laboratoř veřejně vyčíslila, kolik ji bezpečnost stojí ve výkonu a ve zpoždění. Dokud byla bezpečnost jen kapitola v PR textu, šlo ji slibovat zdarma. Dvacet procent výkonu a zastavený hlavní trénink už zdarma nejsou.

    Zdroj informací: oficiální text OpenAI o tempu vývoje modelů v éře kyberkritických schopností.
  ttsScript: |-
    OpenAI přiznalo, že samo zpomalilo vývoj: na dva týdny zastavilo trénink posilovaným učením a největší plánovaný běh drží vypnutý dodnes.

    Osmnáctého srpna zveřejnilo text, který se v branži nevidí často. Jde o třetí díl příběhu, který běží od července. Sešly se dvě věci. Nejdřív incident s Haging Fejs, kdy si agent OpenAI sám otevřel cestu do cizí infrastruktury. Pak zjištění, že chystaný model Astra může splňovat hranici Kritikl v kyberbezpečnosti podle vlastního Pripérdnes frejmvorku firmy. Tohle OpenAI podle nového textu určilo sedmého srpna.

    Reakce byla tvrdá. Dvoutýdenní pauza v tréninku posilovaným učením u modelů určených k nasazení. Mezitím firma zpevňovala a bezpečnostně testovala své výzkumné prostředí. Většina méně rizikových běhů se už rozjela zpátky. Jedna věta ale stojí za zopakování: největší plánovaný frantýr ár-el běh zůstává pozastaven.

    Takže pauza neskončila úplně. Nejvýkonnější trénink pořád stojí. Firma zatím jede menší běhy, aby si ověřila chování modelu a doložila soulad modelu, než pustí ten velký.

    Nejzajímavější číslo je provozní. Nový monitoring začíná aktivačními klasifikátory, které kontrolují vnitřní aktivitu modelu při každém vzorkovaném tokenu a podezření eskalují k automatickým vyšetřovatelům. Cílem je vydat poplach do třiceti minut. A když tým do dalších třiceti minut nedokáže potvrdit, že jde o planý poplach, má činnost zastavit.

    Ten dohled něco stojí. OpenAI odhaduje režii monitoringu na zhruba dvacet procent výpočetního výkonu, který hlídá. Pětina výkonu jde na dohled nad zbytkem. Nové bezpečnostní standardy pro výzkumná prostředí si podle firmy vyžádaly náklady a zdržení nejpokročilejšího výzkumu.

    Pripérdnes frejmvork se bude přepisovat. OpenAI samo říká, že současný rámec nestačí a je potřeba širší přístup. Technickou zprávu o poučení z Haging Fejs slibuje v nejbližších týdnech.

    Tohle je poprvé, co laboratoř veřejně vyčíslila, kolik ji bezpečnost stojí ve výkonu a ve zpoždění. Dokud byla bezpečnost jen kapitola v pí-ár textu, šlo ji slibovat zdarma. Dvacet procent výkonu a zastavený hlavní trénink už zdarma nejsou.

    Zdroj informací: oficiální text OpenAI o tempu vývoje modelů v éře kyberkritických schopností.
---

OpenAI včera zveřejnil text, který se v branži nevidí často: přiznání, že **sám zpomalil vývoj**. A není to marketingové gesto — jde o třetí díl příběhu, který jsme tady sledovali od července.

## Co se stalo

Sešly se dvě věci. Nejdřív [incident s Hugging Face](/clanky/openai-agent-hack-hugging-face), kdy si agent OpenAI sám otevřel cestu do cizí infrastruktury. Pak [zjištění, že chystaný model Astra](/clanky/openai-astra-critical-kyberbezpecnost) může splňovat hranici **Critical** v kyberbezpečnosti podle vlastního Preparedness Frameworku firmy — což OpenAI podle nového textu určil **7. srpna**.

Reakce: **dvoutýdenní pauza v reinforcement learning tréninku** modelů určených k nasazení, zatímco firma zpevňovala a red-teamovala své výzkumné prostředí. Většina méně rizikových běhů se už rozjela zpátky. Ale jedna věta v textu stojí za zvýraznění:

> „Náš největší plánovaný frontier RL běh zůstává pozastaven."

Tedy: pauza neskončila úplně. Nejvýkonnější trénink, který OpenAI chystal, stále stojí — firma zatím jede menší běhy, aby si ověřila chování modelu a doložila alignment, než pustí ten velký.

## Cena za bezpečnost je vyčíslená

Nejzajímavější číslo v celém textu je provozní. Nový monitoring funguje na několik stupňů — začíná **aktivačními klasifikátory, které kontrolují vnitřní aktivitu modelu při každém vzorkovaném tokenu** a eskalují podezření k automatickým vyšetřovatelům. Cíl je vydat poplach do 30 minut. A když tým do dalších 30 minut nedokáže potvrdit, že jde o planý poplach, **má činnost zastavit**.

To něco kosí: OpenAI odhaduje režii monitoringu na **cca 20 % výpočetního výkonu**, který hlídá. Pětina výkonu jde na dohled nad zbytkem. Firma zároveň píše, že nové bezpečnostní standardy pro výzkumná prostředí „si vyžádaly velké náklady a zdržení frontier výzkumu".

## Proč to sledovat

Preparedness Framework se bude přepisovat — OpenAI sám říká, že současný rámec nestačí a je potřeba „širší přístup". Technickou zprávu o poučení z Hugging Face slibuje v nejbližších týdnech.

Pro nás je podstatná ta obecnější věc: tohle je poprvé, co velká laboratoř veřejně vyčíslila, **kolik ji bezpečnost stojí ve výkonu a ve zpoždění**. Dokud byla bezpečnost jen kapitola v PR textu, šlo ji slibovat zdarma. Dvacet procent compute a zastavený hlavní trénink už zdarma nejsou.

**Zdroj:** [OpenAI — Pacing model development in an era of cyber-critical capabilities](https://openai.com/index/pacing-model-development-cyber-capabilities/)
