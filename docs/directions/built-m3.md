# Milestone 3, built and walked (2026-10-22)

The verify round for Milestone 3: the full gate run alone, then the built app served with `npx vite preview --port 5261` and driven by hand. The four new screens are Rules, Fitment, Prices (`/levels`) and Review. I read every step as a sales manager who reads nothing. The walk was done at 1280 × 800, 390 × 844 and 1920 × 1080. Screenshots are under `docs/directions/<screen>/built/m3-*.png`, and the pill and finder shots are under `shell/built/`.

The tree this round judged is **not committed**. HEAD is `3c8a46f`, and all of Milestone 3 sits in the working tree: 28 modified files and the untracked `src/screens/{rules,fitment,levels,review}`, `src/routes/{rules,fitment,levels,review}.tsx`, the new domain files and the four e2e flows.

## The gate, alone, on this tree

| check | reading |
|---|---|
| `npm test` | **green**: 253 test files, 4,132 tests and 17 static rules, with no failures. Typecheck, lint and format all pass (354 s wall). |
| `npm run build` | **green, with one warning.** The `ui` chunk is **694,075 bytes**, 194,075 over Vite's 500 kB line. It was 503,010 at the last close, so it grew by 191 kB. `pictures-*.js` is 585,673 bytes and is also over the line. |
| `npm run e2e`, first reading | **2,088 tests: 1,593 passed, 490 skipped by design, 5 failed** (1.9 h, 2 workers, 6,922 s wall). |
| `--last-failed --timeout 120000 --workers 1` | **5 of 5 failed again** (149 s). |

All five reds come from the app's tree, not the machine:

1. **`[phone] shell.spec.ts:205`, "every door reaches the address it names".** It timed out waiting for a `Rules` link on the phone's pill. Rules is `hand: false` in `src/app/ways.ts`, so the phone's bar does not draw it unless you are already on `/rules`. The spec loops over every `DOORS` entry and was not updated for `hand`.
2. **`[phone] shell.spec.ts:556`, "from a sheet, the lit door is the one way back".** The cause is the same. The spec expects the pill's hrefs to equal `['/', ...DOORS]`, and on the phone `/rules` is missing.
3. **`[desktop] rulers/fixture.spec.ts:364`, refusals board.**
4. **`[desktop] rulers/fixture.spec.ts:422`, refusals board.**
5. **`[desktop] rulers/refusal.spec.ts:178`, "every refusal the primitives can say".**

Items 3 to 5 all fail with the same error: "The primitives declare tone="fix" and the refusal board does not know which ground it is drawn for. Say so in DRAWN_FOR (e2e/rulers/measure/refusals.ts)". Review added `Tile tone="fix"` to the kit, and the refusal board was never told about it. The result is that **no refusal in the app has been read for contrast on this tree.**

Nothing was changed to make any of these pass.

**About the machine.** Six idle `vite` servers were left running by earlier builders: dev servers on 5212, 5222, 5232 and 5242, and a preview on 6095. They were left alone.

There was also a trap for anyone screenshotting by hand. The Playwright MCP browser holds a **67% page zoom for the host `localhost`**: `devicePixelRatio` reads 0.667 and `innerWidth` reads 1920 in a "1280" viewport. Every screenshot taken against `http://localhost:5261` is therefore a 1920-wide render, scaled down. This walk was redone on `http://[::1]:5261`, which is a different host at 100%. A critic who walks `localhost` in that browser will judge the wrong layout.

## The exit criterion

**It holds at all three sizes.** I wrote the rule "When the boat's Eng Configuration is Tiller, the motor's Control must be Tiller handle, because a tiller boat has no helm to steer a remote motor from". The census read 245 of 810 boats, 171 of 241 motors, and 45 of the 540 the price list makes taken away.

On the next pick, the Highfield Classic 340's motor chapter read "Not offered on this boat: the Yamaha F25SWTC, because a tiller boat has no helm to steer a remote motor from. Your rule: …", and the F25SWTC was gone from the list, from "Show all 209" and from search. "See the rule" led to the rule. I switched it off, pressed Back, and the F25SWTC was on the list again with no sentence.

