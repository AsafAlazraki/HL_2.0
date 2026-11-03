# The chandlery, redrawn: the round-2 sweep

Driven 2026-11-03 for the catalogue redraw (`docs/directions/data-round/catalogue/judge.md`), into `live/` (1440 × 900, plus three references at 844 × 390, 834 × 1112, 1280 × 800 and 1920 × 1080), `hand/` (390 × 844) and `gallery/`. **92 ledger rows, 89 frames.** Every frame and every refusal is in `sources-index.md`. Nothing was signed in, no form was typed into, and no bot check was fought. The earlier sweep (`../notes.md`) chose *how a part is put on a quote*. This one answers what it left open: **what a list of 2,238 parts looks like when only 197 have a picture, and two prices.**

## 0. What the list asks, measured (from `judge.md`, counted off `data/northside/`)

- **197 of 2,238 parts on sale have a picture (8.8 %).** On 17 of 19 aisles a picture-first card is a to-do box.
- **Two declared price levels:** supply (`parts.l`) and fitted (`parts.y`, *Sell inc Install*, with TTF hours `parts.o` and Install Type `parts.n`). They differ on 1,882 parts. **101 parts are priced fitted only.**
- 180 headings in the file; *Propellers* holds 447 parts; 28 are *Not sorted yet*.
- 79 supplier strings (`YAM` and `Yam` are one maker).
- **6 P/D pairing lists: 2,561 pairings over 75 distinct parts (3.4 % of the 2,238).** A chandlery that opens on "which boat?" would be near-empty for 96.6 % of it. The boat is a chip, never the door (§5).

## 1. What is best for this screen, and why

**DigiKey's category ledger** is the best evidence on disk for a long, sparsely pictured parts list (`live/digikey-toggle-table.png`). Each row holds a thumbnail of about 45 px where one exists. The **code is the row's link** (*KO106A102*), the description sits under it, and the **maker** is an italic link under that (*E-Switch*). The price carries its basis (*1 : $5.82000 · Bulk*), and every column has ▲ ▼ to sort. Nine rows fit in one 900 px window, against our 2 cards per 273–312 px row at 390. McMaster-Carr, which the judge named, **cannot be cited**. Both new frames (`live/mcmaster-cleats*.png`) and the stock frames (`../../sheet/redesign/mcmaster-shackles*.png`) show *To continue browsing, please log in*, so DigiKey stands in for it.

**Akeneo's product grid** is the best admin register for the same list (`live/akeneo-grid-filters.png`, `-search.png`, `-columns.png`). It switches between **List and Gallery** over one set of products. The filter rail carries **PICTURE · Is not empty**, a category tree counts each branch (*TVs and projectors (219)*), and the system adds an **Unclassified products** branch that "cannot be removed or edited". These are J9, J11 and the Show/Keep idea, already shipped by a catalogue tool.

**Mazda and Isuzu Australia** print the **fitted price** and say how it is built. Isuzu's footnote reads "Fitted RRP … Based on RRP for accessory, standard labour time and recommended hourly labour rate" (`live/isuzu-dmax-accessories.png`, read 2026-11-03 at the URL). Mazda's footnote reads "Recommended Fitted Price (RFP) … recommended fitting time and labour costs" (`live/mazda-bt50-accessories-top.png`). That is `parts.y` in the file's own terms: supply, plus TTF hours at a rate.

## 2. Patterns worth taking, named

**The aisle index with its sub-groups counted.** DigiKey's *Product Index* sets each category as a bold head with its sub-categories in two columns, each followed by a small grey count (*Battery Chargers 546 items*) (`live/digikey-product-index.png`). Our 19 aisles can be drawn this way, each with the file's own headings under it (*Propellers – Yamaha 260*). The index is a text door: no picture is needed, and none is missing.

**The ledger row in three registers.** In `live/digikey-toggle-table.png` one cell holds the code (bold link), the description (regular) and the maker (italic link). At 390 the same row survives as a stacked cell of about 370 px: thumbnail, code, description, maker (`hand/digikey-toggle-390-scrolled.png`). The price columns scroll sideways there, which we would not copy. Supply and fitted belong inside the stacked cell.

