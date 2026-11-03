# Prices (`/levels`), judged — data round, 2026-11-04

I judged this screen fresh, without having seen it before. I served it from its own build (`e2e/out/dist-6270`, Vite's preview on port 6270, started and stopped inside each foreground run) and reached it through the real door with the real Master Price File: a name, then *Load the Master Price File*, as `e2e/door.ts` walks it. Each of the six sizes ran in a fresh Chromium context at device scale 1, with touch on for the two phones. The salesperson's round trip (a Classic 340 quote refused on its finale → *Choose on Prices* → choose → *Back to the quote*) was walked at 1440 × 900 and 390 × 844, with the same presses `e2e/flows/levels.spec.ts` makes.

Every screenshot named below is in `before/`, with its size in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). The 28 states 00–22 were taken at all six sizes. `21-focus` was taken at the four desk sizes only, and `30`–`34` (the quote round trip) at 1440 and 390 only. That is 176 frames.

In every state I measured:
- sideways scroll
- anything off the window's edge
- text cut by its own box
- controls under 24 px
- text under 12 px
- page errors
- what the floating pill covers

**What measured clean.** In all 28 states at all six sizes:
- sideways scroll was 0;
- nothing was off the edge;
- no text was cut;
- no control was under 24 px;
- there were no page errors.

The page drew 0.43–0.96 s after the door, and the door took 2.1–2.6 s.

**Verdict: DEEPEN.** The composition is right, and it is the right idea for this screen:
- the questions only Northside can answer come first, counted, in ochre;
- what is worked from cost sits sunk below the page with its one switch;
- what the file already settles is quiet tiles led by makers' marks.

Every write is counted before it happens, written for real, and taken back by one Undo that stays. The salesperson's loop from a refused quote lands on the quote's own line and leads back.

It is not at the level it has to be. It asks Northside to choose between figures it never explains. It reasons from one line where the file holds hundreds, and it says one thing that is false. Its counts lead nowhere. It cannot answer the simplest price question at the desk: *what does a trade buyer pay for this?*

- **It asks a choice it gives no grounds for.**
  - Dealer Fit's *Act Sell* or *Sell* is offered as two bare column names on one VHF radio: $982 or $249.
  - On the 789 lines that hold both, they are never equal. Act Sell runs 0.97× to 27.83× Sell, with a median of 2.08×.
  - The workbook says exactly what Act Sell is (`MPF_GROUND_TRUTH.md` §6.8: parts sell + labour retail + (sundry + sublet) × 1.25 × GST). The screen does not.
  - The salesperson sent from a quote makes this decision for 1,777 lines, reading one Tube Cover ($2,834 or $2,790).
- **It says a false thing about factory packages.**
  - It labels their *RRP + Freight Inc GST* "Worked from what the motor costs Northside, plus 19% and GST". That is the Yamaha library's cell (`worked.ts`, matched by column name).
  - On the factory packages it equals *Sell Price* on every priced line: 39 of 39 Haines and 34 of 34 priced Jeanneau.
  - Choosing it puts every factory-package quote behind a refusal for a reason that is not true. The well then reads *"$69,716 against Sell Price $69,716 · 100% of Sell Price, $0 under"* (`22-all-answered-full-1440x900`).
- **It reads one line where the job needs the list.** Each list is told through one specimen, and the file carries the spread:
  - Warranty is 55–67% of Cash on Highfield and 93–110% on Stacer, and above Cash on 8 Stacer boats.
  - Yamaha's RRP + Freight is 1.012–1.258× Sell.

  None of this is on the page.
- **Its counts are dead ends, and nothing can be looked up.** *146 not priced*, *9 not priced*, *8 with no Trade* and *44 hold no Act Sell* open nothing. No line can be found by name or code to read its prices for every buyer.

§3 lists the mammoth work.

---

## 1. The jobs, and each one done

