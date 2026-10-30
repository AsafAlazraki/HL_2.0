# The quote, click by click (walked 2026-10-30)

Walked on the built app (`vite build` of the tree at 591a543, served by `vite preview` on 5511), each quote from a cold browser (a new Chromium profile, nothing stored), driven by Playwright at 834 × 1112 and then at 1440 × 900. Nothing under `src/` was changed. Screenshots of every step that made the walker hesitate are in `walk/` (JPEG), with the printed papers as PDF (`walk/q1-stacer-paper.pdf`, `walk/q2-highfield-paper.pdf`, `walk/q3-skimma-paper.pdf`, `walk/q6-grt455-paper.pdf`).

A "press" is a click or tap that moved the quote. Keystrokes and scroll gestures are counted apart. The sign-in (a name and "Load the Master Price File", 2 presses and 4 keys) comes before every quote on a cold browser and is not counted in the quote's own presses.

## The counts

| Quote | Size | Presses | Keys | Scrolls | Notes |
|---|---|---|---|---|---|
| 1. Stacer 481 SeaMaster, Yamaha F70LB, trailer, 3 parts | 834 | 25 | 28 | 4 | 5 of the 25 are the Prices detour for a rigging kit the app put on by itself |
| 1. same | 1440 | 26 | 28 | 6 | +1 because "Who it is for" was already open and the press shut it |
| 2. Highfield Sport 560 Hypalon B/W/Carbon, F115XB, trailer, parts; finish changed to PVC; a part taken off | 834 | 25 | 42 | 4 | +1 reopen of Dealer fit, because the first part closed the chapter |
| 2. same | 1440 | 25 | 42 | 6 | "Change the boat" sits at y 1,109 of 900 |
| 3. Cheapest honest rig: Stacer 309 Skimma, F2.5SMHB, safety gear | 834 | 12 | 16 | 0 | +3 to look at motor, trailer and "Show all 34" trailers |
| 3. same | 1440 | 12 | 16 | 0 | |
| 4. Motor only (a repower) | 834, 1440 | 0 | 5 | 0 | **Cannot be started.** New quote asks only "Which boat is it?" |
| 5. Parts only | 834, 1440 | 0 | 0 | 0 | **Cannot be started.** Parts & Accessories has no quote verb |

Measured from the app's own store: of the nine modules, four carry `quote` (Boats, Factory Packages, Motors, Trailers) and five do not (Dealer Fit Packages, Labour Rates, Oils & Consumables, Parts & Accessories, Registration Costs). No screen draws `quoteDoors` (`src/domain/quote/start.ts`), so even Motors and Trailers, which can quote, have no door.

## Quote 1 at 834 × 1112: Stacer, a paired Yamaha, a trailer, three parts