**Code and name in one box.** Crowley Marine's search says *Model, serial or part number* (`live/crowley-yamaha.png`, `hand/crowley-yamaha-390.png`). DigiKey's says *Enter keyword or part #*, and Akeneo's grid says *Search on Label or identifier* (`live/akeneo-grid-filters.png`). All three cure J4. None refuses a code.

**A maker word finds by aisle.** Searching DigiKey for `garmin` returns *Showing 45 Results*, grouped under *Top Results* by category, each with its item count (`live/digikey-search-maker-word.png`). This is the answer to J3: `lowrance` should land on every Lowrance line, grouped by aisle.

**The maker as a page, and the code said quietly.** Marine Depot prints *Shop all BLA · Part No: BLA-146060* under the product's name, in small grey type (`live/marinedepot-sand-anchor.png`, `hand/marinedepot-sand-anchor-390.png`). Blue Bottle Marine gives BLA a page with its mark and *Showing 1894 results for "BLA"*, and prints *SKU: 136030-1-BLA* on every card (`live/bluebottle-bla-brand.png`, `live/bluebottle-bla-grid-scrolled.png`). The maker name is a word a person says, set once, and the code sits beside it.

**A facet rail that counts.** Blue Bottle's left rail lists *Deck Hardware (316) · Rope, Wire Rope, Chain & Rigging (236) · Pumps & Plumbing (223)* (`live/bluebottle-bla-grid-scrolled.png`). It is the rail of direction (b), with its counts set apart from the names, as the earlier sweep asked.

**The unsorted bucket, named by the system.** Akeneo adds *Unclassified products* below the tree, and says "Remember that unclassified products are not exported" (`live/akeneo-grid-columns.png`). Our *Not sorted yet* is the same truth. What Akeneo adds is the next act: a product leaves the bucket when someone classifies it, which for us means a heading-to-aisle setting with Undo (J11).

**List | Gallery over one set, and "has a picture" as a filter.** Akeneo's *DISPLAY · List · Gallery* menu is in `live/akeneo-grid-filters.png`, and the rail there shows *PICTURE is not empty*. Boat Warehouse and Blue Bottle put a grid icon and a list icon beside the sort (`live/boatwarehouse-anchors.png`, `live/bluebottle-bla-brand.png`). The switch is direction (c)'s Show/Keep control in its plainest form.

**The filter bar that docks.** Apple's *Cases & Protection* chip row (*Accessory Type · Compatibility · Brand · Colour · Material · Only at Apple · Sort By*) sits under the title at rest (`live/apple-iphone-cases-compat.png`). Once scrolled, it is docked at the top of the window (`-scrolled.png`), at 844 × 390 and 834 × 1112 too (`live/apple-iphone-cases-844x390.png`, `-834x1112.png`). On a phone it folds to one **Filter** button beside *Sort By* (`hand/apple-iphone-cases-390.png`). This is the sticky head the judge asks for: aisle · maker · boat · Pictured/All, always in view.

**The vehicle held, its variant as tabs, its aisles as chips, all in the address.** Mazda's page opens with *‹ CHANGE MODEL*, then *BT-50 ACCESSORIES*, tabs *Dual Cab · Single Cab · Freestyle Cab*, and a chip row from *All Accessories* to *Trays ›* (`live/mazda-bt50-accessories-top.png`). The final URL carries the choices as search params, `?bodyStyle=Dual%20Cab&category=All%20Accessories` (ledger). That is our rule, "a position inside a screen is a URL search param", on a dealer site.

**Compatibility as one filter among others.** Apple's *Compatibility* is one chip in the row, not a gate (`live/apple-iphone-cases-compat.png`). Crowley keeps **My Garage** in its header at every width (`hand/crowley-yamaha-390.png`). Both support the boat chip of J6, which narrows the 75 paired parts to the top and never hides the rest.

