# The refinement round, verified (2026-10-21)

The owner, 2026-09-24: "seeing overlap of info and things on some screens. ensure refinement of things covers that". This round answered that in three ways:

- **The overlap ruler can see.** It used to set aside every fixed, sticky and absolute element, and it only read the page at rest.
- **The screens speak the dealer's words.** The database's words came out of every screen (docs/WORDS.md), and a rule now refuses them.
- **Each fact is said once.**

The fixers changed each screen. The verify round then did the shared work they could not reach, guarded the words, ran the full gate alone and photographed every screen again.

The photographs are under `docs/directions/<screen>/built/refine-<route>-<w>x<h>-<state>.png`, at 1440 × 900, 1280 × 800 and 390 × 844. Each screen is shown at rest, one window down where the page is that long, and at the end. They were taken under the shot recipe (`e2e/shots/recipe.ts`: the clock at 16 September 2026 09:00, reduced motion) on the final tree's build. The round's earlier photographs at all six sizes, open states included, are under `docs/directions/refine/`.

## The gate, alone, on the final tree

All three gates are green. Nothing else of this repository was running: a vitest worker had been spinning one core for 16.5 hours, and 24 preview servers had been left running. Both were stopped first (docs/DECISIONS.md).

- `npm test`: 239 test files, 3,949 tests, 17 static rules (`no-engine-words` is the new one), no failures. About 5 minutes.
- `npm run build`: green, with Vite's one warning. The `ui` chunk is 503,450 bytes, 3,450 over the line. On the first cut, the crest's read of the marks ledger pulled the photograph ledgers onto every first paint, adding 826 kB. It now reads the marks ledger alone, which adds 22 kB of eager bytes.
- `npm run e2e`, **second full reading on the final tree**: 1,734 tests, 1,352 passed, 382 skipped by design, **0 failed**, 1.6 hours with 2 workers. The strengthened overlap ruler passed 90 of 90 readings: 15 routes at 6 sizes, each at rest, one window down and at the end.
- `npm run e2e`, **first full reading**: 1,734 tests, 1,342 passed, 382 skipped, 10 failed, 1.6 hours.
  - **8 were real**, and all were the verify round's own. They were fixed at their cause, never by loosening a ruler.
    - **Home in a hand.** The new clearance put Home's head at 48px, so the bar stood 2px over the sea. This failed the day-one walk and the shell's "covers none of them" at 390. Home's head is 60px at every width again.
    - **The refusal ruler, at six sizes.** It matched the new no-name sentence by an opening the sentence does not have.
  - **2 were the machine, or the walk.** `--last-failed --timeout 120000 --workers 1` passed 9 of 10.
    - The sheet's "Space opens the details" at 1920 passed alone.
    - The capsule walk at 1920 failed alone too. Its precondition, that the build is scrolled, no longer held at 1920: the given finale's act now stands in the first window. The walk now scrolls to the end, and it passes 6 of 6 sizes. The screen was not changed.

## Shared, once for every screen

These are the verify round's own changes. The reasons are in docs/DECISIONS.md under "verify round".

- **The crest is Northside's own mark.** The roundel shows the waves of Northside's white mark, read off the marks ledger, where it used to read "NM". The business's name has left every eyebrow (Quotes, History, Lost, the build, the cascade), so the crest names it once.
- **A caret leaving a field replays nothing.** The crest's rise and shine used to replay each time, and so did the cascade's cards, Customers' leaves and paper, and the printed quote's sheets. They are now landed, not taken away and given back.
- **18px of air under the pill on every screen.** `--shell-inset` is 68px, up from 56px with 6px of air, set once in the token. The four screens that each took a step of their own have dropped it.
- **In a hand the tab bar stands on the room's floor.** No word of the page shows in the 8px under it.
- **The shell's sentences are in the dealer's words:** the doors, the finder's verbs, the no-file sentences and the shortcut sheet. So is the no-name refusal: "No customer’s name is on this quote yet, so it cannot be given."
- **The toast keeps a step's figure with its words.** It no longer breaks "quote · $25,355" at the dot.
- **A version made in Quotes' first seconds no longer vanishes.** One read of the saved quotes is in flight at a time, and a read never takes back what was filed while it was out.
- **`no-engine-words`** refuses 25 engine words in what a screen, a route or the kit says, each with its proof in the fixture.

## Per screen

### Home (`home/built/refine-home-*`, `refine-home-week-*`)

**What changed.**
- A week in, the work stands on the water as one row of one card's height. The day's line counts only what no card counts ("1 quote started today.").
- The giving is said once, on its card ("Given today at 09:00 · To R. Kelleher").
- The price list is said by its date.
- Under 1200px each row's heading stands over its sentence.
- The crest is Northside's waves, beside Northside's wordmark on the water.
- In a hand the head keeps its 60px under the bar.

**Still wrong.**
- Two boat names are clipped at 1440 ("Signature Fisher 5…", "GRT 455 · Side Con…"). That follows the critique's own rule, "clamp long names", but a name is still cut on a 1440 screen.
- Home's field and the pill's Find are two ways into one finder.
- The same eight boats show every morning.

### Entry (`entry/built/`)

**What changed.**
- The photograph has its own place, and the card no longer stands on the boat.
- The door says "Boats from 7 makers, and the motors and trailers that fit them".
- There is one caption, and the stamp is "The price list of 16 September 2026".
- The flag hangs once, and a caret leaving the field does not replay it.

**Still wrong.** Nothing found at these three sizes.

