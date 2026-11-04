# Prices (`/levels`), verify 2 — 2026-11-04

A fresh verifier walked the build at `a40da02c`. The tree was exported with `git archive HEAD` into the scratchpad. `src/screens/places` came from the working tree, because HEAD's `Place.tsx` imports an `./After` that was never committed. The levels, pricing, catalogue, quote, state, e2e and data folders were byte-identical to the working tree. The build went into `e2e/out/dist-6274` and was served by `vite preview` on port 6274. The real Master Price File was loaded through the real door. Nothing was planted.

What was run:
- The fixer's `levels-shots.spec.ts` at all six sizes: 33 states, files `00`–`21`.
- My own walk, files `v*`: share refusals, the Warranty switch and its Undo, keyboard, lookups, the quote refused and brought back, a draft standing, a Yamaha RRP quote, and negative factory-package prices.

Measured at every size:
- Sideways scroll: 0.
- Text under 12px: 0.
- Overlap ruler: none.
- Page errors: none.
- The act bar clears the count by 16px (12px on the share).
- Unit tests in pricing, levels and priceCommands: 147/147.

**Figures checked against the file:**

| Figure | Result |
|---|---|
| Dealer Fit | 815 Sell; 1,733 Act Sell; 789 hold both; ratio 0.97–27.83, median 2.08; 7 have Act Sell under Sell; 944 at $0 and 18 blank in Sell |
| Kits | Kit Sell (K), Trade (L) and Sub Dealer (M) on 628. Install Retail (V), Install Trade (W) and Install Sub Dealer (X) on 621. AC on 642, AD on 621, AE on 621. L/K is 95–100%. AC/K is 0.02–1.65, median 1.30. AD = L + W on 621 of 621 |
| Yamaha | BB/BF is 1.012–1.258; BL/BF is 0.964–1.000; ROUNDUP(AX×1.19×1.1) = BB on 0 of 209 |
| Warranty | Stacer 92.6–109.6%, above Cash on 8; Highfield 55–67% on 588 |

## Jobs

| Job | State | Proof |
|---|---|---|
| A1 what is left | DONE | `01-arrive-full-*` |
| A2 choose a figure for a list with no price | DONE | `04-dealerfit-open-834x1112`: meaning, cell, rule n of m, and the spread across the list |
| A3 the Yamaha figure | DONE | `10-yamaha-rrp-*`, `vy1`–`vy5`. No more "Starts as Northside's own". After RRP the F90XB reads $17,643, and its motor quote totals $17,643 with Give live |
| A4 Warranty | DONE | `vh-warranty-on-*`, `vi-warranty-undone-*`, `12-warranty-*`: the 8 Stacer boats above Cash are named, with their door |
| A5 share | DONE | `va-share-abc`, `vb-share-0`, `vc-share-150`, `14-stacer-95` |
| A6 ranges | DONE | `13`/`15`/`17`/`18b-*-open`, `12-warranty` |
| A7 count opens its lines | DONE | doors on every count (`17-parts-open`, `05-dealerfit-picked`, `15-jeanneau-open`) |
| A8 change a choice | DONE | `20-kits-settled-open`, `vs7-change-with-draft` |
| A9 page settles | DONE | `19-all-answered-full-*`: "14 · 10 by your price list · 4 by you" |
| A10 kits trade, fitted and sub-dealer | DONE | `08-kits-picked-1440x900`, `20b-kits-grid-*` |
| S1 refused quote, choose, back | DONE | `vs1`–`vs6` at all six sizes |
| S2 a named line's trade price | DONE | `03-find-f90xb`, `03b-find-jeanneau`, `vm`/`vn`/`vp-*` |
| No price file | DONE | `00-nofile-*` |
| Keyboard | DONE | `vk-tab*`, `vl-keyboard-pick`: every control in order and ringed; Enter opens; Space picks |

## Missing items

| Item | State |
|---|---|
| Every figure says what it is, its cell and the spread | DONE |
| Packages not "worked from cost" | DONE ("holds the same figure on every line") |
| Ranges | DONE |
| Look up any line | DONE |
| Counts open lines | DONE |
| Kits priced as the file prices them | DONE |
| Sub-dealer prices | DONE (in the grid, honestly not on a quote; boats say QV is not carried) |
| Effect on standing quotes | DONE (`vs3b-standing`, `vs7`) |
| Who chose and when | DONE (it survives a reload, `21-who-chose-after-reload`) |

