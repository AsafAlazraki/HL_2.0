# Prices (`/levels`), built — data round, 2026-11-04

The judge said **deepen**: keep the three groups (Yours to choose · Kept from customers ·
Settled), and give them substance. That is what this round did. Every figure below was
measured on Northside's own price list, through the real door, in this round.

## What changed, against the judge's list

| # | The judge asked | Built |
|---|---|---|
| L1 (blocker) | Each figure says what it is, with its cell and the spread between the figures | `src/domain/pricing/meaning.ts` gives each column a sentence, its workbook cell (read off the column's own record) and the workbook's rule **checked on every line**. For example, Act Sell's rule holds on 1,721 of 1,733 lines. Sell is accessory 1's sell alone, and it is at or under Parts Sell on 789 of 789. Each way's tile says this. Under the tiles, "Across the list" reads the two figures over the whole list: "On the 789 lines holding both, Act Sell is 0.97–27.83 × Sell; on the middle line, 2.08 ×. They are never the same figure." |
| L2 (blocker) | Factory packages' RRP + Freight is not "worked from motor cost" | `ways.ts` treats two columns as one way when they hold the same figure on every line. RRP + Freight Inc GST = Sell Price on 39 of 39 Haines and 39 of 39 priced Jeanneau lines, so the question offers one way, **Sell Price**, and says the other name holds the same figure. The engine's "starts as Northside's own" can no longer be reached for packages from here. A factory-package line is never pictured (`Sample.bare`): its Image Link is its motor's. |
| L3 | Each price as a range over its list | Every opened settled list shows "What each buyer pays" across the list, each price on a scale with Cash as its rule: Trade 100% of Cash on 91 of 91 for Stacer, Warranty 93–110% with the 8 above Cash named. The well draws every maker's Warranty on one scale: Highfield 55–67%, Stabicraft 81–84%, Surtees 83%, Jeanneau 81%, Formosa 81–84%, Stacer 93–110% with the overshoot in carmine. Underneath: "Above Cash on 8 Stacer boats: 319 Skimma · HS, …" with its door. |
| L4 / S2 | Look up any line, see each buyer's price | "Each buyer's price" sits over the groups (`Lookup.tsx`, `src/domain/pricing/buyers.ts`). A line is found by code or name (F90XB, DB 37 OB) and kept in the address (`?line=`). It answers for: a customer, a trade buyer, a warranty job (with its lock), fitted, and a sub-dealer. Each answer has its column and cell, read as a quote reads it. A list with no Trade price falls to its own price, as `priceAtLevel` does. A blank Trade on a list that has one is "Not priced". A list not yet chosen says so, lists the figures the line holds, and offers "Choose how … is priced". |
| L5 / A7 | Every count opens its lines | Each count of no figure gets one door per kind of nothing, opened on the sheet with `?only=`. Parts' 146 is "Open the 27 with nothing in Sell" and "Open the 119 at $0 in Sell". Warranty above Cash opens with `under~Cash~Warranty`. The lines a way would not price have the same doors in its count. Haines leads to the factory packages' prices. |
| L6 / A10 | Rigging Kits priced as the file prices them | The question is now "How is a rigging kit sold: supplied, or always fitted?". **Supplied, or fitted** names Cash = Kit Sell Price, Trade = Trade Price and Fitted = Sell Price (kit + fitting: holds on 621 of 642). **Always fitted** names Cash = Sell Price and Trade = the kit-fitted Trade Price (holds on 621 of 621). One step either way, written by `nameWay.ts`. Changing way takes off the price the other way named. |
| L7 | Sub-dealer prices shown | A sub-dealer row says Sub Dealer Price is the same figure as Trade on 628 of 628 kits, and that no quote is priced for a sub-dealer. A boat says its Sub Dealer (Boat Module!QV) is not in the price list this app reads. |
| L8 | What a choice does to standing quotes | The count before every choice says it (`standing.ts`): drafts carrying the list; lines waiting for this price, with a door to each quote; every other line keeps its figure; issued quotes keep theirs. On this browser today it reads "No quote on this computer carries a … so nothing standing changes." The route now reads the quotes on arrival, not only from the build's door. |
| L9 | An opened decision fits one view | The picture is a thumbnail beside the line's name (4.5rem in a hand, 8.5rem from 834px), never above the figures. Ways stand two across from 640px. Once pressed, the count is brought into sight and **the act's own bar** stays at the window's foot in a hand and in a short window. Measured with the act in the window: 274–326 of 390 (844 × 390), 672–724 of 844 (390 × 844), 724–776 of 800 (1280 × 800), 768–820 of 900 (1440 × 900), 1004–1056 of 1080 (1920 × 1080). An open thing has one edge, in the accent. Labels have a 12px floor: no text under 12px in any state at any size. |
| L10 | One set of marks, rows of one height | Settled tiles are a kind glyph and a name in type. Every tile in a row is as tall as its tallest, and the second fact is reserved. A maker's mark is drawn once, in the opened list, and only where one is held. Questions carry no mark column (no white hole). In a hand, one list to a line. |
| L11 | Share previews and counts its effect | Typing 95 on Stacer changes the trade row to ~~$1,730~~ $1,643 in place. The count reads "91 written · 0 already at 95% · 0 with no Cash · 309 Skimma $1,730 → $1,643" and "$116,626 less for trade buyers across the 91 that hold a Trade today". |
| L12 | An act that changes nothing is not offered | At today's share nothing is offered (Stacer: "already holds 100%"). The judge's premise for Jeanneau was measured false: a Jeanneau with no Trade is **not priced** on a trade quote (`priceAtLevel` reads null; pinned in `buyers.test.ts`). So "Write 8 Trade figures" stays, and now says why: "8 hold no Trade today, so a trade buyer's quote cannot price them; this gives them one". The double count "19 equal Cash today · 19 already" is gone. |
| L13 | Headings and names that stay true | "Settled" is counted "10 by your price list · 4 by you" once answered. "Kept from customers" replaces "Worked from cost". Lines are named by the build's namer with the paper's units ("3.4 m", never "3.4 Mtr"). The step says the page's words: "Every dealer fit package is priced at its Act Sell from the next quote." Names break at their joints ("Highfield Sport 560 · Hypalon · / White / White / White/Blue"), and "$16,184 under" never splits. |
| L14 | Who chose and when | A list chosen this session says who chose it and at what time today ("<name> chose it at <time> today"; not photographed). This comes from the catalogue's session steps (`chosenBy`). After a reload nothing is said, because the store keeps no durable record. |

Gaps the judge measured:
- The motor photograph on a package, the 844 × 390 decision, the 390 photograph first, the white hole in the mark column, Dealer Fit's "or $249 Sell" line, the colourway break, uneven tiles and the 11px labels are all closed. The screenshots below show each one.
- Jeanneau's write at rest is kept on purpose (see L12).
- A step taken back no longer stands over the next list opened.

## Tests rewritten to the new truth

- `src/screens/levels/read.test.ts`:
  - Warranty is "every boat, from 6 makers": Haines holds no Warranty figure.
  - Added cases for ways, packages, kits and sub-dealer, doors, and look-up names.
- `src/screens/levels/Levels.test.tsx`:
  - The regions are "Settled 10" and "Kept from customers".
  - The question rows are matched by their new questions.
  - The Warranty sentence is in two phrases.
  - Rigging Kits: two ways, three prices, "Price 628 kits supplied, or fitted".
  - The Stacer count reads "91 written · 0 already at 95% · 0 with no Cash · …".
  - Added: the Yamaha spread, the look-up, nothing found, Dealer Fit's grounds.
- `e2e/flows/levels.spec.ts`:
  - The Settled region is matched by its new name.
  - The Stacer count text changed, and the trade row is previewed and read back.
  - Rigging Kits now asks the two-way question, with the act in the window.
  - Added: the look-up kept in the address through a reload; a count's door landing on the sheet's question.
- New:
  - `e2e/flows/levels-shots.spec.ts`, which only runs with `HL2_LEVELS_SHOTS`.
  - Domain tests `meaning`, `spread`, `ways`, `nameWay`, `buyers` and `standing`, all in `src/domain/pricing/`.

## Measured, this round

Everything ran on port 6272.

- **vitest:**
  - `src/screens/levels` and `src/domain/pricing`: 122 / 122.
  - With Data, Places, app and routes, which read the ladder: 227 / 227.
- **Static checks:** `tsc` (app and node) clean. `oxlint --max-warnings 0 src tools e2e` clean. `prettier` written.
- **`tools/check.ts`:**
  - Nothing of this round's.
  - It reports 587 failures, all `no-ui-selector-outside-ui` in `docs/directions/data-round/catalogue/boards/kit.css` (586) and `docs/directions/data-round/data/boards/kit.css` (1). These are another round's boards.
- **Playwright** `e2e/flows/levels.spec.ts`, six projects: 45 / 45.
- **Rulers** `--grep levels`, six projects: 42 passed, 18 skipped by the rulers' own rules.
- **Screenshots:** 27 states × 6 sizes = 162 frames in `after/`.
  - Sideways scroll 0 in every measured state.
  - Text under 12px 0.
  - No page errors.
  - The act in the window in every decision at every size (figures above).

## Not done, said plainly

- `src/domain/pricing/worked.ts` still documents RRP + Freight Inc GST as ROUNDUP(Total CTD × 1.19 × 1.1). It still starts that column as Northside's own when a dealer names it for the Yamahas. On this file the formula holds on 0 of 209. Prices no longer repeats the claim; the engine file is not this round's.
- A kit sold fitted on a trade quote reads the retail fitted figure. The engine has one fitted price per line, and the file's fitted trade figure (Rigging Kits!AD) has no rung to stand on under "Supplied, or fitted".
- "Who chose" lasts only for the session. A durable record needs the catalogue to keep its steps.
