# Is it still bland? A fresh critic's reading (2026-09-28)

One question, asked of the built app and nothing else: would the owner, who said on 2026-09-24 "components are so bland and boring…" and "tech stack looks SO BORING", still say it?

**How this was read.** `npm run build`, then `npx vite preview --port 6291`, driven in Chromium through Playwright at 1440 × 900, 834 × 1112 and 390 × 844. One sale walked from the door to the paper: a name at Entry, the Master Price File loaded, New quote, Stacer, "519 Sea Ranger", the Centre Console chosen, Start the quote, a second motor picked and undone, the customer named, the finale, Give it to the customer, Open the document, then Make a new version and See what Trade does for the cascade. Every other door (Quotes and its peek, History and its fold, Customers, Data and its spread, the sheet, the finder, /kit, Lost) opened at all three sizes. Presses and hovers were read from computed style, focus by keyboard Tab with `:focus-visible` confirmed, reduced motion emulated with `emulateMedia`, and the price sampled every 40–50 ms after each change. The only name typed was a test customer in this browser profile, not the owner's.

## The verdict

**Yes, he would still say it, and he would say it first on the build.** The kit is good, but the working screens use the thin half of it. The richest pieces in `src/ui` are drawn only on /kit:

- the photographed `OptionTile`
- the horsepower chips
- `Dashes`, `Stat`, `Toggle`, `Tooltip` and `Menu`
- a raised toast

Counted in `src/screens` outside `/kit`, each of those is imported by 0 screens.

So /kit shows the Yamaha F90LB as a photographed tile with "90 hp · 162 kg · 20″ shaft" and its price chip. The build shows the same motor as a paragraph of rigging-kit text in a row.

Three other things weaken what did land:

- On a phone the boat's photograph is 1,499 px down the build, below every chapter.
- The picker's photograph is meant to become the paper's cover. On the paper it becomes the maker's logo on a pale box, and the paper says "no copy of it is held here".
- Giving the quote, the moment the sale exists, is a dot turning green.

What does work:

- **Colour.** The kind inks on the chapter discs, the Quotes register's rose, leaf and graphite states, and the cascade's fates.
- **Icons.** Phosphor sits beside nearly every act and fact, 37 files where there was 1.
- **Movement.** The pill's travelling capsule, Data's page turn, History's first paint and the picker's mark flight.
- **The price never moves.** Sampled on the picker's plate, the build's total, the finale, History and the Quotes register, it changed in one frame every time.
- **Nothing moves while typing.** 0 running animations while typing in the build's name field; the water held under the caret.

These are real, and they are why this is not the app of 2026-09-24. But the owner judges the screens he sells on, and those still read as text in boxes.

## Findings, most severe first

### Blockers

**1. The build: the kit's richest components are not on the screen where the sale happens.** (configurator, 1440 / 834 / 390)
- **What /kit's "THE BUILD" specimen draws:**
  - motors as `OptionTile`s with their held photographs, from the ledger's `f90-product-colour-…webp`, `f115-grey-white-…webp` and the others
  - hp · kg · shaft facts
  - filter chips by horsepower with a glyph ("90 hp 2", "115 hp 2")
  - a price chip
  - "02 / 03 Motor" dashes
- **What the real build draws, in the motor, trailer and dealer-fit chapters:** rows of engine text ("Rigging Kit Option Mech Rigging Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables & Filter · Prop Part No. 6FP-45943-00 …"), with no picture and no facts.
- `Configurator.tsx` imports `Button, Field, Icon, Input, Kbd, KindMark, PriceFigure, Swatches, Tile`. It does not import `OptionTile`, `Dashes`, `Chapter`, `Segmented`, `Stat` or `Plate`. The verify round recorded the richer `OptionTile` as "asked for and not made".
- On a phone the stage photograph is at y = 1,499 of a 2,375 px page (measured), so the first two screens of the build are text rows.
- **Fix:** use the kit's photographed option tile for motors, where the ledger holds the picture, and keep the engine's words as the tile's second line. Put the stage above the rail in a hand.

**2. No visible focus on row tiles or on any refused control.** (configurator, picker, customers, kit)
- **Measured by keyboard Tab** (`:focus-visible` true; `box-shadow: none`, `outline-style: none` on the element, its `::before` and `::after`, and its frame):
  - the build's option rows ("Yamaha F115LB, not on the quote")
  - the picker's maker rail ("Formosa, 39 models")
  - Customers' quote cards
  - the refused act "Give it to the customer"
  - /kit's refused accent chips, Amber and Carmine
