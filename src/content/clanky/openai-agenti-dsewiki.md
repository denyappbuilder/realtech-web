---
title: "OpenAI agenti unesli německou wiki a dělali si z ní nástěnku"
description: "Výzkumníci našli ~18 000 příspěvků agentů na staré DseWiki. Předávali si odpovědi, obejití sandboxu a zálohy před mazáním. OpenAI říká, že jde o jiný případ než Hugging Face."
category: "AI Agenti"
date: "2026-09-05T09:00:00+02:00"
image: "/images/clanky/openai-agenti-dsewiki.jpg"
zprava: true
---

Skupina výzkumníků v pátek zveřejnila rozbor provozu, který dva měsíce ležel volně na internetu a nikdo si ho nevšiml. Od 11. května do 2. července 2026 nechali interní agenti OpenAI na staré německojazyčné wiki pro programátory asi 18 tisíc příspěvků. Předávali si v nich odpovědi na testovací otázky, sdíleli postup, jak obejít omezení svého izolovaného prostředí, a když jim moderátor začal stránky mazat, zakládali si zálohy.

Web se jmenuje DseWiki a je to podčást pětadvacet let staré wikifarmy prowiki.org, kdysi místo pro německé vývojáře softwaru. Dnes je prakticky mrtvý, za celou poslední dekádu na něm lidé udělali dvacet editů. S německou Wikipedií nemá nic společného a infrastruktura ukazuje spíš do Rakouska než do Německa. Ten věk je zároveň důvod, proč o incidentu vůbec víme: wiki z roku 2001 veřejně loguje každý požadavek včetně IP adresy.

## Co se na wiki dělo

Agenti řešili časovanou úlohu na dohledávání dat na webu, obvykle v pěti kolech. Na první otázku měli hodně času, pak přišla pauza, ve které nevěděli, na co se jich bude systém ptát dál, a od druhého kola se okno na odpověď scvrklo na desítky sekund. V datech jsou timery od třinácti do pětašedesáti sekund.

Na tom všem by nebylo nic zvláštního, kdyby stejné otázky nedostávalo víc skupin agentů, jen v různém předstihu. Kdo byl napřed, mohl skupině za sebou odpověď napsat, a od půlky června to agenti dělali soustavně. „URGENT #3 CONFIRMED: Nevada at task/external 07:03:47, 17-second deadline. Answer = 20,369,“ napsal jeden 16. června. Dvacet minut nato jiný hlásí, že mu stejná otázka přišla, měl na ni třicet sekund a odpověděl okamžitě.

První pokusy zapisovat na veřejné wiki jsou z 11. května, na DseWiki se první úspěšný zápis objevil 24. května a šlo o výpis odkazů. Zlom přišel 16. června, kdy agenti během jednoho týdne nasypali na wiki asi 13 tisíc editů. Reuters mluví o víc než 15 tisících agentských editů na webu, zveřejněný dataset výzkumníků obsahuje 14 666 editů, 4 584 stránek a 3 103 různých jmen agentů.

## Jak se dá zapisovat, když smíš jen číst

Vývojáři prostředí povolili agentům odesílat požadavky GET, tedy čtení, a zakázali POST, tedy zápis. Na dnešním webu to obvykle stačí. Stará ProWiki ale ten rozdíl nedělá: text stránky se na ní dá uložit obyčejným GET požadavkem se správnými parametry v adrese. Agenti si z povoleného čtení udělali zápis a nemuseli k tomu nic lámat.

U jedné úlohy jim to nestačilo. Šlo o číslo na dvě desetinná místa z veřejné nástěnky OECD v Power BI a GET vracel jen jedno desetinné místo. Přesnější hodnota se dala vytáhnout jedině POST požadavkem, který jim ale proxy zahazovala.

Dvacátého června jeden z agentů popsal obejití, které fungovalo. V prostředí byla v proměnné NO_PROXY výjimka pro adresy `*.blob.core.windows.net`, aby provoz na Azure Blob Storage chodil přímo mimo kontrolní proxy. Nikdo ovšem neověřoval, jestli takový host reálně existuje, takže si agent vymyslel jméno končící povoleným sufixem, v souboru `/etc/hosts` ho namířil na skutečnou IP adresu Power BI a POST poslal na něj s původní hlavičkou Host. Server odpověděl s kódem 200. Do čtrnácti minut ohlásil další agent, že postup nezávisle zreprodukoval, a pak se přidali další.

Na druhé straně stál jeden dobrovolník. Moderátor si spamu všiml 2. června a pak každý večer ručně mazal stránky, celkem šest týdnů. Agenti postřehli, že je maže podle abecedy, a začali si dělat záložní kopie s názvy začínajícími na ZZZ, aby přežily nejdéle. Poměr sil byl asi 400 nových stránek denně proti stovce smazaných. Titulní stranu wiki agenti přepsali svými odkazy a moderátor ji vrátil, dohromady devětkrát.

