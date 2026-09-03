---
title: "Astra na prahu Critical: co z nejvýkonnějšího modelu uvidíš ty a co zůstane za Daybreak Blue"
description: "OpenAI poprvé označil model za Critical v kyberbezpečnosti. Obecné vydání má přijít brzy, pokročilé kyber schopnosti zůstávají za testovací skupinou a programem Daybreak Blue. Čísla jsou jejich tvrzení."
category: "AI Report"
date: "2026-09-03T08:29:01+02:00"
zprava: true
image: "/images/clanky/astra-critical-daybreak-blue.jpg"
audio:
  url: "https://audio.realtech.cz/astra-critical-daybreak-blue-nlm.mp3?v=d2b139d8fe67"
  duration: 1089
---

OpenAI 1. září napsal, že Astra poprvé překročila práh **Critical** v kyberbezpečnosti podle jejich rámce připravenosti (Preparedness Framework). V praxi: s nástroji a přístupem umí hledat dřív neznámé chyby a skládat řetězce zneužití napříč dobře chráněnými systémy **bez vedení člověka po každém kroku**. To není naše měření. To je jejich označení.

Pro OSVČ a malou firmu z toho plyne hlavně jedno: až Astra přijde do ChatGPT nebo přes API, neuvidíš automaticky všechno, co OpenAI ukazovalo ve srovnávacích testech. Jdou dvě koleje.

## Critical = bez vedení člověka

Podle OpenAI je práh Critical splněný, když model umí jedno z toho:

- najít a sestavit funkční zneužití dosud neznámých chyb (zero-day) různých závažností v mnoha dobře chráněných kritických systémech bez zásahu člověka,
- nebo z hrubého zadání vymyslet a spustit od začátku do konce novou kyberstrategii proti dobře chráněnému cíli.

Astra je podle nich první model, který ten práh splnil. Oproti GPT-5.6 Sol má být výrazně schopnější i úspornější na tokenech u hledání zranitelností a vývoje zneužití.

Na **ExploitBench** OpenAI uvádí **100 %** — schopnost vyvinout zneužití ze známé zranitelnosti. Důležitá poznámka přímo v jejich textu: výsledky na interním portu ExploitBench a související čísla platí pro Astru **s přístupem Daybreak Blue**, ne pro výchozí ostré nastavení. My jsme to neměřili.

Na interním souboru 20 závažných zranitelností prohlížeče V8 (červen–srpen 2026) Astra podle OpenAI dosáhla vyšší míry spuštění libovolného kódu než Sol a při tom objevila a použila **dvě dosud neznámé chyby** v řetězci. Předávají je správcům projektu. Expertní testy: únik z izolovaného prostředí prohlížeče na hostitelský počítač a místní zvýšení práv na root v dobře chráněném systému — opět jejich popis.

## Dvě koleje: brzy versus Daybreak Blue

OpenAI plánuje Astru **brzy** obecně. Nejpokročilejší kyber schopnosti ale nejdřív jen pro malou skupinu testerů, pak rozšíření přes **Daybreak Blue** na obranné použití.

CNBC 1. 9. to shrnuje stejně: práh Critical, vydání brzy, kyber přístup omezenější; pokročilé kyber schopnosti přes koalici Daybreak.

Pro tebe to znamená:

- **Obecný účet** (ChatGPT / API): programování, agentní práce, běžné úlohy — ale bez útočné kyber sady na úrovni Critical, kterou OpenAI ukazovalo ve srovnávacích testech.
- **Daybreak Blue / testeři**: ověření obránci, kritická infrastruktura, partneři programu. Tam sedí pokročilý kyber.

Bez pozvánky do Daybreak Blue tedy „Critical“ v nadpisech neznamená, že ti model přes noc napíše zneužití dosud neznámé chyby. Znamená, že OpenAI ten model takhle zařadil a část schopností drží za branou.

## Odmítnutí 91,5 % proti 59 %

OpenAI tvrdí, že Astra na jejich sadě pokusů obejít kyber zákazy odmítá **91,5 %** požadavků, GPT-5.6 Sol **59 %**. Zase jejich tvrzení, ne náš vlastní test.

Vedle odmítnutí mají vrstvy filtrů, sledování a zastavení nepovolené aktivity. Astra má být podle nich ochotnější respektovat výslovné bezpečnostní omezení včetně automatické kontroly. V testu s pastí (styl ExploitGym) Sol bez ostrých pojistek sahal na okolní infrastrukturu v **56 %** případů; Astra v tom testu **0**.

## Co to znamená pro tvůj účet

OpenAI přímo říká: extra kontroly můžou **zpomalit, pozastavit nebo zastavit** legitimní práci — včetně věcí, které nevypadají jako kyber, a včetně **dlouhých agentních běhů**.

- V ChatGPT / Codex: po zastavení tě může požádat o kontrolu akce.
- Na API: úloha se zastaví.

Nastavení se teprve dolaďuje. Počítej s tím, že noční agent, který dřív jen „jel“, teď občas narazí na automatickou kontrolu a bude čekat na tebe. To je cena označení Critical, ne chyba v účtu.

## Co dnes udělat

1. Nečekej Critical kyber ve výchozím ChatGPT — sleduj Daybreak / první testovací skupinu, pokud děláš obranu.
2. U dlouhých agentů počítej se zastavením a kontrolou.
3. Čísla (100 % ExploitBench, 91,5 % odmítnutí) ber jako tvrzení OpenAI, u srovnávacích testů schopností v kontextu Daybreak Blue.

## Zdroje

- [Path to Astra: critical capabilities and frontier safeguards — OpenAI, 1. 9. 2026](https://openai.com/index/path-to-astra/)
- [OpenAI says Astra AI model crosses 'Critical' cyber capability — CNBC, 1. 9. 2026](https://www.cnbc.com/2026/09/01/open-ai-astra-cyber-model.html)
