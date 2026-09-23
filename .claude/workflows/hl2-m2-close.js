export const meta = {
  name: 'hl2-m2-close',
  description: 'Close Milestone 2 to a higher standard: measure the truth first, redesign the sheet by judged directions, fix every blocker and major, verify alone, re-critique with fresh eyes, and loop until no blocker remains',
  phases: [
    { title: 'Truth', detail: 'the full gate alone, every failure placed on its screen, and one honest density reading' },
    { title: 'Redesign', detail: 'the sheet: three drawn directions, three judges, one build' },
    { title: 'Fix', detail: 'seven fixers on non-colliding screens, two at a time' },
    { title: 'Verify', detail: 'the whole app driven cold at three sizes, re-photographed, gate alone' },
    { title: 'Critique', detail: 'fresh eyes, adversarial; a second fix round only if a blocker or major survives' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

const TRUTH = {
  type: 'object',
  properties: {
    unit: { type: 'string' },
    e2e: { type: 'string' },
    failures: {
      type: 'array',
      items: {
        type: 'object',
        properties: { screen: { type: 'string' }, test: { type: 'string' }, cause: { type: 'string' }, machine: { type: 'boolean' } },
        required: ['screen', 'test', 'cause', 'machine'],
      },
    },
    density: {
      type: 'array',
      items: {
        type: 'object',
        properties: { screen: { type: 'string' }, records: { type: 'integer' }, holds: { type: 'integer' }, owed: { type: 'integer' }, note: { type: 'string' } },
        required: ['screen', 'records', 'holds', 'owed', 'note'],
      },
    },
    rulerChange: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['unit', 'e2e', 'failures', 'density', 'rulerChange', 'notes'],
}

const BOARDS = {
  type: 'object',
  properties: {
    boards: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, name: { type: 'string' }, file: { type: 'string' }, shot: { type: 'string' }, shot390: { type: 'string' }, idea: { type: 'string' }, answers: { type: 'string' } },
        required: ['id', 'name', 'file', 'shot', 'idea', 'answers'],
      },
    },
    reconciliation: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['boards', 'reconciliation', 'notes'],
}

const VOTE = {
  type: 'object',
  properties: {
    pick: { type: 'string' },
    scores: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, score: { type: 'integer' }, why: { type: 'string' } }, required: ['id', 'score', 'why'] } },
    graft: { type: 'string' },
    mustChange: { type: 'string' },
  },
  required: ['pick', 'scores', 'graft', 'mustChange'],
}

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    fixed: { type: 'array', items: { type: 'string' } },
    notFixed: { type: 'array', items: { type: 'string' } },
    measured: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'fixed', 'notFixed', 'measured', 'notes'],
}

const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: { screen: { type: 'string' }, severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, title: { type: 'string' }, detail: { type: 'string' } },
        required: ['screen', 'severity', 'title', 'detail'],
      },
    },
    wouldHeAccept: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['gaps', 'wouldHeAccept', 'summary'],
}

const STATE = `THE STATE. Repo (cwd): ${NEW}. HL_2.0 is a from-scratch rebuild of a quoting and configuration app for Northside Marine, a Brisbane boat dealership, on its real Master Price File (53 tables, 15,691 rows, 8,679 pairings; nothing invented). Thirteen screens are built: entry (/sign-in), home (/), picker (/quote/new), configurator (/quote/$id), cascade, document (/quote/$id/document), quotes (/quotes), Lost, the sheet (/data/$table), history (/history), data (/data), customers (/customers), and the shell — a floating pill over every screen but the door, with a Ctrl K finder, reading the one list of doors in src/app/ways.ts.

Milestone 2 was built and then judged by an independent critic: docs/directions/built-critique-m2.md. ITS VERDICT: "No. He would accept Data, argue about Home, and stop at the sheet." Four blockers, fourteen majors, nine minors, every one tied to a line of source or a named screenshot. READ THAT FILE IN FULL before anything else — it is this round's specification — then docs/STATUS.md (top section), CLAUDE.md (in your context), and docs/directions/built-m2.md (the walk the critique came from).

THIS ROUND'S STANDARD IS HIGHER THAN ANY BEFORE IT. The owner's words, which every judgement here answers to: "it still feels like a database, it is not beautiful enough, it does not feel alive, it is still too complicated"; "the tables — still too complicated and hard to use visually"; "I want the logo to be the showpiece thing"; "blue and white was the brief" and "a bit more colour usage please"; "i can't stress enough how easy this system has to be to use"; "we are supposed to be taking a complicated thing and making it super super easy"; "all of the same functionality, presented beautifully". He has rejected five redesigns on sight. A fix that turns a red check green while leaving the screen as dull as it was is not a fix.`

