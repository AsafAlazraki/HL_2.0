export const meta = {
  name: 'hl2-fit-flow',
  description:
    'What fits a boat as one easy journey: cold walkers find every confusion from Home onward, a boat\u2019s door on Home opens what fits as well as a quote, drawn three ways and picked, built at six sizes, walked cold again until nothing confuses, then gated',
  whenToUse:
    'After hl2-data, for the owner\u2019s words of 2026-11-04 that the fitment experience was too hard and confusing, and that Home\u2019s boats should open what fits, not only a quote.',
  phases: [
    { title: 'Walk', detail: 'two cold walkers, every confusion from Home to what fits' },
    {
      title: 'Draw',
      detail: 'a short sweep and three directions for a boat\u2019s door, picked by three lenses',
    },
    { title: 'Build', detail: 'the door and the journey, at six sizes, pushed' },
    { title: 'Again', detail: 'fresh cold walks and fixes until nothing confuses, pushed' },
    { title: 'Gate', detail: 'npm test alone and the e2e of the journey, a gated push' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/fit-flow'
const SIZES = '390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080'

const OWNER = `THE OWNER, Asaf, 2026-11-04, word for word, about Fitment and the Data screens as he last saw them: "cause yeahg when i looked last it was just too hard to do and things. and we should be able to do the what fits from the home boats thing not just open quote and stuff. idk the whole experience when i checkedl ast before u idd this was just so confuising and crap". Earlier, 2026-10-31: "the whole what goes on this boat and the data and basically everything in data tab is a decent start, not at the level it has to be". His bar: every frame perfect on a screenshot, scroll and expand/collapse included, at every size. HelmLogic is complex topics made beautiful, for Northside Marine alone; simple wins.`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms). Stop every server you start before you report. A Playwright run on your own port (HL2_PREVIEW_PORT=<port>) builds into its own e2e/out/dist-<port>; never rebuild or delete dist/ or another agent's folders; use --output=test-results-<port>.

Repo (cwd): ${NEW}; CLAUDE.md binds you: no invented data (never a pairing the price file does not carry; a rule shown is measured from the file), cost and margin never on a customer surface, a refusal is a sentence with its reason where it is refused, tokens not literals, pure derivations in src/domain with tests, a position inside a screen is a URL search param, reduced motion and keyboard reach kept, Northside only, simple wins. Another agent may work in this tree at the same time: touch only what you own, re-read a shared file right before you edit it, never revert a change you did not make. EVERY SIZE: ${SIZES}, a screenshot read at each.

${OWNER}

WHERE THINGS ARE: Home is src/screens/home (its "Start from the boat" row, function Boats in Home.tsx, today opens only the picker to quote). What fits a boat is /fitment?boat=<model> (src/screens/fitment, route src/routes/fitment.tsx). A quote is started at /quote/new (src/screens/picker) and built at /quote/$id (src/screens/configurator). Data is /data and its rooms (src/app/ways.ts). Read docs/directions/data-round/fitment/ for what the last round did to Fitment.`

const HOUSE = (port, dir) =>
  `BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; your specs and the rulers (HL2_PREVIEW_PORT=${port} npx playwright test <specs> e2e/rulers --output=test-results-${port}). A stale spec that asserts the old journey is updated to the owner's new journey and named in your report; any other failing assertion is a bug to fix at its cause. Screenshots under ${dir}/. Do not commit. Report only figures you measured.`

const serve = (port) =>
  `Serve it on your own port: npx vite build --outDir e2e/out/dist-${port} --emptyOutDir && npx vite preview --outDir e2e/out/dist-${port} --port ${port} --strictPort, and load the real price file the way the e2e helpers do (read e2e/routes.ts and e2e/mint.ts).`

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    done: { type: 'array', items: { type: 'string' } },
    notDone: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'done', 'notDone'],
}
const WALK = {
  type: 'object',
  properties: {
    confusions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          where: { type: 'string' },
          size: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: {
            type: 'string',
            description: 'what the person expected, what happened, in their words',
          },
          evidence: { type: 'string', description: 'screenshot path and the element' },
          group: { type: 'string', enum: ['door', 'fitment', 'elsewhere'] },
        },
        required: ['where', 'size', 'severity', 'what', 'evidence', 'group'],
      },
    },
    clicks: { type: 'string', description: 'each task and how many presses it took, measured' },
  },
  required: ['confusions', 'clicks'],
}
const PICK = {
  type: 'object',
  properties: { pick: { type: 'string', enum: ['a', 'b', 'c'] }, why: { type: 'string' } },
  required: ['pick', 'why'],
}

