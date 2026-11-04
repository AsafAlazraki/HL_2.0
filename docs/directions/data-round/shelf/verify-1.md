# The shelf, round 2: verified (2026-11-04)

A fresh verifier, read-only. Built into `e2e/out/dist-6294`, served by `vite preview --port 6294`, Northside's own `Parts Module (2).xlsx` (39.8 MB) loaded through the screen's own input, the way `e2e/flows/shelf-shots.spec.ts` does. Server stopped before this report.

- The builder's shots spec, re-run at all six sizes into `verify-1/<state>--<size>.png` (17 states × 6). Every state measured clean: no sideways scroll, no text under 12px, no control under 24px, no cut text, Apply in view, no page errors.
- My own walks (scratchpad specs, not in the tree) into `verify-1/v-*.png`: a draft quote carrying GX700W, a wrong file at both doors, Apply, Undo from the dock and from the band, a copy saved before Apply, a copy brought back that differs, clear, forget, paste with an unknown heading, keyboard, the phone's filter panel, nothing found, everything unticked.
- `e2e/flows/shelf.spec.ts` at desktop and phone: 4 passed. Vitest, changeSet, brought, beside and shelf: 40 passed.

## The jobs

| Job | State | Evidence |
|---|---|---|
| A1 bring in the .xlsx | DONE | read in 1.7 to 3.2 s at all six sizes (`02-read--*`) |
| A2 see what moves first | DONE | sentence, four-ink bar with legend, tiles (`03-changes-top--*`) |
| A3 the price that jumped | DONE | 25 doubled or halved, Keep / Leave out, "1 of 25 looked at · 1 left out" (`10-doubled-one-out--*`) |
| A4 one list in full | PARTLY | every figure is named (Dealer Fit 20, Parts 11, `06`, `07`, `v-a4-parts`). But **333 struck figures read the same as their new one** at the precision shown, e.g. "Primary Accessory CTD $479.20 → $479.20" (pack 479.204), "Transom Spacer 8 mm $8.41 → $8.41", "MFM50 MU 0.278 → 0.278" (`07-dealer-fit-lines--1440x900`, `--1920x1080`) |
| A5 find a product or supplier | DONE | find GX700 gives 6 lines (`11-find`); supplier IBC gives 58, grouped "TUBE COVERS · all 58 lower at Sell" (`05-supplier-ibc`); `/` focuses find |
| A6 the 61 | DONE | one press on the tile; "Place the 47 the Code names"; 14 settled by radio; "Line 655 of the workbook is already placed on that one" refused where it stands (`08`, `09`) |
| A7 Apply and Undo as one step | DONE | Apply 3,918 in 1.0 to 1.9 s; Undo from the dock and from the band, each about 2 s; a given quote untouched (`shelf.spec.ts`); `v-a7-applied`, `v-a7-undone`, `v-band-undone` |
| A8 apply part | DONE | "3,918 of 3,919 changes in · 1 left out: Dee Shackle…"; one tick, or the view's tick (`10`, `v-untick-view`) |
| A9 paste | DONE | "Parts & Accessories Module" read as Product; "Item / RRP" gets Item as the name and RRP "Left out", with a select on each (`15-paste`, `v-a9-paste-unknown--1440x900`) |
| A10 a wrong file at either door | DONE | "wrong.txt is not an Excel workbook…", "Parts Module (2).xlsx is a workbook, not a saved copy…" (`v-a10-wrong-workbook`, `v-a10-wrong-copy`) |
| A11 which price list, what came before | DONE | "The price list of 16 September 2026 · 53 lists · 15,691 lines · fingerprint a22d3e1051af · no workbook applied since"; Files brought in survives a reload (`01`, `13`, `14`) |
| A12 clear | DONE | its page; cleared in about 2 s; "Cleared" in the account |
| S1 what a copy holds | DONE | six kinds counted (`01-rest`) |
| S2 save a copy | PARTLY | it saves, but see gap 2: a copy saved earlier in the visit makes the screen say the applied changes are safe |
| S3 bring a copy back | PARTLY | set beside this computer kind by kind; "12,609 read exactly…, 3,082 read differently; 817 here are not in it and go"; "1 quote is already here and stays exactly as it is" (`v-s3-restore-differs`). It never names the copy's own price list or what was applied to it |
| S4 forget everything | DONE | refused in a sentence until a copy is saved, then goes to /sign-in (`v-s4-forget-refused`) |
| Salesperson | PARTLY | the draft is named with its line, "$249 → $240 −$9 in all" (`v-sales-changes`). After Apply the draft still reads Dealer fit $249 and the same total, $32,439 (`v-sales-quote-after-apply`). So "−$9 in all" never happens. See gap 3 |

