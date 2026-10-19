# The build, closed a second time: the change of mind, walked cold, and the gate alone (2026-10-20)

The owner's finish line: "do a full quote that is good enough experience to do so sitting with a customer and it is beautiful". The fresh critic of 2026-10-19 (`build-close-critique.md`) said the build was no longer where the owner would first call the app bland. It named the change of mind instead: the F115LB pressed with the F90LB on doubled the motor, said so in the engine's words, and left the F90LB's rigging kit on the quote. It also said the boat left the tablet's screen once a chapter opened. The fixers answered it, and their decisions are in `docs/DECISIONS.md` dated 2026-10-19 and 2026-10-20.

This page is the verifier's, working alone. It covers:

- what this pass finished that the fixers left open
- the gate on the final tree
- one quote walked cold at three sizes, each step photographed
- what is still wrong

## What this pass finished

Four things on the sale's own path were still open after the fixers. Each is a dated decision in `docs/DECISIONS.md` (2026-10-20).

**The change of screen double-printed two heads (critique minor 8).** From the build to the paper at 1440, the route's even crossfade drew both screens at half strength for about 150ms. "Stacer 519 Sea Ranger SDF (Centre Console) for Jordan Test" lay over "Stacer 519 Sea Ranger SDF", and "Print" lay over "TOTAL".

- The route now fades through: the screen left goes in 100ms, the one arriving comes in over 140ms, and the change still ends at 220ms. The two share 20ms, when both are faint.
- The shared photograph still morphs over both.
- Photographed at 110ms on the final build: the build's words are a ghost under the travelling photograph, and the paper's are not drawn yet.
- `src/ui/route.css` only, under the router's own `route` type. A change inside one screen keeps its own crossfade.

**The cascade's lone dashes (critique minor 13).**

- "WHAT YOU CHOSE · Trade" no longer ends on a "—". A price level has no price of its own.
- The held card of the unpriced rigging kit no longer wears a white capsule holding "—".
- Its row no longer ends on a second "—" after "Not priced on this quote".
- `Cascade.test.tsx` now pins the first.

**A chapter head left cut under the bars, two heads up.** At 1440, "On to the finale" shut Who it is for and opened the finale where it stood. The head next to it was whole, but Dealer fit, two heads up, rested cut through its words under the search band. The fixers' check looked only at the adjacent head. `cutAbove` now walks every head above the pressed chapter. On the final build the finale opens with Dealer fit wholly in view.

**A head that wraps began its line with a dot.**

- At 390, "Yamaha/Stacer · Binnacle Mount Rigging Kit" put "· 6 more offered" on a line of its own (build-close.md).
- At 834, the F115LB's own kit did the same after a swap.
- The dot is now drawn at the end of the answer's own box, so the line breaks after it: "Rigging Kit ·" over "6 more offered".
- The head's text and a screen reader still get "Yamaha F90LB · 3 more offered" once, from a span that is not drawn.
- The first try was a dot span beside the answer. The overlap ruler caught it at 1440, and it was redone.

**The undo toast reached the masthead's "TOTAL" at 1440.** The band beside the pill holds a 324px card at 1440. The build's longest step, "Yamaha F115LB off the quote again, and the F90LB back on with its rigging kit · Put it back", wrapped to four lines and stood 8–98px, over "TOTAL" at 95. From 1440 to 1679px the toast's words are now the kit's small size, three lines, ending at 70.

**Two rulers read a page that was about to move, or text that was covered.** Both were found by the gate.

- **The refusal ruler failed at 390 and 834** in the full run, and again in each of four runs alone.
  - At 834 the masthead now carries the boat's photograph. The search's hint, scrolled under the stuck masthead, was inside the window, so it was shot where it stood, behind the masthead: 1.04 : 1.
  - At 390 the masthead's eyebrow, which sticks above the window once the page moves, could not be brought into view.
