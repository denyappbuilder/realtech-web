---
title: "Gemini teď stříhá video přes chat. A obrázky generuje za 4 sekundy"
description: "Google pustil do světa dva nové modely: Nano Banana 2 Lite na bleskové generování obrázků a Gemini Omni Flash na tvorbu i úpravy videa přirozeným jazykem. Oba už jedou v aplikaci Gemini."
category: "AI Report"
date: 2026-07-03
zprava: true
image: "/images/clanky/gemini-omni-flash-nano-banana-2-lite.jpg"
---

Google 30. června vypustil dvě věci, které stojí za pozornost, protože si je můžete rovnou vyzkoušet — žádný „výzkumný preview pro vyvolené".

## Nano Banana 2 Lite: obrázek za 4 sekundy

První novinka je **Nano Banana 2 Lite** — nejrychlejší a nejlevnější obrázkový model z rodiny Nano Banana. Text-to-image výstup dá za **4 sekundy** a vývojáře stojí **0,034 dolaru za obrázek** v 1K rozlišení, tedy zhruba 70 haléřů.

Důležitější pro normální lidi: model se od 30. června rozjíždí přímo v **aplikaci Gemini, Google Photos, [NotebookLM](/clanky/notebooklm-gemini-notebook/), AI Mode ve vyhledávání** a dalších službách Googlu. Takže když si příště necháte v Gemini vygenerovat obrázek a půjde to znatelně rychleji, tohle je důvod.

Google zároveň říká jasně: starou první Nano Banana (Gemini 2.5 Flash Image) považuje za legacy a doporučuje přejít — Lite je prý rychlejší, levnější i kvalitnější zároveň.

## Omni Flash: řekněte videu, co má změnit

Druhá novinka je zajímavější. **Gemini Omni Flash** je model na generování a hlavně **úpravy videa konverzací** — nahrajete video nebo fotku, napíšete co změnit, a model to přepracuje. Umí kombinovat text, obrázky i video jako vstup a drží scénu konzistentní.

Dostupný je v **aplikaci Gemini a Google Flow**, pro vývojáře nově v Gemini API a AI Studiu (public preview). Cena: **0,10 dolaru za sekundu videa** — stejně jako Veo 3.1 Fast.

Limity zatím existují: videa maximálně **10 sekund** (delší Google slibuje brzy), konzistence postav při střihu scén občas ujíždí a API zatím nebere audio reference. Takže žádný celovečerák, ale na rychlé efekty, sociální klipy a experimenty to stačí.

## Proč to dává smysl dohromady

Google ty dva modely otevřeně staví jako dvojici: Lite bleskově vygeneruje obrázek, Omni Flash ho rozanimuje do videa. Přes Interactions API jdou řetězit až tři úpravy za sebou se zachovaným kontextem. Jinými slovy — pipeline „nápad → obrázek → video" na pár promptů, za ceny, které si může dovolit i malý tvůrce.

Jestli tvoříte obsah, tohle si vyzkoušejte. Je to zadarmo přímo v aplikaci Gemini a člověk aspoň uvidí, kam se AI video posunulo od dob, kdy každý druhý klip měl šest prstů.

## Zdroj

- [Google: Start building with Nano Banana 2 Lite and Gemini Omni Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/)
