---
title: "Claude Cowork uměl utéct z izolace a číst klíče z tvého Macu"
description: "Výzkumníci ukázali, jak jedna zpráva donutila AI agenta Claude Cowork vylézt z jeho VM a sáhnout si na celý disk Macu — SSH klíče, cloud přihlašovací údaje, cokoli. Anthropic to zavřel jako 'informativní'."
category: "AI Agenti"
date: "2026-07-24"
zprava: true
image: "/images/clanky/claude-cowork-sandbox-utek.jpg"
---

[Claude](/clanky/claude-anthropic-pentagon/) Cowork je Anthropicem prodávaný jako bezpečná krabička: AI agent běží v izolovaném Linux VM jako neprivilegovaný uživatel a vidí jen složky, které mu sám připojíš. Ta hranice je celý produkt — je to jediná věc mezi „model udělal blbost" a „model měl moje cloud přihlašovací údaje". Výzkumníci z Accomplish AI teď zveřejnili, jak tu hranici prolomili.

Postup zněl děsivě jednoduše: připojili čerstvé session jednu složku, poslali jednu krátkou zprávu — a agent si prošlapal cestu ven z VM na hostitelský Mac. Četl a zapisoval soubory všude po disku, daleko mimo připojenou složku, a nikde nevyskočilo žádné potvrzovací okno. SSH klíče, cloud credentials, cokoli, na co má uživatelský účet dosah.

Řetězec (výzkumníci ho pojmenovali **SharedRoot**) skládal dohromady několik věcí. Agent si přes `unshare` vytvořil namespace, kde je rootem, přes něj se dostal k síťovému kernel modulu `act_pedit`, ve kterém sedí veřejná chyba z června (CVE‑2026‑46331). Tou „otrávil" root binárku, kterou coworkd (běžící pod rootem) při normální práci znovu spustí — a tím se agent stal rootem uvnitř VM. A protože Cowork nasdílel do VM celý disk hostitele read-write, root ve VM = přístup k celému Macu.

Proč to není jen jedna chyba k záplatování: výzkumníci ukazují, že podobné díry v této části kernelu vylézají pravidelně a AI teď hledání zranitelností zprůmyslnila — mezera mezi opravou a funkčním exploitem se scvrkla na hodiny. Tvůj guest kernel je tak prakticky pořád o krok pozadu. Skutečná pojistka nebyla v kernelu, ale ve čtyřech nastaveních nad ním — hlavně v tom, že se do VM neměl sdílet celý disk hostitele.

Praktický dopad: Anthropic report zavřel jako „informativní" (chyba spadala mimo okno jejich bounty programu) a upozorňuje, že Cowork dnes **standardně běží v cloudu**, kde tahle lokální úniková cesta neplatí. Riziko se tedy týká hlavně lokálního běhu. Ponaučení pro každého, kdo pouští AI agenty na svém stroji: izolace je jen tak silná, jak silné je to nejslabší nastavení pod ní — a „běží to ve VM" samo o sobě není záruka.

## Zdroj

[Accomplish AI: SharedRoot — Escaping the Claude Cowork sandbox](https://www.accomplish.ai/blog/sharedroot-escaping-claude-cowork-sandbox/)
