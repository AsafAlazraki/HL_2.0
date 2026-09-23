# The Cockpit, judged over the eight screens it joined

Independent critique, 2026-09-23. Read-only: nothing outside this file was touched.

**What was read.** `docs/directions/built-m2.md` whole; every PNG under `docs/directions/{shell,data,sheet,customers,history}/built/`
and a sample of `{home,quotes,configurator,document,picker}/built/`, including all three `FAULT-…` shots;
`docs/research/refs/critique-m2.md` whole and each screen's findings in it; `docs/SCREENS.md`'s five new rows and
`docs/DECISIONS.md`'s entries of 2026-09-23; and the source for what a screenshot cannot show —
`src/screens/{shell,sheet,data,customers,history}/*`, `src/app/ways.ts`, `src/domain/quote/diary/{days,history}.ts`,
`src/domain/quote/document.ts`, `tools/check/rules.ts`, `e2e/routes.ts`, `e2e/rulers/density.spec.ts`,
`e2e/rulers/measure/density.ts` and the three failing flow assertions.

**What was measured here, rather than inherited.** `npx tsx tools/check.ts` on this tree: **14 rules, no failures**,
every rule reading files (76 · 76 · 77 · 16 · 71 · 98 · 1 · 647 · 296 · 173 · 173 · 256 · 266 · 267). Everything else
below is either read off the source at a named line or read off a shot at a named file.

---

## What passed, so it is not re-litigated

- **No literal colour, no undeclared token, no type under 11px, no cost column on a surface, no reader-facing
  "entity" or "UID".** The guard reads 98 files for the cost rule and 71 for the word rule, and both are clean.
  `schema`, `field type` and the model sense of `reference` appear nowhere a reader can see; the four uses of the
  word "reference" on screen are a quote's own reference, which is a dealership word.
- **Every write goes through a command.** `Customers.tsx:469/484/514`, `Data.tsx:404`, `Sheet.tsx:485`,
  `History.tsx:508/518` — all of them `catalogue.getState().apply` or `quotes.getState().apply`, all with an inverse
  and an event, all with Undo pinned on the screen rather than in a toast.
- **Data is a door at rest on every screen but `/sign-in`**, fourth word on the pill, with a counted 53 beside it.
  The instruction the owner gave in capitals is answered, and `src/app/ways.ts` holds the five doors once.
- **Data (`/data`) is the best screen this round built** and the only one in the app that answers "a bit more colour
  usage please" and "I want the logo to be the showpiece thing" at the same time. Seven makers' own marks large on
  paper plates, the kinds in five inks, every figure counted off the manifest, and it is not a list-left/detail-right
  screen at rest.
- **Customers' teaching state is the best-written empty state in the repository** — what a customer is, why it is
  empty today, what to do — and the plate that draws `readCustomer`'s own lines is a real idea, not a decoration.
- **No seeded row anywhere.** Customers' density is measured by pressing the screen's own act on a name a walk typed;
  `e2e/mint.ts` still mints by walking the picker. That discipline held under pressure and it should be said.

---

## Blockers

### 1. A found row opens the wrong row — `?at=` is accepted, rewritten, and never read

`src/app/ways.ts`, in `addressOf`, says in a comment: "`?at=` is the sheet's own word for the row a record is open on
… so a found row opens with its record showing rather than at the top of its table." The sheet does not do this.
`src/screens/sheet/Sheet.tsx:294` is the only place `at` is used:

    const [peeking, setPeeking] = useState(at !== '')

`at` is read as a boolean and thrown away. The row shown is
`openRowId = peeking && cursorRow ? cursorRow.rowId : undefined` (`Sheet.tsx:454`), and `cursorRowId` starts `null`,
so the panel opens on the first leaf row of the table; the effect at `Sheet.tsx:456` then rewrites the address to that
row. `docs/directions/sheet/built/FAULT-sheet-1440x900-at-opens-row-one.png` is `?at=boat_highfield:496` opening
`RU230KAM (PVC) WH`, row 1 of 588.

This is the shell's headline claim and `docs/SCREENS.md`'s shell row states it as built.
`e2e/flows/shell.spec.ts:243` is green over it because it asserts only that the address carries some `at`.

### 2. The one object that leaves the building has no dealership on it

