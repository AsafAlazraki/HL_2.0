# Briefs: the changes to the queued rounds

Paste-ready text for the workflow scripts under `.claude/workflows/`, as they read at 16:56 on 2026-09-23.

**The run order** (`.claude/workflows/README.md`): hl2-m2-close → hl2-northside → hl2-imagery → hl2-m3 → hl2-m4 → hl2-m5 → hl2-beauty → hl2-host → hl2-acceptance.

**Two facts decide where things go.**
- **`hl2-m2-close` is running now.** Its journal was on the sheet's Redesign step at 16:49. It runs from a copy of its script taken at launch (`workflows/scripts/hl2-m2-close-wf_31b45040-71c.js` in this session's folder, 14:43), so nothing pasted into `.claude/workflows/hl2-m2-close.js` reaches it. **Phase 0 is therefore a step of its own (§2).** It goes at the end of `hl2-northside.js`, or at the start of `hl2-imagery.js` if the Northside round has already launched.
- **Some of Phase 0 may already be done.** The close-out's document fixer already carries the dealership's name (through `ctxFrom`) and the "Milestone 6" wording (`hl2-m2-close.js:245-247`). The Northside round may rewrite the document's "a business" sentences. Phase 0 reads what both left before it acts.

**Pasting.** The `text` blocks contain no backticks and no dollar-brace sequences, so they paste safely inside the scripts' template literals. A "$" followed by a digit or a letter is safe. The `js` blocks are code.

**Northside only; simple wins.** Following the owner's 2026-09-23 06:51 UTC message, nothing here is built for a second dealership, and every extra switch waits for the owner's yes.

Sources for every claim are in `analysis.md` and `quote-spec.md`. The blocks cite the load-bearing ones inline.

## 1. Cross-cutting learnings

These go in the HOUSE constant of hl2-m3.js, hl2-m4.js and hl2-m5.js, and in the STATE of hl2-beauty.js. Append at the end of the constant:

```text
LEARNINGS FROM EVERY CRITIQUE SO FAR (docs/research/proposal/analysis.md; the critiques under docs/research/refs/ and docs/directions/), which this round must not repeat: (1) one composition stamped across several screens is introduced the moment a direction is chosen from words, so draw it, and name on every board which built screens it could repeat; (2) a measured figure in docs/STATUS.md or docs/SCREENS.md goes stale, so re-measure or delete every figure you touch at close-out (on 2026-09-23, STATUS.md lines 103, 130 and 153 still said three sale screens are not in e2e/routes.ts, and routes.ts includes all three); (3) a check that passes while measuring nothing is worse than none: the document's print test counted pages and stayed green while the app's navigation printed on every page of the customer's quote, so press the control and check where it lands, and read what was printed rather than counting it; (4) refusals went wrong four ways, loud at rest, repeated per row, false, or in plan vocabulary, so give one per cause, above the list, in the dealer's words; (5) research already paid for is cited, not bought again, so reconcile against docs/reference/* at build time; (6) never only Porsche; (7) an honest empty state still has to look designed, and the day-one research in docs/research/refs/home/notes.md section 5 and docs/research/refs/both/notes.md section 3 is there to use; (8) anything a customer can see while sitting beside the dealer is a customer surface, so no cost, margin or cost-derived price there either.
```

## 2. Phase 0, the Paper step

This goes in hl2-northside.js after the Check phase, or in hl2-imagery.js before the Audit phase.

**2.1 Add to `meta.phases`:**

```js
{ title: 'Paper', detail: 'Phase 0 of the proposal: nothing of the app prints on a quote, and the print test reads the PDF' },
```

**2.2 Add before the script's `return`** (or before `phase('Audit')` in hl2-imagery.js), and add `paper` to the returned object:

```js
const PAPER_REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    alreadyTrue: { type: 'array', items: { type: 'string' } },
    fixed: { type: 'array', items: { type: 'string' } },
    notFixed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'alreadyTrue', 'fixed', 'notFixed', 'notes'],
}

const PAPER = `You are fixing the paper a Northside Marine customer is handed. This is Phase 0 of the proposal: docs/research/proposal/analysis.md section 6, and docs/research/proposal/quote-spec.md sections 0, 3, 5 and 10. Read both first. The repository is your working directory.

THE OWNER'S WORDS, 2026-09-23: "really keen on being able to get a quote out properly where it looks the part"; "the output can be sent to a customer after downloaded"; "this is a northside marine app … remember also simple wins".

FIRST, READ WHAT EARLIER ROUNDS LEFT: docs/directions/built-m2-close.md (and -2 if present), the newest section of docs/STATUS.md, git log -8 and git diff --stat. The Milestone 2 close-out was told to put the business the file names on page 1 through ctxFrom in src/state/catalogue.ts and to say its Milestone 6 sentences in the dealer's words; the Northside round removed things that serve a business other than Northside and may have rewritten the document's sentences about a business with no organisation. Do only what is still untrue, and list what you found already true.

