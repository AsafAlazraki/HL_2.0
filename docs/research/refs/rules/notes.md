# Rules — the sweep

There have been two passes.

- **2026-10-22**, in `live/`: 37 frames. Board A was built from it.
- **2026-10-28**, in `live2/`: 23 new frames. They cover what the first pass left open: writing in words, noticed against written, off drawn as a state, and the moment a rule fires.

**32 frames were opened in this pass**: 13 new, 18 from `live/`, and the built `docs/directions/rules/built/m3-2-1440.png`. Nothing below cites an unopened frame.

Three misses:
- `fantastical-home` is a marketing hero.
- The two Apple guide images are 60 px icons.

## 0. The engine, checked against this tree

- **There are 16 workbook rules, not 21.** Each `workbookRules.ts` seed carries its numerator and denominator, and the refuted candidates carry "the number that kills it".
  - Six still hold `enforcedIn` strings naming the old app's places ("Business rules · The trailer selector"), and these must never print.
- **The dealer's sentence is `pairRules.ts`.** It is one boat condition and one motor or trailer obligation, each naming a spec from `pairSpecs.ts`, and "A BLANK NEVER REFUSES".
  - `pairReach` counts 289 boats as models, 241 motors and 434 trailers.
  - `rules/sentence/` is the old flow canvas, not this grammar.
- **Severity and off.** `severity` is `'block' | 'warn'`, and `enabled` is separate. `adopt.ts` sets `OBSERVED_SEVERITY = 'warn'`.
  - `OBSERVED_SAY`: "Your business has not stated it, so it may warn and may never remove a row from a list."
- **Discovery** (`discoverNorthside.test.ts`) reads 53 tables and 15,691 rows.
  - It finds the trailer-series pattern at **626 of 626**, which leaves 0.92 %–7.83 % of the 434 trailers per brand.
  - It finds more than 300 candidates.
- **No history is kept.** `fired: string[]` (`model/rules.ts:260`) is returned and dropped, so "fired 12 times this week" needs an unbuilt `ruleHistory`.
- **One rule, two figures.**
  - The built screen shows F8 at `581 of 581`, while discovery says 626 of 626.
  - Its census reads "565 of 810 boats", where `pairReach` now counts 289 models (`m3-2-1440.png`).
  - The next board says one figure per rule, with its noun.

**The old repo's research, re-checked:**

- `explaining-a-refusal.md`, "close on the user's own choice": **holds**. The build's refusal ends on the pick.
- `explaining-a-refusal.md`, "rank the fixes and price them": **unbuilt**. `configure/` has no fix generator, so no board may draw a priced fix.
- `explaining-a-refusal.md`'s cop-out, Shopify's "Red - Unavailable": **a live risk**. It is what a rule with an empty `because` would say, so the because must be required.
- `HELMLOGIC_GROUND_TRUTH.md` §5 "Rules fail OPEN" and §6 `isActive` with "a named human rationale": **hold** (`pairRules.ts`, `enabled`, the because). §9, "a rule editor whose vocabulary is the user's own columns": **superseded** by specs (DECISIONS 2026-10-22).
- `MPF_GROUND_TRUTH.md` §7: "no fitment rule anywhere in the Master Price File". The 16 are measured from columns, not stated.
  - So the quotation-marked line "From your price list: 'A boat steered from a remote helm…'" on `m3-2-1440.png` puts words in the file's mouth.
  - Say it instead as "Your price list holds to this on n of m".
- `dense-tables-and-selection.md`: nothing here; this screen is prose.

## 1. The five hard questions

**1. Writing in a sentence, and the pressed word.**
- `live/natural-language-form-rest.png` is still the purest answer.
  - One sentence runs at about 60 px.
  - The changeable words are a darker tint of the ink, dotted-underlined.
  - Pressed (`-pressed.png`), the page dims and the choices open where the word was, at its size, with the current one ticked.
