---
title: "JetBrains Air vedle Cursoru: checklist, kdy má smysl a co ověřit před BYOK"
description: "JetBrains Air spojuje Claude Agent, Codex, Junie i Copilot v JetBrains IDE. Checklist, kdy dává smysl vedle Cursoru a co ověřit před BYOK."
category: "AI Report"
date: "2026-09-24T10:48:47+02:00"
zprava: true
image: "/images/clanky/jetbrains-air-vs-cursor-checklist-byok.jpg"
audio:
  url: "https://audio.realtech.cz/jetbrains-air-vs-cursor-checklist-byok-nlm-e4bb72bf936f.mp3"
  duration: 1527
---

JetBrains 22. září 2026 představil JetBrains Air, zastřešující systém pro práci s AI agenty v IDE, v týmu i na úrovni firmy. Pokud dnes kóduješ s Cursorem nebo Copilotem a zároveň žiješ v IntelliJ, WebStormu nebo PHPStormu, tady máš checklist: podle čeho poznat, že Air dává smysl, kdy zůstat u toho, co máš, a co si ověřit, než do něj připojíš vlastní klíče.

## Co JetBrains Air vlastně je

JetBrains pod názvem Air sjednotil svoji dosavadní práci na agentech do jednoho systému, který se skládá ze tří částí:

- **Air v JetBrains IDE**: řízení a orchestrace agentů přímo v IDE, včetně kontroly jejich výstupu s pomocí kódové inteligence, kterou IDE už má.
- **Air Teams**: koordinace a automatizace vývojových workflow, kde spolu pracují vývojáři a autonomní agenti.
- **Air Governance** (dříve JetBrains Central): firemní politika, přehled, auditovatelnost, řízení nákladů a odpovědnost za vývoj s agenty.

Základní myšlenka je multi-vendor. JetBrains říká, že žádný jeden model, agent ani služba nepokryje všechny úkoly, a Air má být místo, kde sdílíš kontext, máš jednu sadu pravidel, jeden pohled na náklady a záznam toho, co se stalo, bez ohledu na dodavatele agenta.

Vlastní agent JetBrains se jmenuje **Junie** a funguje napříč všemi částmi Air. Cizí agenty připojíš přes **Agent Client Protocol (ACP)**, který napojí IDE na celý „harness“ agenta (plánování, nástroje, směrování modelů, observabilita). Kompatibilní agenty najdeš v ACP Registry.

Rozjezd je postupný. Cloudové běhy jsou podle air.dev zatím dostupné jen části zákazníků a zbytek se má dostávat ke slovu během následujících měsíců.

## Které agenty do Air připojíš a přes jaký účet

Podle air.dev Air pracuje s agenty **Claude Agent, Codex, Junie, Copilot, OpenCode** a s čímkoli, co umí ACP. Oficiální nápověda k tomu přidává **Gemini CLI**. Zásadní věc, kterou lidé při rozhodování přehlížejí: každý agent vyžaduje jiný typ účtu.

| Agent | Co potřebuješ |
|---|---|
| Claude Agent | účet v Anthropic Console s API billingem; API klíč se používá i v Docker prostředích |
| OpenAI Codex | ChatGPT (Plus/Pro/Team) nebo API billing na OpenAI Platform |
| Gemini CLI | Google účet (osobní/Workspace) nebo Google AI Studio s API billingem |
| Junie | přihlášení JetBrains účtem |
| Vlastní agent přes ACP | libovolný ACP kompatibilní agent na tvém stroji, s vlastním předplatným |

Přístup k modelům řešíš buď přes předplatné JetBrains AI (**AI Pro nebo AI Ultimate**), nebo přes vlastní účet u poskytovatele, tedy předplatné typu Claude Pro/Max/Team, případně API klíč (BYOK). Air umožňuje i vlastní base URL a přepínání poskytovatele během rozpracované session. Když nemáš vlastní klíče, můžeš čerpat JetBrains AI kredity za veřejné ceny API daného poskytovatele.

Důležité omezení z nápovědy: vlastní účet u poskytovatele funguje pro **lokální běhy** v desktopové aplikaci Air. Pro cloudové úlohy a webovou verzi platí jen ti poskytovatelé a agenti, které povolil správce organizace v JetBrains Central Console.

## Kdy Air dává smysl vedle Cursoru

