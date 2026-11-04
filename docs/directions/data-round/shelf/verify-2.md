# The shelf, round 2: verified again (2026-11-04)

A fresh verifier, read-only. Built from the tree at `8c628a52` into `e2e/out/dist-6294`, served by `vite preview --port 6294`. Northside's own `Parts Module (2).xlsx` (39.8 MB) was loaded through the screen's own input, as `e2e/flows/shelf-shots.spec.ts` does. The server was stopped before this report.

- **My own walks** (scratch specs under `e2e/out/verify2-6294`, removed afterwards) at all six sizes into `verify-2/<state>--<size>.png`:
  - the shelf walk, 37 states;
  - a salesperson walk at 1440 and 390: a draft carrying GME GX700W, priced at Sell $249 on Prices;
  - a forget walk on day one;
  - a keyboard and reduced-motion probe;
  - a Tab count to Apply.
- Every state is measured as it is shot: sideways scroll, text under 12px, controls under 24px, text cut by its own box, figures that read the same on both sides of the arrow, and page errors.
- **Results:** no sideways scroll, no small text, no cut text, and no page errors at any size. The only control under 24px is the line tick (20×20), which sits inside a 44×44 label.
- `e2e/flows/shelf.spec.ts` at desktop and phone: 5 passed and 1 failed. The failure is the desktop round trip, and it is outside the shelf. A strict-mode clash on `getByText('Sales manager')`, which Settings now prints three times, stops it on Settings before it reaches the shelf. The same round trip passed on phone.
- Vitest (noise, copyEdition, afterChoices, changeSet, read, Shelf): 49 passed.

## The jobs

| Job | State | Evidence |
|---|---|---|
| A1 bring in the .xlsx | DONE | read in 2.2 to 3.6 s at six sizes; 3,042 change · 817 new · 61 can’t place (`06-read--*`) |
| A2 see what moves first | DONE | "12,649 of 15,691 lines stay exactly as they are", bar, legend, four tiles (`07-changes-top--*`) |
| A3 the price that jumped | DONE | Keep / Leave out on each of 25; "1 of 25 looked at · 1 left out" (`25-twice-one-out--*`) |
| A4 one list in full | DONE | Dealer Fit names 19 figures and Parts names 10 (`13`, `11`). A sheet-wide scroll scan at 1440 and 390 (3,808 names) found **0** figures reading alike on both sides of the arrow. "Primary Accessory CTD $479.204 → $479.20" (`14-dealer-fit-lines--1440x900`) |
| A5 find a product or supplier | DONE | GX700 (`17`), IBC 58 grouped "TUBE COVERS … all 58 lower at Sell" (`16`), nothing found said (`18`), `/` focuses find |
| A6 the 61 | DONE | "Place the 47 the Code names", then the tile and the legend both read 3,062 / 14 (`22`, `23`); a radio per line (`24-cannot-chosen--834x1112`) |
| A7 Apply and Undo as one step | DONE | Apply 3,879 in 1.1 to 2.6 s. Undo from the dock took 2.0 to 3.3 s and from the band (`29`). The sheet now says "Put back by Undo…" (`27-undone--*`). A quote already given is untouched (`shelf.spec.ts`, desk + phone) |
| A8 apply part | DONE | "3,879 of 3,880 changes in · 1 left out: Dee Shackle…" (`25`, `27`) |
| A9 paste | DONE | "Parts & Accessories Module read as the name" (`36`); "Item → Product, RRP → Left out" with a select on each (`37-paste-unknown--*`) |
| A10 wrong file at either door | DONE | "wrong.txt is not an Excel workbook…" (`04`), "Dealer_Fit_Module.xlsx is a workbook, not a saved copy…" (`05`) |
| A11 which price list, what came before | DONE | "The price list of 16 September 2026 · 53 lists · 16,508 lines · fingerprint a22d3e1051af · 1 workbook applied since, the last today at 5:35 pm"; the ledger outlives a reload (`35-reloaded--*`) |
| A12 clear | DONE | its own page, with what goes and what stays counted; no "first" after a copy is saved (`32-clear--*`) |
| S1 what a copy holds | DONE | six kinds counted (`01-rest-empty--*`) |
| S2 save a copy | DONE | a copy saved before Apply now reads "No copy holds them yet: … 1738.json was saved before Apply", with "Save a copy now" (`26-applied--*`). The rest page agrees (`28-rest-after--*`); after the save: "Last copy saved today at 5:38 pm" (`30`) |
| S3 bring a copy back | DONE | this computer beside the copy, kind by kind; both editions named, "The copy holds the same"; "1 quote is already here and stays exactly as it is" (`31-restore--*`). On phone, `shelf.spec.ts` passed with "1 quote comes here new" |
| S4 forget everything | PARTLY | refused with a sentence while a quote is here and no copy (`02b-forget-refused--*`). On day one it goes ahead with no copy, and "Back to the shelf" during "Working on it" does not stop it (gap 1) |
| Salesperson | PARTLY | Before and after Apply, the sheet now says truthfully "keeps $249; the price list would read / now reads $240 · −$9 if it is chosen again" (`42`, `43`). The quote itself says nothing: it still reads Dealer fit $249, $61,949, and has no word on the new list price (`45-sales-draft-after-line--1440x900`). After a reload the shelf forgets which drafts the workbook moved (gap 2) |