let gitLock = Promise.resolve()
const checkpoint = (what, phaseName) => {
  const run = gitLock.then(() =>
    agent(
      `In ${NEW}, take a checkpoint and push it, because the owner watches the live site. Run git status --short; if nothing changed, say so and stop. Otherwise remove any e2e/flows/zz-*.spec.ts and FAULT-*.png that git would add; run npx prettier --write --ignore-unknown on every changed or new file git would add (git ls-files -m -o --exclude-standard; never under e2e/out or test-results-*); git add -A; git commit -m "Checkpoint: ${what}, mid-round; not gated" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"; git push origin main. Report the hash and the number of files.`,
      { label: 'checkpoint', phase: phaseName, effort: 'low' },
    ),
  )
  gitLock = run.catch(() => null)
  return run
}

const TASKS = `THE TASKS, each from Home, cold, with no knowledge of the code or the routes, pressing only what a person sees:
(1) "What motors and trailers go on a Stabicraft PA 600?" and why some do not.
(2) "Make the Yamaha F150 no longer offered on that boat", then put it back.
(3) "Add a dealer-fit part that goes on that boat" (only from what the price file carries).
(4) "Now quote that boat for a customer with what fits it."
(5) From the quote's build page, "why can't I pick this motor?" and get to where that is decided.
(6) From Data, find what fits a Highfield Sport 560.
Count every press. At every step, write down what you expected, what you saw, and every moment you did not know what to do next, what a word meant, or where you were.`

const LENSES = [
  [
    'a salesperson in their first week, who has never seen this app and knows boats, not software',
    6411,
  ],
  [
    'the owner, Asaf, who rejects anything confusing, half baked or boring on sight and judges by eye at the desk and on his phone',
    6413,
  ],
]

const walk = (round, before) =>
  parallel(
    LENSES.map(
      ([who, port], i) =>
        () =>
          agent(
            `You are walking the app cold (round ${round}), read-only except ${OUT}/walk-${round}-${i + 1}.md and its screenshots. You are ${who}. ${STATE}

${serve(port)}

${TASKS}

Do the tasks at 1440x900 and again at 390x844; then screenshot every screen of the journey at the other four sizes and read each. ${before || ''}

Report every confusion (where, size, severity, what in the person's words, the screenshot) grouped: door (Home's boats and how a boat leads to what fits and to a quote), fitment (the /fitment screen and its popups), elsewhere (the picker, the build page, Data). A confusion is real if a person would hesitate, misread or press the wrong thing; not a style preference.`,
            {
              label: `walk:${round}:${i + 1}`,
              phase: round === 1 ? 'Walk' : 'Again',
              schema: WALK,
            },
          ),
    ),
  )

phase('Walk')
const first = (await walk(1)).filter(Boolean)
const firstAll = first.flatMap((w) => w.confusions)
log(`the cold walk found ${firstAll.length} confusions`)

phase('Draw')
const draw = await agent(
  `You are drawing a boat's door. ${STATE}

THE COLD WALK FOUND: ${JSON.stringify(first).slice(0, 9000)}

(1) A short reference sweep with the research-sweep skill into docs/research/refs/boat-door/: how the best model pages hand a person both "build and price it" and "what it takes / options / compatible accessories" from one product (car makers' model pages, boat builders' model pages, Apple's product pages, bike and outdoor gear makers' compatibility finders). Not Porsche alone; at least eight sources, frames read.
(2) Three directions with the directions skill under ${OUT}/boards/ (a, b, c), on real seed content (a Stabicraft PA 600 and a Highfield Sport 560), each a different structure, for: what pressing a boat on Home does, so that what fits it and quoting it are both one press away, and how the fitment journey then reads (one place per boat, its motor, trailer and fit-out, why the rest do not, changing it, and quoting it with what fits). Each board answers every confusion the walk found in the door and fitment groups, says how it reflows at the six sizes, and names the simpler one. Write ${OUT}/directions.md with a recommended one. Render each board at 1440x900 and 390x844 as PNGs beside it.
Report the boards' paths and the recommendation.`,
  { label: 'draw', phase: 'Draw', schema: REPORT },
)
const picks = (
  await parallel(
    [
      'the owner, Asaf, who wants complex topics made beautiful and simple, and was confused last time',
      'a salesperson with a customer at the desk, who must answer "what goes on this boat" in seconds',
      'a designer who judges hierarchy, reflow at six sizes and whether it is the simplest that works',
    ].map(
      (lens, i) => () =>
        agent(
          `Pick one of three directions as ${lens}. Read ${OUT}/directions.md and every board under ${OUT}/boards/ (look at the PNGs). The owner's words: ${OWNER}. Ties go to the simpler. Say which and why in three sentences.`,
          { label: `pick:${i + 1}`, phase: 'Draw', schema: PICK },
        ),
    ),
  )
).filter(Boolean)
const tally = {}
for (const p of picks) tally[p.pick] = (tally[p.pick] || 0) + 1
const pick = Object.entries(tally).sort((x, y) => y[1] - x[1])[0]?.[0] || 'a'
log(`picked direction ${pick} (${JSON.stringify(tally)})`)

