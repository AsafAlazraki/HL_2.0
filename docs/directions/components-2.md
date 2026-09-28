# The component language, verified again (2026-09-29)

The owner, 2026-09-24, in the browser: "components are so bland and boring…", and the same day "tech stack looks SO BORING". The first verified kit was read on 2026-09-28 by a fresh critic (`components-critique.md`), who said he would still say it, and first on the build:

- the kit's richest pieces were drawn only on /kit
- one boat's photograph was "held" on four screens and "not held" on three
- the ring and the press were cancelled by three cascade errors in `src/ui`
- Home was the old room
- the libraries he named were still mostly installed, not used

Eleven fixers answered its five blockers, its ten majors and two of its seven minors (`docs/DECISIONS.md`, 2026-09-28 and 2026-09-29). This page is the second verifier's. It covers:

- what this round changed
- the gate, alone, on the final tree
- the libraries, counted as adopted and not only installed
- the frame rates
- per screen, what the language changed

The photographs are `docs/directions/<screen>/built/<screen>-1440x900.png` and `-390x844.png`. They were taken on the final tree's build under the shot recipe: reduced motion, the clock pinned, every picture decoded, and the catalogue read landed before the shot.

## The gate, alone, on the final tree

Nothing else ran beside it. One thing had been running for a long time: a `find / -maxdepth 6 -path *hl2-components*` left by an earlier agent of this workflow. It had been spinning one of the desk's four cores since 17:34 on 2026-09-28, so every fixer's private gate ran under it. It was stopped ten minutes into the first e2e reading, with 16 idle `grep`s. Seven `vite` servers left behind by the same run had been stopped before the gate began.

**`npm test`, final tree**: 230 test files, 3,798 tests, 16 static rules, no failures, 247 s wall. The first reading, on the tree the fixers left, was the same counts in 311 s.

**`npm run build`**: green in 3.8 s, with one warning. The `ui` chunk is 501,890 bytes, 1,890 over Vite's 500 kB line (156 KB gzip); it was 280 over on 2026-09-28. The build is 2.57 MB of JavaScript in 67 chunks and 400 KB of CSS.

**`npm run e2e`, first reading** (the tree the fixers left): 1,620 tests, 1,201 passed, 413 skipped by design, 6 failed, 85.9 minutes with 2 workers.

- **Four were real reds on the sheet**, from the focus ruler the fixers ran on their own screens only. At 390 and 1440:
  - the Pictures door's seven cards "without a picture" showed no ring, because a bare card's `box-shadow: none` at (0,3,0) took off the ring at (0,2,0)
  - the price list's rows scroller was a Tab stop of its own after the grid, with no ring. Chromium makes a scroller with nothing focusable inside it a Tab stop.
- **Two were the Customers flow's quote-card colours at 1440 and 1920**, a two-minute timeout pressing "Address this quote".
  - Re-run alone with `--last-failed --timeout 120000 --workers 1`: the four sheet cases passed on the fixed tree and 1440 passed (5 of 6), but **1920 failed again alone**.
  - So it was not the machine. Replayed on the ADV7 at 1920 × 1080, the red held 3 of 3.
  - A caret arriving while a chapter was still opening stopped its height where it stood. "Who it is for" was pressed and the name typed at once, as `issueIt` does. The chapter stayed open with its body folded to a sliver under the finale's head.
  - The kit's `Chapter` primitive carried the same error.
- All three were fixed at their cause (below). A new flow case pins the chapter at six sizes: it failed 6 of 6 on the old build, 172 to 311px short, and passes 6 of 6 now.

**`npm run e2e`, second reading, on the final tree**: 1,626 tests, 1,213 passed, 413 skipped by design, **0 failed**, 84.8 minutes with 2 workers, alone.

- contrast: 218 readings by day and by night, 0 below threshold
- cut: 90 readings, 0 cut
- focus: 40 Tab walks, 825 stops, every one read focused and unfocused, 0 without a ring
- the refusal, overlap, ramp and density rulers: all passed

## What this verify round changed

Every change to a primitive that the eleven fixers' reports asked for, made once in `src/ui`:

- **/kit's frozen press gives a chip tile .96, the live chip's own press** (`src/ui/tile.css`). It drew the card's .985, a state the live chip never reaches. It was the only such ask.

The gate's real reds, fixed at their cause:

