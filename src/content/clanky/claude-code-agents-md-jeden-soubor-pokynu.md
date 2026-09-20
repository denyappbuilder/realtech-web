---
title: "Claude Code čte AGENTS.md: jeden soubor instrukcí pro více agentů"
description: "Claude Code od verze 2.1.277 načte AGENTS.md, pokud v projektu není CLAUDE.md. Jak funguje priorita, čtyři režimy v /config a checklist, kdy stačí jeden soubor."
category: "AI Report"
date: "2026-09-20T10:04:00+02:00"
zprava: true
image: "/images/clanky/claude-code-agents-md-jeden-soubor-pokynu.jpg"
audio:
  url: "https://audio.realtech.cz/claude-code-agents-md-jeden-soubor-pokynu-nlm-365929e5f428.mp3"
  duration: 1292
---

Claude Code ve verzi 2.1.277 začal číst soubor AGENTS.md, tedy formát pokynů, který znají i další kódovací agenti. Pokud v projektu není CLAUDE.md, načte se místo něj AGENTS.md; pokud CLAUDE.md máš, má stále přednost. Přinášíme přehled, co se přesně načítá, jak to přepnout v `/config`, kde to zatím nefunguje, a checklist, kdy ti stačí jeden soubor a kdy je lepší nechat si krátký CLAUDE.md s importem.

Kdo si na jednom projektu vyzkoušel víc kódovacích agentů, zná ten rituál: každý nástroj chce vlastní soubor s pokyny. Claude Code dosud četl CLAUDE.md, řada dalších agentů sáhla po AGENTS.md. Výsledkem byly dva soubory, které se pomalu rozcházely, nebo obezličky typu „CLAUDE.md, který jen odkazuje na AGENTS.md“. Vydání Claude Code 2.1.277 tohle zjednodušuje.

### Co se přesně změnilo

Podle changelogu k verzi 2.1.277 platí jednoduché pravidlo: v projektu, kde není CLAUDE.md, čte Claude Code místo něj AGENTS.md. Dokumentace to doplňuje: repozitář, který už je připravený pro jiné kódovací agenty, funguje bez přidání CLAUDE.md, bez importu a bez jakéhokoli nastavení.

Výchozí chování shrnuje tabulka z dokumentace:

| V repozitáři máš | Claude čte |
| --- | --- |
| AGENTS.md a žádný CLAUDE.md ani CLAUDE.local.md v pracovní složce ani nad ní | tvůj AGENTS.md |
| AGENTS.md a zároveň CLAUDE.md nebo CLAUDE.local.md v pracovní složce nebo nad ní | pouze soubory CLAUDE.md |
| CLAUDE.md, který už AGENTS.md importuje | CLAUDE.md včetně AGENTS.md načteného přes import |

Jen pro jistotu: tady jde o soubor s pokyny v repozitáři. Není to totéž jako funkce „Projects“, kterou Claude Code nabízí mezi platformami a integracemi.

### Co má přednost, když máš oba soubory

CLAUDE.md si drží prioritu. Dokumentace přesně vyjmenovává, které soubory se do kontroly „máš CLAUDE.md?“ počítají a které ne:

- **Počítají se**, a Claude je tedy načte místo AGENTS.md: `CLAUDE.md`, `.claude/CLAUDE.md` nebo `CLAUDE.local.md` v pracovní složce nebo v libovolné složce nad ní.
- **Nepočítají se** a načítají se dál vedle AGENTS.md: tvůj osobní `~/.claude/CLAUDE.md`, firemní spravovaný CLAUDE.md a soubory v `.claude/rules/`.

Z toho plyne jedna past pro jednotlivce: pokud si do projektu, který stojí na AGENTS.md, přidáš vlastní necommitovaný `CLAUDE.local.md` (třeba s adresami testovacích prostředí), Claude ti AGENTS.md přestane číst. Řešením je přepnout nastavení Project instructions na hodnotu `claude-md-and-agents-md`, viz níže.

### Co všechno se z AGENTS.md načte

Když se žádný „počítaný“ CLAUDE.md nenajde, Claude Code při startu sezení načte každý `AGENTS.md` a `.claude/AGENTS.md` v pracovní složce a ve složkách nad ní. V interaktivním sezení to poznáš podle řádku typu `no CLAUDE.md found; AGENTS.md loaded: /home/you/repo/AGENTS.md`.

Dál platí:

- AGENTS.md v podsložce se načte ve chvíli, kdy Claude nástrojem Read otevře soubor v této podsložce a ta nemá žádný z tří vlastních CLAUDE.md.
- Uvnitř AGENTS.md se rozbalují importy `@cesta`, uplatní se vzory `claudeMdExcludes` a subagenti, kteří projektové pokyny přeskakují, přeskočí i tyto soubory.
- Nečtou se `AGENTS.local.md`, `AGENTS.override.md` ani nic ve složce `.agents/`.

### Čtyři režimy v /config

Napiš v sezení `/config`, otevři panel nastavení a u položky Project instructions vyber jednu z hodnot:

| Hodnota | Co Claude čte |
| --- | --- |
| `claude-md-or-agents-md` | CLAUDE.md, nebo AGENTS.md, pokud v pracovní složce ani nad ní žádný CLAUDE.md či CLAUDE.local.md není. Výchozí hodnota |
| `claude-md-and-agents-md` | Oba soubory společně: v každé složce nejdřív CLAUDE.md, potom AGENTS.md. Už načtený AGENTS.md (přes import nebo symlink) se nečte dvakrát |
| `claude-md` | Pouze soubory CLAUDE.md |
| `managed-only` | Při startu pouze firemní spravovaný CLAUDE.md a automatická paměť. Projektové, lokální i uživatelské CLAUDE.md, `.claude/rules/` a všechny AGENTS.md se vynechají; CLAUDE.md a pravidla v podsložkách se přesto načtou, když tam Claude čte soubor |

