# Rules — the sweep

Driven 2026-10-22 with `tools/research/capture.ts` into `live/` at 1440 × 900: **38 sources, 37 frames, 1 dead**. 1Password's consent button would not take a click; its two kept frames have the banner over their lower half. 34 frames were opened. Four of those were misses:

- `posthog-release-conditions`: a table, not the conditions
- `airtable-nested-groups`: prose
- `ifttt-create`: a sign-up wall
- `stripe-radar-product-ui`: a chart with no rule in it

Three frames were never opened, and nothing below cites them. No stock frame answers a rules question.

## 0. What the engine settles, and four corrections to the brief

- **The sentence lives in `constraints/`, not `sentence/`.** `constraints/describe.ts` `sentenceTokens` gives each word a role (`field · op · value · word`) and a control (`field · op · value · chip · chipAdd`). An unanswered slot is `unchosen`, "drawn as empty, never as a name". `rules/sentence/` is the old flow-rule canvas, inked "for the navy blueprint", and is not this screen's grammar.
- **Reach exists.** `state.previewConstraint` returns `rows`, `looked`, `kept` and `broken`, counted in the dealer's own noun ("434 trailers"). The badges are `CONFLICT · ACTIVE NOW · OFF · EDITED`, conflicts first and off last (`state.ts:401–420`).
- **Severity exists.** `ConstraintDef.severity` is `'block' | 'warn'`, and observed provenance is coerced to warn at every seam (`adopt.ts`). Off is a separate flag, `enabled`.
- **The file holds 16 admitted rules, not 21.** 13 are asserted and 3 observed (F7, F12, F16). Beside them sit **11 refuted** candidates, each with "the number that kills it".
  - **All 16 are `blocked` as runnable constraints.** Eight are cross-kind. F8 has no column on either side (`FITMENT_RULES.md` F8: "Both must be seeded as real columns").
  - Six carry `enforcedIn`. F8 and F9 really run, in `fitment/trailerFitment.ts` (`trailerFitment.test.ts:814`), but the strings name the old app's places ("Business rules · The trailer selector").
  - Several blockers still say a sentence cannot yet warn, and severity has since arrived. **The screen must never print a stale excuse.** `ruleLedger.ts` says it itself: "`liveIds` IS THE TRUTH".
- **`leftOut.ts` is not "what a rule excluded".** It is what the app chose not to import. What a narrowing holds back is `curation/reach.ts` (`beyond`). What a pattern costs is `discoverSay.excludedSay`.
- **No rule has a history.** A solve returns `fired: string[]` (`model/rules.ts:260`) and nothing keeps it. "Fired 12 times this week" needs a pure `ruleHistory` in `src/domain/rules/constraints/` that replays stored quotes through `configure/solve` with and without the rule. It is not built.
- **Discovery on the seed** (`discoverNorthside.test.ts`):
  - It reads 53 tables and 15,691 rows.
  - It finds the trailer series naming the boat's brand at **626 of 626**. Across 8 boat identities that leaves between 0.92 % and 7.83 % of 434 trailers; a Highfield keeps 12 (`FITMENT_RULES.md` F8).
  - It admits that pattern at `enforcement: 'warn'`, and finds more than 300 candidates in all.
  - The sentence it owes them is `OBSERVED_SAY`: "Your business has not stated it, so it may warn and may never remove a row from a list."
- **The old app's measured failure.** Its Business rules screen put **55.7 % of its words in runs of twelve or more** (`plainly.ts`). It "led with STATUS — ten of them stamped 'Not checked yet'" (`ruleLedger.ts`), which drew the owner's "why am i seeing not checked yet".

## 1. What is genuinely best — the five hard questions

**1 · Writing in a sentence, and the pressed word.**

- `live/natural-language-form-rest.png` is a form that is one sentence: "I feel like eating *any food* in a *standard* restaurant *anytime* in *any city*". The editable words are a darker ink of the ground, dotted-underlined, at the sentence's own ~60 px.
- `live/natural-language-form-pressed.png` answers the pressed state. The sentence dims, and the choices open **in place at the same size**, the current one ticked (`any food ✓ · Indian · French · Japanese · Italian`). No word ever becomes a form control.
- The nearest product is `live/linear-triage-rules.png`, which reads `When · Customer name · include any of · 3 customers / Then · Set priority · High`. Its grey pills read as filter chips, not prose.
- Every other builder is a row of dropdowns: `live/lunchmoney-rules.png`, `live/outlook-rules.png` and `live/cloudflare-custom-rule.png`.

**2 · Reach before it is on.** `live/stripe-radar-test-impact.png` is the best frame in the sweep.

- **Review new rule** shows `$16,369.38 total matched`, split into `Disputed & EFW $7,414.82 · Refunded $2,256.98 · Failed & Blocked $3,986.12 · Legitimate $2,711.46`. The matches are listed beneath, and `Add rule` waits at the head.
- "Legitimate" is **what the rule would cost honest business, priced before commitment**. Ours is `kept / broken` with the broken rows named.
- Monarch does it smaller, with `Preview changes 0` and "Apply # changes to existing transactions" (`live/monarch-rule-preview.png`).
- Zapier tests one real record: "Your Zap would have continued for this test data" (`live/zapier-filter-passed.png`).

