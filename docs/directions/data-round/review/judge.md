# Review (`/review`), judged — data round, 2026-11-04

I judged this screen fresh, without having seen it before. I served it from its own build (`e2e/out/dist-6260`, Vite's preview on port 6260, started and closed inside each foreground run) and reached it through the real door with the real Master Price File (the `throughTheDoor` walk: a name, then *Load the Master Price File*). Each of the six sizes ran in a fresh Chromium context at device scale 1, touch on for the two phones.

Every screenshot named below is in `before/`, with its size in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). `16-focus` exists only at the four desk sizes, and `17b-door-sheet-settled` only at 1440 and 390. At every size and in every state I measured:
- sideways scroll
- anything off the window's edge
- text cut by its own box
- controls under 24 px
- text under 12 px
- page errors
- what the floating pill covers

The walk at 1440 also took → through the whole queue and read every case (37 cases, then Tidy).

At all six sizes I measured no sideways scroll, nothing off the edge, no page errors, and no control under 24 px. The only "cut" readings are the rolling digits of the kit's `Figure` (1 × 1 by design), so none is real.

**Verdict: DEEPEN.** The composition is right for the job. One case stands on one stage, with the fix as its title. The file's own cells are shown as they read and as they will read. There is one priced press, two named ways to leave the case, and what is kept. A rail counts the queue and its money. This is the best register in the data section, and the queue should stay.

The page is not at the level it has to be, for four reasons:

- **Its last page is false.**
  - After every case is left alone, the clean day says *"Nothing in your price list needs you. Every check was read just now, and each one holds."*
  - It also says *"Every trailer is registered as the size its weight says. 430 trailers checked."* and *$0 not charged*.
  - All 9 trailers are still in the wrong size. Nothing was fixed (`14-clean-*`).
- **It can only be walked, never surveyed.** No view holds all 37 cases. You cannot find one list or one maker. Three of the five kinds of case give no way to the line in the price list.
- **It does not know what a line is.**
  - It asks, with the amber press, for a price on *"OBSOLETE PARTS · NB: Parts No Longer Available or Used"* and on three rows that say only *"SPECIAL NOTES"*.
  - It ranks nine Formosa boats on sale at $0 below a $4 difference on a vented cover.
  - It never offers the act these lines need: *take it off sale*.
- **It checks five things.** The file honestly carries more:
  - lines sold below what they cost Northside
  - the file breaking its own rules
  - what changed with a new price file
  - which quotes carry a line that is wrong

§3 lists the mammoth work.

---

## 1. The jobs, and each one done

**Sources.** I drew the jobs from:
- the screen's row in `docs/SCREENS.md` ("what is wrong in Northside's own price list, one case at a time, each with its fix")
- `src/screens/review/*`, `src/domain/rules/review/*` and `src/routes/review.tsx`
- `docs/DECISIONS.md`:
  - 2026-10-22: built as A; "left as meant is kept in prefs on this computer (a convenience until sync)"
  - 2026-10-28: rebuilt as E; queued by the fix
  - 2026-10-29: no "kept in History"; file words leave Review
- `docs/LATER.md`, which defers nothing that is Review's own
- `docs/research/refs/review/notes.md`
- what the admin who keeps the file, and a salesperson with a customer at the desk, truly need

