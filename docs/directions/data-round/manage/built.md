# Settings, built — data round, 2026-11-04

The judge's verdict was DEEPEN (`judge.md`). The composition stays: one page split down its centre, the white paper of what prints on the left and the night water of what shows on the right. What changed is function, depth and finish inside it.

Every frame is in `after/`, 147 of them: 24 states at each of the six sizes, plus the route the rulers walk with a line open. They were taken by `e2e/flows/manage-shots.spec.ts`, which runs only when `HL2_MANAGE_SHOTS` is set. Each walk went through the real door with the real Master Price File, from a build of its own (`HL2_PREVIEW_PORT=6302`). The only things typed were test values:

- the Australian Business Register's published example ABN, and one refused ABN;
- a 10% deposit with one line of wording;
- a title;
- one made-up second person on `example.test`;
- one refused colour.

## What was built

### L1: the quote these print on
At a desk, the paper ends with the newest draft's own first and last pages. They are drawn by the document itself through a new `proof` mode on `<Document>`, which draws:
- no chrome, no "what goes on the paper" panel and no desk note;
- no retitled tab. Measured: the tab still reads "Northside Marine" with the pages drawn, at all six sizes;
- no pictures packed for a printer.

The pages are drawn at two thirds of A4. The pages between the first and the last are left out, and a sentence says so. The line being set is lit where it lands:
- the letterhead, the valid-until line, the total's block for GST and the deposit, and Prepared by are lit on the first page;
- the terms and the running head are lit on the last page.

Each editor says where its line is lit.

In a hand the same pages are a door: "Open 20261104-01 as it prints". With no draft on this computer, a dashed sheet of A4 stands where the first page will be drawn, at that page's size.

### L2: the stage follows the choice
At a desk the stage stands at the window's head beside its choices, on its own navy plate. Measured from y 80 when stuck, at 1280, 1440 and 1920. After the last choice it comes to rest in a space the water keeps for it.

"Changed, not kept" docks at the window's foot once the choices have come up past it, at every size, and it lifts the toaster above it. Measured with the toast standing:

| Size | Dock (y) | Toast (y) |
|---|---|---|
| 390 × 844 | 643–776 | 579–627 |
| 844 × 390 | 265–378 | 196–244 |
| 834 × 1112 | 987–1100 | 918–966 |
| 1280 × 800 | 671–784 | 606–654 |

At 1440 and 1920 the toast stands beside the pill (4–52). The toast was over the dock in none of the six (`toastOverDock: false`).

Staging a photograph turns the stage to the place it was pressed for.

### L3: the deposit as Northside's rule
The deposit can be a share of the total (1 to 100) or one fixed figure. Each refusal is a sentence where it is refused: "A deposit share is from 1 to 100, as in 10 for 10% of the total."

On the draft, the editor works the rule on its real total: "On 20261104-01, whose total is $61,700, the deposit prints as $6,170."

The paper prints "Deposit, 10% of the total: $6,170" under the total. The rule rides the letterhead, so the give freezes it. `e2e/flows/manage.spec.ts` proves this at all six sizes:
- the given quote prints 10% worked to the cent from its own printed total;
- after Settings changes the share to 25%, a reload still prints 10%.

### L4: one index of everything Northside has decided
- **A page name.** An h1, "Settings", and under it who changed what last. That is read from stamps now kept with the price list, one per key of the profile (`src/domain/northside/stamped.ts`).
- **An index of the page's ten parts.** It heads the water at a desk, and in a hand it stands at the window's head with the part being read lit.
- **"Decided elsewhere".** It ends the page and covers six things decided in other rooms, each counted from what Northside kept, with its door and who changed it last where that is kept:
  - Prices;
  - left alone on Review;
  - supplier names;
  - aisles;
  - colour letters;
  - pictures and covers.

### L6: one picture grid
Each photograph is drawn once, with "Home" and "Sign-in" as its two presses, and is ringed where it stands.

### L7: the index in a hand
See L4. It replaces the two jump plates, so the overhang the judge measured at 834 and 844 is gone.

