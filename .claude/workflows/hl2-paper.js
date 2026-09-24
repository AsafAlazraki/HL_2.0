export const meta = {
  name: 'hl2-paper',
  description:
    'Phase 0 of the proposal, the Paper step: nothing of the app prints on a Northside Marine quote and the print test reads the PDF, then the printed quotes are read as the customer would and anything still wrong is fixed',
  phases: [
    {
      title: 'Paper',
      detail:
        'Phase 0 of the proposal: nothing of the app prints on a quote, and the print test reads the PDF',
    },
    {
      title: 'Read',
      detail:
        'the printed Stacer 529 Assault Pro (Tournament) and Highfield SP560 quotes read page by page as the customer would, every Phase 0 item checked on the paper, and anything still wrong fixed',
    },
  ],
}

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

(9) TWO THINGS THE LAST CRITIC OF MILESTONE 2 LEFT OPEN (docs/directions/m2-last-critique-2.md): THE SURTEES 770 GAME FISHER XL is named \"Surtees Surtess 770 Game Fisher XL\" — the maker twice, once as the file misspells it — as the headline of its customer's paper, the register row and History, and src/domain/quote/spoken.test.ts pins that as correct. Fix it in src/domain/quote/spoken.ts: a leading maker the file misspells is still the maker, recorded as a correction with its evidence in data/northside/names.json, and the test that pinned the defect is corrected to pin the right name, with a dated line in docs/DECISIONS.md saying so. AND THE PAPER'S PHOTOGRAPH IS CROPPED INTO THE BOAT: the ADV7's T-top and antenna are cut by a cover fit, and the note beside the paper misstates the printed size. A boat's photograph on the customer's paper shows the WHOLE boat — fit it, never cover-crop it, never enlarge it past its held size — and the note states the size actually printed. Also: Jeanneau's Draft prints bare (\"Draft 0.45\") on the paper; give it the unit the maker states, or leave it off the customer's paper if no source states one. Nothing here invents a word or a figure. src/domain/quote/golden.test.ts stays untouched.

