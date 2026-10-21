# The refinement round, verified a second time (2026-10-21)

The owner, 2026-09-24: "seeing overlap of info and things on some screens. ensure refinement of things covers that". A cold critic judged the first refinement (`refine-critique.md`) and found four blockers and 28 majors and minors. The fixers answered them screen by screen. This round then:

- did the shared work they handed on,
- guarded the words,
- strengthened the overlap ruler where the critique showed it was blind,
- ran the full gate alone, twice, and
- photographed every screen again.

The reasons for each change are in `docs/DECISIONS.md`, under "refine-2 verify".

**Where the photographs are.** They are under `docs/directions/<screen>/built/refine2-<route>-<w>x<h>-<state>.png`, at 1440 × 900, 1280 × 800 and 390 × 844. Each screen is shown at rest, one window down where the page is that long, and at the end. Four photographs are of states rather than routes:

- `refine2-home-week-*`: three quotes, one given.
- `refine2-picker-chosen-*`: the Stacer 519 Sea Ranger SDF chosen.
- `refine2-configurator-fit-*`: Dealer fit open.
- `refine2-configurator-given-*`: the finale, given.

**How they were taken.** They were taken on the final tree's build, under reduced motion, with the clock running and without Playwright's `animations: 'disabled'`. The shot recipe's fixed clock (`e2e/shots/recipe.ts`) stills every JS-driven reveal: taken under it, Dealer fit pressed open drew an empty chapter at all three sizes. `animations: 'disabled'` also cancels scroll-driven styles, such as the shell's floor and the cascade's band. So both were left out, and the photographs show the app as a person sees it. The quote numbers and dates are therefore today's, 21 October 2026.

## The gate, alone

Before the gate, 12 leftover Vite servers from earlier agents were stopped. Six of them were dev servers with file watchers, one holding 594 CPU-seconds.

- **`npm test`** on the final tree: 239 test files, 3,994 tests, 17 static rules, no failures. 5 minutes 9 seconds.
- **`npm run build`**: green, with Vite's one chunk warning. The largest chunk is the lazy `pictures` chunk, at 696,125 bytes.
- **`npm run e2e`, second full reading, on the final tree**: 1,782 tests, 1,367 passed, 415 skipped by design, **0 failed**, 1.7 hours with 2 workers.
  - Overlap: 90 of 90 route-and-size tests green with the stronger ruler. 278 readings were logged, every one with 0 overlapping.
  - Contrast: 0 below threshold in 218 readings, by day and by night.
  - Cut: 0 in 90 readings.
  - One idle `vite preview` of a scratch build stayed listening on port 6301 through this reading. It was not serving anything the gate read.
- **`npm run e2e`, first full reading**, on the tree the fixers left plus this round's shared changes: 1,782 tests, 1,323 passed, 415 skipped, **44 failed**, 1.8 hours.
  - **Every red was real**, and each was fixed at its cause. `--last-failed --timeout 120000 --workers 1` then passed 44 of 44 (5.1 minutes), and the second full reading above is green.
  - **14 were this round's own, found by the stronger ruler.** At 390, the taller tab bar put History 3px into the find round, on every route.
  - **6 were one real fault on the build.** The open "Who it is for" drew an empty answer box in its head.
  - **24 were walks the fixers' own word changes had left behind,** six sizes each:
    - History's day head no longer prints the figure of one given quote.
    - The finder's line row is "Its line in the price list".
    - Home's no-file sentence says "this computer".

## Shared, once for every screen

