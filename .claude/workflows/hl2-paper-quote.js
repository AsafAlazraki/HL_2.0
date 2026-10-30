export const meta = {
  name: 'hl2-paper-quote',
  description:
    'The printed quote made perfect, the owner\u2019s first priority after the build page: a cover with the boat\u2019s own photograph, the full specification of the boat and of every line, sections the salesperson adds or removes, the price and terms right; beside it, the build page made right for a quote that is not a boat',
  phases: [
    { title: 'Build', detail: 'the paper, beside the build page for a motor, trailer or part' },
    {
      title: 'Verify',
      detail: 'the gate, the affected specs, and three printed PDFs read page by page',
    },
    {
      title: 'Critique',
      detail: 'the customer reading the PDF, to the perfect bar; fixes, pushed',
    },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/paper-quote'

const OWNER = `THE OWNER, 2026-10-30, word for word: "ensuring the process of quoting and building the quote is BEAUTIFUL and works well and not crap and every single thing on the page looks right and that the final print out is PERFECT w a cover page and things using boats photo and full spec of the quote and the boat and things on there and whatnot and ability to add/remove sections that appear there and things". Two days earlier: "the quote pdf is BORING and the original one from the original HL was better ... pdf quote needs to be insane with cover page and whatever and the settings and whatnot". And: "quotes are not just boats - also motors or trailers or even dealer fit things as well". His bar for everything: "if i take a screenshot, does it look PERFECT, and if not, why not, and fix it".`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms), splitting a long suite into several calls. Stop every dev or preview server you start before you report. Never rm -rf test-results or dist while another agent may be running: use your own --output=test-results-<port> and your own build output if you need one.

Repo (cwd): ${NEW}. HL_2.0 is Northside Marine's quoting app; CLAUDE.md is in your context and binds you: no invented data (a missing fact is left out and the dealer told why), cost and margin never on the paper, the document renders from frozen lines only, a refusal is a sentence, tokens not literals, pure derivations in src/domain with tests, one set of nodes for screen and paper (no PDF library, no second renderer). The weekly usage is nearly spent: no web sweeps and no drawn boards. THE SPEC IS docs/research/proposal/quote-spec.md (read it whole: every page, the section picker in 7a, the checklist in 13), with docs/research/proposal/analysis.md, docs/directions/flow/paper-handoff.md (what the click-by-click round found on the paper) and docs/directions/built-m4-2.md (Milestone 4's paper findings). The build page was just rebuilt (docs/directions/quote-page/): its finale is now "The summary", a full-screen page at the end of the build with print and send.

