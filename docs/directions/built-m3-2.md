# Milestone 3, the second verify round (2026-10-22)

This round re-verified the tree the fix round left against `built-critique-m3.md`. The full gate ran alone. Then the built app was served (`npx vite preview --port 5901`) and walked at 1440 × 900, 1280 × 800, 390 × 844 and 1920 × 1080. The walk was a Playwright script in a fresh browser at each size (deviceScaleFactor 1, so none of the MCP browser's 67% zoom on `localhost`), and every screenshot was read by eye.

The new shots are `docs/directions/<screen>/built/m3-2-<width>-*.png`, 120 of them. The first round's `m3-*` shots stay beside them as the "before" that the critique cites. No `FAULT-*.png` exists anywhere under `docs/directions`, so there was none to delete. The harness scrolled the four "off" shots of Rules while pressing the switch, so they were deleted. `rules/built/m3-2-1440-off-top.png` is the true off state, and `m3-2-1440-from-build.png` is the arrival from the build's "See the rule", which lands at the top with the rule in view.

**The tree is still not committed.** HEAD is `3c8a46f`, and all of Milestone 3 and its fixes are in the working tree.

## The gate, alone, on this tree

| check | reading |
|---|---|
| `npm test` | **green**: 253 test files, 4,180 tests, 17 static rules, no failures. Typecheck, lint and format pass (337 s wall). |
| `npm run build` | **green, with one warning.** The `ui` chunk is **694,827 bytes**, 194,827 over Vite's line (it was 694,075 at the first verify). `pictures-*.js` is 585,673 bytes. |
| `npm run e2e` | **2,154 tests: 1,660 passed, 493 skipped by design, 1 failed** (2.0 h, 2 workers, 7,270 s wall). |
| `--last-failed --timeout 120000 --workers 1` | **1 of 1 passed** (6.8 s), and again 3 of 3 with `--repeat-each 3` at its own 30 s timeout (6.6–6.7 s each). |

**The one red was the machine, not the app.** `[tablet] quotes.spec.ts:153`, "the register opens the document it just listed", timed out in `throughTheDoor`. The page was still on `/sign-in` with the name typed when the test's 30 s ran out: the door's read of 53 tables did not finish in 30 s under two workers. Alone it reaches the quote in under 7 s, four times out of four. Nothing was changed.

**The first round's five reds are gone.** `shell.spec.ts:205` and `:556` pass at six sizes, and the refusal board (`refusal.spec.ts:178`, `fixture.spec.ts:364`, `:422`) reads every refusal by day and by night.

## The exit criterion, end to end

**It holds at all four sizes.**

1. I came into Rules from Data's head, chose steering · tiller · controls · Tiller handle, typed the because and pressed "Add it, refusing". The census read 245 of 810 boats, 45 of 540 taken away and 171 of 241 refused. The cost read "The Highfield Classic 340 loses the Yamaha F25SWTC, and 4 more models lose one too".
2. **On the next pick** (the Classic 340), the motor chapter read "Not offered on this boat: the Yamaha F25SWTC, because a tiller boat has no helm to steer a remote motor from. Your rule: … See the rule". The F25SWTC was gone from the list and from Show all, and the way back read "Back to the 2 made for this boat".
3. "See the rule" landed on the rule, scrolled to the top. I switched it off. The switch reads Off, the census says "taken away once it is on", and the cost says "Nothing today: it is off. Switched on, the Highfield Classic 340 would lose …". Back in the build, the F25SWTC is on the list with no sentence.
4. Pressing "warns" acts at once, and there is no "Keep the change" button. Leaving by the pill, the toast did not follow to Quotes. The build lists the F25SWTC under "Your rule warns about the Yamaha F25SWTC, because …".
5. I gave the quote to Rose Kelleher and opened its paper.

No page error and no console error was raised at any size.

## Per screen: what changed since the first critique, and what is still wrong

### Data (`/data`): the rooms have doors (blocker 1, **fixed**)
- **Changed.** A white capsule at the head carries Rules · Fitment · Review "170 to fix" · Prices. On a phone it sits as a two-by-two under the date. Each opens its room with Data lit, and the pill is five doors at every size, with no `hand: false`.
- **Changed.** A maker's spread now ends on "What fits the Stacer 309 Skimma", which opens Fitment, and "Cash · Trade · Warranty" opens Prices at that maker.
- **Still wrong:**
  - The spread still says "WHERE FROM: Boat Module (5).xlsx, on its Boat Module tab".
  - Stabicraft's plate is still its name in type.

### Rules (`/rules`): **fixed**, except as noted
- **Changed:**
  - A spec is now the dealer's word. The boat's specs are maker, series, model, steering, shaft, length and max hp, and there is no Matrix and no Shaft Lgth. A figure is typed in place.
  - Refuses, warns and off act at once.
  - Off is true everywhere.
  - The row leads with the sale ("5 models lose a motor the price list makes for them").
  - The example is the same model on every load.
  - The silent no-op now says `NOTHING_TO_DO`.
- **Still wrong:**
  - At 390 the "Your rule is on" toast sits over "What it costs a sale today" and the head of "Yours" until it goes (`m3-2-390-written.png`).
  - The rule list's motor glyph is the only mark on the row. The price list's seven stated lines and three noticed ones are still the same white rounded bar as Review's folded checks.

### The build (`/quote/$id`)
- **Changed.** "Back to the 2 made for this boat" now agrees with Fitment.
- **Still wrong:**
  - Under "warns", the F25SWTC's own card carries no mark ("Yamaha F25SWTC 25 hp · 57 kg · 15″ shaft +$532"). The warning is only the sentence above the list, which scrolls away (`m3-2-1280-warns.png`).
  - The Classic 340's Tube Covers are still added with no price and said under the total, and the quote can be given with them.

### Fitment (`/fitment`): **fixed**
- **Changed:**
  - A boat with no photograph has no ring. The Classic 340 closes up into two columns, and on a phone the motor is the first plate.
  - Callout 3 is Dealer Fit and 4 is Parts at every size.
  - "Across 6 makers … Jeanneau 9".
  - The cold chooser lists every maker, counted.
  - The finder's "fitment" answers the Fitment door and the kits only.
- **Still wrong:**
  - **One fact, two values: the chooser's model counts disagree with Data, Home and Prices.** The chooser says Highfield 69 models and Stacer 73 models · 91 versions. Data, Home and Prices say Highfield 67 and Stacer 91 models. Stabicraft (14 · 37 against 37) and Surtees (18 · 19 against 19) also differ.
  - The inflatable Classic 340, with no trailer made for it, still gets the full "The other 434, and why each is not offered".
  - At 1280 the Highfield entry's "588 versions" wraps onto a second line.

### Prices (`/levels`): **fixed**
- **Changed:**
  - It is one ladder in two flights of seven, and every mark has its column's width, ePropulsion's included.
  - The row of "5 costs" is gone, and Highfield counts 67.
  - **The step line and its Undo still stand 12 s after a 91-cell write.** Undo says "Undone — Trade is 95% of Cash on 91 Stacer boats. Put it back".
  - No list's head sits under the pill. Only ordinary content scrolls under it, behind the pill's edge.
- **Still wrong:**
  - Haines Signature's Trade cell is blank, while every other cell says a fact.
  - After a write the census reads "0 · 0 · 0" while the amber "Set on every Stacer boat" stays lit. Its refusal does stand under it ("already holds 95%").
  - Stabicraft's head is its name in type.

### Review (`/review`): **fixed**
- **Changed.** The head, the money and the checks stand in one column: x 300–1620 at 1920, 60–1380 at 1440, 32–1248 at 1280 and 16–374 at 390. One press fixed the ALP 5.3M ($819 → $702 on 6), and Undo put it back with "Undone — …". The toast was gone on History.
- **Still wrong.** File words: "two Code and two CTD", and "MACKAY PU Series Trailer - PU5000-14-M".

### The shell
- **Changed:**
  - **A toast goes with its screen.** No rule or review toast stood on Quotes or History at any size.
  - The finder no longer lists six makers for "fitment".
- **Still wrong.** Home's field and the pill's Find are still two doors to one finder.

### The sheet (`/data/$table`): **not fixed** (the critique's major)
- **At 390 an edit's sentence and Undo are still under the open record.** I typed Cash $3,100 on the RU230KAM. The figure changed in the record, and `last-step` ("Cell edit · Highfield Inflatables · Cash on Highfield - RU230KAM (PVC) WH: $2,770 → $3,100 · Undo") stands at y 750, under `.sh-record__acts`, which is what a press there hits (`sheet/built/m3-2-390-edited.png`). The cause is that `.sh-foot` is `position: absolute; z-index: 4` inside the sheet, while `.sh-over` is `position: fixed; z-index: 15`. The likely fix is one rule in the hand's media block: raise `.sh-foot` over the record while it is open, and pad the record's foot by the step's height.
- **Still wrong.** The record still ends on "Boat Module (5).xlsx · sheet "Boat Module", rows 281–948 under the yellow brand banner at row 278 … 588 of 588 SKUs seeded." It is still titled by its file code.

### The document (`/quote/$id/document`): **not fixed**
- The given paper still numbers its sections **01 The hull, 02 Motor, 04 Dealer fit**, with no 03 because there is no trailer. This holds at all four sizes.
- "Price to be confirmed" prints on the given quote.
- The cover is the Highfield wordmark on a grey block.
- Page 1 is half empty under "Prepared by".
- "Terms: None set yet" is said in the dealer's rail. No screen sets terms.

### Quotes (`/quotes`)
- **Still wrong.** At 1920, with one draft, the left pane is a 1,000 × 800 white field with a huge Highfield wordmark and "No photograph of this boat yet." beside "Press a quote to see it" (`quotes/built/m3-2-1920-after-rule.png`).

### Entry, Home, History, Customers
- These were walked and are clean at four sizes, with no sideways scroll.

## Docs fixed in this round
- `docs/SCREENS.md` held eight "fixed against the critique" rows in the screens table. Four of them repeated their screen's primary references ("as above") and four said "none new", against the rule that no two rows share a primary reference set. One (the shell's) had only three of the six columns. They are now a list under "Milestone 3, fixed against the first critique", and the table again holds one row per screen.

## Everything still wrong, in order
1. **The sheet at 390: an edit's sentence and Undo are hidden under the open record.** This is the critique's major, unfixed.
2. **The given document is numbered 01, 02, 04,** and prints "Price to be confirmed".
3. **Fitment's chooser counts models differently from Data, Home and Prices** (Highfield 69 against 67, Stacer 73 against 91).
4. **File words still reach the dealer:**
   - Data: "Boat Module (5).xlsx"
   - The sheet's record: its banner note and its file-code title
   - Review: "CTD" and the Mackay code
   - The document's rail: "Highfield - CL340 (PVC) W-W-WD"
5. Quotes at 1920 with one quote reads as a placeholder.
6. A warned motor's card has no mark.
7. At 390, Rules' toast covers the cost line.
8. The inflatable gets the full 434-trailer census.
9. Prices' blank Haines Trade cell.
10. Stabicraft is set in type on Data and Prices.
11. The `ui` chunk is 694,827 bytes.
12. **Milestone 3 is uncommitted.**

The owner has not looked at any of it.
