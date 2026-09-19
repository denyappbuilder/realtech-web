# Platná pravidla práce na realtech.cz

Konsolidace přímých pokynů Daniela, stav 19. 9. 2026. Platí pro všechny běhy pracující na tomto webu. Novější výslovný pokyn má přednost; historický audit/backlog ani starý handoff sám o sobě není povolením k implementaci, merge nebo deployi. Dokument nezavádí nové pravomoci a nepřenáší sem pravidla jiných projektů.

## Uzavření 19. 9. — nejnovější rozhodnutí

1. Žádný nový agent/běh. Dokončit pouze níže popsané předání; po závěrečném reportu ukončit pracovní běhy a nic dalšího nezačínat.
2. B06: **validátor ani prebuild neměnit, fallback nedělat**. Hotové a otestované malé obrazové varianty a opravu PNG označeného jako WebP publikovat v PR. Pokud nelze dokončit do 15 minut od uzavíracího pokynu, pushnout jako draft PR s konkrétním zbytkem a skončit. Zákaz fallbacku nahrazuje předchozí požadavek na render fallback; validační chyba chybějícího obrázku se neoslabuje.
3. B07 dnes nezahajovat; zůstává v backlogu. Žádné další položky jako výplň čekání.
4. **Nic nemergovat.** Všechny PR čekají na nový výslovný příkaz Daniela. Žádný auto-merge ani produkční deploy touto uzávěrkou.
5. Tato pravidla publikovat samostatným docs-only PR; nemíchat s B06 implementací.
6. Jeden závěrečný report: co je v main, co čeká v PR, co zbývá, výsledek inventury videí a změřené místo pracovních adresářů. Nezaměňovat potvrzené minimum inventury s přesným neověřeným počtem. Ukončení práce neznamená vypnutí gateway/Telegramu ani mazání souborů.

## Rozsah a provoz

- Práce pouze na povel. Žádné crony, automatické reporty, další agenti ani pokračování po STOP bez výslovného pokynu. Uzávěrka výše má přednost před dřívějším režimem dávek.
- Nejdřív přečíst zadání, preflight, příslušný backlog a omezení. Jedna schválená položka, vlastní větev a izolovaný worktree z čerstvě fetchnutého main. Ověřit existujícího vlastníka; žádní souběžní writeři ani duplicitní PR.
- Běžná dávka před uzávěrkou pokračuje bez zbytečných pauz mimo STOP, merge pouze mezi položkami po samostatném schválení a ověření nasazení; další položka vychází z aktuálního main.
- HARD limit celé položky je 45 minut včetně implementace, parent review a publikace, nikoli nový limit pro každý podběh. U původního B06 bylo předání frozen-ready do 25 minut. Při odhadu překročení nebo výrazném překročení odhadu STOP: uvést co zbývá a proč, rozhoduje Daniel. Novější 15minutová uzávěrka dovoluje jen dokončení/publikaci draftu, ne novou implementační smyčku.
- Bez nesouvisejícího hardeningu, redesignu, preventivních refactorů a nových služeb/závislostí mimo schválený scope. Vlastní malý kód místo zbytečného frameworku.
- Bez změn secrets, přihlašování, produkční konfigurace, auth, plateb či DB bez samostatného souhlasu. Secrets nezveřejňovat. Síťové zápisy jen v explicitně schváleném rozsahu; nyní povoleno publikování dvou PR, nikoli IndexNow POST nebo jiná produkční mutace.

## Kvalita, testy a důkazy

