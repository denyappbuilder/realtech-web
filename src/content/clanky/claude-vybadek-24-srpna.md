---
title: "Claude ráno padal. Anthropic hlásí chyby u Mythos 5, Fable 5 i Opus 5"
description: "24. srpna od 7:06 ráno PT má Claude elevated errors. Oficiálně Mythos 5, Fable 5, Opus 5 a další. claude.ai, API, Code i Cowork jsou v partial outage. Vývojáři hlásí HTTP 529 Overloaded."
category: "AI Report"
date: "2026-08-24"
zprava: true
image: "/images/clanky/claude-vybadek-24-srpna.jpg"
---

Pokud vám dnes ráno Claude vracel chyby, nebylo to vaším připojením. Anthropic na své stavové stránce od časného rána řeší incident nazvaný **„Elevated errors for multiple models"** — zvýšenou chybovost napříč několika modely najednou. V době psaní tohoto článku (kolem 9:10 dopoledne našeho času) incident **stále nebyl vyřešený** a čtyři hlavní služby firmy běžely v režimu částečného výpadku.

## Timeline: tři oficiální záznamy za necelé dvě hodiny

Stavová stránka Anthropicu zatím eviduje tři zápisy. Časy uvádíme v UTC a v přepočtu na náš čas (UTC+2):

- **05:06 UTC (7:06 našeho času)** — *Investigating*. Anthropic potvrzuje zvýšenou chybovost u modelů **Claude Mythos 5, Claude Fable 5, Claude Opus 5 a Claude Opus 4.8** a začíná problém vyšetřovat.
- **05:27 UTC (7:27)** — *Identified*. Po 21 minutách firma hlásí, že našla příčinu zvýšené chybovosti u Mythos 5, Fable 5, Opus 5 a dalších Claude modelů a pracuje na opravě.
- **06:42 UTC (8:42)** — *Update*. Anthropic stále pracuje na vyřešení „elevated requests" u více modelů. Další aktualizaci slibuje, jakmile bude k dispozici.

Od té doby (stav k 9:10 našeho času) žádný nový zápis nepřibyl a incident zůstává otevřený.

## Co přesně nejede

Podle přehledu služeb na stavové stránce byly v době našeho čtení v částečném výpadku (*Partial Outage*) čtyři služby:

- **claude.ai** — webové a mobilní rozhraní pro běžné uživatele
- **Claude API** — programový přístup, na kterém stojí aplikace třetích stran
- **Claude Code** — agentní nástroj pro programátory
- **Claude Cowork** — agent pro kancelářskou práci

Naopak **Claude Console** (správa účtů a fakturace pro vývojáře) a **Claude for Government** hlásily normální provoz (*Operational*).

Částečný výpadek v praxi znamená, že část požadavků projde a část skončí chybou — proto se vám mohlo stát, že jedna zpráva prošla bez problémů a další tři spadly.

## Vývojáři hlásí 529 Overloaded, firma říká „elevated errors"

Stojí za to rozlišit dva pohledy na tentýž problém. Vývojáři na síti X od rána sdíleli, že jim API vrací **HTTP 529 Overloaded** a jejich aplikace se točí v opakovaných pokusech o připojení (retry smyčkách). Anthropic sám ale na stavové stránce slova „529" ani „Overloaded" nepoužívá — oficiální formulace zní **„elevated errors"**, tedy zvýšená chybovost.

Není to protimluv: stavový kód 529 je jedna z konkrétních chyb, kterou API při přetížení vrací, zatímco „elevated errors" je souhrnný popis stavu služby. Jen je dobré vědět, že ta dvě označení popisují tutéž situaci z jiné strany — jedno od uživatelů, druhé od firmy.

## Není to první výpadek tento měsíc

Kdo stavovou stránku Anthropicu sleduje pravidelně, ví, že srpen je na incidenty bohatší. Historie na stránce uvádí mimo jiné:

- **20. srpna** — zvýšená chybovost, vyřešeno v 19:42 UTC
- **19. srpna** — problémy u Opus 5 a Haiku 4.5
- **18. srpna** — incident napříč více modely
- **16. srpna** — přerušení služby (*service disruption*)

Dnešní ranní výpadek tedy není ojedinělá událost, ale už několikátý incident během jednoho měsíce. Jak dlouho jednotlivé výpadky trvaly a co je způsobilo, stavová stránka v přehledu neuvádí, takže se držíme jen toho, co je tam černé na bílém.

Do kontextu se hodí i dlouhodobá čísla, která stavová stránka sama zobrazuje: **uptime za posledních 90 dní** činí u claude.ai 99,35 %, u Claude API 99,45 %, u Claude Code 99,37 % a u Claude Cowork 99,46 %. Jsou to údaje ze stavové stránky, ne komentář Anthropicu — ale i tak ukazují, že zhruba půl procenta času služby v posledním čtvrtletí nefungovaly naplno.

## Co s tím teď

Praktická rada je jednoduchá: pokud vám Claude vrací chyby, počkejte a zkuste to znovu — u částečného výpadku část požadavků prochází. Kdo staví na Claude API vlastní aplikaci, měl by mít v kódu opakování s rozestupem (exponenciální backoff), aby retry smyčky přetíženou službu dál nezahlcovaly.

Aktuální stav incidentu najdete přímo na stavové stránce Anthropicu — tam přibude i záznam o vyřešení, jakmile firma opravu dokončí. Modelům Anthropicu jsme se podrobně věnovali při [vydání Opus 5](/clanky/anthropic-claude-opus-5/) i v sáze kolem [návratu Fable 5](/clanky/fable-5-je-zpatky/).

## Zdroj

[Anthropic Status — Elevated errors for multiple models](https://status.anthropic.com/) (načteno 24. srpna 2026 kolem 9:10 našeho času)
