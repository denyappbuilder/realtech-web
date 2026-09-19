# Reading and discovery, round 4

Local candidate based on `147ef841e898010abf1e51026f6b31d14e537005`. Production approval and independent final review remain separate gates.

## Changes and preserved contracts

- **Search → complete archive:** eight ranked previews remain, but the status reports the real number of matches and a normal link opens all results for the encoded query. Modal, client archive and edge helper use all normalized query words across the same index fields. The archive retains chronological ordering, while the modal retains relevance ordering. Existing fetch validation, retry and pending-query replay remain.
- **Keyboard and small screens:** the all-results action is outside the listbox; empty-state hidden links are excluded from focus wrapping. Explicit `tabindex=-1` on the scrollable listbox prevents Chrome from adding an implicit Tab stop. Arrow selection runs only from the combobox. The flex dialog has a viewport-bounded result scroller, keeping the action visible in short landscape windows.
- **Archive history:** one draft history entry per editing session; debounced keystrokes replace that draft. Submit commits it, while deliberate category/reset changes push distinct states. Popstate restores query, category and results without recording another entry, cancelling pending debounce and invalidating stale async renders. Existing edge-first hydration/reset behavior remains.
- **Mobile reading:** the native contents disclosure now sits at the text entry and remains reachable while reading. The existing heading focus transfer, modified-click behavior and section highlighting survive. Sticky positioning is disabled in short landscape windows and without JavaScript, where an open native disclosure would otherwise cover its destination. Desktop aside and typography are unchanged.
- **Progress:** the bar measures the authored article body, reaches 100% when its end is visible, and excludes media, recommendations and newsletter.
- **Complete excerpts without editorial rewriting:** `articleLead` only intervenes when a description is provably an exact body prefix ending inside a word. It uses the existing Czech sentence-aware shortening helper. The latest Cowork story now ends with the complete existing first sentence instead of `Claude sám rozh`. The same derived display value serves article lead, home hero, cards and search-index/edge cards. Original Markdown, metadata and factual claims are unchanged.
- **Defense in depth:** index slugs must match the existing published lowercase ASCII/hyphen format; malformed responses are retryable. All HTML-interpolated result fields, including date and slug, are escaped. This hardens malformed first-party index handling, not a claim of an exploitable production incident.
- **Approved security-only integration:** the parent-reviewed devalue 5.9.2 lockfile commit was cherry-picked. No font, design-token, content-image, infrastructure or other dependency changes.

## Validation

`npm test`, `npm run build`, `npm audit --json`, plus real Chromium reading/search/history regressions. Browser tooling is deliberately outside package dependencies. Evidence lives under `/Users/realtech/.hermes/state/realtech-web-round4/implementation/` (RED logs, final results and screenshots).

Two bounded visual batches: incumbent desktop/mobile light/dark, then the completed candidate. Final batch covers home, archive, latest article, article body/contents, topics, topic, about and populated search. Automated axe results are not a global WCAG certification.

The mechanical design detector reports pre-existing font-ramp advisories, an `<img src>` in a code comment, and incumbent editorial em dashes. No font-size rules were added. The existing stale Impeccable sidecar is not silently regenerated; `document` is the separate maintenance workflow if requested.

## Final external gates

Parent owns independent review, source commit, draft PR, exact-SHA CI and immutable Pages preview verification. In particular, recheck cold-edge JS/no-JS multiword parity and history races on the actual Pages runtime, not Astro's static preview. Do not merge or publish from this handoff.