OWNERSHIP: src/screens/shell/shell.css (the print rule only), src/screens/document/**, src/routes/quote.$id_.document.tsx, src/domain/quote/document.ts, a new pure title derivation beside colourway.ts with its test, e2e/flows/document.spec.ts, and package.json only to add the named extractor as a dev dependency. Ports: Playwright 5851, vite 5852.

GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run; npx tsx tools/check.ts; npm run build; HL2_PREVIEW_PORT=5851 npx playwright test e2e/flows/document.spec.ts e2e/flows/shell.spec.ts --workers 1. Then print one PDF of the golden Stacer 529 Assault Pro (Tournament) to docs/directions/document/built/529-phase0.pdf, open it with the Read tool, and say what page 1 shows. Append a dated one-liner to docs/DECISIONS.md naming what lost. Do NOT commit, push, checkout, reset or stash.`

phase('Paper')
const paper = await agent(PAPER, { label: 'paper', phase: 'Paper', schema: PAPER_REPORT })
log(
  'paper: ' +
    (paper ? paper.fixed.length + ' fixed, ' + paper.notFixed.length + ' not fixed' : 'none'),
)

const READ_REPORT = {
  type: 'object',
  properties: {
    pdfs: { type: 'array', items: { type: 'string' } },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          pass: { type: 'boolean' },
          page: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['item', 'pass', 'page', 'evidence'],
      },
    },
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    fixed: { type: 'array', items: { type: 'string' } },
    notFixed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['pdfs', 'items', 'files', 'gateGreen', 'fixed', 'notFixed', 'notes'],
}

phase('Read')
const read = await agent(
  `You are the customer a Northside Marine salesperson has just emailed a quote to, reading the PDF page by page; and then you are the person who makes it right. This is the second half of Phase 0 of the proposal (docs/research/proposal/analysis.md section 6; docs/research/proposal/quote-spec.md sections 0, 3, 5, 10 and 13). The repository is your working directory, and nothing else is running beside you.

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Nothing here is built for any other business.

THE PAPER STEP HAS JUST RUN. Its whole brief is quoted between the rules below, because its items (1) to (7) are your checklist, its OWNERSHIP is the only set of files you may change, and its GATE is the gate you re-run.
----------
${PAPER}
----------
ITS REPORT: ${JSON.stringify(paper)}

1. PRINT THE TWO QUOTES A CUSTOMER WOULD RECEIVE, from the tree as it is now. npm run build; then walk the built app the way e2e/door.ts and e2e/mint.ts already walk it, and print the way e2e/flows/document.spec.ts prints (read all three; do not write a second walk): through the door, the price file loaded, the quote raised on the picker, a name typed at the handover by a person at a keyboard (never a seeded record), issued, and the document printed with page.pdf as A4 with backgrounds on and zero margins. Print (a) the golden Stacer 529 Assault Pro (Tournament), the quote src/test/fixtures/golden/529-assault-pro.json pins, $51,563 at Cash; and (b) the Highfield SP560 (HYP) LG-W-WB with the file's starred motor and trailer, $73,594 at Cash (quote-spec.md section 1 works both line by line). Save them as docs/directions/document/built/529-phase0-read.pdf and docs/directions/document/built/sp560-phase0-read.pdf. Any script you write for this lives in your scratch folder, never under src/ or e2e/. Ports: vite preview 5852, and HL2_PREVIEW_PORT=5851 for Playwright, as the Paper step used.

2. READ THEM AS THE CUSTOMER, BEFORE YOU READ ANY SOURCE. Open every page of both PDFs with the Read tool (it renders PDF pages), as the buyer who received them by email. Say what page 1 of each shows, top to bottom. Then mark each of the Paper brief's items PASS or FAIL against what is actually printed, with the PDF, the page and the words you saw:
(1) no word of the app's shell (Home, Quotes, Customers, Data, History, Find, Ctrl K) on any page, and nothing of the finder;
(2) the print test reads the paper: e2e/flows/document.spec.ts extracts the printed PDF's text with the extractor it names and asserts the business name on page 1, the reference on every page and none of the words the brief lists, and checks under print emulation that nothing outside the sheet is visible. Prove it can fail, as CLAUDE.md asks of every guard: take the shell's print rule out, watch the test go red, put the rule back exactly as it was, and watch it go green;
(3) none of the How to read a line glossary, the tax paragraph, the reimport sentence, the offered and not-taken counts, an empty band, or the pairing facts (Slot, Engine Hole, Prop Part No., Prop Description, Rigging Kit Option) is on the paper; an unpriced line reads Not priced on this quote; the cover says One item is not priced on this quote and is not in this total wherever one is; and Included stands only beside an item the file includes at no charge;
(4) the rigging-kit sentence is true. It lives on the note beside the sheet, not on the paper, so serve the build (npx vite preview --port 5852) and read the note at 1440x900 with the browser tools: it says no price level is declared for the table and that declaring one is the dealer's act on the levels screen, never that the table carries no price column; and the note carries no cost or margin, because the customer sits beside it;
(5) no code column and no code on the customer's paper, except where a code is part of a product's public name, as the F90LB is in Yamaha F90LB; the codes are on the note;
(6) the title reads as a buyer would say it: 529 Assault Pro (Tournament) with its (Tournament) kept; the SP560 with HYP printed as Hypalon and its colourway decoded all or nothing as colourwayOf rules; and both come from a pure derivation in src/domain with its test;
(7) the saved file will be named for the quote: read document.title on the document route (the business, then quote, then the reference, then the model) and again after leaving the route (restored), and say what each was.
Also say whether "not been named", HelmLogic or any figure that does not add up appears anywhere on either PDF.

3. FIX WHAT FAILS, only in the files the Paper brief's OWNERSHIP names, and never src/domain/quote/golden.test.ts. A failing test is a bug to fix in the code, never an assertion to edit. Then run the Paper brief's GATE in full, print both PDFs again, and read them again; repeat until every item passes or you can say exactly why one cannot. Item (8), the two-trailer quote-starter, belongs to Milestone 3's fitment round: if you see it on the SP560, name it and leave it.

4. If you decided something, append a dated one-liner to docs/DECISIONS.md (cat >>) naming what lost. Do NOT commit, push, checkout, reset or stash.

REPORT: every item with PASS or FAIL, the page and the evidence, as it stands after your fixes; the PDFs; what you fixed; what you could not fix and why; and whether the gate is green.`,
  { label: 'read', phase: 'Read', schema: READ_REPORT },
)
log(
  'read: ' +
    (read
      ? read.items.filter((i) => i.pass).length +
        ' of ' +
        read.items.length +
        ' pass, ' +
        read.fixed.length +
        ' fixed'
      : 'none'),
)

return { paper, read }