phase('Build')
const PICKED = `THE PICKED DIRECTION is ${pick}: read ${OUT}/directions.md and ${OUT}/boards/ (direction ${pick}), and the pickers' reasons: ${JSON.stringify(picks).slice(0, 2500)}. THE COLD WALK FOUND: ${JSON.stringify(first).slice(0, 7000)}`
const build = await parallel([
  () =>
    agent(
      `You build the boat's door. You own src/screens/home/** and its specs, and any new screen folder the direction needs (with its route file under src/routes and its spec). ${STATE}

${PICKED}

Build the door as drawn: pressing a boat on Home leads to what fits it and to quoting it, each one press away, at all six sizes. Close every confusion in the "door" group. Mark docs/SCREENS.md provisional for what you add. ${HOUSE(6421, OUT + '/build-door')}`,
      { label: 'build:door', phase: 'Build', schema: REPORT },
    ),
  () =>
    agent(
      `You build the fitment journey. You own src/screens/fitment/**, src/routes/fitment.tsx, e2e/flows/fitment.spec.ts and src/domain for pure derivations with tests. ${STATE}

${PICKED}

Make what fits a boat read as the direction draws it, simple enough that a first-week salesperson does every task without hesitating. Close every confusion in the "fitment" group, and in "elsewhere" only what sits in your folders (name the rest). ${HOUSE(6423, OUT + '/build-fitment')}`,
      { label: 'build:fitment', phase: 'Build', schema: REPORT },
    ),
])
await checkpoint(
  'a boat\u2019s door on Home opens what fits as well as a quote, and the fitment journey simplified',
  'Build',
)

const OWNS = {
  door: ['src/screens/home/**, any new boat screen the build added, and their specs', 6431],
  fitment: [
    'src/screens/fitment/**, src/routes/fitment.tsx, its spec and src/domain derivations',
    6433,
  ],
  elsewhere: [
    'src/screens/picker/**, src/screens/configurator/** (only where the walk names it), src/screens/data/** and their specs',
    6435,
  ],
}
const walks = [first]
let last = first
for (let round = 2; round <= 4; round++) {
  phase('Again')
  last = (
    await walk(
      round,
      `THE LAST WALK found these; check each again with your own eyes (a fixer's word is not proof), then look for anything new: ${JSON.stringify(last.flatMap((w) => w.confusions)).slice(0, 6000)}`,
    )
  ).filter(Boolean)
  walks.push(last)
  const all = last.flatMap((w) => w.confusions)
  const heavy = all.filter((c) => c.severity !== 'minor').length
  log(`walk ${round}: ${all.length} confusions, ${heavy} blockers or majors`)
  if (!all.length) break
  await parallel(
    Object.entries(OWNS).map(([group, [owns, port]]) => () => {
      const mine = all.filter((c) => c.group === group)
      if (!mine.length) return null
      return agent(
        `You own ${owns}, and you touch nothing else. ${STATE}

THE COLD WALK'S CONFUSIONS IN YOUR AREA (round ${round}), every one to close, minors included: ${JSON.stringify(mine).slice(0, 8000)}
The picked direction is ${pick} (${OUT}/directions.md).

${HOUSE(port, OUT + '/fix-' + round)}`,
        { label: `fix:${group}:${round}`, phase: 'Again', schema: REPORT },
      )
    }),
  )
  await checkpoint(`the cold walk\u2019s confusions of round ${round} closed`, 'Again')
  if (!heavy && round >= 3) break
}

phase('Gate')
const gate = await agent(
  `You are the gate, and you run alone. In ${NEW}, stop any vite or playwright you find still running from an earlier agent on ports 4170 to 6999 (only node processes serving this repo). Run npm test in the foreground (timeout 600000; it takes about 420 s). Every failure is fixed at its cause in the source; a ported or older test is never edited to pass unless the owner changed what it asserts (the owner's new journey from Home's boats does), and then you name it. Rerun until it passes. Then run the journey's e2e alone: HL2_PREVIEW_PORT=6499 npx playwright test e2e/flows/fitment.spec.ts e2e/flows/home.spec.ts e2e/flows/picker.spec.ts e2e/rulers --output=test-results-6499 (and the spec of any new boat screen), fixing at the cause. Then git add the changed paths (never test-results-*, e2e/out, zz-*.spec.ts or FAULT-*.png), commit "What fits a boat as one easy journey, from Home's boats to the quote, gated" with -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", and git push origin main. Report the npm test time, every failure you fixed and how, and the hash.`,
  { label: 'gate', phase: 'Gate', schema: REPORT },
)

return { pick, tally, draw, build, walks, gate }
