# Milestone 3, rebuilt and walked (2026-10-28)

This verifies the tree that the 2026-10-28 build round left. In that round, Rules, Fitment, Prices (`/levels`) and Review were rebuilt from their new boards. The earlier verifies of this milestone (`built-m3.md` and `built-m3-2.md`, 2026-10-22) are in git at `a77b1dc`, and this file replaces the first of them. Nothing under `src/` was changed by this verify.

**How it was walked.** The full gate ran alone. Then the built app was served (`npx vite preview --port 5261`) and walked by a Playwright script, in a cold Chromium at each size: 1440 × 900, 390 × 844 (touch) and 1920 × 1080, all at deviceScaleFactor 1. Every step was screenshotted, and every screenshot cited here was read by eye. Two follow-up probes were run at 1440:
- the finder pressed on a refused motor, and an under-horsepower motor picked from Show all;
- the four new rooms with the file deleted from the browser.

One further probe was run at 390: the sheet's edit and Undo.

The shots are `docs/directions/<screen>/built/m3-3-<width>-*.png`, 225 of them. The 2026-10-22 shots, `m3-*` and `m3-2-*`, stay beside them as the "before". **The tree is still uncommitted.** HEAD is `2644111`, and the whole rebuild is in the working tree.

## The gate, alone, on this tree

| check | reading |
|---|---|
| `npm test` | **green**: 259 test files, 4,239 tests, 17 static rules, no failures. Typecheck, lint (0 warnings) and format pass. Vitest took 316 s, and the whole command 393 s wall. |
| `npm run build` | **green, with one warning**: the chunk-size line. The `ui` chunk is **694,951 bytes** (694,827 on 2026-10-22). `pictures-*.js` is 585,673 bytes and `index-*.js` 405,052. Built in 5.4 s. |
| `npm run e2e` | **2,232 tests: 1,732 passed, 500 skipped by design, 0 failed.** It took 2.2 h with 2 workers (7,948 s wall). |

No check was red, so there was no `--last-failed` reading to take. Four idle `vite` dev servers were left running by earlier agents of this run, on ports 5212, 5222, 5232 and 5242. I measured them at 0 CPU over 5 s and left them alone.

## The exit criterion, end to end

**It holds at all three sizes.** Writing a rule changes what the configurator refuses on the next pick, with the rule's own because.

1. On Rules I pressed "Write a rule about motors" and chose steering · tiller · controls · Tiller handle.
   - Before the rule was added, the margin counted 61 of 289 boats, 45 of 540 offers taken away and 171 of 241 motors refused.
   - It also said: "The Classic 340, 360, 380, 360 LS and 380 LS lose the Yamaha F25SWTC."
   - "Add it as 2.4" stayed refused, with its reason under it ("Say why, so the build can say it where it refuses."), until the because was typed.
   - Pressed, it reads "Your rule is on. The build refuses from the next pick." with an Undo.
2. On Fitment, through the cold chooser (Highfield 67 models → Classic 340 9 versions → PVC White / White / Wood Dark), the Classic 340's motor line counts 2 of 209 made for it.
   - The first reason reads "1 · Not offered on this boat, because one of your rules refuses it. Such as ~~Yamaha F25SWTC~~ · a tiller boat has no helm to steer a remote motor from", with Show these 1 and Your rules beside it.
3. I picked the Classic 340 in New quote and opened 02 Motor. It reads: "Not offered on this boat: the Yamaha F25SWTC, because a tiller boat has no helm to steer a remote motor from. Your rule: When the boat's steering is tiller, the motor's controls must be Tiller handle. See the rule".
   - The motor chapter held 0 F25SWTC buttons.
4. "See the rule" opens the rule for rewriting. I chose "is off", and the page said "This rule is off — kept, not enforced. Switched on, the build would refuse the motor, because …".
   - The census now says "taken away once it is on", and the cost line "Switched on, the Classic 340 … would lose the Yamaha F25SWTC."
5. **It returns.** Back in the build there is no sentence, and the F25SWTC is on the list at +$532. Fitment counts 3 of 209 and says "None of your rules is switched on, so the price list alone decides what goes on this boat."
6. The finder on the same build lists the refused F25SWTC (at $5,448). Pressing it opens the motor's line in the price list (`/data/mot_yamaha?at=…`) and puts nothing on the quote, so the finder is not a way round the rule.

No page error and no console error was raised in any of the three walks or the three probes.

## Screen by screen

