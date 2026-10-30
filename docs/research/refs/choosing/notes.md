# Choosing in the build: the sweep

Driven 2026-10-30 into `dnd/`, `live/` and `shop/`: **38 frames on disk, 1 source with no frame.** Of the 38, **17 are failures** (404s, Access Denied, a bot check, gates, a blank page) and are never cited as patterns. Every frame is listed in `sources-index.md`, and every one cited here was opened. The floor is `docs/directions/flow/original.md`: configure visually, let the dealer add his own picture to any option, and keep a parts catalogue. Earlier boards already claimed `whaler-engines-chapter`, `porsche-search-open`, `framework-marketplace`, `pcpartpicker-list`, `hermanmiller-aeron-config`, `apple-mac-studio-deep`, `saxdor-deep-09/-10`, `axopar-cfg-1`, `rockauto-parts` and Stripe's frames, so none of those is a primary here.

## 0. What the price list asks of choosing, measured

- `parts` holds 2,937 lines, `dealer_fit` 1,777 and `rig_kits` 650, with **no picture field in any of them** (`original.md` §5). Per boat, the lists that say what fits offer 1–10 parts and 1–4 dealer-fit items, and **none of them is recommended** (`configurator/notes.md` §0). A parts board that stars a part is inventing one.
- Exact pictures: 34 of Highfield's 588 colourways. Motors and trailers are pictured where the picture list holds them. Parts are drawn as one generic glyph (`original.md` §5).
- **Dropdowns, counted on 2026-10-30.** No `<Select>`, Menu or Popover is drawn in `src/screens/configurator` or `src/screens/picker`. What the owner calls dropdowns are **disclosures**: chapter heads that open and close (`aria-expanded`, 3 in `Configurator.tsx`), "Show all 622 in Rigging Kits", and the 15 finishes as one radio list (the walk, Q2 step 14). The job is to replace disclosures with choices you can see, not to swap one widget for another.

## 1. Patterns worth taking, named

**The aisle named by what it is for.** Toyota files HiLux accessories under five tabs: PROTECTION · URBAN · RURAL · ADVENTURE · TRADES (`live/toyota-hilux-accessories-scrolled.png`). Even on a 404, West Marine's navigation reads Anchor & Docking · Safety · Marine Electrical · Engine Systems (`live/westmarine-outfitting.png`). A salesperson thinks "something for the anchor", not "SARCA". Our aisles must come from the price list's own section headings, put into dealer words. They are never invented.

**The aisle drawn, not photographed.** BCF's "SHOP BY" tiles pair a one-colour line drawing with the aisle's name: a sounder for Marine Electronics, a vest for Life Jackets (`live/bcf-boating.png`). The drawing names a kind of thing and claims to be no product, so it is honest where no part picture exists. Whitworths, an Australian chandlery, uses photographed aisles and puts "Catalogue" in its main navigation (`live/whitworths-home.png`).

**The vehicle held in the header.** Rivian's gear shop carries a standing **"Fit your vehicle"** chip beside search and cart (`live/rivian-gearshop.png`). The whole catalogue answers for one car until it is cleared. For us, the quote's boat travels into the catalogue as a chip, and the catalogue opened alone can take a boat the same way. That one chip is the answer to "what fits this boat".

**The condition printed on the candidate, with a link to what unlocks it.** Polestar prints "Only available with *Plus* pack" or "Only available with *Rear motor*" above each wheel and seat card. The pack's name is a link to that pack (`live/polestar-4-configure.png`). This is the cure for the walk's dealer-fit fault: rigging kits for an F90LB2 shown on a quote with an F60. Such a kit says "Made for the F90. This quote has the F60" and links to the motor chapter. It is never offered as if it fitted.

**Three shapes by weight.** One Polestar page holds three shapes: **picture cards** for wheels and seats (thumbnail, name, material, price or "Included"), **ticked lines** with right-aligned prices for single options ("Privacy glass on rear side windows $700.00"), and **collapsed bands that state their count** for extras ("Towbar (1)", "Interior (13)"). A choice that needs a picture gets one, a small one gets a tick, and the long tail gets a counted band.

**The pack as its own pictures and its contents.** "Plus pack $6,500.00" shows two photographs and then lists what it holds (Harman Kardon, Head-up Display …), with **Add** and **Read more** (`live/polestar-4-configure.png`). A dealer-fit package names its parts in place, each with its own picture where one is held. The original used one component's picture to stand for the whole package (`original.md` §3).

**The add-on beside its own "No".** Apple offers "Add Apple Pencil Pro A$219.00 / Add Apple Pencil (USB-C) A$139.00 / No Apple Pencil", and "Add engraving · Free / No engraving", under two-tone heads: "**Apple Pencil.** Select one that fits your needs." (`shop/apple-ipad-pro-buy.png`). The pattern is already claimed by board A of the configurator (`apple-mac-studio-deep`), so here it only supports.

