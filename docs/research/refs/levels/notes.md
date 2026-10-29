# Prices (`/levels`) — the sweep

There have been two passes.

- **2026-10-22**, in `live/` and `hand/`: 35 frames. Board A, "The ladder", was built from it.
- **2026-10-28**, in `live2/` and `hand2/`: 38 new frames. Every vendor price-book page gave only text last time, so this pass looked for the *shapes* those pages describe, in places that draw them. 13 new frames are cited; the rest are refusals, misses or unopened (`sources-index.md`).

**28 frames were opened this pass**:
- 21 new;
- `live/uline-boxes`, `live/woo-wholesale-1` and `live/figma-swap-library-img`;
- `levels/built/m3-2-1440-full.png` and `m3-2-390.png`;
- `review/built/m3-2-1440.png`;
- `levels-boards/shots/b-the-forks.png`.

Nothing below cites an unopened frame.

## 0. The engine and the file, checked against this tree

**The first pass's four holes are filled.**
- `src/domain/pricing/worked.ts` names the two prices worked from cost: Warranty `ROUNDUP((IY − IW) × 1.01 × 1.1)` and RRP + Freight Inc GST `ROUNDUP(AX × 1.19 × 1.1)`. `mayReachCustomer` is off for both until the dealer says otherwise.
- `issueBlockers` (`src/domain/quote/totals.ts:332`) refuses to give such a quote, and closes on his own choice: "…a price Northside keeps to itself, so this quote cannot be given. Choose another price for it, or let Warranty reach a customer on Prices, in Data." That is `explaining-a-refusal.md`'s "So, because…" ending, which still holds.
- `priceCommands.ts` has three commands:
  - `namePrice`, for a list with no price, or a motor's Cash pointed elsewhere;
  - `letReach`;
  - `sharePlan`, which counts `written · sameAsFrom · already · blank` and carries one before-and-after `sample` before it writes.
- `cannotBePrice` refuses a cost column, except one that `worked.ts` names.

**The fallback is the first rung.** `priceAtLevel` (`src/domain/quote/pricing.ts:544`) does `find(…) ?? levels[0]`. So "no Trade figure" means "a trade buyer pays Cash", and that is a fact to state, not a gap.

**The pack declares three rungs per boat list, not six.**
- Boats: Cash `qr`, Trade `qt`, Warranty `rb`.
- Trailers: Sell inc Rego.
- Motors: Sell Price `bf`, Trade Price `bl`.
- Parts: Sell, Sell inc Install.

The six old rungs are workbook columns (`MPF_GROUND_TRUTH.md:875–887`). There, Trade is "Cash less the brand's Trade % (Price Matrix col 11)" (`:877`), so the built "Trade as a share of Cash" is that matrix, typed once per list.

**Measured today from `data/northside/tables/`:**

| list | rows | Trade | Warranty ÷ Cash |
|---|---|---|---|
| Stacer | 91 | = Cash on 91 | 0.926–1.096, over Cash on 8 |
| Stabicraft | 37 | = Cash on 37 | 0.807–0.842 |
| Surtees | 19 | = Cash on 19 | 0.832–0.835 |
| Jeanneau | 27 | = Cash on 19, none on 8 | 0.814–0.815 |
| Haines Signature | 9 | no Cash on any | — |
| Highfield | 588 | 0.95 on all | 0.550–0.672 |
| Formosa | 39 | = Cash on the 30 priced | 0.808–0.842 |

- **Yamaha:** RRP + Freight runs 1.012–1.258 × Sell Price on all 209. The F90XB is $14,531 Sell, $17,643 RRP + Freight and $14,327 Trade.
- **SP560 (HYP):** 8 colourways (HBS114 to HBS128), all at Cash $48,350, Trade $45,932 and Warranty $32,166. The first pass said 4.
- **Rigging Kits (650):** Kit Sell Price on 628 (the first pass said 650), Sell Price on 642, Install Retail Sell on 621. It also holds the pack's only Sub Dealer figures.
- **Dealer Fit (1,777):** Act Sell on 1,733, Sell on 815, Parts Sell on 1,640.
- **Factory packages:** Sell Price on 39 of 39 Haines and 34 of 50 Jeanneau.
- Oils, Registration and Labour Rates also declare no price. Whether a quote reads them was not measured, so no board draws them as a decision.

`HELMLOGIC_GROUND_TRUTH.md:187`'s ladder holds for Highfield's Trade only. `dense-tables-and-selection.md:73`'s `Mixed+100` stays refused, because `sharePlan` writes a share, not a delta. `FITMENT_RULES.md` is silent on levels.

## 1. What is genuinely best here, and why

The built ladder (`levels/built/m3-2-1440-full.png`) answers the brief, but at rest it spends fourteen cells on `All priced` and `Same as Cash`. The three choices only Northside can make sit as small ochre cells in that crowd. The best frames do the opposite: they say sameness once, and the eye lands on what differs or is undecided.