**Sources.** I drew the jobs from:
- the screen's rows in `docs/SCREENS.md`: lines 93, 104, 116, 118, 123 and 139;
- `src/screens/levels/{Levels.tsx,read.ts,levels.css}`, `src/domain/catalogue/priceCommands.ts` and `src/domain/pricing/{worked,unchosen}.ts`;
- `docs/DECISIONS.md`:
  - 2026-10-22: the ladder built;
  - 2026-10-22: two flights, an Undo that stays;
  - 2026-10-28: rebuilt as F "Yours to decide";
  - 2026-09-25: the sub-dealer rungs kept as Northside's own levels;
- `docs/LATER.md`, which defers nothing of this screen's;
- `docs/research/refs/levels/notes.md`;
- what an admin who keeps the price file, and a salesperson with a customer at the desk, truly need.

**Measured on this file today:**
- 4 questions: Dealer Fit 1,777 · Rigging Kits 650 · Yamaha Outboards 209 · Factory packages 89.
- 1 kept price: Warranty, on the SP560 (HYP), "$32,166 against Cash $48,350 · 66.5% of Cash, $16,184 under".
- 10 settled tiles, read in `14-settled-tiles` from the page:
  - Stacer 91
  - Stabicraft 37
  - Surtees 19
  - Jeanneau 27, 8 with no Trade
  - Haines 9, sold as a factory package
  - Highfield 67, Trade 95%
  - Formosa 39, 9 not priced
  - Every trailer 434, 3 not priced
  - ePropulsion 32
  - Parts 2,937, 146 not priced

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| A1 | Admin | See at a glance what is left for Northside to decide | `01-arrive-*`: "Yours to choose 4", ordered by lines priced, one real line's figures on each | **Done.** Clear, honest, the screen's best moment. |
| A2 | Admin | Choose the figure a list with no price is priced at (Dealer Fit, Rigging Kits, Factory packages) | `05-dealerfit-open`. Then `06-dealerfit-pick` reads "1,733 of 1,777 … are priced at their Act Sell … The other 44 hold no Act Sell". Then `07-dealerfit-written`, Undo in `08-dealerfit-undone`, and every press of `22a`/`22` | **Done mechanically, but blind.** The tiles carry only a column's name, one line's figure and a count. Nothing says what *Act Sell*, *Sell*, *Kit Sell Price* or *Install Retail Sell* is, or how far they differ across the list. See §3 L1. |
| A3 | Admin | Decide which Yamaha figure a customer's quote shows | `03-yamaha-open`: F90XB, $14,531 Sell Price or $17,643 RRP + Freight Inc GST, neither ringed. In `04-yamaha-rrp` the census names the cost basis and the refusal it will cause | **Done**, and well said. It shows one motor where the ratio runs 1.012–1.258× across 209. |
| A4 | Admin | Decide whether Warranty may reach a customer | `09a-warranty-off`, then `09b-warranty-on` (the well rises to a plate and the step reads "Warranty may reach a customer now…"), then Undo | **Done.** It never says what a Warranty quote is for, or that Warranty is above Cash on 8 Stacer boats. |
| A5 | Admin | Set Trade as a share of Cash for a maker | `10-stacer-open`. `11a` reads *"“abc” is not a per cent."*, and `11b` at 150 reads *"Above 100% of Cash, a trade buyer would pay more than a customer off the street."*; 0 is refused too. `12-stacer-95` reads "91 written · 91 equal Cash today · 0 already · 0 with no Cash · 309 Skimma $1,730 → $1,643". `13-stacer-written` shows the tile folded with "Trade is 95% of Cash" and Undo | **Done.** Refusals are sentences where they are refused. The specimen still prints Trade $1,730 while the census says $1,643, and only one line's change is shown of 91. |
| A6 | Admin | Read every list's prices as the file sets them, per buyer | `15`–`20b`: each settled tile opens one specimen line plus one to three sentences | **Partly.** One line per list. No range, no spread, no per-rung view. Haines' panel is one sentence (`18-haines-open`). |
| A7 | Admin | Go to the lines behind a count (not priced, no Trade, no Act Sell) and fix them | Every count read in `01`, `16`, `17`, `19` and `20b` | **Not possible.** No count is a door. The sheet already answers `?only=` "a price missing" (DECISIONS 2026-11-03). |
| A8 | Admin | Change a choice made earlier | After `22-all-answered`, Yamaha is a settled tile ("Trade Price is 96–100% of Sell Price"), and per `Chooser` its panel reopens with "You chose … Press another to change it." | **Done** (code read; tile seen in `22-all-answered-full`). |
| A9 | Admin | Answer every question and see the page settle | `22-all-answered-*`: "Every question is answered … Nothing is left for you to choose." The well now holds 2 kept prices and Settled reads **14** | **Done, with one falsehood.** "Settled by your price list 14" now counts four lists Northside settled, not the file. The factory package's kept bar is the false cost claim. |
| A10 | Admin | Give the sub-dealer rungs, the trade and the fitted price of a rigging kit | Nothing on the screen | **Not possible.** The file holds Trade Price (628), Sub Dealer Price (628), Install Retail Sell (621), Install Trade Sell (621) and Install Sub Dealer Sell (621) on Rigging Kits. The screen offers one Cash choice and makes the installed price its rival. |
| S1 | Sales | A quote refused because a price is not chosen: choose it, go back, price the line | `30-quote-refused`, then `31-from-quote-landed` ("On your quote · Tube Covers to suit PVC Boat · 3.4 Mtr", *Back to quote 20261104-01*). Then `32-from-quote-picked`, `33-from-quote-chosen` (step with Undo and *Back to the quote*) and `34-back-on-quote` ("…went on before Dealer Fit Packages had a price. Price it above.") | **Done at both sizes.** But a salesperson with a customer waiting makes a decision for 1,777 lines on one Tube Cover ($2,834 or $2,790), and Act Sell and Sell differ by 2.08× at the median elsewhere on the list. |
| S2 | Sales | "What does a trade buyer pay for this?" for one named boat, motor or kit | No find on the page | **Not possible here.** The only route is the sheet, and it shows no buyer ladder. |
| — | Anyone | No price file on this computer | `00-nofile-*`: "The price list is not on this computer yet, and every price here is read from it." with *Load the Master Price File* | **Done.** A true empty state with its door. |
| — | Keyboard | Reach every act | `21-focus-*`: the 12th Tab lands on the Warranty switch, ringed | **Done.** |

