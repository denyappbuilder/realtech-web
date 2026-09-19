---
title: "ChatGPT Ads a Sponsored Agents: co z toho má malý český e-shop"
description: "OpenAI testuje v ChatGPT sponzorované agenty a napojuje reklamy na Shopify a HubSpot. Co je jen americký test, co dorazí 23. září a kdy dává smysl čekat."
category: "AI Report"
date: "2026-09-19T14:30:00+02:00"
zprava: true
image: "/images/clanky/chatgpt-ads-sponsored-agents-shopify-checklist.jpg"
audio:
  url: "https://audio.realtech.cz/chatgpt-ads-sponsored-agents-shopify-checklist-nlm.mp3?v=3cb2dc9f2de7"
  duration: 1458
---

OpenAI 16. září oznámilo [další krok u reklam v ChatGPT](/clanky/chatgpt-reklamy-nove-trhy/). Testuje **Sponsored Agents**, tedy [sponzorované agenty](/clanky/openai-agents-api-harness/), se kterými si můžeš po kliknutí na reklamu popovídat. Zároveň napojilo Ads Manager na **Shopify** a **HubSpot**, aby reklamu zvládl nastavit i menší prodejce bez agentury. Pro český e-shop nebo OSVČ je to zatím spíš věc k sledování než k okamžitému utrácení. Část novinek je jen americký test, část má dorazit do dalších trhů od 23. září. Tady je, co se skutečně změnilo a jak si to přeložit do praxe.

## Co se změnilo

Podle blogu OpenAI z 16. září 2026 jde o čtyři věci najednou:

- **Sponsored Agents** v testu s vybranými americkými inzerenty.
- **Nové nástroje v Ads Manageru**: reklamu vytvoříš a spravuješ pomocí zadání v přirozeném jazyce, systém navrhne texty a obrázky podle cílové stránky a cíle kampaně, volitelně text upraví nebo přeloží. Reklamu jde podle OpenAI vytvořit i několika prompty přímo v ChatGPT Work.
- **HubSpot** jako první CRM partner: připojíš ChatGPT Ads, vytvoříš reklamy, sleduješ výsledky a řešíš poptávky přímo v HubSpotu. Dostupné od dne oznámení.
- **Shopify** jako první e-commerce partner: američtí obchodníci mají v App Store aplikaci ChatGPT Ads, produkty se berou ze Shopify Catalogu a měří se konverze. Do dalších trhů, kde ChatGPT reklamy fungují, má aplikace dorazit **od 23. září 2026**.

Přihlášení inzerentů běží přes ads.openai.com, případně přes aplikaci v Shopify nebo HubSpotu.

## Sponsored Agents nejsou běžný ChatGPT

Tohle je pro čtenáře nejdůležitější rozdíl. Když v ChatGPT klikneš na reklamu, můžeš **dobrovolně** zahájit konverzaci s agentem, kterého sponzoruje daná firma. OpenAI zdůrazňuje, že konverzace je **jasně označená**, oddělená od normálních odpovědí ChatGPT i od tvého původního chatu. Můžeš se doptávat a pak přejít odkazem na web firmy.

Prakticky: [agent placený obchodníkem není nezávislý poradce](/clanky/meta-muse-agent-usa/). Je to prodejní rozhovor v novém kabátě. Neptej se ho, jestli je konkurence lepší. Ptej se ho na to, co ví: dostupnost, parametry, podmínky. A pamatuj, že OpenAI to zatím testuje pouze s **vybranými inzerenty v USA**. Nic z toho dnes v Česku neuvidíš a OpenAI ani neslíbilo, kdy a zda se test rozšíří.

## Shopify a HubSpot pro malé prodejce

Zajímavější pro malý e-shop je právě propojení s nástroji, které už možná používáš.

### Shopify: co aplikace dělá

Podle nápovědy OpenAI aplikace **ChatGPT Ads for Shopify** propojí katalog produktů a data o nákupních událostech s Ads Managerem. Potřebuješ aktivní obchod na Shopify, účet v Ads Manageru (nebo si ho při instalaci založíš), oprávnění instalovat aplikace a základní údaje o firmě: web, obor, zemi, měnu a časové pásmo.

