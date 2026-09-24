export const meta = {
  name: 'hl2-m5',
  description:
    'Milestone 5: the proposal (the quote that looks the part) built first, then document templates with their override cascade, the map of the file, and the pipeline — sweep, build, verify, critique, fix',
  phases: [
    { title: 'Sweep', detail: 'one reference sweep per screen' },
    {
      title: 'Design',
      detail: 'three drawn directions per screen on the real file, judged through three lenses',
    },
    {
      title: 'Build',
      detail:
        'the proposal first and alone, then three screens two at a time, each on its own composition',
    },
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

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Build nothing for a hypothetical second dealership, a second organisation or a business with no price file. When two designs both work, the simpler one wins. Every screen's job is to take a complex topic — a price file of 15,691 rows, 8,679 pairings, a ladder of price levels, a rule that excludes a motor — and make it clear and beautiful, never to show how complex it is.

THE STATE. Repo (cwd): ${NEW}. Milestones 0 to 4 are built and green — twenty screens: entry, home, picker, configurator, cascade, document, quotes, Lost, the sheet (/data/$table), history, data, customers, the shell (a floating pill with a Ctrl K finder), rules, fitment, review, levels, places, manage and the shelf. Read docs/STATUS.md (the top sections), then CLAUDE.md (in your context), then docs/SCREENS.md — every built screen's primary references are listed and NO TWO ROWS MAY SHARE A PRIMARY REFERENCE SET.

MILESTONE 5 IS THE LAST OF THE PRODUCT: what a quote SAYS in the dealer's own words, a picture of what the business holds, and where a deal stands. docs/PLAN.md § "Milestone 5" is the brief, and § "From the original HelmLogic" § "Quote and document templates" is the evidence, surveyed from the original production app's own code.

THE ENGINE AND THE SCREENS THIS BUILDS ON, already in the tree:
- src/screens/document/ — THE DOCUMENT IS BUILT and it is the thing templates author. Read it first and in full: it renders an A4 sheet at true size from FROZEN lines with @page, there is no second renderer for screen and paper, and src/screens/document/paginate.ts packs measured atoms into pages. A template must render through THAT component, never a copy of it.
- src/domain/quote/document.ts — the reading a document draws from; freeze.ts mints the frozen lines; commands.ts carries every mutation with its inverse and typed event
- src/domain/people/organisation.ts — the organisation whose terms and marks a template inherits; src/screens/manage/ sets them
- src/domain/quote/diary/history.ts — indexQuotes, versionsOf, versionMark, standingOf; quote/register.ts and find.ts — the readings the pipeline groups
- src/domain/model/tables.ts, src/domain/catalogue/views/relations.ts and src/domain/modules/links.ts — what the map draws
- src/domain/catalogue/commands.ts + src/state/catalogue.ts, src/state/quotes.ts — every write is a command with an inverse, a said sentence and a typed event

THE PROPOSAL IS WHAT THE OWNER ASKED FOR MOST. His words, 2026-09-23: "really keen on being able to get a quote out properly where it looks the part", and his end goal: "the output can be sent to a customer after downloaded". "PandaDoc-like" most likely means his original HelmLogic's fixed-slot Template Studio and a beautiful PDF; whether it also means PandaDoc's send, track and sign loop is his question 1, and that loop needs Milestone 6 (docs/research/proposal/analysis.md sections 1 and 5). This milestone therefore opens with a fourth track, THE PROPOSAL: the built document upgraded in place to docs/research/proposal/quote-spec.md, built ALONE and FIRST, because templates author into its pages and preview through its component. Where docs/DECISIONS.md records the owner's answer to a question in analysis.md section 7, follow it; otherwise build the default in that table.`

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

THE OWNER'S STANDARD: five redesigns rejected on sight; "it still feels like a database, it is not beautiful enough, it does not feel alive"; "all of the same functionality, presented beautifully"; "i can't stress enough how easy this system has to be to use". A user never sees the words entity, schema, field type or reference.

OVERLAP, REPETITION AND WORDS — the owner, 2026-09-24: "seeing overlap of info and things on some screens". Nothing is drawn over anything else: the pill, sticky heads, stages and panels included, at rest AND scrolled, at every size — the overlap ruler measures floating chrome and scrolled states since hl2-refine, and a red overlap is fixed at its cause, never by loosening the ruler. Every fact is said ONCE on a screen, where it matters, and no way out is offered twice (the pill already carries Home, Quotes, Customers, Data and History). Every word is the dealer's, per docs/WORDS.md — never row, register, rung, table, column, frozen, pack, ledger or held copy on a screen a dealer reads; the word guard in tools/check.ts refuses them.

THE COMPONENT LANGUAGE (hl2-components, after the owner said on 2026-09-24 "components are so bland and boring..."): every control comes from src/ui in the kit that round built — see it whole at /kit — with Phosphor icons where they make a thing read faster, the kit's materials and light, and its motion vocabulary from src/ui/motion.ts (press, hover, enter and exit, layout, route). A screen never draws a flat control of its own. Installed is not adopted: motion, @phosphor-icons/react and @number-flow/react are used where they earn their place, the price figure still never counts up, and reduced motion is honoured.

LEARNINGS FROM EVERY CRITIQUE SO FAR (docs/research/proposal/analysis.md; the critiques under docs/research/refs/ and docs/directions/), which this round must not repeat: (1) one composition stamped across several screens is introduced the moment a direction is chosen from words, so draw it, and name on every board which built screens it could repeat; (2) a measured figure in docs/STATUS.md or docs/SCREENS.md goes stale, so re-measure or delete every figure you touch at close-out (on 2026-09-23, STATUS.md lines 103, 130 and 153 still said three sale screens are not in e2e/routes.ts, and routes.ts includes all three); (3) a check that passes while measuring nothing is worse than none: the document's print test counted pages and stayed green while the app's navigation printed on every page of the customer's quote, so press the control and check where it lands, and read what was printed rather than counting it; (4) refusals went wrong four ways, loud at rest, repeated per row, false, or in plan vocabulary, so give one per cause, above the list, in the dealer's words; (5) research already paid for is cited, not bought again, so reconcile against docs/reference/* at build time; (6) never only Porsche; (7) an honest empty state still has to look designed, and the day-one research in docs/research/refs/home/notes.md section 5 and docs/research/refs/both/notes.md section 3 is there to use; (8) anything a customer can see while sitting beside the dealer is a customer surface, so no cost, margin or cost-derived price there either.`

const SWEEP_BRIEF = `You are running the reference sweep for ONE screen of HL_2.0 before it is designed. Do not commit. Write only under docs/research/refs/<screen>/.

${STATE}

READ AS THE STANDARD, NOT TO REPEAT: docs/research/refs/document/notes.md (the paper, which this milestone authors), docs/research/refs/configurator/notes.md, and the critics docs/research/refs/critique-m2.md, docs/directions/built-critique-m3.md and built-critique-m4.md. Their standing faults, which no board here may repeat: two directions inside one screen that are the same composition on a different ground or the same stack reordered; a direction whose "exclusive" reference is a text page or a diagram showing no shape; and a milestone whose directions are all one narrow-list-left, detail-right composition.

BUDGET, because this is a four-core machine and a sweep's transcript once reached 170 MB and killed an agent: capture at most 45 new frames, and open at most 40 with the Read tool. A frame you did not open you do not cite.

CAPTURE TOOL: npx tsx tools/research/capture.ts <screen>/<modality> <list.json> [--width 1440 --height 900]. Read the tool first. Consent banners are answered with the most privacy-preserving button. Never sign in, never create an account, never type personal data, never fight bot protection — a site that refuses is listed under failed with its reason. Public demo and documentation pages are fair game where an app needs a login.

EXISTING STOCK, use before capturing: ${STOCK}/tables/ and ${STOCK}/boats/ (including the Porsche configuration PDF captured page by page), plus docs/research/refs/<built-screen>/ for the nineteen sweeps already done — theirs to cite, but a frame a built screen uses as PRIMARY cannot be your primary.

WRITE docs/research/refs/<screen>/notes.md, under 2,500 words, in the shape the existing sweeps use: (1) what is genuinely best for THIS screen and why, citing frames by path; (2) the interaction patterns worth taking, each NAMED, with the frame that shows it; (3) the type and motion choices seen and what they do for the person; (4) what to avoid, each with the frame that shows the failure; (5) three or four DIRECTIONS, each a different composition AND a different order and grouping, each naming two references no other board could claim, what only this screen does, how it reflows at 390 / 834 / 1920, and what Northside can change about it from its own settings; (6) what the seed can honestly put here. Plus sources-index.md: every frame with its URL and one line.`

const SCREENS = [
  {
    key: 'proposal',
    port: 5441,
    owns: 'src/screens/document/**, src/routes/quote.$id_.document.tsx, src/routes/quote.$id_.accept.tsx (Phase 2 only), e2e/flows/document.spec.ts and its row in e2e/routes.ts; the Handover function in src/screens/configurator/Configurator.tsx and its tests in Configurator.test.tsx, only if your judged direction puts the money acts there (no other Milestone 5 track touches the configurator, and this track builds alone); and in src/domain only the pure additions quote-spec.md marks NEW (freeze.ts, document.ts, commands.ts, totals.ts), each with its test. src/domain/quote/golden.test.ts is untouched. The document has no door of its own in the shell; do not add one.',
    brief: `SCREEN: THE PROPOSAL, at /quote/$id/document (the built document, upgraded in place in src/screens/document/) and, only on the owner's yes, /quote/$id/accept. It is the quote a salesperson is proud to hand over, and the one thing in this app that leaves the building.

READ FIRST, IN FULL: docs/research/proposal/analysis.md; docs/research/proposal/quote-spec.md (THE SPEC: every page and element, each marked BUILT, ENGINE, NEW, P0, M3, M4, M5, OWNER or P2); docs/research/refs/proposal/market.md (already in your sweep folder; write your notes.md beside it); docs/research/refs/document/notes.md; src/screens/document/ with src/domain/quote/document.ts; and docs/DECISIONS.md for any dated line recording the owner's answers to analysis.md section 7.

WHAT TO BUILD, in order, each proven: (1) whatever of Phase 0 (analysis.md section 6) is not already true on this tree; (2) the letterhead and contact panel from Milestone 4's settings and people, frozen at issue; (3) the cover per quote-spec section 3: the band as built and never a bleed, the row's own held picture read through the imagery round's one reader, the honest caption, and the validity line at the size the phone test needs; (4) Your boat per section 5: no code column, customer words, partner facts frozen at pick, the trailer's registration split out, fit-up and rigging as one line on the customer's copy, and thumbnails only where a person marked the picture as that exact item; (5) What comes with your boat, only if the packed inclusions exist, and otherwise left out with the reason on the dealer's note; (6) choosing what goes in per section 7a, decided before issue and frozen with the quote; (7) Your price per section 8: every adjustment its own row with its reason, and GST stated only as docs/DECISIONS.md records the owner's choice, otherwise the label alone; (8) the last page per section 9: the terms slot and its empty state (templates, built after you, fills it), validity, what happens next, the contact panel, and the two blank signature blocks Client acceptance and Merchant authorisation; (9) the way out per section 10: the PDF's name, the Write the email helper (a mailto; nothing is sent by the app), and page 1 legible at a phone's fit-width; (10) acts for the commands the engine has and no screen calls (addAdjustment and its siblings, setNote, setTaxRate, setPreparedBy, setQty, setOverride with its reason, addFreeLine), on a draft, before issue: either beside the draft document (the document already renders a draft, Document.tsx:882) or in the configurator's handover, where the quote is issued (Configurator.tsx:1629). Say which the judged direction chose and why. Build a switch the owner has not asked for (band-only prices, a printed dealer's copy) only where docs/DECISIONS.md records his yes: simple wins.

PHASE 2, ONLY ON THE OWNER'S YES to analysis.md section 7 question 3, recorded in docs/DECISIONS.md. If yes, build acceptance at the desk per quote-spec section 9 item 7: a new accepted event naming the issued version, never an edit of it; the customer's typed name and signature, the time and the witnessing salesperson recorded; and Northside's own setting that it takes signatures this way, because under the Electronic Transactions (Queensland) Act 2001 s14(1) the consent is that of the person the signature is given to, which is the dealership (market.md section 5.3). A customer tick agreeing to sign electronically is good practice, not that condition. The acceptance wording is Northside's; without it the act refuses with a sentence. It works only in the browser that raised the quote until Milestone 6, and the screen says so. If there is no yes, build the print-and-sign blocks only and leave acceptance capture on docs/LATER.md with its reason.

THE RULES THAT CANNOT BEND: one set of nodes for screen and paper, so no PDF library and no second renderer; the document never reads the catalogue; nothing invented, so a missing letterhead fact, term, validity date, name or picture is left out and the dealer is told why, never filled, and no board or test shows a validity date nobody typed; no cost, margin or cost-derived level on the paper or on the note beside it, because the customer sits beside that screen; a picture only of the exact thing, never drawn wider than its held pixels; nothing charged reads Included; the price beside who it is for; the total at least as prominent as any other price and including GST; every figure on the paper sums, proven on the printed text of both example quotes.

THE HARD QUESTIONS: (1) how does a boat, motor and trailer quote look premium on A4 without a brochure's invented story? What do Saxdor's brochure, Porsche's configuration PDF, the MTA SA new-car contract and PandaDoc's sales quote each get right on paper? (2) the band holds a 1,024 px photograph and a 1,100 px render: how is each made to sell the boat without enlargement, and what does the caption say when the outboard in the photograph is not the one quoted? (3) the signature page: how do HubSpot's print-and-sign, PandaDoc's sales quote and the MTA contract make acceptance clear without the app writing terms? (4) the note beside the sheet carries codes and workshop facts while the customer watches: how does it stay useful to the dealer and quiet to the customer? (5) page 1 at a phone's fit-width: which four facts read without zooming? (6) where does a salesperson add a trade-in and a discount so that the paper says why each is there? (7) how short can the written pages be and still feel premium, given the owner's "I don't like the walls of text" and "simple wins"?

REFERENCES TO DRIVE: first, OPEN the frames market.md captured and did not open (docs/research/refs/proposal/market/proposify-quote-templates.png, hubspot-quote-template-kb.png, oneflow-contract.png) and re-read the opened ones (pandadoc-sales-quote-template, qwilr-quote-template, betterproposals-quote-templates, servicem8-proposals, tradify-quote-template); the MTA SA sample contract PDF (market.md section 4.1); Porsche's configuration PDF in the stock, including its Select PDF content modal; Saxdor's brochure frames under docs/research/refs/document/live/. Then capture: two boat builders' own spec-sheet or brochure PDFs (Riviera, Nimbus, Axopar or Sea Ray); one car maker's configuration PDF other than Porsche (BMW, Volvo or Polestar); DocuSign's and Adobe Acrobat Sign's in-person signing documentation; and Stripe's invoice PDF. Never only Porsche.

DIRECTIONS: three, drawn on the golden Stacer 529 Assault Pro (Tournament) at $51,563 and on the Highfield SP560 (HYP) LG-W-WB Mark McWilliams field-tested, at $73,594 as HL_2.0 prices it today. Each is a different composition of the same pages, and each keeps the total beside the customer's name on page 1. Where the customer's name belongs, draw the instruction the handover shows, never an invented name; where the validity date belongs, draw its placeholder. Draw each at A4 and at a phone's fit-width, and draw the note beside the sheet.`,
  },
  {
    key: 'templates',
    port: 5411,
    brief: `SCREEN: TEMPLATES, at /templates and /templates/$id — what a quote SAYS, in the dealership's own words, around the parts the app computes.

THE SHAPE, taken from the original production app's own Template Studio and corrected by the plan: eleven sections in order, four of them SYSTEM sections the app computes and nobody edits (cover, vessel configuration, pricing, signatures) and seven AUTHORED (salesperson message, why choose us, brand and model story, after-sales confidence, finance and insurance, value summary, terms and conditions). The original locked the cover; the plan's correction is that the COVER IS A FLOWABLE BAND so all seven authored blocks can reorder. Each authored block has a sub-header, the quote it belongs to (contracts are on docs/LATER.md:6, so a contract flag would be a control nothing reads) and an \`isLockedForQuotes\` flag.

THE OVERRIDE CASCADE, which is the heart of this screen: per-quote → brand → organisation, short-circuited by an admin lock, and BELOW THE ORGANISATION THERE IS NOTHING. The plan called it four layers; the original's own code had three for block text (the per-quote layer skipped when locked), organisation-only styles, no brand layer for sub-headers, and a hard-coded fourth layer for terms only, which printed four terms nobody at Northside wrote (HelmLogic src/lib/content-blocks.ts:59-65, 248-312, 326-390; src/components/proposal-pdf.tsx:374-427; docs/research/proposal/analysis.md section 2). Here an empty cascade leaves the section off the paper and the composer says why. The brand layer keys on the places Milestone 4 built; src/domain/model/project.ts says no brand layer exists yet, so it is yours to add in src/domain with its test. The owner handed "how the brand reads on a customer's quote" to the people who know each brand (HelmLogic tasks/EMAIL_release_update.html:23): that is a person editing a layer, not a new role or permission. A dealer authors terms once, locks them, and every issued document prints them; a salesperson personalises one quote's cover letter and the locked terms stay untouched. Draw the cascade so a person can SEE which layer a block is coming from and what would happen if they edited it here.

VERSION HISTORY on every save, with non-destructive restore (restore-as-a-new-version) and a compare view. PROSE IS STORED AS PROSEMIRROR JSON, not HTML — TipTap is the editor the owner's own library list names. Tokens resolve AT ISSUE and are frozen with the prose; a token with no value prints nothing, and the composer says which. There is no customer first-name token: the quote holds one name field as typed (src/domain/model/people.ts:22-25), and the original's split printed "Dear SP560," (docs/research/proposal/quote-spec.md section 7).

THE TWO RULES THAT CANNOT BEND: (1) the preview renders THE IDENTICAL COMPONENT as print — src/screens/document/ — never a second renderer, because the document screen's whole reason for existing is that screen and paper cannot disagree. (2) PROSE IS FROZEN ONTO THE QUOTE AT ISSUE, exactly as prices are; the original's live-prose bug, where an issued document's words changed when somebody edited a template months later, is not carried.

THE HARD QUESTIONS: (1) a fixed-slot composer with four locked sections is a strange object — how do the best show "you may write here, the app writes there" without it feeling like a form? (2) how is the override cascade drawn — three layers — this quote, its brand, Northside — one value, and which one wins — so a dealer knows what they are changing? (3) what does side-by-side authoring and preview look like when the preview is a real A4 page? (4) how does version history read for prose, and what does a compare look like? (5) what does the lock look like from the salesperson's side — a block they cannot edit, with the reason? (6) 390px, where authoring is probably reading?
REFERENCES TO DRIVE: Qwilr and PandaDoc's proposal editors, DocuSign and Adobe Sign templates, Notion's template gallery and its synced blocks (the closest consumer drawing of "this content lives elsewhere"), Figma's components with overrides and its variables-with-modes panel, Webflow's CMS templates, Contentful and Sanity's structured-content editors, Mailchimp and Klaviyo's email template editors, Google Docs' suggestion mode and version history, Craft and Linear's document editors, Salesforce and HubSpot quote templates (docs), and Canva's brand templates with locked elements.

WHAT THE PROPOSAL TRACK, BUILT BEFORE YOU, CHANGES HERE. (1) The slots you author are the proposal's pages: read src/screens/document/ as that track left it, and docs/research/proposal/quote-spec.md sections 7 and 7a for the order and the per-quote choice. (2) THE PREVIEW IS A REAL QUOTE, through the same resolver as issue. The original's preview used the same component on an invented customer, James Thompson, with invented prices and different inputs from its PDF (HelmLogic src/lib/sample-quote-fixture.ts:213; src/components/content-blocks-pdf-preview.tsx), so an author saw a document no customer got. Where no quote exists, the preview says so and offers to start one. Never a fixture. (3) THE SALESPERSON'S NOTE is written per quote and frozen at issue; the original read it live from the salesperson's profile, so an edited letter or a departed salesperson changed every past quote (HelmLogic src/lib/render-quote-pdf.ts:88-107). (4) THE ORDER NORTHSIDE SETS REACHES THE PAPER. Bill Hull's drag reordered the original's preview and never the customer's PDF (HelmLogic src/lib/render-quote-pdf.ts:204-213); prove yours on a printed PDF. (5) PROSE PAGINATES: store and draw written blocks as paragraph-sized pieces, because src/screens/document/paginate.ts packs one piece per block and a multi-page terms block would overflow its page. (6) SHORT: the owner said "I don't like the walls of text" and "simple wins"; show a block's length on the page as it is written, and make every written block optional per quote. (7) The email template (the subject and body for the proposal's Write the email helper) is a slot here too.`,
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
REFERENCES TO DRIVE: Linear's board view and its cycle columns, Height, Trello and Jira boards, Notion's board database, Pipedrive and HubSpot deal pipelines (the exact analogue — a sales pipeline with money in it), Salesforce opportunity kanban (docs), Attio's deal objects, Shopify's order flow, Monday.com, Asana's board, GitHub Projects' board and its field summaries, Basecamp's Hill Charts (the best argument that a board is not the only shape for "where things stand"), and any marine or car dealership management system with a public demo.

THE LIFECYCLE THE APP ACTUALLY KNOWS is draft, given and replaced, plus accepted (an event naming a version) only if the proposal track built acceptance at the desk. A static site cannot know that a customer opened a quote, so there is no viewed stage, and a stage the dealer names is a fact the dealer sets, never inferred.`,
  },
]

const MS = 'm5'
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
    `You are the designer for one screen of HL_2.0, and you are drawing, not building.\n\n${STATE}\n\nTHE SCREEN: ${s.brief}\n\nITS SWEEP: docs/research/refs/${s.key}/notes.md, written this round, holds three or four directions in words. The other screens in this round are ${SCREENS.map((x) => x.key).join(', ')}; read their notes too, because no two screens in this app may share a composition, and every critic this repository has run has caught one shape stamped across several screens.\n\nDRAW THREE of those directions — or better ones the sweep did not name — as self-contained HTML boards at 1440×900 in docs/directions/${s.key}-boards/, each a genuinely different COMPOSITION and a different ORDER AND GROUPING of the content. Draw them on the REAL price file (data/northside/: real names, real figures, real held pictures by their public/seed-images path; never an invented row, customer, rule or figure; where the true state is empty, draw the empty state and make it good) and on the app's own tokens copied from src/styles/tokens.css, never an invented colour. Draw each at 390×844 too. Write docs/directions/${s.key}-boards/canvas.json in the shape tools/research/board.ts reads, run npx tsx tools/research/board.ts ${s.key}-boards and npx tsx tools/research/shots.ts ${s.key}-boards (read both tools first), and LOOK at every shot. Under each board, in a strip: its idea in one sentence, how it reflows at 390 / 834 / 1920, what Northside can change about it from its own settings, and how its silhouette differs from every built screen it could be confused with (look at docs/directions/*/built/). Budget: open at most 25 pictures. Change nothing under src/. Do not commit.`,
    { label: 'boards:' + s.key, phase: 'Design', schema: BOARDSET },
  )

const judgeBoards = (s, set) =>
  agent(
    `You are judging three drawn directions for one screen of HL_2.0 through THREE lenses at once, scoring every board 1–10 on each:\n- THE OWNER: Asaf, who has rejected five redesigns on sight and judges by eye in three seconds against the best boat and car configurators in the world. His words: "it still feels like a database", "not beautiful enough", "it does not feel alive", "I want the logo to be the showpiece thing", "a bit more colour usage please".\n- THE DEALER: a sales manager with a customer at the desk, who reads nothing and must get the job done fastest with least thought — and still like it at 5pm.\n- THE DESIGNER: hierarchy, density, scan path, the honesty of every figure, whether it holds at 390px, and whether its silhouette is its own or a copy of another screen in this app.\n\n${STATE}\n\nTHE SCREEN: ${s.brief}\n\nTHE BOARDS: ${JSON.stringify(set.boards)}\n\nOpen every board's 1440 and 390 shot (the Read tool renders PNGs) and a sample of docs/directions/*/built/ for what this screen must not become. Return per-board scores on the three lenses with a why; \`pick\` (the highest sum; a tie goes to the SIMPLER board, because the owner's rule is \"simple wins\", and then to the owner's lens); \`graft\` (one idea from a losing board the winner must steal); \`mustChange\` (one thing about the pick to change before it is built). Honest scores — flattery costs him money. Change nothing.`,
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
const OWNS = (s) =>
  s.owns ||
  `src/screens/${s.key}/**, src/routes/${s.key}*.tsx, e2e/flows/${s.key}.spec.ts, your row in e2e/routes.ts, your door in the shell's one list of doors, and src/domain only for a missing pure derivation with its test`
// BUILD_PROMPT is the existing inline build template, moved into (s, si) => `…` unchanged,
// except that its "Ownership: …" sentence becomes: Ownership: ${OWNS(s).replace(/.$/, '')}.
const BUILD_PROMPT = (s, si) =>
  `You are building a real screen for HL_2.0.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SPEC IS THE JUDGED DIRECTION. The sweep is docs/research/refs/${s.key}/notes.md; three directions were then DRAWN on the real file (docs/directions/${s.key}-boards/) and judged through the owner's, the dealer's and the designer's lenses. The verdict: ${JSON.stringify(picks[si] || null)}. The boards: ${JSON.stringify((designs[si] && designs[si].boards) || [])}. Build the pick, steal the graft, make the must-change — and open the winning board's shots and its HTML before you write a line. If no board was drawn, choose from the sweep's own directions, avoid any composition another screen in this round would obviously take, and say so. Say in \`direction\` what you built and why it is right for this screen.\n\n${s.brief}\n\nOwnership: ${OWNS(s).replace(/.$/, '')}. Ports: ${s.port} for Playwright, ${s.port + 1} for vite.\n\nTHE MILESTONE'S EXIT CRITERION IS SHARED: a dealer authors a cover letter and terms once, locks the terms, and every issued document prints them, with the preview and the print being the same component and version restore non-destructive; and a drag on the board never edits a frozen quote. And the golden Stacer 529 Assault Pro (Tournament) and the Highfield SP560 (HYP) LG-W-WB, issued after Northside's settings are filled, each print a PDF that passes every item of docs/research/proposal/quote-spec.md section 13 that the owner's recorded answers allow. Own your half and prove it in your own flow spec; do not break the other halves.`
const buildOne = (s, si) =>
  agent(BUILD_PROMPT(s, si), { label: 'build:' + s.key, phase: 'Build', schema: REPORT })
// THE PROPOSAL FIRST AND ALONE: templates author into its pages and preview through its component.
const firstBuild = await buildOne(SCREENS[0], 0)
const restBuilds = await parallel(SCREENS.slice(1).map((s, i) => () => buildOne(s, i + 1)))
const builds = [firstBuild, ...restBuilds]
log('built ' + builds.filter(Boolean).length + ' of ' + SCREENS.length)

phase('Verify')
const verify = await agent(
  `You are verifying HL_2.0 as a boat dealer's sales manager would — somebody who reads nothing and expects it to work.\n\n${STATE}\n\nNothing else is running now, so you may run everything. Change only what a command needs to run; report everything else.\n\n1. Full gate: npm test; npm run build; npm run e2e (alone — about 30 minutes idle). Report every number. If a check is red, say whether it is the app or the machine, and re-run it alone with --last-failed --timeout 120000 --workers 1 to tell which. Report both readings.\n2. Serve the built app (npx vite preview --port 5461) and DRIVE THE MILESTONE'S EXIT with the browser tools, screenshotting and READING every step: Before /templates: issue the Stacer 529 Assault Pro (Tournament) and the Highfield SP560 (HYP) LG-W-WB, print each to PDF (docs/directions/document/built/529.pdf and sp560.pdf), open both with the Read tool, and mark every item of docs/research/proposal/quote-spec.md section 13 pass or fail with its page. /templates: author a cover letter and terms, LOCK the terms, look at the side-by-side preview and confirm it is the document's own component → raise a quote, personalise its cover letter, see the locked terms untouched → issue it → print it and confirm the authored prose is on the paper → go back to /templates, EDIT THE TERMS, reopen the issued document and confirm ITS PROSE DID NOT CHANGE (frozen at issue) → restore an older version and confirm it restores as a NEW version → /map: read what the business holds, press a node and land where it says → /pipeline: name a stage, move a deal, confirm the frozen quote is untouched, undo the move → then walk the whole sale again to be sure nothing broke.\n3. The same at 390×844 and 1920×1080.\n4. Write docs/directions/built-m5.md: one honest paragraph per screen at each size, screenshots under docs/directions/<screen>/built/. Say plainly where the flow breaks, where it is confusing, where a control does nothing, and where two screens read as the same shape.\n5. REFUSAL ROT: grep every refusal sentence in src/screens/** and src/routes/** and list each with whether it is still TRUE on this tree.\nReport the gate numbers and everything that is wrong.`,
  { label: 'verify', phase: 'Verify' },
)

phase('Critique')
const critic = await agent(
  `You are the independent critic for HL_2.0, read-only except docs/directions/built-critique-m5.md.\n\n${STATE}\n\nJudge the proposal and the three new screens, and the app they complete, as the owner would. Read docs/directions/built-m5.md and look at every screenshot under docs/directions/{document,templates,map,pipeline}/built/ and a sample of the older ones. Read each screen's sweep notes to see what it promised. Then read the source for what a screenshot cannot show. The verify agent's report: ${JSON.stringify(verify).slice(0, 6000)}\n\nFindings, each with a screen and a severity:\n- blocker: an invented quote, stage, template or photograph; a template preview that is a second renderer rather than the document's own component; prose that is not frozen at issue; a drag that edits a frozen quote; a hard-coded colour, face or picture path; text under 4.5:1 on its real ground; anything under 11px; a control that does nothing; a refusal that is false on this tree; a cost column on a customer surface; a write that bypasses the command layer; a canvas mounted in a box-less container; the words entity / schema / field type / reference on a reader-facing surface; any half of the milestone's exit criterion not actually true; a customer's paper carrying the navigation, a code, a workshop fact, the app's own vocabulary, a cost-derived level, a charged item reading Included, or an invented term, validity date, name or picture; a template preview that runs on a fixture; a letterhead or prose that changes on an issued quote; a printed PDF whose figures do not add up.\n- major: two screens that read as one shape; the pipeline reading as the quotes register a second time; the map telling a dealer nothing /data does not; a layout that fails at 390 or 1920; a board unreachable by keyboard; an override cascade a person cannot read; a screen that lost its sweep's own idea.\n- minor: craft.\nThen answer plainly in wouldHeAccept: would the owner accept these four screens on sight, and if not, name the ONE thing to change first. He has rejected five redesigns; flattery costs him money.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const byScreen = {}
  for (const g of critic.gaps || []) (byScreen[g.screen] = byScreen[g.screen] || []).push(g)
  const ports = { proposal: 5441, templates: 5411, map: 5421, pipeline: 5431 }
  await parallel(
    Object.keys(byScreen)
      .slice(0, 8)
      .map(
        (screen, i) => () =>
          agent(
            `You are fixing a built screen of HL_2.0 against an independent critique.\n\n${STATE}\n\n${HOUSE}\n\nTASK: fix the "${screen}" screen. Read docs/directions/built-critique-m5.md and built-m5.md and look at that screen's screenshots.\n\nFound on it: ${JSON.stringify(byScreen[screen])}\n\nFix every blocker and major finding and the cheap minor ones. Keep the screen's own idea; answer the criticism rather than flattening it. Re-run your own gate (ports: Playwright ${ports[screen] || 5471 + i * 10}, vite ${(ports[screen] || 5471 + i * 10) + 1}), drive the screen again at 1440×900 and 390×844, look at your screenshots, and report what you changed and what you deliberately did not.`,
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
  `You are an independent critic for HL_2.0, and you have never seen it before. Read-only except docs/directions/built-critique-${MS}-2.md.\n\n${STATE}\n\nA first critique (docs/directions/built-critique-${MS}.md) was answered by a fix round; the re-verifier's report: ${JSON.stringify(verify2).slice(0, 8000)}\n\nJudge the screens this milestone built AS THEY ARE NOW, not the list. Read docs/directions/built-${MS}-2.md, look at their screenshots under docs/directions/*/built/, read the source for what a still cannot show, and serve it (npm run build && npx vite preview --port 5911) to drive anything a still cannot prove. Be adversarial: for each item of the first critique say CLOSED or OPEN with the evidence — a claimed fix you cannot see is open — then find what is NEW. Findings with a screen and a severity (blocker: invented data, a false refusal, a control that does nothing, text under 4.5:1, under 11px, cost on a customer surface, a write around the command layer, a derivation in JSX, a plan word or route pattern on a screen, the milestone's exit criterion not true; a customer's paper carrying the navigation, a code, a workshop fact, the app's own vocabulary, a cost-derived level, a charged item reading Included, or an invented term, validity date, name or picture; a template preview that runs on a fixture; a letterhead or prose that changes on an issued quote; a printed PDF whose figures do not add up. major: two screens one shape, a register under 18 rows at 1280×800 by the ruler, a layout that fails at 390 or 1920, a refusal as the loudest thing at rest, a keycap on a coarse pointer, anything the owner would name within a minute. minor: craft). Then wouldHeAccept, and the ONE thing to change first. Flattery costs him money.`,
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
  `You are closing Milestone 5 of HL_2.0 — the last milestone before the owner's review.\n\n${STATE}\n\nNothing else is running. (1) Grep every refusal and every "not built" / "does not exist" / "yet" sentence in src/screens/** and src/routes/** and make each one TRUE on this tree — retire the ones whose screen now exists by wiring the act to it, keep the ones still true, and make sure every screen has its door in the shell's one list and is reachable by the finder. (2) Read docs/SCREENS.md: every screen has a row, no two rows share a primary reference set, every status says what is measured. (3) PROVE THE MILESTONE'S EXIT CRITERION end to end and say the numbers: authored prose locked, printed, and frozen against a later edit; version restore non-destructive; a drag that leaves a frozen quote untouched. (4) Run the full gate alone — npm test; npm run build; npm run e2e — and report every number; fix what is red if it is the app and say so if it is the machine. (5) Append to docs/STATUS.md under a new dated heading "Milestone 5 is built" with one paragraph per screen. (6) Read docs/LATER.md and make sure everything this milestone did NOT build is named there with its reason, so nothing is silently forgotten. (7) Apply the documentation corrections in docs/research/proposal/briefs.md section 9 to docs/LATER.md, docs/PLAN.md and .claude/workflows/README.md, each as it reads on this tree. Report what you changed.`,
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