**Measured on this file today:**
- 37 cases: 9 wrong size · 3 two prices · 18 no price · 4 two under one name · 3 nothing to name it. Then Tidy, 138.
- $819 not charged and $234 charged over.
- "Not checked: 6 lists … 2,561 lines". The SCREENS row still says 7 lists and 2,580 lines.
- The door took 2.5 s and Review drew in 1.2 s after it, at 1440.

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Admin | "What is wrong, and what is it costing?" | Arrive (`01-arrive-*`, `01-arrive-full-*`) | **Done.** You read *Review 37 to settle, the most money first*, the five chips with counts, then Tidy 138, and $819 / $234. The figures are honest. *$819 not charged* is 7 × $117, which is one sale of each trailer, but the screen never says "on one of each". |
| J2 | Admin | Fix a trailer in the wrong size | *Make it Large · +$117* (`03-pressed`), Undo (`04-undone`) | **Done.** The count, the money and the ticks move. The stage goes to the ALP 5.7M and the address names it. Undo brings back the same case. **Fault:** the toast speaks the file, not the dealer: *"Dunbier ALP 5.3M-13B (1,450 kgs) Fibreglass Boat is registered Large at $283…"* (`03-pressed-1440x900`). |
| J3 | Admin | Price lines on sale with no price | Lone Star, 8 lines (`08-lone`). Press with nothing typed (`08b`), *abc* (`08c`), $2,150 typed (`08d`) | **Done, three faults.** (a) The refusals are sentences at the press, but the field holding *abc* is not marked and stands above the window at 1280 (`08c-…-1280x800`). (b) *Sell inc Install (if appl.) stays as it is*, which here means it stays **blank**. The GX-1 HS4mm carries an install type of 6.0 h, so it becomes a line with a supply price and no fitted price. (c) "Beside it" is the next priced row, not a like product: the GX-4 HS6mm is shown beside *Lone Star Wiring Loom · Sell $290*. |
| J4 | Admin | One name at two prices: choose | Vented cover (`06-two`) | **Half done.** *Sell both at $133 / $129* works. The two lines carry **different codes** (Y10A-V and Y10A-VW), so they may be two products, and *name them apart* is not offered. *See both in the price list* opens and lights only Y10A-V (`17b-door-sheet-settled-1440x900`). |
| J5 | Admin | Two columns under one name | Rigging Kits "Sub Dealer Price" (`10-twins`, `10b-twins-refused`) | **Done**, and the refusal *Type its new name first.* stands where it is refused. The case is the engine's: a dealer does not think in "two columns called Code". It shows values with no column letter, and nothing leads to the columns on the sheet. |
| J6 | Admin | Name lines that have no name | Parts, 3 lines (`11-nameless`) | **Not doable with sense.** All three read *Says only "SPECIAL NOTES"*: no code, no row and no door, so nothing tells one from another. They are the file's note rows, and the amber act *Name them* invites typing a product name onto a note. |
| J7 | Admin | Leave a case alone with its reason, and bring it back | *It's meant* (`13-left-foot`), the foot's *Bring them back* | **Done, coarse.** The foot says *"68 lines are left alone."* (`14-clean`). There is **no list** of what was left or why, and it brings back **all or nothing**. It is kept in this browser's prefs only, so the salesperson's computer sees every case again. |
| J8 | Admin | See every case at once; find "what's wrong in Parts" or "anything on Formosa" | — | **Not possible.** A chip jumps to the first case of its kind, and → walks one at a time. There is no index, no search and no grouping by list or maker. |
| J9 | Admin | Open the line in the price list | Two prices (`17-door-sheet`, `17b`) | **Done for 1 kind in 5**, and only for one line of the two. The no-price, nameless and twin cases have no door. A trailer case has one only when no size admits it. |
| J10 | Admin | Take a dead line off sale | *OBSOLETE PARTS · NB…* (`09-notes`) | **Not possible here.** The only acts are to price it, to call it meant, or to call the check wrong. The file carries `__discontinued`, and the sheet can do it. |
| J11 | Admin | After a new price file (Shelf), see what is new and what the new file settled | — | **Not possible.** Data says "New since"; Review does not. |
| J12 | Admin | The 6 lists no check can read | The foot, *Set their prices* (`18-door-levels`) | **Done.** The foot names the 6 lists and gives a door to Prices. |
| J13 | Admin | Reach the clean day | Every case left as meant (`14-clean-*`) | **False** (§2, B1). |
| J14 | Admin | Work by keys | → walked all 37 into Tidy (the survey). Enter and L are in the spec walk | **Done** at the desk. The keys are not said on the phones, rightly. |
| J15 | Salesperson | "Is the price I am about to quote right?" | — | **Not served anywhere.** No screen under `src/screens/configurator` or `picker` reads `rules/review`. A Formosa SRT 715 at $0 or an ALP 5.3M at the wrong rego goes on a quote without a word. Review cannot say which drafts carry a wrong line. |
| J16 | Anyone | No copy of the file | `19-nofile-*` | **Done.** One sentence and the door. |

---

## 2. The perfect bar, at six sizes