**The fitted price, built and said.** Isuzu prints *FROM $4,313.35\** and Mazda prints *$230‡* (`live/isuzu-dmax-accessories.png`, `live/mazda-bt50-accessories-top.png`). Both footnotes describe a supply price plus labour time at a rate. We take the figure and the formula, and leave the footnote (§4).

**A picture lands by its code, never by a guess.** Akeneo's naming convention reads "the part of the filename before the dash is the SKU", and "every asset you upload from then on finds its own products" (`live/akeneo-product-link-rules.png`, `-scrolled.png`). This is J12's bulk drop: a file named `SG002.jpg` lands on SG002, and anything else is refused with a sentence. For makers, OpenRefine's clustering "always requires the user to approve each suggested edit" (`live/openrefine-cluster-dialog.png`). That frame supports the point only, because the review sweep already used it. `YAM`/`Yam` is proposed as one maker, and Northside approves it.

**A quote door in the chandlery's head.** Blue Bottle Marine puts *Quotes* between *Account* and *Gift Certificates* (`live/bluebottle-bla-brand.png`). Its quote page is empty without an account (`live/bluebottle-quotes.png`), so only the door is evidenced. A chandlery that quotes is ordinary trade (J7).

## 3. Type and motion, as seen

DigiKey uses three registers in one cell (bold link, regular, italic link) and right-aligned figures. Its five-decimal unit price is not ours to copy. Apple sets the aisle's name large (*Cases & Protection*) under a small eyebrow naming its door (*iPhone Accessories*), which tells the person where they are at one glance. Mazda uses spaced capitals for the aisle (*BT-50 ACCESSORIES*) and sentence case for each part, the same split the earlier sweep saw at Toyota. The only motion two stills prove is Apple's chip row docking (about 350 px down at rest at 1440; docked within the top 60 px once scrolled). That is position, not animation, so it holds under reduced motion.

## 4. What to avoid, each with its frame

- **The maker's logo standing in for a missing picture.** Boat Warehouse fills the Lewmar anchor's picture box with *LEWMAR · Image coming soon…*, in grid and in list (`live/boatwarehouse-anchors.png`, `live/boatwarehouse-anchors-list.png`). This is the stand-in our picture rule forbids, and it is the dashed box in another dress. An unpictured part gets a small empty cell, or no cell at all.
- **Filters stacked above the results.** DigiKey's filter boxes come before the table at every size. At 844 × 390 no part is visible (and the cookie banner covers the rest), at 834 × 1112 the table starts near the foot, and at 1920 × 1080 only its head shows (`live/digikey-toggle-844x390.png`, `-834x1112.png`, `-1920x1080.png`). This is the judge's J1 fault in another product. A rail sits beside the list, or folds to a button as Apple's does.
- **A hero before the aisle.** Mazda's *FIND BT-50 ACCESSORIES* photograph fills the first window at 844 × 390, 834 × 1112 and 1920 × 1080 (`live/mazda-bt50-*.png`). The aisle opens on its parts.
- **"Fitted" hidden in a footnote symbol.** The ‡ and \* sit far from the words that explain them (`live/mazda-bt50-accessories-top.png`, `live/isuzu-dmax-accessories.png`). Ours says *fitted* beside the figure.
- **A struck-through RRP beside "Our Price".** *RRP ~~$5,452.50~~ Our Price $5,023.00* (`live/boatwarehouse-anchors-list.png`) is a discount claim. Our two figures are two sale prices, supply and fitted, and neither is struck.
- **Five dropdowns in a row to find a fit:** *Brand · Product Line · Year · Series · Model* (`live/crowley-yamaha.png`). Crowley's own *Search by Horsepower* row of plain pressable figures, *2 3 4 … 350* (`live/crowley-yamaha-scrolled.png`), is the better shape.
- **Filters cut at the phone's edge.** DigiKey's two filter boxes run off the right of a 390 window (`hand/digikey-toggle-390.png`).
- **Concept shots with invented figures.** Dribbble's *Inventory Management* tag leads with *88 %*, *24 %* and *7842* dashboards (`gallery/dribbble-inventory.png`). Fake data is never a reference.

