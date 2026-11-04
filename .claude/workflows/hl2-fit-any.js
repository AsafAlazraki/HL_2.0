export const meta = {
  name: 'hl2-fit-any',
  description:
    'What fits from every side and in bulk: a motor, a trailer or a part shows the boats it goes on, and Northside can put one or many lines on many boats at once with a preview, counted refusals and one Undo; swept, drawn three ways and picked, the domain first, built at six sizes, walked cold until nothing confuses, then gated',
  whenToUse:
    'After hl2-fit-flow, for the owner\u2019s words of 2026-11-05: bulk add to many boats, trailers or motors, and motors (and the rest) having their own "what fits it".',
  phases: [
    { title: 'Walk', detail: 'two cold walkers on the new tasks, against the tree as it stands' },
    {
      title: 'Draw',
      detail: 'a sweep of fitment both ways and bulk editing, three directions, three lenses pick',
    },
    { title: 'Domain', detail: 'the reverse reading and the bulk command, pure and tested' },
    { title: 'Build', detail: 'the screens, at six sizes, pushed' },
    { title: 'Again', detail: 'fresh cold walks and fixes until nothing confuses, pushed' },
    { title: 'Gate', detail: 'npm test alone and the e2e of the journey, a gated push' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/fit-any'
const SIZES = '390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080'

const OWNER = `THE OWNER, Asaf, 2026-11-05, word for word, after refreshing the live site: "the what fits it is still not how i have it envisioned things are better from what i have seen from last deploy made and i just refgreshed - also do we have way to do bulk add to multiple boats or trrailerso rm otors like motors can have a what fits it and things and all of that and stuiff - keep at it i thnk u are on the right trck". On 2026-11-04: "we should be able to do the what fits from the home boats thing not just open quote and stuff ... the whole experience ... was just so confuising and crap". His bar: every frame perfect on a screenshot, scroll and expand/collapse included, at every size. HelmLogic is complex topics made beautiful, for Northside Marine alone; simple wins. If docs/directions/fit-any/owner.md exists, it holds what he has since said about how he envisions it: read it first and it outranks every board.`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms). Stop every server you start before you report. A Playwright run on your own port (HL2_PREVIEW_PORT=<port>) builds into its own e2e/out/dist-<port>; never rebuild or delete dist/ or another agent's folders; use --output=test-results-<port>.

Repo (cwd): ${NEW}; CLAUDE.md binds you: no invented data (never a pairing the price file does not carry; a count shown is measured from the file), cost and margin never on a customer surface, a refusal is a sentence with its reason where it is refused, tokens not literals, pure derivations in src/domain with tests, quotes and the catalogue change through commands with inverses and events, a position inside a screen is a URL search param, reduced motion and keyboard reach kept, Northside only, simple wins. Another agent may work in this tree at the same time: touch only what you own, re-read a shared file right before you edit it, never revert a change you did not make. EVERY SIZE: ${SIZES}, a screenshot read at each.

${OWNER}

WHERE THINGS ARE: what fits a boat is /fitment (src/screens/fitment, src/routes/fitment.tsx) over src/domain/fitment (readBoatFit and readWhole in boat.ts; changeFit, pairingFor and starFit in change.ts; the envelope in envelope.ts; trailers in trailerFitment.ts and atm.ts; lines named for a boat in named.ts; versions in versions.ts). The catalogue store is src/state/catalogue.ts. The last round (docs/directions/fit-flow/) gave Home's boats a "What fits" door beside "Quote it" and one page per boat; read its directions.md and its last walk. Motors, trailers and dealer-fit parts are lists of the price file at /data/<list>.`

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
          group: { type: 'string', enum: ['product', 'bulk', 'boat', 'domain'] },
        },
        required: ['where', 'size', 'severity', 'what', 'evidence', 'group'],
      },
    },
    clicks: {
      type: 'string',
      description: 'each task and how many presses it took, measured, or "not possible"',
    },
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

