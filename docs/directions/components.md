# The component language, verified (2026-09-28)

The owner, 2026-09-24, in the browser: "components are so bland and boring…", and the same day "tech stack looks SO BORING". Measured before this round: `motion` imported in 1 file, `@phosphor-icons/react` in 1, `@number-flow/react` in 1, `gsap` and `lenis` in 0, `lucide-react` in 0 — text in boxes, almost no icons, almost nothing moving, flat fills.

This round built kit C, "Signal" (colour and icon, blue and white, round white plates that are the day wherever they stand, the amber act as the one thing you press) into `src/ui`, grafted kit A's live WebGL water under Northside's name, and five adopters brought it onto every built screen but Home, which is the next round's (`hl2-home`). This page is the verifier's: the gate, the libraries measured as adopted rather than installed, and per screen what the language changed. The photographs are `docs/directions/<screen>/built/<screen>-1440x900.png` and `-390x844.png`, taken on the gate's own build under the shot recipe (reduced motion, pinned clock, every picture decoded).

## The gate, alone, on this tree

Nothing else ran beside it: no other agent's build, no preview but its own.

- **`npm test`**: 227 test files, 3,753 tests, 14 static rules, no failures (320 s wall; the first reading, before the refusal revert below, was 3,754 tests in 331 s).
- **`npm run build`**: green, 5.7 s. One warning, measured and not hidden: the `ui` chunk is 500,280 bytes, 280 over Vite's 500 kB line (155 KB gzip); the next section says what is in it.
- **`npm run e2e`, first reading**: 1,428 tests, 1,092 passed, 333 skipped by design, 3 failed, 83.7 minutes with 2 workers.
  - `e2e/rulers/refusal.spec.ts:162` at 1440 — **a real red, this round's own**: the verify round had inked every button's refusal with the room's reason ink, and six sentences under paper buttons read 2.02 : 1 by night. Reverted at its cause (`docs/DECISIONS.md`, "A paper button's refusal keeps the paper's ink").
  - `e2e/flows/home.spec.ts:136` at 1280 ("the mark loaded": a maker's mark read before its bytes landed) and `e2e/flows/customers.spec.ts:262` at 1920 (a two-minute timeout pressing "Address this quote" while the finale's head moved over it): **the machine**.
- **Second reading, `--last-failed --timeout 120000 --workers 1`**: 3 of 3 passed (32.5 s), on a build of the reverted tree.
- **The contrast and refusal rulers again on the final tree**, because the revert touched ink: 103 passed, 5 skipped, 0 failed; every reading 0 below threshold by day and by night, the given peek's refusal 7.88 : 1 at night and a paper button's 7.13 : 1.
- **Before the gate**, the four flows the router's double transition failed (data :47, quotes :31, history :38, customers :144) were run at 1440 and 390: 8 of 8 passed.

## The libraries, adopted and not only installed

