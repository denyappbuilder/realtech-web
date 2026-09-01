---
title: "Apple k soudu: ex-inženýr v OpenAI prý tahal schéma obvodu a učil na něm agenta"
description: "Doplňující briefing z 31. srpna: forenzní MacBook podle Apple ukazuje, že Chang Liu po odchodu stáhl schéma napájecího obvodu, simuloval ho v LTspice a psal, že agent se naučil spouštět výpočty. OpenAI žalobu označilo za bezpředmětnou. Soud zatím nic nerozhodl."
category: "AI Report"
date: "2026-09-01T08:45:00+02:00"
zprava: true
image: "/images/clanky/apple-openai-schema-agent.jpg"
---

Pondělí 31. srpna Apple podal u federálního soudu v San Jose doplňující briefing. Není to nová žaloba. Je to dodatek k návrhu na zrychlené dokazování. Ve spisu *Apple Inc. v. Chang Liu et al.*, 5:26-cv-07078-EJD, ho vede jako Dkt. 94-1. Soudce je Edward J. Davila.

Apple píše, že forenzní prohlídka MacBooku, který si Chang Liu nechal po odchodu, ukazuje víc než stažení souboru. Podle Applu Liu v OpenAI použil schéma napájecího obvodu, pustil ho v LTspice a psal, že agent se naučil simulace spouštět a ladit. OpenAI žalobu označilo za bezpředmětnou. Soud zatím nic nerozhodl.

Tohle jsou tvrzení Apple v podání. Ne rozsudek. Ne přiznání OpenAI. Recapy z MacRumors a 9to5Mac z briefu citují. Kde jsme otevřeli PDF 94-1, bereme věty odtamtud.

## Co Apple do spisu napsal

Žaloba padla 10. července 2026. Žalovaní: Chang Liu, Tang Yew Tan, OpenAI Foundation (dříve OpenAI, Inc.), OpenAI Group PBC a io Products, LLC (dříve io Products, Inc.). Nárok: federální Defend Trade Secrets Act a porušení smlouvy. Apple žádá porotu.

Liu byl podle žaloby osm let senior system electrical engineer. Z Applu odešel 22. ledna 2026 k OpenAI. Firemní MacBook si nechal. Po podání žaloby ho vrátil. Tan v žalobě je — Apple mu připisuje 24 let ve firmě. Pondělní 94-1 ale točí kolem Liua a jednoho notebooku. Tana sem nestrkáme.

Úvod briefu má čtyři body. MacRumors a 9to5Mac je citují skoro doslova. PDF 94-1 je má taky. Apple tvrdí, ne soud:

1. Liu stáhl důvěrné schéma obvodu a použil ho v práci v OpenAI.
2. On i další v OpenAI věděli o přístupu do Applova third-party cloudu.
3. Po interním vyšetřování Apple poslal pokyny ke zničení důkazů kolegyni v OpenAI, která prý souhlasila.
4. V OpenAI používal nástroj stejného jména jako interní Apple engineering app.

Konkrétněji: podle 94-1 jde o schéma *power-converter circuit* a o simulační vstupy. Jméno souboru je v PDF začerněné. Apple píše, že obvod je v produktech nebo se do nich zvažuje. To je věta Apple.

Stažení Apple datuje na 7. března 2026. Prý desítky důvěrných souborů z third-party cloudu. Simulaci v LTspice dává na 18. března, na Mac mini, pod profilem `changliu`. To jsou data z rasteru 94-1, strany 3–6. Ne verdikt.

Zprávy, které MacRumors cituje z filings, necháváme v originále. Liu prý psal, že je „Feeling AI all day long“. Že „in the past hour“ jeho AI „agent learned how to run LTspice, look at result, tune compensation parameter“. A dál: „I try to make a behavior buck. With voltage outer and current inner. Everything ideal. It still took me a day.. now it's two hour. Including learning fresh.“ Odpověď v recapu: „Oh man! Why do they even need you then?“

*Behavior buck* v recapu je tak. Může to být broken English pro buck converter. Jistotu z toho neděláme.

Po červnovém interním vyšetřování Apple podle 94-1 Liu a kolegyně v OpenAI Yu-Ting Peng (v briefu i jako Alyssa) řešili, že zařízení od Apple mají „restore“ a pak „start using“. Apple to čte jako anti-forensic krok. Zase tvrzení Apple. Ne zjištění soudu.