1. **Sameness spans.** Virgin's fare table (`live2/virgin-fares-2.png`) prints "Complimentary water, tea and coffee…" once, across Lite, Choice and Flex, and only Business breaks out. On six of seven boat lists, Cash and Trade can be one cell, "One price for every buyer · 91". Only Highfield splits.
2. **The fallback is named where the value would be.** `live2/chrome-inherited-img.png` heads values with `Inherited from body`, the source in its own ink. "Trade · from Cash" is the sentence `priceAtLevel` already acts on.
3. **What the buyer pays is the big thing, and only difference wears ink.** In `live2/wise-compare-2.png` each row is a round mark and name, the rate in colour where it differs, and the figure the recipient gets largest at the right.
4. **A range with its figures under the ticks.** `live2/payscale-range.png` prints `10% $68k · MEDIAN $91k · 90% $127k` under one bar. Beside it, five components each get a short bar on one shared scale. Warranty at 55–67% of Cash on Highfield, against 93–110% on Stacer, reads in one look that way.
5. **What is left to decide is filled; what is done is quiet.** `live2/govuk-task-list.png` prints `Completed` as plain text and `Incomplete` as a tinted tag.

## 2. Interaction patterns worth taking

- **The spanning cell** (`live2/virgin-fares-2.png`). Equal rungs merge into one cell that carries the count, and a split appears only where the file differs.
- **The source named in place** (`live2/chrome-inherited-img.png`). A rung a list lacks reads `from Cash`, so it is a direction, not a hole.
- **Tabs that carry their figure** (`live2/kayak-forecast.png`). Each of `Cheapest $118 | Best $118 | Quickest $118` holds its own result. Here: `Cash $48,350 | Trade $45,932 | Warranty $32,166`. At 390 the tabs fold to `Best ▾`, and the verdict card stays (`hand2/kayak-390.png`).
- **The facet that prices itself** (`live2/kayak-forecast.png`, left rail). `Direct $118 · 1 stop $292` puts the figure beside the option before the choice. A Rigging Kits column choice reads the same way, on one named kit.
- **Versions as tiles, each with its price** (`live2/adafruit-qty.png`). There are three bordered tiles, `$19.95 · $20.95 · $21.95`, and the chosen one is ringed. The motor's fork drawn this way rings nothing until the owner chooses.
- **The reference line labelled at the edge** (`live2/yahoo-range.png`). The previous close is a dashed line with `57.99` in a chip on the axis. Cash is that line at 100%.
- **The audience at the head of the thing** (`live2/zendesk-composer-img.png`). The composer begins `Public reply ▾ · To Olive Oil`. *May reach a customer* belongs at the head of a price, not at its foot.
- **The census on the act's footer** (`live/figma-swap-library-img.png`). `2 components, 3 styles used in this file` sits beside `Swap library`. It is built already, as `sharePlan`'s count beside Set, and Undo is the step line under the act (closed in `built-critique-m3-2.md`).

## 3. Type and motion

- Wise (`live2/wise-compare-2.png`) uses one size step: the recipient's figure is bold, at about 1.4× the rest, and colour is spent on one column.
- Payscale (`live2/payscale-range.png`) sets small caps over the figures under its bar.
- GOV.UK (`live2/govuk-task-list.png`) sets everything at one size and lets the tag's tint carry the state.

Take one figure size above body, with tabular figures. Use ink for difference and the ground for audience. Never use red, which is this app's refusal; Wise's red would read here as "wrong". Motion: a write ticks each changed figure once, and nothing else moves.

## 4. What to avoid

- **A table forced into a phone.** At 390, `hand2/virgin-fares-390.png` keeps five columns and breaks words mid-letter ("Eco / nom / y"). A ladder at 390 changes shape; it does not shrink.
- **One number under five heads.** `live/uline-boxes.png` prints `$1.05` under every quantity break. That is the built ladder's `Same as Cash` × 14 in another register.
- **Cost on the price's ground.** In `live/woo-wholesale-1.png`, `Cost of goods ($)` sits two rows under Wholesale Prices, in the same form, at the same weight.
- **Ranking what is not a ranking.** `live2/wise-compare-2.png` sorts best to worst, which is right for choosing a bank. A lower rung is not worse, so sort by the list's own order, never by gap.
- **A figure without its basis.** Kayak's "Prices are expected to rise $50" (`live2/kayak-forecast.png`) hides its basis behind an ⓘ. Every figure here keeps its numerator and denominator in the same line.

## 5. Directions

Only this screen decides which figure a customer's quote prints. It holds the one switch that lets a cost-worked price reach a customer, and it writes hundreds of real lines as one step with one Undo.

Every direction carries the three papers:
- Warranty's switch, off;
- the four Not-priced lists with their figures to name;
- the Yamahas' two figures, neither chosen.

The built ladder exists. These are four new compositions, each grouped differently, and none is a narrow list beside a detail panel.

### A · The specimen: one thing, every price it can be

**Composition.** One real thing large: the SP560 (HYP), the F90XB, or a rigging kit. Across the top, the fourteen lists are tabs carrying their specimen's Cash. Under the thing, its buyers stand as a short vertical stack of figures:
- Cash $48,350;
- Trade $45,932, "95% of Cash, on all 588";
- a change of ground, then Warranty $32,166 with its formula and its switch at the row's head.

