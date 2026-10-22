# Fitment — the sweep

Driven 2026-10-22 with `tools/research/capture.ts` into `live/` and `hand/` (390 × 844): **40 frames captured, 29 of them opened**, plus 3 stock frames opened. The 11 never opened are not cited (`sources-index.md`). The three stock frames are dead:
- `hl2/configurator/deep/pcpartpicker-cpu-filter.png` is a Cloudflare block page;
- both Mercury frames are 404s.

PCPartPicker cannot be re-driven and already holds two built primaries, so it is cited for nothing.

## 0. What the engine and the file put on this screen — measured

One hull, `Highfield - SP660 (PVC) W-W-WB`, read through the ported engine by a scratch script; nothing written to `src/`.

| slot | live pool | the file pairs | what narrows it |
|---|---|---|---|
| motor | 209 Yamaha | **7** (1 starred, F175XC) | the join. The envelope `150 HP`–`200 HP` would leave 37, put 74 below and 51 above, and cannot place **47 twin rigs** (`2 x 225`) |
| trailer | 434 | 2: NSM Custom (starred), GFAB | F8: **12** built for Highfield (both paired ones among them) · **291** naming no brand · **131** built for another (Stacer 34, Stabicraft 26, Formosa 24, Surtees 22, Haines 16, Cap Camarat 5, Merry Fisher 4) · **10** held back (OBSOLETE) |
| dealer fit · parts · rigging | 1,576 · 2,238 · 622 | 4 · 4 · — | the join |

**1 · No hull faces 2,519 candidates.** That number is the size of the `join_hf_yam` table. The largest list one hull meets is 434 trailers, and grouped by reason it reads:

> 2 paired · 10 more built for Highfield · 291 naming no brand · 131 built for another boat (seven marques) · and 10 held back

The excluded rows do not each have a different reason; five channels give them. `src/domain/model/offer.ts` holds them as a closed union of **eleven `Verdict` kinds** that add up to **five `Standing`s**: offered · flagged · unchecked · outside · held. A board draws five standings, not 2,400 sentences.

**2 · The solver refuses nothing on the seed.** `readRig` reports `rulesInForce 0` and refuses 0 of 209 motors. All sixteen workbook rules carry `blocked`. A `blocked` struck row exists only once a dealer writes a rule: the exit criterion, which every board draws with its author.

**3 · Nothing produces `outside-envelope`.** `offer.ts` declares the verdict and nothing produces it. Highfield's `Min HP` and `Max HP` are text (`"150 HP"`), and so is every Yamaha `HP Rating`. FITMENT_RULES.md F1, re-checked against `wb:boat-max-hp-ceiling`, says Max HP must be split into total · count · per-engine first. That reader belongs in `src/domain/fitment` with a test. Until then a drawn band is true of single rigs only.

**4 · No sentence exists for a fact verdict.** Only `blocked` and `warned` carry a `because`. `built-for-another`, `under-floor`, `outside-envelope` and `held` carry figures. `offer.ts` composes "at the surface that prints it", and the brief forbids a component writing a sentence. The two reconcile through one pure `sayVerdict` in `src/domain`, with a test. It does not exist, and it is this screen's one missing engine piece.

**5 · One boat, one trailer: the brief's diagnosis is half right.** No hull carries a star in two trailer joins; the GFAB joins star **0 of 109**. The second line comes from `freeze.ts:546`, which runs **per block**:

```ts
starred.length > 0 ? starred : result.rows.length === 1 ? result.rows : []
```

A lone unstarred GFAB pairing therefore crosses beside the starred REDCO. Counted over the joins with OBSOLETE held back, **87 hulls** freeze two trailers: Highfield 51, Stabicraft 27, Surtees 9.

The decision: one pure function over all of a quote's trailer blocks, tested:
- the star wins;
- with no star, a single candidate across all trailer blocks crosses;
- otherwise nothing crosses, and the section says how many are waiting.