**PERFECT at every size:**
- no sideways scroll, nothing off the edge, no page errors, no control under 24 px
- the rail and the stage at 834, 1280, 1440 and 1920 (`01-arrive-*`)
- the trailer table, the two-price cards and the tidy stage (`12-tidy-*`)
- the toasts' placement
- the no-file state
- the refusals being sentences at the press
- Undo returning the case it was pressed on

**The faults, measured:**

| # | Element, state | Where | Measured | Severity |
|---|---|---|---|---|
| B1 | **The clean day lies when cases are left alone, not fixed** | every size (`14-clean-*`, `14-clean-full-*`) | With 68 lines left alone, nothing fixed and 9 trailers still wrong, the page reads *"Nothing in your price list needs you. Every check was read just now, and each one holds."* It reads *"Every trailer is registered as the size its weight says. 430 trailers checked."* It reads *"Everything on sale has a price."* The rail reads *$0 not charged · $0 charged over* and *0 to settle: your price list is clean*. CLAUDE.md: "No fake data … the true state." | **blocker** |
| B2 | A note row asked for a price, on the amber press | every size (`09-notes`, case 28; `11-nameless`; cases 15, 23 and 26 in the survey) | *"Give OBSOLETE PARTS · NB: Parts No Longer Available or Used a price."* sits beside *Price it at Sell* in amber. Others: *"Price NB: No Rego Decals · NOT TO BE SUPPLIED, or leave it at $0."*, *"Price Supplied with Motor, or leave it at $0."*, *"Give 63/BUCKET · Bucket a price."*, and *Name them* over three *"SPECIAL NOTES"*. | major |
| B3 | The $0 boats rank 13th | queue order (survey) | Nine Formosa SRT 715 and 755 boats on sale at $0 at Cash, Trade and Warranty come after the nine trailer cases (seven $117 short, two $117 over) and after the three two-price cases, the last of them the vented cover's $129 / $133. Beside them stands *Formosa SRT 675 Enc · Half Cabin · Cash $79,760*. The lede says *"If they come with something else, $0 is meant"*, the plug's sentence, said of a boat. | major |
| B4 | The one press below the first window on a phone | 390 (`01-arrive-390x844`), 844×390 (`01-arrive-844x390`) | At 390, *Make it Large* stands at y 846–898 in an 844 window, with the rail at y 20–256 and the chips in three rows. At 844×390 it stands at y 671, 1.7 windows down, below a rail at y 68–224. After the press the page jumps back to the top (scrollY 450 → 0 at 390, 502 → 0 at 844×390), so every case on a phone means scrolling down, pressing and being thrown back up. | major |
| B5 | The engine's and the file's words | toasts, titles | Toast: *"Dunbier ALP 5.3M-13B (1,450 kgs) Fibreglass Boat is registered Large…"*, and *"Lone Star - GX-1 HS4mm Combo Winch Kit is now $2,150"* where the stage says *Lone Star · GX-1*. Capitals: *"YAMAHA 4 CYL 2.8L F150D F175A F200F · 2023>"*, *"MINN KOTA · RT Terrova"*. *"Name the 3 lines in Mackay Trailers that have no Trailer."* *"Give one of the two called "Code" a name of its own."* *"the 8 lines in Anchor Winches - Lone Star"* takes in two Lewmar lines. | major |
| B6 | A typed price refused, its field not marked | 1280 (`08c-lone-notaprice-1280x800`), every size | *"abc" is not a price.* stands at the press. The field holding *abc* is not ringed or `aria-invalid`, and at 1280 it is above the window. | minor |
| B7 | *See both in the price list* opens one | every size (`17b-*`) | It lands on `/data/parts?at=parts:399` with Y10A-V lit. Y10A-VW is not marked. | minor |
| B8 | The sheet door lands blank | desk (`17-door-sheet-1440x900`) | The page is empty at 2.5 s and settles at 3.8 s at 1440. The sheet owns this, but Review's door is where it is felt. | minor |
| B9 | Text under 12 px | every size | 11 px: the table heads *As the price list reads* and *After the change*, the peeks' *CASE n*, and *Will read at Sell / as its Product*. | minor |
| B10 | Eyebrow orphan | 390 (`01-arrive-390x844`) | *CASE 1 OF 37 · REGISTERED AS THE WRONG / SIZE* breaks with one word on its own line. | minor |
| B11 | A stale `?case=` | every size (`15-stale-*`) | `?case=band:nothing:here` shows case 1 silently, and the bad address stays. | minor |
| B12 | The ticks are mute | every size | The rail's 37 ticks are `aria-hidden`, with no name on hover or press. Only the chips act. | minor |
| B13 | The desk's left column | ≥1280 (`01-arrive-1280x800`, `-1920x1080`) | *REVIEW 37 to settle* stands alone in a column about 260 px wide. Under it the ground is empty to the foot, beside a 760 px stage. | minor |
| B14 | "A cost, not shown here" | the twin cases (`10-twins`) | The sheet the same admin opens shows cost with a *cost* tag (`17b`). Review hiding it is not consistent, and it starves J4 and §3 item 7. | minor |

