# Compatible dependency follow-up — 12 September 2026

Stacked on the search/audit PR #443. No Astro major upgrade, overrides,
application/content/font changes, deploy command, or existing PR edits.

## Changes

Targeted `npm update js-yaml sharp fast-xml-parser nanoid postcss smol-toml svgo`
after changing the exact js-yaml pin from 4.3.0 to 4.3.2:

- js-yaml 4.3.0 → 4.3.2 (4.x security backports, no YAML 5 migration)
- sharp 0.35.3 → 0.35.4, matching platform binaries/libvips updated
- fast-xml-parser 5.9.3 → 5.11.1
- nanoid 3.3.15 → 3.3.19
- postcss 8.5.16 → 8.5.28
- smol-toml 1.7.0 → 1.8.0
- svgo 4.0.1 → 4.1.0

Associated dependencies follow upstream package requirements; in particular
SVGO/XML parser bring transitive major changes (css-select/css-what/entities),
not a deliberate top-level framework migration. Lockfile diff exceeds 300 lines
because sharp records binaries for all platforms; changes are one scoped
security dependency batch. Astro remains **5.18.2**; fonts and compiler unchanged.

## Before / after and residual risk

`npm audit --json`: **9 → 3 affected package groups** (not advisory count):
1 critical + 7 high + 1 low → **1 critical + 1 high + 1 low**.
Removed groups: fast-xml-parser, js-yaml, nanoid, postcss, smol-toml, svgo.
Root sharp is patched; Astro's nested sharp remains vulnerable.
Remaining: Astro (critical), nested `astro/node_modules/sharp` (high), esbuild
(low). Registry recommends a major Astro update for these; forcing a nested
sharp override is deliberately avoided. This is **not a clean security audit**.

Production is static HTML/assets plus host-redirect middleware. SSR, server
island, dev-server and runtime optimizer advisories are not demonstrated as
remotely reachable on this deployment. Build-time parsers/images and generated
markup remain relevant trust boundaries; static hosting does not prove immunity.
No exploit payloads were sent to production and no unsafe parser stress was run.

## Verification and existing work

- Fresh `npm ci`, `npm test`, `npm run build` all exit 0.
- Tests: **908 total, 902 pass, 0 fail, 6 existing TODO**.
- Build: **132 pages**. No image derivative/content changes in git after build.
- Audit exits 1 honestly for the three remaining groups.
- Existing Dependabot PRs #395/#396/#397/#398/#400/#409/#438 overlap this batch.
  They remain untouched/open; Daniel may prefer them instead. Do not merge both
  blindly. This PR provides one current-base tested compatible batch, not an
  instruction to close earlier work. #401/#429 Astro upgrades remain separate.
- Local receipts: `/Users/realtech/realtech-web-audit-dependencies-after.json`,
  `realtech-web-audit-deps-tests.log`, `realtech-web-audit-deps-build.log`.