`src/domain/quote/document.ts:409` freezes `business: said(quote.organisation)`; `freeze.ts:615` takes that from
`ctx.org?.name`, and this pack has no organisation. Every screen instead reads `catalogue.business` and prints
**Northside Marine**. So `docs/directions/document/built/FAULT-document-1440x900-unnamed-business.png` has
"This business has not been named yet" as the first line of page 1 of the customer's quotation, above the hull and
beside `QUOTATION · 20260916-01`, on a desk where the pill two inches above it says Northside Marine.

The engine's reasoning is correct and the product is wrong. A dealership hands this to a customer.

### 3. The picker cannot start a quote on a multi-colourway model without finding a hidden scroll

`docs/directions/picker/built/FAULT-picker-1440x900-colourway-hidden.png`. On the ADV7 the amber `Start the quote` is
a full-width primary act that reads live at a glance, and the sentence under it is "Choose a colourway above and this
becomes live." There is nothing above it: the panel shows the mark, the name, the picture, three specs, the price,
then the act. The seven colourway chips are 326px down a 320px port with no visible scrollbar, and reaching them
pushes the boat out of the panel. A refusal that points at a place where the thing is not is a refusal that is false
on this tree.

### 4. History prints a day in an order that cannot have happened

`docs/directions/history/built/history-1440x900-filed.png` reads **`addressed · started · issued`**.
`history-390x844-filed.png`, the same tree, reads **`issued · addressed · started`**. Both are impossible, they
disagree with each other, and the screen's whole premise ("History is TIME; the register is STATE") is that this line
says how the day went. `src/domain/quote/diary/days.ts:218` states the contract — "The kinds appear in the order they
first happened that day, so `started · 7 picks · issued` reads the way the day went" — and `kindsSay` walks a `Map`
built by iterating the array it was handed. `indexDays` does sort (`days.ts:145`), but on a minted walk the events
share an instant, the sort is stable, and the order falls back to however the store returned them. The one line on
the one screen that exists to record what happened is non-deterministic and, on this tree, wrong twice.

---

## Major

### 5. Four of the five Cockpit registers do not hold eighteen rows at 1280×800

Measured by their own flow tests on the verify run: customers **16** (`e2e/flows/customers.spec.ts:190`), Data **16**
(`data.spec.ts:296`), History **17** (`history.spec.ts:202`), the sheet **16 records, capacity 15**
(`rulers/density.spec.ts`). Only the sheet's shows up in the ruler, because `density.spec.ts:54` asserts
`Math.max(d.records, d.capacity)` and a near-empty register reports a large capacity. Three registers pass a ruler
they fail in fact.

Worse, **`docs/SCREENS.md` now carries three figures this tree contradicts**, each written by a builder who measured
before the pill existed: the sheet's row says "18 records in view … holds 17", Data's says "holds 18", Customers' says
"holds 21". `docs/DECISIONS.md` already records the sheet at 15. A status file that states a measured number which is
no longer true is the exact fault this repository has fixed three times.

### 6. Three Cockpit screens are the same composition, with the same token, at the same measure

This round's stated purpose was to stop it (`critique-m2.md` §3; four `DECISIONS.md` entries say "ASSIGNED … because
five of twenty directions were list-left, detail-right"). Measured in the stylesheets:

| screen | rule | token at 1280 | step above | step below |
|---|---|---|---|---|
| `/quotes` | `.qr-body { grid-template-columns: minmax(0, 1fr) var(--panel-w) }` | `--spacing(90)` | `--spacing(110)` | `--spacing(100)` |
| `/data/$table` | `.sh-body { grid-template-columns: minmax(0, 1fr) var(--side-w) }` | `--spacing(90)` | `--spacing(110)` | `--spacing(100)` |
| `/data` | `.dt-body[data-open] { grid-template-columns: minmax(0, 1fr) var(--page-w) }` | `--spacing(90)` | `--spacing(110)` | `--spacing(100)` |

Three names for one value, one declaration, one set of steps. `built-m2.md` clears Data because it is one column *at
rest*; but pressing a plate is Data's only act, and `data-1440x900-plate.png` is the shape of
`quotes-1440x900-filed.png` and `sheet-1440x900.png`. The assignment moved the repetition behind a state rather than
removing it.

### 7. The gate is red, and a red gate hides the guard

