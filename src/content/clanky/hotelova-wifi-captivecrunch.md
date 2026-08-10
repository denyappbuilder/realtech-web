---
title: "Hotelová Wi-Fi jako past. Falešná aktualizace prohlídne notebook i mikrofon"
description: "Microsoft popsal kampaň CaptiveCrunch: ruská skupina ovládla přihlašovací stránky hotelových Wi-Fi po celém světě a servíruje malware jako aktualizaci prohlížeče."
category: "Sítě"
date: 2026-08-04
zprava: true
image: "/images/clanky/hotelova-wifi-captivecrunch.jpg"
---

Zrovna když má půlka republiky sbaleno k moři, přišel Microsoft Threat Intelligence s varováním, které se hodí přečíst před odjezdem. Od začátku května sleduje kampaň, kterou pojmenoval **CaptiveCrunch** — útočníci v ní ovládli Wi-Fi sítě v hotelech, konferenčních centrech a dalších sdílených prostorech v několika zemích a manipulují provoz přímo na těch přihlašovacích stránkách, co vyskočí po připojení.

Za kampaní stojí podle Microsoftu skupina Storm-2945, kterou firma řadí pod **Midnight Blizzard** — ruského aktéra, jehož americká i britská vláda přisuzují SVR, tedy ruské zahraniční rozvědce.

## Jak to na vás vyskočí

Připojíte se na hotelovou síť, prohlížeč si automaticky ověří konektivitu — a místo běžné odpovědi dostane nabídku „aktualizace prohlížeče" nebo systému. To je ono. Útočníci k tomu používají techniku ClickFix, kde vám stránka sama nadiktuje, co máte spustit. Microsoft zároveň vidí známky toho, že se stejná past chystá i na Androidy: přistávací stránky obsahují instrukce ke stažení APK souboru.

Když to spustíte, přistane vám v počítači RAT jménem CornFlake napsaný v Go. Umí toho nepříjemně hodně: snímá stisky kláves včetně hesel, kopíruje schránku, dělá screenshoty, nahrává **mikrofon i webkameru**, sbírá soubory, hlídá připojené flashky a dává útočníkovi vzdálený příkazový řádek. V systému se maskuje jako služba „Cloud Sync Service".

Vedle toho běží PowerShell zloděj ChocoShell, který cílí na to nejcennější — cookies a uložená hesla z prohlížečů, přihlašovací tokeny k Microsoftu 365 a rovnou i **hesla k Wi-Fi sítím**, které máte v počítači uložené. Ukradený token k M365 je průšvih i pro firmu, protože útočníkovi umožní přihlásit se bez hesla a bez druhého faktoru.

## Co si z toho odnést

Praktické pravidlo je jednoduché: **aktualizaci, která na vás vyskočí hned po připojení k cizí Wi-Fi, nikdy neinstalujte.** Legitimní systém ani prohlížeč se takhle nechovají. A pokud vám nějaká stránka diktuje, co máte zkopírovat do příkazové řádky, je to útok — vždy.

Microsoft popisuje útoky jako stále probíhající a děkuje za spolupráci Anthropicu a OpenAI. Podle firmy skupina [využívá AI k podstatné části svých operací](/clanky/openai-agent-hack-hugging-face/).

## Zdroj

[CaptiveCrunch: Midnight Blizzard targets travelers worldwide for malware delivery and credential theft — Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2026/07/31/captivecrunch-midnight-blizzard-targets-travelers-worldwide-for-malware-delivery-and-credential-theft/)