Následující body jsou redakční doporučení, ne ověřený produktový fakt. Air má smysl zvažovat, když platí aspoň dvě z těchto věcí:

- **Tvůj domov je JetBrains IDE.** Cursor znamená přejít na jiný editor. Air ti dává agenty v IntelliJ, WebStormu nebo PHPStormu, kde už máš inspekce, refaktoring a debugger nastavené.
- **Střídáš agenty podle úkolu.** Na jeden typ práce chceš Claude Agent, na jiný Codex nebo Junie, a nechceš to řešit v pěti terminálech. Multi-vendor je přesně to, kolem čeho je Air postaven.
- **Pouštíš víc věcí paralelně a chceš je kontrolovat v IDE.** Air nabízí paralelní projekty a sessions, review diffů v kontextu IDE a komentáře k řádkům, které jdou zpátky agentovi jako instrukce.
- **Jste firma a někdo se ptá „kdo za to platí a kdo to schválil“.** Air Teams a Governance přidávají sdílené cloudové projekty, automatizace (code review, release notes, opravy), definici prostředí (velikost VM, přístup na internet, secrets), centrální MCP, pravidla a oprávnění, limity nákladů, firemní BYOK klíče (Bedrock, OpenAI, Anthropic a další) a analytiku.

## Kdy zůstat u Cursoru nebo Copilotu

- Nepoužíváš JetBrains IDE a nemáš důvod začínat. Air je stavěný kolem něj.
- Vystačíš si s jedním agentem a jedním předplatným. Multi-vendor přidává vrstvu navíc, kterou nevyužiješ.
- Potřebuješ cloudové běhy hned. Rollout je postupný a nemáš jistotu, že se k tobě dostane v tvém termínu.
- Jsi na Linuxu a spoléháš na Docker prostředí pro agenty. Podle changelogu Air Docker prostředí na Linuxu zatím nejsou.
- Máš JetBrains AI Free nebo Enterprise. Na air.dev se objevuje informace, že tyto tiery Air nepodporuje a trial z Air nejde aktivovat. Před rozhodnutím to zkontroluj přímo na air.dev.

## Co ověřit, než zapneš BYOK

Vlastní klíč znamená, že platíš poskytovateli přímo a podle toho, co agent spotřebuje. Než ho do Air vložíš, projdi si tohle:

1. **Cena tokenů u poskytovatele.** Air ceny nestanovuje, platíš tarif Anthropic, OpenAI nebo Google. Podívej se na aktuální ceník daného modelu a odhadni, kolik toho paralelní sessions protočí.
2. **Předplatné vs. API billing u Claude.** Předplatné Claude Pro/Max/Team pokryje lokální běhy v Air (kvóta se čerpá z předplatného, Air podle JetBrains tvoje přihlašovací údaje neukládá). Docker prostředí a cloudové běhy ale vyžadují API billing nebo JetBrains AI kredity, protože token předplatného zůstává na tvém stroji a do izolovaného kontejneru se nepředává.
3. **Firemní politika.** Čí klíč se používá, kam odchází kód a kdo to vidí. Pro cloud a web verzi rozhoduje správce v Central Console, ne ty.
4. **Lokálně, v Dockeru nebo v cloudu.** Každý z těchto režimů má jiné požadavky na účet (viz tabulka výše). Rozmysli si, který skutečně potřebuješ.
5. **Tier JetBrains AI.** Pro managed přístup počítej s AI Pro nebo AI Ultimate. Pokud máš Free nebo Enterprise, ověř si na air.dev, co pro tebe platí.
6. **Kombinace JetBrains AI a BYOK.** Podle air.dev jde obojí používat zároveň a nakonfigurovaný BYOK má přednost. Zkontroluj si to v nastavení, aby ti účet netekl tam, kde nechceš.

## Jednoduché pravidlo na závěr

Praktické pravidlo: pokud jsi v JetBrains IDE a chceš víc než jednoho agenta, Air si vyzkoušej lokálně s vlastním předplatným a bez cloudu. To je nejlevnější způsob, jak zjistit, jestli ti multi-vendor přístup něco dává. Pokud jsi spokojený v Cursoru s jedním modelem, žádný důvod měnit editor teď není. A pokud řešíš firmu, začni od Governance a otázky, kdo nese náklady a odpovědnost, ne od výběru agenta.

Další praktické checklisty k AI nástrojům pro vývojáře najdeš na [realtech.cz](https://realtech.cz).

