# Where the rebuild stands

Written 2026-09-17. Everything below is measured on the tree, not expected. `npm test` and `npm run build && npm run e2e` are green.

## Milestone 1 is done, and the owner has not looked (2026-09-22)

The selling flow is built end to end and every screen of it faces the rulers. A dealer signs in, loads the file, picks a hull, builds a rig with a motor and a trailer the file pairs, sees every refusal explained, prices a change before making it, addresses the quote, issues it, prints it on A4 and finds it again. Eight screens: entry, home, picker, configurator, cascade, document, the quotes register, and Lost. Each is **provisional** in `docs/SCREENS.md`: built from a direction the builder chose under the owner's handover ("go for what u think is awesome and build literally everything please before i review it"), critiqued independently, fixed, and not yet seen by him.

**What is measured on this tree.** `npm test`: 166 test files, 2,729 tests, 14 static rules each reading real files, no failures. The browser gate: 438 Playwright checks passing across six viewports, 138 skipped by design (the ruler fixtures run at one viewport; density at one; the print case at one). Eighteen checks were red on the run of 2026-09-22 and seventeen of them were 30-second timeouts under two research browsers on this four-core machine — re-run alone they pass in 1.5 minutes — which is a measurement about the machine and is recorded here so nobody reads it as one about the app. The eighteenth was the honest one, and it is fixed: see the next paragraph.

**The last red line, and what it took.** Density on the quotes register read "6 rows" for four days — three band heads and three notices on a register nobody could put a quote on — and the number meant nothing either way. The walk in `e2e/mint.ts` now reaches the register with a document it minted, the register says when it has read this browser, and the ruler reports both the records in view and the records the room would hold at the pitch of the real row: 1 record, 28px pitch, 657px of room less 72px of band heads, holds 20 at 1280×800. `docs/DECISIONS.md` has the entry. The same walk had put the configurator, the cascade and the document in front of all five rulers the day before; the agent that wired it ran out of memory after finishing, and its two last suites are in.

**What Milestone 1 owes and does not have.** The owner's eye on all eight screens. A shell — the way between screens, which Milestone 2 designs first because a dealer with twelve screens and no rail is lost. The clueless-user pass the plan asks for per milestone was run as the flow critiques of 2026-09-18 (every act on every screen followed to the address it names); it is run again after the shell lands, because the shell changes every screen.

## Milestone 2 has its research and its engine (2026-09-22)

Five reference sweeps are written, one per Cockpit screen, each with three or four directions that vary the composition and the order of the content, and each honest about what the seed can put on it: **shell** (the way between screens — a rail, a pill, a finder or a masthead — and the Ctrl K finder; 122 frames), **customers** (214 frames, nothing new captured because the cut-off run had already captured them), **data** (58), **sheet** (55), **history** (41). The critic (`docs/research/refs/critique-m2.md`) ranks customers and data strongest and the sheet weakest, and its sharpest finding is one the builders must answer together: five of the twenty directions across four screens are the same list-left, detail-right composition, so the obvious picks would stamp one treatment across the Cockpit. The build round assigns compositions so that no two Cockpit screens share a shape.

Two facts the critic corrected before a board was drawn: the manifest holds 25 base tables and 28 joins and **no view tables**; and there is one file-level sha256 (`1qz08ne`), not a hash per table — a table's provenance is its workbook, sheet and row range, and its rows' own Source cells.

**The catalogue write commands are in**, engine only, no screen: `src/domain/catalogue/commands.ts` holds updateCell, addRow, deleteRow, addField, renameField, retypeField, retargetField, deleteField, createTable, deleteTable and a batch, each `(data, now) => { next, inverse, said, event }` with a typed event and a counted blast radius before the act; `src/state/catalogue.ts` applies them with an inverse stack, a 300 ms write-behind through the repository ledger (a cell edit writes one row) and a pagehide flush; a wipe still never clears quotes. The old repo's levels apply (187 cell edits, one undo entry) and the three designer suites came across with their tests. Measured on the pack: a level set over 187 Highfield variants took 3,792 ms before the row index was made lazy and is one batch now. The whole tree: **172 test files, 2,891 tests**, 14 static rules, no failures.

