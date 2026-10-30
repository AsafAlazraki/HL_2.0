# What the original HelmLogic's users valued: configuring visually, their own pictures, the parts catalogue

Read 2026-10-30 from `C:\Users\Asaf\dev\HelmLogic` (read only, not run): the quote flow, the model editors, dealer fit, the fit-up catalogue and selector, the catalogue pickers, the hierarchy export and the proposal. I also opened the screenshots in `tasks/test-evidence/` (`ffr33-sp560-proof/s1-variant`, `s2-options`, `s5-dealerfit`, `module-quotes/counter-picker-dfo`) and read the teardown, `HL_Playground/docs/research/helmlogic-original.md`. This file is evidence. Nothing visual or rule-like in it is ported.

## 1. How a boat was configured visually

It was a seven-step wizard: Boat Base, Factory Options, Motor, Trailer, Dealer Fit, Administration, Summary. On a desk the screen was split in two. The left half was a large carousel of photographs: the model's cover, the chosen colour's render, the chosen motor, the chosen trailer and a gallery. When the salesperson picked something, the carousel jumped to that item's slide. On the right, option cards stacked under heavy blue bands; a chosen console and seat became a composed carousel slide. A Fabric T Top card carried a lifestyle photograph, while Stern Shade and Shower Kit were blank cards with a name and a price (`s2-options.png`).

**What users plausibly valued.** The customer always saw the boat as it was being built. A choice was a large card, not a menu. The running total sat beside the picture.

**What was weak.** Steps came in a fixed order, so the trailer step had to be skipped by hand. Cards with and without pictures had different sizes in one grid. The carousel once showed a REDCO trailer when a motor was clicked (`hero-carousel.ts` exists to fix it). Text was 8–10 px uppercase throughout.

## 2. How colours were shown

On Boat Base, colours appeared as cards in a two-column grid. Each card was a full top-down render of the boat in that colourway (`color.imageUrl`), with the colourway name underneath: "SP560 — BLACK / BLACK / DARK BLUE" (`s1-variant.png`). If a material axis existed (Hypalon or PVC), a material step came first. No colour was ever drawn as colour. Where a variant had no render, the card was an empty white `aspect-video` box with the name under it.

**Valued.** People pointed at the boat in that colour. For Highfield, where several colourways differ by one tube colour, a render is the only honest way to compare them.

**Weak.** A colourway with no render showed nothing. The paper used `quote.variant?.imageUrl || quote.coverImageUrl` (`proposal-pdf.tsx:953`), so a colourway with no render printed the model's cover, which can be a different colour. That is a stand-in on the customer's paper.

## 3. How a dealer attached their own picture, and where it appeared

There were four separate places to add a picture, each in an admin screen and none in the quote:

| What | Where | How | Where it then showed |
|---|---|---|---|
| A colourway (variant) | Model editor, variant row | Click the 40 px thumbnail, pick a file; `imageUrl` is written straight onto the variant | Colour card, carousel, paper's vessel picture |
| A factory option ("Render") | Model editor, option's collapsible | Dashed square, file picker | Option card, the composed console and seat slide, proposal web view (not the PDF) |
| A dealer-fit part or package | Catalog → Dealer Fit, `ImagePlus` button per selection (v1.33, Bill: "upload images to dealer fit parts, e.g. Garmin head unit") | File picker to `organisations/{org}/dealerFitSelections/{id}/image.*` | Step 5 card, where it "beats the MPF item-data image". Never on the PDF |
| A fit-up item | Fit-up catalogue dialog | A pasted **Image URL** text field | Fit-up selector card |

**Valued.** Bill asked for it by name. A part the price file shows as a code becomes something a customer recognises.

**Weak.**
- No provenance: no record of who added a picture or when, and no ledger.
- Removing a picture was one hover-revealed X that called `deleteField()` at once, with no undo.
- The picture belonged to a dealer-fit *selection*. A selection can be a package of many components, and with no upload the card fell back to the *first component's* image (`sel.items[0].data`), so one part stood in for a package.
- In `s5-dealerfit.png`, SARCA No. 1, 2, 3 and 4 anchors all carry the same picture. Four sizes are drawn as one.
- Fit-up pictures were hotlinked URLs that could rot or be refused by the paper's renderer.
- All of it lived away from the sale, so a salesperson with a customer could not add one.

