# Milestone 3, the second independent critique (2026-10-22)

## What I read and drove

**Read:**
- STATUS (top). It has no Milestone 3 section.
- CLAUDE.md, SCREENS, and PLAN § Milestone 3.
- `built-critique-m3.md` and `built-m3-2.md`.
- The `m3-2-*` shots for Rules, Fitment, Review, Prices, Data, the sheet, the document, Quotes and the build.

**Driven:** the built tree (`npm run build`, the same 694,827-byte `ui` chunk, `npx vite preview --port 5911`). I used a fresh Playwright Chromium at deviceScaleFactor 1, at 1280 × 800, 390 × 844 and 1920 × 1080, and every press went through the real door.

**Source checked:**
- `src/domain/quote/freeze.ts` (`mintQuoteFromView`)
- `src/screens/configurator/chapters.ts` (`rulingsFor`)
- `src/domain/rules/constraints/{pairRules,ruleLedger,workbookRules}.ts`
- `src/screens/sheet/sheet.css`
- `src/screens/data/Spread.tsx`
- `src/screens/review/Review.tsx`
- `src/screens/fitment/Fitment.tsx`

No file under `src/`, `e2e/` or `docs/` is newer than `built-m3-2.md`, so every OPEN item the verifier reported is still open on this tree.

Text under 11px: none on Rules, Fitment, Review, Prices or Data at 1280 or 390. Sideways scroll: 0 everywhere. Page errors: none. Console errors: none (only GL "ReadPixels" warnings).

## The verdict

**The exit criterion is not true in general. It is true only for the one walk the tests take.**

I wrote "When the boat's maker is Stacer, the motor's horsepower must be at most 20 hp", refusing, with a because. Rules counted it: 91 boats, 376 of 434 pairings taken away, and 62 models losing a motor. Then I started a new draft on the Stacer 659 Ocean Ranger Cen Cab. This is the very next pick, and the build:
- **put the refused Yamaha F130XA on the quote**, badged RECOMMENDED, at $18,009, with its rigging kit;
- printed, directly above that card, "Not offered on this boat: the Yamaha F130XA … One of them is on this quote already, and stays until you take it off";
- left the finale silent about it and "Give it to the customer" live;
- printed the given paper with "02 Motor · Yamaha F130XA · $18,009".

Fitment on a sister boat strikes the same motor as "refused by your rule" and still draws it as the boat's motor.

**The cause.** `mintQuoteFromView` (`src/domain/quote/freeze.ts`, `whatComesAcross`) brings the starred motor and trailer onto every new draft without ever reading `constraintDefs`. The tiller walk passes only because the Classic 340's star, the F20SMHB, is not the motor the rule refuses.

A dealer who writes the most ordinary rule there is ("not over X hp on this range", "not that trailer on this boat") gets a quote that sells exactly what they refused.

**Would he accept it? No.** Rules, Prices and Review are good screens now, and the doors are real. But the milestone's one sentence is false on the first rule he would try. The customer's paper is still not proud: 01, 02, 04, "Price to be confirmed", and a maker wordmark for a cover. And four screens count the same price list three ways.

**The one thing to change first:** make a new draft obey the dealer's rules. `mintQuoteFromView` must ask `pairRuling` before a star comes across, and bring the next offered partner (or none, said) when the star is refused. The finale must refuse "Give" while a refused line stands, with the rule's own because. Then pin it with a flow that writes a rule refusing a boat's starred motor, which the current spec never does.

## The first critique, item by item

