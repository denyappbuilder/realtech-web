---
title: "Claude začíná neviditelně značkovat text: vodoznak přímo v modelu, C2PA na obrázcích"
description: "Anthropic potvrdil, že modely Claude vydané 2. srpna a později vplétají do generovaného textu neviditelný vodoznak a k souborům připojují podepsaná metadata C2PA. Platí to celosvětově napříč všemi produkty i cloudy. Detekci pro třetí strany firma slibuje, technickou dokumentaci zatím nevydala."
category: "AI Report"
date: "2026-08-13"
zprava: true
image: "/images/clanky/claude-vodoznak-ai-text.jpg"
---

Anthropic začal značkovat výstupy Clauda tak, aby se dalo strojově poznat, že prošly jeho modelem. Podle [oficiální stránky podpory](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content) se to týká [modelů Claude](/clanky/anthropic-claude-opus-5/) spuštěných **2. srpna 2026 nebo později** — u starších se na podpoře teprve pracuje.

## Dvě různé techniky

Na **text** jde neviditelný vodoznak vetkaný přímo do generovaných slov. Anthropic tvrdí, že nemění význam, kvalitu ani čitelnost odpovědi. Klíčové je, že se aplikuje **na úrovni modelu** — je tam bez ohledu na to, jestli text vypadne z Claude Platform (API), z Clauda, Claude Code, Claude Cowork nebo Claude Tag. A protože je součástí samotného textu, cestuje s ním při zkopírování a vložení jinam. Funguje i při přístupu přes AWS, Google Cloud a Microsoft Foundry.

Na **soubory** jde podepsaná metadata podle otevřeného standardu **C2PA** — tedy to, co už používá Adobe, OpenAI i Google. Anthropic jmenuje jako podporované typy `.svg`, `.png` a `.jpg`. U souborů navíc podpis prozradí, jestli s nimi někdo manipuloval.

## Co ta značka NEdokazuje

Tady je Anthropic překvapivě upřímný a stojí za to si to přečíst pozorně. Nalezená značka podle firmy **není plně průkazná** a sama o sobě nepotvrzuje původ obsahu. Důvod je prostý: lidi Clauda používají na opravy, překlady, sumarizaci nebo konverzi souborů. Text tak může nést značku Clauda, i když myšlenky i data pocházejí odjinud — „Claude nemusí být původním autorem".

A platí to i obráceně: **absence značky neznamená, že obsah není od AI.**

Vodoznak zmizí nebo zeslábne, když se text výrazně přepíše, parafrázuje, přeloží nebo zamíchá do jiného psaní. Nebo když je pasáž prostě moc krátká. U souborů metadata odstraní konverze formátu, opětovné uložení nebo screenshot — což je u C2PA známá slabina, občas se to stane i omylem při nahrání na sociální síť.

## Proč to Anthropic dělá

Kvůli EU. Nové povinnosti k transparentnosti AI podle **AI Actu** platí od 2. srpna a pro produkty spuštěné dřív běží čtyřměsíční přechodné období. Nové modely tedy značkují od prvního dne, u starších se to doplňuje za pochodu.

## Slabé místo: detekce zatím není

Anthropic slibuje, že podpoří uživatele i třetí strany v detekci — kodex to vyžaduje. Jak přesně to bude fungovat, ale zatím neřekl: podrobnosti prý přijdou v „nadcházející technické dokumentaci".

A přesně tady je zádrhel, na který upozorňují první rozbory. Veřejné detekční API je totiž zároveň návod na obcházení: kdo si může neomezeně ověřovat, jestli je vodoznak vidět, může text tak dlouho upravovat, až zmizí. Značkování tedy nejspíš zachytí běžné kopírování bez úprav — na někoho, kdo se schválně snaží stopu smazat, to stačit nebude.

**Zdroje:** [Anthropic Support](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content), [The Verge](https://www.theverge.com/ai-artificial-intelligence/977823/anthropic-claude-ai-watermarks-c2pa-text-images)