Counted on this tree: files under `src/` that import the library, tests left out. The bundle is read off a source-mapped build of the same tree (every minified byte attributed to the package its source map names; gzip is that package's own code compressed alone, so it slightly overstates what it adds to a chunk).

| | files importing | where it earns its place | added to the build | loaded |
|---|---|---|---|---|
| `motion` | **16** (was 1): 8 in screens, 8 in `src/ui` | the one motion gate (`MotionRoot`: reduced motion and a caret in a field, for every moving thing); springs read from the tokens; the pill's lit capsule travelling between doors; the Segmented thumb; a chapter opening by height; rows travelling when a register changes shape (quotes, the book); History's fold; the sheet's thumbs; the dash that fills | 140.9 KB min, 47.0 KB gzip (motion-dom 101.0, framer-motion 38.0, motion-utils 1.8) | in `ui`, every screen; 11.5 KB more in the sheet's chunk |
| `@phosphor-icons/react` | **37** (was 1): 26 in screens, 11 in `src/ui` | a glyph beside the word on every act, door, chip, band head, fate, fact and kind of sentence; one table per screen (`glyphs.ts`), and a test that fails a door with no glyph or two places sharing one | 313.3 KB min, 74.3 KB gzip; every glyph module carries all six weights | 45 KB in `ui`, 15 KB in `index`, the rest per route and per glyph |
| `@number-flow/react` | **1** (was 1): the `Figure` wrapper. Drawn, since 2026-09-29 (components critique major 12), by the counts that change in front of the reader: the pill's Quotes, Customers and Data on every screen but Entry, the picker's "N models match", the build's lines under the total and the counted line over each list, Customers' head, Home's search count and /kit. The cascade draws none: its local figure, renamed `Amount`, is a price | a count that is not the price rolling digit by digit on the kit's travel spring when a press changes it, and landing at once under a caret or reduced motion; it carries its value once as text, so a reader hears "22 models match" and a copy takes it; `PriceFigure` never uses it | 17.4 KB min, 5.9 KB gzip | in `ui` |
| `gsap` + ScrollTrigger | **1** (was 0): `src/ui/scroll.ts`, used by the build and /kit | the build's reading ring on the chapter the window is in, and since 2026-09-29 the accent's arc run round it as far as the window's middle is through that chapter; /kit's dashes | 112.9 KB min, 43.9 KB gzip | only in the `scroll` chunk (133 KB, 49.5 KB gzip with Lenis), which only `/quote/$id` and `/kit` fetch |
| `lenis` | **1** (was 0): `src/ui/scroll.ts`, used by /kit and, since 2026-09-29, the build | the wheel smoothed on a fine pointer, never on touch or under reduced motion, and the browser's own wheel while a caret is in a field (the build's search is its navigation) or a dialog has locked the page | 18.6 KB min, 5.4 KB gzip | the `scroll` chunk |
| `sonner` | **1**: the `Toaster`, mounted once at the root | the undo toast, headless, as the kit's navy capsule. **Raised by /kit and, since 2026-09-29, by the build**, which says every step and its Undo in it | 33.5 KB min, 9.3 KB gzip | in `ui` |
| `lucide-react` | 0 | none needed; Phosphor has had every glyph asked for | 0 | none |
| **WebGL water**, no library | `src/ui/water.ts`, drawn by `Water` on Entry's flag and /kit's band | Northside's name on live water ("I want the logo to be the showpiece thing"); a luminance cap keeps white at 5.8 : 1 whatever the accent | 3.1 KB min, 1.6 KB gzip, and `Band` 1.0 KB | Entry, /kit |
| **View Transitions**, the browser's own | the router (every change of screen); `morph` in Customers, Data's `turn` and /kit; shared names on the pictures and marks of 11 screens | the picker's photograph to the build's stage to the cascade's card to the paper's cover; a maker's mark from its door to its boats, and from Data's shelf into its spread and on into the sheet; Entry's flag into the pill's crest; the book's paper onto a person's page | no library; `transition.ts` 2.3 KB and `route.css` | every screen |
| Rive, Lottie | 0: not installed | no authored file exists; the band's reveal is CSS (decision of 2026-09-28) | 0 | none |

The whole build is 2.39 MB of JavaScript (710 KB gzip) in 66 chunks, and 390 KB of CSS (65 KB gzip).

## The frame rate of each ambient effect, at 390 × 844