### Entry (`/sign-in`)
- **1440.** Northside's real mark now hangs as the pennant. The card says "There is no password", and the door is the amber act. The door took 2.1 s to land on Home.
- **390** and **1920.** The same, with no sideways scroll at either size. Nothing is wrong here.

### Home (`/`)
- **1440.** Northside's mark on the water, then "Good afternoon, Asaf.", one field beside New quote, eight boats and the seven makers' marks. Ctrl K over Home answers "Classic 340" with three models and their price ranges.
- **390.** Home's pill is at the top, and on every other screen it is the foot bar. That is the documented choice, but it is the one screen where the pill moves.
- **1920.** Clean.
- **Still true from before:** Home's field and the pill's Find are two doors to one finder.

### The shell (the pill and Ctrl K)
The pill has five doors at every size: Home, Quotes, Customers, Data and History. Each was pressed, and each landed with its own door lit. Rules, Fitment, Review and Prices light Data, because they are rooms of it. They are reached from Data's head capsule ("Rules · Fitment · Review 69 to fix · Prices") and from the finder. The finder opened from all twelve screens at all three sizes: by Ctrl K at a desk, and by the bar's Find button at 390.

Two things are wrong:
- At 390 the finder still prints an "Esc" keycap on a phone.
- On a build, the finder's own row says "02 Motor · Yamaha F20SMHB · 2 more offered" while the chapter it opens says "1 more offered". The finder counts the motor the rule refuses (`configurator/built/m3-3-1440-finder.png` against `m3-3-1440-refused-by-rule.png`).

### Data (`/data`)
- **1440 and 1920.** One clean look: the makers' plates across the top and the lists beneath, counted.
- **Confusing.** A plate is not one door. Pressing the middle of the Highfield plate opened "Highfield × NSM Custom — Trailer Fitment", the pairing under the pointer, not Highfield (`data/built/m3-3-1440-plate-pressed.png`).
- **Still wrong:**
  - That spread still says "WHERE FROM: Boat Module (5).xlsx, on its Boat Module tab".
  - Stabicraft is its name in type on Data, Fitment and Prices. At 390 that leaves its plate a white card with one bold word.
  - Data says "69 to fix", and Review, one press away, says "69 to settle".

### The sheet (`/data/$table`)
- **1440 and 1920.** "Shut Roll Up 230 KAM" folds the model to one line. A Cash edit says "Cell edit · Highfield Inflatables · Cash on Highfield - RU250KAM (PVC) LG: $3,060 → $3,100" with Undo pinned at the foot. Undo reads "Undone — … Put it back", and the cell is back.
- **390: the flow breaks.**
  1. I pressed a variant, then its Cash ("Cash: $2,770. Press to change it."), and typed $3,100. The record shows $3,100.
  2. The step line ("Cell edit … $2,770 → $3,100 · Undo") is at y 750, under the open record. A press there lands on the record's "Add a variant to Roll Up 230 KAM / Delete this row…", and Playwright could not press Undo in 5 s (`sheet/built/m3-3-390-edited.png`).
  3. **The phone has no visible way to take an edit back.** This is the 2026-10-22 critique's major, still unfixed.
- **Still wrong.** The record shows a dealer file words:
  - "Boat Module (5).xlsx · sheet "Boat Module", rows 281–948 under the yellow brand banner at row 278 … 588 of 588 SKUs seeded"
  - "Source Boat Module!R284", "Shaft Lgth", "Eng Configuration"
- **Also.** The step sentence names the line by its file code ("Highfield - RU250KAM (PVC) LG"), not as the boat is said.

### Rules (`/rules`), rebuilt as "The house rules"
- **1440.** It reads as a page Northside could sign. Three parts are numbered: Trailers (434 on sale), Motors (241 on sale), and Rigging and pre-delivery. The price list's seven clauses each carry a measure (581 of 581 … 3,890 of 4,017), and three ochre "Noticed, not written" boxes sit in the margin.
  - Writing a clause opens it in place, with the sentence's words as underlined choices and the count beside it before it is added. Off, warns and refuses act at once, with a toast.
- **390.** The census stacks under the clause and fits. After "Add it as 2.4" the page goes back to the top, though. The clause just written is about 1,500 px below, out of sight, and only the toast says it happened (`rules/built/m3-3-390-written.png`).
- **1920.** It holds, in the 1,280 px sheet with wide margins.
- **Confusing:**
  - "See the rule" from the build lands at the page's top, with the rule open about 740 px down. At 1440 only its heading shows (`rules/built/m3-3-1440-from-build.png`).
  - Opening a clause scrolls it so the pill sits over the clause above it, or over "COUNTED NOW", at 1440 and 1920 (`m3-3-1440-counted.png`, `m3-3-1920-counted.png`). The ruler passes it, because the pill floats.
