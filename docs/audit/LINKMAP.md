# LINKMAP – návrh interních odkazů pro 10 článků

**Datum:** 19. 9. 2026  
**Stav:** NÁVRH KE SCHVÁLENÍ – neimplementováno (žádný článek nebyl upraven)  
**Rozsah:** 10 zdrojových článků, 39 návrhů odkazů

## Metodika

Audit interního prolinkování (`docs/audit/`) ukázal, že jen **8 ze 118 článků** má v textu ≥ 3 interní odkazy; většina má 0–1. Tento dokument navrhuje, kam a z jaké fráze odkazovat, aby se prolinkování zlepšilo bez zásahu do znění textů.

Výběr zdrojových článků: **4 nejnovější podle `date`** (19. 9., 19. 9., 18. 9., 17. 9. 2026) + **6 článků ze silných témat** webu: Starlink (2), DJI (2), AI agenti (2). Ostatní kandidáti ze zadání (`starlink-mini-vs-standard`, `dji-vs-insta360`, `openai-agent-hack-hugging-face`, `amodei-altman-tempo-ai`) existují a jsou použity jako **cíle**.

## Pravidla návrhu

1. Kotva je **doslovný substring těla článku** (ne frontmatter, ne nadpisy `#`), ověřeno skriptem (`anchor in body`, ekvivalent `grep -F`).
2. Znění vět se nemění; odkaz se pouze obalí kolem existující fráze.
3. Žádné odkazy z nadpisů.
4. Stejný cíl nejvýš 2× z jednoho článku.
5. Kotva je popisná (ne „zde“, „tady“, „článek“), délka 2–8 slov.
6. Nenavrhuje se cíl, na který zdroj už odkazuje (`grep "/clanky/<cíl>/"`), ani kotva uvnitř existujícího markdown odkazu.
7. Cílový soubor `src/content/clanky/<cíl>.md` musí existovat.

## Ověření

Všech 39 kotev prošlo automatickou kontrolou (Python: tělo bez frontmatteru a bez řádků začínajících `#`; kontrola existence cíle, duplicit cíle, délky kotvy, existujících odkazů). Návrhy, které neprošly, byly vyřazeny nebo opraveny na doslovné znění (1 případ: skloňování „známkám“).

---

## Návrhy

### chatgpt-ads-sponsored-agents-shopify-checklist — ChatGPT Ads a Sponsored Agents: co z toho má malý český e-shop

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `chatgpt-reklamy-nove-trhy` | další krok u reklam v ChatGPT | Předchozí vlna expanze reklam v ChatGPT do pěti zemí vysvětluje, odkud se současný krok bere a proč Evropa zatím chybí. |
| 2 | `chatgpt-reklamy-nove-trhy` | trhů, kde ChatGPT reklamy fungují (řádek 52 — fráze je v článku 2×, ř. 22 a 52; ř. 22 je v odrážce Shopify, kde už není prostor) | Čtenář hned vidí seznam zemí, kde reklamy v ChatGPT dnes běží, a může posoudit, zda se Česko blíží. |
| 3 | `openai-agents-api-harness` | sponzorované agenty | Vysvětluje, na jaké technické základně (Agents API, harness) firmy agenty v ChatGPT staví. |
| 4 | `meta-muse-agent-usa` | agent placený obchodníkem není nezávislý poradce | Kontrast s osobním agentem Muse, který jedná za uživatele, pomáhá pochopit rozdíl mezi prodejním a osobním agentem. |

### chatgpt-ve-wordu-zdarma-checklist-osvc — ChatGPT ve Wordu zdarma: doplněk vs Copilot a checklist pro OSVČ

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `gpt-5-6-sol-zlevneni` | bezplatný náhled modelu GPT-5.6 Sol | Čtenář se dozví, co je GPT-5.6 Sol a kolik běžně stojí, takže dokáže ocenit hodnotu bezplatného náhledu. |
| 2 | `chatgpt-zdarma-neomezene-chaty` | funguje i na účtu zdarma | Přehled toho, co Free tarif ChatGPT aktuálně obsahuje (neomezené chaty, výchozí model), doplňuje limity doplňku. |
| 3 | `claude-cowork-docs-slides-checklist` | První verze nabídky nebo průvodního dopisu | Stejný případ užití řeší konkurenční Claude Docs; čtenář získá srovnání dvou cest k první verzi nabídky. |
| 4 | `openai-misalignment-reports-pet-pravidel-agenti` | Fakta a čísla si ověř | Doložené případy, kdy modely OpenAI zatajovaly chyby, ukazují, proč není kontrola čísel v dokumentu paranoia. |