## Milestone 0 is done

| part | evidence |
|---|---|
| **The golden proof** | The Stacer 529 Assault Pro, frozen by the OLD engine against the OLD seed and by the NEW engine against the NEW pack, is the same document member for member: hull $28,530, the six Yamahas with the F90LB starred at $14,330, the TA1400S13SB trailer at $8,703, and every spec, rung source cell, provenance note, pair fact, denominator and rule reason. |
| The domain contract | `src/domain/model/*`, fifteen files, every argued comment kept. `orgId` required on every persisted record; `QuoteEvent`, `QuoteChapter`, `Verdict` and `CatalogueCtx` added. |
| The pack | 53 tables · 15,691 rows · 28 joins, asserted before writing, the old fingerprint `1qz08ne` reproduced, deterministic ids. `npm run pack` rebuilds it in ~15 s. |
| Cost columns | 139 named, up from the old repo's 115. The four it missed: `Total Nett CTD`, `Settlement`, `Discount`, `GP`. |
| The engine | Solver, formula engine, rule engine, linter, trailer fitment with its arc-consistency solver, constraints and discovery, the quote modules, views, catalogue, modules, table, levels, review, sentence rules, io, people, diary. Each with its suite. No assertion edited. |
| The quote engine | `freeze.ts` byte-for-byte then mechanically edited: fourteen store reads and six live reads became one injected context across seventeen functions. Twenty-five mutators became commands with inverses and typed events. Undo lifted out with an injected clock. |
| The seam | Memory and Dexie adapters under one contract suite, the identity-diff ledger ported with its nine tests, a wipe that never clears quotes. |
| Pictures | 329 catalogue copies at long edge 1100, plus eight stage heroes at 2560 and seventeen brand marks for twelve of thirteen brands, each with provenance. |
| The app | The browser loads the pack and reads 53 tables and 15,691 rows back out, asserted at all six viewports. |
| Gates | 146 test files, 2,332 tests, 14 static rules each reading real files, 51 Playwright checks across six viewports. |

## What the audits caught that the builders missed

Three verify-and-critique rounds ran after the port. Each found something no single agent could see.

1. **Five suites, 77 cases, dropped without a note**, each sitting on a boundary between two port groups. The quote-issue gate, customer freezing, the module-blocks suite, the rule-creation guard, and the timezone suite that pins Brisbane as UTC+10 where a morning instant belongs to the previous UTC day. All recovered.
2. **The old design system crossed anyway.** Three easing tokens byte-identical to `HL_Playground/src/styles/system.css`, same names, same order — in a repo where every agent's brief forbids it. The first fix replaced one with another curve copied from the old repo's `ds.css`. `tools/check/oldSystem.ts` now refuses any authored value that reappears from the old stylesheets, with one auditable exemption for published standards.
3. **A guard was reading zero files and the run said "no failures".** `no-cost-column-in-a-screen` was scoped to a folder that does not exist, so the rule protecting cost from a customer surface measured nothing. A fixture test cannot see this; only a walk of the real tree can. The run now prints a per-rule file count and fails a rule that read nothing.
4. **The rulers had never been seen to fail.** Each guarded its own non-vacuity, but on a tree with one placeholder route "0 below threshold" is also what a broken parser returns. Each now has a page built to fail in front of it.

## Milestone 1: two screens built and joined, both provisional

Written 2026-09-17, measured on this tree. Entry and Home are built from the recommended boards while the owner was away, under the plan's standing rule, and are marked **provisional** in `docs/SCREENS.md` until he has looked. The Milestone 0 placeholder at `/` is gone; the evidence it printed is asserted in `e2e/flows/pack-loads.spec.ts` against Home's own stamp.

