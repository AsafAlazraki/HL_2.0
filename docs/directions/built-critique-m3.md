# Milestone 3, the independent critique of the rebuild (2026-10-28)

This replaces the 2026-10-22 critique, which is still in git at `a77b1dc`.

**What I read:**
- the top of STATUS, CLAUDE.md, the four new rows in SCREENS (108–111) and `built-m3.md` (the verify of 2026-10-28);
- the shots under `{rules,fitment,review,levels}/built/m3-3-*`, plus the configurator, document, data and quotes shots of the same walk;
- the source a shot cannot show: `src/screens/{rules,fitment,review,levels}`, `src/screens/configurator/{say.ts,Configurator.tsx}`, `src/domain/rules/constraints/ruleLedger.ts`, `src/state/catalogue.ts`, and the seed's `dealer_fit.json`.

**The exit criterion is true end to end.**
- A rule written on Rules takes the Yamaha F25SWTC off the Classic 340's motor list on the next pick. The motor chapter says "Not offered on this boat: … because a tiller boat has no helm to steer a remote motor from".
- The because is the rule's own (`rule.because`, read in `RuleSays`), not text written in a component.
- Off brings the motor back. The finder is not a way round the rule.
- No colour, face or picture path is hard-coded in the four screens' CSS or TSX, and no type is under 11px (`--text-2xs`).

## Blockers

1. **The build and the paper say a price is missing when the price list has it.**
   - **What the build says.** The Classic 340 build says, under its total: "Dealer Fit Packages have no price on the price list, so the Tube Covers to suit PVC Boat · 3.4 Mtr is not in this total" (`configurator/built/m3-3-1440-refused-by-rule.png`, written by `totalNoteSay` in `src/screens/configurator/say.ts`).
   - **What the file holds.** The seed's row for that line, `dealer_fit.json` "Tube Covers to suit PVC Boat - 3.4 Mtr", carries Parts Sell $2,790, Act Sell $2,834 and Sell $2,790.
   - **What Prices says.** The screen this milestone built says the true thing: "Your price list holds two sell figures for each dealer fit package and names none of them."
   - **Result.** The build's sentence is false on this tree. The build never sends the dealer to Prices, where one press settles it. The given paper then prints "Price to be confirmed" on that line, under a "Total, tax included $11,686" that leaves it out without a word (`document/built/m3-3-1440-print-media-full.png`).
   - **The fix.** The build and Prices must say one fact.
2. **Two derivations sit in components, not in `src/domain`.** Both are small to move.
   - `Rules.tsx:686–700` counts the drafts a rule would hold (`drafts.filter(q => refusedOnQuote(…))`) inside a `useMemo`. The page prints that count ("No draft is standing today").
   - `Fitment.tsx:534` re-derives what a rule leaves offered (`trailer.made.filter(t => t.rule?.severity !== 'blocked')`). `boat.ts:142` already computes `offered = made.length - refusing.length`. With two derivations, the plate's count and the list under it can drift apart.

## Majors

3. **Undo's toast reads as the opposite of the truth, on every screen.**
   - `state/catalogue.ts:611` prefixes the original sentence: "Undone — Trade is 95% of Cash on 91 Stacer boats." has a green tick, on a tile that now says "One price for every buyer" (`levels/built/m3-3-1440-undone.png`).
   - Review's says "Undone — Dunbier ALP 5.3M-13B … is registered Large at $283, and sells at $11,483." It is Small at $166 again.
   - Someone reading only the toast will believe the change stands.
4. **Rules' measure lines contradict each other.**
   - **Labels that do not match their units.** `ruleLedger.ts` labels cells as things. 2.3 holds on "3,902 of 3,905 motors offered on a boat", and the noticed box beside it holds on "7,830 of 7,830 motors offered on a remote boat". That is more motors on a remote boat than on any boat, under a head that says "241 on sale". 1.1 and 1.2 both count "boats and trailers the price list lists together", as 581 and as 530.
   - **"Never refused" clauses with a measure.** 1.2 is measured "530 of 530", and 2.2 is measured "685 of 757". A dealer reads 2.2 as 72 motors refused.
   - **The fix.** Each measure needs the noun it actually counted. A "never refused" clause needs a measure of what it says, or none.