"Warns" also works once it is kept: the motor stays on the list and the sentence over the list reads "Your rule warns about the Yamaha F25SWTC, because …".

## Screen by screen

### Entry (`/sign-in`)
- **1280:** This is the door, and it is beautiful. The name field and "Load the Master Price File" sit on the left and the Stacer photograph on the right. When pressed, the door reads "Reading the Master Price File" on its own face, and the file arrives in about 3 s. Nothing is wrong.
- **390:** It walked cleanly to Home.
- **1920:** The composition is centred at about 1240px, while the photograph bleeds off the right edge, so the right margin is not the left margin. That is acceptable, and there is no fault.

### Home (`/`)
- **1280:** Northside's mark sits on live water, with "Good morning, Dana.", the find and New quote. At this width the boat names are cut ("Signature Fishe…", "GRT 455 · Side …"), and the brand row's bottom edge sits on the fold.
- **390:** The bar is at the top and scrolls away with the head, as designed, and the find and New quote are stacked. It is clean.
- **1920:** This is the best screen in the app. Eight boats and seven makers fill the width.

There is no door from Home to any Milestone 3 screen except Rules on the pill.

### The shell (the pill and Ctrl K)
- **1280:** The pill reads Home · Quotes · Customers · Data · Rules · History · Find. Every word reaches its address. The finder opened from all 15 routes, including a given quote, its paper, `/quote/new` and `/nope`, found the Sport 660 every time, and shut on Escape.
- **390:** The pill's bar carries five words, and **Rules appears only while you are on it.** On every other screen Rules is reachable only by typing "rules" into the finder, which a person who reads nothing will never do. While you stand on it there are six words, and they are tight but they fit.
- **1920:** Fine.

**Two faults at every size:**
- **A toast follows you between screens.** "Your rule is switched off. Undo" was still standing on Quotes and on History after I left Rules, so an Undo for a rule stands on the quotes register.
- **Typing "fitment" in the finder lists six boat makers** (Stacer, Formosa, Surtees, Jeanneau, Stabicraft, Haines Signature) under "In the price list", above the tiller fitment kits, for no visible reason.

### Data (`/data`)
- **1280:** The seven maker plates sit over the lists table. Stabicraft's plate is its name in type, while Home draws Stabicraft's mark, so the same maker has a logo on one screen and none on the next.

  The opened plate says "PRICES: Cash · Trade · Warranty · and 5 costs, never on a quote", and that line opens nothing. Prices (`/levels`) is the screen it describes, and **nowhere on Data is there a door to Prices, Fitment or Review.** I counted the anchors: the only Milestone 3 address anywhere on Data is `/rules`, in the pill. The design calls them "rooms behind the Data door", but the room has no door. All three are reachable only through Ctrl K or a typed address.

  The plate also says "WHERE FROM: Boat Module (5).xlsx, on its Boat Module tab", which is a file name a dealer does not need.
- **390:** The plates stack as cards, and each opened plate is a long scroll. Clean.
- **1920:** Clean. The same missing doors apply.

### The sheet (`/data/$table`)
- **1280:** Folding a model ("Shut Roll Up 230 KAM") folds it to one line with its facts. A double-click on Cash edits the cell, and the step line reads "Cell edit · Highfield Inflatables · Cash on Highfield - RU250KAM (PVC) WH: $3,060 → $3,100 · Undo". Undo puts it back and says "Undone — … Put it back". Everything works. The step names the row by its file code ("Highfield - RU250KAM (PVC) WH"), not by "Roll Up 250 KAM".
- **390:** A hand edits in the record. I pressed a model, then "Cash: $3,060. Press to change it", typed and pressed Enter. **The edit is written, but its sentence and its Undo sit under the record's own panel and cannot be seen or pressed:** Playwright reports `sh-record__acts` intercepting the Undo. The person sees nothing happen. Only after "Back to the price list" does the step line appear with its Undo.

  The record is also titled "Highfield - RU250KAM (PVC) WH", and its foot reads "Boat Module (5).xlsx · sheet "Boat Module", rows 281–948 under the yellow brand banner at row 278. Its columns are read from THAT row, not row 1 … 588 of 588 SKUs seeded." That is an engineer's note on a dealer's screen. It also says "No picture of it yet", while the list one tap back shows the boat's picture.