**The fit written on the thing.** Apple's compare rows say "Supports Apple Pencil Pro" and "Supports Magic Keyboard for iPad Pro" under each model, and its FAQ asks "Which Apple Pencil will work with this iPad?" (`shop/apple-ipad-pro-buy.png`, lower). This is the walk's proposal for the boat page: "What goes on it: 5 motors · 0 trailers · 7 fit-outs".

**One scale, one ground.** Yamaha's accessory grid draws four vests at one height on one white ground, each with its name, price and "2 colors available" (`live/yamaha-waverunner-shop-accessories.png`). This answers walk item (8), motor pictures at different scales: every product picture sits in one box with one padding rule, contained and never cropped.

**Start from what is sold, or from a finished one.** IKEA's PAX opens on two doors, "PAX Planning Tool" and "Open a saved design — Enter a design code". Under them, "Choose a combination to customise" is a row of photographs of finished wardrobes (`shop/ikea-pax-tool.png`). For New quote, the first question becomes *what is being sold*, asked with pictures: a boat (the largest door), a motor, a trailer, or parts. A quote number reopens an existing quote.

**The catalogue beside the room.** IKEA's planner, photographed on a laptop on its own page, has a rail of product pictures on the left and the room on the right (`configurator/premium/ikea-pax-planner.png`; composition only, as it is a photograph of a screen).

**Pick up, move and drop by key.** dnd kit: Space or Enter picks up, the arrows move, Space or Enter drops, Escape cancels. Screen-reader instructions explain all four, and moves are announced in a live region (`dnd/dndkit-a11y-docs.png`). Measured in the still: after Tab, Space, →, → the draggable moved **45px right** (bounding box x 40→85) and gained its lifted shadow (`dnd/dndkit-droppable-keyboard.png` against `dnd/dndkit-multiple-droppables.png`). Each drop zone is labelled with an icon and a word.

**Every drag has a press that does the same.** Atlassian: "Always provide alternatives to dragging." A drag-handle button opens an inline menu of movement outcomes such as "move to top" (`dnd/atlassian-pdnd-guidelines.png`; the rule from `…/pragmatic-drag-and-drop/accessibility-guidelines`, read 2026-10-30). Each drop target becomes one item in that menu: "Add to the helm", "Put it on the printed quote".

**Pictures travel with the thing.** A 1-star review of Shopify Bundles: "it doesnt bring over the imagery" (`shop/shopify-bundles-app.png`). A picture a dealer adds appears everywhere that one line appears.

## 2. Type and motion, as seen

Polestar sets a choice's name and price at one size, price right-aligned, "Included" in the price column. Apple's two-tone head names the step and asks the question at one size. Toyota and Yamaha's series strip keep spaced capitals for aisles, never for products. The only motion a still proves is dnd kit's lift, a shadow and a 45px move. Under reduced motion the shadow and colour stay and the travel goes.

## 3. What to avoid, each with its frame

- **A form over the catalogue.** Sea-Doo's accessories page opens under a name and email card (`live/seadoo-accessories-au.png`).
- **"No longer available — You Might Also Like."** Nike's builder page, dead twice a month apart, offers other shoes in its place (`shop/nike-by-you-dunk.png`, `configurator/premium/nike-by-you.png`). This is the stand-in our picture rule forbids. A part without a picture never borrows a "similar" one, and a part no longer on the price list is never quietly swapped.
- **Eight dropdowns over a picture grid.** Year, Category, Price, Brand, Collection, Size, Color, Sort by (`live/yamaha-waverunner-shop-accessories.png`). Each aisle should be a tile you can see.
- **Steps greyed until the one before is answered.** Apple shows Connectivity, Apple Pencil and Keyboard at low contrast until earlier steps are answered (`shop/apple-ipad-pro-buy.png`). Ours is a sentence with its reason, never a faded control.
- **A gate before the tool.** Polestar's state modal covers the configurator (`live/polestar-4-configure.png`, top); LEGO's two-door gate covers Pick a Brick (`shop/lego-pick-a-brick.png`).
- **A count inside the label:** "Interior (13)" (`live/polestar-4-configure.png`), the shape of the owner's "60 hp 2". Counts stand apart.

## 4. Three directions for choosing in the build

Shared by all three: New quote asks **what is being sold** (boat, the largest door, then motor, trailer, parts), each a picture door with marks and prices; chapters exist only for what is sold. A dealer's picture belongs to one line, "added by <name>, <date>", read by `src/data/pictures.ts`, in the backup, undone by a command. No auto-advance from a multi-choice chapter (walk Q2 8–9). Finishes are a material segmented control then swatch chips, the row's own render on the stage only where held, codes in *For the workshop*. The price is a Cash | Trade segmented control in the build head. "Who it is for" stays a typed search over customers, justified because that list is open-ended.

### A — "The boat as the map." Found by where it goes.

