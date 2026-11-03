# Data, verified: data round, verify 2, 2026-11-03

This is a fresh verifier's report, and I changed no code. I built HEAD `81bfe86` into `e2e/out/dist-6234` and served it with `vite preview` on port 6234, started from my own scripts. I walked through the real door (a name, then *Load the Master Price File*) at 390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080. The server was stopped before I wrote this.

Every screenshot is in `verify-2/`, named `<size>-<nn>-<state>.png`. There are 185 of them, covering:

- arrival and the full page;
- scrolled and bottom;
- find (Highfield, F115, KAM, *motor fitment*, *x*, *zzqqxx*, *TILLER CONVERSION*);
- Highfield open, then one of its series on the sheet;
- *Oldest first*;
- Parts, expanded, scrolled, reloaded and folded, then a heading on the sheet;
- the matrix, and the matrix scrolled;
- the New list dialog, with an empty name, a taken name, the longest name, then undo;
- OBSOLETE;
- every room and every Needs door;
- a changed line and its door;
- no file.

## The jobs

| Job | State | Evidence |
|---|---|---|
| J1 which list, how big, how current | done | It shows "53 lists · 15,691 lines" and "Prices dated in their own headings from 19 May 2022 to 5 August 2026". At 1280, once a line has changed, the head wraps *between* its two clauses and no longer inside one (each clause is one line, at 145 and 165). The find drops 20 px with it (`1280x800-18-changed`). At 390, "The price list of 16 September 2026" and "53 lists · 15,691 lines" are separate lines, with no break after a dot (`390x844-01-arrive`). |
| J2 grouped holdings | done | There are 7 maker tiles and Every maker, 18 rows in 9 groups, and the 28 fitment lists as a maker × kind table with 8,679 lines (`*-02-full`). |
| J3 open Highfield | done | The address is `?at=boat_highfield`. The Highfield mark is drawn once in the window, on the tile. Seven series bars are presses, and they add to 588. *Classic* opens `/data/boat_highfield?in=Classic`. "Boat Module (5).xlsx" is shown, and there is no dead "and N more" (`*-05-highfield`, `*-06-series-on-sheet`). |
| J4 open a list to change it | done | A row, then *Open the list*, opens the list. Every series and fitment act carries an "opens the list" label (17 acts listed at every size). |
| J5 find | done | At every size, the answer sits 20–24 px under the field (field bottom 225, answer at 245 at 390). Highfield narrows the tiles to 1, and "7,439 lines hold “Highfield”, in 12 lists" lists 6 by name and 59 sections. F115 gives 306 lines in 12 lists, KAM gives 100 in 5, and *motor fitment* finds 8 lists by name. One letter and nothing found each get a sentence (`*-04`, `*-07`). |
| J6 what needs me | done | Five are open and one is done, each with its numerator and denominator and a door. *Settle them* goes to `/review`, *Choose* to `/levels?list=dealer_fit`, *Largest first* to `/data?at=trl_mackay` and *Read them* to `/rules`. *Oldest first* misses its heading at 834x1112 only (see the gaps). |
| J7 what is new | done | I typed 123 into Retail Labour's rate on the sheet. Data then said "1 line changed on this computer, of 15,691", "Labour Rates 1", and the row says "1 changed here". The door opens `/data/labour_rates?at=labour_rates:1` with Retail Labour selected and in view (at y 216 at 1280; `*-18`, `*-19`). |
| J8 make and undo | done | An empty name gets "A list needs a name." under an empty field with no placeholder. A taken name gets "There is already a list called “Yamaha Outboards”." A 62-character name makes a list that says "0 lines", and *Undo* then becomes *Put it back* (`*-12..15`). |
| J9 prices, own page, Fitment | done | The acts go to `/levels?list=boat_highfield`, `/places/boat_highfield` and `/fitment?maker=Highfield`. Rooms: Rules goes to `/rules`, Fitment to `/fitment`, Catalogue to `/catalogue`, Review to `/review`, Prices to `/levels` and Shelf to `/shelf`, at all six sizes. |
| J10 F115 at the desk | done | *Find “F115” for a quote* opens the bar's Find with F115 typed, and Yamaha F115LB is offered at the top (`*-24-desk-find`). |
| J11 no file | done | The state reads "No price list is open on this computer.", then what lands here, why it is empty, and what to do (`*-20-no-file`). |
| J12 a list no longer sold | done | It says "history rather than stock, so nothing from it is offered to a customer". Sideways scroll is 0 at all six sizes (`*-16-obsolete`). |

## The missing items