- **1920:** Same as 1280, and clean.

### Rules (`/rules`), new
- **1280:** The plate opens on the price list's own F7 with its census (565 · 38 · 0) and "What it costs a sale today". Writing a rule word by word works, and each value list shows its counts. "Add it, refusing" is refused in ochre, with its reason under it, until every word is chosen. Adding, switching off and deleting each raise a toast with Undo. These are the problems:
  - **The spec lists are the file's raw column names:** "Matrix", "Shaft Lgth", "Head/s", "Boat Rego Decals". There is no maker and no model, so a dealer cannot say "a Haines boat never gets …".
  - **The boat and motor speak different units.** The boat's Shaft Lgth is L/S/XL and the motor's Shaft Length is 20″/25″, so a shaft rule needs knowledge the screen does not give.
  - **"What it costs a sale today" is muddled when nothing is lost.** It reads "Nothing the price list makes for these boats. It stops a search past the list: on the Highfield PA460 (PVC) DG-G-DG, the Yamaha F2.5SMHB, the Yamaha F4SMHA, … and 169 more can no longer go on." A boat and three motors are run together as one list of things, and the boat it names changes from load to load (the Stabicraft 2050 Frontier FT on one load, the Highfield SP760ST on the next).
  - **Two controls own on and off.** The segmented refuses/warns/off and the list's switch both do it, and they behave differently:
    - The switch acts at once.
    - **A verb pressed on a written rule waits for "Keep the change". If you leave without pressing it, the change is thrown away silently.** I pressed "warns", went to the build, and the rule was still off. There was no warning on leaving.
  - **Off is contradicted on screen.** With the rule switched off, the switch's label still reads "On" beside an off switch. The cost panel still says, in the present tense, "The Highfield CL340 … loses the Yamaha F25SWTC", and the census still says "45 … taken away", while the line above says "Off: it refuses nothing".
  - **The rule list leads with the alarming figure.** It reads "Refuses 171 motors on 245 boats", while the true cost on the file is 45 pairings.
- **390:** The sentence wraps well, and the word lists open in place. The toast covers the "Yours" list. As said under the shell, Rules is not on the bar once you leave it.
- **1920:** Fine. The plate holds at 1240px.

### Fitment (`/fitment`), new
- **1280:** I arrived by Ctrl K → "fitment". The cold screen is "Which boat?" with one field and 90% empty page. For a boat with a photograph (the Sport 660 at 1920) the rig plate is good: the starred F175XC, the hp band "Takes 150–200 hp", the trailer with its ATM bar, and the reasons counted.

  For **the Classic 340, which has no render, the plate's middle is an empty white field reading "No photograph of this boat yet." with the four numbered callouts floating around nothing.** At 390 this is a blank card with four dots, and it looks broken.

  The dealer's rule does reach Fitment: the F25SWTC is struck with "Your rule: a tiller boat has no helm …". These are the problems:
  - **"3 of 209 made for this boat" still counts the motor the rule refuses.** The build says "1 more offered" and "Back to the 3 made for this boat".
  - **An inflatable with no trailer is shown "The other 434, and why each is not offered".**
  - **"Built for another boat, across 7 makers"** then lists "… Cap Camarat 5 · Merry Fisher 4", which are Jeanneau ranges, not makers.
  - **The struck example trailer changes from load to load** (GFAB once, REDCO the next).
  - **Callouts 3 and 4 swap.** At 1280 and 390, 3 is Parts & Accessories and 4 is Dealer Fit. At 1920, 3 is Dealer Fit and 4 is Parts.
  - **A bad `?boat=` is answered honestly:** "That boat is not on the price list. Choose another."