- **A chapter pressed open and typed into at once opens to its whole height.** The build's chapter body (`Configurator.tsx`) and the kit's `Chapter` (`src/ui/Chapter.tsx`) now always animate to `{ height: 'auto', opacity: 1 }`. Under a caret or reduced motion the height lands at once and only the opacity fades, as the kit's rule already said. Pinned by `configurator.spec` "a name typed the moment its chapter opens lands in a chapter open to its whole height", walked on the ADV7.
- **The sheet's cards with no picture wear the ring inward, and the grid is one Tab stop** (`sheet.css`, `Grid.tsx`). In a hand a bare card keeps its 8px of inline padding, so its name and arrow stand 8px in from the rules.

Asked for and not made, each with its reason (`docs/DECISIONS.md`, 2026-09-29):

- moving the stage, the picker, Home, Quotes and the sheet onto the one picture reader
- moving the toast off the rail's corner at 1440
- tidying transitions that still list `transform`
- Entry's own reduced-motion rule
- the picker plate's inner scroll edge

## The libraries, adopted and not only installed

Counted on the final tree: files under `src/` that import the library, tests left out. The bundle is read off a source-mapped build of the same tree: every minified byte is attributed to the package its source map names. The gzip figure is that package's code compressed alone, so it slightly overstates what it adds to a chunk.

| | files importing (2026-09-24 → now) | where it earns its place | added to the build | loaded |
|---|---|---|---|---|
| `motion` | 1 → **16** (8 screens, 8 in `src/ui`) | the one motion gate (`MotionRoot`: reduced motion and a caret); springs read from the tokens; the pill's travelling capsule; a chapter opening by height; register rows travelling when the register changes shape; History's fold; the sheet's thumbs | 137.4 KB min, 45.9 KB gzip (motion-dom 98.7, framer-motion 36.9, motion-utils 1.8) | `ui`, every screen; 11 KB more in the sheet's chunk |
| `@phosphor-icons/react` | 1 → **38** (27 in screens, 11 in `src/ui`) | a glyph beside the word on every act, door, chip, band head, fate, fact and kind of sentence; one table per screen (`glyphs.ts`) | 308.4 KB min, 72.9 KB gzip; every glyph module carries all six weights | 46 KB in `ui`, the rest per route |
| `@number-flow/react` | 1 → **1**: the `Figure` wrapper, drawn by **7** files | the pill's three counts on every screen but Entry, the picker's matches, the build's lines and counted lines, Customers' head, Home's search count, `Stat`. They roll on the travel spring when a press changes them and stand still under a caret or reduced motion. The price never uses it. | 17.1 KB min, 5.8 KB gzip | `ui` |
| `gsap` + ScrollTrigger | 0 → **1**: `src/ui/scroll.ts`, used by the build and /kit | the build's reading ring, whose accent arc runs round the disc of the chapter the window is in, as far as the window is through it; /kit's dashes | 110.2 KB min, 42.9 KB gzip | only the `scroll` chunk (133.8 KB, 50.3 KB gzip with Lenis), fetched by `/quote/$id` and `/kit` |
| `lenis` | 0 → **1**: `src/ui/scroll.ts`, used by the build and /kit | the wheel smoothed on a fine pointer; never on touch, under reduced motion, with a caret in a field, or while a dialog locks the page | 18.2 KB min, 5.3 KB gzip | the `scroll` chunk |
| `lottie-web` (new this round) | 0 → **1**: `src/screens/configurator/stamp.ts` | the one authored moment, the seal a quote is stamped with when it is given. Its timeline is written in code from the same drawing as the still seal (`seal.ts`), in the kit's springs and inks. | 165.1 KB min, 46.0 KB gzip, and `seal.ts` + `GivenSeal.tsx` 3.6 KB | its own `stamp` chunk (169.4 KB, 47.6 KB gzip), fetched only by a draft's finale, never under reduced motion |
| `sonner` | 1 → **1**: the `Toaster`, mounted once | the undo toast, the kit's navy capsule. Raised by the build for every step with a way back, and by /kit. | 32.7 KB min, 9.1 KB gzip | `ui` |
| **WebGL water**, no library | `src/ui/water.ts`, drawn by `Water` and `Band` on **3** screens: Entry's flag, Home's band, /kit's band | Northside's name on live water ("I want the logo to be the showpiece thing"); a luminance cap keeps white at 5.8 : 1 whatever the accent | 3.4 KB min, 1.7 KB gzip | `ui` |
| **View Transitions**, the browser's own | the router crossfades every change of screen; shared names on **13** screen folders; `morph` for Customers, Data's `turn` and /kit | the picker's photograph → the build's stage → the cascade's card → the paper's cover (`cascade-1440x900-stacer519.png`, `document-1440x900-stacer519.png`); a maker's mark from its door to its boats and from Data's shelf into its spread; Entry's flag into the crest; a person's paper | `transition.ts` 2.2 KB, `route.css` | every screen |
| `cmdk` | 1 → 1 | the finder | 11.0 KB | `index` |
| `lucide-react`, Rive | 0 | Phosphor has had every glyph asked for. Rive's runtime is 94 KB of script and 360 KB of WASM, and its file needs an editor nobody here can author honestly. | 0 | none |