Where the configurator offers a second, a rule sentence with its own because: *"One trailer to a boat, because a boat sits on one trailer."* This sweep writes only under `refs/fitment/`, so it is recommended, not made; `golden.test.ts` untouched.

**Citations, re-checked:**
- F8's "Highfield 12 of 434" reproduces (the table above).
- F9's four bands with no weight column surface as `floorNotEvaluable`, which is the `unchecked` standing. That is the Steam Deck *Unknown* grade `explaining-a-refusal.md` argues for.
- `curation.ts` prints *"12 of 434 trailers · the series banner names this brand · holds on 581 of 581 pairings"*.
- `searchReach` searches the pool, not the offer, so a struck row can always be typed and found.
- The brief's "ten named curation rules" are not in `curation/`, which holds four properties; the nearest named set is `offer.ts`'s eleven verdicts.

## 1. What is genuinely best, and why

**The census before the list.** `live/doesitarm.png` opens with one sentence of arithmetic, *"3688 listed, 57.6% Native, 7% Rosetta, 33.9% need info, 1.5% unsupported."*, over a proportion bar, with five status chips under the search. Every row is a **verdict sentence**: *"Yes, Native Apple Silicon Support reported as of v2.6.12"*. "Need info" is an honest third grade carrying a third of the list. In our terms it is `unchecked`, and also F8's 291, which name no brand and are not refusals.

`live/areweanticheatyet.png` does the same with a donut around `1167` and five counted statuses (`196 Supported (17%) … 53 Denied (5%)`), each with its own glyph. Beneath it, a **Notes** column carries each reason (*"All-modes enabled with minor caveats"*). Hard question 1, answered: count by verdict, then the reason per row.

**The fit condition printed on the row.** `live/rockauto-parts.png` is the car-parts industry's answer. A breadcrumb names the one vehicle (`TOYOTA > 2018 > CAMRY > 2.5L L4 > Brake & Wheel Hub`), and each part prints its condition under its name in the body face: *"Rear; w/o Electronic Parking Brake…"*. A part that does not fit is absent; that silence is what we beat.

**The limit as a place, the value as a pin.** `live/pagespeed-audits.png` draws each metric as a green–amber–red band with the value pinned on it (`FCP 0.4 s`). `live/willtheyfit.png` overlays two outlines in two inks, then says the difference in words: *"11.8mm closer to the suspension strut … will poke out 51.8mm more."* This answers hard question 5:
- 150–200hp is a lit band on a horsepower axis, with each motor a tick;
- 1,990kg of ATM against a 740kg boat is a pin and a sentence, *clears by 1,250kg*.

**Grouped by maker, badged, numbered.** `live/caniemail-flex.png` uses two-level column heads, client over platform (`Gmail` over `iOS · Android`). Each block carries a ✓ ✗ ~ badge, a superscript `1` keys to a note below, and the estimate is a printed sum, `78.05% + 4.88% = 82.93%`. Trailers have the same two levels: maker over series banner.

## 2. Patterns worth taking, named

**The census line.** The total, then each standing with its count, in one sentence over a bar. It wraps whole at 390 (`live/doesitarm.png`, `hand/doesitarm-390.png`).

**Status chips are the toolbar.** The chips are the standings themselves, so pressing one narrows to it (`live/doesitarm.png`). Not Linear's authored filter chips (the quotes register's primary).

**The pressed half.** `Filtered | All` as a two-segment control; the pressed half is the state (`live/caniuse-filtered.png` against `live/caniuse-has.png`). Its fault is that it never counts what it hid. Our `toggleWords` names both halves with counts.

**The condition under the name.** One line of fact in the body face, never in a tooltip (`live/rockauto-parts.png`).

**The attributed because.** *"Author message:"* over the reason quoted verbatim in a box (`live/npm-deprecated.png`). A dealer's `blocked` verdict reads the same way: the rule's own clause, attributed, linked to the rule.

**Numbered notes.** A superscript on the cell and the sentence once below (`live/caniemail-flex.png`). Seven marques need seven notes, not 131 repeats.

