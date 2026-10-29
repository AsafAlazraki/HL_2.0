# Fitment — the sweep

**Two passes.** The first, 2026-10-22, captured 40 frames into `live/` (1440 × 900) and `hand/` (390 × 844). The second, 2026-10-28 (this file), captured 12 into `live2/` for the brief's boat-maker references, and **opened 30**: the 10 usable `live2/` frames and 20 of the first pass's, each re-read against its citation. A frame not opened in this pass is not cited (`sources-index.md`). Two corrections: RockAuto's condition at 390 wraps to four lines, not five; PartSouq's accordions are not counted, as the frame shows about twenty.

**Fitment is already built**, 2026-10-22, as board C, "The rig", with B's envelope grafted in (`docs/SCREENS.md`, `docs/directions/fitment-boards/`). This pass re-checks what it stands on, records which first-pass findings the engine has since answered, and adds what the makers' own sites teach.

## 0. What the engine gives, measured on this tree

Highfield SP660 (PVC) W-W-WB, asserted by `src/domain/fitment/boat.test.ts`:
- **Motors:** 209 Yamahas live. 7 made for it (F175XC starred), 30 inside its `150 HP`–`200 HP` and not made for it, 74 under, 51 over, 47 twin and triple rigs not placed.
- **Trailers:** one universe, 2 made + 10 more built for Highfield + 131 built for another boat + 291 whose series names no maker = 434 on sale; 10 no longer sold, said beside it.
- **With a rule written** (`:305`, a tiller boat, *"a tiller boat must take a tiller motor"*): `live 209, made 2, refused 1`. Refused is struck and counted apart, never "made for this boat".

**What the first pass named missing now exists, each with its test:**
- `envelope.ts` produces `outside-envelope`. It reads `Min HP` / `Max HP` / `HP Rating` by column name; `"2 x 225"` is two motors of 225, and a rig the boat names no envelope for is `unstated`, never `outside` — FITMENT_RULES.md F1's split (line 669, re-read, holds).
- `say.ts` is the one place a verdict becomes words (`NOT_MADE_FOR_IT`, `RULE_REFUSES`, `NAMES_NO_MAKER`, `TRAILER_NOT_RATED`, `ONE_TRAILER`, a case per verdict kind). No component writes a reason.
- `oneTrailer.ts` (`whatComesAcross`) decides the trailers across every trailer list at once: the star wins, else a lone one, else none and the section counts what waits.

**The brief is stale in three places.**
1. `freeze.ts:545-547` is now a comment over `whatComesAcross`; a new SP660 quote starts with the REDCO alone, the build offers the GFAB in its place with *"One trailer to a boat, because a boat sits on one trailer."*, and `golden.test.ts` is untouched. The first pass's diagnosis stands as history: the GFAB joins star 0 of 109; the second trailer came from the lone-unstarred rule running per list.
2. There are no "ten named curation rules": `curation/` holds one reading (`readCuration`) and `searchReach`. The named set is `offer.ts`'s **eleven `Verdict` kinds** folding into **five `Standing`s** — offered · flagged · unchecked · outside · held.
3. No boat faces 2,519 candidates; that is `join_hf_yam`'s size. The widest list one boat meets is 434 trailers, excluded through five channels. **Hard question 1:** counted groups, each reason said once — not 2,400 sentences.

**Citations re-checked.** `explaining-a-refusal.md:141`, Steam Deck's *Unknown*, is our `unchecked`; `:172`, Shopify's `"Red - Unavailable"`, is the cop-out; its Delta paragraph — *"Same greyed seat, two different reasons, both stated"* — is hard question 2. F8 (825) and F9 (848, "a floor that warns … REJECT as a selector") still describe `trailerFitment.ts`; F9 is why ATM is a pin, never a filter.

## 1. What is genuinely best, and why

**The census before the list.** `live/doesitarm.png` opens with one sentence of arithmetic — *"3688 listed, 57.6% Native, 7% Rosetta, 33.9% need info, 1.5% unsupported."* — over a proportion bar, with status chips under the search, and every row a verdict sentence (*"Yes, Native Apple Silicon Support reported as of v2.6.12"*). "Need info" is the honest third grade: our `unchecked`, F8's 291. `live/areweanticheatyet.png` counts five statuses round a donut of `1167`, each with glyph *and* word, and a **Notes** column carries each reason.

**The condition printed on the row.** `live/rockauto-parts.png` names the one vehicle in a breadcrumb (`TOYOTA > 2018 > CAMRY > 2.5L L4 > Brake & Wheel Hub`) and prints each part's fit under its name in the body face (*"Rear; w/o Electronic Parking Brake…"*). What does not fit is absent; that silence is what we beat.

**The limit as a place, the value as a pin.** `live/pagespeed-audits.png` pins `FCP 0.4 s` on a green–amber–red band. `live/willtheyfit.png` overlays two setups in two inks and says the difference: *"11.8mm closer to the suspension strut … 51.8mm more than before."* **Hard question 5:** 150–200 hp is a lit band with each motor a mark; an ATM is a pin against the boat's weight with a sentence saying the clearance.

