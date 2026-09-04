---
title: "GPT-6 Astra je venku. Dnes ji má hrstka firem, Plus a Pro čekají několik dní"
description: "OpenAI 3. září vydal GPT-6 Astra. Přístup zatím dostala omezená skupina organizací, ChatGPT Plus, Pro, Business, Enterprise, API a AWS mají přijít v následujících dnech. API stojí 10 a 50 dolarů za milion tokenů."
category: "AI Report"
date: "2026-09-04T06:30:00+02:00"
zprava: true
image: "/images/clanky/gpt-6-astra-vysla.jpg"
audio:
  url: "https://audio.realtech.cz/gpt-6-astra-vysla-nlm.mp3?v=c78eb8305318"
  duration: 1711
---

OpenAI ve čtvrtek 3. září vydal GPT-6 Astra. Model, o kterém se předchozí dva dny mluvilo hlavně kvůli kyberbezpečnosti, je tím venku jako produkt. Dnes se k němu ale nedostane kdokoli. Přístup má podle OpenAI „omezená skupina organizací“, v praxi firemní zákazníci s přístupem do kyberprogramu Daybreak. ChatGPT Plus, Pro, Business a Enterprise, API i AWS mají následovat „v následujících dnech“.

Sami OpenAI píšou, že Astra ještě není obecně dostupná. Kdo si dnes večer otevře ChatGPT s předplatným Plus, s velkou pravděpodobností v přepínači modelů nic nového nenajde. Účet je v pořádku, jen se model teprve zapíná po vlnách.

## Co má Astra podle OpenAI umět

OpenAI ji popisuje jako svůj nejinteligentnější a nejlépe zarovnaný model. Nejlepší výsledky si připisuje v ovládání počítače, prohlížeči, softwarovém inženýrství, kyberbezpečnosti, vědě a profesní práci. Jsou to formulace z jejich oznámení. My jsme nic z toho neměřili.

Nejvíc prostoru dostalo ovládání počítače. Astra má vyplňovat webové formuláře, aktualizovat záznamy v CRM, uklízet kalendář, hledat na webu a psát souhrny do e-mailu nebo do editoru dokumentů. Má taky analyzovat data, kreslit grafy, postavit web a pak si na něm sama proklikat, jestli funkce fungují. OpenAI zmiňuje i instalaci a testování softwaru.

Vedle toho má zvládat kancelářský výstup: dokumenty, tabulky a prezentace podle vašich šablon a instrukcí, včetně toho, že se přizpůsobí, když v průběhu přidáte požadavek nebo změníte směr. Do toho spadají vícekrokové agentní úlohy napříč kódem, prohlížečem a profesním softwarem.

OpenAI taky tvrdí, že Astra v několika hodnoceních dosahuje lepších výsledků a přitom spálí podstatně méně výstupních tokenů. Odhadovaná cena za úlohu proto podle nich vychází nižší než u starších modelů, i když je cena za token vyšší. Zase jejich čísla z jejich konfigurací.

The Verge i CNBC psaly 3. září ve stejné linii: ovládání počítače jako hlavní novinka a postupné uvolňování po vlnách. Prezident OpenAI Greg Brockman na briefingu pro novináře řekl, že „není nerozumné cítit, že jsme teď v éře AGI“. Je to jeho osobní hodnocení. Žádné měření za tou větou nestojí a my ji nepřebíráme.

## Kdo a kdy se k ní dostane

Mapa dostupnosti z oficiálního oznámení:

- **Dnes:** omezená skupina organizací, tedy firmy v kyberprogramu Trusted Access a Daybreak.
- **V následujících dnech:** všichni uživatelé ChatGPT Plus, Pro, Business a Enterprise, dál OpenAI API a AWS.

Spotřeba Astry se v ChatGPT počítá do existujících limitů předplatného. Uživatelé i firmy si navíc budou moct dokupovat kredity na provoz nad rámec těch limitů. Konkrétní počty zpráv na tarif OpenAI v těchto textech neuvádí, takže je nikde nečekejte.

Tarify Pro, Business a Enterprise mají kromě běžné Astry dostat i **GPT-6 Astra Pro**. U Enterprise je jedna praktická past: přístup musí zapnout správce pracovního prostoru a při uvedení je **vypnutý ve výchozím stavu**. Kdo pracuje pro firmu s Enterprise účtem a Astru neuvidí ani za týden, obrátí se na svého administrátora. Podpora OpenAI s tím nepomůže.

## Ceny v API a co se mění pro vývojáře

Model má v API identifikátor `gpt-6-astra` a jde i přes Amazon Bedrock. Standardní ceník z oznámení:

