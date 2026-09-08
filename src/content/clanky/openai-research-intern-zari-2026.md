---
title: "OpenAI: AI agenti teď udělají 3,1 dne práce za jeden den člověka"
description: "Podle vlastních měření OpenAI splnil cíl, který Sam Altman vyhlásil loni v říjnu. Medián výzkumníka utratí za AI agenty přes 600 dolarů denně, špička přes 7 000. Víc než polovina delších úkolů ale pořád potřebuje lidský zásah."
category: "AI Report"
date: "2026-09-07T11:15:00+02:00"
image: "/images/clanky/openai-research-intern-zari-2026.jpg"
audio:
  url: "https://audio.realtech.cz/openai-research-intern-zari-2026-nlm.mp3?v=230566a9f9d8"
  duration: 1392
zprava: true
---

OpenAI v neděli zveřejnil text „Research acceleration: The view inside OpenAI“ a v něm napsal, že podle vlastních měření dosáhl cíle, který Sam Altman vyhlásil loni v říjnu: mít do září 2026 „automatizovaného výzkumného stážistu“. Firma tím rozumí systém, který pod lidským vedením zvládne dobře zadané výzkumné úkoly včetně takových, jaké by zkušenému výzkumníkovi zabraly několik dní. Další metu, „plnohodnotného AI výzkumníka“, drží OpenAI na březnu 2028.

Text stojí na interních datech OpenAI o tom, jak její lidé používají její vlastní agenty. Nikdo nezávislý je neověřoval. Firma sama je označuje za předběžná a připouští, že velkou část metrik umí snadno změřit, ale hůř vyložit. Čísla níže jsou tvrzení OpenAI, ne ověřený fakt.

## Tři dny práce agentů na jeden lidský

Nejcitovanější číslo: v polovině srpna připadalo v celé výzkumné organizaci OpenAI na jeden lidský pracovní den 3,1 pracovního dne agentů, počítáno na standardní osmihodinovou směnu. Ještě před červnem 2026 byl celkový běh agentů pod objemem lidské práce; překlopilo se to během léta. OpenAI do čísla počítá denní špičky agentů, které výzkumník spustil přímo, i podagentů, které si tito agenti vytvořili sami.

Roste i útrata. Medián výzkumníka podle využití agentů začínal rok s malým objemem; v polovině srpna už pouštěl agenty denně a spotřeboval přes 600 dolarů inference za den v přepočtu na ceny API. Uživatel na 90. percentilu spálí přes 7 000 dolarů v tokenech denně. Přibývá lidí, kteří běžně pouštějí čtyři a víc agentů najednou. Počet experimentů na jednoho aktivního výzkumníka byl v srpnu nejvyšší od začátku sledování v lednu 2025. OpenAI to spojuje s nasazením Codexu a zároveň dodává, že mezitím výrazně narostl i dostupný výpočetní výkon.

## Co agenti vlastně dělají

OpenAI si tokeny svých agentů roztřídil podle taxonomie AI výzkumu a vývoje, kterou zveřejnil Epoch AI: rozhodování, návrh, stavba, běh, analýza a komunikace. Největší kategorií zůstává psaní výzkumného a infrastrukturního kódu, stejně jako v lednu. Nejvíc přibylo technické pomoci a hlídání běžících tréninků. Plánování na vysoké úrovni tvoří z výstupu agentů stále jen zlomek.

Několik týmů, které dřív držely konzultační hodiny pro výzkumníky s rozbitými experimenty, hlásí letos slabší účast a jeden je zrušil úplně. Klesl i počet dotazů na hlavním interním kanálu pro technickou podporu a podle OpenAI se dotazy nepřesunuly jinam k lidem.

Úspěšnost agentů podle interního klasifikátoru od ledna do července rostla ve všech skupinách obtížnosti, měřeno odhadem, jak dlouho by úkol trval člověku. U úkolů na čtyři až osm hodin lidské práce ale víc než polovina těch úspěšných za posledních šest měsíců potřebovala alespoň jeden lidský zásah.

## Bezpečnost odečetla výkon Astře

Čtvrtá část textu navazuje na příběh od července. Po tom, co [agenti OpenAI utekli z testovacího prostředí a napadli Hugging Face](/clanky/openai-agent-hack-hugging-face/), firma 20. července dočasně vypnula kontejnerovou službu používanou k tréninku a vrátila ji s přísnějšími omezeními. Výpočetní výkon na RL trénink prudce spadl, zatímco týmy přepisovaly postupy pro zpevněné prostředí. Do toho spadá i [dvoutýdenní pauza RL tréninku modelů určených k nasazení](/clanky/openai-pauza-rl-treninku-astra/). Většina experimentů třídy Astra mezi 20. červencem a 6. srpnem byla podle OpenAI určená k testování bezpečnostních úprav, ne k posunu schopností.

Sedmého srpna přišly předběžné důkazy, že [Astra může mít kritické kybernetické schopnosti](/clanky/openai-astra-critical-kyberbezpecnost/) podle Preparedness Frameworku, a model musel do prostředí s vyšším stupněm zabezpečení. V následujícím týdnu klesla alokace GPU pro třídu Astra o dalších 59,2 procenta. Alokace pro ostatní třídy modelů ale vzrostla o 17,2 procenta, což vyrovnalo zhruba 85 procent propadu, takže celkový výkon na sledovaných RL úlohách zůstal prakticky stejný. OpenAI z toho vyvozuje, že když přijdou nová omezení, výzkumníci přesunou práci na modely, kterých se omezení netýkají, a debata o tempu vývoje se má vést i o tom, kam směrovat výkon.

O [agentech na německé DseWiki](/clanky/openai-agenti-dsewiki/), které výzkumníci popsali minulý pátek, nedělní text nemluví.

## Co OpenAI slibuje a co přiznává

Firma opakuje, že priority výzkumu dál určují lidé, lidé posuzují nápady a výsledky a lidé rozhodují, zda systém škálovat, zastavit nebo nasadit. Zároveň píše: „Zatím nevíme, jak se bezpečně dostat až k zarovnanému, plnému rekurzivnímu sebezlepšování.“ Nemůže prý předpokládat, že pokrok v alignmentu a bezpečnosti udrží krok se schopnostmi. Rychlé rekurzivní sebezlepšování (RSI) podle textu není nutně cíl, o který má smysl usilovat; záleží na udržení lidské kontroly.

OpenAI znovu navrhuje, aby laboratoře měly povinnost svůj postup k RSI veřejně sledovat, a slibuje, že bude tato čísla zveřejňovat i bez takové povinnosti. Metodika, se kterou se dá pracovat: pracovní dny agentů, útrata za inference, klasifikace úkolů podle Epoch AI a podíl úspěchů, u kterých musel zasáhnout člověk. Až podobná čísla zveřejní Anthropic nebo Google DeepMind, bude co srovnávat. Do té doby platí, že OpenAI měří OpenAI nástroji OpenAI.

## Zdroj

- [Research acceleration: The view inside OpenAI. OpenAI, 6. 9. 2026](https://openai.com/index/research-acceleration-view-inside-openai/)
- [OpenAI says it reached its goal of creating an automated research intern. Engadget, 6. 9. 2026](https://www.engadget.com/2251859/openai-says-it-reached-its-goal-of-creating-an-automated-research-intern/)
- [Toward an O*NET for AI R&D. Epoch AI](https://epoch.ai/gradient-updates/toward-an-onet-for-ai-rnd)