const RULES = `HOW THIS APP IS BUILT, which every change respects:
- A screen lives in src/screens/<name>/ with its own stylesheet; no shared page component, ever. Its reflow at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 is written in the stylesheet header.
- Every colour, face, size, space, radius, shadow, easing and duration comes from src/styles/tokens.css. tools/check.ts refuses a literal colour, an undeclared var(--x), anything under 11px, a cost column name on a customer surface, and the words entity / schema / field type / reference / UID in a reader-facing string. A value the tokens lack is ADDED to tokens.css with a comment saying where it came from.
- Controls come from src/ui and refuse className and style; extend a primitive rather than working around it.
- Figures are counted from the stores through src/app/useStores.ts, never typed. No customer, quote, figure, count or picture is invented; an empty state is the true state and is drawn to teach.
- A refusal is a sentence with its reason where it is refused, never a disabled control — AND NEVER THE LOUDEST THING ON A SCREEN BEFORE ANYBODY HAS TOUCHED IT (critique #11).
- Every write is a command through src/state/catalogue.ts or src/state/quotes.ts, with an inverse, a said sentence, a typed event, and Undo on the screen.
- A derivation is a pure function in src/domain with a test, never logic in JSX.
- NEW RULES THIS ROUND, app-wide, so every fixer applies them at once without waiting on each other:
  (a) THE PILL CARRIES THE DOORS. A screen's own head never repeats a door the pill already carries (Home, Quotes, Customers, Data, History). It may keep a way back the pill does not carry, named for its destination ("Back to the build"). Critique #13.
  (b) NO KEYCAP ON A COARSE POINTER. No keycap, and no sentence that names a key ("Ctrl K opens the finder"), is shown under (pointer: coarse); the words switch to touch language, as the quotes register's legend already does. Critique #18.
  (c) NO PLAN WORD AND NO ROUTE PATTERN ON A SCREEN. Never "Milestone 6", never "/quote/$id" or "/quote/new" as text. Say what will happen in the dealer's words, and link by address. Critique #14.
  (d) A SCREEN FITS THE WINDOW IT IS DRAWN AT, or scrolls on purpose. Where a screen claims to fit (800 in 800, 900 in 900, 1080 in 1080), a flow test asserts document.scrollingElement.scrollHeight ≤ innerHeight at that size. Critique #10.
  (e) A REGISTER WHOSE REST STATE IS ONE ROW IS NOT DRAWN AS A FULL-HEIGHT FRAME WITH FLOOR SHOWING UNDER IT. Honest emptiness is composed, not left over. Critique #17.
- Do NOT edit docs/SCREENS.md or docs/STATUS.md — report your measured figures in \`measured\` and the closing agent writes them once. APPEND to docs/DECISIONS.md only, with one \`cat >> docs/DECISIONS.md <<'EOF'\` per decision, naming what lost.
- Do NOT touch e2e/rulers/** — the Truth agent reconciled them before you started. You may edit your own route's block in e2e/routes.ts by a targeted Edit, never by rewriting the file.
- Do NOT commit, push, checkout, reset or stash. Another agent is working in the same tree at the same time on other screens; touch only the files your task names.

BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then ONLY your own Playwright: HL2_PREVIEW_PORT=<your port> npx playwright test e2e/flows/<yours>.spec.ts e2e/rulers -g "<your route name>" --workers 1. NEVER the whole suite. Then serve (npx vite --port <your port + 1>) and LOOK at your screen with the browser tools at 1440×900, 1280×800 and 390×844. Save the after-shots over the stale ones in docs/directions/<screen>/built/<screen>-<w>x<h>.png so the evidence matches the tree. Open at most 25 pictures in total; this is a four-core machine and a transcript that reads two hundred PNGs has killed an agent here before. Report only numbers you measured.`