The only thing in the app that moves on its own is the water: Entry's flag and /kit's band (the crest gave its water up, and Home is not in the language yet). Lenis's frame loop runs only on a fine pointer, so never on a phone. Read in Chromium at 390 × 844 with the CPU throttled 4× by the browser's own tools (`Emulation.setCPUThrottlingRate`, what DevTools' "4× slowdown" sets), five seconds each: the page's frames a second, the worst 5% of the gaps between frames, and the water's own draws a second (`drawArrays` counted by a wrapper installed before the app loads). The caret was let go first, because the water holds still under one.

| effect | renderer | 1× | 4× CPU |
|---|---|---|---|
| Entry's flag, 160 × 108 drawn at 80 × 54 | SwiftShader, the gate's software GL | 60.2 fps, p95 16.8 ms, 60.2 draws a second | 60.3 fps, p95 16.7 ms, 60.3 draws a second |
| /kit's band, 358 × 160 drawn at 179 × 80 | SwiftShader | 60.2 fps, p95 16.8 ms, 60.2 draws a second | 60.3 fps, p95 16.7 ms, 60.3 draws a second |
| Entry's flag | Intel Iris Plus 655, Direct3D 11 | 57.7 fps, p95 16.8 ms | 60.2 fps, p95 16.8 ms |
| /kit's band | Intel Iris Plus 655, Direct3D 11 | 60.2 fps, p95 16.8 ms | 60.2 fps, p95 16.8 ms |
| Lost, nothing ambient, for comparison | both | 60.2 to 60.4 fps | 60.3 fps |

At a phone's width the water is small and drawn at half resolution, so it holds the display's rate even throttled. A real phone's GPU was not measured.

## What the verify round changed in src/ui

Every change an adopter asked the kit for in its report, made once for every screen (dated in `docs/DECISIONS.md`):

- **One crossfade per change of screen** (`src/app/router.ts`) and **every view transition owned** (`ownTransitions`, `own`, `morph(update, types)` in `src/ui/transition.ts`). This was the red two adopters could not close from their own files: the Data, quotes, History and Customers flows failed at every size on "Transition was skipped. New ViewTransition started".
- **A named picture with nowhere to land fades in the route's 220ms**, once in `src/ui/route.css`; eight screens' copies deleted.
- **`Water still`**, which Entry now uses while the file is read instead of taking the water off the page.
- **The chaptered scroll**: `through` is a motion value, the triggers measure themselves again once a change has settled, the wheel is never locked under a caret, and a list inside the page takes the wheel over it. The build's own measuring is gone.
- **`Chapter empty` and `level`, `Dashes` chapters that number themselves.**
- **`PriceFigure signed`, `StatusDot size="inherit"`, `Button back`, `Plate as="li"`, `Picture srcSet/sizes`.** The cascade adopted the first three (`cascade-1440x900-decision.png`, `-accepted.png`).
- **Tried and refused by the gate:** a refusal sentence under any button inked for the room. The refusal ruler read 2.02 : 1 on paper by night, and it was reverted.

Asked for and not made, each with its reason in `docs/DECISIONS.md`: a 24px `BandHead`, `Tile` passthrough, `Button` as a Popover trigger, `Segmented` as links, a richer `OptionTile`, `Chip` with a swatch; and three asks outside `src/ui` (the shell's glyph list beside `DOORS`, the pill read from `resolvedLocation`, the contrast ruler's inner scrollers).

## Per screen, what the language changed

### Entry (`/sign-in`) — `entry/built/entry-1440x900.png`, `-390x844.png`

- **Material.** The pennant is the kit's band: the accent's grained gradient with the live WebGL water clipped to the flag's notch. The card is the kit's white `Plate`; the honest "no password" line is its pale well with an open lock.
- **Icon.** The door leads with the file's drum and ends on a white disc whose arrow nudges forward. The name's refusal is the kit's `Refusal` with its warning glyph.
- **Motion.** Everything fades in a press apart and the name sharpens out of a blur; nothing travels, because the field takes the caret. When the file lands the flag flies into the pill's crest on the route's crossfade (the one shared name on the screen). The load steps tick on the settle spring.
- **This round.** The water is held on one still frame while the file is read (`Water still`) rather than taken off the page.

### The shell (the pill and the finder) — `shell/built/shell-1440x900.png`, `-finder-sp560.png`, and at 390

- **Icon.** Every door carries its place's glyph beside its word (house, paper, users, drum, clock); the finder's groups lead with a `KindMark` or a glyph, and door and act rows with the place's glyph. The magnifier replaced `⌕`.
- **Colour and light.** The lit door is one accent capsule drawn as the band's gradient; counts stand in the kit's well; the pill wears the plate's shadow; the crest is the band in a roundel.
- **Motion.** The lit capsule travels between doors on the travel spring; a press sinks to .97. The finder hangs down from the pill when a pointer opens it and appears at once from Ctrl K.
- **On a phone** a tab is its glyph over its word, and the count is a dot on the glyph's shoulder only when a draft waits.

### Lost (any address with no screen) — `lost/built/lost-1440x900.png`, `-390x844.png`

- The address is a plate that types itself in, one character a step over the morph; the page arrives head to foot; the act ends on the kit's disc; the rule beside a thrown screen's words is the room's strong rule led by the warning glyph, no longer the act's amber.

### Home (`/`) — `home/built/home-1440x900.png`, `-390x844.png`

- **Not in the language yet, on purpose.** Home is redesigned in the next round (`hl2-home`) in this language; the kit reaches it only through the pill, the primitives it already drew and the tokens. Photographed so the next round starts from its real state.

### The picker (`/quote/new`) — `picker/built/picker-1440x900.png`, `-390x844.png`

- **Icon.** Every typed arrow is a Phosphor glyph; a door's way in slides forward in a blue well that takes the accent under the pointer; the find field carries its magnifier; each figure on the fact strip is led by the glyph of what it measures, read off the file's own label, on every figure of a strip or none.
- **Material.** The plate is the kit's white plate on its shadow with its foot in the plate's well; the band wears the kit's grain over the file's blue.
- **Motion.** A door's mark flies to the head of its maker's boats by the browser's own View Transition (in flight at 60ms, landed by 180ms); the act carries the plate's photograph onto the build's stage across the route's crossfade (`boatTravel`); a material's colours rise into place.

### The build (`/quote/$id`) — `configurator/built/configurator-1440x900.png`, `-390x844.png`

- **Colour.** Each chapter head is a disc in its kind's own ink (hull cobalt, motor carmine, trailer ochre, dealer fit viridian); the level the quote is on is the accent's chosen capsule with its level's glyph; the state in the masthead is a rose or leaf dot that lands anew when the quote is given.
- **Icon.** Every sentence about a list or a press is led by its kind's glyph (a lock, an i, stacked lines, coins, a warning); every row on the quote carries a tick disc, never colour alone.
- **Motion.** A chapter opens out of its head by height and opacity on the travel spring and closes faster; chapters rise on a draft's first paint; the onward move waits the 441ms for the chapter to open. GSAP's ScrollTrigger puts the accent's reading ring on the disc of the chapter the window is in — measured again by the kit now, once the page is still.
- **The stage** takes the photograph the picker's act carried, and gives its name up where it stands below the rail in a hand.

### The cascade (`/quote/$id/cascade`) — `cascade/built/cascade-1440x900.png`, `-390x844.png`

- **Material and colour.** The build is the kit's white `Plate`, each cause the plate's pale well, every line led by its table's `KindMark` in its kind's ink; the maker's plane wears the kit's grain.
- **Icon.** A fate is its word AND its glyph in a white capsule (a tag re-priced, an anchor held, a minus off, a plus on, a question not checked); the arrow between two figures is Phosphor's.
- **Motion.** The sheet comes in from the end edge on the travel spring (from below in a hand), the card rises, the maker's mark comes out of a blur, the causes rise half a press apart; a decision taken lands a tick in the accent's disc. No figure moves.
- **This round.** The change to the total is the kit's display `PriceFigure` with its sign; the eyebrow's state is `StatusDot` in the eyebrow's own type; "Back to the build" leads with a left arrow in its disc and nudges backward, where it ended on a forward arrow.

### The paper (`/quote/$id/document`) — `document/built/document-1440x900.png`, `-390x844.png`

- **Only the screen changed; the printed page did not.** The state is `StatusDot` beside the reference; Print is the act ending on its printer; the dealer's note is a white `Plate` with every fact led by its glyph; the page number is a small capsule.
- **Motion.** Each A4 page is fed out head first by a clip (nothing on it changes place or value), its crop marks and number come on once it is down, the note rises into the margin; the cover takes the finale's photograph through the route's View Transition.

### The quotes register (`/quotes`) — `quotes/built/quotes-1440x900.png`, `-390x844.png`

- **Material.** The ledger and the panel are plates; a row is a rounded wash inside its plate, the one the panel reads wears the chosen wash and the accent's edge.
- **Colour and icon.** Each state has its own ink and glyph beside its word — draft rose, given leaf, superseded graphite — on band heads, rows, tallies and the peek; every act carries its glyph.
- **Motion.** Rows travel to their new place when the register changes shape (a new version, a discard, a find) and never on an arrow key; the room's photograph flies to the build or the paper that opens it. Still 19 rows of 18 at 1280 × 800.

### History (`/history`) — `history/built/history-1440x900.png`, `-390x844.png`

- The spans are the kit's `Chip`s; standing is `StatusDot` in the same three inks; Today wears the accent's chosen ring where it wore the act's amber; the fold is a plate that grows out of its line.
- **The showpiece:** on the first paint only, the spine draws down, each day's node lands on the settle spring, the lines rise a press apart and the fortnight's dots drop into their days.
- **The fortnight, redrawn 2026-09-29 (components critique major 13):** no plate is stretched to fill the floor. The boats the fortnight quoted stand under its caption as their photographs, read by the one picture reader (`@/data/pictures`), sized by the window, surfacing from their frame's foot on arrival and travelling under the hull's name to the stage or the paper. A boat no photograph is held of is its maker's mark on a shorter band that says so. Under them is one strip of fourteen days: the days before the diary are one cell, and today's column wears the accent's wash. A line's counted words wrap whole and are never cut. Before and after: `critique-before-1440x900.png` and `-390x844.png` beside `history-1440x900.png` and `-390x844.png`.

### Customers (`/customers`) — `customers/built/customers-1440x900.png`, `-390x844.png`, `-book.png`

- The margin's acts say which printed line they are for by their glyph (card, phone, envelope, pin); the form is the kit's `Field`s; the book's two orders are `Chip`s; standing is `StatusDot`; the dealer's card keeps the file's blue as a lit material.
- **The showpiece:** between the book and a person's page the paper is one named picture that morphs, and the name writes itself onto the paper left to right, once.

### Data (`/data`) — `data/built/data-1440x900.png`, `-390x844.png`

- Every maker on the shelf is a white option tile that lifts under a pointer, gives under a press and wears the accent's ring while its spread is open; a pairing line leads with its far table's kind glyph in its own ink; the ledger is one plate with `KindMark`s and the accent's current line.
- **The showpiece:** a pointer's press turns the page — the maker's mark lifts off its plate and lands in the spread's cover (a View Transition typed `turn`, now the kit's `morph`), the ledger leaves through a 2px blur, the lineup's bars grow a third of a press apart.