## The judge's missing items

| Item | State |
|---|---|
| Every changed figure named, old → new | DONE (0 alike, sheet-wide) |
| The change sheet as a working tool | PARTLY. Filters for list, supplier, way and doubled are in the URL, with find, a virtualised list, the head pinned from 834 and Apply pinned at every size. There is no size-of-swing filter beyond "Doubled or halved", and Apply cannot be reached forward by Tab (gap 4) |
| Leave a line out | DONE |
| Settle a line that can't be placed | DONE |
| Edition and a record of files | DONE |
| Drafts a new file would move, before Apply | DONE on the shelf (`42`) |
| Paste with the workbook's headings, "your column → will become" | DONE |
| Bring back drawn beside this computer | DONE |
| Save a copy offered right after Apply | DONE |

## What the last verify found, now

| # | Was | Now |
|---|---|---|
| 1 | "$479.20 → $479.20", 333 cells | FIXED: 0 in a sheet-wide scan; "$479.204 → $479.20" |
| 2 | a copy saved before Apply counted as holding it | FIXED (`26`, `28`) |
| 3 | the salesperson sentence contradicted itself | FIXED on the sheet; the quote is still silent (gap 2) |
| 4 | two numbers under one label | FIXED: tiles and legend 3,062 / 14 at all six (`23`) |
| 5 | 844×390 head under the dock | PARTLY: headline and legend now clear; the drafts sentence and the tiles are still under the dock (gap 6) |
| 6 | Bring back at 390 | FIXED: HERE / COPY (`31-restore-full--390x844`) |
| 7 | "Left out" inside the name | FIXED: said first under the name (`25--1440x900`) |
| 8 | h1 broke "16 / September" | FIXED: "The price list of / 16 September 2026" (`01--390x844`) |
| 9 | "Save a copy first" after a copy; prose zeros | FIXED on Clear and Bring back. The rest page's Forget card still reads "0 quotes, 0 customers" (gap 7) |
| 10 | narrow refusal and settle sentences | FIXED: the refusal wraps at about 680 px, the settle sentence runs the plate (`04--1920x1080`, `21--1920x1080`) |
| 11 | the floating lock | FIXED: "Primary Accessory CTD 🔒" (`14--1920x1080`) |
| 12 | no word after Undo on the sheet | FIXED: "Put back by Undo: nothing of it is on the price list now. Apply writes it again in one step." (`27`) |

## Gaps

1. **major: forgetting goes ahead on a fresh computer, and Back does not stop it.**
   - With no quote, customer or rule here, `forgetRefusal` returns null, so the press goes ahead with no copy saved. The page still offers "Save a copy first", and Stays reads "Copies saved from this computer." when none exists.
   - The page then shows "Working on it: this computer is writing." (`50-forget-day-one-working--1440x900`).
   - Pressing "Back to the shelf" leaves the page with no word (`51-forget-back-while-working--1440x900`). 2.6 s after the press the app lands on /sign-in.
   - Under load the wipe took more than 8 s. At 1280 a person on the shelf had brought in the 39.8 MB workbook (read in 3.6 s) before everything vanished.
   - The cause is `Pages.tsx` `Frame`: Back stays live while `busy`, and `acts.ts forgetEverything` keeps running after the page is left.