phase('Truth')
const truth = await agent(
  `You are measuring the truth of HL_2.0 before anybody fixes anything, so that every fixer in this round works against what IS rather than against a number somebody wrote down.\n\n${STATE}\n\nNothing else is running; you may run everything.\n\n1. THE GATE, ALONE. npm test; npm run build; npm run e2e. Report the numbers. The critique says e2e had 13 failures. For EVERY failing test: which screen it belongs to, what exactly fails, and whether it is the APP or the MACHINE — re-run the failures alone with npx playwright test --last-failed --timeout 120000 --workers 1 and a failure that passes alone is the machine. Do not fix screens; place each failure on its screen so its fixer owns it.\n\n2. ONE HONEST DENSITY READING. Critique #5: four of five Cockpit registers do not hold 18 rows at 1280×800 by their own flow tests (customers 16, data 16, history 17, the sheet 16 records and capacity 15), yet only the sheet fails the ruler, because e2e/rulers/density.spec.ts asserts Math.max(d.records, d.capacity) and a register's declared room may no longer be its real room since the pill took height. Read e2e/rulers/measure/density.ts, e2e/rulers/density.spec.ts, the \`density\` block of every cockpit route in e2e/routes.ts, and each register's own density assertion in e2e/flows/{quotes,sheet,data,customers,history}.spec.ts. Make them ONE measurement: the ruler is the source of truth, each route declares the room a full list would really have ON THIS TREE with the pill standing, and each flow either reads the ruler's own function or is deleted in favour of it. Keep the proof that the ruler can fail (e2e/rulers/fixture.spec.ts) and extend it if you change the arithmetic. Then report, for each of the five registers, records in view, the rows its room holds at its measured pitch, and 18. A register that fails is the fixer's to fix, not yours: do NOT loosen the ruler to pass it.\n\n3. Record what you changed in the ruler with one dated line appended to docs/DECISIONS.md (cat >>).\n\nOwnership: e2e/rulers/**, the \`density\` blocks and \`ready\` selectors in e2e/routes.ts, the density assertions in the five flow specs. Nothing under src/. Do not commit.`,
  { label: 'truth', phase: 'Truth', schema: TRUTH },
)
const failuresFor = (key) => JSON.stringify(((truth && truth.failures) || []).filter((f) => (f.screen || '').toLowerCase().includes(key)))
const densityFor = (key) => JSON.stringify(((truth && truth.density) || []).filter((d) => (d.screen || '').toLowerCase().includes(key)))
log('truth: ' + (truth ? `${truth.unit} · ${truth.e2e} · ${truth.failures.length} failures placed` : 'none'))

const SHEET_BRIEF = `THE SHEET, at /data/$table. The critic's one thing to change first, and a REDESIGN, not a fix: "It is the screen that reproduces, exactly, the sentence that killed five redesigns: 'it still feels like a database', 'the tables — still too complicated and hard to use visually'." Read src/screens/sheet/ (5,160 lines today), its sweep docs/research/refs/sheet/notes.md (and its §7), docs/reference/dense-tables-and-selection.md, and the engine it sits on: src/domain/catalogue/table/core/, sections.ts, grouping.ts, helpers.ts, outline.ts, facets.ts, jobs.ts — a GridModel selector and a dumb renderer, where folding a band removes cells from the addressable set so navigation, paste and fill never learn that sections exist. The engine stays; the drawing is what failed.

WHAT FAILED, from the critique, every item of which the redesign must answer: (22) five of 33 columns fill 990px at 1440 and three of the five carry nothing a dealer reads — MATRIX prints "Highfield Inflatables" on all 588 rows, IMAGE LINK draws a boat on water at 34×24px as a white smudge beside rows that say "held as a link", VARIANT repeats four values down the page; (11) the record panel rests on an ADD A COLUMN form with an amber act already refusing, as the most prominent thing on first paint; (1) ?at= is read as a boolean at Sheet.tsx:294 and thrown away, so a row found in the finder opens row 1 of 588 — the shell's headline claim is false; (12) folding a band and then editing any cell throws every fold away; (5) 16 records in view and a capacity of 15 at 1280×800 against 18 owed; (6) its body is the same list-left, detail-right composition as /quotes and /data's plate state, at the same --spacing(90) panel token; (13) four ways back and the word "Data" three times; (20) at 390 the sentence explaining the reduced grid is clipped by the floating tab bar.

THE PRINCIPLES A NON-SPREADSHEET SHEET IS BUILT ON — the directions must each answer all of them, differently:
- A COLUMN THAT SAYS ONE THING IS NOT A COLUMN. A value constant across the view, or across a band, is a fact about the group and is said once — in the table's head or the band's head — never 588 times. That detection is a pure derivation in src/domain with a test (e.g. what is constant across these rows, and what is constant within each band).
- COLUMNS ARE CHOSEN BY WHAT A DEALER READS, not by the file's order: the name, the figure at the rung, the material, the colourway, the code he orders by. The other twenty-odd are one press away, never gone.
- A PICTURE IS DRAWN AT A SIZE WORTH DRAWING, OR NOT IN THE GRID. A model's held photograph belongs at model level, large enough to recognise the boat — not as a 34px smudge per row.
- THE REST STATE IS THE WORK, never a form. Structural acts (add a column) live behind an explicit act a dealer chose to press.
- EIGHTEEN RECORDS AT 1280×800, by the ruler, with the pill standing.
- IT IS NOT /quotes. Its silhouette at rest must differ from the register's list-and-peek-panel; no permanently reserved right column at the shared panel width.
- It keeps every function the sheet has today: edit in place with the read state a real button and the engine's refusal in the cell, fill with Undo, the three doors (register, gallery, record), the keyboard vocabulary printed where its acts are (and never on a coarse pointer), pairing tables read boat side first, a cost column said to be cost at its head.`

