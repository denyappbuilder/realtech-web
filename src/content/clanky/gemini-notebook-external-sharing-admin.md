---
title: "Gemini Notebook: 4 nové úrovně sdílení ven. Checklist admina pro CZ Workspace"
description: "Od 10. 9. 2026 Admin console: Off / Trusted Domains / On / On s veřejným odkazem. Default Off. Doména, OU nebo skupina. Neplést s NotebookLM."
category: "AI Report"
date: "2026-09-15T23:06:00+02:00"
zprava: true
image: "/images/clanky/gemini-notebook-external-sharing-admin.jpg"
audio:
  url: "https://audio.realtech.cz/gemini-notebook-external-sharing-admin-nlm.mp3?v=6bc339e18708"
  duration: 991
---

Od 10. září 2026 můžeš v Admin konzoli Google Workspace nastavit **externí sdílení Gemini Notebook** po úrovních, ne jen vypnout celý produkt. Dřív byl jeden vypínač Notebook on/off pro celou organizaci. Teď jsou čtyři možnosti, default je Off, a nastavení jde na doménu, organizační jednotku (OU) nebo skupinu.

Tohle není NotebookLM (ten od Google pro podcasty a zdroje). Jde o **Gemini Notebook** ve Workspace — AI notes uvnitř Google stacku. Pro českou firmu nebo OSVČ s Workspace je praktická otázka: po rolloutu ověř, že jsi zůstal na Off, a teprve potom vědomě otevři Trusted Domains partnerům. Veřejný odkaz nech vypnutý, dokud nemáš důvod a proces.

## Co Google změnil (10. 9. 2026)

Podle [Workspace Updates](https://workspaceupdates.googleblog.com/2026/09/manage-external-sharing-for-gemini-notebook-in-the-Admin-console.html) administrátoři dostali granulární kontrolu externího sdílení. Čtyři úrovně:

1. **Off** — uživatelé nesdílí notebooky s nikým mimo doménu. **Tohle je default.**
2. **Trusted Domains** — externí sdílení jen na e-maily z allowlistu důvěryhodných domén.
3. **On** — sdílení na libovolný externí e-mail.
4. **On with public notebook sharing** — veřejné notebooky pro kohokoli s odkazem; jednotlivé e-maily jako sharee nejsou nutné.

Nastavení jde zapnout na úrovni **domény, OU nebo skupiny**. Koncový uživatel v Admin konzoli nic nepřepíná — end-user setting pro tuhle politiku Google neuvádí (zdroj: žádný end-user setting).

## Rollout a dostupnost

- **Rapid i Scheduled Release:** postupný rollout (až 15 dní viditelnosti) od **10. 9. 2026**.
- **Dostupné všem Google Workspace zákazníkům** (v oznámení bez omezení na Standard/Plus).

15. 9. jsi uprostřed 15denního okna. Když to admin kolega vidí a ty ne, nejdřív zkontroluj release track a OU — ne že „Google to zrušil“.

## Proč to oddělit od Drive sdílení

Drive má vlastní politiku sdílení ven. Gemini Notebook teď má **vlastní** čtyři úrovně. Když máš Drive otevřený partnerům a Notebook necháš Off, notebooky ven nepůjdou. Když omylem nastavíš „On with public notebook sharing“, dostaneš odkazovou veřejnost, která se chová jinak než klasický Drive share na e-mail.

Prakticky: jedna politika Drive ≠ politika Notebook. Po každém rolloutu AI funkce ověř obě.

## Checklist admina (CZ Workspace)

1. **Ověř default.** Po tom, co se nastavení objeví v konzoli, zkontroluj, že je **Off** (Google říká, že default Off je). Nespoléhej na „asi to nikdo nezapnul“.
2. **Mapuj OU/skupiny.** Obchod / partneři / interní tým — různé potřeby. Trusted Domains dej jen tam, kde je opravdu potřeba.
3. **Allowlist domén.** U Trusted Domains zapiš konkrétní partnerské domény, ne „všechno co zní jako klient“.
4. **Veřejný odkaz.** Úroveň 4 nech vypnutou, dokud nemáš schválený use-case (veřejný briefing, demo) a člověka, kdo to kontroluje.
5. **Neplést s NotebookLM.** Interní školení: „Gemini Notebook ≠ NotebookLM“. Jiný produkt, jiná rizika.
6. **Odděl od Drive.** Zkontroluj Drive sharing policy zvlášť; Notebook si nenastavíš omylem přes Drive UI.
7. **Dokumentuj rozhodnutí.** Jedna věta do provozního runbooku: která úroveň, která OU, kdo schválil, datum.
8. **Po 15 dnech od 10. 9.** Ověř znovu, že se nastavení objevilo u všech relevantních OU (gradual rollout).

## Co z toho neplyne

Google v tomhle postu **neuvádí**, že by se změnila cena, že by Notebook byl nově v konkrétní edici, ani čísla limitů generování. Ani neříká, že end user může obejít admin Off. A veřejný odkaz (úroveň 4) není totéž jako „sdílet s jedním externím mailem“ — je to širší.

## Shrnutí

Od 10. 9. 2026 máš u Gemini Notebook čtyři úrovně externího sdílení místo jednoho vypínače produktu. Default Off. Nastav doménu/OU/skupinu, partnery drž na Trusted Domains, veřejný odkaz nech vypnutý, dokud to vědomě nechceš. A odděl to od Drive i od NotebookLM.
