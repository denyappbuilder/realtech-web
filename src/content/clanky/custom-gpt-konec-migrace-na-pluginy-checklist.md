---
title: "Vlastní GPT končí 11. prosince 2026. Co udělat teď, než se změní v plugin"
description: "OpenAI ukončí vlastní GPT k 11. prosinci 2026 a nahradí je pluginy. Co se přenese, co ne a co máš udělat ještě dnes. Praktický checklist pro běžné uživatele i malé týmy."
category: "AI Report"
date: "2026-09-20T10:04:00+02:00"
zprava: true
image: "/images/clanky/custom-gpt-konec-migrace-na-pluginy-checklist.jpg"
audio:
  url: "https://audio.realtech.cz/custom-gpt-konec-migrace-na-pluginy-checklist-nlm-b4c94e83b135.mp3"
  duration: 1489
---

OpenAI oznámila, že vlastní GPT (custom GPTs) v ChatGPT skončí. Plánované datum vypnutí je 11. prosince 2026 a týká se všech tarifů. Náhradou jsou pluginy – balíček opakovaně použitelných instrukcí, referenčních souborů a připojených aplikací. Migrace ale není bezeztrátová: nepřenesou se rozpracované úpravy, vlastní akce (custom actions), nastavení sdílení ani zvolený model. Tady máš přehled, co přesně se stane, a checklist, co si ohlídat ještě předtím, než na tlačítko „Migrate to plugin“ klikneš.

### Co se vlastně mění

Pokud sis v ChatGPT postavil vlastního asistenta – třeba GPT na překlady faktur, korektury textů nebo odpovědi zákazníkům – budeš ho muset převést na nový formát. OpenAI ve svém FAQ i v release notes ze 17. září 2026 uvádí, že plánuje custom GPT ukončit napříč všemi tarify ChatGPT a poskytnout cestu k migraci na **pluginy**.

Plugin podle OpenAI kombinuje tři věci: opakovaně použitelné instrukce, referenční soubory a připojené aplikace. Zhruba tedy to, co dnes dělá GPT, ale v jiné struktuře.

Důležité je časování. Plánované datum vypnutí je **11. prosince 2026**. Do té doby tvoje stávající GPT fungují dál. Dostupnost migrace a přístup k pluginům se ale může lišit podle účtu nebo pracovního prostoru – OpenAI opakovaně odkazuje na oznámení přímo v aplikaci. Řiď se tím, co ti ChatGPT ukáže, ne obecnými termíny z internetu.

### Jak bude migrace probíhat

Až bude migrace pro tvůj účet k dispozici, najdeš ji v sekci **My GPTs** pod volbou **Migrate to plugin**. Co se při tom stane:

- **Instrukce** tvého GPT se převedou na tzv. skill.
- **Připojené aplikace** se převedou na aplikace v pluginu.
- **Znalostní soubory** (knowledge files) se převedou na referenční soubory.

Migrace použije **poslední publikovanou verzi** GPT. Rozpracované koncepty a nepublikované úpravy se nepřenesou. Publikování přitom neznamená veřejné sdílení – GPT můžeš publikovat jen pro sebe, a i tak bude migrace fungovat.

Po migraci zůstane původní GPT použitelný až do data vypnutí, ale přepne se do režimu **pouze pro čtení**. Už ho neupravíš. A jako tvůrce ho po migraci ani nesmažeš. Veškerou další údržbu děláš už jen v pluginu.

### Co se nepřenese – a to je ta důležitá část

Tady se láme chleba. OpenAI výslovně uvádí, že tyhle věci při migraci **nepřejdou**:

1. **Zvolený model.** Pokud máš v GPT nastavený konkrétní model, plugin ho nezdědí.
2. **Existující konverzace.** Historie chatů s tvým GPT se do pluginu nepřesune.
3. **Vlastní akce (custom actions).** Pokud tvůj GPT volá externí API přes custom actions, tahle část se nepřenese vůbec. Budeš potřebovat buď dostupnou aplikaci, nebo vlastní MCP – a celé to znovu postavit a otestovat.
4. **Nastavení sdílení.** Plugin po migraci začíná jako **soukromý**. Nikomu se automaticky nenainstaluje a nikdo k němu nedostane přístup, dokud ho znovu nenasdílíš.