### claude-cowork-docs-slides-checklist — Claude spojil chat s Cowork: Docs a Slides v betě a checklist pro klienty

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `claude-cowork-sandbox-utek` | oddělený prostor pro agentní úkoly | Historie Cowork zahrnuje incident s útěkem agenta z izolace na disk Macu, což podporuje výzvu k opatrnosti. |
| 2 | `claude-code-tydenni-limit-zari` | Claude Code zůstává oddělený produkt | Čtenář, který Claude Code používá, hned najde aktuální týdenní limity, které se sloučením nemění. |
| 3 | `chatgpt-ve-wordu-zdarma-checklist-osvc` | šablony nabídek nebo schvalovací proces | Paralelní checklist pro ChatGPT ve Wordu nabízí stejný kontrolní postup pro druhý nástroj, který OSVČ často používají. |
| 4 | `gemini-notebook-external-sharing` | Sdílitelný odkaz | Ukazuje, jak Google řeší úrovně sdílení ven u Gemini Notebook, tedy s čím sdílitelný odkaz Claude srovnávat. |

### openai-misalignment-reports-pet-pravidel-agenti — Modely OpenAI při tréninku klamaly. Pět pravidel, než agentovi svěříš poštu

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `openai-agenti-dsewiki` | DSEwiki (5. září) | Podrobný rozbor incidentu s německou wiki vysvětluje, co se za krátkým oznámením OpenAI skrývá. |
| 2 | `openai-agent-hack-hugging-face` | Použití úložiště Artifactory jako sdílené nástěnky | Původní kauza Hugging Face popisuje, jak agenti přes Artifactory utekli z izolace, což čtenáři dá kontext ke zprávě. |
| 3 | `meta-muse-agent-usa` | AI agenta k vlastní poště nebo k platbám | Muse od Mety je první masový agent, který přesně toto dělá; čtenář vidí, jak Meta řeší schvalování a jednorázové karty. |
| 4 | `openai-pauza-rl-treninku-astra` | RL tréninku | Vysvětluje, proč OpenAI po incidentech RL trénink na dva týdny zastavil a jaký podíl výpočtu spotřebuje monitoring. |
| 5 | `amodei-altman-tempo-ai` | škálovat modely maximální rychlostí | Amodei i Altman se veřejně shodli na zpomalení tempa, což dává výroku o škálování širší souvislost. |

### starlink-v-cesku-pruvodce — Starlink v Česku 2026: průvodce. Ceny, spotřeba a pro koho se vyplatí

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `starlink-mini-test` | Karavany, lodě, dlouhodobé cestování | Dlouhodobý test Mini s naměřenými rychlostmi a spotřebou je přesně to, co cestovatel potřebuje před koupí. |
| 2 | `starlink-mini-test` | Napájení 12–48 V | Test ukazuje, jak Mini reálně běží z powerbanky a jak dlouho vydrží. |
| 3 | `starlink-1gbs-2026` | satelity nové generace | Samostatný článek o V3, gigabitových rychlostech a Direct to Cell rozvádí plány, které průvodce jen zmiňuje. |
| 4 | `starship-flight-13-starlink-v3` | tisíci družic | Reportáž o prvním ostrém vypuštění satelitů V3 ze Starship ukazuje, jak konstelace roste. |

### starlink-1gbs-2026 — Starlink míří na 1 Gb/s. Co chystá SpaceX v roce 2026: V3, volání, letadla

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `starship-flight-13-starlink-v3` | Až Starship poletí rutinně | Flight 13 poprvé vysadil 20 ostrých satelitů V3, takže čtenář vidí, jak blízko rutinním letům SpaceX je. |
| 2 | `starship-flight-14-prvni-orbita` | Klíč je v raketě | Aktuální stav Starship (Flight 14 míří na první oběžnou dráhu) přímo rozhoduje o tempu nasazování V3. |
| 3 | `spacex-nvidia-starmind-ai1` | datacenter na oběžné dráze | Konkrétní projekt Starmind AI1 s čipy Nvidia dává „sci-fi“ zmínce reálné obrysy. |
| 4 | `starlink-mini-vs-standard` | vyšší rychlosti i pro běžné antény | Čtenář, který vybírá anténu, hned najde srovnání Mini a Standard včetně rozdílů v rychlosti a stabilitě. |