| item | now | evidence |
|---|---|---|
| B1 three rooms have no door | **CLOSED** | Data's head carries Rules · Fitment · Review "170 to fix" · Prices (my 1280 shot). The pill has five doors. |
| B2 an off rule says it costs a sale | **CLOSED** | `m3-2-1440-off-top.png`. The cost reads "Nothing today: it is off" (`rules.spec.ts`). |
| B3 refuses/warns/off need a second press | **CLOSED** | I pressed "warns" once on the plate. The rule warned in the build on the next pick, and there is no "Keep the change". |
| B4 Fitment and the build count differently | **CLOSED for the tiller case** | Both say 2. The new blocker below is the same disagreement by another road: Fitment says the F130XA is refused, and the build puts it on. |
| B5 refusal board not read | **CLOSED (verifier's gate)** | I did not re-run the gate. `DRAWN_FOR` carries `fix`. |
| Rules speaks column headers | **CLOSED** | The specs are maker, series, model, steering, shaft, length and max hp. |
| Rules can't name a maker or figure | **CLOSED** | I wrote "maker is Stacer … at most 20 hp". |
| Stated rules typed in the screen | **CLOSED** | They are read from `ruleLedger.ts`. Only 10 of its 16 are drawn (see new findings). |
| Leads with the alarming figure, muddled cost | **CLOSED** | "62 models lose a motor the price list makes for them". |
| Switch reads On beside off | **CLOSED** | |
| Prices: Undo only in an 8.5 s toast | **CLOSED** | `levels/built/m3-2-1280-undone.png`: the step line and "Put it back" stand under the act. |
| Prices crowded at 1280/1920 | **CLOSED** | There are two flights, and every mark is at its column's width (my 1280 full shot). |
| Review money band off its column at 1920 | **CLOSED** | `review/built/m3-2-1920.png`. |
| Fitment: no photograph looks broken | **CLOSED** | Two columns, no rings. |
| Toasts outlive their screen | **CLOSED** | No rule toast on Quotes after leaving by the pill. |
| Sheet at 390: edit's Undo under the record | **OPEN** | `sheet.css:2821` sets `.sh-foot` to `inset-block-end: 0` only, still absolute at z-index 4 under `.sh-over` (fixed, z-index 15, line 2834). `sheet.spec.ts:534` skips the phone ("a hand edits in the record"), so the one path with the bug has no test. |
| Rules and Review one shape | **OPEN** | Rules' stated rows and Review's folded checks are still a white rounded bar: a bold title, a quiet line, and a figure or Open at the right. |
| Document not proud | **OPEN** | My given CL340 numbers its sections 01, 02, 04. My given Stacer prints "Rigging kit for the F130XA · Price to be confirmed". The cover is the STACER wordmark on a grey-blue block. Page 1 is half empty. The rail says "Terms: None set yet". |
| File words reach the dealer | **OPEN, and wider** | See "File words" below. |
| Silent no-ops | **CLOSED** | `NOTHING_TO_DO` is said. |
| Warned motor's card has no mark | **OPEN** | The F25SWTC card's text is "Yamaha F25SWTC / 25 hp · 57 kg · 15″ shaft / +$532", and its aria-label has no warning. |
| Yamaha "which figure" cards not pressable | **CLOSED, with a craft fault** | The radio ring now straddles the card's top-left corner. |
| Highfield counts versions | **OPEN elsewhere** | Prices says 67. Fitment's chooser says 69 · 588, and Rules' maker list says "Highfield 588". |
| Cold chooser is one field | **CLOSED** | |
| Finder "fitment" lists makers | **CLOSED** | |
| `NO_FILE_YET` contradiction | **CLOSED** | |
| `ui` chunk 694 kB | **OPEN** | 694,827 bytes. |
| Milestone uncommitted | **OPEN** | HEAD is `3c8a46f`. There are 227 changed or untracked paths, including `pairRules.ts`, `boat.ts`, four routes and four flows. |

## New and still-open findings

### Blockers

1. **The build: a refused partner is minted onto the next pick, then given and printed.** This is the evidence above. It holds for trailers too: the same `whatComesAcross` brings the starred trailer, and nothing reads the rules. The exit criterion is false for any rule that refuses a boat's star.

2. **Review and Fitment: derivations in the component body and in JSX.**
   - `Review.tsx:400–401` counts the over- and under-charged trailers inside `Money`, and those counts print "registration not charged on 7 trailers".
   - `Review.tsx:853` sums a list's lines inside the JSX `map`.
   - `Review.tsx:175` sums the tidy counts.
   - `Fitment.tsx:625` sums the other trailers.

   Each is small, but each is a fact derived on the screen and not in `read.ts` or the domain.

### Majors

3. **The build: a rule that warns never warns where it matters.** The warned F25SWTC's card carries no mark. Once it is chosen, the finale says nothing ("Yamaha F25SWTC already has pre-delivery in its Cash price." is the only line about it), and Give is live. The warning lives only in a sentence above a list that scrolls away.

4. **One price list, three sizes.** The same range of boats is counted three ways:
   - Data, Home, Prices and the picker: Highfield 67, and "All makers 289".
   - Fitment's chooser: Highfield "69 models · 588 versions", and Stacer "73 models · 91 versions" against 91.
   - Rules' maker list: "Highfield 588 · Stacer 91". Rules' census: "565 of 810 boats", "91 of 810 boats".

   A stakeholder who reads "810 boats" on Rules and "289" on the picker will ask which is true.

5. **Rules: one rule, two denominators on one screen.**
   - The price list's own remote/tiller line reads "across 7,830 motors offered on a remote boat".
   - The same sentence on the plate reads "of 3,144 motors the price list makes for them".

   One is workbook cells and the other is live pairings, and the screen says neither.

6. **The sheet at 390: the edit's sentence and Undo are hidden** (open, above).

7. **The document is still not proud to send** (open, above).
   - The finale offers "Put a price on this line" for an unpriced dealer-fit line and then gives the quote anyway, so "Price to be confirmed" reaches the customer.
   - Prices shows Dealer Fit 1,777 and Rigging Kits 650 as "Not priced · n figures to choose from". Until a figure is chosen there, every rigged quote prints this.

8. **Quotes at 1920 with one quote is a placeholder.** It is a 1,000 × 960 white field holding a 560px Highfield wordmark and "No photograph of this boat yet.", beside "Press a quote to see it". He would name it within a minute.

9. **File words still reach the dealer, and the customer:**
   - Data's spread: "Where from: Boat Module (5).xlsx", and "OBSOLETE Trailers — No Longer Available".
   - The sheet's record: the banner note and the file-code title.
   - Review: "two Code and two CTD", "MACKAY PU Series Trailer - PU5000-14-M", and "its Sell inc Rego".
   - Fitment's head: "Stacer › OCEAN RANGER SDFS › Stacer - 659 Ocean Ranger SDF · SCP659ORR".
   - Fitment's trailers lead with the code: "TAP2000T13RB · TP Alloy 2000 …", and a series reads "Stacer - ALLOY w Skids".
   - The document's rail: "On the price list: Stacer - 659 Ocean Ranger Cen Cab (H/Top)", and "Prop Part No. 6FP-459xx-xx; Prop Description PROPELLER - Alum Talon GP K Series; Engine Hole TBA".
   - On the customer's paper: "TP Alloy 2000 ATM T 13" Roller Braked · 5.9 - 6.2 m".

10. **Rules and Review are one shape** (open, above).

11. **Milestone 3 is uncommitted** (open, above). CLAUDE.md's checkpoint rule is broken, and a lost working tree loses the whole milestone.

### Minors

12. **Rules draws 10 of the 16 workbook rules the brief names, with no word on the rest.** Missing: prop part from description, engine labour from standard fit, deposit stages total 100, obsolete below 1005, rego band matches ATM, and registration fee read at one column. Some of them are Review's checks. The screen should say so in one line.
13. Rules at 390: the "Your rule is on" toast covers "What it costs a sale today" until it goes.
14. Fitment: the inflatable Classic 340, with no trailer made for it, still gets the full "The other 434" census.
15. Fitment repeats the because under each of the 11 struck motors. The build says it once per rule.
16. Fitment's cold chooser:
    - It draws the same generic boat glyph for all seven makers, where Data and Home use their marks.
    - Its units mix: "9 models" beside "69 models · 588 versions".
17. Prices:
    - Haines Signature's Trade cell is blank.
    - The Haines and Jeanneau marks are faint at their size.
    - The Yamaha cards' radio ring straddles the card corner.
18. Stabicraft is its name in type on Data, Prices and the picker, where it is set in capitals.
19. Rules' sentence reads "must be Tiller handle", with a capital in mid-sentence.
20. The `ui` chunk is 694,827 bytes.
21. Docs:
    - STATUS.md has no Milestone 3 section at its top.
    - SCREENS' "Measured on this tree" table has no row for Rules, Fitment, Review or Prices.

## Shots

My shots are in the session scratchpad, not the repository:
- `r1-motor-1280.png`: the refused F130XA "on the quote".
- `r2-finale-1280.png`: Give live.
- `r2-doc-1280-full.png`: printed with "Price to be confirmed".
- `r2-fit-1280.png`: Fitment strikes it.
- `r3-quotes-1920.png`: Quotes as a placeholder.

Nothing was written to the repository but this file. The preview on 5911 was stopped.