- `live2/launchdarkly-rules-list.png` does it in a product: "If [Alternate sort order] is [On]…", tinted chips in running prose, the title a sentence too.
- Its own editor is the failure. `live2/launchdarkly-rule.png` shows four labelled boxes, `Context kind · Attribute · Operator · Values`.
- Stripe's "write it in words" (`live2/stripe-radar-assistant.png`) is a chat that returns code (`Block if :hours_since_customer_was_created: = 0`). There, English goes in and a formula comes out. In ours, the English is the rule.

**2. Reach before it is on.**
- `live/stripe-radar-test-impact.png` and `live2/stripe-radar-backtest.png` show `$13,263 total matching`.
  - It is split four ways: `Disputed & EFW · Refunded · Failed & Blocked · Legitimate`.
  - The matches are listed beneath, with `Add rule` at the head.
  - "Legitimate" is what the rule costs honest business, priced before the act.
- `live2/fastmail-art-2.png` names the fork Northside has: **"Apply to… ☐ All 2 matching conversations now · ☑ New matching messages on arrival"**.
  - Ours is the same fork: the drafts standing now, or the next pick.
  - DECISIONS 2026-10-22 already chose that a rule refuses a standing draft's give and never edits it. This is how to say so before the act.
- `live/zapier-filter-passed.png` tries the rule on one real record: "Your Zap would have continued for this test data".

**3. Written against noticed.**
- `live2/ramp-policy-suggestions.png` is the new best.
  - The policy is a document of prose ("High-cost hubs: $100 per day — breakfast ≤ $20…").
  - The machine's questions stand in the **margin**, boxed, with `1 Yes · 2 No · 3 Dismiss`.
  - Nothing enters the text until a person answers.
- `live2/linear-ti-why.png` has a "Triage Intelligence" head.
  - Suggested chips are **dashed** and accepted ones solid.
  - "Why this assignee was suggested" is two plain bullets, followed by `Alternatives` and `Accept suggestion`.
- `live2/linear-ti-modes.png` gives each kind of suggestion one word, `Show · Auto-apply`.
- `live/hey-screener.png`'s pill `Screen 5 first-time senders` keeps finds out of the list until a yes.

**4. History.**
- `live/github-rule-insights.png` is the shape.
  - It is a dated spine ("Activity on Mar 29, 2023").
  - Each event is a sentence with a verdict word, `Pass · Bypass · Fail`.
  - An `Evaluate` mark sits on the event that would have failed.
- `live/zapier-zap-history.png` is the failure: `Success` four times.
- We keep none of this (§0). Today the census is the honest drawing, and it says *now*, not *history*.

**5. Off, never broken.**
- `live2/launchdarkly-rules-list.png` puts the switch **inside a sentence**: "Flag is [On] serving variations based on rules".
  - Its spine ends on a default rule, so off visibly falls through to the ordinary list.
