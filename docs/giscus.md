# Komentáře pod články (giscus)

Pod každým článkem (`/clanky/…/`) je sekce **Komentáře** postavená na
[giscus](https://giscus.app) — komentáře žijí jako GitHub Discussions
v repozitáři webu, žádná databáze ani cizí služba s trackingem. Čtenář
komentuje pod svým GitHub účtem, čtení funguje bez přihlášení.

Widget je **podmíněný konfigurací**: bez `PUBLIC_GISCUS_REPO_ID` a
`PUBLIC_GISCUS_CATEGORY_ID` se sekce vůbec nevykreslí (žádný rozbitý
iframe). Dokud tedy nejsou proměnné nastavené, web vypadá jako dřív.

## 1. Zapnout Discussions v repozitáři

GitHub → repozitář `denyappbuilder/realtech-web` → **Settings → General →
Features** → zaškrtnout **Discussions**.

## 2. Nainstalovat aplikaci giscus

Otevřít <https://github.com/apps/giscus> → **Install** → vybrat účet
`denyappbuilder` → **Only select repositories** → `realtech-web`.

Aplikace potřebuje jen právo číst a psát Discussions v tom jednom repozitáři.

## 3. Vytvořit kategorii pro komentáře

V záložce **Discussions** repozitáře → ⚙️ vedle *Categories* → **New category**:

- Název: `Komentáře` (nebo `General` — název je volitelný, ID je to podstatné)
- Formát: **Announcements** — giscus to doporučuje: nové diskuze pak
  zakládá jen giscus (a správci), čtenář nemůže omylem založit vlákno mimo
  článek.

## 4. Získat ID na giscus.app

Na <https://giscus.app> (má i češtinu):

1. do pole *Repozitář* napsat `denyappbuilder/realtech-web` — stránka
   ověří, že repozitář je veřejný, má zapnuté Discussions a nainstalovanou
   aplikaci;
2. *Mapování*: **Discussion title contains page `pathname`** — stejně to
   má natvrdo komponenta (`data-mapping="pathname"`), diskuze se páruje
   podle URL článku, ne podle titulku, který se může měnit;
3. *Kategorie*: vybrat kategorii z kroku 3.

Dole ve vygenerovaném `<script>` jsou hodnoty `data-repo-id` a
`data-category-id`. Jen ty dvě jsou potřeba — ostatní atributy (jazyk `cs`,
reakce, pozice pole nahoře, lazy loading, téma) nastavuje komponenta sama.

## 5. Nastavit proměnné prostředí

| Proměnná                     | Povinná | Hodnota                                                   |
| ---------------------------- | ------- | --------------------------------------------------------- |
| `PUBLIC_GISCUS_REPO_ID`      | ano     | `data-repo-id` z giscus.app (`R_kgDO…`)                   |
| `PUBLIC_GISCUS_CATEGORY_ID`  | ano     | `data-category-id` z giscus.app (`DIC_kwDO…`)             |
| `PUBLIC_GISCUS_REPO`         | ne      | výchozí `denyappbuilder/realtech-web`                     |
| `PUBLIC_GISCUS_CATEGORY`     | ne      | název kategorie z kroku 3 (informativní, rozhoduje ID)    |

Prefix `PUBLIC_` je nutný — Astro jen takové proměnné pustí do klientského
kódu. Hodnoty nejsou tajné (jsou vidět v HTML každého článku), ale do repa
nepatří — jsou to identifikátory konkrétního repozitáře a kategorie.

**Cloudflare Pages:** dashboard → Workers & Pages → `realtech-web` →
**Settings → Environment variables** → přidat proměnné pro **Production**
(a případně i Preview). Proměnné se čtou při buildu, takže po uložení
je potřeba **znovu nasadit** (Deployments → Retry deployment, nebo další
push na `main`).

**Lokálně:** vytvořit `.env` v kořeni projektu (je v `.gitignore`, do repa
nejde):

```bash
PUBLIC_GISCUS_REPO_ID=R_kgDO…
PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDO…
PUBLIC_GISCUS_CATEGORY=Komentáře
```

Bez proměnných dev server jednou varuje do konzole
(`[giscus] Komentáře pod články se nevykreslí…`) a sekci vynechá.

## Co komponenta dělá

- `src/components/Giscus.astro` — kostra sekce (`<section id="komentare">`,
  nadpis `Komentáře`, odkaz na Discussions, únik bez JavaScriptu) a
  kontejner `.giscus` s konfigurací v `data-*`.
- `src/lib/giscus.js` — čtení env, validace, výchozí repo, výběr tématu.
- `src/lib/giscus-klient.js` — vloží `https://giscus.app/client.js`
  s `data-lang="cs"`, `data-mapping="pathname"`, `data-reactions-enabled="1"`,
  `data-input-position="top"`, `data-loading="lazy"` a tématem podle webu.
- Téma: ruční přepínač webu (`<html data-theme>`) má přednost a mapuje se na
  giscus `light`/`dark`; bez přepnutí `preferred_color_scheme` (sleduje OS).
  Přepnutí za běhu pošle widgetu `setConfig` přes `postMessage`.
- CSP (`public/_headers`) povoluje `https://giscus.app` v `script-src`
  (client.js), `style-src` (client.js vkládá `default.css`) a `frame-src`
  (iframe widgetu). Nic dalšího widget v rodičovské stránce nepotřebuje —
  GitHub API i avatary tahá uvnitř svého iframu.

## Ověření

Po nasazení otevřít libovolný článek: pod autorským boxem je sekce
*Komentáře* s widgetem. Reakce přidávat lze i bez komentáře. První komentář
pod článkem založí v Discussions vlákno s titulkem `clanky/<slug>/`.

Testy: `npm test` (soubor `scripts/test-giscus.mjs`) hlídá, že sekce je
v HTML jen s kompletní konfigurací a že CSP giscus pouští.
