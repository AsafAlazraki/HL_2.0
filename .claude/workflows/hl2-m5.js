export const meta = {
  name: 'hl2-m5',
  description: 'Milestone 5: document templates with their override cascade, the map of the file, and the pipeline — sweep, build, verify, critique, fix',
  phases: [
    { title: 'Sweep', detail: 'one reference sweep per screen' },
    { title: 'Build', detail: 'three screens, two at a time, each on its own composition' },
    { title: 'Verify', detail: 'the whole app driven cold, and the milestone exit walked' },
    { title: 'Critique', detail: 'independent judgement, per-screen fixes, and the refusal re-read' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'
const STOCK = 'C:\\Users\\Asaf\\dev\\hl-refs\\ref'

const SWEEP = {
  type: 'object',
  properties: {
    notesFile: { type: 'string' },
    frames: { type: 'integer' },
    failed: { type: 'array', items: { type: 'string' } },
    patterns: { type: 'array', items: { type: 'string' } },
    avoid: { type: 'array', items: { type: 'string' } },
    directions: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['notesFile', 'frames', 'patterns', 'avoid', 'directions', 'notes'],
}

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    testsPassed: { type: 'integer' },
    testsFailed: { type: 'integer' },
    gateGreen: { type: 'boolean' },
    direction: { type: 'string' },
    reflow: { type: 'string' },
    notes: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'gateGreen', 'direction', 'reflow', 'notes', 'blockers'],
}

const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          title: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['screen', 'severity', 'title', 'detail'],
      },
    },
    wouldHeAccept: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['gaps', 'wouldHeAccept', 'summary'],
}

const STATE = `THE STATE. Repo (cwd): ${NEW}. Milestones 0 to 4 are built and green — twenty screens: entry, home, picker, configurator, cascade, document, quotes, Lost, the sheet (/data/$table), history, data, customers, the shell (a floating pill with a Ctrl K finder), rules, fitment, review, levels, places, manage and the shelf. Read docs/STATUS.md (the top sections), then CLAUDE.md (in your context), then docs/SCREENS.md — every built screen's primary references are listed and NO TWO ROWS MAY SHARE A PRIMARY REFERENCE SET.

MILESTONE 5 IS THE LAST OF THE PRODUCT: what a quote SAYS in the dealer's own words, a picture of what the business holds, and where a deal stands. docs/PLAN.md § "Milestone 5" is the brief, and § "From the original HelmLogic" § "Quote and document templates" is the evidence, surveyed from the original production app's own code.

THE ENGINE AND THE SCREENS THIS BUILDS ON, already in the tree:
- src/screens/document/ — THE DOCUMENT IS BUILT and it is the thing templates author. Read it first and in full: it renders an A4 sheet at true size from FROZEN lines with @page, there is no second renderer for screen and paper, and src/screens/document/paginate.ts packs measured atoms into pages. A template must render through THAT component, never a copy of it.
- src/domain/quote/document.ts — the reading a document draws from; freeze.ts mints the frozen lines; commands.ts carries every mutation with its inverse and typed event
- src/domain/people/organisation.ts — the organisation whose terms and marks a template inherits; src/screens/manage/ sets them
- src/domain/quote/diary/history.ts — indexQuotes, versionsOf, versionMark, standingOf; quote/register.ts and find.ts — the readings the pipeline groups
- src/domain/model/tables.ts, src/domain/catalogue/views/relations.ts and src/domain/modules/links.ts — what the map draws
- src/domain/catalogue/commands.ts + src/state/catalogue.ts, src/state/quotes.ts — every write is a command with an inverse, a said sentence and a typed event`

