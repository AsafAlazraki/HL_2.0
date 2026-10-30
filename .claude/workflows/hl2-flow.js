export const meta = {
  name: 'hl2-flow',
  description:
    'The quote, click by click: walk every press of a real quote, make adding parts a visual process with pictures and drag and drop, find the parts their pictures, put what fits a boat one press away, and leave nothing the app can do unreachable',
  phases: [
    {
      title: 'Walk',
      detail:
        'every press of three real quotes logged, and every capability mapped to where it is reached',
    },
    {
      title: 'Pictures',
      detail:
        'the parts and accessories the file prices, given their exact pictures with provenance',
    },
    {
      title: 'Design',
      detail: 'a sweep, three drawn directions for choosing in the build, judged',
    },
    {
      title: 'Build',
      detail:
        'the picture a dealer adds, then the build’s choosing with the parts catalogue, beside the reach and exposure fixes',
    },
    { title: 'Verify', detail: 'the walk again, press for press, against the first' },
    { title: 'Critique', detail: 'a fresh critic, fixes, and a second critic' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const STOCK = 'C:\\Users\\Asaf\\dev\\hl-refs\\ref'
const OUT = 'docs/directions/flow'

const OWNER = `THE OWNER, 2026-10-30, word for word: "but also ensuring the process of quoting and building the quote is BEAUTIFUL and works well and not crap and every single thing on the page looks right and that the final print out is PERFECT w a cover page and things using boats photo and full spec of the quote and the boat and things on there and whatnot and ability to add/remove sections that appear there and things". And: "if we are getting close to usage limits - priority is the quote flow". So building the quote is judged as BEAUTIFUL or not, element by element, and the walk ends on the printed quote: the round opens the document of each of its three quotes and says what Milestone 5 must still make perfect on the paper (the cover with the boat's own photograph, the full specification of the boat and of the quote, sections the salesperson adds or removes), writing that list to docs/directions/flow/paper-handoff.md.

THE OWNER, 2026-10-28, word for word: "click by click ux check through the quote cause dropdowns a bit confusing and things and adding parts to a configuration is a bit too complex and not visual of a process enough. think images drag drop etc. if parts and things dont have images go get them and things ... the user should have all functionality exposed and things. managing what fits on a boat should be really easy to get to".

WHAT THE ORIGINAL HELMLOGIC'S USERS SAID, as the owner reported it on 2026-10-28: "users of the original HL reported that the visual way to configure boats to be able to be quoted and how visual it was for things like colors and things and adding images to colors and parts and flooring and whatever it may be was decent, but we can make it better. They liked the catalogue parts." So three things are the FLOOR, not the ceiling: (1) configuring a boat visually, with colours shown as colours and pictures; (2) a dealer ADDING THEIR OWN PICTURE to a colour, a part, a flooring option or any other option; (3) the PARTS CATALOGUE. Nothing visual or rule-like is ported from the original (CLAUDE.md), but what its users valued is evidence, and HL_2.0 must do each of those three things better.

A PICTURE A DEALER ADDS keeps the picture rule: it belongs to the one option it was added to, and its provenance is the person who added it and when ("added by <name>, <date>"), recorded in the same ledger as every other picture, read by the one reader src/data/pictures.ts, carried in the backup, and shown on the paper only where the proposal's rules allow. The dealer's act is the statement that it depicts that exact item; the app never copies it to a "similar" option.`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that ends its turn to wait for a background notice is never woken, and Milestone 4 stalled two hours that way on 2026-10-29. Run Playwright, the gate and every long command in the foreground with a timeout (up to 600000 ms), splitting a long suite into several foreground calls if it needs more. Stop any dev or preview server you start before you report. THE END GOAL, in the owner's own words (2026-09-23): "when you are done, i need to be able to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enough experience to do so sitting with a customer and it is beautiful and so configurable in the backend and the output can be sent to a customer after downloaded and things and be so beautiful".

${OWNER}

CARRIED FROM MILESTONE 3 (commit a3c99e7, 2026-10-29). Its second critic, docs/directions/built-critique-m3-2.md, left these open; its fixers then worked on each, so WALK EACH FIRST and say whether it is now closed, then close what is not, because each one breaks a quote at the desk: (1) the way from the build's finale to Prices and back loses the dealer twice: it lands on the wrong line, and after a choice the step line with Back to the quote and Undo sits under the fold (y 1,006 of 900 at 1440; y 2,022 of 844 at 390); (2) the first quote on a fresh link adds a line by itself and then refuses to give the quote for it, and nothing warns before the sale that four price questions are waiting; (3) Review promises "kept in History" and History keeps none of it; (4) file words reach the dealer ("ATM (KG)", "Registration Costs!C16") on Review, Fitment, Prices, the sheet record and the paper's rail; (5) the floating pill covers the because field being typed on Rules at 1440 and 1920; (6) Quotes with one quote reads as a placeholder at desk sizes; (7) names cut short with room to spare on Home and History; (8) counts summed in screen code (Fitment.tsx held.reduce, Rules.tsx lede) instead of a pure function in src/domain.

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS: complex topics made beautiful, and when two designs both work the simpler one wins. Fewer presses beat more; a picture beats a code; a choice you can see beats a list you must open.

THE STATE. Repo (cwd): ${NEW}. Milestones 0 to 4 are built. Read docs/STATUS.md (top sections), CLAUDE.md (in your context), docs/SCREENS.md, docs/WORDS.md (the dealer's words; never row, table, column, pack, rung or ledger on a dealer's screen) and the critiques under docs/directions/ named built-critique-*. The sale runs: Home → the picker (src/screens/picker/) → the build (src/screens/configurator/, its chapters in chapters.ts, parts and accessories in the "fit" chapter through goods.ts) → the cascade → the handover → the document. Fitment is /fitment (Milestone 3). The site is live at https://asafalazraki.github.io/HL_2.0/ and redeploys on every green push.

THE RULES THAT DO NOT BEND: no invented customer, quote, pairing, figure or picture, so an empty state is the true state. A picture belongs only to the exact item it depicts, with provenance in the image ledger, and never a stand-in or "similar" part. Cost and margin never reach a screen the customer can see. A refusal is a sentence with its reason, never a disabled control. Every colour, space and duration is a token. Every control comes from src/ui. A drag always has a keyboard and a press alternative that does the same thing (dnd kit is the owner's named library; install @dnd-kit/core and its siblings if a direction needs them). Reduced motion keeps colour and opacity and drops movement. A position inside a screen is a search param. A quote changes only through commands with inverses. An issued quote refuses edits with a sentence.

THIS MACHINE HAS FOUR CORES: agents run two at a time, a builder runs only its own Playwright specs on its own ports, and only verify runs the whole e2e. Builders do NOT commit, push, checkout, reset or stash. Append to docs/SCREENS.md and docs/DECISIONS.md with one \`cat >> file <<'EOF'\` each, never rewriting either.`

const WALK = {
  type: 'object',
  properties: {
    presses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          viewport: { type: 'string' },
          count: { type: 'integer' },
        },
        required: ['quote', 'viewport', 'count'],
      },
    },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          step: { type: 'string' },
          kind: {
            type: 'string',
            enum: [
              'dropdown',
              'parts',
              'reach',
              'exposure',
              'words',
              'spacing',
              'picture',
              'other',
            ],
          },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          proposal: { type: 'string' },
        },
        required: ['screen', 'step', 'kind', 'severity', 'what', 'proposal'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['presses', 'findings', 'notes'],
}
const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    measured: { type: 'string' },
    notes: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'gateGreen', 'measured', 'notes', 'blockers'],
}
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
    wouldHeAccept: { type: 'boolean' },
    summary: { type: 'string' },
  },
  required: ['gaps', 'wouldHeAccept', 'summary'],
}

