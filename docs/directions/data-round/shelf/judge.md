# The shelf (`/shelf`), judged — data round, 2026-11-04

I judged this screen fresh, without having seen it before. I served it from its own build (`e2e/out/dist-6290`, Vite's preview on port 6290, started and stopped by Playwright inside each foreground run). I reached it through the real door with the real Master Price File: a name, then *Load the Master Price File*, as `e2e/door.ts` walks it. I gave one real quote first (the deepest model to R. Kelleher, `e2e/mint.ts`'s walk), so the inventory carries a true 1.

The workbook brought in is Northside's own **Parts Module (2).xlsx** (39.8 MB, `C:\Users\Asaf\dev\mpf-workbooks\`). No fixture was used. The one paste is a real row of the same workbook's Parts Maintenance sheet (line 676, the IBC "Tube Covers to suit PVC Boat - 2.0 Mtr" at Sell 1,300, as Parts Module (1) carries it).

One Chromium context at 1440 × 900 was resized to each of the six sizes, at device scale 1. The phones therefore ran without touch emulation.

**Screenshots.** 115 frames are in `before/`, each with its size in the file name:
- At all six sizes: states 01, 03–09, 12, 14, 16, 17 and 19. Where a page is longer than the window, states 01 and 04 add a `-full` frame.
- At 390 and 1440, plus at most one other size: 02, 10, 11, 13, 15, 16b, 18, 20, 23 and 24.
- At 1440 only: 09b, 21 and 22.

**What I measured** in every state at every size where it was shot:
- sideways scroll;
- any element past the window's edge;
- text cut by its own box;
- controls under 44 px;
- the type sizes in use;
- page height and word count;
- console errors.

**What measured clean.** In every state at every size:
- sideways scroll was 0;
- nothing was past the edge;
- no text was cut (the only hits were the visually hidden "changes:" labels, which are meant to be 1 px);
- there were no console errors.

**Speed.** Reading the 39.8 MB workbook in the browser took **2.2 s**. Apply wrote 3,899 changes in **1.2 s**, Undo put them back in **1.5 s**, and Save a copy wrote 10.3 MB in **1.3 s**. The engine underneath is fast and honest.

**Verdict: REDRAW**, aimed at the change sheet (`?see=changes`, with the paste page beside it). The rest page (direction D, "The safe") is the right composition for saving and bringing back a copy, and it gets the deepen list in §3.

The change sheet is the screen's reason to exist: *see every change before it is written*. On the real file it cannot do that job:

- **Dealer Fit hides every figure.** It applies 1,625 changes and does not show one of them. Every line reads **"9 figures · and 9 other figures"** (`23-dealer-fit-open-1440x900`). The count is said twice, and no column is named.
- **Most Parts lines hide what moved.** Every changed line says "and N other figures" and never names them. The 243 lines whose Sell did not move read **"4 figures · and 4 other figures"** (`09-applied-1440x900`).
- **The 47 "can't be placed" lines are hard to reach.**
  - They are appended after 2,250 changed lines, paged 40 at a time.
  - Reaching them took **57 presses and 16 s**. The page is then **129,526 px tall at 1440 and 212,428 px at 390** (`24-cannot-lines-*`).
  - Each one says why ("two lines here share this name") and offers nothing to do about it.
- **The work stops at reading.**
  - Nothing can be searched, filtered or grouped. Parts Maintenance carries a Supplier column, and the sheet never uses it.
  - No line can be left out. The "Look at these first" list (Dee Shackle $98 → $3, −97%) says "each is worth a look" and gives no act for that look.
  - Apply is all 3,899 or nothing, at the foot of the page.

A folded list of names, each with one figure, cannot carry a re-issue of this size. It needs a new sweep and three drawn directions. The rest page is not wrong, but it does not say which price list this computer holds. It keeps no record of what was brought in before. It does not say which quotes being written a new file would move.

---

## 1. The jobs, and each one done

