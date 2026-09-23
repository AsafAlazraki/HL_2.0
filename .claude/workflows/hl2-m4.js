export const meta = {
  name: 'hl2-m4',
  description:
    'Milestone 4: places with their marks and heroes, the organisation with its people and roles, and import/export — sweep, build, verify, critique, fix',
  phases: [
    { title: 'Sweep', detail: 'one reference sweep per screen' },
    {
      title: 'Design',
      detail: 'three drawn directions per screen on the real file, judged through three lenses',
    },
    { title: 'Build', detail: 'three screens, two at a time, each on its own composition' },
    { title: 'Verify', detail: 'the whole app driven cold, and the milestone exit walked' },
    {
      title: 'Critique',
      detail: 'independent judgement, per-screen fixes, and the refusal re-read',
    },
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

const STATE = `THE END GOAL, in the owner's own words (2026-09-23), which every round builds towards and the last round tests: \"when you are done, i need to be able to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enough experience to do so sitting with a customer and it is beautiful and so configurable in the backend and the output can be sent to a customer after downloaded and things and be so beautiful\". Five things define done: stakeholder-ready from a link; NO UI and UX errors; a full quote good enough to drive live beside a buyer; configurable in the backend without a developer; and a downloaded quote a dealer would proudly send. EVERYTHING IS BUILT BEFORE IT IS JUDGED: the owner's words, \"all of it has to be built before we get there!\" — no screen, panel or capability is left for the acceptance round to discover missing.

THE STATE. Repo (cwd): ${NEW}. Milestones 0 to 3 are built and green — seventeen screens: entry, home, picker, configurator, cascade, document, quotes, Lost, the sheet (/data/$table), history, data, customers, the shell (a floating pill with a Ctrl K finder), rules, fitment, review and levels. Read docs/STATUS.md (the top sections), then CLAUDE.md (in your context), then docs/SCREENS.md — every built screen's primary references are listed and NO TWO ROWS MAY SHARE A PRIMARY REFERENCE SET.

MILESTONE 4 IS THE BUSINESS ITSELF: the places a dealership sells through, the people who work there and what each may do, and getting a whole business's file in and out. docs/PLAN.md § "Milestone 4" is the brief, and § "From the original HelmLogic: what HL_2.0 takes, precisely" is the evidence — it was surveyed from the original production app's own code and it says exactly what each shape held and what was wrong with it.

THE ENGINE IS ALREADY PORTED AND PURE. Do NOT rebuild it; if something is genuinely missing, put it in src/domain with a test and say so.
- src/domain/modules/ — places.ts and mint.ts (the nine places MINTED FROM TABLE KEYS, never a list in app code), split.ts ("split the modules better", asked twice), read.ts, links.ts, reach.ts, tileFacts.ts, face.ts, logo.ts and brandLogos.ts (a place's mark), register.ts, dashOrder.ts, designer.ts, access.ts + accessSay.ts (the four-outcome reading off / withheld / on / blocked with ONE apology sentence), moduleRules.ts, writeCaps.ts, travelCaps.ts
- src/domain/people/ — organisation.ts (the org record), customers.ts, book.ts, form.ts
- src/domain/io/ — envelope.ts (the export envelope with its image allow-list), readEnvelope.ts, apply.ts and memoryApply.ts (the four-way diff and "Apply (N writes)"), evidence.ts, exportPayload.ts, mapMemory.ts, shelf.ts, csv.ts, csvSchema.ts, tableCsv.ts, pasteBlock.ts (CSV/TSV paste from Excel), keepOrganisation.test.ts and restoreAfterClear.test.ts (the two suites that pin what survives a wipe)
- src/data/repository.ts — OrgRepository and UserRepository are already declared; every persisted record already carries orgId
- src/domain/catalogue/commands.ts + src/state/catalogue.ts — every write is a command with an inverse, a said sentence and a typed event

WHAT IS NOT COPIED FROM THE ORIGINAL, and the reason is in the plan: no self-service superadmin checkbox, no world-writable storage, no "any signed-in user may write anything", no admin-typed passwords. Roles are data the dealership names and \`mayDo\` ACTUALLY ENFORCES; a role hierarchy confers inheritance or is not drawn; every declared permission flag must have a consumer, because the original advertised three that enforced nothing.`

const HOUSE = `HOW A SCREEN IS BUILT HERE:
- src/screens/<name>/ with its own stylesheet and a file route under src/routes/. No shared page component, ever. Write the reflow at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 into the stylesheet header as the built screens do.
- READ THREE BUILT SCREENS FIRST and match their standard: src/screens/data/ (the place plates with their marks — the closest relative of this milestone), src/screens/sheet/ (the dense Cockpit register and its edit-in-place), src/screens/customers/ (a record drawn as a letter, and a register that does not exist until somebody files one). Do not invent a second way.
- Every colour, face, size, space, radius, shadow, easing and duration from src/styles/tokens.css. tools/check.ts refuses a literal colour, an undeclared var(--x), anything under 11px, a cost column name on a customer surface, and the words entity / schema / field type / reference / UID in a reader-facing string. A value the tokens lack is ADDED to tokens.css with a comment saying where it came from.
- Controls from src/ui. They refuse className and style by design; extend a primitive rather than working around it, and say so.
- Figures are COUNTED from the stores through src/app/useStores.ts, never typed.
- No fake data: no invented place, person, role, organisation, figure or photograph. An empty state is the true state and is drawn to teach. THIS MILESTONE IS WHERE THAT RULE IS HARDEST: there is one organisation and one person in this app today and nothing else, so every screen here opens nearly empty and must be excellent that way.
- A refusal is a sentence with its reason where it is refused, never a disabled control. Never "not built yet" for a screen that exists.
- THE SHELL IS BUILT: your screen sits under it. Read src/screens/shell/ and ADD YOUR DOOR to its one list of doors — the pill and the finder both read it — and make your screen findable by typing where that makes sense.
- A Cockpit register owes 18 readable rows at 1280×800. JOIN e2e/routes.ts (register, a \`ready\` selector that exists only once the screen has really read what it draws, an \`arrive\` mode, and \`density: { room, minus }\` for a register), and add e2e/flows/<screen>.spec.ts for what the rulers cannot see.
- Responsive at every size. The primary act never becomes a floating bottom bar — the owner called that shape disgusting.
- Customisation by token (docs/CUSTOMISATION.md). THIS MILESTONE OWNS THE OTHER HALF OF IT: the organisation record is where a dealership's own mark, colour, pictures and density are SET, and docs/CUSTOMISATION.md says the panels belong here. Build them: three layers (defaults, organisation, person), one <style> element written at boot, every choice bounded and every consequence measured — a photograph gets a scrim computed from its own pixels, a brand colour is checked against the ground it will sit on, and a choice that cannot be honoured is refused in a sentence with the nearest thing that works. Never silently unreadable.

PORTS AND SERVERS, because builders run two at a time: NEVER run the whole e2e suite — run only yours: HL2_PREVIEW_PORT=<yours> npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<your route name>". Serve for looking with npx vite --port <yours+1> and drive it with the browser tools at 1440×900 and 390×844; read your own screenshots and fix what is wrong before you report. Your ports are in your task.

BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then your Playwright run. Component tests beside the screen, in happy-dom, BY ROLE AND TEXT. Report only numbers you measured. APPEND your row to docs/SCREENS.md and a dated one-liner to docs/DECISIONS.md, each with one \`cat >> file <<'EOF'\` — never rewrite either file. Do NOT commit, push, checkout, reset or stash.

THE OWNER'S STANDARD: five redesigns rejected on sight; "it still feels like a database, it is not beautiful enough, it does not feel alive"; "I want the logo to be the showpiece thing"; "split the modules better" (asked twice); "all tables should be a module, and their join and view ones should lie within them"; "blue and white was the brief" and "a bit more colour usage please"; "i can't stress enough how easy this system has to be to use"; "all of the same functionality, presented beautifully". A user never sees the words entity, schema, field type or reference.`

const SWEEP_BRIEF = `You are running the reference sweep for ONE screen of HL_2.0 before it is designed. Do not commit. Write only under docs/research/refs/<screen>/.

${STATE}

READ AS THE STANDARD, NOT TO REPEAT: docs/research/refs/data/notes.md (the place plates, this milestone's nearest neighbour), docs/research/refs/sheet/notes.md, and the two critics docs/research/refs/critique-m2.md and docs/directions/built-critique-m3.md. Their standing faults, which no board in this round may repeat: two directions inside one screen that are the same composition on a different ground or the same stack reordered; a direction whose "exclusive" reference is a text page or a diagram showing no shape; and a whole milestone of directions that are all one narrow-list-left, detail-right composition.

ALSO READ, because this milestone's evidence is unusually good: docs/reference/helmlogic-original.md (the original production app surveyed from its own code — what its organisation, users, roles, places and templates actually held, and which of its permission flags enforced nothing), docs/PLAN.md § "From the original HelmLogic: what HL_2.0 takes, precisely", and docs/CUSTOMISATION.md in full.

BUDGET, because this is a four-core machine and a previous sweep's transcript reached 170 MB and killed an agent: capture at most 45 new frames, and open at most 40 with the Read tool. A frame you did not open you do not cite.

CAPTURE TOOL: npx tsx tools/research/capture.ts <screen>/<modality> <list.json> [--width 1440 --height 900]. Read the tool first. Consent banners are answered with the most privacy-preserving button. Never sign in, never create an account, never type personal data, never fight bot protection — a site that refuses is listed under failed with its reason. Public demo and documentation pages are fair game where an app needs a login.

EXISTING STOCK, use before capturing: ${STOCK}/tables/ and ${STOCK}/boats/, plus docs/research/refs/<built-screen>/ for the sixteen sweeps already done — theirs to cite, but a frame a built screen uses as PRIMARY cannot be your primary.

WRITE docs/research/refs/<screen>/notes.md, under 2,500 words, in the shape the existing sweeps use: (1) what is genuinely best for THIS screen and why, citing frames by path; (2) the interaction patterns worth taking, each NAMED, with the frame that shows it; (3) the type and motion choices seen and what they do for the person; (4) what to avoid, each with the frame that shows the failure; (5) three or four DIRECTIONS, each a different composition AND a different order and grouping, each naming two references no other board could claim, what only this screen does, how it reflows at 390 / 834 / 1920, and what a second dealership replaces; (6) what the seed can honestly put here — data/northside/marks-ledger.json holds seventeen marks for twelve of thirteen brands (Mercury white-ink only, Stabicraft none) and heroes-ledger.json eight on-water photographs at up to 2560px. Plus sources-index.md: every frame with its URL and one line.`

const SCREENS = [
  {
    key: 'places',
    port: 5311,
    brief: `SCREEN: PLACES, at /places and /places/$id — a place is what the dealer calls a part of their business, and it is a FIRST-CLASS RECORD WITH ITS OWN MARK AND HERO.

THE OWNER ASKED FOR THIS THREE TIMES: "I want the logo to be the showpiece thing", "split the modules better" (twice), "all tables should be a module, and their join and view ones should lie within them". THE FIX THIS ASK NEEDS, named in the plan: the old app hung the logo on the module while the card was per place, so seven boat brands shared one mark. Here a place carries its own mark and its own hero, each uploaded, pasted by address, or taken from the image ledger with provenance.

WHAT THE ENGINE GIVES YOU: src/domain/modules/places.ts and mint.ts mint the nine places from table keys — never a list in app code, so a place type beyond catalogue (motor brand, trailer brand, rego, master price file) is READ from what the tables hold and never an enum. split.ts is the splitting the owner asked twice for. A place's page owes: its range as tiles, its recent quotes, its activity, its catalogue, its quotes, its pricing (the declared rungs) and its settings. access.ts + accessSay.ts give the four-outcome reading (off / withheld / on / blocked) with one apology sentence, and moduleRules.ts the rules a place carries. tileFacts.ts is what a tile says. NOTE /data already draws the seven boat brands as plates — read src/screens/data/ and make sure these two screens are not one shape twice: /data is the register of the FILE, /places is the register of the BUSINESS, and the difference has to be visible.

THE HARD QUESTIONS: (1) what is a place's page when the place is a brand with 588 hulls, and when it is "rego" with one table? (2) where does a mark go so it is genuinely the showpiece, and what does the card look like for the two brands with no mark? (3) how is a hero chosen from the image ledger without ever attaching a picture to something it does not depict? (4) how does a place say what it is for — a dealer's own one-line description, never a string-matched guess? (5) 390px?
REFERENCES TO DRIVE: Shopify's sales channels and store settings, Stripe's accounts and Connect dashboards, Linear's projects and teams pages, Notion's teamspaces, Slack's workspace settings, Vercel's project overview, Figma's file browser and team pages, GitHub organisation profile pages, Yamaha's and Mercury's own dealer dashboards if public, the Highfield and Stacer brand pages (their own marks at full size), Apple's product family pages, Sonos and Bang & Olufsen's product family navigation, and Squarespace or Wix's site-settings panels.`,
  },
  {
    key: 'manage',
    port: 5321,
    brief: `SCREEN: MANAGE, at /manage — the organisation, its people, what each may do, and how the dealership's own appearance is set.

THE TABS, taken from the original production app's own /manage: Company details · Users & permissions · Document templates (Milestone 5 builds the templates themselves — link to them by address and do not build them here) · Integrations · Margins · Modules · Sub-dealers. Build what the engine can honestly carry today and say plainly, in a sentence in place, what each tab will hold when its milestone lands.

WHAT THE ENGINE GIVES YOU: src/domain/people/organisation.ts (the org record: name, short code, address, phone, ABN, brand colours, primary and secondary marks, trading currency, GST percentage, margin thresholds, sub-dealer parent link), src/domain/modules/access.ts + accessSay.ts + writeCaps.ts + travelCaps.ts + moduleRules.ts (roles as data the dealership NAMES, per-module access that mayDo actually enforces, the four-outcome reading), src/data/repository.ts's OrgRepository and UserRepository. THE LINK THE OLD APP NEVER HAD, named in the plan as this milestone's job: **a surface that puts a role on a person**, with browse, search and open enforced the same way everywhere. Invites are real records with a token and an expiry (local now, delivered in Milestone 6).

THIS SCREEN ALSO OWNS CUSTOMISATION, and docs/CUSTOMISATION.md is its specification — read it in full. The dealership sets its mark and wordmark, a brand colour from which the app derives the scale (never eleven values), the entry background, Home's hero, a place's cover, a document's cover, register density, corner radius and shadow depth as named steps, a face from a bounded list that ships with the app, and motion full or reduced on top of the operating system's own setting. Three layers — defaults from tokens.css, the organisation's layer, the person's layer in prefs — all writing the SAME CSS custom properties on narrowing scopes, through one <style> element written at boot. Every choice is bounded and every consequence is MEASURED: a photograph gets a scrim computed from its own pixels, a colour is checked against the ground it will sit on, and a choice that would put text under 4.5:1 is refused in a sentence with the nearest thing that works. Show the person what it will look like before they keep it.

WHAT IS REFUSED, and the reason must be visible: cost or margin on a customer surface, the refusal sentences themselves, the price figure's behaviour, and the contrast floor. None of those is settable.

THE HARD QUESTIONS: (1) a settings screen with seven tabs is the easiest place in any app to be boring — what makes the best ones feel like the business rather than a form? (2) how is a permission matrix (roles × places × verbs) drawn so a dealer reads it, and how does one cell say off / withheld / on / blocked? (3) what does a colour or picture chooser look like when every choice is measured and some are refused? (4) how is the ONE person in this app today drawn so the screen is not an empty table? (5) 390px?
REFERENCES TO DRIVE: Stripe's dashboard settings and team roles, Linear's workspace and member settings, Notion's members and permission model, GitHub's organisation people and roles pages, Slack's admin, Vercel's team settings, Figma's file permissions and its VARIABLES panel with modes (the best drawing of one value per mode in any software), Google Workspace admin, Okta or Auth0's role screens (docs), Shopify's staff permissions, Apple's Screen Time and Appearance panes (apple.com), Raycast and Arc's appearance settings, and any brand-kit tool (Canva Brand Kit, Frontify) for the appearance half.`,
  },
  {
    key: 'shelf',
    port: 5331,
    brief: `SCREEN: IMPORT AND EXPORT, at /shelf — getting a whole business's file in and out, and the wizard for a business that has no file at all.

WHY IT IS CALLED THE SHELF and not "import/export": a user never sees the words entity, schema, field type or reference, and "import" is the app's word rather than the dealer's. The engine module is already called src/domain/io/shelf.ts. Name the screen for what a dealer does there — take the file off the shelf, put one on it — and say the direction's own name in your notes.

WHAT THE ENGINE GIVES YOU: src/domain/io/envelope.ts (the export envelope, with its http/https/data:image/blob allow-list for pictures, measured in envelope.images.test.ts), readEnvelope.ts, apply.ts and memoryApply.ts (**the four-way diff preview and "Apply (N writes)"** — this is the screen's centre), evidence.ts, exportPayload.ts, csv.ts + csvSchema.ts + tableCsv.ts (CSV round trips), pasteBlock.ts (CSV/TSV pasted straight from Excel), keepOrganisation.test.ts and restoreAfterClear.test.ts (what survives a wipe). A SHEET WIPE NEVER CLEARS QUOTES — "Your 3 quotes stay. A quote is a photograph of what was offered on the day" — and a separate, explicit "forget everything" is the only thing that does. Every applied change goes through the command layer, so an import is undoable and says what it did.

ALSO HERE: the WIZARD for a business with no file, which is the true first-run state of this app for a second dealership, and saved configurations.

THE HARD QUESTIONS: (1) a four-way diff (new / changed / unchanged / gone) over 53 tables and 15,691 rows — how is that shown so a dealer presses Apply with confidence rather than fear? (2) what does "Apply (2,318 writes)" look like the moment before it fires, and what does the undo look like after? (3) how does the wizard get a business from nothing to a working file without ever asking about a schema? (4) how is an export's contents described — what a dealer is about to hand somebody — including the pictures and the provenance? (5) how does a dangerous act (wipe, forget everything) get drawn so it is possible but never accidental, without a modal that everybody clicks through? (6) 390px?
REFERENCES TO DRIVE: GitHub's pull-request diff and its file-tree summary, Terraform plan and HCP Terraform's apply confirmation (the census restated above the act — the cascade screen already leans on Terraform, so find a DIFFERENT frame family for your primary), Airtable and Notion's import flows, Supabase's migration and diff screens, Google Sheets' import dialog, Xero and QuickBooks' bank-statement import with its match/ignore columns, Shopify's product CSV import with its error report, Figma's library-update panel (the best consumer-facing "here is what will change" in design software), Apple's Migration Assistant and Time Machine restore (apple.com), 1Password's export warnings, and any macOS "are you sure" that is done well.`,
  },
]

const MS = 'm4'
const BOARDSET = {
  type: 'object',
  properties: {
    boards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          file: { type: 'string' },
          shot: { type: 'string' },
          shot390: { type: 'string' },
          idea: { type: 'string' },
        },
        required: ['id', 'name', 'file', 'shot', 'idea'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['boards', 'notes'],
}
const PICK = {
  type: 'object',
  properties: {
    pick: { type: 'string' },
    scores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          owner: { type: 'integer' },
          dealer: { type: 'integer' },
          design: { type: 'integer' },
          why: { type: 'string' },
        },
        required: ['id', 'owner', 'dealer', 'design', 'why'],
      },
    },
    graft: { type: 'string' },
    mustChange: { type: 'string' },
  },
  required: ['pick', 'scores', 'graft', 'mustChange'],
}