- `live/github-rule-insights.png`'s `Evaluate` records without enforcing. That is our warn.
- `live2/ramp-policy-doc.png` says a state as a dated phrase: `Testing mode (admins only)`, "Effective July 10 2025".
- Delete stays in an overflow: a red `Delete ruleset` inside `···` (`live/github-ruleset-enforcement.png`).
- Apple's Mail guide: deselect a rule's checkbox "to keep a rule but not use it" (support.apple.com/guide/mail/mlhlp1017/mac, by URL; the captured frame redirected to the guide's welcome page).

## 2. Patterns worth taking

- **The pressed word opens in place.** Choices rise at the word's own size over a dimmed sentence (`live/natural-language-form-pressed.png`). This is `describe.ts`'s `unchosen` drawn: an empty slot is a dotted gap, never a box.
- **The switch in the sentence.** "The build [refuses] it": the state is a word of the line (`live2/launchdarkly-rules-list.png`).
- **The fall-through.** Close on "Everything else the price list pairs is offered" (the same frame's default rule).
- **The census before the act.** "About n of 289 boats · takes m of the pairings the price list makes" (`live/stripe-radar-test-impact.png`).
- **Now, or on arrival.** Both scopes are named before Save (`live2/fastmail-art-2.png`).
- **Margin questions.** The machine asks beside the text with numbered answers, and never edits it (`live2/ramp-policy-suggestions.png`).
- **Dashed means suggested.** The outline is the whole signal (`live2/linear-ti-why.png`). It needs no colour, and it is a token Northside can restyle.
- **Named where it fires.** A source head ("AcmeCo Style Guide"), the refused word struck, the replacement as the act, and one sentence of reason (`live2/grammarly-company-rule.png`). That is the exit criterion's card in the build.

## 3. Type and motion seen

- **Natural Language Form**: one light sans at about 60 px, editable words a tint of it, and the pressed list at the same size, so nothing jumps.
- **LaunchDarkly**: the whole rule at body size, values as tinted chips.
- **Ramp**: prose at reading size. The margin questions are the only boxed things, so the machine's voice is visibly not the author's.
- **Grammarly**: the replacement on a filled block at twice body size, so the act is the largest word.
- **Stripe**: only the verb is coloured. Its census figures are about 22 px, unboxed, between hairlines.
- **Motion** cannot be read from stills, only *where* change appears. The board names each duration against the kit.

## 4. What to avoid

- **The anatomy shown.** `live2/launchdarkly-attribute-menu.png` (`Select an attribute`) and `live/lunchmoney-rules.png` (`If.. Add condition / Then.. Add action`).
- **English in, code out.** `live2/stripe-radar-assistant.png`, whose footer says it "might provide information that contains errors".
- **A monologue as the reason.** `live2/linear-ti-reasoning.png`: "Thought for 14 seconds" over paragraphs of UUIDs.
- **A switch per field.** `live/monarch-rule-preview.png`: seventeen toggles.
- **Rules by data type.** `live/excel-data-validation.png`.
- **The flowchart.** `live/shopify-flow-app.png`.
- **A score.** `live/onepassword-watchtower.png`, `1038 FANTASTIC`.
- **Disable beside Delete.** `live/stripe-radar-monitor-rules.png`.
- **Prose as a filter bar.** `live/linear-triage-rules.png`: grey pills on grey.
- **This app's own repeat.** `m3-2-1440.png` draws "Stated in your price list" as a white rounded bar with a bold title, a quiet line and a figure at the right. That is the shape the critic found on Review ("Rules and Review are one shape", OPEN in `built-critique-m3-2.md`).

## 5. Directions

There are four compositions. None is a list beside a detail, and none is a stack of bars.

They exclude the references other rows already claim:
- Rules' built row: Natural Language Form, Stripe test impact, Statsig, Hazel, Watchtower.
- Review: Xero, Snyk, Search Console, Sentry.
- Fitment: RockAuto, npm, PageSpeed.
- Prices: Figma, Google Flights, Stripe pricing.

Only Linear's Triage Intelligence frames are used here, and no board has claimed those.

### A · The house rules: a document with a margin

**Composition.** Northside's rule book at one reading measure (about 68ch), dated in its head ("Northside's rules, as of 28 October").
- Its sections are named for what they govern: Trailers, Motors, Rigging, The boat.
- Each rule is a numbered clause with its underlined words, and the file's measured rules are clauses marked "measured".
- A wide outer margin carries two things only:
  - each clause's reach in small figures ("about n of 289 boats", from `pairReach`);
  - the noticed patterns as boxed questions: `1 Keep it as a warning · 2 Not a rule · 3 Later`.
- An off clause stays in place, with "off since 22 Oct" in small capitals after its number. It is never struck and never red.
- A new rule is typed at a cursor at the end of a section.

**Order.** Subject, then clause, then margin.

**Exclusives.** `live2/ramp-policy-suggestions.png` and `live2/ramp-policy-doc.png`.

**Only here.** The rules read as a page the owner could print and sign.

**Reflow.**
- At 390 the margin folds under its clause as an inset.
- At 834 the margin is 200 px.
- At 1920 the measure holds and the margin is 320, with the water either side.

**Northside sets** the section order and the title line.

### B · The reach: one rule against the whole file

**Composition.** The rule being written sits small at the head, and the page is given to a **field of 289 boat marks**, one per model in maker rows.
- A mark is lit where the rule is about that boat.
- It is hollow where the cell is blank, and that is said: "n boats have no steering in the file; this rule says nothing about them".
- Beside it, a field of 241 motors has the refused ones struck.
- Below both sit the census in Stripe's split, then the Fastmail fork ("the n drafts standing now cannot be given · from the next pick"), then the act.

**Order.** Reach first, the sentence second, the act last. It is grouped by consequence: refused, warned, untouched, unreadable.

**Exclusives.** `live2/stripe-radar-backtest.png` and `live2/fastmail-art-2.png`.

**Only here.** A rule's whole consequence in one look, including what it cannot see.

**Reflow.**
- At 390 each maker is a strip that scrolls inside its band.
- At 834 the makers run in two rows.
- At 1920 the two fields stand side by side.

**Northside sets** which makers lead.

### C · The spine: rules in the order the build reads them

**Composition.** One vertical spine.
- Its head is "When a boat is picked, the build [obeys] Northside's rules", with the master switch inside the sentence.
- Below the head come, in order: the price list's measured rules; Northside's own, each a sentence node with its state word in the line ("…, and the build [refuses] it, because …"); and the noticed patterns, dashed and "warns".
- The foot is the fall-through: "Everything else the price list pairs is offered."
- A `+` between nodes inserts a sentence at that point.

**Order.** By authority: file, Northside, noticed, default. The grouping is the reading order.

**Exclusives.** `live2/launchdarkly-rules-list.png` and `live/github-rule-insights.png`.

**Only here.** Why a motor is or is not offered becomes a path read top to bottom.

**Reflow.**
- At 390 the spine runs in a 16 px gutter.
- At 834 it is 600 wide.
- At 1920 it holds at 760, and a pressed node's census opens to its right. The spine stays the page.

**Northside sets** the master sentence's verb.

### D · The specimen wall: each rule as the card the salesperson sees

**Composition.** A grid of cards, each drawn as the build will show it at the desk.
- The head names the source: "Northside's rule", or "Noticed in your price list" in a dashed outline.
- The card strikes the refused motor, makes the next offered motor the act, and gives the because.
- Turned over, a card is its sentence with underlined words, plus its reach.
- An off card says "off — the build offers it".

**Order.** Grouped by what the customer is refused (motors, trailers, rigging), with those that refuse most first.

**Exclusives.** `live2/grammarly-company-rule.png` and `live2/linear-ti-why.png`.

**Only here.** A dealer edits the very card a salesperson will read, which is the exit criterion made visible.

**Reflow.**
- At 390 the cards are one column, and a flip opens a sheet.
- At 834 there are two columns.
- At 1920 there are four.

**Northside sets** the source label's wording.

**The sweep's lean.** C, with B's field opening on a pressed node: together they answer reach, off and noticed in one place.
- A is the simplest if the owner reads rules as policy.
- D is the riskiest, because a wall of cards drifts toward the repeated shape the critic named.

## 6. Imagery

Rules is a Cockpit screen and **needs no photography**. A boat beside a sentence makes the boat the subject, and B draws each model as a mark, not a picture.

What the seed can honestly put here on day one:
- 0 rules Northside has written.
- 16 rules measured from the workbook, each with its numerator and denominator.
- The refuted candidates, each with its killing number.
- One admitted pattern at 626 of 626.
- Every count from `pairReach`.

Not: a history of firings, a priced fix, or a rule in quotation marks.
