# Is it still bland? The second fresh critic's reading (2026-09-29)

One question, asked of the built app and nothing else: would the owner, who said on 2026-09-24 "components are so bland and boring…" and "tech stack looks SO BORING", still say it?

**How this was read.**

- `npm run build`, then `npx vite preview --port 6295`, driven in Chromium through Playwright at 1440 × 900, 834 × 1112 and 390 × 844, in a browser profile with nothing in it.
- **One sale walked from the door to the paper:**
  - a desk name at Entry ("Test Desk"), and the Master Price File loaded
  - New quote, then Stacer, "519", and the 519 Sea Ranger SDF · Centre Console
  - Start the quote, open Motor, put the F115LB on and take it off again
  - Trailer, Dealer fit, a customer typed and addressed ("Jordan Test")
  - the finale, Give it to the customer, then Open the document
  - Make a new version and See what Trade does
- Every other door opened at 1440, and most at 834 and 390: Quotes and its peek, History, Customers, Data and its spread, the Stacer sheet, the finder, /kit and Lost.
- **Presses and hovers** were read from computed style with the mouse held down.
- **Focus** was read by a Tab walk on six screens.
- **Reduced motion** was emulated.
- **The price** was sampled on every animation frame after each change.
- **Typing** was watched every 16 ms for running animations and changing transforms.
- **Route changes** were caught frame by frame.

## The verdict

**Mostly no. He would not say it at the door, on Home, on the picker, the cascade, Customers or the paper. He would still say it in one place, and it is the one that matters most: the build, once he opens a chapter past the motor, and at the moment he gives the quote.**

What changed since the first critique, and what is real:

- **Photographs travel.** The picker's photograph flies onto the build's stage, and the stage becomes the paper's cover by a View Transition (frames at 80–300 ms). The paper's cover is now the boat, not the maker's logo.
- **Motors are photographed tiles.** Each carries "90 hp · 162 kg · 20″ shaft" and its price chip. The undo toast answers every pick ("Yamaha F115LB put on the quote · $16,667 · Undo").
- **Presses give everywhere they were measured.** The act, the door, the maker card, the chapter head and the option tile each lift 1 px on hover and give on press (.97, .985 and .99). Nothing moves under reduced motion.
- **Colour does work.** The kind inks on the chapter discs and Home's six figures, the state inks on Quotes and History, the navy bands on Customers, and the amber act as the one loud thing.
- **The water moves** on Entry's flag and Home's band, and stands still under a caret and under reduced motion.
- **The price never moved.** On the picker's plate ($32,190 → $30,910) and on the build's total ($55,223 → $71,890 → $55,223) it changed in one frame every time.
- **Focus is visible.** The Tab walks on Home, the picker, Quotes, Customers, History and Data found no stop without a ring.

What is still wrong:

- **One real blocker on the rules:** the build's chapters turn and grow while a caret is in its search field.
- **The build past the motor tiles is still text in boxes:**
  - part codes in rows
  - four lines of rigging-kit prose on every motor tile
  - chapter summaries that lead with codes
- **The finale is three numbers and a paragraph,** and its seal is a 72 px rosette that is done in under half a second.
- **The bolder tech is present but mostly out of sight.** Of the plan's named effects, only the progressive blur is ported.

## Findings, most severe first

### Blockers

**1. The build's chapters move while a caret is in its search field.** (configurator, 1440)
- **What happens:** "F115" was typed into "A name, a code, a rigging kit" with the caret held in the field the whole time (`document.activeElement` was the INPUT on every sample).
  - Two chapters' chevrons rotated through 26 intermediate transforms.
  - Their accent bars scaled through 25 intermediate transforms (`scaleY` 0 → 1).
  - Both ran over 441 ms as the search opened the chapters that match.
- **Cause:** `.cfg-head__chev` and `.cfg-chapter::before` carry `transition: transform var(--duration-travel) var(--ease-spring)` (`src/screens/configurator/configurator.css:933` and `:950`).
  - They are cancelled only inside `@media (prefers-reduced-motion: reduce)` (`:1820–1821`).
  - `:root[data-still]`, MotionRoot's caret gate, cancels only the chapters' rise (`:1812`).
- **Measured clean elsewhere:** under reduced motion the same press and the same typing gave 2 states, a snap. Typing in Home's search, the picker's, Data's, Customers' and the sheet's moved nothing.
- **Fix:** add the two transitions to the `:root[data-still]` rule.