${OWNER}`

const HOUSE = `BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then only the Playwright specs you own, on your own port (HL2_PREVIEW_PORT=<port> npx playwright test <specs> --workers=2 --output=test-results-<port>). A spec whose assertion the owner's changes made untrue (for example a quote now starts with the boat alone, not with the file's picks on it) is rewritten to assert the new truth, and you name each. Then drive what you built at 1440x900 and 390x844, READ your screenshots and PDFs (save them under ${OUT}/), and fix what is not perfect. Do not commit. Report only figures you measured.`

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    done: { type: 'array', items: { type: 'string' } },
    notDone: { type: 'array', items: { type: 'string' } },
    measured: { type: 'string' },
  },
  required: ['files', 'done', 'notDone', 'measured'],
}
const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string', enum: ['paper', 'page'] },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['area', 'severity', 'what', 'evidence'],
      },
    },
    perfect: { type: 'array', items: { type: 'string' } },
  },
  required: ['gaps', 'perfect'],
}

const checkpoint = (what) =>
  agent(
    `In ${NEW}, take a checkpoint of work in progress and push it, because the owner watches the live site. Run git status --short; if nothing changed, say so and stop. Otherwise: remove any throwaway diagnostic spec (e2e/flows/zz-*.spec.ts), any FAULT-*.png and any test-results-* folder that git would add, then git add -A, then git commit with the message "Checkpoint: ${what}, mid-round; not gated" followed by a blank line and "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", then git push origin main. Report the commit hash and the number of files.`,
    { label: 'checkpoint', phase: 'Build', effort: 'low' },
  )

phase('Build')
const PAPER = `You are making THE PRINTED QUOTE perfect. You own src/screens/document/**, src/routes/quote.$id_.document.tsx, src/domain/quote/document.ts and its tests, the paper's parts of src/domain/quote/freeze.ts (what is frozen at issue, and the tax rate), e2e/flows/document.spec.ts and the document rows of the rulers. Do not edit src/screens/configurator/ (another builder is in it now); if the summary needs a new door into the paper, write it into ${OUT}/page-needs.md.

${STATE}

BUILD, each proven on a printed PDF (Chromium print to PDF of /quote/$id/document, read page by page as the customer would):
(1) THE COVER, quote-spec section 3: the boat's own held photograph, large and never enlarged past its pixels, Northside's mark and letterhead, the customer's name and the total on page 1, the quote's number and date, the validity only if someone set it; for a quote that is not a boat, the cover leads with what is sold (the motor, the trailer, the part) and its own picture where one is held.
(2) THE FULL SPECIFICATION of the boat (every spec the file holds, laid out as a designed table, not a dump) and of every quoted line (each motor, trailer, part and package with its picture where held, its name as a person says it, its own facts and its price), quote-spec section 5.
(3) SECTIONS THE SALESPERSON ADDS OR REMOVES, quote-spec 7a: before issue, on the document page, a designed panel of the optional sections (what comes with the boat, specifications, pictures beside lines, each written page) each on or off with a live preview; the cover, the boat, the price and the terms always in; the choice frozen with the issued quote so the issued PDF is one document.
(4) YOUR PRICE, section 8, and THE LAST PAGE, section 9, as the spec says; GST: Milestone 4 found that GST and terms set on Settings never reach a draft already open and no screen can add them, so a given paper says "No rate is set on this quote" (freeze.ts; setTaxRate exists but nothing calls it): make Northside's rate and terms reach every draft at the moment of giving, with the paper saying the rate.
(5) EVERY FINDING in docs/directions/flow/paper-handoff.md and Milestone 4's paper findings (a stray " ·" at line ends in the contact line, page 2 of a short quote mostly empty, series names in the file's shouting capitals): closed, each with its PDF evidence.
(6) The paper is beautiful: it is the one thing that leaves the building. Print three: a Highfield Sport 560 with a motor, trailer and dealer fit for a named customer; a Stacer with three parts; a motor-only repower. Run the checklist of quote-spec section 13 on each, pass or fail, into ${OUT}/checklist.md.

${HOUSE} Your port is 5811.`

const PAGE = `You are making THE BUILD PAGE right for a quote that is not a boat, and making the gate honest again. You own src/screens/configurator/**, its tests and specs (configurator, build-page, chandlery, cascade, levels, configurator-warns), and src/domain for pure derivations with tests.

${STATE}

READ docs/directions/quote-page/start-needs.md and critique.md, and the round's reports in docs/directions/quote-page/. DO: (1) A MOTOR-ONLY, TRAILER-ONLY AND PARTS-ONLY QUOTE reads as what it sells: its first chapter is that motor, trailer or part (never "01 The hull" offering boats), no "No other finish of this boat" and no "Nothing from Formosa is made for this boat" under every maker, the masthead, the specs, the total's segments and the summary all speaking of what is sold, and adding a boat to it, if the file allows, a clear choice rather than a default. Prove each kind at 1440x900 and 390x844. (2) THE CRITIC'S OPEN ITEMS on the build page still open in docs/directions/quote-page/critique.md after its fixers (check each against the tree before touching it): the summary one filled screen when given at a desk, nothing clipped; the floating total not covering controls below a desk; the step toast not covering the bar's Prepared by; the '/' hint hidden wherever there is no keyboard. (3) THE STALE SPECS: every e2e test in your specs that fails because it asserts what the owner changed (a quote starting with the file's picks on it, elements that no longer exist like .cfg-eyebrow, .cfg-money__lab, the window scrolling at a desk) is rewritten to assert the new truth; a test that fails because the app is wrong is fixed in the app. List each, before and after.

${HOUSE} Your port is 5821.`

const [paperBuild, pageBuild] = await parallel([
  () => agent(PAPER, { label: 'build:paper', phase: 'Build', schema: REPORT }),
  () => agent(PAGE, { label: 'build:page', phase: 'Build', schema: REPORT }),
])
await checkpoint(
  'the printed quote (cover, full specification, sections on or off) and the build page for a quote that is not a boat',
)

phase('Verify')
const verify = await agent(
  `You are verifying this round, and nothing else is running. ${STATE}

The builders reported: ${JSON.stringify([paperBuild, pageBuild]).slice(0, 9000)}. Read ${OUT}/page-needs.md if it exists and do what it asks of the build page's summary if it is small.

(1) The gate: npm test; npm run build; then the affected Playwright specs (document, configurator, build-page, chandlery, cascade, levels, configurator-warns, picker, quotes, shell, and the rulers filtered to those screens) on port 5841 with --output=test-results-5841, every project; re-run anything red alone with --workers 1 and fix it if it is the app. (2) Print three PDFs as a salesperson would, through the app's own print: a Highfield Sport 560 for a named customer with a motor, trailer and dealer fit, with one optional section turned off; a Stacer with three parts; a motor-only repower. READ every page as the customer would and save the PDFs and page images under ${OUT}/verify/. Mark each line of quote-spec section 13 PASS or FAIL per PDF, and each of the owner's words (cover with the boat's photo, full spec of the quote and the boat, sections added or removed) DONE or NOT DONE with the page that proves it. Fix what is small. Do not commit.`,
  { label: 'verify', phase: 'Verify', schema: REPORT },
)

phase('Critique')
const critic = await agent(
  `You are two people at once, read-only except ${OUT}/critique.md: a customer of Northside Marine who has just been handed this quote, and a designer who judges every page against the owner's bar. ${STATE}

The verifier reported: ${JSON.stringify(verify).slice(0, 5000)}

Read the PDFs under ${OUT}/verify/ page by page, then serve the app (npm run build && npx vite preview --port 5851) and make one more of each kind yourself, turning sections on and off. For every page say PERFECT or NOT AND WHY (the exact element, measured): would a customer keep this? Is anything cut, crowded, empty, repeated, in the file's words instead of a person's, soft, or misaligned? Also judge the build page for a motor-only quote at 1440x900 and 390x844. List gaps by area ('paper' is the document and its section panel, 'page' is the build page) and severity, and write them to ${OUT}/critique.md.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const gaps = (critic && critic.gaps) || []
log(
  `critic: ${gaps.length} gaps (${gaps.filter((g) => g.severity !== 'minor').length} blocker or major)`,
)
if (gaps.length) {
  await parallel(
    ['paper', 'page'].map((area) => () => {
      const mine = gaps.filter((g) => g.area === area)
      if (!mine.length) return null
      return agent(
        `You are fixing the critic's findings on ${area === 'paper' ? 'the printed quote and its section panel (src/screens/document/**, document.ts, freeze.ts)' : 'the build page (src/screens/configurator/**)'} and nothing else. ${STATE}

THE FINDINGS, every one to be closed, minors included, because the bar is perfect: ${JSON.stringify(mine).slice(0, 9000)}

${HOUSE} Your port is ${area === 'paper' ? 5861 : 5871}.`,
        { label: 'fix:' + area, phase: 'Critique', schema: REPORT },
      )
    }),
  )
}
await checkpoint("the critic's findings on the printed quote and the build page fixed")

return { paperBuild, pageBuild, verify, critic }
