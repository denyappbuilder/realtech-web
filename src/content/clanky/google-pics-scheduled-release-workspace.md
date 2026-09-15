---
title: "Google Pics: od 15. 9. nabíhá i Scheduled Release. Checklist pro Workspace"
description: "AI generování a úpravy obrázků v Docs/Slides. Rapid už od 1. 9., Scheduled od 15. 9. Business Standard+ ano, Starter ne. Limity vyšší aspoň do 28. 2. 2027."
category: "AI Report"
date: "2026-09-15T23:05:00+02:00"
zprava: true
image: "/images/clanky/google-pics-scheduled-release-workspace.jpg"
audio:
  url: "https://audio.realtech.cz/google-pics-scheduled-release-workspace-nlm.mp3?v=c50e546a9578"
  duration: 1369
---

Google Pics je od 1. září 2026 obecně dostupný. Generuješ a upravuješ obrázky přímo ve Workspace, včetně Docs a Slides. Kdo má Rapid Release, už to mohl vidět od začátku měsíce. Kdo jede Scheduled Release, typické pro spoustu firemních tenantů, začíná postupný rollout právě dnes, 15. září, a může trvat až 15 dní, než se funkce u tebe objeví.

To není další „AI malíř“ vedle Canvy. Oficiálně jde o AI generování a přesné objektové úpravy uvnitř Google Workspace workflow, s historií verzí a upscalem na 2K nebo 4K. Pro českou OSVČ nebo malou firmu na Workspace je praktická otázka jiná: mám to vůbec v edici, kdy to uvidím, a co s limity?

## Co Pics umí (podle Google)

Podle [Workspace Updates z 1. 9. 2026](https://workspaceupdates.googleblog.com/2026/09/google-pics-brings-pro-level-ai-image-creation-and-editing-to-Google-Workspace.html) otevřeš Pics, napíšeš prompt a dostaneš více variant. Nebo importuješ soubor z počítače, Drive nebo Google Photos. Dál Google uvádí:

- lokální úpravy konkrétních prvků (hover a výběr),
- editaci, přeformátování nebo překlad textu v obrázku,
- crop pro web, sociální sítě, tisk nebo digitál,
- upscale na 2K nebo 4K,
- historii verzí, abys vrátil nechtěnou změnu.

Důležité pro denní práci: obrázek v Docs nebo Slides vybereš a jedním klikem ho otevřeš v Pics, aniž bys skákal do jiné appky. Sdílení a spolupráce mají fungovat jako u ostatních Workspace aplikací; v „nadcházejících týdnech“ Google slibuje i otevření téměř libovolného obrázku z Drive jedním klikem. To zatím ber jako roadmapu, ne jako dnešní hotovou vlastnost.

## Rapid vs Scheduled: proč právě 15. 9.

Rollout Google rozdělil explicitně:

- **Rapid Release:** postupný rollout (až 15 dní viditelnosti) od **1. 9. 2026**
- **Scheduled Release:** totéž tempo, ale start **15. 9. 2026**

Když jsi admin a nevíš, jestli máš Rapid nebo Scheduled, koukej v Admin konzoli na release track. Dnes neznamená, že to máš hned v 8:00. Znamená, že Google začal 15denní okno. Když to kolega vidí a ty ne, nejdřív zkontroluj OU a vypínač Pics, ne „že to Google zrušil“.

## Kdo to má a kdo ne

Oficiální dostupnost:

- **Business:** Standard a Plus
- **Enterprise:** Standard a Plus
- **Spotřebitelé:** Google AI Pro a Ultra
- **Education add-on:** Google AI Pro for Education
- **Other add-ons:** AI Expanded Access

**Business Starter v seznamu není.** Když jsi na Starteru a marketing kolem Pics tě láka, nečekej to jako součást balíčku, dokud Google edici výslovně nepřidá. Stejně tak: admin může Pics vypnout na úrovni domény, OU nebo skupiny — produkt je defaultně zapnutý, ale vypnutý tenant vypadá zvenku stejně jako „nemám edici“.

## Limity: co platí a do kdy

Google píše, že generativní funkce v Pics podléhají limitům. **Až do 28. 2. 2027** mají mít uživatelé vyšší přístup k těmto funkcím; potom se přístup může omezit a Google slibuje předem oznámit změny. Použití Pics z jiných povrchů (třeba Slides) podléhá stávajícím limitům generování obrázků Workspace.

Prakticky: plánuj zásobu vizuálů a šablon teď, ale nestav byznys proces na předpokladu, že „vyšší limity“ zůstanou navždy. Po únoru 2027 ověř znovu Admin Help a aktuální limity — ne citaci z tohoto článku.

## Checklist pro CZ Workspace (dnes)

1. **Edice.** Jsi na Business/Enterprise Standard nebo Plus (nebo AI Pro/Ultra)? Starter = nečekej Pics v balíku.
2. **Release track.** Rapid už od 1. 9.; Scheduled od 15. 9. (až 15 dní).
3. **Admin vypínač.** Pics ON by default; zkontroluj, že není vypnutý pro tvoji OU.
4. **Kde to zkoušet.** Nejdřív firemní slide nebo interní one-pager v Docs/Slides, ne veřejný klientský materiál bez kontroly.
5. **Canva / CapCut.** Pics nahrazuje skákání ven hlavně u firemních slidů a Docs. U brand kitů, tisku a sociálních formátů mimo Google ekosystém pořád ověř, jestli ti stačí crop/upscale v Pics.
6. **Limity.** Zapiš si datum 28. 2. 2027 jako checkpoint na generativní kvóty; do té doby počítej s vyšším přístupem podle Google, ne s nekonečnem.
7. **Roadmapa Drive.** Jedním klikem z Drive „coming weeks“ — nepiš klientovi, že to už máš, dokud to neuvidíš.

## Co z toho neplyne

Pics není důkaz, že Google „zabíjí Canvu“. Není to ani záruka češtiny v UI ani konkrétních modelů uvnitř promptu — Google v oznámení mluví obecně o „best AI imaging models“, bez jmen modelů v tomhle postu. A není to povolení posílat do klienta AI vizuál bez lidské kontroly textu v obrázku (překlady a textové prvky Google zmiňuje jako schopnost — právě proto je lidská kontrola důležitější, ne méně).

## Shrnutí

15. září 2026 je start Scheduled Release okna pro Google Pics, ne magický den, kdy to mají všichni najednou. Máš Standard/Plus a zapnutý Pics? Dej si 15 dní na rollout a vyzkoušej editaci přímo ze Slides. Jsi na Starteru? Nečekej to v balíku. A limity si kalendářuj k 28. 2. 2027 — Google vyšší přístup slibuje jen do té doby.