const QUOTES = `THE THREE QUOTES, each from a cold browser (a fresh tab, nothing stored), each at 834×1112 (a tablet at the desk) and then at 1440×900: (1) a Stacer with a Yamaha the file pairs, a trailer, and THREE parts or accessories; (2) a Highfield in hypalon with a colourway, a motor, a trailer and some parts, where the customer changes the finish (the cascade) and then asks to take a part off again; (3) the cheapest honest rig on the file for a first-time buyer. Each one is addressed to a name, given, and opened as the document.`

phase('Walk')
const [walk, exposure, original] = await parallel([
  () =>
    agent(
      `You are walking HL_2.0's quote CLICK BY CLICK, as the owner asked, and you change nothing in src/.\n\n${STATE}\n\nServe the built app (npm run build && npx vite preview --port 5511) and drive it with the browser tools.\n\n${QUOTES}\n\nKEEP A NUMBERED LOG OF EVERY PRESS, keystroke and scroll that moved the quote forward, in ${OUT}/walk.md, with a screenshot of every step that made you hesitate in ${OUT}/walk/. Count the presses per quote per size. At each step, note: a dropdown, select or menu, what it held, how many options, whether you could tell which one was right without opening it, and whether a visible choice (tiles with pictures, a segmented control or a short list) would be faster; adding a part or accessory, each press it took, whether you could SEE what you were adding (a picture, where it goes on the boat, what it does), and whether the parts were findable without knowing a code; every moment you wanted to see or change WHAT FITS THIS BOAT and how many presses away it was; and every word you read twice, every spacing that looked cramped or loose, and every missing picture.\n\nReport \`presses\` and every finding with its kind and a concrete proposal.`,
      { label: 'walk', phase: 'Walk', schema: WALK },
    ),
  () =>
    agent(
      `You are mapping EVERYTHING HL_2.0 CAN DO against WHERE A PERSON CAN DO IT, because the owner said "the user should have all functionality exposed" and "managing what fits on a boat should be really easy to get to". Change nothing in src/.\n\n${STATE}\n\n1. List every capability: each command in src/domain/**/commands.ts and src/state/*.ts (every exported act with an inverse), each pure derivation a person would want to see (src/domain/**), and each setting in docs/CUSTOMISATION.md. For each, grep src/screens/** and src/routes/** for the screen that calls it, and record: reachable or not, the screen, and the presses from Home.\n2. Measure the presses to WHAT FITS A BOAT, meaning seeing and changing which motors, trailers and parts pair with one boat, from: the boat in the build; the boat's line in Data and in the sheet; the picker; Home; and the finder (Ctrl K, and its touch equivalent). Serve the built app (npm run build && npx vite preview --port 5521) and drive each path with the browser tools.\n3. Write ${OUT}/exposure.md: the capability map as a table, every unreachable capability with where it belongs (the most obvious screen, never a new settings page if an existing screen is the natural home), and the fitment paths with their press counts and a target of two presses from any boat.\n\nReport every unreachable capability and every fitment path over two presses as a finding.`,
      { label: 'exposure', phase: 'Walk', schema: WALK },
    ),
  () =>
    agent(
      `You are reading the ORIGINAL HelmLogic (C:\\Users\\Asaf\\dev\\HelmLogic, Next.js and Firebase; do not run it and change nothing there) for what its users liked, as evidence for HL_2.0. Change nothing in HL_2.0's src/.\n\n${STATE}\n\nREAD its visual configuring and its catalogue: src/components/highfield-quote-flow.tsx, model-configuration-editor.tsx, motor-options.tsx, trailer-options.tsx, trailer-catalog-picker.tsx, dealer-fit-options.tsx, fit-up-quote-selector.tsx, fit-up-catalog-manager.tsx, catalog-item-picker.tsx and catalog-hierarchy-export.tsx, plus anything they import that draws a colour, a picture or a catalogue; look for screenshots under its tasks/ and docs/ folders and open them; and read the old repo's teardown, C:\\Users\\Asaf\\dev\\HL_Playground docs/research/helmlogic-original.md.\n\nWRITE ${OUT}/original.md (under 1,500 words): how a person configured a boat visually there; how colours were shown; how a dealer attached a picture to a colour, a part or a flooring option, and where that picture then appeared; how the parts catalogue was organised, browsed and searched; and for each, what its users plausibly valued, what was weak (clumsy, slow, unsafe, or inventing data), and what HL_2.0 must do BETTER. Compare with what HL_2.0's build does today (src/screens/configurator/, goods.ts, finishes.ts) and name every one of the three floors HL_2.0 does not yet meet. Report each gap as a finding.`,
      { label: 'original', phase: 'Walk', schema: WALK },
    ),
])
const findings = [
  ...((walk && walk.findings) || []),
  ...((exposure && exposure.findings) || []),
  ...((original && original.findings) || []),
]
log(
  `walk: ${findings.length} findings — ${findings.filter((f) => f.severity !== 'minor').length} blockers or majors`,
)