2. **major: the quote being written never hears of the new list price.**
   - After Apply, the draft reads "Dealer fit $249 · TOTAL $61,949", with no word that the price list now reads $240 (`45-sales-draft-after-line--1440x900`).
   - After a reload the shelf says only "1 quote is being written. When a workbook is read, the lines of them it would move are counted…". It no longer says which drafts the applied workbook moved.
   - "When prices last changed" is said on the shelf's head alone ("1 workbook applied since, the last today at 5:35 pm"), and Home does not mention it.
3. **minor: the draft is named in file codes on the shelf.** "20261104-01 Highfield SP660 (PVC) W-W-WB", where the quote heads itself "Highfield Sport 660 · PVC · White / White / White/Blue" (`43-sales-sheet-after--390x844`).
4. **minor: keyboard.**
   - Tabbing forward from find on the full sheet never reaches Apply: 400 Tabs ran through the virtualised ticks. It is reached by 16 Shift+Tabs. With IBC narrowed to 58 lines it took 70 Tabs.
   - The progress fill `.sf-progress__done` keeps `transition: inline-size 400ms` under `prefers-reduced-motion: reduce`. shelf.css has no reduce rule, so it overrides app.css's global one.
5. **minor: blank table cells mean two things.**
   - Columns are chosen across the view, so a Parts line shows empty GP and Parts Sell columns at 1920 (`26-applied--1920x1080`).
   - A line whose CTD did not move also shows an empty CTD cell (`09-changes-scrolled--1440x900`).
   - An empty cell does not say whether the figure is unchanged or not carried by that list.
6. **minor: the dock covers the head on a first screen.**
   - At 844×390 a 64 to 80 px dock under the 50 px pill hides the drafts sentence and the tiles (`07-changes-top--844x390`, `26-applied--844x390`).
   - At 390 the dock (about 140 px) and the bar (60 px) take about 24% of the height and cut the tiles (`07-changes-top--390x844`).
7. **minor: prose zeros on the rest page's Forget card.** "The price list, 0 quotes, 0 customers, the rules…" (`04-wrong-workbook--1920x1080`); "1 quote, 0 customers" (`28-rest-after-full--1440x900`).
8. **minor: a stale refusal lingers.** "Dealer_Fit_Module.xlsx is a workbook, not a saved copy" still stands under Bring back a copy after a workbook read, Apply, Undo and Back (`28-rest-after-full--1440x900`).
9. **minor: the count wraps alone.** When narrowed at 1280 and 1440, "N of 3,920 lines · Show every line" drops to a row of its own on the right (`22-cannot-placed--1440x900`, `25-twice-one-out--1440x900`, `16-supplier-ibc--1440x900`, `14-dealer-fit-lines--1280x800`).
10. **minor: names wrap early at 1920.** Dealer Fit names wrap in a column about 300 px wide and break a number from its unit: "GX750W Hideaway with 1.8 / m Aerial" (`14-dealer-fit-lines--1920x1080`).

## The bar, size by size

Every state was shot at every size. The states: empty rest, the forget page, both wrong files, read, sheet top, scrolled, end, Parts, Dealer Fit and its lines, the longest name, IBC, find, nothing found, the filter panel open, the list popup, can’t place, placed, chosen, doubled with one left out, applied, undone, rest after, band undone, saved, restore, clear, forget allowed, reloaded, paste, and paste unknown.

| Size | Verdict | Why |
|---|---|---|
| 390×844 | NOT PERFECT | The dock and bar take 24% of the height and cut the tiles on first view (gap 6). The Filters panel, the list popup, restore, paste and the forget refusal read clean. |
| 844×390 | NOT PERFECT | The dock covers the drafts sentence and the tiles; the 3-line applied dock covers more (gap 6). |
| 834×1112 | NOT PERFECT | The pinned find, filters and keep header take about 300 of 1,112 px when scrolled (`09-changes-scrolled--834x1112`); gaps 2, 4 and 7 apply. |
| 1280×800 | NOT PERFECT | The count wraps alone (gap 9); gaps 2, 4, 5 and 7. |
| 1440×900 | NOT PERFECT | The count wraps alone. The restore table puts 800 px between "Quotes" and its figures (`31-restore--1440x900`). The stale refusal stands (gap 8). |
| 1920×1080 | NOT PERFECT | Empty Dealer Fit columns beside Parts lines (gap 5), early name wraps (gap 10), and prose zeros on the Forget card (gap 7). |
