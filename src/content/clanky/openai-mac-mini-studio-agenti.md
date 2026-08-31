---
title: "OpenAI prý skoupil desítky tisíc Mac mini a Studio. Trénuje na nich agenty u počítače"
description: "The Information: OpenAI v posledních měsících nakoupil desítky tisíc Mac mini a Mac Studio na reinforcement learning a computer-use agenty. Anthropic si podobné stroje prý pronajímá přes AWS. Ani jedna firma to veřejně nepotvrdila."
category: "AI Report"
date: "2026-08-31T09:35:00+02:00"
zprava: true
image: "/images/clanky/openai-mac-mini-studio-agenti.jpg"
audio:
  url: "https://audio.realtech.cz/openai-mac-mini-studio-agenti-nlm.mp3?v=0963422ab958"
  duration: 818
---

The Information píše, že OpenAI v posledních měsících koupil desítky tisíc Mac mini a Mac Studio. Přesné číslo recapy z toho článku nedávají. Tělo je za předplatným. My ho nemáme.

Podle Analytics India Magazine a Gadgets Now, které The Information výslovně citují, mají stroje sloužit na reinforcement learning a na trénink computer-use agentů. Tedy agentů, kteří klikají v rozhraní a dělají úkoly na počítači. Není to pretraining základních modelů na GPU clusterech. AIM to rozlišuje výslovně.

Ani OpenAI, ani Apple, ani Anthropic to veřejně nepotvrdili. Píšeme to jako report, ne jako firemní oznámení.

## Co recapy z The Information skutečně říkají

Primár je článek Aaron Tilleyho v The Information: How Apple Stumbled Into AI Hardware Success With the Mac. Recapy ho datují kolem 30. srpna 2026. Plný text je za paywallem. Nečetli jsme ho. Tvrzení o nákupu bereme z recapů, které The Information jmenují jako primár. Wall St Engine text na X zachytil. Status URL nemáme, proto ho neembedujeme.

AIM (Supreeth Koundinya, 31. 8. 2026) píše: OpenAI koupil desítky tisíc Mac mini a Mac Studio. Jde o konfigurace s velkou jednotnou pamětí. Účel: trénink systémů, které umí ovládat počítač.

Gadgets Now totéž opakuje jako tens of thousands. V jednom odrážkovém shrnutí má jiné číslo než v perexu i v FAQ. FAQ drží desítky tisíc a dodává, že ani OpenAI, ani Apple žádné číslo nepotvrdili. Bereme jen to. Smlouvu, objednávku ani fakturu nikdo z recapů neukázal.

## Proč právě Mac

Recapy to nespojují se značkovou loajalitou. Spojují to s architekturou paměti. Mac mini a Mac Studio mají jednotnou paměť. CPU a GPU sdílejí jeden pool. AI firmy o to podle AIM stojí u úloh, kde model potřebuje velký společný prostor, ne oddělenou grafickou paměť.

AIM výslovně říká, že to není náhrada za pretraining základních modelů na GPU clusterech. Jde o jinou zátěž. Agent se učí zkoušet, chybovat a opakovat úkol na stroji, který vypadá jako skutečný počítač. Má podle AIM prostředí, kde se dá opakovaně zkoušet navigace v aplikacích a hodnotit výsledek.

Gadgets Now v FAQ říká totéž jinými slovy: GPU clustery dál patří k pretrainingu velkých modelů. Tahle zátěž je podle recapu vázaná na paměť, ne na odchod od Nvidie. Ceny clusteru, watty ani ekvivalent v počtu GPU v recapech nejsou. Nevymýšlíme je.

Apple podle AIM neříká prodeje jednotlivých modelů Mac. Z veřejných čísel Applu proto nejde ověřit, kolik kusů komu šlo.

High-memory konfigurace se podle AIM shánějí těžko. Některé zůstávají měsíce nedostupné. Gadgets Now k tomu přidává vlastní větu o dodání: u Studio s velkou pamětí prý zhruba z dvou týdnů na skoro dva měsíce. To přičítáme Gadgets Now, ne The Information. V paywallu tu větu neověřujeme.

## Anthropic přes AWS

OpenAI v tomhle reportu stroje kupuje. Anthropic si podobné Mac mini podle The Information, jak to převzaly AIM i Gadgets Now, pronajímá přes Amazon Web Services. Nekupuje je. Objem pronájmu recapy nedávají.

Ani Anthropic nákup ani pronájem veřejně nepotvrdil. Jde o „reportedly“ z recapů, ne o tiskovou zprávu. OpenAI ani Apple nákup taky nepotvrdili.

## Cook už v červenci mluvil o agentic AI na mini

Tohle je Apple earnings, ne důkaz nákupu OpenAI.

Tim Cook 30. července na earnings callu mluvil o „customers“. Laboratoře nejmenoval. Zákazníci podle něj používají Mac mini jako platformu pro agentic AI. Clustery Mac Studio nasazují na frontier modely lokálně. Mac měl v kvartálu omezení dodávek kvůli „very high levels of demand“.

Mac byznys měl za červnový kvartál 10,4 miliardy dolarů, +29 procent meziročně. To je číslo z Cookova callu. Nespojujeme ho s nákupem OpenAI. Earnings to číslo k OpenAI nepřiřazuje. Je to širší kontext Mac byznysu, ne důkaz, že ty desítky tisíc koupil právě OpenAI.

## Nové mini a Studio z 25. 8.

Apple 25. srpna 2026 představil nové Mac mini s M6 a M5 Pro a nové Mac Studio s M5 Max a M5 Ultra. Specifikace, ceny a firemní násobení výkonu jsme rozebrali v [článku k představení](/clanky/apple-mac-studio-mini-2026/). Tady je nepřepisujeme.

Gadgets Now z načasování čte, že Apple uspíšil refresh kvůli poptávce, včetně nákupu OpenAI. Apple termín 25. srpna sám zdůvodněním OpenAI nedal. To je interpretace recapu, ne firemní věta.

## Zdroje

- [How Apple Stumbled Into AI Hardware Success With the Mac. The Information, Aaron Tilley, 30. 8. 2026. Paywall; plný text nemáme](https://www.theinformation.com/articles/apple-stumbled-ai-hardware-success-mac)
- [OpenAI Buys Tens of Thousands of Mac Minis, Studios for Reinforcement Learning: Report. Analytics India Magazine, Supreeth Koundinya, 31. 8. 2026](https://analyticsindiamag.com/ai-news/openai-buys-tens-of-thousands-of-mac-minis-studios-for-reinforcement-learning-report)
- [OpenAI Is Quietly Buying Tens Of Thousands Of Mac Minis and Mac Studios. Gadgets Now, 31. 8. 2026](https://gadgetsnow.indiatimes.com/tech-news/openai-is-quietly-buying-tens-of-thousands-of-mac-minis-and-mac-studios-heres-why-thats-a-big-deal/articleshow/133644794.cms)
- [Apple představil Mac Studio s M5 Ultra a Mac mini s M6. realtech.cz, 25. 8. 2026](/clanky/apple-mac-studio-mini-2026/)