### The sheet (`/data/$table`) — `sheet/built/sheet-1440x900.png`, `-390x844.png`, `-pictures.png`

- The series and doors on the blue bar are the kit's segment drawn as links, a white thumb travelling to the one pressed; the lit price rung sits on the accent's travelling thumb; carets turn; the file's star is a glyph; a refusal in a cell is the kit's `Refusal` on a white plate; the record under its row is a plate with the accent's edge.
- A chapter opens: a pointer's press lifts the new list into place (never a key, never under a caret); the maker's mark flies in from Data's cover.

### The kit (`/kit`) — `kit/built/kit-1440x900.png`, `-390x844.png`

- Every primitive in every state on the real 529, by day, on white plates, over the 529's photograph and on the night's navy; the band's live water; a same-document View Transition between the stage and the three 529 tiles; the chapters' dashes driven by ScrollTrigger and Lenis on a desk; an undo toast from a real motor pick; the accent preview where plum and rust are allowed and amber and carmine are refused with their sentences.

## What is still owed

- **Only the build raises a toast** (2026-09-29, major 9). The cascade, the sheet, Data, History and Customers each still say what happened and offer Undo on a step line of their own.
- **Home is not in the language**; it is the next round's.
- **The `ui` chunk is 280 bytes over Vite's warning line**, and Phosphor is the largest library in the build (313 KB, every glyph in six weights).
- **Rive and Lottie are not installed**: there is no authored file for the mark's reveal or for "given".
- **The pill is drawn over Entry for the moment between the address changing and Home drawing** (the shell's report; `__root` reads `location`, not `resolvedLocation`).
- **Scrolled content still passes under the pill** with no edge (audit.md, defect 2), seen at the top of `cascade-1440x900-decision.png`.
- The seven kit asks not made, with their reasons, are in `docs/DECISIONS.md`.