## Gaps

1. **Blocker.** Five Jeanneau factory packages hold a **negative** Sell Price and RRP. The Mercury ones run from −$2,030 to −$29,390. These five are counted as priced in "Prices 78 of 89". Once Sell Price is chosen, the lookup gives MF1095FLYS2 · Mercury Twin 300 HP to a customer at **−$29,390**. Nothing on the screen says so, and there is no door to these five. Proof: `vx1-neg-before`, `vx2-pkg-picked`, `vx3-neg-after-*`. The cause is `priceIn` (priceCommands.ts:82), which treats only 0 and blank as no price.
2. **Major.** Changing a settled Dealer Fit from Sell to Act Sell says "Every dealer fit package on a new quote shows its Act Sell", directly above "Open the 44 with nothing in Act Sell". The overclaim was fixed in `waySaid` and on the not-priced path, but not in `chooseSaid`'s path for a list that is already read. Proof: `vs7-change-with-draft-*`.
3. **Major.** The counts take in lines that are not on sale. The lookup skips discontinued and banner rows, but the counts include them.
   - Of the 44 with no Act Sell, 42 are discontinued, yet the step says they "are still priced by hand".
   - "650 kits" and "22 not priced" include 7 banner rows.
   - Dealer Fit 1,777 includes 201 discontinued lines, and Parts 2,937 includes 699.
4. **Major.** The factory-package lookup says "The list has no Trade price, so a trade quote reads Sell Price". The packages carry Trade Price (BL) on all 73 priced lines, equal to Sell. The figure is right and the sentence is false. Proof: `vx3-neg-after-*`.
5. **Minor.** Repeated words:
   - Factory packages give "names no price … one figure … under 2 names" in the row and again in the panel, and "the same figure" a third time in the tile (`11-packages-open-390x844`).
   - Stacer shows "Today Trade is the same as Cash…" just above "Every Stacer boat … already holds 100% of it as Trade" (`13-stacer-open-834x1112`).
   - The settled kits panel gives each figure in the way tile and again in the grid (`20-kits-settled-open-1920x1080`).
6. **Minor.** Layout:
   - At 1440, the share's refusal wraps in a column about 260px wide beside empty space (`vb-share-0-1440x900`).
   - At 1280, the written step bar ends at x 1010 while the grid runs to x 1200. A lone tile follows it on a row of its own (`06-dealerfit-written-1280x800`).
   - At 1280, the one-way factory-package tile leaves the right half empty (`11-packages-open-1280x800`).
7. **Minor.** When a panel is brought to the top, the specimen name scrolls under the floating pill: "Tiller Conversion Kit · F20G" is cut at 1440 and 1920 (`08-kits-picked-1440x900`, `20-kits-settled-open-1920x1080`).
8. **Minor.** Units and labels:
   - The Highfield tile says "67 boats" while its panel and the Warranty scale say 588 finishes.
   - Jeanneau's tile says "One price for every buyer" over a panel where a trade buyer pays "None" on 8 (`15-jeanneau-open-1440x900`).
   - The lookup for "704 Binnacle" lands on a Dealer Fit package, not the rigging kit (`08d-find-rigkit-390x844`).

## Perfect bar

| Size | Verdict | Why not |
|---|---|---|
| 390×844 | NOT | Gaps 1–3 and 5. Otherwise clean: the act bar clears its count by 16px |
| 844×390 | NOT | Gaps 1–3. The doors stand clear of the bar (`08b-kits-fitted-844x390`) |
| 834×1112 | NOT | Gaps 1–3 and 5. The question-row sample now fills the right column |
| 1280×800 | NOT | Gap 6 (step bar width, factory-package half-empty tile) and gaps 1–3 |
| 1440×900 | NOT | Gap 6 (refusal column) and gap 7 (name under the pill) |
| 1920×1080 | NOT | Gap 7 and gap 5 (the kits grid repeats the tiles) |
