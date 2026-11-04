# A maker's own page: three directions for the redraw, 2026-11-04

The judge (`judge.md`) said **redraw**. The livery, the mark, the lightbox, the partner marks and Settings' four bounded choices were right. The body was built on the wrong unit: series tiles as doors to the sheet, so the page never showed a model, a price, a fact or what a model carries. The sweep is `docs/research/refs/places/round-2/notes.md`.

Each direction below is a different **order and grouping** of the same true content, not a different look on one stack:

- **A, "The line-up"**, groups by **series, then model**. The range is the page: series tiles that filter in place, one card per model, then everything else after the range.
- **B, "The lookup"**, groups by **question, then answer**. The range is a list on the left. The page's spine is one model and everything that fits it, as kit cards, with a census of the maker at the foot.
- **C, "The spec sheet"**, groups by **measure**. The series is a ladder by length beside a banded sheet that sets two or three models side by side.

**Recommended: A, "The line-up".** It answers the first question at the desk ("what do you have, and what does it cost?") at a glance: every model of the series with its own picture, its from-price at Cash, length, people and horsepower, and what it carries. It reads boats first on a phone, and its compare, drawn as C's banded columns, answers the second question ("the 600 or the 660?") one press away. It is also the simplest of the three: one grid, one filter, one tray. B makes the page's spine something Fitment already does, and on a phone it hides the range behind a press. C answers the compare best, but the customer sees figures before boats.

All three answer J1–J19 and the judge's missing items. Each board ends with its own jobs table.

**Boards:** `boards/a.html`, `boards/b.html` and `boards/c.html`. Each HTML is the screen itself, responsive, followed by the board's notes on paper. The notes cover:

- the job, and what only this screen does;
- the order and grouping;
- two new references;
- six further states drawn live from the file (the compare opened, Jeanneau, Yamaha, Labour Rates, OBSOLETE Trailers, Parts and Dealer Fit);
- the mark, the photograph, and what a dealer can replace;
- the type specimen, the motion, keyboard and reduced motion;
- the reflow at all six sizes;
- the honest constraints;
- the jobs table.

**Shots:** `boards/shots/<id>-<w>x<h>.png` at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080, plus a whole-page `-full.png` at 1440 and 390. I read every one. The shooter measured the screen above the notes at all 18 sizes:

- 0 px of sideways scroll;
- 0 text nodes under 12 px;
- 0 text boxes cut by their own box.

**Rebuilding them:**

1. Re-read the figures: `FACTS_OUT=docs/directions/data-round/places/boards/facts.out npx vitest run --config docs/directions/data-round/places/boards/facts.config.mjs`
2. Draw the boards: `node docs/directions/data-round/places/boards/draw.mjs`
3. Shoot the six sizes: `node boards/shoot.cjs`
4. Shoot each notes state alone: `node boards/states-shot.cjs <id>`

**Kit:** the boards read the app's own built stylesheet. `boards/kit.css` is the `ui`, `index`, `kit` and `places` CSS of `e2e/out/dist-6280`, the build the judge measured. `boards/board.css` is the chandlery boards' room, bar and notes. Every colour, size, radius and shadow is a token. The livery grounds are the app's own `[data-livery]`, and each mark is drawn at one optical size, scaled to a 4 : 1 mark's area as `markScale` does. Buttons, chips and segmented controls are the kit's own `.ui-*` markup, and the glyphs are the app's Phosphor set.

## Where every figure comes from

`boards/extract.facts.ts` runs the **app's own readers** over the real pack (`src/test/fixtures/pack.ts` reading `data/northside`):