## 4. How the parts catalogue was organised, browsed and searched

- **In the build (Step 5).** Dealer fit was the Master Price File's sheet imported verbatim: 93 sections and 1,791 rows. The original added curation with ten named rules ("78 items hidden as not relevant to this build — use 'Show all items' to reveal"), a search field, and category chips with counts ("ANCHORING — SARCA (4)", "ELECTRONICS — GARMIN (47)"). A "Recommended for this boat" strip of pills came from the price file. Under each blue section band sat a grid of cards with the name on top and a picture only where one resolved.
- **In service and counter quotes.** `CatalogItemPicker` had four tabs (Motors, Trailers, Dealer Fit, Rigging Kits). Lists were text rows with a code and a price. A search needed at least 2 characters ("Type at least 2 characters to search the 26,378-part catalogue."), and results were capped at 50 with an honest refine line. There were no pictures.
- **Fit-up catalogue.** It had Simple, Medium and Complex tiers, category chips, an optional image URL, "often paired with" hints, CSV upsert and bulk markup. A separate export gave accounting a brand, range and model CSV.

**Valued.** One place held everything the shop sells, at the shop's own price. Recommended-for-this-boat came first. The escape hatch was always there. Hidden items were counted, never silently dropped. Package contents opened in place.

**Weak.** Sections were raw supplier headings, prettified. A count inside a chip read as part of its name. Search was not debounced over one unlimited query. The service picker had no pictures, and the four catalogues each had their own screen and shape.

## 5. HL_2.0 today, measured 2026-10-30

- **Colours.** The finish chapter (`finishes.ts`, `FinishCard`) draws each decoded colourway as colour (`Swatches`), with material and the change to the total, and a code it cannot read is printed as the code. That beats the original's empty box. **But no finish shows the boat in that colour.** The ledger holds an exact picture for 34 of Highfield's 588 rows (`pictures.json`, scope model, `exactRows`), and the card draws swatches only, even where the row's own render is held.
- **Motors and trailers.** Tiles with their own pictures where the ledger holds them (`chapters.ts:741`, `pictured` is only ever true for motors and trailers).
- **Parts.** `parts` (2,937 rows), `dealer_fit` (1,777) and `rig_kits` (650) have **no image field and no image address at all**. The fit chapter draws every part as the same generic glyph in a text row, with "Show all 2,238 in Parts & Accessories" as one flat list (`walk/q1-1440-06-dealerfit.png`). The file's own categories (the parts sheet's banners) are not offered as aisles in the build.
- **A dealer's own picture.** `src/data/pictures.ts` reads only the three bundled ledgers. No option has a file input. The only uploads are a maker's mark and photograph (Places → Settings), the price file and backup (Shelf) and the background, and none records who added it or when.

## 6. The three floors: met or not

1. **Configuring visually, colours as colours and pictures.** *Half met.* Colour is drawn as colour, but the boat is not shown in the chosen colour, and parts are glyphs. HL_2.0 must put each finish's own render on its card and on the stage where the row's own is held (and the swatches alone where it is not). It must also put a part's own picture on its tile, drawn at one size in one grid, so pictured and unpictured cards share a height.
2. **A dealer adding their own picture to a colour, a part, a flooring option or any option.** *Not met.* HL_2.0 must put "Add a picture" on the option itself, in the build and in the catalogue: drop, choose or paste, with a keyboard and press path. Each picture is recorded in the image ledger as "added by <name>, <date>", read by `src/data/pictures.ts`, carried in the backup, and undoable through a command. It belongs to that one row and is never copied to a sibling, a package or a "similar" part. The paper shows it only where the proposal's rules allow.
3. **The parts catalogue.** *Not met as a catalogue:* a search box and a flat "Show all". HL_2.0 must keep what the original got right (recommended first, hidden items counted, a way past the narrowing, package contents in place) and add aisles named from the file's own categories, picture tiles, counts apart from labels, and drag-to-add with an equal press and keyboard path (the owner, 2026-10-28).