`npm test` failed on three consecutive runs (1, 2, 2 failures; 139.85 / 135.47 / 141.70 s, the last on an idle desk).
Every failure is `src/screens/sheet/Sheet.test.tsx` and every one is a 5,000 ms timeout — up to 8,936 ms. The file
alone passes, 14 of 14 in 23.57 s. `vitest.config.ts` gives the `node` project `testTimeout: 20_000` and argues for it
in the exact words this case needs; the `dom` project gets nothing. And because `npm test` chains with `&&`, a red
`unit` means `npm run check` never runs at all — the one static guard this repo has sits behind a gate that is always
red. Run alone it is green: 14 rules, no failures, measured here.

`npm run e2e`: 1,002 tests, 752 passed, 237 skipped, **13 failed**, none of them a timeout.

### 8. The configurator's two sticky bars overlap by 33px

`e2e/flows/configurator.spec.ts:397` reads `find.top − mast.bottom = −32.69px` at 1280, 1440 and 1920. The masthead
grew to clear the pill and now runs a third of the way into the search field beneath it. This is on the screen where
the sale happens, and overlap is one of the four honest failures the rulers exist to stop.

### 9. The pill prints a count that disagrees with the screen it opens

`quotes-1440x900-filed.png`: the pill says **`Quotes 0`**, the register beside it says **"1 QUOTE IS FILED IN THIS
BROWSER"**. `Shell.tsx:384` returns `seen.drafts` for `/quotes`, under a comment forty lines above it that reads "THE
DOOR COUNTS WHAT THE SCREEN BEHIND IT COUNTS, and that is the whole rule." The same round wrote that rule to fix this
exact fault for the tables count and left it standing here. The door's own sentence promises "every draft, issued and
superseded quote".

### 10. Three screens no longer fit the window they were drawn at

Home **915px in 900**, **822 in 800**, **1,084 in 1,080** — the last line of the drafts column is sliced by the
bottom edge. `/nope` 867 in 844 and 838 in 800. Customers 1,171 and 1,320 against an 800px laptop, so the filing form
is always below the fold on the dealer's own machine. `docs/STATUS.md`'s "800 in 800, 900 in 900 and 1,080 in 1,080"
is false at all three, and no test guards a `scrollHeight`.

### 11. Two screens open with their primary amber act already saying no

The sheet's record panel rests with **ADD A COLUMN** — an empty field, two selects, an amber `Add the column` and
"A column needs a name before it can be offered." — as the most prominent object on it, on first paint, for a form
nobody asked for (`sheet-1440x900.png`, `data-1920x1080-plate.png`). Customers rests with an amber
`File the first customer` under "A person needs a name before they can be filed." (`customers-1440x900-pile.png`).
The rule is "a refusal is a sentence with its reason, where it is refused" — not "the brightest thing on the screen
refuses before anybody has touched it".

### 12. A cell edit throws the sheet's shape away

Fold `ROLL-UP` (588 → 556, `▸`), edit any cell: the write lands with Undo pinned and every band is open again at the
top of 588. Column folds survive; row folds do not. A dealer who folds the file down to the series they are working in
loses it on every write.

### 13. Four ways back in one window, and the word "Data" three times

On `/data/$table` at 1440 the pill carries `‹ Data`, `Home` and `Data 53`, and the screen's own head carries `Data`
and `Home` at the top right. `docs/DECISIONS.md` records the register's duplicate as "the one duplication this shell
leaves standing"; on a sheet it is doubled again and nobody wrote it down.

### 14. A router placeholder and a plan word are shown to a dealer

`History.tsx:1256-1257` renders in **normal operation**, not as a refusal: "It opens where it is written, still
changeable, at **/quote/$id**." and "…at A4, at **/quote/$id/document**." `History.tsx:1095` prints `/quote/new`.
Four reader-facing sentences on Entry, the configurator and the document end "…arrives with the backend at
**Milestone 6**." — a word from this repository's plan, on the fourth line of the first screen anyone sees.

### 15. `/quotes` says the price file is not open while it is reading it

It has `sheetOpen` and no reading state, so during the read it prints "No price file is open in this browser" and
"This business has not been named yet". Home, Data, the sheet and Customers all say "Looking for a price file in this
browser…". On a loaded machine that window was about 18 seconds.

### 16. Filing a customer tells you twice that it did not work

