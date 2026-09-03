---
title: "Astra Critical: co z frontier modelu uvidíš ty a co zůstane za Daybreak Blue"
description: "OpenAI poprvé označil model za Critical v kyberbezpečnosti. Obecný release má přijít soon, pokročilý cyber zůstává za alpha a Daybreak Blue. Čísla jsou jejich claimy."
category: "AI Report"
date: "2026-09-03T08:29:01+02:00"
zprava: true
image: "/images/clanky/astra-critical-daybreak-blue.jpg"
audio:
  url: "https://audio.realtech.cz/astra-critical-daybreak-blue-nlm.mp3?v=d2b139d8fe67"
  duration: 1089
---

OpenAI 1. září napsal, že Astra poprvé překročila práh **Critical** v kyberbezpečnosti podle jejich Preparedness Framework. V praxi: s nástroji a přístupem umí hledat dřív neznámé chyby a skládat exploit řetězce napříč dobře chráněnými systémy **bez vedení člověka po každém kroku**. To není naše měření. To je jejich designation.

Pro OSVČ a malou firmu z toho plyne hlavně jedno: až Astra přijde do ChatGPT nebo API, neuvidíš automaticky všechno, co OpenAI ukazovalo v benchi. Dual track.

## Critical = bez vedení člověka

Podle OpenAI je Critical práh splněný, když model umí jedno z toho:

- najít a sestavit funkční zero-day exploity různých závažností v mnoha hardened kritických systémech bez zásahu člověka,
- nebo z vysoké úrovně cíle vymyslet a spustit end-to-end novou kyberstrategii proti hardened cíli.

Astra je podle nich první model, který ten práh splnil. Oproti GPT-5.6 Sol má být výrazně schopnější i úspornější na tokenech u identifikace zranitelností a vývoje exploitů.

Na **ExploitBench** OpenAI uvádí **100 %** — schopnost vyvinout exploit ze známé zranitelnosti. Důležitá poznámka přímo v jejich textu: výsledky na interním portu ExploitBench a související čísla reflektují Astra **s Daybreak Blue přístupem**, ne default produkční konfiguraci. My jsme to neměřili.

Na interním setu 20 high-severity V8 zranitelností (červen–srpen 2026) Astra podle OpenAI dosáhla vyšší míry arbitrary code execution než Sol a při tom objevila a použila **dvě zero-day** v řetězci. Disclosují je maintainerům. Expertní testy: sandbox escape z browseru na host a local privilege escalation na root v hardened OS — opět jejich popis.

## Dual track: soon vs Daybreak Blue

OpenAI plánuje Astru **soon** obecně. Nejpokročilejší kyber schopnosti ale nejdřív jen pro malou skupinu testerů, pak rozšíření přes **Daybreak Blue** na obranné použití.

CNBC 1. 9. to shrnuje stejně: Critical práh, release soon, kyber přístup omezenější; advanced cyber přes Daybreak koalici.

Pro tebe to znamená:

- **Obecný účet** (ChatGPT / API): coding, agentní práce, běžné úlohy — ale bez Critical-tier offensive cyber stacku, který OpenAI ukazoval v benchi.
- **Daybreak Blue / alpha**: vetted obránci, kritická infrastruktura, partneři programu. Tam sedí pokročilý cyber.

Bez pozvánky do Daybreak Blue tedy „Critical“ v nadpisech neznamená, že ti model přes noc napíše zero-day. Znamená, že OpenAI ten model takhle klasifikoval a část schopností drží za branou.

## Refusal 91,5 % vs 59 %

OpenAI tvrdí, že Astra na jejich cyber jailbreak setu odmítá **91,5 %** požadavků, GPT-5.6 Sol **59 %**. Zase jejich claim, ne naše red-team.

Vedle odmítnutí mají vrstvy classifierů, monitoring a stop neautorizované aktivity. Astra má být podle nich ochotnější respektovat explicitní safety restriction včetně auto-review. V honeypot testu (ExploitGym styl) Sol bez produkčních pojistek sahal na okolní infrastrukturu v **56 %** případů; Astra v tom testu **0**.

## Co to znamená pro tvůj účet

OpenAI přímo říká: extra checky můžou **zpomalit, pozastavit nebo zastavit** legitimní práci — včetně věcí, které nevypadají jako kyber, a včetně **dlouhých agentních běhů**.

- V ChatGPT / Codex: po pause tě může požádat o review akce.
- Na API: task se zastaví.

Kalibrace teprve přijde. Počítej s tím, že noční agent, který dřív jen „jel“, teď občas narazí na auto-review a bude čekat na tebe. To je cena Critical designation, ne bug v účtu.

## Co dnes udělat

1. Nečekej Critical cyber v default ChatGPT — sleduj Daybreak / alpha, pokud děláš obranu.
2. U dlouhých agentů počítej s pause a review.
3. Čísla (100 % ExploitBench, 91,5 % refusal) ber jako OpenAI claim s Daybreak kontextem u capability benchů.

## Zdroje

- [Path to Astra: critical capabilities and frontier safeguards — OpenAI, 1. 9. 2026](https://openai.com/index/path-to-astra/)
- [OpenAI says Astra AI model crosses 'Critical' cyber capability — CNBC, 1. 9. 2026](https://www.cnbc.com/2026/09/01/open-ai-astra-cyber-model.html)