**Sources.** I drew the jobs from:
- `docs/SCREENS.md` rows 146 (the shelf), 153 (restore on the Document) and 154 (after the M4 critic);
- `src/screens/shelf/*` and `src/domain/io/{workbook,newFile,envelope}.ts`;
- `docs/DECISIONS.md` 2026-10-30 (two entries) and 2026-11-03 ("a list brought in by the Shelf is compared with the packed file");
- `docs/LATER.md`, which defers standard inclusions and factory options until the Boat Module and Factory Options Module workbooks arrive. The screen says this honestly in its head.

### The admin who keeps the price file

| # | Job | Done on the screen | What happened |
|---|---|---|---|
| A1 | Bring in a new Master Price File as the .xlsx it arrives as | `03-read-*` | Done in 2.2 s. The band says "Parts Module (2).xlsx is read. Nothing is written yet. 39.8 MB, not dated inside" with **3,082 change · 817 new · 61 can't place**. |
| A2 | See what moves before anything is written | `04-changes-top-*`, `05-check-all-*` | The head is good: "**12,609** of 15,691 lines stay exactly as they are", a share bar, and a census that includes "0 taken away". Two lists are folded to one sentence each. |
| A3 | Find the price that jumped | `05-check-all-*` | **25** lines more than double or fall below half: Dee Shackle $98 → $3 (−97%), Tycab wire $6 → $70 (+1067%). They can be read and nothing more. No press opens the line on the price list, and none leaves it out. |
| A4 | Read one list's changes in full | `06-list-open-*`, `07-longest-*`, `23-dealer-fit-open-*` | Parts & Accessories shows `$83 → $92 Sell +11% · and 5 other figures`; the five are never named. Dealer Fit shows **no figure on any of its 1,625 lines**: "9 figures · and 9 other figures". |
| A5 | Find one product in the change set ("what did the IBC tube cover do?") | — | **Cannot be done.** There is no search, filter or supplier grouping. 2,297 Parts lines are paged 40 at a time. |
| A6 | Settle the lines that can't be placed | `24-cannot-lines-*` | **Cannot be done.** 61 lines are kept out with a reason ("two lines here share this name, so it cannot say which it means"), and there is no act to say which line was meant. Parts' 47 come after 2,250 others: 57 presses. |
| A7 | Apply, and take it back | `08-apply-foot-*`, `09-applied-*`, `10-shelf-applied-*`, `11-undone-*` | "Apply 3,899 changes", with Undo said before it, and "A quote already given: untouched." Done in 1.2 s. Undo works from the sheet and from the band (1.5 s), and the band then reads "Put back". |
| A8 | Apply part of a file (one list, or all but a suspicious line) | — | **Cannot be done.** It is all or nothing. |
| A9 | Paste a few lines from Excel | `12`–`15-paste-*` | With the list's own heading, *Product*, it works: `$1,640 → $1,300 Sell`, "Apply 1 change". **With the workbook's own heading, "Parts & Accessories Module", it is refused**: "No pasted heading reads Product…" (`15-paste-refused-*`). A row copied straight from Northside's sheet is refused, and the page offers no way to point at the name column. |
| A10 | A wrong file at either door | `02-refusal-wrong-file-*`, `20-copy-refused-*` | Each refusal is a good sentence where the file was dropped: ".json is a saved copy… it comes back through Bring back a copy, below"; "broken.json has been changed since it was saved, or did not finish downloading". |
| A11 | Know which price list this computer holds now, and what was brought in before | — | **Not on the screen.** The edition (packed 16 September 2026, the fingerprint) is not shown, and neither is any earlier import. The applied step lives in memory and is gone on reload. |
| A12 | Clear the price list back to the file as it came | `17-clear-*` | It is a page of its own. It counts what goes (53 lists, 15,691 lines) and what stays (1 quote, 1 customer). The amber act is "Save a copy first". |

### Northside's work kept safe (admin, or whoever closes up)