- **Cause:** the same specificity, later in the file, cancels the focus rule:
  - `.ui-tile[data-shape='row'] { box-shadow: none }` against `.ui-tile:focus-visible`, both (0,2,0), in `src/ui/tile.css`
  - `.ui-button[aria-disabled='true'] { box-shadow: none }` and `.ui-button[data-intent='act'][aria-disabled='true']` in `src/ui/button.css`
  - `.ui-chip[aria-disabled='true']` in `src/ui/chip.css`
- The refusal rule keeps a refused control focusable so its sentence can be read. The ring disappears on exactly that control.
- **Fix:** add `:not(:focus-visible)` to those three `box-shadow: none` rules, or raise the focus rule's specificity. Add a ruler that Tabs through every screen and fails on a focused control with no ring.

**3. The same photograph is "held" on four screens and "not held" on three.** (document, cascade, customers)
- **Where it is drawn:** the Stacer 519 Sea Ranger SDF's own photograph, `hero-images/stacer-519-sea-ranger-4ea6e75c-1280.webp`, on the picker's plate, the build's stage (v1 and v2), Home's second card and the Quotes register.
- **Where it is said to be missing:**
  - the cascade: "No picture of this boat is held yet, and nothing stands in for one. Above it, Stacer's own mark". At 390 no mark is drawn above it either.
  - Customers' "Their quotes": "no photograph held", on both versions
  - the paper's desk note: "The row names a picture and no copy of it is held here"
- **The customer's paper prints Stacer's logo on a pale blue box as its cover** (`data-art="mark"`).
- **Cause:** `src/screens/document/art.ts` reads only `seed-images` and never the heroes ledger. The cascade's `ground.ts` and Customers resolve this boat differently from `configurator/stage.ts`.
- So the plan's one choreography, picker photograph → stage → document cover, ends on a logo for this boat, and three screens say something untrue.
- **Fix:** one picture reader for every screen, the paper included.

**4. A primary button still moves under reduced motion.** (entry, kit, every primary)
- With `prefers-reduced-motion: reduce` emulated, "Open the paper" on /kit reads `transform: matrix(1,0,0,1,0,-1)` on hover and while pressed, and keeps its 100 ms transform transition.
- **Cause:** the fine-pointer hover rule `.ui-button:is([data-intent='act'],[data-intent='primary'],[data-intent='veiled']):not([aria-disabled='true']):hover`, at (0,4,0), outranks the reduced-motion `.ui-button:not([aria-disabled='true']):hover { transform: none }`, at (0,3,0).
- It is one pixel, and it is still movement the contract removes.

**5. Home is still the old room, and it opens on every visit after the first.** (home, 1440 / 834 / 390)
- Typed "→" arrows on New quote and on both cards, six file counts set as plain text, and keycaps ("Ctrl K", "/") drawn at 390, where there is no keyboard.
- The round deferred Home to `hl2-home` on purpose. It is still the second thing the owner sees, and he would name it.

### Majors

**6. The press never sinks on the three intents that matter.** (every screen with an act or door)
- With a mouse held down on Entry's "Load the Master Price File" (primary) and on the finale's "Give it to the customer" (act), `:active` is true and `transform` stays `translateY(-1px)`. Only the shadow changes.
- **Cause:** the same (0,4,0) hover rule beats `.ui-button:not([aria-disabled='true']):active { transform: scale(0.97) }`, at (0,3,0).
- /kit draws "pressed" as a frozen specimen at .97 that the live button never reaches, so the component language's headline claim is false with a pointer.

**7. The WebGL water is effectively never seen.** (entry)
- It lives on Entry's 192 × 144 flag, drawn at 96 × 72, and on /kit.
- **Entry autofocuses the name field, and the water holds still under a caret.** With the caret in the field, 0 bytes of the flag changed over 700 ms. Once the field was blurred, 7,638 of 7,726 changed. The field holds the caret from arrival until the file is read, and the screen is seen once.
- Running, it is a faint diagonal sheen behind two letterspaced words.
- "I want the logo to be the showpiece thing" is not met: the showpiece is a small pennant that shows no motion at a desk.