const drawBoards = (s) =>
  agent(
    `You are the designer for one screen of HL_2.0, and you are drawing, not building.\n\n${STATE}\n\nTHE SCREEN: ${s.brief}\n\nITS SWEEP: docs/research/refs/${s.key}/notes.md, written this round, holds three or four directions in words. The other screens in this round are ${SCREENS.map((x) => x.key).join(', ')}; read their notes too, because no two screens in this app may share a composition, and every critic this repository has run has caught one shape stamped across several screens.\n\nDRAW THREE of those directions — or better ones the sweep did not name — as self-contained HTML boards at 1440×900 in docs/directions/${s.key}-boards/, each a genuinely different COMPOSITION and a different ORDER AND GROUPING of the content. Draw them on the REAL price file (data/northside/: real names, real figures, real held pictures by their public/seed-images path; never an invented row, customer, rule or figure; where the true state is empty, draw the empty state and make it good) and on the app's own tokens copied from src/styles/tokens.css, never an invented colour. Draw each at 390×844 too. Write docs/directions/${s.key}-boards/canvas.json in the shape tools/research/board.ts reads, run npx tsx tools/research/board.ts ${s.key}-boards and npx tsx tools/research/shots.ts ${s.key}-boards (read both tools first), and LOOK at every shot. Under each board, in a strip: its idea in one sentence, how it reflows at 390 / 834 / 1920, what a second dealership replaces, and how its silhouette differs from every built screen it could be confused with (look at docs/directions/*/built/). Budget: open at most 25 pictures. Change nothing under src/. Do not commit.`,
    { label: 'boards:' + s.key, phase: 'Design', schema: BOARDSET },
  )

