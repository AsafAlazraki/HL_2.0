# The sheet (`/data/$table`): a fresh judge, 2026-11-03

**Verdict: deepen.** The composition is right for the job it was drawn for. It has a header with the maker's mark, one series as a chapter on a blue bar, a model spine that says once what its variants share, rows that say only what differs, the record opening under its row, and the step line with Undo. On Highfield it reads like the maker's own price list, and I would not throw that away.

It is not at the level it has to be. It has one edit bug that writes a wrong price, two overlaps you can see in a screenshot, and an empty search that shows nothing. Half the price file is not a boat list, and the boat-list layout is stretched over those lists (parts, dealer fit, rigging kits, motors, labour, the fitment pairings). It also lacks the admin's tools: filter by column, a rise in percent, guards against a price below cost, and a mark on what Northside changed.

The owner called this "a decent start, not at the level it has to be". That holds. The work below is large, and none of it is a new composition for Highfield.

Served from my own build on port 6220 (`e2e/out/dist-6220`), entered through the real door with the real Master Price File (53 lists, 15,691 lines), and driven headless at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080. There are 75 screenshots in `before/`, named below. The server was stopped before this was written. Nothing in `src/` was touched.

---

## 1 · The jobs, and each one done

Who uses this screen:
- The **admin** (Asaf, or whoever keeps the price file). The sheet is his workbook.
- The **salesperson at the desk**. The sheet is where he checks a figure or a code the build does not show.

The jobs come from SCREENS.md row 47, the screen's code, DECISIONS (2026-09-23 through 2026-10-31), LATER, and what a dealer's price-file keeper actually does in a week.

