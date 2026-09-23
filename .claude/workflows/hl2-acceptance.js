export const meta = {
  name: 'hl2-acceptance',
  description:
    'The last gate before stakeholders: four hunters (a salesperson with a customer at the desk, the customer reading the PDF, the admin configuring the backend, a stakeholder over every screen) find every UI and UX error, fixers close them, and it loops until two rounds come back dry — then the live site is redeployed and walked',
  phases: [
    { title: 'Hunt', detail: 'four lenses over the whole app, on the exact build that is hosted' },
    { title: 'Fix', detail: 'every new blocker and major, per screen, two at a time' },
    { title: 'Ship', detail: 'the gate alone, the deploy, the live walk, and the review guide' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'
const SITE = 'https://asafalazraki.github.io/HL_2.0/'

const HUNT = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    verdict: { type: 'string' },
    defects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          viewport: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          title: { type: 'string' },
          detail: { type: 'string' },
          reproduce: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['screen', 'severity', 'title', 'detail', 'reproduce', 'fix'],
      },
    },
  },
  required: ['lens', 'verdict', 'defects'],
}

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    fixed: { type: 'array', items: { type: 'string' } },
    notFixed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'fixed', 'notFixed', 'notes'],
}

const GOAL = `THE END GOAL, in the owner's own words (2026-09-23): "when you are done, i need to be able to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enough experience to do so sitting with a customer and it is beautiful and so configurable in the backend and the output can be sent to a customer after downloaded and things and be so beautiful". Five things define done: stakeholder-ready from a link; NO UI and UX errors — not few, none; a full quote good enough to drive live beside a buyer; configurable in the backend without a developer; and a downloaded quote a dealer would proudly send.

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Build nothing for a hypothetical second dealership, a second organisation or a business with no price file. When two designs both work, the simpler one wins. Every screen's job is to take a complex topic — a price file of 15,691 rows, 8,679 pairings, a ladder of price levels, a rule that excludes a motor — and make it clear and beautiful, never to show how complex it is.`

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is a quoting and configuration app for Northside Marine, a Brisbane boat dealership, on its real Master Price File (53 tables, 15,691 rows; nothing invented — an empty state is the true state). It is built and hosted at ${SITE}. Read docs/REVIEW.md, docs/STATUS.md (top sections), docs/SCREENS.md and CLAUDE.md (in your context) first.

${GOAL}

THE BUILD YOU TEST IS THE HOSTED ONE, served locally so rounds are fast: HL2_BASE=/HL_2.0/ npm run build, then npx vite preview --port <your port> — the app is then at http://localhost:<your port>/HL_2.0/. Start from a cold browser (a fresh tab, nothing stored for this origin). A defect you find must reproduce there.

