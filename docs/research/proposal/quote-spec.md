# The quote that looks the part: the spec

What a Northside Marine quotation is, page by page, precise enough to build from. It is drawn on two real quotes this repository can produce today. It is the companion to `analysis.md` (why) and `briefs.md` (who builds what). Written 2026-09-23, and revised the same day after a challenger checked it against its sources.

**Status marks, on every element:**

| mark | meaning |
|---|---|
| **BUILT** | The document prints it today (`src/screens/document/`). |
| **ENGINE** | The issued quote already carries it; the page does not use it yet. |
| **NEW** | A small pure change in `src/domain`, with its test. `src/domain/quote/golden.test.ts` is never edited. |
| **P0** | Phase 0: the Paper step (`briefs.md` §2). |
| **M3 / M4** | Needs Milestone 3's levels or fitment work, or Milestone 4's settings, people or packer work. |
| **M5** | Needs templates: Northside's own words, fixed onto the quote at issue (Milestone 5). |
| **OWNER n** | Waits on question n in `analysis.md` §7. The default named there is built meanwhile. |
| **P2** | Phase 2, only on the owner's yes. |

## 0. Eight rules the paper keeps

1. **One page, two outputs.** Screen and PDF are the same nodes. Print is the browser's print of that page under `@page { size: A4; margin: 0 }` (BUILT, `document.css:1169-1172`). There is no PDF library and no second renderer. The original ran three renderers, and the same quote could print different totals by path (reader 3: `HelmLogic/src/components/stock-item-detail.tsx:237-245`, `proposal-print.tsx`, `tests/ffr33-pdf-rerender.spec.ts:5-10`).
2. **Everything printed is read from the issued quote:** lines, prices, the letterhead, the words, the validity date and the chosen sections. Editing Northside's settings or a template afterwards changes the next quote, never this one. BUILT for lines (`document.ts:1-12`); NEW for the rest.
3. **The customer's copy uses the customer's words.** It never prints: price file, level, rung, register, rows, offered, frozen, reimport, slot, engine hole, prop part, source cell. Those words belong on the note beside the sheet (BUILT, `Document.tsx:585-611`).
4. **No codes, cost, margin or cost-derived price level on the customer's copy.** A code appears only where it is part of the product's public name inside its label, such as the F90LB in "Yamaha F90LB". The note beside the sheet carries no cost or margin either, because the customer sits beside that screen at the desk.
5. **A missing fact is left out, never filled.** The dealer is told why, on the note beside the sheet and in a sentence at the moment of issue. The customer is told only what they need to know, such as an item that is not priced.
6. **A picture shows only the exact thing:** the row's own picture, or one a person marked as that exact item. It is never drawn wider in CSS px than the pixels held, and it carries a caption where the outboard or finish differs from the quote.
7. **It adds up.** Lines sum to their band, and bands plus adjustments sum to the total. A test proves this on both quotes below, reading the printed text.
8. **Nothing charged reads "Included".** An item the customer pays for carries its amount, or sits in a band whose subtotal carries it (§5).

## 1. The two quotes this spec is drawn on

Minted 2026-09-23 on the real pack with the app's own `mintQuoteFromView` and `readDocument` at the Cash level. A scratch script did this; nothing in the repository changed. Quote A is the quote `src/test/fixtures/golden/529-assault-pro.json` pins. Quote B is the boat Mark McWilliams field-tested against Northside's Display Sheet (`HelmLogic/tasks/RELEASE_NOTES_v1.32.0.md:14-26`).

**A. Stacer 529 Assault Pro (Tournament)**

