# The refinement round, judged cold (2026-10-21)

The owner, 2026-09-24: "seeing overlap of info and things on some screens. ensure refinement of things covers that". This critic had never seen HL_2.0. It looked for three things on every screen: anything drawn over anything else, any fact said twice, and any word a boat dealer would not use. It judged the working tree after `refine.md` (uncommitted), against `build-close-critique-2.md`, `home2-critique-2.md` and `docs/WORDS.md`.

## How this was read

- `npm run build` (green, Vite's one chunk warning), then `npx vite preview --port 6091`.
- Driven in headless Chromium through Playwright, device scale 1, on a new profile that kept its storage from walk to walk.
- **The sale, at 1440 × 900:**
  - "Sam" at the door, and the Master Price File loaded.
  - New quote, Stacer, "519", the 519 Sea Ranger SDF · Centre Console, Start the quote.
  - 02 Motor, then the F115LB pressed with the F90LB on. 04 Dealer fit.
  - See what Trade does.
  - Who it is for: "Jordan Avery", "0412 555 018 · Brighton", with every running animation sampled 60 ms after each focus and blur.
  - The finale, Give it to the customer, then Open the printed quote.
- **A week in:**
  - Drafts of the Formosa GRT 425, the Highfield ADV9 (Dune) and the Haines Signature Fisher 525F, all started from Home's boats.
  - James Harrow (0400 123 456) and Mia Tran added in Customers.
  - That made 4 quotes and 3 customers.
- **Every route,** at 390 × 844, 834 × 1112, 1280 × 800, 1440 × 900 and 1920 × 1080, and the build and Home at 844 × 390 as well. Each was read at rest, half a window down, one window down and at the end. The routes: Entry, Home on day one and a week in, the picker (at rest, with a maker, with a boat chosen), the build (arriving, Motor open, Dealer fit open, named, finale, given), the cascade, the printed quote, Quotes, Customers, History, Data, the price list editor, `/kit` and `/nope`.
- **Panels open:** the finder ("519 sea"), the Quotes peek, Add a customer, For the workshop, Show all 209, and the step line after a swap at 390, 834 and 1280.
- **Its own overlap reading:**
  - Every run of text was sampled at nine points.
  - Text counts as covered when something that paints stands above it in the hit stack and neither holds the other.
  - Fixed, sticky, absolute and floating elements were all included.
  - Every hit was then looked at in a screenshot. Many were content scrolling normally under an opaque head, and those were set aside.
- **A word scan** of every screen's visible text, against WORDS.md's engine column.

Nothing was written to the repository except this page and one entry in docs/DECISIONS.md.

## The verdict

**Yes, the owner would still see "overlap of info and things", though far less than before.**

The round did real work:

- Home a week in fits its windows: 800 of 800 at 1280 and 900 of 900 at 1440, with 4 quotes and 3 customers.
- At 834 the boat arrives at the screen's width (770 × 433).
- The crest no longer replays on a blur: every crest animation stayed `finished` through three focus and blur pairs.
- Dealer fit is lines of the build.
- The rigging kit is "Rigging kit for the F115LB" in the head, the finale and the paper.
- The customer's page says "Price to be confirmed" and does not say the total is short.

**What he would still see:**

- **On a phone, the tab bar lies over the one thing to press.** On the picker, "Start the quote" stands under the tab bar at rest, and only its top edge shows. On the maker doors and the build, prices stand half under it at rest.
- **The sticky heads' see-through feet show half-covered words while he scrolls:**
  - the build's search band at every desk width
  - the masthead at 390, 834 and 844 × 390
  - the pill over the cascade's split ground at 1440
  - the pill over the picker's cards at 834
- **One fact is still said three times in one window.** The unpriced kit, the missing name and the chosen motor's price are each said three times. The cascade says "Trade" four times.
- **Two things contradict themselves:**
  - A given quote's motor tiles read "+$14,330" where the draft read "−$2,337".
  - The printed quote, opened by its address, wears a ship's-wheel crest named "HelmLogic" over a page lettered "Northside Marine".

The ruler is green on all of this by its own rules. It passes content a scroll can free, so a covered act at rest passes. It counts a gradient foot as ground. And it reads only three scroll positions.

## The five findings the build round left open

| # | Finding | Now | What was seen |
|---|---|---|---|
| 1 | Dealer fit reads as a settings list | **CLOSED, with a residue** | Glyph, name and one figure per line ("Battery Box · Small +$18"), no radio circles, no codes, no "at Cash". Residue: every line wears the same toolbox glyph. "Rigging kit for the F90LB · RECOMMENDED" still stands with the F115LB on the boat (major 14). |
| 2 | The kit named by the file's description | **CLOSED for the kit, OPEN for the Haines package** | "Rigging kit for the F115LB" in the head, the cascade, the finale and page 2. The description is under For the workshop. The Haines draft's Dealer fit head and its masthead sentence lead with "SIG 525F w Yamaha · F90XB" (major 17). |
| 3 | The crest replays on every blur | **CLOSED** | `way-crest-arrives` and `way-crest-shines` stayed `finished` 60 ms after focus, field-to-field and field-to-body. |
| 4 | At 834 the boat is a thumbnail | **CLOSED on arrival** | The ADV9 arrives at 770 × 433, top 246. Scrolled, the masthead's thumbnail hangs over the spec strip (major 8). |
| 5 | The given paper tells the customer an item is missing | **CLOSED** | Page 2 prints "Rigging kit for the F115LB · Price to be confirmed", with "—" on its band. "Your price" and the total say nothing is missing. The dealer's note keeps the reason. |

## Home, a week in

| Finding | Now | What was seen |
|---|---|---|
| Does not fit 1280 × 800 and 1440 × 900 | **CLOSED** | 4 quotes and 3 customers: 800/800, 900/900, 1,080/1,080. Every work card is 77 px. "and N more" is the last card. |
| Small marks in large white cards | **MOSTLY CLOSED** | Marks about 130 px wide in 160 px doors at 1280. Stabicraft is set in type. |
| Yamaha, ePropulsion and Trailers doors open a picker that never names them | **CLOSED** | The doors are gone. One line says they are chosen in the build. |
| A draft card does not say what is missing | **OPEN** | The Haines 525F draft has no boat price, so its total is $8,473 of trailer. Its card says "Draft · 1 minute ago · Nobody named yet". The card names the name and leaves out the price (major 13). |
| The time given said twice | **CLOSED** | The day line is "4 quotes started today."; the given quote is folded into the last card. |
| On a phone, scrolled, the bar over the sea's words | **CLOSED** | The bar scrolls away with Home at 390 and 844 × 390. |
| Northside's mark at showpiece size; the crest stops reading NM | **CLOSED on Home, CONTRADICTED elsewhere** | The waves wordmark with "EST. 1965" on the water, and the waves in the crest. `/kit` still says "The name in type, until Northside adds its mark.", and a reloaded printed quote shows another crest (blocker 2). |

## Findings

### Blockers

**1. A given quote's motor tiles price the swap wrongly.** (configurator, 1440, given 20261021-01)

- **The draft,** with the F115LB on: F90LB "−$2,337", F90LB2 "−$1,733", F115LB2 "+$650".
- **Given, the same tiles:**
  - F90LB "+$14,330"
  - F90LB2 "+$14,934"
  - F115LB2 "+$17,317"
  - Under Show all, F2.5SMHB "+$1,468"
- So a given quote's tiles show each motor's whole price with a plus sign, as if it went on top.
- **Why it matters:** this is the screen the dealer reopens with the customer, and the tiles now contradict what the same tiles said before the give.

**2. The printed quote, opened by its address, is HelmLogic's.** (document, 390 / 1440 / 1920, and `/kit`)

- Arriving by Open the printed quote, the crest is Northside's waves, "Northside Marine — Home".
- After a reload, a bookmarked link or a printer dialog that reloads, the crest is a ship's wheel named **"HelmLogic — Home"**, and the pill's Data loses its count. That is directly above a page lettered with Northside's mark.
- `/kit` does the same, and its band still says "The name in type, until Northside adds its mark." while Home and the paper carry the mark.
- **Cause:** `APP_NAME = 'HelmLogic'` in `src/app/ways.ts` is the crest's fallback when the marks have not been read on that page.

**3. On a phone, the tab bar hides the picker's one act at rest.** (picker, 390 × 844)

- With the 519 Sea Ranger SDF chosen, "Start the quote" stands under the tab bar. Only its amber top edge shows over "Home Quotes Customers Data History".
- It takes a 104 px scroll that nothing asks for.
- The overlap ruler passes it because a scroll frees it.

**4. An engine word on the printed quote.** (document, every size)

- The note beside the paper says the price list's picture is left off: "not that exact model (side console shown on a centre-console **row**)".
- WORDS.md lists "row" first. The printed quote is on the sale's path.

### Majors

**Drawn over something:**

5. **On a phone, prices stand half under the tab bar at rest.** (390)
   - The picker's second row of doors: "from $2,770", "$74,410" and their arrows.
   - The build's trailer price "$8,703" (Stacer). On the Formosa, "03 Trailer" itself.
   - Customers' quote card: "20261021-01 · Given · today", "$57,560".
   - Data's "Yamaha Outboards".
   - refine.md lists the picker's under "Still wrong". It is the same fault on four screens.
6. **The build's search band has a see-through foot.** (1280 / 1440 / 1920, scrolled)
   - Under the field, about 40 px of the band lets the rail show through, blurred and cut.
   - Seen there: half of the chosen motor's "$14,330 on the quote" chip, the tops of the motor photographs, and "for Jordan Avery" with half its icon.
   - Between the field and the first whole chapter there is a strip of half-words at every scroll position.
7. **The masthead's foot does the same in a hand.**
   - At 390 the hull's "Formosa GRT 425 · Tiller" floats loose under the masthead, with its head faded above it.
   - At 844 × 390 the pill and the stuck masthead take about 125 px of 390. "Every price here includes pre-delivery…" and "535 kg" show half-faded under it.
8. **At 834, scrolled, the boat's thumbnail hangs over the spec strip.** (ADV9)
   - The labels OA LENGTH, BEAM and AIR CHAMBERS scroll under the masthead. The values "9.2 m", "3.27 m" and "6" stand alone under the photograph's shadow.
   - On a boat without a photograph, the stuck masthead keeps an empty 280 px hole at its left (Stacer 519).
9. **The cascade's pill stands on two grounds when scrolled.** (1440, scrolled 177)
   - At rest a pale band is under the pill. Scrolled, the pill sits half on the blue photograph panel and half on the white column.
   - "WHAT YOU CHOSE" is cut under its edge. refine.md says "From 1280 the pill stands on one ground"; that holds only at rest.
10. **At 834, the picker's cards pass visibly under the floating pill.** The foot of the card above ("39 models", its arrow) shows on both sides of the pill.

**Said twice, or three times:**

11. **The unpriced kit, three or four times in one window on the build.** (1440)
    - "Cash · 3 of 4 items priced" on the left.
    - "The rigging kit for the F115LB has no price on the price list, so it is not in this total." under the total.
    - "Rigging Kits · No price on the price list" in Dealer fit.
    - In the finale, the same sentence again beside "Price for the rigging kit for the F115LB, tax included".
    - WORDS.md: "One line under the total".
12. **The missing name, three times.** "nobody named yet" (head), "A quote needs a name before it can be given." (under the button) and "The finale · not ready to give yet", all in one window.
13. **A Haines draft's missing boat price, three times on the build and never on Home.**
    - The build says it three ways:
      - "The boat has no price yet, so this total is everything but the boat."
      - "The price list has no price for the Haines Signature Fisher 525F…"
      - "2 of 3 items priced"
    - Home's card for the same draft says only "Nobody named yet".
14. **The chosen motor's price, three times; the wrong kit recommended.**
    - After a swap at 1280, 834 and 390, "$9,541" is in the step line, the chapter head and the tile's "on the quote" chip.
    - With the F115LB on, Dealer fit still marks "Rigging kit for the F90LB · RECOMMENDED". That is a kit for a motor not on the boat.
15. **The cascade says Trade four times** above the first figure:
    - "At Trade, one item changes price."
    - "WHAT YOU CHOSE · Trade"
    - "NEW PRICE · at Trade"
    - "$16,434 Trade"
    - Its photograph caption is still two sentences ("No photograph of this boat yet. Above it, Stacer's own mark, which is not a picture of this boat.").
16. **Elsewhere:**
    - **Quotes:**
      - An empty band says it twice: "DRAFT 0" over "—", and "REPLACED 0" over "—".
      - The peek says the given time again ("4 minutes ago" on the row, "4 minutes ago · 2026-10-21" in the peek).
      - The quote's number shows three times in one window: the row, the photograph's foot, and the peek's head.
    - **History:**
      - Wednesday 21 October is said three times: "Today · Wednesday 21 October", "Wednesday 21 October: 4 things done", and "SINCE 11:55, WEDNESDAY 21 OCTOBER".
      - One line says "given" and then "Given".
    - **Home:** the last card says "+3" and "3 more".
    - **Data:** "Data 53" in the pill and "53 LISTS" in the head. WORDS.md names the pill's "Data 53" as a place the price list's size must not be, and it is on every screen, the build and the cascade included. Six of seven plates say the maker twice.
    - **The picker:** a boat with no photograph says its name on the cover and again under it ("609 Ocean Ranger Cen Cab" twice). With 519 chosen, "Sea Ranger · Centre Console" is on the cover, the series eyebrow and the name, and again on the plate.
    - **The printed quote:** each band's sum is its one item's figure, so on page 2 every price is printed three times: the band, the line and "Your price".

**Words a dealer would not use:**

17. **The file's text as a headline:**
    - **The Haines package** leads Dealer fit and the masthead as "SIG 525F w Yamaha · F90XB".
    - **The finder** puts a file code on every line in a box: `9ST_SS519SRCCL_PD`, `SRR519SMR`. Its packages are named by the file ("Stacer - 519 SeaMaster").
    - **The cascade** shows the kit's code "704-6Y82L-##-05" with the file's "##" in it, and the printed quote's note does the same under "The codes".
18. **App plumbing in prose:**
    - **The printed quote's note:**
      - "The pages after the cover carry the name in type."
      - "no rate is typed on this quote, so no tax line is printed"
      - "None are typed for this dealership, so none are printed."
      - "Every figure was fixed when its item was chosen…"
    - **The peek:** "No tax rate is set on this quote, so no separate tax line is printed."
    - **History:**
      - "8 – 20 Oct · the 13 days before this diary began"
      - "Nothing before it: that is when the first quote was started on this computer."
      - "THE LAST FOURTEEN DAYS · A DOT FOR EACH THING DONE"
    - **The build:**
      - "This quote: the Yamaha F40LA · Tiller from 02 Motor." (Formosa)
      - "Haines Signature does not list its boats by finish, so there is no other finish of this boat to choose."
19. **The engine's own words:**
    - **Home:** "On the desk" (WORDS: desk → Home) and "name any other in the field".
    - **History's legend:** "repriced".
    - **Data's drawer:**
      - "COLUMNS · 27 · 6 of them costs"
      - "WHERE FROM · Motor Module, sheet 'Motor Library'"
      - "MASTER PRICE FILE · Its sha256, which names this exact file"
      - "PRICED AT · Sell Price · Trade Price", where the sale says Cash and Trade
    - **/kit:** "The file's blue", "a chip", "THE BAND".

**And the rest:**

20. **For the workshop prints empty labels.** Under Show all, every motor without a kit or prop prints "RIGGING KIT OPTION", "PROP PART NO." and "PROP DESCRIPTION" with nothing under them.
21. **A refusal drawn as a disabled control.** On the picker, with the ADV9 chosen and no colour, "Start the quote" is `aria-disabled` and drawn pale blue instead of amber. The sentence under it is right; the dead button is what the contract refuses.
22. **The Haines build numbers its chapters 01, 03, 04.** There is no 02 Motor, because the package carries the motor, and the gap is not explained.
23. **Add a customer opens below the fold** at 1440. The form's head is at y 846 of 900, and nothing moves to it.

### Minors

24. **The spec strip is still ragged at 1440** (minor 9 of the last critique). "HULL LENGTH" takes two lines and "HULL WEIGHT (DRY)" three, so the values stand at 406, 421 and 435.
25. **The picker's plate says "MIN · 60 HP"** where the build says "POWER · 60–115 HP". The colour chips at 1440 stand in two columns with a 150 px gap ("Dune … Mangrove").
26. **At 390 the tab bar's lit capsule is smaller than "Quotes".** The word sits on its lower rim, and the count dot sits on its upper rim.
27. **At 834, scrolled, the build's "/" keycap peeks** from under the masthead's lower edge.
28. **At 1280 the date's box overlaps the greeting's** by about 6 px under the wordmark.
29. **Customers says "No photograph yet"** where every other screen says "No photograph of this boat yet."
30. **The file's typo reaches the sale:** "FUEL CAPCITY" on the Haines build.
31. **The printed quote's cover says the maker three times:** the mark, "STACER" and "Stacer 519 Sea Ranger SDF (Centre Console)".
32. **At 1440 the given finale's card lands half below the fold.** The green card starts at y 787 of 900.

## Why the gate missed it

`e2e/rulers/measure/overlap.ts` can now see fixed and sticky chrome. It still misses what the owner sees, in three ways:

- **It passes content under chrome at rest whenever a scroll can free it.** That is blocker 3 and major 5: the act and the prices under the tab bar.
- **It counts a gradient or a blur as ground.** So the band's and the masthead's see-through feet pass (majors 6, 7, 9 and 10), though words show cut through them.
- **It reads three scroll positions** (rest, one window, the end). The seams under the sticky band move with every scroll position in between.

A ruler that asked "is any word visibly cut at any 50 px step of the scroll" would have found every major above.

## Where first

1. **The given quote's motor tiles** (blocker 1). Restore the difference against what is on the quote.
2. **The crest on a reloaded printed quote and on `/kit`** (blocker 2). Read the marks on every route, and drop "until Northside adds its mark".
3. **Nothing under the tab bar at rest** (blocker 3, major 5). Give the phone's page a foot of the bar's height, or bring the picker's act above it.
4. **Opaque feet on the sticky band and the masthead** (majors 6 to 10), and the pill on one ground when scrolled.
5. **The unpriced kit, the name and the chosen price said once** (majors 11 to 15). The line under the total is the one place; the chip, the count and the finale sentence go.
6. **"row" off the printed quote's note**, then the codes, the plumbing sentences and the leftover engine words (majors 17 to 19).

The owner has not looked at any of it.
