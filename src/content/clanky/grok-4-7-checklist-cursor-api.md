---
title: "Grok 4.7: co změnit v Cursoru a API ještě dnes"
description: "Grok 4.7 vyšel 21. 9. 2026. Checklist: kde ho dnes najdeš (Cursor, Grok Build, API), kdy má smysl přepnout z 4.6 a na co si dát pozor u ceny a tokenů."
category: "AI Report"
date: "2026-09-22T09:33:00+02:00"
zprava: true
image: "/images/clanky/grok-4-7-checklist-cursor-api.jpg"
audio:
  url: "https://audio.realtech.cz/grok-4-7-checklist-cursor-api-nlm-40c1adbe443b.mp3"
  duration: 801
---

xAI 21. září 2026 vydala Grok 4.7. Cena za milion tokenů je stejná jako u Grok 4.6, model je silnější v kódu i u dlouhého kontextu a hned ho máš v Cursoru, Grok Buildu a přes API. Níže checklist: co dnes zapnout, kdy přejít z 4.6 a kde se vyplatí počkat.


## Kde Grok 4.7 najdeš už dnes

Podle model card z 21. 9. je Grok 4.7 od startu:

- v Cursoru pro všechny plány,
- v Grok Buildu jako výchozí model,
- v Grok API (console.x.ai),
- v doplňcích pro Word, PowerPoint a Excel jako výchozí model,
- u model gateways typu OpenRouter, Vercel, Cloudflare, Snowflake nebo Databricks Mosaic a v dalších agentních harnessech, routerech a cloudových platformách.

Co zatím chybí: běžný Grok na webu, v mobilní aplikaci a v X. Tam má 4.7 dorazit později, přesný termín xAI neuvádí. Pokud používáš Grok jen jako chat, dnes pro tebe checklist končí. Pokud kóduješ v Cursoru nebo voláš API, čti dál.

## Co se vlastně zlepšilo

xAI popisuje čtyři věci: delší a náročnější RL trénink, lepší kontrola vlastní práce (model si víc ověřuje, co udělal), lepší hospodaření s dlouhým kontextem a nativní podpora harnessu Grok Bot. Zaměření je na programování a znalostní práci. Do tréninku šla podle xAI i doplňková data o tom, jak lidé reálně pracují v Cursoru.

Čísla, která xAI zveřejnila: na CursorBench 4.0 má Grok 4.7 46,3 % oproti 40,4 % u Grok 4.6. Model card upřesňuje, že 46,3 % platí pro nastavení xhigh, při high je to 43,9 %. Pozor, CursorBench 4.0 je nová verze testu a čísla z ní nejde srovnávat se staršími generacemi CursorBenche.

Nezávislé měření od Artificial Analysis (21. 9.): Intelligence Index 46, o dva body víc než 4.6. Coding Agent Index s Grok Buildem 56, což je o devět bodů víc než 4.6 na xhigh. Ten druhý skok je pro uživatele Cursoru a Grok Buildu podstatnější než ten první.

## Checklist: co udělat dnes