## MacBook, Mac mini, iCloud

Právníci Liua předali MacBook forenznímu znalci Applu Danielu Roffmanovi v pátek 21. srpna. Předběžné nálezy začal hlásit 26. srpna. To Apple píše v Dkt. 94 i v 94-1.

Proč Apple o simulaci na mini ví: 11. dubna se podle 94-1 soubor a výstupy synchronizovaly přes iCloud na MacBook, který si Liu nechal. Mini žalovaní podle Apple nepředali. Apple ho chce. Simulace podle briefu vyrobila soubory `.log`, `.net` a `.raw`.

To není report o hromadném nákupu Maců. Jde o jeden mini a jeden MacBook v jednom sporu.

## Co z toho Apple vyvozuje pro agenty

Apple v 94-1 píše, že použití trade secret schématu v OpenAI a učení agenta spouštět simulace jde za běžnou krádež dokumentu. Věta z briefu: když se obchodní tajemství nakrmí do AI agenta nebo modelu, který se z něj „learn[s]“, takové učení „may create irreversible and continually propagating uses of the trade secret“. Odkaz v PDF: Roffman Decl. ¶ 31 a Fayed Decl. ¶ 26.

To je právní argument Apple a dvou znalců. Není to vědecký závěr. Soud ho nepotvrdil.

## Co na to OpenAI

OpenAI podalo návrh na zamítnutí žaloby. Obvinění označilo za *meritless*. Začátkem srpna, v textu *Apple is getting this wrong*, napsalo, že žaloba je „careless, aggressive and oddly personal“. A že „We do not have, nor want, any of their trade secrets.“ V tom blogu jmenuje generálního právního Che Changa.

K pondělnímu 94-1 OpenAI okamžitě nereagovalo. To píše Bloomberg, jak ho převzaly The Straits Times 1. září. Reuters k tomuhle briefu text nemá. Reuters má článek k žalobě z 10. července.

## Co soud zatím neudělal

Davila zatím nerozhodl. Slyšení je 1. října 2026 v 9:00. Na stole je zrychlené dokazování. Vedle něj dřívější návrh na předběžné opatření. Obojí jsou návrhy. Ne příkazy.

Strany se podle Dkt. 94 dohodly, že žalovaní smí k 94-1 podat pětistránkovou odpověď v pátek 4. září. To je lhůta ze stipulace. Ne výsledek.

Dokud soudce něco nepodepíše, zůstává pondělní briefing tím, čím je. Tvrzení Apple o schématu, o LTspice a o agentovi. OpenAI to popírá. My to nepřebíráme jako fakt.

## Zdroje

- [Apple Says Former Engineer Used Stolen Trade Secrets at OpenAI, Taught AI Agent to Run Them. MacRumors, Juli Clover, 31. 8. 2026 13:22 PDT](https://www.macrumors.com/2026/08/31/apple-openai-lawsuit-trade-secret-theft-evidence/)
- [Apple reveals 'shocking evidence' from ex-employee's MacBook in OpenAI suit. 9to5Mac, 31. 8. 2026](https://9to5mac.com/2026/08/31/apple-openai-forensic-macbook-evidence/)
- [Plaintiff Apple Inc.'s Supplemental Brief in Support of Its Motion for Expedited Discovery, Dkt. 94-1, filed 31. 8. 2026. Apple Inc. v. Chang Liu et al., 5:26-cv-07078-EJD](https://9to5mac.com/wp-content/uploads/sites/6/2026/08/Apple_Inc_v_Liu_et_al__candce-26-07078__0094.1.pdf)
- [Apple is getting this wrong. OpenAI](https://openai.com/index/apple-is-getting-this-wrong/)
- [Apple sues OpenAI, two former employees for trade secrets theft. Reuters, 10. 7. 2026](https://www.reuters.com/legal/litigation/apple-sues-openai-alleging-misappropriation-trade-secrets-court-records-show-2026-07-10/)
- [Apple says OpenAI is destroying evidence in trade secrets case. The Straits Times / Bloomberg, 1. 9. 2026](https://www.straitstimes.com/world/united-states/apple-says-openai-is-destroying-evidence-in-trade-secrets-case)