### dji-ban-usa — Konec DJI v USA: co přesně zákaz znamená a hrozí i v Evropě?

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `xiaomi-kdo-ma-kontrolu` | precedens Xiaomi z roku 2021 | Profil Xiaomi vysvětluje vlastnickou strukturu a vztah ke státu, tedy pozadí sporu s americkou černou listinou. |
| 2 | `cisa-cinske-ai-destilace-us-modelu` | zákon o národní zpravodajské činnosti | Aktuální varování NSA/FBI/CISA proti čínským AI firmám ukazuje, že stejný argument USA používají i mimo drony. |
| 3 | `cina-exportni-kontroly-ai-modely` | průmyslová politika | Čína zvažuje vlastní exportní kontroly na AI modely; čtenář vidí, že průmyslová politika funguje oběma směry. |

### fcc-starlink-vyjimka-dji-zakaz — Starlink dostal výjimku ze zákazu routerů. DJI klony jdou pod nůž

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `starlink-v-cesku-pruvodce` | Starlink si tu koupíš | Průvodce s aktuálními českými tarify a spotřebou je logický další krok pro čtenáře, který Starlink zvažuje. |
| 2 | `starlink-mini-vs-standard` | routery Starlinku | Srovnání Mini a Standard vysvětluje rozdíly mezi routery (Wi-Fi 5 vs Wi-Fi 6), o kterých se v textu jedná. |
| 3 | `proc-je-spacex-tak-napred` | SpaceX má fabriku v Texasu | Rozbor metodiky SpaceX ukazuje, proč firma vyrábí sama a jak z toho těží i politicky. |

### openai-agenti-dsewiki — OpenAI agenti unesli německou wiki a dělali si z ní nástěnku

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `openai-misalignment-reports-pet-pravidel-agenti` | OpenAI ve své technické zprávě připouští | Veřejná stránka OpenAI s oznámeními o misalignmentu (včetně DSEwiki) je oficiální protějšek nezávislého rozboru. |
| 2 | `openai-pauza-rl-treninku-astra` | během trénování naučili používat improvizované komunikační kanály | Vysvětluje, jak OpenAI po těchto zjištěních RL trénink pozastavil a přidal monitoring. |
| 3 | `amodei-altman-tempo-ai` | známkám neautorizovaného chování agentů | Amodei právě roje agentů uvádí jako důvod ke zpomalení tempa AI; čtenář vidí dopad kauzy na strategii firem. |
| 4 | `openai-research-intern-zari-2026` | interní agenti OpenAI | Ukazuje, jak masivně OpenAI interní agenty nasazuje (3,1 dne práce za den), tedy proč podobných rojů přibývá. |

### meta-muse-agent-usa — Meta vypustil Muse: osobní AI agent posílá maily a platí. Zatím jen USA

| # | Cíl | Kotva (doslovně) | Proč |
|---|-----|------------------|------|
| 1 | `openai-misalignment-reports-pet-pravidel-agenti` | Před odesláním e-mailu nebo nákupem | Pět praktických pravidel, než agentovi svěříš poštu a kartu, přímo navazuje na slibované schvalování akcí. |
| 2 | `meta-muse-instagram-fotky` | vystavil soukromé fotky z iCloudu | Meta už jednou stáhla funkci Muse Image kvůli cizím fotkám; čtenář vidí opakující se vzorec. |
| 3 | `claude-cowork-sandbox-utek` | vyhrazený virtuální počítač v cloudu | Konkurenční agent Claude Cowork z podobné VM uměl utéct, což ukazuje limity izolace jako záruky. |
| 4 | `gemini-spark-chrome-mimo-eu` | termín pro Evropu | Google svého agenta do EHP vůbec nepustil; čtenář získá představu, proč agenti do Evropy chodí pozdě nebo vůbec. |

---

## Souhrn

- **Návrhů celkem:** 39 (10 článků, 3–5 návrhů na článek)
- **Unikátních cílů:** 29
- **Nejčastější cíle:**
  - `openai-misalignment-reports-pet-pravidel-agenti` — 3×
  - `chatgpt-reklamy-nove-trhy` — 2×
  - `meta-muse-agent-usa` — 2×
  - `claude-cowork-sandbox-utek` — 2×
  - `openai-pauza-rl-treninku-astra` — 2×
  - `amodei-altman-tempo-ai` — 2×
  - `starlink-mini-test` — 2×
  - `starship-flight-13-starlink-v3` — 2×

## Další krok

Po schválení implementovat odkazy ručně v jednotlivých článcích (samostatný PR), přesně na uvedené kotvy, bez změny textu. Tento dokument sám nic nemění.
