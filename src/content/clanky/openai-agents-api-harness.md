---
title: "OpenAI Agents API: kdy koupit harness a kdy si ho nechat doma"
description: "Public beta 10. 9.: managed Codex harness bez zvlášť poplatku. Ciridae 0,71→0,85 a SafetyKit −60 % nákladů jsou jejich čísla. US residency, žádné ZDR  -  i se self-host sandboxem."
category: "AI Agenti"
date: "2026-09-11T08:30:00+02:00"
zprava: true
image: "/images/clanky/openai-agents-api-harness.jpg"
---

OpenAI 10. září otevřela veřejnou betu **Agents API**. Harness, na kterém běží Codex, si teď pronajmeš jako službu. OpenAI drží sessiony, orchestraci, zhušťování kontextu a obnovu po pádu. Ty dodáš nástroje a vybereš, kde agent poběží. Za samotný harness se neplatí nic navíc.

Pokud stavíš nebo provozuješ AI agenty pro živnost, malou firmu nebo vlastní tvorbu, řešíš jednu otázku: vzít managed harness od OpenAI, nebo si smyčku dál provozovat sám přes OpenClaw, Grok Bot nebo vlastní kód. Níže je pravidlo, podle kterého se rozhodnout. Nejdřív ale fakta.

## Co Agents API dělá

Codex harness je smyčka kolem modelu: volání modelu, nástroje, správa kontextu, dělení práce na podúkoly. Jádro toho kódu zůstává open source. Agents API je jeho hostovaná verze. Vytvoříš session přes API s hlavičkou `OpenAI-Beta: agents=v1`, pošleš úkol, sleduješ události streamem nebo webhookem. Do stejné session pak můžeš poslat další úkol nebo agenta za běhu usměrnit.

Dělba práce je pevně daná.

- **OpenAI řídí:** životní cyklus session, orchestraci, automatické zhušťování kontextu, když se blíží limit okna, a obnovu přerušené práce.
- **Ty volíš:** nástroje (vlastní funkce, web search, spouštění kódu, MCP servery) a prostředí, ve kterém agent pracuje.

Prostředí jsou tři.

1. `openai_hosted`: sandbox u OpenAI. Agent v něm spouští kód, instaluje balíčky, edituje soubory a vyrábí artefakty ke stažení.
2. `self_hosted` nebo partnerský sandbox: kód a soubory zůstávají u tebe nebo u partnera. OpenAI jmenuje Blaxel, Cloudflare, Daytona, DigitalOcean, E2B, Modal, Oracle, Runloop a Vercel.
3. Bez sandboxu: agent jen volá nástroje a odpovídá.

K tomu multi-agent režim. Hlavní agent rozdělí úkol, pošle části subagentům s vlastním kontextem a výsledky spojí.

## Kolik to stojí

Za harness zvlášť nic. Platíš tokeny vybraného modelu podle běžného ceníku API, nástroje OpenAI v jejich standardních sazbách a hostovaný sandbox v sazbách za kontejner. Vlastní nebo partnerský sandbox si platíš tam, kde běží.

Účet přesto může být vysoký. Dlouhá session se čtyřmi subagenty a průběžným zhušťováním kontextu spálí násobně víc tokenů než jeden dotaz na model. Sazbu za kontejner a odhad tokenů si spočítej před nasazením, ne po prvním vyúčtování.

## Čísla, která ukazuje OpenAI

Ciridae hlásí skóre ve své evaluaci 0,71 → 0,85 a 4× nižší latenci u toků se subagenty. SafetyKit uvádí o 60 % nižší náklady na jeden případ. Obojí jsou firemní čísla zákazníků, ne nezávislý benchmark. My jsme neměřili.

## Dealbreaker: data jen v USA, žádné ZDR

Agents API v betě podporuje data residency jen ve Spojených státech. Zero Data Retention (ZDR) nepodporuje vůbec. A self-host sandbox to nemění. Kód a soubory běží u tebe, ale session, kontext a historie práce zůstávají u OpenAI v USA. Dokumentace to říká výslovně: volba vlastního sandboxu nedělá Agents API způsobilé pro ZDR.

Máš smlouvu nebo zákazníka, kde je EU residency nebo ZDR podmínkou? Pak Agents API pro tyhle úkoly teď použít nejde, bez ohledu na nastavení prostředí.

## Rozhodovací pravidlo

**Vezmi Agents API, když:**

- Chceš agenta rozjet za den, ne za měsíc. Session, obnova, zhušťování kontextu i subagenti jsou hotové.
- Máš dlouhé úkoly, desítky kroků a hodiny běhu, kde se ti vlastní smyčka rozpadá na správě stavu.
- Data smí do USA a ZDR nepotřebuješ.
- Chceš platit jen za spotřebu a neřešit provoz orchestrace.

**Nech si harness doma (OpenClaw, Grok Bot, vlastní smyčka), když:**

- Potřebuješ EU data residency nebo ZDR. Tady debata končí.
- Chceš plnou kontrolu nad orchestrací: vlastní pravidla pro opakování, vlastní paměť, výběr modelu podle kroku, kombinace modelů od více firem.
- Nechceš být závislý na formátu session jedné firmy.
- Agenti ti běží nonstop na vlastním železe a hostovaný kontejner by byl jen další položka na účtu.

Střední cesta existuje: Agents API se `self_hosted` sandboxem. Kód a soubory zůstanou u tebe, orchestraci převezme OpenAI. Problém s residency a ZDR ale neřeší. Na RealTechu jedeme agenty self-host, Grok Bot na vlastním Macu, právě kvůli kontrole nad tím, co kde běží.

## Co sledovat dál

- EU data residency a ZDR pro Agents API. Až to OpenAI přidá, změní se odpověď pro velkou část českých firem.
- Reálnou spotřebu tokenů a cenu kontejnerů u dlouhých session. Beta je nová, čísla z provozu zatím chybí.
- Konec bety. Hlavička `agents=v1` říká, že se rozhraní ještě může hnout.

## Zdroje

- [Agents API overview (OpenAI Developers)](https://developers.openai.com/api/docs/guides/agents-api/overview)
- [OpenAI Releases Agents API in Public Beta, Offering a Managed Codex Agent Runtime (Superpower Daily, 10. 9. 2026)](https://superpowerdaily.com/posts/openai-releases-agents-api-in-public-beta-offering-a-managed-codex-agent-runtime)
- [OpenAI launches Agents API to run the Codex harness as a managed service (Runtime Wire, 10. 9. 2026)](https://runtimewire.com/article/openai-agents-api-managed-codex-harness)
