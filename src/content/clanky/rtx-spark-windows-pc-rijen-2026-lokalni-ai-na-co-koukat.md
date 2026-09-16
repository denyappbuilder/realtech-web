---
title: "RTX Spark PC s Windows v říjnu: na co koukat před koupí lokálního AI PC"
description: "NVIDIA na IFA 2026 potvrdila RTX Spark PC s Windows na říjen (Lenovo Yoga Pro 9n, Yoga 9n, Acer). Sjednocená paměť vs. VRAM, agenti, hry a kontrolní seznam před koupí."
category: "AI Report"
date: "2026-09-17T08:15:00+02:00"
zprava: true
image: "/images/clanky/rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat.jpg"
audio:
  url: "https://audio.realtech.cz/rtx-spark-windows-pc-rijen-2026-lokalni-ai-na-co-koukat-nlm.mp3?v=34d091bd3777"
  duration: 840
---


Na veletrhu IFA v Berlíně NVIDIA [3. září 2026 potvrdila](https://blogs.nvidia.com/blog/local-ai-ifa-next-gen-agents-nv-pair-rtx-spark/), že počítače s Windows postavené na platformě RTX Spark se začnou prodávat v říjnu. Lenovo k tomu ohlásilo notebooky Yoga Pro 9n a Yoga 9n, Acer ukázal kompaktní stolní koncept. Pokud doma pouštíš lokální modely, ladíš vlastní agenty nebo tvoříš s AI, tady máš přehled toho, co je oficiálně potvrzené, co je zatím jen marketing a podle čeho se rozhodnout mezi RTX Spark a klasickou herní grafikou s velkou pamětí.

## Co NVIDIA na IFA skutečně oznámila

První: RTX Spark PC s Windows přicházejí v říjnu 2026. Druhá: k šesti výrobcům, kteří už mají říjnové stroje připravené, se přidávají nové modely. Lenovo ohlásilo Yoga Pro 9n a konvertibilní Yoga 9n (2 v 1), Acer předvedl kompaktní stolní počítač, zatím ale jako koncept. Třetí: NVIDIA zveřejnila rámcové parametry platformy.

Podle NVIDIA nabízí RTX Spark grafiku Blackwell s výkonem 1 petaflop, dvacetijádrový procesor Grace a až 128 GB sjednocené paměti. Notebooky mají být tenké s výdrží „na celý den“, stolní krabičky mají sloužit agentům, kteří běží nepřetržitě. Součástí je Windows Agent framework, který má agenty pouštět bezpečně na pozadí pod dohledem operačního systému.

Víc konkrétních čísel NVIDIA nedala: žádnou propustnost paměti, hodiny výdrže ani ceny.

## Sjednocená paměť versus klasická VRAM

Klasický stolní počítač s RTX grafikou má paměť rozdělenou: procesor pracuje s operační pamětí, grafika se svojí vlastní VRAM. Lokální model se musí vejít do VRAM grafiky. Když se nevejde, část se přesune do systémové RAM a rychlost odpovědí padá o řád. Proto se dnes u lokálních agentů mluví o hranici 24 GB VRAM a víc.

RTX Spark postupuje jinak. Procesor Grace a grafika Blackwell sdílejí jeden paměťový prostor, v maximální konfiguraci 128 GB. Velký model tak nemusíš ořezávat, aby se vešel do grafiky. Pro velké jazykové modely nebo více modelů spuštěných najednou je to velká výhoda.

Dvě věci si ale hlídej. „Až 128 GB“ znamená, že nižší konfigurace budou mít méně, a NVIDIA ani Lenovo zatím nezveřejnily, kolik paměti dostane která Yoga. Sjednocenou paměť také nelze přepočítávat na VRAM samostatné grafiky. O tom, jak rychle se z ní data čtou, NVIDIA neřekla nic, a bez měření se to poznat nedá.

## Notebook na cesty nebo krabička, která běží pořád

Notebook (Lenovo Yoga Pro 9n, Yoga 9n) dává smysl, když chceš mít model u sebe: psaní, úpravy fotek, přepis nahrávek nebo asistenta, který nesmí posílat data do cloudu. Výdrž „na celý den“ ber jako marketingovou formulaci, dokud ji někdo nezměří.

Kompaktní stolní počítač (koncept Acer) je stavěný pro agenty, kteří mají běžet nonstop: hlídat poštu, zpracovávat soubory, čekat na úkoly z telefonu. Promysli i hluk a spotřebu, o kterých NVIDIA zatím nic neřekla.

## Hry: podpora roste, ale ptej se na konkrétní tituly

U her záleží na tom, jestli je vydavatel hry na platformu RTX Spark skutečně přenese (Grace CPU; přesnou architekturu ověř u produktové stránky NVIDIA — IFA blog ji neuvádí). NVIDIA proto průběžně ohlašuje vydavatele, kteří své tituly na RTX Spark PC s Windows přinášejí: na Gamescomu se přidaly Electronic Arts, Embark a Ubisoft, po květnovém COMPUTEXu už na seznamu byly KRAFTON, NetEase, Riot Games a Xbox.

Seznam vydavatelů ti ale neřekne, které konkrétní hry poběží. Pokud kupuješ počítač i na hraní, ověř si před koupí konkrétní tituly, které hraješ.

## Kdy dává větší smysl klasické RTX s 24 GB a více

Podívej se, na co je dnes naladěný ekosystém lokálních agentů. Perplexity Portable Computer běží lokálně na Linuxu, na systémech jako DGX Spark nebo na RTX grafikách s alespoň 24 GB VRAM; od [14. 9. 2026 je podle NVIDIA dostupný i na Windows](https://blogs.nvidia.com/blog/local-ai-perplexity-windows-pcs) (GeForce RTX / RTX PRO ≥24 GB VRAM). Workflow pouští bez kreditů a do cloudu eskaluje jen s tvým svolením. OpenClaw Windows App nastaví lokální model optimalizovaný pro RTX s alespoň 24 GB VRAM. Hermes Agent umí jedním klikem nastavit lokální model na Windows pro RTX a DGX už teď.

K tomu NVIDIA hlásí zrychlení llama.cpp až 1,9násobné (uvádí RTX 5090), které se dostane do LM Studio a Ollamy, a zisky i pro vLLM.

Pokud už máš stolní PC s RTX a 24 GB VRAM a víc, dnes na něm rozjedeš většinu toho, o čem se v oznámení píše, a nemusíš čekat na říjen. RTX Spark je nová platforma a nástroje se na ni budou dotahovat postupně. Jeho hlavní argument je velikost sdílené paměti.

Ještě jedna věc do úvahy: NVIDIA PAIR (Personal AI Router) je bezplatný otevřený nástroj, který směruje AI požadavky přes lokální síť mezi tvými zařízeními na Windows, macOS i Linuxu. Podporuje GeForce RTX od řady 20, RTX PRO od generace Turing, DGX Spark i Apple M4 a novější. Znamená to, že jeden výkonný stroj doma může obsluhovat notebook, na kterém zrovna pracuješ.

## Praktický kontrolní seznam před koupí

1. **Kolik paměti reálně potřebuješ.** Sepiš si modely, které chceš pouštět, a jejich velikost ve zvolené kvantizaci. Pokud se vejdou do 24 až 32 GB, klasické RTX zvládne práci dnes. Pokud potřebuješ víc, čekej na přesné konfigurace RTX Spark.
2. **Cestování nebo nonstop provoz.** Notebook Yoga pro práci u sebe, kompaktní stolní stroj pro agenty na pozadí. Kombinace přes PAIR může vyjít výhodněji než jeden drahý stroj.
3. **Konkrétní konfigurace, ne maximum.** „Až 128 GB“ platí pro nejvyšší variantu. Ptej se prodejce na přesné číslo u modelu, který kupuješ.
4. **Nástroje, které používáš.** Ověř, že tvůj oblíbený software (agenti, editory, LM Studio, Ollama) má pro RTX Spark s Windows oficiální podporu, nebo počítej s čekáním.
5. **Hry podle titulů.** Seznam vydavatelů nestačí, hledej konkrétní hry.
6. **Výdrž, hluk, spotřeba.** Nic z toho zatím oficiálně změřené není. Počkej na první nezávislé testy.
7. **Servis a záruka v Česku.** Jde o novou platformu, zjisti, kdo ji u nás bude servisovat.

## Cena a dostupnost v Česku: zatím jen dohady

NVIDIA ani Lenovo v souvislosti s IFA neuvedly ceny ani termíny pro Českou republiku. Říjen platí globálně pro první stroje, což pro český trh může znamenat říjen, ale stejně dobře i pozdější měsíce. Jakoukoli korunovou cenu, na kterou narazíš, ber jako spekulaci, dokud ji nepotvrdí český distributor nebo obchod. Stejně tak zatím nevíme, zda k nám dorazí obě Yogy a v jakých konfiguracích, a jestli Acer svůj koncept vůbec dotáhne do prodeje.

## Shrnutí

RTX Spark PC s Windows jsou v říjnu na cestě a Lenovo Yoga Pro 9n, Yoga 9n a kompaktní koncept Acer ukazují, kam platforma míří: hodně sjednocené paměti pro velké modely, agenti běžící pod kontrolou Windows a rostoucí, ale stále neúplná herní podpora. Pokud dnes pracuješ s modely do zhruba 24 až 32 GB, klasický RTX desktop ti poslouží hned. Pokud potřebuješ víc paměti nebo stroj, který poběží pořád, dává smysl počkat na říjen, konkrétní konfigurace a první nezávislá měření. Ceny v korunách zatím nikdo neřekl.