### The picker (`picker/built/`)

**What changed.**
- A door's boat is named under its picture, never on it.
- The head is one instruction.
- "Cash" is said once, by the price.
- A boat with no photograph says "No photograph of this boat yet." once.
- "Not priced" replaces "No price on file".
- 18px of air under the pill, from the token.

**Still wrong.** At 390, at rest, the second row of doors' arrows and "from $…" stand under the tab bar's top half until the page moves. The ruler allows that, because a scroll gives them back.

### The build (`configurator/built/`)

**What changed.**
- Dealer fit is lines of the build: glyph, name and one figure, with one "For the workshop" for the chapter.
- The rigging kit is "Rigging kit for the F175XC" in the head, the finale and the paper.
- What is not in the total is said once, under the total: "The rigging kit for the F175XC has no price on the price list, so it is not in this total."
- A draft can put a price on the kit line before the give.
- At 834 the boat arrives at the screen's width.
- Below 1440 the step is the masthead's own line, not a toast over the rail.
- The business eyebrow is gone ("Quote 20260916-01 · draft").
- The name button is "Put their name on it", and the field asks for "Their name".

**Still wrong.**
- At 1440 the "4 of 5 items priced" on the Cash price and the sentence under the total say the same missing price in two places, about 600px apart.
- An open chapter's head still repeats the answer its "on the quote" tile shows (a whole-build decision, left by the Dealer fit fixer).
- At 390 a chapter head's answer ends on its "·" before "13 more offered". This was decided on 2026-10-20 so that no line opens on a dot.
- At 844 × 390 the pill and the stuck head take about 165px of 390.

### The cascade (`cascade/built/`)

**What changed.**
- The cards say "New price · at Trade" and "Stays · at Cash: no Trade price on the price list".
- The kit is named by its motor.
- Each count and figure is said once, and the headline counts items.
- From 1280 the pill stands on one ground.
- The business eyebrow is gone.
- A caret leaving the find field no longer rises every card again.

**Still wrong.** "Every item on this quote is above." still explains the screen, and the photograph's caption is two sentences.

### The printed quote (`document/built/`)

**What changed.**
- The kit is "Rigging kit for the F175XC", and its description is under For the workshop.
- An item with no price reads "Price to be confirmed" on its own line, once, and the customer is not told the total is short.
- The note says "Not printed", "Why an item reads as it does" and "Priced at: Cash, on every item with a price".
- The cover fits its page.
- 18px of air under the pill. At 1280 the reference stood 11px under it.

**Still wrong.** At 1440 the "Print" button ends 25px from the window's edge, tighter than the 40px the page's own sheet keeps.

### Quotes (`quotes/built/`)

**What changed.**
- The head says only what is wrong or missing.
- The bands are Draft, Given and Replaced.
- The panel at rest is one line.
- The peek reads in its own scroller, with its acts as a foot.
- A draft with no name says so once, in the refusal: "No customer’s name is on this quote yet, so it cannot be given."
- The business eyebrow is gone.
- The search asks for a "Quote number".
- A version made in the first seconds no longer vanishes.

**Still wrong.** An empty band says it twice: "Given 0" over a row holding "—". At 1440 the room's photograph of one draft fills 500px under three bands, two of them empty.

### Customers (`customers/built/`)

**What changed.**
- The person is counted once, by the pill.
- Their quotes are counted once, and a sum is drawn only where it adds.
- The editor's label is read.
- The book's foot is one sentence.
- The head reads from the left.
- The paper and the leaves are no longer laid again when a caret leaves the find field or the name editor.

**Still wrong.** At 1440 the book of one person is a row, a sentence and 140px of empty ground above the glance. "Latest first" stands alone after the two sort buttons, and reads as a third control that is not one.

### History (`history/built/`)

**What changed.**
- The spans stand beside the title, now 18px under the pill (13px before the clearance moved).
- The head counts nothing.
- A sum is said only over two lines.
- The fold says what its line does not.
- The diary's words are the dealer's ("choice", "named", "given").
- The business eyebrow is gone.

**Still wrong.**
- The line says "Nobody named on it", where the build says "nobody named yet".
- "The last fourteen days · a dot for each thing done" still explains the drawing.
- At 1440 one quote's diary is mostly empty ground.

### Data (`data/built/`)

**What changed.**
- What goes with a maker is inside its plate.
- No pairing counts anywhere.
- A row says its name, its count and what it fits ("fits 6 boats").
- "Register" is "list" ("New list").
- The head says the price list once, by its date, with its size, which is said only here.

**Still wrong.** Six of the seven plates say the maker twice: the mark ("STACER") and the same name in caps under it.

### The price list editor (`sheet/built/`)

**What changed.**
- The columns list stays under its button.
- "Show" is said once per line.
- The series band says the boat ("short shaft · tiller steer · external tank · 3 air chambers").
- A picture's colourway is said once.
- The details are "details", not "record".
- 18px of air under the pill. It was 13px.

**Still wrong.** "Delete this row" and "Fill down from the top row" keep the spreadsheet's word, as `no-engine-words` allows here alone.

### Lost (`lost/built/`)

**What changed.** No sentence under the act, "every quote on this computer is still here", and the business eyebrow is gone.

**Still wrong.** Nothing found.

### The kit, /kit (`kit/built/`)

**What changed.** The Motor list opens under its trigger, the kit speaks the dealer's words, and each fact is said once.

**Still wrong.** The kit page's "Nobody named yet" placeholder now differs from the build's "Their name".
