# The sheet (`/data/$table`): built, 2026-11-03

The judge's verdict was **deepen** (`judge.md`). The composition stays as it was: the mark-headed list, series chapters in the address, the model spine with its price per material, rows that say only what differs, the record under its row, three doors, and one command per write with Undo. This round added the function, depth and finish the judge found missing.

Every state was photographed after the last change through the real door with the real Master Price File, at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080. There are 139 screenshots in `after/`, named `<state>-<size>.png`. The sizes are named phone, phone-landscape, tablet, laptop, desktop and wide. The harness is `e2e/flows/sheet-shots.spec.ts`, which runs only with `SHEET_SHOTS=1`.

Each screenshot was read. The states:

- `01-rest`, `02-find`
- `03-find-nothing`, `03b-find-elsewhere`
- `04-typing`, `05-written`, `06-warned`, `07-refused`
- `08-selection-move`, `09-record`, `10-models`, `11-pictures`, `12-every`
- `13-ask`, `14-only`, `15-only-nothing`
- `20-parts`, `21-dealerfit`, `22-join`, `23-yamaha`, `24-dunbier`, `26-labour`, `27-registration`, `28-rigkits`

States 04 to 08 are desk-only (a hand edits in the record).

---

## The blocker

**G1 · Typing onto a selected cell keeps the first key.**
- The editor now knows whether a key opened it (`Editing.seeded`):
  - Opened by a key, it puts the caret after that key.
  - Opened by Enter or a press, it selects the value.
- Typing 2850 writes $2,850 (`05-written`). Typing 5321 then Tab writes 5,321.
- A unit test and an e2e test at every desk size both type the figure straight onto the cell.

**J6 · A refusal keeps the draft.**
- Enter or Tab on "12abc" leaves the field open on "12abc" under its pill (`07-refused`), so the person can mend it.
- Escape lets both go.

**An edit now ends once.** This was found by reading the screenshots and was not on the judge's list:
- Escape used to take the focus back to the grid before the field was drawn away. The field's blur then finished the edit a second time from the old draft.
- So Escape wrote the figure it was pressed to throw away, and a refused draft came back under its pill.
- A unit test now proves that Escape writes nothing.

## The majors

**G2 · The two overlaps.**
- Finder over the bar at 834:
  - The head now grows rather than spills from the tablet down.
  - Its middle is hidden there even when it is empty. An empty `<span>` was taking the find field's column on lists with no said-once facts, which pushed the finder under the title and over the bar.
- Price head over the next head at 1440 and 1920:
  - A price head too long for one line now takes two lines inside its own column. The column gets half the head's length, and never more than half again its floor (`priceWidth`).
  - "Sell inc Install (if appl.)" now stands in its own column (`20-parts-desktop`, `20-parts-wide`).
- New e2e coverage:
  - An e2e test asserts at all six sizes that the finder ends above the bar on Parts.
  - At a desk it asserts that no column head's name leaves its column.
  - Two ruler routes were added to `e2e/routes.ts`: `sheet-parts` and `sheet-nothing`. Contrast, cut, overlap, ramp and focus now open a list that is not a boat list, and the nothing-found state, at six sizes.

**G8 · A search that finds nothing.** Where the list would be, the sheet now shows (`03-find-nothing`, `03b-find-elsewhere`):
- A sentence: "Nothing on Highfield Inflatables matches 'zzqx'."
- The other lists of the Master Price File that carry every word, counted. For "F4SMHA" from Highfield:
  - Highfield × Yamaha 8 lines
  - Stacer × Yamaha 3
  - Dealer Fit Packages 1
  - Yamaha Outboards 1
- Clear the search.

The bar says "7 series, none with a match" once, not seven tabs each counting 0. A question that no line answers gets the same treatment (`15-only-nothing`).

**G3 · A list with no declared price.**
- Dealer Fit, Rigging Kits and Registration say: "No column of Dealer Fit Packages is declared its price yet, so none is lit here. Prices decides it". The link goes to `/levels?list=…`.
- Which column is the price stays Prices' decision. The sheet does not guess it.

**G4 · Cost said to be cost.**
- On the sheet, any figure named with the file's cost-to-dealer abbreviation is now marked cost. So is the kits list's gross profit in dollars.
- Dealer Fit's spine no longer prints Labour CTD (`21-dealerfit`).
- Rigging Kits' GP ($) moved from the reading columns to the costs (`28-rigkits`).
- "Total Lab" is hours: Dealer Fit's 3.5 against Labour Ret $556.50 is 3.5 × the $159 retail rate. It prints as a plain 3.5, not $3.50.
- Every cell is now painted with its band, as the spine is. Labour Rates reads $144.55, $143.10 and $105 (`26-labour`), where it read 144.55 and 143.1.

