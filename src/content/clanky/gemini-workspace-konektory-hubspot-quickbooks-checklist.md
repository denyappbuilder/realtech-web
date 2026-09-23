---
title: "Gemini ve Workspace napojí HubSpot i QuickBooks: checklist konektorů"
description: "Gemini v Google Workspace od 15. 9. napojí HubSpot, QuickBooks, Mailchimp a další. Checklist pro běžné uživatele Workspace: co zapnout a co zatím nezapisovat."
category: "AI Report"
date: "2026-09-21T06:06:31+02:00"
zprava: true
image: "/images/clanky/gemini-workspace-konektory-hubspot-quickbooks-checklist.jpg"
audio:
  url: "https://audio.realtech.cz/gemini-workspace-konektory-hubspot-quickbooks-checklist-nlm-730ce720fe4f.mp3"
  duration: 1544
---

Google 15. září 2026 oznámil, že Gemini v Google Workspace umí přes Model Context Protocol (MCP) pracovat s Asanou, Atlassian Rovo, HubSpotem, Intuit Mailchimpem, Intuit QuickBooks, Monday a Salesforcem. Data z těchto nástrojů si vytáhneš v postranním panelu Gemini v Docs, Sheets, Slides a v Google Chatu, bez přepínání záložek. Pro malé firmy je důležité: funkce je pro správce zapnutá ve výchozím stavu. Než ji začneš používat na živých datech klientů, projdi si tenhle checklist.


Pokud platíš Google Workspace s Gemini nebo máš Google AI Pro či Ultra, od 15. září se ti v postranním panelu Gemini objevila nová věc: konektory na cizí nástroje. Google to oznámil na svém blogu Workspace Updates a zopakoval v týdenním souhrnu z 18. září. Jde o sedm služeb, které Gemini umí přes MCP oslovit: **Asana, Atlassian Rovo, HubSpot, Intuit Mailchimp, Intuit QuickBooks, Monday a Salesforce**.

Smysl je jednoduchý. Píšeš nabídku v Docs a potřebuješ vědět, co jsi s klientem řešil naposledy v HubSpotu. Skládáš tabulku v Sheets a chceš k ní čísla z QuickBooks. Google slibuje, že si tyhle informace vytáhneš rovnou v panelu Gemini, aniž bys přepínal záložky, stahoval soubory nebo přerušoval práci. V oznámení výslovně jmenuje Sheets, Gmail, Drive, Docs a Chat „a další“, pro koncové uživatele pak konkrétně postranní panel v Docs, Sheets, Slides a Google Chatu.

## Co přesně Google oznámil

Držme se toho, co je v oznámení černé na bílém:

- **Sedm konektorů přes MCP:** Asana, Atlassian Rovo, HubSpot, Intuit Mailchimp, Intuit QuickBooks, Monday, Salesforce.
- **Kde to najdeš:** postranní panel Gemini v Docs, Sheets a Slides a také v Google Chatu, jakmile to správce povolí.
- **Výchozí stav: zapnuto.** Pro uživatele s přístupem ke Gemini for Google Workspace je funkce ON by default. Správce ji může řídit na úrovni domény, organizační jednotky nebo skupiny.
- **Kde se to nastavuje:** Admin console → Apps → Google Workspace → Gemini for Workspace → Third-Party Connectors. Správce určuje, které konektory jsou povolené, a spravuje přístupové zásady.
- **Dostupnost:** Rapid i Scheduled Release domény, dostupné hned.
- **Edice:** Business (Business, Standard, Plus), Enterprise (Enterprise, Standard, Plus), spotřebitelské Google AI Pro a Ultra, Enterprise Essentials Plus a vzdělávací doplňky Google AI Pro for Education, Teaching and Learning a Endpoint Education.

Jedna důležitá poznámka, aby ses nespletl: 17. září Google oznámil ještě **integrace třetích stran ve Workspace Studio** (beta). Tam jsou mezi službami taky Asana, HubSpot, Mailchimp, QuickBooks nebo Salesforce, ale jde o jiný produkt, o automatizované toky ve Studiu, a ty jsou naopak **vypnuté ve výchozím stavu**. Tento článek je jen o konektorech v postranním panelu Gemini.

## Proč to řešit, když jsi OSVČ nebo malá firma

Tady končí fakta od Googlu a začíná redakční pohled. Ve velké firmě si to přebere IT oddělení. V malé firmě jsi správce Workspace často ty sám, nebo účetní, nebo nikdo. A přesně na tebe cílí to „zapnuto ve výchozím stavu“: nikdo nic neklikal, a přesto může Gemini při psaní dokumentu sáhnout do tvého CRM, účetnictví nebo mailingového nástroje, pokud si uživatel konektor v panelu propojí.