WHAT A DEFECT IS. Anything a stakeholder, a salesperson or a customer would notice as wrong, broken, confusing, ugly or unfinished: a control that does nothing or does the wrong thing; a sentence that is false, clumsy, or the app talking to itself; a figure that disagrees with another figure; overlap, clipping, misalignment, a cut word, text too faint, something too small to press; a layout that breaks at a size; a picture that is missing, wrong, stretched, blurry or of the wrong boat; a loading or empty state that looks broken; a console error or a failed request; a refresh or Back that loses the place; a change in the backend that does not reach the screen it should; a PDF that does not look like it came from a premium dealership. Severity: blocker = a stakeholder would stop and say it is broken, or a customer would see it; major = they would name it within a minute; minor = craft they might not name but would feel. Precise enough to reproduce, with the fix you would make.`

const LENSES = [
  {
    key: 'desk',
    port: 6011,
    brief: `YOUR LENS: THE SALE AT THE DESK. You are a salesperson at Northside Marine with a customer sitting beside you. Do THREE full quotes from cold, first on a tablet held at the desk (834×1112), then on a laptop (1440×900): (1) a Stacer with a Yamaha the file pairs and a trailer; (2) a Highfield in hypalon with a colourway, where the customer changes their mind about the finish (the cascade) and asks what it would be at a different price level; (3) the cheapest honest rig on the file for a first-time buyer. Each time: address it to a person, give it to the customer, open the document, and DOWNLOAD IT AS PDF with the browser's own print, saving to docs/directions/acceptance/<round>/quote-<n>.pdf. Judge the EXPERIENCE with somebody watching: every hesitation, every screen that made you explain the app instead of the boat, every wait, every moment you would have turned the screen away. The customer sees everything you see.`,
  },
  {
    key: 'customer',
    port: 6021,
    brief: `YOUR LENS: THE CUSTOMER WHO RECEIVES THE QUOTE. Make three quotes from cold as the desk would (a Stacer with a motor and trailer; a Highfield with a colourway; the cheapest honest rig), issue each to a name, and download each as PDF with the browser's own print into docs/directions/acceptance/<round>/customer-<n>.pdf. Then put the app away and READ THE PDFs AS THE BUYER — open each (the Read tool renders PDF pages) page by page. Does it look like it came from a premium dealership? Is the dealership named, with how to reach it? Is the boat photographed properly? Is the price clear, with what is included, what is optional, and GST stated? Is there anything a buyer needs that is missing — validity, terms, deposit, how to accept, who prepared it? Is there anything on it that is the app talking to itself, a code a buyer cannot read, a sentence written for the dealer? Would you be proud to forward it to your partner? Mark every item of docs/research/proposal/quote-spec.md section 13 pass or fail for each PDF, with its page; a fail on items 1 to 13 is a blocker.`,
  },
  {
    key: 'admin',
    port: 6031,
    brief: `YOUR LENS: THE BACKEND, CONFIGURED BY THE DEALERSHIP WITHOUT A DEVELOPER. Sign in, load the file, and CONFIGURE: the organisation's name, address, ABN, phone and terms; its mark and a brand colour, and see the whole app change; a hero picture; a place's cover; a price level applied across a table, then undone; a rule that blocks a pairing, then see the configurator refuse it with the rule's own sentence, then switch it off; a template's terms, locked, then see them on an issued document; a person added in settings, then a quote issued as that person, and read who prepared it on the paper. After EVERY change, go to the screen it should reach — the configurator, the document, the picker, home — and check it arrived. Judge: can a dealership manager do each of these alone, first time, without help? Is anything confusing, hidden, refusing wrongly, or silently not taking effect? Is a choice that would make the app unreadable refused with a sentence and the nearest thing that works?`,
  },
  {
    key: 'stakeholder',
    port: 6041,
    brief: `YOUR LENS: A STAKEHOLDER GOING OVER EVERY SCREEN. Visit EVERY screen the app has (the shell's list of doors in src/app/ways.ts and e2e/routes.ts name them all), at all six sizes: 390×844, 844×390, 834×1112, 1280×800, 1440×900, 1920×1080 — in the states a stakeholder will meet: empty on a cold browser, then with a quote, a customer and a rule in it. On each: overlap, clipping, misalignment, a cut word, faint text, a target too small, a broken or stretched or wrong picture, a loading state that looks broken, an empty state that apologises instead of teaching, a keycap shown on a touch screen, a scrollbar or focus ring that looks unfinished, a favicon or tab title that is wrong. Open the console on every screen and record every error and failed request. Refresh and press Back on every screen and check you land where you were. Photograph every defect into docs/directions/acceptance/<round>/.`,
  },
]

const seen = new Set()
const keyOf = (d) =>
  `${(d.screen || '').toLowerCase().trim()}::${(d.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()}`
const rounds = []
let dry = 0
let round = 0