const judgeBoards = (s, set) =>
  agent(
    `You are judging three drawn directions for one screen of HL_2.0 through THREE lenses at once, scoring every board 1–10 on each:\n- THE OWNER: Asaf, who has rejected five redesigns on sight and judges by eye in three seconds against the best boat and car configurators in the world. His words: "it still feels like a database", "not beautiful enough", "it does not feel alive", "I want the logo to be the showpiece thing", "a bit more colour usage please".\n- THE DEALER: a sales manager with a customer at the desk, who reads nothing and must get the job done fastest with least thought — and still like it at 5pm.\n- THE DESIGNER: hierarchy, density, scan path, the honesty of every figure, whether it holds at 390px, and whether its silhouette is its own or a copy of another screen in this app.\n\n${STATE}\n\nTHE SCREEN: ${s.brief}\n\nTHE BOARDS: ${JSON.stringify(set.boards)}\n\nOpen every board's 1440 and 390 shot (the Read tool renders PNGs) and a sample of docs/directions/*/built/ for what this screen must not become. Return per-board scores on the three lenses with a why; \`pick\` (the highest sum, a tie broken toward the owner's lens); \`graft\` (one idea from a losing board the winner must steal); \`mustChange\` (one thing about the pick to change before it is built). Honest scores — flattery costs him money. Change nothing.`,
    { label: 'judge:' + s.key, phase: 'Design', schema: PICK },
  )

