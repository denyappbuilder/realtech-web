// B18 (19. 9. 2026): IndexNow oznamuje jen URL, které se od předchozího
// ověřeného produkčního nasazení mohly změnit — ne celou sitemapu (142 URL)
// při každém merge včetně docs. Viz docs/audit/BACKLOG.md „Dodatek B18“.
//
// Baseline = head_sha posledního ÚSPĚŠNÉHO běhu tohoto workflow na main
// (ten už jednou ověřil marker na produkci a odeslal ping). Žádný nový stav,
// žádný secret. Bez ověřené baseline → STOP, žádný ping (ne celý web).
//
// Mapování zdroj → URL kopíruje existující routing (src/pages), nic nového.
// Výsledek se vždy protne s ověřenou produkční sitemapou, takže se nikdy
// nepošle URL, která na produkci není (smazané/nepublikované zdroje).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ORIGIN } from './indexnow.mjs';
import { SHA } from './indexnow-marker.mjs';
import { slugify } from '../src/lib/slugify.js';

const ensure = (value, message) => { if (!value) throw new Error(message); };
const SLUG = /^[a-z0-9-]+$/;
const CLANEK = /^src\/content\/clanky\/([a-z0-9-]+)\.md$/;
const STRANKA = /^src\/pages\/([a-z0-9-]+)\.astro$/;
const STATICKE = new Map([
  ['src/pages/index.astro', ['/']],
  ['src/pages/clanky/index.astro', ['/clanky/']],
  ['src/pages/temata/index.astro', ['/temata/']],
  ['src/data/videos.json', ['/']],
]);
// Šablony výpisů: změna sama o sobě URL negeneruje (jen šablona) — B18:
// „Změny pouze v šablonách/komponentách ⇒ ŽÁDNÝ ping“.
const SABLONY = new Set(['src/pages/clanky/[...id].astro', 'src/pages/clanky/strana/[page].astro', 'src/pages/temata/[slug].astro', 'src/pages/temata/[slug]/strana/[page].astro', 'src/pages/404.astro', 'src/pages/vitej.astro']);

/**
 * Předchozí produkční SHA z API GitHubu: poslední úspěšný běh workflow
 * indexnow-after-deploy na main, jiný než aktuální. Vrací null, když žádný
 * není (první běh po zavedení) — volající pak STOPne bez pingu.
 * @param {(suffix: string) => Promise<any>} api
 * @param {string} sha aktuální SHA
 * @param {string} workflowFile
 */
export async function predchoziProdukcniSha(api, sha, workflowFile = 'indexnow-after-deploy.yml') {
  const data = await api(`/actions/workflows/${workflowFile}/runs?branch=main&status=success&event=workflow_run&per_page=10`);
  ensure(Array.isArray(data?.workflow_runs), 'Invalid workflow runs');
  const kandidat = data.workflow_runs.find(r => r?.head_branch === 'main' && r?.status === 'completed' && r?.conclusion === 'success' && r?.event === 'workflow_run' && r?.path === `.github/workflows/${workflowFile}` && SHA.test(r?.head_sha ?? '') && r.head_sha !== sha);
  return kandidat?.head_sha ?? null;
}

/**
 * Změněné soubory mezi baseline a aktuálním SHA přes git v checkoutu.
 * Baseline musí být předkem aktuálního SHA (jinak STOP — nehádat).
 * @param {string} predchozi
 * @param {string} sha
 * @param {string} cwd
 * @param {(args: string[]) => string} [gitImpl]
 */
export function zmeneneSoubory(predchozi, sha, cwd, gitImpl) {
  ensure(SHA.test(predchozi) && SHA.test(sha), 'Invalid SHA for diff');
  const git = gitImpl ?? (args => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  try {
    git(['merge-base', '--is-ancestor', predchozi, sha]);
  } catch {
    throw new Error('Baseline is not an ancestor of the deployed SHA');
  }
  const out = git(['diff', '--name-only', '--diff-filter=ACDMR', `${predchozi}..${sha}`]);
  return out.split('\n').map(s => s.trim()).filter(Boolean);
}

/**
 * Kategorie článku z frontmatteru (jen řádek `category: "..."`). Když soubor
 * v checkoutu není (smazaný článek), vrací null — URL tématu se pak neodvodí,
 * ale výpisy /, /clanky/ ano.
 * @param {string} root
 * @param {string} slug
 */
export function kategorieClanku(root, slug) {
  const file = path.join(root, 'src/content/clanky', `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/^category:\s*["']?([^"'\n]+?)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

/**
 * Z názvů změněných souborů odvodí kandidátní cesty. Čistá funkce, kategorii
 * dodává callback (kvůli testům).
 * @param {string[]} soubory
 * @param {(slug: string) => string | null} kategorie
 * @returns {string[]} cesty (bez originu), unikátní, seřazené
 */
export function cestyZeSouboru(soubory, kategorie) {
  const cesty = new Set();
  for (const soubor of soubory) {
    const clanek = soubor.match(CLANEK);
    // Review: soubor pod src/content/clanky/, který regex nepobere (velké
    // písmeno, podtržítko, .mdx, podadresář), nesmí potichu vypadnout — STOP.
    ensure(!soubor.startsWith('src/content/clanky/') || clanek, `Unmapped article source: ${soubor}`);
    if (clanek) {
      const slug = clanek[1];
      ensure(SLUG.test(slug), 'Invalid article slug');
      cesty.add(`/clanky/${slug}/`);
      cesty.add('/');
      cesty.add('/clanky/');
      const kat = kategorie(slug);
      if (kat) cesty.add(`/temata/${slugify(kat)}/`);
      continue;
    }
    if (STATICKE.has(soubor)) { for (const c of STATICKE.get(soubor)) cesty.add(c); continue; }
    if (SABLONY.has(soubor)) continue;
    const stranka = soubor.match(STRANKA);
    if (stranka && stranka[1] !== 'index') { cesty.add(`/${stranka[1]}/`); continue; }
    // šablony, komponenty, CSS, skripty, workflows, docs, obrázky → nic
  }
  return [...cesty].sort();
}

/**
 * Průnik kandidátů s ověřenou produkční sitemapou. Jen URL, které produkce
 * skutečně publikuje; pořadí podle sitemapy.
 * @param {string[]} cesty
 * @param {string[]} sitemapUrls absolutní URL ze sitemap-0.xml
 */
export function vyberUrl(cesty, sitemapUrls) {
  const chtene = new Set(cesty.map(c => `${ORIGIN}${c}`));
  return sitemapUrls.filter(u => chtene.has(u));
}