Hodnotu lze zapsat i do souboru s nastavením, pod ID vestavěného pluginu `agents-md` v `pluginConfigs` (v `~/.claude/settings.json`, v souboru předaném přes `--settings` nebo ve spravovaném nastavení). V projektovém a lokálním souboru nastavení ji Claude Code ignoruje. Změna platí od další odeslané zprávy a v každém novém sezení.

### Kde to zatím nefunguje

Changelog uvádí, že podpora zatím není na Bedrocku, Vertexu ani Foundry. Dokumentace k tomu přidává další situace, kdy Claude čte jen CLAUDE.md a položka Project instructions se v `/config` vůbec nezobrazí:

- verze Claude Code starší než 2.1.277,
- sezení, které nestahuje příznaky funkcí od Anthropicu, například Amazon Bedrock či jiný poskytovatel třetí strany, nebo vypnutá telemetrie,
- úplně první sezení po instalaci nebo upgradu na verzi s podporou AGENTS.md (od dalšího sezení už funguje),
- nastavené `disableAllHooks` nebo `allowManagedHooksOnly`, případně vypnutý vestavěný plugin `agents-md` v `/plugin`.

Ve všech těchto případech doporučuje dokumentace jediné: importovat AGENTS.md z CLAUDE.md.

### V čem se přímo načtený AGENTS.md liší

Přímo načtený AGENTS.md se nezobrazí v `/memory` ani v seznamu Memory files v `/context`. Že ho Claude načetl, poznáš podle řádku `AGENTS.md loaded`, nebo se Clauda zeptej, co říkají jeho projektové pokyny. Hooky `InstructionsLoaded` se pro něj nespouštějí (pro AGENTS.md importovaný z CLAUDE.md ano). Složky přidané přes `--add-dir` s nastavenou proměnnou `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` načtou svůj CLAUDE.md, ale svůj AGENTS.md ne.

### Checklist: stačí samotný AGENTS.md, nebo si nechat CLAUDE.md?

**Samotný AGENTS.md ti stačí, když:**

- máš Claude Code 2.1.277 nebo novější a pracuješ přes Anthropic, ne přes Bedrock, Vertex či Foundry,
- v repozitáři není žádný CLAUDE.md ani CLAUDE.local.md v pracovní složce nebo nad ní,
- nepotřebuješ pokyny jen pro Clauda, které ostatní agenti nemají vidět,
- ti nevadí, že soubor neuvidíš v `/memory` a `/context`, a nespoléháš na hook `InstructionsLoaded`.

**Nech si CLAUDE.md s řádkem `@AGENTS.md`, když:**

- část lidí nebo sezení běží na Bedrocku, Vertexu, Foundry, s vypnutou telemetrií nebo na starší verzi,
- chceš k sdíleným pokynům přidat něco jen pro Claude Code; dokumentace ukazuje vzor, kde je na prvním řádku `@AGENTS.md` a pod ním oddíl s pokyny pro Claude (Claude přečte nejdřív import, pak zbytek),
- máš Project instructions nastavené na `claude-md`,
- chceš, aby AGENTS.md figuroval v `/context` a spouštěl hooky.

Import `@AGENTS.md` v CLAUDE.md můžeš klidně nechat i po upgradu: dokumentace výslovně říká, že nikdy nevede k dvojímu načtení, ať máš Project instructions nastavené jakkoli.

**Symlink `ln -s AGENTS.md CLAUDE.md`** funguje také, ale se dvěma háčky: nástroje Edit a Write odmítají zapisovat přes symlink a odkážou Clauda na cílový soubor, a na Windows dokumentace symlink nedoporučuje vůbec (potřebuje práva správce nebo vývojářský režim a Git ho bez zapnutého `core.symlinks` vytáhne jako obyčejný textový soubor). U obou variant si v dalším sezení spusť `/context` a ověř, že CLAUDE.md je mezi Memory files.

### Zůstala ti obezlička? Co s ní

- CLAUDE.md jen s `@AGENTS.md`: můžeš nechat; smaž ho, pokud v něm nic jiného není, nebo ho ponech pro sezení, která AGENTS.md přímo načíst nedokážou.
- CLAUDE.md, který Clauda slovy prosí, aby si AGENTS.md přečetl: Claude ho vidí, jen když se sám rozhodne soubor otevřít. Smaž ho, nebo větu nahraď importem `@AGENTS.md`.
- CLAUDE.md jako symlink na AGENTS.md: nic dělat nemusíš, nebo symlink smaž. Obsah se načte jednou.
- Hook `SessionStart`, který AGENTS.md vypisuje: odstraň. Jinak se do kontextu dostane druhá kopie.

Pro živnostníka i malý tým je to tedy poměrně jasná volba: jeden AGENTS.md, pokud všichni jedou přes Anthropic na aktuální verzi, jinak krátký CLAUDE.md s importem. Dvě rozcházející se sady pokynů už udržovat nemusíš.

## Zdroje
- Claude Code CHANGELOG, oddíl 2.1.277 – https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md (přiložený výřez CHANGELOG-2.1.277.md; přístup 2026-09-19)
- Claude Code Docs: „How Claude remembers your project“, oddíl AGENTS.md – https://code.claude.com/docs/en/memory (stránka uvádí datum úpravy 2026-09-18; přístup 2026-09-19)
