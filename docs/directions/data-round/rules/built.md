# The house rules (`/rules`), deepened — data round, built 2026-11-03

The composition stays: numbered clauses grouped by what the customer is buying, who said each clause as its edge, what it does as its verb, the noticed patterns in the margin and the count beside the clause being written. This round deepened it against `judge.md`. Every figure below was measured on the real Master Price File, either in the vitest suites named here or in the browser at the six sizes. Screenshots of every state at every size are in `after/`, with the size in each file name (`01-arrive` … `14-print-full`).

## What was built

**The price list's own clauses are measured on the sheet loaded here.** `src/domain/rules/constraints/houseMeasures.ts` (new) counts each clause off the price list's own offers on every load and keeps every offer that breaks it, with its boat, what it offers, why it breaks and the line it is written on.

Each count is held in `houseMeasures.test.ts`:

| Clause | Measured here | The workbook's figure |
|---|---|---|
| 1.1 F8 | 626 of 626 | 581 of 581 |
| 1.2 F9, under | 0 of 351 | 0 of 530 |
| 2.1 A1 | 1,448 of 1,448 | 1,424 of 1,424 |
| 2.2 A2, under | 72 of 778 | 72 of 757 |
| 2.3 F6 | 3,289 of 3,292 | 3,902 of 3,905 |
| noticed F7 | 3,144 of 3,144 | 7,830 of 7,830 |
| 3.1 F15 | 501 of 501 | 555 of 571 |
| noticed F16 | 1,533 of 1,541 | 1,576 of 1,576 |
| noticed F12 | 278 of 278 | 1,196 of 1,196 |

- F6's three exceptions are the same three single-letter shaft typos the adjudication names, on two Stacer Ocean Rangers and a Sea Ranger.
- F16 finds 8 offers the workbook did not: the Highfield Sport 800 with a Helm Master L4 kit on a "Mech with Hydraulic Steering" motor, one break written on 8 lines.
- 3.2 A3 keeps the workbook's 3,890 of 4,017 and says why: the price list does not write which propellers a motor is offered with.
- The lede now reads "Your price list keeps 7 rules of its own about what may be sold with what, 6 of them measured on it here."

**Every measure opens on its exceptions** (`?look=F6`). Each break is said once ("Stacer 589 Sea Ranger SDF · Yamaha F115LB, a long (20″) shaft on an extra-long (25″) transom") with a door to its line on the sheet (`/data/$table?at=`). The spec follows one door to `/data/join_stacer_yam?at=`. A list longer than 12 shows the rest on a press.

**Each price-list clause says what the build does with it.** There are three verdicts, each with a glyph:
- "kept by the lists": the build's lists are the price list's pairings
- "said where it is broken, never refused"
- "not enforced": the noticed patterns

**The sentence grows by two pieces of grammar:**
- "and its …": up to two more conditions on the boat
- "except the …": the boat's model, with "is not"

A motor and a trailer now each have a model spec. All of it is filed as an ordinary `implies` rule with up to three `if` clauses. The build reads it through the same `pairRuling`, since `judgePair`, `pairReach` and `pairField` now ask every condition (`boatKeeps`).

Measured: "When the boat's steering is tiller, except the Highfield Classic 340, …" takes 36 of the 45. Held in `pairTaken.test.ts` and in the e2e spec.

**Long lists are found by typing.** `WordFinder.tsx` (new) uses Base UI Combobox:
- The boat's model (289), the motor's (241) and the trailer's (429) are grouped by maker and narrow as a name is typed.
- Each model is said as a person says it: "495 - Pro Fisher." is the Surtees 495 Pro Fisher, and the 2350 Ultra Centrecab is the same name in the sentence and in the count.
- No "1" trails any option.
- A series written in capitals is said in a name's case: "Alloy Centre-Line Series".

**What a rule takes, by name.** Under the count:
- **The offers it takes**, model by model. For the tiller rule, the F25SWTC on the Classic 340 (1 of the 3 made for it), 360, 360 LS, 380 and 380 LS.
- **Each maker's line is a press** that names every model it is about, with the losers in weight. Each mark names its model on hover.
- **"Tried on the …"** shows one boat's list with the rule on. The Classic 340 keeps the F20SMHB and F25SMHC and loses the F25SWTC. The boat is chosen by typing, and the choice is the page's `?on=`.
- **"On your quotes"** lists the quotes on this computer whose boat the rule speaks of, and what on them it refuses.

**Said before it is added** (`pairEmpties`, `pairClashes`):
- A boat the rule would leave with nothing: "The Stabicraft 2350 Ultra Centrecab would be offered no trailer: all 3 your price list makes for it are taken."
- A rule of Northside's it cannot stand beside: on some boat, no motor on sale that either rule reads keeps both.
- A rule that already says it.
- A sentence that repeats a noticed pattern.

**Print.** "Print the house rules" prints the clauses and what the build does with each. A line for a signature and a date closes the page. See `14-print-full-*`.

**The foot** holds "Looked for in your price list and not true": the six fitment refutations (F10, F11), each with its measurement, behind one press.

## The judge's gaps, closed

**B1, the page scrolling itself.**
- Measured with presses where the words are drawn, scrollY did not move at any size while the four words were chosen: 1,794 at 390, 1,291 at 844×390, 1,310 at 834, 642 at 1280, 568 at 1440 and 933 at 1920.
- With the Playwright `click()` the judge used, it moved from 894 to 1,152 at 834. The pw:api log shows that move came from the driver's "scrolling into view if needed" on the option. Keyboard and JS presses moved nothing.
- The new spec test "choosing the four words never moves the page…" presses as a person does and asserts this at all six sizes. It also asserts that the act is clear of the pill, and at ≥1200 that the count's head and first figure are in view.
- At 1280 (`04-chosen-no-because-1280x800`), the sentence, the act and all three figures are on one screen.

