---
title: "Gemini u videa přestává žrát každý snímek. Sám si hledá, co potřebuje"
description: "Google pouští u Gemini Flash modelů režim, kdy se model u videa nekouká napevno jeden snímek za sekundu, ale sám si hledá relevantní okamžiky. Podle Googlu to ušetří až 88 % tokenů."
category: "AI Report"
date: "2026-09-02T09:15:00+02:00"
zprava: true
image: "/images/clanky/gemini-agentic-video-understanding.jpg"
xPosts:
  - "https://x.com/Google/status/2094840325789430066"
audio:
  url: "https://audio.realtech.cz/gemini-agentic-video-understanding-nlm.mp3?v=3dd39ce01e55"
  duration: 1279
---

Google 1. září vypustil u Gemini nový způsob, jak číst video. Místo aby model sežral celý soubor snímek po snímku, chová se spíš jako editor: podívá se, kde je to důležité, a zbytek přeskočí. Funkce se jmenuje agentic video understanding a startuje na třech Flash modelech — Gemini 3.7 Flash, 3.6 Flash a 3.5 Flash-Lite. Oznámení podepsali Rohan Doshi a Mario Lučić z DeepMindu.

## Proč to sedí u dlouhých videí

Doteď Gemini u videa pracoval „staticky“. Model video spolkl pevným tempem — ve výchozím nastavení jeden snímek za sekundu. Tempo šlo v API změnit, ale pořád platilo: vezmi tok, nakrájej ho nastejno, spočítej.

U krátkého klipu to ještě ujde. U desetiminutového tutoriálu, devadesátiminutové přednášky nebo několikahodinového záznamu už ne. Buď platíte horu tokenů za každý snímek, nebo tempo srazíte a riskujete, že vám zmizí přesně ten okamžik, kvůli kterému video otevíráte. Google to v blogu popisuje jako volbu mezi vysokými náklady a technikami, které zahodí důležité detaily.

Nový režim tu volbu obchází. Model dostane nativní nástroje na video a s nimi si sám hledá, skenuje a prohlíží konkrétní úseky — snímky, zvuk i přepis. Podobně jako u agentic vision, kde Gemini k obrázkům připojuje vykonávání kódu, tady jde o video.

Dřív si vývojář takovou smyčku skládal ručně: rozhodnout, kam se podívat, načíst ten kousek, znovu se zeptat. Teď to má udělat model. Načte jen tu část souboru, která k otázce patří.

## Co Google slibuje

Čísla bereme z [oznámení Googlu](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-agentic-video-in-gemini/), ne z vlastního měření.

Google uvádí, že napříč standardními benchmarky na analýzu videa Gemini s tímhle režimem snižuje spotřebu tokenů až o 88 %, náklady až o 66 % a přesnost zvedá až o 7 %. Úspora má být nejviditelnější právě u dlouhých videí — od desetiminutových návodů přes devadesátiminutové přednášky až po několikahodinové záznamy.

Nejlepší kombinaci kvality a ceny Google dává Gemini 3.7 Flash s agentním čtením. U všech tří podporovaných modelů prý zisky jsou, ale 3.7 Flash má podle Googlu sedět na hranici přesnosti a ceny.

To jsou jejich claimy z vlastních benchů. Jestli to drží na vašem materiálu, uvidíte až na vlastních datech.

## K čemu to má být

Google jmenuje čtyři situace, kde statické jedno políčko za sekundu nestačí.

První je hledání okamžiku kratšího než vteřina. Při jednom snímku za sekundu vám snadno uteče střih, změna stavu nebo záběr, který trvá zlomek vteřiny. Model si má umět dohledat přesně ten moment — třeba kvůli automatickému střihu.

Druhá je jehla v hodinách materiálu. Složitá otázka napříč několikahodinovým videem, aniž byste do modelu cpali miliony tokenů za celý záznam. Tady dává smysl, proč Google mluví o úspoře: neprocházíte každou vteřinu, hledáte konkrétní věc.

Třetí je hledání anomálií. Když model narazí na zajímavé okno, má ho znovu projet vyšším počtem snímků za sekundu — rychlý pohyb, drobný artefakt, něco, co při pevném tempu zanikne.

Čtvrtá je počítání. Opakované pohyby a jednotlivé objekty v čase, ne odhad z každé dvanácté vteřiny.

Nic z toho jsme sami neměřili. Je to to, co Google v blogu slibuje a ukazuje na vlastních příkladech.

## Kde to dnes zapnete

Dnes to běží u nahraných videí a u YouTube přes Gemini API — v Google AI Studio a na Gemini Enterprise Agent Platform. V API zapneš režim agentic. Platíte běžné tokeny, žádný příplatek za funkci Google neuvádí.

V aplikaci Gemini to zatím není. Google říká, že to tam brzy pustí u Flash a Flash-Lite. A v nadcházejících měsících má stejný přístup pohánět Ask YouTube na stránce videa — odpovědi opřené o to, co je ve záběru, ne jen o titulek a popis. To je roadmap, ne dnešní stav. Kdo si dnes otevře Gemini v telefonu nebo Ask YouTube pod videem, tuhle novinku tam ještě nečekejte.

## Co si z toho odnést

Je to oznámení pro vývojáře, ne pro každého, kdo si večer pouští Gemini v telefonu. Pokud přes API taháte dlouhá videa, Google slibuje, že přestanete platit za každý snímek a model si sáhne jen tam, kde to dává smysl.

Háček je stejný jako u každého takového launchi: čísla jsou z blogu výrobce. Až 88 % méně tokenů a až 7 % vyšší přesnost zní dobře, ale „až“ v takových větách vždycky nese nejlepší případ, ne průměr. Pořád je to ale posun, který u dlouhého videa dává logiku — pevné tempo bylo drahé nebo hluché, a teď Google tvrdí, že model umí tu volbu udělat sám.

Zatím máme blog Rohana Doshiho a Maria Lučiće z DeepMindu a jeden tweet Googlu. A API, které tohle umí zapnout už dnes.

## Zdroj

- [Introducing agentic video understanding with Gemini — Google Blog, 1. 9. 2026](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-agentic-video-in-gemini/)
- [Google na X, 1. 9. 2026](https://x.com/Google/status/2094840325789430066)