phase('Sweep')
const sweeps = await parallel(
  SCREENS.map(
    (s) => () =>
      agent(
        SWEEP_BRIEF +
          `\n\n${s.brief}\n\nYour screen key for paths: "${s.key}". Write docs/research/refs/${s.key}/notes.md and sources-index.md.`,
        { label: 'sweep:' + s.key, phase: 'Sweep', schema: SWEEP },
      ),
  ),
)
log('swept: ' + SCREENS.map((s) => s.key).join(', '))

phase('Design')
const designed = await pipeline(
  SCREENS,
  (s) => drawBoards(s),
  (set, s) => (set ? judgeBoards(s, set).then((v) => ({ set, v })) : null),
)
const designs = designed.map((d) => (d ? d.set : null))
const picks = designed.map((d) => (d ? d.v : null))
log('picks: ' + picks.map((p, i) => SCREENS[i].key + ' → ' + (p ? p.pick : 'none')).join(' · '))

phase('Build')
const builds = await parallel(
  SCREENS.map(
    (s, si) => () =>
      agent(
        `You are building a real screen for HL_2.0.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SPEC IS THE JUDGED DIRECTION. The sweep is docs/research/refs/${s.key}/notes.md; three directions were then DRAWN on the real file (docs/directions/${s.key}-boards/) and judged through the owner's, the dealer's and the designer's lenses. The verdict: ${JSON.stringify(picks[si] || null)}. The boards: ${JSON.stringify((designs[si] && designs[si].boards) || [])}. Build the pick, steal the graft, make the must-change — and open the winning board's shots and its HTML before you write a line. If no board was drawn, choose from the sweep's own directions, avoid any composition another screen in this round would obviously take, and say so. Say in \`direction\` what you built and why it is right for this screen.\n\n${s.brief}\n\nOwnership: src/screens/${s.key}/**, src/routes/${s.key}*.tsx, e2e/flows/${s.key}.spec.ts, your row in e2e/routes.ts, your door in the shell's one list of doors, and src/domain only for a missing pure derivation with its test. Ports: ${s.port} for Playwright, ${s.port + 1} for vite.\n\nTHE MILESTONE'S EXIT CRITERION IS SHARED: a second organisation can be created, its file imported, its roles named, a module restricted and the restriction HONOURED IN THE CONFIGURATOR; and export → wipe → import round-trips quotes, places, rules and roles with their marks and heroes. Own your half of it and prove it in your own flow spec; do not break the other halves.`,
        { label: 'build:' + s.key, phase: 'Build', schema: REPORT },
      ),
  ),
)
log('built ' + builds.filter(Boolean).length + ' of ' + SCREENS.length)