After "J. Harrow is filed, and the book was made to hold them. · Undo" the header still reads **"1 NAME TYPED ON
QUOTES, NOT FILED"** and the person's own page reads **"IN THE BOOK · NO QUOTES"**. The engine is right — a given
quote keeps the name it was given — and the screen is a dealer being contradicted by the app about the act they just
performed.

### 17. At a real desk, four registers are mostly empty floor

`quotes-1440x900-filed.png`: 530px of dark floor under the frame, nearly two thirds of the window.
`history-1440x900-filed.png`: one line and roughly 700px of nothing. `customers-1920x1080-pile.png`: a 720px column
with about 600px of dark on each side. This is the honest state and the app must not invent a row to fill it — but a
composition whose rest state is one row should not be drawn as a full-height frame with the floor showing under it.
"It does not feel alive" is the sentence this will draw.

### 18. Keycaps on a device with no keys

`Ctrl`, `K` and `N` are printed at 390 on the tab bar, on Home's helper ("Ctrl K opens the finder"), on the register,
on Data and on History. The `?` sheet is correctly withheld at that width *because* "a phone has none of these keys";
the rule was applied to the sheet and not to the thing pointing at it. The quotes register's own legend does switch to
touch language, so one screen already knows the answer.

---

## Minor

19. **`data-390x844.png`**: the find field's placeholder is cut mid-word — "A table, a kind, a place, or the workbook
    it came fro".
20. **`sheet-390x844.png`**: the sentence that explains the reduction — "The other 29 columns are in the record; press
    a row to read and…" — is clipped by the floating tab bar at the foot.
21. **The crest is a blank blue disc before a file is read.** `Pill.tsx:106` sets `initials = initialsOf(business)`
    and `business` is null until the sheet loads, so the mark renders as an empty circle on every screen — visible on
    `history-390x844-filed.png`. The link and its accessible name are fine; the only mark in the app is a hole.
    "I want the logo to be the showpiece thing" is answered on Data with other people's marks and nowhere with his.
22. **The sheet looks like a spreadsheet, exactly where it must not.** The `MATRIX` column prints
    `Highfield Inflatables` on all 588 rows; the `IMAGE LINK` column draws the held photograph at 34 × 24px — a boat
    on water as a white smudge — beside rows that say `held as a link`, so one column shows two unrelated kinds of
    thing; the `VARIANT` column repeats `PVC WH · HYP WH · PVC LG · HYP LG` down the page. Five of 33 columns fill
    990px at 1440 and three of the five carry nothing a dealer reads.
23. **Home's drafts empty state is a wireframe.** A diagram of labelled empty boxes — `THE BOAT'S OWN PHOTOGRAPH`,
    `MOTOR`, `WHO IT IS FOR`, `WHERE THE ACT THAT OPENS IT WILL SIT` — where every other empty state in the app is a
    sentence. It is the weakest object on the best screen.
24. **The configurator's stage shows a Mercury while the quote's motor is a Yamaha F90XB** (`configurator-1440x900.png`,
    chapter 02). The hull is the right model and the caption gives its provenance; it says nothing about the engine in
    the picture, and the customer sitting at the desk reads the picture.
25. **Grammar, on a counted figure**: "3 lines, every figure frozen when it was picked · **1 of them carry** no price
    at all."
26. **`docs/directions/data/built/data-1920x1080-plate.png` is a shot of the sheet**, not of Data's plate state, so
    Data's second state has no wide evidence.
27. **A false refusal is alive in the source and pinned by a test.** `Picker.tsx:100` `NO_CONFIGURATOR` — "the
    configurator … is not built yet" — cannot render in the running app, but it is asserted by `Picker.test.tsx:300`
    and `routes/quote.new.tsx:97` says so in a comment three lines above the prop that retires it.

---

## Would he accept it on sight?

**No.** He would accept Data, argue about Home, and stop at the sheet.

**The one thing to change first: `/data/$table` — its resting state.** It is the screen that reproduces, exactly, the
sentence that killed five redesigns: "it still feels like a database", "the tables — still too complicated and hard to
use visually". On this tree it is also the screen that carries the round's only red ruler (15 rows against 18), the
broken `?at=`, the fold that dies on every write, a column repeating one value 588 times, photographs drawn at
34 × 24px, and a panel that opens on a form permanently refusing. Its own sweep was ranked weakest of the five and was
told to reconcile the published table numbers with `helpers.ts` before the grid was written; it was not.

Everything else on this list is a fix. The sheet is a redesign.