**G5 · Lists that are not boat lists.**
- Parts, Dealer Fit, Rigging Kits, the motors, the trailers and Registration have no spine column at a desk.
- Each category is now a one-line band over its products. The band has its name and count, its price range and what its lines share, in the shut line's own columns. It stands at the top while its products scroll.
- Under the last product there is air as tall as the band, so the band is never pushed over a product.
- The product name takes the width (`20-parts-*`, `23-yamaha-*`, `24-dunbier-*`, `28-rigkits-*`).
- Boats and the pairing lists keep the spine.
- The name gives way before the count: a long category's name is cut, never how many it holds.

**G6 · Motors.**
- Yamaha now reads Motor, HP Rating, Shaft Length, Model Code, Sell Price, Trade Price (`23-yamaha-desktop`).
- The name stays beside the code: measured, "Yamaha - <code>" is the whole name on only 110 of 209 lines. The rest name twin rigs, colours and other codes, so the code cannot stand in for the name.

**G7 · Pairing lists.**
- Each hull is said the way every other screen says it: "Roll Up 230 KAM · PVC · WH", not "Highfield - RU230KAM (PVC) WH".
- Every hull head is one size, whether it holds one row or twelve.
- "RECOMMENDED" is whole (`22-join-*`).
- In a hand the head column says BOAT over the boats, and MODEL over a boat list's models.

**G9 · Asking the values (`?only=`).**
- What a "Show only" press offers:
  - Each declared price missing.
  - What the file marks yes/no (Discontinued).
  - Each price under its cost, and the first price under the next rung. Each is offered only where the rest of the list keeps it on nine lines in ten or more, and is said with its measurement.
  - No picture.
  - Changed here.
  - A comparison: any figure at least or at most a number.
- Highfield, counted (`13-ask-tablet`):
  - No Cash 0, No Trade 0, No Warranty 0
  - Cash under Landed Hull Cost 0, kept on 588 of 588 lines with both
  - Trade under Landed Hull Cost 0, kept on 588 of 588 lines with both
  - Warranty under Landed Hull Cost 42, kept on 546 of 588 lines with both
  - Cash under Trade 0, kept on 588 of 588 lines with both
  - No picture 54
  - Changed here 0
- "Max HP at least 150" keeps 162 of 588 variants (`14-only`).
- Questions read across every series, stand as chips with how many lines answer, and are a link.
- The derivation is pure: `src/domain/catalogue/table/only.ts`.

**G10 · A move on a selection.**
- By %, by $, or round to $. Each line is shown before and after first ($2,770 → $2,880.80), the lines with no figure are counted, and lines the move would take under their cost are warned of (`08-selection-move`).
- It is written as one batch with one Undo.
- A move that would take any line below $0 is refused whole.
- The derivation is `src/domain/catalogue/table/priceMove.ts`.

**G11 · Warnings.**
- Cash $850 on the Roll Up 230 KAM line says, beside Undo (`06-warned`):
  - "Cash $850 is under this line's Landed Hull Cost, $1,671.43. The rest of the list keeps Cash at or above it on 587 of 587 lines with both."
  - The same sentence for its Trade, $2,631.
  - A "Keep it" button.
- The rule is measured without the line being changed.
- A warning on every later rung was tried and dropped: it put a third warning under one Cash, about Warranty.

**G12 · What Northside changed.**
- The route fetches the list as the Master Price File carries it, only to compare (`fileOf`). A changed cell carries a corner in the accent, and its name says "changed here; the Master Price File had $2,770".
- The record says the same under the fact, with who and when where the session kept it. A line the file does not carry is said to be new here.
- Where the file cannot be fetched, nothing is marked.
- The derivation is `src/domain/catalogue/table/asLoaded.ts`.

**G13 · The record, facts first.**
- The record now leads with the section the price is filed in (Hull Only Pricing).
- From 1100 px the picture stands at the right at 224 px (`09-record-wide`). From 640 to 1099 px it follows the facts at most 160 px tall (`09-record-phone-landscape`: Cash is in view when it opens). In a hand the record is the screen, picture first.
- Its name takes a second line rather than "…".

**G14 · Copy as a new variant.** It carries every value of the line except three:
- Its code, because two lines cannot be ordered by one code.
- Its picture, because a picture belongs only to the line it depicts.
- Where it came from in the file.

The record opens on the copy. The step says "Copied Roll Up 230 KAM · PVC · WH as a new variant. Give it its own code and its own picture."

