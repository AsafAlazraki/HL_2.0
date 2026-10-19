# The build, closed: one full quote walked cold, and the gate alone (2026-10-19)

The owner's finish line: "do a full quote that is good enough experience to do so sitting with a customer and it is beautiful". The second components critique (`components-critique-2.md`) said the app was "mostly no" longer bland. The one place it still was bland was the build past the motor chapter, and the moment the quote is given. Three fixers answered it:

- the chapters
- the handover
- the picker and the shell

This page is the verifier's, working alone. It covers:

- what this pass finished that the fixers left for another agent's file
- the gate on the final tree
- one quote walked cold at three sizes, each step photographed
- what is still wrong

## What this pass finished

**Minor 15, everywhere a line is said.** The fixers named the trailer by its words on the build only. The cascade, the paper's register lines, the undo toast, the diary and the refusals still read "TA1400S13SB · T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m".

- `nameFirst` moved to `src/domain/quote/spoken.ts`, and `saidOnQuote` applies it with the line's own code. `goods.ts` re-exports it.
- The paper's register lines, `bands.ts`' tally and `severalOnStepSentence` read the same way.
- The code stays where the dealer reads it: quiet beside the name on the cascade, and under "The codes" in the paper's desk note.
- Walked at 1440, 834 and 390, the cascade and the paper both read "T Alloy 1400 ATM S 13" Skid Braked · 4.9 - 5.3 m".
- `spoken.test.ts` pins the rule, including a typed line and a code that is the model's own name ("Battery · MRV70 · Qty 2").
- The paper unit test and the document flow's ADV7 case pinned the old names. They now hold the name without the code, and the code printed beside it on the cascade.

**Minor 11, the toast over the rail.** From 1440px the kit's Toaster stands the card top right, level with the pill and in the empty band beside it, over the masthead's total.

- At 1440 the card measured 1100–1424 × 8–59, and nothing drawn was under it. Dealer fit's chevron is clear.
- Below 1440 the band is too narrow (290px at 1280), so the corner stays. In a hand the card stands above the tab bar, as before.
- `src/ui/Toaster.tsx` reads the width in an effect. `tools/check.ts` forbids a hand-rolled external store, and the first version used one, so it failed the check.

**A real red found by the gate.** The caret case failed once at 834 × 1112: `.cfg-state__dot`'s landing scale was still running when the search was pressed as the build arrived. The dot now lands at rest under `:root[data-still]`, as it does under reduced motion. Afterwards it passed 18 of 18: six sizes, three times each, with two workers.

All three decisions are in `docs/DECISIONS.md`, dated 2026-10-19.

## The gate, alone

Nothing else ran beside it. The only other node process was the Playwright MCP server.

**`npm test`**: 231 test files, 3,831 tests, 16 static rules, no failures, 298 s wall.

**`npm run build`**: green, with one warning. The `ui` chunk is 502,870 bytes, 2,870 over Vite's 500 kB line.

**`npm run e2e`, first reading**: 1,674 tests, 1,249 passed, 416 skipped by design and 9 failed, in 96 minutes with 2 workers.

- **6 of the failures were the document flow's ADV7 case**, one at each size. It held the cascade and the paper to the old names ("…Aluminium · TA700T-EH") and to no code printed beside them. This pass changed that spec on purpose, and the case was rewritten to the new rule above.
- **1 was the caret case at 834 × 1112.** It was a real red, fixed at its cause (above).
- **2 were the sheet's "Space opens the record under the row"**, at 834 and 1440. The record was not found within 5 s. Nothing this round touched the sheet.

**Second reading**: `npx playwright test --last-failed --timeout 120000 --workers 1`. The nine passed, 9 of 9, in 1.6 minutes. So the sheet's two were the machine.

**On the final tree**, with the dot fix and the rewritten case, the configurator, document and cascade flows were run again at six sizes with 2 workers: 305 passed, 13 skipped by design and 0 failed, in 28.6 minutes.