phase('Redesign')
const boards = await agent(
  `You are the designer for one screen of HL_2.0, and you are drawing, not building.\n\n${STATE}\n\n${SHEET_BRIEF}\n\nTASK.\n1. RECONCILE FIRST, in writing: read docs/reference/dense-tables-and-selection.md against src/domain/catalogue/table/helpers.ts and outline.ts and the sheet's notes §7, and say in \`reconciliation\` where the published numbers and the engine agree, where they disagree, and what each direction below does about it. The critic says this was never done properly before the grid was written; it is done before these boards are.\n2. DRAW THREE DIRECTIONS for the sheet's resting state, each a genuinely different COMPOSITION and a different ORDER AND GROUPING of the content — never the same stack on a different ground, which is the fault this repo's critics catch every round. Each is a self-contained HTML board at 1440×900 in docs/directions/sheet-redesign/, drawn on the REAL Highfield Inflatables table (read data/northside/tables/boat_highfield.json and data/northside/entities.json and data/northside/images.json — real names, real figures, real held pictures by their public/seed-images path), plus the same board at 390×844. Use the app's own tokens (copy the custom properties you need from src/styles/tokens.css into the board, never an invented colour). Write docs/directions/sheet-redesign/canvas.json in the shape tools/research/board.ts reads and run npx tsx tools/research/board.ts sheet-redesign; screenshot every board with npx tsx tools/research/shots.ts sheet-redesign (read both tools first) and LOOK at every shot.\n3. On each board, in a strip beneath it: its idea in one sentence, how it answers each principle above, its 18-row arithmetic at 1280×800, how it differs in silhouette from /quotes (look at docs/directions/quotes/built/), and what a second dealership replaces.\n\nReturn the three boards with their files, their 1440 and 390 shots, their idea, and \`answers\` — how each answers the critique's eight items. Change nothing under src/. Do not commit.`,
  { label: 'sheet:boards', phase: 'Redesign', schema: BOARDS },
)

const LENSES = [
  'THE OWNER. You are Asaf, who owns this business and has rejected five redesigns on sight. You judge by eye, in the first three seconds, against the best boat and car configurators in the world, and your standing complaints are "it still feels like a database" and "the tables — still too complicated and hard to use visually". Which of these would you NOT reject?',
  'THE DEALER AT THE DESK. You are a boat dealership sales manager with a customer standing beside you, a price to find, and no patience for software. You read nothing. Which of these lets you find the SP560 in hypalon, see what it costs at trade, and change one figure, fastest and with least thought — and which would you still be using happily at 5pm?',
  'THE INFORMATION DESIGNER. You judge density, scan path, hierarchy and honesty: whether the eye lands on the useful thing, whether a repeated value is said once, whether a picture is drawn at a size worth drawing, whether eighteen records genuinely fit at 1280×800, and whether it reads at 390px. Which is the best-designed information here, and which only looks it?',
]

const votes = boards
  ? await parallel(
      LENSES.map((lens, i) => () =>
        agent(
          `You are one of three independent judges choosing a direction for one screen of HL_2.0. Judge ONLY through your lens; two other judges have the others.\n\n${STATE}\n\n${SHEET_BRIEF}\n\nYOUR LENS: ${lens}\n\nTHE BOARDS: ${JSON.stringify(boards.boards)}\n\nOpen every board's 1440 and 390 shot with the Read tool (they are PNGs) and, if a shot is missing, the canvas at docs/directions/sheet-redesign/canvas.html. Look at docs/directions/sheet/built/sheet-1440x900.png too — that is what is being replaced — and docs/directions/quotes/built/ for the shape it must not become. Score each 1–10 through your lens with a one-sentence why; \`pick\` the id you would build; \`graft\` the one idea from a board you did not pick that the winner must steal; \`mustChange\` the one thing about your pick that must change before it is built. Honest scores: the owner has rejected five redesigns and flattery costs him money. Change nothing.`,
          { label: 'sheet:judge' + (i + 1), phase: 'Redesign', schema: VOTE },
        ),
      ),
    )
  : []
const tally = {}
for (const v of votes.filter(Boolean)) for (const s of v.scores) tally[s.id] = (tally[s.id] || 0) + s.score
const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0]
log('sheet: ' + JSON.stringify(tally) + ' → ' + winner)