| # | Job | Who | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Find a line by model, code or word | both | `?find=Sport 560` → `02-find-sport560`; `?find=HBS122` → `34-find-code-1440`; 390 → `43-find-390x844` | **Works.** It filters in place and counts per series (Sport 15, every other series 0). The header says "15 match 'Sport 560'". |
| J2 | Search finds nothing | both | `?find=zzqx` → `33-find-nothing-1440` | **Fails.** It shows column heads over 690 px of blank page. The only words are "0 match 'zzqx'" in 11 px type in the header. There is no sentence, no "look in the other 52 lists", and no way to clear it beside the empty space. |
| J3 | Read a model's variants at Cash, Trade and Warranty | both | `01-highfield-1440`, `11-chapter-sport-1440`, `12-sport-scrolled-1440` | **Works and reads well.** The spine reads "PVC $41,340 · HYP $48,350"; each row has its code and three prices. The weakness: Sport repeats one price seven times per material (see G9). |
| J4 | Change one price | admin | Press the cell, Enter, type, Enter → `03`, `04`, `06`, `07` | **Works by Enter, with Undo.** The step reads "Cell edit · Highfield Inflatables · Cash on Roll Up 230 KAM · PVC · WH: $2,770 → $850", and Undo puts it back. |
| J5 | Change a price by typing straight onto the selected cell | admin | Select a cell, type `2850`, Enter (see G1) | **BLOCKER. It writes $850.** The first key is dropped. A value of 5321 typed the same way wrote $321. |
| J6 | Type a wrong value and be told | admin | Type `12abc`, Enter → `05-cell-refusal-1440` | **The refusal works:** the pill under the cell reads '"12abc" is not a number'. **But the field shuts and the draft is thrown away.** Focus goes back to the grid, so the person retypes from nothing. |
| J7 | Open a line's details (the record) | admin | `?at=` → `08`, `09`, `09b`; 390 → `42-record-390x844` | **Works.** Every column is in its section, cost is marked "cost, the dealer's own", the source line ("line 282 of the Boat Module tab") is given, and the acts are What goes on this boat, Add a variant, Delete. **The picture comes first:** 446 × 335 px at 1440. At 1280×800, none of the record's facts are above the fold. |
| J8 | Change many at once | admin | Press, shift-press 7 rows → `10-selection-1440` | **Partly.** The mixed set is listed with counts (Figma's pattern), and the acts are "Fill down from the top row" and "Set every Cash to…". **There is no arithmetic:** no +4 %, no +$100, no "round to $10". The values print unformatted ("2770 × 2" where the grid says $2,770). The plate covers six rows of the list. |
| J9 | Move between series | both | Press Sport → `11` (`?in=Sport`) | **Works.** The address holds it, and the count is on each series tab. |
| J10 | See only the models | both | "Only the models" → `13-only-models-1440` (`?read=models`) | **Works well.** One line per model, with its price per material and four shared facts. The best state on the screen. |
| J11 | See the pictures, and what has none | admin | Pictures door → `14-pictures-1440`, `44-pictures-*` | **Works.** "WITHOUT A PICTURE 2" is said truthfully: "the maker's web address … with no copy on this computer". |
| J12 | See every column, cost included | admin | Every column → `15-every-column-1440` | **Works as the escape hatch.** It scrolls sideways inside the grid (5,064 px in 1,361) and keeps the page from scrolling sideways. It inherits `?read=models`, so it opened with every model shut and nothing in the 33 columns. |
| J13 | Show one hidden column | admin | "26 more" → `16-more-columns-1440` | **Works.** The popover groups the columns by where their words already are, with Show on each. |
| J14 | Read the list at Trade, not Cash | both | The price head is the switch (`aria-pressed`) | **Works, but is hidden.** The only switch is a pill in a column head. Nothing says the spines follow it. |
| J15 | Add a variant (a new colourway arrives) | admin | Record → Add a variant → `31-add-variant-1440` | **Thin.** It adds a blank line under "OTHER", headed "(no name)", and the picture plate reads "Add a picture of the" (the sentence stops). It does not offer to copy the WH line, its code or its prices, which is the actual job when a maker adds a colour. |
| J16 | Delete a line | admin | Record → Delete this line… → `30-delete-ask-1440` | **Works and is honest:** "This also removes 2 pairings from 2 tables. It can be put back with Undo." |
| J17 | From a hull, go to what fits it | both | Record → What goes on this boat → `/fitment?boat=boat_highfield:1` (`32-to-fitment-1440`) | **Works,** in one press. |
| J18 | Read Parts (2,937), Dealer Fit (1,777), Rigging Kits (650) | both | `20-parts`, `21-dealerfit`, `28-rigkits`, `45-parts-*` | **Not at the level.** See G3, G4 and G5: Dealer Fit has no price column, the name column is cut while 41 % of the width holds one category name, and cost figures named "CTD" are drawn without the cost mark. |
| J19 | Read Yamaha Outboards (209) | both | `23-yamaha-1440` | **Thin.** HP is not a shown column. "Yamaha - F4SMHA" repeats the code beside it. A 563 px series column holds one line for 138 motors. |
| J20 | Read a fitment list (Highfield × Yamaha, 2,519) | admin | `22-join-hf-yam-1440`, `46-join-*` | **Not at the level.** Each boat is said as its file key "Highfield - RU230KAM (PVC) WH", in 588 bands of 1 to 12. The heads change size between 1-pairing and 2-pairing bands. "RECOMMEND…" is cut. At 390 the column head says MOTOR over boat names. |
| J21 | Read Labour Rates and Registration | admin | `26-labour-1440`, `27-registration-1440` | **Thin.** Rates print as "144.55" and "143.1": money with no $ and no second decimal. "Actual 105" in the header has no meaning attached. Four columns sit in the left third of a 1,361 px grid. |
| J22 | An unknown list; no file on this computer | both | `50-unknown-list-1440`, `51-no-file-1440`, `52-no-file-390x844` | **Works.** Each is a sentence with the door ("Nothing on the price list is called 'no_such_list'. Every part of it is listed on Data."). |
| J23 | Know what Northside changed against the maker's file | admin | After J4, `06-cell-written-1440` | **Missing.** The changed cell looks like every other cell. Only the step line, the History screen and the Shelf know. |
| J24 | Be warned before selling under cost | admin | J5's $850, against Landed Hull Cost $1,671.43 and Trade $2,631 on the same line | **Missing.** Cash under cost, and Cash under Trade, are both written without a word. The file carries every figure needed to say it. |

---

## 2 · The perfect bar, at each size

The guard probe at all six sizes: the page never scrolls sideways (document `scrollWidth` equals `clientWidth` at 390, 844, 834, 1280, 1440 and 1920), and the grid scrolls sideways only in Every column. Everything below is what a screenshot shows.

### 390 × 844: NOT PERFECT
- `40-rest`, `41-scrolled`, `42-record`, `43-find`, `44-pictures`, `45-parts`, `46-join`.
- **The chrome takes 330 px of 844 (39 %) before the first model:** the mark, the title over three lines, the finder, the series strip, the doors, the sentence "Press a boat to see and change its Model Code, Trade, Warranty and the rest.", the column head, and the band.
- **The column head reads VARIANT over model cards.** It reads MOTOR over boat names on the fitment list (`46-join`). A head names what is under it, and here it does not.
- Parts: "SAFETY GEAR EQUIPMENT (NB: Exclud…" and "PFD's - Personal Floatation Devices 30 pr…". The *count* is what gets cut.
- The fitment title is cut to "× Yamaha — …", so the hand never learns which list it is on.
- The record (`42`) is good: Back, the name, the picture, then label over value.

### 844 × 390: NOT PERFECT
- `40-rest`, `42-record`, `45-parts`.
- **About four rows of 390 px are content.** The shell pill, header, series strip and doors, column head and band take 225 px (58 %).
- The series strip is cut as "Patro" under the doors.
- The band's shared facts are cut: "3 air …".
- The record's name is cut to "Roll Up 230 KAM · PVC…", and its picture fills the remaining height. On a turned phone the record has no fact in view.

### 834 × 1112: NOT PERFECT
- `40-rest`, `42-record`, `45-parts`, `47-parts-overlap-834`.
- **OVERLAP on Parts:** the finder (y 113–149) stands over the blue band's sentence "188 categories, each said once beside its products" (y 140–160). The top 9 px of the sentence are under the input (`47`). It happens on every grouped non-boat list, because the header has no right column to hold the finder.
- Trade and Warranty are gone at 834: the boat list shows Cash only, behind "28 more". A dealer on a tablet cannot compare Cash with Trade without opening a record.
- Product names are cut at about 26 characters ("Inflatable Deluxe PFD - Adult 150…"), with 100 px empty at the right of the grid.
- Record title cut, as at 844.

### 1280 × 800: NOT PERFECT
- `40-rest`, `42-record`, `45-parts`.
- The rest state is the best composition on the screen: 18 variant rows, spines with renders, and the price per material.
- The record puts a 450 × 335 picture before any fact, so editing a field means scrolling about 700 px.
- Parts at 1280: the category column is 519 of 1,201 px (43 %), while product names are cut at 308 px.

### 1440 × 900: NOT PERFECT
- `01`, `03`–`17`, `20`–`35`, `48-parts-head-overlap-1440`.
- **OVERLAP on Parts' column heads:** the lit price pill "SELL" (x 1124–1169) is drawn over the right-aligned head "SELL INC INSTALL (IF APPL.)", which spills left out of its 116 px column. It reads "SEL[SELL]NSTALL (IF APPL.)" (`48`). The same at 1920.
- **The white flag reads as an unticked checkbox.** WH is not decoded (colourway.ts says WH is one of the four unread tokens), so WH rows draw an empty slot. The LG rows draw a 12 px grey rounded square, which looks like a disabled checkbox on every second row (`01`, zoomed in `z-check`).
- The spine is a 596 px column. Beside a 15-variant model, 300–400 px of it is blank white (`11`, `12`, `02`). Beside an open record it is a 600 px empty column (`08`, `09`).
- "shown in White / White / White…" is cut on the Sport spines.
- The step plate floats over the last 60 px of the list (`06`). That is accepted, but it covers a spine's last lines.

### 1920 × 1080: NOT PERFECT
- `40-rest`, `44-pictures`, `45-parts`.
- The boat list is good: the spine says every shared fact without "+n more", and 29 rows show.
- Parts carries the same SELL head overlap.
- Pictures holds six cards across, with whitespace below a short series. That is fine.

### States
| State | Verdict |
|---|---|
| Empty search | **Fails** (J2) |
| Unknown list, no file | Pass |
| Long name | Parts and Dealer Fit names are cut in every size. The category spine is cut at 834 and 390. The count is what goes first. |
| Refusal | The pill is right; losing the draft is wrong (J6) |
| Expanded and collapsed | Only the models and the open record work. The record's picture-first order fails at 844×390 and 1280×800. |
| Popovers | "26 more" is clean. The selection plate covers six rows and prints raw numbers. |

---

## 3 · The level it has to be

Each gap says what the best tool for this job (Airtable, Grist, Excel and Sheets, AG Grid, Retool) gives the person that this screen does not. It says whether the price file honestly carries what the gap needs, and how severe it is.

### Blockers

- **G1 · Typing onto a selected cell drops the first key and writes the wrong price.**
  - The cause: `Grid.tsx:1789–1790`. The editor mounts with `autoFocus` and `onFocus={(e) => e.currentTarget.select()}`, so the seed character the keystroke started is selected and replaced by the next key.
  - Measured: typing 2850 wrote $850; typing 5321 wrote $321.
  - The best tools (MUI's "any printable key", which the sweep itself cites; Excel; Sheets) keep the seed and put the caret after it.
  - This is the sheet's one promise ("edited at speed"), and it currently writes a figure the person never typed.
  - The fix is small; the test that should have caught it is missing.
- **G2 · Two overlaps a screenshot shows.**
  - The finder over the band sentence on every grouped non-boat list at 834 (`47`).
  - The lit "SELL" pill over "SELL INC INSTALL (IF APPL.)" at 1440 and 1920 (`48`).
  - The overlap ruler did not see either. Its own SCREENS row says "thin evidence on this screen", with 274 positioned layers set aside.

### Majors

- **G3 · Dealer Fit Packages has no price on its price list.**
  - Its reading columns are Category, Package and Code (`21`).
  - The file carries "Sell" and "Act Sell" but no declared price level. The screen's lit price comes from price levels, so a list with none shows none.
  - The best tool always shows the sell figure. The file carries it.
  - Fix: declare the list's levels (a decision for `/levels`), and have the sheet say "No price is declared for this list — Prices" where the price column would be. A sentence where the price would be, rather than nothing.
- **G4 · Cost not marked as cost.**
  - Dealer Fit's spine prints "Labour CTD $1,014.71" (`21`). Rigging Kits prints "Total Install CTD $130.09" and "Parts & Accessories 1 CTD $0" (`28`). None carries the cost mark.
  - The packer's `costColumns` lists "CTD, MU, GP, CTD, Labour" for Dealer Fit and "Dealer, MU, GP ($), Total CTD" for Rigging Kits. "Labour CTD", "Kit CTD", "Total Install CTD", "NSM Lab ($)" and the four "P&A n CTD" columns are not in those lists, so the sheet draws them as ordinary facts.
  - CTD is the file's own word for cost to dealer. The sheet is admin-only, but "cost said to be cost" is the screen's own rule (sheet.spec, critic 22).
  - Fix: the cost list for these columns should be confirmed with Northside, and not guessed by the sheet.
  - Also: "Total Lab $7.80" sits beside "Lab Hrs 4" and reads like hours drawn as dollars. The file does not say its unit, so the sheet should not print a $ on it unless the list declares one.
- **G5 · The boat layout stretched over lists that are not boat lists.**
  - Parts, Dealer Fit, Rigging Kits, Motors and Labour use the same spine-plus-rows layout. The spine takes 41–43 % of the width to hold a category name and a price range, beside up to 138 rows (`20`, `23`, `28`).
  - Meanwhile the names people search by are cut ("Battery (MFM50 Supercharge) + Battery Box, …", "Minn Kota - Instinct Quest 60" (Black) with Qu…").
  - The best tool lets the column a person reads take the width (AG Grid's pinned group column is narrow; Airtable's group header is one line).
  - The file carries what is needed. For these lists the spine should be a sticky one-line band, not a column.
  - This is the largest single piece of "not at the level", and it is a per-list layout decision inside the same frame, not a new direction.
- **G6 · Motors without horsepower.**
  - Yamaha's reading columns are Motor, Model Code, Sell, Trade (`23`). "HP Rating" is one of "22 more".
  - Every motor conversation at the desk starts from horsepower, and fitment is by HP.
  - The file carries HP Rating, Shaft Length and Control. The motor list should read like Yamaha's own price list: HP, shaft, control, price.
  - "Yamaha - F4SMHA" beside "F4SMHA" says the code twice.
- **G7 · Fitment lists said in the file's keys.**
  - "Highfield - RU230KAM (PVC) WH 1 pairing" × 588 bands (`22`, `46`). The rest of the app says this hull "Roll Up 230 KAM · PVC · White" (`spokenBoat`, DECISIONS 2026-10-29).
  - The best tool (Airtable linking, the sweep's D) groups by hull, model first: "Roll Up 230 KAM — PVC and HYP, WH and LG: F4SMHA ★".
  - The file carries it: 4 variants of RU230KAM share one motor.
  - The 1-pairing and 2-pairing bands draw their heads at two sizes (`22`), and "RECOMMEND…" is cut.
- **G8 · An empty search shows a blank page** (J2).
  - It should be a sentence where the list would be: "Nothing on Highfield Inflatables matches 'zzqx'." Then the lists that do match (the Find pill already searches the whole file), and Clear.
  - CLAUDE.md: "A refusal is a sentence with its reason, where it is refused."
- **G9 · Find and filter are words only.**
  - The admin's real questions:
    - which lines have no Trade price
    - which are Discontinued
    - which Cash is under Landed Hull Cost
    - which models have no picture
    - every Max HP of 150 or more
    - every line changed since the last file came in
  - The finder matches text. There is no column filter, no "is empty", no comparison, and no sort, and the screen says it is "a grouping and never a sort" (judge two's change, 2026-09-23).
  - Airtable, Grist and AG Grid all give a filter per column and saved views. The file carries every one of those questions.
  - A filter is a URL param and a pure derivation in `src/domain`, which fits the house rules. Review (`/review`) answers some of these as cases, but the sheet should be able to show them as a filtered list.
- **G10 · No arithmetic on a selection.**
  - "Set every Cash to…" sets one value. A dealer's real moves: Highfield +4 % from 1 January; round every Trade to $10; HYP is PVC + $1,800.
  - Sheets and Airtable do this with a formula fill, and the old engine had `apply.ts` for levels.
  - `/levels` owns Trade as a percentage of Cash. A rise across a selection belongs on the sheet, with the mixed set before and after, one command, one Undo.
  - LATER defers **Promotions** (time-bounded overrides) and **landed cost and FX**. A plain rise on a selection is neither, so this is not a LATER item.
- **G11 · No guard against a price under cost, or Cash under Trade** (J24).
  - The line holds Landed Hull Cost $1,671.43, Trade $2,631 and the new Cash $850. Each comparison is on the same line in the file.
  - The admin surface may show cost, so the sheet should say: "Cash $850 is under this hull's landed cost $1,671.43 — Keep it / Undo". Use the sheet's warning severity (Sheets' "Show a warning", in the sweep), not a refusal.
  - LATER's "Margin gate with typed-reason override" is a quote-side gate. This is the price file's own sanity check, so it is not overruled. If the owner wants the quote gate too, his "mammoth work" words now overrule LATER line 10, and it should be said as that.
- **G12 · Nothing marks what Northside changed** (J23).
  - The Shelf keeps "Northside's work safe" against a new file, but on the sheet a changed cell is invisible.
  - The best tools mark it: Sheets' edit history per cell, and Grist's cell history.
  - Fix: a quiet mark on a cell that differs from the file as it was loaded, and "Changed by Asaf, 3 Nov · was $2,770" in the record. The event log already holds who and when (commands with events).
- **G13 · The record shows the picture before the facts.**
  - 446 × 335 px of picture before the first field at 1440. At 1280×800 and 844×390 no fact is in view (`08`, `42-record-1280x800`, `42-record-844x390`).
  - The admin opens a record to change a field. The picture should sit beside the identity on a desk, small in a hand, with the prices first, as in the price-list order.
  - The 600 px blank spine beside an open record (`08`, `09`) is the same room unused.
- **G14 · Adding a variant gives a blank row.**
  - "(no name)", and "Add a picture of the" stops mid-sentence (`31`).
  - The real job: a maker adds a colourway. Copy an existing variant with its prices and shared facts, then change the code and colour.
  - The best tools offer Duplicate record. The file carries the sibling to copy from.
- **G15 · The colour flag looks like a checkbox, and WH has no colour.**
  - The LG flag is a 12 px rounded grey square on every second row (`z-check`, `01`).
  - The WH, I, O and R tokens are undecoded, which is honest per colourway.ts ("a question for the dealer").
  - The best tool puts the question where it can be answered: "WH is not a colour this app can read yet — name it". A colour legend the admin owns is part of "deep backend configuration".
  - The shape of the flag should not read as a form control.

### Minors

- **G16.** The selection plate prints "2770" where the grid prints $2,770, and covers six rows (`10`).
- **G17.** Labour Rates prints money as "144.55" and "143.1", and "Actual 105" in the header is unexplained (`26`).
- **G18.** At 834 Trade and Warranty fall behind "28 more" (`40-rest-834x1112`). A tablet keeps three prices if the code column narrows.
- **G19.** The step line still says engine words: "Cell edit · Highfield Inflatables ·", "Row added · Highfield Inflatables". Better: "Cash on Roll Up 230 KAM · PVC · WH: $2,770 → $850", and "Added a variant to Roll Up 230 KAM".
- **G20.** The record's labels are the file's headers: "Shaft Lgth S", "Tube Dia. cm", "Matrix", "Boat Highfield - RU230KAM (PVC) WH". These are editable fields, so they stay, but the label can say "Shaft length · S (short)". SP300 is said as "SP300" while its neighbours are "Sport 330".
- **G21.** The Trade/Cash switch is a pill in a column head. Nothing tells a person that the spines follow it.
- **G22.** At 390 the chrome is 39 % of the screen (the tablet and phone parity LATER line 25 was a Milestone 2 pass and is past). The header should fold into one line once scrolled. The series strip fade cuts "Pa" and "Patro" at 390 and 844.
- **G23.** Every column inherits `?read=models`, so it opens on 16 shut models with 33 empty columns (`15`).

### What LATER defers, and whether the owner's words now overrule it

- **Promotions** (line 7) and **landed cost and FX** (line 9) stay deferred. G10 and G11 are not them.
- **Margin gate** (line 10): only if the owner wants the quote-side gate now (see G11).
- **Tablet and phone parity** (line 25) is overruled by "ensuring responsiveness on every single size". G18 and G22 are its debt.

---

## 4 · The verdict

**deepen.** The frame does the job:
- a mark-headed list
- series chapters in the address
- the model spine with its per-material price
- rows that say what differs
- the record under its row
- three doors
- one command per write with Undo
- truthful refusals and truthful empty pictures

Only the models (`13`) and the Highfield rest state (`01`, `40-rest-1920x1080`) are close to perfect. The mammoth work, in order:

1. G1, the dropped first key: fix it and test it.
2. G2, the two overlaps, with the overlap ruler taught to see a header pill and a finder over a band.
3. G8, the empty search as a sentence with the way out.
4. G3, G4 and G6: the right price, the cost mark and HP shown on every list, read from the list's own declared levels and cost columns. Northside confirms the CTD columns.
5. G5 and G7: a per-family layout inside the same frame. Boats keep the spine. Parts, packages, kits, motors and labour get a one-line sticky band and the width for their names. Fitment lists are said hull-first in spoken names.
6. G9 and G10: column filters as URL params with pure derivations, and arithmetic on a selection, each one command with Undo.
7. G11 and G12: under-cost and under-Trade warnings, and the changed-cell mark with who and when.
8. G13, G14 and G15: the record facts-first, Duplicate a variant, and the colour flag that is not a checkbox, with its question put to the admin.
9. The minors.

Then judge the six sizes again with screenshots.
