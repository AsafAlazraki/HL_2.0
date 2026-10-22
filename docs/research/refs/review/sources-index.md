# Review — sources index

Every source driven for the review sweep on 2026-10-22, in headless Chromium at 1440 × 900 (`en-AU`), with `tools/research/capture.ts review/live`. Consent banners were answered with the most privacy-preserving control. **Nothing was signed in, nothing personal was typed, and no bot protection was fought.**

The frames themselves are gitignored. The durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\review\live\`, and `live/sources.json` records the date, final URL and title of each.

**42 sources, 40 frames, 2 failed.**
- **31 frames were opened**: the 29 below without a mark, plus the two earlier-sweep frames in the last table.
- **NOT OPENED** marks a row kept for the ledger. Such a row is cited nowhere in `notes.md`.
- **DEAD** marks a frame whose title shows it holds nothing.

## `live/`

| id | URL | one line |
|---|---|---|
| `xero-reconcile-mkt` | xero.com/au/accounting-software/reconcile-bank-transactions/ | JAX hero: each statement line carries a figure and a method tag (Rule · Match · Manual · Memory · Prediction), with a tip giving the reason for one |
| `xero-reconcile-mkt-2` | same, scrolled | three ticked promises; "Just review what needs your attention" |
| `xero-reconcile-help` | central.xero.com/s/article/Reconcile-your-bank-account | the bank widget: statement balance against balance in Xero, "Balance difference 7,112.95", and **Reconcile 20 items** as the button |
| `xero-reconcile-help-3` | same, scrolled 2,300 | the reconcile pair: statement line left, suggested match right in green, **OK** between them, "1 other possible match found" |
| `xero-reconcile-help-4` | same, scrolled 4,200 | "What's next?": the two balances should be the same, and if not, "find out why there's a difference" |
| `xero-find-recode` | central.xero.com/s/article/Find-and-recode-transactions | **DEAD**, NOT OPENED: redirected to the Xero login |
| `qbo-reconcile` | quickbooks.intuit.com/au/accounting/bank-reconciliation/ | **FAILED**: `ERR_HTTP2_PROTOCOL_ERROR`, no frame |
| `qbo-for-review` | quickbooks.intuit.com/learn-support/en-au/help-article/bank-transactions/… | **FAILED**: `ERR_HTTP2_PROTOCOL_ERROR`, no frame |
| `sonarcloud-explore` | sonarcloud.io/explore/projects | public projects as cards: counts per quality with A–E grades, and **Passed** beside 269 reliability issues |
| `sonarcloud-monica-issues` | sonarcloud.io/project/issues?id=monica&… (reached from the explorer) | **Top issues 59 / All issues 438**, "59 issues 4h 52min effort", sentence titles, "5min effort · 3 years ago" per card, three identical cards |
| `sonarcloud-issues` | sonarcloud.io/project/issues?…id=apache_commons-lang | **DEAD**, NOT OPENED: 404 |
| `sonar-next-issues` | next.sonarqube.com/sonarqube/project/issues?id=sonarqube | **DEAD**, NOT OPENED: redirected to Sonar's marketing |
| `snyk-fix` | docs.snyk.io/…/fix-your-vulnerabilities | issues grouped by the dependency that fixes them; **Fix these vulnerabilities**; a facet reading "Fixable 55 · Partially fixable 15 · No supported fix 36"; a risk score at the right |
| `sentry-states-triage` | docs.sentry.io/product/issues/states-triage/ | the status table: New · Ongoing · Escalating · **Regressed** ("A resolved issue that's come up again") · Archived · Resolved |
| `sentry-states-triage-2` | same, scrolled | Archive "until the issue gets worse", forever, for a set period, or until N events; "A plain Resolve treats any later event as a regression" |
| `sentry-grouping` | docs.sentry.io/concepts/data-management/event-grouping/ | NOT OPENED |
| `datadog-manage-monitors` | docs.datadoghq.com/monitors/manage/ | bulk Mute "for a predefined duration (such as one hour, one day, or forever)", Unmute, Resolve; status pills on the monitor list |
| `datadog-downtimes` | docs.datadoghq.com/monitors/downtimes/ | NOT OPENED |
| `gh-code-scanning-dismiss` | docs.github.com/…/resolve-alerts | text: assign up to 25 alerts to Copilot, one pull request per assignment, and a section on re-opening dismissed alerts |
| `gh-code-scanning-assess` | docs.github.com/…/assess-alerts | NOT OPENED |
| `gh-dependabot-alerts` | docs.github.com/…/view-dependabot-alerts | text: alerts sorted by Most important; a strip reading "47 Open · 5 Closed" |
| `gsc-page-indexing` | support.google.com/webmasters/answer/7440203 | the summary page's tables; "What *not* to look for: 100% coverage" |
| `gsc-validate-fix` | same, #validation | once fixed, "the issue count goes to zero and drops to the bottom of the table"; validate, or let the next crawl recount |
| `ahrefs-site-audit` | ahrefs.com/site-audit | issue table with Crawled · Change · Added · New · Removed; errors, warnings and notices as bars; a "96 Excellent" gauge; "Watch demo" laid over the table |
| `hemingway-editor` | hemingwayapp.com | the text painted by kind; the rail reads "1 of 13 sentences is very hard to read", one eye per kind, "Grade 8 Good.", and an Upgrade card in the rail |
| `hemingway-clean` | same, emptied | every kind still in its alarm colour at zero: "0 of 0 sentences…", "Grade 0 Good.", "0 weakeners. Nice work." |
| `vscode-problems` | code.visualstudio.com/docs/editing/editingevolved#_errors-warnings | counts in the status bar, Ctrl+Shift+M for PROBLEMS, squiggles inline, and red ticks on the overview ruler |
| `vscode-quick-fix` | code.visualstudio.com/docs/editing/refactoring#_code-actions… | Code Actions as quick fixes; `source.fixAll` run on save |
| `apple-iphone-storage` | support.apple.com/en-au/108429 | iPhone Storage: one bar of the whole, then a Recommendations card (Offload Unused Apps · **Enable** · "Save up to 145.2 MB … Your documents & data will be saved") |
| `apple-mac-storage` | support.apple.com/en-au/guide/mac-help/sysp4ee93ca4/mac | miss: a text table of recommendations, no shape |
| `languagetool-example` | languagetool.org (Insert Example Text) | the offending word as the title with its kind ("error's — Extraneous apostrophe"); counts 15 and 1 |
| `languagetool-demo` | languagetool.org | miss: an empty checker, "Ready to start?" |
| `onepassword-watchtower-help` | support.1password.com/watchtower/ | miss: the consent banner did not take "Reject Non-Essential", and it covers the Watchtower shot |
| `deque-axe-devtools` | deque.com/axe/devtools/ | miss: marketing columns, no product UI |
| `grammarly-home` | grammarly.com | miss: a logo wall |
| `semrush-site-audit` | semrush.com/siteaudit/ | miss: a three-step how-to |
| `shopify-mc-product-issues` | help.shopify.com/…/product-issues (redirected to …/marketplaces/google) | miss: a link list |
| `wave-report` | wave.webaim.org/report#/https://www.w3.org/WAI/demos/bad/before/home.html | **DEAD**, NOT OPENED: Cloudflare "Just a moment…", not fought |
| `wave-report-details` | same | **DEAD**, NOT OPENED: the same challenge |
| `qlty-home` | qlty.sh | NOT OPENED |
| `ramp-missing-receipts` | ramp.com/receipts | NOT OPENED |
| `eslint-play` | eslint.org/play/ | NOT OPENED |

## Earlier sweeps' frames, opened and cited (neither is a primary on any board)

| frame | URL | one line |
|---|---|---|
| `quotes/live/sentry-issues.png` | docs.sentry.io/product/issues/ | the Feed: issue title over its message, Last seen, Age, a trend sparkline with its state word, Events, Users |
| `cascade/software3/excel-detect-errors.png` | support.microsoft.com/en-au/office/detect-errors-in-formulas-… | miss: a text table of formula mistakes |
