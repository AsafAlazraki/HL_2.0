# Rules (`/rules`), verify 1 — data round, 2026-11-04

I am a new verifier and had not seen the screen before this. I served the build on port 6254 from `e2e/out/dist-6254`. I came in through the real door: a name, then **Load the Master Price File**. Every press was a mouse press at the place the word is drawn. Screenshots are in `verify-1/`, with the size in each file name. The server was stopped before this report.

## What was run

- `e2e/flows/rules.spec.ts` at all six sizes on port 6254. Every test passed except one, **"the finder on a build says what each chapter says"**, which failed at every size it reached:
  - expected `/1\smore offered/`
  - received `"2 offered"`

  The configurator's motor head now reads "N offered" when no motor is chosen, so the assertion is stale. The run hit my 590 s cap at 84 of 90.
- vitest on `src/screens/rules` and `src/domain/rules/constraints`: 23 files and 333 tests, all passed.
- My own walk (a Playwright script, not committed) over every state at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080.

## Jobs

| Job | State | Evidence |
|---|---|---|
| J1 read the house rules | DONE | `01-arrive-*`, `01-arrive-full-*`. 7 clauses, 3 noticed, "Northside has written none yet". |
| J2 see where the list breaks its rule, and fix it | PARTLY | ✓ F6 opens on 3 breaks, A2 on its 72 under (15 groups, "Show the other 3"), F16 on 8 (one group, "written on 8 lines"). Each has a door to its line; `02-look-F6-door-*` lands on `join_stacer_yam?at=…:402` with the line open.<br>✗ The line it lands on is the pairing. The shaft and transom that conflict are not shown there, so the fix still has to be found on another list.<br>✗ A3's 127 of 4,017 cannot be listed; the page says why (it is counted on the workbook).<br>✗ The workbook's 16 of 571 on F15 are now measured as 0 of 501, and the page never says the workbook's 16 are gone. |
| J3 write the tiller rule, page holds still | DONE | scrollY was unchanged across the four words at every size: 1793, 1290, 1310, 642, 568 and 933. `04-chosen-*`, `05-ready-*`. |
| J4 see what it takes before adding | DONE (minor) | ✓ "The 45 offers taken away, by name", one line per model (`06-taken-*`).<br>✓ The maker press names all 29 Highfield models, with the losers in weight (`07-maker-named-*`).<br>✓ "Tried on the Highfield Classic 340" is found by typing and kept as `?on=` (`06d-one-boat-340-*`).<br>✗ The 289 marks are `aria-hidden` and carry only a `title`. They cannot be reached by focus or by a touch. |
| J5 warn / off | DONE | Toasts: "Your rule warns from the next pick." and "Your rule is switched off." (`11-warns-*`). |
| J6 rewrite, delete, undo | DONE | The Undo toast reads "Your rule is back where it stood." (`12c-undone-*`). |
| J7 adopt a noticed pattern | DONE for 1 of 3; the other 2 are refused with a sentence | Both Rigging boxes say "It cannot be said as Northside's: it decides a kit, and a rule here decides a motor or a trailer." (`15-noticed-rigging-*`). |
| J8 a rule about one boat model | DONE (minor) | ✓ The finder narrows by typing and groups by maker (`21-boat-model-finder-1280x800`).<br>✓ The empties warning shows: "The Stabicraft 2350 Ultra Centrecab would be offered no trailer: all 3 your price list makes for it are taken." (`13-heads-up-*`).<br>✗ The finder opens on **Surtees** first, while the count beside it orders makers Formosa…Surtees. |
| J9 rigging, propellers, P/D, parts, "needs" rules | NOT | Left out on purpose and said where it stands (DECISIONS 2026-11-03). |
| J10 an exception, or two conditions | DONE (minor) | ✓ "except the Highfield Classic 340" gives 36 of 513 (`09-except-*`). "And another of the boat's specs" works (`09b-and-*`).<br>✗ An exception of a model the rule never touches ("except the Surtees 495 Pro Fisher" on the tiller rule) is accepted with figures unchanged (61, 45, 171) and no word (`22a-except-irrelevant-1280x800`). |
| J11 name one motor | DONE | "When the boat's maker is Highfield, the motor's model must not be Yamaha F25SWTC." gives 67 of 289, 45 of 2519 and 1 of 241 (`14c-motor-model-chosen-*`). |
| J12 the salesperson's "See the rule" | DONE at 390 and 1280 | `23-build-refusal-*`, `23b-see-the-rule-*`. The refusal is said once with its because, and the rule opens to be read. |
| J13 has a rule ever refused something | NOT | The page says the past is not kept. "On your quotes" lists today's draft: "20261104-01 · draft — Highfield Classic 340: carries no motor it refuses" (`23c-on-quotes-*`). The quote reference is not a link. |
| J14 what the price list's clauses do in the build | DONE | Each clause carries one of: "In the build: kept by the lists", "said where it is broken, never refused", or "not enforced" in the noticed boxes. |
| J15 print to sign | DONE (minor) | `18-print-*`, `18-print.pdf`:<br>• It runs to **three A4 pages**, each part on its own page under `break-inside: avoid`, with page 1 two-thirds blank.<br>• No Northside name and no price-list date are printed.<br>• "is off" prints with its dotted control underline.<br>• It is not "one page Northside could sign". |
| J16 no file | DONE | `20-no-file-*`: "The price list is not on this computer yet…" with the load act. |
| J17 stale link | DONE (minor) | ✓ `?open=zzz` says "That rule is not on the list any more…" and drops the param (`16-stale-*`). A dead `?look=` is also dropped.<br>✗ `?on=zzz-no-boat` stays in the address.<br>✗ `?look=F15`, `F8`, `F7` and `F12` (live clauses with no breaks) open a panel that says "Where the price list breaks it, offer by offer — each on its line…" with nothing under it and no empty sentence (`02-look-F15-1280x800`). |
| J18 keyboard and reduced motion | DONE | The tab walk at 390 and 1280 has a ring on every stop and wraps cleanly. Motion lives only under `prefers-reduced-motion: no-preference`, and scroll is `instant` when motion is reduced. |