phase('Pictures')
const pictures = await agent(
  `You are giving the PARTS AND ACCESSORIES the price file carries their pictures, because the owner said "if parts and things dont have images go get them".\n\n${STATE}\n\nREAD FIRST: .claude/workflows/hl2-imagery.js (how the imagery round matched, judged by eye, fetched and recorded every picture: follow the same method, ledger, folders and size budget), docs/research/imagery/gaps.md, src/data/pictures.ts (the one reader every screen uses) and its tests.\n\n1. COUNT: every row of parts, dealer_fit, rig_kits and oils_lubes (and any other table the build's "fit" chapter offers) against the pictures held. Write the count with its numerator and denominator.\n2. SOURCE THE EXACT ITEM: a part is the exact part number or product the row names, from the maker's or a major distributor's own product page, such as Yamaha, Garmin, Lowrance, Minn Kota, Humminbird, Railblaza, BLA or the boat builder's own accessory page. Never a "similar" picture, a category icon or an AI image. Judge every candidate by eye on a contact sheet before fetching it. Record provenance (source page, image address, date, and the row it depicts) in the ledger exactly as the imagery round did.\n3. WHERE NO EXACT PICTURE EXISTS, leave it without one and record why in ${OUT}/pictures.md. The build's design draws the honest no-picture state well (a glyph for the part's kind with its name, never a fake photo), and that is fine.\n4. Run src/data/imagery.test.ts and the reader's tests, and keep inside the size budget the imagery round set (report the bytes).\n\nThe walk's picture findings: ${JSON.stringify(findings.filter((f) => f.kind === 'picture')).slice(0, 3000)}\n\nReport the count before and after, and every row still without a picture and why.`,
  { label: 'pictures', phase: 'Pictures', schema: REPORT },
)