- **The crest is Northside's before any file says so.** A browser that had never been through the door drew a ship's wheel named "HelmLogic — Home". The marks ledger the app ships holds one organisation, Northside Marine, so its waves are the crest and its name is the tab's until a file names another business (`ownBusiness`, `src/data/crest.ts`).
- **A mark is the name.** The kit's `Band` no longer sets "Northside Marine" in type under a wordmark that already says it.
- **In a hand, the bar stands on a floor its own height.** The floor used to rise only to the bar's middle, then fade and blur, so a line showed half beside the pill and half through it. Now it is solid to the top of `--shell-foot`, ended by a hairline while the page has more below. What goes down the page goes under one straight edge.
- **The lit tab holds its word.** It is 4px taller, so "Quotes" no longer sits on the capsule's lower rim, and the draft's dot is inside its upper rim. The tabs keep 6px a side so History clears Find.
- **The Data door carries no count.** "Data 53" was on every sale screen. The price list's size is said on Data alone (docs/WORDS.md).
- **The words rule takes every engine word the screens are now clean of.** `no-engine-words` now refuses these, each with a fixture that fails on the engine's sentence and passes on the dealer's:
  - the file, filed, held, this browser, packed
  - copied onto, read-only, picks, level, repriced
  - documents, the paper
  - slot, chip, band, on the desk, the act, doors
  - column and variant, except on the price list editor

  Five screen sentences and six domain sentences that a screen prints whole were put in the dealer's words first. The words left off, and why, are in DECISIONS.
- **The overlap ruler reads glass as glass.** A chrome's ground is now SOLID or a VEIL. A veil is a gradient with a see-through stop, a blur over less than half a colour, or a ground faded by a mask. Words under a veil fail in any state. The walk reads every half window, up to sixteen stops, not three positions. A new fixture proves both, and the old ruler passed it.

## Per screen

### Home (`home/built/refine2-home-*`, `refine2-home-week-*`)

**What changed.**
- A draft card says what it still wants, the boat's price included ("No boat price yet · Nobody named yet").
- The folded card counts once: "+3", with "Drafts" under it.
- The hidden heading is "Work in hand", and the boats' line is "Press one to quote it, or find any other by name."
- With no file: "The Master Price File is not on this computer yet."
- Day one and a week in, it fits 800 of 800 and 900 of 900.

**Still wrong.**
- Long names are clipped on the work cards and the boats ("Highfield Roll Up 280 K…", "Signature Fisher 5…", "GRT 455 · Side Con…"). This follows the critique's own "clamp long names", but a name is still cut at 1440.
- Home's field and the pill's Find are two ways into one finder.

### Entry (`entry/built/`)

**What changed.** Nothing this round but the shared crest. The door is Northside's waves on the pennant, and the photograph stands clear of the card.

**Still wrong.** Nothing found at these three sizes.

### The picker (`picker/built/`, `refine2-picker-chosen-*`)

**What changed.**
- In a hand, a chosen boat's "Start the quote" stands above the tab bar at rest (blocker 3). The find field goes with the list.
- The doors' first window ends on a seam.
- The doors and the list have caps under the pill, ended by a hairline.
- Stacer's wide door is the last door.
- A boat with no photograph is said once, on the plate.
- The series is said once.
- The empty find says "choose a maker", not "from the doors".

**Still wrong.**
- The plate's spec reads "MIN · 60 HP" where the build says "POWER · 60–115 HP".
- "HULL WEIGHT (DRY)" takes two lines, so the three values stand ragged.
- At 844 × 390, scrolled 100px, the blue band's words pass beside the pill on their way out.

### The build (`configurator/built/`, `refine2-configurator-fit-*`, `refine2-configurator-given-*`)

**What changed.**
- **The given quote** (blocker 1). A given quote's other motors are priced as the change they would be, as the draft priced them.
- **The unpriced kit** is said once, under the total, and names its list: "Rigging Kits have no price on the price list, so the rigging kit for the F175XC is not in this total." There is no "3 of 4 items priced" and no tag.
- **Said once each:**
  - The missing name, where it is acted on.
  - The chosen motor's price, on its tile. The toast says the signed change.
- **The recommended kit.** "Rigging kit for the F90LB · Recommended" no longer stands with another motor on the boat.
- **The Haines package** reads "Yamaha F90XB package", not the file's "SIG 525F w Yamaha".
- **Sticky edges.** The search field's foot and the hand's head end on a line, not a veil. At 834 the head has no empty column and drops no shadow.
- **Captions.** The stage caption says "On this quote: the Yamaha F175XC." "No other finish of this boat is on the price list."
- **An open head with nothing to say draws no answer box** (this round).

**Still wrong.**
- At 390 a head's answer ends on its "·", and "13 more offered" goes to the next line, by the 2026-10-20 decision.
- Dealer fit's lines each wear the same box glyph.
- The Haines build numbers its chapters 01, 03, 04 without saying why 02 is missing (minor 22, not reached).

