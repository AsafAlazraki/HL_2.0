export const meta = {
  name: 'hl2-quote-3',
  description:
    'The owner\u2019s quote asks of 2026-10-31: every disclosure open, air under the photograph, galleries with a cover per boat and product, the hull showing the chosen model only, every earlier ask audited live, the paper\u2019s cover drawn and built with Northside\u2019s contact and no wasted sheets; then a fully specced PDF for the owner',
  phases: [
    {
      title: 'Build',
      detail:
        'the page and the galleries side by side, then the galleries wired into the page and the paper',
    },
    {
      title: 'Audit',
      detail: 'every ask of the last three days, live or not, and the perfect bar at six sizes',
    },
    { title: 'Fix', detail: 'the gaps, pushed' },
    { title: 'PDF', detail: 'one fully specced quote, printed and read' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/quote-3'
const SIZES = '390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080'

const OWNER = `THE OWNER, 2026-10-31, word for word: "all dropdowns on the quote expanded by default please and also between the image and specs thing below it more padding please. also per boat and product the ability to have more than one image and cover image and whatnot. some of the things i asked about i am not seeing. also on the quote, for hull, i pick my model - why can i still see other models like pa 460 if i am on a pa600 quote, don't need that much". And: "keen to see the final pdf result of something nice fully specced". Earlier the same days (the OWNER blocks of .claude/workflows/hl2-quote-page.js, hl2-paper-quote.js and hl2-polish.js hold them word for word): only the chapters scroll at a desk; the masthead and the customer in the top bar with a hairline between the maker's mark and the boat; a bigger photograph without captions; specs that open, designed; products in a popup; nothing blurry; better clicks and animations; Find at the top left of the bar; the boat chosen inside the hull chapter in real time; every chapter open; the hull easy; the line items perfect; padding; "View final package" with a preparing moment, the boat, the lines and the real PDF preview, and Back to editing; the floating bar wider with its mark clean; Home without the price-list stamp; New quote for a motor, a trailer or parts on their own; the printed quote "PERFECT w a cover page ... using boats photo and full spec of the quote and the boat ... and ability to add/remove sections". His bar: "if i take a screenshot, does it look PERFECT, and if not, why not, and fix it ... even down to scroll and how things expand and collapse", and "ensuring responsiveness on every single size".`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms). Stop every server you start before you report. A Playwright run on your own port (HL2_PREVIEW_PORT=<port>) now builds into its own e2e/out/dist-<port>, so never rebuild or delete dist/ or another agent's folders; use --output=test-results-<port>.

Repo (cwd): ${NEW}; CLAUDE.md is in your context and binds you: no invented data (a picture belongs only to the exact model it depicts, with provenance in the ledger; a missing fact is left out and the dealer told why), cost never on a customer surface, a refusal is a sentence, tokens not literals, pure derivations in src/domain with tests, reduced motion and keyboard reach kept. The last rounds' reports: docs/directions/quote-page/, docs/directions/paper-quote/, docs/directions/polish/ (its critique.md is the latest word on the build page). EVERY SIZE: prove what you build at ${SIZES}, reading a screenshot at each.

${OWNER}`

const HOUSE = (port) =>
  `BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; your specs and the rulers for your screens on every project (HL2_PREVIEW_PORT=${port} npx playwright test <specs> --output=test-results-${port}). A test asserting what the owner changed is rewritten to the new truth, and you name each. Screenshots under ${OUT}/. Do not commit. Report only figures you measured.`

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    done: { type: 'array', items: { type: 'string' } },
    notDone: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'done', 'notDone'],
}
const AUDIT = {
  type: 'object',
  properties: {
    asks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ask: { type: 'string' },
          state: { type: 'string', enum: ['done', 'partly', 'not'] },
          evidence: { type: 'string' },
        },
        required: ['ask', 'state', 'evidence'],
      },
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          group: { type: 'string', enum: ['page', 'paper', 'start', 'shell'] },
          size: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['group', 'size', 'severity', 'what', 'evidence'],
      },
    },
  },
  required: ['asks', 'gaps'],
}

const checkpoint = (what, phaseName) =>
  agent(
    `In ${NEW}, take a checkpoint and push it, because the owner watches the live site. Run git status --short; if nothing changed, say so and stop. Otherwise remove any e2e/flows/zz-*.spec.ts and FAULT-*.png that git would add, then git add -A, git commit -m "Checkpoint: ${what}, mid-round; not gated" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", and git push origin main. Report the hash and the number of files.`,
    { label: 'checkpoint', phase: phaseName, effort: 'low' },
  )

phase('Build')
const [page, gallery] = await parallel([
  () =>
    agent(
      `You own src/screens/configurator/** and its specs, and src/domain for pure derivations with tests. ${STATE}

DO: (1) EVERY DISCLOSURE ON THE BUILD PAGE IS OPEN BY DEFAULT: every chapter, the specs' full list, any "more" inside a chapter, any group; a person can still fold one and it is remembered as today. (2) MORE AIR between the photograph and the specs under it, from the tokens, measured at each size. (3) THE HULL SHOWS THE CHOSEN MODEL: on a PA 600 quote, the hull chapter shows that model's own choices only (its versions, materials, colourways), not cards for the PA 460 and every other model; changing model is one quiet "Change model" press that opens the series' models in the popup the chapters already use. Prove it on a Stabicraft PA 600, a Highfield Sport 560 and a Stacer. (4) Read docs/directions/polish/critique.md and close every finding there that is on the build page and still true on this tree, checking each before touching it.

${HOUSE(6111)}`,
      { label: 'build:page', phase: 'Build', schema: REPORT },
    ),
  () =>
    agent(
      `You are building GALLERIES: per boat model and per product (a motor, trailer, part, package, colour), more than one picture, one of them the cover. You own src/data/pictures.ts and the picture ledger's model and commands (src/domain/model/pictures.ts, ownPictures, the commands and events that add a picture), src/ui/AddPicture*, src/ui/Lightbox*, the places a dealer manages pictures outside the build (the sheet's row, Fitment, a place's range, the catalogue), and their tests. Do NOT edit src/screens/configurator/ or src/screens/document/; write what they need to show the cover and the gallery into ${OUT}/gallery-needs.md, with the exact functions to call.

${STATE}

DO: (1) The model: every picture the ledger holds for an exact model or product, held and dealer-added alike, is one ordered gallery for that row; one is the COVER (the held photograph by default, the dealer may choose another); each keeps its own provenance ("added by <name>, <date>", or its source). A pure reader: coverOf(row) and galleryOf(row). (2) A dealer adds several pictures to one row, reorders them, sets the cover and removes his own, each a command with an inverse and an event, carried in the backup. (3) The lightbox shows the whole gallery of the row it opened on, with arrows, swipe and a count, the cover first. (4) The surfaces you own show the cover and offer the gallery. Prove each at the six sizes.

${HOUSE(6121)}`,
      { label: 'build:gallery', phase: 'Build', schema: REPORT },
    ),
])
await checkpoint(
  'every disclosure open, air under the photograph, the hull showing its own model, and galleries with a cover',
  'Build',
)

const [wire, paper] = await parallel([
  () =>
    agent(
      `You own src/screens/configurator/** and its specs. ${STATE}

THE GALLERY BUILDER reported: ${JSON.stringify(gallery).slice(0, 4000)}. Read ${OUT}/gallery-needs.md. WIRE THE GALLERIES INTO THE BUILD PAGE: the stage shows the chosen row's cover and opens its gallery; every tile and line shows its row's cover and opens its gallery; the final package shows covers. A dealer can add a picture to an option from the build where it is natural (AddPicture), and set the cover. Prove it at the six sizes.

${HOUSE(6131)}`,
      { label: 'build:wire', phase: 'Build', schema: REPORT },
    ),
  async () => {
    const boards = await agent(
      `You are drawing THE COVER of Northside Marine's printed quote, three ways, and not building. ${STATE}

Read docs/research/proposal/quote-spec.md (section 3 is the cover), docs/directions/paper-quote/critique.md (its verdict: "a letterhead with a framed picture, not the 'insane' cover the owner asked for": the picture is 37% of the page) and docs/research/refs/document/notes.md. Look at the PDFs in docs/directions/paper-quote/. The owner: "the quote pdf is BORING ... pdf quote needs to be insane with cover page". DRAW three A4 covers as static HTML at 794x1123 on the real Highfield Sport 560 photograph and the real Stacer, with the customer's name and the total where the spec keeps them: each a different composition (one where the boat photograph owns the page; one editorial, like a car maker's configuration book; one with Northside's own water and mark). The picture is never enlarged past its pixels; say how each handles a 1,024px photograph. Save under ${OUT}/cover-boards/ with a PNG of each, and say what each does that the others do not.`,
      { label: 'cover:boards', phase: 'Build', schema: REPORT },
    )
    return agent(
      `You own src/screens/document/**, src/domain/quote/document.ts and freeze.ts's paper parts, and their specs. ${STATE}

THREE COVERS WERE DRAWN: ${JSON.stringify(boards).slice(0, 3000)}. Open their PNGs. PICK the one the owner would call insane, judged as the owner (who rejects anything boring on sight), a customer, and a designer; write the pick and why into ${OUT}/cover-pick.md. Then BUILD it as the printed quote's cover. ALSO: (1) the cover and each line on the paper use the row's cover picture (read ${OUT}/gallery-needs.md and the gallery builder's report: ${JSON.stringify(gallery).slice(0, 2000)}); (2) Northside's contact details (address, phone, email, ABN, the salesperson's line) print where the spec puts them, from Settings, and where one is not set the paper leaves it out and the desk note beside the paper says which; (3) a short quote does not waste sheets: a one-motor quote fits the fewest pages the spec allows, the price said once where it belongs; (4) every other open item of docs/directions/paper-quote/critique.md still true on this tree. Print the Highfield, the Stacer and a motor-only quote to PDF and read every page.

${HOUSE(6141)}`,
      { label: 'build:paper', phase: 'Build', schema: REPORT },
    )
  },
])
await checkpoint(
  'galleries on the build page, and the printed quote\u2019s new cover, contact and pages',
  'Build',
)

phase('Audit')
const audit = await agent(
  `You are auditing, read-only except ${OUT}/audit.md. ${STATE}

The builders reported: ${JSON.stringify([page, gallery, wire, paper]).slice(0, 8000)}

Serve the build (npx vite build --outDir e2e/out/dist-6151 && npx vite preview --outDir e2e/out/dist-6151 --port 6151). (1) EVERY ASK of the owner in the words above, one row each: done, partly or not, with the screenshot that proves it. (2) THE PERFECT BAR at each of the six sizes over the quote flow: New quote (a boat, a motor, parts), the build page for a Stabicraft PA 600 and a Highfield Sport 560 (every chapter, the hull, Change model, a gallery, the popups, the customer, View final package and back), the quotes page, Home and the floating bar, and the printed quote's three PDFs. For every frame, PERFECT or NOT AND WHY (the element, measured). Group gaps: page (configurator), paper (document), start (picker, quotes, Home), shell (the floating bar).`,
  { label: 'audit', phase: 'Audit', schema: AUDIT },
)

phase('Fix')
const gaps = (audit && audit.gaps) || []
log(
  `audit: ${audit && audit.asks ? audit.asks.filter((a) => a.state !== 'done').length : 0} asks not done, ${gaps.length} gaps`,
)
const OWNS = {
  page: ['src/screens/configurator/** and its specs', 6161],
  paper: ['src/screens/document/**, document.ts and its specs', 6171],
  start: [
    'src/screens/picker/**, src/screens/quotes/**, src/screens/home/** and their specs',
    6181,
  ],
  shell: ['src/screens/shell/** and its specs', 6191],
}
await parallel(
  Object.entries(OWNS).map(([group, [owns, port]]) => () => {
    const mine = gaps.filter((g) => g.group === group)
    const asks = ((audit && audit.asks) || []).filter((a) => a.state !== 'done')
    if (!mine.length) return null
    return agent(
      `You own ${owns}, and you touch nothing else. ${STATE}

THE AUDIT'S GAPS IN YOUR AREA, every one to close, minors included: ${JSON.stringify(mine).slice(0, 8000)}
THE OWNER'S ASKS NOT YET DONE (close the ones in your area): ${JSON.stringify(asks).slice(0, 3000)}

${HOUSE(port)}`,
      { label: 'fix:' + group, phase: 'Fix', schema: REPORT },
    )
  }),
)
await checkpoint('the audit\u2019s gaps closed', 'Fix')

phase('PDF')
const pdf = await agent(
  `You are making the owner a fully specced quote to look at. ${STATE}

Serve the build (npx vite build --outDir e2e/out/dist-6199 && npx vite preview --outDir e2e/out/dist-6199 --port 6199). Through the app, as a salesperson would, build the richest honest quote the file allows: a Highfield or Stacer boat in a chosen colourway, a motor the file pairs with it, a trailer made for it, dealer fit and three or more parts, every optional section on. Name the customer "Asaf Alazraki" (the owner, who asked to see it). Give it, open the document, and print it to PDF through the app's own print (Chromium print to PDF of /quote/$id/document). Save it as ${OUT}/final/northside-quote.pdf, with a PNG of every page beside it. READ every page as the customer would. Report the path, the page count, what is on each page, and anything not perfect, without fixing it.`,
  { label: 'pdf', phase: 'PDF', schema: REPORT },
)

return { page, gallery, wire, paper, audit, pdf }