---

## 2. The perfect bar, at each size

The same in all 176 frames: sideways scroll 0, off-edge 0, cut 0, controls under 24 px 0, page errors 0. Text under 12 px is 11 px in every open panel: `READ ON ONE … `, and the figure labels `CASH` and `TRADE` (`lv-specimen__eyebrow`, `lv-figures__label`). Scrolled content passing under the floating pill is expected and is not counted. Where the screen's own scroll puts something under the pill, that is listed.

### At rest (`01-arrive`, `02-scrolled`, `21-focus`)

| Size | Verdict | Why (element, measured) |
|---|---|---|
| 1920 × 1080 | **NOT PERFECT** | (a) Dealer Fit, Rigging Kits and Factory packages carry a ~22 px generic icon in the mark column that Yamaha's wordmark fills. The question text starts ~125 px to its right, so three of four rows open on a white hole (x 380 → 516). (b) Dealer Fit's example breaks its second figure onto its own line ("or $249 Sell") while the other three hold one line. (c) The Warranty well's line name breaks inside a colourway ("White / White / ⏎ White/Blue"), and the last word of its sentence is orphaned ("$16,184 ⏎ under"). (d) The settled rows are ragged: Jeanneau's tile is 21 px taller than its row (second fact "8 with no Trade"), and so are Formosa's, Every trailer's and Parts'. (e) The marks do not read as one set. Haines' mark is a grey script ~70 × 14 px and illegible; Jeanneau's wordmark is ~50 px wide under its star; Stabicraft, Every trailer and Parts are an icon and a word; Highfield carries its tagline "dare to explore". |
| 1440 × 900 | **NOT PERFECT** | Same (a)–(e) (`01-arrive-full-1440x900`). The whole page fits 1,141 px. The second settled row is below the fold. |
| 1280 × 800 | **NOT PERFECT** | Same (a)–(e). |
| 834 × 1112 | **NOT PERFECT** | Same (a), (b), (d) and (e). The deck stacks under the title. |
| 844 × 390 | **NOT PERFECT** | One question visible at rest; the title, deck and group head take 230 of 390 px. Same (a): Dealer Fit's icon sits at x 62 and its name at x 180. |
| 390 × 844 | **NOT PERFECT** | (a) The marks are dropped from the questions, which is right for a phone. But the example figures wrap so that "or $900 Kit Sell Price and 1 more" and "or $17,643 RRP + Freight Inc GST" start their own lines with "or". (b) The settled tiles' facts wrap to two lines ("One price for every ⏎ buyer") in all 10 tiles, at a 2-up grid of ~166 px. |

