# Milestone 4, re-verified after its fix round, walked as a sales manager would (2026-10-30)

Walked on the tree at `d328025` plus the fix round's uncommitted work (52 files: `docs/DECISIONS.md` lines dated 2026-10-30, the eight fix rows in `docs/SCREENS.md`) plus this round's one source change, the place tabs (below). Built with `npm run build`, served by `npx vite preview --port 5901`, and driven with Playwright at **1440 × 900, 1280 × 800, 390 × 844** (mobile emulation, touch) and **1920 × 1080**. Each size is a fresh browser that walks the whole milestone in one sitting. Every step was asserted, measured and photographed. The screenshots are `docs/directions/<screen>/built/m4-2-<screen>--<size>-<state>.png`: 154 of them across entry, home, picker, configurator, manage, places, data, document, shelf, quotes, customers and history. The printed quotes are `docs/directions/manage/built/m4-2-given.pdf` and `m4-2-after-restore.pdf`.

Every value typed is a walk value:

- ABN 51 824 753 556, the register's published example the e2e uses;
- "Unit 4, 1234 Gympie Road, Strathpine-Lawnton Industrial Estate, Brisbane QLD 4500", a long address chosen to break a phone;
- 07 3265 1022, walk@example.com, GST 10, 30 days;
- Asaf as "Sales manager" on 0400 111 222, and the customer "R. Kelleher".

The edited price file is a real `.xlsx` written from the pack's own Boat Module lines for the deepest model (the Highfield Sport 660, 16 lines) with Cash raised by $500 on each.

## The gate, alone

Six vite dev servers left by earlier agents (ports 5312, 5332 and 5442, each with its npx parent) were stopped first. Nothing of the repository's was running after that. The owner's Chrome and Edge were open throughout.

| step | result | time |
|---|---|---|
| `npm test` on the fix round's tree | green: typecheck, lint 0 warnings, prettier clean, **282 files / 4,460 tests passed**, check 17 rules, no failures | 424 s (vitest 354.4 s) |
| `npm run build` | green, with Vite's chunk warning: `index` **1,046,677 bytes**, `ui` 716,353 | 8 s |
| the place tabs moved (below), `npm run build` again | green, with the warning: `index` **408,384**, `pictures` 585,673, `ui` 716,353 | 6 s |
| `npm test` on the final tree | green: **282 files / 4,460 tests**, 17 rules, no failures | 421 s |
| `npm run e2e` alone, on the final tree | **2,622 tests: 2,032 passed, 590 skipped by design, 0 failed** | **2.7 h** (9,787 s, 2 workers) |

No test was red, so nothing was re-run with `--last-failed`. The nine reds the first walk counted as the app's own (Data's room count at six sizes, and the refusal board's three) all pass. The board now runs at desktop, and `refusal.spec.ts:180` and `fixture.spec.ts:365` and `:423` are green. That means the refusal ruler has read every refusal the primitives can say on this tree, `slot` and `livery` included, which it had not done since Settings was built.

The rulers on the final tree:

- contrast: 0 below threshold in 410 readings by day and by night, Settings, the shelf and a place's page among them;
- cut: 0 in 186 readings;
- overlap: 0 overlapping in 737 readings;
- focus: 1,290 Tab stops in 72 readings, 0 without a ring.

The colour refusal on Settings was also measured off the walk's own screenshots. It reads **7.82 : 1 at 1440 and 7.05 : 1 at 390**, up from 2.18 and 1.99.

CLAUDE.md still says `npm test` takes "about 110 s on an idle machine". It measured 421–424 s here, with only the owner's browsers open.

## The milestone's exit, walked at four sizes

Every row below held at **all four sizes**. The walk records each step's result in `.tmp-walk/walk.jsonl` (scratch, not committed). All 23 steps passed at every size, and no FAULT shot was taken.