const TASKS = `THE TASKS, each cold, from Home or the Data door, pressing only what a person sees (a task the app cannot do is reported "not possible", with where you looked):
(1) "Which boats does the Yamaha F150XB go on?" and why not the rest.
(2) "Which boats does a REDCO trailer (pick one on the list) carry?"
(3) "Which boats does a dealer-fit package or a part go on?"
(4) "Put the F150XB on every Highfield Sport model from 5.6 m to 6.6 m at once", see what it will do before it does it (how many, which already had it, which are refused and why), do it, then undo it in one press.
(5) "Take one motor off every version of one boat at once", then put it back.
(6) "Put two parts on five boats at once."
(7) From one boat's What fits page, get to the motor's own What fits and back.
Count every press. At every step, write down what you expected, what you saw, and every moment you did not know what to do next, what a word meant, or where you were.`

const LENSES = [
  [
    'the person who keeps Northside\u2019s price file every week and wants big changes done fast, safely and undoably',
    6511,
  ],
  [
    'the owner, Asaf, who rejects anything confusing, half baked or boring on sight and judges by eye at the desk and on his phone',
    6513,
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

Report every confusion (where, size, severity, what in the person's words, the screenshot) grouped: product (a motor's, trailer's or part's own What fits), bulk (changing many at once), boat (a boat's What fits page), domain (a figure, count or pairing that is wrong). A task that is not possible is a blocker. A confusion is real if a person would hesitate, misread or press the wrong thing; not a style preference.`,
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
log(`the cold walk found ${first.flatMap((w) => w.confusions).length} confusions`)

phase('Draw')
const draw = await agent(
  `You are drawing what fits from every side, and bulk changes. ${STATE}

THE COLD WALK FOUND: ${JSON.stringify(first).slice(0, 9000)}

(1) A reference sweep with the research-sweep skill into docs/research/refs/fit-any/: how the best tools show compatibility both ways (a part's "fits these vehicles" lists in automotive parts catalogues, bike and outdoor gear compatibility finders, Apple's "compatible with", camera lens-to-body finders) and how the best tools change many records at once (bulk edit in Shopify, Airtable, Linear's multi-select, Notion, spreadsheet fill, Gmail's select all matching), with a preview of what will change, counted refusals and one Undo. At least ten sources, frames read.
(2) Three directions with the directions skill under ${OUT}/boards/ (a, b, c), on real price-file content (the Yamaha F150XB, a REDCO trailer, a dealer-fit package, the Highfield Sport range), each a different structure, for: (i) every motor, trailer and fit-out line having its own What fits (the boats it goes on, by series and model, why not the rest), reached from its row in Data, from a boat's What fits, and from Find; (ii) putting one or many lines on many boats, or taking them off, chosen by series, length, horsepower or by hand, with a preview that counts what will change, what already had it and what is refused and why, done as one command with one Undo; (iii) how both sit with the boat's What fits page the last round built, so the whole reads as one simple place. Each board answers every confusion the walk found, says how it reflows at the six sizes, and names the simpler one. If ${OUT}/owner.md exists it outranks everything. Write ${OUT}/directions.md with a recommended one. Render each board at 1440x900 and 390x844 as PNGs beside it.
Report the boards' paths and the recommendation.`,
  { label: 'draw', phase: 'Draw', schema: REPORT },
)
const picks = (
  await parallel(
    [
      'the owner, Asaf, who wants complex topics made beautiful and simple, and says what fits is not yet how he envisions it',
      'the person who keeps the price file weekly, who must change many boats at once without fear',
      'a designer who judges hierarchy, reflow at six sizes and whether it is the simplest that works',
    ].map(
      (lens, i) => () =>
        agent(
          `Pick one of three directions as ${lens}. Read ${OUT}/directions.md and every board under ${OUT}/boards/ (look at the PNGs), and ${OUT}/owner.md if it exists (it outranks everything). The owner's words: ${OWNER}. Ties go to the simpler. Say which and why in three sentences.`,
          { label: `pick:${i + 1}`, phase: 'Draw', schema: PICK },
        ),
    ),
  )
).filter(Boolean)
const tally = {}
for (const p of picks) tally[p.pick] = (tally[p.pick] || 0) + 1
const pick = Object.entries(tally).sort((x, y) => y[1] - x[1])[0]?.[0] || 'a'
log(`picked direction ${pick} (${JSON.stringify(tally)})`)
const PICKED = `THE PICKED DIRECTION is ${pick}: read ${OUT}/directions.md and ${OUT}/boards/ (direction ${pick}), ${OUT}/owner.md if it exists, and the pickers' reasons: ${JSON.stringify(picks).slice(0, 2500)}. THE COLD WALK FOUND: ${JSON.stringify(first).slice(0, 6000)}`

phase('Domain')
const domain = await agent(
  `You build the domain under the picked direction. You own src/domain/fitment/** and its tests, and src/state/catalogue.ts only to add commands (with their tests). ${STATE}

${PICKED}

(1) The reverse reading: for any motor, trailer or fit-out line, the boats it goes on (by series, model and version), and for the rest the counted reason it does not, from the same pairings, envelope, ATM and named-for rules the boat side reads, so the two sides can never disagree (prove it with a test that walks every boat and every motor on the real pack: A on B from the boat side if and only if B under A from the line side).
(2) The bulk change: one command that puts one or many lines on, or takes them off, many boats (a set of versions), with a pure preview first (will change n, already so m, refused k each with its sentence: over the envelope, under it, short shaft, over ATM, a rule), applied as one command with one inverse and one event, so one Undo puts every row back exactly. Tested on the real pack, including the undo restoring every row byte for byte.
(3) Choosing boats for a bulk change by series, length, horsepower or by hand, as a pure filter with tests.
Write ${OUT}/domain.md: every export, what it reads, and the figures measured on the real pack. ${HOUSE(6521, OUT + '/domain')}`,
  { label: 'domain', phase: 'Domain', schema: REPORT },
)

phase('Build')
const build = await agent(
  `You build the screens under the picked direction on the new domain. You own src/screens/fitment/**, src/routes/fitment.tsx, any new screen folder and route the direction needs (each with its own styles and spec), and src/screens/sheet/** only to add the door from a motor's, trailer's or part's row to its What fits. ${STATE}

${PICKED}

THE DOMAIN: read ${OUT}/domain.md; its report: ${JSON.stringify(domain).slice(0, 3000)}

Build it as drawn, at all six sizes: every line's own What fits, the bulk change with its preview and one Undo, and both sitting with the boat's What fits as one simple place. A refusal is a sentence where it happens. Close every confusion the walk found. Mark docs/SCREENS.md provisional for what you add. ${HOUSE(6523, OUT + '/build')}`,
  { label: 'build', phase: 'Build', schema: REPORT },
)
await checkpoint('what fits from every side, and changing many boats at once', 'Build')

const OWNS = {
  product: [
    'the line-side What fits screens the build added, src/screens/sheet/** for its doors, and their specs',
    6531,
  ],
  bulk: ['the bulk change\u2019s screen parts and their specs', 6533],
  boat: ['src/screens/fitment/**, src/routes/fitment.tsx and its spec', 6535],
  domain: ['src/domain/fitment/** and its tests, and src/state/catalogue.ts commands', 6537],
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
        `You own ${owns}, and you touch nothing else; if the bulk and line-side parts share a file, the one whose group the confusion names edits it, re-reading it first. ${STATE}

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
  `You are the gate, and you run alone. In ${NEW}, stop any vite or playwright you find still running from an earlier agent on ports 4170 to 6999 (only node processes serving this repo). Run npm test in the foreground (timeout 600000; it takes about 630 s). Every failure is fixed at its cause in the source; a ported or older test is never edited to pass unless the owner changed what it asserts, and then you name it. Rerun until it passes. Then run the journey's e2e alone: HL2_PREVIEW_PORT=6599 npx playwright test e2e/flows/fitment.spec.ts e2e/flows/sheet.spec.ts e2e/flows/home.spec.ts e2e/rulers --output=test-results-6599 (and the spec of every new screen), fixing at the cause. Then git add the changed paths (never test-results-*, e2e/out, zz-*.spec.ts or FAULT-*.png), commit "What fits from every side, and many boats changed at once with one Undo, gated" with -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", and git push origin main. Report the npm test time, every failure you fixed and how, and the hash.`,
  { label: 'gate', phase: 'Gate', schema: REPORT },
)

return { pick, tally, draw, domain, build, walks, gate }