THEN, EACH PROVEN:
(1) NOTHING OF THE APP PRINTS. Measured on e2e/out/document-Lb7JK_gGkY.pdf: the pill's words (Home, Quotes 0, Customers, Data, History, Find, Ctrl K) print across the top of all three A4 pages, because .way-pill is position: fixed (src/screens/shell/shell.css:125-139) and the shell has no print rule. Add @media print to shell.css hiding the pill, the finder and anything else the shell paints.
(2) THE PRINT TEST READS WHAT WAS PRINTED. e2e/flows/document.spec.ts:339-365 counts pages and stayed green with the pill on every page. Add two checks: under page.emulateMedia with media print, nothing outside the sheet is visible; and the printed PDF's text, read with an extractor the test names (pdfjs-dist as a dev dependency is the portable choice; poppler's pdftotext is on this machine but not guaranteed on CI), contains the business name on page 1 and the reference on every page, and none of Home, Customers, Find, Ctrl, price file, register, rows were offered, reimported, frozen, Slot, Engine Hole.
(3) THE PAPER IS THE CUSTOMER'S. Move to the note beside the sheet: the How to read a line glossary (Document.tsx:1252-1274), the tax paragraph (1240-1243), the record paragraph's reimport sentence (1314-1318), the offered and not-taken counts (1131-1172; an empty band is left off the customer's paper), and the pairing facts printed under a line (Slot, Engine Hole, Prop Part No., Prop Description, Rigging Kit Option). The unpriced word on the paper becomes Not priced on this quote, and the cover's unpriced sentence becomes One item is not priced on this quote and is not in this total. Keep Included for items the file includes at no charge. The note sits beside the paper while a customer watches, so it carries no cost or margin either.
(4) A FALSE SENTENCE: this register carries no price column at all (src/domain/quote/document.ts:221-225). Rigging Kits carries Kit Sell Price, Sell Price and Install Retail Sell, and Dealer Fit Packages carries Act Sell and Sell; both declare no price level (data/northside/manifest.json, priceLevels empty for rig_kits and dealer_fit). The note says No price level is declared for this table, and that declaring one is the dealer's act on the levels screen.
(5) NO CODE COLUMN ON THE CUSTOMER'S PAPER. The dealership's own spec says No system IDs or SKU codes are visible (HelmLogic scripts/seed-mvp-plan.ts:243). Codes move to the note beside the sheet.
(6) THE TITLE A BUYER WOULD SAY. Strip the maker prefix only where the label begins with the maker and ' - ', and keep the rest whole: 529 Assault Pro (Tournament) keeps its (Tournament), because that is the exact model. Decode the colourway with colourwayOf in src/domain/quote/colourway.ts, all or nothing as it rules, and print HYP as Hypalon, the word the original put on customer paper for exactly this reason (HelmLogic tasks/RELEASE_NOTES_v1.16.0.md, ticket lXRbKtH8). A pure derivation in src/domain with its test.
(7) THE PDF'S NAME. Set document.title on the document route while it is open, restored on leave: the business, then quote, then the reference, then the model, for example Northside Marine quote 20260923-01 – Stacer 529 Assault Pro (Tournament). Today index.html:16 is the only title, so every saved quote is named HelmLogic.
(8) THE TWO-TRAILER QUOTE-STARTER is NOT yours: src/domain/quote/freeze.ts:545-547 brings the starred row of every trailer table, so a hull paired in two starts with two trailers in its total. Milestone 3's fitment round owns it. Name it in your report and leave it.

Nothing here invents a word or a figure. src/domain/quote/golden.test.ts stays untouched.

OWNERSHIP: src/screens/shell/shell.css (the print rule only), src/screens/document/**, src/routes/quote.$id_.document.tsx, src/domain/quote/document.ts, a new pure title derivation beside colourway.ts with its test, e2e/flows/document.spec.ts, and package.json only to add the named extractor as a dev dependency. Ports: Playwright 5851, vite 5852.

GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run; npx tsx tools/check.ts; npm run build; HL2_PREVIEW_PORT=5851 npx playwright test e2e/flows/document.spec.ts e2e/flows/shell.spec.ts --workers 1. Then print one PDF of the golden Stacer 529 Assault Pro (Tournament) to docs/directions/document/built/529-phase0.pdf, open it with the Read tool, and say what page 1 shows. Append a dated one-liner to docs/DECISIONS.md naming what lost. Do NOT commit, push, checkout, reset or stash.`

phase('Paper')
const paper = await agent(PAPER, { label: 'paper', phase: 'Paper', schema: PAPER_REPORT })
log('paper: ' + (paper ? paper.fixed.length + ' fixed, ' + paper.notFixed.length + ' not fixed' : 'none'))
```

**2.3 hl2-imagery.js: append to `CONTEXT`.**

```text
THE CUSTOMER'S PAPER READS YOUR LEDGER TOO (docs/research/proposal/quote-spec.md sections 3, 4 and 5). A picture beside a line on a quote must be one a PERSON marked as that exact item; the automatic verdict is not enough. data/northside/images.json records redco-tinka-logos-01.png, the REDCO and TINKA logos, as verdict scene, and it is the picture the REDCO SP560 trailer row points at. Give every pictures.json entry a depicts field naming the exact item and the verification line, and make the one reader refuse a logo, a sister model or a wrong colourway for a line or a cover. Record what a picture shows that differs from what a quote may say: the Stacer 529 Assault Pro (Tournament)'s own photograph carries an Evinrude outboard, and the SP560 hero a Mercury 115 with its finish unrecorded, so the paper can caption them honestly. Northside Marine's own mark prints on WHITE PAPER as the letterhead: record whether the copy you find is dark ink, and if it is white ink only, say so, because a white mark cannot print on the quote.
```

## 3. hl2-m3.js

**3.1 The levels brief.** Append:

```text
THE CUSTOMER'S PAPER READS THIS SCREEN (docs/research/proposal/analysis.md sections 4 and 7). (1) A COST-DERIVED LEVEL: every boat table declares a Warranty level scoped to a line, and the file computes it from landed cost, ROUNDUP((IY-IW)*1.01*1.1) (docs/reference/MPF_GROUND_TRUTH.md:885): $32,166 against Cash $48,350 on the Highfield SP560 (HYP) hull. The guard that refuses a level landing on one of the 139 cost columns does not catch it, because the Warranty column is computed from cost rather than being one. Give every declared level a may-reach-a-customer flag the dealer sets, off by default for a level whose formula reads a cost column, and refuse to issue a quote with a line priced at such a level, with the sentence. (2) TWO TABLES WITH SELL COLUMNS AND NO LEVEL: Rigging Kits (Kit Sell Price, Sell Price, Install Retail Sell) and Dealer Fit Packages (Act Sell, Sell) both declare no price level (data/northside/manifest.json), so every rigging kit and every fitted accessory prints Not priced on a customer's quote. Let the dealer declare which column is the price, shown as a fact the file already holds, never guessed. (3) THE MOTOR'S COLUMN: Mark McWilliams matched the original's PDF to Northside's Display Sheet to the dollar with the Yamaha F90XB at $17,643, its RRP + Freight Inc GST column (mot_yamaha column bb); HL_2.0's Cash for motors is the Sell Price column, $14,531 (HelmLogic tasks/RELEASE_NOTES_v1.32.0.md:26; Motor Library!R82). Show both columns side by side on the motor tables so the owner can choose which one a customer's quote uses. Do not choose for him.
```

**3.2 The fitment brief.** Append:

```text
ONE BOAT, ONE TRAILER. src/domain/quote/freeze.ts:545-547 brings the starred row of every trailer table, so a hull paired in two trailer tables starts its quote with both in the total: on the SP660, GFAB at $24,723 and REDCO at $12,643, 03 Trailer $37,366 (e2e/out/document-Lb7JK_gGkY.pdf page 2). Decide it in the engine with a test, say it as a rule sentence where the configurator offers the second, and leave src/domain/quote/golden.test.ts untouched.
```

## 4. hl2-m4.js

**4.1 STATE.** Append:

```text
THE QUOTE THIS MILESTONE MUST LET NORTHSIDE SEND (docs/research/proposal/analysis.md; quote-spec.md sections 3, 4 and 6). The paper a customer receives needs a letterhead, a contact panel, a salesperson, a validity date and a GST rate, and every one of them is set on /manage. Today OrgProfile holds ONLY name, industry, createdAt, slug and quoteTerms (src/domain/model/project.ts:12-65), and no screen writes even those. The pack is built from the old repository's extracts (tools/seed/README.md), and those hold a deposit schedule for 823 of 862 boat rows, lead times for 821 and trailer features for 230 trailer rows, none of which the pack carries; they hold NO standard inclusions and NO factory options on any row, because those live in Northside's Boat Module and Factory Options Module workbooks, which are not on this machine (C:/Users/Asaf/dev/mpf-workbooks holds Motor, Parts, Rigging and Dealer Fit only; HL_Playground src/demos/northside.ts:136-142).
```

**4.2 The manage brief.** First, **replace** the sentence "src/domain/people/organisation.ts holds the shape." with:

```text
src/domain/people/organisation.ts and src/domain/model/project.ts hold the shape AS IT STANDS, which is ONLY name, industry, createdAt, slug and quoteTerms; setOrganisation and setQuoteTerms write them and no screen calls either. Every other field here is yours to add, in src/domain, with tests.
```

Then **append**:

```text
THE LETTERHEAD, PRECISELY (docs/research/proposal/quote-spec.md section 4). The mark prints on white paper, so it needs DARK INK; a white-only mark is refused for the quote with that sentence, as Mercury's is, and the imagery round may already have found Northside's own mark with provenance in data/northside/marks-ledger.json. The terms and the deposit wording are Northside's own words, never written for them: an empty field prints nothing. NOTHING IS PRE-FILLED unless docs/DECISIONS.md records the owner's yes to offering the values the original HelmLogic already holds (its proof PDF, HelmLogic tasks/test-evidence/ffr33-sp560-proof/SP560-display-sheet-proof.pdf page 9, prints Northside's street address and phone); if it does, each offered value shows its provenance and a person accepts it. A person's full name, title, phone and email print as Prepared by. FREEZE AT ISSUE with a test: an issued quote carries a snapshot of the letterhead and the person, and changing the ABN afterwards leaves the issued document's text unchanged; src/domain/quote/golden.test.ts is untouched. THE PREVIEW BESIDE THE FIELDS is src/screens/document's own component drawing the most recent real draft, never a fixture; with no draft, a sentence saying so.
```

**4.3 The shelf brief.** Append:

```text
THE PACKER CARRIES WHAT THE FILE HOLDS AND THE PACK DROPS (docs/research/proposal/quote-spec.md sections 6 and 9). You also own tools/seed/pack.ts, pack.worker.ts and their docs for this. From the old repository's extracts (HL_Playground tools/seed/extracts/b2_data.json and t1_data.json; read tools/seed/README.md first), carry onto the rows that hold them, with the column letter and the Source cell as provenance: the Boat Module's DEPOSIT PAYMENT SCHEDULE (QC..QH; 823 of 862 rows), its Factory Lead Times (QJ..QO; 821 rows), and the Trailer Module's TRAILER FEATURES (R..AL; 230 trailer rows). Printing them is the owner's call (analysis.md section 7 question 10); packing them invents nothing. The standard inclusions (W..BV) and the factory options (BX..IG) are on NO row of the extracts: when this screen brings in a new file, say plainly that those two bands need Northside's Boat Module and Factory Options Module workbooks, and name them. Keep the 53-table, 15,691-row and 28-join assertions; src/domain/quote/golden.test.ts stays untouched.
```

**4.4 The build prompt's shared exit criterion.** Append after "…a person set in /manage is the "prepared by" on a quote they issue;":

```text
and a quote issued after /manage is filled prints Northside's name, mark in dark ink, ABN, address, phone, the salesperson and the validity date on its PDF, and prints the same PDF after /manage is edited again;
```

**4.5 The verify walk.** Append to its step 2:

```text
→ after /manage is filled, raise and issue a Stacer 529 Assault Pro (Tournament) quote, print it to PDF (docs/directions/manage/built/529.pdf), open it with the Read tool, and mark docs/research/proposal/quote-spec.md section 13 items 1, 14, 15, 16 and 28 pass or fail with the page.
```

**4.6 The critic's blocker list.** Append:

```text
a letterhead field that does not reach an issued document; a letterhead field that changes an already issued document; a white-ink mark on paper; a letterhead value nobody typed or accepted; a preview drawn from a fixture.
```

## 5. hl2-m5.js: a fourth track, "the proposal", built first

**5.1 STATE.** Append:

```text
THE PROPOSAL IS WHAT THE OWNER ASKED FOR MOST. His words, 2026-09-23: "really keen on being able to get a quote out properly where it looks the part", and his end goal: "the output can be sent to a customer after downloaded". "PandaDoc-like" most likely means his original HelmLogic's fixed-slot Template Studio and a beautiful PDF; whether it also means PandaDoc's send, track and sign loop is his question 1, and that loop needs Milestone 6 (docs/research/proposal/analysis.md sections 1 and 5). This milestone therefore opens with a fourth track, THE PROPOSAL: the built document upgraded in place to docs/research/proposal/quote-spec.md, built ALONE and FIRST, because templates author into its pages and preview through its component. Where docs/DECISIONS.md records the owner's answer to a question in analysis.md section 7, follow it; otherwise build the default in that table.
```

**5.2 SCREENS.** Add as the **first** entry:

```js
{
  key: 'proposal',
  port: 5441,
  owns: 'src/screens/document/**, src/routes/quote.$id_.document.tsx, src/routes/quote.$id_.accept.tsx (Phase 2 only), e2e/flows/document.spec.ts and its row in e2e/routes.ts; the Handover function in src/screens/configurator/Configurator.tsx and its tests in Configurator.test.tsx, only if your judged direction puts the money acts there (no other Milestone 5 track touches the configurator, and this track builds alone); and in src/domain only the pure additions quote-spec.md marks NEW (freeze.ts, document.ts, commands.ts, totals.ts), each with its test. src/domain/quote/golden.test.ts is untouched. The document has no door of its own in the shell; do not add one.',
  brief: `SCREEN: THE PROPOSAL, at /quote/$id/document (the built document, upgraded in place in src/screens/document/) and, only on the owner's yes, /quote/$id/accept. It is the quote a salesperson is proud to hand over, and the one thing in this app that leaves the building.

READ FIRST, IN FULL: docs/research/proposal/analysis.md; docs/research/proposal/quote-spec.md (THE SPEC: every page and element, each marked BUILT, ENGINE, NEW, P0, M3, M4, M5, OWNER or P2); docs/research/refs/proposal/market.md (already in your sweep folder; write your notes.md beside it); docs/research/refs/document/notes.md; src/screens/document/ with src/domain/quote/document.ts; and docs/DECISIONS.md for any dated line recording the owner's answers to analysis.md section 7.

WHAT TO BUILD, in order, each proven: (1) whatever of Phase 0 (analysis.md section 6) is not already true on this tree; (2) the letterhead and contact panel from Milestone 4's settings and people, frozen at issue; (3) the cover per quote-spec section 3: the band as built and never a bleed, the row's own held picture read through the imagery round's one reader, the honest caption, and the validity line at the size the phone test needs; (4) Your boat per section 5: no code column, customer words, partner facts frozen at pick, the trailer's registration split out, fit-up and rigging as one line on the customer's copy, and thumbnails only where a person marked the picture as that exact item; (5) What comes with your boat, only if the packed inclusions exist, and otherwise left out with the reason on the dealer's note; (6) choosing what goes in per section 7a, decided before issue and frozen with the quote; (7) Your price per section 8: every adjustment its own row with its reason, and GST stated only as docs/DECISIONS.md records the owner's choice, otherwise the label alone; (8) the last page per section 9: the terms slot and its empty state (templates, built after you, fills it), validity, what happens next, the contact panel, and the two blank signature blocks Client acceptance and Merchant authorisation; (9) the way out per section 10: the PDF's name, the Write the email helper (a mailto; nothing is sent by the app), and page 1 legible at a phone's fit-width; (10) acts for the commands the engine has and no screen calls (addAdjustment and its siblings, setNote, setTaxRate, setPreparedBy, setQty, setOverride with its reason, addFreeLine), on a draft, before issue: either beside the draft document (the document already renders a draft, Document.tsx:882) or in the configurator's handover, where the quote is issued (Configurator.tsx:1629). Say which the judged direction chose and why. Build a switch the owner has not asked for (band-only prices, a printed dealer's copy) only where docs/DECISIONS.md records his yes: simple wins.

PHASE 2, ONLY ON THE OWNER'S YES to analysis.md section 7 question 3, recorded in docs/DECISIONS.md. If yes, build acceptance at the desk per quote-spec section 9 item 7: a new accepted event naming the issued version, never an edit of it; the customer's typed name and signature, the time and the witnessing salesperson recorded; and Northside's own setting that it takes signatures this way, because under the Electronic Transactions (Queensland) Act 2001 s14(1) the consent is that of the person the signature is given to, which is the dealership (market.md section 5.3). A customer tick agreeing to sign electronically is good practice, not that condition. The acceptance wording is Northside's; without it the act refuses with a sentence. It works only in the browser that raised the quote until Milestone 6, and the screen says so. If there is no yes, build the print-and-sign blocks only and leave acceptance capture on docs/LATER.md with its reason.

THE RULES THAT CANNOT BEND: one set of nodes for screen and paper, so no PDF library and no second renderer; the document never reads the catalogue; nothing invented, so a missing letterhead fact, term, validity date, name or picture is left out and the dealer is told why, never filled, and no board or test shows a validity date nobody typed; no cost, margin or cost-derived level on the paper or on the note beside it, because the customer sits beside that screen; a picture only of the exact thing, never drawn wider than its held pixels; nothing charged reads Included; the price beside who it is for; the total at least as prominent as any other price and including GST; every figure on the paper sums, proven on the printed text of both example quotes.

THE HARD QUESTIONS: (1) how does a boat, motor and trailer quote look premium on A4 without a brochure's invented story? What do Saxdor's brochure, Porsche's configuration PDF, the MTA SA new-car contract and PandaDoc's sales quote each get right on paper? (2) the band holds a 1,024 px photograph and a 1,100 px render: how is each made to sell the boat without enlargement, and what does the caption say when the outboard in the photograph is not the one quoted? (3) the signature page: how do HubSpot's print-and-sign, PandaDoc's sales quote and the MTA contract make acceptance clear without the app writing terms? (4) the note beside the sheet carries codes and workshop facts while the customer watches: how does it stay useful to the dealer and quiet to the customer? (5) page 1 at a phone's fit-width: which four facts read without zooming? (6) where does a salesperson add a trade-in and a discount so that the paper says why each is there? (7) how short can the written pages be and still feel premium, given the owner's "I don't like the walls of text" and "simple wins"?

REFERENCES TO DRIVE: first, OPEN the frames market.md captured and did not open (docs/research/refs/proposal/market/proposify-quote-templates.png, hubspot-quote-template-kb.png, oneflow-contract.png) and re-read the opened ones (pandadoc-sales-quote-template, qwilr-quote-template, betterproposals-quote-templates, servicem8-proposals, tradify-quote-template); the MTA SA sample contract PDF (market.md section 4.1); Porsche's configuration PDF in the stock, including its Select PDF content modal; Saxdor's brochure frames under docs/research/refs/document/live/. Then capture: two boat builders' own spec-sheet or brochure PDFs (Riviera, Nimbus, Axopar or Sea Ray); one car maker's configuration PDF other than Porsche (BMW, Volvo or Polestar); DocuSign's and Adobe Acrobat Sign's in-person signing documentation; and Stripe's invoice PDF. Never only Porsche.

DIRECTIONS: three, drawn on the golden Stacer 529 Assault Pro (Tournament) at $51,563 and on the Highfield SP560 (HYP) LG-W-WB Mark McWilliams field-tested, at $73,594 as HL_2.0 prices it today. Each is a different composition of the same pages, and each keeps the total beside the customer's name on page 1. Where the customer's name belongs, draw the instruction the handover shows, never an invented name; where the validity date belongs, draw its placeholder. Draw each at A4 and at a phone's fit-width, and draw the note beside the sheet.`,
},
```

The `owns` string contains no apostrophe, so it keeps its single quotes. The `brief` is a template literal whose only special characters are the route patterns and dollar amounts, none of them a dollar-brace, so it pastes as it stands.

**5.3 The Build phase (code).** Replace the Build phase's single `parallel(...)` so that the proposal builds alone and first:

```js
phase('Build')
const OWNS = (s) =>
  s.owns ||
  `src/screens/${s.key}/**, src/routes/${s.key}*.tsx, e2e/flows/${s.key}.spec.ts, your row in e2e/routes.ts, your door in the shell's one list of doors, and src/domain only for a missing pure derivation with its test`
// BUILD_PROMPT is the existing inline build template, moved into (s, si) => `…` unchanged,
// except that its "Ownership: …" sentence becomes: Ownership: ${OWNS(s)}.
const buildOne = (s, si) =>
  agent(BUILD_PROMPT(s, si), { label: 'build:' + s.key, phase: 'Build', schema: REPORT })
// THE PROPOSAL FIRST AND ALONE: templates author into its pages and preview through its component.
const firstBuild = await buildOne(SCREENS[0], 0)
const restBuilds = await parallel(SCREENS.slice(1).map((s, i) => () => buildOne(s, i + 1)))
const builds = [firstBuild, ...restBuilds]
```

**Three smaller edits in the same file:**
- In the first critic's prompt, "Judge the three new screens" becomes "Judge the proposal and the three new screens", and its screenshot path becomes `docs/directions/{document,templates,map,pipeline}/built/`.
- The fixer `ports` map gains `proposal: 5441`.
- Its blocker list gains the items in §5.8.

**5.4 The templates brief.** Make four changes.

First, **replace** the paragraph that begins "THE FOUR-LAYER OVERRIDE CASCADE" with:

```text
THE OVERRIDE CASCADE, which is the heart of this screen: per-quote → brand → organisation, short-circuited by an admin lock, and BELOW THE ORGANISATION THERE IS NOTHING. The plan called it four layers; the original's own code had three for block text (the per-quote layer skipped when locked), organisation-only styles, no brand layer for sub-headers, and a hard-coded fourth layer for terms only, which printed four terms nobody at Northside wrote (HelmLogic src/lib/content-blocks.ts:59-65, 248-312, 326-390; src/components/proposal-pdf.tsx:374-427; docs/research/proposal/analysis.md section 2). Here an empty cascade leaves the section off the paper and the composer says why. The brand layer keys on the places Milestone 4 built; src/domain/model/project.ts says no brand layer exists yet, so it is yours to add in src/domain with its test. The owner handed "how the brand reads on a customer's quote" to the people who know each brand (HelmLogic tasks/EMAIL_release_update.html:23): that is a person editing a layer, not a new role or permission. A dealer authors terms once, locks them, and every issued document prints them; a salesperson personalises one quote's cover letter and the locked terms stay untouched. Draw the cascade so a person can SEE which layer a block is coming from and what would happen if they edited it here.
```

Second, **replace** "Customer tokens substitute at render." with:

```text
Tokens resolve AT ISSUE and are frozen with the prose; a token with no value prints nothing, and the composer says which. There is no customer first-name token: the quote holds one name field as typed (src/domain/model/people.ts:22-25), and the original's split printed "Dear SP560," (docs/research/proposal/quote-spec.md section 7).
```

Third, **replace** "a document type (quote or contract)" with:

```text
the quote it belongs to (contracts are on docs/LATER.md:6, so a contract flag would be a control nothing reads)
```

Fourth, **append**:

```text
WHAT THE PROPOSAL TRACK, BUILT BEFORE YOU, CHANGES HERE. (1) The slots you author are the proposal's pages: read src/screens/document/ as that track left it, and docs/research/proposal/quote-spec.md sections 7 and 7a for the order and the per-quote choice. (2) THE PREVIEW IS A REAL QUOTE, through the same resolver as issue. The original's preview used the same component on an invented customer, James Thompson, with invented prices and different inputs from its PDF (HelmLogic src/lib/sample-quote-fixture.ts:213; src/components/content-blocks-pdf-preview.tsx), so an author saw a document no customer got. Where no quote exists, the preview says so and offers to start one. Never a fixture. (3) THE SALESPERSON'S NOTE is written per quote and frozen at issue; the original read it live from the salesperson's profile, so an edited letter or a departed salesperson changed every past quote (HelmLogic src/lib/render-quote-pdf.ts:88-107). (4) THE ORDER NORTHSIDE SETS REACHES THE PAPER. Bill Hull's drag reordered the original's preview and never the customer's PDF (HelmLogic src/lib/render-quote-pdf.ts:204-213); prove yours on a printed PDF. (5) PROSE PAGINATES: store and draw written blocks as paragraph-sized pieces, because src/screens/document/paginate.ts packs one piece per block and a multi-page terms block would overflow its page. (6) SHORT: the owner said "I don't like the walls of text" and "simple wins"; show a block's length on the page as it is written, and make every written block optional per quote. (7) The email template (the subject and body for the proposal's Write the email helper) is a slot here too.
```

**5.5 The pipeline brief.** Append:

```text
THE LIFECYCLE THE APP ACTUALLY KNOWS is draft, given and replaced, plus accepted (an event naming a version) only if the proposal track built acceptance at the desk. A static site cannot know that a customer opened a quote, so there is no viewed stage, and a stage the dealer names is a fact the dealer sets, never inferred.
```

**5.6 The build prompt's shared exit criterion.** Append:

```text
And the golden Stacer 529 Assault Pro (Tournament) and the Highfield SP560 (HYP) LG-W-WB, issued after Northside's settings are filled, each print a PDF that passes every item of docs/research/proposal/quote-spec.md section 13 that the owner's recorded answers allow.
```

**5.7 The verify walk.** Insert at the start of its step 2:

```text
Before /templates: issue the Stacer 529 Assault Pro (Tournament) and the Highfield SP560 (HYP) LG-W-WB, print each to PDF (docs/directions/document/built/529.pdf and sp560.pdf), open both with the Read tool, and mark every item of docs/research/proposal/quote-spec.md section 13 pass or fail with its page.
```

**5.8 Both critics' blocker lists.** Append:

```text
a customer's paper carrying the navigation, a code, a workshop fact, the app's own vocabulary, a cost-derived level, a charged item reading Included, or an invented term, validity date, name or picture; a template preview that runs on a fixture; a letterhead or prose that changes on an issued quote; a printed PDF whose figures do not add up.
```

**5.9 The re-read agent.** Append:

```text
(7) Apply the documentation corrections in docs/research/proposal/briefs.md section 9 to docs/LATER.md, docs/PLAN.md and .claude/workflows/README.md, each as it reads on this tree.
```

## 6. hl2-beauty.js

**6.1 STATE.** Append:

```text
THE QUOTE IS THE SHOWPIECE THE OWNER ASKED FOR: "get a quote out properly where it looks the part" and "the output can be sent to a customer after downloaded … and be so beautiful" (2026-09-23). docs/research/proposal/quote-spec.md is the standard for the paper, and its section 13 is a checklist.
```

**6.2 LENSES.** Add a ninth lens. Concurrency stays at two. The judge prompt's "one of eight independent judges", the editor's "eight reports" and the meta description's "eight" become nine.

```js
{
  key: 'paper',
  title: "The customer's paper",
  brief: `YOUR LENS: THE CUSTOMER'S PAPER. The PDFs are in docs/directions/beauty/paper/: the golden Stacer 529 Assault Pro (Tournament) and the Highfield SP560 (HYP) LG-W-WB. Open every page with the Read tool as the buyer who received it by email, and mark every item of docs/research/proposal/quote-spec.md section 13 pass or fail with its page. Then judge what the checklist cannot: does page 1 look, in three seconds, like it came from a premium dealership; is the picture selling or decorating; the hierarchy of the money; the white space (Porsche leaves the lower third of its cover empty and Saxdor two-thirds of a page white); the rhythm of the configuration pages; anything that reads as the app talking to itself; page 1 at about half scale, as a phone shows it at fit-width; and whether you would forward it to your partner. Compare against docs/research/refs/document/live/ (Saxdor, Stripe) and docs/research/refs/proposal/market/ (PandaDoc's sales quote, Qwilr, Better Proposals). Each fix names the part of src/screens/document/ it changes.`,
},
```

**6.3 The Shots agent.** Append as step 6:

```text
6. PRINT THE PROPOSAL. Walk e2e/mint.ts's walk for the golden Stacer 529 Assault Pro (Tournament) and for the Highfield SP560 (HYP) LG-W-WB, issue each, and save each as an A4 PDF with page.pdf to docs/directions/beauty/paper/529.pdf and sp560.pdf; name both in index.md.
```

**6.4 The delight lens.** In "what a print looks like", add:

```text
(the paper lens judges the PDF itself; you judge the moment of printing and saving)
```

**6.5 The close agent's REVIEW.md list.** Append:

```text
a section "Your quote, on paper" linking the two PDFs, and the open questions from docs/research/proposal/analysis.md section 7, each with the default it was built on
```

## 7. hl2-host.js and hl2-acceptance.js

**7.1 hl2-host.js, PROVE step 3.** Append after the PDF is saved:

```text
Open the saved PDF with the Read tool and mark docs/research/proposal/quote-spec.md section 13 items 1, 2, 21 and 22 pass or fail: the dealership's name is on page 1; none of the shell's words (Home, Customers, Find, Ctrl) appear on any page; the text extracts whole words; the file name the browser proposed is the quote's, not HelmLogic.pdf.
```

**7.2 hl2-host.js, the HOSTING.md list (Prepare, step 6).** Append:

```text
that a link to a quote opens as No quote is filed at this address on anyone else's browser, so reviewers build a real SP560 themselves and type their own name, or are sent a PDF the owner made; and that a quote accepted on a tablet must have been built on that tablet until Milestone 6
```

**7.3 hl2-acceptance.js, the customer lens.** Replace "Compare it with docs/research/proposal/quote-spec.md if it exists — the spec for a quote that looks the part." with:

```text
Mark every item of docs/research/proposal/quote-spec.md section 13 pass or fail for each PDF, with its page; a fail on items 1 to 13 is a blocker.
```

## 8. .claude/workflows/README.md

- **The hl2-m5.js row:** replace "document templates with the four-layer override cascade" with "the proposal (the document upgraded to docs/research/proposal/quote-spec.md, built first and alone), then document templates with a per-quote → brand → organisation cascade whose bottom layer is empty".
- **THE ORDER line:** after "hl2-northside", add "(ending with Phase 0 of the proposal, the Paper step)". If that step lands in hl2-imagery instead, put the note there.

## 9. docs/LATER.md and docs/PLAN.md: the corrections

These are applied by Milestone 5's re-read (§5.9). They are factual corrections and could be applied now.

**docs/LATER.md**
- **Replace** line 11, the line beginning "Acceptance capture, quote validity/expiry, convert quote → contract", with:

  > **Convert quote → contract, variations / change orders** (the original: a one-line snapshot; three ways broken). Quote validity moved to Milestone 5's proposal track on 2026-09-23: a valid-until date typed once in /manage and frozen at issue, and the dealer's own expired notice. Acceptance capture moves only if the owner says yes to acceptance at the desk; remote acceptance stays here.

- **Replace** line 12 with:

  > **Public accept-and-sign page** with a one-time token, served from the shared backend (Milestone 6). The original's page accepted change orders, not quotes, and nothing could reach it: its tokens came from Math.random (HelmLogic src/lib/catalog/quote-variation.ts:115), it signed the visitor in anonymously, and any anonymous visitor could read every dealer's change orders (HelmLogic firestore.rules:223-232). Not "well built".

- **Add to line 13** (email sending): "SendGrid is the owner's chosen provider (HelmLogic tasks/EMAIL_where_to_from_here.md:25). The proposal's Write the email helper opens the dealer's own mail program; nothing is sent by the app."
- **Add:**
  - **View tracking and reminders.** Knowing a customer opened a quote needs a hosted page the customer opens (Milestone 6); a static site cannot know it.
  - **Customer-chosen options on a hosted proposal.** ServiceM8's shape: each option a frozen version, and the pick an event naming it. Needs Milestone 6. Until then, alternatives are separate versions shown side by side.
  - **Payment and deposit collection inside the quote.** Needs a server and a payment provider. ACL s36 bars taking payment for goods the dealer knows it cannot supply in the time stated (`docs/research/refs/proposal/market.md` §4.2).
  - **Standard inclusions and factory options on the quote.** They wait on Northside's Boat Module and Factory Options Module workbooks, which are not on this machine (`docs/research/proposal/analysis.md` §4).
  - **A free-form page builder.** Not planned. The owner's March 2026 builder was abandoned the same day (HelmLogic commits 9174a1b to 25fce4f), and "simple wins" (2026-09-23). The bounded customisation in `docs/CUSTOMISATION.md` is the plan unless the owner says otherwise (its open question, line 66).

**docs/PLAN.md**
- **Line 239:** replace "the **four-layer cascade** (per-quote → brand → org → default, short-circuited by the admin lock)" with "the cascade (per-quote → brand → organisation, short-circuited by the admin lock, with nothing below the organisation; the original had three layers for block text plus a hard-coded terms fallback, `docs/research/proposal/analysis.md` §2)".
- **Line 252:** replace "the **four-layer override cascade** (per-quote → brand → org → default)" with "the override cascade (per-quote → brand → organisation, nothing below)".
- **Line 300:** replace "public accept-and-sign page with a one-time token (well built, unreachable, and it signs the customer in anonymously)" with "public accept-and-sign page with a one-time token (the original's accepted change orders, not quotes; Math.random tokens; anonymous read of every dealer's variations; unreachable)".