phase('Design')
const sweep = await agent(
  `You are running the reference sweep for CHOOSING IN THE BUILD: how a boat's motor, trailer, finish, PARTS AND ACCESSORIES are chosen. Write only under docs/research/refs/choosing/. Do not commit.\n\n${STATE}\n\nTHE WALK found: ${JSON.stringify(findings.filter((f) => ['dropdown', 'parts', 'reach'].includes(f.kind))).slice(0, 6000)}\n\nREAD ${OUT}/original.md FIRST: what the original's users liked (visual configuring, colours with pictures, a dealer adding pictures to options, the parts catalogue) is the floor every direction must clear. Then READ the earlier sweeps for the build (docs/research/refs/configurator/ and any build or components sweep), because their primary references cannot be your primary.\n\nDRIVE AND CAPTURE (npx tsx tools/research/capture.ts choosing/<modality> <list.json>, at most 40 new frames, open at most 35, consent answered with the most private button, never sign in): car and boat configurators' ACCESSORY steps (BMW, Volvo, Polestar, Rivian, Tesla; Axopar, Saxdor, Sea-Doo's and Yamaha WaveRunner's builders), the Apple Store's add-ons step, IKEA's planners and their drag onto a room, LEGO's and Nike By You's builders, Shopify bundles, and dnd kit's own examples for sortable and droppable with keyboard support. Use ${STOCK} first.\n\nWRITE docs/research/refs/choosing/notes.md (under 2,500 words): the patterns worth taking, each NAMED with its frame; what to avoid, with the frame showing the failure; and three DIRECTIONS for choosing in the build. Each direction covers: how a part is FOUND without a code (by where it goes on the boat, by what it is for, by picture); how it is ADDED (press, drag onto the boat or into the build, or both, with the keyboard path); how the build SHOWS what has been added (pictures in place, a tray, a list); how every dropdown in the sale is replaced or justified; how the PARTS CATALOGUE is browsed by itself and inside the build; how colours and finishes are shown as colours and pictures; how a dealer adds their own picture to a colour, part or flooring option; where "what fits this boat" sits; and how it reflows at 390, 834 and 1920.`,
  { label: 'sweep:choosing', phase: 'Design' },
)
const boards = await agent(
  `You are the designer for CHOOSING IN THE BUILD, and you are drawing, not building.\n\n${STATE}\n\nTHE SWEEP: docs/research/refs/choosing/notes.md. THE WALK: ${OUT}/walk.md and ${OUT}/exposure.md. Look at the build as it is (npm run build && npx vite preview --port 5531) before you draw.\n\nDRAW THREE directions as self-contained HTML boards at 1440×900 in docs/directions/choosing-boards/, each a different idea of choosing, not three skins of one idea. Draw them on the REAL price file: a real Stacer and a real Highfield, with real motors, trailers and parts from data/northside/, and their real held pictures by their public path (the pictures round has just added some; where a part has none, draw the honest no-picture state). Each board shows: the parts step mid-way with three parts added, a part being dragged and its keyboard equivalent, a dropdown the walk named replaced by what you propose, and "what fits this boat" one press away; THE PARTS CATALOGUE browsed by itself; a colour or flooring choice shown as colour and picture; and a dealer adding their own picture to a part with its provenance shown. Read ${OUT}/original.md first: each board says, in its notes, how it beats the original on the three floors. Draw each again at 390×844. Screenshot every board and read every screenshot before you report. Never an invented part, price or picture; cost never appears.`,
  { label: 'boards:choosing', phase: 'Design', schema: BOARDSET },
)
const pick = await agent(
  `You are judging three drawn directions for choosing in HL_2.0's build through THREE lenses at once, scoring each board 1–10 on each. THE OWNER judges by eye in three seconds and said adding parts is "too complex and not visual of a process enough. think images drag drop". THE DEALER has a customer beside them and must add three parts in the fewest, most obvious presses on a tablet. THE DESIGNER weighs hierarchy, honesty of every figure and picture, keyboard reach for every drag, and 390px.\n\n${STATE}\n\nTHE BOARDS: ${JSON.stringify(boards && boards.boards)}\n\nOpen every board's shots and HTML. Pick one, name what to graft from the others, and name what MUST change before it is built. Simple wins ties.`,
  { label: 'judge:choosing', phase: 'Design', schema: PICK },
)
log('choosing → ' + (pick ? pick.pick : 'none'))

