---
title: "Anthropic vypustil Claude Fable 5.1. Stejná cena, levnější cache"
description: "Oficiálně na X a v docs: Fable 5.1 a Mythos 5.1. 1M kontext, $10/$50, cache reads o 75 % levnější než Fable 5. Knowledge cutoff červen 2026."
category: "AI Report"
date: "2026-09-01T20:10:00+02:00"
zprava: true
image: "/images/clanky/claude-fable-5-1-bedrock.jpg"
xPosts:
  - "https://x.com/claudeai/status/2094848572143407483"
---

Oficiální účet Claude 1. září v 18:03 UTC napsal, že uvádí Claude Fable 5.1 a Claude Mythos 5.1. Jsou to podle nich nejpokročilejší modely na světě pro kódování a knowledge work. Stejný den to stojí v [oznámení Anthropicu](https://www.anthropic.com/claude-fable-and-mythos-5-1) i v platform docs: Latest. Released. API `claude-fable-5-1`.

V Claude na Macu už model sedí jako **Fable 5.1 Medium**. To sedí s oficiálním textem: default je Medium na Claude.ai a v Cowork, High v Claude Code. Vstup a výstup stojí stejně jako Fable 5. Cache reads jsou o 75 % levnější.

## Co Anthropic potvrdil

[Přehled Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview) je konkrétní. Kontext 1 milion tokenů. Maximum výstupu 128 tisíc. Adaptive thinking je pořád zapnuté, vypnout nejde. Knowledge cutoff i cutoff trénovacích dat: červen 2026. Retirement ne dřív než 1. září 2027.

Identifikátory v docs: Claude API `claude-fable-5-1`, Amazon Bedrock `anthropic.claude-fable-5-1`, Google Cloud, Microsoft Foundry a Claude Platform on AWS `claude-fable-5-1`.

[Product page](https://www.anthropic.com/claude/fable) říká dostupnost pro Pro, Max, Team a Enterprise. Fable 5.1 je podle Anthropicu Mythos-level model na dlouhé projekty: agenti přes víc aplikací, kód přes celý codebase, enterprise workflow a vision u diagramů, tabulek a PDF. To jsou kvalitativní věty z product copy. Ne naše měření.

## Stejná cena, levnější cache

I/O se nemění. 10 dolarů za milion vstupních tokenů, 50 za milion výstupních. Stejně jako Fable 5. Mění se cache: Fable 5 čte za 1 dolar za milion, Fable 5.1 za 0,25. To je o 75 % méně. Cache write zůstává 12,50 za pět minut a 20 za hodinu.

Oficiální thread, product page i oznámení z toho dělají praktický dopad. Typická zátěž má být zhruba o 25 % levnější. Vysoce agentní až o 45 %. Anthropic to měřil na čtyřech týdnech reálného usage v srpnu 2026. My to neměřili.

## Firemní tabulka

Čísla bereme jen z [tabulky Anthropicu](https://www.anthropic.com/claude-fable-and-mythos-5-1). Terminal-Bench-Science 0.1: Fable 5.1 52,6 %, Fable 5 24,7 %, Opus 5 29,0 %. Terminal-Bench 4.0: Fable 5.1 55,8 %, Mythos 5.1 60,9 %, Fable 5 42,0 %. CursorBench 3.2.0: 73,4 % proti 70,5 % u Fable 5. AutomationBench: 31,4 % proti 17,1 %. Humanity's Last Exam bez nástrojů: 60,9 % proti 57,8 %. OSWorld 2.0 strict: 41,7 % proti 36,1 %.

Fable 5.1 se podle Anthropicu hodnotil s produkčními pojistkami. Kde pojistky zasáhly, Fable 5.1 i Fable 5 na OSWorld 2.0 dostaly nulu. Kyber úlohy pak běžely na Opus 4.8, biologie na Opus 5. To podle nich skóre snižuje. Nezávislý bench sem nedáváme.

Z named quotes na stránce: Jane Street Capital, Craig Falls. V interních benchích prý Fable 5.1 řeší víc coding problémů než Fable 5 nebo Opus 5. Na product page Cognition píše, že v Devinu přesouvá Opus 5 traffic na Fable 5.1 v den launch.

## Tři breaking, pět additive

Kdo volá Fable 5, musí počítat se třemi lámavými změnami. [Release notes](https://docs.anthropic.com/en/release-notes/api) z 1. září je jmenují.

Forced tool use končí chybou. `tool_choice` typy `any` a `tool` vrací 400. `auto` a `none` zůstávají.

Starší modely nepřečtou thinking bloky z 5.1. API je při přehrání do staršího modelu zahodí.

Úprava dřívějších tahů thinking invaliduje. U nových účtů od 31. srpna 2026 přehrání bloku po změně `system` promptu, `tools` nebo starší zprávy vrací 400. Oznámení to dává i do anti-distillation: nové API účty od dneška nemůžou ručně editovat prior context a přitom zachovat thinking.

Pět věcí je additive. Per-message effort je v betě. Turn-scoped system messages taky. Mezi tool cally umí model posílat čitelné progress updaty (`display: "updates"`, beta). Cache read je levnější. Text nese watermark Anthropicu, podporované obrázky a videa z code execution tool nesou C2PA přes Files API.

## Pojistky, retence, Mythos

Kyber a biologie jdou přes klasifikátory. Zásah padá na Opus: kyber na 4.8, biologie na Opus 5. Za reroute se podle product page neúčtuje Fable cena. Oznámení: kyber pojistky mají o 60 % méně false positives než dřív. Fable 5.1 smí hledat zranitelnosti, ne psát exploity. Elementární biologie a medicína mají o 85 % méně zásahů než při startu Fable 5. Research v life sciences pořád jde na Opus, nebo na Mythos přes program.

Default je 30denní retence. Enterprise Frontier Safeguards mají data držet u zákazníka. Než EFS naběhne na podzim, eligible zákazníci můžou Fable 5.1 jet s zero data retention.

Mythos 5.1 je stejný model s uvolněnými pojistkami. Identifikátor `claude-mythos-5-1`. Cyber Verification Program a Life Sciences Verification Program. Teď jen vybrané US organizace. Fable je veřejná řada. Tenhle vzorec Anthropic držel už u [Fable 5 a Mythos 5](/clanky/anthropic-fable-mythos/).

31\. srpna RuntimeWire psal, že `us.anthropic.claude-fable-5-1` na Bedrocku vrací 404 místo 400. To byl staging. Teď ho překrylo oficiální Released. AWS model card pořád popisuje jen Fable 5. Anthropic v docs Bedrock ID `anthropic.claude-fable-5-1` tvrdí.

## Zdroje

- [Introducing Claude Fable 5.1 and Claude Mythos 5.1 — Anthropic, 1. 9. 2026](https://www.anthropic.com/claude-fable-and-mythos-5-1)
- [Claude Fable — product page](https://www.anthropic.com/claude/fable)
- [Claude na X, 1. 9. 2026 18:03 UTC](https://x.com/claudeai/status/2094848572143407483)
- [Claude na X. Long-running tasks / research](https://x.com/claudeai/status/2094848579558953258)
- [Claude na X. Cache reads 75 % less than Fable 5](https://x.com/claudeai/status/2094848588190830982)
- [Claude Fable 5.1 — platform docs](https://platform.claude.com/docs/en/models/fable-5-1/overview)
- [API release notes, 1. 9. 2026](https://docs.anthropic.com/en/release-notes/api)
- [Pricing — Fable 5.1 $10/$50, cache read $0.25](https://platform.claude.com/docs/en/about-claude/pricing)
- [A Bedrock error suggests Anthropic is staging Claude Fable 5.1 — RuntimeWire, 31. 8. 2026. Jen pozadí.](https://runtimewire.com/article/bedrock-error-anthropic-claude-fable-5-1-staging)
