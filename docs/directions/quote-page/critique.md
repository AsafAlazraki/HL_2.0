# The build page and New quote, judged against the owner's words (2026-10-31)

An independent critic's pass, read-only except this file. I served `npm run build` with
`vite preview --port 5751` and walked it with Playwright at 1440x900, 1920x1080, 834x1112 and
390x844, all at device pixel ratio 1, plus one retina pass at 1440x900 x2 to check pictures. The
quote was a Highfield Sport 560 started at the picker's act. I then changed its colour, material
and model, picked a motor and a trailer, named the customer, scrolled to the summary and back,
pressed the summary door, opened every chapter, every "Show all" popup, the lightbox and the
customer popover. I also opened Stabicraft 1450 Explorer, Stabicraft 1550 Frontier and Stacer 519.
The shots are in the session scratchpad and are not committed. Every figure below was measured
in the browser.

The verdict: **the desk layout now does what he asked.** The bar holds the maker's mark and the
boat, only the column scrolls, nothing stands under the photograph, the credit line moved into
the lightbox, the hull chapter chooses model, material and colour, and the summary fills the
window. **It is not yet perfect on a screenshot.** The worst faults are below a desk (the
floating total, the summary only reached by a press) and in the details a customer would see
(raw file labels in the specs, a dealer-fit list with no prices, a clipped panel on the picker).

## The owner's words, item by item

| He said | Measured | Verdict |
|---|---|---|
| "the only thing that should scroll is the right hand bar" | At 1440x900 and 1920x1080 the window's scrollHeight equals innerHeight (900/900, 1080/1080). `.cfg-scroll` is 1492 over 600 at 1440 and 1492 over 780 at 1920. A wheel over the column moved only the column. | DONE at a desk. Below a desk the whole page scrolls (2455px at 834, 2916px at 390). That is by design, but it is where the faults below come from. |
| "the clicks and the animations when opening" | A shot 140 ms after a chapter press: the column has already scrolled about 48 px, the hull header is half cut at its top edge and the chevrons are mid-turn. It settles at about 700 ms. The popups and the lightbox open with a short scale-in. | PARTLY. The chapter opening moves the column under the pointer. See P-7. |
| "move find … to the top left in the bar before home" | Find@458 then Home@539 at 1440, and Find@698 then Home@779 at 1920. On a phone Find sits last in the bottom tab bar (x=333), after History. | DONE at a desk and tablet. On a phone it is not first (S-3). |
| "We dont need that little text under the photo … make image bigger" | Nothing stands under `.cfg-shot`. The photo is 568x398 at 1440 and 976x578 at 1920. | DONE |
| "viewing all of the products … should be popup please done nicely" | "Show all 209 in Yamaha Outboards", "Show all 32/73 in … Trailers", "Show all 1,576 in Dealer Fit Packages" and "Browse all 2,238 in the chandlery" each open a dialog with its own find field and the running total. | DONE, but not "nicely" yet (P-4, P-5, P-9). |
| "in that left hand side of that white bar … highfield logo and then have model details" | `.cfg-mast` reads: mark, "Highfield Sport 560", finish swatches, "PVC · White / White / White/Blue", then Quote, Stands, Started, Customer and Prepared by. | DONE for Highfield. Stabicraft shows the word "STABICRAFT" in small blue capitals, not its mark (P-12). |
| "picking model color … done in hull section … same for all boats … see differences in real time" | The hull chapter offers Model (16), Material (2) and Colour (7). Pressing Hypalon moved the total from $41,340 to $48,350 in the same frame, and Sport 600 changed it to $64,140, with the photograph, the bar's name and the specs changing too. Stabicraft 1550 Frontier offers Model (3) and Version (Adventure, Sportfish, Profish); Stacer 519 offers 6 models. A colour press changes the bar's swatches but not the photograph: `highfield-sp560-84445423` before and after. | DONE in the hull chapter. But the picker still asks for material and colour first and refuses "Start the quote" until material is chosen (S-1). A colour press shows no visible change on the stage (P-6). |
| "same theme to all other things like stabi with variants" | Stabicraft's Version row above. | DONE |
| "for specs, ability to open more of them and design that a bit nicer" | "All 18 specifications" opens 14 more rows, from the keyboard too. They read straight off the file: "Min 90 HP", "Max 115 HP", "Shaft Lgth XL", "Eng Configuration Remote", "Matrix Highfield Inflatables", "Model Code HBS113", "105 ltr". Stabicraft: "1.35 INT. BEAM" with no unit, and "HULL WEIGHT @ (DRY)". | Opening is DONE. The design is NOT done (P-2). |
| "remove the photograph from media.high whatever" | Not on the page. The lightbox reads "Highfield Sport 560 on the water, in the maker's own finish and rig. On this quote: no motor yet. Photograph from media.highfieldboats.com". | DONE, and the provenance moved rather than vanished. |
| "customer details i live in the top bar so we can remove who it for in the right hand scrolly" | There is no "Who it is for" chapter. "Name the customer" in the bar opens a popover. Once named, the bar reads "Jordan Avery · 0400 000 000" with a pencil. | DONE |
| "make the finale section nicer" | The summary: the photo large, a FOR card, the total at cash, Give and Preview, then "On this quote" with a thumbnail per line and a stacked bar. | Much better. Not perfect (P-3, P-10). |
| "things look a bit blurry sometimes" | Real file pixels against drawn size, from the files on disk: page photo 1280x854 in 976x578 at 1920 = 0.76x (sharp). Summary photo 1280x854 cropped into 967x890 at 1920 = **1.04x (soft)**. Retina 1440: the 2560 file is chosen, 0.47x (sharp). No text at rest under a fractional transform. | Nearly DONE. One upscale left (P-11). |
| "finale … take the whole page … when you scroll to that … scroll up and can edit … scroll down and then see big summary" | At 1440 and 1920 a wheel past the last chapter brings `[data-testid=summary]` in at 0,0,1440,900 (and 1920x1080). It does not scroll itself (scrollHeight = height). A wheel up returns to `?at=trailer`. "Back to the build" works too. At 834 and 390, thirty wheel turns of 800 px reach the end of the page **and no summary is there**. The page ends on the door row "The summary · ready to give", and only a press opens it. Once open there, it is taller than the window: at 834 the line list starts at y=950 of 1112. | DONE at a desk. **NOT done below a desk** (P-1). |