- **The fix is in `e2e/rulers/measure/read.ts`.**
  - A run whose centre the window shows as a sticking or fixed bar it is not in is now moved into view first, like a run outside the window.
  - A run inside a sticking bar is read at the top of the page, where the bar rests.
  - Being covered never fails a run on its own.
- **The build brings a pressed chapter in a beat after the press.** At 390 the window was at 0 when the page had settled and at 902 a moment later. The refusal walk and the press flow now wait for the window to rest (`cameToRest`, in `e2e/mint.ts`).
  - The press flow needed it once heads further up were read for a cut: its mouse went down on "Give it to the customer" during the move, at 1280 and 1440.

Six decisions record all of this in `docs/DECISIONS.md`, dated 2026-10-20.

## The gate, alone

Before the gate, four `vite` servers (eight processes) left by earlier agents on ports 6791, 6802, 6816 and 6819 were stopped. Nothing else ran beside the gate except the Playwright MCP server.

**`npm test`, on the final tree**: 233 test files, 3,852 tests, 16 static rules, no failures (298 s wall).

**`npm run build`**: green, with one warning. The `ui` chunk is 502,930 bytes, 2,930 over Vite's 500 kB line.

**`npm run e2e`, first reading**: 1,680 tests. 1,258 passed, 417 were skipped by design and 5 failed, in 91.9 minutes with 2 workers.

| Failure | Size | What it was |
|---|---|---|
| "pressing a motor moves the build on to the name, then the finale" | phone | Passed alone. The machine. |
| "the door and the act give when held down" | desktop | Passed alone. Later it was red at laptop and desktop on the final tree, which made it real: see above. |
| "nothing overlaps — configurator" | desktop | Real, and this pass's own: the first dot span. Redone. |
| "the sale's refusals" | phone, tablet | Real: the ruler (see above). |

**Second reading**: `npx playwright test --last-failed --timeout 120000 --workers 1` gave 3 passed and 2 failed (the refusal ruler) in 49 s. That reading ran on a tree that already had the dot redone and heads read by their own boxes.

**On the final tree**, with every fix in, these were run at six sizes with 2 workers: the configurator, cascade, document and press flows, and every ruler (contrast, cut, density, fixture, focus, overlap, ramp and refusal). The result was 936 tests: 587 passed, 349 skipped by design and 0 failed, in 44.9 minutes.

The shell flow passed at six sizes in the run before. The only change since then is the build's head markup and two specs. The route's fade-through was in the full first reading, where no screen's flow failed on it.

## One quote, walked cold

Each walk used a fresh browser profile on the final build, driven by Playwright at 1440 × 900, 834 × 1112 and 390 × 844. The phone was an emulated touch device and was pressed by taps. Each walk did this:

1. "Test Desk" at the door.
2. Stacer, "519", the 519 Sea Ranger SDF · Centre Console.
3. Start the quote.
4. 01 The hull.
5. 02 Motor:
   - the F115LB pressed with the F90LB on: one press, the swap
   - then Ctrl Z at a desk, or the toast's Undo in a hand
6. 03 Trailer, then 04 Dealer fit.
7. See what Trade does, then Leave it as it is.
8. Who it is for, with "Jordan Test", then "On to the finale".
9. Give it to the customer, photographed at 300ms and again at rest.
10. Open the document.

No console error, page error or failed request was raised at any size. The favicon 404 is gone.

| | 1440 × 900 | 834 × 1112 | 390 × 844 |
|---|---|---|---|
| The swap, one press | $55,223 → $57,560 | $55,223 → $57,560 | $55,223 → $57,560 |
| Undo | Ctrl Z, back to $55,223 | Ctrl Z, back to $55,223 | the toast's Undo, back to $55,223 |
| The F115LB tile before the press | "+$2,337 instead of the F90LB" | the same | the same |
| The toast | top right beside the pill, 1100–1424 × 8–70, over nothing drawn | bottom right, 462–818 × 1026–1096, over the shut heads' chevrons | above the tab bar, 12–378 × 706–776, over the motor tiles |
| Back from the cascade | `?at=fit`, $55,223 | the same | the same |
| After the name is saved | the act is "On to the finale"; the eyebrow says "for Jordan Test" | the same | the same |
| Totals through the give, every frame | 0 moved in 83 frames | the finale's total moved 0.1px (754.9 → 755) and the head's did not | 0 moved in 91 frames |
| Focus after the give | Open the document | Open the document | Open the document |
| Where the paper opens | /document | /document | /document |