5. **Fitment strikes things it says are not ruled out.** The trailer reason "Its series names no boat maker: not ruled out, and not made for this boat" (291) shows its example struck: ~~DUNBIER Alloy Centre Line · ACL 5.3M-13BH~~ (`fitment/built/m3-3-1440-cl340-trailer.png`). A strike means refused, and the sentence beside it says the opposite.
6. **Fitment's "Show these N" is a wall of strikethrough.** Seventy-four rows all struck under a head that already says why. It reads as a deleted list, not a list to read, and the figure column starts at a different x on the lit row (`m3-3-1440-sp660-show-these.png`). Strike only the example on the reason row. Inside a named group, the group's head is the reason.
7. **Fitment's cold landing loses its idea.**
   - `/fitment` with no boat is a near-empty page: one field, then seven makers each with the same generic glyph. Home and Data already draw the makers' marks (`m3-3-1440-chooser.png`).
   - The same line says "289 boats" and "67 models".
   - A stakeholder pressing Fitment sees nothing of the plate until they choose.
8. **Rules at 390 separates the act from its input.** The because field sits above the census, and "Add it as 2.4" sits about 700 px below it, under every maker's dots (`rules/built/m3-3-390-counted.png`). After the press, the page jumps to the top and the clause just written is out of sight (verify). On a phone the writer can't see the act and then can't see the result.
9. **The way from the build to the rule lands at the top of the page.** "See the rule" opens `/rules?open=…` with the rule about 740 px down. This is the exit criterion's own return path, and it has to land on the clause.
10. **Two pairs of rooms read as one shape.**
    - Prices' "Worked from cost" slab and Fitment's plate are both a near-black rounded band with white type under a small-caps eyebrow, in sibling rooms behind the same Data door.
    - Fitment's reason rows and Rules' clauses are both a white card of rows with a figure, a sentence and doors on the right.
11. **One fact, two figures.**
    - **Trailers.** Prices counts "444 trailers", and Rules and Fitment count 434 on sale.
    - **Boats and models.** Prices says Highfield is "67 models" while every other tile counts boats.
    - **"Fits N boats".** Data's "fits 6 boats" (Yamaha) counts makers' lists, against Rules' 289 boats.
    - **A build's motors.** The finder says "2 more offered" where the motor chapter says "1 more offered".
    - **Review.** Its count reads "69 to settle" next to "Case 1 of 37", and Data's door says "69 to fix".
12. **The sheet at 390 still cannot take an edit back.** The step sentence and its Undo are under the open record (verify, `sheet/built/m3-3-390-edited.png`). This was a major in the last critique and it is still open.
13. **File words still reach the dealer on the new screens.** Each needs the name a person says.
    - **Review:** "ATM (KG)", "Rego ($)", "Registration Costs!C16/C17" and "Dunbier Trailers · 9304 + 9083L".
    - **Fitment:** "Yam - F115XB + LF115XB", "GFAB Tandem Axel Trailer t/s Highfield Patrol 600" and "Stacer - ALLOY w Skids".
    - **The document rail:** "Highfield - CL340 (PVC) W-W-WD".

## Minors

- Fitment's plate says "1 Dealer Fit Packages", a plural on the hero.
- The SP660's band carries bare "2" and "5" over its pins, with no unit.
- Fitment's rolling count is announced as "2 3".
- The inflatable gets the 434-trailer census.
- Review has no screen name. A stakeholder arriving by link sees "69" and a rail, not "Review".
- After Undo, Review leaves case 2 on the stage, not the case taken back.
- Prices' step card takes a grid cell and leaves a hole in the tile grid at 1440 and at 390.
- Prices' Yamaha line does not say what a quote shows today, as the other three lines do.
- Prices' Factory packages line offers "$69,716 or $69,716".
- Rules with no file says "every rule is written on its own words".
- Rules' part 3 has no glyph where parts 1 and 2 have one.
- An "Esc" keycap is shown on a phone.
- Stabicraft is in type on Data, Fitment and Prices, and Haines and Jeanneau are faint on Prices.
- Milestone 3 is uncommitted against the owner's "push regularly". The `ui` chunk is 694,951 bytes.

## Would he accept it

**No.**
- **What he'd like.** Rules finally reads as a page Northside could sign, and Review's one case on a stage is the best this app has made of a complex topic.
- **Where it falls down.** The milestone is "the dealer sets what things cost", and the first full quote he walks contradicts it. The build says the tube covers have no price on the price list. Prices, one door away, shows the figures. The paper he would hand Rose Kelleher prints "Price to be confirmed" under a total that leaves it out.

**Change first:** make the build, the paper and Prices say one fact about an unchosen price. Say the true sentence ("Northside has not chosen which figure prices a dealer fit package"), with the door to that line on Prices. Once it is chosen there, the line is priced on the next quote, and a quote still carrying an unchosen line cannot be given. Today the paper says "Price to be confirmed" and the total says nothing.