## Missing items

| Item | State | Evidence |
|---|---|---|
| 1 Measures open on their exceptions, counted live | PARTLY | The counts are measured off the loaded sheet (`houseMeasures.ts`): F8 626/626, A2 72/778, F6 3,289/3,292, F16 1,533/1,541. Lines have doors. Gaps: A3 stays on the workbook, and the sheet line does not show the broken values. |
| 2 What a rule takes, by name; every mark named; try on one boat | DONE except marks on focus and press | See J4. |
| 3 Clauses say what they do; Northside can overrule | PARTLY | They say what they do. Overruling with a because was not built: "enforced by the lists themselves", recorded. |
| 4 Rigging, propeller, P/D and parts rules; "needs" rules | NOT | Deferred with reason. |
| 5 "and", "except", and a motor's or trailer's model | DONE | See J10 and J11. |
| 6 Said before added: empties, contradicts, repeats | DONE (minor) | See the list below. |
| 7 A record of refusals | NOT | Only today's quotes are covered. |
| 8 Print | DONE (minor) | See J15. |
| 9 The six refuted, shown quietly | DONE (minor) | `17-refuted-*`. Three problems:<br>• The lines are the workbook's text, with straight apostrophes, "PLUS" in capitals, and the cell reference "Motor Library!FF WEIGHT".<br>• The figures are the workbook's constants, yet the lead says "Looked for in your price list".<br>• The lines are not numbered. |

What is said before a rule is added:

- **Empties:** `13-heads-up-*`.
- **Contradicts:** `22b-contradict-1280x800`. Four heads-ups appear. Three of them quote the other rule's whole sentence, so it reads three times. Two of them name only the Classic 340 and 360 of the five boats affected, and the GRT 425 is named twice.
- **Already says it:** "It says what "…" already says." (`22c-same-again-1280x800`).
- **Repeats a noticed pattern:** "It says what your price list was noticed doing: nothing it makes breaks it, so it takes nothing today." (`22d-noticed-repeat-1280x800`).

## The bar at six sizes

**Across the six sizes:**
- No horizontal scroll at any size: `scrollWidth == innerWidth` everywhere.
- No visible truncation in the rules screen.
- No target under 24 px, apart from a 1×1 visually-hidden input.
- No console errors.

**390×844: NOT PERFECT.**
- The written clause's "Rewrite 2.4" stands about 9 px right of the line above it (`10-added-390x844`).
- The Undo toast covers the last line above the tab bar (`11-warns-390x844`).
- In one run, a press meant for "Rewrite 2.4" after "is off" left the clause open on **warns**. My script reproduced the toggles cleanly alone (`x-off-*`), so this is PLAUSIBLE only: the toast's Undo sits where the clause's acts are.

**844×390: NOT PERFECT.**
- The model finder shows only two options in its 180 px popup (`08c-finder-typed-844x390`).
- The focus ring of "Highfield Classic 340" touches the "e" of "Tried on the" (`06d-one-boat-340-844x390`).

**834×1112: PERFECT on every state I read** (`04-chosen-834x1112`, `17-refuted-834x1112`, apart from the copy noted in item 9).

**1280×800: NOT PERFECT.** `?look=` on a clause with no breaks draws an empty "offer by offer" panel (`02-look-F15-1280x800`).

**1440×900: PERFECT apart from what is shared** (`06-taken-1440x900`, `12c-undone-1440x900`). Writing leaves the sentence column about 380 px tall beside a count column running past the fold. That is density, not a failure.

**1920×1080: NOT PERFECT on balance.** In `04-chosen-1920x1080`:
- About 700×650 px is blank under the act (x 528–1230, y 420–1080) while the count runs off the screen to the right.
- The 2.3 glyph peeks out beside the pill's mark at the top-left.

**Every size:**
- The finder's maker order disagrees with the count's.
- The contradiction heads-up is repetitive.
- The print runs to three pages.
- The refuted copy is in workbook grammar.