A ještě jedno varování přímo od OpenAI: migrovaný plugin může na stejné dotazy **odpovídat jinak** než původní GPT. Není to kopie 1:1.

### Co když GPT jen používáš, ale nevytvořil jsi ho

Pak ho migrovat nemůžeš. To umí jen tvůrce. Sleduj oznámení v aplikaci a případně se ozvi autorovi GPT, jestli migraci plánuje a jak ti dá přístup k novému pluginu. Pamatuj, že sdílení se nepřenáší – i když autor GPT převede, ty k pluginu automaticky přístup nedostaneš.

### Enterprise: plánované milníky

Pro firemní (Enterprise) prostředí OpenAI zveřejnila orientační harmonogram, který se může změnit:

- **11. 9. 2026** – oznámení administrátorům
- **22. 9. 2026** – cílový termín zpřístupnění migrace
- **26. 10. 2026** – konec možnosti vytvářet nové custom GPT
- **11. 12. 2026** – vypnutí custom GPT

Pokud jsi na jiném tarifu, ber tyhle termíny jako indikaci směru, ne jako závazné datum pro tvůj účet.

### Checklist: co udělat dnes

Tohle si projdi ještě předtím, než migrace pro tvůj účet dorazí. Většina bodů ti zabere pár minut a ušetří ti prosincový stres.

**Než klikneš na migraci**

- [ ] **Sepiš si, na kterých GPT závisíš.** Jak vlastních, tak cizích. OpenAI to doporučuje jako první krok.
- [ ] **Ke každému cizímu GPT si poznamenej tvůrce.** Jen on může migrovat. Zjisti, jestli to plánuje.
- [ ] **Zapiš si, kdo všechno tvoje GPT používá.** Po migraci jim budeš muset plugin znovu nasdílet – sdílení se nepřenese.
- [ ] **Dokonči všechny rozpracované úpravy a publikuj je.** Migrace bere poslední publikovanou verzi, koncepty propadnou. Publikovat můžeš i jen pro sebe.
- [ ] **Zkontroluj, jestli tvůj GPT používá custom actions.** Pokud ano, počítej s tím, že je budeš stavět znovu – přes aplikaci nebo vlastní MCP.
- [ ] **Poznamenej si zvolený model.** Do pluginu se nepřenese, budeš ho muset nastavit ručně (pokud to plugin umožní).
- [ ] **Zálohuj si důležité konverzace.** Do pluginu se nepřesunou. Co potřebuješ, si zkopíruj ven.

**Po migraci**

- [ ] **Otestuj plugin na svých obvyklých promptech.** OpenAI přímo říká, že může odpovídat jinak. Porovnej výstupy s původním GPT, dokud je ještě dostupný.
- [ ] **Znovu nastav sdílení.** Plugin začíná jako soukromý.
- [ ] **Znovu postav a otestuj custom actions**, pokud jsi je měl.
- [ ] **Počítej s tím, že původní GPT už neupravíš ani nesmažeš.** Je pouze pro čtení až do 11. 12. 2026.
- [ ] **Sleduj oznámení v aplikaci.** Termíny a dostupnost se liší podle tarifu a pracovního prostoru.

### Shrnutí

Custom GPT nezmizí ze dne na den – do 11. prosince 2026 fungují dál. Ale migrace na pluginy má ostré hrany: nepublikované úpravy, custom actions, sdílení, model i historie chatů se nepřenášejí. Nejdražší chyba je kliknout na „Migrate to plugin“ s rozpracovaným GPT a zjistit, že se původní verze zamkla a koncept je pryč. Projdi si checklist, dokonči úpravy, publikuj – a teprve pak migruj.

## Zdroje
- OpenAI Help Center – Custom GPT retirement and migration FAQ: https://help.openai.com/en/articles/20001519 (accessed 2026-09-20)
- OpenAI Help Center – ChatGPT Release Notes, sekce 17. 9. 2026: https://help.openai.com/en/articles/6825453-chatgpt-release-notes (accessed 2026-09-20)