### L8: the finish faults
- **P4.** The set-apart refusal stands only while it is true. Proved in `Manage.test.tsx`, and in the frames `10-person-refused-*` and `11-two-people-*`.
- **P5.** A card chosen writes its colour into the field: #0066CC after "From the mark" (spec and unit test).
- **P6.** A boat is named once: "Haines Signature Fisher 525F" (`src/domain/northside/boatNamed.ts`). The spec asserts that "Haines Signature Signature" is absent.
- **P10.** The stamp's words keep to one line beside the mark wherever the sheet is 34rem or wider.
- **P11.** The person editor's sentence stands above the four fields, so they stand level.
- **P12.** The stage's maker marks are 24px tall in tiles 32–36px tall, and the seven stand on one row at a desk.
- **P14.** The colour notes are 12px.
- **P15.** See the h1 under L4.

### Minors
- **L9.** Shape is chosen beside a drawing of what it does.
- **L10.** A third colour card is the colour Home's photograph carries in its own pixels, or the nearest to it that white words read on (`src/domain/northside/source.ts`). The system's picker stands beside the hex field.
- **L11.** Each card says how many quotes that person prepared on this computer, and what the switch allows.

## Not built, and why
- **L5, Northside's own photographs for Home and the sign-in page.** Home reads a chosen photograph by its held id (`pictureById`, `src/screens/home/ledgers.ts`), and so does the sign-in page (`readEntryFacts`, `src/screens/entry/facts.ts`). Taking an uploaded picture there is those two screens' change, with the backup's, and this round owns Settings. Recorded in DECISIONS.
- **L12, the editor on the line.** The strip is the document's own component, and a form cannot stand inside its printed line. Recorded in DECISIONS.
- **L13, ready at 844 × 390 in under 2 s.** Not worked and not measured.
- **At 1280 the Undo toast stands in the corner** over the last row of Shape for its 8 s when nothing is docked. This is the kit's toaster rule for every screen.
- **The phone pages are longer, not shorter.** At rest, 390 × 844 is 5,958 px (the judge measured 5,235) and 844 × 390 is 4,695 px (3,623). The page gained a head, the index, the deposit, the door to the pages, the shape drawing and "Decided elsewhere". The index is the way across them, and every part is one press from the window's head.

## Measured, at rest, through the door with no draft (`02-full-*`)

| Size | Page | Paper ends | Water ends |
|---|---|---|---|
| 390 × 844 | 5,958 | 1,700 | 5,124 (one column) |
| 844 × 390 | 4,695 | 1,379 | 4,062 (one column) |
| 834 × 1112 | 4,695 | 1,379 | 4,062 (one column) |
| 1280 × 800 | 3,488 | 2,059 | 2,635 |
| 1440 × 900 | 3,562 | 1,994 | 2,698 |
| 1920 × 1080 | 3,626 | 1,949 | 2,751 |

At a desk the paper ends at 76–78% of the water, against the judge's 40–42%. With a draft, the pages fill the rest (`22-on-a-draft-full-*`).

Across every state walked, at all six sizes:
- no sideways scroll;
- 0 page errors;
- 0 overlaps from the overlap ruler, read at rest and scrolled in the deposit-kept and picture-staged states.

## Gates run, with my port (6302) and output (test-results-6302)
- `npx playwright test e2e/flows/manage.spec.ts`: **30 passed** across the six projects.
- `npx playwright test e2e/rulers -g manage`: **42 passed, 18 skipped** across the six projects.
- `npx playwright test e2e/flows/manage-shots.spec.ts` (with `HL2_MANAGE_SHOTS`): **18 passed**.
- `npx playwright test e2e/flows/document.spec.ts`, desktop and phone: **38 passed, 4 skipped**. This proves the document after its `proof` mode and deposit line.
- `npx vitest run` on src/screens/manage, src/domain/northside, src/screens/document, src/domain/io, src/state and src/domain/quote: **96 files, 1,345 tests passed**.
- `npx tsc --noEmit` on the app and node configs: clean. `npx oxlint --max-warnings 0 src tools e2e`: clean.
- `npx tsx tools/check.ts`: **1,822 failures, none in this round's files.** Every one is `no-ui-selector-outside-ui` in other rounds' board files under `docs/directions/data-round/*/boards/kit.css`.

## Tests rewritten to the new truth
`e2e/flows/manage.spec.ts`: "Sales manager" is now looked for on the person's card (`#mg-people-g`). At a desk the quote's own pages print it too, so the page-wide `getByText` found three.
