---
title: "Claude spojil chat s Cowork: Docs a Slides v betě a checklist pro klienty"
description: "Anthropic 16. září 2026 oznámil, že Cowork přestává být samostatný prostor a stává se součástí hlavního chatu Claude. Ty už nevybíráš, kam úkol pošleš – Claude sám rozh"
category: "AI Report"
date: "2026-09-18T08:00:00+02:00"
zprava: true
image: "/images/clanky/claude-cowork-docs-slides-checklist.jpg"
audio:
  url: "https://audio.realtech.cz/claude-cowork-docs-slides-checklist-nlm.mp3?v=4bd1c4488311"
  duration: 746
---

Anthropic 16. září 2026 oznámil, že Cowork přestává být samostatný prostor a stává se součástí hlavního chatu Claude. Ty už nevybíráš, kam úkol pošleš – Claude sám rozhodne, jestli stačí krátká odpověď, nebo jde o delší práci, která poběží i po zavření notebooku. K tomu přibývají Claude Docs a Claude Slides (beta na placených plánech) a Claude Design se přesouvá přímo do konverzace. Zní to jako nástroj na nabídky a prezentace pro klienty. Než to ale pustíš do ostrého provozu, projdi si pár věcí.

## Co se přesně změnilo (fakta od Anthropic)

Podle oznámení na blogu Anthropic (16. 9. 2026) jde o tyhle změny:

- **Cowork a chat jsou jeden Claude.** Dřív jsi musel přemýšlet, jestli otevřít běžný chat, nebo Cowork. Teď zadáš, co potřebuješ, a Claude si sám určí, jestli odpoví hned, nebo se pustí do většího úkolu.
- **Větší práce pokračuje i po zavření notebooku.** Delší úkol nemusíš hlídat, Claude na něm pracuje dál.
- **Claude Docs a Claude Slides jsou nové.** Dokument píšeš s Claudem společně. U prezentace Claude navrhne slidy, ty je můžeš rovnou upravovat, prezentovat přímo z Claude, nebo stáhnout jako PowerPoint či PDF.
- **Claude Design je nově v konverzaci.** Samostatný Design přitom dál funguje.
- **Docs, Slides a Design v chatu jsou beta na placených plánech.** U Enterprise rozhodují admini, kdy funkce zapnou.
- **Výchozí chování: Claude se před akcí zeptá.** Volitelně můžeš přepnout do režimu, kdy pracuje dál a ozve se, když něco potřebuje. Poslední slovo máš podle Anthropic vždy ty.
- **Rollout:** nejdřív Pro a Max (web, desktop, mobil) v následujících týdnech, nic se nezapíná ručně. Team a Free přijdou brzy poté. Enterprise admini dostanou alespoň 30 dní předem upozornění.

## Co k tomu dodává The Next Web (parafráze, ne fakta od Anthropic)

TNW (17. 9. 2026) shrnuje kontext, který v oznámení Anthropic přímo nenajdeš, takže ho ber jako sekundární zdroj:

- Cowork začal v lednu jako [oddělený prostor pro agentní úkoly](/clanky/claude-cowork-sandbox-utek/); teď o tom, jestli jde o chat, nebo delší agentní práci, rozhoduje Claude.
- Dokumenty a prezentace mají mít sdílitelný odkaz pro desktop i mobil. TNW píše o exportu do formátů Google, PowerPointu nebo PDF. **Pozor:** Anthropic ve svém blogu zmiňuje jen PowerPoint a PDF. Export do Google formátů je tedy tvrzení TNW, dokud ho Anthropic nepotvrdí.
- Claude Design se objevil v dubnu a běží na enginu od Canvy; nyní je dostupný v hlavní konverzaci.
- [Claude Code zůstává oddělený produkt](/clanky/claude-code-tydenni-limit-zari/).
- Paměť mezi chatem a Cowork byla podle TNW sloučena už minulý měsíc, takže tohle je logický další krok.

## Proč to řešit, když píšeš nabídku klientovi

Tady končí fakta a začíná redakční pohled. Typický český uživatel Claude není vývojář, který volá API. Je to člověk, co potřebuje ve středu odpoledne dát dohromady nabídku, cenový návrh nebo deck na čtvrteční schůzku. Přesně na to Docs a Slides míří: napíšeš, co chceš, Claude připraví strukturu, ty doplníš čísla a upravíš tón.