## Every frame, perfect or not

### /quote/$id at 1440x900

- **Top, at rest**: NOT PERFECT. (a) The first model card reads "SP300", a file code, beside "Sport 330", "Sport 360"… (P-8). (b) Thumbnails are a mix: photos, line drawings (Sport 520, 700 ST, 760 ST) and the maker's mark on a blue tile (Sport 700 WL, 760 WL), so the grid looks unfinished (P-8). (c) The "/" key hint floats alone at 1361,168, above the step meter and away from the field it belongs to.
- **Lightbox**: PERFECT. 1080 px wide inside the window. The caption carries the honesty and the provenance, Escape returns focus.
- **Customer popover**: NOT PERFECT. It hangs from the bar over the column and covers the hull header ("Highfield Spor…" cut at x=873). Acceptable as a popover, but its top edge sits 1 px under the bar, with no gap or arrow.
- **Specs open**: NOT PERFECT. The photograph shrinks to a 160 px strip of the hull (y=168 to 330) to fit 14 rows, and the rows are raw file labels (P-2).
- **Hull, scrolled to material and colour**: NOT PERFECT. Colour names break at the slash: "White / White" over "/ White/Blue", and "Black /" over "Black / Black" (P-13). Every alternative reads "no change", which is true, but it is seven pills saying nothing.
- **After a colour press**: NOT PERFECT. The toast "Now the Highfield Sport 560 · PVC · Black / Black / Black" and the bar change, but the stage is identical (P-6).
- **Motor open**: NOT PERFECT. The RECOMMENDED card wears an amber 2 px ring that reads as "selected" next to the blue "chosen" ring (P-14). The expand button at each card's top left sits on the motor picture.
- **Motor popup (209)**: NOT PERFECT. 205 cards each repeat "Under the 90–115 hp this boat takes." Under the four that fit, it then pages from a 2.5 hp motor upward (P-4).
- **Trailer open**: NOT PERFECT. The chapter opens on a refusal box, "Nothing from GFAB Trailers is made for this boat", before the trailer that IS made for it, which sits 190 px lower (P-5).
- **Trailer popup**: NOT PERFECT. Same repeated note pattern as the motor popup.
- **Dealer fit open**: NOT PERFECT. Four package rows with **no figure and no affordance**. The only price control is "Choose its price" by the group name (P-3).
- **Dealer fit popup (1,576)**: NOT PERFECT. (a) The note "The price list does not list it for this boat" stands above the first four rows, which ARE listed for this boat. The rows it means start at row 5, which is indented 2 px with a left rule (P-9). (b) The find placeholder says "A name, a code, a power", but packages have no power. (c) "The first 400 are shown."
- **Column at its foot**: PERFECT. "Browse all 2,238 in the chandlery", the rigging-kit sentence, then the summary door.
- **Summary (wheel)**: NOT PERFECT. Fills 1440x900, as he asked. But (a) "Highfield Sport 600" is said three times on one screen (title, under the customer's name, first line). (b) The contact line typed in the bar is missing from the FOR card. (c) With 3 lines the list card has 70 px of empty white above its bar. With one line (an unnamed quote) it has 270 px (P-10). (d) "Send" exists only after giving, which is honest, but he asked for "print and send", and nothing on the page says email comes once it is given.
- **Back up**: PERFECT. It lands on the Trailer chapter it left, and the bar now shows the name and contact.

### /quote/$id at 1920x1080

- **Top**: NOT PERFECT. The same SP300 and thumbnail faults. Otherwise the best frame of the set: photo 976x578, specs and total aligned to it.
- **Summary**: NOT PERFECT. The photo is cropped to 967x890 from a 1280x854 file, so it is drawn at 1.04x and is soft. The list card has 250 px of empty white (y=780 to 1030) above the bar.

### /quote/$id at 834x1112

- **Top**: NOT PERFECT. (a) The floating total (600x158 at 32,942) sits on the model grid and covers the prices of SP300, Sport 330, Sport 460 and Sport 600 (P-1b). (b) A 345x90 empty white area under the 4 spec tiles beside the photo. (c) A 50 px empty band between the rule and the search label.
- **Specs open**: NOT PERFECT. The 14 rows push past the photo's foot, and the floating total covers "Boat Registration" and the search field.
- **End of the page**: NOT PERFECT. No summary (P-1). The shell's pill floats over the hull row and "The hull" peeks out above and below it.
- **Summary (door)**: NOT PERFECT. Taller than the window. The list starts at y=950 and the bar is off-screen.

### /quote/$id at 390x844

- **Top**: NOT PERFECT. The floating total is 358x162 and, with the 46 px tab bar, covers 230 of 844 px (27%) of every frame. In the motor chapter it covers the third motor card (P-1b). The "/" key hint shows on a phone.
- **Hull header**: NOT PERFECT. "Highfield Sport 560 · PVC · White / White / White/Blue ·" breaks with a dangling middot.
- **End of the page**: NOT PERFECT. Below the summary door come the boat's spec tiles and the total, so the specs that belong under the photograph close the page (P-15).
- **Motor popup**: NOT PERFECT. The find placeholder is cut to "A name, a code, a pow" (a truncation the rulers should catch). 350 px of heading and sentence come before the first card.
- **Lightbox**: NOT PERFECT. The photo is drawn at 342 px, no larger than on the page, so the press gains nothing.
- **Summary (door)**: NOT PERFECT. It runs two screens and more, and the Give button sits at y=630.

### New quote (start)

- **Home of New quote, 1440**: NOT PERFECT. "What are you selling? A boat, or a motor, a trailer or a part on its own." But the first screen shows only boat makers, and the field says "Search every boat". The Highfield card's caption is "ADV9", a file code. Stacer is the only card with a cut-out picture on white, stretched over two columns, so the grid looks unfinished.
- **Scrolled to trailers**: NOT PERFECT. Picture treatments are mixed: cut-outs, one photo (GFAB) and one empty tile (Dunbier/Haines BMT, a truck glyph on blue). The left column is empty apart from the word TRAILERS.
- **Highfield, Sport 560 chosen**: NOT PERFECT. "Start the quote" is pale and refused: "A quote is for one material and one colour, so choose a material above first." This is the choice he asked to move into the hull chapter (S-1).
- **Material chosen**: NOT PERFECT. The panel clips the spec values: "5.66 m / 382 cm / 581 kg" are cut in half at y=465 behind the material section (S-2). The chosen chip "PVC $41,340" draws dark blue on blue, which is unreadable. A line reads "Black / Black / Black · B–B–B · $41,340", and "B–B–B" is a file code.
- **Phone, material chosen**: NOT PERFECT. The colour chips have swatches and no names, and "W–W–WB" shows.

## The gaps, by area and severity

### page (/quote/$id)

- **P-1 · blocker** ("then scroll down and then see big summary"). Below a desk, scrolling never brings the summary. At 834 and 390, 24,000 px of wheel ends on the door row. The summary also needs more than one window there. The simpler fix: below a desk the summary is the page's last block, a window tall at least, and it is always rendered.
- **P-1b · major**. The floating total covers controls below a desk: model prices at 834 (600x158 over the grid) and a motor card at 390, where it takes 27% of the frame with the tab bar. At the sizes where it floats it should be one line (the figure and a chevron) and open on press.
- **P-2 · major** ("design that a bit nicer"). The specs are file labels and file units: Min/Max (the hp range), Shaft Lgth, Eng Configuration, Matrix, Model Code, "105 ltr", "90 HP", a unitless "1.35", "@ (DRY)". Say them as a person would ("Power 90–115 hp", "Shaft extra long"), merge Min and Max into one row, drop Matrix and Model Code from a customer-facing surface, and keep the photograph its height when the list opens (let the list scroll inside the card).
- **P-3 · major** ("make the finale section nicer", and the dealer-fit chapter). The dealer-fit rows carry no figure and no press-to-add cue. "Choose its price" is the only sign that a level is needed, so the chapter reads as a list of words. Each row should say its figure at the chosen level, or say in its own place why there is none.
- **P-4 · major** ("viewing all of the products … done nicely"). The popups repeat one sentence on every card ("Under the 90–115 hp this boat takes." about 205 times) and order by price from 2.5 hp. Group them under one heading per reason ("Made for this boat", "Smaller than this boat takes"…), say each reason once, and drop the notes from the cards.
- **P-5 · major**. The trailer chapter opens on a refusal for a group with nothing for this boat, above the recommended trailer. Groups with a fit come first, and an empty group is one line at the foot.
- **P-6 · major** ("so they can see differences in real time"). A colour press changes nothing on the stage. Each colour tile carries its own drawing. If the image ledger holds that drawing as this exact model in this colour, the stage should show it beside the photograph when a colour is chosen. If it does not, the stage should say once that the photograph is in the maker's finish. (The lightbox already says so, but nothing on the page does.)
- **P-7 · minor** ("the clicks and the animations when opening"). Opening a chapter scrolls the column while the panel expands, so for about 600 ms the pressed header moves under the pointer and the one above is cut at the column's edge. Scroll first and then expand, or keep the pressed header still.
- **P-8 · major**. In the hull grid: "SP300" is a file code among "Sport 330…". The thumbnails mix photographs, line drawings and the maker's mark, and the cards are unequal heights (68 to 105 px), so the grid looks unfinished. Name it as names.json does (or say why it cannot), and give the drawings and the mark one treatment.
- **P-9 · major**. In the dealer-fit popup the "not listed for this boat" note stands above the four rows that are listed. The note belongs over the first unlisted row. The find placeholder "a power" is the motor's wording.
- **P-10 · minor**. The summary says "Highfield Sport 600" three times, leaves out the contact line typed in the bar, and leaves 70 to 270 px of empty white in the list card above the bar at 1440 and 1920.
- **P-11 · minor** ("blurry"). The summary photo at 1920 is drawn at 1.04x its 1280 file. Offer the 2560 file at that width (sizes says 967 px wide, but the cover crop needs 890 px of height from 854).
- **P-12 · minor**. Stabicraft's bar shows the word "STABICRAFT" in small blue capitals, not its mark. Highfield shows a mark. Stabicraft's spec tiles have icons and Highfield's do not.
- **P-13 · minor**. Colour names break at their slashes on the hull tiles ("Black /" over "Black / Black"). Break between the parts, never before a slash.
- **P-14 · minor**. The RECOMMENDED motor card's amber ring reads as "selected" beside the blue ring for chosen. Mark recommended with the word alone.
- **P-15 · major**. On a phone the boat's specs card and the total come after the last chapter and the summary door, far from the photograph they describe.

### start (New quote, the picker, the shell)

- **S-1 · blocker** ("picking model color and all of that … done in hull section"). The picker still asks material, then colour, and refuses "Start the quote" until material is chosen. The hull chapter now does that job, so the picker should start the quote on the model alone and open the hull chapter for the rest.
- **S-2 · major**. Once material is chosen, the chosen panel clips its own spec values in half at 1440 (y≈465). The chosen chip "PVC $41,340" has dark-blue figures on blue. Lines show "B–B–B" and "W–W–WB" codes.
- **S-3 · minor**. On a phone, Find is last in the tab bar. He asked for it "before home".
- **S-4 · major** ("quotes are not just boats", "it just looks so half baked"). The first screen of "What are you selling?" shows only boat makers under "Search every boat". Motors, trailers and parts start below the fold. Captions use file codes ("ADV9"), and picture treatments are mixed (Stacer's cut-out over two columns, Dunbier/Haines BMT's empty tile).
- **S-5 · minor**. The "/" key hint shows at 834 and 390, where there is rarely a keyboard.

## What is perfect

- At a desk only the column scrolls, measured at 1440 and 1920, and a wheel over the boat moves nothing.
- Find comes before Home in the bar at 1440, 1920 and 834.
- The bar holds the maker's mark, the boat, its finish, the number, where it stands, who it is for and who prepared it. "Who it is for" left the column.
- Nothing stands under the photograph. The credit line and the "different outboard" honesty live in the lightbox's caption.
- The lightbox at 1440 and 1920, with focus returned on Escape.
- The hull chapter changes model, material (Highfield) and version (Stabicraft), and the total, the bar, the photograph and the specs follow in the same frame. Undo is offered in a toast.
- At 1440 and 1920 the summary rises over the build, fills the window exactly, and a wheel up returns to the chapter left.
- No picture is drawn past its pixels on the build page at any size measured.
