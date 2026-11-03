# Data, verified — data round, verify 1, 2026-11-03

A fresh verifier, read-only on the code. Built into `e2e/out/dist-6234`, served by `vite preview` on 6234, walked through the real door (name, then *Load the Master Price File*) by my own Playwright scripts at 390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080. The server was stopped before this was written. Every screenshot is in `verify-1/`, named `<size>-<nn>-<state>.png`. (`16-parts-expanded*` caught the spread *before* the press, because my first walk looked for a button called "more"; `19-parts-expanded` is the real expanded state.)

## The jobs

| Job | State | Evidence |
|---|---|---|
| J1 which list, how big, how current | partly | "53 lists · 15,691 lines" and "Prices dated in their own headings from 19 May 2022 to 5 August 2026" at every size (`*-01-arrive`). At 1280, once a line has changed, the line wraps mid-phrase again: "Last change on this / computer: 3 November 2026", and the find drops 20 px (`1280x800-30-new-since-changed`). |
| J2 grouped holdings | done | 7 maker tiles, 18 rows in their groups, and the 28 lists of what fits as a maker × kind table with 8,679 lines (`*-02-full`). |
| J3 open Highfield | done | `?at=boat_highfield`, the mark drawn once (on the tile only), and 7 series adding to 588. Pressing Classic lands on `/data/boat_highfield?in=Classic` with Classic lit (`1280x800-25`). The source is "Boat Module (5).xlsx". |
| J4 open a list to change it | done | Row, then *Open the list*, gives `/data/trl_nsmcustom`. Enter on a cell edits it (`1280x800-28/29`). |
| J5 find | done | Highfield finds 1 maker and the tiles narrow to 1. F115 gives "306 lines hold “F115”, in 12 lists", drawn under the field: answer at y 225 against a field at 205 on a 390 screen. "motor fitment" gives 8 by name. KAM gives 100 lines in 5 lists. One letter and nothing found each get a sentence (`*-08..11`). |
| J6 what needs me | done | 5 open and 1 done, each with a figure, what it is out of, and a door (`*-01-arrive`). One door does not land where it says: see the gaps. |
| J7 what is new | done | I changed Retail Labour's rate on the sheet. Data then said "1 line changed on this computer, of 15,691", Labour Rates 1 → `/data/labour_rates`, and the row says "1 changed here" (`1280x800-30`). The door opens the list, but not at the changed line. |
| J8 make and undo | done | An empty name is refused with "A list needs a name." A taken name is refused with "There is already a list called “Yamaha Outboards”." The made list says "0 lines", and Undo turns to Put it back (`*-12..15`). |
| J9 prices, own page, Fitment | done | Choose → `/levels?list=dealer_fit`. Own page → `/places/boat_highfield`. Every maker → `/fitment`. Largest first → `/data?at=trl_mackay`. |
| J10 F115 at the desk | partly | The answer carries a sentence about the bar's Find and a Catalogue link. The bar's Find is named but not offered as a press. |
| J11 no file | done | A three-part empty state and the door, at every size (`*-17-no-file`). |
| J12 a list no longer sold | done | Sideways scroll is 0 px with OBSOLETE open at all six sizes (`*-06-obsolete`). |

## The missing items

| Item | State | Evidence |
|---|---|---|
| The *Needs Northside* band | partly | All five are present with numerators and denominators. *Oldest first* goes to `/data/rig_kits?in=RIGGING KITS - Jeanneau DB/43 OB (as at 19/5/2022)`, but the sheet drops `?in=` and draws Tiller Conversion Kits at the top. The 2022 heading is not in the DOM: `/data/rig_kits?in=…` directly gives url "", scrollY 0, hits [] (`*-21-oldest-on-sheet`, `1280x800-24`). |
| What is new | done | See J7. |
| The six rooms as counted doors | done | Every room has its figure (`*-01-arrive`, 1920 in a 2×3 grid). |
| One find over the whole file | done | See J5. |
| The 28 lists of what fits as rows | partly | They are there as a table with counts and 28 buttons. At 1280 the table is 650–1254 inside a card at 650–1240, so it overflows by 14 px: "LINES" and 5,765 sit on the card's edge, and the row rules stop at 1187 (`1280x800-26-matrix`). Marks are 44×24 px for Jeanneau and 62×24 for Haines Signature, and neither can be read. |
| A phone layout of its own | partly | The answer is under the field and the spread opens at the tile (top 10 px). The order is needs, new, rooms, then 2-column tiles 544 px tall, which is not a compact strip. The first list row starts at y 2641, the fourth window. |
| A lineup that opens | partly | Twelve headings show, then "The other 175, holding 2,797" draws all 187. After that press: no way to fold them back; the state is not in the address (still `?at=parts`, and a reload shows 12 again); focus falls to `<body>`; at 1280 and 1440 the spread jumps to top 16 under the bar at 8–50 (`*-19-parts-expanded`). Heading presses on sectioned lists (Parts, Rigging Kits) do not land at the heading (see above). |
| The wide screens used | partly | At 1920 the arrival fills the window. With Highfield open, the floor is empty from y 741 to 1080, 31 % of the window (`1920x1080-04-highfield`). At 834, under *New since* (left column, ending 1173), there are about 290 px of empty floor beside the rooms. |

## The perfect bar, size by size

- **390x844: NOT PERFECT.**
  - The head breaks after a dot: "16 September 2026 ·" / "53 lists" (`01`).
  - The first list row is at 2641 px.
  - Expanding Parts makes the page 11,443 px tall, with no fold.
  - *Oldest first* lands on the wrong heading (`21`).
  - The refusal says "A list needs a name." under a field whose placeholder "Boat show leads" reads as a value (`12`).
  - Sideways scroll is 0, no text is under 12 px, and nothing is truncated.
- **844x390: NOT PERFECT.**
  - The New list dialog is 358 px tall at y 16, and *Make it* and *Not now* are cut at its foot (`12-empty-name`).
  - With Highfield open, the tiles' bottom edges peek out between the bar (8–50) and the spread (78) (`04`).
  - The year strip wraps 4+1, leaving 2026 alone on a row (row tops 551, 551, 551, 551, 589).
- **834x1112: NOT PERFECT.**
  - The year strip wraps 4+1.
  - There are about 290 px of empty floor under *New since* (`02-full`).
  - *Oldest first* misses its heading.
- **1280x800: NOT PERFECT.**
  - The matrix overflows its card by 14 px (`26`).
  - The matrix's sticky head sits under and beside the floating bar when scrolled (`26`).
  - The year strip wraps 4+1.
  - The head wraps mid-phrase once a line has changed (`30`).
  - After the Parts expand, the spread head is under the bar (`19`).
  - The marks in the matrix cannot be read.
- **1440x900: NOT PERFECT.**
  - After the Parts expand, "ITS 187 CATEGORIES" sits at about 288 px, but the spread jumps to the top and the tiles head is at y 82 (`19`).
  - Focus is lost to the body.
  - *Oldest first* misses its heading.
- **1920x1080: NOT PERFECT.**
  - With Highfield open, 340 px of empty floor (`04`).
  - The matrix's LINES column has no row rules: the cells' border-bottom is 0 and the rules end at about 1755 of 1840 (`02-full`).
  - Signature and Jeanneau marks are 83×32 and 58×32 on the tiles, and too faint to read.

**Clean at all six sizes:** no page error, sideways scroll 0 in every state, 0 nodes under 12 px, no visible truncation (the one hit is the screen-reader-only `.dt-sr`), and 0 overflow in the empty state.