**The value pinned on its band** (`live/pagespeed-audits.png`) and **overlay, then say the difference** (`live/willtheyfit.png`).

**The verdict word on the value.** `ApoB · High · 120 mg/dL`: the grade as a small word, the colour following the word (`live/insidetracker-biomarkers.png`, the card at left).

**To the sheet and back.** No frame shows this; it is owned as an invention, and the tree allows it. `/data/$table` takes `at` and "a link to one row of one table opens on that row". It writes its own position with `replace`, so **one Back returns to `/fitment`** (`routes/data.$table.tsx`). Every verdict names its deciding cell:
- the pairing → the join row;
- `built-for-another` → the trailer's series banner;
- `outside-envelope` → the hull's Max HP.

So each struck row carries one act, *Open in the sheet*, and `/fitment?boat=&slot=&open=` keeps the way back exact. On return the reading reruns, and a row that changed standing says so once: *"REDCO TA600T-MOB is now offered — your edit to Boat Weight kg."* That is the screen's only licensed motion.

## 3. Type and motion, as observed

The two best frames are typographic: `doesitarm` a light grotesk title near 64px over an 18px census, each figure in its standing's colour. `areweanticheatyet` sets everything in system sans at 15–16px, and its statuses differ by glyph *and* word, never colour alone.

RockAuto sets everything at about 13px Arial; the badge grids centre figures at body size and let the badge carry the verdict. Nobody sets limits in mono beyond the figure itself, which is the split `curationChipParts` already makes.

No frame shows motion; the screen needs none beyond §2’s return line.

## 4. What to avoid

- **Struck with no reason.** Allbirds' sold-out sizes `9 … 14` each carry a diagonal line and no word (`live/allbirds-sizes.png`, behind a region modal). This is the Shopify `"Red - Unavailable"` sentence that `explaining-a-refusal.md` names as the cop-out.
- **The reason column cut first in a hand.** `hand/areweanticheatyet-390.png` keeps Name and Status and cuts Notes off the edge. At 390 the reason moves *under* the name.
- **The desktop, squeezed.** `hand/rockauto-parts-390.png` wraps a fit condition to five lines beside a thumbnail.
- **Hidden with no count.** Caniuse's `…` column (`live/caniuse-filtered.png`); RockAuto's absent parts.
- **Grouped from the wrong end.** *"You can use Apple Pencil Pro only with these iPad models"* (`live/apple-pencil-compat.png`) groups by pencil, so an iPad owner reads every group; fitment answers from the boat outward (a text page, cited for the sentence only).
- **Something laid over the answer.**
  - Ads over the fitment cards (`live/wheelsize-hilux.png`, `live/wheelsize-scrolled.png`).
  - An email bar and a privacy card (`live/insidetracker-biomarkers.png`, `live/function-biomarkers.png`).
- **Landing pages pretending to be tools.** `live/newegg-builder.png` is three pre-builts and an AI prompt; `live/partsouq-catalog.png` is sixty model accordions.

## 5. Four directions

Each direction is a different composition, order and grouping. None is list-left, detail-right.

**A — "The census." Grouped by standing.** One column, about 760px.
- **Head:** the hull and its two limits as facts (`150–200 HP` · `Boat Weight kg 740`).
- **Per slot:** a census sentence and its bar.
- **Bands in standing order** (offered → flagged → unchecked → outside → held): offered open, the rest folded to one counted line.
- **Inside outside:** sub-heads by reason (`Built for Stacer · 34`). The reason is said once on the head; rows inherit it, the name in quieter ink under a single rule, the verdict in full ink.

**Exclusive:** `live/doesitarm.png` and `live/areweanticheatyet.png`.

**Only A** says how much of the catalogue this boat takes before showing a row.
- **Repeat risk:** the quotes register's state bands. Here the heads are reasons, not states; the board must say so.
- **Reflow:**
  - **390:** census and chips wrap whole, the reason under the name.
  - **834:** the column at 720.
  - **1920:** the column stays at 760; the census becomes the head band.