const HOUSE = `HOW A SCREEN IS BUILT HERE:
- src/screens/<name>/ with its own stylesheet and a file route under src/routes/. No shared page component, ever. Write the reflow at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 into the stylesheet header as the built screens do.
- READ THREE BUILT SCREENS FIRST and match their standard: src/screens/document/ (the paper, which this milestone authors), src/screens/configurator/ (a rail of chapters over a stage, and how a command is applied and undone), src/screens/quotes/ (the dense register and its keyboard vocabulary). Do not invent a second way.
- Every colour, face, size, space, radius, shadow, easing and duration from src/styles/tokens.css. tools/check.ts refuses a literal colour, an undeclared var(--x), anything under 11px, a cost column name on a customer surface, and the words entity / schema / field type / reference / UID in a reader-facing string. A value the tokens lack is ADDED to tokens.css with a comment saying where it came from.
- Controls from src/ui. They refuse className and style by design; extend a primitive rather than working around it, and say so.
- Figures are COUNTED from the stores through src/app/useStores.ts, never typed.
- No fake data: no invented quote, stage, template or photograph. An empty state is the true state and is drawn to teach.
- A refusal is a sentence with its reason where it is refused, never a disabled control. Never "not built yet" for a screen that exists.
- THE SHELL IS BUILT: read src/screens/shell/ and ADD YOUR DOOR to its one list of doors, and make your screen findable by typing where that makes sense.
- A Cockpit register owes 18 readable rows at 1280×800. JOIN e2e/routes.ts (register, a \`ready\` selector, an \`arrive\` mode, and \`density\` for a register), and add e2e/flows/<screen>.spec.ts.
- Responsive at every size. The primary act never becomes a floating bottom bar.
- Customisation by token (docs/CUSTOMISATION.md); /manage is where a dealership sets its own layer.
- A LIBRARY THE OWNER NAMED IS ADOPTED, not argued with (docs/PLAN.md § "The technology stance"). TipTap for prose stored as ProseMirror JSON; xyflow in its own chunk for the map; dnd kit for a board's drag. Check package.json, install what is missing, and use it well.

PORTS AND SERVERS, because builders run two at a time: NEVER run the whole e2e suite — run only yours: HL2_PREVIEW_PORT=<yours> npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<your route name>". Serve for looking with npx vite --port <yours+1> and drive it with the browser tools at 1440×900 and 390×844; read your own screenshots and fix what is wrong before you report. Your ports are in your task.

BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then your Playwright run. Component tests beside the screen, in happy-dom, BY ROLE AND TEXT. Report only numbers you measured. APPEND your row to docs/SCREENS.md and a dated one-liner to docs/DECISIONS.md, each with one \`cat >> file <<'EOF'\`. Do NOT commit, push, checkout, reset or stash.

THE OWNER'S STANDARD: five redesigns rejected on sight; "it still feels like a database, it is not beautiful enough, it does not feel alive"; "all of the same functionality, presented beautifully"; "i can't stress enough how easy this system has to be to use". A user never sees the words entity, schema, field type or reference.`

const SWEEP_BRIEF = `You are running the reference sweep for ONE screen of HL_2.0 before it is designed. Do not commit. Write only under docs/research/refs/<screen>/.

${STATE}

READ AS THE STANDARD, NOT TO REPEAT: docs/research/refs/document/notes.md (the paper, which this milestone authors), docs/research/refs/configurator/notes.md, and the critics docs/research/refs/critique-m2.md, docs/directions/built-critique-m3.md and built-critique-m4.md. Their standing faults, which no board here may repeat: two directions inside one screen that are the same composition on a different ground or the same stack reordered; a direction whose "exclusive" reference is a text page or a diagram showing no shape; and a milestone whose directions are all one narrow-list-left, detail-right composition.

BUDGET, because this is a four-core machine and a sweep's transcript once reached 170 MB and killed an agent: capture at most 45 new frames, and open at most 40 with the Read tool. A frame you did not open you do not cite.

CAPTURE TOOL: npx tsx tools/research/capture.ts <screen>/<modality> <list.json> [--width 1440 --height 900]. Read the tool first. Consent banners are answered with the most privacy-preserving button. Never sign in, never create an account, never type personal data, never fight bot protection — a site that refuses is listed under failed with its reason. Public demo and documentation pages are fair game where an app needs a login.

EXISTING STOCK, use before capturing: ${STOCK}/tables/ and ${STOCK}/boats/ (including the Porsche configuration PDF captured page by page), plus docs/research/refs/<built-screen>/ for the nineteen sweeps already done — theirs to cite, but a frame a built screen uses as PRIMARY cannot be your primary.

WRITE docs/research/refs/<screen>/notes.md, under 2,500 words, in the shape the existing sweeps use: (1) what is genuinely best for THIS screen and why, citing frames by path; (2) the interaction patterns worth taking, each NAMED, with the frame that shows it; (3) the type and motion choices seen and what they do for the person; (4) what to avoid, each with the frame that shows the failure; (5) three or four DIRECTIONS, each a different composition AND a different order and grouping, each naming two references no other board could claim, what only this screen does, how it reflows at 390 / 834 / 1920, and what a second dealership replaces; (6) what the seed can honestly put here. Plus sources-index.md: every frame with its URL and one line.`