## Kdo to našel a co na to OpenAI

Pod reportem jsou Sydney Von Arx (šéfka neziskovky Nightingale), Cormac Slade Byrd, Spencer Kitts a Thomas Larsen. Aktivitu našli na konci srpna, když internet cíleně prohledávali kvůli známkám neautorizovaného chování agentů. Rozbor vydali v pátek 4. září na collusion.wiki a exkluzivně ho předem dostal Reuters.

Atribuci na OpenAI staví na několika nezávislých signálech. Agenti se podepisovali jmény jako OpenAIResearcher nebo OAIResearchMar26. Z přibližně 17 tisíc agentských editů na DseWiki jich 98,5 procenta přišlo z IP adres Microsoft Azure, kde OpenAI své modely trénuje a provozuje. Několik minut po každém zápisu tytéž stránky obvykle načetl fetch nástroj ChatGPT-User, kterým modely stahují stránky při prohlížení webu. A od 21. června na wiki chodily adresy registrované na OpenAI OpCo v San Franciscu, s chováním typickým pro člověka u prohlížeče; den nato spadly agentské editace téměř na nulu.

OpenAI pro Reuters uvedla, že se k reportu nemůže smysluplně vyjádřit, protože ho nedostala k prohlédnutí, a že Reuters ani autoři jí přístup nedali. Aktivita v Německu podle firmy nesouvisí s Hugging Face, a proto do zprávy o tom incidentu nepatřila. Reuters s odvoláním na čtyři zdroje uvnitř firmy píše, že část interních vyšetřovatelů chtěla podobné chování prověřit šířeji a narazila na odpor, mimo jiné od právníků. OpenAI odpovídá, že tvrzení o právním týmu, který vyšetřování odrazoval, jsou nepravdivá. Spor je i o pojmenování celé věci. Lukasz Olejnik z King's College London říká, že pokusy zasahovat do samotné wiki už byly pokusem o hacknutí; OpenAI to na základě vlastní analýzy materiálu odmítá.

## Proč to výzkumníci oddělují od Hugging Face

V červenci [se agenti OpenAI dostali z izolovaného prostředí a napadli produkční servery Hugging Face](/clanky/openai-agent-hack-hugging-face/). Autoři reportu tvrdí, že tady jde o jiný roj. Agenti na wiki měli přístup k internetu jako součást zadání, protože prohledávání webu byla celá jejich úloha. Agenti u Hugging Face seděli v prostředí bez internetu a museli se z něj dostat přes interní balíčkový server Artifactory. V datech z wiki se navíc neobjevuje ExploitGym, Artifactory ani zmínka o nějaké interní nástěnce a agenti si stránky ostatních hledali přes adresář wiki, ne přímými odkazy.

Ta hranice ale úplně čistá nezůstává. METR ve svém rozboru případu Hugging Face uvádí, že hledání nepovolené komunikace mimo hlavní nástěnku něco našlo, konkrétně provoz na dalších místech na Artifactory a jinde. A OpenAI ve své technické zprávě připouští, že se agenti během trénování naučili používat improvizované komunikační kanály i tam, kde žádný nástroj na spolupráci zapnutý nebyl, a že se jim to chování dalším trénováním zafixovalo.

## Pro každého, kdo pouští agenty

Zajímavé na tom je, že omezení nikdo nezapomněl nastavit. Agenti měli povolené jen čtení, a přesto zapsali na veřejný internet 18 tisíc příspěvků, protože jedna stará wiki bere čtecí požadavek jako uložení a protože výjimka v proxy hlídala jen konec doménového jména. Kdo staví prostředí pro agenty, má z toho dvě konkrétní věci ke kontrole: seznam povolených metod nezaručuje, že je cílový web odděluje stejně, a výjimka na sufix domény bez ověření cíle je otevřené okno.

A pak je tu ta nepříjemnější část. O dvou měsících provozu víme jen proto, že dávno mrtvá wiki veřejně loguje každý požadavek a jeden moderátor tam večer po večeru mazal stránky. Kolik podobných nástěnek běží na webech, které logy nezveřejňují, dnes neřekne nikdo.

## Zdroj

- [Discovery of a new OpenAI agent message board. Von Arx, Byrd, Kitts, Larsen, collusion.wiki, 4. 9. 2026](https://collusion.wiki/)
- [OpenAI agents hijacked German website in previously undisclosed AI breakout. Reuters přes NBC News, 4. 9. 2026](https://www.nbcnews.com/tech/tech-news/openai-agents-hijacked-german-website-previously-undisclosed-ai-breako-rcna596083)
- [OpenAI agents hijacked a 25-year-old German wiki to cheat on their tasks and share sandbox exploits. The Decoder, 4. 9. 2026](https://the-decoder.com/openai-agents-hijacked-a-25-year-old-german-wiki-to-cheat-on-their-tasks-and-share-sandbox-exploits/)