- **Wording.** With no file, the page says "every rule is written on its own words", which does not parse.

### Fitment (`/fitment`), rebuilt as "The plate"
- **1440.** The Classic 340 is on its riveted dark plate, and its three lines are the controls: Motor 20–25 hp with the two made for it pinned on a band, Trailer built for Highfield 0 of 434, and Also made for it 5 of 3,814. Under the plate are the tiles, then one row per reason with its count, the engine's sentence, a struck example, Show these N and the door to the deciding line.
  - The Sport 660 has its render in the window, 7 of 209 made for it, and reasons of 74, 51, 30 and 47. "Show these 74" opens the struck list, grouped and searchable, with Back to the boat.
  - The trailer line says what goes on the road: "The Highfield Classic 340, 71 kg, and its F20SMHB, 57 kg: 128 kg on the trailer, before fuel and gear."
- **390.** The plate stacks and the lines stay pressable. The reasons fold their two doors under the sentence.
- **1920.** Clean, held to the 1,120 px column.
- **Wrong:**
  - The twin-rig reason's example is the raw file string "Yam - F115XB + LF115XB" at every size.
  - Just after the rule was switched off, the motor line's text read "2 3 of 209" (old and new figure in the DOM together while the number rolls). The shot shows 3, so a screen reader may hear both.
  - The inflatable, with no trailer made for it, still gets "The other 434, and why" in three groups.
- **Confusing.** The cold chooser gives every maker the same generic glyph, not its mark, on an otherwise empty page.

### The build (`/quote/new` → `/quote/$id`)
- **1440, 390 and 1920.** The refusal block stands above the motor list with the rule's own because and "See the rule". At 390 it is the first thing under the chapter's head.
- **Rule 2.2 is true.** A motor under the boat's horsepower, picked from Show all (the F15SMHA), is said under "Under the 20–25 hp this boat takes.".
- **Still wrong:**
  - The Tube Covers line has no price. The quote can still be given, and the paper prints "Price to be confirmed".
  - The picked under-horsepower card itself carries no mark.

### Prices (`/levels`), rebuilt as "Yours to decide"
- **1440.** Three groups.
  - **Yours to choose 4:** Dealer Fit 1,777 · Rigging Kits 650 · Yamaha Outboards 209 · Factory packages 89, each with one real line's two figures and an ochre "To choose".
  - **Worked from cost 1:** Warranty on Northside's dark ground, read on the SP560 (HYP) as $32,166 against Cash $48,350, with its switch off.
  - **Settled by your price list 10:** tiles led by the makers' marks.
- **The Stacer write.** Pressing Stacer opened the 309 Skimma specimen (Cash $1,730 · Trade $1,730). Typing 95 counted "91 written · 91 equal Cash today · 0 already · 0 with no Cash · 309 Skimma $1,730 → $1,643" before anything was written.
  - The write folded the tile to "Trade is 95% of Cash". The step card "Trade is 95% of Cash on 91 Stacer boats. Undo" stood under it 8 s later.
  - Undo read "Undone — … Put it back", and the tile is back to "One price for every buyer".
- **390.** The same, in two columns. The step card takes a grid cell and leaves a hole beside it.
- **1920.** Clean.
- **Wrong:**
  - The tiles count trailers as 444 ("Every trailer 444 trailers"), while Rules and Fitment say 434 on sale. The 10 obsolete trailers are in one figure and not the other.
  - Highfield's tile counts "67 models" where every other maker counts boats.
  - The Haines Signature and Jeanneau marks are tiny and faint.
  - Stabicraft is set in type.

### Review (`/review`), rebuilt as "The case queue"
- **1440.** The head reads "69 to settle, the most money first", with $819 not charged and $234 charged over. Under it are a rail of ticks and six chips. The case on the stage is "Rego the ALP 5.3M-13B as a Large trailer.", with its why, the cells before and after, one amber "Make it Large · +$117", Skip, and two named ways to leave it.
  - Pressing it brought the count to 68 and the money to $702. The next case is on the stage, and the toast says what was written, with Undo.
