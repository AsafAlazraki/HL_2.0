# Prices (`/levels`), verify 1 — 2026-11-04

A fresh verifier walked the build at `abc46b80`. It was built into `e2e/out/dist-6274` and served by `vite preview` on port 6274. The real Master Price File was loaded through the real door (`e2e/door.ts`). Every press was a person's press, and nothing was planted.

All screenshots are in `verify-1/`, named `NN-state-WxH.png`. That is 50 states at 6 sizes, plus the quote flow at 390 and 1440. The walk spec lived in the scratchpad, outside the repo, and the server was stopped afterwards.

**Measured at every size and in every state:**
- Sideways scroll: 0.
- Text under 12px: 0.
- Page errors: none.
- Unit tests for `src/domain/pricing` and `src/screens/levels`: 122/122.

**Figures checked against the file independently:**
- Act Sell / Sell: 0.97–27.83, median 2.08, on 789 lines.
- Act Sell's rule holds on 1,721 of 1,733.
- Packages: RRP + Freight equals Sell Price on 39/39 Haines and 39/39 Jeanneau.
- Yamaha Trade / Sell: 0.96–1.00. RRP / Sell: 1.012–1.258.
- Kits: Sub Dealer Price equals Trade Price on every kit.

## Jobs

| Job | State | Proof |
|---|---|---|
| A1 see what is left | DONE | `01-arrive-*` |
| A2 choose a figure for a list with no price | DONE | `11-dealerfit-open-*`: each figure has its meaning, cell, rule held n of m, and the spread across the list |
| A3 Yamaha figure | PARTLY | `16-yamaha-open-1280x800`, `17-yamaha-rrp-390x844`. "Starts as Northside's own" refuses every Yamaha quote and gives no reason. The engine's reason (`worked.ts`, ROUNDUP(AX×1.19×1.1)) holds on **0 of 209** |
| A4 Warranty switch | DONE | `19-warranty-*`, `20-warranty-on-*`: the 8 Stacer boats above Cash are named, with their door |
| A5 Trade as a share | DONE | `27-share-abc`, `27b-share-0`, `27c-share-150`, `28-share-95`: each refusal is a sentence where it is refused |
| A6 each buyer's price over the list | DONE | `21`–`26b-*-open`: a range on a scale against Cash |
| A7 count opens its lines | DONE | Doors on every count (`24-parts-open`, `12-dealerfit-actsell`); the flow spec lands on `?only=` |
| A8 change a choice | DONE | `31-kits-settled-open`, `32-dealerfit-settled-open` |
| A9 page settles | DONE | `30-all-answered-full-*`: "Settled 14 · 10 by your price list · 4 by you". Packages are no longer called worked from cost |
| A10 Rigging Kits trade, fitted and sub-dealer | PARTLY | `31-kits-settled-open-1920x1080`. Missing: the fitted trade figure (Rigging Kits!AD) under "Supplied, or fitted", and Install Sub Dealer Sell |
| S1 refused quote, choose, back, price | DONE | `43`/`44`/`46-from-quote-*`, `47-sell-written-late-*`: the count of 962 left unpriced and the spread are said before the press |
| S2 trade price of a named line | DONE | `03-f90xb`, `04-jeanneau-db37`, `07-rigkit`, `34-rigkit-after`, `09-part` |
| No price file | DONE | `00-nofile-*` |
| Keyboard | DONE | `41`/`42-keyboard-*`: every control in order and ringed; Enter opens a question |

## Missing items

| Item | State | Proof |
|---|---|---|
| Every figure says what it is, its cell, and the spread | DONE | `11-dealerfit-open-834x1112` |
| Packages not "worked from cost" | DONE | `18-packages-open-*` |
| Ranges, not one sample | DONE | `21-stacer-open-1440x900`, `19-warranty-*` |
| Look up any line | DONE | `03`–`09b-*` |
| Every count opens its lines | DONE | `24-parts-open-*` |
| Rigging Kits priced as the file prices them | PARTLY | Supply cash/trade and fitted cash are there; fitted trade is not, under the chosen way |
| Sub-dealer prices | PARTLY | Sub Dealer Price is shown. Install Sub Dealer Sell (621) and AE are never drawn |
| Effect on standing quotes | DONE | `45-standing-draft-*`: "1 draft carries … 1 line waits", with a door to 20261104-01 |
| Who chose and when | PARTLY | `40-who-chose-*`: "Asaf chose it at 8:28 am today". It is gone after a reload |

## Gaps

1. **Blocker.** Choosing RRP + Freight Inc GST on the Yamahas makes every Yamaha quote unable to be given ("Starts as Northside's own"). No reason is said. The engine's reason, worked from cost, holds on 0 of 209 (`17-yamaha-rrp-390x844`).
2. **Major.** After a choice, the standing step says "Every dealer fit package is priced at its Sell from the next quote" while the tile just above it says "962 not priced" (`47-sell-written-late-390x844`, `46-from-quote-written-1440x900`). With Act Sell it is 44.
3. **Major.** Rigging Kits: a kit sold fitted to a trade buyer reads the retail fitted figure, and Install Sub Dealer Sell is never shown (`31-kits-settled-open-1920x1080`).
4. **Major.** 390 and 844×390, after a second way is pressed: the act bar covers the census's second door ("Open the 6 at $0 in Sell Price") and the way tile's text. At 844×390 the count is out of sight (`15b-kits-fitted-390x844`, `15b-kits-fitted-844x390`).
5. **Minor.** "81–81% of Cash on 27" (`22-jeanneau-open-390x844`). The Warranty scale counts Highfield "on 588" next to a tile of "67 boats" (`01-arrive-*`).
6. **Minor.** At 834 the question rows' samples stop at x 460, leaving about 330px empty to the right (`08-highfield-long-834x1112`). An opened question repeats its sample line, and the settled kits panel says every price twice (`31-kits-settled-open-1920x1080`).
7. **Minor.** The way tile's radio circle sits above its label's centre, tight in the rounded corner (`11-dealerfit-open-834x1112`, at every size).
8. **Minor.** The long kit name breaks "Filter ·" alone on a line (`34-rigkit-after-390x844`). A kit can only be found by code: the 6-hit limit fills with Dealer Fit "Tiller Conversion Kit" rows.
9. **Minor.** Who chose lasts for the session only.

## Perfect bar

| Size | Result | Why |
|---|---|---|
| 390×844 | NOT | Gaps 4, 5 and 8 |
| 844×390 | NOT | Gap 4: the act bar over content, count out of sight |
| 834×1112 | NOT | Gap 6: empty right column on the question rows |
| 1280×800 | NOT | Gaps 2 and 7 |
| 1440×900 | NOT | Gap 2: the step contradicts its tile |
| 1920×1080 | NOT | Gap 6: the kits panel repeats every price |
