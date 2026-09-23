---
title: "Grok Bot + Astra: jak řídit tým agentů s vlastním počítačem"
description: "Grok Bot od xAI dává tým agentů s vlastním počítačem v cloudu. Role, určení, rutiny, schvalování, Astra a tři kroky, jak začít. Podle videa REALTECHCZ."
category: "AI Report"
date: "2026-09-23T10:47:26+02:00"
zprava: true
video: "https://www.youtube.com/watch?v=IODYMOl9r9Q"
image: "/images/clanky/grok-bot-astra-tym-agentu.jpg"
---

Grok Bot od xAI ti dává k dispozici tým agentů s vlastním počítačem v cloudu. Ty jim píšeš zadání a schvaluješ výsledky. REALTECHCZ k tomu vydal [video](https://www.youtube.com/watch?v=IODYMOl9r9Q), které projde sestavení týmu, brzdy, situace, kdy to nemá smysl, a způsob, jak s Astrou změnit práci agenta bez stavby celého týmu znovu. Níže je to samé v textu, plus co si nastavit ještě dnes.


## Grok vs. Grok Bot

Grok znáš jako chat. Napíšeš dotaz, dostaneš odpověď a s zavřením okna konverzace končí. Grok Bot podle videa funguje jinak: sestavíš tým agentů, každému dáš roli a určení a ten tým pracuje i ve chvíli, kdy u počítače nesedíš. Ráno pak najdeš návrhy e-mailů, přehled dne, rešerši nebo faktury připravené ke kontrole. Slovo „ke kontrole“ je důležité. Agent připraví, ty rozhodneš.

Pokud jsi četl náš [checklist ke Grok 4.7](https://realtech.cz/clanky/grok-4-7-checklist-cursor-api/), tam šlo o model. Tady jde o produkt, ve kterém model běží.

## Vlastní počítač v cloudu

Každý tým má podle videa svůj počítač v cloudu. Agenti tam ukládají soubory, otevírají prohlížeč a spouštějí nástroje, aniž by k tomu potřebovali tvůj notebook. Zavřeš víko, práce pokračuje.

Z toho plyne i druhá strana věci. Co agent na tom počítači udělá, neděje se před tvýma očima. Nevidíš každý krok, vidíš až výsledek, který ti přijde ke kontrole. Proto video věnuje tolik prostoru určení a schvalování. Kdo si zvykl každou odpověď AI číst hned po vygenerování, tady bude muset důvěru vyměnit za pravidla napsaná dopředu.

## Role, určení a specialisté

Tým se ve videu staví ze tří prvků. Role říká, co agent dělá: sleduje poštu, připravuje faktury, dělá rešerše. Určení říká, jak má vypadat výsledek a co agent nesmí udělat bez tvého souhlasu. Specialisté jsou agenti s úzkým zaměřením, kteří si mezi sebou předávají práci. Jeden posbírá podklady, druhý napíše návrh, třetí ho zkontroluje proti tvým pravidlům.

Nad týmem stojí koordinující agent, ve videu označovaný jako Chief of Staff. Jemu říkáš, co potřebuješ, on práci rozdělí mezi specialisty a vrátí ti hotový výstup. Kdo nechce řešit organizaci týmu, mluví jen s ním.

Dobré určení má podle videa tři části: co má agent udělat, jak vypadá hotový výsledek, co nesmí provést bez tvého souhlasu. Když některá chybí, agent si ji domyslí. Přesně tam vznikají průšvihy.

## Rutiny, propojení nástrojů a schvalování

Rutina je opakovaná práce s pevným časem. Každé ráno v sedm připrav přehled pošty. Každý pátek sepiš, co zůstalo rozpracované. Rutiny nespouštíš ty, a právě to odlišuje Grok Bot od chatu, kde každou odpověď musíš vyvolat sám.

Propojení nástrojů dává agentům přístup k tvým datům. Ve videu jde o e-mail, faktury a rešerše na webu. Platí jednoduché pravidlo: připoj jen to, co agent pro svou roli skutečně potřebuje. Agent na rešerše nepotřebuje tvou poštu.

Schvalování je brzda. Odeslání e-mailu, platba, cokoli nevratného jde nejdřív k tobě. Agent připraví, ty klikneš. Video to shrnuje slovy „poslední slovo máš ty“. Tohle nastavení řeš před první rutinou, ne po první chybě.

## Kdy Grok Bot nedává smysl

Video tomu dává krátkou kapitolu a je to poctivé. Pokud AI používáš na jednorázové dotazy, úpravu textu nebo občasný překlad, tým agentů ti nic nepřinese. Sestavení rolí a určení zabere čas a ten se vrátí jen u práce, která se opakuje. Podobně když nemáš žádná data ani nástroje, ke kterým bys agenty pustil, zůstane ti drahý chat s prodlevou. A pokud nejsi ochotný kontrolovat, co ti agenti připraví, raději do toho nechoď vůbec. Tým bez kontroly je jen rychlejší způsob, jak dělat chyby.

## Od promptování k delegování

Video pojmenovává změnu, kterou to po tobě chce. U chatu ladíš prompt, dokud odpověď nesedí. U týmu agentů píšeš zadání jako pro kolegu: cíl, formát výstupu, hranice. A pak kontroluješ výsledek, ne postup. Pro řadu lidí je to větší krok než samotná instalace.

## Astra a Grok Bot

Ve videu vystupuje Astra jako vrstva nad Grok Botem, která mění práci agentů bez toho, abys tým stavěl znovu. Napíšeš, co se má změnit („rešerše má být kratší a česky, e-maily jen připravuj, neposílej“), a Astra přepíše určení agenta nebo navrhne jinou skladbu týmu. Video to ukazuje v kapitole „Jak s Astrou změnit práci agenta“.

Pro běžné použití to znamená, že první verzi týmu nemusíš vymyslet dokonale. Začneš s jednou rolí a zadání upravuješ podle toho, co ti chodí ke kontrole. Když ranní přehled pošty chodí moc dlouhý, řekneš to Astře jednou větou místo přepisování určení ručně. Když se ukáže, že jeden agent dělá dvě věci najednou a plete se v nich, necháš si navrhnout rozdělení na dva specialisty.

## Tři kroky, jak začít

1. **Stáhni Grok Bot a přihlas se.** Založíš první tým a ten dostane vlastní počítač v cloudu.
2. **Promluv si s Chief of Staff.** Popiš mu jednu opakovanou práci (ranní přehled pošty je dobrý start) a řekni, co nesmí udělat bez tebe.
3. **Nech Astru navrhnout tým.** Dostaneš role a určení. Projdi je, uprav a spusť první rutinu. Po týdnu se vrať a podle výsledků zadání zpřesni.

## Co nastavit dnes

Vyber jednu věc, kterou děláš každý den a která má jasný výstup. Napiš pro ni určení ve třech částech. Zapni schvalování u všeho, co odchází ven z tvého počítače. Další agenty přidávej, až první rutina týden běží bez oprav. Zadáváš výsledek, tým pracuje, a poslední klik je tvůj.

Celé video: [Grok Bot + Astra: Postav si vlastní tým AI agentů](https://www.youtube.com/watch?v=IODYMOl9r9Q).
