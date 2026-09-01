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

Oficiální účet Claude 1. září v 18:03 UTC napsal, že uvádí Claude Fable 5.1 a Claude Mythos 5.1. Jsou to podle nich nejpokročilejší modely na světě pro kódování a knowledge work. Platform docs totéž datují na 1. září 2026: Latest. Released. API `claude-fable-5-1`.

V Claude na Macu už model sedí jako **Fable 5.1 Medium**. Vstup a výstup stojí stejně jako Fable 5: 10 a 50 dolarů za milion tokenů. Cache reads jsou podle [oficiálního threadu](https://x.com/claudeai/status/2094848588190830982) o 75 % levnější. Docs k tomu dávají 0,25 dolaru za milion.

## Co Anthropic potvrdil

[Přehled Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview) je konkrétní. Kontext 1 milion tokenů. Maximum výstupu 128 tisíc. Adaptive thinking je pořád zapnuté, vypnout nejde. Default effort je `high`. Knowledge cutoff i cutoff trénovacích dat: červen 2026. Retirement ne dřív než 1. září 2027.

Identifikátory v docs:

- Claude API: `claude-fable-5-1`
- Amazon Bedrock: `anthropic.claude-fable-5-1`
- Google Cloud, Microsoft Foundry, Claude Platform on AWS: `claude-fable-5-1`

Docs říkají, že model rozšiřuje Fable 5 ve stejném I/O ceníku. Silnější long-running agentic coding, vícestupňový research a práce s dokumenty, tabulkami a slidy. To je věta Anthropicu, ne naše měření. Žádný nezávislý bench sem nedáváme.

Druhý tweet threadu dodává, že Fable 5.1 umí složité, dlouho běžící úlohy a že jeho research schopnosti ukazují, jak budou modely přispívat k vědeckému pokroku. Zase firemní věta.

## Stejná cena, levnější cache

I/O se nemění. Fable 5.1 stojí 10 dolarů za milion vstupních tokenů a 50 dolarů za milion výstupních. Stejně jako Fable 5. To potvrzují [docs](https://platform.claude.com/docs/en/models/fable-5-1/overview) i [ceník](https://platform.claude.com/docs/en/about-claude/pricing).

Mění se cache. Fable 5 čte cache za 1 dolar za milion. Fable 5.1 za 0,25. To je čtvrtina, tedy o 75 % méně. Cache write zůstává: 12,50 za pětiminutový zápis, 20 za hodinový.

Oficiální thread z toho dělá praktický dopad. Typická zátěž má být zhruba o 25 % levnější. Vysoce agentní až o 45 %. To jsou čísla z účtu @claudeai. My je neměřili.

Batch API dál sráží vstup i výstup o 50 %. US-only inference má v product copy násobek 1,1×. Do toho se tady nepouštíme dál, než to Anthropic sám napsal.

## Tři breaking, pět additive

Kdo volá Fable 5, musí počítat se třemi lámavými změnami. Release notes z 1. září je jmenují.

Forced tool use končí chybou. `tool_choice` typy `any` a `tool` vrací 400. `auto` a `none` zůstávají. Místo vynucení konkrétního nástroje docs posílají na strict tool use nebo structured outputs.

Starší modely nepřečtou thinking bloky z 5.1. API je při přehrání do staršího modelu zahodí. Fable 5.1 naopak bere thinking z Opus 5, Fable 5, Mythos 5 i starších Claude.

Úprava dřívějších tahů thinking invaliduje. U nových účtů od 31. srpna 2026 přehrání bloku po změně `system` promptu, `tools` nebo starší zprávy vrací 400.

Pět věcí je additive. Per-message effort je v betě: effort se dá změnit uprostřed konverzace bez rozbití prompt cache. Turn-scoped system messages jsou taky beta — systémová zpráva platí jen pro aktuální tah. Mezi tool cally umí model posílat čitelné progress updaty (`display: "updates"`, beta). Cache read je levnější, viz výš. A přibývá content provenance: text nese watermark Anthropicu, podporované obrázky a videa z code execution tool nesou C2PA Content Credentials přes Files API.

## Mythos 5.1 jen na pozvánku

Souběžně s Fable 5.1 jde [Claude Mythos 5.1](https://platform.claude.com/docs/en/release-notes/overview). Identifikátor `claude-mythos-5-1`. Stejné specifikace, stejná cena včetně cache 0,25. Přístup je jen pro účastníky Project Glasswing. Docs: contact your Anthropic, AWS, or Google Cloud account team.

Fable je veřejná řada. Mythos je invitation. Tenhle vzorec Anthropic držel už u [Fable 5 a Mythos 5](/clanky/anthropic-fable-mythos/) v červnu.

## Den předtím na Bedrocku

31\. srpna RuntimeWire psal, že `us.anthropic.claude-fable-5-1` a globální varianta na Bedrocku vrací 404 Model not found, zatímco nesmysl a `opus-5-1` vrací 400 invalid. To byl staging signál. Teď ho docs i účet @claudeai překryly oficiálním Released. AWS model card pořád popisuje jen Fable 5. Anthropic v docs u 5.1 Bedrock ID `anthropic.claude-fable-5-1` tvrdí.

## Zdroje

- [Claude na X, 1. 9. 2026 18:03 UTC. Introducing Claude Fable 5.1 and Claude Mythos 5.1](https://x.com/claudeai/status/2094848572143407483)
- [Claude na X. Long-running tasks / research](https://x.com/claudeai/status/2094848579558953258)
- [Claude na X. Cache reads 75 % less than Fable 5](https://x.com/claudeai/status/2094848588190830982)
- [Claude Fable 5.1 — platform docs. Released September 1, 2026](https://platform.claude.com/docs/en/models/fable-5-1/overview)
- [Claude Platform release notes, 1. 9. 2026](https://platform.claude.com/docs/en/release-notes/overview)
- [Pricing — Fable 5.1 $10/$50, cache read $0.25](https://platform.claude.com/docs/en/about-claude/pricing)
- [A Bedrock error suggests Anthropic is staging Claude Fable 5.1 — RuntimeWire, 31. 8. 2026. Jen pozadí.](https://runtimewire.com/article/bedrock-error-anthropic-claude-fable-5-1-staging)