1. Home → **New quote**. Lands on "Which boat is it?", seven maker cards with photographs. Stacer, the largest maker (91 models), is last, alone in a full-width row, and its picture is a white studio cut-out among six water photographs (`walk/q1-834-01-what-is-sold.jpg`). The order is neither by count nor alphabetical (Surtees before Stacer on the rail, after it on the cards).
2. **Stacer, 91 models**. 22 series on one 7,796 px page. Series headings shout the file: "SKIMMAS", "PROLINES", "SEASPRITE DINGHYS", "SEA MASTERS" (`walk/q1-834-02-stacer.jpg`). There is no way to jump to a series. Five tiles in the first two series have no picture and show a crossed-camera tile as big as a photograph. Two pairs share one photograph across different models (319 Skimma and 319 Skimma · HS, 359 Territory Striker S/S and L/S).
3. Scroll ×4 (the 481 SeaMaster is at y 4,185).
4. **481 SeaMaster**. The boat panel opens on the right. Because the grid reflows from four columns to two, the page grows from 7,796 to 11,825 px and jumps to y 5,454. The sticky series heading "OUTLAW · CENTRE CONSOLES" covers the top of two cards ("489 Outlaw · Centre Console" is cut) (`walk/q1-834-03-boatpage.jpg`). The facts read "HULL LENGTH 4.82 m · HULL WEIGHT (DRY) 480 kg · MIN 70 HP". "MIN" has no noun, and the maximum is missing.
5. **Start the quote**. The total goes from the $22,060 just shown to **$38,123**. A Yamaha F70LB ($10,460), a trailer ($5,603) and a rigging kit go on, and nobody chose any of them. The head says "Northside has not chosen which figure prices Rigging Kits, so the rigging kit for the F70LB is not in this total." "Who it is for" opens by itself before anything is built. At 834 the first chapter row is at y 1,180, under the fold: the whole first screen is the photograph and five facts (`walk/q1-834-04-build-start-full.jpg`).
6. **02 Motor** (to see the motor). The motor is shown as five tiles with pictures and differences. This is the best moment in the build. The chips read "70 hp 2", "75 hp 1" and "90 hp 2", so the count reads as part of the label. The "· White" tiles show two motors in one picture, a different scale from the single motors. The sticky head covers the hull row's name (`walk/q1-834-05-motor.jpg`).
7. **03 Trailer**. Two trailers, named "T Alloy 1100 ATM S 13" Skid Braked" and "T Alloy 1298 ATM S 13" Skid Braked". "ATM" is printed twice, once in the name and once in the facts. "S" is never explained. The difference pill runs to three lines: "+$1,140 instead of the T Alloy 1100 ATM S 13" Skid Braked" (`walk/q1-834-06-trailer.jpg`).
8. **04 Dealer fit**. Parts & Accessories shows four rows: Battery MFM50, Battery Box · Small, Battery Terminals · 1 pair and D Shackle · 10 mm Galv. Each row is a name, a price and the same green toolbox icon. There is no picture, no word about what the part does and no hint of where it goes. Under Rigging Kits, "Rigging kit for the **F90LB2 · White**" is offered for a quote that carries an F70LB (`walk/q1-834-07-dealerfit.jpg`).
9. **Show all 2,238 in Parts & Accessories**. The note says "The first 40 are shown." The 40 are a flat text list: batteries, safety gear, then 20 lifejackets in a row. There are no groups, no pictures and no filter. A grey box says "The price list does not list it for this boat. Nothing is wrong with it." It does not say what "it" is (`walk/q1-834-08-showall-parts.jpg`).
10. **Safety Gear · Smooth Waters** (+$83).
11. **Battery (MFM50 Supercharge) + Battery Box, Terminals & Switch** (+$324). A new grey box appears: "Safety Gear · Smooth Waters and Battery (MFM50 Supercharge) + … are both on this quote, and each is charged." It was read twice. It says nothing about why the two are named together (`walk/q1-834-10-part2-added.jpg`).
12. Press the quote's search, type `anchor` (6 keys). "49 found, 49 of them not made for this boat." Every result row grows a grey box reading "CODE 46075", the loudest thing on the row, so 49 results fill about six screens (`walk/q1-834-11-search-anchor.jpg`).
13. **Sand Anchor Kit · 6lb** (+$79). Total $38,609.
14. **Who it is for** (it had shut while the chapters were open).
15. Name field, type `Tom Barker` (10 keys).
16. Contact field, type `0412 555 019` (12 keys).
17. **Put their name on it**. The chapter heading now reads "Who it is for **for** Tom Barker".
18. **On to the finale**. "Give it to the customer" is greyed out (`disabled`) under the sentence "Northside has not chosen which figure prices Rigging Kits, so the rigging kit for the F70LB has no price and this quote cannot be given." The sentence is there, but the control is still a disabled button. The sticky head has lost the total. The price field's placeholder "In dollars" is set in a monospace face (`walk/q1-834-15-finale.jpg`). **Milestone 3's carried item 2 is still open:** the app added the line by itself and then refused the give because of it.
19. **Choose on Prices**. The link lands on the quote's own line ("On your quote · Yamaha/Stacer · 703-6Y52L-17-07 · Side Mount Rigging Kit"). The three figures are named in the file's words: "Sell Price $2,180", "Kit Sell Price $2,000" and "Install Retail Sell $180". The salesperson has no basis for choosing between them with a customer waiting.
20. **Kit Sell Price**.
21. **Price 628 at Kit Sell Price**. The step line with **Undo** and **Back to the quote** is at y 1,050 of 1,112, inside the screen. Milestone 3's carried item 1 is closed for the step line. On the same screen, at the desk, "Worked from cost · Northside only · Warranty … **$32,166 against Cash $48,350 · 66.5% of Cash, $16,184 under**" is open to the customer's eye (`walk/q1-834-18-prices-written.jpg`).
22. **Back to the quote**. In a run where the page reloads, the step line is gone, and nothing on /levels?quote=… leads back to the quote. That takes two presses instead: Quotes, then Open the build.
23. **Price it at $2,000**. Total $40,609. The total rose $2,000 because of a line the customer never asked for.
24. **Give it to the customer**. A green "Given to Tom Barker" stamp (`walk/q1-834-24-given.jpg`).
25. **Open the printed quote**. Two pages of A4. See `flow/paper-handoff.md`.