The shell that joins them: a browser with no name in the session lands on Entry, one with a name lands on Home, both as `beforeLoad` redirects. Entry's blue door is the only thing in the app that can fetch the price file; Home calls `catalogue.load(repository)`, which cannot — so the blank door leaves Home honestly empty, and a second visit reads the whole sheet back out of IndexedDB in 315 ms on a desk and 392 ms in a hand with no pack file fetched. A blank desk says so and offers the door back at `/sign-in?again=true`, with the remembered name already in the field.

Gates after Milestone 1's first two screens: **151 test files, 2,401 tests**, 14 static rules, **131 Playwright checks passing across six viewports** (61 skipped: the ruler fixtures and the viewport-scoped rulers, plus density, which has no Cockpit screen to measure yet).

## The configurator is built, and the picker now opens it (2026-09-17)

`/quote/$id` is built from direction **B, "Stage and rail"** of `docs/research/refs/configurator/notes.md` §5, chosen by the builder because the owner handed the picks over, and **provisional** in `docs/SCREENS.md` until he has looked. The picker's one refusal — "the configurator is not built yet" — is retired by having built it: pressing *Start the quote* now navigates to the document it just wrote, and `e2e/flows/picker.spec.ts` asserts it lands rather than asserting the old apology.

**Six chapters, and not one of them is a table.** `orderBands` gives the four the price file can carry — 01 The hull · 02 Motor · 03 Trailer · 04 Dealer fit — and the two it cannot follow them: *Who it is for* and *The finale*. On a Highfield SP560 that is seven of the file's own tables folded into four chapters, with the trailer chapter holding two headings and the dealer-fit chapter three.

**What is measured on this tree, on that hull:**

| | |
|---|---|
| the running price | `$66,584` in the masthead at the first paint, sticky at every width, a `PriceFigure` that never animates |
| the shut build | four chapter heads state their own answer and their own subtotal, so the whole build reads in six lines |
| chapter 01 | 15 finishes of the SP560, seven PVC at a delta of `no change` and eight Hypalon at `+$7,010` — each priced by re-rooting the document and asking the one summation what it would total |
| the search | one field over every chapter: "battery" selects 172 rows, 170 of them past a shortlist, in 18 ms, with the match bolded and the dealer's own code beside every name |
| a refusal | a row the pairings left out stays an ordinary live row, and the engine's own sentence is said once above the list where every row off it gives the same reason |
| undo | on every pick, in the rail's head, pinned to the command's event id, with "Put it back" after a way back |
| the finale | `issueBlockers`' own sentence under a refused act; issued, the screen goes read-only with `ISSUED_REFUSAL` on every control and offers a new version |

**Two things in the engine were genuinely missing and were put there with tests.** `QuoteLine.code` — the code a dealer orders by, frozen by `mintLine` from the four spellings this file uses, because a frozen line could say which workbook cell a figure came from and not what a supplier would recognise on the phone. And `finishLevels` in `domain/catalogue/fold.ts`, which parsed its own key back apart with `lastIndexOf(':')` and therefore returned the EMPTY SET for every table on this dealer's file, silently; nothing had called it yet, and its suite passed fabricated row ids with no colon in them.

Gates after it: **159 test files, 2,557 tests**, 14 static rules, **263 Playwright checks passing across six viewports**, 90 skipped.

**The one red check, and it is not this screen's.** `density — quotes` reads 6 rows at 1280×800 against a requirement of 18, because every ruler opens a browser nobody has used and the register is honestly empty — the three band headers and the three notices under them are what a grid exposes as rows. `docs/DECISIONS.md` records that state being accepted when the register joined `e2e/routes.ts`. What has changed is that the app can now MINT a quote, so the ruler harness can grow the third `arrive` mode that entry names — a walk that signs in, loads the file, picks a hull and starts a quote — and point density at a register with documents in it. That is a change to `e2e/routes.ts` and five rulers rather than to any screen, and it is the first thing to do next.

