# Rules (`/rules`), verify 2 — data round, 2026-11-04

I am a fresh verifier and had not seen the screen before this. I built and served on port 6254 from `e2e/out/dist-6254` and came in through the real door: a name, then **Load the Master Price File**. Screenshots are in `verify-2/`, with the size in each file name. Files whose names start `v2-` come from my own walk, a Playwright script kept outside the repo. The other files come from `rules-shots.spec.ts`, run with `HL2_RULES_SHOTS=verify-2`. Every server I started was stopped before this report.

## What was run

- **`e2e/flows/rules.spec.ts`, all six sizes:** 96 of 96 passed. The red test from verify 1, "the finder on a build says what each chapter says", is green at every size.
- **`e2e/flows/rules-shots.spec.ts`, all six sizes:** 18 of 18 passed. It produced 169 screenshots and `17-print.pdf`.
- **vitest on `src/screens/rules` and `src/domain/rules/constraints`:** 23 files and 349 tests, all passed.
- **My own walk:**
  - Stale addresses.
  - The specs each word offers.
  - J10 and J11.
  - Share, with the clipboard read back.
  - Marks pressed by touch at 390 and 834.
  - The no-file state.
  - The tab walk under reduced motion.
  - The build's refusal and See the rule at 390, 844 and 1280.
  - Overflow, ellipsis, small targets and console errors at six sizes across five addresses.
  - The contradiction heads-up, reproduced twice at each of two sizes.
  - Switching a rule, then reloading.

## Jobs

| Job | State | Evidence |
|---|---|---|
| J1 read the house rules | DONE | `01-arrive-*`, `01-arrive-full-*`. 7 clauses and 3 noticed boxes; "Northside has written none yet". |
| J2 see where the list breaks its rule, and fix it | PARTLY | ✓ F6 opens on 3 breaks, each with three doors: the boat's transom, the motor's shaft and the offer (`02-look-F6-*`).<br>✓ A2 has 72, with "Show the other" (`02b-*`). F16 opens on its 8 (`02c-*`).<br>✓ F15 says "The workbook this rule was found in counted 16 of 571 breaking it; on the price list loaded here, none does."<br>✗ The transom door lands on the boat's record, but the value in conflict ("Shaft Lgth XL") is neither marked nor in view at 390 or 834 (`02e-transom-door-390x844`, `-834x1112`). At 1280 it sits on the last 10 px of the screen.<br>✗ A3's 127 of 4,017 cannot be listed; the page says why. |
| J3 write the tiller rule, the page holding still | DONE | The spec "choosing the four words never moves the page" passes at all six sizes. `04-chosen-*`, `05-ready-*`. |
| J4 see what the rule takes before adding it | PARTLY | ✓ The five Highfield Classics are named.<br>✓ Every mark is named by arrow key (`07-mark-named-*`) and by touch: "Highfield Classic 360: the rule speaks of it, and an offer made for it is taken away" (`v2-mark-tapped-390x844`, `-834x1112`).<br>✓ One boat can be tried, kept as `?on=` (`06d-*`).<br>✗ **"The 45 offers taken away, by name"** lists 5 lines, each reading "Yamaha F25SWTC · 1 of the 3 [or 2] made for it". They add up to 5, not 45, and nothing says the 45 are colour lines. Measured: excepting the Classic 340 moves 45/540 to 36/513, so that one model is 9 of the 45 (`06-taken-*`, `10-added-*`). |
| J5 warn or off | DONE | `11-warns-*`, `11b-off-*`. The toasts read "Your rule warns from the next pick." and "Your rule is switched off." |
| J6 rewrite, delete, undo | DONE | Spec "a rule deleted comes back from the toast, where it stood" passes at all six sizes. Rewrite 2.4 is aligned at 390 (`10-added-390x844`). |
| J7 adopt a noticed pattern | PARTLY | 1 of 3 can be said as Northside's. The two kit boxes each carry a reason: "It cannot be said as Northside's: it decides a kit, and a rule here decides a motor or a trailer." |
| J8 a rule about one boat model | DONE | The finder searches by typing and groups makers Formosa to Surtees (`08-finder-open-*`, `08c-*`).<br>The 2350 Ultra Centrecab trailer rule says "would be offered no trailer: all 3 your price list makes for it are taken" (`13-empties-*`). |
| J9 rigging kit, propeller, pre-delivery or parts rules, or a "needs" rule | NOT | The only acts are "Write a rule about trailers" and "Write a rule about motors". Part 3 says "this part is your price list's alone". |
| J10 an exception, or two conditions | DONE | "except the Highfield Classic 340" gives 36 of 513 (`09-except-*`).<br>"And another of the boat's specs" adds a second condition, with "Which more of the boat's specs" and "And is, or is not".<br>An exception that changes nothing says so (`09a-except-idle-*`). |
| J11 name one motor | DONE | "When the boat's maker is Highfield, the motor's model must not be Yamaha F25SWTC." gives 67 of 289, 45 of 2,519 and 1 of 241 (`v2-j11-motor-model-1280x800`).<br>The motor's specs on offer: maker, horsepower, shaft, model, controls, starting, tilt and trim, colour, weight. |
| J12 the salesperson's See the rule | DONE | `v2-build-refusal-390x844`: "Not offered on this boat: the Yamaha F25SWTC, because … Your rule: … See the rule".<br>See the rule lands with the clause in view at 390, 844 and 1280 (`v2-see-the-rule-*`). |
| J13 has a rule ever refused something on a quote | NOT | The page says so: "What a rule refused at the moment of a pick is not kept anywhere".<br>Today's drafts are listed, and each is a link (`15-on-quotes-*`). |
| J14 what the price list's clauses do in the build | DONE | Each of the seven says "In the build: kept by the lists" or "said where it is broken, never refused". |
| J15 print or share to sign | DONE | `17-print.pdf` is 1 A4 page with "Northside Marine · The price list of 16 September 2026 · Printed 4 November 2026" and Signed / Date lines. 2.4 prints as off with no underline.<br>Share copies the plain text and says "The house rules are copied, ready to paste where they are wanted." |
| J16 the no-file state | DONE | `v2-no-file-390x844`, `-1280x800`: "The price list is not on this computer yet…" with the load act. |
| J17 a stale link | PARTLY | ✓ `?open=zzz` says so and drops the param (`14-stale-open-*`).<br>✓ `?look=F15`, `?look=F8` and `?look=zzz` are dropped.<br>✗ `?on=zzz-no-boat` stays in the address while the rule is unfinished: `?on=zzz-no-boat&open=new:motor` kept after load. |
| J18 keyboard walk and reduced motion | DONE | 16 stops per lap at 1280, each with a ring, none off screen.<br>Under `reducedMotion: reduce` the only animations last 0.01 ms, apart from a 150 ms focus box-shadow. |