**2. The build, past the motor tiles, is still the database.** (configurator, 1440 / 834 / 390)

This is the screen the owner sells on, and the one he would name.

- **Chapter summaries lead with codes:**
  - "chosen: TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m · 1 to choose from"
  - "chosen: Yamaha/Stacer · 704-6Y82L-22-07 · Binnacle Mount Rigging Kit · 6 more offered"
- **Dealer fit is rows of part codes:** "Battery Terminals · 1 pair 23211 +$18", "10 Pin Main Harness (2.0M) · Extension 688-8258A-10 +$123", "110016 · D Shackle · 10 mm Galv +$3". They have no glyph and no picture, and the unpriced rigging kits end on "—".
- **Every motor tile carries the rigging kit as prose under its facts**, for example "Rigging Kit Option Mech Rigging Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables & Filter · Prop Part No. 6FP-45943-00 · Prop Description Propeller · Aluminium SDS GP K Series · 15"".
  - That is two lines at 1440 and five at 390, where it is taller than the photograph.
  - /kit's "THE BUILD" specimen draws the same six Yamahas as compact tiles, two to a row, under horsepower chips ("90 hp 2 · 115 hp 2 · 130 hp 1 · 150 hp 1") and "02 / 03 Motor" dashes. The build draws one wide tile per row, with no chips and no dashes, so /kit still promises a richer build than the build is.
- **The head says an engine sentence beside the total at every size:** "4 lines, each at the price it was picked at · 1 of them is not priced on this quote".
- **Fix:**
  - Give the engine's words to the build's "for the workshop" note and to the paper's rail, and let the tile say the motor.
  - Put the kit's hp chips and dashes on the build.
  - Draw part rows with their kind's glyph and a name first, code quiet.
  - Summarise a shut chapter the way a person says it (the paper already says "Yamaha F90LB · Includes pre-delivery").

### Majors

**3. Giving the quote still does not land.** (configurator, 1440 / 390)
- **The press is good:** the act gives to .97.
- **The moment is small:** the Lottie seal is drawn in a 72 × 72 box beside "Given to Jordan Test". Frames at 100, 250 and 450 ms show it stamped by 250 ms and at rest by 450 ms.
- Nothing else on the screen answers. The total stays, the stage photograph stays, and the head's dot turns from rose to leaf.
- The finale around it is "LINES 4 · NOT PRICED 1 · TOTAL $55,223", a paragraph about tax and two notes.
- This is the one moment the sale exists, and the plan names it as the place for an authored moment. It reads as a sticker.

**4. After "Start the quote", the plate draws an act over the price that says something false.** (picker, 1440)
- For the crossfade after the press, the act re-labels itself "Open the draft already standing". It widens left over the price: at 80 ms, the act's left edge is at x 1041 and the price's right edge at x 1053, so "$30,910" is cut to "$30,91".
- Under it the plate says "A draft for this boat is already started with nobody named on it, so this reopens it rather than starting a second."
- That sits directly above "Quote 20260929-03 is started — opening the build."
- Caught frame by frame on a boat with no draft (the Side Console). The route had already changed, so the old snapshot carries the stale state.
- **Fix:** freeze the plate's act for the press that started the quote.

**5. The pill's lit capsule drops out of the pill on the way to the paper.** (build → document, 1440)
- From a build scrolled 362 px to its finale, "Open the document" was pressed.
- At about 90 ms the lit "Quotes" capsule stood detached about 35 px below the pill, and the Quotes door in the pill was unlit. At 140 ms it snapped back. The first capture, from the same press on a longer scroll, showed it 135 px down.
- The capsule's travel is measured across the scroll change, so it animates from a place it never was. It spoils the one transition that works best (stage to cover).

**6. The bolder tech is present but mostly out of sight.** (every screen)
- **Adopted, counted in `src/` without tests:**
  - motion in 17 files, Phosphor in 38
  - NumberFlow in 1 wrapper
  - GSAP in 1, Lenis in 1, lottie-web in 2
  - View Transitions in 15, WebGL in 1
- **Where it reaches the eye:**
  - the water on 3 screens (Entry's 240 × 174 flag, Home's band, /kit)
  - a 72 px seal
  - an accent arc round a 44 px chapter disc
  - wheel smoothing