- **Northside sets:** which bands open, and whether F8's 291 read as *fits* or *needs a look*.

**B — "The envelope." Grouped by measured value.** No list at rest; the hull's limits are axes.
- **Motors:** a horsepower axis with the 150–200 band lit, each of the 209 motors a tick (inside full ink, outside faint), the 7 paired as dots. The 47 twin rigs sit in a counted tray, *"47 twin rigs"*, until §0.3's reader exists.
- **Trailers:** a strip plot, one lane per marque the banner names (Highfield lit, `unnamed` its own lane). ATM runs along x; the 740kg load is a rule.
- **Selection:** a tick opens its row under the plot with the verdict sentence.

**Exclusive:** `live/pagespeed-audits.png` and `live/willtheyfit.png`.

**Only B** makes 150–200hp a place to point at beside the buyer.
- **Risk:** the Review sweep may claim Lighthouse. If so, B keeps willtheyfit and takes the insidetracker verdict word.
- **Reflow:**
  - **390:** axes turn vertical, ticks become rows.
  - **834:** the two plots stacked.
  - **1920:** side by side.
- **Northside sets:** warn or refuse per slot (F1: slots 1–2 hard, later flagged), and which column is each brand's load (`loadFieldFor`).

**C — "The wall." Grouped by maker, then series.**
- **Columns:** one per trailer table, headed in two levels (`NSM Custom` over `REDCO - Highfield`, `REDCO - Sportsman`…).
- **Blocks:** each trailer stacked by ATM and badged with its standing.
- **Notes:** one numbered note per reason in a band below.
- **Toggle:** `Fits | All`, counted on both halves.
- **Motors:** the same wall, one column per HP family.

**Exclusive:** `live/caniemail-flex.png` and `live/caniuse-filtered.png`, one page family, both on this board only.

**Only C** shows which makers could fit this hull, all at once.
- **Repeat risk:** none; no built screen is a badged grid.
- **Reflow:**
  - **390:** one maker per screen, swiped.
  - **834:** four makers.
  - **1920:** all of them.
- **Northside sets:** maker order and presence.

**D — "The counter." Grouped by slot, in the order things bolt on.**
- **Head:** a breadcrumb of the boat (`Highfield › SP660 › W-W-WB`).
- **Tree:** the slots Motor · Trailer · Rigging · Dealer fit · Parts, opening in place.
- **Rows:** each branch holds only what the file pairs, each row with its condition under the name (`Starred in Boat Module` · `ATM 1,990 kg clears 740`).
- **Branch foot:** one curation line, *"12 of 434 trailers · the series banner names this brand · holds on 581 of 581 · Show all 434"*.
- **Struck rows:** they appear after Show all. Each quotes its verdict in the npm form (*"Northside's rule:"* and the rule's clause) with *Open in the sheet*.

**Exclusive:** `live/rockauto-parts.png` and `live/npm-deprecated.png`.

**Only D** reads like the parts counter a dealer knows, and writes a rule from a struck row.
- **Repeat risk:** the tree drifting into list-left. It stays one column.
- **Reflow:**
  - **390:** branches become full-width sections.
  - **834 · 1920:** the column at 760 · 880.
- **Northside sets:** slot order and presence.

**Owed by all four:**
- a selected item is never hidden;
- `searchReach` reaches the struck rows;
- every verdict sentence comes from `sayVerdict`;
- one trailer per quote.

## 6. Imagery

**Fitment is a Cockpit screen and needs no photography.** The hull may carry its catalogue render as a small plate: long edge 1100, which 39 rows reach (configurator sweep §6). None of the eight hero photographs is needed.

Marks fail exactly where this screen looks:
- **REDCO, SP660's starred trailer, has no mark.**
- Nor does NSM Custom.
- Mercury is white-ink only.

So C's maker heads are set in type, every one.

The Australian Builders Plate is the dealer's own envelope, but both frames show it only as a thumbnail or bullets (`live/abp-sa-capacity.png`, `live/abp-fishandboat.png`); B's axis does its job.