**`/quote/$id` is deliberately NOT in `e2e/routes.ts` yet**, for the same reason: neither `fresh` nor `through-the-door` reaches a document. The geometry it owes is measured in `e2e/flows/configurator.spec.ts` at all six widths instead, which is what `quotes.spec.ts` does for its own rows.

## The cascade is built, and the configurator's last refusal is retired (2026-09-17)

`/quote/$id/cascade?fix=&from=` is built from direction **B, "Because"** of `docs/research/refs/cascade/notes.md` §6, chosen by the builder because the owner handed the picks over, and **provisional** in `docs/SCREENS.md` until he has looked. It is a ROUTE and not a modal state — the teardown rates that finding above the layout — so Back, a refresh and a shared link all behave, and `e2e/flows/cascade.spec.ts` asserts each of the three separately.

**It is grouped by CAUSE, not by verb, and that grouping is the direction.** Porsche's sheet has one card of things added and one of things removed, and pays for it with five removed rows all reading *"not compatible with your selection"*. Measured on a Highfield SP560 moved from Cash to Trade, the engine gives three changed lines and five held — **two cards by verb, four by cause**, and the four causes are the dealer's own column names and the two ways a table can fail to carry a rung:

| the cause, in the engine's own words | what it owns |
|---|---|
| `now priced at Trade` | the hull, `$41,340 Cash → $39,273 Trade` |
| `now priced at Trade Price` | two Yamahas, `$14,531 Sell Price → $14,327 Trade Price` |
| `no Trade column — stays at Sell inc Rego` | two REDCO trailers, one figure each, unmoved |
| `no Trade column — stays at Sell` | the batteries |
| `no price column on this table` | the tube covers and the rigging kit |

**Not one sentence on the screen is written by the screen.** `src/screens/cascade/proposal.ts` reads every `because` off `src/domain/quote/cascade.ts` and its suite asserts that every heading drawn is a string that came out of that module. What the screen writes for itself is the three sentences about the ADDRESS — no engine knows what somebody typed — and they are why this survives the failure the sweep counted on Porsche's own route, which redirects to *"Select a Model Series"* when the address is incomplete.

**Two channels fire, both one press from the build:**

- **The rung.** The configurator now prints which rung the document is on, with `quoteLevelChoices`' own count of the lines that carry it, and every other rung is a press that navigates and writes nothing. This retires the last refusal on that screen — *"the sheet that shows what that costs line by line is not built yet"* — the way the picker's was retired, by having built it.
- **The hull.** A finish that moves the total opens `?fix=finish:<rowId>`; one that costs the same is applied in place, because the engine refuses to build a sheet with nothing to decide on it. **This is `fitmentCascade`'s first caller ever**, in this repo or the old one: its own header says the event cannot fire because `rootRowId` is written once at creation, and `refinishSubject` re-roots a standing quote, which is exactly the event. Measured on an SP560 → HYP: `+$7,010`, the hull's own from→to, the load floor's own sentence about what it could not check, and six REDCO and GFAB trailers priced from `$10,713` as the price file prices them.

**What is measured on this tree:** accepting applies through the engine's own commands — `setLevel`, `refinish`, and a `removeLine` per row the reading says comes off — each with its inverse and its typed event, and both suites assert that the total the sheet promised is the total the act produces and that the inverses put the document back. Declining writes nothing at all: the sheet never touched the document, which is why the address carries two facts where Porsche's carries three.

Its own gates: **19 node cases over the real pack, 13 component cases by role and text, and 66 Playwright checks passing across the six viewports** (11 flows × 6). The whole tree: **164 test files, 2,641 tests**, 14 static rules, no failures.

**`/quote/$id/cascade` is deliberately NOT in `e2e/routes.ts`**, for the same reason `/quote/$id` is not: neither `fresh` nor `through-the-door` reaches a document. The geometry it owes — no horizontal overflow at any width, and a decision block that is `position: static` rather than a floating bottom bar — is measured in its own flow at all six widths.

## The document is built, and it is one object on screen and on paper (2026-09-17)