| # | Job | Done | What happened |
|---|---|---|---|
| S1 | See what a copy would hold | `01-rest-*` | Six kinds, counted: Quotes 1 (1 given, 0 being written), Customers 1, Rules 0, Settings 0, Pictures 0, the price list 15,691. "No copy saved yet." |
| S2 | Save a copy | `18-saved-*` | Done in 1.3 s, a 10.3 MB `Northside Marine copy 2026-11-04 1319.json`. The plate then says "Last copy saved today at 1:19 pm". |
| S3 | Bring a copy back on a new computer | `19-restore-*` | The page counts the copy before anything is replaced. It says "**The copy's 1 quote joins them … unless a quote by the same number is already here**". On this computer the copy's quote **is** the quote already here, and the screen does not say so. |
| S4 | Forget everything before a computer is handed on | `16-forget-*`, `16b-*`, `21-*`, `22-*` | It is refused in a sentence until a copy is saved: "Save a copy first: none has been saved on this computer, so nothing of this could come back." After a save it goes ahead and lands on `/sign-in`. |

### The salesperson at the desk

The salesperson has no job of their own here. They need two answers the screen does not give:
- *did today's new file move the quote I am writing?* Drafts read the live price list; `e2e/routes.ts` says "a draft's lines are still moving".
- *when did prices last change?*

Neither is on the shelf, and the shelf is the only place that knows.

---

## 2. The perfect bar, state by state

**Clean everywhere, measured.** Sideways scroll was 0, nothing spilled, no text was cut and there were no console errors, in all 26 states at every size shot. **Nothing in §2 is an overflow.** What is not perfect is composition, scroll, density and words.

| State | Verdict | The element, measured |
|---|---|---|
| 01 rest, 1440 / 1280 / 1920 | **NOT** | The page opens on Northside's mark and three lines of lede, about 190 px, and **does not say which price list is on this computer**. The *Save a copy* head wraps its subtitle to an orphan "file." between the title and "No copy saved yet". 34 of the 47 text runs measured on the page are 12–13 px. At 1920 the page is a 976 px column with 472 px of empty water each side, and nothing gains from the width. |
| 01 rest, 390 | **NOT** | The page is 2,204 px tall. The band works. "Paste lines from Excel instead", "Choose a copy on this computer" and "Back to the shelf" are **28 px tall**, against the 44 px a thumb is owed. The rest is clean. |
| 01 rest, 844 × 390 | **NOT** | The window shows only the head and the band. Save a copy starts at 390 px, the window's bottom edge. The 190 px head costs half the window. |
| 02 wrong file | PERFECT | A sentence with its reason, where the file was dropped. |
| 03 read | **NOT** | "3,082 change · 817 new · 61 can't place" has no "of 15,691" and no unchanged share. The band carries no way to set the workbook down (only "Bring in a different workbook"). On a reload the read is forgotten without a word. |
| 04 change head, all six sizes | Nearly | The census and the "stay exactly" headline are strong. The share bar is blue then ochre with **no legend**: the ochre is everything that is not unmoved, while the census uses blue, green, ochre and grey. |
| 05 look at these first | **NOT** | Its sentence says "more than double or fall below half", but the rule is `swing ≥ 2` (`newFile.ts:393`), so "Rope Swage $1 → $2 +100%" and "Vent $4 → $2 −50%" are on it. Figures print as **"$242.1"** and **"$672.1"** because `dollars()` sets `minimumFractionDigits: 0` against its own comment, "$242.10". There is no act on any line. |
| 06 list open | **NOT** | "and 5 other figures" on almost every line, never named. Every line spends a second row on "Line N in the workbook" in link blue that is not a link. At 390 each line is 96 px, so 2,297 lines are about 220,000 px. |
| 07 longest name, scrolled | **NOT** | The longest name, "Dual Battery Upgrade · 1 x MFM70 Battery, Dual Battery Switch, S/S Tray & Terminals", wraps cleanly. Once scrolled, the list's head (its name and Fold) leaves with the page, so 2,000 lines down nothing says which list this is or folds it. The floating pill then sits over the head's last pixels ("Parts" under the pill, `07-longest-1440x900`). |
| 08 apply foot | **NOT** | With one list opened twice (120 lines), Apply sits **6,697 px** down at 1440 and **11,234 px** at 390. Nothing stays on screen. |
| 09 applied | **NOT** | "4 figures · and 4 other figures" on the same line, the same count said twice (`Changes.tsx` `Line`: `others = figures` when Sell did not move, and the figures cell also prints `figures`). The head still says "12,609 … stay exactly" in the present tense after the change is on the price list. |
| 10 / 11 band applied, undone | Nearly | Clear. But after 3,899 changes it does not offer the obvious next act, Save a copy. |
| 12 paste, empty | **NOT** | At 1440 the page is a 928 px select and a textarea, with about 400 px of empty water. "Choose a list" offers 25 lists with a bare number and no noun. |
| 13 select open | Nearly | The count has no noun ("1,777"). |
| 14 paste read | **NOT** | "Undo puts all **1** back in one step" ("all 1"). "Read Product, Supplier, Code, Sell; left out … Supplier Description" is one dense 12 px run. |
| 15 paste refused | **NOT** | The workbook's own heading is refused, and the page offers no act to say "this column is the name" (§3). |
| 16 forget | PERFECT (1440, 390) | The refusal is a sentence under the act. The act is visibly held. "Save a copy first" is the loud button. |
| 17 clear | PERFECT | It counts what goes and what stays. |
| 18 saved | Nearly | "Saved as … in this computer's Downloads". It cannot know the file landed there, because the browser chose. |
| 19 restore | **NOT** | It never compares the copy with this computer. It says "0 rules Northside wrote, 0 details of its settings, 0 pictures it chose" as prose zeros. It promises the copy's quote "joins them" when that quote is already here. It does not name the copy's price list edition. A reload drops the copy and lands on `/shelf` with no word. |
| 20 broken copy | PERFECT | It refuses, with its reason. |
| 23 Dealer Fit open | **NOT, blocker** | 1,625 lines, every one "9 figures · and 9 other figures". |
| 24 can't be placed | **NOT** | It sits at the end of the longest list, out of workbook order ("Line 275" after "Line 4,387"), with no act. |

