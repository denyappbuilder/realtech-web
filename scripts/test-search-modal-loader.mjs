// Načte klientský <script> z src/components/SearchModal.astro a spustí ho
// v izolovaném vm kontextu s minimálním DOM.
//
// Proč takhle: modal je 139 řádků a NIC z něj se dosud netestovalo, protože
// `.astro` komponenta se v Node nedá importovat a jsdom je nová závislost
// (zakázaná). Stejnou dvojici `typescript` + `node:vm` už v repu používá
// scripts/validate-content.mjs, když si tahá schéma z content.config.ts —
// tenhle loader je jen její obdoba pro klientský skript.
//
// Testuje se tím SKUTEČNÝ kód komponenty, ne jeho kopie: když se
// <script> v .astro změní, testy se změnou spadnou.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KOMPONENTA = path.join(ROOT, 'src/components/SearchModal.astro');

/** Vytáhne tělo jediného `<script>` bloku komponenty. */
export function klientskySkript(zdroj = fs.readFileSync(KOMPONENTA, 'utf8')) {
  const bloky = [...zdroj.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  if (bloky.length !== 1) {
    throw new Error(
      `SearchModal.astro má ${bloky.length} inline <script> bloků, čekal se právě 1 — ` +
        'uprav loader, jinak by testy tiše testovaly jen část komponenty.',
    );
  }
  return bloky[0][1];
}

function prvek(extra = {}) {
  const posluchaci = new Map();
  return {
    posluchaci,
    addEventListener(typ, fn) {
      posluchaci.set(typ, [...(posluchaci.get(typ) ?? []), fn]);
    },
    dispatch(typ, udalost = {}) {
      for (const fn of posluchaci.get(typ) ?? []) fn(udalost);
    },
    ...extra,
  };
}

/**
 * Spustí klientský skript modalu nad falešným DOM a vrátí jeho vnitřek.
 *
 * @param {{ hledatelne?: unknown[], fetch?: typeof globalThis.fetch }} [nastaveni]
 */
export function nactiModal({ hledatelne = null, fetch: fetchImpl } = {}) {
  const overlay = prvek({ hidden: true });
  const input = prvek({ value: '', fokusovan: 0, focus() { this.fokusovan++; } });
  const results = prvek({ innerHTML: '', querySelector: () => null });
  const dokument = prvek({
    body: { style: {} },
    getElementById: (id) =>
      ({ 'search-overlay': overlay, 'search-q': input, 'search-results': results })[id] ?? null,
    querySelectorAll: () => [],
  });

  const sandbox = {
    document: dokument,
    location: { href: '' },
    console,
    fetch: fetchImpl ?? (async () => {
      throw new Error('fetch se v tomto testu nesmí volat');
    }),
  };
  sandbox.globalThis = sandbox;

  const { outputText } = ts.transpileModule(klientskySkript(), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: KOMPONENTA,
  });

  // Most ven ze scope skriptu — jinak jsou `search`, `render` i `index`
  // uzavřené a nešly by z testu ani zavolat, ani nastavit.
  const most = `
    globalThis.__modal = {
      norm, search, render, loadIndex, open, close,
      nastavIndex: (v) => { index = v; },
      dejIndex: () => index,
      nastavActive: (v) => { active = v; },
      dejActive: () => active,
      nastavCurrent: (v) => { current = v; },
      dejCurrent: () => current,
    };
  `;

  vm.runInNewContext(outputText + most, sandbox, { filename: KOMPONENTA });

  const modal = sandbox.__modal;
  if (hledatelne !== null) modal.nastavIndex(hledatelne);
  return { ...modal, overlay, input, results, dokument, sandbox };
}