const FIXERS = [
  {
    key: 'history',
    port: 5611,
    task: `HISTORY, at /history. From the critique: #4 BLOCKER — the day's kinds print in an order that cannot have happened and that changes between runs ("addressed · started · issued" at 1440, "issued · addressed · started" at 390). src/domain/quote/diary/days.ts:218 promises kinds "in the order they first happened that day"; on a minted walk events share an instant, the sort is stable, and the order falls back to however the store returned them. Fix it in the ENGINE with a test: within one quote, events are ordered by instant and then by their position in that quote's own event log, which is append order and is the truth; add the shared-instant case and the two-runs-must-agree case to days.test.ts. #14 — History.tsx prints "/quote/$id", "/quote/$id/document" and "/quote/new" as text in normal operation (lines ~1095 and ~1256-1257): say it in words and link. #17 — one line and ~700px of nothing at 1440: compose honest emptiness (rule e). #5 — the register must hold 18 by the ruler at 1280×800. #18 — no keycaps at 390 (rule b). Ownership: src/screens/history/**, src/domain/quote/diary/days.ts and its test, e2e/flows/history.spec.ts.`,
  },
  {
    key: 'shell',
    port: 5621,
    task: `THE SHELL — the pill and the finder. From the critique: #9 — the pill says "Quotes 0" beside a register that says one quote is filed; Shell.tsx ~384 returns seen.drafts for /quotes under its own comment "THE DOOR COUNTS WHAT THE SCREEN BEHIND IT COUNTS". Count what /quotes counts. #21 — the crest is an empty blue disc before a file is read (Pill.tsx ~106, initialsOf(null)); "I want the logo to be the showpiece thing" — the only mark in the app must never be a hole: before a business is named, draw something honest and designed (the product's own name, or the person's initials from the session, and say which and why). #18 — rule (b): make src/ui/Kbd hide itself under (pointer: coarse), and switch every shell sentence that names a key to touch language; this is the app-wide half and other fixers rely on it. #13 — rule (a): check the shell's own ‹ back is named for its destination and never duplicates a door. Also LOOK HARD at the pill over the five showroom screens (entry has none; home, picker, configurator, cascade, document) at 1440 and 390 and say whether it flattens a full-bleed photograph; the owner will see the pill before anything else. Ownership: src/screens/shell/**, src/domain/shell/**, src/app/ways.ts and its test, src/ui/Kbd.tsx and its stylesheet, e2e/flows/shell.spec.ts EXCEPT its ?at= block (the sheet's builder owns row-opening).`,
  },
  {
    key: 'picker',
    port: 5631,
    task: `THE PICKER AND THE CONFIGURATOR, the two screens the sale starts on. From the critique: #3 BLOCKER — on a multi-colourway model (the ADV7) the amber "Start the quote" reads live and its sentence says "Choose a colourway above and this becomes live", but there is nothing above it: the seven colourway chips are 326px down a 320px port with no visible scrollbar. The choice the act waits on must be visible where the act is, at every size; a refusal that points at a place where the thing is not is false. #27 — Picker.tsx ~100 NO_CONFIGURATOR ("the configurator … is not built yet") is a false refusal pinned by Picker.test.tsx ~300 and a comment in src/routes/quote.new.tsx ~97: retire the constant, the test and the comment. #8 — the configurator's masthead and its sticky search field overlap by 32.69px at 1280, 1440 and 1920 (e2e/flows/configurator.spec.ts ~397) since the masthead grew to clear the pill; on the screen where the sale happens. #24 — the stage shows a Mercury on the hull while the quote's motor is a Yamaha F90XB; the customer reads the picture. A picture belongs only to what it depicts and is never swapped for a stand-in: say it honestly in the caption (what the photograph shows, and that this quote's motor is the one in the chapter), and never crop to hide it. #14 — the configurator's "…arrives with the backend at Milestone 6" (rule c). #25 — "1 of them carry no price at all": plural agreement on a counted figure, everywhere that sentence is built. Ownership: src/screens/picker/**, src/screens/configurator/**, src/routes/quote.new.tsx, e2e/flows/picker.spec.ts, e2e/flows/configurator.spec.ts.`,
  },
  {
    key: 'document',
    port: 5641,
    task: `THE DOCUMENT AND THE DOOR. From the critique: #2 BLOCKER — "The one object that leaves the building has no dealership on it." src/domain/quote/document.ts ~409 freezes business from quote.organisation; freeze.ts ~615 takes that from ctx.org?.name; this pack has no organisation record, so page 1 of the customer's quotation reads "This business has not been named yet" while the pill above says Northside Marine (read off the manifest into catalogue.business). The file DOES name the business; that is a fact from the file. Fix it where the app builds the engine's context — ctxFrom in src/state/catalogue.ts, which every screen that freezes calls — so that with no organisation record the context carries the business the loaded file names, with provenance that says it came from the file, and an organisation record set later (Milestone 4's /manage) overrides it. Prove with tests that a quote frozen on this pack prints Northside Marine on the paper, that an organisation record wins over the file's name, and that src/domain/quote/golden.test.ts is untouched and green (it must be; if it is not, your fix is in the wrong layer). #14 — rule (c): the entry screen and the document each end a sentence with "…arrives with the backend at Milestone 6"; say what will happen in the dealer's words. Also read the document at 1440 and 390 as the CUSTOMER who is handed it: anything on the paper that is the app talking to itself rather than the dealership talking to its customer is a finding — fix it or name it. Ownership: src/screens/document/**, src/screens/entry/**, ctxFrom in src/state/catalogue.ts and its test, src/domain/quote/document.ts and freeze.ts only if the context route genuinely cannot carry it (say why), e2e/flows/document.spec.ts, e2e/flows/entry.spec.ts.`,
  },
  {
    key: 'home',
    port: 5651,
    task: `HOME AND LOST. From the critique: #10 — Home no longer fits the windows it was drawn at: 915px in 900, 822 in 800, 1,084 in 1,080, and the last line of the drafts column is sliced by the bottom edge; Lost is 867 in 844 and 838 in 800. Make them fit (rule d) and add the scrollHeight assertion at 1280×800, 1440×900 and 1920×1080 so this can never silently return. #23 — Home's drafts empty state is a wireframe: a diagram of labelled empty boxes ("THE BOAT'S OWN PHOTOGRAPH", "MOTOR", "WHO IT IS FOR", "WHERE THE ACT THAT OPENS IT WILL SIT") where every other empty state is a sentence. It is "the weakest object on the best screen." Replace it with something as good as the rest of Home. #18 — rule (b): "Ctrl K opens the finder" at 390. Home is the second screen the owner sees; look at it at 1440, 1280, 1920 and 390 and make it the best it can be within its direction ("Cinema day"). Ownership: src/screens/home/**, src/screens/lost/**, e2e/flows/home.spec.ts, e2e/flows/lost.spec.ts (create it if absent).`,
  },
  {
    key: 'customers',
    port: 5661,
    task: `CUSTOMERS, at /customers. From the critique: #5 — 16 rows at 1280×800 against 18 owed. #10 — 1,171 and 1,320px against an 800px laptop, so the filing form is always below the fold on the dealer's own machine. #11 — it rests with an amber "File the first customer" under "A person needs a name before they can be filed" — the brightest thing on the screen refuses before anybody touched it. #16 — after "J. Harrow is filed, and the book was made to hold them · Undo", the header still says "1 NAME TYPED ON QUOTES, NOT FILED" and the person's own page says "IN THE BOOK · NO QUOTES". The engine is right — a given quote keeps the name it was given, frozen — and the screen contradicts the dealer about the act he just performed. Resolve it within the engine's truth: when a filed person has exactly the name a quote was given, say that relation plainly (the quote was given to that name before they were filed, and keeps it as given) rather than counting the name as unfiled or the person as having no quotes; the reading belongs in src/domain/people/book.ts with a test. #17 — at 1920 a 720px column with ~600px of dark on each side (rule e). The critic called this screen's teaching state "the best-written empty state in the repository" — keep it. Ownership: src/screens/customers/**, src/domain/people/book.ts and its test, e2e/flows/customers.spec.ts.`,
  },
  {
    key: 'data',
    port: 5671,
    task: `DATA AND THE QUOTES REGISTER. From the critique: Data is "the best screen this round built" — keep what made it so. #6 — pressing a plate, Data's only act, draws the same list-left, detail-right composition as /quotes and the sheet at the same --spacing(90) panel token (three token names, one value, one set of steps): "the assignment moved the repetition behind a state rather than removing it." Redesign Data's pressed-plate state so it is not that shape — the brand's page should feel like opening that brand, not a peek panel. The quotes register keeps its peek panel; it had the shape first. #5 — Data holds 16 at 1280×800; make it 18 by the ruler. #19 — at 390 the find field's placeholder is cut mid-word ("…the workbook it came fro"). #26 — docs/directions/data/built/data-1920x1080-plate.png is a shot of the sheet: retake Data's plate state at 1920. /quotes #15 — during the read it prints "No price file is open in this browser" and "This business has not been named yet"; Home, Data, the sheet and Customers all say "Looking for a price file in this browser…" — give it the same honest reading state. /quotes #17 — 530px of dark floor under the frame at 1440 with one quote filed (rule e). Ownership: src/screens/data/**, src/screens/quotes/**, e2e/flows/data.spec.ts, e2e/flows/quotes.spec.ts.`,
  },
]