| step | what was measured |
|---|---|
| Land cold, name, load the file | The door reaches Home in 2.4–2.9 s. The tab reads "Northside Marine" once the script has run. The raw `index.html` still says `<title>HelmLogic</title>` and `APP_NAME` in `src/app/ways.ts:333` is still `'HelmLogic'` (see "Still wrong"). |
| Start a draft from the picker | Sport 660 at $61,700 / $72,170 by material; Start the quote lands on the build. |
| /manage, cold | "Drawn on 20261030-01, a draft for nobody yet, the newest quote on this computer. A dashed line prints nothing." The page is exactly as wide as the window at every size, 390 included. |
| Northside's details and a person | ABN, the long address, phone, email, GST 10 and 30 days each open where they print and keep. Asaf is kept as Sales manager with a phone. **At 390 the page stays 390 wide with the long address in** (it was 410–545 before). |
| A mistyped ABN | Refused where it was typed: "These eleven digits do not add up the way every ABN's do, so one of them is likely mistyped. Check it against the ABN Lookup." |
| The mark | The white-ink file is refused with its measured 1.00 : 1. The dark file is kept, and the given quote's desk note then says "Northside Marine's own mark, as added on Settings." (it used to credit the website whatever printed). |
| A colour that breaks contrast | "White on #FFEA28 is 1.23 : 1, under the 4.5 : 1 that Northside's name on the water and the words on a chosen choice need." It is followed by "The nearest that read:" #A36B0A and #837819. Nothing is staged. **The sentence is now in the room's light reason ink on the navy, readable at a glance at 1440 and 390**: 7.82 : 1 at 1440 and 7.05 : 1 at 390, measured off `m4-2-manage--{1440,390}-colour-refused.png`. The ramp, the count of colours tried and the per-card ratios are gone. One sentence measures the colour on the stage: "White words on #A36B0A read at 4.50 : 1". |
| Stage, keep, see the app change | "Changed, not kept · Colour #A36B0A in place of #1A65BD · Keep · Put back". Once it is kept, Home's water, the pill and every screen wear it. |
| Arrange Home | It lands on Home's section, with the heading in view, at all four sizes (it landed at the top before). |
| Data → a maker's spread → its own page | `/places` lands on `/data` with Data lit. Stacer's spread offers "Stacer's own page" in the acts' row, and the page goes "Back to the price list". Every series photograph prints its caption ("309 Skimma on the water"), and Assault Pros says "On the water above" instead of repeating the hero. 0 blank pictures at any size. |
| Choose a cover | "Stacer stands on its Stacer 481 SeaMaster on the water." 0 blank pictures at 390 (one tile drew blank before). |
| Give the draft as Asaf | Priced what waited, named R. Kelleher, given. The build still says only "Prepared by Asaf." (see "Still wrong"). |
| The printed quote | "ABN 51 824 753 556 · Unit 4, … Brisbane QLD 4500 · 07 3265 1022 · walk@example.com", then "QUOTATION · 20261030-01", "Issued 30 October 2026", "Valid until 29 November 2026", and Prepared by "Asaf / Sales manager / 0400 111 222". **Every reference is one line box, on screen and on the print medium, at all four sizes**, and the stamp line is one line. |
| Change the phone and keep a new colour (#0B6E4F, green); the given quote does not change | **Holds.** The given quote's text is identical after a reload. **Its paper keeps the colour it was given in**: the letterhead reads `--color-accent: #a36b0a` while the app around it wears the green, at all four sizes. This was the critic's blocker 3. |
| /shelf: bring in the edited file, read, Apply, walk away, Undo, Apply | "Boat Module (edited).xlsx is read. Nothing is written yet." Then "15,675 of 15,691 lines stay exactly as they are." · 16 change · 0 new · 0 can't be placed. Each line is named as a person says it ("Sport 660 · PVC · White / White / White/Blue", with "Line 863 in the workbook" under it) and shows $61,700 → $62,200 Cash, +1%. After Apply and a walk to Home and back, the Undo is still offered and takes all 16 back. **The given quote's text is unmoved.** |
| Forget before a copy is saved | **Refused**: "Save a copy first: none has been saved on this computer, so nothing of this could come back." The act is drawn pale with that sentence beside it, and "Save a copy first" is offered. |
| Save a copy, forget everything, door, bring it back | The restore page says "The copy's 1 quote joins them, with the figures, letterhead and preparer it was given with…". **After the restore, the given quote's text is identical, word for word, to the text printed at the give, at all four sizes, and its paper still wears #a36b0a.** This was the critic's blocker 1. The shelf inventory counts "Customers 1", as the pill does. |
| Quotes, Customers, History, Home, Data, Shelf, Settings after the restore | Each is as wide as the window at every size. They are photographed as `*-after-restore.png`. |

## Fixed this round, by me

- **The entry chunk was 1,046,677 bytes. It is now 408,384.** The first page of the app downloaded the whole place screen, its livery and the 586 kB picture ledger, because `src/routes/places.$id.tsx` imported `PLACE_TABS` from `Place.tsx` for its `validateSearch`, which the router keeps in the entry chunk. The tabs now live in `src/screens/places/tabs.ts`, and `Place.tsx` re-exports them. `pictures` is its own lazy chunk again (585,673 bytes), and `places.css` now loads with the place page rather than on every screen. The change is recorded in `docs/DECISIONS.md`. The typecheck, lint, prettier and `src/screens/places` tests (15 of 15) passed before the full gate.
- **`docs/SCREENS.md`**: the fix round had appended eight fix rows to the screens table, two with an empty references cell and one that is not a screen ("The gate, after the M4 critic"). That is the pattern Milestone 3 had cleaned out. They are now bullets under "Milestone 4, fixed after the critic (2026-10-30)", with a sentence saying that `/places` is no longer a screen. After the move, the table holds one row per screen and no two rows share a primary reference set (checked by script).

## Per screen: what changed since the first critique, and what is still wrong

**Settings (`/manage`).**
- *Changed:*
  - The colour step is two cards, a field with "Try it" on its line, and one measured sentence.
  - The refusal is readable on the water.
  - The 390 page no longer scrolls sideways, and the stamp wraps under the mark.
  - The two 390 tabs are equal.
  - Arrange Home lands on Home's section.
  - The note counts given quotes ("The one quote on this computer has been given…").
  - Gone: "Northside to confirm", "Templates are not built yet", the per-person spacing-and-motion layer and the "Everything else" row of Data's rooms.
- *Still wrong:*
  1. **GST set on Settings never reaches a draft that is already standing, and nothing on the build can set it.** In the walk, GST 10 was kept before the draft was given. The given paper still says "Tax · Included in every price. No rate is set on this quote." and "Total, tax included", with no GST line. Two things cause it:
     - `freeze.ts:700` copies the rate only when a quote is started.
     - `setTaxRate` exists in `src/domain/quote/commands.ts:1306` but no screen calls it.

     Settings does say so ("Copied onto each quote when it is started"). Even so, a manager who sets Northside up while a customer's draft is open cannot get GST onto that customer's paper without starting again. Terms behave the same way.
  2. At 1440 and 1920 the left half (paper) ends about 1,400 px before the right half (water), so most of the page is a blank white column beside the navy (`m4-2-manage--1440-filled.png`).
  3. On the stage, the Jeanneau and Haines Signature marks in the makers' row are still faint thumbnails beside Stacer and Surtees.

**Places (a maker's own page, `/places/$id`).**
- *Changed:*
  - The wall of 25 cards is gone, and `/places` sends a person to Data.
  - Captions always print.
  - The hero is never repeated.
  - Marks are held at one optical size (Jeanneau's star is now the showpiece on its own page).
  - Parts & Accessories wears its kind's glyph.
  - No tile draws blank.
- *Still wrong:*
  1. The series names print as the file shouts them: "SEASPRITE DINGHYS", "OUTLAW (SIDE CONSOLES)", "OCEAN RANGER SDF (HARD TOPS)" (`boat_stacer.series`). They are Northside's own words, so they are not invented. But this is the one place left where a boat's family is not said the way a person says it, and "Dinghys" is misspelt in the file.
  2. 16 of Stacer's 22 series are plain navy blocks, because no photograph is held of them, which is true. The range reads as a wall of identical slabs (`m4-2-places--1440-stacer.png`).
  3. At 390 the rail ("Goes with", "Changed here") comes before the tabs, so the range starts about 900 px down.
  4. A maker's page is reached only by Data → maker → "Stacer's own page". Settings no longer links to any maker, so "where do I set Stacer's photograph" has one answer, three presses deep.

**Data (`/data`).**
- *Changed:* the Places room is gone from the head (Rules, Fitment, Review · 37 to settle, Prices, Shelf), and a maker's spread carries "Stacer's own page".
- *Still wrong:* the spread offers both "Back to the lists" and, one press later, the place page's "Back to the price list". Two ways back are named two ways.

**The shelf (`/shelf`).**
- *Changed:*
  - Its three destructive acts ask the switch.
  - Forget is refused until a copy is saved.
  - Lines are named as a person says them.
  - The Undo outlives a walk away.
  - Customers are counted as the pill counts them.
  - The promises name what a copy carries.
  - "1 quote joins them".
- *Still wrong:*
  1. Above the change sheet it says "Standard inclusions and factory options are on no line of the price list here: they arrive with Northside's Boat Module and Factory Options Module workbooks". It says this directly over a Boat Module workbook it has just read, which a manager will read as a contradiction.
  2. "+1%" for $61,700 → $62,200 (0.81%) is rounded up. A dealer would rather see "+$500".
  3. The switch's refusal on the shelf was not pressed in this walk. Its evidence is `src/screens/shelf/Shelf.test.tsx` (17 cases) only.

**The Document (`/quote/$id/document`).**
- *Changed:*
  - A restore brings it back word for word.
  - It prints in the colour it was given in.
  - The reference never breaks.
  - The desk note names the mark that printed.
- *Still wrong:*
  1. The GST point above.
  2. At 390 the contact line ends lines on a dangling " ·" ("ABN 51 824 753 556 ·" / "… Brisbane QLD 4500 ·").
  3. Page 2 of a four-line quote is two-thirds empty paper (`m4-2-document--1440-given.png`).

**The build (`/quote/$id`).**
- *Changed:* nothing in this round.
- *Still wrong:* "Prepared by Asaf." without the title or phone the paper prints (the first critique's minor, still open; `Configurator.tsx:1929`).

**Entry, Home, Picker, Quotes, Customers, History.**
- *Changed:* nothing in this round.
- *Measured:* each was photographed fresh and after the restore at all four sizes. Every one is as wide as its window, wears the kept colour, and shows R. Kelleher and the given quote back after the restore.
- *Still wrong:* the tab title in `index.html` and `APP_NAME`.

## Everything still wrong, in one list

The critic's seven blockers are all closed on this tree, each by a measurement above:

1. a restore gives the quote back word for word;
2. the shelf's two promises are true;
3. the given paper keeps its colour;
4. the colour refusal reads at 7.82 : 1;
5. the switch is asked (in tests);
6. no photograph stands uncaptioned;
7. the gate is green.

Of its nine majors, eight are closed. The ninth, the marks at one optical size, is closed on a place's page but not on Settings' stage. What is still wrong, most serious first:

1. **GST and terms set on Settings never reach a draft already standing, and no screen can set them on it.** The given paper of a draft started before GST was kept says "No rate is set on this quote" (`freeze.ts:700`; `setTaxRate` has no caller). In a sale beside a buyer this is the one thing a manager cannot fix without starting again.
2. **The build says "Prepared by Asaf." with no title or phone**, while the paper prints both (`Configurator.tsx:1929`; the first critique's minor).
3. **The old product's name is still in the source.** `index.html` has `<title>HelmLogic</title>` and `APP_NAME = 'HelmLogic'` (`src/app/ways.ts:333`). The tab reads "Northside Marine" once the script runs, but a link preview or a slow load shows HelmLogic.
4. **A maker's page is three presses deep and only from Data.** Settings links to no maker. Its 390 layout puts the rail before the range.
5. **The series are said as the file shouts them** ("SEASPRITE DINGHYS", "OUTLAW (SIDE CONSOLES)"), and 16 of Stacer's 22 are identical navy slabs.
6. **The shelf's sentence about inclusions** reads as a contradiction over a Boat Module workbook. Its "+1%" rounds $500 up from 0.81%.
7. **Settings' paper half ends about 1,400 px above its water half** at desk sizes. The stage's Jeanneau and Haines marks are still faint.
8. At 390 the letterhead's contact line ends on a dangling " ·". Page 2 of a short quote is mostly empty.
9. Data names its two ways back differently ("Back to the lists", "Back to the price list").
10. **Unwalked here:**
    - the shelf's switch refusing a set-apart person (component tests only);
    - a mark of Northside's own on the water (the file chooser for the white-ink mark was not driven);
    - Settings at 834, 844 × 390 and 1280 by eye (the rulers measured them).
11. **Process:**
    - The `npm test` figure in CLAUDE.md is out of date (110 s stated, 421–424 s measured).
    - The fix round's work and this round's are uncommitted on `main` (52 files modified, plus the new tests, shots and this report).
    - The first round's `m4-places--*` shots show the wall of cards that no longer exists. They are left as the evidence `built-critique-m4.md` cites, not as the tree.
    - No `FAULT-*.png` existed under `docs/directions/` before this walk, and none was written by it.
    - The owner has not looked at any Milestone 4 screen.