The photographs are in `docs/directions/<screen>/built/`:

- **`picker/`**: `picker-<size>-stacer519.png`
- **`configurator/`**:
  - `configurator-<size>-stacer519.png`, the arrival
  - `-finishes`, the hull
  - `-motor`, then `-motor-toast` (the swap and its toast)
  - `-trailer` and `-fit`
  - `-who`
  - `-finale`, `-giving` (300ms into the give) and `-issued`
- **`cascade/`**: `cascade-<size>-stacer519.png`
- **`document/`**: `document-<size>-stacer519.png` and `-full.png`, and `document-1440x900-arriving.png`, the route 110ms after "Open the document"

What the walk saw of the critique's findings:

- **The change of mind is one press at every size.** The tile says what the press will do ("+$2,337 instead of the F90LB"). The toast says it as a person would ("Yamaha F115LB put on the quote instead of the F90LB, with its rigging kit · $16,667"). Ctrl Z takes it back with its own sentence and "Put it back". The F90LB's kit goes with it, and Dealer fit names the F115LB's.
- **The boat stays on the tablet's screen.** At 834 the masthead carries the 519's photograph beside the name and the total through every chapter, and it takes the leaf frame when the quote is given.
- **Giving the quote answers on the boat at a desk.** At 1440 the stage's photograph is ringed in the given leaf, the card turns "Given to Jordan Test" under the seal, and "Open the document" takes the keyboard. "$55,223" did not move.
- **At a desk the stage fits the window.** The 519's people are whole at 1440 in every shot, from the arrival to the give.
- **The dashes name the open chapter**: "02 Motor", "04 Dealer fit", "Who it is for", "The finale".
- **Dealer fit's rows** lead with the name, with the code quiet under it. There is no repeated toolbox, and no pill where there is no figure.
- **The picker**: "519" finds seven boats as one run of cards with each series named over its card. The tick is only on the chosen card, at its foot.

## Still wrong

- **The toast still lies over content below 1440** for its five seconds. At 834 it covers the chevrons of the shut heads at the rail's foot. In a hand it covers a motor tile above the tab bar. This is decided (DECISIONS 2026-10-19), and the band beside the pill is too narrow there.
- **At 834 the finale's total moves 0.1px when the quote is given** (754.9 → 755), inside the flow's half-pixel allowance. The fixers measured it at 0.31px.
- **The paper names the boat in brackets**: "Stacer 519 Sea Ranger SDF (Centre Console)". This is decided (DECISIONS 2026-09-25: the paper keeps the model's name in one piece). The build and the cascade say "· Centre Console".
- **The paper and the cascade say the trailer's size as the file's range, "4.9 - 5.3 m".** The build's trailer tile says "for a 4.9–5.3 m boat". This is critique minor 12's second half. It belongs to `lineSaid` in `src/domain/quote/spoken.ts`, which every screen reads, and was not changed here.
- **A pressed open chapter still does not shut** (the build's one-chapter-open address, DECISIONS 2026-09-24).
- **Left open by the fixers, with their reasons in `docs/DECISIONS.md`**:
  - the kit's `Chapter` and `Stat` are not used on the build
  - Northside's mark still has nowhere to be added (major 7, Milestone 4)
  - of the plan's named effects, only the progressive blur, the spotlight and the shiny text are in the screens
- **The `ui` chunk is 502,930 bytes**, 2,930 over Vite's 500 kB line.

The owner has not looked at any of it.