### The cascade (`cascade/built/`)

**What changed.**
- The headline names the price, and nothing beside it says Trade again.
- There is one sentence under the picture.
- The kit's code names its gap ("cable length").
- From 1280 the pill stands on one fixed ground. From 600 to 1279, once the page moves, the same band rises under it (this round). Scrolled at 834 and 844 × 390, the build's card no longer shows beside the pill.

**Still wrong.** The rigging kit's card reason opens in lower case, as a fragment: "out of the total: rigging kits have no Cash or Trade price on the price list".

### The printed quote (`document/built/`)

**What changed.**
- Reloaded or opened by address, it wears Northside's crest (blocker 2).
- The note says the boat, not the app ("Included in every price. No rate is set on this quote.", "None set yet.").
- The note no longer says "row" (blocker 4): "The price list's photograph shows the side console, so it is left off."
- Each code stands beside what it orders.
- A band's head prints no figure, so a price is said once on page 2.
- The cover's maker is said once.

**Still wrong.** Nothing new found at these three sizes.

### Quotes (`quotes/built/`)

**What changed.**
- An empty band is its head alone.
- The peek says the day once, and "Includes tax."
- The photograph's foot names the photograph.
- The empty find says "quote number".

**Still wrong.** With one draft, the room's photograph fills about 400px under three bands, two of them at 0, beside an empty "Press a quote to see it" panel.

### Customers (`customers/built/`)

**What changed.**
- In a hand the person's leaf runs to a seam above the tab bar.
- The business is named once.
- The editor's label is read.
- The book's foot is one sentence.

**Still wrong.** "Latest first" stands after the two sort buttons and reads as a third control that is not one.

### History (`history/built/`)

**What changed.**
- "Given" is said once on a line.
- A day sums only over two given figures.
- The diary ends on "The first quote, at 23:33".
- The fortnight is "The last fourteen days".
- The key says "new price".

**Still wrong.**
- A line reads "Nobody named on it" where the build says "nobody named yet".
- With one quote, most of the page is empty ground.

### Data (`data/built/`)

**What changed.**
- A plate names its maker once, by its mark.
- The spread says "Prices · Cash · Trade · and 6 costs" and "Motor Module, on its Motor Library tab".
- The sha256 is gone from every spread.
- The pill no longer says "Data 53". The size is said here alone: "53 lists · 15,691 lines".

**Still wrong.** Nothing new found at these three sizes.

### The price list editor (`sheet/built/`)

**What changed.**
- A line found in the finder opens on "Its line in the price list".
- The editor keeps its own words: row, column, variant.

**Still wrong.** Nothing new found at these three sizes.

### Lost (`lost/built/`)

**What changed.** The shared crest.

**Still wrong.** Nothing found.

### The kit, /kit (`kit/built/`)

**What changed.**
- The water carries Northside's wordmark alone, with no name typed beneath it.
- "The water", "a filter" and "Blue" replace the kit's names for itself.
- A browser with no file still wears Northside's crest.

**Still wrong.** The kit's name field still has "Nobody named yet" as its placeholder, where the build says "Their name".

## What the gate still cannot see

- **The rulers measure a stilled screen.** `open()` fixes the clock, so anything revealed by JavaScript after arrival is measured, and photographed, at its first frame. Every ruler measures arrival states, which are whole. Pressed states are walked by the flows, which run the real clock. Unfreezing the recipe would move every screenshot baseline, so it is left for its owner. This is why the photographs here were taken without it.
- **A veil drawn by a pseudo-element is not read.** The shell's scroll edge under the pill at a desk, and the build's masthead foot at a desk, are two such veils.
- **At rest, a line cut by the floor in a hand is not counted as overlap.** It is cut by one straight, opaque edge, as the window's own edge cuts the last line of any page. Four screens still end their first window on a seam, held by `e2e/fold.ts`.
- **The domain's own sentences are not read by the words rule.** The six that a screen prints whole were fixed by hand. Making the rule read them means first sorting the engine's reasons that screens match and reword.

The owner has not looked at any of it.