## Quote 1 at 1440 × 900

Same 25 presses, plus one: "Who it is for" was still open, so pressing it shut it.

- The picker's list scrolls inside its own pane (7,073 of 680 px), five pane-heights to the SeaMasters.
- The boat photograph in the build is cut by the viewport's left edge, with no margin and square corners on the left (`walk/q1-1440-04-build-start.jpg`).
- The five facts squeeze into five columns: "HULL WEIGHT (DRY)" wraps to three lines.
- The step line after the Prices choice is at y 838 of 900, in view.
- Back on the quote (`?at=finale`), the page lands at the top. "Price it at $2,000" is at y 908 and "Give it" at y 956, both under the fold, so one more scroll is needed (`walk/q1-1440-12-back.jpg`).

## Quote 2 at 834: Highfield in Hypalon, the cascade, a part taken off

1. **New quote**.
2. **Highfield Inflatables**. The series names are written normally here ("Roll-Up", "Classic", "Sport"), so the shouting is the Stacer file's own and is not handled.
3. Scroll ×3 (Sport 560 at y 3,528).
4. **Sport 560**. A segmented "MATERIAL: PVC $41,340 · Hypalon $48,350", a clear visible choice. The facts read "OA LENGTH 5.66 m · INT LENGTH 382 cm · BOAT WEIGHT 581 kg": file abbreviations, and metres beside centimetres (`walk/q2-834-02-boatpage.jpg`).
5. **Hypalon**. Seven named colourways appear as chips with three swatches each, plus one chip that is only a code, "I-B-C". The first colourway is chosen for the salesperson. The price inside the chosen Hypalon chip is dark blue on blue and hard to read (`walk/q2-834-03-hypalon.jpg`).
6. **Black / White / Carbon**. The photograph does not change: it is the grey and white boat with a **Mercury 115**.
7. **Start the quote**. $48,350 becomes **$73,594**: a Yamaha F90XB ($14,531) and a REDCO trailer ($10,713) go on, unasked. The caption under a photograph of a Mercury reads "On this quote: the Yamaha F90XB." Dealer fit opens by itself with "9 offered · Nothing on it yet". Its dealer-fit packages carry no price, only a "Choose its price" link, and Rigging Kits offers the F115XB2 · White (`walk/q2-834-04-build-start-full.jpg`).
8. **Tube Covers to suit Hypalon Boat · 5.6 Mtr**. It goes on with "no price on it". **The chapter closes and the build jumps to "Who it is for"** (`walk/q2-834-05-tubecovers.jpg`).
9. **04 Dealer fit**, to open it again.
10. **2 x MFM50 Batteries** (+$398). This time the chapter stays open.
11. **Battery Box · Small** (+$18).
12. **02 Motor**.
13. **Yamaha F115XB** (+$2,338). Total $76,348.
14. **01 The hull**. The 15 finishes are one long radio list, each with its file code ("W-W-WB · HBS113"). It is not the material switch and chips the boat page used a minute earlier. It reads "Another finish changes the boat only. Everything else on this quote stays." (`walk/q2-834-10-hull.jpg`)
15. **Black / White / Carbon · PVC** (−$7,010). This opens the cascade page, "The boat becomes the Highfield Sport 560 · PVC · Black / White / Carbon." It says "5 other items stay as they are". **The Tube Covers *to suit Hypalon Boat* stay on a PVC boat, and nothing says so.** Under "TRAILERS MADE FOR THIS BOAT" it lists trailers for the Sport 600, Patrol 600, Sport 660 and Patrol 660 ("GFAB Tandem Axel Trailer t/s …"), and maker tags set in a code face (`walk/q2-834-11-cascade-full.jpg`).
16. **Change the boat**. Total $69,338.
17. **Back to the build**. It lands at `?at=hull` with the page at y 0, under the photograph. The hull chapter is a screen away (`walk/q2-834-13-back-to-build.jpg`).
18. **04 Dealer fit**. The list now offers "Tube Covers to suit **PVC** Boat". The Hypalon covers are still on.
19. **Tube Covers to suit Hypalon Boat**, taking them off (the customer's "take it off again"). The toast says "taken off the quote · no price on it" with Undo. Underneath, "ALSO ON THIS QUOTE FROM PARTS & ACCESSORIES, AND NOT IN THE LIST ABOVE" lists 2 x MFM50 Batteries and Battery Box · Small, **both of which are in the list above**. Each part now shows twice (`walk/q2-834-15-part-off.jpg`).
20. **Who it is for**.
21. Name, `Mia Tran` (8 keys).
22. Contact, `mia.tran@example.com · 0400 111 222` (34 keys).
23. **Put their name on it**.
24. **On to the finale**.
25. **Give it to the customer**, then **Open the printed quote** (the 25th press is the paper).

At 1440: the first part's toast with Undo sits in the top right beside the shell's pill, and the motor row's name is cut under the sticky search band (`walk/q2-1440-03-after-first-part.jpg`). The cascade page puts the build's picture bottom-left on a blurred empty sea and the questions on the right. "Change the boat" is at y 1,109 of 900, under the fold (`walk/q2-1440-05-cascade.jpg`).

## Quote 3 at 834: the cheapest honest rig

The cheapest boat on the file is the Stacer 309 Skimma at $1,730 (Highfield's cheapest is $2,770).

1. **New quote**.
2. **Stacer**.
3. **309 Skimma** (first tile, no scroll).
4. **Start the quote**. $3,201: the hull at $1,730, a Yamaha F2.5SMHB at $1,468 and a **D Shackle · 10 mm Galv at $3**, all put on unasked. A first-time buyer's quote starts with a shackle nobody mentioned (`walk/q3-834-02-build-full.jpg`). The F2.5SMHB is the cheapest of the four motors, so the motor is honest. The chips read "2.5 hp 1 · 4 hp 1 · 5 hp 1 · 6 hp 1": four filters for four motors.
5. (Looked) **03 Trailer**: "Nothing from Stacer Trailers is made for this boat." That is true.
6. (Looked) **Show all 34 in Stacer Trailers**. The cheapest, "T Light Alloy Short 650 ATM S 13" L/Skid", is $3,146, more than the boat, and is said to fit no length. The honest rig leaves the trailer off (`walk/q3-834-05-trailers-all.jpg`).
7. Search, `safety` (6 keys).
8. **Safety Gear · Smooth Waters** (+$83). Total $3,284.
9. **Who it is for**.
10. Name, `Liam Doyle` (10 keys).
11. **Put their name on it**.
12. **On to the finale**.
13. **Give it to the customer**.
14. **Open the printed quote**. The paper numbers its chapters 01, 02, **04**: the trailer chapter is gone and its number with it.

Core presses: 12 (steps 1–4 and 7–14, without the two looks at the trailer).

## Quotes 4 and 5: a motor alone, parts alone

- New quote asks "Which boat is it?" and offers only makers of boats. Home says "Yamaha and ePropulsion motors, and trailers from 7 makers, are chosen in the build, on the boat."
- Typing `F70LB` in Home's find (5 keys) offers "Yamaha F70LB … Open it in the price list". Enter opens `/data/mot_yamaha`, the motors sheet: "209 motors in 9 series · 27 columns, **6 of them cost**", with an "Every column 27" switch one press away. There is no act that starts a quote (`walk/q4-1440-03-motor-record.jpg`).
- No route starts a quote whose first line is a part.

**Neither quote can be built today.** This is the blocker for the owner's "quotes are not just boats".

## Quotes, with several states (made by presses, never seeded)

On the walk-1 browser: quote 1 given, then **Make a new version** on it, then a Formosa GRT 455 · Side Console started from Home's tile (`walk/q5-834-04-quotes-several-full.jpg`, `walk/q5-1440-05-quotes-several.jpg`).

- At 834, three bands as rows: "DRAFT 2 $84,721", "GIVEN 0" and "REPLACED 1". The Draft band's $84,721 adds together two different customers' totals, one of them a replacement draft.
- **Make a new version moved the given quote to Replaced at once**, while its replacement is still a draft. "Given 0" is shown although the customer holds a given quote.
- Rows have no picture. The New quote bar sits inside the list, and the detail card is a form ("On the price list: Formosa - GRT 455 (Side Console)", "Items 3").
- At 1440 a 920 × 560 photograph fills the space under the list, away from the card it belongs to. At 834 there is no photograph at all.

## The GRT 455, as the owner saw it, measured again

- $35,080 on the boat page becomes **$44,112** on Start (Yamaha F60LC $8,866 and "Formosa GRT Tow Catch · Gal Steel, Single Axle" $166). The caption already says "On this quote: the Yamaha F60LC".
- The "trailer" is a tow catch. The finale says it "already has registration in its Cash price", and the paper prints it under **03 Trailer** (`walk/q6-grt455-paper.pdf`).
- The boat page reads "MAX 90 HP · MIN 60 HP" with no noun (`walk/q5-834-02-from-home-tile.jpg`).
- Dealer fit opens by itself with "5 offered · Nothing on it yet". The rigging kit for the F90LB2 · White comes first, for an F60LC quote.

## GST and terms (Milestone 4's carried item 1)

GST was set to 10 on `/manage?line=gstRate` ("Copied onto each quote when it is started"). The GRT 455 draft, already open, was then named and given. Its paper says "Tax: Included in every price. **No rate is set on this quote.**" The item is still open (`walk/q6-1440-04-gst-set.jpg`). On a cold browser Northside's legal name, ABN, address, phone, email and website are all "none given, so none prints", so none of the walked papers carry an ABN.

## What fits this boat, and how far away it is

From the build there is no way to it. The way is **Data** → **Fitment** → "Which boat?" again: the quote's boat is not carried, so the maker and the model must be chosen again. That is at least 4 presses and a scroll, and the screen has forgotten the quote. "For the workshop" in a chapter shows prop part numbers and rigging-kit text on every tile. It does not show what fits (`walk/q7-1440-01-for-the-workshop.jpg`, `walk/q7-1440-02-fitment.jpg`).

## Dropdowns, selects and menus met

There are none in the sale. Every choice was a tile, a chip, a segmented control or a short list, which is the right shape. The confusions come from lists that are too long and plain instead: 15 finishes as radios with codes, 2,238 parts as text with "the first 40", and 49 search results each with a code box.

## The floor the original HelmLogic's users set

1. **Colours shown as colours.** The boat page's swatch chips are this. The build's hull chapter falls back to a coded radio list, and the photograph never shows the chosen colour.
2. **A dealer adding their own picture** to a colour, a part or a flooring option. There is no such act anywhere in the build or the sheet. A search of `src/screens` and `src/ui` finds "added by" only on Customers.
3. **The parts catalogue.** In the build it is text rows with one repeated icon, no groups, no pictures and no "where it goes". It is below the floor.

## Milestone 3's carried items, walked

1. Finale → Prices → back. It lands on the right line, and the step line is in view (y 1,050 of 1,112 at 834, y 838 of 900 at 1440): **closed**. Back on the quote, the next act is under the fold at 1440 (y 908): **partly open**. The step line is the only way back and does not survive a reload.
2. The first quote adds a line by itself and refuses the give for it: **open**. Home now warns before the sale ("4 price questions wait for you…"): that half is **closed**.
3. "Kept in History" on Review: the sentence is gone from `src/screens`, **closed** (Review not walked).
4. File words on dealer screens: **open** in the sale ("Sell Price / Kit Sell Price / Install Retail Sell", "RRP + Freight Inc GST", "Sell, or Sell inc Install fitted", "ATM", "OA LENGTH", "Bottomsides", "TUBE DIA").
5. The pill over the because field on Rules: not walked (not the sale).
6. Quotes with one quote reads as a placeholder: **open** (`walk/q1-834-20-quotes-one-draft-full.jpg`).
7. Names cut on Home and History: not walked.
8. Counts summed in screen code: `Fitment.tsx` and `Rules.tsx` hold no `.reduce(`, **closed**.

## Milestone 4's carried items, walked

1. GST and terms never reach an open draft: **open**, as above.
2. The build says "Prepared by Asaf." without a title and phone: **open** (the cold desk has no person details either).
3. The stray " ·" at 390 and the empty page 2: page 2 is two-thirds empty on all three papers. 390 was not walked; it is passed on in `paper-handoff.md`.
4. Series names shouted: **open** for Stacer ("SEASPRITE DINGHYS").
