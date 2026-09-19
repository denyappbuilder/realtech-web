#!/usr/bin/env node
// B09 experiment (19. 9. 2026): kritické CSS inline, zbytek stylesheetu
// asynchronně. Spouští se po `astro build` nad dist/ — mění jen HTML,
// nesahá na zdroje ani na Base.css samotné.
//
// Proč: Lighthouse mobil (15 běhů, 5 článků, produkce) — jediný
// render-blocking zdroj je /_astro/Base.*.css (75 KB raw / 13,7 KB gz),
// wastedMs 150–442 v každém běhu; LCP element je vždy hero obrázek a jeho
// Render Delay čeká na CSS. Fonty a preloady se neměňí (Daniel: nechat).
//
// Beasties (dříve Critters) vezme reálný stylesheet, ponechá inline jen
// pravidla, která stránka nad ohybem skutečně používá, a původní <link>
// přepne na async načtení (media="print" + onload swap, plus <noscript>).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Beasties from 'beasties';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

export function vytvorBeasties(dist = DIST) {
  return new Beasties({
    path: dist,
    publicPath: '/',
    // Původní stylesheet zůstává, jen se načte asynchronně (žádný FOUC
    // pro obsah nad ohybem — ten má styly inline).
    preload: 'swap',
    noscriptFallback: true,
    inlineFonts: false,
    preloadFonts: false,
    // Práh: menší stylesheety inline celé (nemáme žádné).
    inlineThreshold: 0,
    // Selektory, které stránka potřebuje i když je JS teprve přepne
    // (dark mode přes data-theme, stav search/toggle) — jinak by první
    // vykreslení tmavého webu skočilo ze světlé.
    keyframes: 'critical',
    reduceInlineStyles: false,
    logLevel: 'silent',
    allowRules: [/data-theme/, /prefers-color-scheme/],
  });
}

export async function zpracujHtml(html, beasties) {
  return beasties.process(html);
}

async function* htmlSoubory(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlSoubory(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const beasties = vytvorBeasties();
  let n = 0;
  let inlineBytes = 0;
  for await (const file of htmlSoubory(DIST)) {
    const html = fs.readFileSync(file, 'utf8');
    const out = await zpracujHtml(html, beasties);
    fs.writeFileSync(file, out);
    inlineBytes += out.length - html.length;
    n += 1;
  }
  console.log(`[critical-css] ${n} HTML souborů, inline CSS celkem +${inlineBytes} B (průměr ${Math.round(inlineBytes / Math.max(n, 1))} B/stránka)`);
}
