# Levels (`/levels`) — the price ladder, and it writes real cells

Swept 2026-10-22. 35 frames landed in `levels/live/` and `levels/hand/`, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\levels\`. **30 were opened; an unopened frame is cited nowhere.** The vendor price-book docs (Stripe, Paddle, Chargebee, Salesforce, Lightspeed, Shopify, Airtable) gave text, videos or walls, and QuickBooks, element14, Octopart and NerdWallet refused. None is an exclusive, because a text page shows no shape (critique-m2, fault 2). Xero was not driven.

## 0. What the engine and the file settle first (checked in this tree)

- **`src/domain/pricing/levels.ts` is not the ladder.** It is the *hierarchy* setter. It writes one value into one column for every row under a Series or Model (`planSet`), counting `already / blank / differing` with `Replace` off by default. `apply.ts` runs that plan as one `batch`, so 187 writes are one undo step. The ladder itself is in `src/domain/model/pricing.ts`: `PriceLevel`, `RungContents` (three states and a mandatory `source`) and `PriceLevelRecord`. This screen needs both. The ladder says which column a quote reads, and `planSet` writes that column.
- **The ladder has four keys, not six.** They are `cash` and `trade` (`QUOTE_LEVEL_ORDER`), and `warranty` and `fitted`, which are scoped to a line. No boat table in the pack carries a Sub Dealer, Sub (Exclusive), AUS Sailing or Published column: Highfield's 33 columns hold `qr` Cash, `qt` Trade and `rb` Warranty. The six old rungs are a fact about the workbook (`MPF_GROUND_TRUTH.md:875–887`). Drawing six would draw three empty columns on every boat.
- **Trade is Cash almost everywhere.** It equals Cash on every row of Stacer (91), Stabicraft (37), Surtees (19), Jeanneau (19 of 27 hold a Trade price), Formosa (39) and ePropulsion (32). It differs only on Highfield (0.950 of Cash on all 588) and Yamaha (0.982–0.986), so `HELMLOGIC_GROUND_TRUTH.md:187`'s "Trade = Cash × 0.95" holds for one brand. The screen must also say:
  - Haines Signature holds $0 Cash on all 9 rows.
  - Formosa holds $0 Cash on 9 of 39.
  - On 8 of 91 Stacer rows, Warranty is above Cash.
- **The fallback is the first rung.** `priceAtLevel` (`src/domain/quote/pricing.ts:501`) falls to `levels[0]` and records `levelResolved`. So "no Trade column" means "Trade quotes read Sell inc Rego", and the order of the rungs is a pricing decision.
- **Seven of 25 base tables declare no ladder.** The packer matches column names exactly, per kind (`tools/seed/levels.ts`, `NAMED_LEVELS`):
  - The accessory kind wants a column called `Sell`, and Rigging Kits says `Sell Price`.
  - The `package` kind has no entry, so Dealer Fit and both Factory Packages get nothing.
  - Four of the seven hold sell columns: Rigging Kits (Kit Sell Price 650/650, Sell Price 648, Install Retail Sell 627), Dealer Fit (Act Sell 1,733/1,777, Sell 1,759), and both Factory Packages (Sell Price and Trade Price on 39 + 50 rows). The brief named two of them.
- **The motor fork is refused today, with a false sentence.** `RRP + Freight Inc GST` is in `COST_COLUMNS` (`src/domain/quote/pricing.ts:125`) and in the manifest's `costColumns` for all four motor tables, so `costAsRung` would answer "cost never reaches a customer surface". Yet `MPF_GROUND_TRUTH.md:941` reads `BB RRP = ROUNDUP(AX × 1.19 × 1.1)`, which is cost marked up plus GST: a retail figure. On the F90XB the pack holds `bf` Sell Price $14,531 and `bb` $17,643. Across 209 rows, `bb` is 1.012–1.258 × `bf`. The brief's "Motor Library!R82" names a row: column `r` in the pack is Dealer List Price, a cost.
- **Warranty passes the cost guard.** `boat_highfield.rb` is a typed number in "Hull Only Pricing", so `isCostColumn` is false. The workbook computes it as `ROUNDUP((IY−IW)×1.01×1.1)` (`MPF_GROUND_TRUTH.md:885`). On the SP560 (HYP) the pack holds $32,166 against Cash $48,350 (HBS114/116/118/120). Because the pack holds no formula here, a may-reach-a-customer flag cannot be derived. It must be seeded with its cell, as `RungContents.source` is.

**Holes for `src/domain`, each with a test:**

1. A ladder command for an existing table that can declare, rename, reorder and drop a rung, with an inverse. Today the only routes are `addField({level})` and `createTable({priceLevels})`.
2. `customer: boolean` on `PriceLevel` and `FrozenLevel`, seeded off for Warranty, plus a line in `issueBlockers`. A non-customer rung must be refused in first position, because the first rung is the fallback.
3. `RRP + Freight Inc GST` must leave `COST_COLUMNS`.
4. The dealer, not the packer, declares the price column for the four sell-bearing tables.

Hole 2 is `HELMLOGIC_GROUND_TRUTH.md:528–533`'s `Basis` and `Audience` cut to one boolean; neither field exists. `FITMENT_RULES.md` says nothing about levels.

## 1. What is genuinely best here, and why

1. **A matrix read in one look holds references, not 588 prices.** `live/figma-variables-modal-img.png` has rows of variables and columns of modes (`Light · Dark`). Every cell is an alias chip with a swatch (`color/neutral/0`), and the section rows are `surface · text · border`. A cell that names the column (`Sell inc Rego`) and one fact (`= Cash on all 91`) lets the eye read across 25 tables.
2. **"Stays at Sell" is the rung it resolves to.** In `live/figma-default-mode-img.png` the default mode *is* the left-most column, and the chooser reads `Default (Modern Theme)`, which names the fallback inside the choice. Here Cash stands left-most. An empty cell says `→ Sell inc Rego`, which is what `priceAtLevel` does.
3. **Before the write comes the census, and after it one undo.** `live/figma-swap-library-img.png` prints `2 components, 3 styles used in this file` on the footer beside `Swap library`. `planSet` already computes that census. `apply.ts` acts first and reports with Undo (rule 9), and never asks.
4. **A difference is shown as the figure plus a word.** `live/google-flights-history.png` places one figure on a scale: a ribbon from `$90` to `$160` marked `$130 is typical`, under "Prices are currently typical for your search". So the screen prints `$45,932 · 95% of Cash`: the figure first, and the percentage as the word that explains it.
5. **The boundary has a ground and a flag, never only a tooltip.** `live/figma-edit-variable-img.png` puts `Hide from publishing` at the foot of one variable's sheet. `live/helpscout-note-img.png` tints the `Add Note` act itself beside a neutral composer, and the article says "Notes are *never* sent to the customer" (`docs.helpscout.com/article/69`).

## 2. Interaction patterns worth taking

- **Modes as columns, the default left-most** (`figma-variables-modal-img`, `figma-default-mode-img`). The first rung is the fallback.
- **The flag at the foot of the sheet** (`figma-edit-variable-img`): name, values per mode (here, what the rung contains, with its cell), then one checkbox, *May reach a customer*.
- **The counted scope beside the act** (`figma-swap-library-img`): `Writes Trade on 4 SP560 hulls · 0 hold something else` beside `Set`.
- **A verdict with a ribbon** (`google-flights-insights` closed, `google-flights-history` open). One sentence carries the reading, the scale sits under it, and the closed state keeps the sentence and a small glyph.
- **The crosshair and the echo footer** (`google-flights-date-grid`). The chosen cell is solid and its row and column are tinted. The legend reads `Compared with other prices shown`. The footer echoes `20–27 Nov $252 · Round trip` above `Cancel / OK`.
- **The rung named on the customer's figure** (`woo-wholesale-3`): retail struck through, then `Wholesale Price: $4.20`. A product with no wholesale price shows one figure, which is right for a customer. The dealer's screen must say the absence.
- **A head spanning its rungs** (`uline-s4339`). `PRICE PER BOX` spans `25 · 100 · 250 · 500 · 1,000+`, and the price falls from `$3.36` to `$2.65` along one row.
- **The act wears its audience** (`helpscout-note-img`).
- **One switch re-reads the frame** (`figma-modes`: `Semantic: Color · Light`). A *Read as Trade* switch shows which tables would fall back, and to what.

## 3. Type and motion

Figma's grid has no weight contrast: only the column heads are bold, and section rows and swatches carry the hierarchy (`figma-variables-modal-img`). Here that means one size, tabular figures, the column in the chip and the fact on a lighter second line. Google bolds one word of the verdict ("currently **typical**") and colours prices only relative to the others shown (`google-flights-date-grid`). Take the relative idea but not the green and red: a rung is neither good nor bad, and red is this app's refusal ink (Uline prints every price red, `uline-s4339`). Motion: Google's grid applies nothing before OK. Here a write ticks each written cell once, the census rolls with the kit's `Figure`, and nothing else moves.

## 4. What to avoid

- **One number printed as five rungs.** `live/uline-boxes.png` (S-4122) prints `$1.05` under all five breaks. Northside's Trade is Cash on six boat tables, so the screen says `= Cash` once.
- **A matrix cut off at the edge.** In `hand/uline-s4339-390.png` the tiers run off the right edge after `25 / $3.36`.
- **Cost on the price's ground.** In `live/woo-wholesale-1.png`, `Cost of goods ($)` sits two rows under `Wholesale Price ($)` in one form, marked only by a `?`.
- **An unnamed rung on the dealer's screen.** `live/apple-edu-mac.png` prints `From A$1,939.00`, and "Education" appears only in the address. That is right for a customer and wrong for a dealer.
- **A percentage stored against a moving base.** Lightspeed says a price-book percentage "won't automatically update" when the default changes (`live/lightspeed-pricebooks-2.png`, text, cited for that sentence only). Store columns; read percentages. Likewise refuse `Mixed+100` edits (`dense-tables-and-selection.md:74`): `planSet` writes a value.

## 5. Directions

None is a narrow list with a detail panel. Only this screen decides which column of the file a customer pays, and it writes a price into hundreds of real cells as one undoable act.

### A · Modes — the file as one grid

**Composition.** A full-width matrix of the 25 base tables, under kind section rows: Boats 7 · Trailers 8 · Motors 2 · Packages 3 · Parts & kits 2 · Services 3.
- The columns are Cash (left-most, marked *default*), Trade and Fitted. Past a hairline stands Warranty, under a closed eye.
- Each cell holds a chip naming the column, plus one fact: `95% of Cash`, `= Cash on all 91`, `→ Sell inc Rego`, `$0 on all 9`.
- An undeclared row reads *Not priced: the file holds Kit Sell Price, Sell Price, Install Retail Sell.*
- A press opens a popover anchored to the cell, in the shape of Figma's edit-variable sheet: the column, what the rung contains with its cell, *May reach a customer*, and *Set at a level…* with its census on the footer.

**Order.** By kind, then by table, with the rungs left to right.
**Exclusives.** `live/figma-variables-modal-img.png` and `live/figma-default-mode-img.png`, plus `figma-edit-variable-img` and `figma-swap-library-img` from the same family, all on this board only.
**Reflow.**
- At 390, each table is a card whose rungs stack as label and value rows, the way `Mobile 4 / Desktop 8` stack in Figma's sheet.
- At 834, there are three rung columns, and Warranty folds into one row per kind.
- At 1920, chip and fact share a line, and the columns stop at a reading width.

**Northside changes** the rung labels, their order (a non-customer rung is refused first), the column each rung reads, the flag, and the contains flags with their cell.

### B · Verdicts — the ladder said in sentences

**Composition.** One reading column, about 720px wide, of computed sentences, one per finding:
- "On Highfield, Trade is 95% of Cash on all 588."
- "On Stacer, Stabicraft, Surtees, Jeanneau, Formosa and ePropulsion, Trade is Cash."
- "Haines Signature holds $0 Cash on all 9."
- "Four tables hold a sell column and declare no price."
- "139 columns are cost and never reach a customer."

Each sentence opens in place to Google's ribbon for one specimen row, from landed cost to the top rung. For the SP560 (HYP): landed $29,251, Warranty $32,166, Trade $45,932, Cash $48,350, with the cost end on the *Northside only* ground. Under the ribbon is that table's grid of models × rungs, with the crosshair and the echo footer `SP560 (HYP) · Trade $45,932 · 4 hulls · Set`.
**Order.** By how much each finding matters. Sameness collapses into one sentence.
**Exclusives.** `live/google-flights-history.png` and `live/google-flights-date-grid.png`, with `google-flights-insights` and `hand/google-flights-date-grid-390.png`.
**Reflow.**
- At 390, the verdicts stack natively. Google keeps its verdict on a phone and puts the grid behind a `Date grid` door (`hand/google-flights-date-grid-390.png`). Here the grid sits behind *Every model*.
- At 834, the column is 640px.
- At 1920, the measure holds and the makers' marks stand in the margin.

**Northside changes** the rungs, and the sentences follow. It can also pick each table's specimen row, which defaults to the first.
**The sweep leans here.** With Trade equal to Cash on six of seven boat tables, a grid prints a column of `= Cash`. A sentence says it once.

### C · Choices — the owner's open forks

**Composition.** Full-width forks, one decision each. Under one spanning head per fork (Uline), the options stand side by side. Each shows the figure a customer's paper would print, with the rung named under it (Woo's storefront):
1. A motor: Sell Price $14,531 or RRP + Freight Inc GST $17,643 on the F90XB, across 209 + 32 + 89 rows. This fork needs hole 3 fixed first.
2. A rigging kit: Kit Sell Price, Sell Price or Install Retail Sell, each with its count.
3. Dealer Fit: Act Sell or Sell.
4. The Factory Packages: Sell Price or Trade Price.
5. May Warranty reach a customer? Off by default, with its formula shown.

Answered forks fold into a *Decided* ledger, each with Undo, and its rows open the `planSet` writes.
**Order.** By decision. Tables appear only inside their fork.
**Exclusives.** `live/woo-wholesale-3.png` and `live/uline-s4339.png`.
**Reflow.**
- At 390, the options stack as full-width tiles.
- At 834, the options stand side by side.
- At 1920, the options stand side by side with larger figures, one fork per row.

**Northside changes** every answer. *Do not choose for him* is the composition.

### D · The fence — by audience

**Composition.** Two bands on two grounds. On white, *May reach a customer*. On the tinted Northside ground, *Northside only*. Each band lists columns by name across tables:
- On white: Cash · 18 tables · called Cash, Sell inc Rego, Sell Price or Sell. Then Trade · 9 tables, and Fitted · Parts.
- On tint: Warranty · 7 boat tables · worked from landed cost. Then Cost · 139 columns on 24 tables.

Crossing the fence is the one act, and it carries its sentence. A cost column cannot cross, and the engine refuses it in its own words. The top band previews the customer's side as Apple prints it: one figure, with no rung.
**Order.** By audience, then by column name.
**Exclusives.** `live/helpscout-note-img.png` and `live/apple-edu-mac.png`.
**Reflow.**
- At 390 and 834, the bands stack, and the fence is a full-width rule carrying its sentence.
- At 1920, the two bands stand as peers.

**Northside changes** which side each rung sits on, never the side of a cost column.

## 6. What the seed can honestly put here

A Cockpit screen: no photography. The honest imagery is the makers' marks (`data/northside/marks-ledger.json`) at row or margin size. The rest is the file's own figures and column names, from `manifest.json` and the pack, recounted 2026-10-22.
