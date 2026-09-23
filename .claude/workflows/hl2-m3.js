export const meta = {
  name: 'hl2-m3',
  description: 'Milestone 3: rules, fitment, review and levels — sweep, build, verify, critique, fix',
  phases: [
    { title: 'Sweep', detail: 'one reference sweep per screen, on the frames already on disk plus what is missing' },
    { title: 'Build', detail: 'four screens, two at a time, each on its own assigned composition' },
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

const STATE = `THE STATE. Repo (cwd): ${NEW}. Milestones 0, 1 and 2 are built and green: entry, home, picker, configurator, cascade, document, the quotes register, Lost, the sheet (/data/$table), History (/history), Data (/data), Customers (/customers) and the shell (a floating pill over every screen but the door, with a Ctrl K finder). Read docs/STATUS.md (the top sections), then CLAUDE.md (in your context), then docs/SCREENS.md — every built screen's primary references are listed there and NO TWO ROWS MAY SHARE A PRIMARY REFERENCE SET.

MILESTONE 3 IS THE DEALER'S OWN RULES: the four screens where a dealer says what may be sold with what, sees what the file refuses and why, finds what is wrong with their own data, and sets what things cost. docs/PLAN.md § "Milestone 3" is the brief, and its exit criterion is one sentence: **writing a rule changes what the configurator refuses on the next pick, with the rule's own "because"**.

THE ENGINE IS ALREADY PORTED AND PURE, with its suites green. Do NOT rebuild any of it; if something is genuinely missing, put it in src/domain with a test and say so.
- src/domain/rules/sentence/ — the sentence rules (engine.ts, effects.ts, describe.ts, drop.ts, obviousColumns.ts)
- src/domain/rules/constraints/ — constraintDefs, workbookRules.ts (the real workbook rules carried as data with their measured rates), create, edit, deleteRule, relate, registration, ruleLedger, leftOut, startingPoints, plainly, discover/discoverSay/discoverValues/discoveredRules (observed patterns that only ever warn), columns, state
- src/domain/rules/configure/ — the solver (solve, evaluate, domain, values, describe)
- src/domain/rules/engine/ — evaluate, effects, walk, validate, types
- src/domain/rules/formula/ — parser, tokens, ast, evaluate, functions
- src/domain/rules/lint/ — lint.ts, rules.ts, heuristics.ts, applyFix.ts, types.ts
- src/domain/rules/review/ — rollup.ts, describe.ts
- src/domain/fitment/ — trailerFitment.ts (the arc-consistency solver that RECORDS THE REASON AT REMOVAL), fit.ts, reading.ts, rigReading.ts
- src/domain/pricing/ — levels.ts, apply.ts; src/domain/catalogue/curation/ — the ten named fail-open curation rules with reach.ts
- src/domain/catalogue/commands.ts + src/state/catalogue.ts — every write is a command with an inverse, a said sentence and a typed event`

const HOUSE = `HOW A SCREEN IS BUILT HERE:
- src/screens/<name>/ with its own stylesheet and a file route under src/routes/. No shared page component, ever. Write the reflow at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 into the stylesheet header as the built screens do.
- READ THREE BUILT SCREENS FIRST and match their standard: src/screens/sheet/ (the dense Cockpit register, its keyboard vocabulary, its edit-in-place), src/screens/history/ (the spine, and how a line opens in place), src/screens/configurator/ (how a command is applied and undone from a screen). Do not invent a second way.
- Every colour, face, size, space, radius, shadow, easing and duration from src/styles/tokens.css. tools/check.ts refuses a literal colour, an undeclared var(--x), anything under 11px, a cost column name on a customer surface, and the words entity / schema / field type / reference / UID in a reader-facing string. A value the tokens lack is ADDED to tokens.css with a comment saying where it came from.
- Controls from src/ui. They refuse className and style by design; extend a primitive rather than working around it, and say so.
- Figures are COUNTED from the loaded catalogue and the quotes store through src/app/useStores.ts, never typed. A rule shown is measured from the file with its numerator and denominator — "Never invent a figure the price file does not carry".
- No fake data: no invented rule, customer, quote, figure, count or photograph. An empty state is the true state and is drawn to teach.
- A refusal is a sentence with its reason where it is refused, never a disabled control. Never "not built yet" for a screen that exists.
- THE SHELL IS BUILT: your screen sits under it. Read src/screens/shell/ and src/app/ways.ts (or wherever the doors are listed) and ADD YOUR DOOR to that one list — the pill and the finder both read it, and nothing lists routes twice. Your screen must also be findable by typing in the finder where that makes sense.
- A Cockpit register owes 18 readable rows at 1280×800. JOIN e2e/routes.ts (register, a \`ready\` selector that exists only once the screen has really read what it draws, an \`arrive\` mode, and \`density: { room, minus }\` for a register) so the five rulers measure you at six viewports, and add e2e/flows/<screen>.spec.ts for what the rulers cannot see.
- Responsive at every size. The primary act never becomes a floating bottom bar — the owner called that shape disgusting.
- Customisation by token (docs/CUSTOMISATION.md): a second dealership replaces the mark, the accent, the density.

PORTS AND SERVERS, because builders run two at a time: NEVER run the whole e2e suite — run only yours: HL2_PREVIEW_PORT=<yours> npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<your route name>". Serve for looking with npx vite --port <yours+1> and drive it with the browser tools at 1440×900 and 390×844; read your own screenshots and fix what is wrong before you report. Your ports are in your task.

BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then your Playwright run. Component tests beside the screen, in happy-dom, BY ROLE AND TEXT. Report only numbers you measured. APPEND your row to docs/SCREENS.md and a dated one-liner to docs/DECISIONS.md naming the direction and what lost, each with one \`cat >> file <<'EOF'\` — never rewrite either file, another builder may be appending at the same moment. Do NOT commit, push, checkout, reset or stash.

THE OWNER'S STANDARD: five redesigns rejected on sight; "it still feels like a database, it is not beautiful enough, it does not feel alive, it is still too complicated"; "the tables — still too complicated and hard to use visually"; "where the hell are you inventing these rules from"; "i can't stress enough how easy this system has to be to use"; "we are supposed to be taking a complicated thing and making it super super easy"; "all of the same functionality, presented beautifully". A user never sees the words entity, schema, field type or reference.`

const SWEEP_BRIEF = `You are running the reference sweep for ONE screen of HL_2.0 before it is designed. Do not commit. Write only under docs/research/refs/<screen>/.

${STATE}

READ AS THE STANDARD, NOT TO REPEAT: docs/research/refs/sheet/notes.md and docs/research/refs/configurator/notes.md (the two deepest), and docs/research/refs/critique-m2.md — the last critic's findings, which every board in this round must avoid repeating. Its three standing faults: (1) two directions inside one screen that are the same composition on a different ground, or the same content stack reordered; (2) a direction whose "exclusive" reference is a text page or a diagram showing no shape; (3) five directions across four screens that are all one narrow-list-left, detail-right composition. Each of your directions must be a genuinely different COMPOSITION and a different ORDER AND GROUPING of the content.

ALSO READ the old repo's own research, paid for once: docs/reference/explaining-a-refusal.md (this milestone's central document), docs/reference/dense-tables-and-selection.md, docs/reference/FITMENT_RULES.md, docs/reference/MPF_GROUND_TRUTH.md and docs/reference/HELMLOGIC_GROUND_TRUTH.md. Cite them where they already answer something, and check each citation still holds against the engine as it is in this tree.

BUDGET, because this is a four-core machine and a previous sweep's transcript reached 170 MB and killed an agent: capture at most 45 new frames, and open at most 40 with the Read tool. A frame you did not open you do not cite.

CAPTURE TOOL: npx tsx tools/research/capture.ts <screen>/<modality> <list.json> [--width 1440 --height 900]. Read the tool first. list.json is [{ id, url, note?, wait?, fullPage?, steps?: [{click}|{text}|{scroll}|{wait}|{key}] }]. Consent banners are answered with the most privacy-preserving button. Never sign in, never create an account, never type personal data, never fight bot protection — a site that refuses is listed under failed with its reason. Public demo and documentation pages are fair game where an app needs a login.

EXISTING STOCK, use before capturing: ${STOCK}/tables/ (linear, stripe, attio, airtable, supabase, github, polar, craft, vercel, apple-compare, porsche-compare, axopar-specs) and ${STOCK}/boats/, plus docs/research/refs/<built-screen>/ for the twelve sweeps already done — theirs to cite, but a frame a built screen uses as PRIMARY cannot be your primary.

WRITE docs/research/refs/<screen>/notes.md, under 2,500 words, in the shape the existing sweeps use: (1) what is genuinely best for THIS screen and why, citing frames by path; (2) the interaction patterns worth taking, each NAMED, with the frame that shows it; (3) the type and motion choices seen and what they do for the person; (4) what to avoid, each with the frame that shows the failure; (5) three or four DIRECTIONS, each a different composition AND a different order and grouping, each naming two references no other board — built or in this round — could claim, what only this screen does, how it reflows at 390 / 834 / 1920, and what a second dealership replaces; (6) what the seed can honestly put here, and a Cockpit screen may need no photography at all — saying so is an answer. Plus sources-index.md: every frame with its URL and one line.`

const SCREENS = [
  {
    key: 'rules',
    port: 5211,
    brief: `SCREEN: RULES, at /rules — where a dealer says what may be sold with what, in English, and sees it enforced.

WHAT THE ENGINE GIVES YOU: a rule is a SENTENCE whose underlined words are controls built from the sheet's own columns (src/domain/rules/sentence/engine.ts, describe.ts, obviousColumns.ts); it blocks or warns; off beats delete, and delete is undoable. The file carries 21 real workbook rules as data (src/domain/rules/constraints/workbookRules.ts) each with its measured verification — its numerator and denominator off the dealer's own file, which is the answer to "where the hell are you inventing these rules from". The discovery engine (discover.ts, discoverSay.ts, discoverValues.ts) finds patterns the dealer never wrote and those ONLY EVER WARN. ruleLedger.ts records what a rule has done; leftOut.ts and plainly.ts say what a rule excluded, in words; relate.ts and registration.ts are the two special shapes.

THE HARD QUESTIONS the sweep must answer with frames: (1) how do the best products let somebody WRITE a rule in a sentence without a query builder, and what does an underlined word look like when pressed? (2) how is a rule's REACH shown — how many rows it touches, out of how many — before it is switched on? (3) how do the best separate a rule the person wrote from a pattern the machine noticed, so the second never masquerades as the first? (4) what does a rule's history look like: it fired 12 times this week, on these rows? (5) how is a rule turned OFF rather than deleted, and how is that state drawn so it never reads as broken?
REFERENCES TO DRIVE: Gmail and Outlook filter builders, Notion database filters and formula editor, Airtable automations and conditional groups, Zapier and Make rule editors, Linear's automations and triggers, Stripe Radar rules (its public docs show a rule language with its own hit rates), GitHub branch protection and repository rulesets, Retool and Jira workflow conditions, Shopify Flow, Salesforce validation rules (docs), 1Password Watchtower for "noticed, not asked for", macOS Mail rules and Finder smart folders (apple.com), and any spreadsheet's data-validation dialog as a thing to AVOID.`,
  },
  {
    key: 'fitment',
    port: 5221,
    brief: `SCREEN: FITMENT, at /fitment — one boat at a time, and what can be fitted to it, with everything struck through carrying the reason it was struck.

WHAT THE ENGINE GIVES YOU: src/domain/fitment/trailerFitment.ts is an arc-consistency solver that RECORDS THE REASON AT REMOVAL — that recorded reason is the whole screen, and not one sentence on it may be written in a component. fit.ts, reading.ts and rigReading.ts read a boat's motors, trailers and rigging; the 28 join tables hold 8,679 pairings (Highfield × Yamaha alone is 2,519); a motor carries an HP envelope and a trailer an ATM floor. src/domain/catalogue/curation/ holds the ten named FAIL-OPEN curation rules with reach.ts — the old repo's best file, and the reference interaction for every narrowing in this app: narrow by rule, NAME the narrowing, COUNT what is hidden, and always offer Show all. A selected item is never hidden.

THE HARD QUESTIONS: (1) what does a list of 2,519 candidates look like when 2,400 are excluded and each exclusion has a different reason — grouped by reason, by verb, or by what is left? (2) how is a struck-through row drawn so it reads as "ruled out, here is why" and never as "broken"? (3) the curation toolbar: how do the best show that a list has been narrowed, by what, and how many are hidden, in one line? (4) how does a dealer go from this screen to fixing the pairing in the sheet, and back? (5) what does the HP envelope and the ATM floor look like as a fact rather than a number — a boat that takes 60–115hp, a trailer rated to 1,400kg?
REFERENCES TO DRIVE: PCPartPicker's compatibility filtering (its own incompatible-part warnings), Newegg and Scan's PC builders, RockAuto and PartSouq's fitment pickers (the whole car-parts industry is this problem), Tyre and wheel fitment tools (tyre size calculators, Fitment Industries), Boston Whaler and Mercury's engine selectors, Yamaha's rigging guides, Shimano and SRAM compatibility charts, Apple's accessory compatibility pages, Home Depot and IKEA's "goes with" tools, and Figma's or Linear's filter chips as the toolbar shape.`,
  },
  {
    key: 'review',
    port: 5231,
    brief: `SCREEN: REVIEW, at /review — a ledger of what is wrong with the dealer's own file, each finding with a priced fix.

WHAT THE ENGINE GIVES YOU: src/domain/rules/lint/ is a linter over the catalogue — lint.ts with rules.ts (its named checks), heuristics.ts, and applyFix.ts, which APPLIES a fix; src/domain/rules/review/rollup.ts rolls findings up and describe.ts words them. Every fix goes through src/state/catalogue.ts's command layer, so every fix is undoable and carries its own said sentence and typed event. The findings are real and countable on this file: run the linter against the pack and say in the notes what it actually finds and how many — the boards must be drawn on the true counts, not on a guess.

THE HARD QUESTIONS: (1) a findings ledger is the most boring shape in software — what makes the best ones readable, and what makes a dealer act on one rather than close it? (2) how is a finding GROUPED — by severity, by table, by kind of fault, or by the fix that would clear several at once? (3) what does "apply this fix" look like when it writes to the dealer's real file, and how is it undone? (4) how is a finding DISMISSED, and does it come back? (5) what does the screen say on the day there is nothing wrong — a clean file is the goal and most ledgers have no answer for it.
REFERENCES TO DRIVE: GitHub code scanning and Dependabot alerts, SonarQube and CodeClimate issue lists, ESLint and TypeScript problem panes in VS Code (marketing shots), Lighthouse and PageSpeed reports (the scored, grouped, actionable report), axe DevTools and WAVE accessibility reports, Sentry's issue stream and its grouping, Datadog monitors, Xero and QuickBooks' data-health and reconciliation screens (the closest commercial analogue: a business's own books with what is wrong in them), Shopify's product-issue lists, Google Search Console coverage report, and 1Password Watchtower.`,
  },
  {
    key: 'levels',
    port: 5241,
    brief: `SCREEN: LEVELS, at /levels — the price ladder, and it writes real cells.

WHAT THE ENGINE GIVES YOU: src/domain/pricing/levels.ts declares a table's rungs with RungContents (three states, a mandatory source), and src/domain/pricing/apply.ts applies a level across a table — the old repo's suite pinned its central property, "187 cell edits collapse into ONE undo entry", and that batch is src/domain/catalogue/commands.ts's batch, already ported with its tests. The manifest declares priceLevels per table. The ladder is six rungs (Published, Cash, Trade, Sub-dealer, Sub-dealer excluding, AUS Sailing) and the old app left two unreachable. 139 cost columns are named in the manifest and a level may never land on one — the engine refuses it with a sentence.

THE HARD QUESTIONS: (1) a ladder is a matrix of tables × rungs, each cell either a column of the file, empty, or refused — how is that drawn so a dealer reads it in one look rather than as a spreadsheet? (2) how is "this table has no Trade column, so it stays at Sell" said as a fact rather than a hole? (3) applying a level writes hundreds of real cells: what does the app show BEFORE it writes (the counted blast radius the command already computes), and what does Undo look like after? (4) how is the difference between a rung's price and the cash price shown — percentage, delta, or the two figures? (5) cost and margin are on this screen for the dealer and must never leak to a customer surface: how is that boundary drawn so it is visible?
REFERENCES TO DRIVE: Stripe's pricing tables and product catalogue (docs), Shopify's price lists and markets pricing, Chargebee and Paddle price books, Xero and QuickBooks price levels, Salesforce price books (docs), Airtable and Notion's matrix/board views for the tables × rungs shape, Figma's variables panel with modes (the closest thing in design software to one value per mode, and the best drawing of it), Apple's education/business pricing pages, and any B2B distributor portal with tiered pricing.`,
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
log('swept: ' + sweeps.filter(Boolean).map((s, i) => SCREENS[i].key).join(', '))

const found = {}
for (let i = 0; i < SCREENS.length; i++) found[SCREENS[i].key] = sweeps[i]

phase('Build')
const builds = await parallel(
  SCREENS.map((s) => () =>
    agent(
      `You are building a real screen for HL_2.0.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SPEC IS YOUR SWEEP: docs/research/refs/${s.key}/notes.md, written in this same round. THE OWNER HAS HANDED THE PICKS OVER ("go for what u think is awesome and build literally everything please before i review it"), so CHOOSE the direction yourself from the four — but the critic of Milestone 2 found that the obvious picks stamp one narrow-list-left, detail-right composition across a whole milestone, so read the other three screens' notes.md in this round (${SCREENS.map((x) => x.key).join(', ')}) and DO NOT take the composition another of them would obviously take. Say in \`direction\` what you built, why it is right for this screen, and what you deliberately did not take. Look at the frames it leans on before you build.\n\n${s.brief}\n\nOwnership: src/screens/${s.key}/**, src/routes/${s.key}.tsx, e2e/flows/${s.key}.spec.ts, your row in e2e/routes.ts, your door in the shell's one list of doors, and src/domain only for a missing pure derivation with its test. Ports: ${s.port} for Playwright, ${s.port + 1} for vite.\n\nTHE MILESTONE'S EXIT CRITERION IS SHARED AND YOU OWN YOUR HALF OF IT: writing a rule on /rules changes what the configurator refuses on the next pick, with the rule's own "because". If you are the rules builder, prove it end to end in e2e/flows/rules.spec.ts: write a rule, open a draft, see the refusal carry that rule's sentence, switch the rule off, see the option return. If you are another builder, do not break it.`,
      { label: 'build:' + s.key, phase: 'Build', schema: REPORT },
    ),
  ),
)
log('built: ' + builds.filter(Boolean).map((b) => (b && b.direction ? b.direction.slice(0, 60) : '?')).join(' | '))

phase('Verify')
const verify = await agent(
  `You are verifying HL_2.0 as a boat dealer's sales manager would — somebody who reads nothing and expects it to work.\n\n${STATE}\n\nNothing else is running now, so you may run everything. Change only what a command needs to run; report everything else.\n\n1. Full gate: npm test; npm run build; npm run e2e (alone — about 20 minutes idle). Report every number. If a check is red, say whether it is the app or the machine: a 30 s timeout on a walk through the door is the machine, and re-running it alone with --last-failed --timeout 120000 --workers 1 tells you which. Report both readings.\n2. Serve the built app (npx vite preview --port 5261) and DRIVE IT with the browser tools, screenshotting and READING every step: land cold → name → load the file → Home → the pill to every door → Data → a brand plate → the sheet → fold a band, edit a cell, undo it → Rules: WRITE A RULE that blocks something the file pairs → Fitment: see that boat's candidates struck through with reasons → New quote → pick that hull → the configurator refuses the thing your rule blocks, WITH THE RULE'S OWN SENTENCE → switch the rule off, see it return → Levels: apply a rung across a table and undo it → Review: apply one fix and undo it → address the quote, issue it, read the document, print it → Quotes → History → Customers → the finder from every screen.\n3. The same at 390×844 and 1920×1080.\n4. Write docs/directions/built-m3.md: one honest paragraph per screen at each size, screenshots under docs/directions/<screen>/built/. Say plainly where the flow breaks, where it is confusing, where a control does nothing, and where two screens read as the same shape.\n5. REFUSAL ROT: grep every refusal sentence in src/screens/** and src/routes/** and list each with whether it is still TRUE on this tree.\nReport the gate numbers and everything that is wrong.`,
  { label: 'verify', phase: 'Verify' },
)

phase('Critique')
const critic = await agent(
  `You are the independent critic for HL_2.0, read-only except docs/directions/built-critique-m3.md.\n\n${STATE}\n\nJudge the four new screens, and the app they now sit in, as the owner would. Read docs/directions/built-m3.md and look at every screenshot under docs/directions/{rules,fitment,review,levels}/built/ and a sample of the older ones. Read each screen's sweep notes to see what it promised. Then read the source for what a screenshot cannot show. The verify agent's report: ${JSON.stringify(verify).slice(0, 6000)}\n\nFindings, each with a screen and a severity:\n- blocker: an invented rule, figure, count or state; a rule's reason written in a component instead of taken from the engine; a hard-coded colour, face or picture path; text under 4.5:1 on its real ground; anything under 11px; a control that does nothing; a refusal that is false on this tree; a cost column on a customer surface; a write that bypasses the command layer; a derivation in JSX that belongs in src/domain; the words entity / schema / field type / reference on a reader-facing surface; the milestone's exit criterion not actually true end to end.\n- major: two screens that read as one shape; a register under 18 rows at 1280×800 by the ruler's own reading; a layout that fails at 390 or 1920; a shortcut not printed where its act is; a narrowing without its name, its count and a Show all; a struck row that reads as broken; an applied level with no counted radius before it writes; a screen that lost its sweep's own idea.\n- minor: craft.\nThen answer plainly in wouldHeAccept: would the owner accept these four screens on sight, and if not, name the ONE thing to change first. He has rejected five redesigns; flattery costs him money.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps || []) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  const ports = { rules: 5211, fitment: 5221, review: 5231, levels: 5241 }
  await parallel(
    Object.keys(byScreen)
      .slice(0, 8)
      .map((screen, i) => () =>
        agent(
          `You are fixing a built screen of HL_2.0 against an independent critique.\n\n${STATE}\n\n${HOUSE}\n\nTASK: fix the "${screen}" screen. Read docs/directions/built-critique-m3.md and built-m3.md and look at that screen's screenshots.\n\nFound on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major finding and the cheap minor ones. Keep the screen's own idea; answer the criticism rather than flattening it. Re-run your own gate (ports: Playwright ${ports[screen] || 5271 + i * 10}, vite ${(ports[screen] || 5271 + i * 10) + 1}), drive the screen again at 1440×900 and 390×844, look at your screenshots, and report what you changed and what you deliberately did not.`,
          { label: 'fix:' + screen, phase: 'Critique', schema: REPORT },
        ),
      ),
  )
}

const reread = await agent(
  `You are closing Milestone 3 of HL_2.0.\n\n${STATE}\n\nNothing else is running. (1) Grep every refusal and every "not built" / "does not exist" / "yet" sentence in src/screens/** and src/routes/** and make each one TRUE on this tree — retire the ones whose screen now exists by wiring the act to it, keep the ones still true, and make sure every new screen has its door in the shell's one list and is reachable by the finder. (2) Read docs/SCREENS.md: every screen has a row, no two rows share a primary reference set, every status says what is measured. (3) PROVE THE MILESTONE'S EXIT CRITERION end to end and say the numbers: writing a rule changes what the configurator refuses on the next pick with the rule's own "because", and switching it off returns the option. (4) Run the full gate alone — npm test; npm run build; npm run e2e — and report every number; fix what is red if it is the app and say so if it is the machine. (5) Append to docs/STATUS.md under a new dated heading "Milestone 3 is built" with one paragraph per screen saying what was measured on it. Report what you changed.`,
  { label: 'reread', phase: 'Critique', schema: REPORT },
)

return { sweeps: sweeps.filter(Boolean), builds: builds.filter(Boolean), verify, critic, reread }
