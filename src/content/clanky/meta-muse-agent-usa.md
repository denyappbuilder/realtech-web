---
title: "Meta vypustil Muse: osobní AI agent má posílat maily a platit. Zatím jen USA"
description: "Agent běží ve vlastní cloudové VM, napojí se na e-mail, kalendář i platby. Základ zdarma, Power 20 dolarů měsíčně, Maximum 100. Reuters: interní testy i chyby kolem citlivých dat."
category: "AI Agenti"
date: "2026-09-09T08:30:00+02:00"
zprava: true
image: "/images/clanky/meta-muse-agent-usa.jpg"
xPosts:
  - "https://x.com/finkd/status/2097402101332590646"
  - "https://x.com/Muse/status/2097399178376671666"
---

Meta v úterý 8. září vypustila **Muse**, osobního AI agenta, který má za člověka vyřizovat úkoly: poslat e-mail, zabookovat cestu, prodat auto nebo shodit účet za služby. Podle Reuters jde o produkt známý interně jako **Hatch** a o hlavní pilíř plánu Marka Zuckerberga dodat „osobní superinteligenci“ miliardám lidí, kteří služby Mety denně používají. Start je zatím **jen v USA**: aplikace pro iOS a Android, web muse.ai a WhatsApp. Do AI brýlí Mety má agent přijít „brzy“, bez bližšího termínu.

## Co agent umí a na čem běží

Muse pohání model **Muse Spark**, který Meta označuje za svůj nejschopnější model pro agentní práci. Nepleťte si ho s API modelem Muse Spark 1.3, o jehož [ceníku jsme psali minulý týden](/clanky/muse-spark-13-misto-fable-astra/). Tady jde o spotřebitelský produkt, ne o tokeny pro vývojáře.

Každý uživatel dostane vlastní **Muse Secure VM**, tedy vyhrazený virtuální počítač v cloudu s vlastním prohlížečem. V něm agent bydlí a ukládá si přihlašovací údaje ke službám, které mu člověk připojí. Reuters vyjmenovává kategorie: e-mail, kalendář, platby, zdraví, nákupy a chytrá domácnost. Muse podle Mety vychází z open-source agenta OpenClaw.

Protože agent běží na vlastním stroji, pracuje i po zavření aplikace. Vrátí se, když se něco změní nebo když potřebuje schválení. Před odesláním e-mailu nebo nákupem se má vždy zeptat. Ke každé akci Meta slibuje kompletní záznam toho, co agent udělal a co plánuje.

Na stejném stroji běží druhý, oddělený agent **Sentinel**. Nic z toho, co Muse dělá, se podle Mety nedostane na internet, dokud to Sentinel neschválí; v některých případech si vyžádá souhlas uživatele.

## Placení přes Stripe Link

Nakupovat má Muse přes **Link od Stripe**. Peněženka pro agenty vygeneruje **jednorázovou kartu**, takže skutečné číslo karty se na webu obchodu neobjeví. Muse je podle Mety první AI agent, na který se vztahují ochrany Linku: krytí poškozeného nebo ztraceného zboží, náhrada při poklesu ceny, vrácení bez poplatku a garance vrácení u způsobilých nákupů. Později má přijít **Shop Pay** a podpora **1Password**, aby agent mohl používat přihlášení, která už člověk má.

## Cena

Oficiální blog je vágní: „zdarma pro většinu toho, co lidé potřebují“, plus předplatné pro ty, kdo chtějí víc. Konkrétní čísla dal Reuters mluvčí Mety: **základ zdarma**, tarif Power za **20 dolarů měsíčně** a Maximum za **100 dolarů měsíčně** pro náročnější používání. Ceny v korunách ani termín pro Evropu Meta neuvedla.

## Soukromí podle Mety

Meta v oznámení vypočítává, co má Muse Secure VM zajistit:

- agent **nevidí hesla ani platební údaje**; sdílené přihlašovací údaje jdou do zabezpečeného úložiště, odkud je používá, aniž by je četl
- uživatel volí, které aplikace agent připojí a s jakým oprávněním; u e-mailu třeba jen čtení, nebo i odesílání
- přístup lze kdykoli změnit nebo službu odpojit
- interakce s Muse lze **vyloučit z trénování** modelů Mety
- konverzace ani data ve VM se **nesdílejí s reklamními systémy** Mety
- co si agent zapamatoval, jde příkazem nechat „zapomenout“

Ještě letos má přijít **Muse Confidential VM**: celý virtuální stroj včetně dat a konverzací šifrovaný klíčem, který má jen uživatel, takže se k obsahu nedostane ani Meta.

## Odklad z dubna a interní testy

Viceprezident Mety pro AI produkty Vishal Shah řekl Reuters, že firma původně plánovala vydání na duben a odložila ho kvůli bezpečnosti. Dodatečná práce podle něj umožnila „překročit práh“ a „splnit minimální laťku“, aby produkt šel do rukou lidí. „Nedá se říct, že nikdy nedojde k chybě,“ dodal.

Reuters zároveň viděl interní příspěvky zaměstnanců, kteří Muse testovali ještě tento týden. Výsledky jsou smíšené. Jeden testující psal, že agent byl při plánování třítýdenní svatební cesty do Indonésie tak užitečný, že se stal „třetím účastníkem“. Jiní hlásili vážnější věci: agent obešel zábrany a **vystavil soukromé fotky z iCloudu** poté, co ho někdo požádal identifikovat hračky na snímcích z dětské oslavy. Technický ředitel Andrew Bosworth psal, že ho aplikace opakovaně **odhlašovala**, někdy několikrát během pár minut. Další zaměstnanec nechal Muse hlídat rychle vyprodané vstupenky a narazil na „mnoho režimů selhání“: agent po zhruba 15 minutách přestal obnovovat stránku, chyby tiše ignoroval a monitoring občas „bez zjevného důvodu“ vypnul.

Meta se ke konkrétním incidentům Reuters nevyjádřila. Podle Reuters navíc uvnitř firmy meziročně přibylo velkých technických a bezpečnostních incidentů o **40 %** v souvislosti s nárůstem AI kódování a agentů, a čas strávený jejich „hašením“ vzrostl o **70 %**.

## Proč Meta spěchá

Reuters připomíná, že Muse je součást snahy Mety najít příjmy mimo reklamu a zhodnotit investice do AI čipů a infrastruktury, které mají letos přesáhnout **130 miliard dolarů**. Agent, který za vás nakupuje a jedná, je k tomu přímočará cesta. Zda funguje spolehlivě, ukážou až první týdny v USA. My jsme ho nezkoušeli; všechna tvrzení o funkcích a ochranách jsou zatím Mety.

## Zdroj

- [Meta Newsroom — Introducing Muse: The World's First Personal AI Agent Built for Everyone](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)
- [Reuters — Meta launches AI agent that can access other apps to send emails, make payments](https://www.reuters.com/business/meta-launches-ai-agent-that-can-access-other-apps-send-emails-make-payments-2026-09-08/)
