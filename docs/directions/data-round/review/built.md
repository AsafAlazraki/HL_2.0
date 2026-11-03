# Review (`/review`), deepened — data round, built 2026-11-04

The composition stays: the case queue. One case is on one stage, with the fix as its title, the file's own cells before and after, one priced press, two named ways to leave it, what is kept, and the money on the rail.

This round deepened it against `judge.md`. Every figure below was measured on the real Master Price File, either in the vitest suites named here or in the browser at all six sizes. Screenshots of 26 states are in `after/`, 156 files in all, each with its size in the file name (`01-arrive` … `17-clean-full`).

## What the queue holds now

There are 39 cases in nine checks, ordered by what each risks on a quote (`src/domain/rules/review/cases.ts`):

| Check | Cases | Findings | Measured |
|---|---|---|---|
| A boat on sale at $0 | 1 | 9 | The 9 Formosa SRT 715/755 boats at $0 at Cash, Trade and Warranty. The like boat, the SRT 675 Enc · Half Cabin, sells at $79,760 Cash. |
| Registered as the wrong size | 9 | 9 | $819 not charged (7 × $117) and $234 charged over (2 × $117), on one sale of each trailer. |
| Sold below its cost | 2 | 6 | 4 of the 2,095 parts carrying a Sell and a CTD, and 2 of the 2,196 carrying a fitted price and a Total CTD (`belowCost.ts`). |
| One name, two prices | 3 | 3 | Unchanged. |
| On sale with no price | 15 | 34 | Parts only. The boats lead on their own, and three notes left this check. |
| A note on sale | 3 | 10 | 3 empty Mackay KR lines. In Parts: "NB: No Rego Decals…", "NB: Fuel Filter…", 3 empty lines under Special Notes and "OBSOLETE PARTS (NB: …)". In Rigging Kits: "NB: Rigging Kit – Select from…" (`notes.ts`). |
| Breaks the price list's own rule | 1 | 3 | F6, the shaft and the transom: it holds on 3,289 of 3,292 offers. The 3 that break it are two Stacer Ocean Rangers and a Sea Ranger (`houseBreaks.ts`, which reads Rules' own `measureClause`). |
| Two headings, one name | 4 | 4 | Unchanged. Each heading is said by its workbook letter (E/V, D/U, L/AD, M/AE). |
| Nothing to name it | 1 | 1 | The ePropulsion rigging kit, coded "Not Defined". The Mackay and Special Notes blanks are now notes. |

There are 79 findings in all, with Tidy 138 after them. `review().open` is 79, `noPrice.count` is 43, and Data's door reads "39 to settle".

## The judge's missing items, built

**The blocker: a true clean day.**
- `standing.ts` (new) splits the queue line by line into what stands and what was left alone.
- The clean day names each check that was left alone as left, for example *"9 trailers are still registered as the wrong size, left alone by your choice: $819 on one sale of each, not charged."*
- Only a check with nothing left alone says it holds.
- The rail says the money as *not charged, left alone* and *charged over, left alone*, never $0.
- The head reads *"0 to settle: the rest is left alone by your choice"*.
- Measured at every size by walking all 39 cases with L (`17-clean-*`). It is asserted in `Review.test.tsx` and in `review.spec.ts` at 1280.

**The whole queue in one look (J8).**
- An index lists all 39 cases. At ≥1200 it stands beside the stage, in the column that was empty ground (B13). It holds still as the page scrolls and scrolls inside itself.
- Below a desk it opens from *Every case, by check or list*.
- The cases can be grouped by check or by list (`?by=list`).
- Typing finds cases (`?find=`, `finding.ts`): every word must match, against the case's names, list, heading and codes. "lone star" finds 1 case of 39 and "Y10A-VW" finds 1.
- A case picked in the index stands on the stage, and below a desk the index closes.

**A door to every line (J9, B7).**
- Every line a case names opens the sheet at that line (`?at=`): the trailer, each unpriced line, each note, each nameless line, each line below cost, each offer that breaks a rule, and each of the two prices.
- *See both in the price list* opens the sheet found on their shared name (`?find=`), which shows both lines. The old `?at=` lit only the first.
- The two headings open the sheet's every-column door.
- The three blank Special Notes lines are told apart by where they came from: *"from line 2,905 of the Parts Maintenance tab"*.

