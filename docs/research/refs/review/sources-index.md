# Review — sources index

Every frame behind `notes.md`.

- **How they were captured.** Both passes were driven in headless Chromium at 1440 × 900 (`en-AU`) with `tools/research/capture.ts`.
- **What was not done.** Consent banners got the most privacy-preserving control. Nothing was signed in, nothing personal was typed, and no bot protection was fought.
- **Where they live.** The frames are gitignored. Durable copies are in `C:\Users\Asaf\dev\hl-refs\hl2\review\{live,live2}\`, and each folder's `sources.json` records the date, final URL and title.

**Second pass (2026-10-28), `live2/`: 45 sources, 43 frames, 2 failed.**
- 28 frames were opened, and every row without a mark is one of them.
- Where a doc page's prose hid its product shot, the shot was captured from its image URL, and the page it came from is given in brackets.
- **NOT OPENED** rows are kept for the ledger only and cited nowhere.

**Also opened this pass:** seven `live/` frames, marked RE-OPENED below, and the built shot `docs/directions/review/built/m3-2-1440.png`. Nothing unopened is cited.

## `live2/` (2026-10-28)

| id | URL | one line |
|---|---|---|
| `hubspot-dq` | knowledge.hubspot.com/data-management/use-data-quality-tools | miss: article prose and a video poster |
| `hubspot-dq-2` | knowledge.hubspot.com/data-management/use-data-quality-tools | miss: an anomaly-settings modal over a blurred page |
| `gads-recs` | support.google.com/google-ads/answer/3448398 | Google Ads recommendations: apply, dismiss, uplift · NOT OPENED |
| `gads-optscore` | support.google.com/google-ads/answer/9061546 | miss, text only: "Each recommendation shows how much your optimisation score will be impacted" |
| `figma-check` | help.figma.com/hc/en-us/articles/39592284074263-Check-designs-in-Figma | text only: the article contents read Review suggestions · Preview changes · Apply changes · Undo changes · Re-run |
| `figma-check-2` | help.figma.com/hc/en-us/articles/39592284074263-Check-designs-in-Figma | Figma Check designs, further · NOT OPENED |
| `webflow-audit` | webflow.com/updates/find-and-fix-accessibility-issues-with-new-audit-panel | a small hero shot of the Audit panel beside the canvas; a consent bar left over the page |
| `webflow-audit-help` | help.webflow.com/hc/en-us/articles/33961313088531-Intro-to-the-Audit-panel | Webflow Audit panel help: ignore and unignore · NOT OPENED |
| `gsheets-cleanup-blog` | workspaceupdates.googleblog.com/2020/09/smart-cleanup-suggestions-google-sheets.html | miss: the post's prose (its GIF is captured directly as gsheets-cleanup-panel) |
| `gsheets-cleanup-help` | support.google.com/docs/answer/10098582 | Google Sheets cleanup suggestions help · NOT OPENED |
| `openrefine-cluster` | utdata.github.io/openrefine/demo-cluster.html | miss: the tutorial's raw-data screenshot |
| `openrefine-cluster-2` | carpentry.library.ucsb.edu/2022-04-14-ucsb-openrefine/05-clustering/index.html | OpenRefine clustering lesson · NOT OPENED |
| `trifacta-dq` | help.alteryx.com/trifacta-classic/en/concepts/feature-overviews/overview-of-data-qualit… | miss: text, the list of data-quality characteristics |
| `trifacta-profiling` | help.alteryx.com/trifacta-classic/en/basics/profiling-basics.html#profiling-in-the-appl… | Trifacta profiling basics: the bar per column, suggestions on click · NOT OPENED |
| `grafana-alerts` | play.grafana.org/alerting/list | live public demo: alert rules grouped by folder, a State facet (Firing · Normal · Pending), two promotional banners above the first rule |
| `gh-autofix-blog` | github.blog/news-insights/product-news/secure-code-more-than-three-times-faster-with-co… | miss: the post's opening prose |
| `gh-security-overview` | docs.github.com/en/code-security/how-tos/view-and-interpret-data/analyze-organization-d… | GitHub security overview insights · NOT OPENED |
| `dependabot-grouped` | github.blog/changelog/2023-06-30-grouped-version-updates-for-dependabot-public-beta/ | Dependabot grouped updates: one PR clears several · NOT OPENED |
| `vercel-allowlist` | vercel.com/docs/conformance/allowlist | text: an allowlist entry carries testName, reason, location and details (the value) |
| `cloudflare-insights` | developers.cloudflare.com/security/security-insights/ | text: a table of insight names and descriptions |
| `bitwarden-reports` | bitwarden.com/help/reports/ | Bitwarden vault health reports as tiles · NOT OPENED |
| `aws-ta` | docs.aws.amazon.com/awssupport/latest/user/get-started-with-aws-trusted-advisor.html | AWS Trusted Advisor: checks by category with estimated savings · NOT OPENED |
| `azure-advisor` | learn.microsoft.com/en-us/azure/advisor/advisor-overview | Azure Advisor overview: recommendations with potential savings · NOT OPENED |
| `azure-advisor-dismiss` | learn.microsoft.com/en-us/azure/advisor/view-recommendations | miss: the configuration article's related links |
| `gcp-recs-hub` | docs.cloud.google.com/recommender/docs/recommendation-hub/overview | DEAD: 404 |
| `pagespeed-clean` | pagespeed.web.dev/analysis/https-example-com/e8lc2vntid | a near-clean run on example.com: rings 100 / 96 / 100 / 80, and a cookie bar over the result |
| `qbo-au` | quickbooks.intuit.com/au/ | FAILED: ERR_HTTP2_PROTOCOL_ERROR, no frame |
| `gsheets-cleanup-panel` | blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSzpIScy5OG2QPF5wRliH88ViKNjflPYkPUe… (image from workspaceupdates.googleblog.com/2020/09/smart-cleanup-suggestions-google-sheets.html) | Sheets smart cleanup (a GIF, one instant): red marks on column heads; a panel card "INCONSISTENT DATA · United States ✎ · Apply to all cells below · ✓ ✗" over the cells B37 USA, B42 US |
| `gh-autofix-alert` | github.blog/wp-content/uploads/2024/07/Screenshot-2024-07-23-at-8.42.45%20AM.png (image from the Copilot Autofix GA post) | DEAD: blank, the direct image load was refused |
| `gh-autofix-diff` | github.blog/wp-content/uploads/2024/07/Screenshot-2024-07-23-at-8.44.23%20AM.png (image from the same post) | DEAD: blank, the direct image load was refused |
| `gh-autofix-pr` | github.blog/wp-content/uploads/2024/07/Screenshot-2024-07-23-at-8.46.23%20AM.png (image from the same post) | Copilot Autofix product shot 4 · NOT OPENED |
| `aws-ta-recs` | docs.aws.amazon.com/images/awssupport/latest/user/images/ta_recs_updated.png (image from docs.aws.amazon.com/awssupport/latest/user/get-started-with-aws-trusted-advisor.html) | Trusted Advisor: Action recommended 42 · Investigation recommended 127 · Checks with excluded items 28, each split by category; Potential monthly savings $7,082.26 in its own panel |
| `aws-ta-cost` | docs.aws.amazon.com/images/awssupport/latest/user/images/ta_cost_opt_example.png (image from the same AWS page) | Trusted Advisor cost optimisation: Potential monthly savings $7,082.26 · 1 Action recommended · 14 Investigation · 10 No problems detected · 11 Checks with excluded items; the checks list beneath |
| `azure-advisor-score` | learn.microsoft.com/en-us/azure/advisor/media/advisor-overview/advisor-dashboard-overvi… (image from learn.microsoft.com/en-us/azure/advisor/advisor-overview) | Advisor overview: a card per category with Score % and recommendations by impact; Security, with nothing to do, says "You are following all of our security recommendations" under a tick |
| `bitwarden-reports-img` | bitwarden.com/assets/JcoKvP7eLrZHUEKmjTqgc/0213680bf5546cfc7df498d9931c8d2f/2024-12-02_… (image from bitwarden.com/help/reports/) | six illustrated report tiles with descriptions and no counts |
| `figma-check-modal` | help.figma.com/hc/theming_assets/01JYKS7CZ94QTYRX1XR0HPP9MS (image from help.figma.com's Check designs article) | FAILED: served as a download |
| `hubspot-dq-overview` | knowledge.hubspot.com/hs-fs/hubfs/Knowledge_Base_2023-24-25/KB-Data-Management/Data%20Q… (image from knowledge.hubspot.com/reports/data-quality-command-center) | Data Quality overview: Duplicate issues 6 ▲100% · Formatting issues 6 · Enrichment gaps 29, then Recommended Actions cards |
| `hubspot-dq-formatting` | knowledge.hubspot.com/hs-fs/hubfs/Knowledge_Base_2023-24-25/KB-Data-Management/Data%20Q… (image from the same HubSpot page) | Formatting issues (a GIF, one instant): tabs Name (4) · Email (0) · Location (2); table Contact · Issue · Current · Proposed Fix ✎ · Accept · Reject · More |
| `openrefine-cluster-dialog` | utdata.github.io/openrefine/img/ppp-cluster-tour.png (image from utdata.github.io/openrefine/demo-cluster.html) | Cluster and edit, tutorial-annotated: a Merge? tick, values in the cluster with row counts, New cell value, cluster size, row count, facet histograms, Merge selected & re-cluster |
| `sentry-similar` | docs.sentry.io/mdx-images/similar-issues-K2F2JCY2.png (image from docs.sentry.io/concepts/data-management/event-grouping/merging-issues/) | Similar Issues: "This is an experimental feature", an Old/New Algorithm toggle, Merge (1), a Diff per candidate |
| `sentry-after-merge` | docs.sentry.io/mdx-images/after-merge-OQJFIWHK.png (image from the same Sentry page) | Sentry after a merge · NOT OPENED |
| `dependabot-dismiss` | docs.github.com/assets/cb-72787/images/help/repository/dependabot-alerts-dismissal-comm… (image from docs.github.com/…/viewing-and-updating-dependabot-alerts) | a Dependabot alert: "Upgrade Werkzeug to fix 2 Dependabot alerts", Create Dependabot security update, and Dismiss with five reasons and a comment |
| `dependabot-create-update` | docs.github.com/assets/cb-35731/images/help/repository/create-dependabot-security-updat… (image from the same GitHub page) | a Dependabot alert: the fix as the heading ("Upgrade addressable to fix 1 Dependabot alert in Gemfile.lock"), one green act, severity 7.5 / 10 at the right |
| `watchtower-dashboard` | support.1password.com/img/watchtower/op8-watchtower-dashboard.png (image from support.1password.com/watchtower/) | 1Password 8 Watchtower: a 1038 FANTASTIC gauge, a strength bar, six count tiles with the worst filled red (Rules' graft owns Watchtower; cited here as an avoid only) |
| `gh-security-overview-img` | docs.github.com/assets/cb-155037/images/help/security-overview/security-overview-dashbo… (image from docs.github.com/…/viewing-security-insights) | GitHub security overview dashboard · NOT OPENED |

## `live/` (2026-10-22, the first pass)

The one-line descriptions below are the first pass's own. The second pass's notes cite only the rows marked RE-OPENED.

| id | URL | one line |
|---|---|---|
| `xero-reconcile-mkt` | xero.com/au/accounting-software/reconcile-bank-transactions/ | JAX hero: each statement line carries a figure and a method tag (Rule · Match · Manual · Memory · Prediction), with a tip giving the reason for one |
| `xero-reconcile-mkt-2` | same, scrolled | three ticked promises; "Just review what needs your attention" |
| `xero-reconcile-help` | central.xero.com/s/article/Reconcile-your-bank-account | the bank widget: statement balance against balance in Xero, "Balance difference 7,112.95", and **Reconcile 20 items** as the button |
| `xero-reconcile-help-3` | same, scrolled 2,300 | the reconcile pair: statement line left, suggested match right in green, **OK** between them, "1 other possible match found" · **RE-OPENED 2026-10-28** |
| `xero-reconcile-help-4` | same, scrolled 4,200 | "What's next?": the two balances should be the same, and if not, "find out why there's a difference" |
| `xero-find-recode` | central.xero.com/s/article/Find-and-recode-transactions | **DEAD**, NOT OPENED: redirected to the Xero login |
| `qbo-reconcile` | quickbooks.intuit.com/au/accounting/bank-reconciliation/ | **FAILED**: `ERR_HTTP2_PROTOCOL_ERROR`, no frame |
| `qbo-for-review` | quickbooks.intuit.com/learn-support/en-au/help-article/bank-transactions/… | **FAILED**: `ERR_HTTP2_PROTOCOL_ERROR`, no frame |
| `sonarcloud-explore` | sonarcloud.io/explore/projects | public projects as cards: counts per quality with A–E grades, and **Passed** beside 269 reliability issues |
| `sonarcloud-monica-issues` | sonarcloud.io/project/issues?id=monica&… (reached from the explorer) | **Top issues 59 / All issues 438**, "59 issues 4h 52min effort", sentence titles, "5min effort · 3 years ago" per card, three identical cards · **RE-OPENED 2026-10-28** |
| `sonarcloud-issues` | sonarcloud.io/project/issues?…id=apache_commons-lang | **DEAD**, NOT OPENED: 404 |
| `sonar-next-issues` | next.sonarqube.com/sonarqube/project/issues?id=sonarqube | **DEAD**, NOT OPENED: redirected to Sonar's marketing |
| `snyk-fix` | docs.snyk.io/…/fix-your-vulnerabilities | issues grouped by the dependency that fixes them; **Fix these vulnerabilities**; a facet reading "Fixable 55 · Partially fixable 15 · No supported fix 36"; a risk score at the right · **RE-OPENED 2026-10-28** |
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
| `hemingway-editor` | hemingwayapp.com | the text painted by kind; the rail reads "1 of 13 sentences is very hard to read", one eye per kind, "Grade 8 Good.", and an Upgrade card in the rail · **RE-OPENED 2026-10-28** |
| `hemingway-clean` | same, emptied | every kind still in its alarm colour at zero: "0 of 0 sentences…", "Grade 0 Good.", "0 weakeners. Nice work." · **RE-OPENED 2026-10-28** |
| `vscode-problems` | code.visualstudio.com/docs/editing/editingevolved#_errors-warnings | counts in the status bar, Ctrl+Shift+M for PROBLEMS, squiggles inline, and red ticks on the overview ruler |
| `vscode-quick-fix` | code.visualstudio.com/docs/editing/refactoring#_code-actions… | Code Actions as quick fixes; `source.fixAll` run on save |
| `apple-iphone-storage` | support.apple.com/en-au/108429 | iPhone Storage: one bar of the whole, then a Recommendations card (Offload Unused Apps · **Enable** · "Save up to 145.2 MB … Your documents & data will be saved") · **RE-OPENED 2026-10-28** |
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
| `ramp-missing-receipts` | ramp.com/receipts | RE-OPENED 2026-10-28: miss, a footer of links and a small demo still |
| `eslint-play` | eslint.org/play/ | NOT OPENED |