phase('Fix')
const sheetTrack = async () => {
  if (!winner) return null
  const board = (boards.boards || []).find((b) => b.id === winner)
  return agent(
    `You are building a redesigned screen for HL_2.0.\n\n${STATE}\n\n${RULES}\n\n${SHEET_BRIEF}\n\nTHE DIRECTION WAS CHOSEN BY THREE JUDGES. The winner is "${winner}": ${JSON.stringify(board)}. Scores: ${JSON.stringify(tally)}. The judges' notes — each one's pick, the idea to graft from a losing board, and the one thing that must change before it is built: ${JSON.stringify(votes.filter(Boolean))}. The designer's reconciliation of the published table numbers against the engine: ${boards ? JSON.stringify(boards.reconciliation) : '(none)'}. Open the winning board's shots and its HTML under docs/directions/sheet-redesign/ before you write a line.\n\nBUILD IT in src/screens/sheet/, replacing the drawing and keeping the engine. Every one of the critique's eight sheet items must be answered and proved: (1) a row found in the finder opens THAT row with its record showing — assert it in e2e/flows/sheet.spec.ts by typing in the finder and reading the open record's name, and also strengthen e2e/flows/shell.spec.ts's ?at= block (you own that block) to assert the row, not just the parameter; (12) folds survive every write — assert it; (5) 18 records at 1280×800 by the ruler; (22) no constant column drawn as a column, pictures at a size worth drawing, the columns a dealer reads first; (11) the rest state is the work, the structural act behind a press; (6) its silhouette is not /quotes; (13) rule (a); (20) nothing clipped by the tab bar at 390. Put the constant-column derivation in src/domain with a test. Keep every function the sheet has today and every test that pins one — a test deleted must be replaced by one that pins the same property.\n\nFailures the Truth agent placed on this screen: ${failuresFor('sheet')}. Density measured: ${densityFor('sheet')}.\n\nOwnership: src/screens/sheet/**, src/routes/data.$table.tsx, src/domain/catalogue/table/ (new pure derivations with tests), e2e/flows/sheet.spec.ts, the ?at= block of e2e/flows/shell.spec.ts. Ports: Playwright 5691, vite 5692.`,
    { label: 'sheet:build', phase: 'Fix', schema: REPORT },
  )
}