**The maker states the envelope as a plain fact.** `live2/bw-21mtk-scrolled.png`, Boston Whaler's chooser: under each render a three-cell strip, `Length Overall 13′ 1″ · Maximum Horsepower 40 HP · Persons Capacity 4`, label over value. The ceiling is a peer of the length, not a warning — and no minimum and no motor stand against it. Our file has both bounds and the motors; the screen does what the maker cannot.

**One boat's options as columns.** `live2/yachtbuyer-280-engines-table.png` heads five Mercury options `Standard · Option #2 … Option #5`; `live2/yachtbuyer-280-engines-lower.png` runs the facts as rows (`Output (bhp) 400bhp · 200bhp …`) with a dash where nothing is known. The standard is a column like the rest, marked by its head word and a grey ground — the starred motor's honest weight.

## 2. Patterns worth taking, named

- **The census line** — total, then each standing counted, one sentence over a bar; wraps whole at 390 (`live/doesitarm.png`, `hand/doesitarm-390.png`).
- **Status chips are the toolbar** — the chips are the standings, pressing one narrows to it (`live/doesitarm.png`). **Hard question 3**, without Linear's or Figma's authored filters (the quotes register's and Prices' primaries).
- **The pressed half, counted** — `Filtered | All`, the pressed half is the state (`live/caniuse-filtered.png` against `live/caniuse-has.png`). Caniuse folds what it drops into an uncounted `…`; `toggleWords` counts both halves.
- **The condition under the name** — one line of fact, never a tooltip (`live/rockauto-parts.png`).
- **The attributed because** — *"This package has been deprecated"* over *"Author message:"*, the words verbatim in a box (`live/npm-deprecated.png`). A `blocked` verdict quotes the rule's clause, attributed and linked.
- **Numbered notes and the printed sum** — a superscript on the cell, the sentence once below, and `78.05% + 4.88% = 82.93%` under the bar (`live/caniemail-flex.png`). Seven marques need seven notes; one universe prints as `2 + 10 + 131 + 291 = 434`.
- **The verdict word on the value** — `ApoB · High · 120 mg/dL`, colour following the word (`live/insidetracker-biomarkers.png`).
- **The envelope as a spec cell** and **Standard first, as a column** (`live2/bw-21mtk-scrolled.png`, `live2/yachtbuyer-280-engines-table.png`).
- **To the price list and back** — no frame shows it; owned as an invention. `/data/$table` opens on one row via `at` and writes its position with `replace`, so one Back returns to `/fitment` (`routes/data.$table.tsx`). Each verdict names its deciding cell: the pairing → the join row; `built-for-another` → the series banner; `outside-envelope` → the boat's `Max HP`. **Hard question 4:** one act on a struck row, and on return a row whose standing changed says so once — the screen's only licensed motion.

## 3. Type and motion, as observed

The best frames are typographic. `doesitarm`: a light grotesk title near 64px over an 18px census, each figure in its standing's colour. `areweanticheatyet`: system sans at 15–16px, statuses by glyph and word, never colour alone. RockAuto: about 13px Arial, the condition the same size as the name. Boston Whaler: a serif section head (`Super Sport`), light tracked sans for model names, a bold label over a regular value so the ceiling reads as a measurement (`live2/bw-21mtk-scrolled.png`). YachtBuyer sets each figure bold in its row. Nobody sets a limit in mono beyond the figure, the split `curationChipParts` already makes. No frame shows motion worth taking; the modals in §4 are motion against the person.

## 4. What to avoid