phase('Build')
const HOUSE = `HOW IT IS BUILT HERE: read src/screens/configurator/ and src/ui/ whole before writing; match their standard and never draw a flat control of your own. Write the reflow at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 into the stylesheet header. Component tests in happy-dom, by role and text. BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then ONLY your own Playwright specs on your own port (HL2_PREVIEW_PORT=<port> npx playwright test <your specs>). Drive what you built at 834×1112, 1440×900 and 390×844, read your screenshots, and fix what is wrong before you report. Report only numbers you measured.`
const byKind = (kinds) => findings.filter((f) => kinds.includes(f.kind))
const addPicture = await agent(
  `You are building THE PICTURE A DEALER ADDS, the engine and one control, before the screens use it.\n\n${STATE}\n\n${HOUSE}\n\nREAD ${OUT}/original.md, src/data/pictures.ts (the one reader), the image ledger and src/data/imagery.test.ts, src/domain/io/envelope.ts (the backup and its picture allow-list), and how Milestone 4 lets Northside upload a place's mark and hero (src/screens/places/, src/screens/manage/): reuse that, never a second way.\n\nBUILD: (1) in src/domain, a pure record for a picture attached to ONE option (a colour, finish, flooring, part, motor, trailer or any priced line), with provenance (who, when, the option's identity) and a test; (2) in src/data, its bytes stored locally (IndexedDB, downscaled to the largest size the screens draw) and read through src/data/pictures.ts, so EVERY screen, the build, the catalogue and the paper see it with no change of their own; a held picture of the exact item still wins unless the dealer chose theirs; (3) carried in the backup and restored, with its test; (4) one control in src/ui, AddPicture, that takes a picture by upload, by paste, or by dropping a file on the option, with the keyboard path, the preview, the provenance line, and Remove with Undo; a file that is not a picture, or is too large, is refused with a sentence; (5) the act is a catalogue command with an inverse. Do not wire it into screens; the next two builders do. Ports: Playwright 5561, vite 5562.`,
  { label: 'build:picture', phase: 'Build', schema: REPORT },
)
const builds = await parallel([
  () =>
    agent(
      `You are building CHOOSING IN THE BUILD for HL_2.0.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SPEC IS THE JUDGED DIRECTION: ${JSON.stringify(pick)}. The boards: ${JSON.stringify(boards && boards.boards)}. The sweep: docs/research/refs/choosing/notes.md. Open the winning board's shots and HTML before you write a line.\n\nTHE WALK'S FINDINGS YOU OWN (the build, the picker, the cascade and the handover): ${JSON.stringify(byKind(['dropdown', 'parts', 'picture', 'words', 'spacing']).filter((f) => /build|config|picker|cascade|handover|part|accessor|motor|trailer|colour|finish/i.test(f.screen + f.step))).slice(0, 8000)}\n\nTHE PICTURE BUILDER, BEFORE YOU, built AddPicture in src/ui and the picture a dealer adds: ${JSON.stringify(addPicture).slice(0, 2500)}. Wire it into the build and the catalogue.\n\nBUILD: THE PARTS CATALOGUE, at /catalogue and inside the build as the same component (never two): every part and accessory the file prices, browsed by what it is for and where it goes, searched by name, each with its picture or its honest no-picture state, and each offering AddPicture to a dealer; colours, finishes and flooring shown as colours and pictures, each also taking a picture through AddPicture; parts and accessories found by picture and by what they are for, added by press AND by drag with the same keyboard path, shown in the build as pictures in place; every dropdown the walk named replaced by a visible choice, or kept with its reason written in docs/DECISIONS.md; "what fits this boat" one press from the build, landing on /fitment already on this boat (a search param), and back again without losing the quote. Every add and remove is a quote command with an inverse, so Undo works. The figures still sum, cost never shows, and src/domain/quote/golden.test.ts is untouched. Extend e2e/flows/ with a spec that adds three parts by press, one by drag, and one by keyboard, and removes one.\n\nGive /catalogue its door in the shell's one list (under Data) and make it findable. Ownership: src/screens/catalogue/**, src/routes/catalogue*.tsx, src/screens/configurator/**, src/screens/picker/**, src/screens/cascade/**, src/routes/quote*.tsx (not the document's), src/ui/** for any primitive you need (say which), package.json for dnd kit, and their e2e specs. Ports: Playwright 5541, vite 5542.`,
      { label: 'build:choosing', phase: 'Build', schema: REPORT },
    ),
  () =>
    agent(
      `You are making EVERYTHING HL_2.0 CAN DO REACHABLE, and WHAT FITS A BOAT easy to get to, outside the build.\n\n${STATE}\n\n${HOUSE}\n\nREAD ${OUT}/exposure.md and ${OUT}/walk.md. THE FINDINGS YOU OWN: ${JSON.stringify(byKind(['reach', 'exposure', 'words', 'spacing', 'other']).filter((f) => !/build|config|picker|cascade|handover/i.test(f.screen + f.step))).slice(0, 8000)}\n\nTHE PICTURE BUILDER, BEFORE YOU, built AddPicture in src/ui: ${JSON.stringify(addPicture).slice(0, 1500)}. Offer it wherever a dealer manages an option outside the build (a part's or a colour's line in the sheet, fitment, a place's range).\n\nBUILD: (1) what fits a boat within two presses of that boat from Data, the sheet, the boat's place page, Home and the finder (typing a boat's name offers "What fits the <boat>"), every one landing on /fitment already on that boat; (2) every unreachable capability in exposure.md given a way in on its most natural existing screen, as the shell's one list of doors and the finder already do, never a junk-drawer "more" page; (3) the remaining walk findings on these screens. Update ${OUT}/exposure.md so that every row says where it is reached now.\n\nOwnership: everything under src/screens/** and src/routes/** EXCEPT the configurator, picker, cascade, quote and document routes, plus src/app/ways.ts and the shell, and their e2e specs. If a finding needs a file the build's builder owns, write it in your report rather than editing it. Ports: Playwright 5551, vite 5552.`,
      { label: 'build:reach', phase: 'Build', schema: REPORT },
    ),
])
log('built ' + [addPicture, ...builds].filter(Boolean).length + ' of 3')