A missing rung reads `Trade · from Cash` (Jeanneau's 8). One sentence says how far the specimen speaks for its list. The Yamahas' tab shows $14,531 and $17,643 as unringed tiles.

**Grouping.** One list at a time, with the rungs in price order.
**Exclusives.** `live2/kayak-forecast.png` and `live2/chrome-inherited-img.png`.
**Reflow.**
- 390: the tabs fold to one chooser with the mark (`hand2/kayak-390.png`), and the stack is natively a column.
- 834: the picture sits left of the stack.
- 1920: the stack holds a measure, with the list's census as a quiet second column.

**Northside changes** each list's specimen (by default the first priced line), the rung words, and the switch.
**Risk.** The picker's one-model fact panel. The board must read as figures, not specs.

### B · The scale: every list on one percentage of Cash

**Composition.** One shared axis from 0 to 130% of Cash, with Cash as a dashed line at 100% labelled at the edge. Each list is one row: its mark, then a bar from its lowest rung to its highest, with a tick per rung and the figures printed under the ticks.
- **Stacer:** Trade sits on the line, and Warranty at 93–110%.
- **Highfield:** Trade at 95%, and Warranty a band at 55–67%.
- **Yamaha:** Trade at 96–100%, and RRP + Freight a band at 101–126% in the undecided ink.
- **Haines:** "No Cash on any of 9", with no bar.

While Warranty is kept to Northside, its ticks stand on a band of Northside's ground under the axis. The Not-priced lists sit below as barless rows: "3 figures to choose from".

**Grouping.** By kind, then by spread.
**Exclusives.** `live2/payscale-range.png` and `live2/yahoo-range.png`.
**Reflow.**
- 390: a card per list, each with its own short bar on the same 0–130 scale, as Payscale's right column already is.
- 834: the axis stays, and the figures move into a press-to-read popover.
- 1920: the axis widens and the figures stay printed.

**Northside changes** which rungs appear, the Trade share (typed on the tick, with the census before it writes), and the switch.
**Risk.** Fitment's built horsepower axis. This must read as fourteen short bars, not a scatter.

### C · The fare table: buyers across, sameness spanned

**Composition.** Three buyer columns: *A customer · A trade buyer · Northside only*, the last on the night ground. Each list is a row in Wise's anatomy, a round mark and name with the specimen's figure largest at the right.
- Where Trade equals Cash, one cell spans both columns: "One price for both · all 91".
- Only Highfield and Yamaha split. ePropulsion's Trade is its Sell on all 32.
- Jeanneau's span says "8 with no Trade figure print Cash".
- Not-priced rows span all three columns with their priced facets.

**Grouping.** By buyer across, and by kind down.
**Exclusives.** `live2/virgin-fares-2.png` and `live2/wise-compare-2.png`.
**Reflow.**
- 390: the table does not shrink. Each row becomes Wise's phone row (`hand2/wise-compare-390.png`): mark, name, big figure, then the spans as lines.
- 834: the three columns stay.
- 1920: the columns hold a measure, and the marks grow.

**Northside changes** the buyer words, each list's share, the switch (which moves a column's ground), and each Not-priced figure.
**Risk.** It is still a matrix, the built ladder's family. It earns its place only if the spans make most rows one bar, and the board must draw that honestly or lose.

### D · The four things only you can decide, then the rest

**Composition.** One reading column in GOV.UK's task-list grammar: single-line rows of a list's name and its question, with a status at the right.
- *Yours to choose* (tinted): the Yamahas, Rigging Kits, Dealer Fit, factory packages.
- *Kept to Northside* (dark): Warranty.
- *Settled* (plain): everything the file already prices.

A press opens a row in place to Adafruit's tiles, one per column, each with its figure on a named line and its count ("on 628 of 650"). Nothing is ringed. A choice folds the row to *Settled · Kit Sell Price*, with its step line and Undo.

**Grouping.** By who must act, then by how many quotes it touches.
**Exclusives.** `live2/govuk-task-list.png` and `live2/adafruit-qty.png`.
**Reflow.**
- 390: the question wraps under the name, the tag stays right (`hand2/govuk-task-list-390.png`), and the tiles stack.
- 834 and 1920: one column at a measure, with the tiles side by side.

**Northside changes** every answer, the switch, and the share. *Do not choose for him* is the composition.
**Risk.** Board B (`levels-boards/shots/b-the-forks.png`) drew this content as a card grid and lost. Review (`review/built/m3-2-1440.png`) is folding plates ordered by money. D stays one-line rows with tags: no plates, no tables.

## 6. What the seed can honestly put here

This is a Foundation screen, and it needs no photography. The honest pictures are the makers' marks (`data/northside/marks-ledger.json`), plus, in A only, a specimen's held render where the picture reader has one, with the mark where it has none.

Every figure above was read from `data/northside/tables/*.json` today. The seed has chosen nothing:
- no list's price is named;
- Warranty's switch is off;
- the Yamahas print Sell Price until the owner says otherwise.