`/quote/$id/document` is built from direction **A, "The sheet, at true size"** of `docs/research/refs/document/notes.md` §5, chosen by the builder because the owner handed the picks over, and **provisional** in `docs/SCREENS.md` until he has looked. It is the only screen in this app whose output is a physical object.

**There is no second renderer, and that is the whole direction.** The A4 page is the object on screen — 210 × 297 mm, at 1:1 wherever the window allows, on the same dark floor the rest of the app is drawn in, with crop marks at its corners and its page number in the gutter beside it — and print is the same nodes under `@page { size: A4; margin: 0 }` with the floor taken away. The sweep measured what a second renderer costs: Porsche prints the same `Basic equipment` chip mid green on its summary screen and neutral grey in the PDF of that identical configuration, so the meaning — green reads *included*, grey reads *inert* — did not survive the print.

**The page breaks are ours, because a browser will not tell a screen where a page ends.** `break-inside: avoid` instructs a printer and says nothing to a scrolling page, so `src/screens/document/paginate.ts` packs measured atoms — a row, a heading, a paragraph — into pages of the page's own content box, never splitting one, keeping a section head with its first rows. Rows are atoms, so a break can only fall between two of them. Each page is its own element with `break-after: page`, which is why the printed page count IS the number of sheets on the floor.

**What is measured on this tree,** on a Highfield CL290 (PVC) W-W-WD raised, addressed, issued and opened:

| | |
|---|---|
| the sheet | `793.7 × 1122.5` CSS px at 1440 and at 834, within 2 px of 210 × 297 mm — and a real PDF of **3 pages** against **3** sheets in the DOM, both readings of the file's own page tree agreeing |
| the cover | the boat's own held picture at `1,100 × 619`, printed at `656 × 369`, never enlarged, with the host and the packer's own verdict beside it; the price beside who it is for, `$5,517` at `Cash, tax included` |
| the three words | every money cell on the page is a figure, `Included` or `Not priced at this level` — nothing else, asserted cell by cell at all six widths — with the reason under the name where the rest of the line's provenance is |
| the fourth state | `Optional` is a fact about a REGISTER, counted off the `pickedCount` the mint froze: *"2 rows were offered from Yamaha Outboards and none is on this quote"* |
| the terms | the dealer's own, frozen at mint. This pack carries no organisation, so the document says so in a sentence and invents nothing |
| the catalogue | rendered once, the catalogue store emptied, rendered again: the text is identical, character for character |