To samo o sobě není špatně – je to pohodlné. Ale data v HubSpotu, Salesforcu, QuickBooks nebo Mailchimpu jsou zpravidla data tvých klientů, ne tvoje. A ta si zaslouží, abys věděl, kdo k nim přes Gemini přistupuje a co s nimi dělá.

## Checklist: než začneš konektory používat (redakční)

**1. Zjisti, jestli jsi vůbec správce**

- Máš Workspace pro firmu (Business Standard/Plus a výš)? Pak někdo je správce. Přihlas se do Admin console a najdi cestu Apps → Google Workspace → Gemini for Workspace → Third-Party Connectors.
- Máš jen osobní Google AI Pro nebo Ultra? Pak žádnou Admin console nemáš a konektory řešíš sám za sebe přímo v panelu Gemini.

**2. Projdi seznam a vypni, co nepoužíváš**

- Sedm konektorů, sedm rozhodnutí. Nepoužíváš Salesforce? Vypni ho. Nemáš QuickBooks? Vypni. Konektor, který nikdo ve firmě nepotřebuje, je jen zbytečná plocha k chybě.
- Google výslovně říká, že správce může řídit, které konektory jsou povolené. Využij to. Menší seznam se lépe hlídá.

**3. Nastav to po skupinách, ne pro všechny**

- Správa jde na úrovni domény, organizační jednotky nebo skupiny. V malé firmě to znamená: účetní ať má QuickBooks, obchod ať má HubSpot nebo Salesforce, marketing Mailchimp. Brigádník na letní výpomoc nepotřebuje nic z toho.

**4. Zkontroluj oprávnění na straně druhého nástroje**

- Konektor je jen most. Co Gemini v HubSpotu nebo Asaně uvidí, záleží na tom, pod jakým účtem a s jakými právy se uživatel propojí. Pokud má tvůj obchodník v CRM přístup ke všemu, uvidí přes Gemini taky všechno.
- Před zapnutím si u každé služby ověř, jaká oprávnění propojení vyžaduje. Google odkazuje na Help Center k správě konektorů třetích stran; přečti si ho dřív, než klikneš „povolit“.

**5. Zatím to ber jako čtečku, ne jako zapisovačku**

- Oznámení Googlu mluví o „přístupu k informacím“ bez přepínání záložek. Co přesně jednotlivé konektory umí měnit nebo zapisovat zpět do CRM či účetnictví, blog nespecifikuje.
- Dokud si to neověříš v nápovědě a nevyzkoušíš na testovacím účtu, drž se pravidla: **Gemini smí číst, člověk zapisuje.** Nenech AI zakládat kontakty, měnit fáze obchodu, upravovat faktury v QuickBooks ani rozesílat kampaně v Mailchimpu. Chybu v dokumentu smažeš. Chybu v účetnictví nebo v rozeslané kampani už tak snadno ne.

**6. Pozor na to, co odchází ven**

- Když Gemini vytáhne data z CRM do Docs, jsou najednou v dokumentu, který můžeš sdílet. Dokument s exportem klientských kontaktů je jiná liga než interní poznámka. Než něco nasdílíš, zkontroluj, co vlastně v souboru je.
- Pokud zpracováváš osobní údaje klientů, ověř si, že napojení AI na CRM odpovídá tomu, co máš v smluvní dokumentaci a jak máš nastavené zpracování.

**7. Udělej malý test**

- Zapni jeden konektor jednomu člověku. Nech ho v Sheets položit pár otázek na data, která znáš. Porovnej, co Gemini vrátí, s tím, co v nástroji skutečně je.
- Až pak rozšiřuj na zbytek firmy.

## Shrnutí

Konektory v Gemini jsou užitečná věc: méně přepínání, míň kopírování, data tam, kde píšeš. Ale „zapnuto ve výchozím stavu“ znamená, že rozhodnutí, které by měl udělat člověk, za tebe udělal Google. Vezmi si ho zpátky: otevři Admin console, vypni, co nepoužíváš, rozděl přístup po skupinách a Gemini zatím nech jen číst. Až se ukáže, co konektory reálně umí a jak spolehlivě, můžeš pouštět dál.

## Zdroje

- Google Workspace Updates, „Connect to more tools with Gemini in Google Workspace“, 15. 9. 2026 – https://workspaceupdates.googleblog.com/2026/09/connect-to-more-tools-with-gemini-in-Google-Workspace.html (primární zdroj: sedm konektorů přes MCP, aplikace, ON by default, cesta v Admin console, správa na úrovni domény/OU/skupiny, rollout „Available now“, seznam edic)
- Google Workspace Updates, přehled září 2026 včetně Weekly Recap 18. 9. 2026 – https://workspaceupdates.googleblog.com/2026/09/ (potvrzení oznámení z 15. 9. v týdenním souhrnu; samostatné oznámení Workspace Studio 3P integrations z 17. 9., OFF by default, beta)