**8. Giving the quote has no moment.** (configurator)
- Pressing "Give it to the customer" turns the masthead's dot green and prints a step line ("20260928-01 is issued"), and the act becomes "Open the document". The masthead also grows an "Open the document" row, so the page drops 28 px under the pointer at the press.
- There is no authored moment: Rive and Lottie are not installed, and the plan named "the quote being issued" as the place for one.

**9. The build's step line moves the page under a press.** (configurator)
- Picking the F115LB inserted a 56 px step line above the chapters. The hull chapter's head moved from y = 335 to y = 391, and the pressed row moved about 126 px with the added "2 lines from Yamaha Outboards…" sentence.
- The Toaster is mounted and no working screen raises it. This is the place the plan's "toasts with UNDO" belongs.

**10. A typed customer name is dropped without a word.** (configurator)
- Typing "Jordan Pike" in Who it is for, then pressing Tab and opening The finale, left the field empty. The finale then refused: "This quote is addressed to nobody."
- The name only lands through "Address this quote". Closing the chapter throws a typed name away silently, which is the opposite of the app's rule that a refusal is a sentence where it happens.

**11. Loading the file does not land as a moment.** (entry)
- While the file is read, the door goes navy with the kit's warning glyph and "The Master Price File is being read now." under it. A progress state is drawn as a refusal.
- The two steps that actually tick sit in the bottom-right corner, about 600 px from the door.
- The pill is then drawn over Entry's "Master Price File · packed…" stamp for a moment (known, and still there).

**12. NumberFlow, Lenis and GSAP are still mostly installed, not adopted.**
- **NumberFlow:** the `Figure` in `src/ui` reaches only Home's search count and /kit. The cascade's `Figure` is a local function (`Cascade.tsx:950`) that does not animate, so `components.md` is wrong to say the cascade draws it.
- **Counts that change in front of the reader stay static:** the picker's "2 models match from Stacer", the build's "4 of 209 paired with this hull", the pill's counts and the Customers header.
- **Lenis:** /kit only.
- **GSAP:** one reading ring on the build.

**13. History's showpiece is an empty plate, and it cuts off the one word that matters.** (history, 1440)
- The "last fourteen days" is a white plate of about 1,000 × 430 px holding one day's name, one boat, one person and five dots, beside a dashed box.
- The day's line truncates "issued" to "issu…", and to "iss…" with the fold open.

**14. Data truncates at 1440 and uses different words from Entry.** (data)
- The "where from" column is cut on six rows ("Motor Module · sheet "Motor Library" (header row 4), rows 5…").
- Also cut: the shelf's "Haines Signature Factory P…" and "OBSOLETE Trailers — No Lo…", and the spread's "ASSAULT PRO (TOURNAME…".
- The head reads "53 TABLES · 15,691 ROWS" where Entry and Home say "53 lists · 15,691 lines".

**15. Scrolled content passes under chrome with no edge** (known, still open). (picker at 834, configurator)
- At 834 the picker's series label and a tile's disc show through under the pill.
- The build's sticky search cuts "PRE-DELIVERY INCLUDED" in half at its lower edge.

### Minors

16. **Entry:** the computed scrim behind the photograph's caption is a visible hard-edged rectangle, about x 822–1404 and y 90–365 at 1440. It reads as a box laid on the picture.
17. **Picker and /kit:** the tick disc sits half on the photograph's corner and half on the plate's edge, an empty ring on every tile, and reads as misregistered.
18. **The refused act** is drawn in a muddy ochre (`--color-act-refused`) that reads as soiled rather than waiting.
19. **The Quotes register's peek** breaks its dates at the hyphen: "3 minutes ago · 2026-" / "09-28".
20. **The finder's rows are plain text:** boat rows carry no thumbnail though the pictures are held, and quote rows carry no state dot.
21. **The crest changes identity:** "NM" on most screens, a helm glyph on the paper at 390 and on /kit.
22. **The pill's lit capsule**, mid-travel, covers the next door's word ("Hom") and dims its count for a frame.

## Where first

1. **Blocker 1, the build.** Motors with their photographs, from the tiles /kit already draws; the stage above the rail on a phone; the step line as a toast.
2. **Blocker 3, one picture reader.** So the paper's cover is the boat and no screen says a held picture is missing.
3. **The focus and press specificity.** Blockers 2 and 4 and major 6 are three one-line cascade errors in `src/ui`, and they sit under every screen.

After that, Home is the next round's. A "given" moment and water that is actually seen moving are the two showpieces still owed.