**The fixes lines need (J4, J10, B2).**
- *Take it off sale* (`offSaleCommand`) ticks the price list's own Discontinued column in one step. A list that lacks the column (the boat lists, Mackay, Yamaha) is given it in the same step, and the Undo takes the column off again.
- A note is taken off sale with the amber press. It never gets a price field or a name field.
- *Name them apart* is offered where one name at two prices carries two codes. It refuses with a sentence until both names are written and differ (`nameApartRefusal`).
- A $0 case whose lines all say what they come with ("Supplied with Motor", "Std Factory Fit", "Not Required", "(Std)") asks first to leave them at $0, with a quiet press and no amber.

**Ordered by risk (B3).**
- The $0 boats lead. Their like boat's price is said in the lede as the sense of scale, never summed.
- The boat's lede no longer says the plug's *"$0 is meant"*.

**A line priced whole (J3b).**
- A part with an install type now says it under its name: *"No price · its Sell inc Install stays blank"*.
- What is kept says: *"Each one's Sell inc Install stays blank until it is set on its line in the price list."*
- Boats say: *"Trade and Warranty stay $0 until they are set on the line."*
- `Unpriced.staysBlank` is read off the list's declared prices and the line's own install type or hours.

**Below cost and the price list's own rules (item 7).**
- Both are measured as described above.
- A below-cost finding carries the line's price and never its cost. The screen says *"$818 at Sell, below what it costs"*, and its door says *"Its cost, in the price list"*.
- The judge's workbook figures 16, 3 and 127 are not drawn. The sheet measures F15 at 501 of 501, and A3 cannot be tested on the sheet. See DECISIONS.
- The foot says that once a price is declared for an unchecked list on Prices, its lines enter the checks.

**What a case touches: quotes (J15, review half).**
- `touching.ts` reads the quotes on this computer, by their frozen lines' list and row and by the quote's boat.
- The stage lists each quote with its reference, who it is for, the boat and whether it is a draft or given, with a door to it.
- The index tags a case with its count of quotes.
- No quotes exist on a fresh machine, so this was proven in `deepened.test.ts` on a quote shaped like a real draft.
- The warning in the build, where a line is picked, is the configurator's round.

**New since the price file (J11, half).**
- A case standing on a line written after the file was packed is marked "New" in the index and "new" on the eyebrow, and is counted on the rail (`writtenSince`).
- What a new file settled cannot be said: the file before is not kept. See DECISIONS.

**Left alone, as a list (J7, item 10, reopening 2026-10-22).**
- What is left alone is kept with Northside's file: `OrgProfile.leftAlone`, written through the catalogue's command door with its Undo and the refusal for a person set apart.
- Each key is stamped with its reason, its instant and the person at the desk.
- The foot lists each case left alone, for example *"Left as meant, by Asaf, 4 Nov 2026, 3:10 am · 4 lines"*, and brings each back on its own.
- What prefs held before today is still read until it is brought back.
- `readOrg` (`src/domain/northside/read.ts`) learnt the field. Without it the record was dropped on reload, which `review.spec.ts` caught.
- Data's door and the chandlery read the same record through `useLeftAlone` (`src/screens/review/left.ts`).

## The judge's gaps, closed

- **B4, the press below the first window.**
  - The chips are not drawn below 640px or under 500px tall; the index carries the same counts.
  - The trailer's press stands under its lede, before the cells it changes.
  - Measured with the trailer case on the stage: the press stands at y 436–488 of 844 at 390, and at 310–362 of 390 at 844 × 390 (it was at 846 and 671). At 834 it is at 510–562, and at 1280, 1440 and 1920 at 378–430.
  - A position change never resets the scroll (`resetScroll: false`).
  - After a press the stage stands on the next case at once (`pending`), and its title is focused and brought into view. Before, the stage flashed case 1 while the address caught up, and the focus went with it.
  - Asserted in `review.spec.ts` at all six sizes.
- **B5, the file's words.**
  - The trailer toast is the title's model: *"The ALP 5.3M-13B is registered Large at $283, and sells at $11,483."*
  - The priced toast is the namer's: *"Lone Star · GX-1 HS4mm Combo Winch Kit is now $2,150 at Sell."*
  - Capitals are said in a person's case (`capsSaid`): "Minn Kota · RT Terrova", "Not To Be Supplied", "Obsolete Parts". Short codes keep theirs ("CYL", "PVC").
  - "that have no Trailer" now reads "that has no name".
  - "column" is the sheet's word alone, so the twins case says "headings".
