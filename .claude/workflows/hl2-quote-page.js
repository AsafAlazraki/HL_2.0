export const meta = {
  name: 'hl2-quote-page',
  description:
    "The owner's build-page redesign of 2026-10-30, from his own screenshot: only the chapters scroll, the masthead in the top bar, choosing a boat's model, finish and material inside the hull chapter, products in a popup, a full-screen summary to finish, and quoting a motor, trailer or parts on their own",
  phases: [
    {
      title: 'Build',
      detail: 'the page, then the hull and the summary, beside the start and the shell',
    },
    { title: 'Verify', detail: 'the gate and the affected specs, read by eye at four sizes' },
    { title: 'Critique', detail: 'a fresh critic to the perfect bar, fixes, pushed' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/quote-page'

const OWNER = `THE OWNER, 2026-10-30, looking at /quote/$id for a Highfield Sport 560 at a desk (his screenshot: the maker's mark, the name and the finish swatches over a white strip reading QUOTE 20261030-01 · STANDS Draft · STARTED · FOR Name the customer · PREPARED BY Asaf; the photograph at left with two caption lines and "Photograph from media.highfieldboats.com" under a row of specs; the TOTAL card with its coloured bar at bottom left; the search and a step meter at top right over the chapters The hull, Motor, Trailer and Dealer fit, the last open on its packages), word for word:

"the only thing that should scroll is the right hand bar the rest stays as is please. also that experience could be a bit better the clicks and the animations when opening and all of that and move find in the top float bar to the top left in the bar before home. getting much better already. We dont need that little text under the photo on the left so we can make the most of the space and make image bigger. also the experience of viewing all of the products and things should be popup please done nicely. Let's have in that left hand side of that white bar on the top that is where you put highfield logo and then have model details and things. I want for highfield the picking model color and all of that nonsense to be done in hull section and same for all boats please so they can see differences in real time and same with material and that is applicable same theme to all other things like stabi with variants or whatever. for specs, ability to open more of them and design that a bit nicer. remove the photograph from media.high whatever because not needed. customer details i live in the top bar so we can remove who it for in the right hand scrolly and let's make the finale section nicer. also things look a bit blurry sometimes and the finale section should actually take the whole page summary when you scroll to that, fits to screen size type thing but big one page one filled screen summary with print and send and all of that and then you scroll up and can edit and things and then scroll down and then see big summary and all of that with all the photos and whatnot."

And earlier the same day: "quotes are not just boats - also motors or trailers or even dealer fit things as well and you can sell those as well", "i dont like the quotes home page either", and "it just looks so half baked" of New quote. The bar for everything: "if i take a screenshot, does it look PERFECT, and if not, why not, and fix it ... even down to scroll and how things expand and collapse".`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms), splitting a long suite into several calls. Stop every dev or preview server you start before you report.

Repo (cwd): ${NEW}. HL_2.0 is Northside Marine's quoting app; CLAUDE.md is in your context and binds you (no invented data, cost never on a customer surface, a refusal is a sentence, tokens not literals, pure derivations in src/domain). The build page is src/screens/configurator/ (Configurator.tsx is ~4,900 lines; read the parts you change whole, and its header comments), with src/ui/Lightbox.tsx, src/ui/OptionTile.tsx, the chandlery in src/screens/catalogue/, the tally in src/domain/quote/tally.ts. The last round's reports are docs/directions/flow/ (walk.md, exposure.md, critique.md if present). The weekly usage is nearly spent, so be economical: no sweeps of the web, no drawn boards; the owner's words below ARE the spec, and where they leave a choice, the simpler design wins.

${OWNER}

PICTURES: a picture still belongs only to the exact model it depicts, and its provenance stays in the image ledger. Taking the credit line and the caption off the page is the owner's call; the provenance and any "photographed with a different outboard" honesty move INTO the lightbox's caption, so nothing is lost, only moved.`

const HOUSE = `BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then only the Playwright specs you touched, on your own port (HL2_PREVIEW_PORT=<port> npx playwright test <specs> --workers=2). A spec whose assertion your redesign makes untrue is rewritten to assert the new truth, and you say which. Then serve the build on your port, drive what you built at 1440x900, 1920x1080, 834x1112 and 390x844, READ your screenshots (save them under ${OUT}/), and fix what is not perfect before you report. Do not commit. Report only figures you measured.`

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
          area: { type: 'string', enum: ['page', 'start'] },
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
    `In ${NEW}, take a checkpoint of work in progress and push it, because the owner watches the live site. Run git status --short; if nothing changed, say so and stop. Otherwise: remove any throwaway diagnostic spec (e2e/flows/zz-*.spec.ts) and any FAULT-*.png, then git add -A, then git commit with the message "Checkpoint: ${what}, mid-round; not gated" followed by a blank line and "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", then git push origin main. Report the commit hash and the number of files.`,
    { label: 'checkpoint', phase: 'Build', effort: 'low' },
  )

phase('Build')
const PAGE = `You are rebuilding the LAYOUT of the build page, /quote/$id, to the owner's words. You own src/screens/configurator/** and its specs (e2e/flows/build-page.spec.ts, configurator specs) for this pass.

${STATE}

DO, each proven at the four sizes:
(1) AT A DESK (wide enough for two columns) ONLY THE CHAPTERS SCROLL. The page itself does not move: the top bar, the photograph, the specs and the total stand still, and the right-hand column of chapters scrolls inside itself (one scroller, overscroll contained, its scroll position kept on reload via the URL's chapter, a chapter opened scrolled into view). On a phone and a narrow tablet, where there is one column, write in the stylesheet header how it reflows instead, and make that reflow perfect too.
(2) THE TOP WHITE BAR BECOMES THE MASTHEAD: its left side holds the maker's mark, the model's name and its details (series, finish swatches and words, material), then the quote's number, state, started and prepared by, and the CUSTOMER: the bar is where a customer is named and their details are kept (everything the "Who it is for" chapter held: name, and any contact fields that chapter offered), so the "Who it is for" chapter is REMOVED from the right-hand column. The big name and mark that stood above the bar go into it, so the page starts with the bar.
(3) THE PHOTOGRAPH GETS BIGGER: no caption lines and no "Photograph from …" under it; the space they took goes to the picture, which still opens in the lightbox (which now carries the caption, the provenance and any honest "photographed with" note). It is never drawn larger than its own pixels (see 6).
(4) SPECS: a nicer designed block, the most telling few shown first, and a press that opens ALL of the boat's specs (a disclosure with a height animation and a turning glyph, or a sheet), keyboard reachable.
(5) VIEWING ALL PRODUCTS IS A POPUP, done nicely: every "Show all N in …" and every way of browsing a chapter's whole range or the chandlery's aisles from inside the build opens a dialog (a large sheet over the page, its own search and aisles, pictures as tiles, Add from inside it, the total visible or updating, Escape and a close returning focus, scroll locked behind), never a navigation away and never a long list pushed into the column.
(6) NOTHING IS BLURRY: measure every image on the page at each size (naturalWidth against rendered width times devicePixelRatio) and every element under a transform, filter or backdrop blur; fix the cause (a larger source from the ledger, a cap on drawn size, no fractional scale at rest, no blur behind text) and list what you measured.
(7) THE CLICKS AND ANIMATIONS: a chapter opens and closes with a height animation and a turning chevron, the rest of the column moving smoothly rather than jumping; a press has a visible pressed state; a chosen option settles with a short spring; the total's segments move when a line changes, never counting the figure up; reduced motion keeps colour and removes movement. Use motion (already in the app) as the rest of src/ui does.
Leave the hull chapter's choosing and the finale to the builder after you, except where your layout must leave them room.

${HOUSE} Your port is 5711.`

const START = `You are making NEW QUOTE start from anything Northside sells, finishing the pages before the build, and moving Find in the floating bar. You own src/screens/picker/**, src/domain/quote/start.ts and its tests, src/screens/quotes/** only if needed for a non-boat quote to show, src/screens/shell/** (Pill.tsx and shell.css for Find), and the picker and shell e2e specs. Do NOT touch src/screens/configurator/ (another builder is rebuilding it now); if a motor-only or parts-only quote needs the build page to behave differently, write what it needs into ${OUT}/start-needs.md for the next builder, and make the start itself work.

${STATE}

DO: (1) NEW QUOTE ASKS WHAT IS BEING SOLD: the boat first and largest, then a motor on its own (a repower), a trailer on its own, and dealer-fit parts and accessories on their own, each as visual as the boats (pictures, makers' marks, prices, the same search). Measure which modules can start a quote today (src/domain/quote/start.ts) and, for each the owner named that cannot (Parts & Accessories "never had Quote switched on"), switch quote on as Northside's own module setting through the app's command and record it in docs/DECISIONS.md with his words, never by editing the seed. Prove a motor-only, a trailer-only and a parts-only quote each start and reach the build. (2) THE MAKER AND MODEL PAGES: a calmer head than the blocky gradient band, the eyebrow never cut by the top edge; no blue outline left on a card after the pointer leaves; a model with no picture shown honestly but not as a big crossed-camera tile; one height for cards in a row; on the boat page, specs with their nouns ("Max power 90 hp", not "MAX 90 HP") and the photograph the full width of its card. (3) FIND MOVES to the top left of the floating bar, before Home, still just the word "Find" with its glyph (Ctrl K still opens it, not drawn); on a phone, where the bar is at the foot, put it where the stylesheet's reflow says and say why.

${HOUSE} Your port is 5721.`

// The page and the start own different folders, so they build side by side.
const [pageBuild, startBuild] = await parallel([
  () => agent(PAGE, { label: 'build:page', phase: 'Build', schema: REPORT }),
  () => agent(START, { label: 'build:start', phase: 'Build', schema: REPORT }),
])
await checkpoint('the build page laid out to the owner, and New quote for anything Northside sells')

const HULL = `You are building CHOOSING THE BOAT INSIDE THE HULL CHAPTER and THE SUMMARY THAT FILLS THE SCREEN, on the build page the builder before you just relaid. You own src/screens/configurator/** and src/domain for pure derivations with tests.

${STATE}

THE BUILDER BEFORE YOU reported: ${JSON.stringify(pageBuild).slice(0, 5000)}
THE START BUILDER reported: ${JSON.stringify(startBuild).slice(0, 2500)} — read ${OUT}/start-needs.md if it exists and make the build page right for a motor-only, a trailer-only and a parts-only quote (no hull chapter, a masthead and a summary that speak of what is sold).

DO, each proven at the four sizes:
(1) THE HULL CHAPTER IS WHERE THE BOAT IS CHOSEN, for every boat: the model within its series (a Highfield Sport 520 / 560 / 600, a Stabicraft's variants, a Stacer's lengths), the material (Highfield's hypalon or PVC), the colourway and every other axis the price file distinguishes for that boat's siblings, each as visible choices with swatches or pictures and the price difference beside each, never a dropdown. A choice re-roots the quote on the sibling row (the engine's subject-refinished event and its siblings: read src/domain/quote/commands.ts and the cascade for what is kept and what is refused, and say it in a sentence where something cannot carry across) and the photograph, the masthead, the specs and the total change IN REAL TIME, so the customer sees the difference. Work the axes out from the file by a pure function in src/domain with a test against the real pack, counted, never typed.
(2) THE FINALE BECOMES THE SUMMARY: below the editing view sits ONE FULL SCREEN (100dvh, fitted to the window at every size) that is the whole quote at a glance: the boat's big photograph and every chosen line with its picture, the customer, the total and what it is made of, and the acts to finish (name the customer if not named, give the quote, open and print the document, and send it as the app can honestly send it today; never a fake send). Scrolling down past the last chapter (or pressing a clear "See the summary") brings it in, snapping to fill the screen; scrolling up returns to editing. It must be beautiful: the one screen the owner shows a customer. Rename it from "The finale" to words a salesperson says. Everything the finale did (its refusals, its reasons, giving, the document) keeps working.

${HOUSE} Your port is 5731.`

const hullBuild = await agent(HULL, { label: 'build:hull', phase: 'Build', schema: REPORT })
await checkpoint('the boat chosen inside the hull chapter, and the full-screen summary')

phase('Verify')
const verify = await agent(
  `You are verifying this round, and nothing else is running. ${STATE}

The builders reported: ${JSON.stringify([pageBuild, startBuild, hullBuild]).slice(0, 9000)}

(1) The gate: npm test; npm run build; then ONLY the affected Playwright specs, not the whole suite (the configurator, build-page, chandlery, picker, quotes, document and shell specs, and the rulers filtered to those screens), on port 5741, re-running anything red alone with --workers 1 and fixing it if it is the app. (2) Walk it as the owner would at 1440x900 and 1920x1080, then 834x1112 and 390x844: a Highfield Sport 560 changing model, material and colour in the hull chapter and watching the picture and total change; a Stacer with a motor, trailer and three parts added from the popup; a motor-only quote; scroll the chapters, then down to the summary, then back up; print. Save shots under ${OUT}/verify/. For each of the owner's asks in his words above, mark DONE or NOT DONE with the shot that proves it. Fix what you can that is small. Do not commit.`,
  { label: 'verify', phase: 'Verify', schema: REPORT },
)

phase('Critique')
const critic = await agent(
  `You are an independent critic who has never seen HL_2.0, read-only except ${OUT}/critique.md. ${STATE}

The verifier reported: ${JSON.stringify(verify).slice(0, 5000)}

Serve it (npm run build && npx vite preview --port 5751) and judge the build page and New quote against the owner's words, item by item, and against his bar: screenshot every state at 1440x900, 1920x1080, 834x1112 and 390x844, open and close every chapter, scroll the column and the page, open every popup and the lightbox, go to the summary and back. For every frame say PERFECT or NOT AND WHY (the exact element, measured). List the gaps by area ('page' is /quote/$id, 'start' is New quote, the picker and the shell) and severity; write them to ${OUT}/critique.md.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)

const gaps = (critic && critic.gaps) || []
log(
  `critic: ${gaps.length} gaps (${gaps.filter((g) => g.severity !== 'minor').length} blocker or major)`,
)
if (gaps.length) {
  await parallel(
    ['page', 'start'].map((area) => () => {
      const mine = gaps.filter((g) => g.area === area)
      if (!mine.length) return null
      return agent(
        `You are fixing the critic's findings on ${area === 'page' ? 'the build page, /quote/$id (src/screens/configurator/**)' : 'New quote, the picker and the shell (src/screens/picker/**, src/screens/shell/**, start.ts)'} and nothing else. ${STATE}

THE FINDINGS, every one to be closed, minors included, because the bar is perfect: ${JSON.stringify(mine).slice(0, 9000)}

${HOUSE} Your port is ${area === 'page' ? 5761 : 5771}.`,
        { label: 'fix:' + area, phase: 'Critique', schema: REPORT },
      )
    }),
  )
}
await checkpoint("the critic's findings on the build page and New quote fixed")

return { pageBuild, startBuild, hullBuild, verify, critic }