const results = await parallel([
  () => sheetTrack(),
  ...FIXERS.map((f) => () =>
    agent(
      `You are fixing HL_2.0 against an independent critique.\n\n${STATE}\n\n${RULES}\n\nYOUR TASK: ${f.task}\n\nFailures the Truth agent placed on your screens (the full gate, run alone before you started): ${failuresFor(f.key)}\nDensity measured by the reconciled ruler: ${densityFor(f.key)}\n\nFix every blocker and major the task names and the cheap minors, keep each screen's own idea — answer the criticism, do not flatten the screen — and then look at it as the owner will and ask whether it is BEAUTIFUL, not just whether it is green. Your ports: Playwright ${f.port}, vite ${f.port + 1}.\n\nReport \`fixed\` (each critique item you closed and how, with the measurement), \`notFixed\` (each you did not, and why), and \`measured\` (the figures the closing agent will write into docs/SCREENS.md: rows at 1280×800, heights at each claimed fit, anything else you measured).`,
      { label: 'fix:' + f.key, phase: 'Fix', schema: REPORT },
    ),
  ),
])
const fixReports = results.filter(Boolean)
log('fixed: ' + fixReports.length + ' of ' + (FIXERS.length + 1))

const VERIFY = (round) =>
  `You are verifying HL_2.0 after a fix round, as a boat dealer's sales manager would — somebody who reads nothing and expects it to work.\n\n${STATE}\n\nThe fixers' reports: ${JSON.stringify(results.map((r) => r && { fixed: r.fixed, notFixed: r.notFixed, measured: r.measured, gateGreen: r.gateGreen })).slice(0, 12000)}\n\nNothing else is running now; you may run everything. Change only what a command needs to run.\n1. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Report every number. Anything red: re-run it alone with --last-failed --timeout 120000 --workers 1 and say whether it is the app or the machine. If it is the app, FIX IT — this is the last hands on the tree this round — and say what you fixed.\n2. Serve the built app (npx vite preview --port 5701) and DRIVE THE WHOLE APP cold with the browser tools, screenshotting and READING every step: door → name → load the file → home → the pill to every door → data → a plate → the sheet → the finder: type a Highfield model and land on its row with its record open → fold a band, edit a cell, undo it, the fold still there → customers → new quote → the ADV7 with its colourways → the configurator → a cascade → address it → issue → the document (the dealership named on page 1) → quotes (the pill's count agreeing) → history (the day in the order it happened) → customers after the sale → reload and check it is all still there. The same at 390×844 and 1920×1080.\n3. Re-photograph EVERY screen at 1440×900, 1280×800, 1920×1080 and 390×844 into docs/directions/<screen>/built/ so the evidence matches the tree; delete a stale FAULT-*.png whose fault is fixed and say so.\n4. Write docs/directions/built-m2-close${round}.md: per screen, what changed, what it looks like now at each size, and anything still wrong.\n5. Update docs/SCREENS.md's measured figures for every screen touched this round from what IS measured now (the critique found three stale), and prepend a short dated section to docs/STATUS.md with the gate numbers and what this round closed.\nReport the gate numbers and everything still wrong.`