- **Struck with no reason.** Allbirds strikes sizes `9 … 14` diagonally with no word, behind a region modal (`live/allbirds-sizes.png`) — `"Red - Unavailable"` drawn. **Hard question 2:** a struck row reads "ruled out, here is why" when its reason is said once on its group head (Delta's two unavailabilities), its name stays legible in quieter ink, and its one act is the way to fix it.
- **A census word that is not the chip word.** `live/doesitarm.png` counts *"need info"*; its chip says *Unreported*. One standing, one word.
- **An attributed because that only points elsewhere.** npm's message is *"request has been deprecated, see https://github.com/…/issues/3142"* (`live/npm-deprecated.png`). A rule with no clause is named by `say.ts`, never a bare link.
- **The reason cut first in a hand.** `hand/areweanticheatyet-390.png` keeps Name and Status and loses Notes. At 390 the reason goes under the name.
- **The desktop, squeezed.** `hand/rockauto-parts-390.png` wraps *"Rear; L Model or LE Model or SE Model"* to four lines beside a thumbnail.
- **Hidden with no count.** Caniuse's `…` (`live/caniuse-filtered.png`); RockAuto's absent parts.
- **Grouped from the wrong end.** *"You can use Apple Pencil Pro only with these iPad models"* (`live/apple-pencil-compat.png`, a text page) groups by pencil. Fitment answers from the boat outward.
- **The maker's fitment is a form.** Mercury's repower is *"Request a Local Dealer Quote"* — name, email, postcode (`live2/mercury-repower-au.png`): the maker hands "what fits my boat" to the dealer, which is this screen's reason to exist. Yamaha's selector is a wizard, `Boat › Outboards › Platform › Results`, asking type and length first (`live2/yamaha-rigging-selector-form.png`). We already know the boat.
- **Something over the answer.** Email modals over Boston Whaler (`live2/bw-21mtk.png`), Yamaha (`live2/yamaha-rigging-selector-form.png`, `live2/yamaha-midrange.png`) and InsideTracker; two ads over wheel-size.com's guide (`live/wheelsize-hilux.png`).
- **Landing pages posing as tools.** `live/newegg-builder.png` (three pre-builts and an AI prompt); `live/partsouq-catalog.png` (model accordions before any fitment).
- **A head that is a list.** YachtBuyer's title is five engine names joined by "vs" (`live2/yachtbuyer-280-engines-table.png`). The boat is the head.

## 5. Four directions

Each a different composition and a different order and grouping; none list-left, detail-right. A–C are the judged boards (C built, B grafted); D is new from this pass.

**A — "The census." Grouped by standing, one 760px column.** The boat and its limits as spec cells; per slot a census sentence and bar; bands offered → flagged → unchecked → outside → held, offered open, the rest one counted line each, *outside* sub-headed by reason (`Built for Stacer · 34`), the reason said once. **Exclusive:** `live/doesitarm.png`, `live/areweanticheatyet.png`. **Only A** says how much of the price list this boat takes before a row is read. **Reflow:** 390 census and chips wrap whole, reason under the name; 834 column at 720; 1920 stays 760, census as head band. **Northside sets:** which bands open; whether the 291 read *fits* or *needs a look*.

**B — "The envelope." Grouped by measured value, no list at rest.** A horsepower axis with 150–200 lit, every single motor a mark (made solid, inside ringed, the rest faint), the 47 rigs in a counted tray; ATM along x against the boat's weight; a pressed mark opens its row with its verdict and *Open in the price list*. **Exclusive:** `live/pagespeed-audits.png`, `live/willtheyfit.png`. **Only B** makes 150–200 hp a place to point at beside the buyer. **Reflow:** 390 axes vertical, marks become rows; 834 plots stacked; 1920 side by side. **Northside sets:** per slot, warn or refuse (F1: slots 1–2 hard).

**C — "The rig" (built). Grouped by where it goes on the boat.** The boat's render on one plate with numbered callouts — 1 the motor at the transom with B's axis, 2 the trailer under the hull, 3 and 4 the boat page's other lists — each with *"n of N made for this boat"* and Show all, which groups the rest by reason with a struck example and its deciding line. **Exclusive:** `live/rockauto-parts.png`, `live/npm-deprecated.png`. **Only C** puts each answer where the thing bolts on. **Reflow:** 390 callouts as full-width sections under the render; 834 two columns round it; 1920 the ring; no held render, no ring, two numbered columns. **Northside sets:** which lists are called out, and their order.

**D — "The options, compared." Grouped by option, a matrix.** One column per thing made for this boat in one slot, the starred first headed *Standard* on its tint (the SP660's 7 Yamahas; its 2 trailers). Rows are facts in the dealer's units — hp, rig, the envelope as *inside* or *2 × unstated*, ATM against the boat's weight, price at the chosen level — with a dash where the file has nothing. Under it the not-made as a printed sum with numbered notes, `+ 10 built for Highfield¹ + 131 for another boat² + 291 naming no maker³ = 434`, each note opening its group. **Exclusive:** `live2/yachtbuyer-280-engines-table.png`, `live/caniemail-flex.png` — claimed by no built row and by none of this round's rules, review or levels notes (checked). **Only D** answers the salesperson's next question, *which of the ones that fit*, side by side, with the struck still accounted for beneath. **Risk:** the stock `apple-compare` shape; D compares one boat's fitted options, never models. **Reflow:** 390 one column at a time, swiped, labels pinned left; 834 three; 1920 all seven. **Northside sets:** which fact rows show, and the price level.

**Owed by all four:** a selected item is never hidden; `searchReach` reaches the struck; every sentence comes from `say.ts`; one trailer per quote, said once where a second is offered.

## 6. Imagery

**Fitment is a Cockpit screen and needs no photography.** Its one possible picture is the boat's own render where the image ledger holds one; a boat without one gets no ring and no stand-in. YachtBuyer shows what a photograph per option costs — five near-identical black cowls about 400px tall pushing every fact below the fold (`live2/yachtbuyer-280-engines-table.png`) — so D stays typographic. Marks fail where this screen looks: REDCO (the SP660's starred trailer) and NSM Custom have none held, Mercury is white-ink only, so maker heads are set in type. The Australian Builders Plate is the envelope's legal source, but neither frame shows one legibly: a thumbnail under a finger (`live/abp-sa-capacity.png`) and four bullets (`live/abp-fishandboat.png`). The spec cell and B's axis do its job.
