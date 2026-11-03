# Fitment, deepened — data round, 2026-11-03

The judge's verdict was **deepen**: keep the riveted plate whose three lines are the controls, and build what it was missing. This file says what was built against each job, each missing item and each gap, what was measured, and what is still not right. Every figure here was measured on the real Master Price File, in `vitest` against the pack or in Playwright against a `vite preview` build on port 6212. Screenshots of every state at all six sizes are in `after/` (114 files, `<state>-<project>.png`; phone 390×844, phone-landscape 844×390, tablet 834×1112, laptop 1280×800, desktop 1440×900, wide 1920×1080).

## The jobs

| # | Job | Now |
|---|---|---|
| J1 | What motors go on this boat, and what they cost | Each tile is the motor **rigged**: its figure, the rigging kit its pairing names (with its price, or "Price not chosen"), and the prop and engine hole said once above the tiles where all seven name them alike ("TBA" said as "Not yet known: the price list says TBA"). On this file Northside has not chosen the rigging kits' price, so one sentence over the tiles says so with a door to Prices (`/levels?list=rig_kits`), and no kit is added into any figure. With the kits' Sell Price chosen, the F175XC on the SP660 reads $25,355 + $4,040 = $29,395 (`rigged.test.ts`). |
| J2 | Compare the motors that fit | "Compare the 7 side by side" (`compare=side`) sets them as columns: horsepower, weight, shaft, controls, starting, tilt and trim, colour, rigging kit, motor, kit price, and on-this-boat where priced. A row the file leaves empty for every motor is not drawn. On a phone the table scrolls in its own box with the facts' column held; the page does not. |
| J3 | Which trailer, and is it legal to tow | Kept as it was. The two trailer tiles now stand at one height with their presses at the foot, and the one-trailer rule is said once under both. Show all gives a made trailer's ATM alone ("ATM 1,990 kg"), so the bare-hull "clears it by 1,250 kg" no longer contradicts the plate. |
| J4 | Start a quote with this boat, motor and trailer | The plate's foot says what the quote starts with ("This Highfield Sport 660, the Yamaha F175XC and its rigging kit and the REDCO … TA600T-MOB.") and what the priced parts come to ($99,698 at Cash, "before the rigging kit, whose price is not chosen yet"). Each tile has "Quote this one" (`motor=`, `trailer=` in the address; the recommended where none is chosen). **Start the quote** runs the picker's own mint and puts the build's own candidate lines on it, then opens the build. Measured: the build opened with the F200XC and TA600T-MOB on it (`fitment.spec.ts`, all six sizes). |
| J5 | What is this boat | A facts strip on the plate off the boat's own row: SP660 Length 6.52 m, Beam 2.59 m, People 13, Load 1,287 kg, Fuel 140 L, Weight 740 kg, Shaft Extra-long (25″), Steering Remote. The plate also shows the boat's own price ($61,700, prices at Cash). Never money in the strip, never a cost. |
| J6 | Why can't this motor go on | "Inside the range" splits by the file: SP660 reasons are now 74 under, 51 over, **10 "its shaft is not the extra-long (25″) this boat's transom takes"**, 20 inside and not made for it, 47 rigs; with the 7 offered that is 209. A tiller-versus-helm reason splits the same way where it applies. |
| J7 | Take a motor off a boat | Made on **every version of the model** in one step. Measured: taking the F200XCC off the SP660 left 0 of its 16 versions carrying it; the toast reads "The Yamaha F200XCC is taken off the Highfield Sport 660, on all 16 of its versions."; Undo gives all 16 back. The motor line says "6 of 209 offered" on another version after (e2e). |
| J8 | Put a motor on | Under the range is refused like over it: "The Yamaha F2.5SMHB is under the 150–200 hp the Highfield Sport 660 takes, so it is not put on. The boat's own horsepower decides that." said on its line. A made motor outside a range is drawn beyond the band's end, hollow; the band carries 150 and 200 at its ends. |
| J9 | Set the recommended motor | "Recommend it" on every tile not already starred, motor and trailer, on every version, with Undo. Measured: the F200XC became the only starred motor on all 16 versions; Undo returned the star to the F175XC. Recommending the GFAB made it the trailer a new quote starts with, across both trailer lists. |
| J10 | Open the price-list line that decides a reason | Kept; the doors now say "Open the boat's line" and "Open what fits it" (the judge's "Open its pairings" was refused by the engine-words guard). |
| J11 | Fit-out packages and their prices | Each list says "4 of 1,576 offered", the price where it is chosen, and where Northside has not chosen it, one sentence with "Choose it on Prices"; then "The other 1,572 are not made for this boat" and Show all. |
| J12 | Find a boat by name or code | The finder answers in **models**: "660" gives 3 models in 36 versions (Patrol 660 EW 10, Patrol 660 ST 10, Sport 660 16), every one drawn. Enter opens the first. |
| J13 | A boat with nothing, a missing boat | The Classic 340's Trailer line says "none made for it" over "0 of 434 offered". The missing boat is as it was. |

## The missing items

- **Fitment per model (blocker)** — `src/domain/fitment/versions.ts`: `versionsOf`, `sameAcross` ("All 16 versions of the Highfield Sport 660 take these motors, and a change here is made on every one."), `bySeries`, `findModels`. `change.ts` takes the versions and counts what it reached.
- **The rig priced (blocker)** — `src/domain/fitment/rigged.ts` (`riggedOf`, `rigSaid`, `sharedFacts`). `MotorFit.kits` is the list the boat's page reads through the motor's own pairing, priced by `mintLine`; `Made.unchosen` is `unchosenOn`, the build's and Prices' one reading.
- **Start a quote (blocker)** — `src/screens/fitment/useStart.ts` and `pickedLines` in `rigged.ts`.
- **Compare (major)** — `compareOf` and the table under the Motor line.
- **Boat facts (major)** — `boatFacts`.
- **Shaft and steering reasons (major)** — `readMotor` in `boat.ts`, read through `pairSpecs.ts`'s shaft fold and steering; sentences in `say.ts`.
- **The recommended set here (major)** — `starFit` in `change.ts`.
- **Also made for it at depth (major)** — `listHeld` in `plate.ts` and the list's sentence and door.

## The gaps

| Gap | Closed by | Measured after |
|---|---|---|
| Stabicraft 2350 "one motor" over two twin rigs | The line says "225–350 hp one motor, and 2 twin rigs made for it"; the rigs reason counts the 45 not made for it | reasons 111 + 12 + 30 + 45 = 198 = 209 − 11 (they summed to 200 before) |
| 2.5 hp accepted and drawn inside the band | Refused under the range; outside pins drawn beyond the band | `change.test.ts`, e2e at six sizes |
| Dealer Fit Packages with no price and no sentence | The unchosen sentence and door, counts and the rest | `07-sp660-also-*` |
| Show all wider than the plate, no heads, no folds, prices on 7 only | At the plate's 1,120 px; column heads; each group folds; a price on every line the file prices; a moved line stays lit and is said ("now stands under …") | density ruler at 1280×800: 26 px pitch, 18 of 18 lines (29 px and 15 lines before the line's presses were the screen's own 24 px controls) |
| Chooser flat A–Z under the explainer; search in colourways | Models under their series with their own picture; the explainer steps aside once a maker is pressed; search in models | `02-cold-highfield-*`, `03-cold-search-*` |
| Classic 340 "built for Highfield" over 0 | "none made for it" | `10-cl340-trailer-*` |
| "ALSO MADE FOR / IT" wraps; 4th reason alone | The line word never wraps; reasons take as many columns as share evenly (4 → 2 + 2 at 834 and 844; 5 → 3 + 2) | `04-sp660-motor-full-tablet`, `-phone-landscape` |
| 200 hp stack near the count; no 150/200 | The band keeps a gap before the count and carries its figures | every `04-*` |
| Trailer tiles at two heights | One height, presses at the foot, the rule under both | `06-sp660-trailer-*` |
| "prices at / Cash" orphan; Surtees alone at 390 | Price and detail on one wrapping line; makers four to a row at 390 (4 + 3) | `01-cold-phone`, `04-sp660-motor-phone` |
| Raw capitals | `seriesSaid` says a banner in its own case and keeps a maker's capitals (REDCO, GFAB, BMT); the retired list is not named | `say.test.ts` |
| Letterboxed renders in white bands | The window takes the picture's own shape (width over height), under a ceiling | `09-stabicraft-2350-*` |

## Every size: how it reflows

The reflow is written at the head of `src/screens/fitment/fitment.css` and again over the new section ("DEEPENED, 2026-11-03"). In short: at 390 the window stands across the plate's head, the version choice takes the plate's width, the facts are three to a row, tiles one to a row, the start line stacks, Show all's lines are two rows with no column heads, and a maker's models are two to a row (picture over name). At 834 and 844 the facts are four to a row, tiles three, reasons in even rows, Show all's facts column widened. From 1280 the facts stand eight across, tiles four to a row, reasons five across, Show all in the plate's column with its heads.

## The gate, measured

- `npx prettier --write` on every file of this round; `npx oxlint --max-warnings 0 src tools e2e`: 0; `tsc -p tsconfig.app.json`: 0 errors; `tsc -p tsconfig.node.json`: 0; `tools/check.ts`: 17 rules, no failures.
- `vitest run src/domain/fitment src/screens/fitment src/app src/routes`: 236 passed. `vitest run src/ui src/screens/fitment src/domain/fitment`: 366 passed.
- `e2e/flows/fitment.spec.ts` on all six projects: 63 passed, 3 skipped (the finder chord is the fine pointer's), run as phone/landscape/tablet (30 passed, 2.9 m) and laptop/desktop/wide (33 passed, 6.5 m).
- `e2e/rulers -g fitment` on all six projects: 85 passed, 41 skipped (density is measured at 1280 only; other skips are the rulers' own).
- Once, under load from another agent's run, two flows hit the 30 s test timeout at laptop and wide; both passed alone and in both final runs.

## Tests rewritten to the new truth

- `src/domain/fitment/boat.test.ts` — "counts all 209 Yamahas into one of its places" (shaft 10 and inside 20, where inside was 30); the Classic 340's sum gains shaft and steering.
- `src/domain/fitment/plate.test.ts` — "groups the other 202 motors by five reasons" (`shaft` 10 between `over` and `inside`).
- `src/screens/fitment/Fitment.test.tsx` — the motor tile (rigged, kit price not chosen, shared prop and engine hole); the reasons (five, and the door "Open the … line"); the chooser walk (maker, then model under its series, opening its first version).
- `e2e/flows/fitment.spec.ts` — counts `[74, 51, 10, 20, 47]`; the over reason's door by its new name; the cold chooser walk; the rule test's build half, which pressed the build's "Back to the 2 made for this boat", a button the build removed when its Show all became a sheet (2026-10-31) — it now reads the build's own refusal sentence with the rule's because.

New: `versions.test.ts`, `rigged.test.ts`, five cases in `change.test.ts`, `seriesSaid` in `say.test.ts`, and three flows in `fitment.spec.ts` (a motor off every version; the recommended set and a motor refused under the range; the side-by-side and a quote started with the motor and trailer chosen).

## Outside the screen

- `src/ui/Tile.tsx` gained `tick="none"`, additive: a card too narrow to keep a corner clear draws no disc, and its lit ring and pressed state say chosen. Fitment's maker cards use it. Every other `Tile` keeps its default; the kit's own tests pass.
- `src/routes/fitment.tsx` reads `motor`, `trailer` and `compare`, and hands the screen `openHref` and `openQuote`.
- `src/domain/fitment/boat.ts` exports `imageAddressOf` for the chooser's model pictures.

## Not perfect yet, and why

- Seven motor tiles leave one alone on its last row wherever the row holds 2, 3 or 4 (390 is one to a row). An odd count leaves one; a row of seven at the desk would put the rig's text at 140 px a column.
- The rig's figure is never shown on this file, because Northside has not chosen the rigging kits' price; the screen says so and opens Prices. Once a price is chosen there, the "On this boat" figures and the compare's last row appear.
- A model's picture loads as it is scrolled to, so a full-page capture shows the wells below the window empty (`02-cold-highfield-*` full pages); a person scrolling sees them fill.
- `08-sp660-all-motor-tablet` and `17-all-trailer-tablet` were captured before the 834 column widening; `16-under-refused-tablet` is after it.
- A draft already standing for the boat is handed back, and only its empty sections take what was chosen here; a section that holds a line keeps it, said in the toast.
- "Also made for it" gives one reason (not made for this boat) and the rules' count; the file carries no finer reason for a package or a part.
- The compare table chooses nothing itself; the choice for the quote is made on the tiles.