---

## 3. The level it has to be

For each item: what the best tool for this job would give that this screen does not, why Northside needs it, and whether the file honestly carries it. The best tools here are Dependabot, AWS Trusted Advisor, HubSpot data quality and OpenRefine (notes §1–2).

**Blocker**

1. **The clean day says only what is true** (B1).
   - When cases are left alone, the clean day keeps each check's line honest:
     - "9 trailers left in the wrong size as meant — $819 a sale, by your choice"
     - "Everything else on sale has a price"
   - The rail's money becomes "left alone", never $0.
   - AWS keeps *Checks with excluded items 28* beside its clean count (notes §1.5).
   - **Carried:** `data.meant`, and `review()` run without the meant keys.

**Majors: function**

2. **The whole queue, in one look** (J8).
   - An index of all 37 cases sits beside the stage, or opens from the rail. It is grouped by check or by list and maker, and each row carries its money and line count.
   - It is filtered by typing ("Lone Star", "Formosa", "Parts").
   - A position in it is `?case=`, as now.
   - The admin keeping 53 lists works by list, not only by queue. AWS (*Action recommended 42*, each split by category) and HubSpot's per-check tabs both give the overview the stage lacks.
   - **Carried:** `queueOf` already orders them all.
3. **A door to every line, from every case** (J9, B7).
   - Each line on a no-price, nameless or twin case, and the trailer itself, opens `/data/$table?at=` at that row.
   - *See both* lights both rows.
   - The three "SPECIAL NOTES" rows are told apart by their place in the file. The record says *"This line came from line 575 of the Parts Maintenance tab"*, so a row's source line is carried.
4. **The fixes a line really needs** (J4, J10, B2).
   - *Take it off sale*, writing `__discontinued` through the catalogue's command door with its Undo, for obsolete and note rows.
   - *Name them apart*, for one name at two prices where the codes differ (Y10A-V / Y10A-VW).
   - A note row is not offered an amber price: a line that is a note is said as one.
   - **Carried:** Discontinued is a column. The codes are on the lines. The words *NB*, *NOTES*, *NOT TO BE SUPPLIED* and *Supplied with Motor* are the file's own. The check that reads them must be a pure derivation in `src/domain/rules/review` with a test that counts it on this file.
5. **Ordered by what it risks on a quote, not only by measured dollars** (B3).
   - A line on sale at $0 is a $0 quote, so a priced model's $0 sibling leads the queue, with its neighbour's figure as the sense of scale: "Its sibling SRT 675 is $79,760".
   - It is never presented as a sum the file does not carry.
   - The boat's lede drops the plug's "$0 is meant".
   - **Carried:** the neighbour's price is already read (`besideOnce`).
6. **A priced line is priced whole** (J3b).
   - When Sell is typed on a line with an install type, the case says the fitted price stays blank and why, or it writes the fitted price the way the workbook's own formula does.
   - **Carried in part:** install type and hours are on the line. The workbook's fitted formula (MPF_GROUND_TRUTH §6, `ROUNDDOWN(SUM(V:X))`) must be measured against the pack before it is derived. Until then the screen says the fitted price is blank, and never "stays as it is".