phase('Verify')
const verify = await agent(VERIFY(''), { label: 'verify', phase: 'Verify' })

phase('Critique')
const CRITIC = (round, prior) =>
  `You are an independent critic for HL_2.0, and you have never seen it before. Read-only except docs/directions/built-critique-m2-close${round}.md.\n\n${STATE}\n\nThe previous critique (docs/directions/built-critique-m2.md) found four blockers and fourteen majors; a round of fixes and a redesign of the sheet has just landed. The verifier's report: ${JSON.stringify(prior).slice(0, 8000)}\n\nJUDGE THE APP AS IT IS NOW, not the list: read docs/directions/built-m2-close${round}.md, look at every screenshot under docs/directions/*/built/ for the thirteen screens, read the source for what a screenshot cannot show, and serve it yourself (npm run build && npx vite preview --port 5711) to drive anything a still cannot prove. Be adversarial: for each of the previous critique's 27 items, say CLOSED or OPEN with the evidence — a claimed fix you cannot see is open — and then find what is NEW. Hold the sheet to the owner's own sentence: does it still feel like a database?\n\nFindings with a screen and a severity (blocker: invented data; a false refusal; a control that does nothing; text under 4.5:1; anything under 11px; a cost column on a customer surface; a write that bypasses the command layer; a derivation in JSX; a reader-facing plan word or route pattern; a screen that does not do what its row in docs/SCREENS.md says. major: two screens one shape; a register under 18 rows at 1280×800 by the ruler; a layout that fails at 390 or 1920; a refusal as the loudest thing at rest; a screen that fits no window it claims to; a keycap on a coarse pointer; a screen that lost its own idea; anything the owner would name within a minute. minor: craft). Then wouldHeAccept: would the owner accept these thirteen screens on sight, and if not, the ONE thing to change first. He has rejected five redesigns; flattery costs him money.`

const critic = await agent(CRITIC('', verify), { label: 'critic', phase: 'Critique', schema: GAPS })
let serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
log('critic: ' + serious.length + ' blockers/majors survive')

let round2 = null
let critic2 = null
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  const screens = Object.keys(byScreen).filter((s) => byScreen[s].some((g) => g.severity !== 'minor')).slice(0, 10)
  round2 = await parallel(
    screens.map((screen, i) => () =>
      agent(
        `You are fixing HL_2.0 against a second, independent critique.\n\n${STATE}\n\n${RULES}\n\nTHE SECOND CRITIQUE is docs/directions/built-critique-m2-close.md — read it whole. YOUR SCREEN: "${screen}". Found on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major and the cheap minors. Keep the screen's own idea. Look at it at 1440×900, 1280×800 and 390×844 and ask whether it is beautiful, not only whether it is green. Your ports: Playwright ${5721 + i * 4}, vite ${5722 + i * 4}. Touch only the files that belong to that screen — other fixers are working beside you — and if a finding needs a file another screen owns, say so in notFixed rather than editing it.`,
        { label: 'fix2:' + screen, phase: 'Critique', schema: REPORT },
      ),
    ),
  )
  const verify2 = await agent(VERIFY('-2'), { label: 'verify2', phase: 'Critique' })
  critic2 = await agent(CRITIC('-2', verify2), { label: 'critic2', phase: 'Critique', schema: GAPS })
  serious = ((critic2 && critic2.gaps) || []).filter((g) => g.severity !== 'minor')
  log('critic2: ' + serious.length + ' blockers/majors survive')
}

return {
  truth,
  boards: boards && boards.boards.map((b) => ({ id: b.id, name: b.name, idea: b.idea })),
  tally,
  winner,
  fixed: results.map((r) => r && { fixed: r.fixed, notFixed: r.notFixed, measured: r.measured, gateGreen: r.gateGreen }),
  verify: typeof verify === 'string' ? verify.slice(0, 4000) : verify,
  critic: critic && { wouldHeAccept: critic.wouldHeAccept, summary: critic.summary, serious: critic.gaps.filter((g) => g.severity !== 'minor').map((g) => `${g.severity} | ${g.screen} | ${g.title}`) },
  round2: round2 && round2.filter(Boolean).map((r) => ({ fixed: r.fixed, notFixed: r.notFixed })),
  critic2: critic2 && { wouldHeAccept: critic2.wouldHeAccept, summary: critic2.summary, serious: critic2.gaps.filter((g) => g.severity !== 'minor').map((g) => `${g.severity} | ${g.screen} | ${g.title}`) },
}