**Found.** The parts chapter opens on a side-on outline of a generic hull, labelled a diagram, never this model, split into **Bow · Helm · Deck · Transom · Trailer**. A zone lists the aisles that go there. Which zone an aisle belongs to is Northside's own setting, once per aisle (tens, not thousands); unset aisles sit in a counted "Not placed yet". Nothing is guessed.
**Added.** Drag a tile onto a zone, or press **Add**, or keyboard: Space lifts, arrows step zone to zone ("Over the helm" announced), Space drops. The tile's menu offers "Add to the helm".
**Shown.** A numbered pin per zone with its count; chosen pictures stack beside their zone; a running tray along the foot.
**Dropdowns.** Each disclosure becomes a visible zone; "Show all 622" becomes the zone's counted line, "and 615 not made for this boat".
**Catalogue alone.** `/parts`, same zones; with no boat it shows every aisle.
**Colours.** Swatches only; the outline is never tinted, as a tint would claim to depict the boat.
**Own picture.** Drop a file onto any tile or swatch, or press its corner "Add a picture".
**What fits.** The map is what fits: made for this boat first, the rest counted; `/fitment?boat=` one press from the head.
**Reflow.** 390: zone chips above one column, press first, touch drag still works. 834: outline on top, two tile columns. 1920: outline 40% left, three aisle columns and a pinned tray right.
**References no earlier board used:** `configurator/premium/ikea-pax-planner.png` (the catalogue beside the room) and `dnd/dndkit-droppable-keyboard.png` (a keyboard drag, measured).
**Only A** answers "what goes at the helm?" by pointing.
**Risk:** it adds one setting, where each aisle goes.

### B — "The chandlery." Found by what it is for.

**Found.** The parts chapter opens as aisles: tiles named from the price list's own sections in dealer words, each with a line drawing of its kind, after BCF. The quote's boat sits as a standing chip, "Fitting the Formosa GRT 455 · 7 made for it", which can be cleared to "Everything · 2,238". Inside an aisle, the tiles made for this boat come first, then the rest, counted.
**Added.** Press **Add** (it becomes "On the quote ✓ · Take off"), or drag the tile into the quote tray; keyboard: Space lifts, → to the tray, Space drops.
**Shown.** A tray of the quote's items with thumbnails, in printed-quote order: a right column on a desk, a counted bottom sheet on a phone.
**Dropdowns.** Aisles replace "Show all"; a word search (never codes) above; brand marks as a filter row.
**Catalogue alone.** `/parts`, the same chandlery, in the main navigation as "Parts & Accessories", its boat chip empty until a boat is chosen.
**Colours.** A "Colour" chapter shaped like an aisle: material control, then pressable swatches, name and price under the chosen one.
**Own picture.** "Add a picture" on every tile, the aisle's drawing included.
**What fits.** The chip, also on the boat page and in Find ("What fits the Highfield ADV9").
**Reflow.** 390: two aisle columns, sticky chip, tray as a sheet. 834: three columns, tray as a sheet. 1920: four columns, tray pinned right.
**References no earlier board used:** `live/toyota-hilux-accessories-scrolled.png` (aisles named by purpose) and `live/rivian-gearshop.png` (the vehicle held in the header). `live/bcf-boating.png` supports.
**Only B** is the same catalogue inside the build and on its own, so a salesperson learns it once.

### C — "The printed quote, being pinned." Found by picture, chosen on the card.

**Found.** Each chapter uses Polestar's three weights. Things made for this boat are **picture cards**. Small extras are **ticked lines** with prices. The long tail is **counted bands** with the count set apart from the name. A card that needs something else says so, with a link: "Made for the F90 · this quote has the F60 →". Dealer-fit packages open in place to show their contents, each with its own picture.
**Added.** Tick or press **Add** on a card. Beside the build, a two-column board, *On the printed quote* and *Kept off the printed quote*, holds every chosen section and item. Dragging reorders them or moves them across, which is the owner's "add/remove sections". Every card has a menu that does the same: "Move up", "Keep it off the printed quote". The keyboard follows dnd kit.
**Shown.** The board is a small, live outline of the printed quote: a cover with the boat's own photograph, then sections in order.
**Dropdowns.** Picture cards and ticked lines replace the disclosures. Collapsed bands stay only for the counted long tail, each saying its count before it is opened.
**Catalogue alone.** `/parts` uses the same three weights, grouped by the price list's sections.
**Colours.** Picture cards where the colourway's own render is held (34 Highfield). Elsewhere, swatch cards whose name says what the swatch shows.
**Own picture.** The card's empty picture square says "Add a picture of the <name>". It is the same size as a filled one, so cards never change height (walk item 1).
**What fits.** The condition printed on each card, plus "What goes on this boat" in the head, which opens Fitment on this boat.
**Reflow.** 390: one column of cards, the board a "Printed quote" sheet reordered by press. 834: two columns, board below. 1920: three columns, board pinned right.
**References no earlier board used:** `live/polestar-4-configure.png` (conditions, packs, three weights) and `dnd/atlassian-pdnd-guidelines.png` (the menu that equals the drag). `shop/shopify-bundles-app.png` supports.
**Only C** lets the salesperson build the quote and its printed pages in one place.

**Sweep's lean:** B is the simplest, because it is one catalogue in two places and adds no new setting. A is the most visual. C answers the paper.