**Keyboard.** Tab reaches the pill, then Choose a workbook, Paste, Save a copy, Choose a copy, Clear… and Forget…, in reading order, with no traps. Both drop zones have a button twin. Reduced motion was not exercised (the screen has almost no motion).

---

## 3. The level it has to be

What the best tool for each job would give Northside that this screen does not. Every item is something the file honestly carries, or it says what it needs.

### Blockers

1. **Every changed figure, named, in its own column.** DoltHub's diff and daff (the sweep's `live/dolthub-pull-compare.png`, `live/daff-live.png`) pin the changed columns beside the name, with `old → new` in the cell.
   - Today Dealer Fit shows 0 of 1,625 changes, and Parts shows Sell only, plus "N other figures".
   - The file carries every column's own name (Parts CTD, Labour ($), Sell inc Install, Act Sell…). `newFile.ts` already holds `from`/`to` per cited column.
   - Cost columns may show here, because the shelf is never a customer surface (CLAUDE.md). They must be labelled as Northside's own, and Sell must be read through the declared levels.
   - Why it matters: an admin cannot approve 1,625 changes they cannot see.
2. **A change sheet that is a working tool, not a scroll.**
   - A filter rail: list, supplier, higher / lower / new / can't place / other figures only, and size of swing.
   - A find field by name or code.
   - The census and Apply pinned in view while the lines scroll.
   - A virtualised list. The app already uses react-virtuoso on the price list (DECISIONS 2026-09-24). The 129,526 px page goes.
   - Supplier is a field on Parts & Accessories (the paste read it), so "IBC · 58 lines" is honest (notes §0.3).
3. **The "4 figures · and 4 other figures" double count, and "$242.1".** These are two wrong sentences on the screen today. Each is a one-line fix with a test: `Changes.tsx` `Line`, and `read.ts` `dollars`.

### Major

