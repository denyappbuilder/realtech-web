---
title: "Anthropic: AI už kampaně nepomáhá, orchestruje je. Co to znamená pro obranu"
description: "154stránkový Threat Intelligence Report (prosinec 2025–srpen 2026): sedm oblastí škod, Midnight Blizzard vůči UA/EU, ShinyHunters, 5 bio a 6 zbraňových případů. AI jako orchestrátor. Decision rules pro obránce."
category: "AI Report"
date: "2026-09-12T08:30:00+02:00"
zprava: true
image: "/images/clanky/anthropic-threat-report-ai-orchestruje-kampane.jpg"
---

Anthropic 10. září vydal čtvrtý Threat Intelligence Report. 154 stran. Osm měsíců, od prosince 2025 do srpna 2026. Sedm oblastí škod. Předchozí tři vyšly v březnu, srpnu a listopadu 2025. Hlavní zjištění: AI přestala útočníkům pomáhat a začala jejich kampaně řídit.

Loňské reporty popisovaly Claude jako asistenta. Napsal kus kódu, přeložil phishing, poradil s konfigurací. Letošní popisuje orchestrátora. Operátor zadá cíl. Agenti si rozdělí práci, projdou infrastrukturu, vyrobí nástroje a poskládají výsledek. Člověk zůstává na začátku a na konci. Vybírá cíle a zpeněžuje výsledek.

Pro obránce se tím mění tři veličiny. Rychlost: průnik za 2 až 3 hodiny. Škála: přes 2 100 sad tokenů z více než 40 tenantů za zhruba 34 hodin. Hloubka: jeden člověk zvládne to, na co dřív potřeboval tým. Dole najdeš, co z toho plyne pro firmu s pěti lidmi a bez SOC.

## Co v reportu je

- **Období:** prosinec 2025 až srpen 2026, přibližně 8 měsíců.
- **Rozsah:** 154 stran, sedm oblastí škod. Případové studie pokrývají státní špionáž, kyberzločin, hacktivismus, útoky na samotné AI firmy, biologii a konvenční zbraně.
- **Modely:** zneužívány byly Claude Haiku, Sonnet a Opus. U Fable a Mythos report žádné zneužití neuvádí, s jedinou výjimkou: jeden případ nedovolené destilace.
- **Rámec:** Anthropic měří přínos pro útočníka ve třech osách. Rychlost, škála, hloubka.
- **Teze:** od asistenta k orchestrátorovi. Model dostane cíl a sám řídí postup.

Postupy útoků report nepopisuje. Tenhle článek také ne. Řešíme, co z toho plyne pro obranu.

## Vybrané případy: Evropa a Ukrajina nejblíž

**GTG-20006, ruská špionáž.** Anthropic aktivitu označuje za konzistentní s Midnight Blizzard. Celý pracovní postup řídila AI. Cíle: ukrajinské a evropské vládní úřady, obrana, diplomacie a dodavatelský řetězec dronů. Zasaženo přes 20 organizací.

**GTG-50014, přidružení ShinyHunters.** Vibe hacking: operátor popíše, co chce, agent poskládá kroky. Skupina prohnala analýzou 1,8 milionu APK souborů a měla kolem 200 odběratelů ukradených dat. Za zhruba 34 hodin získala přes 2 100 sad tokenů Azure AD z více než 40 tenantů. Od prvního kontaktu k průniku uběhly 2 až 3 hodiny.

**GTG-10007, čínské „exploit foundries".** Operátoři z Changsha v provincii Hunan provozovali linku na hledání zranitelností. Zhruba 50 cílových organizací. Přes 12 možných zero-day zranitelností za měsíc.

**GTG-50020, útok na AI dodavatelský řetězec.** Asi 30 AI firem za přibližně 4 dny. Součástí byl pokus dostat se k nevydané verzi Claude. Neuspěl. Anthropic uvádí, že jeho systémy kompromitované nebyly.

**GTG-50029, francouzský hacktivista.** Jeden člověk. 42 zasažených subjektů v evropské politice. Úniky dat o velikosti 12 až 26 GB.

**Biologie a konvenční zbraně.** Pět případových studií s dvojím užitím v biologii, šest u konvenčních zbraní. Technické detaily report neuvádí a my také ne. Jde o hranici. Model pomáhal s věcmi, které mají legitimní i škodlivé použití, a Anthropic řeší, kde tu hranici vést.

## Princip hodnoty: 8 pravidel pro obránce