const SCREENS = [
  {
    key: 'templates',
    port: 5411,
    brief: `SCREEN: TEMPLATES, at /templates and /templates/$id — what a quote SAYS, in the dealership's own words, around the parts the app computes.

THE SHAPE, taken from the original production app's own Template Studio and corrected by the plan: eleven sections in order, four of them SYSTEM sections the app computes and nobody edits (cover, vessel configuration, pricing, signatures) and seven AUTHORED (salesperson message, why choose us, brand and model story, after-sales confidence, finance and insurance, value summary, terms and conditions). The original locked the cover; the plan's correction is that the COVER IS A FLOWABLE BAND so all seven authored blocks can reorder. Each authored block has a sub-header, a document type (quote or contract) and an \`isLockedForQuotes\` flag.

THE FOUR-LAYER OVERRIDE CASCADE, which is the heart of this screen: per-quote → brand → organisation → default, short-circuited by an admin lock. A dealer authors terms once, locks them, and every issued document prints them; a salesperson personalises one quote's cover letter and the locked terms stay untouched. Draw the cascade so a person can SEE which layer a block is coming from and what would happen if they edited it here.

VERSION HISTORY on every save, with non-destructive restore (restore-as-a-new-version) and a compare view. PROSE IS STORED AS PROSEMIRROR JSON, not HTML — TipTap is the editor the owner's own library list names. Customer tokens substitute at render.

THE TWO RULES THAT CANNOT BEND: (1) the preview renders THE IDENTICAL COMPONENT as print — src/screens/document/ — never a second renderer, because the document screen's whole reason for existing is that screen and paper cannot disagree. (2) PROSE IS FROZEN ONTO THE QUOTE AT ISSUE, exactly as prices are; the original's live-prose bug, where an issued document's words changed when somebody edited a template months later, is not carried.

THE HARD QUESTIONS: (1) a fixed-slot composer with four locked sections is a strange object — how do the best show "you may write here, the app writes there" without it feeling like a form? (2) how is the override cascade drawn — four layers, one value, and which one wins — so a dealer knows what they are changing? (3) what does side-by-side authoring and preview look like when the preview is a real A4 page? (4) how does version history read for prose, and what does a compare look like? (5) what does the lock look like from the salesperson's side — a block they cannot edit, with the reason? (6) 390px, where authoring is probably reading?
REFERENCES TO DRIVE: Qwilr and PandaDoc's proposal editors, DocuSign and Adobe Sign templates, Notion's template gallery and its synced blocks (the closest consumer drawing of "this content lives elsewhere"), Figma's components with overrides and its variables-with-modes panel, Webflow's CMS templates, Contentful and Sanity's structured-content editors, Mailchimp and Klaviyo's email template editors, Google Docs' suggestion mode and version history, Craft and Linear's document editors, Salesforce and HubSpot quote templates (docs), and Canva's brand templates with locked elements.`,
  },
  {
    key: 'map',
    port: 5421,
    brief: `SCREEN: THE MAP, at /map — a picture of what the business holds and how it hangs together, read-only first.

WHAT IT DRAWS: 25 base tables and 28 join tables holding 8,679 pairings, every join hanging off exactly one of the seven boat tables (5/5/5/5/3/3/2), nine places minted from table keys, and the rules that reach across them. src/domain/catalogue/views/relations.ts, src/domain/modules/links.ts and reach.ts, src/domain/model/tables.ts are the readings; the old repo's 5.5k-line xyflow rule canvas is NOT ported, and xyflow goes in its own chunk. THE CANVAS RULE THIS REPO ALREADY LEARNED, from the plan's UI kit rules: a canvas container always has a box while mounted and its camera lives OUTSIDE the component — React Flow in a display:none container emitted a pattern with NaN coordinates.

WHY IT IS NOT A DIAGRAM FOR ITS OWN SAKE: the owner's standing complaints are "it still feels like a database" and "the tables — still too complicated and hard to use visually". A map earns its place only if a dealer learns something they could not learn from /data — which brand has the most pairings, which table nothing points at, where a rule reaches across two places, what would break if a column went. Say in the notes what this screen tells somebody that /data and /places cannot, and if the honest answer is "nothing", say THAT and propose the shape that would.

THE HARD QUESTIONS: (1) 53 nodes and 28 edges is small for a graph and large for a picture — what layout makes it readable without a person dragging anything? (2) how is a join drawn so it reads as "Highfield boats pair with Yamaha motors, 2,519 ways" rather than as a line between two boxes? (3) how does the map get somebody somewhere — press a node and land in the sheet, the place, or the rules? (4) what does it do at 390px, where a graph is hopeless — and is the honest answer a list? (5) read-only first: what would it take for it to become editable later, and what is deliberately not built now?
REFERENCES TO DRIVE: Figma's FigJam and its own diagram tooling, Miro templates, Linear's project graph, Sentry's service map, Datadog's service topology, AWS and Google Cloud architecture views, Neo4j Bloom and Graphileon (graph visualisation done by people who do only that), dbdiagram.io and DrawSQL, Prisma's ERD generator, Obsidian's graph view (the best consumer graph view), Observable's dataflow view, GitHub's dependency graph, Apple's Freeform (apple.com), and any transit map as the classic argument that a map is a designed abstraction and not a plot.`,
  },
  {
    key: 'pipeline',
    port: 5431,
    brief: `SCREEN: THE PIPELINE, at /pipeline — where every deal stands, as a board whose columns the dealership names.

WHAT THE ENGINE GIVES YOU: src/domain/quote/register.ts and find.ts (the readings), diary/history.ts (indexQuotes, versionsOf, standingOf — draft / given / replaced, which is the LIFECYCLE THE APP ACTUALLY KNOWS), src/state/quotes.ts (every move is a command with an inverse and a typed event). Stages beyond those three are NAMED BY THE DEALERSHIP and stored as data, exactly as roles are — never an enum in app code. dnd kit is the owner's named library for the drag.

THE HARD RULE ON THIS SCREEN: **a drag never edits a frozen quote.** Moving a card changes where a deal stands, which is a fact about the deal and not about the document; an issued quote's lines, prices and prose stay frozen and the screen must make that visible rather than merely true. And the empty state is the honest one: this app has the quotes somebody has actually raised and no more.

DISTINGUISH IT FROM /quotes, WHICH IS BUILT: the quotes register is three bands by state, found by reference, customer, boat or preparer — a LEDGER. The pipeline is a BOARD about where money is. If your directions cannot say what the board does that the ledger cannot, say so and propose the shape that can.

THE HARD QUESTIONS: (1) a kanban board is the most copied shape in software — what do the best ones do that a bad one does not, and what does a card carry when the subject is a boat deal (reference, customer, boat, total, age, who prepared it)? (2) how is a column's total and count drawn without it becoming a spreadsheet? (3) how does a dealership NAME its own stages, and what happens to the cards in a stage that is renamed or removed? (4) what does the board say on day one with three drafts and nothing else? (5) 390px, where a horizontal board is hopeless — one column with a stage chooser, a list grouped by stage, or something else? (6) how does drag work by keyboard, since a drag-only board is unreachable?
REFERENCES TO DRIVE: Linear's board view and its cycle columns, Height, Trello and Jira boards, Notion's board database, Pipedrive and HubSpot deal pipelines (the exact analogue — a sales pipeline with money in it), Salesforce opportunity kanban (docs), Attio's deal objects, Shopify's order flow, Monday.com, Asana's board, GitHub Projects' board and its field summaries, Basecamp's Hill Charts (the best argument that a board is not the only shape for "where things stand"), and any marine or car dealership management system with a public demo.`,
  },
]

