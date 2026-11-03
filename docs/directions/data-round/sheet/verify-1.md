# The sheet: fresh verify, 2026-11-03

**Verdict: not perfect yet.** The blocker is fixed. Most of the judge's jobs now work. But at 1280, 834 and 844 there are still overlaps and cut names a screenshot would show.

How it was checked:
- Served from `e2e/out/dist-6224` on port 6224, and the server was stopped afterwards.
- Entered through the real door (the name, then "Load the Master Price File"). Every job was walked by keyboard and pointer from a script in my scratchpad, not from the builder's harness.
- Every frame is in `verify-1/` as `<state>-<size>.png`, at phone 390×844, phone-landscape 844×390, tablet 834×1112, laptop 1280×800, desktop 1440×900 and wide 1920×1080.
- After every frame, a measuring pass recorded sideways scroll and every ellipsis or clamp cut that was in view.
- Sideways page scroll was 0 in every state at every size.

## The jobs

| Job | State | Evidence |
|---|---|---|
| J1 Find | done | `02-find-*`: "Sport 560" gives 15 match, with counts on the series tabs (Sport 15, the rest 0) |
| J2 Nothing found | done | `03-find-nothing-*` and `03b-find-elsewhere-*`. The sentence, the 4 other lists counted, Clear the search, "7 series, none with a match". The head breaks at 1280 (gap 1) |
| J3 Variants at three prices | done | `01-rest-desktop` |
| J4 Enter writes | done | `05-written-desktop`: "Cash on Roll Up 230 KAM · PVC · WH: $2,770 → $2,850" with Undo |
| J5 Type onto a cell | done | Typing "28" left the field holding "28" with the caret at 2 (`04-typing-desktop`). 2850 wrote $2,850. 5321 then Tab wrote $5,321 |
| J6 Refusal keeps the draft | done | `07-refused-desktop`: the field still holds "12abc" under its pill. Escape wrote nothing: the step stayed on the earlier "Undone…" |
| J7 Record facts first | done | Cash at y=377 of 800 (`09-record-laptop`). Cash in view at 844×390 (`09-record-phone-landscape`). In a hand the picture comes first by design (`09-record-phone`). See gap 3 |
| J8 Change many | done | `08-selection-move-desktop`: By % 4 gives $2,770 → $2,880.80. By $100 wrote "Cash $100 added on 4 variants" with one Undo (`37-moved`). Round to $100 gives $2,770 → $2,800 (`36d`) |
| J9 Series in the address | done | Tabs carry counts (`01-rest-*`). Not re-pressed. `?in=sport` in lower case quietly opened Roll-Up (`16-scrolled-desktop`) |
| J10 Only the models | done | `10-models-desktop` |
| J11 Pictures | done | `11-pictures-*`, no cut measured |
| J12 Every column | done | `12-every-*` no longer opens with every model shut. The Boat column is cut at 160 px at every size (gap 5) |
| J13 One hidden column | done | `34-more-popover-desktop` |
| J14 Read at Trade | partly | A press on TRADE gives `?rung=` and the spine reads $2,631 (`35-read-at-trade-desktop`). Nothing on screen says the spine now reads Trade. Only the `title` and `aria-label` say it |
| J15 A new colourway | partly | Copy works: "Copied … as a new variant. Give it its own code and its own picture." (`31-copied`). Add a variant still says **"Add a picture of the A new variant of Roll Up 230 KAM"** (`32-added-desktop`) |
| J16 Delete | done | `33-delete-ask-desktop`: "This also removes 2 pairings from 2 tables." |
| J17 Hull to fitment | done | One press goes to `/fitment?boat=boat_highfield%3A1` |
| J18 Parts, Dealer Fit, Rigging Kits | partly | At a desk the names are whole, Dealer Fit says it has no price and links to Prices, and CTD and GP are marked cost (`20`, `21`, `28-desktop`). At 834 and 844 the names are cut (gap 2) |
| J19 Yamaha | done | `23-yamaha-desktop`: HP Rating and Shaft Length after the name. The name is kept beside the code on a measured argument (110 of 209) |
| J20 Pairing lists | partly | Hulls are named, heads are one size, RECOMMENDED is whole (`22-join-desktop`). At 834 and 844 the title "× Yamaha …" and the hull names are cut (`22-join-tablet`, `22-join-phone-landscape`) |
| J21 Labour Rates and Registration | partly | $144.55 and $143.10 are right. "Actual $105" is still unexplained. The inc-GST column prints $159 next to $110.00 and $121.00 (`26-labour-desktop`) |
| J22 Unknown list, or no file | done | `29-unknown-desktop` and `43-no-file-desktop`: a sentence and the door |
| J23 What Northside changed | partly | The cell is marked "changed here; the Master Price File had $2,770". The record says "The Master Price File had $2,770 · changed 3 Nov" (`40-hand-warned-phone`), which gives when but not who |
| J24 Warned under cost or Trade | done | `06-warned-desktop` and `40-hand-warned-phone`: Landed Hull Cost $1,671.43 and Trade $2,631, each "587 of 587" |

## The judge's missing items