| Item | State | Evidence |
|---|---|---|
| The *Needs Northside* band | done | All five are present, with figures out of a total, and a sixth is done. The 25 dated sections show a year strip on one row at 834, 844, 1280, 1440 and 1920. At 390 the strip is not drawn. |
| What is new | done | See J7. |
| The six rooms as counted doors | done | Each room carries a figure and lands where it says (`*-01-arrive`). |
| One find over the whole file | done | See J5. |
| The 28 fitment lists as rows | done | The table fits its card at every size: at 1280 the card and the table both run 650–1240. Every cell, LINES included, carries the 1 px row rule. The head is not sticky, so it cannot collide with the bar. |
| A phone layout of its own | done | At 390 the order is the head, Needs, New since, the rooms, a one-row maker strip (150 px tall, scrolling sideways), then the lists. A spread opens under the strip at y 245. The first list row is at y 2275, the third window. |
| A lineup that opens | partly | It opens and folds back. Opening writes `?headings=all`, which survives a reload (187 bars). The control is one button with `aria-expanded` and `aria-controls`, and it sticks to the window's foot. Focus goes to the first heading it drew (VENTILATION), and after the fold it returns to *The other 175*. Some heading presses still land on the wrong place (gap 1). |
| The wide screens used | partly | Each row carries its state ("3 to settle · 4 dated headings", "named by no boat", "1 changed here"). At 1920 the Highfield spread now fills its band. At 1280, 1440 and 1920, the fitment table ends about 330 px above the end of the 18 lists beside it (gap 5). |

## The last verify's findings, re-measured

| Last finding | Now |
|---|---|
| Heading doors open the sheet at its top | **Fixed at 5 of 6 sizes.** *Oldest first* lands with the 2022 heading at y 366 (390), 100 (844x390), 222 (1280 and 1440) and 640 (1920). At **834x1112 it still misses**, and more presses miss too (gap 1). |
| An expanded lineup cannot fold | **Fixed.** See the lineup row above. |
| The spread jumps under the bar after expanding | **Fixed.** The page scrolls so that the focused bar sits mid-window (1280: VENTILATION at about 395). |
| The matrix overflows by 14 px at 1280, and its sticky head collides | **Fixed.** The card and the table both run 650–1240, and the head is static. |
| 844x390 dialog acts clipped | **Fixed.** The dialog runs 18–372 of 390, with *Make it* at 324–360 and no inner scroll. |
| The date line wraps mid-phrase at 1280 | **Fixed** to a wrap between clauses. The find still drops 20 px. |
| Year strip wraps 4+1 | **Fixed.** All five sit on one row (551 ×5 at 834/844, 499 ×5 at 1280). |
| 1920 Highfield floor | **Fixed.** The lists continue under the spread. |
| 834 floor under New since | **Fixed.** 834 is now one column. |
| Jeanneau and Signature marks are faint | **Not fixed.** In the matrix, Jeanneau is 59×33 and Haines 71×27, and the JEANNEAU word and the Signature script are still unreadable. The GFAB mark in a spread is about 55×10. |
| LINES column without rules at 1920 | **Fixed.** |
| Tile edges peek at 844x390 | **Fixed.** Nothing shows between the bar (8–50) and the spread (78). |
| 390 head breaks after a dot | **Fixed.** |
| Placeholder reads as a value | **Fixed.** The placeholder is empty. |

## The gaps

1. **Major: a heading door still lands somewhere else.**
   - At 834x1112, *Oldest first* goes to `/data/rig_kits?at=rig_kits:609`. The sheet's grid scrolls to 24,191 and draws STACER (Factory Fit) – Mechanical Rigging Kits. The Jeanneau DB/43 OB heading is in the DOM at 1.5 s (at y 7,586) and is gone by 4 s. The result is the same whether the door is pressed or the address typed, with touch or mouse, after 8 s (`834x1112-08-oldest-on-sheet`, `-08-oldest-touch-8s`, `-08-oldest-mouse-8s`).
   - At 834x1112, *Cap Camarat (Season 2023 …)* on Rigging Kits misses its heading (`834x1112-22-heading-miss-rig_kits-20`).
   - At 834x1112, *HIGHFIELD - Patrol 420* on Dealer Fit lands on HIGHFIELD - Sport 560/600 (`834x1112-22-heading-miss-dealer_fit-80`).
   - At 1280, 1440 and 1920, Parts' last heading *Generators (t/s Merry Fisher)* (`?at=parts:2672`) lands on "(unassigned) 27 products", and Generators is not in view (`1440x900-22-heading-miss-parts-186`, `1280x800-23-last-bar-parts`). At 1280 and 1920, Playwright's click on that bar had not returned after 8 s.
   - Every other probed press is in view (Parts 60 and 150; the five other sizes for Rigging Kits and Dealer Fit).
   - data.spec only asserts the URL, so it cannot see any of this.
