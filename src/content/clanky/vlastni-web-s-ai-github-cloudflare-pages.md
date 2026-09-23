---
title: "Vlastní web za cenu domény: GitHub, Cloudflare Pages a AI ve třech krocích"
description: "Návod, jak si udělat jednoduchý web bez programování: AI napíše soubory, GitHub je uloží, Cloudflare Pages zveřejní. Platíš jen doménu, webhosting nekupuj."
category: "AI Report"
date: "2026-09-23T18:40:00+02:00"
zprava: true
video: "https://www.youtube.com/watch?v=M0YHgbt1Tec"
image: "/images/clanky/vlastni-web-s-ai-github-cloudflare-pages.jpg"
---

Náš web běží na dvou bezplatných službách a jedné doméně za pár stovek ročně. Soubory nám připravuje AI, GitHub si pamatuje každou změnu a Cloudflare Pages je zveřejní. V novém videu jsme ten postup vysvětlili za necelé čtyři minuty, tady máš totéž jako návod, který si můžeš odškrtávat.

## Co za těch 250 Kč vlastně dostaneš

Nejdřív k penězům, aby nevznikl zmatek. Částka kolem 250 Kč ročně, kterou ve videu zmiňujeme, je orientační rozpočet na doménu, tedy na adresu typu kavarna.cz. Hosting pro jednoduchý statický web je u Cloudflare Pages zdarma, účet na GitHubu je zdarma. Předplatné AI, které ti web napíše a pomůže s úpravami, platíš zvlášť a do těch 250 Kč se nepočítá.

Dvě věci si ještě ohlídej. Bezplatné tarify GitHubu i Cloudflare mají limity, takže tenhle postup sedí na jednoduchý web s několika stránkami a články, ne automaticky na každý e-shop nebo aplikaci. A cena domény se mění, proto si před koupí zkontroluj cenu registrace i prodloužení včetně DPH u registrátora.

## Krok 1: Web ti připraví AI

Otevřeš Claude (nebo jinou AI, kterou už používáš) a napíšeš obyčejnou větu. Třeba: „Udělej mi jednoduchou stránku pro kavárnu s otevírací dobou a fotkou.“ Za chvíli dostaneš soubor, který otevřeš v počítači a vidíš svůj web. Nic nepíšeš, nic nekóduješ.

Když se ti něco nelíbí, řekneš to stejně, jako bys to říkal kamarádovi: „Dej to tmavší.“ „Udělej větší písmo.“ AI soubor přepíše a ty se znovu podíváš. Tohle je celý princip. Web je soubor, AI ho umí napsat i upravit, ty jen říkáš, co chceš.

## Krok 2: GitHub a Cloudflare Pages

Soubor musí někam, kde ho uvidí ostatní. Na to používáme dvě služby, obě zdarma.

**GitHub** ber jako složku na internetu. Něco jako Google Disk, který si pamatuje každou změnu. Založíš si účet, vytvoříš složku (na GitHubu se jí říká repozitář) a nahraješ do ní soubor od AI.

**Cloudflare Pages** tu složku ukáže celému světu. V Cloudflare řekneš „tady je moje složka na GitHubu“, potvrdíš a za chvíli máš web na internetu, včetně zámečku v prohlížeči, tedy zabezpečeného spojení.

Jednu věc si z toho zapamatuj, protože na ní stojí všechno ostatní: cokoli změníš v té složce na GitHubu, se do chvíle objeví na webu. Je to jako upravit dokument na disku, jen tu změnu uvidí všichni.

## Krok 3: Vlastní doména a past s webhostingem

Zatím má web adresu od Cloudflare, kterou si nikdo nezapamatuje. Koupíš si vlastní, třeba kavarna.cz. My jsme naše domény kupovali u VEDOS, aktuální ceny najdeš na https://vedos.cz/domeny/.

A tady je ta past. Hned vedle domény ti registrátor nabídne webhosting za další peníze. Nekupuj ho. Webhosting je místo, kde web běží, a to už máš u Cloudflare Pages zdarma. Kupuješ jenom adresu.

