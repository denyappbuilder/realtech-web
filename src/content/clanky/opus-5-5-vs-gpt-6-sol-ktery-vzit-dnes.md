---
title: "Opus 5.5 vs GPT-6 Sol: který vzít dnes (cena, Cursor, API)"
description: "Claude Opus 5.5 a GPT-6 Sol vyšly 22. 9. 2026. Checklist: cena, Cursor/Claude Code vs Work/Codex/API, kdy který model."
category: "AI Report"
date: "2026-09-22T23:07:47+02:00"
zprava: true
image: "/images/clanky/opus-5-5-vs-gpt-6-sol-ktery-vzit-dnes.jpg"
audio:
  url: "https://audio.realtech.cz/opus-5-5-vs-gpt-6-sol-ktery-vzit-dnes-nlm-780582b9ac0d.mp3"
  duration: 1441
---

Anthropic a OpenAI vypustily své nové vlajkové modely ve stejný den. Claude Opus 5.5 (`claude-opus-5-5`) a GPT-6 Sol (`gpt-6-sol`) jsou od 22. září 2026 dostupné v API a postupně i v aplikacích. Když s AI pracuješ denně - v ChatGPT, Claude, Cursoru nebo přes API - tady je stručný návod, kdy se hodí který, kde ho zapneš a na co si dát pozor v ceně.

## Co se dnes stalo

Anthropic uvedl Claude Opus 5.5 s ceníkem 4 $ za milion vstupních a 20 $ za milion výstupních tokenů. Podle Anthropicu vychází na typických úlohách asi o 40 % levněji než Opus 5. Menší Sonnet 5.5 a Haiku 5.5 mají dorazit v následujících týdnech.

OpenAI ve stejný den spustilo GPT-6 Sol (a vedle něj GPT-6 Luna). Podle TechCrunch jsou oba modely už teď v ChatGPT Work a Codexu pro většinu platících uživatelů, v API jsou dostupné hned a do běžného spotřebitelského ChatGPT přicházejí postupně. OpenAI tvrdí, že Sol vyjde přibližně na polovinu ceny předchozí řady GPT-5.6 Sol/Luna z léta 2026, která byla v ceníku výrazně dražší.

Jedna věc hned na začátek: benchmarková čísla, která oba výrobci publikovali, jsou zatím jen jejich vlastní. Nezávislé srovnání neexistuje, takže výběr dnes stojí hlavně na ceně, dostupnosti a tom, co skutečně děláš.

## Ceny vedle sebe

| | Claude Opus 5.5 | GPT-6 Sol |
|---|---|---|
| Model ID | `claude-opus-5-5` | `gpt-6-sol` |
| Vstup / 1M tokenů | 4 $ | 2 $ |
| Výstup / 1M tokenů | 20 $ | 10 $ |
| Čtení z cache | 0,20 $ | 0,20 $ |
| Zápis do cache | 5 $ | 2,50 $ |
| Fast mode | 8 $ / 40 $ (~2,5× rychlost) | 2× základní sazby |
| Kontext | 1 000 000 tokenů | 1 050 000 tokenů |
| Max. výstup | 128k tokenů | 128k tokenů |
| Knowledge cutoff | červen 2026 | 20. dubna 2026 |

Na papíře je GPT-6 Sol přesně poloviční proti Opusu 5.5 - na vstupu i na výstupu. Cache čtení mají stejné (0,20 $). Zápis do cache je u Opusu 5 $ a u Solu 2,50 $ - Sol je tu levnější. To je zásadní pro každého, kdo posílá dokola stejný dlouhý systémový prompt nebo velký repozitář.

### Pozor na Fast a dlouhý kontext

Ceník má u obou modelů háček, který na první pohled nevidíš.

**Fast mode** u Opusu 5.5 zdvojnásobuje cenu (8 $ / 40 $) za zhruba 2,5násobnou rychlost v Claude Code a na Claude Platform. GPT-6 Sol má Fast mode za dvojnásobek základních sazeb. Pokud Fast režim nevypneš, může ti účet za měsíc vyrůst na dvojnásobek jen kvůli tomu, že odpovědi chodí rychleji.

**Dlouhý kontext** u GPT-6 Sol: milionové okno zní skvěle, ale jakmile vstup přesáhne 272 000 tokenů, OpenAI účtuje celý požadavek dvojnásobkem sazby za vstup a cache a 1,5násobkem za výstup. Ne jen přebytek - celý request. Když do modelu hodíš celý monorepo, klidně skončíš na 4 $ za vstup a 15 $ za výstup, tedy nad cenou Opusu.