## Missing items

| Item | State | Evidence |
|---|---|---|
| 1 Measures open on their exceptions, counted live | PARTLY | 6 of 7 are counted off the loaded sheet, each with doors (F6, A2, F16).<br>3.2's 3,890 of 4,017 is still the workbook's figure, set in the same type as the measured ones. It is said in a sentence.<br>The transom door does not show its value (see J2). |
| 2 What a rule takes, by name; every mark named; try it on one boat | PARTLY | Marks are named on key and on touch. One-boat works.<br>The "45 offers, by name" list does not reconcile with its own heading (see J4). |
| 3 Clauses say what they do; Northside can overrule one | PARTLY | They say what they do. No act overrules a clause with a because: the clause acts are only "The 72 under it" and "The 3 that break it". |
| 4 Rigging kit, propeller, pre-delivery and parts rules; "needs" rules | NOT | See J9. |
| 5 "and", "except", and a motor's or trailer's model | DONE | See J10 and J11. The trailer's specs: maker, series, model, ATM, winch. |
| 6 Empties, contradicts or repeats, said before adding | DONE (minor) | Empties: `13-empties-*`.<br>Contradicts: `12-contradicts-*`, now two lines with no boat named twice.<br>When 2.4 is not refusing, the second line reads "It cannot stand beside your rule 2.4: on those and 4 more boats…". "those" is ambiguous (`12-contradicts-834x1112`, `-390x844`). |
| 7 A record of refusals | NOT | See J13. |
| 8 Print and share | DONE | See J15. |
| 9 The six refuted, shown quietly | DONE | "Looked for in Northside's workbooks and not true". Six numbered lines in prose with curly apostrophes, each with its number. No "PLUS" and no cell references. |

## The bar at six sizes

**Across all six sizes:**
- `scrollWidth - innerWidth` is 0 on `/rules`, `?look=F6`, `?look=A2`, `?open=new:motor` and `?open=new:trailer`.
- No ellipsis inside the rules screen.
- No control under 24 px.
- No console errors.

**Every size: NOT PERFECT.** The taken list's heading says 45 and its lines add up to 5 (`06-taken-*`).

**390×844: NOT PERFECT.**
- The transom door opens the boat's record with the transom ("Shaft Lgth") below the fold, unmarked (`02e-transom-door-390x844`).
- Otherwise clean:
  - Rewrite 2.4 is aligned and the Undo toast stands clear of the clause (`10-added-390x844`, `11-warns-390x844`).
  - The refusal in the build is clean (`v2-build-refusal-390x844`).
  - The finder is clean (`08-finder-open-390x844`).

**844×390: NOT PERFECT.**
- The model finder opened unfiltered starts at y≈10 and covers the shell's pill, from Find to Customers (`08-finder-open-844x390`). Typed, it sits below the pill and shows 6 options (`08c-*`).
- The focus ring now clears "Tried on the" (`06d-one-boat-844x390`).

**834×1112: NOT PERFECT.**
- The transom door opens the record with the value off screen (`02e-transom-door-834x1112`).
- The contradiction copy uses "on those" (`12-contradicts-834x1112`).

**1280×800: NOT PERFECT.**
- The focus ring of "Highfield Classic 340" touches the "e" of "Tried on the" (`06d-one-boat-1280x800`; the ring starts about 2 px after the word).
- "Shaft Lgth XL" sits on the last 10 px of the screen after the transom door (`02e-transom-door-1280x800`).

**1440×900: NOT PERFECT** only for what is shared across sizes (`06-taken-1440x900`).

**1920×1080: NOT PERFECT.**
- The same ring touches "the" (`06d-one-boat-1920x1080`).
- A sliver of the clause's icon shows at x≈590 left of the pill's mark when scrolled (`04-chosen-1920x1080`).
- The writing layout itself is now balanced: the marks fill the left column.

## Smaller things seen

- The Highfield line orders the losers "Classic 340, 360, 380, 360 LS and 380 LS". The list beside it reads 340, 360, 360 LS, 380, 380 LS.
- The sentence says "Stabicraft 2350 Ultra Centrecab (Adventure)". The heads-up and the taken list say "Stabicraft 2350 Ultra Centrecab".
- Reloading within about 200 ms of switching what 2.4 does loses the switch: on screen "off", after reload "refuses". With 1 s before the reload it is kept. This is the catalogue store's delayed write (`src/state/catalogue.ts` writeSoon), not the rules screen. It is why the shots spec's `12-contradicts` at 390, 844 and 834 drew the not-refusing wording.