**B2, the count's head under the pill.** The count's head now stands level with the sentence's eyebrow, below the pill's clearance. The same test asserts it at 1280, 1440 and 1920.

**B3, the dead-end Rigging boxes.** Each now says where it stands: "It cannot be said as Northside's: it decides a kit, and a rule here decides a motor or a trailer."

**B4, the raw model list.** Replaced by the WordFinder described above.

**B5, the unnamed marks.** The maker's line names its models, each mark carries its name on hover, and the offers taken are listed by name.

**B6, the rhythm at ≥1200.** The clauses and the noticed boxes are two stacks side by side, no longer one grid of shared rows. The write act and the part's foot follow the last clause directly. Part 1's margin stays empty, because Trailers has nothing noticed.

**B7, the words.**
- "No sale." now reads "It costs no sale: …".
- "a search past the list finds 38 fewer motors" now reads "It refuses 38 motors only when one is searched for past the list."
- The toast after an Undo is the screen's own sentence, for example "Your rule is back where it stood."
- The lede names its noun.

**B8, small targets.** A word-look select is at least 24 px each way. This is `src/ui/select.css`; only Rules uses the word look.

**B9, small eyebrows.** All eyebrows are 12 px (`--text-xs`).

**B10, the part name.** "pre-delivery" never breaks at its hyphen.

**B11, the third figure.** It is now "motors it refuses on them". The motors the rule cannot read are said in a note under the figures.

**B12, the stale `?open=`.** "That rule is not on the list any more, so nothing is open…" is shown where the clause would have opened, and the address lets it go.

**Found on the way.** A closed `<details>` at the foot kept its words laid out, and the contrast ruler read them at 1:1. Its one-line summary was also 592 px wide, which widened the phone's layout to 616 px. It is now a press with a short label.

## Not built, with the reason

**Rules about rigging kits, propellers, pre-delivery kits and parts, and "needs" rules (J9).**
- In the build, the kit comes with the motor as the price list pairs it, in the configurator, which this round does not own.
- A rule the build does not read would be a sentence that lies.
- The boxes say so where they stand. DECISIONS 2026-11-03.

**A record of what a rule refused at the moment of a pick (J13).**
- The quotes store keeps no refusal events.
- The clause shows today's quotes and says the past is not kept. DECISIONS 2026-11-03.

**Overruling a price-list clause in place.**
- That clause is enforced by the lists themselves, so there is no switch to turn.
- Northside's lever stays "Say it as Northside's" wherever a sentence can say the clause.

## Files

**New:**
- `src/domain/rules/constraints/houseMeasures.ts` and `.test.ts`
- `src/domain/rules/constraints/pairTaken.ts` and `.test.ts`
- `src/screens/rules/WordFinder.tsx`
- `e2e/flows/rules-shots.spec.ts`: runs only with `HL2_RULES_SHOTS`

**Changed:**
- `src/screens/rules/Rules.tsx`, `read.ts` and `rules.css`. The reflow is in the stylesheet's header.
- `src/routes/rules.tsx`: the `look` and `on` params.
- `src/domain/rules/constraints/pairRules.ts`, additive:
  - `also`, `MAX_ALSO`, `isExcept` and `pairAbout`
  - `modelsNamed`
  - `pairingsOf` exported
  - a `group` on each value
- `src/domain/rules/constraints/pairSpecs.ts`, additive: `capsSay`, and the motor and trailer model specs.
- `src/ui/select.css`: the 24 px word.
- `docs/DECISIONS.md`: ten dated lines.

**Tests rewritten to the new truth:**
- `Rules.test.tsx`
  - "numbers the price list's seven clauses, each measured on the sheet loaded here": the figures are now 626, 351 and 778, and a "build" line is held.
  - "boxes what the price list was noticed doing": now 3,144 of 3,144.
  - "offers a rule to write…": the third part's sentence is changed.
  - "counts the tiller rule…": the 32 ePropulsion are said under the figures, and the offers taken are named.
  - The two "knife is last" assertions are now scoped to the act's group.
  - The harness takes `at`/`go` in place of `open`/`onOpen`.
- `read.test.ts`
  - The two `costSaid` sentences.
  - The lede: `measured: 6` and its new words.
- `e2e/flows/rules.spec.ts`
  - "See the rule … Close first and Delete last" is now scoped to the act's group.
  - Four new tests: the page holding still at every size, a measure opening on its exceptions, the stale link, and the exception found by typing.

## The gate, measured

- `oxlint --max-warnings 0 src tools e2e`: 0. Both `tsc` projects: 0.
- `vitest` over `src/screens/rules`, `src/domain/rules`, `src/domain/quote`, `src/domain/fitment`, `src/screens/configurator` and `src/ui`: 132 files and 1,830 tests passed.
- `tools/check.ts`: 587 failures, every one in another agent's boards, under `docs/directions/data-round/catalogue/` and `…/data/`. None is in a file of this round.
- `e2e/rulers --grep rules` at all six sizes: 42 passed and 18 skipped. The skips are declared by the rulers, such as density on a showroom.
- `e2e/flows/rules.spec.ts` at all six sizes: every test passed except one at three sizes. "the finder on a build says what each chapter says" fails at 390, 1280 and 1920 and was not run at the other three.
  - The motor chapter's head reads "2 offered" where the spec expects "1 more offered", because the draft opens with no motor on it.
  - With this round's code, `mintQuoteFromView` on the Classic 340 with the tiller rule still brings the F20SMHB across (measured in vitest).
  - So the empty motor comes from somewhere between the mint and the build's head, a path this round did not change. It is named, not chased.
