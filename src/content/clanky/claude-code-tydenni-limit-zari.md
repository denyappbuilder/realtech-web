---
title: "Claude Code od 14. 9.: o 17 % méně týdně. Tři kroky, než to naběhne"
description: "Dočasný limit +50 % končí 13. 9. Od 14. 9. trvalých +25 % proti starému základu, proti dnešku to je minus 17 %. Checklist: fronta do neděle, /effort medium, druhý poskytovatel."
category: "AI Report"
date: "2026-09-12T08:30:00+02:00"
zprava: true
image: "/images/clanky/claude-code-tydenni-limit-zari.jpg"
xPosts:
  - "https://twitter.com/ClaudeDevs/status/2093742322525810912"
---

Do neděle 13. 9. večer jede Claude Code ještě na dočasných +50 % týdenního limitu. Od pondělí 14. 9. platí trvalých +25 % proti starému základu. Anthropic to na X oznámil jako navýšení. Proti tomu, co máš v účtu dnes, je to o 17 % méně. Obě čísla jsou pravdivá. Záleží, odkud měříš.

Oznámení přišlo 29. srpna z účtu @ClaudeDevs. První vlákno vedlo s +25 %. Anthropic ho smazal a poslal objasnění, které říká rovnou: proti dnešku jde o 17 % snížení týdenních limitů v Claude Code. Zároveň slíbil změny pro lepší přehled a kontrolu nad spotřebou. Sled událostí popsaly BleepingComputer a Everyday AI. Dole najdeš tři kroky, které OSVČ zvládne udělat ještě tento víkend.

## Počty: 100, 150, 125

Anthropic absolutní čísla týdenních limitů nezveřejňuje. Počítej v indexu.

- **Starý standard:** 100.
- **Dnes**, s dočasnými +50 % od 13. 5. 2026: 150.
- **Od 14. 9.**, trvalých +25 %: 125.

125 proti 100 je +25 %. 125 proti 150 je 0,83, tedy minus 17 %. Obojí sedí. Pro plánování práce platí druhé číslo, protože týden si rozvrhuješ podle toho, co máš teď.

Dočasný bonus začal 13. května. Anthropic ho několikrát prodloužil a 31. srpna ho místo dalšího prodloužení překlopil na trvalých +25 %.

**Koho se to týká:** Pro, Max, Team a Enterprise s placením za sedadlo. **Koho ne:** Free a Enterprise s placením podle spotřeby.

**Co se nemění:**

- **Claude.ai chat.** Má vlastní limity. Oznámení se ho netýká.
- **API.** Platíš za tokeny. Týdenní limit tam neexistuje.
- **5hodinové okno.** Oznámení ho nezmiňuje. Podpora u dočasných +50 % uváděla, že se 5hodinové limity nemění. Nic dalšího oficiálně potvrzeno nemáme.

Jedna poznámka k pramenům. Článek podpory Anthropic (stav k 6. 9.) říká jen to, že se týdenní limity po 13. 9. „vrátí na standardní úroveň“. Trvalých +25 % zatím potvrdil pouze účet @ClaudeDevs na X. Pokud se v pondělí ukáže něco jiného, tady to doplníme.

Pro kontext: 6. května Anthropic oznámil dohodu se SpaceX o výpočetní kapacitě. Zároveň zdvojnásobil 5hodinové limity Claude Code a zrušil snížení ve špičce. Týdenních +50 % přišlo o týden později. Teď se z toho balíku ubírá jen týdenní část.

## Princip hodnoty: 3 kroky pro OSVČ

### 1. Do neděle 13. 9.: dojeď těžkou frontu

Zbývajících +50 % má dnes větší cenu než v pondělí. Vytáhni z backlogu úlohy, které žerou nejvíc: refaktory přes víc souborů, review velkých PR, migrace, úlohy pro Opus nebo Fable. Pusť je teď. V pondělí by stály stejné tokeny z menšího balíku.

Konkrétně: sepiš 3 až 5 největších úloh. Seřaď je podle rizika, že je v novém týdnu nedoděláš. Začni odshora. Před startem a před koncem si dej `/usage`, ať víš, kolik ti zbývá.

### 2. Od pondělí 14. 9.: /effort medium na rutinu

Effort řídí, kolik práce Claude na zadání udělá. Kolik souborů přečte, kolik nástrojů zavolá, kolik kroků udělá, než se ti ozve. Týdenní kvótu tím neměníš. Effort formuje spotřebu tokenů, ale nelimituje ji.

Anthropic doporučuje nechat výchozí úroveň a ladit ji podle typu práce, ne úloha od úlohy. Pro rutinu (přejmenování, drobné úpravy, dotazy na kód, který už je v kontextu) je `/effort medium` způsob, jak utratit méně. Když Claude přeskočí soubor nebo nespustí testy, vrať effort výš. Když mu chybí znalost, ne snaha, změň model, ne effort.

Opus a Fable jen tam, kde menší model prokazatelně selhává. Rutinu dej Sonnetu. A `/usage` spouštěj pravidelně: na začátku dne a před každou velkou úlohou. Bez čísla plánuješ naslepo.

### 3. Druhý poskytovatel připravený předem

Týdenní okno se zavře uprostřed práce. Zákazník na to nečeká. Měj druhého kódovacího agenta nainstalovaného, přihlášeného a vyzkoušeného na malé úloze ještě tento víkend. Cursor, Codex, Grok Bot. Ne až ve chvíli, kdy `/usage` ukáže nulu.

Praktické minimum: instrukce k projektu (`CLAUDE.md`, `AGENTS.md`) drž v repozitáři, ať ho druhý agent přečte bez přepisování. Vyzkoušej si na něm jednu hotovou úlohu z tohoto týdne a porovnej výstup. U nás v redakci běží jako záloha Grok Bot na vlastním serveru.

## Co sledovat dál

- **Přehled a kontrola spotřeby.** Anthropic je v objasnění slíbil. Zatím bez data a bez detailu.
- **Článek podpory.** Zda se v něm objeví trvalých +25 %, nebo zůstane u „standardní úrovně“.
- **5hodinové okno po 14. 9.** Oficiálně se nemění. Ověř si to v pondělí na vlastním `/usage`.
- **Team a Enterprise.** Změna platí pro sedadla. Jestli Anthropic upraví i účtování podle spotřeby, zatím neřekl.

## Zdroje

- [@ClaudeDevs na X: objasnění o 17 % proti dnešku (29. 8. 2026)](https://twitter.com/ClaudeDevs/status/2093742322525810912)
- [Using Claude: Claude Code Weekly Limits, Permanent 25% Increase Starting Sept 14, FAQ (7. 9. 2026)](https://usingclaude.com/en/pricing/plans/claude-code-weekly-limits-permanent-25-percent-faq)
- [Hacker News: diskuze k oznámení, 52 komentářů](https://news.ycombinator.com/item?id=49506519)
- [Anthropic: Higher usage limits and a SpaceX compute deal (6. 5. 2026, kontext 5hodinových limitů)](https://www.anthropic.com/news/higher-limits-spacex)
- [Claude blog: Choosing a Claude model and effort level in Claude Code (7. 7. 2026)](https://claude.com/blog/claude-model-and-effort-level-in-claude-code)
- [Everyday AI: Claude Code Usage Limits Are Dropping 17%](https://everydayaiblog.com/claude-code-usage-limits-17-percent-cut/)
- [BleepingComputer: Anthropic is cutting Claude Code's current weekly limits by 17%](https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-is-cutting-claude-codes-current-weekly-limits-by-17-percent/)