- **Confusing.** After Undo the count is back to 69, but the stage stays on case 2 of 37 ("ALP 5.7M-13TB"). The case just undone is not shown, so the dealer has to find what they took back (`review/built/m3-3-1440-undone.png`).
- **390.** It stacks. The act is below the first screen, and the toast sits over the case's table until it goes.
- **1920.** Clean.
- **File words still on the stage:**
  - "ATM (KG)", "Rego ($)" and "Sell inc Rego"
  - "Registration Costs!C16 … Registration Costs!C17"
  - "DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B (1,450kgs) Fibreglass Boat"

### The document (`/quote/$id/document`)
- **All three sizes.** It was given to Rose Kelleher and is 2 pages of A4. `page.pdf()` in print media gave a 2-page PDF with no app chrome on it.
- **Still wrong:**
  - The paper numbers its sections **01 The hull, 02 Motor, 04 Dealer fit**. There is no 03, because there is no trailer.
  - It prints "Price to be confirmed".
  - The cover is the Highfield wordmark on a pale block.
  - Page 1 is half empty under "Prepared by".
  - The rail says "Terms: None set yet." No screen sets terms.
  - The rail shows "On the price list: Highfield - CL340 (PVC) W-W-WD".
  - In the PDF the paper colour stops short of the page's left and right edges.

### Quotes (`/quotes`)
- **1440 and 1920.** With one given quote, the left pane is a white field about 1,000 × 800 with a huge Highfield wordmark and "No photograph of this boat yet.", beside "Press a quote to see it". It still reads as a placeholder (`quotes/built/m3-3-1920-after-quote.png`).
- **390.** Fine.

### History (`/history`) and Customers (`/customers`)
Both were clean at three sizes.
- **History** shows the quote under Today, with the boat's card and the fourteen-day strip.
- **Customers** opens on Rose Kelleher, "customer since today", with the given quote on the right.

## Two screens that read as one shape

- **The ledger.** Fitment's reasons and Rules' clauses are the same white rounded card of rows: a figure on the left, a sentence, and the measure or doors on the right.
- **The dark slab.** Prices' "Worked from cost" band and Fitment's riveted plate are both a near-black rounded slab with white type under a small-caps eyebrow, in the same family of rooms under Data.

None of these blocks the work, but the two of each read as one shape when seen in a row.

## Refusal rot

Every refusal sentence in `src/screens/**` and `src/routes/**` (and the domain sentences those screens print), and whether it is true on this tree. "Unreachable" means the screen says it only when its route did not hand it a way, and every route hands one. So the sentence is true but cannot be read in the app.