Report je psaný pro velké bezpečnostní týmy. Pravidla níže jsou přepis pro živnost, agenturu a firmu do 50 lidí.

1. **Sofistikovanost neříká nic o útočníkovi.** Kampaň, která vypadá jako práce státní skupiny, může vést jeden člověk s agentem. Případ GTG-50029 to ukazuje přesně. Nehádej útočníka podle úrovně. Řeš dopad.
2. **Statické detekce stárnou rychleji.** Zablokuješ indikátor nebo signaturu a AI útočníkovi přestaví nástroj za hodiny. Sleduj chování: nový token z neznámé země, hromadné stahování, přihlášení mimo pracovní dobu. Seznam hashů tě ochrání kratší dobu než dřív.
3. **API klíč k AI je produkční tajemství.** Zacházej s klíči k Anthropic, OpenAI nebo Google stejně jako s klíči k databázi. Rotace, minimální oprávnění, limity útraty, žádné klíče v repozitáři. Ukradený klíč je pro útočníka výpočetní kapacita zdarma a pod tvým jménem.
4. **Integrace agentů a sandboxy jsou útočná plocha.** Každý MCP server, každý agent s přístupem k mailu nebo disku, každý sandbox je nový vstup. Inventarizuj je jako servery. Útočníci z GTG-50020 cílili právě na AI firmy a jejich nasazení.
5. **Člověk zůstává u výběru cílů a zpeněžení.** Na těch dvou místech jde útočníka pořád zpomalit. Buď těžký cíl: MFA odolné phishingu, segmentace sítě. A udělej data hůř prodejná: šifrování, minimum toho, co vůbec držíš.
6. **Expozice EU a Ukrajiny je reálná.** Dvě z pěti hlavních kyberkampaní míří na evropské vlády, politiku, obranu a dodavatele dronů. Pokud dodáváš do obrany, státní správy nebo pro ukrajinské partnery, jsi v cílovém seznamu nepřímo. Dodavatel je vstupní bod.
7. **Ekonomika útoku se mění.** Rozdíl mezi jedním člověkem a týmem mizí. Kampaň s 42 cíli nebo 30 firmami za 4 dny už nepotřebuje organizaci. Počítej s tím, že tě může napadnout někdo, kdo na to dřív neměl kapacitu.
8. **Sdílení informací a architektura porazí blokování slov.** Anthropic u každého případu předal indikátory úřadům a partnerům a zpřísnil mechanismy na úrovni systému: vzory chování, limity účtů, ověřování identity. Filtr klíčových slov v promptu tolik nezmůže. U tebe platí totéž. Sdílej, co vidíš, s partnery a CERT. A zabezpeč proces samotný, žádné pravidlo v mailu tě nezachrání.

## Co Anthropic udělal

U každého případu stejný postup. Zrušil účty. Zpřísnil bezpečnostní mechanismy podle zjištěného vzoru. Předal informace úřadům a partnerům v oboru. Report neuvádí, že by kterýkoliv z útočníků získal přístup k systémům Anthropic, včetně pokusu o nevydaný Claude.

Zprávu píše firma, která ty modely prodává. Anthropic vidí jen zneužití vlastních modelů. Co běží přes jiné API nebo přes otevřené modely na vlastním železe, v reportu není. Čísla ber jako spodní hranici.

## Co sledovat dál

- Reakce ENISA a národních CERT na sdílené indikátory. [ENISA má od letoška přístup k Mythos 5](/clanky/enisa-testuje-mythos-5-astra/) a testuje ho.
- Zda podobné reporty vydají OpenAI a Google se stejnou granularitou. Bez toho je obrázek jednostranný.
- Další destilace. Report uvádí jeden případ u Fable a Mythos. Pokud se ukáže systematický odliv schopností do modelů bez zábran, změní to ekonomiku útoku i pravidla výše.
- Evropský dodavatelský řetězec dronů. Je v cílovém seznamu GTG-20006 a české firmy jsou jeho součástí.

## Zdroje

- [Detecting and countering misuse of AI: September 2026 (Anthropic, 10. 9. 2026)](https://www.anthropic.com/threat-intelligence-report-september-2026)
- [BBC News: report Anthropic o zneužití AI (10. 9. 2026)](https://www.bbc.com/news/articles/cx2zrrpkx20o)
- [The Guardian: Anthropic report details AI misuse (10. 9. 2026)](https://www.theguardian.com/technology/2026/sep/10/anthropic-report-details-ai-misuse)