phase('Sweep')
const sweeps = await parallel(
  SCREENS.map((s) => () =>
    agent(
      SWEEP_BRIEF +
        `\n\n${s.brief}\n\nYour screen key for paths: "${s.key}". Write docs/research/refs/${s.key}/notes.md and sources-index.md.`,
      { label: 'sweep:' + s.key, phase: 'Sweep', schema: SWEEP },
    ),
  ),
)
log('swept: ' + SCREENS.map((s) => s.key).join(', '))

phase('Build')
const builds = await parallel(
  SCREENS.map((s) => () =>
    agent(
      `You are building a real screen for HL_2.0.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SPEC IS YOUR SWEEP: docs/research/refs/${s.key}/notes.md, written in this same round. THE OWNER HAS HANDED THE PICKS OVER ("go for what u think is awesome and build literally everything please before i review it"), so CHOOSE the direction yourself — but read the other two screens' notes.md in this round (${SCREENS.map((x) => x.key).join(', ')}) and do NOT take the composition another would obviously take. Say in \`direction\` what you built, why it is right for this screen, and what you deliberately did not take. Look at the frames it leans on before you build.\n\n${s.brief}\n\nOwnership: src/screens/${s.key}/**, src/routes/${s.key}*.tsx, e2e/flows/${s.key}.spec.ts, your row in e2e/routes.ts, your door in the shell's one list of doors, and src/domain only for a missing pure derivation with its test. Ports: ${s.port} for Playwright, ${s.port + 1} for vite.\n\nTHE MILESTONE'S EXIT CRITERION IS SHARED: a dealer authors a cover letter and terms once, locks the terms, and every issued document prints them, with the preview and the print being the same component and version restore non-destructive; and a drag on the board never edits a frozen quote. Own your half and prove it in your own flow spec; do not break the other halves.`,
      { label: 'build:' + s.key, phase: 'Build', schema: REPORT },
    ),
  ),
)
log('built ' + builds.filter(Boolean).length + ' of ' + SCREENS.length)