### A question opened (`03-yamaha-open`, `04-yamaha-rrp`, `05`/`06`, `22a`, `31`/`32`)

| Size | Verdict | Why |
|---|---|---|
| 1920 / 1440 / 1280 | **NOT PERFECT** | (a) Two edge colours on one open thing: the row head takes a blue left rule and the panel under it an olive rule (`03-yamaha-open-1440x900`). (b) The maker's mark is drawn twice within ~100 px: on the row and again above "READ ON ONE YAMAHA MOTOR". (c) The two choice tiles say the same count, "Prices 209 of 209", which tells the dealer nothing about choosing. (d) At 1280 the page's own bring-into-sight scroll (y 60) puts the title and deck under the pill. At 1440 and 1920 that happens only after the census arrives. |
| 834 × 1112 | **NOT PERFECT** | The census scroll (y 50) puts the eyebrow and the title under the pill (`04`, `05`, `06`). Otherwise it reads whole. |
| 844 × 390 | **NOT PERFECT** | The decision never fits one view. The opened row's own head is carried under the pill and only its figure line peeks (`03-yamaha-open-844x390`). The two tiles are cut at the fold. The act is a further screen down (y 772 in `04`). |
| 390 × 844 | **NOT PERFECT** | The panel leads with a ~200 px photograph. After the press, the page sits at y 705 and the dealer must scroll past the picture to reach the figures. The act and its sentence fill the screen in `04-yamaha-rrp-390x844`. The panel's olive rule runs down the left the whole way. |

### A settled tile opened (`10`, `15`–`20b`)

| Size | Verdict | Why |
|---|---|---|
| all | **NOT PERFECT** | (a) The 11 px labels above. (b) Jeanneau's share field is *already* at 100 and offers **"Write 8 Trade figures"** at rest (`19-jeanneau-open`). The census reads "8 written · 19 equal Cash today · 19 already" (the 19 counted twice), with the example "DB 37 OB $956,970 → $956,970". The act writes 8 cells that change no quote, since a missing Trade already falls to Cash (`priceAtLevel`). (c) Haines' panel is one sentence on a whole plate (`18-haines-open`). (d) While the dealer works in Stacer, the Warranty well's earlier "Undone… Put it back" line stays standing above (`12-stacer-95-1440x900`). |
| 390 × 844 | **NOT PERFECT** | The opened tile's panel is ~1,000 px tall with the photo first. In `12-stacer-95-390x844` the act is at the foot of the third screen of the panel, and the tile pressed has scrolled away. |

### Refusals, steps and the end

| State | Verdict | Why |
|---|---|---|
| `11a`, `11b` refusals | **PERFECT** at every size | A sentence with its reason, under the field, where it is refused. |
| `07`, `13`, `33` step lines | **PERFECT** in place | The step line, its Undo, then "Undone. No longer so: …" with *Put it back*. One wording slip: "Every **Dealer Fit Packages** line …" uses the file's table name where the row says "Dealer Fit". |
| `22-all-answered` | **NOT PERFECT** | "Settled by your price list **14**" now includes four lists Northside chose. The factory-package well shows a **motor** photograph (the F90XB) for "Haines SIG 525F · Yamaha F90XB package", and reads "$0 under". |
| `31-from-quote-landed` | **NOT PERFECT** (minor) | The row names "Tube Covers … · 3.4 **Mtr**", while the build's own step says "3.4 **m**" (`results-quote.json`: "Tube Covers to suit PVC Boat · 3.4 m put on the quote"). One line has two spellings on two screens. |
| `00-nofile` | **PERFECT** at every size | |

---

## 3. The level it has to be