A line with no name is now said "A new variant of Roll Up 230 KAM". "(no name)" and "Add a picture of the" are gone.

## Minors

- **G15 · Colour.** Each part of a colourway is now an upright stripe of paint, not a 12 px square (which read as a checkbox) or a round chip (which read as a radio button).
- **G16 · The selection plate.** It prints figures as the grid does ($2,770 × 2) and is 560 px wide at most.
- **G17 · Labour Rates.** Its figures now print as money (see G4).
- **G19 · The step line.** It says what moved: "Cash on Roll Up 230 KAM · PVC · WH: $2,770 → $850", "Added a variant to Roll Up 230 KAM".
- **G21 · The rung switch.** It says what it switches under a pointer.
- **G23 · Every column.** It opens with every line open.

---

## What is not done, and why

- **G15, the colour legend the admin completes (minor).** Not built. Naming WH, I, O and R is a setting Northside keeps, which belongs to Settings and the store. It is not this screen's to keep.
- **G18, three prices at 834 (minor).** Not closed.
  - With the spine at 300, the leading word at 64 and the tail at 96, a tablet has 326 px for the variant, Cash and one more column.
  - Trade can only come in where the Model Code goes out, and the tests that open a found row read that row's code.
- **G20, the record's labels are the file's headers (minor).** Not built.
- **G22, the phone's chrome (minor).** Not closed. The head still takes the same share at 390, and the series strip still fades its last tab.
- **"HYP = PVC + $x" across rows.** Not built. It needs a pairing of variants by colourway that the file does not name.
- **Where the comparison baseline comes from.** It is the packed Master Price File. A list brought in by the Shelf is compared with the packed file, and the sheet says "the Master Price File".
- **Who changed a cell.** Who and when are known only for this session's writes, because the event record is not persisted (`EVENTS_KEPT`).
- **The shared cost reading is not changed.** `isCostColumn` (`src/domain/quote/pricing.ts`) still reads only the bare cost-to-dealer column and its total. The labour, kit, install and part cost-to-dealer columns are marked cost on the sheet alone. Whether a customer-facing surface can reach them is for the owner of those surfaces to check.

## Tests rewritten to the new truth

`src/screens/sheet/Sheet.test.tsx`:
- "draws a colourway as colour beside its code…": flag swatches became paint stripes.
- "writes through the store with Undo pinned…": "Cell edit · Highfield Inflatables" became "Cash on … → $4,321".
- "keeps a shut model shut through a write…": "Cell edit · …" became " → X9".
- "reads a pairing boat side first…": the file's key became the spoken hull.

`e2e/flows/sheet.spec.ts`:
- "an edit writes through the store…": "Cell edit · …" became "Cash on … → $".
- "a shut model stays shut through a write": "Cell edit · …" became " → X9".
- "a pairing is read boat side first…": the file's key became the spoken hull.

## New tests

- Unit, Sheet: 2850 is kept whole, and 5321 with Tab. A refusal keeps its draft. Escape writes nothing. The landed-cost warning. A 4 % rise on two lines, with one Undo. A question from the address. A question nothing answers. A search that finds nothing. A code found on another list. Copy as a new variant. The changed mark, and no mark when the file cannot be fetched.
- Domain: `only.test.ts`, `priceMove.test.ts`, `asLoaded.test.ts` (which also covers `elsewhere`).
- e2e: typing onto a cell keeps its first key and marks the cell changed. A search that finds nothing. A band over a non-boat list with no head running out of its column. A list with no declared price.

## The gate, as run on this tree

- `npx prettier --write` on every file this round touched.
- `npx oxlint --max-warnings 0 src tools e2e`: clean.
- `npx tsc --noEmit` for both projects: clean.
- `npx vitest run` on the sheet, the three new domain suites, `src/state` and `ways.test.ts`: 18 files, 250 tests passed. After the last change, the sheet and new domain suites alone: 7 files, 88 passed.
- `npx tsx tools/check.ts`: 17 rules, no failures on the final tree. An earlier run found two `no-ui-selector-outside-ui` failures in `src/screens/fitment/fitment.css`, another agent's work in progress; they were not chased and are gone now.
- Playwright, `HL2_PREVIEW_PORT=6222`, sheet spec on all six projects: 58 + 64 passed, 14 + 8 skipped (hand-only or desk-only cases).
- Rulers for the sheet's routes on all six projects: 50 + 56 passed.
- After the edit-ends-once fix the sheet spec was run again on all six projects: 64 passed and 8 skipped at the desk sizes, 58 passed and 14 skipped at the three smaller ones.