**Its own gates:** 20 node cases over the real pack for `src/domain/quote/document.ts`, 12 for the packer, 17 component cases by role and text, and **37 Playwright checks passing across the six viewports** (5 skipped — the print case runs at 1440 only, because `page.pdf()` lays out at the paper's width whatever the window is). The whole tree: **164 test files, 2,642 tests**, 14 static rules, no failures.

**`/quote/$id/document` is deliberately NOT in `e2e/routes.ts`**, for the same reason `/quote/$id` and `/quote/$id/cascade` are not: neither `fresh` nor `through-the-door` reaches a document. Its geometry is measured in its own flow at all six widths — the sheet at true size at and above 826 px, one column below it, and no atom spilling out of the page it was packed onto.

**Two refusals elsewhere are now retirable and were left alone**, because this build owned `src/screens/document/**` and its route only: `NO_DOCUMENT` in `src/screens/configurator/Configurator.tsx` (*"the document is the next screen of this milestone and it is not built yet"*, said twice in the finale) and `NO_DOCUMENT_SCREEN` in `src/screens/quotes/Quotes.tsx`. Both now have somewhere to go: `/quote/$id/document`.

## Design: every built screen has directions, and the owner has not looked

- **Entry.** Four boards at `docs/directions/entry/`, critiqued and revised. Recommended: **B, "Veil and card"** — a Stacer 481 SeaMaster at dusk under a veil, a card clear of the water, two doors as full-width bars, and a panel naming the photograph's own row (`boat_stacer`, 91 rows) so the picture is not decoration.
- **Home.** Four boards at `docs/directions/home/`. Recommended: **B, "Cinema day"** — a Highfield on open water, six figures readable across a desk, one amber act. The critic: the only one that looks like a boat business rather than a spreadsheet with a greeting on it.
- Rebuild either canvas with `npx tsx tools/research/board.ts <screen>`; screenshot with `npx tsx tools/research/shots.ts <screen>`.

## Research and imagery, complete

110 reference frames for entry and home's own set, three modalities each, every claim tied to the frame that shows it. 4,768 picture candidates across eighteen brands, 4,320 verified live with pixel sizes. Highfield publishes real on-water photography per model up to 8047×5367, which retired the plan's biggest visual risk; Stacer publishes its on-water work at web size, which is why a board must say which brand it stands on.


## Home is wired, and the dealer can start from it (2026-09-18)

The independent critique's blocker was that Home had exactly one control on it, that the control did
nothing, and that its reason — *"The picker is not built yet"* — had been false since the day the
picker was built. Every address it needed already existed, so this was a routing change and three
deletions, not a design one.

**Four presses, measured on the running app:** `New quote` → `/quote/new`; each plate →
`/quote/new?brand=<that register's own id>`, which is the board's own "named door into that boat's
register"; `All quotes` → `/quotes`; and the card → the document it drew. `e2e/flows/home.spec.ts`
follows each one to the address it claims, at all six viewports, rather than asserting it is there.

**The drafts column stopped lying about a real draft.** *"1 drafts are open, and the register that
lists them is not built yet"*, printed over the empty diagram and its promise that a draft would one
day land in it, is now `1 draft is open.` with the newest document drawn in that very card: the
boat as it was frozen, who it is for, **$66,584** at `TOTAL AT CASH`, `3 lines · just now`, and the
SP560's own held photograph at 112 × 84 where the ledger holds that exact model. `src/screens/home/
filed.ts` reads every figure and every word off `domain/quote/register` and `domain/quote/pricing`,
so Home and the register can never disagree about what is filed, and the card draws correctly on a
desk whose price file has never been opened.

**Geometry with a document on the screen:** 800 in 800, 900 in 900 and 1,080 in 1,080 at the three
desk widths, no horizontal overflow at any of the six, the act `position: static` everywhere and on
the first screen at 233 of 844 in a hand. Contrast in the drafts column with the card drawn,
measured by compositing the real ancestor chain: worst pair **7.49 : 1**, smallest type 11px.

Its own gates: **7 new component cases by role and text, 8 node cases over `filed.ts`, 4 more over
the picture match, 18 Playwright checks in the home flow** (3 × 6 viewports), and the contrast, cut
and overlap rulers green on Home at every viewport they run. The whole tree: **165 test files, 2,682
tests**, 14 static rules, no failures.

`Tile` was extended rather than worked around: `selected` no longer defaults to `false`, so a tile
that OPENS something is an ordinary button to a screen reader instead of an unpressed toggle.

## Next

1. The owner looks at Entry and Home in the browser and says yes, or says what to change. Both are built and provisional until he does.
2. Milestone 1's remaining screens: picker, place, configurator, cascade, document, quotes register — each with its own sweep and directions. Each joins `e2e/routes.ts` on the day it is built, and says how it is reached.
3. ~~The first refusals to retire as their screens arrive: New quote (waiting on the picker), and both photograph plates on Home (waiting on a register screen).~~ **Done 2026-09-18**: both retired by having built the screens, and the sentences deleted rather than reworded. What is left of the same fault elsewhere is named in `docs/directions/built-critique.md` — the register's `Open it` and `New quote`, and the configurator's finale.

## Open questions for the owner

1. The 1,193 obsolete Highfield SKUs: a 26th retired table, or none?
2. Where to record the 25 Mercury and twin-bundle motor names the Motor Library does not hold.
3. What the 121 Highfield colourway codes `I`, `O`, `R`, `WH` mean. A question for the dealer, never a guess.
4. `public/seed-images` is 12.1 MB. Smaller long edge, lower quality, or leave it?
5. `rig_kits` carries `Sell Price` and `Trade Price` that the old engine never priced and no rung reads.
6. Does "full customisability" stop at colour, mark and pictures, or extend to handing over the layout? The second is a page builder and its own milestone. See `docs/CUSTOMISATION.md`.

## The register opens what it lists (2026-09-18)

The critique's blocker on `/quotes` was that the register could not open the document it had just
listed, and that this was never a stale sentence: `QuotesProps` declared **no `openDocument` and no
`newQuote` prop at all**, and `src/routes/quotes.tsx` passed only `goHome` and `openTheFile`. So
`Open it` and `New quote` both carried `aria-disabled="true"`, and a dealer who pressed
`Make a new version` had no way to open the version they had just made.

**Both addresses already existed, so this was a routing change and two deletions.** One prop carries
the seam — `openQuote(id, state)`, the shape Home settled the day before — because which address a
press lands on is a fact about the DOCUMENT and belongs to the route: a draft opens at `/quote/$id`
where it can still be changed, an issued or superseded one at `/quote/$id/document` as the paper the
customer holds. `NO_DOCUMENT` and `NO_PICKER_HERE` are gone; what is left is the one honest refusal,
said when a render was handed nowhere to go, which is a component test and never a browser.

**Four presses, driven on the running app at 1440 × 900:** `New quote` → `/quote/new`; `Open the
build` on a draft → `/quote/XaRRxt2eZF`; `Enter` on an issued row → `/quote/lXKYb_qOBa/document`; and
a second press on a row does what `Enter` does. The act is named for what it opens and the sentence
under it says what that press does, so nobody presses it to find out.

**What else the critique measured on this screen, and what it reads now:**

| | before | after |
|---|---|---|
| the ledger at 1920 × 1080 | six rows and ~750 px of empty frame, the act stranded at its foot | last row bottom **282**, act top **282** — the frame ends where the rows do |
| the act row | 98 px, most of it a refusal about an unbuilt picker | **70 px**, which gives the list **20 rows at 1280 × 800** against the 18 it owes, and 24 at 1440 |
| the amber | drained out of the only act on the screen | the live `--color-act`, and it moves to `Open the …` while a document is open, so there is exactly one |
| the stamp | `…ARE ON THIS / SCREEN`, one word alone on a right-aligned line | `text-wrap: balance`, two even lines |
| one filed quote | "1 quote is filed in this browser, and all of them are on this screen" | "…, and it is on this screen" |
| the key legend at 390 | `J K Space Enter Esc` on a device with none of them | drawn under `pointer: fine`, replaced by the touch sentence under `pointer: coarse` — measured both ways |
| the panel's scrollbar | the system's light grey on a dark plate | `scrollbar-color` from the screen's own tokens |
| `Discard this draft` on an issued quote | a label arguing with its own refusal | `Discard this quote` |

Its own gates: **33 component cases by role and text** (was 27) and **31 Playwright checks passing
across the six viewports** (5 per viewport plus the density reading at the laptop, 5 skipped), two of
them new: a walk that signs in, loads the file, picks a hull, starts the quote and then opens that
same document from the register, and a press of `New quote` that lands on the picker. Nothing is
planted in IndexedDB; the document exists because the walk pressed the act that makes one. The
contrast, cut, overlap and ramp rulers are green on `/quotes` at 390, 1280 and 1440 — 26 text nodes
walked, 0 below threshold, 0 cut, 0 overlapping — and there is no horizontal or vertical overflow at
1280 × 800, 1440 × 900 or 1920 × 1080, with the act `position: static` at every one.

**What was deliberately left alone.** `density — quotes` is still the one red ruler: it opens a
browser nobody has used, so the register is honestly empty and six things are all a grid can expose.
That is a change to `e2e/routes.ts` and five rulers — the third `arrive` mode this file has now named
three times — and not a change to this screen. The app-wide findings the critique lists under
`app-wide` (the light `color-scheme`, the missing `errorComponent`, no `<a>` anywhere) are also left:
each belongs to `index.html`, `src/routes/__root.tsx` and every screen at once, and this build owned
`src/screens/quotes/**` and its route.

## The app is dark, a dead end is a screen, and the first links exist (2026-09-18)

The three app-wide findings of `docs/directions/built-critique.md` — the ones the register build
explicitly left alone because "each belongs to `index.html`, `src/routes/__root.tsx` and every screen
at once" — are answered.

**The document and the screens no longer disagree about the light.** `index.html` said
`color-scheme: light` and `app.css` painted the body white while all seven screens painted their own
dark room, so the browser drew the parts no stylesheet can reach for a light page. Two declarations —
`:root { color-scheme: dark }` and the body on `--color-ground` — and, measured on the running app at
1440 × 900 after the walk: **no element on the picker has a scrollbar wider than its own 1px border**
(`offsetWidth − clientWidth` is 2 on `.picker-stage`, which is the border), where the critique
counted a 17px classic light-grey rail there. `@media print` puts both back to light, because the
document screen prints the same nodes it draws and A4 is white.

**`/nope` is a built screen.** `src/screens/lost/` — its own folder, its own stylesheet, its own
reflow ladder — with the ADDRESS as its subject: labelled, in the mono face at `--text-2xl`, wrapping
at any character, cut at 120 with the cut said out loud and the true length printed. Under it one
amber act (Home) and two doors carrying the other two addresses, each with the address itself in mono
where entry's doors carry an arrow. It is `notFoundComponent` on the root route and
`defaultErrorComponent` on the router, so a screen that THROWS lands there too, with its own words
quoted verbatim and `Draw it again` beneath them.

| measured on this tree | |
|---|---|
| geometry | 1440 × 900: band 720 wide, x 360–1080, y 83–817, no overflow in either axis. 390 × 844: **844 of 844**, the whole screen on one screen, act full width and `position: static`. 844 × 390: the address, the sentence and the act on the first screen (act 307–359 of 390), the two doors one flick below. 1920 × 1080: band 800, centred, page 1080 of 1080. |
| the rulers | `/nope` joined `e2e/routes.ts` as the first `foundation` route. **Contrast 13 text nodes, 0 below threshold; cut 16 runs, 0 elided, 0 cut; overlap 16 runs, 0 overlapping — at all six viewports** (18 checks). |
| the act | the live `--color-act`, 256px on a desk and 358 of 390 in a hand, because the primitive fills the measure its container gives it — `.lost-act` is a grid for that reason, and a block made it 109.5px of a 256px column until that was measured. |

**The app has `<a>` elements.** `Button` takes an `href` and renders the same class on an anchor: a
plain left click is prevented so the router still navigates with no page load, and a middle, ctrl,
cmd, shift or alt click is left to the browser, which is the whole point. A refused control is never
a link. Measured live: three real `<a>` on the lost screen, three in the document's chrome
(`Home` · `The register` · `Start a quote`, wrapping at 390 with no horizontal overflow), three in
the document's blank state and three in the configurator's — the two dead ends the critique named,
which carried one honest sentence and, on a desk with the price file already open, no control at all.

`src/app/ways.ts` names the three front doors once, and `shell.test.tsx` mounts the real route tree at
every one of them and asserts a real screen arrives rather than the lost screen.

**The router moved to `src/app/router.ts`.** Until now the app built one router and every suite that
drove the real tree built a different one, which is exactly why a missing `defaultErrorComponent`
could not have been caught by a test. `shell.test.tsx` now takes the app's own router and hands it
only a memory history.

Its own gates: **13 component cases by role and text** beside the screen, **8 more in the shell
suite** (the not-found screen, every front door being a real address, the act landing on Home, the
app router's error component, and a fabricated route tree that really throws), and the three rulers
above. The whole tree: **166 test files, 2,723 tests**, 14 static rules, no failures.