**3 · Written versus noticed.**

- HEY keeps the machine's finds out of the list. A mint pill reads `Screen 5 first-time senders`, and nothing joins until a person says yes (`live/hey-screener.png`).
- Watchtower gives the noticed things their own room, each a count over a sentence with `Show Items` (`2 · Reused Passwords`), never mixed with the vault (`live/onepassword-watchtower.png`).
- Stripe separates "Built-in rules" from "custom rules" by heading (`live/stripe-radar-rules-top.png`).
- None of them passes a finding off as the person's own sentence, which is exactly what `workbookRules.ts` forbids.

**4 · History.** `live/github-rule-insights.png` is the shape, and Zapier's history is the failure: four identical `Success` rows (`live/zapier-zap-history.png`).

- The record is a dated spine (`Activity on Mar 29, 2023`), each event a sentence: `octocat created not-allowed 13 days ago`.
- The verdict is an outlined word at the right: `Pass · Bypass · Fail`. An `Evaluate` mark sits on the event that only *would* have failed.
- Stripe publishes that edits show as "**triangular symbols** on the graph lines", to compare "before and after you make it" (`live/stripe-radar-monitor-rules.png`).

**5 · Off, not deleted, never broken.**

- GitHub's middle state, `Evaluate`, runs a rule and records it without enforcing. That is our warn.
- GitHub's delete is a red item inside `···` (`live/github-ruleset-enforcement.png`).
- Statsig puts the switch in the rule card's head, above `IF / ELSE IF` (`live/statsig-gate.png`). Hazel ticks a rule on in the list itself (`live/hazel-rule.png`).
- Off is therefore the sentence at rest, not red, with its switch.

## 2. Patterns worth taking, named

- **The sentence form.** Prose with the changeable words underlined. Pressing one opens its choices in place at the same size (`natural-language-form-pressed.png`). This is `sentenceTokens` drawn as its comment describes.
- **The census before the act.** The matched total, split into what it is for and what it costs, above the commit (`stripe-radar-test-impact.png`). Ours: looked · keep it · break it today.
- **Try it on one.** One real row and what the rule does to it (`zapier-filter-passed.png`). Ours, for example: "On the Highfield Sport 560 this would refuse n of its motors — because …". That is the exit criterion's own sentence.
- **The screener.** Machine finds wait behind a counted pill and enter only on a yes (`hey-screener.png`).
- **Born from an act.** "A rule widget appears automatically when you make any changes to a transaction" (`monarch-rule-preview.png`). Ours: pressing past a refusal in the build offers the sentence that would make it a rule.
- **Named for what it governs.** Notion's automation cards are titled `Priority` and `Assignee` over "When Issue type is set to Hardware, Replace Priority with P1 (High)" (`notion-automations.png`). That is `ruleLedger`'s subject grouping, one level down.
- **The switch in the head** (`statsig-gate.png`, `hazel-rule.png`) and **the edit mark** on the record (`stripe-radar-monitor-rules.png`).

## 3. Type and motion seen

- **Natural Language Form.** Light sans at ~60 px over three lines; the editable words are a darker tint, never a second face. Pressed, the page dims and the list rises at the same size on a contrasting mint, so the sentence keeps its rhythm while one word speaks. Motion cannot be read from stills; the frames show only that the choice opens where the word was.
- **Stripe** colours the leading verb by its effect: `Allow` green, `Block` red, `Review` orange. Its census figures sit at ~22 px under small labels, divided by hairlines, unboxed. We have two verbs, refuse and warn.
- **Linear** sets small grey `When / Then` at the card's left edge. **Statsig** turns `IF / ELSE IF` sideways on the clause edge. Both make the grammar furniture.
- **Watchtower**'s 40 px numeral over a bold label makes the count the finding.

## 4. What to avoid

- **Slots showing.** `lunchmoney-rules.png` (`If.. Add condition`), `outlook-rules.png` (`Select one`), and `cloudflare-custom-rule.png` (three empty boxes over an empty `Expression Preview`).
- **The anatomy shown.** `airtable-condition-group.png` labels its own `conjunction · field · operator · value`.
- **Type leaking into the verb.** `zapier-filter-fields.png` (`(Text) Contains`). `excel-data-validation.png`, the dialog the brief names, offers `Allow: Whole Number · Decimal · List … Custom`, which is rules by data type, never by meaning.
- **A formula as the editor.** `notion-formula-editor.png`: `[…].includes(Status)`.
- **The flowchart.** `shopify-flow-app.png`'s node canvas, and `jira-automation-builder.png`'s `When: New trigger` choosing from twenty-odd tiles. The old navy-blueprint canvas in `sentence/describe.ts` is the same thing.
- **The refusal after the fact.** `salesforce-validation-rule.png` says "We hit a snag." at Save, with the rule hidden in a formula.
- **Delete beside Disable.** `stripe-radar-monitor-rules.png` puts `Disable, Enable, Edit or Delete` in one overflow menu.
- **History as a log.** `zapier-zap-history.png` repeats `Success`. `cloudflare-sampled-logs.png` buries the rule's name in 30-odd fields.
- **A score.** `onepassword-watchtower.png` shows `1038 FANTASTIC`. A rule set is not graded.
- **Status first.** This app's own failure (§0).

