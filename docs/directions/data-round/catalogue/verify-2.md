# The chandlery (`/catalogue`), verified — data round, verify 2, 2026-11-04

A fresh verifier, read-only. Built from `eb695fe` into `e2e/out/dist-6244`, served by `vite preview` on 6244, signed in through the real door with the real Master Price File. Every job done by hand in Chromium at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080. The shots are in `verify-2/`, named `<state>-<size>.png`. Every server I started was stopped before this report was written.

On my port: `catalogue.spec.ts` **66 passed**. The rulers filtered to the six catalogue routes: **126 passed, 54 skipped, 0 failed**. My own measure over 45 states at six sizes found 0 px of sideways scroll, 0 text cut (the only hits were the kit's visually hidden `ui-segmented-legend`), 0 ellipses on this screen and 0 page errors.

## What the last verify found, now

| Finding | Now | Proof |
|---|---|---|
| J7 led to a dead page | **Fixed** | Goes to `/places/parts?tab=settings` ("Parts & Accessories", How it is sold). Switched to "On its own too", *Start a quote with it* opens `/quote/new?brand=parts&model=parts:38` with Sand Anchor Kit 4lb chosen (`d02-quote-way-*`, `z01-start-quote-*`). |
| "91 boats" named 73 | **Fixed** | "73 boats: …". After *and 70 more*, 73 names are listed with no repeats (`c03-shackle-all-boats-*`). |
| The boat popover's field overflowed | **Fixed** | Field 880–1208 in a popover 864–1224 at 1280; 32–360 in 16–376 at 390. Title at 880 and 32: 16 px of padding (`c01-boat-popup-*`). |
| The front's heading links did not land | **Fixed** | *Flushers* lands with no reload. Heading top 169 under a dock ending at 157 (1280); 101 under 89 (390); 132 under 121 (844×390) (`a03-front-flushers-*`). |
| Turned phone: no part after pressing an aisle | **Fixed** | First line at y 287–349 of 390 (`b01-press-anchoring-844x390`). Scrolled, the bar and dock end at y 121 (31 %, was 38 %) (`b02-anchoring-scrolled-844x390`). |
| A heading by address stopped under the dock | **Fixed** | 168 against 157; 101 against 89 (`b08-heading-url-*`). Inside an aisle, too: 169 against 157 (`b06-heading-jump-in-aisle-*`). |
| Review landed on its first case | **Fixed** | `/review?case=none:parts:ANCHOR KITS:blank` shows "Case 17 of 37 · On sale with no price — Give the 3 lines in Anchor Kits a price", and names all three Reef Anchor Kits (`d05-to-review-*`). |
| No picture worklist | **Fixed** | `/catalogue?view=pictures`: "2,040 of 2,238 … the ones the quotes on this computer carry come first", then aisle by aisle, each with *Open them* (`h01-worklist-*`, `h02-worklist-bottom-*`). |
| Day-one supplier chips are codes | **Kept, by the fixer's choice** | Propellers still shows *YAM 263 · Yam 175* (`b03-propellers-*`). Naming YAM·Yam "Yamaha" on the suppliers page makes one chip, *Yamaha 438* (run m03). |
| Longest name repeated in the box; refusal under the bar | **Fixed** | The box says only "Add a picture of this part", and the name appears once (`g03-longest-*`). At 390 the refusal sits at y 677–755, above the bar at 790 (`g01-refusal-390x844`). |
| Polish: columns, sort, pill, dock | **Fixed** | At 1920 the Made-for code and ledger code are both at x 1048, and both figure columns end at 1640 (`c02-boat-chosen-1920x1080`). At 834 the sort sits on the find row (`b03-propellers-834x1112`). The pill wraps whole words (`c05-boat-by-address-390x844`). The dock says "Propellers & motor care · Propellers – Yamaha" (`b04-propellers-scrolled-*`). |

## The jobs

| # | Job | Verdict | Proof |
|---|---|---|---|
| J1 | Show the customer an aisle | **Done** | URL `?aisle=anchoring`, scrollY 0. The h1 is at 72 (390) to 116; the first line is in the window at every size, 287–349 of 390 even on the turned phone (`b01-press-anchoring-*`). The sticky dock says aisle · heading · boat (`b02-*`, `c02-*`). |
| J2 | How much fitted | **Done** | Across all 19 aisles, 2,236 price cells: 1,824 supply + fitted, 273 supply only, **101 fitted only** (the file's 101), 16 "$0 as the price list writes it", 22 "No price" (run m01). Trailer Adjustment: "Fitted only · $79 … $636 fitted"; Labour (0.5): "$87 fitted" (`e01-*`, `e02-*`). The opened line says its Install Type ("Labour Estimated – (0.25)") (`d01-line-open-*`). |
| J3 | Find by maker word | **Partly** | "lowrance" finds 144 of 144. On day one, "yamaha" finds 453, which is **439 of the file's 671 on-sale YAM/Yam lines**. It misses control cables (50), cowl covers (16), key switches (14), harnesses and Yamalube oil. Once Northside names YAM·Yam it finds 685 (`e03-find-*`, run m03). |
| J4 | Find by code | **Done** | "SG002" finds 1 part: Safety Gear · Smooth Waters, $83 supply, $91 fitted (`e03-find-SG002-*`). |
| J5 | Show the part large | **Done** | The dialog credits "Picture from res.garmin.com". Escape returns focus to "See the VHF Radio · Garmin VHF115i larger" (`f02-gallery-*`, `f03-gallery-escape-*`). |
| J6 | What fits his boat | **Done at desk sizes; the result is hidden on phones** | *For a boat…* → 529 Assault Pro → `?boat=boat_stacer:30` → "Made for the Stacer 529 Assault Pro · Tournament — 1 in Anchoring & mooring, of the 4". **At 390×844 and 844×390 the page then scrolls past it.** The Made-for box is at y −133…128 under a dock ending at 108, and at −116…65 under a dock ending at 124. Focus falls to the body at every size (`c02-boat-chosen-390x844`, `-844x390`). By address it is in view (`c05-*`). |
| J7 | Quote a part on its own | **Done** | See the table above. |
| J8 | Northside's own picture | **Done** | A PNG makes the line a card, with the toast "Your picture is on the Reef Anchor Kit … now. Undo" and 0 → 1 of 66. A text file is refused in place, `aria-live="polite"`, and the line grows 86 px (`g01-*`, `g02-*`). |
| J9 | Work the parts with no picture | **Done (one count off)** | The worklist exists (`h01-*`). It counts 33 labour lines in Workshop ("157 of 157") that offer no picture control. |
| J10 | Open the part's line to change its price | **Done** | `/data/parts?at=parts:38` opens the sheet on Sand Anchor Kit (`d03-open-line-sheet-*`). The unpriced part opens its own Review case (`d05-*`). |
| J11 | Place the *Not sorted yet* | **Done** | Placing DFO kits in Batteries & power says "DFO kits is now in Batteries & power. Undo". Unsorted goes 28 → 25 and power 105 → 108 (`h05-place-dfo-*`, run m02). |
| J12 | Narrow by maker | **Partly (day one)** | The chips are codes until Northside names them: LSM, BBB, SAW, BLA, ANC, MWH, EJM, SUB, and YAM beside Yam. The suppliers page proposes 5 names and YAM·Yam (`h03-suppliers-*`). |
| J13 | Walk the 447 propellers | **Done** | Ten sections on one page, *Its 10 headings* (`b05-headings-open-*`), a heading jump (`b06-*`) and a price sort (`b07-sort-price-*`). Back from a line's sheet returns to the line (scrollY 3028 → 3056, the line at y 294) (`b10-*`). |
| J14 | No file in this browser | **Done** | "The price list is not open on this computer… Open the price list" (`k01-no-file-*`). |
| J15 | A wrong aisle or supplier | **Done** | "There is no aisle called "nope". These are the 19." and "Nothing in Anchoring & mooring is sold by ZZZ…" (`j01-*`, `j02-*`). |

## The perfect bar, by size

| Size | Verdict | Why, measured |
|---|---|---|
| 390×844 | **NOT** | Choosing a boat hides its result under the dock (made box −133…128, dock bottom 108). *73 boats* expanded is about 30 lines of comma-run names (`c03-*-390x844`). "0 of / 66 pictured" breaks a figure across lines, and 45 px of empty space sits between *For a boat…* and find (`b01-press-anchoring-390x844`). |
| 844×390 | **NOT** | Choosing a boat hides its result entirely (made box −116…65 under a dock at 124) (`c02-boat-chosen-844x390`). |
| 834×1112 | **NOT (minor)** | The expanded 73-boat paragraph. The supplier chips keep their full counts under *Pictured* (Every supplier 66 with 1 shown). |
| 1280×800 | **NOT (minor)** | The expanded *73 boats* is a 600 px paragraph in a 280 px column beside an empty left half (`c03-shackle-all-boats-1280x800`). |
| 1440×900 | **NOT (minor)** | As 1280. Every row repeats "supply"/"fitted" under columns already headed SUPPLY and FITTED (`b03-propellers-1440x900`). |
| 1920×1080 | **NOT (minor)** | As 1440. The Made-for and ledger columns now align. |

These hold at every size: the front and its foot (`a01`, `a02`), a pressed aisle (`b01`), scrolled with the dock (`b02`, `b04`), headings open (`b05`), the popover (`c01`, `c04`), an opened line (`d01`), the longest name (`g03`), the refusal (`g01`), the gallery (`f02`), the worklist (`h01`, `h02`), suppliers (`h03`), find and nothing found (`e03`), a wrong aisle (`j01`) and no file (`k01`). Keyboard: 13 Tabs (phone) or 23 Tabs to the first line, Enter opens it, Escape shuts it with focus kept on its head, and the focus ring is the token `--shadow-focus`. Motion is gated on `prefers-reduced-motion: no-preference`. `catalogue.css` has no colour literals.

## Gaps, by severity

1. **Major — J6 on phones.** At 390×844 and 844×390, choosing the customer's boat in the popover scrolls the page past "Made for the …". The box sits under the sticky dock and the person sees ordinary anchor kits. Focus falls to the body, so the boat pill (and its ✕) is out of view and out of the tab order's place. The spec checks `toBeVisible`, not `toBeInViewport`, so it passes.
2. **Minor — J3/J12 day one.** "yamaha" finds 439 of 671 on-sale Yamaha lines, and the chips print codes, until Northside presses once on the suppliers page. That was kept on purpose, so it is honest, but a salesperson's first search misses 232 Yamaha lines.
3. **Minor — expanded *73 boats*.** One run-on paragraph of 73 names, each starting "Stacer", with the chosen boat not marked. At 1280 it is 600 px tall in a 280 px column.
4. **Minor — the worklist's count.** The 2,040 includes 33 labour lines (and notes) that never offer a picture control.
5. **Minor — the chips under *Pictured* / *No picture*.** They keep the aisle's full counts (`j03-pictured-only-1280x800`).
6. **Minor — repeated words.** Every row repeats "supply"/"fitted" under the column heads at desk sizes. An opened line's "Under the heading: Anchor kits" repeats the section title just above it (`d01-line-open-1280x800`).
7. **Minor — 390 head.** "0 of / 66 pictured" is split across lines, and there is a 45 px gap above find.
8. **Minor, not this screen.** At 844×390 the picker that *Start a quote with it* opens draws its sticky "PFD'S – PERSONAL FLOATATION DEVICES" under the shell bar (`z01-start-quote-844x390`).