- **390:** It stacks motor, trailer, parts and dealer fit. Under Show all, the grouped list is readable. The no-photograph card is the worst-looking thing in the walk.
- **1920:** It is at its best with a photograph. The Show-all grid of 434 grouped by reason is long but legible.

### Picker and configurator (`/quote/new`, `/quote/$id`)
- **1280:** The picker found "Classic 340" and asked for the material (PVC $6,770 / Hypalon $10,190), and Start opened the draft. The build adds the "Tube Covers to suit PVC Boat · 3.4 Mtr" by default **with no price**, and says so under the total: "Dealer Fit Packages have no price on the price list, so … is not in this total." The finale lets it be given with that line unpriced.

  Search "F25SWTC" still offers "Rigging kit for the F25SWTC" and the PDI package for it, which are the parts of a motor the dealer has just refused on this boat. The refused motor carries no mark on its own card under "warns"; the warning is only the sentence above the list.
- **390:** The motor chapter, the refusal sentence and the motor cards stack cleanly, and the finale fits.
- **1920:** The build is fine. Its left column is a 1040px brand band over a lot of empty sky when the boat has no photograph.

### Prices (`/levels`), new
- **1280:** "Which price each customer pays." The ladder runs fourteen lists across, Cash and Trade down, and Warranty and costs on the dark ground. At 1280 it is crowded:
  - **The brand marks are about 40px wide and barely legible** (Surtees, Jeanneau, Haines, Highfield, Formosa).
  - **The ePropulsion column has no name or mark at all, only "32".** Its accessible name exists; the eye gets nothing.
  - **The Costs row is fourteen "5 costs" cells** that mean nothing at a glance.
  - Highfield counts 588 (variants) where every other maker counts models.

  I pressed Stacer, typed 95, and the census read "91 Trade figures written · 91 the same as Cash today · 0 with no Cash", with the worked example "309 Skimma: $1,730 → $1,643". "Set on 91 Stacer boats" wrote all 91, and the ladder now reads "95% of Cash on all 91". Undo from the toast put them back. These are the problems:
  - **The only Undo is the toast, and it lives 8.5 s** (measured). Reading the census took longer than that. After it went, **nothing on the screen undoes a 91-cell write**; I had to type 100 and set it again.
  - **An undo says nothing.** The toast vanishes with no "Undone", where the sheet says "Undone — … Put it back".
  - **The ladder's sticky header slides under the pill when scrolled.** At 1920 the Surtees and Jeanneau marks are covered by it (`levels/built/m3-1920-census.png`).
- **390:** The ladder becomes one card per list (Cash, Trade, Warranty, Costs). Pressing Stacer opens its panel under it, and Set and Undo work. Clean, but long.
- **1920:** The ladder reads well at this width. The fault is the overlap with the pill.

### Review (`/review`), new
- **1280:** It is clear and good. The money is said once in the head ("$819 registration not charged on 7 trailers · $234 charged over on 2 · 3 names at two prices · 147 on sale with no price"), the nine wrong sizes stand with the fix beside each, and one press wrote the Dunbier ALP 5.3M. The head counted down to $702 on 6, and Undo put it back to 7. The fold rows say what is in them.

  "Two under one name: Dealer Fit Packages has two Code and two CTD" is file jargon.
- **390:** Each trailer stacks over its fix, the toast is readable, and the fix and undo both work. This is the best of the four new screens on a phone.
- **1920:** **The money band is misaligned.** It starts at x = 32 and ends at 1352, while the title and every check run from x = 300 to 1620. The head is not over the column it counts. At 1280 the two are aligned.