## The frame rate of each ambient effect, at 390 × 844

Only the water moves on its own. It stands on Entry's flag, Home's band and /kit's band. Lenis's frame loop runs only on a fine pointer, so never on a phone.

**How it was read:**

- Chromium at 390 × 844, a touch phone.
- Five seconds at 1×, then with the CPU throttled 4× by the browser's own tools (`Emulation.setCPUThrottlingRate`, what DevTools' "4× slowdown" sets).
- A control loop took 6–7 ms at 1× and 22–27 ms at 4×, so the throttle was on.
- For each: the page's frames a second, the worst 5% of frame gaps, and the water's own draws a second (a `drawArrays` counter installed before the app loads).
- The caret was let go first; nothing takes it on arrival any more.

| effect (canvas, drawn at half) | renderer | 1× | 4× CPU |
|---|---|---|---|
| Entry's flag, 176 × 110 (88 × 55) | SwiftShader, the gate's software GL | 60.2 fps, p95 16.8 ms, 60.2 draws/s | 60.3 fps, p95 16.7 ms, 60.3 draws/s |
| Home's band, 358 × 177 (179 × 89), **new this round** | SwiftShader | 60.0 fps, p95 16.8 ms, 60.0 draws/s | 60.5 fps, p95 16.7 ms, 60.5 draws/s |
| /kit's band, 358 × 160 (179 × 80) | SwiftShader | 60.1 fps, p95 16.7 ms, 60.1 draws/s | 60.4 fps, p95 16.8 ms, 60.4 draws/s |
| Entry's flag | Intel Iris Plus 655, Direct3D 11 | 60.1 fps, p95 16.7 ms | 60.3 fps, p95 16.8 ms |
| Home's band | Intel Iris Plus 655 | 60.3 fps, p95 16.7 ms | 60.4 fps, p95 16.7 ms |
| /kit's band | Intel Iris Plus 655 | 60.2 fps, p95 16.7 ms | 60.3 fps, p95 16.7 ms |
| Lost, nothing ambient, for comparison | both | 60.2–60.4 fps | 60.3–60.4 fps |

**The seal**, the round's one authored moment, is not ambient, but it is its bolder tech, so it was read the same way at 390 × 844 from the press for 2.5 s:

- At 1×: 60.0 fps, the longest frame 16.8 ms.
- At 4×: 53.6 fps over the window. Two long frames came straight after the press, 200 ms and 83 ms (the press's own write and the finale's re-render, then the player's first frame). Every other frame was at 16.8 ms or less.

A real phone's GPU was not measured.

## Per screen, what the language changed

The kit is board C, "Signal": colour and icon, blue and white, round white plates, the amber act as the one thing pressed, with board A's live water under Northside's name. Below is what it changed on each screen, and what this round (the critique's fixes) changed on it.

### Entry (`/sign-in`): `entry-1440x900.png`, `-390x844.png`

- **The language.**
  - The pennant is the kit's band on live water.
  - The card is a white `Plate`, and the no-password line is its pale well under an open lock.
  - The door leads with the file's drum and ends on a white disc.
  - The flag flies into the pill's crest on the route's crossfade.
- **This round.**
  - The flag is the showpiece and it moves. Nothing takes the caret on arrival: a press, a Tab or the first letter typed puts it in the field. The flag grew to 240 × 174 at a desk and drops from the rule on the travel spring.
  - While the file is read, the door is its own progress (`aria-busy`, "Reading the Master Price File", then a check that lands) rather than a refusal.
  - The caption's scrim no longer has a hard edge.
  - The pill is not drawn over Entry.
  - The door gives to .985 under a held mouse.

### The shell (the pill and the finder): `shell-1440x900.png` (the finder), `-finder-sp560.png`, and at 390

- **The language.**
  - Every door carries its glyph.
  - The lit door is the accent's capsule, travelling on the travel spring.
  - The crest is the band in a roundel.
  - The finder's rows lead with a `KindMark`.
- **This round.**
  - The pill's three counts roll as the kit's `Figure` when a press changes them.
  - Data's door says "53 lists".
  - Where scrolled content meets the pill, it goes under a progressive blur that follows the page's scroll over the first 16px, never a hairline.
  - The finder's rows are still plain text (minor 20).
  - The crest is a helm glyph wherever the business is not yet named (/kit, and a register before the catalogue lands; minor 21).

### Home (`/`): `home-1440x900.png`, `-390x844.png`

- **This round, all of it**; it was the old room on 2026-09-28.
  - Northside's name stands on the kit's `Band` with live water, the file's stamp in white at its foot.
  - The photographs are rounded plates with their captions as white `Plate`s inset.
  - The six counts are `Stat`s, each led by its kind's glyph in the kind's ink.
  - The makers' shelf is a `Plate`, and the desk's steps carry a boat, a hammer and a paper plane.
  - New quote ends on the new paper in the act's disc.
  - There are no keycaps in a hand.
- Measured before and after: 3 typed arrows became 0, 0 glyphs became 16, and 0 canvases became 1.
- The makers' marks are still not doors.

### The picker (`/quote/new`): `picker-1440x900.png`, `-390x844.png`

- **The language.**
  - Glyph-led arrows in blue wells, and the magnifier.
  - The fact strip's figures, each led by what it measures.
  - The white plate on its shadow.
  - A door's mark flies to its maker's boats by a View Transition.
  - The act carries the plate's photograph onto the build's stage.
- **This round.**
  - The maker rail's rows wear the kit's ring, drawn inward.
  - "N models match" rolls as the kit's `Figure`.
  - Scrolled, a series head stands clear of the pill, and the list goes under a floor that casts the kit's edge (at 834, where the head showed through the pill).

### The build (`/quote/$id`): `configurator-1440x900.png`, `-390x844.png`, `-issued.png`, `-motor.png`

The critique's first blocker, and the most changed.

- **Motors and trailers are the kit's photographed `OptionTile`s.**
  - The row's own picture (203 of 209 Yamaha rows held).
  - Power, weight and shaft read off the row.
  - The pairing's words as the quiet line.
  - The press's delta in the price pill.
- **In a hand the boat's photograph stands above the rail again.**
- **Every step with a way back is the kit's undo toast.** Its Undo holds the list still under the pointer.
- **A typed name goes on the quote when its chapter closes.**
- **Giving the quote is stamped by an authored Lottie seal**, a rosette in the given leaf with a tick. The still seal is the same drawing. The head is the same height, draft or given.
- **The press and the ring.**
  - The act sinks to .97 under a held mouse and never moves under reduced motion.
  - Option rows and the refused act wear the ring.
- **The chaptered scroll.**
  - Lenis smooths the wheel at a desk.
  - GSAP's ScrollTrigger runs the accent's arc round the reading chapter's disc.
  - The lines under the total roll as `Figure`s.
  - The head and the search field cast the kit's edge where rows pass under them.
- **This verify round**: a chapter pressed open and typed into at once now opens to its whole height.

### The cascade (`/quote/$id/cascade`): `cascade-1440x900.png`, `-390x844.png`, `-stacer519.png`

- **The language.**
  - The build is a white `Plate`, each cause the plate's pale well, every line led by its `KindMark`.
  - A fate is its word and its glyph in a capsule.
  - The sheet comes in on the travel spring, and no figure moves.
- **This round.**
  - It reads the one picture reader, so the Stacer 519's card and blurred ground are its photograph, where it said "No picture of this boat is held yet".
  - Its figures are `Amount`s, never the rolling `Figure`, because every one is a price.

### The paper (`/quote/$id/document`): `document-1440x900.png`, `-390x844.png`, `-stacer519.png`

- **The language.**
  - The room speaks the kit: `StatusDot`, Print as the act on its printer, the desk note as a white `Plate`.
  - Each A4 page is fed out head first by a clip, and nothing on it moves.
- **This round.**
  - The cover is the boat, not the maker's logo on a pale box. The 519's photograph is whole at 571 × 378, under the stage's travelling name, with "Pictured: the Stacer 519 Sea Ranger SDF on the water, in its maker's own finish and rig."
  - The desk note no longer says no copy is held.

### The quotes register (`/quotes`): `quotes-1440x900.png`, `-390x844.png`

- **The language.**
  - The ledger and panel are plates.
  - Each state has its own ink and glyph: draft rose, given leaf, superseded graphite.
  - Rows travel when the register changes shape, never on a key.
  - The room's photograph flies to the screen that opens it.
- **This round**: unchanged. Its picture reader is held to the one reader's answer by the reader's test. The peek still breaks a date at its hyphen (minor 19).

### History (`/history`): `history-1440x900.png`, `-390x844.png`

- **The language.**
  - The spans are `Chip`s, and standing is `StatusDot`.
  - The diary is seen being written once: the spine draws down, the nodes land, the lines rise.
- **This round.**
  - The fortnight shows the boats it quoted as their photographs, read by the one reader. A boat with no photograph is its maker's mark on a shorter band that says so.
  - Under them is one strip of fourteen days, and nothing is stretched to fill the floor.
  - A line's counted words wrap whole: "issued" is never cut.

### Customers (`/customers`): `customers-1440x900.png`, `-390x844.png`, `-book.png`

- **The language.**
  - The margin's acts say which printed line they are for by their glyph.
  - The form is the kit's `Field`s, the book's orders are `Chip`s, and the paper morphs between the book and a page.
  - The name writes itself onto the paper once.
- **This round.**
  - The quote cards wear the ring.
  - "Their quotes" is the boat's photograph where one is held (`customers-1440x900-photo.png`), not "no photograph held".
  - The count and "quoted today" roll as `Figure`s.

### Data (`/data`): `data-1440x900.png`, `-390x844.png`

- **The language.**
  - Every maker is a white option tile that lifts, gives and wears the accent's ring.
  - Pairing lines lead with their kind's glyph.
  - A pointer's press turns the page: the maker's mark lifts into the spread's cover.
- **This round.**
  - It counts the file in lists and lines, as Entry and Home do: "53 lists · 15,691 lines · 28 of them pairing lists".
  - Nothing on it is cut at any width. The where-from cell says the workbook and its sheet, the columns are measured, and long names wrap balanced.

### The sheet (`/data/$table`): `sheet-1440x900.png`, `-390x844.png`, `sheet-pictures-1440x900.png`, `-390x844.png`

- **The language.**
  - The series and doors are the kit's segment on the blue bar, a white thumb travelling.
  - The lit price rung sits on the accent's thumb.
  - A refusal in a cell is the kit's `Refusal`, and the record is a plate with the accent's edge.
  - A chapter's list lifts into place on a press.
- **This verify round.**
  - The Pictures door's cards with no picture wear the ring, drawn inward.
  - The price list is one Tab stop.

### Lost (any address with no screen): `lost-1440x900.png`, `-390x844.png`

- **The language.**
  - The address is a plate that types itself in, one character a step.
  - The act ends on the kit's disc.
  - A thrown screen's rule is the room's, led by the warning glyph.
- **This round**: unchanged.

### The kit (`/kit`): `kit-1440x900.png`, `-390x844.png`

- **The language**: every primitive in its states on the real Stacer 529, the band's live water, the photographed motor tiles, the undo toast, and the accent preview with its refusals.
- **This round.**
  - The refused Amber and Carmine chips wear the ring.
  - Lenis no longer scrolls the page behind an open dialog.
  - The frozen press matches the live one for a chip tile.

## What is still owed

- **Only the build raises a toast.** The cascade, the sheet, Data, History and Customers still say their steps on a line of their own.
- **The `ui` chunk is 1,890 bytes over Vite's warning line**, and Phosphor is the heaviest library (308 KB, six weights per glyph).
- **The critique's minors 18 to 22 are open:**
  - the refused act's ochre
  - the peek's date broken at its hyphen
  - the finder's plain rows
  - the crest changing between "NM" and a helm
  - the lit capsule covering the next door's word for a frame
- **Folding five screens' picture readers into the one reader** belongs to the next round that writes them.
- **The owner has looked at none of it.**
