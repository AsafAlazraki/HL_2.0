export const meta = {
  name: 'hl2-polish',
  description:
    'The owner\u2019s polish of 2026-10-31 on the quote, at every size: every chapter open, the hull made easy, the line items perfected, the bar\u2019s mark set apart, the padding, the summary replaced by a final-package reveal with the PDF preview, the floating bar wider and its mark clean, Home quieter',
  phases: [
    {
      title: 'Build',
      detail: 'the build page, the shell and Home, and the other quote screens at six sizes',
    },
    { title: 'Critique', detail: 'a fresh critic at six sizes, fixes, pushed' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/polish'
const SIZES = '390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080'

const OWNER = `THE OWNER, 2026-10-31, word for word, looking at the build page and Home on the live site:

"all cards on the right should be open by default. the hull stuff has heaps in it for all brands so let's make it really easy to use and things. I am also keen to do another pass on the right hand side with the line items to make it perfect just see what little things we can do. Let's have a line between highfield logo and the boat in the top and lets separate them please. let's have also please ensuring all padding and things are nicely done. the animation to go to summary is BAD. and that summary page SUCKS it's not great. but let's have it nicer - let's go view final package and pretend loading screen and we can see the pdf quote preview and things and it is just a visual masterpiece and then go back to editing if we need and things. the nsm logo in floating bar has a weird glitch in it on the right like a weird white line barely noticeable but it is and let's make floating bar wider a bit on bigger screens and things but it is coming together nicer. Let's remove the price list of 16 september on home page and the text below it and the text on the right and remove the answer them on prices and things"

And just before: "ensuring responsiveness on every single size". His bar: "if i take a screenshot, does it look PERFECT, and if not, why not, and fix it ... even down to scroll and how things expand and collapse".`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms). Stop every server you start before you report. Use your own --output=test-results-<port> and never delete another agent's results or dist.

Repo (cwd): ${NEW}; CLAUDE.md is in your context and binds you (no invented data, cost never on a customer surface, a refusal is a sentence, tokens not literals, pure derivations in src/domain, reduced motion honoured, keyboard reach kept). The weekly usage is nearly spent: no web sweeps, no drawn boards; the owner's words are the spec and the simpler design wins. The last rounds' reports are in docs/directions/quote-page/ and docs/directions/paper-quote/. EVERY SIZE: prove what you build at ${SIZES}, reading a screenshot at each, and write each screen's reflow into its stylesheet header.

${OWNER}`

const HOUSE = (port) =>
  `BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; your specs and the rulers for your screens on every project (HL2_PREVIEW_PORT=${port} npx playwright test <specs> --output=test-results-${port}). A test that asserts what the owner has now removed or changed is rewritten to assert the new truth, and you name each. Save your screenshots under ${OUT}/. Do not commit. Report only figures you measured.`

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    done: { type: 'array', items: { type: 'string' } },
    notDone: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'done', 'notDone'],
}
const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          group: { type: 'string', enum: ['build', 'shell', 'rest'] },
          size: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['group', 'size', 'severity', 'what', 'evidence'],
      },
    },
    perfect: { type: 'array', items: { type: 'string' } },
  },
  required: ['gaps', 'perfect'],
}

const checkpoint = (what) =>
  agent(
    `In ${NEW}, take a checkpoint and push it, because the owner watches the live site. Run git status --short; if nothing changed, say so and stop. Otherwise remove any e2e/flows/zz-*.spec.ts, FAULT-*.png and test-results-* that git would add, then git add -A and git commit -m "Checkpoint: ${what}, mid-round; not gated" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", then git push origin main. Report the hash.`,
    { label: 'checkpoint', phase: 'Build', effort: 'low' },
  )

const GROUPS = {
  build: {
    port: 6011,
    owns: 'src/screens/configurator/** and its specs, and src/domain for pure derivations with tests; you may RENDER the document component from src/screens/document/ but not edit it',
    brief: `THE BUILD PAGE, /quote/$id:
(1) EVERY CHAPTER ON THE RIGHT IS OPEN BY DEFAULT (the hull, the motor, the trailer, dealer fit, every one), and a person can still fold one; what is folded is remembered as today.
(2) THE HULL IS EASY for every brand: it holds a lot (Highfield's models, materials and 15 colourways; Stacer's lengths; Stabicraft's variants). Make it effortless: the axes in the order a buyer thinks (model, then material, then colour), the chosen value of each always visible as a summary line, long rows compact (a swatch strip, not a wall of cards), nothing that reads as a code, one height per card, and the price difference on each choice.
(3) THE LINE ITEMS, a pass for perfection: every row on the right (each chosen motor, trailer, part, package) aligned to one grid, its picture, its name as a person says it, its price at one column, its take-off and its picture-open at the same place on every row, the dealer-fit rows with a figure and a clear add, nothing repeated, nothing raw from the file. List every little thing you changed.
(4) THE TOP BAR: a vertical hairline between the maker's mark and the boat's name, the two clearly separated with even space either side.
(5) PADDING: every space on the page from the tokens, one rhythm; measure the gaps and list what you evened.
(6) THE SUMMARY IS REPLACED. Its scroll-in animation and its page go. In their place: a clear primary act, "View final package", in the rail's foot and wherever the summary door was. Pressing it plays a short, beautiful preparing moment (about 1.2 s, the boat's photograph and the words of what is being put together, skipped under reduced motion, honest in what it says) and then opens THE FINAL PACKAGE: a full-screen view that is a visual masterpiece: the boat's large photograph and every chosen line with its picture, the customer and the total, and the PDF quote preview itself (the real document, rendered by the document component, paged, readable), with the acts to finish (name the customer if not named, give, print or save the PDF, send as the app honestly can) and "Back to editing" returning to exactly where the person was. It works at every size, and the address names it so a reload reopens it.`,
  },
  shell: {
    port: 6021,
    owns: 'src/screens/shell/**, src/screens/home/** and their specs, and the e2e helpers that wait on Home (e2e/routes.ts and the specs that used Home\x27s price-list stamp as their ready signal)',
    brief: `THE FLOATING BAR AND HOME:
(1) THE NSM MARK IN THE FLOATING BAR has a faint white line on its right edge. Find the cause by measurement (the mark's file and its edge pixels, a sub-pixel width, a border, an overflow, a mask or a background showing through) and fix the cause, proven by a zoomed screenshot at 1440, 1920 and on a 2x device pixel ratio.
(2) THE FLOATING BAR IS A LITTLE WIDER ON BIGGER SCREENS (1440 and 1920, and laptop if it suits), its doors with more air, never covering what it covers today at any size.
(3) HOME: remove "Price list of 16 September 2026" and the line under it (the price questions, "N price questions wait for you…") and its "Answer them on Prices" button, and the text on the right ("Nothing has moved today. The last thing kept was on …"). Keep the honest states that are not the dealer's daily noise (the file could not be read; the file is not on this computer, with its door). The many e2e specs that waited on Home's data-testid "pack-counts" as their ready signal must wait on something that still stands (give Home a ready marker that is not visible text, or wait on what each test needs), and the specs that asserted the removed words are rewritten to assert they are gone. Home must still look composed with the space they took.`,
  },
  rest: {
    port: 6031,
    owns: 'src/screens/picker/**, src/screens/quotes/**, src/screens/document/** and their specs',
    brief: `EVERY SIZE for the rest of the quote flow: New quote (what are you selling, a maker, a model, a motor shelf), the quotes page with a draft and a given quote, and the printed document (screen and print media) with its sections panel. At each of the six sizes, screenshot every state and read it: anything cut, overlapping, crowded, stranded in empty space, scrolling where it should not, under the floating bar, too small, soft, or scrolling sideways is fixed. Also the padding: one rhythm from the tokens.`,
  },
}

phase('Build')
const builds = await parallel(
  Object.entries(GROUPS).map(
    ([key, g]) =>
      () =>
        agent(
          `You own ${g.owns}, and you touch nothing else. ${STATE}

${g.brief}

${HOUSE(g.port)}`,
          { label: 'build:' + key, phase: 'Build', schema: REPORT },
        ),
  ),
)
await checkpoint(
  'the owner\u2019s polish of the build page, the floating bar and Home, and the quote flow at every size',
)

phase('Critique')
const critic = await agent(
  `You are an independent critic who has never seen HL_2.0, read-only except ${OUT}/critique.md. ${STATE}

The builders reported: ${JSON.stringify(builds).slice(0, 8000)}

Serve it (npm run build && npx vite preview --port 6041). At each of the six sizes, screenshot and judge: Home; the floating bar (zoom on its mark); New quote; the build page for a Highfield Sport 560 with every chapter open, choosing model, material and colour, the line items, the popups, the lightbox; View final package, its preparing moment, the package, and Back to editing; a motor-only quote; the quotes page; the printed document and its sections panel. Check each of the owner's words above DONE or NOT. For every frame say PERFECT or NOT AND WHY (the element, measured). Group gaps: 'build' (src/screens/configurator), 'shell' (the floating bar and Home), 'rest' (picker, quotes, document). Write ${OUT}/critique.md.`,
  { label: 'critic', phase: 'Critique', schema: GAPS },
)
const gaps = (critic && critic.gaps) || []
log(`critic: ${gaps.length} gaps`)
await parallel(
  Object.entries(GROUPS).map(([key, g]) => () => {
    const mine = gaps.filter((x) => x.group === key)
    if (!mine.length) return null
    return agent(
      `You own ${g.owns}, and you touch nothing else. ${STATE}

THE CRITIC'S FINDINGS, every one to be closed, minors included: ${JSON.stringify(mine).slice(0, 9000)}

${HOUSE(g.port + 1)}`,
      { label: 'fix:' + key, phase: 'Critique', schema: REPORT },
    )
  }),
)
await checkpoint('the critic\u2019s findings on the polish fixed')

return { builds, critic }
