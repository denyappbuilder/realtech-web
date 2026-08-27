# REALTECH CZ — web

Statický web postavený na [Astro](https://astro.build). Články jsou Markdown soubory, žádná databáze, žádná administrace.

## Rychlý start (lokálně na MacBooku)

```bash
npm install
npm run dev
```

Web poběží na `http://localhost:4321`. Změny v souborech se projeví okamžitě.

## Nasazení na Cloudflare Pages (zdarma)

1. **GitHub:** Vytvoř nový repozitář (klidně privátní) a pushni tam tento projekt:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:TVUJ-UCET/realtech-web.git
   git push -u origin main
   ```

2. **Cloudflare:** Na [dash.cloudflare.com](https://dash.cloudflare.com) →
   **Workers & Pages → Create → Pages → Connect to Git** → vyber repozitář.
   - Framework preset: **Astro** (detekuje se automaticky)
   - Build command: `npm run build`
   - Output directory: `dist`

3. Hotovo. Web běží na `https://NAZEV.pages.dev`. Každý push na `main` = automatický deploy do minuty.

4. **Vlastní doména (volitelné):** V Cloudflare Pages → Custom domains → přidej `realtech.cz` (doménu koupíš u registrátora, ~200–300 Kč/rok).

5. Po nasazení uprav `site` v `astro.config.mjs` na finální adresu (kvůli RSS a OG tagům).

## Jak publikovat článek

1. Vytvoř soubor `src/content/clanky/nazev-clanku.md`
2. Vyplň hlavičku (frontmatter):

   ```markdown
   ---
   title: "Titulek článku"
   description: "Perex — jedna dvě věty, zobrazí se na kartě a v OG tazích."
   category: "AI Report"        # AI Report | AI Agenti | Drony | Vesmír | Hardware | Mobily | Sítě
   date: "2026-07-02"           # uvozovky — YAML jinak udělá Date a schéma ho odmítne
   video: "https://youtu.be/XXXX"   # volitelné — u článku z videa
   videoLength: "14:32"             # volitelné
   zprava: true                     # volitelné — krátká zpráva, typicky bez video
   image: "/images/clanky/nazev-clanku.jpg"  # volitelné
   audio:                           # volitelné
     url: "https://audio.realtech.cz/nazev-clanku.mp3"
     duration: 143                  # sekundy, ISO-8601 nebo MM:SS
     transcript: "..."              # volitelné
   featured: true                   # volitelné — úvodka ho ignoruje; hero = nejnovější podle date
   draft: true                      # volitelné — draft se nepublikuje
   ---

   Text článku v Markdownu...
   ```

   Schéma v `src/content.config.ts` je `.strict()`. Extra klíče (třeba `readingTime`) shodí build. Doba čtení se počítá z těla článku.

3. Commit + push. Za minutu je článek živý.

## Publikace přes agenta (Kepler)

Doporučený workflow: agent **vytváří pull requesty, ne přímé pushe na main**.
Jeden článek = jeden PR. Merge dělá Daniel.
Prompt pro konverzi scénáře na článek je v `KEPLER-PROMPT.md`.

1. Agent dostane scénář videa + metadata (link, délka, kategorie)
2. Vygeneruje Markdown článek podle promptu
3. Vytvoří branch + PR (`gh pr create`)
4. Ty PR zkontroluješ a mergneš → automatický deploy

Pro git přístup agenta použij **deploy key nebo fine-grained token omezený jen na tento repozitář**.

## Struktura projektu

```
src/
  content/clanky/     ← články (Markdown) — TADY se publikuje
  content.config.ts   ← schéma frontmatteru
  layouts/Base.astro  ← hlavička, patička, fonty
  components/         ← karta článku
  pages/
    index.astro       ← homepage (hero + grid)
    clanky/index.astro       ← výpis všech článků
    clanky/[...id].astro     ← detail článku (YouTube embed, když je `video`)
    temata/[slug].astro      ← kategorie
    rss.xml.js        ← RSS feed
  styles/global.css   ← veškerý design
```

Newsletter ve footeru posílá na Kit (`https://app.kit.com/forms/9640609/subscriptions`). Náhledy článků berou `image` ve frontmatteru.