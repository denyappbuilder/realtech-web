---
title: "OpenAI srazilo cenu GPT-5.6 Sol o víc než 20 %. Háček: platí to do 21. listopadu"
description: "API a kredity v Codexu i ChatGPT Work jdou na 4 a 20 dolarů za milion tokenů. Předplatné Pro, Plus a Business se nemění. Dlouhý kontext má vlastní tabulku."
category: "AI Report"
date: "2026-08-21"
zprava: true
image: "/images/clanky/gpt-5-6-sol-zlevneni.jpg"
---

OpenAI 21. srpna shodilo API a kreditové ceny GPT-5.6 Sol o víc než 20 %. Nejsilnější model rodiny 5.6 tím dohání to, co Luna a Terra dostaly už [koncem července](/clanky/gpt-5-6-snizeni-cen/): tehdy Luna padla o 80 %, Terra o 20 % a Sol zůstal na původní kartě.

Teď padl i on. Nová krátká karta je 4 dolary za milion vstupních tokenů a 20 dolarů za milion výstupních. Proti uvedení, kdy Sol stál 5 / 30, je to 20 % na vstupu a 33 % na výstupu.

Jenže to není nový ceník. OpenAI to označuje jako promo nejméně do 21. listopadu 2026. Tři měsíce s podlahou, ne trvalá karta.

## Kolik Sol teď stojí

Oficiální modelová stránka i ceník API teď u krátkého kontextu uvádějí:

- vstup 4,00 dolaru za milion tokenů
- cached vstup 0,40 dolaru
- zápis do cache 5,00 dolaru
- výstup 20,00 dolaru

To jsou čísla, která uvidíš u běžného požadavku. Cached vstup je desetina plné vstupní ceny. Zápis do cache je dražší než samotný vstup, takže se vyplatí, jen když stejný prefix opravdu znovu použiješ.

Sleva podle oficiálního ohlášení sedí i na Fast mode, dlouhý kontext, Batch a Flex. Konkrétní částky u těch režimů ale nesplácej do jedné hromady s 4 / 20. Krátký kontext a dlouhý kontext mají oddělené tabulky. Titulní 4 / 20 je jen krátký kontext.

## Dlouhý kontext je jiná tabulka

U dlouhého kontextu Sol teď stojí:

- vstup 8 dolarů
- cached vstup 0,80 dolaru
- zápis do cache 10 dolarů
- výstup 30 dolarů

To není překlep ani čistý dvojnásobek všech položek. Vstup a cache jdou nahoru, výstup taky, ale jinak. Kdo počítá rozpočet z titulního čísla 4 / 20 a pak posílá dlouhé kontexty, se sejde s jinou fakturou.

OpenAI v oznámení píše, že dostaneš „stejnou inteligenci Solu za nižší cenu“. Inteligence se nemění. Mění se jen to, kolik za ni teď na tři měsíce platíš.

## API a kredity ano, předplatné ne

Sleva sedí na API. Promítá se i do kreditů v ChatGPT Work a v Codexu, u oprávněných tarifů, postupně.

Předplatné Pro, Plus a Business se nemění. Spotřeba v předplatném zůstává, jak byla. Nižší API karta ti z měsíčního paušálu nic neubere.

To je důležité rozlišení. Červencové zlevnění Luny a modelu Terra se taky týkalo toho, jak rychle ubývají kredity v Codexu a ChatGPT Work, ne ceny předplatného. Teď OpenAI stejnou logiku aplikuje na Sol, ale znovu jen tam, kde se počítají tokeny a kredity. Kdo Sol žene přes Plus nebo Pro v chatu, z této novinky nic nemá.

## Promo, ne nová karta

Ceník i modelová stránka mají stejnou větu: promotional pricing at least through November 21, 2026. Oficiální ohlášení na komunitě to říká jinými slovy, stejným obsahem: snížení o víc než 20 % na příští tři měsíce.

„Nejméně do“ není totéž co „do“. Podlaha je 21. listopad. Co bude 22. listopadu, OpenAI v těch textech neříká. Může to nechat, může to vrátit na 5 / 30, může vyměnit model. Z veřejných stránek to nevyčteš.

Proto s tímhle číslem v kalkulačce zacházej jako s dočasným. Kdo si do výhledu na podzim dá Sol za 4 / 20 jako jistotu, staví na promo, ne na kartu.

## Co z toho plyne

Minule zůstal Sol výjimkou. Teď ho OpenAI zlevnilo taky, ale jinak než Lunu: ne jako novou trvalou cenu, ale jako časově ohraničenou akci. Vstup klesl míň než výstup. U výstupu je sleva 33 %, u vstupu 20 %. Marketingové „víc než 20 %“ tedy sedí na výstup a na souhrn, ne na každou položku stejně.

Dlouhý kontext si drží vlastní čísla. Cached vstup a zápis do cache taky. Titulní 4 / 20 je pravda jen pro krátký kontext bez cache triků.

A ještě jednou, protože se to plete: Pro, Plus a Business beze změny.

Jestli Sol používáš v API, v Codexu nebo v ChatGPT Work na kreditech, tři měsíce platíš míň. Jestli ho pouštíš z předplatného, karta se nehnula.

## Zdroj

- [GPT-5.6 — OpenAI](https://openai.com/index/gpt-5-6/)
- [GPT-5.6 Sol — OpenAI API](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [Pricing — OpenAI API](https://developers.openai.com/api/docs/pricing)
- [20% price reduction for GPT 5.6 Sol — OpenAI Developer Community](https://community.openai.com/t/20-price-reduction-for-gpt-5-6-sol-api-codex-credits-and-chatgpt-work/1391726)
