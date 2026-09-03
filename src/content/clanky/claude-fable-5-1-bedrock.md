---
title: "Anthropic vypustil Claude Fable 5.1. Stejná cena, levnější mezipaměť"
description: "Fable 5.1 a Mythos 5.1 jsou venku. Vstup a výstup stojí stejně jako u Fable 5, čtení z mezipaměti je o tři čtvrtiny levnější. Na Macu už model běží."
category: "AI Report"
date: "2026-09-01T20:10:00+02:00"
zprava: true
image: "/images/clanky/claude-fable-5-1-bedrock.jpg"
xPosts:
  - "https://x.com/claudeai/status/2094848572143407483"
audio:
  url: "https://audio.realtech.cz/claude-fable-5-1-bedrock-nlm.mp3?v=e4cb3cd02b23"
  duration: 1413
---

Anthropic 1. září vypustil Claude Fable 5.1 a zároveň Claude Mythos 5.1. Vstup a výstup stojí stejně jako u Fable 5. Čtení z mezipaměti je o 75 % levnější. A už to běží: v Claude na Macu model sedí jako Fable 5.1 Medium.

Oficiální účet Claude to napsal v 18:03 UTC. Stejný den to stojí v [oznámení Anthropicu](https://www.anthropic.com/claude-fable-and-mythos-5-1) i v platform docs. Výchozí režim je Medium na Claude.ai a v Cowork, High v Claude Code.

## Co je nového

Podle Anthropicu jde o nejpokročilejší modely na světě pro kódování a práci se znalostmi. Na [produktová stránka](https://www.anthropic.com/claude/fable) říkají, že Fable 5.1 je Mythos-level model na dlouhé projekty: agenti přes víc aplikací, kód přes celý projekt, firemní workflow a čtení diagramů, tabulek a PDF.

Model umí držet asi milion tokenů kontextu a poslat až 128 tisíc. Dostupný je přes Claude API a velké cloudy, pro tarify Pro, Max, Team a Enterprise. Přemýšlení za běhu se vypnout nedá. Trénovací data končí v červnu 2026.

Čísla bereme z [tabulky Anthropicu](https://www.anthropic.com/claude-fable-and-mythos-5-1), ne z vlastního měření. Skok je hlavně u vědy a agentních úloh. Terminal-Bench-Science 0.1: Fable 5.1 má 52,6 %, Fable 5 měl 24,7 %, Opus 5 29,0 %. AutomationBench: 31,4 % proti 17,1 % u Fable 5. Terminal-Bench 4.0: 55,8 % proti 42,0 %.

V oznámení je i citát Jane Street Capital: v interních benchích prý Fable 5.1 řeší víc programátorských úloh než Fable 5 nebo Opus 5. Na produktové stránce je věta, že v Devinu přesouvají provoz z Opus 5 na Fable 5.1 v den uvedení. Firmu u toho citátu stránka nejmenuje.

## Cena

Vstup a výstup se nemění. 10 dolarů za milion tokenů dovnitř, 50 dolarů za milion ven. Stejně jako Fable 5.

Mění se mezipaměť. Fable 5 četl z mezipaměti za 1 dolar za milion. Fable 5.1 čte za 0,25 dolaru. To je o tři čtvrtiny méně. Zápis do mezipaměti zůstává: 12,50 za pět minut a 20 za hodinu.

Proč to někomu ušetří víc než jiným: kdo pořád dokola posílá stejný začátek požadavku — projekt, systémový prompt, dlouhý brief — platí za čtení z mezipaměti. Tam Anthropic srazil cenu. Kdo posílá jednorázové krátké požadavky, uvidí stejnou kartu jako u Fable 5.

Anthropic odhaduje, že typická zátěž vyjde zhruba o 25 % levněji a vysoce agentní až o 45 %. Opírá to o čtyři týdny reálného použití v srpnu 2026. Je to jejich odhad.

## Co se láme u API

Kdo Fable 5 volá z aplikace, musí počítat se třemi lámavými změnami. [Release notes](https://docs.anthropic.com/en/release-notes/api) z 1. září je jmenují.

Když aplikace modelu přikáže konkrétní nástroj, API to odmítne. Automatický výběr a zákaz nástrojů dál fungují.

Když bloky přemýšlení z 5.1 přehraješ do staršího modelu, API je zahodí. Starší model je nepřečte.

A když u nového účtu upravíš dřívější tah — systémový pokyn, nástroje nebo starší zprávu — thinking přestane platit. Od 31. srpna 2026 to u nových účtů končí chybou. Nové API účty od dneška nemůžou ručně přepisovat předchozí kontext a přitom thinking zachovat.

Text z modelu nese vodoznak Anthropicu. Mezi voláními nástrojů umí model posílat čitelné průběžné aktualizace, zatím v betě.

## Mythos a pojistky

Mythos 5.1 je stejný model s uvolněnými pojistkami. Teď jen vybrané americké organizace, přes Cyber Verification Program a Life Sciences Verification Program. Fable je veřejná řada. Tenhle vzorec Anthropic držel už u [Fable 5 a Mythos 5](/clanky/anthropic-fable-mythos/).

Fable má klasifikátory. Kyber a biologie: zásah padá na Opus (kyber na 4.8, biologie na Opus 5), za přesměrování se neúčtuje Fable cena. Fable 5.1 smí hledat zranitelnosti, ne psát kód k jejich zneužití. Anthropic tvrdí, že kyber pojistky mají o 60 % méně falešných poplachů než dřív a u elementární biologie a medicíny o 85 % méně zásahů než při startu Fable 5. Výzkum v biologických vědách pořád jde na Opus, nebo na Mythos přes program.

Výchozí je 30denní uchovávání dat. Enterprise Frontier Safeguards mají data držet u zákazníka. Než to naběhne na podzim, oprávnění zákazníci můžou Fable 5.1 jet bez uchovávání dat.

Pár dní před uvedením to na Bedrocku jen běželo ve skrytém testu.

## Zdroje

- [Introducing Claude Fable 5.1 and Claude Mythos 5.1 — Anthropic, 1. 9. 2026](https://www.anthropic.com/claude-fable-and-mythos-5-1)
- [Claude Fable — product page](https://www.anthropic.com/claude/fable)
- [Claude na X, 1. 9. 2026 18:03 UTC](https://x.com/claudeai/status/2094848572143407483)
- [Claude na X. Long-running tasks / research](https://x.com/claudeai/status/2094848579558953258)
- [Claude na X. Cache reads 75 % less than Fable 5](https://x.com/claudeai/status/2094848588190830982)
- [Claude Fable 5.1 — platform docs](https://platform.claude.com/docs/en/models/fable-5-1/overview)
- [API release notes, 1. 9. 2026](https://docs.anthropic.com/en/release-notes/api)
- [Pricing — Fable 5.1](https://platform.claude.com/docs/en/about-claude/pricing)