2. **Major: Data and the sheet count a list's sections differently.**
   - Data says Parts has "187 categories", Rigging Kits "26 sections" and Dealer Fit "91 categories".
   - The sheet of the same list says 188, 27 and 92. The extra one on Parts is "(unassigned)".
   - Two screens one press apart disagree on a figure (`1280x800-02-full` against `1440x900-22-heading-miss-parts-186`, `834x1112-08-oldest-on-sheet`, `834x1112-22-heading-miss-dealer_fit-80`).
3. **Minor: the marks.** Jeanneau (59×33), Haines Signature (71×27 in the matrix, about 90×20 on a tile) and GFAB in a spread (about 55×10) cannot be read (`1920x1080-03-bottom`, `1920x1080-05-highfield`, `1280x800-11-matrix`). The Formosa mark in the matrix sits about 7 px under its row rule, while the other rows are centred (`1280x800-11-matrix`).
4. **Minor: the 1280 head grows to three lines once a line has changed.** The clauses are whole, but the find moves from y 147 to y 167 (`1280x800-18-changed`).
5. **Minor: empty floor on the right at wide sizes.** The fitment table ends about 330 px above the end of the 18 lists: 697 against 1040 in the 1920 bottom window, and 2155 against 2480 at 1280 (`1920x1080-03-bottom`, `1280x800-02-full`). At 1920, inside the Highfield spread, the left column is empty from about y 480 to 700, under the acts (`1920x1080-05-highfield`).
6. **Minor: 390, expanded.** Between the sticky *Fold back* strip (740–768) and the bottom bar (790), a sliver of the list behind shows: a green bar and a glyph at about y 780 (`390x844-09-parts-expanded`).
7. **Minor: focus is dropped on a direct address.** On an address typed directly (`/data?at=rig_kits`), *Back to the lists* leaves focus on `<body>` at scrollY 891. After a row press it returns to the Lists grid, as it should.
8. **Minor: 844x390, the dialog under the bar.** The New list dialog's top (18) sits inside the floating bar's band (8–50), and the bar's ends show on either side of it (`844x390-12-empty-name`).
9. **Minor: the Parts eyebrow wraps.** At 1280, "ITS 187 CATEGORIES, IN THE PRICE LIST'S ORDER" takes two lines, and at 844x390 so does "ITS 7 SERIES · 588 VARIANTS, IN THE PRICE LIST'S ORDER" (`1280x800-09-parts`, `844x390-05-highfield`).
10. **Not Data's, noted.** On the sheet that Data's doors open, header and count text is 11 px, and "Show only" measures as cut at 390 and 844x390. That belongs to the sheet's own round.

## The perfect bar, size by size

Clean at all six sizes, in every state:

- sideways scroll is 0;
- no text in Data's `main` is under 12 px;
- no truncated text;
- no page error.

- **390x844: NOT PERFECT.** The expanded lineup lets the list peek under the sticky strip (gap 6), and the marks cannot be read. Everything else holds: the head, the find answer under the field, the spread at the tile, the dialog (224–620), the refusal, the longest name, and the empty state.
- **844x390: NOT PERFECT.** The dialog sits under the bar's band (gap 8), the Highfield eyebrow wraps (gap 9), and the marks cannot be read. *Oldest first* lands (y 100).
- **834x1112: NOT PERFECT.** *Oldest first* and two more heading doors land on the wrong section (gap 1), and the section counts disagree (gap 2). The layout itself is clean and single-column, with no empty floor.
- **1280x800: NOT PERFECT.**
  - Parts' last heading lands on (unassigned) (gap 1).
  - The counts disagree (gap 2).
  - The head grows to three lines once changed (gap 4).
  - There are 330 px of floor under the matrix (gap 5).
  - The Formosa mark sits against its rule, and the eyebrow wraps.
- **1440x900: NOT PERFECT.** Parts' last heading lands on (unassigned) (gap 1), the counts disagree (gap 2), and there is floor under the matrix (gap 5).
- **1920x1080: NOT PERFECT.** Parts' last heading lands on (unassigned) and its click is slow (gap 1). The counts disagree, there are 340 px of floor beside the lists, a gap shows inside the Highfield spread (gap 5), and the Signature and Jeanneau marks cannot be read.
