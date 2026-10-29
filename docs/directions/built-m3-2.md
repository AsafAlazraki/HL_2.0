# Milestone 3, the second verify of the rebuild (2026-10-28)

This re-verifies the tree that the 2026-10-28 fix round left against `built-critique-m3.md` (the critique of the rebuild) and `built-m3.md` (its first verify). It replaces the 2026-10-22 `built-m3-2.md`, which is in git at `a77b1dc`.

**How it was walked.** The full gate ran alone first. Then the built app was served (`npx vite preview --port 5901`) and walked by a Playwright script in a cold Chromium at each size: 1440 × 900, 1280 × 800, 390 × 844 (touch) and 1920 × 1080, all at deviceScaleFactor 1. Every press went through the real door. Every screenshot cited here was read by eye. Two probes were run beside the walk:
- at 1440, a rule that refuses a boat's starred motor (the 2026-10-22 critique's blocker, which the tiller walk never tests);
- at 390, the sheet's edit and Undo in the record.

The new shots are `docs/directions/<screen>/built/m3-4-<width>-*.png`, 192 of them. The `m3-3-*` shots of the first verify stay beside them as the "before". No `FAULT-*.png` exists under `docs/directions`, so there was none to delete.

**Three fixes were made by this verify:**
- In the app, a sentence on Fitment's trailer place that was false whenever a rule refused a motor on the same boat (below, under Fitment). The shots of this walk were taken before it, except `fitment/built/m3-4-{1440,390}-cl340-trailer-fixed.png`.
- In the e2e walks, two red flows that the fix round's change to the shared walk had broken (below, under the gate).

## The gate, alone, on this tree