## The judge's missing items

| Item | State |
|---|---|
| Every changed figure named, old → new | PARTLY: named; 333 read "X → X" (gap 1) |
| The change sheet as a working tool | DONE: filters in the URL, find, virtualised, table plus head pinned from 834 wide, Apply pinned at every size |
| Leave a line out | DONE |
| Settle a line that can't be placed | DONE |
| Edition and a record of files | DONE (one pref; DECISIONS names the Dexie table that lost) |
| Drafts a new file would move | PARTLY (gap 3) |
| Paste with the workbook's headings, "your column → will become" | DONE |
| Bring back drawn beside this computer | PARTLY: the copy's edition is not named |
| Save a copy offered after Apply | PARTLY (gap 2) |

## Gaps

1. **major: "$479.20 → $479.20".** 333 struck figures across the sheet match their new figure at the precision shown. 18 Dealer Fit lines show it inside the line. A Dealer Fit line moves Primary Accessory CTD from 479.204 to 479.20, and the screen shows the same number twice. The census counts these lines as changes. Either show the precision that moved, or say "moved under a cent".
2. **major: a copy saved before Apply counts as holding the Apply.** I saved a copy at 4:13 pm, then applied 3,899 changes. The dock said "Saved as Northside Marine copy 2026-11-04 1613.json" and offered "Save another copy". The rest page said "Last copy saved today at 4:13 pm… Keep it somewhere a new computer can reach". Neither says that no copy holds the 3,899 changes (`v-older-copy-dock`, `v-older-copy-rest`). The cause is `Changes.tsx` and `Shelf.tsx`, which test `saved` and never compare it with when Apply ran.
3. **major: what the screen tells the salesperson contradicts itself.** The head says "1 quote being written carries 1 line this moves… 20261104-01 … GX700W $249 → $240 −$9 in all". It also says "Each keeps the price it had when it was chosen". After Apply the quote still reads $249. Say what really happens: the draft keeps $249, the list now reads $240, and choosing it again gives $240. The quote itself says nothing either.
4. **major: two numbers for one label on one screen.** After placing the 47, the tile still reads "61 can't be placed" and "3,082 lines change", while the legend reads "14 can't be placed" and "3,102 change" (`09-cannot-placed--834x1112`, `--1440x900`).
5. **minor: 844×390, the head fills the first screen.** On a change sheet the dock (74 px) covers the headline "12,609 of 15,691…" (`03-changes-top--844x390`) and the legend after Apply (`12-applied--844x390`). The builder's 844×390 shots of states 05 to 11 show only the head, because the spec scrolls to the narrowing only below 834 wide. My shots scrolled there are `v-l-*--844x390`.
6. **minor: Bring back at 390.** "THIS COMPUTER" and "THE COPY" break onto two lines each, and the Kind column wraps "Rules Northside / wrote" while the number columns stay wide (`13b-restore--390x844`).
7. **minor: the 'Left out' tag sits inside the name.** It reads "Dee Shackle (Forged) w Captive Bolt [Left out] 6 mm · S/S 316G" (`10-doubled-one-out--1440x900`).
8. **minor: the h1 at 390 breaks "16 / September 2026"** (`01-rest--390x844`).
9. **minor: 'Save a copy first' after a copy.** Clear and Bring back offer it right after a copy was saved (`16-clear--1440x900`). The clear page also prints prose zeros: "0 quotes… 0 customers, 0 rules".
10. **minor: narrow text in wide cards.** The wrong-file refusal sits in a column about 320 px wide inside a 1,150 px card (`v-a10-wrong-workbook--1440x900`). The settle sentence has the same problem (`08-cannot--1440x900`).
11. **minor: the lock floats.** At 1920 a wrapped "Primary Accessory Sell" header puts the CTD column's lock beside it (`07-dealer-fit-lines--1920x1080`).
12. **minor: no word after Undo on the sheet.** The sheet quietly returns to "Nothing is written until you apply". Only the rest page says "Put back".

## The bar, size by size

None of the six sizes is PERFECT, because gaps 1, 2 and 4 show at every size. What each size adds:

- **390×844:** gaps 6 and 8. The dock and the tab bar take 203 px of 844. Otherwise clean, and the filter panel opens in place (`v-filters-open`).
- **844×390:** gap 5. The toolbar is not pinned at this height, which is right, but a list has about 250 px between the bar and the dock.
- **834×1112:** the toolbar and head are pinned (about 300 px). Clean apart from gap 4.
- **1280×800:** five figure columns plus the rest inside each line. Clean apart from gaps 1 and 4.
- **1440×900:** gaps 7 and 10.
- **1920×1080:** gap 11. Parts lines leave the GP and Parts Sell columns empty under "every list".