| where | sentence (shortened) | true? |
|---|---|---|
| cascade `NO_WAY_BACK` | "There is nowhere to go back to … opened without the build it belongs to." | True; unreachable. |
| cascade/proposal `NO_FIX` · `NO_QUOTE` · `NO_FILE` | "This link does not say which change to price …" · "There is no quote at this address …" · "Nothing can be priced again until the Master Price File is loaded …" | True. |
| cascade/proposal :598/603/610 | "already written against the …" · "That finish is not on the price list …" · "This quote has no boat on it …" | True. |
| cascade/proposal `FLOOR_UNCHECKED` | "… not checked: the price list gives no weight to check it against." | True. |
| configurator `NO_DOCUMENT_HERE` | "This page has no way to open the printed quote …" | True; unreachable. |
| configurator give (`issueBlockers` + chapters.ts) | addressed to nobody; nothing on it; $0; unpriced hull; typed price with no reason; a line at a price "Northside keeps to itself … on Prices, in Data"; a line a rule refuses | True. Addressed-to-nobody is walked by the refusal ruler. Prices is in Data's head, as it says. The rule-refused line is pushed in `chapters.ts:952` by `refusedOnQuote`. |
| configurator `ruled-here` | "Not offered on this boat: the Yamaha F25SWTC, because … Your rule: … See the rule" | **True**, walked at three sizes. |
| configurator/finishes `NO_OTHER_FINISH`, say.ts `NO_LEVEL_SAY` | "No other finish of this boat is on the price list." · "Nothing on this quote has a second price, such as Trade." | True. |
| customers `NO_SHEET_FOR_A_BOOK` · `NAME_NEEDED` · `NOBODY_AT_THIS_ADDRESS` | "… customers are saved with it, so nothing here can be saved until it is loaded." · "A customer needs a name …" · "No customer is at this address …" | True. With no file, Customers still draws the Add form, and the first sentence is said on the press. |
| customers `NO_WAY_TO_OPEN`, `NO_WAY_TO_THE_PICKER` | "This screen was handed no way …" | True; unreachable. |
| data/Spread `NO_WAY_TO_THE_SHEET` · `NO_WAY_TO_CUSTOMERS` | "… no way to the list's own page." · "Customers is on the bar every screen carries." | True; unreachable. The second is loose, because Entry carries no bar. |
| document `NO_TERMS` | "None set yet." | True, but no screen on this tree sets terms, so "yet" points at Milestone 5. |
| document `NO_LETTERHEAD` | "Set in type, because no mark has been added …" | True when said. It is not said on this tree, because Northside's mark prints. |
| document `NO_NAME_FROZEN`, `NO_QUOTE_HERE` | "… started before a business name was set …" | True. |
| document/paper `NO_LEVEL_ON_IT` | "No item on this quote has a price to choose between …" | True. |
| entry `NO_PASSWORD` | "Nothing typed here is checked against anything, and the name stays on this computer." | True. |
| history `NO_WAY_TO_OPEN`, `NO_WAY_TO_THE_PICKER` | "… Quotes, on the bar, opens every quote." · "… New quote on Home or on Quotes starts one." | True; unreachable. |
| history `NO_SHEET_TO_PRICE_FROM`, `NO_DIARY_SAY` | "No price list is open on this computer …" · "What was done on this quote was not kept …" | True. |
| home `NO_WAY_TO_THE_PICKER`, `NO_WAY_TO_A_FILED_QUOTE`, `NO_WAY_IN`, `NO_FINDER` | "This screen was handed no way / no finder …" | True; unreachable. |
| lost `NO_WAY_OUT` | "No way out was handed to this screen …" | True; unreachable. |
| quotes `NO_WAY_TO_OPEN`, `NO_WAY_TO_THE_PICKER` | "This screen was given no way …" | True; unreachable. |
| quotes `ONLY_ISSUED_IS_VERSIONED`, `ISSUED_IS_NOT_DISCARDED` | "A new version is only for a quote already given." · "This quote has been given to the customer, so it stays." | True. The second is walked by the refusal ruler. |
| picker/mint.ts ×3 | "That maker is no longer on the price list …" · "That boat is no longer in …" · "… the quote came back empty. Nothing was written." | True. |
| sheet `NO_SHEET`, `NO_WAY_TO_THE_FILE`, `PICTURE_CELL_REFUSAL`, Sheet.tsx :1297/:2008/:2056, More.tsx | "No price list is open …" · "… loaded at sign-in." · "A picture cannot be typed in …" · "That column is no longer on this table." · "Nothing to set." / "Nothing to fill." · "A column needs a name …" | True. |
| shell `NO_FILE_YET` | "The price list is not loaded yet, so there are no boats to find — only quotes, and the people they are for." | True. It no longer contradicts Customers: it promises only people quotes are for. |
| shell `NO_DESK` | "A quote is written for the dealership signed in, and none is …" | True in effect, but "signed in" sits against Entry's "There is no password". |
| shell/vocabulary `NO_SHORTCUT` | "No shortcut matches … Every key this app answers to is on this sheet." | True. |
| **rules** `pairMissing` (pairRules.ts) | "Choose which of the boat's specs this rule looks at." · "Choose the boat's {spec}." · "Type the … as a figure" · "… is a figure: type it as digits" · "Choose which of the motor's specs this rule decides." · "Say why, so the build can say it where it refuses." | **True.** The first and last were walked: the act stays `aria-disabled` with the sentence under it. |
| **rules** `VERB_DOES` | refuses: "It leaves the list in the build, and this because is said where it was." · off: "Kept here in full; the build offers what it would refuse." · warns: "It stays on the list, with this because beside it." | refuses and off are **true**, walked at three sizes. warns was not walked this round (true on 2026-10-22). |
| **rules** `standingSaid` | "From the next pick. No draft is standing today, so none waits on it." · "Nothing changes while it is off …" · "… each cannot be given until it is off." | **True.** The first two were walked. The third is enforced at `chapters.ts:952`. |
| **rules** noticed box | "It holds on 7,830 of 7,830 … Nobody wrote it down, so the build does nothing with it." | **True.** Observed seeds reach no solver: `seedWorkbookConstraints()` emits nothing, and no screen reads `evidence: 'observed'` but Rules. |
| **rules** clause 1.2 | "A trailer rated to carry less than the boat weighs is never refused. Fitment says how far short it is." | True. It is never refused, and Fitment's trailer line weighs the load against each ATM. |
| **rules** clause 2.2 | "A motor under the boat's lowest rated horsepower is never refused. On a quote, the build says it is under." | **True**, walked: the F15SMHA on the Classic 340 is said under "Under the 20–25 hp this boat takes." |
| **rules** part 3 | "A rule here is written about a motor or a trailer, so this part is your price list's alone." | True: the writer offers only motors and trailers. |
| **rules** `NOTHING_TO_DO` | "Nothing to change: it is already so." | True. A no-op is said, not silent. |
| **rules** no file | "The price list is not on this computer yet, and every rule is written on its own words." | True in substance, but the sentence does not parse. |
| **fitment** `say.ts` | "None of your rules is switched on, so the price list alone decides …" · "None of your rules refuses anything on this boat." · "Not offered on this boat, because one of your rules refuses it." | **True**, all three walked. |
| **fitment** no file | "No price list is open on this computer, so there is no boat to fit." | True, walked. |
| **levels** `whileOff` | "While it is off, a quote with a line at Warranty cannot be given." · "… a quote with a {motor} on it cannot be given." | True by code: `issueBlockers` case 6, `keptFromCustomers`, reads every line's resolved level. Not walked, because the build offers no Warranty rung to pick. |
| **levels** `priceCommands.ts` | "Type the share of Cash, as a per cent." · "A share of nothing would price every line at nought." · "Above 100% … would pay more than a customer off the street." · "Every Stacer boat … already holds 100% of it as Trade." · "No … has a … figure, so there is nothing to work … from." | True. The fourth was walked. |
| **levels** :285 | "Nothing to put back: it already reads as it did before." | True. A no-op is said, not silent. |
| **levels** no file | "The price list is not on this computer yet, and every price here is read from it." | True, walked. |
| **review** :1131, :1027 | "Type its new name first." · "Type the second one's name first." | True. |
| **review** e2e-walked | "Type a price beside at least one of them first." | True (`review.spec.ts`). |
| **review** no file | "The price list is not on this computer yet, so there is nothing to check." | True, walked. |
| kit/Kit.tsx, routes/kit.tsx | "The kit has no quote, so there is nothing to give." · "The kit could not read the price list: …" | True for the specimen page, which still ships as a reachable route. |

