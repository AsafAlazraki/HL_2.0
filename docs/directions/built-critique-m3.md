# Milestone 3, the independent critique (2026-10-22)

Read: STATUS (top), CLAUDE.md, SCREENS (the four new rows), PLAN § Milestone 3, `built-m3.md`, every shot under `{rules,fitment,review,levels}/built/`, a sample of the configurator, document and data shots, and the source behind what a shot cannot show (`src/screens/{rules,fitment,levels,review}`, `src/app/ways.ts`, `src/domain/rules/constraints/pairRules.ts`, `src/domain/fitment/boat.ts`).

**The exit criterion is true.** Writing a rule changes what the build refuses on the next pick, with the rule's own because and a way back to the rule (`configurator/built/m3-1280-ruled.png`). Off brings the motor back. Warns warns. That's the milestone's sentence, and it holds.

**Would he accept the four screens on sight? No.** Review is close. Rules and Prices are good ideas with false or lost states in them. Fitment looks broken on any boat without a photograph. And three of the four can't be found by anyone who doesn't know the address.

**The one thing to change first: give the rooms their doors.** Make Data's plate line "PRICES: Cash · Trade · Warranty" open Prices at that maker. Make "What goes with it" (and the build's "n made for this boat") open Fitment for that boat. Put "n things wrong in your price list" on Data's head, opening Review. Put Rules on the phone's bar, or behind Data like the others. Without this, a stakeholder given a link never meets three quarters of the milestone, and the give-act's refusal ("let it reach a customer on Prices") points at a screen with no way in.

## Blockers

1. **Data / shell: three of the four screens have no door.** `ways.ts` puts `/fitment`, `/review` and `/levels` in `Door.rooms`, which only the finder draws. No anchor anywhere in `src/screens` or `src/routes` leads to them (grep). On the phone, Rules is `hand: false` and drops off the bar as soon as you leave it.
2. **Rules: an off rule says it still costs a sale.** `costSaid` (`screens/rules/read.ts`) picks `'loses'` for every verb but warns. With the rule switched off, the panel reads "The Highfield CL340 … loses the Yamaha F25SWTC, and 44 more boats lose one too". The census still reads "45 … taken away". The line above it reads "Off: it refuses nothing" (`rules/built/m3-1280-off.png`). That's a false statement on this tree.
3. **Rules: pressing refuses / warns / off on a written rule does nothing until a second press.** Leaving the page throws the change away with no warning. The verify walked it: "warns" pressed, the build opened, the rule was still off. The switch on the list beside it acts at once, so two controls own one state and behave differently.
4. **Fitment and the build: the count disagrees with what the build offers.** Fitment says "3 made for this boat" for the CL340 with the F25SWTC struck by the dealer's rule in the same list. The build's "Back to the 3 made for this boat" shows 2 offered and 1 refused.
5. **Gate: no refusal on this tree has been read for contrast.** `Tile tone="fix"` (new, for Review) is missing from `DRAWN_FOR` in `e2e/rulers/measure/refusals.ts`, so the refusal board and `refusal.spec.ts` fail before they measure. Two phone shell specs fail because of `hand: false`. Contrast at or above 4.5:1 is unproven on every refusal.

## Major

- **Rules says the file's column headers, where the app already says them in words.** The plate reads "When the boat's Eng Configuration is Tiller". The spec list offers Matrix, Shaft Lgth, Head/s and Boat Rego Decals. The sheet's `spokenFact` (DECISIONS) already says "tiller steer" and "short shaft". The F6 fold (S = 15″, L = 20″, XL = 25″) is in `workbookRules.ts`, yet the boat's shaft is L/S/XL and the motor's is 20″/25″ with nothing tying them together.
- **Rules can't name a maker, a model or a figure.** `pairColumns` keeps only text or select columns with 2 to N values. "A Haines boat never gets …" and "over 6 m …" can't be written. This is the "configurable without a developer" promise, cut at the first sentence a dealer would try.
- **Rules: the stated rules are typed in the screen.** `PRICE_LIST_SAYS` in `screens/rules/read.ts` rewords the engine's statements. F9 and A2 say "is flagged, never refused", but the build flags neither; only Fitment does.
- **Rules leads with the alarming figure, and its cost line is muddled.** The row reads "Refuses 171 motors on 245 boats" while the true cost is 45 pairings. "What it costs a sale today" runs a boat and three motors together as one list, and the boat it names changes from load to load.
- **Rules: the switch's label reads "On" beside an off switch.**
- **Prices: a 91-cell write is undone only from an 8.5-second toast.** There's no pinned step with Undo like the sheet has, and an undo says nothing.
- **Prices at 1280 and 1920: the ladder is crowded and partly covered.**
  - The marks are about 40px wide and illegible.
  - The ePropulsion column is just "32".
  - Fourteen cells read "5 costs".
  - The sticky head slides under the pill (`levels/built/m3-1920-census.png`).
- **Review at 1920: the money band isn't over its column.** The band runs x 32–1352; the title and checks run 300–1620 (`review/built/m3-1920.png`).
- **Fitment: a boat with no photograph looks broken.** Four numbered dots float around "No photograph of this boat yet", and at 390 it's a blank card. Callouts 3 and 4 swap between 1280 and 1920. "Across 7 makers" lists Jeanneau ranges. The struck example trailer changes from load to load.
- **Shell: toasts outlive their screen.** A rule's Undo stands on Quotes and History.
- **Sheet at 390: an edit's sentence and Undo sit under the open record.** The write happens and the person sees nothing.
- **Rules and Review read as one shape.** Rules' stated and noticed rows and Review's folded checks are the same white rounded bar: a title, a count, and a figure or "Open" at the right.
- **Document: the customer's paper isn't yet proud to send.**
  - Sections are numbered 01, 02, 04.
  - "Price to be confirmed" prints on a given quote. Prices can now choose Dealer Fit's column, so this is fixable from the back office.
  - "Terms: None set yet" prints, and no screen sets terms.
- **File words reach the dealer.**
  - "Boat Module (5).xlsx"
  - "CTD"
  - "Highfield - CL340 (PVC) W-W-WD" in Rules' cost line and Quotes' peek
  - The record's "rows 281–948 under the yellow brand banner"
- **Silent no-ops.** A command that returns `refused: ''` says nothing (`Levels.tsx`, `Rules.tsx` `apply`), which CLAUDE.md forbids.

## Minor

- A warned motor carries no mark on its own card. The refused F25SWTC's rigging kit and PDI are still offered by search.
- Prices' Yamaha "which figure" cards don't look pressable. Highfield counts 588 variants where the others count models.
- Fitment's cold chooser is one field on an empty page.
- The finder's "fitment" lists six boat makers above the fitment kits.
- The shell's `NO_FILE_YET` ("customers are all here") contradicts Customers ("saved with" the price list).
- The `ui` chunk is 694 kB (+191 kB).
- Milestone 3 is uncommitted, against CLAUDE.md's checkpoint rule.