phase('Verify')
const verify = await agent(
  `You are verifying HL_2.0 as a boat dealer's sales manager would — somebody who reads nothing and expects it to work.\n\n${STATE}\n\nNothing else is running now, so you may run everything. Change only what a command needs to run; report everything else.\n\n1. Full gate: npm test; npm run build; npm run e2e (alone — about 25 minutes idle). Report every number. If a check is red, say whether it is the app or the machine: a 30 s timeout on a walk through the door is the machine, and re-running it alone with --last-failed --timeout 120000 --workers 1 tells you which. Report both readings.\n2. Serve the built app (npx vite preview --port 5361) and DRIVE THE MILESTONE'S EXIT with the browser tools, screenshotting and READING every step: land cold → name → load the file → /places: open a brand, see its mark and hero, change its cover from the ledger → /manage: fill the organisation's details, SET A BRAND COLOUR AND A MARK AND SEE THE WHOLE APP CHANGE, name a role, put it on the person, restrict a place → open the configurator and see the restriction honoured with its own sentence → /manage again: set a colour that would break contrast and see it REFUSED with the nearest thing that works → /shelf: export everything, read what the export says it contains, wipe the sheet, CHECK THE QUOTES ARE STILL THERE, import it back, read the four-way diff, press Apply, undo it → then walk the whole sale again to be sure nothing broke.\n3. The same at 390×844 and 1920×1080.\n4. Write docs/directions/built-m4.md: one honest paragraph per screen at each size, screenshots under docs/directions/<screen>/built/. Say plainly where the flow breaks, where it is confusing, where a control does nothing, and where two screens read as the same shape.\n5. REFUSAL ROT: grep every refusal sentence in src/screens/** and src/routes/** and list each with whether it is still TRUE on this tree.\nReport the gate numbers and everything that is wrong.`,
  { label: 'verify', phase: 'Verify' },
)