while (dry < 2 && round < 4) {
  round++
  phase('Hunt')
  const hunts = await parallel(
    LENSES.map(
      (l) => () =>
        agent(
          `You are hunting UI and UX defects in HL_2.0 before it is handed to its owner's stakeholders. This is round ${round}.\n\n${CONTEXT}\n\n${l.brief}\n\nDEFECTS ALREADY FOUND IN EARLIER ROUNDS — do not report them again unless you can show they are still there, and say so: ${JSON.stringify([...seen]).slice(0, 6000)}\n\nYour port: ${l.port}. Budget: open at most 50 pictures. Change nothing in src/ or e2e/. Save your evidence under docs/directions/acceptance/round-${round}/. Return every defect you found, worst first, and a verdict of three sentences: is this ready to hand to stakeholders through your lens, and if not, why not.`,
          { label: `hunt${round}:${l.key}`, phase: 'Hunt', schema: HUNT },
        ),
    ),
  )
  const found = hunts.filter(Boolean).flatMap((h) => h.defects.map((d) => ({ ...d, lens: h.lens })))
  const fresh = found.filter((d) => !seen.has(keyOf(d)))
  fresh.forEach((d) => seen.add(keyOf(d)))
  const serious = fresh.filter((d) => d.severity !== 'minor')
  log(
    `round ${round}: ${found.length} found, ${fresh.length} new, ${serious.length} blockers/majors`,
  )
  rounds.push({
    round,
    verdicts: hunts.filter(Boolean).map((h) => ({ lens: h.lens, verdict: h.verdict })),
    fresh: fresh.length,
    serious: serious.length,
  })

  if (serious.length === 0) {
    dry++
    if (fresh.length === 0) continue
  } else {
    dry = 0
  }

  phase('Fix')
  const byScreen = {}
  for (const d of fresh) (byScreen[d.screen] = byScreen[d.screen] || []).push(d)
  await parallel(
    Object.keys(byScreen)
      .slice(0, 16)
      .map(
        (screen, i) => () =>
          agent(
            `You are fixing UI and UX defects in HL_2.0 before it is handed to stakeholders.\n\n${CONTEXT}\n\nHOW THIS APP IS BUILT, which every fix respects: a screen lives in src/screens/<name>/ with its own stylesheet and no shared page component; every colour, face, size, space, radius, shadow, easing and duration comes from src/styles/tokens.css, and tools/check.ts refuses a literal colour, an undeclared token, anything under 11px, a cost column on a customer surface, and the words entity / schema / field type / reference in a reader-facing string; controls come from src/ui; figures are counted from the stores, never typed; no data is invented; a refusal is a sentence with its reason, never a disabled control and never the loudest thing at rest; every write is a command with an inverse and Undo on the screen; a derivation is a pure function in src/domain with a test; the price figure never counts up; reduced motion removes movement.\n\nYOUR SCREEN: ${screen}. THE DEFECTS FOUND ON IT, from ${[...new Set(byScreen[screen].map((d) => d.lens))].join(', ')}: ${JSON.stringify(byScreen[screen])}\n\nReproduce each on HL2_BASE=/HL_2.0/ npm run build and npx vite preview --port ${6101 + i * 4}, fix it at its cause, and prove the fix: look again at the size it was found at and at 390×844 and 1440×900. Add a test wherever the defect could come back unnoticed — a flow assertion, a component test by role and text, or a guard. Fix the minors too. If a defect is not a defect, say why in notFixed. GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; and ONLY your screen's Playwright (HL2_PREVIEW_PORT=${6103 + i * 4} npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<route name>" --workers 1) — another fixer is working beside you. Touch only this screen's files; if a defect needs a file another screen owns, say so in notFixed. Do not commit.`,
            { label: `fix${round}:${screen}`, phase: 'Fix', schema: REPORT },
          ),
      ),
  )
}

phase('Ship')
const ship = await agent(
  `You are shipping HL_2.0 to its stakeholders. This is the last agent to touch the tree.\n\n${CONTEXT}\n\nTHE HUNT: ${JSON.stringify(rounds)}. Every defect it recorded: ${JSON.stringify([...seen]).slice(0, 8000)}.\n\n1. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Anything red: re-run it alone with --last-failed --timeout 120000 --workers 1; if it is the app, fix it. Do not call a gate green that is not.\n2. Commit (a message that says what was measured, ending "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>") and push. Watch the Pages deployment through the public API (https://api.github.com/repos/AsafAlazraki/HL_2.0/actions/runs?per_page=5, no credential) until it is green; if Pages is not enabled for the repository, stop and say so as the blocker with the setting to change.\n3. WALK THE LIVE SITE, ${SITE}, cold, with the browser tools, on a tablet (834×1112) and a laptop (1440×900): one full quote from the door to a downloaded PDF, and every door on the pill. Read the console on every screen. Save the PDF to docs/directions/acceptance/live-quote.pdf and read it.\n4. Update docs/REVIEW.md so its first lines are the link, what a stakeholder will see on a cold browser, the ten-minute walk, and one honest paragraph on what the hunt found and closed in how many rounds — and anything it did not close, said plainly. Commit and push.\nReport the gate numbers, the deploy, the live walk step by step, and the link.`,
  { label: 'ship', phase: 'Ship' },
)

return { rounds, defectsRecorded: seen.size, ship }