1. **V Cursoru přepni model na Grok 4.7 na jednom reálném úkolu.** Vyber něco, co běžně děláš: refaktor, opravu bugu, doplnění testů. Porovnej výsledek s tím, co bys čekal od 4.6. Kde přesně přepínač najdeš, záleží na verzi klienta, obecně jde o výběr modelu u chatu nebo agenta.
2. **V API skriptech změň název modelu a spusť starou sadu promptů.** Cena za milion tokenů je stejná ($2 vstup, $6 výstup), takže rozdíl v účtu uvidíš jen přes počet tokenů. Zapiš si spotřebu před a po.
3. **Zkontroluj, jak dlouhé prompty posíláš. Hranice se liší podle kanálu.** V Cursoru má Grok 4.7 standardní okno 256k tokenů a režim dlouhého kontextu až 500k. Rozhoduje délka vstupu: do 256k platíš standardní sazbu za celý request, nad 256k standardní model účtuje 2× a Fast varianta s dlouhým kontextem 3× standardní sazby. V Grok API je okno 500k a práh leží níž, zhruba u 200k tokenů promptu. Od něj se sazba zdvojnásobí na $4 / $12 za milion, a to pro všechny tokeny v tom requestu, ne jen pro ty nad hranicí. Stejné pravidlo platí v API i u 4.6.
4. **Nastav si úroveň úsilí.** Cursor u Grok 4.7 nabízí xhigh, high, medium a low, výchozí je high (low je pro plány Pro a výš). Nejvyšší skóre má 4.7 na xhigh, ale za cenu výrazně delších odpovědí (viz níže). Pro běžnou práci zůstaň na high a xhigh si nech na těžké úlohy.
5. **Fast variantu ber jen tam, kde platíš za čas.** Podle xAI nabízí dvojnásobnou rychlost výstupu za dvojnásobnou cenu. V Cursoru to znamená $4 / $12 za milion místo $2 / $6, a když s Fast překročíš 256k vstupu, platíš 3× standardní sazby. Pro interaktivní práci v editoru to může dávat smysl, pro dávkové skripty spíš ne.
6. **Pokud používáš cache, ověř, že na ni dosáhneš.** V Cursoru stojí cached input $0,50 za milion u standardního modelu a $1 u Fast. V API stojí $0,50 za milion pod 200k promptem a $1,00 nad ním. U opakovaných systémových promptů se to sčítá.

## Kdy zůstat u Grok 4.6

- Máš pevný rozpočet na tokeny a nemůžeš si dovolit skok ve spotřebě. Artificial Analysis naměřila u 4.7 na xhigh zhruba 81 tisíc výstupních tokenů na úlohu oproti zhruba 36 až 38 tisícům u 4.6. Stejná sazba, přibližně dvojnásobný účet za úlohu.
- Tvoje pipeline běží stabilně a nepotřebuješ lepší kód ani delší kontext. Nový model dává jiné odpovědi a musíš ověřit, že tvé parsery a testy dál procházejí.
- Používáš Grok jen v chatu na webu nebo v aplikaci. Tam 4.7 zatím nedorazil.

## Cena vs. spotřeba tokenů

Cenovka je stejná jako u 4.6: $2 za milion vstupních a $6 za milion výstupních tokenů. Při vyšším úsilí ale model přemýšlí a píše déle, a to se propíše do faktury. Hlídej tři věci, a u dvou z nich rozlišuj, odkud model voláš:

- **Výstupní tokeny na úlohu (oba kanály).** Podle Artificial Analysis přibližně 81k na xhigh oproti 36 až 38k u 4.6. Pokud přejdeš na 4.7 a necháš xhigh, počítej s tím, že za stejnou práci zaplatíš zhruba dvojnásobek, přestože sazba nestoupla.
- **Práh dlouhého kontextu.** V API je to zhruba 200k tokenů promptu; nad ním platíš $4 / $12 za všechno v requestu. V Cursoru je hranice 256k tokenů vstupu; do ní jede celý request za standardní (nebo Fast) sazbu, nad ní standardní model účtuje 2× a Fast 3×. V obou případech může jeden dlouhý request s celou codebase stát víc než deset kratších.
- **Cache.** V API $0,50 nebo $1,00 za milion podle toho, jestli je prompt pod nebo nad 200k. V Cursoru $0,50 u standardního modelu a $1 u Fast. Kratší prompt se ti tak v API vyplatí dvakrát, v Cursoru jednou.

Praktická rada: první týden po přepnutí sleduj spotřebu tokenů denně a porovnávej ji s tím, co ti stejné úlohy stály u 4.6. Kdo měl u 4.6 rozpočet napnutý, měl by u 4.7 začít na high a xhigh zapínat cíleně.