phase('Verify')
const verify = await agent(
  `You are verifying the round, and nothing else is running, so you may run everything.\n\n${STATE}\n\n1. The full gate: npm test; npm run build; npm run e2e (alone). If something is red, re-run it alone with --last-failed --timeout 120000 --workers 1 and say whether the app or the machine caused it; if the app, fix it.\n2. WALK AGAIN, PRESS FOR PRESS: serve the built app (npx vite preview --port 5561) and do the same three quotes at the same two sizes as ${OUT}/walk.md, logging every press in ${OUT}/walk-after.md. Put the press counts side by side with the first walk's: ${JSON.stringify(walk && walk.presses)}. Mark every first-walk finding CLOSED or OPEN with its evidence.\n3. Prove: a part added by drag, by press and by keyboard, and removed with Undo; what fits a boat reached in two presses from the build, Data, the picker, Home and the finder; the parts' pictures drawn at a size worth drawing, and the no-picture state honest.\n4. Write ${OUT}/verify.md. Report every number and everything still wrong.`,
  { label: 'verify', phase: 'Verify' },
)

phase('Critique')
const critic = await agent(
  `You are an independent critic for HL_2.0 who has never seen it, read-only except ${OUT}/critique.md.\n\n${STATE}\n\nThe verifier's report: ${JSON.stringify(verify).slice(0, 6000)}\n\nServe it (npm run build && npx vite preview --port 5571) and do one quote as the owner would, on a tablet and at a desk, adding parts. Judge it through the owner's words above: is choosing now visual, with pictures and drag and drop; are the dropdowns gone or obviously right; is what fits a boat easy to reach; can a person find everything the app can do; and is it beautiful? THEN THE OWNER'S BAR OF 2026-10-29: "really go through everything objectively and say does this if i take a screenshot look PERFECT. and if not, why not and fix it ... even down to things like scroll and how things expand and collapse". Screenshot every step of the quote at 1440×900 and 390×844 and say of each: PERFECT, or not and why, naming the element and measuring it; scroll the build end to end and open and close every chapter, panel, sheet and list in it, and report anything that jumps, snaps, scrolls the wrong box, covers the total or the act, loses its place, or cannot be done by keyboard. A minor that stops a step being perfect is still a finding. Findings, each with a screen and a severity (a blocker is an invented picture or figure, a drag with no keyboard path, a control that does nothing, cost on a customer screen, a lost quote, or text under 4.5:1).`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)
const serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  await parallel(
    Object.keys(byScreen)
      .filter((k) => byScreen[k].some((g) => g.severity !== 'minor'))
      .slice(0, 6)
      .map(
        (screen, i) => () =>
          agent(
            `You are fixing HL_2.0 against an independent critique (${OUT}/critique.md).\n\n${STATE}\n\n${HOUSE}\n\nYOUR SCREEN: "${screen}". Found on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major and the cheap minors, keeping the screen's idea. Ports: Playwright ${5581 + i * 4}, vite ${5582 + i * 4}. Touch only that screen's files, and name in your report anything that needs another screen's file.`,
            { label: 'fix:' + screen, phase: 'Critique', schema: REPORT },
          ),
      ),
  )
}
const close = await agent(
  `You are closing the click-by-click round of HL_2.0, and nothing else is running.\n\n${STATE}\n\n(1) The full gate alone: npm test; npm run build; npm run e2e, with anything red re-run alone and fixed if it is the app. (2) A fresh, adversarial look: is every item of ${OUT}/critique.md CLOSED or OPEN, with evidence; is every row of ${OUT}/exposure.md reachable; are the press counts in ${OUT}/walk-after.md still true? (3) Re-measure or delete every figure you touch in docs/STATUS.md and docs/SCREENS.md, and append the round's dated lines to docs/DECISIONS.md. (4) Report what is still open, by screen and severity, and the gate's numbers. Do not commit.`,
  { label: 'close', phase: 'Critique', schema: GAPS },
)

return {
  presses: walk && walk.presses,
  findings: findings.length,
  pictures,
  pick,
  builds: builds.filter(Boolean),
  verify,
  critic: critic && {
    wouldHeAccept: critic.wouldHeAccept,
    summary: critic.summary,
    serious: serious.map((g) => `${g.severity} | ${g.screen} | ${g.title}`),
  },
  close,
}
