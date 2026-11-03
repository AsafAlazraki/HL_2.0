# Data: three directions for the redraw, 2026-11-03

The judge (`judge.md`) said **redraw**. The Data page is a well-counted register of containers, but it has no place for *what is new* or *what needs Northside*, its rooms are a strip of words, and on a phone its lists start 1,426 px down. The sweep is `docs/research/refs/data/round-2/notes.md`. Each direction below is a different **order and grouping** of the same true content, and each puts the price file's state above its inventory.

**Boards.** All three are in `boards/`, as `a.html`, `b.html` and `c.html`. Each HTML is the screen itself, responsive, followed by the board's notes on paper: the job, what only this screen does, the references, the mark, a second state, the type specimen, motion, keyboard, how it reflows, what a dealer can replace, honest constraints, and the three fixes every direction owes.

**Shots.** They are in `boards/shots/`, one per size: `<id>-390x844.png`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900` and `-1920x1080`. The 390 and 1440 sizes also have a full-page shot (`-full.png`).

**Rebuilding them.** `node draw.mjs` redraws the boards from `facts.mjs`, and `node shoot.cjs` takes the shots. At all 18 sizes the shooter measured 0 px of sideways scroll and 0 text nodes under 12 px. The only boxes that clip their own text are the visually hidden labels (`.sr`).

**Kit.** The boards read the app's own built stylesheet, copied as `boards/kit.css` from `e2e/out/dist-6230`, so every colour, size, radius and shadow is a token. The buttons, kbd and kind marks are the kit's own `.ui-*` classes, and the glyphs are the app's Phosphor set.

## Where every figure comes from

Nothing is invented. `boards/facts.mjs` names the source of each figure. There are three sources.

**The file** (`data/northside`, read as the boards are drawn):

- 53 lists and 15,691 lines.
- 810 boat lines; 6,202 lines in the 18 lists you sell from; 8,679 lines in the 28 lists of what fits, grouped by maker.
- **0 lines changed** by Northside. Every `updatedAt` equals `packedAt`, 2026-09-16T08:16:21Z.
- **25 headings that date themselves "as at …".** They are 25 of the 222 headings in the 5 lists that date any (Rigging Kits, Parts, GFAB, Haines Signature and its packages). They cover 462 of those lists' 3,667 lines. The oldest is *RIGGING KITS – Jeanneau DB/43 OB (as at 19/5/2022)*, over 6 lines. The newest is 5 August 2026. By year:

  | Year | Headings | Lines |
  |---|---|---|
  | 2022 | 4 | 175 |
  | 2023 | 5 | 49 |
  | 2024 | 3 | 103 |
  | 2025 | 5 | 58 |
  | 2026 | 8 | 77 |

- The 4 lists no list of what fits names, holding 311 lines.
- The workbook tab each list came from.
- The 306 lines naming F115: 13 Yamaha motors, 261 pairings in 7 lists of what fits, 16 parts, 13 Dealer Fit, 2 Haines packages and 1 rigging kit.

**The app**, walked through the real door on the judge's build:

- Review: 37 to settle (9 wrong size, 3 two prices, 18 no price, 4 twins, 3 nameless), then 138 to tidy.
- Prices: 4 to choose, together pricing 2,725 lines (Dealer Fit 1,777, Rigging Kits 650, Yamaha 209, factory packages 89), and 10 settled.
- Rules: 7 kept by the file, 0 written by Northside, 3 noticed.
- Fitment: 289 models.
- Catalogue: 2,238 parts on sale, in 18 aisles, 197 of them pictured.
- Shelf: no copy saved.

**Review's own reader**, run over the seed (`queueOf(review(…))`). It returns the same 37 cases, split by list: Parts 19, GFAB 4, Dunbier 3, Mackay 3, Rigging Kits 3, REDCO 2, Dealer Fit 2, Formosa 1.

**The only pictures are the makers' marks** from `public/brand-marks`. Stabicraft is set as a word, because its ledger holds only a white mark. No cover photograph is drawn.

**What the boards do not show.** Cost and margin appear on no board. No trend arrow appears anywhere, because the file has one date.

## A: The Monday list (recommended)

**Order**

1. The head, with the file's three dates.
2. **Needs Northside**, a checklist of 5 open items and 1 done. Each item gives its figure, its numerator and denominator, and a door.
3. **New since 16 September 2026**, with the zero said as a figure.
4. The six rooms as counted doors.
5. What the file holds: 8 maker tiles, then the 18 lists you sell from beside the 28 lists of what fits, grouped by maker.

**Second state drawn:** Highfield's plate pressed. The mark is not drawn a second time. All seven series can be pressed. What fits a Highfield is offered as a choice of series and then boat, not the first boat in file order.

**References new to this board:** GitHub Insights *Community standards* (`live/github-insights-community.png`) and Wikipedia *Page information* (`live/wiki-page-info.png`).

**What only this screen does:** it lists everything the file is waiting on Northside for, across five rooms in one place, and turns each item into a tick when it is done.

**Reflow**

| Size | Layout |
|---|---|
| 1920 | Needs and the right column at 7:5. The rooms sit 2×3 under New since, the makers are one row of 8, and the floor is used. |
| 1440 / 1280 | Needs beside a right column of New since over the rooms. |
| 834 / 844 | One column, with New since beside the rooms and the makers 4×2. There is never an empty slot, because the eighth tile is "Every maker". |
| 390 | Head, find, then the needs as tight rows. The zero follows, then the rooms as full-width rows with an edge, the makers 2-up, and the ledgers stacked. |

## B: Every list dated

**Order**

1. The title, with the six rooms as the page's own counted tabs.
2. An **About** card. When: a large date, plus packed, last change, and the oldest and newest prices a heading dates. How big: lists and lines split three ways. **What needs Northside** as a labelled table, with the new-here row last.
3. **Every list**: one table of 53 rows. Each row gives its lines, what it fits, its *Priced as at* date, the lines changed here, its Review cases, whether its price waits on Northside, and (at 1920) the workbook tab it came from. The 28 lists of what fits are folded by maker.

**Second state drawn:** Parts opened. All 187 categories are reachable, largest first, and the 11 dated categories are shown oldest first.

**References new to this board:** NYC Open Data's dataset *About* (`live/nyc-open-data.png`) and data.gov.uk *Price Paid Data* (`live/datagovuk-price-paid.png`).

**What only this screen does:** it puts every list's date and open work side by side in one column.

**Reflow**

| Size | Layout |
|---|---|
| 1920 | Every column. |
| 1440 | Every column except *Where from*. |
| 1280 | Drops *Held in*, and the tabs lose their words. |
| 834 / 844 | List, Lines, and *What is open* as chips. |
| 390 | The tabs in a 2-column grid. Each row is a name with chips under it. |

**Its risk:** it is the densest of the three, and its needs read as a table rather than as work to finish.

## C: Ask the file

**Order**

1. A rail: the title and the rooms, counted.
2. The find, as the head and the widest control on the page.
3. **The pulse**: six counted cells, each a door, then one sentence with every figure in bold.
4. The holdings under ruled sentence heads: the makers, then **a matrix of the 28 lists of what fits** (maker against motors, trailers, Dealer Fit and P/D parts), then the 18 lists you sell from.

**Second state drawn:** *F115* typed. The rail becomes the answer's kinds, counted. The answer also points a salesperson to the bar's Find and the Catalogue (J10).

**References new to this board:** GitHub search's *Filter by* (`live/github-search-facets.png`) and GitHub *Pulse* (`live/github-pulse.png`).

**What only this screen does:** it answers "where is it?" over the whole file, and it draws what fits which boat as a maker-by-kind table.

**Reflow**

| Size | Layout |
|---|---|
| 1920 | The six cells in one row. |
| 1440 / 1280 | Rail plus main, with the cells 3×2. |
| 834 / 844 | One column: find, cells, then the rooms 3-up. The matrix scrolls inside its own card. |
| 390 | The find sticks, the cells go 2-up and fill the first window, the rooms come after them, and the matrix becomes one card per maker. |

**Its risk:** the needs read as figures, not a list to finish, and nothing turns to a tick.

None of the six references above appears in any earlier board under `docs/directions/` (checked by grep).

## Recommended: A, *The Monday list*

It is the simplest of the three, and the one that does what the owner asked first. On a Monday the screen opens on the five things only Northside can settle, each with its figure and its door, and a finished item becomes a tick. The work is never just a count.

It answers every job and every missing item the judge named, in this order: needs, then what is new, then rooms, then holdings. The rooms become counted doors. The 28 lists of what fits get their own rows and counts, and the phone shows the state in its first window. B's per-list dates are kept, inside A's lists, as the dated item's door ("Oldest first"). C's matrix is the strongest piece of either loser, and could replace A's right-hand ledger if the owner wants it.

## Owed whatever wins (from the judge)

- **No sideways scroll on the OBSOLETE spread at 390** (scrollWidth was 425).
- ***Make it* with an empty name refused** at the field with "A list needs a name." A made list says "lines".
- **The spread scrolled clear of the floating bar at 844×390**, with `scroll-margin-top: 72px`.
- **Kept:** the spread's content, counting through `register.ts`, the one write with its Undo, the shelf's single tab stop, and reduced motion.
- **The build needs a pure as-at heading parser** in `src/domain`, with tests. It reads only the date the heading writes. The boards' parser is in `facts.mjs`.