Zároveň je to první moment, kdy Claude nejenom radí, ale **vytváří výstup, který může odejít ven z firmy**. A to si zaslouží víc opatrnosti než běžný chat.

## Checklist, než to pustíš do nabídky (redakční)

**1. Kdy ti to reálně ušetří čas**

- První draft struktury nabídky nebo prezentace, když máš podklady, ale ne čas je přepisovat.
- Přepracování existujícího textu do slidů (a naopak).
- Varianty téže nabídky pro různé cílové skupiny.
- Naopak to nešetří čas, když nemáš jasno v ceně, rozsahu nebo v tom, co klient vlastně chce. Claude ti to nevymyslí, jen to hezky zabalí.

**2. Lidské schválení před odesláním – vždycky**

- Nech výchozí nastavení, kdy se Claude před akcí ptá. Režim „pracuj dál a ozvi se" je fajn pro interní věci, ne pro cokoliv, co míří ke klientovi.
- Než dokument nebo slidy sdílíš odkazem nebo pošleš exportem, projdi je člověk. Anthropic sám říká, že poslední slovo máš ty – ber to doslova.
- Zkontroluj konkrétně: ceny, termíny, názvy klienta, právní formulace, sliby o tom, co dodáš. Přesně tam AI nejčastěji doplní něco, co vypadá věrohodně, ale nemáš to podložené.
- Pokud ve firmě používáš [šablony nabídek nebo schvalovací proces](/clanky/chatgpt-ve-wordu-zdarma-checklist-osvc/), výstup z Claude do něj zapadá stejně jako výstup od juniora: musí projít kontrolou.

**3. Export není náhrada Workspace ani Office jako systému**

- To, že si stáhneš PowerPoint nebo PDF, ještě neznamená, že máš verzování, sdílená práva, historii změn a napojení na CRM nebo úložiště firmy.
- Kde bude „zdrojová pravda" dokumentu? V Claude, nebo v Google Workspace / Microsoft 365? Rozhodni to dřív, než vzniknou dvě rozjeté verze.
- Sdílitelný odkaz (zmiňuje TNW) je praktický, ale u nabídek s cenami si ověř, kdo přesně k odkazu má přístup a jak ho případně zneplatníš.
- Beta znamená beta. Pro klíčovou nabídku měj záložní cestu, jak ji dokončit klasicky.

**4. Co vůbec Claudovi posíláš**

- Nabídka pro klienta často obsahuje neveřejné informace: ceníky, interní marže, kontakty. Než je vložíš, zkontroluj, jaké máš nastavení soukromí a co dovoluje tvoje smlouva s klientem.
- Pokud jsi na Team nebo Enterprise, počkej na to, co ti povolí admin. Enterprise má mít podle Anthropic alespoň 30 dní předem upozornění, takže se dá nastavit interní pravidlo dřív, než funkce dorazí.

**5. Malý test před ostrým provozem**

- Vezmi jednu starou, už odeslanou nabídku a nech Claude udělat její verzi z tvých podkladů. Porovnej, kde ti pomohl a kde vymyslel něco navíc.
- Vyzkoušej si prezentování přímo z Claude i export do PowerPointu, ať víš, co se ztratí nebo rozhodí.
- Až pak to zkus na živém klientovi.

## Shrnutí

Sloučení Cowork do chatu je hlavně zjednodušení: méně přemýšlení, kam co zadat. Docs a Slides jsou zatím beta a mají potenciál ušetřit hodně času při první verzi nabídky nebo decku. Ale hranice, kterou si drž, je jasná: AI připravuje, člověk schvaluje a firma dál drží svoje dokumenty tam, kde je má pod kontrolou. Export je pohodlí, ne systém.

## Zdroje

- Anthropic, „Cowork is now Claude", 16. 9. 2026 – https://claude.com/blog/cowork-is-now-claude (primární zdroj: sloučení Cowork a chatu, Docs, Slides, Design v konverzaci, beta na placených plánech, chování při akcích, rollout Pro/Max → Team/Free, Enterprise ≥30 dní)
- The Next Web, „Anthropic merges Claude Cowork…", 17. 9. 2026 – https://thenextweb.com/news/anthropic-claude-cowork-merge-docs-slides (sekundární zdroj: Cowork od ledna, sdílitelný odkaz, export do Google formátů, Design od dubna na enginu Canva, Claude Code oddělený, sloučení paměti minulý měsíc)