## Kde to zapneš

### ChatGPT a Codex
Pokud platíš za ChatGPT Work nebo používáš Codex, GPT-6 Sol už máš pravděpodobně v přepínači modelů. Běžné placené účty ChatGPT ho dostávají postupně, takže když ho dnes nevidíš, není to chyba na tvé straně.

### Claude a Claude Code
Opus 5.5 se u Anthropicu volí stejně jako předchozí verze - v aplikaci Claude v přepínači modelu, v Claude Code přes nastavení modelu. Fast mode je zvlášť, hlídej si ho.

### Cursor
V Cursoru vybíráš model v model pickeru. Nový Opus 5.5 by tam měl být volitelný v různých úrovních přemýšlení (low/medium/high/max). U `gpt-6-sol` si ověř, že už v seznamu skutečně je - dostupnost v editorech třetích stran první den bývá opožděná. Pokud tam vidíš jen GPT-5.6 Sol, je to starší tier, ne dnešní model.

### API
Přes API máš oba modely hned: `claude-opus-5-5` u Anthropicu, `gpt-6-sol` u OpenAI. Cache čtení u obou za 0,20 $ za milion tokenů; zápis do cache u Opusu za 5 $, u Solu za 2,50 $.

## Opus 5.5 a bezpečnostní fallbacky

Tohle je specifikum Anthropicu, na které je dobré se připravit. Opus 5.5 má zpřísněné ochranné mechanismy ve dvou oblastech:

- **Kyberbezpečnost** - klasifikátor u požadavků, které vyhodnotí jako rizikové, často přesměruje odpověď na starší **Opus 4.8**. Dostaneš odpověď, ale ne od modelu, za který platíš.
- **Biologie a life sciences** - rozšířené safeguardy; v evaluacích Anthropic zmiňuje refusal fallback na Opus 5.

Pro běžného uživatele to většinou nic neznamená. Pokud ale děláš penetrační testy, analyzuješ malware nebo pracuješ s biologickými daty, počítej s tím, že se ti model pod rukama může „vyměnit“ a kvalita odpovědi kolísá. GPT-6 Sol podle dostupné dokumentace podobný explicitní fallback mechanismus nepopisuje - což neznamená, že filtry nemá, jen o nich OpenAI nepíše stejným způsobem.

## Checklist: kdy Sol, kdy Opus

**Vezmi GPT-6 Sol, když:**
- ti jde primárně o cenu - je poloviční na vstupu i výstupu (a levnější je i zápis do cache),
- pracuješ s velkými dokumenty do ~270k tokenů (nad tím si spočítej příplatek; Opus má 1M bez takového skoku),
- už používáš ChatGPT Work nebo Codex a nechceš přidávat další předplatné,
- chceš o něco větší kontextové okno (1,05M oproti 1M u Opusu).

**Vezmi Opus 5.5, když:**
- žiješ v Claude Code nebo Cursoru s Claude workflow a nechceš měnit nástroje,
- máš ověřeno, že ti Claude na tvém typu úloh funguje lépe (benchmarky výrobců k tomu nestačí),
- ti nevadí dvojnásobná cena za předvídatelné chování a 1M kontext bez příplatku za dlouhý prompt,
- potřebuješ výstup až 128k tokenů (stejný strop má i Sol) a nepracuješ v oblastech s fallbackem na Opus 4.8 nebo Opus 5.

**U obou si zkontroluj:**
- je Fast mode vypnutý, pokud ho vážně nepotřebuješ (u Opusu Fast stojí 8 $/40 $),
- používáš prompt caching - čtení za 0,20 $; počítej i se zápisem (Opus 5 $, Sol 2,50 $),
- max. výstup 128k mají oba - není to výhoda jen jednoho,
- u Sol hlídáš hranici 272k vstupních tokenů,
- u Opusu víš, že bezpečnostní vrstvy můžou přepnout model.

## Na závěr

Dnes není důvod ke spěchu ani k přebíhání. Kdo má rozjeté workflow v Claude, dostal levnější Opus. Kdo je v ekosystému OpenAI, dostal Sol za polovinu ceny předchozí řady. Nezávislá data o kvalitě dorazí během několika týdnů - a s nimi i Sonnet a Haiku 5.5, které cenový obrázek ještě zamíchají. Do té doby platí: rozhoduj se podle účtu za tokeny a podle toho, kde už stejně pracuješ.