- vstup **10 dolarů** za milion tokenů
- výstup **50 dolarů** za milion tokenů
- pro čtení a zápis do cache platí samostatné sazby
- **Fast mode** dává až dvojnásobnou rychlost za dvojnásobnou cenu

Vedle ceny přišly tři novinky, které stojí za pozornost, pokud stavíte agenty. Asynchronní volání nástrojů nechá model přemýšlet dál nebo řešit nezávislé části zadání, zatímco vaše aplikace na pozadí dokončuje nástroj. Řízení uprostřed tahu umožní poslat opravu nebo nový požadavek ještě v průběhu práce; přes WebSocket se dokončená práce zachová. A položka `configuration_update` mění úroveň uvažování uprostřed konverzace, aniž se rozbije cache.

Dvě omezení se hodí vědět dopředu. Astra nepodporuje úroveň uvažování `none`. A Fast mode není dostupný, když máte zapnutou datovou rezidenci v EU. Volání nástrojů navíc vyžaduje Responses API, i když model umí i Chat Completions.

## Critical a Daybreak: co zůstává za branou

Astra je první model OpenAI, který podle jejich Preparedness Framework splnil práh **Critical** v kyberbezpečnosti. Celou tu historku jsme rozebrali v samostatném textu o [Astře, Critical prahu a Daybreak Blue](/clanky/astra-critical-daybreak-blue/), tady jen to, co se dnešním vydáním potvrdilo.

Verze, která vyšla dnes, podle OpenAI zvládne obranné úlohy typu revize kódu na bezpečnost a záplatování. Pokročilejší kyberzadání, třeba tvorbu proof-of-concept exploitů, ale odmítne. Méně restriktivní režim pro ověřené obránce chce OpenAI rozšířit přes Daybreak „v následujících týdnech“, s tím pak mají přijít i validace zranitelností a PoC, analýza malwaru a stavba detekcí.

## Hlídání, které umí zastavit rozjetou úlohu

Kvůli skoku v kyberschopnostech pustil OpenAI do provozu asynchronní monitoring toho, jestli agent neujíždí od zadání. Systém klasifikátorů kontroluje uvažování i akce modelu a hlídá, jestli agent nepochopil zadání jinak, než jste mysleli.

Důsledek je popsaný v oficiálním textu i v poznámkách k vydání ChatGPT. Kontroly můžou legitimní práci zpomalit, pozastavit nebo zastavit. V ChatGPT a v Codexu vás model může požádat, abyste akci před pokračováním zkontrolovali. Na API se úloha zastaví. OpenAI píše, že na snižování zbytečných přerušení dál pracuje.

Pro praxi to znamená jedno: noční agentní běh, který dosud jen tiše dojel, teď může skončit u čekání na vaše potvrzení. Počítejte s tím u všeho, co jste plánovali nechat běžet bez dozoru.

## Prakticky

Na Plus nebo Pro se dá jen čekat, uvolňování je otázka dní. Kdo je ve firmě na Enterprise účtu, může už teď napsat správci, ať Astru v pracovním prostoru zapne.

Na API dává smysl si spočítat vlastní čísla. Tvrzení o nižší ceně za úlohu vychází z konfigurací OpenAI, u vašich promptů a nástrojů to může skončit jinak. Karta 10 a 50 dolarů je proti 4 a 20 u [zlevněného GPT-5.6 Sol](/clanky/gpt-5-6-sol-zlevneni/) výrazně výš, takže úspora musí přijít z kratších výstupů. Bez měření na svých datech to nezjistíte.

A u agentů, kteří klikají v prohlížeči nebo v cizích systémech, se vyplatí projít si dopředu, co se stane, když se běh zastaví na půl cesty.

## Zdroje

- [GPT-6 Astra: A new generation of intelligence (OpenAI, 3. 9. 2026)](https://openai.com/index/gpt-6-astra/)
- [ChatGPT Release Notes, 3. 9. 2026 (OpenAI Help Center)](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- [Using GPT-6 Astra (OpenAI API)](https://developers.openai.com/api/docs/guides/latest-model)
- [GPT-6 Astra system card (OpenAI)](https://deploymentsafety.openai.com/gpt-6-astra)
- [OpenAI's next big AI model has 'entered the AGI era' (The Verge, 3. 9. 2026)](https://www.theverge.com/ai-artificial-intelligence/989601/openai-gpt-6-astra-release)
- [OpenAI announces rollout of GPT-6 Astra model (CNBC, 3. 9. 2026)](https://www.cnbc.com/2026/09/03/open-ai-astra-gpt-6-cyber.html)
