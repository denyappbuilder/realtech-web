---
title: "Gemini 3.8 Flash má pracovat víc. Cyber zůstává jen pro důvěryhodné obránce"
description: "Google vypustil Gemini 3.8 Flash a specializovanou variantu Cyber. Flash má podle Googlu dohnat dražší frontier modely za intro cenu 3.7, Cyber zůstává jen pro důvěryhodné obránce v programu Fairwind."
category: "AI Report"
date: "2026-09-02T18:15:00+02:00"
zprava: true
image: "/images/clanky/gemini-38-flash.jpg"
xPosts:
  - "https://x.com/GoogleDeepMind/status/2095175498967949359"
---

Google 2. září vypustil další Flash — a je to třetí za zhruba šest týdnů. Gemini 3.8 Flash má být nový tahoun pro kódování, agenty a vícestupňové uvažování. Vedle něj jde ven i Gemini 3.8 Flash Cyber, jenže ten už není pro každého: Google ho drží za programem Fairwind pro důvěryhodné obránce. Oznámení podepsali Tulsee Doshi a Raluca Ada Popa.

Navazuje to na [3.7 Flash zhruba tři týdny zpátky](/clanky/gemini-agentic-video-understanding/) a na dřívější vlnu [3.6 Flash a 3.5 Flash Cyber](/clanky/gemini-36-flash-gemini-4/). Tempo je rychlé. Otázka je, jestli se za ním schovává reálný posun, nebo jen další číslo v názvu.

## Stejná intro cena jako u 3.7

Google uvádí, že 3.8 Flash startuje za stejnou úvodní cenu jako 3.7 Flash: **0,75 dolaru za milion vstupních tokenů a 3,75 dolaru za milion výstupních**. Intro má vypršet 31. prosince 2026. Od 1. ledna 2027 má platit 1,50 / 7,50 dolaru za milion tokenů.

To je důležité číst jako firemní ceník, ne jako slib, že model bude navždy levný. Do konce roku Google drží 3.8 na úrovni 3.7. Pak se cena zdvojnásobí. Kdo staví agenty přes API, má čtyři měsíce na to, aby si spočítal, jestli mu ten posun stojí za pozdější zdražení.

## Flash jako tahoun, ne jako sprinter

Google 3.8 Flash popisuje jako workhorse: kódování, agentní úlohy a vícestupňové uvažování ve specializovaných oborech. Tvrdí **substantial gains** oproti 3.7 Flash a že se model často blíží výkonem dražším frontier modelům — jen za Flash cenu.

Čísla, která Google v blogu cituje, bereme jako jejich claim, ne jako naše měření.

Na **DeepSWE v1.1** (long-horizon software engineering) má 3.8 Flash podle Googlu autonomně dořešit složité inženýrské problémy od začátku do konce a přitom překonat většinu větších frontier modelů — za zlomek ceny. V kvantitativních a profesních úlohách Google jmenuje **Vals Finance Agent V2** a **Harvey Legal Agent**: 3.8 Flash tam prý předčí 3.7 Flash i jiné frontier modely. Na **HLE-Verified** Google uvádí **54,9 %** — vícestupňové uvažování napříč STEM, humanitními a profesními obory.

To jsou jejich benchy a jejich slova. Jestli to drží na vašem kódu, uvidíte až na vlastních datech.

## „Works harder“ — a proto i žere víc

Google ten posun vysvětluje jednou větou: **3.8 Flash works harder**. U složitých úloh má dělat víc reasoning kroků a volat nástroje opakovaně. Občas prý spotřebuje víc tokenů, hlavně při vyšším úsilí, aby vytáhl výkon.

To je poctivé přiznání, i když je schované v marketingovém blogu. Levnější model, který „pracuje víc“, může ve výsledku stát stejně nebo víc než ten, který se méně motá. Google proto říká rovnou: když je hlavní omezení výpočet, sáhněte po **nižším effort** nebo zůstaňte u **3.7 Flash**, který prý dál zůstává plně podporovaný pro úlohy, kde jde hlavně o efektivitu.

V [Google Antigravity](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/) a AI Studiu Google ukazuje dema — 3D hru, DOS verzi Map i interaktivní rozklad hardwaru. Jsou to ukázky z launch blogu, ne katalog toho, co model umí u vás.

## Cyber: frontier claim, ale jen pro Fairwind

Gemini 3.8 Flash Cyber je podle Googlu jejich zatím nejschopnější kybernetický model. Má jet Flash rychlostí a cenou, aby se dalo rychle iterovat. Dostupný je ale jen **důvěryhodným obráncům** přes nový **Fairwind Program** — vlády, provozovatelé kritické infrastruktury a správci softwaru. Žádost jde přes apply formulář Googlu.