## 5. Directions

Each direction has its own composition and its own order. None is a list beside a detail.

### A · The sentence: one column, writing first

**Composition.** A single centred column of type. At the head is the rule being written, at ~44 px, its underlined words opening in place. Under it is the census, `previewConstraint` said aloud: `Looks at 810 boats · n keep it · m break it today`, with the m one press away. Then comes the line a salesperson would read: "Not offered — because …". Below are Northside's rules, one sentence each, each ending in its switch word (`on · warns · off`).
**Order.** Write, then reach, then yours. The file's 16 are one line at the foot: "Your price file states 16 more; 2 run in the build." That line opens a sheet.
**Exclusives.** `natural-language-form-rest/-pressed.png` and `stripe-radar-test-impact.png`. *Risk:* Stripe is primary on quotes, history, document and the kit, though never Radar. The fallback is `monarch-rule-preview.png`.
**Only here.** The rule is written in the very words the configurator will say.
**Reflow.**
- At 390 the sentence wraps to 28 px, and a pressed word opens a sheet at that size.
- At 834 the column is 640 wide.
- At 1920 it holds at 760, with the water either side.

**Northside sets** the default verb (refuse or warn) and each `because`.

### B · The subjects: full-width shelves, the file first

**Composition.** Five full-width bands in `ruleLedger`'s order: Trailers (F8 is "the only rule … that both holds at 100 % and actually rejects something"), Motors, Rigging, The boat, Registration.
- Each band leads with its finding as a figure (`581 of 581 pairings`).
- Then a horizontal shelf of cards in fixed tiers: Northside's (solid), the file's (hairline), noticed (dashed, "warns only").
- Each card is titled by the column it governs, with its switch in the head.
- "+ a trailer rule" opens a sentence already scoped to that kind.

**Order.** Subject, then whose.
**Exclusives.** `notion-automations.png` and `statsig-gate.png`.
**Only here.** The business is shown as the file proves it, before a word is typed.
**Reflow.**
- At 390 each band becomes a vertical stack.
- At 834 the shelf shows two cards.
- At 1920 it shows four.

**Northside sets** which subjects show, and their order.

### C · The screener: one decision at a time

**Composition.** A centred stage holding one card, under a counted pill: "7 things noticed in your price file".
- The card carries the pattern as a sentence with `OBSERVED_SAY` under it, the figure (`626 of 626`), and what it leaves (`a Highfield keeps 12 of 434 trailers`).
- Two answers: "Keep it as Northside's — it warns" (via `adopt.ts`), or "Not a rule" (undoable).
- Overrides pressed in the build join the same deck.
- Decided rules sit behind the stage as a quiet strip of sentences.

**Grouping and order.** Grouped by origin (noticed · from your quotes · you wrote), with what needs deciding first.
**Exclusives.** `hey-screener.png` and `monarch-rule-preview.png`.
**Only here.** The file proposes and the dealer disposes, and a noticed pattern is never passed off as a rule.
**Reflow.**
- At 390 the card is the screen, with thumb-height answers.
- At 834 the card is 600 wide.
- At 1920 the stage holds at 720 and the strip becomes a band below.

**Northside sets** whether noticed patterns are offered, and how many at a time.

### D · Watching: rules against time

**Composition.** A matrix: each row is a rule's sentence across the left third, then fourteen days of dots sized by refusals, with a triangle where it was edited. Each row leads with a three-position switch, **On · Watching · Off**, where Watching is warn, GitHub's Evaluate.
**Order.** Most recently fired first. There is no grouping; time is the grouping.
**Exclusives.** `github-rule-insights.png` and `zapier-filter-passed.png`.
**Only here.** A rule is seen doing its job.
**Honest weakness.** It needs the unbuilt `ruleHistory`, and on day one every row is empty. **The sweep recommends A, with C's screener in place of A's one line about the file.**
**Reflow.** Under the sentence at 390 sits a strip of 7 dots; 834 shows 14 days and 1920 shows 28.
**Northside sets** the window.

## 6. Imagery

Rules is a Cockpit screen and **needs no photography**. Nothing in the seed pictures a rule, and a boat beside a sentence would make the boat the subject. Day one is honestly type and figures:

- 0 rules Northside has written
- 16 rules the file states, 2 of them running
- 11 refuted candidates, each with its killing number
- one admitted pattern at 626 of 626, with 300-odd candidates behind it

B could carry a maker's mark only on a band belonging to one maker, and none of the five does: the trailer band spans 7 makers.
