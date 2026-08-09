---
title: "iOS 26.6 je venku. Nudná aktualizace, která zalepuje 87 bezpečnostních děr"
description: "Apple vydal iOS 26.6 a iPadOS 26.6. Nové funkce prakticky žádné, zato 87 opravených zranitelností — od jádra systému po WebKit, Wi-Fi a zpracování obrázků. Tohle je update, který se neodkládá."
category: "Mobily"
date: 2026-07-28
zprava: true
image: "/images/clanky/ios-26-6-87-bezpecnostnich-der.jpg"
---

Apple v pondělí 27. července vypustil **iOS 26.6 a iPadOS 26.6**. Kdo čeká novinky, bude zklamaný — oficiální poznámky k vydání se vejdou do jedné věty: opravy chyb, bezpečnostní záplaty a optimalizace indexu Spotlightu jako příprava na iOS 27.

Zajímavější je ale to, co Apple napsal na svoji bezpečnostní stránku. Tam je vypsáno **87 unikátních zranitelností (CVE)**, které tenhle update zalepuje. To není běžná servisní aktualizace, to je pořádný úklid.

## Co všechno bylo děravé

Seznam postižených komponent je dlouhý a nepříjemně široký:

- **Jádro systému (Kernel)** — nejvíc záznamů ze všech, patnáct oprav. Chyby v jádře jsou ty nejcitlivější, protože můžou útočníkovi dát práva nad celým zařízením.
- **WebKit** — engine, na kterém běží Safari a každý prohlížeč na iPhonu. Dvanáct oprav i s položkami WebKit Canvas a WebKit Storage. Stačí navštívit [nastražený web](/clanky/hotelova-wifi-captivecrunch/).
- **ImageIO a Model I/O** — zpracování obrázků a 3D modelů, dohromady třináct oprav. Klasický vektor: pošlete oběti soubor a on se zpracuje sám.
- **Wi-Fi, Siri, Apple Neural Engine, Sandbox Profiles, Security, Safari Downloads** a řada dalších.

Dobrá zpráva: u žádné z těch chyb Apple neuvádí, že by o jejím zneužití v praxi věděl. Tohle není hašení požáru, ale preventivní záplata. Špatná zpráva je, že jakmile je oprava venku, popis chyby je veřejný — a útočníci se z něj učí. Okno mezi vydáním záplaty a prvními pokusy o zneužití u nezáplatovaných zařízení bývá krátké.

## Co s tím

Nastavení → Obecné → Aktualizace softwaru. Update je bez nových funkcí, takže se nemusíte bát, že vám něco přeorganizuje domovskou obrazovku — dostanete jen zalepené díry.

Stejná várka záplat dorazila i na macOS, watchOS, tvOS a visionOS ve verzích 26.6. A pokud máte doma Mac, nenechte ho čekat: **macOS Tahoe 26.6 uvádí 155 opravených zranitelností**, tedy skoro dvakrát tolik co iPhone. Projděte všechna zařízení, ne jen to, které máte zrovna v ruce.

Součástí balíku je i jedna oprava mimo bezpečnost: Apple podle vlastního popisu vyřešil problém, kdy se Macy s čipem M5 mohly u firemních nasazení nečekaně vypínat.

## Zdroj

- [About the security content of iOS 26.6 and iPadOS 26.6 — Apple Support](https://support.apple.com/en-us/128066)
- [About the security content of macOS Tahoe 26.6 — Apple Support](https://support.apple.com/en-us/128067)
- [What's new in the updates for macOS Tahoe 26 — Apple Support](https://support.apple.com/en-us/122868)
