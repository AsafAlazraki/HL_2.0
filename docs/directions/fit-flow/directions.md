# The boat's door and what fits: three directions

Drawn 2026-11-05 to answer what the owner said on 2026-11-04: "we should be able to do the what fits from the home boats thing not just open quote and stuff … the whole experience … was just so confuising". Two cold walks found the confusions (`walk-1-1.md`, `walk-1-2.md`). The sweep behind these boards is `docs/research/refs/boat-door/notes.md`: 13 makers and dealers, 42 frames read.

**The one job:** from one boat, see what goes on it and why, and quote it with what fits.

**Drawn on the price file as loaded.** The walk's "Stabicraft PA 600" is not on the file. The PA600 is Highfield's Patrol 600, with 10 versions at $30,190 to $40,670. Every board therefore draws the Patrol 600 and says the near miss in Find. The second boat is the Highfield Sport 560, with 15 versions. Every figure was read on this tree through `readBoatFit` and `readWhole` (`src/domain/fitment/boat.ts`).

| | Patrol 600 (Open · PVC · LG/W/DG, HBP181) | Sport 560 (PVC · W/W/WB, HBS113) |
|---|---|---|
| Boat at Cash | $30,190 | $41,340 |
| Takes | 115–150 hp, one motor, 25″, remote | 90–115 hp, one motor, 25″, remote |
| Motors that go on it | 5 of 209, with the F115XB starred at $16,869 | 4 of 209, with the F90XB starred at $14,531 |
| Why the rest do not | 60 under · 72 over · 10 short shaft · 1 tiller · 14 in range but not paired · 47 twin and triple rigs | 52 · 92 · 8 · 2 · 4 · 47 |
| Trailer | none paired (0 of 434) | REDCO Custom / Highfield Sport 560 Aluminium · TA600-MOB, $10,713 |
| Fit-out that goes on it | 4 dealer-fit packages (no price set) and 3 parts: $418, $36, $24 | 4 dealer-fit and 3 parts: $398, $36, $18 |
| **Named for it, not paired** | GFAB Tandem Axel Trailer t/s Highfield Patrol 600, $23,063 · 40 dealer-fit packages carrying PA600 (4 in this version's PVC · LG-W-DG) · Sundeck for PA600, $1,750 | 15 dealer-fit packages carrying SP560, one of them this exact version (*Sport · SP560 PVC · W-W-WB*) · Boat Cover · SP560, $1,840 · Stern Shade for SP560, $630 |
| The quote it starts | $47,059: boat and F115XB, before the rigging kit | $66,584: boat, F90XB and REDCO; $66,982 with the 2 x MFM50 Batteries |

The last two rows are the walk's two blockers made visible. A line whose own name says it is for this boat, but which the price list's pairings leave out, is now counted as what it is. It is never filed as "not made for it", and it never goes on a quote as if it fitted. Northside can pair it in one press.

## What all three share

These are the answers no direction can skip, so the boards differ in structure and not in honesty:

- **Two jobs, two places.** Choosing for a quote is never side by side with changing Northside's offer. Taking a motor off "all 10 of its versions" happens only in a change mode that names that scope. A line taken off stays where it was, tagged "Taken off today", with Put it back and an Undo that reads in the past tense.
- **Named for it, not paired**, counted with its reason, under each place.
- **Plain words.** "5 go on it", "Why the other 204 do not", "version 1 of 10", "no price yet", "Chosen for the quote" and "The quote this starts". Gone: "On the quote" before a quote exists, struck names, the slider, "Open the boat's line", "WEIGHED, OR ITS SERIES", "ITS OWN FIGURES", "Show these 1" and the unlabelled "2".
- **Where you are.** The page lights the nav tab it was reached from (`from=home` or `from=data`) and says so in a crumb. The title is the model, with the version under it.
- **Find.** The exact name ranks first. Every boat row carries its own doors. A wrong maker gets "No Stabicraft is called PA 600. The PA600 on the price list is Highfield's Patrol 600", and what was typed survives a maker change.
- **From the build.** The motor list ends with "What fits the Patrol 600", which opens the boat's page at its motor (task 5 of the walk).

## A · Two doors, one page (recommended)

`boards/a-two-doors-one-page.html`, rendered as `a-two-doors-one-page-1440.png`, `-1440-fold.png`, `-390.png` and `-390-fold.png`.

Every Home card has two equal doors, **What fits** and **Quote it**, and so does every boat row in Find. What fits opens one page per boat, read top to bottom with nothing hidden behind a press. The head carries the name, version, price and photograph. The capability row follows (115–150 hp · 25″ · remote · 6.16 m · 14 people · 694 kg · 140 L), then Motor, Trailer and Fit-out, each with its choices, its "Named for it, not paired" panel and its counted reasons. A dark bar fixed at the window's foot reads "The quote this starts", lists every chosen line with the total, and carries Start the quote. "Change what Northside offers" turns the same page into change mode under an amber band.

References not used by any earlier board: **rhinorack.com.au** (`live/rhinorack-crossbars.png`, `Explore` and `Fit My Vehicle` side by side on every tile) and **subaru.com.au** (`live/subaru-outback.png`, the capability figures in one row with the build door at its end).

## B · The boat's own bar

`boards/b-the-boats-own-bar.html`, with the same four renders.

A Home card is the boat, and pressing it opens the boat's page. Quote it rides on the card's corner. The page has a product bar that stays under the nav, with the name, the version, tabs (Overview · Motor · Trailer · Fit-out) and "Quote it · $47,059". Motor shows the five side by side as columns, with the other 204 as one stacked bar and its key. Fit-out is a catalogue that keeps the boat's name, with a price or "No price set yet" on every card. Change mode turns the bar amber.

References: **mazda.com.au** (`live/mazda-cx5.png`, the model bar with BUILD & PRICE) and **kia.com.au** (`live/kia-sportage-accessories.png`, `Features | Accessories` keeping the model).

## C · Menu and receipt

`boards/c-menu-and-receipt.html`, with the same four renders.

A Home card keeps one target, and pressing it slides out a drawer over Home (`/?boat=PA600`). The drawer has what fits as choices and the quote those choices make pinned at its foot. The full page uses the same two panes at full width, with each place's why-not opening in place. In change mode the receipt pane becomes Northside's ledger of changes. On a phone the receipt is a bar above the nav that rises as a sheet.

References: **build.scoutboats.com** (`live/scout-build-235.png`, engines with deltas beside the estimated total and a summary) and **arb.com.au** (`live/arb-hilux.png`, START YOUR BUILD; `-scrolled`, Find Your HiLux Fit).

## The walk's tasks, pressed on each

Counts are presses at 1440 × 900, with typing counted separately as the walk counted it. They are counted on the boards' drawn flows, not measured on a built screen.

| Task | Today (walk 1) | A | B | C |
|---|---|---|---|---|
| 1. What goes on a "Stabicraft PA 600", and why not | 7 + 2 typings, after a 4 + 2 dead end | 2 + 1 (Find, *What fits* on the named Patrol 600; the trailer and every reason are on the page) | 3 + 1 (plus the Trailer tab) | 2 + 1 for the drawer; 4 + 1 to read why the other 433 trailers do not go on it |
| 2. Take the F150 off, put it back | 5 | 3 (*Change what Northside offers*, *Take it off*, *Put it back*) | 4 (plus the Motor tab) | 3 on the full page |
| 3. Add a dealer-fit part | 4 + 1 | 1 (tick it) | 2 (Fit-out, *Add*) | 1 on the page; 2 in the drawer |
| 4. Start the quote with what fits | 3, and the part was lost | 1, and the bar names every line it carries | 1 | 1 |
| From Home, quote the boat | 1 | 1 (*Quote it*) | 1 (the corner) | 2 (card, *Start the quote*) |
| 5. From the build, why not this motor | not possible | 1 (*What fits the Patrol 600*) | 1 | 1 |

## The recommendation: A

**A is the simplest, and it answers every confusion the walk found.** It adds one control to Home (a second door per card) and one mode to the boat's page. It needs no drawer and no tabs, and there is no second copy of the boat's offer to keep in step with the first. Because nothing on the page opens or closes, the phone failure the walk found most often ("I pressed Trailer and nothing seemed to happen") cannot happen. Because the quote bar is fixed at the window's foot, *Start the quote* is never "far down" at any of the six sizes.

**What lost, and why.** B reads like a car maker's site, which customers know, but every place is one tab press away and its corner pill is easy to miss on a card. C draws the strongest picture of choosing and seeing the quote together, but it builds two surfaces for one boat (a drawer and a page), and its menu is close to a second configurator beside `/quote/$id`.

**What A asks of the engine before any pixel**, each a pure derivation in `src/domain/fitment` with its test:

1. **Named for it.** For a boat and one of its lists, the rows that are not paired but whose name carries the model's code or name. Counted as 1 trailer, 40 dealer-fit and 1 part for the PA600, and 0, 15 and 2 for the SP560, and kept out of every offer.
2. **Exact first.** The Find ranking puts an exact model name ahead of its longer siblings (Patrol 600 before Patrol 600 EW and ST).
3. **Taken off.** Its own group in `readWhole`, so a line Northside took off is never filed as "not made for it".
4. **The quote it starts.** The ticked fit-out lines cross onto the new quote with the boat, the motor and the trailer.

**What the owner decides by eye:** whether two doors on every Home card is too much on a phone (A draws the four cards two across at 390, each with both doors), and whether "Named for it, not paired" should also be pairable straight from the selling page. The boards keep it in change mode only.