Obě varianty mají podle Googlu stejný základ. Část zisků v kódování a uvažování prý přišla právě z tvrdého tréninku v kybernetice. Cyber je ta ostřejší větev: víc schopností na hledání děr a záplatování, míň zábran, proto i přísnější brána.

### Hledání děr

Na **CyberGym**, standardním průmyslovém benchi na hledání zranitelností, má 3.8 Flash Cyber podle Googlu **frontier-level** výkon v autonomním discovery. Má překonat [3.5 Flash Cyber](/clanky/gemini-36-flash-gemini-4/) i výrazně větší frontier modely.

CyberGym je ale hlavně C/C++. Google proto zmiňuje i **interní bench napříč 20 jazyky**, kde má model hledat široké spektrum děr ve složitých codebases. Tam Google uvádí **success rate přes 70 %**. Interní bench, jejich číslo.

### Záplatování

U patchování Google říká, že od začátku investoval do oprav, ne do exploitu. Na **CWE-Bench** (Collinear) má 3.8 Flash Cyber podle Googlu **pass@1 47,2 %** proti **47,8 %** u leading frontier modelu — skoro stejné číslo, prý za výrazně nižší cenu. Google to popisuje jako Pareto frontier.

### Co s tím prý Google už dělá

Tady Google přikládá tři příklady z praxe. Zase jejich claimy.

Tým **Chrome Security** prý s 3.8 Flash Cyber vyrobil **2,6× víc správných záplat** proti nejlepším komerčním větším modelům. **Wiz** v blogu Googlu uvádí **o 7,5–9,7 % vyšší recall** na interním pentest benchi při **2,3–5,2× nižší ceně** než u jiných leading frontier modelů. A Cloud Vulnerability Research tým Googlu prý s modelem našel **kritickou foundational zranitelnost za méně než dvě hodiny** — u věci, jejíž výzkum a discovery prý obvykle trvá měsíce.

To zní silně. Je to ale firemní blog s firemními čísly a jedním partnerským claimem (Wiz), ne nezávislý audit.

## Safety: Flash brzdí, Cyber pouští dál

Google říká, že 3.8 Flash jde ven se **safeguards proti zneužití v CBRN a kybernetickém útoku**, podle Frontier Safety Framework. Cyber má **permissive mitigations** — proto jen Fairwind, ne veřejné API.

U prompt injection Google tvrdí **significant leap** v robustnosti podle **Gray Swan**. Zase jejich měření, jejich slova.

Přeloženo: běžný Flash má zůstat univerzální tahoun s brzdou. Cyber má mít víc zubů, proto ho Google nepustí ven bez žádosti a bez důvěryhodného profilu.

## Kde to dnes zapnete

**Vývojáři** mají 3.8 Flash v Antigravity, Gemini API / AI Studiu, Android Studiu, Stitchi a Gemini Enterprise. **Spotřebitelé** s Pro nebo Ultra předplatným ho potkají v aplikaci Gemini, v AI Mode ve Vyhledávání a v Gemini v Google Sheets. **Cyber** jen přes Fairwind apply.

To je dnešní mapa z blogu, ne slib, že model už teď sedí v každé Gemini záložce. Kdo nemá Pro/Ultra a nestaví přes API, tenhle launch zatím potká jen jako zprávu.

## Co si z toho odnést

Google znovu zrychlil tempo Flash řady. 3.8 má být chytřejší tahoun za intro cenu 3.7, který podle Googlu často sahá po výkonu dražších modelů — za cenu toho, že „pracuje víc“ a občas spálí víc tokenů. Cyber má být ostřejší nástroj na díry a záplaty, ale zůstává za branou Fairwind.

Háček je stejný jako u každého takového launchi: DeepSWE, HLE-Verified 54,9 %, CWE-Bench 47,2 %, CyberGym, 2,6× v Chromu i Wiz recall bereme z [blogu Googlu](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/). Nezměřili jsme to. Intro cena drží do konce roku, od ledna 2027 se má zdvojnásobit. A Cyber není veřejný model, který si večer zapnete v telefonu.

Zatím máme blog Tulsee Doshi a Ralucy Ady Popy a jeden tweet DeepMindu. A mapu, kde to Google dnes pouští.

## Zdroj

- [Introducing Gemini 3.8 Flash and 3.8 Flash Cyber — Google Blog, 2. 9. 2026](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/)
- [Google DeepMind na X, 2. 9. 2026](https://x.com/GoogleDeepMind/status/2095175498967949359)