- TDD a review přiměřené riziku. Opravu reprodukovat cíleným regression testem; zachovat existující ochrany a validaci obsahu. Změnu očekávání odůvodnit, testy neoslabovat kvůli zelené sadě.
- Implementační PR: skutečné testy, `npm run check` a `npm run build`. Kontrolovat logy/diagnostiku, ne pouze exit wrapperu. Žádné nové warnings; 35 existujících Astro hintů je evidovaná baseline, ne povolení přidávat další ani potlačovat diagnostiku. B17 je samostatný neschválený follow-up.
- Před/po dist: spočítat soubory, přidané/odstraněné/změněné, vysvětlit všechny rozdíly. Výjimky parity uvést konkrétně, žádný falešný PASS. Docs-only PR stačí přiměřená obsahová/diff kontrola a standardní CI; nezakládat kvůli němu nové agenty.
- Browser evidence porovnává stejné stránky, viewporty, DPR a podmínky. Screenshoty a síťové přenosy doložit skutečným během, rozlišit asset bytes, body bytes a transferred bytes. Lokální preview není produkce; jednorázová lokální LCP hodnota nedokazuje zlepšení ani produkční non-regression.
- Čísla, výsledky, SHA a hotovo jen z nástrojů. Chybějící data nejsou nula ani úspěch; odhady a limity výslovně označit.
- Používat existující `docs/audit/CHANGELOG.md` a backlog, nevymýšlet paralelní stojící konvenci. Logy, manifesty, screenshoty a frozen patch/source hash patří do state evidence dané položky; zmrazený precommit není schválení nezávislého review ani nasazení.

## B06 — přesný povolený rozsah

- Ponechat všechny původní asset URL, master obrázky i původní deriváty. Existujících 118 sad WebP 640/960/1280 doplnit o rozumné malé varianty 192/384; žádná změna UI.
- Respektovat 72/96px čtvercové archive sloty, krajinný poměr zdrojů, `object-fit: cover` a DPR. Ověřit skutečný výběr zdroje i ostrost 1x/2x, ne jen nominální šířku souboru.
- Opravit falešný WebP source/preload pro PNG a derivaci JPEG srcset. Kandidáty nabízet jen podle skutečné existence; zachovat kompatibilitu starších sad.
- Regression PNG/JPG, malé varianty, square crop/DPR. V PR uvést výsledky přenosů a všechny dist změny; netvrdit nepodložený LCP zisk.
- Missing truthy image zůstává mimo implementaci. **B06 označit jako částečné, nikoli obě vady opravené.** PR může zachovat srovnání fail-build (včas odhalí chybu, ale blokuje vydání) versus fallback (udrží render, ale maskuje chybu a může měnit layout/metadata), včetně původního doporučení fail-build. To není povolení měnit validátor, prebuild ani přidat fallback.

## PR, merge a produkce

- Před publikací zkontrolovat diff a skutečný stav větve; po push/PR přečíst vzdálený exact HEAD a stav. Ready, draft, nezávisle reviewed a merged jsou různé stavy.
- Samostatná oblast = samostatný PR. Strop 6 nových PR na repo od 5. 9. se nevztahuje na starý historický backlog; limit 300 řádků je vodítko. Výslovně zadané doplňky do 10 % navíc lze odůvodnit a ohlásit, ne použít jako rozšíření scope. Generované assety popsat odděleně.
- Merge jen po výslovném „merge #číslo“, zelených kontrolách přesného SHA a potřebném review: `gh pr merge --merge`. Žádný squash/rebase merge, force/admin bypass ani push přímo do main. Aktuální uzávěrka nepovoluje žádný merge.
- Po autorizovaném merge ověřit Pages a produkci pro přesný merge SHA; merge není důkaz deploymentu. Chyba skutečného produkčního deploymentu = STOP i pro další rozpracované položky, log a konkrétní návrh Danielovi. Žádné tiché opravy přímo na main, automatické další mergování či nepovolený rollback.
- Design změny nejdříve v preview; kvalita a schválený vzhled mají přednost. Bez UI změn nevymýšlet design gate. Nezávislý review nenahrazovat vlastním prohlášením autora.

## Inventura a konec práce

- Inventura videí je read-only. YouTube, X video, GIF, text-only a neurčený typ rozlišovat podle doložených zdrojů, ne podle existence odkazu. Samotný embed neprokazuje vznik článku z videa a samotný VideoObject neprokazuje přehratelnost videa.
- Neověřená metadata/datum/délku nedoplňovat odhadem. Žádný zápis/upload nebo úprava YouTube; redakční publikaci spravuje člověk.
- Velikosti pracovních adresářů změřit, vymezit zahrnuté cesty a neduplikovat symlinkované závislosti. Bez souhlasu pracovní adresáře/artefakty nemazat.
- Po reportu žádné další úlohy, audity, cleanup ani plánované pokračování. Gateway a spojení s Danielem zůstávají dostupné.