## 5. Three directions, and one the sweep rules out

All three keep what the judge kept: aisles counted off the file, *Not sorted yet*, the gallery, the dealer's picture door with its refusal sentence, and aisle and maker as search params. All three add a boat chip, find by code and maker word, and **supply and fitted on every part, labelled, never $0 where the file prices the part fitted**.

### (a) The aisle as its own page

The door is DigiKey's index: 19 aisles, each with its file headings counted. Pressing one replaces the page, the way Apple's *Cases & Protection* is a page under its eyebrow. The aisle's head docks: aisle · maker chips · boat chip · Pictured/All. Inside, the headings are sub-groups. Pictured parts are cards; the rest are ruled lines with both prices.
**References:** `live/apple-iphone-cases-compat-scrolled.png` (the docking head) and `live/mazda-bt50-accessories-top.png` (vehicle held, variant tabs, chips in the address) are new to every board. `live/digikey-product-index.png` supports.
**Reflow:** 390, the head folds to one *Filter* button (`hand/apple-iphone-cases-390.png`). 844 × 390, the head is one line. 834, two columns of lines. 1280 to 1920, the cards fill a band above the lines, measured at 90rem.
**Only (a)** gives each aisle an address a salesperson can send.

### (b) The rail and the ledger

The aisles become a counted rail on a desk and a sheet in a hand, beside a dense ledger. A row holds a thumbnail where held, the name, the code quietly, the maker word, supply, fitted with its hours, and the picture state. Rows sort by column and group by the file's headings. One press opens the part's line in the sheet (J10).
**References:** `live/digikey-toggle-table.png` (the three-register row and sort) and `live/akeneo-grid-search.png` (the counted tree beside the grid) are new. `live/bluebottle-bla-grid-scrolled.png` supports (the counted facet rail).
**Reflow:** 390, the stacked cell (`hand/digikey-toggle-390-scrolled.png`) without the sideways price columns, with the rail as a sheet. 844 × 390, the rail as a sheet. 834, the rail folds to chips. 1280 and wider, rail 16rem with the ledger beside it.
**Only (b)** walks the 447 propellers without pressing *Show the next*.

### (c) Two rooms: Show and Keep

A segmented control over the same aisles. **Show** holds the 197 photographs large, for the customer, with the gallery. **Keep** is the worklist of 2,041 unpictured parts, the 28 unsorted and the 101 fitted-only, for the admin. Pictures land by code in the file name, and maker codes become words by approval.
**References:** `live/akeneo-grid-filters.png` (List | Gallery and *Picture is not empty*) and `live/akeneo-product-link-rules.png` (a picture lands by its code) are new. `live/akeneo-grid-columns.png` (the unclassified bucket) supports.
**Reflow:** 390, the control spans the width and Keep is a list. 834 and wider, Show is a two- to four-column picture grid. Keep at 1280 and wider is a ledger as in (b).
**Only (c)** keeps the customer's view free of work, without hiding the work.

**Ruled out: boat first.** Crowley (*Select your engine to find guaranteed-fit parts*) and Mazda (*CHANGE MODEL*) open on the vehicle, because their catalogues are fitment-complete. Ours pairs 75 of 2,238 parts to boats (§0), so a boat-first door would show an empty chandlery to most questions. The boat stays a chip in every direction.

**Sweep's lean:** (b) is the simplest, because one shape serves the desk, the customer and the admin. (c) answers the 91 % most honestly. (a) is the most beautiful for the 9 %.

## 6. The imagery question

The seed can honestly show 197 photographs, each tied to its exact part with provenance. For the other 2,041 the best sites draw no box. DigiKey and RockAuto give a picture a small cell in a row (`live/digikey-toggle-table.png`, `../../fitment/live/rockauto-parts.png`), and a missing one costs nothing. Akeneo shows a small thumbnail in a column and lets the admin filter on whether one is held. The sites that fail fill the box with a logo (`live/boatwarehouse-anchors.png`). So a part with no picture has no picture frame on a sale surface. In Keep, the frame is the door, and it is the only place *Add a picture* appears.