Pak doménu propojíš s webem. V Cloudflare Pages řekneš „přidej mu vlastní doménu“, Cloudflare ti dá pár řádků textu (DNS záznamy) a ty je zkopíruješ do nastavení tam, kde jsi doménu koupil. Chvíli počkáš a web běží na tvé adrese. Přesný postup má Cloudflare v dokumentaci: https://developers.cloudflare.com/pages/configuration/custom-domains/

## Rychlý checklist

1. Dva účty zdarma: GitHub a Cloudflare.
2. Jedno předplatné AI, které už nejspíš máš.
3. Jedna doména, zkontroluj cenu registrace a prodloužení s DPH.
4. Žádný webhosting navíc.

## Jak přidávat stránky a články

Jedna stránka stačí pro kavárnu, řemeslníka nebo kapelu. Když chceš víc, třeba ceník, fotky a kontakty, řekneš to AI, ona do složky přidá další soubory a ty je jen potvrdíš.

Když budeš chtít novinky nebo články, zadej AI hned na začátku: „Udělej to tak, ať je každý článek jeden textový soubor.“ Od té chvíle je nový článek prostě nový soubor ve složce. Napíšeš text, uložíš ho do složky a je na webu. A dávat soubory do složky za tebe umí i AI.

Takhle vznikl i náš web. Začal jako jedna stránka, dnes má přes sto článků, pořád ve stejné složce a pořád skoro zdarma.

## Kdo všechno může do složky psát

Tady je rozdíl, který se vyplatí znát, než začneš. Ve videu jsme popsali tři možnosti od nejjednodušší.

**AI, které píšeš.** Jmenuje se Claude Code nebo Codex. Otevřeš ho v mobilu a napíšeš: „Změň otevírací dobu na 9 až 17.“ On úpravu připraví, ukáže ti ji, ty klikneš na schválit a je to na webu. Nic neinstaluješ, nic nenastavuješ. Většině lidí tohle úplně stačí.

**AI, které psát nemusíš.** Říká se mu agent. My máme třeba Hermes. Běží na našem počítači pořád a práci si hlídá sám. Natočíme video, on z něj napíše článek, uloží ho do složky a zeptá se nás, jestli ho může zveřejnit. Vyplatí se, když děláš to samé každý týden. Pusť ho jen do té jedné složky, ne do celého počítače.

**AI, která vymýšlí, co psát.** To je Grok Bot. Ráno napíše „tady jsou tři témata“, ty vybereš, on napíše článek, udělá z něj podcast, hlídá komentáře a umí sám klikat v prohlížeči. Když potřebuje někam přístup, řekne si o něj. O tom jsme točili minulý díl „Grok Bot + Astra: Postav si vlastní tým AI agentů“.

Pro první web nepotřebuješ nic z toho nastavovat. Začni obyčejným chatem, agenty řeš, až budeš mít co opakovat.

## Prompt, kterým můžeš začít hned

Nech se vést AI. Otevři obyčejný chat, třeba Claude, a napiš:

> „Chci web pro svoji kavárnu. Chci využít Cloudflare a GitHub. Veď mě krok za krokem.“

Místo kavárny dosaď svůj projekt. AI tě povede, a když se zasekneš, vyfoť obrazovku a pošli jí ji. Řekne ti, kam kliknout. První propojení účtů, repozitáře a domény musíš nastavit ručně, potom už změny připravuješ s AI a jen je schvaluješ.

## Podívej se na video

Celý postup i s obrazovkami máme ve videu „Web s AI: GitHub a Cloudflare vysvětlené za 4 minuty“: https://www.youtube.com/watch?v=M0YHgbt1Tec

Jestli si web podle toho uděláš, hoď nám adresu do komentářů pod videem. Rádi se podíváme. Další návody k AI a technice najdeš zdarma na https://realtech.cz a na Herohero připravujeme další obsah.