- **B6.** A refused figure marks its field (`aria-invalid`), takes the focus and brings the field into view.
- **B9.** No text on the screen is under 12px. Every 11px head is now `--text-xs`.
- **B10.** On a phone the eyebrow's check takes its own line and never breaks inside.
- **B11.** A stale `?case=` says *"That case is settled or is no longer in the price list, so the first case still standing is shown."*
- **B12.** The ticks name their check and count on hover.
- **B14.** Review never prints a cost: not on twins, and not on below cost. The sheet does.
- **J3c.** "Beside it" is now the line most like it. The GX-4 HS6mm stands beside the GX-3 HS5mm, not the wiring loom. Where nothing is like it, the line says *"Nothing like it in its heading has a price."*
- **Minor 13.** The money says *"on one sale of each trailer"*. The SCREENS row now carries the measured 6 lists and 2,561 lines.

## Measured

| Measurement | Result |
|---|---|
| vitest: `src/screens/review`, `src/domain/rules/review`, `src/domain/northside`, `src/domain/chandlery`, `src/screens/data`, `src/screens/catalogue` | 253 of 253 |
| `npx oxlint --max-warnings 0 src tools e2e` | exit 0 |
| `tsc -p tsconfig.app.json` and `tsc -p tsconfig.node.json` | clean |
| `tools/check.ts` | 601 failures, none in a file of this round: 586 in `docs/directions/data-round/catalogue/boards`, 1 in `data/boards`, 14 in `src/screens/rules` (the Rules agent's work in progress) |
| `HL2_PREVIEW_PORT=6262 npx playwright test e2e/flows/review.spec.ts` at six sizes | 71 passed, 7 skipped: the keys on the two phones, and the 39-press clean-day walk, which runs at 1280 only |
| `e2e/rulers --grep review` | 21 passed, 9 skipped by project, 0 failed |
| `data.spec.ts` "what needs Northside…" at 1280 | passed (39) |
| `review-shots.spec.ts` at six sizes (`HL2_REVIEW_SHOTS=1`) | 6 passed, no page errors, no sideways scroll at any size in any state measured |

## Tests rewritten to the new truth

- `src/domain/rules/review/cases.test.ts`: 39 cases and 79 findings in nine kinds; the order; 43 lines with no price in 16 groups, the boats apart; 75 open after the plugs are left; 41 and back to 43 after two winch kits are priced; the nameless case is the rigging kit.
- `src/domain/rules/review/checks.test.ts`: no price 43 in 16 groups with the boat first; blank and zero lines 21 and 22; the like line; nameless 1; `open` 79.
- `src/screens/review/Review.test.tsx`: rewritten for the new props, the boat first, the index, the honest clean day, the left list, off sale, name apart, below cost, rules broken, headings, and the stale address.
- `src/screens/review/Review.words.test.tsx`: opens the trailer by its address.
- `src/screens/review/read.test.ts`: the new group shape, plus capitals, prices and letters.
- `e2e/flows/review.spec.ts`: rewritten.
- `e2e/flows/data.spec.ts:58`: 37 → 39.

## Not built, with the reason

- **The configurator's warning where a wrong line is picked (J15, build half).** It is the configurator's round. Review names the quotes a case touches.
- **What a new price file settled (J11, half).** The file before is not kept. Only the cases on lines written since the packing are marked.
- **The judge's 16 and 127 rule exceptions.** These are the workbook's figures. The sheet measures F15 at 501 of 501 and cannot test A3.
- **A boat case's press is not in the first window** (y 1509 of 844 at 390). Its nine price fields stand before it, because a price must be typed first; Enter in any field presses it.

## Files

**New:**
- `src/domain/rules/review/notes.ts`
- `src/domain/rules/review/belowCost.ts`
- `src/domain/rules/review/houseBreaks.ts`
- `src/domain/rules/review/standing.ts`
- `src/domain/rules/review/touching.ts`
- `src/domain/rules/review/finding.ts`
- `src/domain/rules/review/deepened.test.ts`
- `src/screens/review/left.ts`
- `e2e/flows/review-shots.spec.ts`

**Changed:**
- `src/domain/rules/review/checks.ts`, `cases.ts`, `fixes.ts` and `byList.ts`
- `src/screens/review/*`
- `src/routes/review.tsx`

**Additive outside Review:**
- `OrgProfile.leftAlone` (`src/domain/model/project.ts`)
- `readOrg` reads it (`src/domain/northside/read.ts`)
- Data's `facts.ts` and the chandlery's `Catalogue.tsx` read `useLeftAlone`
- the review entry's comment in `e2e/routes.ts`