- **Of the plan's named magicui and reactbits effects, only the progressive blur is ported.** There is no text reveal, shiny or gradient text, spotlight or tilt card, marquee, border beam, animated beam or dock. `grep` finds none of them in `src/screens` or `src/ui`.
- **Places they would earn their keep without faking a figure:**
  - Home's seven maker marks, which are still not doors
  - the picker's maker cards
  - the act that is ready to give
  - the cascade's change travelling from Trade to its lines
- "Tech stack looks SO BORING" is half answered: the stack is bold, but the screens mostly do not show it.

**7. "I want the logo to be the showpiece thing" cannot be met yet.** (entry, home, paper)
- The showpiece is Northside's name set in letterspaced type on live water.
- Entry says under it: "The name is set in type because Northside Marine's own mark has not been added yet. Nothing stands in for it."
- There is no settings or admin route: `src/routes` holds customers, data, history, index, kit, quote, quotes and sign-in. So Northside has nowhere to add its mark.
- The water is honest and well made. The owner's request needs the place to put the mark before any more craft on the type.

**8. On a phone, a third of the build is chrome, and a pressed chapter opens out of sight.** (configurator, 390)
- **The chrome:** the build's sticky head (`cfg-mast`) is 193 px of 844: the reference, the name, the model, the total and the engine sentence. With the foot pill, about 30% of the screen is chrome.
- **The press:** pressing "02 Motor" opened it where it stood, with its head at the foot under the pill and its tiles below the fold. Nothing brought it into view.

**9. Customers says nothing was given to a customer that History says was given.** (customers, history, quotes)
- After 20260929-01 was given to Jordan Test and a new version made:
  - Customers reads "WRITTEN 2 · GIVEN 0 · GIVEN, IN ALL $0" for Jordan Test.
  - History reads "1 given $55,223" and "1 given to a customer · $55,223 given, as printed on their sheets".
  - The Quotes peek of -01 says it "is still the document they hold".
- One of those figures is wrong, and it is Customers'.

**10. Quotes says its counts twice, and its photograph is about a different quote from the one pressed.** (quotes, 1440 / 390)
- **The register:** 13 px rows under DRAFT 2 $109,166 · ISSUED 0 · SUPERSEDED 1 $55,223.
- **The panel beside it** repeats the same three counts and the same sums in three tinted tiles, each about 175 px tall, holding one figure and one line.
- **The photograph:** with -01 pressed and its peek open, the photograph under the register still names "DRAFT … the hull on 20260929-03 $53,943". So two quotes and two totals are on screen at once.

### Minors

11. **The build's toast lies over the rail at 1440.** "Yamaha F115LB put on the quote · $16,667 · Undo" covers Dealer fit's "Not priced on this quote" and its chevron (known; left open by the verify round).
12. **The chosen motor's price chip reads "−$14,330 $14,330 at Cash".** A minus sign on the thing the dealer chose reads as a discount.
13. **The picker's tick disc sits half on the photograph's corner and half off the plate**, an empty ring on every tile (minor 17 of the first critique, still open).
14. **The picker's search results leave most of the list empty at 1440.** "519" finds 7 models in 7 series, so each tile stands alone on its own series row.
15. **The trailer is named code first** on the build, the finale's notes, the cascade and the paper: "TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m".
16. **History's fortnight draws the same photograph twice side by side** (the 519 for "20260929-03" and for "Jordan Test"). Its closing paragraph is cut in half at the scroller's foot at 1440.
17. **The peek's dates break at the hyphen:** "10 minutes ago · 2026-" / "09-29" (minor 19, still open).
18. **The refused act is a muddy ochre** (minor 18). The crest is a helm glyph on /kit and "NM" elsewhere (minor 21). The finder's boat rows carry no thumbnail (minor 20).
19. **There is no favicon:** `/favicon.ico` is a 404 and `index.html` declares no icon, so Northside's tab wears the browser's blank.

## Where first

1. **Blocker 1.** Two transitions in `configurator.css` belong under `:root[data-still]`. It is one rule.
2. **Blocker 2 with major 3, the build and its finale.**
   - Move the engine prose off the tiles and the chapter heads.
   - Bring /kit's hp chips and dashes to the motor chapter.
   - Give the part rows their glyphs.
   - Make giving the quote a moment the whole screen answers, not a 72 px stamp in the rail.
3. **Majors 4 and 5, the two transition glitches on the sale's own path.** The act drawn over the price at Start the quote, and the capsule dropping out of the pill on the way to the paper.