The best tools for this job (Salesforce CPQ price books, Shopify B2B price lists, PriceFx, Figma's variable modes, a well-kept Excel price matrix) give the person who sets price four things this screen does not:
- the meaning of each figure;
- the spread of a rule across everything it touches;
- a way from every count to the lines behind it;
- one lookup that answers "what does this buyer pay for that".

Each item below is carried by the file or the stores; none needs an invented figure.

| # | What is missing | Why Northside needs it | Does the file carry it? | Severity |
|---|---|---|---|---|
| **L1** | **Every candidate figure says what it is.** For example, "Act Sell: parts, labour at retail and sundries, installed, with GST" and "Sell: the parts' sell alone". Each comes with its cell named, as `worked.ts` already does for two columns. **And the spread between candidates across the whole list:** "Act Sell is 0.97–27.83× Sell on 789 lines; median 2.08×". | Today the choice is two column names and one line. On Dealer Fit it moves a median line's price by 2×, for 1,777 lines, sometimes made by a salesperson mid-quote (S1). Nobody can choose honestly from this. | Yes. `MPF_GROUND_TRUTH.md` §6.8 (Act Sell), the Rigging Kits columns, and the ratios are counts of the file. | **blocker** |
| **L2** | **The factory packages' RRP + Freight Inc GST is not "worked from motor cost".** `workedFromCost` matches the column by name, so the Motor Library's cell (Motor Library!BB) is claimed on `mot_pkg_haines` and `mot_pkg_jeanneau`, where the column equals Sell Price on all 73 priced lines. Choosing it refuses every factory-package quote for a reason that is false. The question itself is moot (both are one figure on every line) and should say so: "Both name the same figure on all 73; either prices them alike". | A refusal must be a true sentence (CLAUDE.md). This one would stop the sale of every Haines and Jeanneau package. | Yes: it is measured (39/39 and 34/34 equal). | **blocker** |
| **L3** | **Each rung as a range over the list, not one specimen.** For example: Warranty 55–67% of Cash on Highfield and 93–110% on Stacer, **above Cash on 8 Stacer boats**, named; Trade 96–100% on Yamaha; RRP + Freight 101–126% of Sell. This is board B's scale or the notes' Payscale range, drawn as the settled tile's open state. | A rule is "measured from the file with its numerator and denominator" (CLAUDE.md). One line cannot show a rule, and a Warranty above Cash is exactly what an owner must see before letting it reach a customer. | Yes: `notes.md` §0 measured it all. | **major** |
| **L4** | **Look up any line and read its price for every buyer.** Find by name or code (F90XB, 309 Skimma, a kit code) → Cash · Trade · Warranty (Northside only) · fitted, with where each comes from ("Trade · from Cash"). | S2: the salesperson's commonest price question at the desk has no answer anywhere in the app's Data rooms. | Yes. | **major** |
| **L5** | **Every count is a door.** "146 not priced", "9 not priced", "3 not priced", "8 with no Trade", "44 hold no Act Sell" and "22 not priced" each open `/data/$table?only=…` (the sheet's 2026-11-03 filter) or Review's case for that list. | The admin's next act after reading a count is fixing those lines. Today he must find them himself. | Yes; the filter is built. | **major** |
| **L6** | **Rigging Kits priced as the file prices them: supply and fitted, cash and trade.** Kit Sell Price/Trade Price (628), Install Retail Sell/Install Trade Sell (621), as Parts already has "Sell, or Sell inc Install fitted". Today the installed price is offered as a *rival* to the supply price, and after the choice a trade buyer pays Cash although the file holds his figure. | Kits are sold installed at the desk. Choosing one column throws away the other and the trade figure. | Yes (counts above). | **major** |
| **L7** | **The sub-dealer rungs.** DECISIONS 2026-09-25 keeps them as Northside's own levels, and Rigging Kits carry Sub Dealer Price (628) and Install Sub Dealer Sell (621). The screen never mentions them. The owner's "everything in data tab … not at the level it has to be" overrules leaving a kept decision invisible. | A sub-dealer quote today silently falls to Cash. | Partly. Only Rigging Kits carry the figures; the boat lists' Sub Dealer columns are not in the pack (`notes.md` §0). Show only what is carried, and say the rest is not. | **major** |
| **L8** | **What a choice does to quotes already standing.** "3 drafts carry Dealer Fit lines; 1 is waiting for this price", with a door to each. Today it says only "from the next quote". | Northside decides with live deals on the desk. The round trip proves the app already knows which line was waiting. | Yes (quotes store). | **major** |
| **L9** | **The opened decision fits one view, at every size.** The question, its figures, the census and the act stand in one screen. The photograph is subordinate on a phone (after the figures, or a thumbnail beside the name), not 200 px above them. One edge colour per open thing. The mark is not drawn twice. 12 px floor on the labels. | The owner's bar: "if I take a screenshot, does it look PERFECT". At 844 × 390 and 390 × 844 no screenshot of a decision holds the decision. | — | **major** |
| **L10** | **One set of marks.** Every settled tile and question gets either a legible mark at one optical size or one consistent icon-and-word treatment: no 70 × 14 px grey script (Haines), no taglines (Highfield), no blank mark column (three of the four questions). Settled rows of one height, the second fact reserved. | It is the first thing a stakeholder sees on the page. | Marks are held in the ledger. | **minor** |
| **L11** | **The share previews on the specimen and counts its effect.** Typing 95 turns the specimen's Trade to $1,643 in place. The census adds the dollar movement across the list ("91 lines, $X less in total, $87 on the 309 Skimma"). | It is the before-and-after the best price-list editors show. | Yes. | **minor** |
| **L12** | **An act that changes nothing is not offered.** Jeanneau's "Write 8 Trade figures" at 100% writes figures equal to what a trade quote already pays. The census's "19 equal Cash today · 19 already" should be one count. | Simple wins, and an amber act should mean a change. | — | **minor** |
| **L13** | **Headings that stay true after answers.** "Settled by your price list" becomes "Settled" (or splits "by your price list" from "by you"). A package's kept well shows the package's own picture or none, never the motor's (CLAUDE.md: a picture belongs only to the exact model it depicts). One name per line across screens ("3.4 m", not "3.4 Mtr"), and "Dealer Fit", not "Dealer Fit Packages", in the step. | Honesty rules. | — | **minor** (the picture: **major** by the honesty rule) |
| **L14** | **Who chose, and when.** Each answered question says "Chosen by Asaf, 4 Nov" with its step in History. | A price decision should be traceable when the next price file arrives (Shelf). | Events exist; a durable record is Milestone 6's sync. Say only what this browser holds. | **minor** |

`docs/LATER.md` defers nothing that is this screen's own, so no item above overrules it. L7 overrules only an omission, not a deferral: the sub-dealer rungs were *kept* on 2026-09-25 and then never drawn.

A question for the owner, not counted: the best price tools show the margin at each rung. This screen is Northside's alone, but CLAUDE.md keeps cost off customer surfaces and the app's guard keeps cost columns off every screen. Whether Prices may show "Trade at 95% leaves $X over landed" is the owner's call, and nothing here assumes it.

---

## 4. The verdict

**DEEPEN.** Three groups sorted by who must act is the right composition for "what only Northside can decide about price":
- the questions;
- the kept price with its switch;
- the settled lists.

The writes are counted, real and undoable, and the salesperson's loop closes. A redraw would throw that away.

What is missing is substance and finish. The mammoth work, in order:
1. **Give every figure its meaning and its spread (L1)**, and **stop the false cost claim on factory packages (L2)**. These are the two blockers. Until they are fixed, the screen asks Northside to decide blind and can refuse every package quote for an untrue reason.
2. **Make each list a range, not a specimen (L3).** Make **every count a door (L5)**, and put **one lookup of any line's prices for every buyer (L4)** on this page.
3. **Price Rigging Kits as the file does (L6)**, **show the kept sub-dealer rungs where the file carries them (L7)**, and **say what a choice does to standing quotes (L8)**.
4. **Make the opened decision one view at every size (L9)**, with one set of marks and even rows (L10), the share previewed (L11), no act that changes nothing (L12), and headings, pictures and names that stay true (L13).
5. **Record who chose what (L14).**