**No refusal sentence on this tree is false.** None names a milestone or says "not built yet", and none points at a screen that does not exist. Two sentences are worded badly (Rules with no file, and `NO_DESK`'s "signed in"). One is true only until Milestone 5 builds terms ("None set yet").

## Everything wrong, in order

1. **The sheet at 390: an edit's sentence and Undo are under the open record**, so a phone cannot take an edit back. This is the 2026-10-22 critique's major, still unfixed (`sheet/built/m3-3-390-edited.png`).
2. **The given document is numbered 01, 02, 04,** and prints "Price to be confirmed" on a quote the build let be given.
3. **File words still reach the dealer:**
   - Data's "Boat Module (5).xlsx"
   - the sheet record's banner note, "Boat Module!R284", "Shaft Lgth" and "Eng Configuration"
   - the sheet's step sentence, "Highfield - RU250KAM (PVC) LG"
   - Review's "ATM (KG)", "Rego ($)" and "Registration Costs!C16"
   - Fitment's "Yam - F115XB + LF115XB"
   - the document rail's "Highfield - CL340 (PVC) W-W-WD"
4. **Review's Undo does not bring the undone case back to the stage.** The count says 69, and the stage shows case 2.
5. **Rules at 390 scrolls away from the clause just written.** At every size "See the rule" lands at the page's top, not on the rule.
6. **Two figures for one fact.**
   - Prices says 444 trailers, while Rules and Fitment say 434 on sale.
   - On a build, the finder says "2 more offered", while the motor chapter says "1 more offered".
7. **Quotes with one quote reads as a placeholder** at 1440 and 1920.
8. **Two pairs of rooms read as one shape:** Fitment's reasons and Rules' clauses, and Prices' Warranty slab and Fitment's plate.
9. **A plate on Data is not one door.** The pairing under the pointer opens, not the maker.
10. **Faint or missing marks.** Stabicraft is in type on Data, Fitment and Prices. Haines and Jeanneau are faint on Prices, and the Fitment chooser has generic glyphs for every maker.
11. **Small things:**
    - the "Esc" keycap on a phone
    - Fitment's rolling number reads "2 3"
    - the inflatable gets the full 434-trailer census
    - the PDF's paper stops short of the page's sides
    - the Rules no-file sentence does not parse
12. **Housekeeping:**
    - the `ui` chunk is 694,951 bytes
    - Milestone 3 is uncommitted
    - four idle dev servers from earlier agents are still running

The owner has not looked at any of it.