phase('Critique')
const critic = await agent(
  `You are the independent critic for HL_2.0, read-only except docs/directions/built-critique-m4.md.\n\n${STATE}\n\nJudge the three new screens, and the app they now sit in, as the owner would. Read docs/directions/built-m4.md and look at every screenshot under docs/directions/{places,manage,shelf}/built/ and a sample of the older ones. Read each screen's sweep notes to see what it promised. Then read the source for what a screenshot cannot show. The verify agent's report: ${JSON.stringify(verify).slice(0, 6000)}\n\nFindings, each with a screen and a severity:\n- blocker: an invented place, person, role, figure or photograph; a picture attached to something it does not depict; a permission flag with no consumer, or a role that does not actually enforce; a hard-coded colour, face or picture path; text under 4.5:1 on its real ground; anything under 11px; a control that does nothing; a refusal that is false on this tree; a cost column on a customer surface; a write that bypasses the command layer; a wipe that clears quotes; an appearance choice that ships unreadable rather than refusing; the words entity / schema / field type / reference on a reader-facing surface; any half of the milestone's exit criterion not actually true.\n- major: two screens that read as one shape; /places and /data reading as one register twice; a layout that fails at 390 or 1920; a mark that is not the showpiece where the owner asked for it; a diff applied with no census before it; a dangerous act reachable by accident or buried behind a modal nobody reads; a screen that lost its sweep's own idea.\n- minor: craft.\nThen answer plainly in wouldHeAccept: would the owner accept these three screens on sight, and if not, name the ONE thing to change first. He has rejected five redesigns; flattery costs him money.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps || []) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  const ports = { places: 5311, manage: 5321, shelf: 5331 }
  await parallel(
    Object.keys(byScreen)
      .slice(0, 8)
      .map(
        (screen, i) => () =>
          agent(
            `You are fixing a built screen of HL_2.0 against an independent critique.\n\n${STATE}\n\n${HOUSE}\n\nTASK: fix the "${screen}" screen. Read docs/directions/built-critique-m4.md and built-m4.md and look at that screen's screenshots.\n\nFound on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major finding and the cheap minor ones. Keep the screen's own idea; answer the criticism rather than flattening it. Re-run your own gate (ports: Playwright ${ports[screen] || 5371 + i * 10}, vite ${(ports[screen] || 5371 + i * 10) + 1}), drive the screen again at 1440×900 and 390×844, look at your screenshots, and report what you changed and what you deliberately did not.`,
            { label: 'fix:' + screen, phase: 'Critique', schema: REPORT },
          ),
      ),
  )
}

const verify2 = await agent(
  `You are re-verifying HL_2.0 after a fix round, as a boat dealer's sales manager would.\n\n${STATE}\n\nNothing else is running; you may run everything. 1. The full gate alone: npm test; npm run build; npm run e2e. Anything red: re-run it alone with --last-failed --timeout 120000 --workers 1 and say whether it is the app or the machine; if it is the app, FIX IT and say what you fixed. 2. Serve the built app (npx vite preview --port 5901) and drive this milestone's exit criterion end to end, and every screen it built, at 1440×900, 1280×800, 390×844 and 1920×1080; re-photograph each into docs/directions/<screen>/built/ so the evidence matches the tree, and delete a stale FAULT-*.png whose fault is fixed. 3. Write docs/directions/built-${MS}-2.md: per screen, what changed since the first critique and anything still wrong. Report the gate numbers and everything still wrong.`,
  { label: 'verify2', phase: 'Critique' },
)
const critic2 = await agent(
  `You are an independent critic for HL_2.0, and you have never seen it before. Read-only except docs/directions/built-critique-${MS}-2.md.\n\n${STATE}\n\nA first critique (docs/directions/built-critique-${MS}.md) was answered by a fix round; the re-verifier's report: ${JSON.stringify(verify2).slice(0, 8000)}\n\nJudge the screens this milestone built AS THEY ARE NOW, not the list. Read docs/directions/built-${MS}-2.md, look at their screenshots under docs/directions/*/built/, read the source for what a still cannot show, and serve it (npm run build && npx vite preview --port 5911) to drive anything a still cannot prove. Be adversarial: for each item of the first critique say CLOSED or OPEN with the evidence — a claimed fix you cannot see is open — then find what is NEW. Findings with a screen and a severity (blocker: invented data, a false refusal, a control that does nothing, text under 4.5:1, under 11px, cost on a customer surface, a write around the command layer, a derivation in JSX, a plan word or route pattern on a screen, the milestone's exit criterion not true. major: two screens one shape, a register under 18 rows at 1280×800 by the ruler, a layout that fails at 390 or 1920, a refusal as the loudest thing at rest, a keycap on a coarse pointer, anything the owner would name within a minute. minor: craft). Then wouldHeAccept, and the ONE thing to change first. Flattery costs him money.`,
  { label: 'critic2', phase: 'Critique', schema: GAPS },
)
const serious2 = ((critic2 && critic2.gaps) || []).filter((g) => g.severity !== 'minor')
log('critic2: ' + serious2.length + ' blockers/majors survive')
if (serious2.length > 0) {
  const by2 = {}
  for (const g of critic2.gaps) (by2[g.screen] = by2[g.screen] || []).push(g)
  await parallel(
    Object.keys(by2)
      .filter((k) => by2[k].some((g) => g.severity !== 'minor'))
      .slice(0, 10)
      .map(
        (screen, i) => () =>
          agent(
            `You are fixing HL_2.0 against a second, independent critique.\n\n${STATE}\n\n${HOUSE}\n\nTHE SECOND CRITIQUE is docs/directions/built-critique-${MS}-2.md — read it whole. YOUR SCREEN: "${screen}". Found on it: ${JSON.stringify(by2[screen])}\n\nFix every blocker and major and the cheap minors, keep the screen's own idea, and look at it at 1440×900, 1280×800 and 390×844 asking whether it is beautiful, not only whether it is green. Ports: Playwright ${5921 + i * 4}, vite ${5922 + i * 4}. Touch only that screen's files; if a finding needs a file another screen owns, say so rather than editing it.`,
            { label: 'fix2:' + screen, phase: 'Critique', schema: REPORT },
          ),
      ),
  )
}

const reread = await agent(
  `You are closing Milestone 4 of HL_2.0.\n\n${STATE}\n\nNothing else is running. (1) Grep every refusal and every "not built" / "does not exist" / "yet" sentence in src/screens/** and src/routes/** and make each one TRUE on this tree — retire the ones whose screen now exists by wiring the act to it, keep the ones still true, and make sure every new screen has its door in the shell's one list and is reachable by the finder. (2) Read docs/SCREENS.md: every screen has a row, no two rows share a primary reference set, every status says what is measured. (3) PROVE BOTH HALVES OF THE MILESTONE'S EXIT CRITERION end to end and say the numbers: a second organisation created, its file imported, its roles named, a place restricted and the restriction honoured in the configurator; and export → wipe → import round-tripping quotes, places, rules and roles with their marks and heroes. (4) Run the full gate alone — npm test; npm run build; npm run e2e — and report every number; fix what is red if it is the app and say so if it is the machine. (5) Append to docs/STATUS.md under a new dated heading "Milestone 4 is built" with one paragraph per screen saying what was measured on it. Report what you changed.`,
  { label: 'reread', phase: 'Critique', schema: REPORT },
)

return {
  sweeps: sweeps.filter(Boolean),
  picks,
  builds: builds.filter(Boolean),
  verify,
  critic,
  critic2: critic2 && {
    wouldHeAccept: critic2.wouldHeAccept,
    summary: critic2.summary,
    serious: serious2.map((g) => `${g.severity} | ${g.screen} | ${g.title}`),
  },
  reread,
}
