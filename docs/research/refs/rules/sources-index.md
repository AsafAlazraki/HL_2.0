# Rules — sources index

Two passes. Frames are gitignored and mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\rules\`. Each folder's `sources.json` records the capture date, the final URL and the page title.

**OPENED 10-28** means this pass read the frame and `notes.md` may cite it. **10-22 only** means only the first pass opened it, so `notes.md` does not cite it. **NOT OPENED** means it is cited nowhere.

## Second pass: `live2/`, 2026-10-28, 23 frames

Most of these frames are a documentation page's own screenshot, loaded at its image URL. The page that carries each is named here.

| frame | page (image URL in `live2/sources.json`) | what it shows | |
|---|---|---|---|
| `launchdarkly-rules-list` | launchdarkly.com/docs/home/flags/target | "Flag is [On] serving variations based on rules": the switch inside a sentence. Rules are prose with tinted chips on a spine from "All traffic" down to a default rule | OPENED 10-28 |
| `launchdarkly-rule` | launchdarkly.com/docs/home/flags/target-rules | The same kind of rule in its editor: four labelled boxes, `Context kind · Attribute · Operator · Values` | OPENED 10-28 |
| `launchdarkly-attribute-menu` | same page | `Select an attribute` opened, with empty operator and values slots | OPENED 10-28 |
| `linear-ti-why` | linear.app/docs/triage-intelligence | A dashed suggested chip; "Why this assignee was suggested" in two bullets; `Alternatives`; `Accept suggestion` | OPENED 10-28 |
| `linear-ti-modes` | same page | "Define rules for showing, hiding, or auto-applying suggestions": `Show` and `Auto-apply` per kind, with "Inherited from workspace" | OPENED 10-28 |
| `linear-ti-reasoning` | same page | "Thought for 14 seconds" over paragraphs and UUIDs: the reason as a monologue | OPENED 10-28 |
| `linear-ti-pane` | same page | The suggestions pane under an issue title | NOT OPENED |
| `ramp-policy-doc` | support.ramp.com/policy-suggestions-the-policy-agent | The policy as a dated document ("Effective July 10 2025"), `Testing mode (admins only)` | OPENED 10-28 |
| `ramp-policy-suggestions` | same page | Prose rules, with the machine's questions in the margin and `1 Yes · 2 No · 3 Dismiss` | OPENED 10-28 |
| `ramp-policy-keep` | same page | The policy after a suggestion | NOT OPENED |
| `stripe-radar-assistant` | stripe.com/guides/radar-rules-101 | Radar Assistant: a chat question answered with a coded rule and `Test rule` | OPENED 10-28 |
| `stripe-radar-backtest` | same page, "Backtesting in the Dashboard" | `Review new rule`: `$13,263 total matching` split into five figures above the matches | OPENED 10-28 |
| `grammarly-company-rule` | grammarly.com/business/styleguide | Card headed "AcmeCo Style Guide": the word struck, the replacement as the act, one sentence of reason | OPENED 10-28 |
| `grammarly-chairperson` | same page | The style guide correcting a word | NOT OPENED |
| `fastmail-art-2` | fastmail.com/blog/email-organization-filters | Create Rule: "Apply to… All 2 matching conversations now / New matching messages on arrival" | OPENED 10-28 |
| `fastmail-hero`, `fastmail-art-1`, `-3`, `-4` | same page | The article's other images | NOT OPENED |
| `fantastical-home` | flexibits.com/fantastical | Marketing hero; no natural-language parsing shown (a miss) | OPENED 10-28 |
| `apple-mail-rules-guide` | support.apple.com/guide/mail/mlhlp1017/mac → redirected to the guide's welcome page | The rules text is cited by URL only | NOT OPENED |
| `apple-home-automations`, `apple-iphone-automation` | support.apple.com/guide/home/hme33ae10cb7/mac · /guide/iphone/iph6d50ec543 | 60 px app icons: misses, judged from their pixel size in the capture log | NOT OPENED |

## First pass: `live/`, 2026-10-22, 37 frames

| frame | URL | what it shows | |
|---|---|---|---|
| `natural-language-form-rest` | https://tympanus.net/Tutorials/NaturalLanguageForm/ | The form as one sentence at about 60 px, with dotted underlines | OPENED 10-28 |
| `natural-language-form-pressed` | same | The choices open in place at the sentence's size, the current one ticked | OPENED 10-28 |
| `stripe-radar-test-impact` | https://docs.stripe.com/radar/testing | `$16,369.38 total matched` in four figures, including `Legitimate`, above the matches | OPENED 10-28 |
| `stripe-radar-monitor-rules` | https://docs.stripe.com/radar/rules | Text: an edit drawn as triangles on the chart; "Disable, Enable, Edit or Delete" in one overflow | OPENED 10-28 |
| `stripe-radar-rules-top` | same | Verbs coloured by effect; built-in and custom rules under separate headings | 10-22 only |
| `stripe-radar-product-ui`, `-hero` | https://stripe.com/au/radar | Marketing; no rule shown | 10-22 only / NOT OPENED |
| `github-rule-insights` | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository | A dated spine of events with `Pass · Bypass · Fail` and an `Evaluate` mark | OPENED 10-28 |
| `github-ruleset-enforcement` | same | `Delete ruleset` in red inside `···` | OPENED 10-28 |
| `github-rule-insights-2` | same | The spine with its overflow | 10-22 only |
| `hey-screener` | https://help.hey.com/article/722-the-screener | The `Screen 5 first-time senders` pill above the Imbox | OPENED 10-28 |
| `onepassword-watchtower` | https://support.1password.com/watchtower/ | Count tiles and a `1038 FANTASTIC` gauge, with a consent banner over the lower half | OPENED 10-28 |
| `onepassword-watchtower-web` | same | The web version, under the same banner | 10-22 only |
| `statsig-gate` | https://docs.statsig.com/feature-flags/overview | A card with the switch in its head and `IF / ELSE IF` on the edge (claimed by the built row) | OPENED 10-28 |
| `hazel-rule` | https://www.noodlesoft.com/ | Folders, then rules, with `☑ File Movies` ticked on in the list (claimed by the built row) | OPENED 10-28 |
| `monarch-rule-preview` | https://help.monarch.com/hc/en-us/articles/360048393372-Transaction-Rules | Seventeen toggles, `Preview changes 0`; quick rules "appear automatically" | OPENED 10-28 |
| `zapier-filter-passed` | https://help.zapier.com/hc/en-us/articles/8496276332557 | "Your Zap would (not) have continued for this test data" | OPENED 10-28 |
| `zapier-zap-history` | https://help.zapier.com/hc/en-us/articles/8496291148685 | Zap runs: `Success` four times | OPENED 10-28 |
| `zapier-filter-fields` | https://help.zapier.com/hc/en-us/articles/8496276332557 | `(Text) Contains` | 10-22 only |
| `notion-automations` | https://www.notion.com/help/database-automations | Automation cards titled `Priority` and `Assignee` (small, inside a video still) | OPENED 10-28 |
| `notion-formula-editor`, `notion-filter` | https://www.notion.com/help/formulas · /views-filters-and-sorts | The formula editor; the filter help | 10-22 only / NOT OPENED |
| `linear-triage-rules` | https://linear.app/docs/triage | `When · Customer name · include any of · 3 customers / Then · Set priority · High` | OPENED 10-28 |
| `lunchmoney-rules` | https://support.lunchmoney.app/setup/rules | `If.. Add condition / Then.. Add action` | OPENED 10-28 |
| `excel-data-validation` | https://support.microsoft.com/en-us/excel/get-started/apply-data-validation-to-cells | `Allow: Whole Number · Decimal · List · Date · Time · Text Length · Custom` | OPENED 10-28 |
| `shopify-flow-app` | https://apps.shopify.com/flow | Flow sold as a node canvas | OPENED 10-28 |
| `airtable-condition-group`, `airtable-nested-groups` | https://support.airtable.com/articles/9290731839-filtering-records-using-conditions | The anatomy labelled; prose | 10-22 only |
| `salesforce-validation-rule` | https://trailhead.salesforce.com/content/learn/modules/point_click_business_logic/validation_rules | "We hit a snag." at Save | 10-22 only |
| `outlook-rules` | https://support.microsoft.com/en-us/outlook/mail/manage-email-messages-by-using-rules-in-outlook | `Select one` steps | 10-22 only |
| `cloudflare-custom-rule`, `cloudflare-sampled-logs` | https://developers.cloudflare.com/waf/custom-rules/create-dashboard/ · /waf/analytics/security-events/ | Field / Operator / Value; one event across 30-odd fields | 10-22 only |
| `vercel-waf-rule` | https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules | If/Then with `Log` | 10-22 only |
| `jira-automation-builder` | https://www.atlassian.com/software/jira/features/automation | `When: New trigger` and a tile catalogue | 10-22 only |
| `make-filter` | https://help.make.com/filtering | Make's filter setup | NOT OPENED |
| `posthog-release-conditions` | https://posthog.com/docs/feature-flags/creating-feature-flags | A steps table (a miss) | 10-22 only |
| `ifttt-create` | https://ifttt.com/create → /join | A sign-up wall, not fought | 10-22 only |
| `onepassword-watchtower-clean` | support.1password.com/watchtower/ | **FAILED**: the consent reject would not take a click | — |

## Also read, not captured

- `docs/directions/rules/built/m3-2-1440.png`, the built screen at 1440 (OPENED 10-28).
- `docs/reference/explaining-a-refusal.md`, `HELMLOGIC_GROUND_TRUTH.md` §5, §6 and §9, `MPF_GROUND_TRUTH.md` §7, and `FITMENT_RULES.md` F8, each re-checked against `src/domain/rules/constraints/` (see notes §0).
- Probed and still without a picture of the shape:
  - Finder smart folders, Gmail filters, Mailchimp segments and Arc's Air Traffic Control.
  - Apple Shortcuts' variables page, whose images were unlabelled and not captured.