phase('Verify')
const verify = await agent(
  `You are verifying HL_2.0 as a boat dealer's sales manager would — somebody who reads nothing and expects it to work.\n\n${STATE}\n\nNothing else is running now, so you may run everything. Change only what a command needs to run; report everything else.\n\n1. Full gate: npm test; npm run build; npm run e2e (alone — about 30 minutes idle). Report every number. If a check is red, say whether it is the app or the machine, and re-run it alone with --last-failed --timeout 120000 --workers 1 to tell which. Report both readings.\n2. Serve the built app (npx vite preview --port 5461) and DRIVE THE MILESTONE'S EXIT with the browser tools, screenshotting and READING every step: /templates: author a cover letter and terms, LOCK the terms, look at the side-by-side preview and confirm it is the document's own component → raise a quote, personalise its cover letter, see the locked terms untouched → issue it → print it and confirm the authored prose is on the paper → go back to /templates, EDIT THE TERMS, reopen the issued document and confirm ITS PROSE DID NOT CHANGE (frozen at issue) → restore an older version and confirm it restores as a NEW version → /map: read what the business holds, press a node and land where it says → /pipeline: name a stage, move a deal, confirm the frozen quote is untouched, undo the move → then walk the whole sale again to be sure nothing broke.\n3. The same at 390×844 and 1920×1080.\n4. Write docs/directions/built-m5.md: one honest paragraph per screen at each size, screenshots under docs/directions/<screen>/built/. Say plainly where the flow breaks, where it is confusing, where a control does nothing, and where two screens read as the same shape.\n5. REFUSAL ROT: grep every refusal sentence in src/screens/** and src/routes/** and list each with whether it is still TRUE on this tree.\nReport the gate numbers and everything that is wrong.`,
  { label: 'verify', phase: 'Verify' },
)