4. **Leave a line out, and apply the rest.** Figma's library update (`live/figma-lib-a.png`, `-c.png`) gives per-item *Update* beside *Update all*. "Look at these first" must let the admin hold the Dee Shackle back ($98 → $3) and apply 3,898. The command stays one batch with one inverse, built from the kept lines.
5. **Settle a line that can't be placed.** "Two lines here share this name" should offer the two lines by code and price, with "this one". The workbook's Code column is on the row. Once settled, the line joins the plan. Sixty-one lines today.
6. **What this computer holds, and what came before.** At the head of the rest page, in place of the mark-as-showpiece:
   - "Price list of 16 September 2026" (`manifest.json`'s packedAt, and the fingerprint). The stamp's wording is already in docs/WORDS.md.
   - A ledger of every file brought in: name, size, the day it was applied, who applied it, and changes applied or put back.
   - Today the applied step lives in memory (`appliedOnThisVisit`) and is forgotten on reload. Catalogue events are not persisted (`src/data/repository.ts`). The ledger needs a record of its own, which is a schema change (the same gap DECISIONS 2026-11-03 names).
7. **Which quotes being written would move, and by how much.** Before Apply: "2 quotes being written carry 5 lines this changes: Q-… +$340". Drafts read the live price list, and given quotes are frozen and untouched. The quote store holds every draft's row references. This is the salesperson's one question of this screen.
8. **Paste takes the workbook as it is.** Accept the sheet's own headings ("Parts & Accessories Module" for the name). When a heading is not recognised, offer *Your column → Will become* (`live/rsi-match.png`) instead of a refusal with no act. Better still, read which list from the names themselves, so the select is not the first question.
9. **Bring back: this computer beside the copy.** Two columns (Apple Migration Assistant, `live/apple-migration-choose.png`):
   - the copy's counts against this computer's, kind by kind;
   - the copy's price list edition against this one's;
   - its quotes split into "new here" and "already here".

   No more prose zeros. A reload on `?see=restore` says it dropped the copy.
10. **The rest page earns its first window.** At 844 × 390 the head and band fill the window. At 1440 the mark and lede take 190 px and say nothing a person acts on. The edition and last-copy line (item 6) belong there. Type on the working surfaces runs 12–13 px. The six sizes need a reflow drawn, not stretched: at 1920 the change sheet's columns and filter rail can use the width.
11. **After Apply, the next safe act.** "3,899 changes on the price list. Save a copy now?" Apple Time Machine's "Latest Backup … Today, 9:41" (`live/apple-tm-latest.png`) sits beside Back Up Now.

### Minor

12. "More than double or fall below half" with a rule of ≥ 2. Make the sentence say "double or more, half or less", or make the rule strict.
13. The share bar needs a legend, or should use the census's four inks.
14. "Line N in the workbook" in link blue is not a link. Make it quiet grey, and name the sheet ("Parts Maintenance, line 676").
15. Controls of 28 px at 390: Back, Paste, Choose a copy, Show all, See the N, Fold, Show 40 more. A thumb is owed 44.
16. "Undo puts all 1 back"; "Saved as … in this computer's Downloads" (the browser chose, not the app).
17. The workbook's own date: `File.lastModified` is real and can be said as "saved on this computer 12 Sep 2026", never as the edition date.
18. The applied sheet's head should move to the past tense once applied.

**What LATER defers and stays deferred:** standard inclusions and factory options (waiting on the two workbooks; the screen says so honestly), and any server-side backup (Milestone 6). The owner's words do not overrule either.

---

## 4. Verdict

**REDRAW the change sheet** (and the paste beside it): a new reference sweep aimed at reviewing a large table diff at work, and three drawn directions on Parts Module (2). The references not yet used are DoltHub's filtered diff, Airtable's or Retool's import review with per-row include, and Git clients' hunk staging. The directions must show:
- Dealer Fit's columns named;
- the IBC tube covers found by supplier;
- the Dee Shackle held back;
- the 61 can't-place lines settled;
- Apply in view;

at 390, 844 × 390 and 1920 as well as 1440.

**Deepen the rest page** with items 6, 7, 9, 10 and 11: the edition, the ledger, drafts that would move, the two-column restore, and the save prompted after Apply.

The engine is fast and honest. Every refusal is a sentence where it is refused, and the dangerous acts are pages of their own. What stands is a careful reader of a re-issue. It is not yet the tool an admin approves 3,899 changes with.