### Document (`/quote/$id/document`)
- **1280:** It is given to Rose Kelleher on 2 pages of A4, with Print and "To keep a PDF, choose Save as PDF". Print called `window.print` once, and in print media the pill and the "Not printed" panel are gone. These are the problems:
  - **The sections are numbered 01 The hull, 02 Motor, 04 Dealer fit. There is no 03, because there is no trailer, so the customer reads a missing section.**
  - The dealer fit line prints "Price to be confirmed" on a given quote.
  - The cover is the Highfield wordmark on a grey block, because the boat has no photograph.
  - Page 1 is half empty under "Prepared by".
  - "Terms: None set yet." There is no screen anywhere on this tree where terms are set.
- **390:** The page reads as A4 shrunk into a column, with the same 01/02/04 numbering.
- **1920:** Same. The paper sits centred with the "Not printed" rail beside it.

### Quotes (`/quotes`)
- **1280:** The Draft, Given and Replaced groups work, and so does the peek with "Not ready to go to a customer: No customer's name is on this quote yet, so it cannot be given." The peek shows "On the price list: Highfield - CL340 (PVC) W-W-WD", a file code.
- **390:** The rows are the quote. A press opens the peek in place, and "Open the build" leads on. Clean.
- **1920:** With one quote, **the left pane is a 1000 × 800 white field holding a huge Highfield wordmark and "No photograph of this boat yet."**, beside an empty right pane, "Press a quote to see it". It reads as a placeholder, not a register.

### History (`/history`)
- **1280:** One row for the given quote reads "05:58 · started · named … Given $11,686". It names two of the three things done (no "given" verb), while the day's chip carries three dots and the footer says "The first quote, at 05:55": two different times for one start. There is a tall empty gap between the row and "The last fourteen days". The boat card prints "NO PHOTOGRAPH OF THIS BOAT YET." in capitals under the wordmark.
- **390:** Same content, stacked. The day chip's three dots wrap onto two lines inside a 30px chip.
- **1920:** Same, with more empty sky. The rule toast from Rules was still standing here.

### Customers (`/customers`)
- **1280:** Rose Kelleher's page shows the letter card, "From quote 20261022-01", Change name / Add phone / Add email / Add address, the yard's note, and Written 1 / Given 1. It is clean.
- **390:** Clean.
- **1920:** Clean.

## Where the flow breaks, confuses, or does nothing

1. **Three of the four Milestone 3 screens have no visible door.** Prices, Fitment and Review are reachable only by Ctrl K or a typed address. Data's own plate prints "PRICES: Cash · Trade · Warranty" as dead text. On the phone, Rules joins them, because it is off the bar.
2. **At 390 a sheet edit is invisible.** Its sentence and Undo sit under the open record.
3. **On Prices, a 91-cell write is undone only from a toast that lives 8.5 s.**
4. **On Rules, a verb change is lost on leaving without "Keep the change"**, with no warning. The switch and the segmented control disagree about how off works.
5. **On Rules, an off rule still says "On" by its switch,** and still says the boat "loses" the motor.
6. **Toasts outlive their screen.** A Rules Undo stands on Quotes and History.
7. **The given document numbers its sections 01, 02, 04.**
8. **Fitment counts a refused motor as "made for this boat"**, and so does the build's "Back to the 3".
9. **Fitment's callouts 3 and 4 swap places between sizes**, and its no-photograph plate is four dots around nothing.
10. **Review's money band is misaligned at 1920.**
11. **Prices' sticky header runs under the pill.**
12. **Prices' ePropulsion column is unnamed.**
13. **File words reach the dealer:**
    - Data: "Boat Module (5).xlsx"
    - Rules: "Shaft Lgth", "Matrix"
    - Review: "CTD"
    - The sheet: the record's "rows 281–948 under the yellow brand banner"
    - Quotes, Rules and the sheet name the line "Highfield - CL340 (PVC) W-W-WD"

**Two screens that read as the same shape:**
- Rules' "Stated in your price list" and "Noticed" rows, and Review's folded checks, are the same white rounded bar: a title, a count chip, and a figure or "Open" at the right. A dealer moving between "what the file says" and "what is wrong in the file" sees one list twice.
- Fitment's Show-all grid (struck rows grouped under a counted head) and Review's opened checks (rows grouped under a counted sentence) are also one shape.
- Prices at 390 is the same stack of white cards as Data at 390.