| check | reading |
|---|---|
| `npm test` | **green**: 261 test files, 4,269 tests, 17 static rules, no failures. Typecheck, lint (0 warnings) and format pass. Vitest took 318 s, and the whole command 424 s wall. |
| `npm run build` | **green, with one warning**: the chunk-size line. The `ui` chunk is **695,262 bytes** (694,951 at the first verify). `pictures-*.js` is 585,673 bytes and `index-*.js` 405,239. Built in 5.4 s. |
| `npm run e2e` | **2,292 tests: 1,767 passed, 514 skipped by design, 11 failed** (2.3 h with 2 workers, 8,247 s wall). |
| `--last-failed --timeout 120000 --workers 1` | **4 of 11 passed alone (the machine). 7 failed again (the app's own walks)**, 3.5 min. |
| after the fixes below, the 7 alone | **7 of 7 passed** (2.1 min). |
| after the fixes, every touched spec alone at six sizes | `fitment.spec.ts`, `history.spec.ts`, `customers.spec.ts:266`, `configurator.spec.ts:581` and `:1634`: **118 passed, 8 skipped by design, 0 failed** (16.1 min). Vitest on `src/domain/fitment` and `src/screens/fitment` passed 165 of 165. Typecheck, lint (0 warnings), prettier and `tools/check.ts` (17 rules) are green on the final tree. |

**Four reds were the machine.** Each passed alone at its own timeout:
- `[phone] configurator.spec.ts:1630`, the starred-motor rule
- `[phone] customers.spec.ts:266`
- `[tablet] cascade.spec.ts:347`
- `[tablet] configurator.spec.ts:452`

**Seven reds were real, and all seven came from the fix round's change to the shared walk.** `issueIt` and `toTheFinale` (`e2e/mint.ts`, `e2e/flows/configurator.spec.ts`) now open the finale and price what waits on Prices before naming the quote. Nothing under `src/` was wrong in either case. Both fixes are in `e2e/`:
- **`history.spec.ts:196`, six sizes, every time.** The diary now reads "started · prices updated · named", because the walk now presses "Price it at $…" between the start and the name. The assertion still said "started · named", a walk that no longer exists. The app says what happened, in the order it happened, on both reads. The expectation now names the press, with the reason in a comment.
- **`[phone-landscape] configurator.spec.ts:577`, every time.** With the finale open, pressing "Who it is for" folds the finale and brings the chapter in a beat later. At 844 × 390 the walk's press on "Put their name on it" landed in that beat, on a page still moving. The trace's last frame shows the name typed and not saved. Driven by hand with the page at rest, the name lands ("Who it is for · for R. Kelleher").
  - Both walks now wait for the page to stop moving (`cameToRest`, already in `mint.ts` for this case) before they type and press.
  - This is also why the phone's `customers.spec.ts:266` failed once in the full run.

The machine was idle when the gate started: the busiest process drew 0.36 s of CPU in 5 s. Nine idle `vite` dev servers left by earlier agents of this run (ports 5212 to 5342) and one `vite preview` of the Pages build were still running. They drew no measurable CPU and were left alone.

## The exit criterion, end to end

**It holds at all four sizes.** Writing a rule changes what the configurator refuses on the next pick, with the rule's own because.

1. On Rules I pressed "Write a rule about motors" and chose steering · tiller · controls · Tiller handle, then typed the because.
   - The margin counted 61 of 289 boats, 45 of 540 offers taken away and 171 of 241 motors refused. It said "The Classic 340, 360, 380, 360 LS and 380 LS lose the Yamaha F25SWTC."
   - "Add it as 2.4" sits 15–16 px under the because field at every size (it was about 700 px below at 390).
   - Pressed, it reads "Your rule is on. The build refuses from the next pick." The clause just written is in sight at every size: its top is at y 274 of 900, 222 of 800, 3 of 844 and 454 of 1,080 (`rules/built/m3-4-390-written.png`).
2. **The next pick.** I picked the Classic 340 in New quote and opened 02 Motor. It reads "Not offered on this boat: the Yamaha F25SWTC, because a tiller boat has no helm to steer a remote motor from. Your rule: When the boat's steering is tiller, the motor's controls must be Tiller handle. See the rule". The chapter holds 0 F25SWTC buttons (`configurator/built/m3-4-1440-refused-by-rule.png`).
3. **"See the rule" lands on the clause** (major 9, fixed). The rule's sentence is at y 116, 115, 79 and 117, with the page scrolled 680, 684, 1,305 and 679 px (`rules/built/m3-4-1440-from-build.png`).
4. I chose "is off". The page says "This rule is off — kept, not enforced. Switched on, the build would refuse the motor, because …", and the census says "taken away once it is on".
5. **It returns.** Back in the build there is no sentence, and the F25SWTC is on the list again.
6. **The probe the tiller walk cannot make: a rule that refuses the starred motor.** I wrote "When the boat's maker is Stacer, the motor's horsepower must be at most 20 hp", refusing, and started a draft on the Stacer 659 Sea Ranger SDF.
   - The 2026-10-22 tree put the refused Yamaha F130XA on the quote, badged RECOMMENDED.
   - This tree brings no motor across. 02 Motor reads "none your rule allows · Nothing on it yet". The refusal reads "Not offered on this boat: the Yamaha F130XA, the Yamaha F150XC, the Yamaha F175XB and 8 more, because Northside sells Stacer as a small-motor range" (`configurator/built/m3-4-1440-star-refused.png`).
   - The give stays refused, for the missing name.

No page error and no console error was raised at any size, in the walk or in either probe. Sideways scroll was 0, and no visible text was under 11 px on any screen read (16 screens × 4 sizes).

## Per screen: what changed since the first critique, and what is still wrong

### The build and the paper: an unchosen price (blocker 1, **fixed**)
- **Changed.** Under the total the build now says the true thing: "Northside has not chosen which figure prices Dealer Fit Packages, so the Tube Covers to suit PVC Boat · 3.4 Mtr is not in this total."
- **Changed.** The finale refuses the give with the same fact under the act: "… has no price and this quote cannot be given. Choose it on Prices, or put a price on the line here." The act is ochre and `aria-disabled`, and beside it are a dollars field, "Put a price on this line" and "Choose on Prices" (`configurator/built/m3-4-1440-finale-refused.png`).
- **Changed.** "Choose on Prices" opens Dealer Fit on Prices, in sight. One choice writes "Every Dealer Fit Packages line is priced at its Act Sell from the next quote", with Undo and "Back to the quote". Back on the finale, one "Price it at $…" press prices the line, and the give comes live.
- **Changed.** The given paper prints "Tube Covers to suit PVC Boat · 3.4 Mtr $2,834" under "Total, tax included $14,520". "Price to be confirmed" is gone at all four sizes.
- **Confusing.** The door lands on the list, and the line Prices reads large is not the line the dealer came from. From the Tube Covers ($2,790 Sell, $2,834 Act Sell), Prices shows "VHF Radio - GME GX700W … $982 Act Sell or $249 Sell" (`levels/built/m3-4-1920-from-build.png`). The dealer chooses a figure for 1,777 lines while reading a line that is not on their quote.
- **Measured, not judged.** Review's count moved with the choice. Data read "37 to settle" before it. After the walk chose Act Sell for Dealer Fit, Review read "38 to settle" with "No price 19" (its own spec counts 18 at rest), and Prices' Dealer Fit tile reads "Priced at Act Sell · 44 not priced". The new case was not opened, so it is not proven that the choice made it.

### Rules (`/rules`)
- **Changed (major 4).** Every measure names what it counted. For example, 2.3 reads "3,902 of 3,905 motor offers on today's boats, factory packages aside", and the noticed box reads "7,830 of 7,830 motor offers on a remote boat, discontinued boats included". The never-refused clauses say what sits under them: 1.2 "0 of 530 … are rated under the boat", and 2.2 "72 of 757 standard motor offers on today's boats sit under it, on purpose" (`rules/built/m3-4-1280-rest.png`).
- **Changed (major 8).** At 390 the act follows its because, and the count follows the act (`rules/built/m3-4-390-counted.png`).
- **Changed (major 9).** `?open=` lands on the clause, and an added rule is brought into sight (above).
- **Changed.** The drafts a rule would hold are counted in `src/domain/quote/ruled.ts` (blocker 2).
- **Still wrong:**
  - At 1440 and 1920, with a clause open, the pill floats over the because field the dealer is typing in, and over the top of the census (`rules/built/m3-4-1440-counted.png`). The overlap ruler passes it because the pill floats.
  - "None of your 1 draft carries a motor it refuses" reads badly with one draft.
  - The no-file sentence was not re-walked this round.

### Fitment (`/fitment`)
- **Changed (major 7).** The cold page is the plate itself asking "Which boat?", with a field and six of the seven makers' own marks, and the three lines it will count (`fitment/built/m3-4-1440-chooser.png`).
- **Changed (majors 5 and 6).** A strike now means "held off this boat" only. The "Show these 74" list on the Sport 660 strikes nothing: 0 struck rows, under its group head "Under the 150–200 hp this boat takes." (`fitment/built/m3-4-1440-sp660-show-these.png`).
- **Changed (major 10).** The reasons are a row of gauges, each filled to its share, and no longer a white card of rows like Rules.
- **Changed.** "Dealer Fit Packages 1", with no stray plural. The band has one dot per motor and no bare figures.
- **Fixed by this verify.** The trailer place's foot said "None of your rules refuses anything on this boat." On the Classic 340 with the tiller rule on, the motor place a scroll above it struck the F25SWTC "because one of your rules refuses it" (`fitment/built/m3-4-1920-cl340-trailer.png`, taken before the fix).
  - The sentence is now said of its own place: "None of your rules refuses a trailer on this boat." The same goes for "a motor".
  - Changed: `rulesHereSaid` in `src/domain/fitment/say.ts` and `rulesHere` in `src/domain/fitment/plate.ts` take the place, and `Fitment.tsx` passes `'motor'` and `'trailer'`. The test in `plate.test.ts` holds both.
  - Re-photographed on the built fix: `fitment/built/m3-4-1440-cl340-trailer-fixed.png` and `m3-4-390-cl340-trailer-fixed.png`.
- **Still wrong:**
  - The twin-rig reason's example is still the file string "Yam - F115XB + LF115XB", struck.
  - Stabicraft is still its name in type on the chooser, as it is on Data and Prices.
  - The cold page says "289 MODELS" over makers that count "models", while Rules counts the same 289 as "boats" and Prices counts "91 boats". The figures agree, but the noun does not.

### Prices (`/levels`)
- **Changed (major 11).** "Every trailer 434 trailers", the same 434 as Rules and Fitment. Highfield counts "67 boats".
- **Changed (major 10).** "Worked from cost" is a sunken, dashed well, no longer a dark slab beside Fitment's plate.
- **Changed (major 3).** Undo reads "Undone. No longer so: Trade is 95% of Cash on 91 Stacer boats." with the way-back glyph in quiet ink and "Put it back". The step line stands across its tile row and leaves no hole in the grid, at 1440 and at 390 (`levels/built/m3-4-1440-undone.png`, `m3-4-390-undone.png`).
- **Changed.** Factory packages read "$69,716 RRP + Freight Inc GST and Sell Price", no longer "$69,716 or $69,716".
- **Still wrong:**
  - Stabicraft is in type, and the Jeanneau and Haines Signature marks are small and faint on their tiles.
  - Yamaha Outboards still does not say what a quote shows today, as Rigging Kits and Factory packages do ("Until you choose, each one on a quote is priced by hand").
  - The Warranty well names its line by the file's code, "Highfield SP560 (HYP) W-W-WB".
  - The door from a quote lands on a different line (above).

### Review (`/review`)
- **Changed (major 11).** The head counts cases: "Review 37 to settle, the most money first" at rest (38 after the walk's Dealer Fit choice), against "Case 1 of 38". Data's door says the same "37 to settle".
- **Changed (major 3).** Undo's toast reads "Undone. No longer so: Dunbier ALP 5.3M-13B (1,450 kgs) Fibreglass Boat is registered Large at $283, and sells at $11,483."
- **Changed (minor).** Undo brings back the case it was pressed on. After Make it Large, the stage moved to the ALP 5.7M-13TB, and after Undo it is the ALP 5.3M-13B again, at all four sizes (`review/built/m3-4-1440-undone.png`).
- **Changed.** The screen is named "Review" over its count.
- **Still wrong (major 13, open).** The stage still speaks the file:
  - "Dunbier Trailers · 9304 + 9083L"
  - "ATM (KG)", "Rego ($)" and "Sell inc Rego"
  - "Registration Costs!C16 … Registration Costs!C17"
  - "DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B (1,450kgs) Fibreglass Boat"

### The sheet (`/data/$table`)
- **Changed (major 12, fixed).** At 390 the edit's step line rides inside the record. It reads "Cell edit · Highfield Inflatables · Cash on Roll Up 230 KAM · PVC · WH: $2,770 → $2,771 Undo", with Undo at y 725, clear of the tab bar at y 790. What is under Undo's middle is Undo. Pressed, the cell is back and the line reads "Undone — … Put it back" (`sheet/built/m3-4-390-edited.png`, `m3-4-390-undone.png`).
- **Changed.** The step names the line as the boat is said ("Roll Up 230 KAM · PVC · WH"), not "Highfield - RU250KAM (PVC) LG".
- **Still wrong:**
  - The record still heads itself "Highfield - RU230KAM (PVC) WH" and shows "Matrix Highfield Inflatables" and "Tube Dia. cm".
  - A cell edit's undone line still reads "Undone — … $2,770 → $2,771", which shows the change as if it stood. This is the "label that claims nothing" case the decision kept, but a figure moving is a claim.

### Data (`/data`)
- **Changed (major 11).** "fits N boats" counts models on sale: Yamaha fits 264 boats, Dunbier / Haines BMT 9, Parts & Accessories 273. The door reads "Review 37 to settle".
- **Still wrong:**
  - Stabicraft is in type.
  - A plate is still several doors, one per list under the pointer, and not one door to its maker.

### The finder and the shell
- **Changed (major 11).** On a build, the finder's row reads "02 Motor Yamaha F20SMHB · 1 more offered", the same as the chapter's head, at all four sizes.
- **Changed (minor).** At 390 there is no "Esc" keycap. At a desk it stays, where a keyboard is.
- **Still the same.** The five doors land with their own door lit at all four sizes. The four rooms light Data.

### The document (`/quote/$id/document`)
- **Changed.** The Tube Covers line is priced, and the total includes it.
- **Still wrong:**
  - The sections are numbered **01 The hull, 02 Motor, 04 Dealer fit**, with no 03 because there is no trailer (`document/built/m3-4-1440-given-full.png`).
  - The cover is the Highfield wordmark on a pale block, and page 1 is half empty under "Prepared by".
  - The rail shows "On the price list: Highfield - CL340 (PVC) W-W-WD" and "Terms: None set yet."
  - These are Milestone 5's (the proposal), but they are what the owner would hand Rose Kelleher today.

### Quotes, History, Customers, Home and Entry
- **Quotes.** With one given quote, the left pane is still a white field with a huge Highfield wordmark and "No photograph of this boat yet.", beside "Press a quote to see it". It still reads as a placeholder at 1440 and 1920 (`quotes/built/m3-4-1440-after-quote.png`).
- **History.** Clean, but at 1920 the day's row cuts the boat to "Highfield Classic 340 · PVC · White / White / Wo…" with half the row empty beside it (`history/built/m3-4-1920-after-quote.png`).
- **Customers.** Clean at all four sizes. It opens on Rose Kelleher, "customer since today".
- **Home.** "Start from the boat" cuts two names at 1440 and 1280: "Signature Fisher 5…" and "GRT 455 · Side Con…" (`home/built/m3-4-1440-after-quote.png`). The cut ruler does not stop it, because the cut is an ellipsis drawn on purpose. Home's field and the pill's Find are still two doors to one finder.
- **Entry.** Clean at all four sizes. The door took 2.0–2.1 s to land on Home.

## The first critique, item by item

| item | now |
|---|---|
| B1 the build and the paper say a price is missing | **fixed**: one fact (`unchosenOn`), the give refused with it, and the paper prices the line. The door lands on another line (confusing). |
| B2 two derivations in components | **fixed**: `draftsARuleWouldHold` (`ruled.ts`), and `refusedByRule` / `offeredIn` / `refusedIn` (`boat.ts`). |
| M3 Undo's toast reads as the truth | **fixed** on Prices and Review: "Undone. No longer so: …". The sheet's cell edit keeps "Undone — … $a → $b". |
| M4 Rules' measure lines contradict | **fixed**: each names its offers and its cut. |
| M5 Fitment strikes what is not ruled out | **fixed**. |
| M6 "Show these N" a wall of strikethrough | **fixed**: 0 struck. |
| M7 Fitment's cold landing | **fixed**: the plate asks "Which boat?" with the marks. Stabicraft is in type. |
| M8 Rules at 390 separates act and input | **fixed**. |
| M9 "See the rule" lands at the top | **fixed** at four sizes. |
| M10 two pairs of rooms, one shape | **fixed**: the Warranty well and Fitment's gauges. |
| M11 one fact, two figures | **fixed** for trailers (434), the finder (1 more offered), Review/Data (cases) and "fits N boats". "Boats" and "models" still name one count. |
| M12 the sheet at 390 cannot take an edit back | **fixed**. |
| M13 file words on the new screens | **open** on Review, Fitment's twin rigs, the sheet's record, Prices' Warranty line and the document rail. |
| minor: "1 Dealer Fit Packages" | fixed |
| minor: bare "2" and "5" on the band | fixed |
| minor: rolling count "2 3" | not re-measured by ear. The screen reads one figure. |
| minor: the inflatable's 434-trailer census | the CL340 says "No trailer on the price list is made for …" and keeps "Show all 434, each with its reason" as a door, not a census. |
| minor: Review has no screen name | fixed |
| minor: Undo leaves case 2 on the stage | fixed |
| minor: Prices' step card leaves a hole | fixed |
| minor: Yamaha does not say what a quote shows today | open |
| minor: "$69,716 or $69,716" | fixed |
| minor: Rules with no file does not parse | not re-walked |
| minor: Rules' part 3 glyph | fixed: Rigging and pre-delivery wears its glyph |
| minor: Esc keycap on a phone | fixed |
| minor: Stabicraft in type, Haines and Jeanneau faint | open |
| minor: Milestone 3 uncommitted | open: HEAD is `424178b`, and the whole of Milestone 3 is still in the working tree. |

## Everything still wrong, in order

1. **File words still reach the dealer** (major 13):
   - Review's stage: "ATM (KG)", "Rego ($)", "Registration Costs!C16", "Dunbier Trailers · 9304 + 9083L" and the trailer's raw name
   - Fitment's "Yam - F115XB + LF115XB"
   - the sheet record's "Highfield - RU230KAM (PVC) WH" and "Matrix"
   - Prices' "Highfield SP560 (HYP) W-W-WB"
   - the document rail's "Highfield - CL340 (PVC) W-W-WD"
2. **Prices, reached from a quote, reads a line that is not on the quote.** The dealer came for the Tube Covers and is shown a VHF Radio at $982 or $249.
3. **The given paper is still not proud:** it is numbered 01, 02, 04, its cover is a maker's wordmark, and page 1 is half empty. This belongs to Milestone 5.
4. **Truncated names:**
   - on Home at 1440 and 1280 ("Signature Fisher 5…", "GRT 455 · Side Con…")
   - on History at 1920 ("White / Wo…", beside empty space)
5. **The pill floats over Rules' open clause** (the because field and the census top) at 1440 and 1920.
6. **Quotes with one quote reads as a placeholder** at 1440 and 1920.
7. **One count, two nouns:** 289 "models" on Fitment and Data, 289 "boats" on Rules, "91 boats" on Prices.
8. **The sheet's undone cell edit** still shows "$2,770 → $2,771".
9. **Marks:**
   - Stabicraft is in type on Data, Fitment and Prices.
   - Haines Signature and Jeanneau are faint on Prices.
   - A plate on Data is several doors, not one.
10. **Small things:**
    - "None of your 1 draft"
    - Yamaha's line on Prices does not say what a quote shows today
    - History calls one "Price it at $…" press on one line "prices updated", plural, while its legend says "new price"
11. **Housekeeping:**
    - The `ui` chunk is 695,262 bytes.
    - Milestone 3 is uncommitted against the owner's "push regularly".
    - Nine idle `vite` dev servers and one Pages preview from earlier agents are still running.

The owner has not looked at any of it.