7. **The checks the file can honestly make, and does not.**
   - **Sold below what it costs Northside.** 4 of the 2,095 parts on sale that carry both a Sell and a CTD, for example *Battery, Lithium 12v 50Amp (Bluetooth)*: Sell $818, CTD $861.24. On the fitted price it is 2 of 2,196. It is measured today from `parts.l` against `parts.i`, and `parts.y` against `parts.s`. This is the case that loses the most money per sale, and it is shown on an admin surface only, as the sheet shows cost today, never on a customer surface. Whether a salesperson's desk may see it waits on Milestone 4's people. Until then it shows only the fact "sells below its cost", never the figure.
   - **The file breaking its own rules.** These measures stand in Rules with no exceptions named (rules judge §3.2): *555 of 571* (16 rigging-kit offers), *3,902 of 3,905* and *3,890 of 4,017*. Review is where the 16, the 3 and the 127 become cases with their lines.
   - **Dealer Fit Packages and Rigging Kits** (2,427 of the 2,561 unchecked lines) declare no price, so no check reads them. Today the foot can only send the admin to Prices. Once a price is declared there, the screen says these lists now enter the checks.
8. **What a case touches: quotes** (J15).
   - "2 drafts carry this trailer at the wrong rego", with doors to them.
   - The build says so where the line is picked. That build-side half belongs to the configurator's round and is named here so it is not lost.
   - The owner's end goal is a full quote at the desk with zero errors, and Review is where a bad line is caught before a customer sees it.
   - **Carried:** the quotes store's frozen lines name their row.
9. **New since the last price file** (J11).
   - After Shelf brings a new file in, the rail says "4 new with the 14 Nov file · 3 settled by it".
   - Data's door already reads "New since". Review is the room that should say which cases are new.
   - **Carried:** Shelf's plan keeps the file before.
10. **Left alone, as a list** (J7).
    - Each case left alone is listed with its reason (*It's meant* / *The check is wrong here*), when and by whom, and is brought back one at a time.
    - Kept with Northside's file, not in one browser's prefs. The decision of 2026-10-22 called prefs "a convenience until sync". With an admin and salespeople on different desks, it is now the wrong place.
    - Dependabot keeps the reason and the comment (notes §1.4).
    - This item **reopens 2026-10-22**, on the owner's "deep backend configuration".

**Majors: finish**

11. **The phone works its queue at the thumb** (B4).
    - At 390 and 844×390, the rail folds to one line, *37 to settle · $819*, with the chips behind it.
    - The press stands in the first window.
    - After a press the page lands on the next case's title, not the page's top.
12. **The dealer's words everywhere** (B5).
    - The toasts and titles ask the one namer, as DECISIONS 2026-10-29 says they must.
    - No file capitals, and no "have no Trailer".
    - The twin-column case is said as what it risks: "Two columns in Rigging Kits are both called Sub Dealer Price; a rigging kit's price could be read from the wrong one". Each column shows its letter and has a door to it.

**Minors**

13. *$819 not charged* says "on one of each sold". The refused field is ringed and focused (B6). The 11 px heads (B9). The orphan at 390 (B10). A stale `?case=` says "That case is settled or no longer in the file" (B11). The ticks are named (B12). The desk's left column carries the queue's index from item 2 rather than empty ground (B13). "A cost, not shown here" is made consistent with the sheet (B14). The SCREENS row's 7 lists and 2,580 lines are corrected to the measured 6 and 2,561.
14. **"Beside it" names a like product** (J3c): the same family by code or name stem, such as GX-4 → GX-4. Where there is none, it says so, rather than the next row's wiring loom.

---

## 4. The verdict

**DEEPEN.**

The case queue is the right composition for "what is wrong in the price list, each with its fix beside it":
- one case per fix
- the fix as the title
- the file's own cells before and after
- one honest press
- named ways to leave it
- the money on the rail

No new sweep is needed to find it. The owner's "not at the level it has to be" is still right. The mammoth work is:

- **the one blocker:** a clean day that is true when cases are left alone
- **the screen's missing half:** the whole queue at a glance, an index by check, list and maker, findable by typing
- **a door to every line**
- **the fixes lines really need:** take off sale, name apart, and never price a note
- **a risk-first order** that puts a $0 boat first
- **pricing a line whole**
- **four honest checks the file carries:** below cost, the file's own rules broken, the unchecked package lists, and what is new with a new file
- **what a case touches on quotes**
- **left-alone as a list** kept with the file
- **a phone that works the queue at the thumb**
- **the dealer's words** in every toast and title

Only item 10 reopens a decision (2026-10-22, prefs as the place for left-alone). Nothing in `docs/LATER.md` is overruled.
