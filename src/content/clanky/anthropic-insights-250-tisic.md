---
title: "Anthropic pustil venkáře k 250 tisícům konverzací Clauda. Surový chat nikdo z nich neviděl"
description: "Oficiální pilot Anthropic Insights (dřív Clio): Stanford, Oxford a METR dostali agregovaná data z dubna a května 2026. Firma říká, že je to poprvé."
category: "AI Report"
date: "2026-08-26"
zprava: true
image: "/images/clanky/anthropic-insights-250-tisic.jpg"
---

Anthropic 26. srpna 2026 zveřejnil pilot, který pustil tři externí skupiny k agregovaným datům o reálném používání Clauda. Nástroj se jmenuje Anthropic Insights. Dřív Clio. Interně ho firma používá na vzorce v milionech konverzací. Sběr dat běžel u Anthropicu. Analýzu si výzkumníci dělali sami.

Šlo podle firmy zhruba o 250 000 konverzací z Claude.ai nebo Claude Code za duben a květen 2026. Partneři: Social and Language Technologies Lab na Stanfordu, Human Information Processing Lab v Oxfordu a neziskovka METR, která hodnotí frontier modely. Agregovaná data z každého projektu Anthropic zveřejnil. Surové konverzace výzkumníci neviděli. Viděli jen agregované kategorie po právním a privacy review.

Firma píše, že věří, že je to poprvé, kdy externí výzkumníci na vlastních usage datech AI laboratoře pustili veřejné nezávislé studie. To je tvrzení Anthropicu. Ne nezávisle ověřený fakt.

## Co je Anthropic Insights

Venku z laboratoří jsou podle Anthropicu dvě špatné volby. Analýzy, které laboratoř sama vydá, odpovídají na její otázky. Veřejné datasety si výzkumník může rozebírat po svém, ale kloní se k casual použití a nemusí odpovídat tomu, jak lidé AI opravdu používají. Insights má tu mezeru obejít: výzkumník si navrhne studii, firma spustí sběr, ven jdou jen agregáty.

Jak to technicky běží, Anthropic popisuje takto. Výzkumník napíše otázku, třeba jaký typ rady člověk žádá. Claude ji zodpoví u každé konverzace ve vzorku. Odpovědi se složí do kategorií. Ven jde jen kategorie a podíl konverzací, které do ní spadají. Protože soudí Claude, záleží na formulaci. Špatně položená otázka zařadí konverzace jinam, než kam patří. A protože surový chat nikdo nečte, chybu je těžké chytit.

Smluvní recenze Anthropicu byla omezená na čtyři věci: soukromí uživatelů, informace, které by mohly pomoct porušit usage policies, důvěrné informace firmy a přesnost výzkumu. Jinak firma do obsahu neměla co mluvit. Smlouva podle ní říká, že výzkumníci můžou publikovat i to, co je pro Anthropic nepříjemné.

## SALT: víc než polovina konverzací je o věcech, které se špatně vrací

Stanford SALT Lab se díval, jak lidé s AI spolupracují. Jakou práci jí dávají. Jakou roli si nechávají. Kde to padá.

Předchozí výzkum podle laboratoře naznačoval, že lidé na AI delegují hlavně málo odpovědné úkoly a závažnou práci — tu, která se týká jiných lidí nebo se špatně vrací — si nechávají. SALT našel víc, než čekal. Víc než polovina konverzací Clauda podle něj zahrnovala delegování takových úkolů. Nejčastěji při žádosti o profesní radu, zvlášť právní nebo finanční.

V skoro třech čtvrtinách konverzací lidé drželi směr a Claude asistoval. Výstup obvykle upravovali, nebrali ho doslova. I když směr drželi, lišilo se, kolik z výstupu chápou a co se z něj naučí. Tření je podle SALT běžné. Často produktivní: čas strávený tím, jak Claude úkol zkusí, kde zadání nebylo jasné a jak směr iterovat, lidi nutí zpřesnit záměr, upravit výstup nebo u problému zůstat.

Plný writeup SALT Anthropic odkazuje. Oxford a METR ještě ne.

## Oxford a METR ještě nedopsali

Oxfordské Human Information Processing Lab zkoumá, jak se lidé u Clauda cítí a jak to souvisí s chováním modelu. Text ještě není hotový. Až bude, Anthropic slibuje odkaz.

Rané výsledky laboratoře: vzorce lidského a modelového chování se v konverzacích potkávaly. Teplý Claude šel s pozitivnějšími lidmi. Odmítnutí nebo nesouhlas s pushbackem. Excentričnost s větší intelektuální angažovaností. Prostá pomoc se spokojeností. Vzorce stavů jako pohlcení, frustrace a požitek podle laboratoře připomínají samostatnou studii o běžném brouzdání po webu.

METR odhaduje reálné zrychlení od coding agentů a jak se mění napříč generacemi modelů. Analýza konverzací Claude Code ještě běží. Předběžně: novější modely dávají výraznější speedup než starší. Protože analýza stojí na tom, že Claude odhaduje, jak dlouho by úkol trval bez AI, METR ty odhady srovnal se známými časy z dřívější vývojářské studie. Odhad Clauda koreloval se skutečnými časy vývojářů. Čísla speedupu Anthropic v textu neuvádí.

## Surový chat neviděl nikdo. Méně než pět procent kategorií Anthropic sáhl

Insights je podle firmy postavený tak, že výzkumníci k surovým konverzacím nedostali přístup. Jen k agregovaným výstupům po stejném právním a privacy review, jaké má interní práce. Třetí strana, Imperial College London, data prošla privacy auditem. Podrobnosti jsou v příloze.

Pilot byl podle Anthropicu pomalý na tempo AI laboratoře a náročný na zdroje. Obě věci brzdí škálování.

Interně Insights ladí otázky týdny. Externí partneři to opakovat nemohli: každé kolo by znovu šlo přes privacy review a studie by se zastavila. Testovali proto otázky na WildChat, veřejném datasetu lidských chatů s AI, kde šlo odpovědi srovnat se surovým textem. WildChat se podle Anthropicu sklání k casual a kreativnímu použití, na rozdíl od provozu Clauda. Otázky, které na WildChat seděly, na reálném provozu někdy vyrobily zavádějící kategorie.

Některé kategorie ukázaly porušení Acceptable Use Policy nebo Terms of Service. Většinu takových porušení firma sdílela. Výjimkou byly kategorie, které popisovaly, jak uživatelé obcházeli safeguardy, ne co zkoušeli. Méně než 5 % kategorií a konverzací v každé studii Anthropic změnil nebo odstranil. Výzkumníkům řekl, které clustery sáhl a proč.

Anthropic teď zjišťuje, jestli program umí škálovat — jaké studie unese a kolik jich umí jet najednou. Jede pomalu kvůli soukromí, bezpečnosti a kvalitě výzkumu. Pro výzkumníky, kterým by přístup k Insights otevřel práci, kterou dnes nemůžou, otevřel expression of interest formulář. Vedoucí autor textu je Kunal Handa. Citační datum je 26. srpna 2026.

Pilot byl podle firmy experiment: jde nezávisle studovat platformu, aniž by padlo soukromí uživatelů? Zatím říká, že ano. To je pořád její verdikt.

## Zdroj

[Anthropic — Enabling independent research on how people use Claude](https://www.anthropic.com/research/enabling-independent-research) (26. srpna 2026; vedoucí autor Kunal Handa). [Příloha](https://www-cdn.anthropic.com/files/4zrzovbb/website/8a665c85eec3a63b4d86287b9255657016f50e29.pdf) popisuje běh programu, smlouvy a privacy audit Imperial College London.