| Item | State | Evidence |
|---|---|---|
| Typing onto a cell keeps the first key | done | J5 |
| Filters by column in the URL | done | `13-ask-*`: empty, under cost, under Trade, no picture, changed here, compare. A keyboard Enter wrote `?only=empty~boat_highfield.qt`. Discontinued is offered where the file marks yes or no |
| Arithmetic on a selection | partly | +%, +$ and round are there, as one command with one Undo. HYP = PVC + $x is not. A move below $0 previews "$2,770 → −$3,230" with a live "Change 4" (`36-move-refused`). The refusal ("4 lines would go below $0, so nothing was changed.") only comes after the press (`36c`) |
| Warning under cost or Trade | done | J24 |
| Changed mark, with who and when | partly | J23: no who |
| Duplicate a variant | done | J15 copy. The Add a variant sentence is gap 4 |
| A search that finds nothing | done | J2 |
| A colour legend to complete | not | There is no legend. "I-B-C" draws no stripe at all, not even for the B and C it knows (`02-find-desktop`) |

## Perfect at each size?

**390 phone: not perfect, close.**
- `01`, `03b`, `13-ask`, `09-record`, `22-join` and `42-hand-record-foot` read clean.
- The step plate covers Trade and Warranty under the warning (`40-hand-warned-phone`). This is minor.

**844 phone-landscape: not perfect.**
- Cut: the join title "× Yamaha …" at 133 px, and the hull "Roll Up 230 KAM · Hypalon · Light G…".
- Cut: Dealer Fit names at 525 px.
- Cut: the said-once line "3 air ch…".
- Cut: the Parts category "SAFETY GEAR … (NB: …)".
- Cut: the series tab "Patro" under the Price list pill.
- Overlap: the hint "Press a value again to change it ·" runs under $2,770 and the close pill, so only "it ·" shows (`09-record-phone-landscape`, measured at 577 to 735 px).

**834 tablet: not perfect.**
- The same hint overlap (`09-record-tablet`).
- Cut: the join title at 123 px, and hull names at 216 to 221 px.
- Cut: Dealer Fit names at 500 px, and Rigging Kit names at 443 px.
- Cut: 4 Dunbier category names, "Boat Registration - Pensioner / …", and the "?only" variant names at 72 px.
- The sub-bar line "588 boats, each said once…" sits against the bar's top edge (`22-join-tablet`, `28-rigkits-tablet`).
- "SELL PRICE" is a two-line pill blob.

**1280 laptop: not perfect.**
- With a search typed, the head's "Same on all" block is squeezed:
  - Typing "Sport 560" wraps it to 3 lines, and "Other Charges" slides under the blue bar at y=140 (`02-find-laptop`).
  - With "zzqx", Base Freight's $0 is clipped to 4 px and Other Charges' $0 is gone (`03-find-nothing-laptop`).
- The "?only" variant names are cut at 104 px.

**1440 desktop: not perfect, close.**
- The "?only" variant names are cut at 104 px ("Open (PVC) LG-…", `14-only-desktop`).
- The refusal pill covers the next row's Cash and Trade, showing ",631" (`07-refused`).
- In Parts and Yamaha, the band's price range sits under the Code column, not under Sell (`20-parts-desktop`, x 792 to 849 against SELL at 948 to 993).
- The picture caption is cut: "shown in White / White / White…".

**1920 wide: not perfect, close.**
- Parts' Install Type is cut at 211 px with room to spare (`20-parts-wide`).
- In the record, "Boat Registration Not Requir…" is cut (`09-record-wide`).
- In Every column, Boat is cut at 160 px and "INT LENGTH CM" is cut.

## Gaps

1. **Major: at 1280 the head spills over the bar when a search is typed.** `02-find-laptop` and `03-find-nothing-laptop`. The G2 fix starts at 1099 px, not 1280.
2. **Major: names are cut at 834 and 844.**
   - The fitment list's own title.
   - Hull names.
   - Dealer Fit, Rigging Kit and Parts names.
   - Category names.
   - The said-once line.
   - The "?only" variant names, also at 1280 and 1440.
3. **Major: a hint is drawn under the open row's Cash figure and close pill at 834 and 844.** Only "it ·" shows.
4. **Major: "Add a picture of the A new variant of Roll Up 230 KAM".** It is a broken sentence on the line the builder said was mended.
5. **Minor:**
   - Every column's Boat column is cut at all six sizes.
   - Install Type and the record's Registration are cut at 1920.
6. **Minor: nothing on screen says the spine is reading Trade** (J14).
7. **Minor: Labour Rates.** "Actual $105" is unexplained, and the inc-GST column prints $159 next to $110.00.
8. **Minor: who is never said for a changed cell** (J23).
9. **Minor: a move below $0 is shown as a live plan** with negative prices before it is refused.
10. **Minor: no colour legend**, and "I-B-C" draws nothing.
11. **Minor:**
    - The band's price range is under the Code column.
    - The refusal pill covers the next row.
    - The tablet sub-bar is cramped.
    - The tab "Patro" is cut.
    - The picture caption is cut.
12. **Minor: HYP = PVC + $x is not offered.**