## Refusal rot: every refusal sentence in `src/screens/**` and `src/routes/**`

"Unreachable" means the screen says it only when its route did not hand it a way. Every route on this tree does hand it one, so the sentence is true but can never be read in the app. "Kit" means `/kit`, which is a specimen page.

| where | sentence (shortened) | still true? |
|---|---|---|
| cascade/Cascade.tsx `NO_WAY_BACK` | "There is nowhere to go back to … opened without the build it belongs to." | True; unreachable, because the route always passes `goBack`. |
| cascade/proposal.ts `NO_FIX` | "This link does not say which change to price …" | True. |
| cascade/proposal.ts `NO_QUOTE` | "There is no quote at this address. A quote stays on the computer … under Quotes." | True. |
| cascade/proposal.ts `NO_FILE` | "Nothing can be priced again until the Master Price File is loaded …" | True. |
| cascade/proposal.ts :470/471 | "already priced at {rung} …" / "Nothing on this quote changes price at {rung} …" | True. |
| cascade/proposal.ts :603 | "That finish is not on the price list, so the boat … cannot be changed to it." | True. |
| configurator `NO_DOCUMENT_HERE` | "This page has no way to open the printed quote …" | True; unreachable. |
| configurator, give act (`issueBlockers`) | `ADDRESSED_TO_NOBODY`, nothing on the quote, comes to $0, hull with no price, typed price with no reason, **new: "… at Warranty, a price Northside keeps to itself … let it reach a customer on Prices"** | True. The new one names "Prices", a screen with no visible door (see breaks, item 1). |
| configurator `ruled-here` (new) | "Not offered on this boat: the Yamaha F25SWTC, because …" / "Your rule warns about …" | **True**, walked at three sizes. |
| configurator/finishes.ts | "This boat is no longer on the price list, so its other finishes cannot be read." | True. |
| configurator/say.ts | "Nothing to search until the price list is loaded." | True. |
| customers `NO_SHEET_FOR_A_BOOK` | "The price list is not loaded, and customers are saved with it …" | True as far as the storage goes, but it **contradicts shell `NO_FILE_YET`** ("… Quotes and customers are all here"). Not walked without a file. |
| customers `NAME_NEEDED` | "A customer needs a name before they can be added." | True. |
| customers `NO_WAY_TO_OPEN`, `NO_WAY_TO_THE_PICKER` | "This screen was handed no way …" | True; unreachable. |
| customers :622 | "{ref}: {linked.refused}" | True (passes the engine's own sentence). |
| data/Spread.tsx `NO_WAY_TO_THE_SHEET` | "Nothing was opened: this screen has no way to the list's own page." | True; unreachable. |
| data/Spread.tsx `NO_WAY_TO_CUSTOMERS` | "Nothing was opened: Customers is on the bar every screen carries." | True but loose: Entry carries no bar. Unreachable. |
| document `NO_TERMS` | "None set yet." | True, but **there is no screen on this tree where terms are set**, so "yet" points at nothing until Milestone 5. |
| document `NO_LETTERHEAD` | "Set in type, because no mark has been added …" | True when said; not said on this tree, because the mark is printed. |
| document `NO_NAME_FROZEN`, `NO_QUOTE_HERE` | "… started before a business name was set …" / "A quote stays on the computer …" | True. |
| document/paper.ts `NO_LEVEL_ON_IT`, :352/356 | "No item on this quote has a price to choose between …" / "… cannot be said" | True. |
| entry `NO_PASSWORD` | "Nothing typed here is checked against anything, and the name stays on this computer." | True. |
| history `NO_WAY_TO_OPEN` | "… Quotes, on the bar, opens every quote." | True; unreachable. |
| history `NO_WAY_TO_THE_PICKER` | "… New quote on Home or on Quotes starts one." | True; unreachable. |
| history `NO_SHEET_TO_PRICE_FROM` | "No price list is open on this computer … Load the Master Price File …" | True. |
| history `NO_DIARY_SAY` | "What was done on this quote was not kept …" | True. |
| home `NO_WAY_TO_THE_PICKER`, `NO_WAY_TO_A_FILED_QUOTE`, `NO_WAY_IN`, `NO_FINDER` | "This screen was handed no way / no finder … The finder is on the bar." | True; unreachable. |
| levels :413 (new) | "While it is off, a quote with a line at Warranty cannot be given." | **True**: `issueBlockers` case 6 (`keptFromCustomers`). Not walked, because the build offers no Warranty rung to pick. |
| levels, `priceCommands.ts` (new) | "Type the share of Cash, as a per cent." / "… is not a per cent." / "A share of nothing would price every line at nought." / "Above 100% … would pay more than a customer off the street." / "Every Stacer boat … already holds 100% of it as Trade." | True; the last one was walked. **A no-op command returns `refused: ''`**, and the screen then says nothing (`Levels.tsx:259`, `Rules.tsx:231`). That is a silent refusal, against CLAUDE.md's rule. |
| lost `NO_WAY_OUT` | "No way out was handed to this screen …" | True; unreachable. |
| quotes `NO_WAY_TO_OPEN`, `NO_WAY_TO_THE_PICKER` | "This screen was given no way …" | True; unreachable. |
| quotes `ISSUED_IS_NOT_DISCARDED` | "This quote has been given to the customer, so it stays." | True. |
| quotes/Panel.tsx :54 | "A quote is a draft until it is given … the old one moves to Replaced." | True (Replaced is a group). |
| review :1027/1135 (new) | "Type the second one's name first." / "Type its name first." | True. |
| review :324 (new) | "Nothing changes until you press." | True. |
| rules, `pairRules.ts` missing words (new) | "Choose which of the boat's specs this rule looks at." / "Choose the boat's {spec}." / … | **True**, walked. |
| rules/read.ts F9 (new) | "A trailer rated below the boat's weight is flagged, never refused." | "Never refused" is true. "Flagged" is true on Fitment only ("… kg short"); I found no flag in the build. |
| rules/read.ts A2 (new) | "A standard motor under the boat's Min HP is flagged, never refused." | The same reading: flagged on Fitment ("Under the … this boat takes"), not in the build. |
| rules :781 (new) | "Off. On, it would refuse {n} …" | True. **But in the same off state, the rule's cost panel says "… loses the Yamaha F25SWTC" in the present tense, which is false while off.** |
| sheet/More.tsx | "A column needs a name before it can be added." / "Nothing is added until "Add the column" is pressed." | True. |
| sheet `NO_SHEET`, `NO_WAY_TO_THE_FILE` | "No price list is open … Load the Master Price File …" / "Nothing was opened here. The Master Price File is loaded at sign-in." | True. |
| shell `NO_FILE_YET` | "The price list is not loaded yet, so there are no boats to find. Quotes and customers are all here." | Doubtful against Customers' "customers are saved with it" (above). |
| shell `NO_DESK` | "A quote is written for the dealership signed in, and none is …" | True in effect, but "signed in" contradicts Entry's "There is no password". |
| shell :351 | "The price list is not loaded, so there are no boats to choose from." | True. |
| shell/Finder.tsx role=alert | the finder's refused way | True (it passes the way's own sentence). |
| shell/vocabulary.ts `NO_SHORTCUT` | "No shortcut matches "{q}". Every key this app answers to is on this sheet." | True. |
| kit/Kit.tsx (three) | "The kit has no quote, so there is nothing to give." / "Drawn refused, so its reason can be read at rest." / `accentRefusal` | True for the specimen page. Note that `/kit` ships to stakeholders as a reachable route. |

No refusal sentence on this tree names a milestone, says "not built yet", or points at a screen that does not exist. Two point at screens that exist and have no door: issuing's "on Prices", and Data's "PRICES" line.