phase('Critique')
const critic = await agent(
  `You are the independent critic for HL_2.0, read-only except docs/directions/built-critique-m5.md.\n\n${STATE}\n\nJudge the three new screens, and the app they complete, as the owner would. Read docs/directions/built-m5.md and look at every screenshot under docs/directions/{templates,map,pipeline}/built/ and a sample of the older ones. Read each screen's sweep notes to see what it promised. Then read the source for what a screenshot cannot show. The verify agent's report: ${JSON.stringify(verify).slice(0, 6000)}\n\nFindings, each with a screen and a severity:\n- blocker: an invented quote, stage, template or photograph; a template preview that is a second renderer rather than the document's own component; prose that is not frozen at issue; a drag that edits a frozen quote; a hard-coded colour, face or picture path; text under 4.5:1 on its real ground; anything under 11px; a control that does nothing; a refusal that is false on this tree; a cost column on a customer surface; a write that bypasses the command layer; a canvas mounted in a box-less container; the words entity / schema / field type / reference on a reader-facing surface; any half of the milestone's exit criterion not actually true.\n- major: two screens that read as one shape; the pipeline reading as the quotes register a second time; the map telling a dealer nothing /data does not; a layout that fails at 390 or 1920; a board unreachable by keyboard; an override cascade a person cannot read; a screen that lost its sweep's own idea.\n- minor: craft.\nThen answer plainly in wouldHeAccept: would the owner accept these three screens on sight, and if not, name the ONE thing to change first. He has rejected five redesigns; flattery costs him money.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps || []) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  const ports = { templates: 5411, map: 5421, pipeline: 5431 }
  await parallel(
    Object.keys(byScreen)
      .slice(0, 8)
      .map((screen, i) => () =>
        agent(
          `You are fixing a built screen of HL_2.0 against an independent critique.\n\n${STATE}\n\n${HOUSE}\n\nTASK: fix the "${screen}" screen. Read docs/directions/built-critique-m5.md and built-m5.md and look at that screen's screenshots.\n\nFound on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major finding and the cheap minor ones. Keep the screen's own idea; answer the criticism rather than flattening it. Re-run your own gate (ports: Playwright ${ports[screen] || 5471 + i * 10}, vite ${(ports[screen] || 5471 + i * 10) + 1}), drive the screen again at 1440×900 and 390×844, look at your screenshots, and report what you changed and what you deliberately did not.`,
          { label: 'fix:' + screen, phase: 'Critique', schema: REPORT },
        ),
      ),
  )
}

const reread = await agent(
  `You are closing Milestone 5 of HL_2.0 — the last milestone before the owner's review.\n\n${STATE}\n\nNothing else is running. (1) Grep every refusal and every "not built" / "does not exist" / "yet" sentence in src/screens/** and src/routes/** and make each one TRUE on this tree — retire the ones whose screen now exists by wiring the act to it, keep the ones still true, and make sure every screen has its door in the shell's one list and is reachable by the finder. (2) Read docs/SCREENS.md: every screen has a row, no two rows share a primary reference set, every status says what is measured. (3) PROVE THE MILESTONE'S EXIT CRITERION end to end and say the numbers: authored prose locked, printed, and frozen against a later edit; version restore non-destructive; a drag that leaves a frozen quote untouched. (4) Run the full gate alone — npm test; npm run build; npm run e2e — and report every number; fix what is red if it is the app and say so if it is the machine. (5) Append to docs/STATUS.md under a new dated heading "Milestone 5 is built" with one paragraph per screen. (6) Read docs/LATER.md and make sure everything this milestone did NOT build is named there with its reason, so nothing is silently forgotten. Report what you changed.`,
  { label: 'reread', phase: 'Critique', schema: REPORT },
)

return { sweeps: sweeps.filter(Boolean), builds: builds.filter(Boolean), verify, critic, reread }
