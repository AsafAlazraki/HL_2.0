export const meta = {
  name: 'hl2-build-m2',
  description: 'Build Milestone 2: the sheet, history, data, customers, then the shell; verify the whole app, critique, fix, and re-read every refusal',
  phases: [
    { title: 'Registers', detail: 'the sheet and history, two at a time' },
    { title: 'Doors', detail: 'data and customers, which link into the sheet and the sale' },
    { title: 'Shell', detail: 'the way between screens, on top of twelve real routes' },
    { title: 'Verify', detail: 'full gate alone, then a clueless-user walk of the whole app' },
    { title: 'Critique', detail: 'independent judgement, fixes, and a re-read of every refusal sentence' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

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

const COMMON = `You are building a real screen for HL_2.0. Repo (cwd): ${NEW}. Do NOT commit, push, checkout, reset or stash. Other builders are working in the same tree at the same time on other screens: touch only what your task names, and APPEND to docs/DECISIONS.md and docs/SCREENS.md with one \`cat >> file <<'EOF'\` each — never rewrite either file, another builder may be appending at the same moment.

THE STATE. Milestone 1, the whole selling flow, is built and green: entry, home, picker, configurator, cascade, document, the quotes register, and Lost. Milestone 2's engine is in: the catalogue write commands (src/domain/catalogue/commands.ts, applied through src/state/catalogue.ts with inverses, typed events and a write-behind). 172 test files, 2,891 tests, 14 static guard rules, all green. Read docs/STATUS.md (the top two sections), then CLAUDE.md (in your context), then READ THREE BUILT SCREENS: src/screens/quotes/Quotes.tsx with quotes.css (the Cockpit house style: a dense register, the keyboard vocabulary with shortcuts printed inline, the peek panel, the empty state that teaches), src/screens/configurator/Configurator.tsx (how a command is applied and undone from a screen), src/screens/home/Home.tsx (how a figure is counted from the store, how a picture is taken from a ledger by id). Match that standard; do not invent a second way.

YOUR SPEC IS THE SWEEP, AND THE CRITIC. docs/research/refs/<screen>/notes.md holds the named patterns, the things to avoid tied to frames, and the directions; docs/research/refs/critique-m2.md is the independent critic's reading of all five sweeps — READ YOUR SCREEN'S FINDINGS IN IT and answer each one in what you build or in \`notes\`. The owner has handed the picks over ("go for what u think is awesome and build literally everything please before i review it"), and this round ASSIGNS the composition per screen because the critic found that the obvious picks would stamp one list-left, detail-right shape across four Cockpit screens. Build the assigned direction; take the best idea of each lost direction where the sweep names it; say in \`direction\` what you built and in two sentences why the assignment holds. Look at the frames your direction leans on (the Read tool renders PNGs; they are under docs/research/refs/<screen>/). Every screen is provisional in docs/SCREENS.md until the owner looks.

HOW A SCREEN IS BUILT HERE:
- src/screens/<name>/ with its own stylesheet, and a file route under src/routes/. No shared page component, ever. Write the reflow at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 into the stylesheet header as the built screens do.
- Every colour, face, size, space, radius, shadow, easing and duration from src/styles/tokens.css. tools/check.ts refuses a literal colour, an undeclared var(--x), anything under 11px, a cost column name on a screen, and the words entity / schema / field type / reference / UID in a reader-facing string. If you need a value the tokens lack, ADD IT to tokens.css with a comment saying where it came from.
- Controls from src/ui (Button with refusedBecause, Dialog, Field, Input, Figure, Kbd, keys.ts for the Escape ladder). They refuse className and style by design; extend a primitive rather than working around it, and say so.
- Figures are COUNTED from the loaded catalogue and the quotes store through src/app/useStores.ts, never typed.
- A quote changes only through src/state/quotes.ts; the catalogue changes only through src/state/catalogue.ts's apply — a command with an inverse, a said sentence and a typed event. Undo is on every write, on the screen, pinned to the event (the configurator's rail head is the pattern, not a toast). An issued quote refuses an edit with a sentence.
- A position inside a screen is a URL search param. A derivation is a pure function in src/domain with a test; if something the engine should own is missing, put it there with a test and say so.
- No fake data: no invented customer, quote, figure, count or photograph. An empty state is the true state and is drawn to teach.
- Cost and margin never reach a customer-facing surface; the manifest names 139 cost columns and the guard checks. A Cockpit screen the DEALER works in may show a cost column where the sheet carries one — the sheet is the dealer's own file — but never on anything a customer sees.
- A refusal is a sentence with its reason where it is refused, never a disabled control. Never "not built yet" for a screen that exists: /quotes, /quote/new, /quote/$id, /quote/$id/cascade, /quote/$id/document all exist; /data, /data/$table, /customers, /history are being built in this round — link to them by address, and where you must say a screen is not there yet, say it in ONE constant so the re-read pass can retire it.
- A COCKPIT REGISTER OWES 18 READABLE ROWS AT 1280×800. The density ruler (e2e/rulers/measure/density.ts) reads two things off a real row: the records in view, and the records the room would hold at the measured pitch; the room is declared per route in e2e/routes.ts as \`density: { room, minus }\`. The measured room on the quotes register is 657px less 72px of band heads. Keyboard: the Linear vocabulary the sweeps name, every act keyboard-reachable with its shortcut printed inline.
- JOIN e2e/routes.ts: register 'cockpit', a \`ready\` selector that exists only once the screen has really read what it draws, an \`arrive\` mode ('through-the-door' loads the file; 'with-a-document' mints a quote first — extend e2e/shots/recipe.ts's open() if your screen needs a walk it does not yet have, and say how), and \`density\` for a register. Then the five rulers measure you at six viewports. Add e2e/flows/<screen>.spec.ts for what the rulers cannot see.
- Responsive at every size. The primary act never becomes a floating bottom bar — the owner called that shape disgusting.
- Customisation by token (docs/CUSTOMISATION.md): a second dealership replaces the mark, the accent, the density. Nothing hard-codes a colour, a face or a picture path.

PORTS AND SERVERS, because two builders run at once: NEVER run the whole e2e suite — it takes 36 minutes and times out under contention. Run only yours: HL2_PREVIEW_PORT=<yours> npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<your route name>". Serve for looking with: npx vite --port <yours+1>, and drive it with the browser tools at 1440×900 and 390×844 — read your own screenshots and fix what is wrong before you report. Your ports are in your task.

BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then your Playwright run. Component tests beside the screen, in happy-dom, BY ROLE AND TEXT. Report only numbers you measured. Append your row to docs/SCREENS.md (primary references that no other row shares; status "built, PROVISIONAL") and a dated one-liner to docs/DECISIONS.md naming the direction and what lost.

THE OWNER'S STANDARD: five redesigns rejected on sight; "it still feels like a database, it is not beautiful enough, it does not feel alive"; "the tables — still too complicated and hard to use visually"; "I want the logo to be the showpiece thing"; "blue and white was the brief" and "a bit more colour usage please"; "i can't stress enough how easy this system has to be to use"; "we are supposed to be taking a complicated thing and making it super super easy"; "all of the same functionality, presented beautifully"; "I WANT THE DATA STUFF AS ITS OWN MENU ITEM. NOT UNDER ADMIN!". A user never sees the words entity, schema, field type or reference.`

phase('Registers')
const registers = await parallel([
  () =>
    agent(
      COMMON +
        `

TASK: build THE SHEET, at /data/$table — one table, dense, worked in, edited in place. ASSIGNED: direction A, "The outline", as the resting register: one full-width grid ordered as the file, the hierarchy as bands with a depth ladder and a count on every band, identity pinned, sections folding to chips. PLUS the two other doors the plan demands, designed together and never a grid as the only door: B's gallery (the unit is the model, a card per model under its series, opening to its rows) as a head toggle, and C's record (the row as a spec sheet under the table's own section headings, every value a button) as the side panel that keeps the row lit. D's "two identities" idea is kept for a pairing table: on a join, the master is the boat side via buildGroups(rows, [boatFieldId]) — the critic's §5 says the sweep never said this; you say it.

THE ENGINE IS PORTED AND PURE — USE IT: src/domain/catalogue/table/core/ (view, geometry, keys, clipboard, coerce: a GridModel selector and a dumb renderer), sections.ts, grouping.ts, helpers.ts (ROW_H 28, group line 30, add line 24, heading 34, band 22, column floor 116), facets.ts, jobs.ts, headerHeight.ts, nameColumnWidth.ts, tableLod.ts, coverPhoto.ts; src/domain/catalogue/commands.ts + src/state/catalogue.ts for every write (updateCell, addRow, deleteRow, the batch, with counted blast radii and inverses); src/domain/catalogue/sheet.ts, columnFacts.ts, dependents.ts. Folding a band removes cells from the addressable set so navigation, paste and fill never learn that sections exist — keep that true. Virtualise rows (react-virtuoso or @tanstack/react-virtual are on the owner's list; check package.json and adopt).

THE CRITIC'S FINDINGS ON THIS SWEEP, which you answer: (1) docs/reference/dense-tables-and-selection.md was never cited — read it against helpers.ts and WRITE THE PARAGRAPH where the published numbers and the ported engine disagree (150px vs the engine's 116px column floor; 32px default vs ROW_H 28; fixed layout above twelve columns vs FIT; WCAG 2.1.4 vs keys.ts), decide each, and record the decision. (2) The resting direction reads 17.6 rows on the median Highfield model when its bands are open, against the 18 owed — decide how the resting state holds 18 (what rests folded, what a band costs) and MEASURE it with the density ruler at 1280×800 on Highfield Inflatables, the file's worst table, and say the number. (3) Every act keyboard-reachable with its shortcut inline: X select, J/K and arrows, Shift+arrows extend, Ctrl+A, Esc, Space peek (tap sticky, hold temporary), Enter edits, in-cell error pill never a toast; the read state of a cell is a real button. (4) Fill with UNDO through the batch command. (5) An image cell draws the held copy from the ledger or says "held as a link", at 24 / 32 / 44px. (6) 390px: the record door survives in a hand; say what the grid becomes.

TABLES TO BUILD AND MEASURE ON: Highfield Inflatables (588 rows, series ▸ model ▸ variant, 33 columns, 8 sections, seven colourway codes of which I, O, R, WH are undecoded — shown as the codes they are), Highfield × Yamaha (2,519 pairing rows), Parts (2,937), Dealer Fit Packages (two columns named Code), Haines Signature (9 rows). A cost column on this sheet is the dealer's own and may be shown here — say which columns the file marks as cost, in words, at the column head. A structural change (a new column or table) is OFFERED in a sentence and undoable, never a side effect of a click — docs/LATER.md names the old structureAsk suite as owed by the first screen that can add structure; if yours can, port it.

Ownership: src/screens/sheet/**, src/routes/data.$table.tsx (the /data index is another builder's), e2e/flows/sheet.spec.ts, e2e/routes.ts (your row only), e2e/shots/recipe.ts only if arrive needs a mode, src/domain/catalogue only for a missing pure derivation with its test. Ports: 5111 for Playwright, 5112 for vite.`,
      { label: 'build:sheet', phase: 'Registers', schema: REPORT },
    ),
  () =>
    agent(
      COMMON +
        `

TASK: build HISTORY, at /history — a diary reading of the quotes store. ASSIGNED: direction A, "The spine": one vertical spine, day heads as nodes, one folded line per quote touched that day opening in place to the events' own sentences; B's gutter tally kept as a derived figure the day head carries; C's "one quote's diary" kept as what a folded line opens INTO (its versions as dated entries, its events oldest first, "quote that again" or its refusal at its foot) rather than a second pane.

THE ENGINE FIRST, because the critic found the hole: history.ts groupByDay cuts by createdAt, and diary/ has no reader over QuoteEvent.at — so A as drawn would put a head from one calendar over events from another (a quote started Monday and issued Friday under Monday). ADD src/domain/quote/diary/days.ts: a pure index of events by day off QuoteDef.events[].at, using day.ts's own local-day rule (Brisbane, UTC+10 — the timezone suite pins it), giving for each day the quotes touched and the events on each, plus the day's tally (given that day: a count and a sum of quoteTotals over the quotes issued that day — say which sum). Test it, including the two-calendars case and the midnight boundary. Everything else is there: indexQuotes, versionsOf, versionMark, standingOf, the spans today / week / month / year, filterQuotes by customer, quoteAgain and whyNotAgain (a quote is re-raised on today's file only when its subject still exists; the refusal is a sentence). The fold is an INVENTION no frame shows — own it as one in the stylesheet header, the way the cascade owned "stays".

THE CRITIC'S OTHER FINDINGS: A and B both claimed Linear's changelog, and Linear is the quotes register's primary — do not lean on it; GitHub's commit list is shared with data D — not yours; helmlogic-original.md §2.3 "Everything after issued" and dense-tables-and-selection.md were uncited — read both and say what applies. The room figure is 657px measured, not 604 estimated.

MUST BE TRUE: every sentence on a line is the command's own \`said\` from src/domain/quote/commands.ts, never written here; the quote's chain (v1 replaced by v2) reads as its versions in order without a diagram; "quote that again" is an act on a past thing with its refusal in a sentence where it is refused; the spans and the customer filter are URL search params; the empty state on day one teaches ("nothing has happened yet" is not a teaching sentence — say what will appear here and where a quote starts); a folded line is a row for the density ruler (it is a Cockpit screen: 18 lines at 1280×800). Port the intent of the old repo's features/history/render.test.ts (20 tests, evidence only, at C:\\Users\\Asaf\\dev\\HL_Playground) as component tests by role and text: the shape of fault where the logic is right and the screen never says it. Arrive 'with-a-document' so the rulers see a day with something on it; the recipe already reloads onto a route without $id after the walk.

Ownership: src/screens/history/**, src/routes/history.tsx, e2e/flows/history.spec.ts, e2e/routes.ts (your row), src/domain/quote/diary/days.ts + test. Ports: 5121 for Playwright, 5122 for vite.`,
      { label: 'build:history', phase: 'Registers', schema: REPORT },
    ),
])
log('registers: ' + registers.filter(Boolean).map((r) => r.direction).join(' | '))

phase('Doors')
const doors = await parallel([
  () =>
    agent(
      COMMON +
        `

TASK: build DATA, at /data — the register of the dealer's tables, and it is ITS OWN DOOR ("I WANT THE DATA STUFF AS ITS OWN MENU ITEM. NOT UNDER ADMIN!"). ASSIGNED: direction C, "The showpiece row": the seven boat-brand plates across the top with their marks large and their pairing chips beneath (every one of the 28 joins hangs off exactly one of the seven boat tables — 5/5/5/5/3/3/2; a chip names what it pairs, in words a dealer says: "Yamaha motors · 2,519 pairings", never "join"), and every other table (motors, trailers, parts, rigging kits, dealer fit, packages…) as rows under place heads, the places minted from table keys by src/domain/modules (places.ts, split.ts, read.ts, mint.ts — read them; nothing here is a list in app code). A's column-view idea is kept as what pressing a plate does: the brand's page beside the row, with its pairings as rows, before the sheet opens. B's ledger is the 1920 state: everything visible, no pane.

THE MARKS: data/northside/marks-ledger.json — seventeen marks for twelve of thirteen brands, Mercury white-ink only (draw it on a ground that carries it), Stabicraft none (the business's initials in type, never a stand-in). "I want the logo to be the showpiece thing" — this is the screen where that sentence is answered inside the Cockpit. Read src/domain/modules/logo.ts and brandLogos.ts.

THE CRITIC'S FINDINGS: C's plate row was drawn from no frame that shows it — own it as an invention in the stylesheet header and name the two references that inform it without claiming them as its picture; three of four boards leaned on GitHub — not yours; the manifest holds 25 base tables and 28 joins and NO view tables; there is ONE file-level sha256 and fingerprint (1qz08ne), not a hash per table — a table's provenance is its workbook · sheet · row range (the manifest's description) and its rows' own Source cells, and the fingerprint sits once at the head; seven tables have no description — say so on their rows rather than inventing one.

MUST BE TRUE: every count is read from the loaded catalogue (53 · 15,691 · 8,679 pairings); each row says its kind in words and opens /data/$table (built in this round by another builder — link by address; if it is not in the tree when you test, your flow asserts the address and not the screen); provenance is findable and never has to be read; the registers a dealer made (the customers register, once it exists) appear with their own provenance ("filed at this desk"); at 390 the plates stack and the rows stay rows. It is a Cockpit screen: the table rows are rows for the density ruler. Arrive 'through-the-door'.

A PREVIOUS ATTEMPT AT THIS TASK WAS CUT OFF by an account limit on 2026-09-22, mid-build, after writing src/screens/data/Data.tsx (1,321 lines), data.css (1,262), file.ts, src/routes/data.index.tsx (111 lines) and src/domain/modules/register.ts (with register.test.ts). It was cut off twice, so parts of it have been written twice. Nothing of it was gated, looked at or committed. Read every one of those files first and treat them as a draft by a colleague who had read this same brief: keep what is right, finish what is half-done, delete what is wrong, and say in notes what you kept and what you replaced. Do not start from a blank folder.

Ownership: src/screens/data/**, src/routes/data.index.tsx (or data.tsx — read how TanStack file routes nest with the sheet's data.$table.tsx and do not break it), e2e/flows/data.spec.ts, e2e/routes.ts (your row). Ports: 5131 for Playwright, 5132 for vite.`,
      { label: 'build:data', phase: 'Doors', schema: REPORT },
    ),
  () =>
    agent(
      COMMON +
        `

TASK: build CUSTOMERS, at /customers — the record and the register of the people a dealer sells to. ASSIGNED: direction C, "The letter": record-first — the screen opens on the customer named in the address (?who=<rowId>) or the last one touched, as one centred page: the name as heading, the address printed AS THE DOCUMENT PRINTS IT, phone and email on one line, the note in a tinted band that says it is for the yard and never printed, then every quote addressed to them as a row led by the exact boat's held picture and its reference, grouped by lineage (versionsOf, latest first) with its standing (draft / given / replaced) in words. The register is one search field and a name list in REGISTER ORDER — the critic's §5: customers.ts says a list must never silently re-sort, so A's alphabet is a control the dealer presses, not the rest state. D's "who is at the desk" is kept as the list's grouping option: by the standing of each person's latest quote.

THE ENGINE: src/domain/people/customers.ts (the register is the __customers table, CREATED ON FIRST USE, with CUSTOMER_COLUMNS, readCustomers, matchCustomers with its two rungs, exactCustomer, customerFormFields), people/form.ts (groupByDescription, dayWorthSaying), src/state/customerLink.test.ts and the configurator's "who it is for" chapter (src/screens/configurator) for how a customer is filed from the sale today — this screen files one by hand the same way, through the same commands (createTable for the register on first use, addRow, updateCell — with undo). A customer's quotes come from the quotes store through src/domain/quote/find.ts and diary/history.ts.

THE CRITIC'S FINDINGS: C's exclusive was a text page — re-source it from the 214 frames on disk or own the composition as an invention; the miniature of a quote's A4 cover, if you draw one, is the document's own DOM scaled and never a second renderer (the document's rule) — if that is too heavy for a row, lead with the boat's held picture instead and say so; "about 19px a row" was read off a scaled screenshot — measure your own pitch. Duplicates: two Sarah Jones at the desk are avoided without a modal — matchCustomers' exact rung says "a Sarah Jones is already filed" inline with "open her" and "file another" as the two acts.

MUST BE TRUE: no customer is invented — the empty state is the true state and it teaches what filing one does and where the sale files one for you; the register does not exist until the first is filed and the screen says so honestly rather than drawing an empty table; every act is keyboard-reachable with its shortcut inline; the note band never reaches the document (assert it against src/domain/quote/document.ts's reading). Arrive with a document AND a customer: extend e2e/shots/recipe.ts so a route can say raise 'the sale' and still reload onto its own address afterwards (the issued walk addresses a quote to R. Kelleher, which creates the register) — that is the honest way the rulers reach a register with a person on it. Cockpit: the name list's rows are rows for the density ruler.

A PREVIOUS ATTEMPT AT THIS TASK WAS CUT OFF by an account limit on 2026-09-22, mid-build, after writing src/screens/customers/Customers.tsx (1,883 lines), customers.css (1,169), pictures.ts, src/routes/customers.tsx, and src/domain/people/book.ts (410 lines, with book.test.ts). Nothing of it was gated, looked at or committed. Read every one of those files first and treat them as a draft by a colleague who had read this same brief: keep what is right, finish what is half-done, delete what is wrong, and say in notes what you kept and what you replaced. Do not start from a blank folder.

Ownership: src/screens/customers/**, src/routes/customers.tsx, e2e/flows/customers.spec.ts, e2e/routes.ts (your row), e2e/shots/recipe.ts (the arrive extension, minimal). Ports: 5141 for Playwright, 5142 for vite.`,
      { label: 'build:customers', phase: 'Doors', schema: REPORT },
    ),
])
log('doors: ' + doors.filter(Boolean).map((r) => r.direction).join(' | '))

phase('Shell')
const shell = await agent(
  COMMON +
    `

TASK: build THE SHELL — the way between screens, and the finder. Twelve routes now exist: /, /sign-in, /quotes, /quote/new, /quote/$id, /quote/$id/cascade, /quote/$id/document, /data, /data/$table, /customers, /history, and Lost. A dealer with a customer at the desk reaches any of them from any of them in one press, and reaches a specific quote, customer, boat, table or row by typing.

ASSIGNED: direction A, "The pill" — one floating pill over every screen but Entry: crest as its leading cap, Home · Quotes · Customers · Data · History, the finder as its trailing bubble, translucent over a photograph and opaque over a register, the highlighted word the current screen, with ‹ at its leading edge named for where it goes. It is the only direction that leaves the showroom full-bleed AND the register's eighteen rows whole, and it honours "data is its own door" at rest. KEPT FROM B: the count or the dot on a door, read from the store (open drafts on Quotes; printed zero as zero), and a self-filling recent section in the finder (prefs is the only localStorage user). C and D are refused: C has no door at rest and D buries Data behind Menu on five screens — the critic's §9.

THE HARD PARTS, each measured: (1) A pill with no layout height still needs clearance — run all five rulers on ALL twelve routes at six viewports after you land it (this is the one task allowed to run the whole ruler set: HL2_PREVIEW_PORT=5151 npx playwright test e2e/rulers — alone, nothing else running) and fix every collision the overlap ruler finds, by moving the pill or by one token the mastheads read for their top inset; say what each screen's masthead gave up, in px, at 1440 and 1280. Do not add a second head: every built screen already spends a masthead with the business as an eyebrow. (2) Ctrl K is already bound by Home (Home.tsx ~645) and the configurator (Configurator.tsx ~271) to their own fields: the finder takes the key everywhere and resolves it with the SCOPE CHIP — on those two screens the first group is that screen's own rows under a chip naming the scope, and the fields keep a different way in. (3) The finder's grammar: recent before typing; the five doors as rows; then results grouped by kind with a verb on every row — a quote by reference, customer or boat (opens it at the right screen for its state), a customer by name, a boat by model (the picker or the sheet row), a table by name (/data/$table), a ROW in a table by its name or code (/data/$table?row=) — the critic's §9 says the sweep's grammar never reached a row; yours does — and an act by verb (New quote, Load the file). Search is src/domain/catalogue/search.ts and quote/find.ts and people/customers.ts — pure, tested, never re-derived here; cmdk is on the owner's library list, adopt it if it fits and say so. (4) The ? sheet: every shortcut in the app, searchable, under pointer: fine only. (5) Back named for its destination: the cascade's ?from= and the document's "Back to the build" already do it; the pill's ‹ reads the same. (6) 390: the pill drops to the foot as five tabs (HIG's phone form — a tab bar is navigation, not the action bar the owner rejected) AND the alternative — crest · current · finder pinned at the top — is drawn in the stylesheet header for the owner to choose; measure both against the built screens' own phone layouts (the configurator's search field must stay on the first screen at 390×844 and 844×390 — decisions record it at 154 of 844).

MUST BE TRUE: no shell on Entry; the mark is the pill's crest on every screen and is replaceable by token (a second dealership with no crest gets its initials in type); nothing hard-codes a route list twice — the pill and the finder read one exported list of doors; counts are counted; every door reaches the address it names (assert it, at six viewports, in e2e/flows/shell.spec.ts); reduced motion respected; keyboard reach on every act with the shortcut printed. Mount it once (the root route or a pathless layout route — read src/routes/__root.tsx and src/app/router.ts) and touch the built screens only for their top inset token and the two Ctrl K bindings.

Ownership: src/screens/shell/**, src/routes/__root.tsx (or a layout route), src/app/ways.ts if it is where doors belong (read it), src/state/prefs.ts for recent, the two Ctrl K lines, one inset token in tokens.css and the mastheads that read it, e2e/flows/shell.spec.ts. Ports: 5151 for Playwright, 5152 for vite.`,
  { label: 'build:shell', phase: 'Shell', schema: REPORT },
)
log('shell: ' + ((shell && shell.direction) || 'none'))

phase('Verify')
const verify = await agent(
  COMMON +
    `

TASK: verify THE WHOLE APP as a boat dealer's sales manager would — someone who reads nothing and expects it to work. Nothing else is running now, so you may run everything. Change only what a command needs to run; report everything else.

1. Full gate: npm test; npm run build; npm run e2e (alone — it takes ~20 minutes idle). Report every number; if a check is red, say whether it is the app or the machine (a 30 s timeout on a walk through the door is the machine; re-run it alone with --last-failed --timeout 120000 --workers 1 and report both readings).
2. Serve the built app (npx vite preview --port 5161) and DRIVE IT with the browser tools, screenshotting and READING every step: land cold → name → load the file → Home → the pill → Data → a brand plate → open Highfield Inflatables in the sheet → fold a band, edit a cell, undo it → Customers (empty, then after the sale) → New quote → pick → configurator → a cascade → address it → issue → document → Quotes → History (today, the chain, quote that again) → the finder from every screen (a quote by reference, a customer, a boat, a table, a row, an act) → Back from each → reload and check it is all still there.
3. The same at 390×844 and at 1920×1080.
4. Write docs/directions/built-m2.md: one honest paragraph per screen at each size with screenshots under docs/directions/<screen>/built/. Say plainly where the flow breaks, where it is confusing, where a control does nothing, and where two Cockpit screens read as the same shape.
5. REFUSAL ROT: grep every refusal sentence in src/screens/** (refusedBecause, "not built", "does not exist", "yet") and list each with whether it is still TRUE on this tree. Parallel builds leave sentences that became false the moment another screen landed.
Report the gate numbers and everything that is wrong.`,
  { label: 'verify', phase: 'Verify' },
)

phase('Critique')
const critic = await agent(
  COMMON +
    `

TASK: independent critic, read-only except docs/directions/built-critique-m2.md. Judge the five new screens and the shell over the eight built ones, as the owner would.

Read docs/directions/built-m2.md and look at every screenshot under docs/directions/{sheet,history,data,customers,shell}/built/ and a sample of the older ones. Read each screen's sweep notes and its findings in docs/research/refs/critique-m2.md to see what it promised and what it was told. Then read the source for what a screenshot cannot show. The verify agent's report: ${JSON.stringify(verify).slice(0, 6000)}.

Findings, each with a screen and severity:
- blocker: an invented figure, count, customer or state; a picture enlarged past its ledger size; a hard-coded colour, face or picture path; text under 4.5:1 on its real ground; anything under 11px; a control that does nothing when pressed; a refusal that is false on this tree; a cost column on a customer surface; a write that bypasses the command layer; a derivation in JSX that belongs in src/domain; the words entity / schema / field type / reference on a reader-facing surface; Data not reachable in one press from any screen.
- major: two Cockpit screens that read as one shape; a register under 18 rows at 1280×800 by the ruler's own reading; a layout that fails at 390 or 1920; the pill colliding with a masthead; a shortcut not printed where its act is; the finder failing to reach a row; a second head; a screen that lost its sweep's own idea; the sheet re-deriving something helpers.ts owns; history's day heads over another calendar's events; the customers note reaching the document.
- minor: craft.
Then answer plainly in wouldHeAccept: would the owner accept this Cockpit on sight, and if not, name the ONE thing to change first. He has rejected five redesigns; flattery costs him money.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps || []) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  const screens = Object.keys(byScreen).slice(0, 8)
  const PORTS = { sheet: 5111, history: 5121, data: 5131, customers: 5141, shell: 5151 }
  await parallel(
    screens.map((screen, i) => () =>
      agent(
        COMMON +
          `\n\nTASK: fix the built "${screen}" screen against the critique. Read docs/directions/built-critique-m2.md and built-m2.md and look at your screen's screenshots.\n\nFound on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major finding and the cheap minor ones. Keep the screen's own idea; answer the criticism rather than flattening it. Re-run your own gate (your ports: Playwright ${PORTS[screen] || 5171 + i * 10}, vite ${(PORTS[screen] || 5171 + i * 10) + 1}), drive the screen again at 1440x900 and 390x844, look at your screenshots, and report what you changed and what you deliberately did not.`,
        { label: 'fix:' + screen, phase: 'Critique', schema: REPORT },
      ),
    ),
  )
}

const reread = await agent(
  COMMON +
    `

TASK: the re-read pass, after every fix has landed. Nothing else is running. (1) grep every refusal and every "not built" / "does not exist" / "yet" sentence in src/screens/** and src/routes/** and make each one TRUE on this tree — retire the ones whose screen now exists by wiring the act to it, and keep the ones that are still true. (2) Read docs/SCREENS.md and make sure every one of the thirteen screens has a row, no two rows share a primary reference set, and every status says what is measured. (3) Run the full gate alone — npm test; npm run build; npm run e2e — and report every number; fix what is red if it is the app, and say so if it is the machine. (4) Append the gate numbers to docs/STATUS.md under a new dated heading "Milestone 2 is built" with one paragraph per screen saying what was measured on it. Report what you changed.`,
  { label: 'reread', phase: 'Critique', schema: REPORT },
)

return { registers: registers.filter(Boolean), doors: doors.filter(Boolean), shell, verify, critic, reread }