| band | line, as the file names it | code (note beside the sheet only) | amount | what the file says the figure contains |
|---|---|---|---|---|
| 01 The hull | Stacer - 529 Assault Pro (Tournament) | SA529APTR | $28,530 | hull only; boat registration **not** included (`Managers View!D41` "HULL ONLY SALE" against `D42`) |
| 02 Motor | Yamaha - F90LB (the file's starred pairing) | F90LB | $14,330 | includes pre-delivery (`Motor Library!BF ← AV "Total PD Allowance"`) |
| 03 Trailer | TA1400S13SB - T Alloy 1400 ATM S 13" Skid Braked - 4.9 - 5.3m (starred) | TA1400S13SB | $8,703 | sell $8,420 plus registration $283 (`Trailer Module!CA = ROUNDUP(BW+BZ)`) |
| 04 Dealer fit | nothing chosen; 4 parts and 3 rigging kits were offered | | none | |
| **Total** | | | **$51,563** | |

- **Frozen specs:** HP 90–150 · Hull Length (Mtr) 5.29 · Beam (Mtr) 2.04 · Hull Weight (Dry) 598 kg · Bottomsides 4 mm.
- **Motor facts in the file:** HP Rating 90, Shaft Length 20", WEIGHT kg 162.
- **Trailer facts in the file:** ATM 1,400 kg, Tare 280 kg, Boat Size 4.9–5.3 m.
- **Also offered:** five other Yamahas, from the F90LB2 (White) at $14,934 to the F150LC at $22,233.
- **Workshop facts on the pairing:** rigging kit Yamaha/Stacer 703-6Y52L-12-05 side mount; prop 6FP-459xx-xx, Alum Talon GP K Series; engine hole TBA; slot 1.
- **Picture:** the row's own photograph, on the water, 1,024 × 676, verdict "scene", taken from the dealership's own mirror (`data/northside/images.json`). Checked by eye: the outboard in it is an **Evinrude**.

**B. Highfield SP560 (HYP) LG-W-WB**

| band | line | code (note beside the sheet only) | amount | contains |
|---|---|---|---|---|
| 01 The hull | Highfield - SP560 (HYP) LG-W-WB | HBS116 | $48,350 | hull only; boat registration not included (`Boat Module!R838`) |
| 02 Motor | Yamaha - F90XB (starred) | F90XB | $14,531 | the motor's Sell Price, which includes pre-delivery (`Motor Library!R82`, column BF) |
| 03 Trailer | REDCO Custom / Highfield SP560 Aluminium - TA600-MOB (starred; NSM Custom Trailers) | TA600-MOB (SP560) | $10,713 | sell $10,430 plus registration $283 |
| | GFAB Trailers: nothing paired with this hull | | | |
| 04 Dealer fit | nothing chosen; 4 fitted packages, 3 parts and 2 rigging kits were offered | | none | |
| **Total** | | | **$73,594** | |

- **Specs:** OA Length 5.66 · Beam 2.5 · Tube Dia 52 cm · Int Length 382 cm · Int Width 135 cm.
- **Motor:** 90 hp, 25" shaft, 166 kg.
- **Trailer:** ATM 1,500 kg, tare 380 kg.
- **Material and finish:** HYP is Hypalon, the word the original put on customer paper for this reason (`HelmLogic/tasks/RELEASE_NOTES_v1.16.0.md`, ticket lXRbKtH8). LG-W-WB reads Light Grey / White / White/Blue (`src/domain/quote/colourway.ts`).
- **Pictures:**
  - **The row's own:** a top-down studio render of the exact finish, with no outboard, held at 1,100 × 619 from a 2,560 × 1,440 source (`public/seed-images/sp560-lg-w-wb-1-2560x1440-df501c48.webp`, checked by eye).
  - **The model's on-water photograph** is 2,560 × 1,708. It carries a **Mercury 115**, and its finish is not recorded (`heroes-ledger.json`, `highfield-sp560`).
  - **The trailer row's picture** is the REDCO and TINKA logos.
  - **The motor row's picture** is Yamaha's F90 studio shot (800 × 600), from the F90LB's page. A person must verify that it depicts the F90XB before it sits beside that line.
- **Against Mark's sheet:** $73,594 against $103,731. The line-by-line comparison is in `analysis.md` §4. For comparison, the PVC SP560 W-W-WB starts at $66,584, with a $41,340 hull.

**Never on a customer's paper:** the hull's Warranty level, $28,118 on A and $32,166 on B. It is computed from landed cost (`docs/reference/MPF_GROUND_TRUTH.md:885`).

## 2. Page furniture, on every page

- **Page and margins.** A4 portrait, 210 × 297 mm. Margins are 18 mm at the sides, 14 mm at the top and 18 mm at the bottom, which leaves a 174 mm text width (BUILT, `document.css:132-144`).
- **Running head,** page 2 onward, 9 mm tall.
  - Left: Northside's mark in dark ink, no more than 7 mm tall (M4), or its name in type (BUILT once the name is frozen).
  - Right: `Quotation · 20260923-01` (BUILT).
  - The cover has no running head (BUILT).
- **Running foot,** 9 mm tall.
  - Left: the reference (BUILT).
  - Centre: `Valid until <issue date + the typed number of days>` (M4, OWNER 6). No date prints until a number is typed. Boards and tests draw this placeholder, never a date.
  - Right: `Page 2 of 5` (BUILT).
- **A printed dealer's copy,** if the owner says yes (OWNER 8), adds `Dealer's copy, not for the customer` to every running head (§11).
- **Paper ground.** The screen keeps the paper token. In print, the ground is the white paper token. Office printers cannot print to the edge, so a tinted ground comes out framed in white (*inference*, reader 1).
- **Type.**
  - Only the document's own tokens are used. On paper, 1 CSS px is 0.75 pt.
  - Body text is `--text-base` (14 px), notes are `--text-xs` (12 px), and nothing is set under 11 px.
  - Letter-spaced capitals must survive text extraction. The PDF's text layer must contain `Quotation`, the business name and the reference as whole words, read by the extractor the print test names. Poppler's `pdftotext` already extracts `QUOTATION` and `HIGHFIELD INFLATABLES` whole from today's PDF (checked). An earlier reading with an unnamed extractor split them.
- **Page breaks** stay measured, and never split a row or strand a heading (BUILT, `paginate.ts`). NEW: written prose breaks into paragraph-sized pieces so that long terms can paginate. Today `paginate.ts:91-103` packs one piece per block.

## 3. Page 1: the cover

From top to bottom. Every element holds on both quotes.

1. **Letterhead strip, about 24 mm.**
   - Left: Northside's mark in dark ink, up to 20 mm tall (M4, or the imagery round's organisation mark once it is found with provenance). The v1.16 field ask enlarged the original's header logos from 40 to 56 units tall (`HelmLogic/tasks/RELEASE_NOTES_v1.16.0.md`, ticket bvAyUQVR). @react-pdf measures in points, so that is about 20 mm *(inference)*. A raster mark is never drawn wider than its held pixels.
   - Without a mark: the business name in type (BUILT style `data-named`; the name is frozen from the file after Phase 0).
   - Under it, one line: `ABN · street, suburb QLD postcode · phone · website` (M4). Each item prints only once it is typed.
   - Right: `Quotation`, the reference, and `Issued <date>` (BUILT).
2. **The picture band.**
   - **The band as built:** full measure, 174 mm inside the margins, 72 mm tall, never a bleed (BUILT, `document.css:561-570`). The ruling is argued in the header of `src/screens/document/art.ts`: no held picture is 3,508 px tall, so a full A4 page would be an enlargement. A direction may propose a taller band inside the margins and says what it measured. A bleed would reverse a recorded ruling and needs a dated decision naming what lost.
   - **Sizes.** 174 mm is 657.6 CSS px. On A, the 529's 1,024 px photograph is not enlarged (about 149 dpi). On B, the 1,100 px render is not enlarged (about 160 dpi).
   - **Which picture:** the row's own held picture, down the BUILT ladder (`art.ts:209-222`): photograph, then the maker's mark in dark ink, then the name in type. The model's on-water photograph from `heroes-ledger.json` is used only on OWNER 9's yes.
   - **Caption,** at `--text-xs`, where the picture differs from what is quoted, from what the imagery ledger records.
     - A: `Stacer 529 Assault Pro (Tournament), photographed with a different outboard. Yours is fitted with the Yamaha F90LB quoted below.`
     - B: none needed; the render is the exact finish and shows no outboard.
     - On OWNER 9's yes, B's photograph: `Highfield SP560, photographed with a Mercury outboard. Your boat's finish and motor are as quoted below.`
   - **Provenance.** The picture's origin, and its held and drawn sizes, stay on the dealer's note (BUILT pattern, `Document.tsx:625-636`).
   - NEW: pictures are read through the imagery round's one reader (`pictures.json`), never a sister model's.
3. **Eyebrow and title, about 22 mm.**
   - Eyebrow: the maker, then the series as the file names it (`Stacer · Assault Pro (Tournaments)`; `Highfield · Sport`).
   - Title, at `--text-6xl` (40 px, about 30 pt): `529 Assault Pro (Tournament)`; `SP560`, with the sub-line `Hypalon · Light Grey / White / White/Blue`.
   - P0 / NEW: the maker prefix is stripped only when the label begins with the maker and " - ", and the rest is kept whole. "HYP" reads "Hypalon". The colourway decodes all or nothing, as `colourwayOf` rules.
4. **Key facts, one line, about 10 mm.**
   - Quote A: `5.29 m long · 2.04 m beam · 598 kg dry · 90–150 hp`.
   - Quote B: `OA length 5.66 · beam 2.5 · tube 52 cm`.
   - A unit prints only where the column's own name carries it. "(Mtr)" reads as m (NEW); "Tube Dia. cm" already reads as cm (BUILT, `freeze.ts:335-359`). Highfield's OA Length and Beam print bare until a person puts the unit in the column's name on `/data`. A unit is never guessed.
   - The full specification table moves to the hull band (§5).
5. **Summary, about 50 mm, in two columns.**
   - **Left:** `Prepared for`, then the customer's name at `--text-2xl` (22 px), then their contact lines (BUILT; the handover asks for one line, and ENGINE holds several). Below that: `Prepared by`, with the salesperson's full name, phone and email (M4 person record; today it prints the first name typed at sign-in).
   - **Right:** `Total, including GST`, then the figure at `--text-6xl`: **$51,563** for A and **$73,594** for B. BUILT reads "Total, tax included", from the workbook's clause that amounts are inclusive unless stated (`totals.ts:86-90`). The total is at least as prominent as any other price, as ACL s48 requires. Making it the largest figure on the paper is a design choice *(judgement)*.
   - **Under the total, one sentence** read from the frozen lines' `contains` flags (ENGINE), with the hull's "not included" flag handled as NEW: `Includes the trailer's registration and the motor's pre-delivery. Boat registration is not included.`
   - **If any line is unpriced:** `One item is not priced on this quote and is not in this total.` (BUILT logic, P0 wording).
6. **Validity, one line at `--text-2xl` (22 px):** `Valid until <issue date + the typed number of days>` (M4, OWNER 6, frozen at issue).
7. **The lower part is left white.** Porsche leaves the lower 35% of its cover empty (`docs/research/refs/document/notes.md` §1).

**The phone test.** An A4 PDF opened on a 390 px phone at fit-width shows at about 0.49 scale (*inference*: 390 ÷ 793.7). The model name and total (40 px) and the customer's name and validity date (22 px) are all at least 22 CSS px on paper. That is about 11 px on the phone, readable without zooming. Body text on the later pages may need zooming.

## 4. The letterhead: what Northside's settings must carry

| field | printed where | today | needs |
|---|---|---|---|
| Trading name | letterhead; running head | the file's `Northside Marine` (`manifest.json`, `name`), frozen after Phase 0 | M4 overrides it |
| Legal name, where different | contact panel | none | M4 |
| ABN | letterhead line; contact panel | none | M4 |
| One street address | letterhead line; contact panel | none | M4; a second site waits on OWNER 4 |
| Phone, email, website | letterhead line; contact panel | none | M4 |
| Mark in dark ink for paper, beside the light-ink version for the app | letterhead; running head | not held; the imagery round now looks for it first | imagery round, with provenance, or an M4 upload recorded as the dealership's own |
| Short code | reference prefix | none | M4 + OWNER 12 |
| GST rate, typed once | price page | none, never defaulted (`src/domain/model/quote.ts:329-333`) | M4 + OWNER 7 |
| Days a quote is valid | cover, foot, last page | none | M4 + OWNER 6 |
| Standing terms and deposit wording | last page | the `quoteTerms` field and `setQuoteTerms` exist (`project.ts`, `organisation.ts:120`); no screen writes them | M4 field, M5 written slot |
| Person: full name, title, phone, email | `Prepared by`; contact panel | the first name typed at sign-in | M4 |
| Brand layer: each brand's copy and the brand's dark mark | brand-story page; cover eyebrow | marks held for 12 of 13 brands (Mercury in white ink only; Stabicraft none); no brand copy layer exists (`project.ts`) | M5, keyed on Milestone 4's places |

**Where the values come from.** They are typed by a person in `/manage`. On OWNER 4's yes, `/manage` may also offer values the original HelmLogic already holds: its proof PDF prints Northside's street address and phone on page 9. Each offered value shows its provenance for a person to accept. Nothing is filled from a guess, and nothing is filled without a person accepting it.

**Frozen at issue** (NEW, in `freeze.ts`, with a test). The quote carries a snapshot of the letterhead fields above and a person snapshot for `Prepared by`. The test changes the ABN after issue and shows the issued PDF's text unchanged.

## 5. "Your boat": the configuration pages

- **Heading.** `Your boat`, then the engine's bands in its own order (BUILT, `bands.ts:134-138`): 01 The hull · 02 Motor · 03 Trailer · 04 Dealer fit · 05 Administration. A band with nothing on it is **left out** of the customer's copy (P0); today it prints "Not taken…".
- **Band head:** number, name, and subtotal on the right (BUILT). This is Qwilr's band carrying its own subtotal.
- **Columns:** `Item · Amount`, plus `Qty` only when a line on that page has a quantity above 1. There is **no Code column** on the customer's copy (P0).
- **Line:** an optional thumbnail, the name, one line of customer note under it, and the amount on the right.
  - The thumbnail is up to 42 × 32 mm, never drawn wider than its held pixels. The v1.16 field ask enlarged the original's band images from 92 × 70 to 120 × 90 units (`RELEASE_NOTES_v1.16.0.md`, ticket Qt0VHo4M), which is about 42 × 32 mm if those are points *(inference)*.
- **Money column:**
  - a figure;
  - `Included` (BUILT), only for an item the file includes at no charge;
  - or `Not priced on this quote` (P0 wording). The reason a line is unpriced goes on the dealer's note.
- **The note under a line,** in customer words:
  - quantity arithmetic, `2 × $199` (BUILT);
  - `Includes pre-delivery` (ENGINE `contains`);
  - for the trailer, `Trailer $8,420 plus registration $283`. NEW: the freeze copies the row's Sell and Rego ($) onto the line;
  - a hand-typed price shows as `Price agreed at $X` with its reason (BUILT logic, customer words).
- **Partner facts from the file** (NEW: frozen at pick, like the subject's specs):
  - motor: `90 hp · 20-inch shaft · 162 kg` (A) and `90 hp · 25-inch shaft · 166 kg` (B);
  - trailer: `ATM 1,400 kg · tare 280 kg · for boats 4.9–5.3 m` (A) and `ATM 1,500 kg · tare 380 kg` (B). The ACCC asks that weights say what they include (`market.md` §4.2).
- **The hull band** carries the full specification table as hairline rows (BUILT style, `Document.tsx:928-940`).
- **Dealer fit on the customer's copy** (OWNER 17; the default is the owner's May 2026 lock-in, `HelmLogic/tasks/v1.7-planning-restructure-status.md:63-66`).
  - Rigging kits, and fit-up labour once the file's pre-delivery tiers are packed, print as **one line**, `Fit-up and rigging`, with their price.
  - Accessories the customer picked from Dealer Fit Packages (a fitted VHF radio) print as items.
  - The itemised rigging stays on the note beside the sheet.
  - Neither table declares a price level today (M3). Until the dealer declares one, the line reads `Not priced on this quote`.
- **Band-only prices** (OWNER 18, built only on a yes). This is the honest form of v1.16's "Hide option prices". A per-quote switch, set before issue, prints a band's items without their own amounts, and the band head carries `5 items · $X`. The total is unchanged, and no charged item reads `Included`. Stripe's grouped line items are the reference (`docs/research/refs/document/notes.md:24`).
- **Factory options band** (Bill's ask). It needs the Factory Options Module workbook, which is not on this machine (`Playground/src/demos/northside.ts:136-142`), and a later decision to offer factory options in the configurator. A quote that carries them then prints its own `Factory options` band.
- **Northside's one-line note under Dealer fit** (M5) explains dealer accessories against fit-up and rigging (`HelmLogic/tasks/RELEASE_NOTES_v1.33.0.md:67-70`).
- **Thumbnails** appear only where `pictures.json` marks the picture as depicting that exact item and a person has verified it (NEW, after the imagery round).
  - A's trailer package picture (635 × 335) and the F90 studio picture (800 × 600) qualify only once verified.
  - B's REDCO line gets **no** thumbnail, because its held picture is a logo.
- **Worked page A:** 01 The hull, $28,530 · 02 Motor, Yamaha F90LB, $14,330 · 03 Trailer, TA1400S13SB, $8,703. The subtotals sum to $51,563.
- **Worked page B:** 01 SP560 · Hypalon · Light Grey / White / White/Blue, $48,350 · 02 Yamaha F90XB, $14,531 · 03 REDCO Custom TA600-MOB, $10,713. The subtotals sum to $73,594.
- **Never on the customer's copy:** "Optional. 5 more were offered…", "Not taken…", the slot, engine hole, prop part number and rigging-kit option, source cells, and price-level names. All of them go on the note beside the sheet (§11).

## 6. "What comes with your boat" (only once Northside sends the Boat Module workbook)

- **Source.** The Boat Module's `STANDARD FACTORY INCLUSIONS`, columns W..BV: 51 slots, the 51st being the "specifications subject to change" note (`docs/reference/MPF_GROUND_TRUTH.md:259`).
- **Not packable today.** The extract the pack is built from carries none of these columns on any of its 862 boat rows (`Playground/tools/seed/extracts/b2_data.json`, measured 2026-09-23). The Boat Module workbook is not on this machine. OWNER 10.
- **Layout:** the heading `What comes with your boat`, then square bullets in two columns, no prices, and at most about 40 lines a page, like Porsche's unpriced half (`docs/research/refs/document/notes.md` §1). Slot 51 prints as the note under the list.
- **Trailer features** (Trailer Module R..AL, 21 slots) are held in `t1_data.json` for 230 trailer rows. They print under `Your trailer comes with`, once the packer carries them (M4).
- **Placement:** after the configuration and before the price.
- **Frozen at issue** (NEW: the freeze copies the list, as it copies specs).
- **Until the workbook arrives,** the section is left out and the checklist marks it "not applicable yet".

## 7. Pages in Northside's words (M5)

**Order:**
1. A note from the salesperson (written per quote and frozen);
2. Why Northside Marine (organisation layer);
3. The brand and model story (brand layer, written by whoever the owner names for each brand);
4. the configuration and "What comes with your boat";
5. After-sales and warranty (organisation layer);
6. Finance and insurance, for information;
7. The value summary;
8. the price page;
9. Terms;
10. What happens next.

**Rules:**
- **Every written block is left out when empty.** The cascade is per quote → brand → organisation, with the admin lock skipping the per-quote layer, and **below the organisation there is nothing**. The original's actual cascade was three layers plus a hard-coded terms fallback that printed four terms nobody at Northside wrote (`analysis.md` §2; `HelmLogic/src/components/proposal-pdf.tsx:403-427`).
- **The warranty paragraph** must not read as limiting the buyer's consumer guarantees (`market.md` §5.4).
- **Storage and drawing.** Blocks are stored as ProseMirror JSON and drawn in the page with the document's own faces. The original's regex HTML-to-PDF step printed control codes and `<p>` tags, and lost hyphens (`HelmLogic/src/lib/tiptap-pdf.tsx:1-17, 232-313`).
- **Tokens:** model, reference, valid-until, business name, salesperson, and the customer's name **as typed**. They are resolved at issue and frozen.
  - There is **no first-name token.** `FrozenCustomer` holds only `name` (`src/domain/model/people.ts:22-25`), and splitting a name is a guess. The original split it and printed "Dear SP560," (proof PDF p. 2).
  - A first-name token exists only if the handover gains a typed greeting field (OWNER 20).
  - A token with no value prints nothing, and the composer says which.
- **Short, because the owner dislikes "walls of text"** (session `a40aaf14`, 2026-09-14 22:24) **and "simple wins"** (2026-09-23 06:51).
  - Each written block is optional per quote (§7a) and aims under half a page *(judgement)*.
  - The whole quote aims at no more than 8 pages for a boat, motor and trailer *(judgement)*.
  - Proposify's vendor data puts accepted proposals near 11 pages, which is a ceiling, not a target (`market.md` §3.5).

## 7a. Choosing what goes in (Porsche's section picker; OWNER 19)

- **Before issue, the salesperson unticks** the optional sections this customer does not need: What comes with your boat · Specifications · Pictures beside lines · each written page. All are ticked by default.
- **The reference** is Porsche's "Select PDF content" (`docs/research/refs/document/notes.md:20, 24`); `docs/PLAN.md:214` drew it as Document direction B.
- **Always in:** the cover, Your boat, Your price, and the terms-and-acceptance page.
- **The choice is part of the issued quote,** frozen with it, so the issued PDF is one document.
- **The order of the written pages** is set by Northside in templates (Bill's reorder ask), and proven on a printed PDF.

## 8. "Your price"

```
Boat                                   $28,530
Motor                                  $14,330
Trailer (incl. $283 registration)       $8,703
[each adjustment on its own row, with its reason, e.g. "Trade-in allowance"]
Total, including GST                   $51,563
```

- **Adjustments.** Discount, trade-in and rebate are ENGINE: the commands `addAdjustment`, `updateAdjustment`, `setAdjustmentMagnitude` and `removeAdjustment` exist. They need an act on a draft (§12). Each prints on its own row with its reason and is never folded into a subtotal (BUILT, `Document.tsx:1175-1189`).
- **The GST amount** (OWNER 7). There are two ways to work it. Both depend on a typed 10% rate and on Northside confirming that the file's figures include GST.
  - **Northside's own workbook** shows one figure over the whole total (`AB174 = X170/1.1`, recorded at `src/domain/quote/totals.ts:86-90`). This is what the engine computes today: A $51,563 ÷ 11 = $4,687.55; B $73,594 ÷ 11 = $6,690.36.
  - **Leaving GST-free registration out:** A ($51,563 − $283) ÷ 11 = $4,661.82; B ($73,594 − $283) ÷ 11 = $6,664.64. This departs from the dealer's own formula. That registration is GST-free comes from the original's own test note (`HelmLogic/tasks/test-evidence/ultimate-test/ULTIMATE_TEST.md` §3) and general knowledge, not checked against the ATO today.
  - **Until the owner picks,** no GST amount prints and the label says "including GST".
- **The motor's column** (OWNER 16). These figures are at Cash, which for a motor is its Sell Price. Mark's Display Sheet printed the F90XB at "RRP + Freight Inc GST", $17,643 against $14,531 here. If the owner chooses that column, B's total changes. The paper never shows both.
- **What the price includes:** the same sentence as the cover.
- **Delivery estimate:** only where the dealer types one, or from the file's lead times on OWNER 10's yes. The ACCC asks for timeframes to be upfront (`market.md` §4.2).
- **Before-tax line:** none unless a rate is typed (BUILT behaviour).
- **Saving against RRP:** not printed. Comparisons with a recommended price carry their own ACCC obligations *(inference)*.

## 9. The last page: terms, validity, deposit, acceptance, signatures

1. **Terms.** Northside's written terms, frozen and paginated (M5, OWNER 5). With none, the section is left out, and the dealer sees a sentence at the moment of issue and on the note beside the sheet.
2. **Validity:** `This quotation is valid until <issue date + the typed number of days>.` (M4, OWNER 6). Whether acceptance makes it binding is Northside's own sentence, inside its terms.
3. **Deposit schedule: not on the quote by default** (OWNER 10).
   - The file carries one (Boat Module QC..QH), and the extracts hold it for 823 boat rows. For B: 30% on a confirmed deal, 30% when it leaves the factory, 40% on handover.
   - The market evidence puts deposit receipts, trade-in payout and balance on delivery on the contract, not the quote (`market.md` §6, the MTA SA contract; `docs/LATER.md:6`).
   - On the owner's yes it is shown only, never charged (ACL s36; `market.md` §4.2).
4. **What happens next,** in Northside's words (M5).
5. **Contact panel** (M4): the dealership's name, address, phone, email, website and ABN; the salesperson's name, phone and email.
6. **Signature blocks** (Phase 1). Two blank blocks side by side, stacked below 826 px, kept together on one page:
   - `Client acceptance`: Name, Signature, Date;
   - `Merchant authorisation · Northside Marine`: Name, Signature, Date.

   These are the labels the original printed and the dealership used (`HelmLogic/src/components/proposal-pdf.tsx:1386-1399`); they are not new legal text. Any clause about what signing means comes only from Northside's terms.
7. **Accepted at the desk** (P2, OWNER 3).
   - The blank lines are replaced by `Accepted by <typed name> at Northside Marine on <date, time>, witnessed by <salesperson>`, the signature image, and the version's reference.
   - It is recorded as a new `accepted` event naming that issued version. Lines and words are untouched.
   - **Against s14(1)** of the Electronic Transactions (Queensland) Act 2001 (`market.md` §5.3):
     - it records identity and intention: the typed name, the signature, and the act of accepting this version;
     - it records what makes the method reliable: the time, the version's reference and the witnessing salesperson;
     - the third condition is the consent of the person the signature is given to, which is the dealership, recorded as Northside's setting that it takes signatures this way.

     A customer tick reading "I agree to sign electronically" is good practice *(judgement)*, not the s14 condition.
   - It works only in the browser that raised the quote until Milestone 6, and the screen says so. The saved PDF is the durable record.
   - The wording is Northside's. Without it the act refuses with a sentence.
8. **No software branding.** The original stamped "© 2026 HelmLogic" (proof PDF p. 9; `proposal-pdf.tsx:1446-1448`).

## 10. How it prints, saves, is sent, and reads on a phone

- **Print.** `Print`, then the browser's dialogue: A4, no margins, background graphics on (BUILT).
  - Nothing of the app's shell prints: `@media print` in `src/screens/shell/shell.css` hides the pill and the finder (P0).
  - The print test checks, under print emulation, that nothing outside the sheet is visible. It also reads the printed PDF's text with an extractor it names (`pdfjs-dist` as a dev dependency is portable to CI; poppler's `pdftotext` is on this machine). It asserts that the business name is on page 1, the reference is on every page, and none of the shell's words appear (P0; `e2e/flows/document.spec.ts`).
- **Save as PDF.** It is a destination in the same dialogue.
  - The file name comes from `document.title`, set on the document route while it is open and restored on leave: `Northside Marine quote 20260923-01 – Stacer 529 Assault Pro (Tournament)` (P0).
  - Chrome proposes the page title as the file name. That is general knowledge; the hosting step confirms it on a saved file.
- **On a tablet.** Print, then Share, then Save to Files (general knowledge).
- **Sending.** The salesperson attaches the PDF to their own email.
  - The optional `Write the email` helper opens a `mailto:` addressed to the customer's typed email, if one exists, with the subject `Your quote 20260923-01 from Northside Marine`. The body is Northside's written email template (M5), or empty.
  - Nothing is sent by the app. Sending through SendGrid, which the owner has chosen (`HelmLogic/tasks/EMAIL_where_to_from_here.md:25`), waits for Milestone 6.
- **On the customer's phone.** Page 1 passes the phone test in §3.
- **In the app at 390 px.** The page boxes leave, and the same nodes set as one column (BUILT, `docs/DECISIONS.md:127`).

## 11. The staff view, and a printed dealer's copy only on a yes

- **Default: the note beside the sheet, on screen** (BUILT, `Document.tsx:585-611`). It carries:
  - the codes;
  - the workshop facts (rigging-kit option, prop part number and description, engine hole, slot);
  - the price level each line was priced at;
  - offered-but-not-taken counts;
  - source cells.

  It is the nearest thing HL_2.0 has to the owner's May 2026 on-screen staff view.
- **Never cost or margin there.** The note sits beside the paper while the customer watches at the desk, so in practice it is a customer surface *(judgement, on the rule that cost and margin never reach a customer-facing surface)*.
- **A printed dealer's copy only on OWNER 8's yes:** the same component with one switch, `Dealer's copy, not for the customer` in every running head, and no cost or margin.

## 12. What each part needs

| part | today | needs |
|---|---|---|
| No shell on paper; the print test reads text | the pill prints on every page | P0 |
| Business name on page 1 | "not been named yet" | the running close-out (file name) → M4 (settings) |
| App words off the paper; a true rigging-kit sentence; no Code column | printed | P0 |
| Decoded title; the PDF's file name | raw label; `HelmLogic` | P0 (ENGINE `colourwayOf`; NEW title) |
| Letterhead line, contact panel, person | none | M4 fields + NEW freeze |
| Organisation mark in dark ink | not held | imagery round (provenance) or M4 upload |
| Cover picture caption | no caption | M5 proposal track + imagery reader |
| Includes / excludes sentence | none | ENGINE `contains` + NEW hull flag |
| Partner facts; trailer registration split | none | NEW freeze |
| Fit-up and rigging as one line; declared price columns | "Not priced" per item | M3 levels + M5 proposal track, OWNER 17 |
| Thumbnails | none (`Line` draws no image) | imagery `pictures.json` (verified) + M5 |
| What comes with your boat | not packable | Northside's Boat Module workbook (OWNER 10) → M4 packer → M5 |
| Trailer features; deposit schedule; lead time | in the extracts, not packed | M4 packer; printing on OWNER 10 |
| Factory options | not packable | Northside's Factory Options Module workbook + a decision |
| Acts for adjustments, terms, tax rate, qty, typed price, prepared-by | engine only | M5 proposal track, on a draft |
| GST amount | none | OWNER 7 + NEW |
| Validity | none | M4 + OWNER 6 |
| Written pages; email template | none | M5 templates |
| Section choice before issue | none | M5 proposal track, OWNER 19 |
| Signature blocks | none | M5 proposal track |
| Acceptance at the desk | none | P2, OWNER 3 |
| Printed dealer's copy | the note beside the sheet only | OWNER 8 |

## 13. The checklist: pass or fail on the printed PDF

Used by the Milestone 4 and Milestone 5 verifiers, the beauty round's paper lens, the hosting proof and the acceptance round's customer lens. Each item is marked with the page it was checked on. Items marked (M4), (M5) or (OWNER) pass as "not applicable yet" until that dependency lands. A fail on items 1 to 13 is a blocker.

1. The dealership's mark or name is the first thing on page 1, and "not been named" appears nowhere.
2. No navigation, control or finder text appears on any page.
3. None of the app's vocabulary appears on the customer's copy: price file, register, level, rung, rows, offered, frozen, reimport, slot, engine hole, prop part, source.
4. No product codes appear on the customer's copy, except inside a product's public name.
5. No cost, margin or cost-derived level appears on the paper or on the note beside it.
6. The cover picture is of the exact hull model; the caption says what differs; no logo stands in for a product.
7. The model's name reads as a buyer would say it and is the exact model ("(Tournament)" kept; the finish decoded or printed whole).
8. The total says it includes GST, sits beside the customer's name, and is at least as prominent as any other price.
9. One sentence says what the total includes and does not.
10. Lines sum to band subtotals, and bands plus adjustments sum to the total (checked by arithmetic on the extracted text).
11. Every adjustment is its own row with its reason.
12. No line prints $0. "Included" is used only for an item the file includes at no charge, and nothing charged reads "Included".
13. Fit-up and rigging is one line on the customer's copy (OWNER 17 default).
14. The issue date is present. The valid-until date is present once validity is typed, and absent otherwise (M4).
15. The dealership's phone, address and email, and the salesperson's name and contact details, are present (M4).
16. The ABN is present (M4).
17. Terms print only when Northside wrote them; there is no boilerplate, and no sentence to the customer about missing terms (M5).
18. Both signature blocks are present, together on one page.
19. The reference and "Page n of m" are on every page.
20. Nothing is cut, overlapping or split mid-row across a page (the existing rulers).
21. The text layer, read by the extractor the print test names, contains "Quotation", the business name and the reference as whole words.
22. The saved file's name is the quote's, not HelmLogic.pdf.
23. Page 1's model, total, customer name and validity date are set at 22 CSS px or larger, and read at a phone's fit-width without zooming.
24. There is no software branding.
25. No picture is drawn wider than its held pixels (the dealer's note reports held and drawn sizes).
26. The GST amount is absent, or worked the way `docs/DECISIONS.md` records the owner chose (OWNER 7).
27. The optional sections printed are the ones chosen before issue (§7a).
28. Editing Northside's settings or a template after issue leaves the issued PDF's text unchanged.
29. Only if a printed dealer's copy exists: it says so on every page.
