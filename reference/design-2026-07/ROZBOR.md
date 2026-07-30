# Rozbor: návrh tří stránek z Claude Design (30. 7. 2026)

Zadání bylo v `~/.openclaw/workspace/data/plan/PROMPT-claude-design-realtech-web.md`
a mířilo na **jednu úlohu — z čtenáře udělat diváka a odběratele** — ne na
„hezčí web". Důvod: web má 85 návštěv za týden a 0 ze search i z YouTube, takže
redesign kvůli vzhledu by se nedal změřit. Doložená slabina je loajalita
(98 % zhlédnutí od nepřihlášených, subscriber-retence 37,7 %).

Soubor: `mockupy-3-stranky.html`, **1483 řádků**, vytažené z Claude bundleru.

## Verdikt: použitelné, a tu úlohu to dělá

**Splnil zadání do posledního bodu — změřeno, ne odkoukáno:**

| co | výsledek |
| --- | --- |
| React / `<script>` | **0 / 0** — čisté HTML+CSS |
| brand tokeny světlé | **10 z 10** použito |
| brand tokeny tmavé | **5 z 5** — tmavý režim navržený |
| písmo | Archivo + IBM Plex Sans + Mono, **žádné cizí** |
| šířky | 390, 1280 **i 320 px** |
| vymyšlené funkce | **žádné** (0× newsletter, komentáře, registrace, hvězdičky) |
| kontrast | **445 ze 446** textových prvků projde WCAG AA |
| fokus | jedno globální `:focus-visible` = 2px obrys + odsazení |
| třídy `rt-*` | 101 unikátních, oddělené od obalu dokumentu |

**Ta jedna kontrastní „vada" je 4,48 místo 4,5** na štítku `rt-thumb-note`
uvnitř pruhovaného placeholderu náhledu — tedy na prvku, který v produkci
nahradí skutečný `<img>`. Neputuje do webu.

## Co z toho je nejcennější

**1. Ověřené zdroje jako číslovaný blok, ne poznámka pod čarou.** Každý zdroj
má **domény a datum** (`speedtest.net · Q2 2026`, `fcc.gov · 12/2024`). To
dělá z ověřenosti viditelnou hodnotu — přesně to, co je naše značka.

**2. Blok kanálu je na správném místě.** „REALTECH NA YOUTUBE · 259 000
ZHLÉDNUTÍ" + „Bez hype, s čísly — i v obraze" + červené *Odebírat kanál* stojí
**až za souvisejícími články**, ne bannerem přes začátek. Nepřerušuje čtení
a přesto to nejde minout. A je tam i varianta **„K tomuhle článku video není"**.

**3. Homepage bez prázdného hera.** „Technika a AI do hloubky." + dvě věty
+ **`46 ČLÁNKŮ · 6 TÉMAT · 2024–2026`**. Za pět sekund je jasné, co to je.

**4. Štítky videa nesou text, ne jen ikonu** (`▶ VIDEO · 12:40`) — délka je
vidět předem.

## 🔴 Jedna skutečná vada, kterou má cenu opravit

**Doprovodný text je malý a řádky dlouhé.** V návrhu (bez obalu dokumentu):

- vlastní text článku: **19–20 px, 68–72 znaků na řádek** → to je učebnicově
  správně, tady se nic nemění
- ale **11 odstavců pod 16 px** (`rt-intro-p` 15,5, `rt-channel-p` 15,
  `rt-row-p` 14,5) a **6 odstavců nad 80 znaků na řádek** (až 86)

Pro publikum **mužů 35–64, kteří čtou na mobilu a 16 % kanálu konzumují na
televizi**, je 14,5 px málo. Perex výpisu a popisek v bloku kanálu jsou přitom
místa, kde se rozhoduje o kliknutí.

**Doporučení:** zvednout `rt-row-p` a `rt-channel-p` na **16–17 px** a stáhnout
míru řádku pod **75 znaků**. Je to změna dvou hodnot v CSS, ne přepracování.

⚠️ Poznámka k měření: první průchod ukázal odstavce s 98–101 znaky na řádek —
**byl to komentář ukázkového dokumentu, ne návrh** (4 odstavce mimo `rt-*`).
Rozdělil jsem to a měřil znovu. Dnes už třetí případ, kdy měřidlo chytilo obal
místo obsahu; pravidlo je: **vždy nejdřív ověřit, co se vlastně měří.**

## Kudy do webu

Repo je Astro s vlastním CSS (`src/styles/global.css`), takže obyčejné CSS
se přenáší přímo. Postup, který má smysl:

1. **blok kanálu na stránce článku** — nejmenší kus s největším dopadem na
   úlohu „čtenář → divák", a dnes na webu **není vůbec**
2. **ověřené zdroje jako číslovaný blok** s doménou a datem
3. velikosti doprovodného textu (viz vada výše)
4. teprve pak homepage a stránka tématu

⚠️ **Nejdřív ale odkazy v popiscích videí.** Bez provozu se u kteréhokoli
z těch kroků nepozná, jestli pomohl. 4 z 5 posledních videí odkaz na
realtech.cz nemá.