Postup je přímočarý: nainstaluješ aplikaci, klikneš na **Connect Account**, aktivuješ **Pixel for Shopify**, počkáš, než se katalog zsynchronizuje, a pak vytváříš produktové reklamy z feedu. Aplikace průběžně posílá změny v katalogu a zásobách i konverzní události přes pixel. Kampaň nastavíš přímo v Shopify: název, rozpočet, optimalizační událost, cílení a typ reklamy (všechny produkty, jeden produkt, nebo web).

Dvě drobnosti z nápovědy, které se hodí vědět. Rozpočet se v Shopify nastavuje po krocích (nápověda uvádí příklad 25 dolarů), zatímco v samotném Ads Manageru jde zadat jemněji, třeba 28 dolarů. A když aplikaci odpojíš, přestanou se posílat aktualizace produktů, ale účet v Ads Manageru zůstane.

### HubSpot: pro toho, kdo sbírá poptávky

Pokud neprodáváš zboží, ale služby, a poptávky ti chodí do HubSpotu, dává smysl druhá integrace. Reklamu vytvoříš a vyhodnotíš tam, kde už máš kontakty, a s leadem pracuješ dál bez přepínání mezi nástroji. Zda je to dostupné i z Česka, OpenAI v oznámení výslovně neříká, viz nejistoty níže.

## Checklist pro český e-shop nebo OSVČ

Než cokoli zaplatíš, projdi si tohle:

1. **Ověř dostupnost pro svou zemi.** Aplikace pro Shopify je dnes potvrzená jen pro USA. Od 23. září má přijít do trhů, kde ChatGPT reklamy fungují. Zkontroluj na ads.openai.com, jestli mezi ně patří Česko, nebo zda jde inzerovat alespoň na zahraniční zákazníky.
2. **Spočítej, kde jsou tví zákazníci.** Google a Meta znáš, máš historická data a víš, co stojí konverze. U ChatGPT žádná čísla nemáš a OpenAI žádné veřejné ceny za tisíc zobrazení ani konverzní poměry v oznámení neuvádí. Začni malým testovacím rozpočtem, ne přesunem stávajících peněz.
3. **Připrav katalog.** Jestli prodáváš přes Shopify, ať máš čisté názvy, popisy, ceny a skladovost. Reklamy se generují z feedu, takže špatná data znamenají špatné reklamy.
4. **Zapoj pixel a měř.** Bez konverzních událostí nepoznáš, jestli to funguje. Nastav to od prvního dne.
5. **Rozhodni, kdo odpovídá.** AI navrhne texty i překlady, ale za obsah reklamy ručíš ty. Zkontroluj češtinu, právní náležitosti a sliby, které dáváš.
6. **Sponsored Agents zatím ignoruj.** Jsou v americkém testu s vybranými firmami. Nemá smysl na ně stavět plán.

## Kdy dává smysl počkat

Pokud máš roční rozpočet na reklamu v desítkách tisíc korun, jsi mimo Shopify a HubSpot a tví zákazníci nakupují přes Heureku a vyhledávání, není kam spěchat. Nový kanál bez dat je pro malou firmu riziko, ne příležitost. Dává smysl si přečíst podmínky, sledovat, jestli se od 23. září objeví Česko mezi podporovanými trhy, a nechat první vlnu testů větším hráčům.

Naopak pokud prodáváš na Shopify do zahraničí, hlavně do USA, a máš zvládnuté měření, můžeš být mezi prvními, kdo si nový formát vyzkouší s malým rozpočtem. Jen počítej s tím, že Ads Manager je čerstvý nástroj a část funkcí se teprve rozjíždí.

## Zdroje

- OpenAI: [Reimagining advertising with AI](https://openai.com/index/reimagining-advertising-with-ai/), blog, 16. září 2026 (načteno 19. září 2026)
- OpenAI Help Center: [Set up ChatGPT Ads for Shopify](https://help.openai.com/en/articles/20001523-set-up-chatgpt-ads-for-shopify), aktualizováno přibližně 17. září 2026 (načteno 19. září 2026)