## One quote, walked cold

Each walk was a fresh browser profile on a fresh build, driven by Playwright at 1440 × 900, 834 × 1112 and 390 × 844. The phone was a touch device. Each walk did this:

1. "Test Desk" at the door.
2. Stacer, "519", the 519 Sea Ranger SDF · Centre Console.
3. Start the quote.
4. The hull, then Motor:
   - the F115LB put on
   - its toast's Undo pressed ($55,223 → $71,890 → $55,223 at every size)
5. Trailer, then Dealer fit.
6. See what Trade does, and back.
7. Who it is for, with "Jordan Test" saved.
8. The finale, and Give it to the customer:
   - photographed at 280 ms
   - and again at rest
9. Open the document.

No console error was raised at any size.

The photographs are in `docs/directions/<screen>/built/`:

- **`picker/`**: `picker-<size>-stacer519.png`
- **`configurator/`**:
  - `configurator-<size>-stacer519.png`, the arrival
  - `-finishes`, the hull
  - `-motor` and `-motor-toast`
  - `-trailer` and `-fit`
  - `-who`
  - `-finale`, `-giving` (280 ms into the give) and `-issued`
- **`cascade/`**: `cascade-<size>-stacer519.png`
- **`document/`**: `document-<size>-stacer519.png` and `-full.png`

What the walk saw that the critique asked for:

- **Shut chapter heads say the answer as a person says it.** For example "Yamaha F90LB · 3 more offered" and "T Alloy 1400 ATM S 13" Skid Braked". The chosen motor's and trailer's own pictures stand beside their figures.
- **Motor tiles**: a picture, the name, "90 hp · 162 kg · 20″ shaft" and the figure. The power chips sit over the list, and the rigging kit is one press away under "For the workshop". At 1440 and 834 the tiles are two across.
- **Dealer fit**: each row has its glyph and leads with its name, with the code quiet in mono under it.
- **The trailer** states "for a 4.9–5.3 m boat · 1,400 kg ATM · 13″ wheels".
- **Giving the quote is a moment.**
  - The card goes from "For" to "Given to".
  - The seal is stamped, and the leaf ink spreads from under it.
  - The name rises out of a blur, and "Open the document" arrives last.
  - "Total at Cash $55,223" never moved.
  - Below 1200 the card carries the boat's own photograph, and that photograph becomes the paper's cover.
- **The phone's masthead** is one row once the page moves: the name and the total.

## Still wrong

- **The toast still lies over content**:
  - from 1200 to 1439 px, in the corner over the rail's foot
  - in a hand, over the tiles above the tab bar, for its five seconds
- **At a desk the stage's photograph slides up under the masthead's blur** as the rail is read. In the trailer, Who it is for and finale shots at 1440, the boat is cut at its top edge, with the people's heads under the band. The stage column is taller than the room, so it scrolls before it sticks.
- **A pressed open chapter does not shut.** Its head carries `aria-expanded="true"`, and a press on it changes nothing. This is the build's one-chapter-open address (DECISIONS 2026-09-24), not a regression, but it is a disclosure that cannot be closed.
- **The paper names the boat in brackets**, "Stacer 519 Sea Ranger SDF (Centre Console)". The build and the cascade say "· Centre Console".
- **At 390 the Dealer fit head wraps** "· 6 more offered" onto a line of its own that begins with the dot.
- **Left open by the fixers, with their reasons** (`docs/DECISIONS.md`):
  - the finale moves 0.31px at 834 when the quote is given
  - the kit's `Chapter` and `Stat` are not used on the build
- **Outside this round**, from the critique, not re-measured here:
  - major 6, the bolder tech mostly out of sight
  - major 7, nowhere to add Northside's mark
  - minors 16 to 19: History's twin photograph, the peek's hyphen-broken date, the refused act's ochre, and the missing favicon
- **The `ui` chunk is over Vite's line.**

The owner has not looked at any of it.