- **`fleetOf`** (the picker's reader) gives the models, their spoken names, series, versions and materials, the from-price at the rung, and n of n priced.
- **`readBoatFit`** (Fitment's and the build's reading) gives, for each model's first version, the motors offered with the recommended one, the trailers with ATM, the dealer-fit packages and the P/D parts, each at the boat's own price.
- **`readPlaces` / `readPlace`** give the livery ground, the mark, the head photograph, the place figure, the partners with their fit counts, the declared prices and the Prices address.
- **`pictureBook`** (the one picture reader) gives each model's catalogue picture and photograph from `public/seed-images` and `public/hero-images`.
- The rows' own cells give a model's length, beam, people, load, weight, fuel, HP, shaft, tube and chambers across its versions, and Yamaha's HP Rating, Shaft, Control, WEIGHT kg and Sell Price.

`boards/facts.mjs` only says the figures. **No cost column is read.** Base Cost, Landed Hull Cost, Nett CTD, MU % and Landed CTD are not in `facts.out` at all.

Measured:

| What | Figure |
|---|---|
| Highfield | 67 models in 7 series, 588 versions. Cash $2,770 to $198,610, 588 of 588 priced. Length 2.3 to 9.2 m |
| Highfield by series, Cash (n of n) | Roll-Up $2,770–$6,940 (32/32) · Ultralite $3,890–$8,970 (64/64) · Classic $5,010–$20,990 (144/144) · Coaster $24,290–$41,660 (7/7) · Patrol $14,060–$85,260 (130/130) · Sport $15,040–$129,830 (199/199) · Adventure $105,930–$198,610 (12/12) |
| Highfield models with a picture | 46 of 67 with a catalogue picture, 18 with a photograph on the water, 47 with either |
| Recommended motor marked | 52 of 67 Highfield models |
| Sport 660 | HBS145, 16 versions in PVC or Hypalon, from $61,700 at Cash. 6.52 m, 13 people, 150–200 hp. 7 Yamaha motors (F175XC recommended, $25,355 at this boat's Cash), 2 trailers (REDCO TA600T-MOB recommended, ATM 1,990 kg against the 740 kg boat), 4 dealer-fit packages, 3 parts. 16 things fit it |
| Jeanneau | 27 models: Merry Fisher 12, Cap Camarat 11, and 4 under no series (DB 37 OB, DB 43 OB, TH33, TH38). Cash $74,410 to $1,456,990 |
| Yamaha | 209 motors, all priced at Cash (the file's “Sell Price”). 162 single motors in 27 HP ratings, 2.5 to 450 hp; 47 twin and triple rigs |
| Labour Rates | 18 rates with codes, no price level declared. Prices does not carry it (`pricesHref` is null) |
| OBSOLETE Trailers | 10, none still sold, each with ATM, supplier and code |
| Lines with no first heading | Jeanneau 4 of 27 · Stabicraft 1 of 37 · Parts 25 of 2,238 live · Dealer Fit 74 of 1,576 live (counted from the rows themselves) |

**Five corrections to the judge, measured:**

1. **Max People is on 567 of Highfield's 588 versions**, not all of them. SP300 carries none, and its card says "people not in the price list" where the figure would be. Min HP is on 581 of 588; ADV7 has none, so it reads "up to 250 hp". Max HP is on 588 of 588.
2. **Jeanneau's models have pictures.** All 27 carry the price file's own Image Link copy (the row's own picture, `book.catalogue`), so the cards are pictured. The "0 catalogue" the judge counted is the ledger's catalogue tier. What Jeanneau lacks is a person-marked photograph, so its head has none.
3. **6 of the 25 places have a photograph**, not 7: Highfield 18, Stacer 11, Stabicraft 2, Formosa 2, Surtees 1 and Haines Signature 1. So 19 need the compact head.
4. **The price list gives the Sport 600 and the Sport 660 the same** length (6.52 m), beam, people, load, weight, fuel and horsepower, and the same 7 motors and 2 trailers. Both trailers are filed "t/s Highfield Sport 660". Only the price, the version count and the tube covers' length (6.0 m and 6.6 m) differ. Every compare drawn here shows it. Whether that is right is a question for Review, not a claim made here.
5. **The judge asked for Labour Rates' door "to Prices".** Prices does not carry Labour Rates today. So the sentence says so, and its door opens Labour Rates in the price list. A door to Prices needs Prices to carry a list that declares no level; that change belongs to Prices, not to this screen.

## A, "The line-up" (recommended)

`/places/boat_highfield?series=Sport&compare=…`

**The order:**

1. **A short livery head**, 220 px with Highfield's own photograph (ADV9 on the water, captioned). It carries the mark, *67 models in 7 series*, *from $2,770 to $198,610 at Cash*, *2.3 to 9.2 m*, *588 of 588 versions priced* and the price list's date. Its acts are *Quote a Highfield* and *See the 18 photographs*, which opens every photograph in one lightbox. The mark says the name, so the name is not printed again.
2. **Eight series tiles**: *Every model* and the seven series. Each tile carries its own picture, its count and its from-price, and filters in place.
3. **The range head**: the series' span and n of n priced, *Open Sport in the price list*, the order (*File order · Price · Length*) and the **compare tray** (Sport 600 ×, Sport 660 ×, *Compare 2*). The head docks under the bar once the page scrolls, so the tray never floats over a card.
4. **One card per model.** Each card carries:
   - its own picture, or its length and horsepower set large with "No picture of the Sport 700 WL is held";
   - the spoken name and Model Code, and how many versions in what material;
   - **from $X at Cash**, and length · people · horsepower;
   - the recommended motor;
   - motors, trailers, dealer fit and parts as four counted figures;
   - three presses: *Compare*, *What fits* (`/fitment?boat=` that model) and *Quote it* (`/quote/new?brand=&model=`).
5. **One sentence**, once: what comes standard is not held yet.
6. **Four plates after the range.** Its prices: Cash and Trade spans by series with n of n, Warranty said, and the door to Prices. Quotes on a Highfield: empty and true. Goes with: each partner by its mark and count. Changed here and How it is dressed.

**References new to this board:**

- CarExpert's configurations (`live/carexpert-specs.png`, `carexpert-specs-390.png`)
- Quicksilver's selector (`live/quicksilver-selector.png`, `quicksilver-selector-390.png`)
- Also drawn on: `live/mazda-range.png`

**What only this screen does:** every model of one maker stands with its price, its three facts and what it carries, and two or three can be set side by side.

**Reflow:**

| Size | Layout |
|---|---|
| 1920 × 1080 | Five cards to a row. |
| 1440 × 900 | Four cards to a row; the range head with its tray and the first pictures are in the first screen. |
| 1280 × 800 | Four cards to a row. |
| 834 × 1112 | Series tiles four by two; two cards to a row. |
| 844 × 390 | The head is one line with the act above the fold; the series becomes one chooser. |
| 390 × 844 | Boats first: a 250 px head, one Series chooser, then the cards as rows (picture left). |

## B, "The lookup"

`/places/boat_highfield?model=boat_highfield:513`

**The order:**

1. **A compact head**, the same for all 25 places. It carries the mark, the figures, the price list's date (Rhino-Rack's stamp), the act and the gallery.
2. **Left, the question.** A find over the models, then the series folded to their counts and from-prices. The open series lists its models with their prices.
3. **Right, the answer.**
   - The model's own photograph (Sport 660 on the water).
   - Its name and *from $61,700*, with three large figures: 6.52 m, 13, 150–200 hp.
   - **"16 things fit the Sport 660"** as the title, with facets.
   - Kit cards: motors first, the recommended one marked, each with its facts and price at this boat's Cash. Then trailers, with ATM against the boat's weight. Then dealer-fit packages, each saying "No price chosen for Dealer Fit yet" where the figure would be, with the door to Prices. Then parts.
4. **A census** of the maker across the price list, then prices, quotes and Settings.

Changing what fits stays on Fitment (*Change what fits*). A press here reads; a press there changes.

**References new to this board:**

- Rhino-Rack's dealer lookup (`live/rhinorack-dealer-model.png`, `-model-year.png`, `-tool.png`)
- Easytow's trailers by hull length (`live/easytow-trailers.png`, `easytow-hull-51-56.png`)
- Also drawn on: `live/ryco-vehicle-type.png`

**What only this screen does:** everything one model carries, across every list, read as one answer without changing anything.

**The risk:** B is the closest of the three to an existing screen (Fitment). On a phone the range is behind *Change boat*.

**Reflow:**

| Size | Layout |
|---|---|
| 1920, 1440, 1280 | The question beside the answer. |
| 834 and 844 × 390 | The question folds to one *Change boat* line. |
| 390 | The answer first. |

## C, "The spec sheet"

`/places/boat_highfield?series=Sport&compare=…`

**The order:**

1. **A head of three figures** for the maker, as Arc heads a boat: 67 models, 2.3–9.2 m, $2,770–198,610 at Cash, 588 of 588 priced. It needs no photograph; the 18 photographs are one press away.
2. **The series** as one segmented row.
3. **Left, the ladder.** The series' models sorted by length, each rung carrying its people, horsepower, a bar for its length and its from-price, with a tick to compare.
4. **Right, the sheet.** Sport 560, 600 and 660 in columns, each headed by its own render, price, *What fits* and *Quote*. The rows are banded Price → Specifications → What fits, with Highlight differences on. A row the file does not fill prints a dash.
5. **Prices, quotes, changes, partners and Settings** after.

**References new to this board:**

- Porsche's compare picker (`live/porsche-compare-select.png`)
- Arc's model head (`live/arc-sport.png`)
- Also drawn on: `live/quicksilver-605-open-specs.png`, `live/apple-iphone-compare-rows.png`, `live/carexpert-specs-scrolled.png` and `live/honda-marine-scrolled.png`

**What only this screen does:** two or three boats of one maker are set beside each other, row by row.

**The weakness:** the first screen is figures, not boats.

**Reflow:**

| Size | Layout |
|---|---|
| 1920, 1440 | The ladder and the sheet side by side. |
| 1280, 834 | The sheet under the ladder. |
| 844 × 390 | The head is one line. |
| 390 | The ladder as two-line rungs, then a two-column sheet. |

## What every board shares, and why

**The same in all three:**

- The places beside Highfield are drawn the same in all three, in `boards/states.mjs`, because they are the file's state rather than the direction's:
  - Jeanneau's compact head and its four models under "Filed under no series", with the sentence naming them;
  - Yamaha read by its own HP Rating (27 single ratings, then rigs, never the file's capitalised sheet headings);
  - Labour Rates' sentence in place of 18 silent rows;
  - OBSOLETE Trailers' ten, each "No longer sold";
  - the Parts hand-off to `/catalogue`, and Dealer Fit's own folded page (no chandlery aisle holds packages).
- The head figure is always the number drawn.
- Standard inclusions are said once.
- Quotes are drawn empty, because the seed holds none.
- Settings is carried over unchanged, with the judge's word fixes named: "on its card" goes, the REDCO sentence is printed once, and "Inflatables's" becomes "Inflatables’".

**The livery.** Every board keeps the livery grounds and the mark as the showpiece. A and C keep the mark large on the head. B keeps it on a head that is one height for every place.

**What a dealer can replace:** the ground, the mark ink, the line and the photograph, all from Settings as now. No card depends on the head's photograph.

## Not drawn here

- **The Settings tab.** It is carried over unchanged; its word fixes are listed, not drawn.
- **The lightbox.** It is carried over unchanged.
- **A quote row on a maker.** No quote is held in the seed, so its anatomy is said in words, not drawn on invented data.
- **Stacer and Stabicraft.** They are not drawn; Highfield and Jeanneau carry the photographed and unpictured cases.
