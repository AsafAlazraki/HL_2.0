export const meta = {
  name: 'hl2-data',
  description:
    'Fitment and every room of Data brought from a decent start to the level it has to be: a fresh judge per screen, a new sweep and three drawn directions where a screen must be redrawn, the pick built at six sizes, verified by fresh eyes and fixed, pushed as each screen lands; then the section judged as one place and gated',
  whenToUse:
    'After the quote round, for the owner\u2019s ask of 2026-10-31 that Fitment and everything in the Data tab is only a decent start. args.only (an array of screen keys) runs a subset.',
  phases: [
    {
      title: 'Judge',
      detail: 'a fresh judge per screen: redraw or deepen, and what it is missing',
    },
    {
      title: 'Draw',
      detail: 'a new sweep and three directions where a screen is redrawn, picked by three lenses',
    },
    { title: 'Build', detail: 'the pick or the deepening, at six sizes, pushed' },
    { title: 'Verify', detail: 'fresh eyes at six sizes, the gaps fixed, pushed' },
    { title: 'Section', detail: 'Data as one place: its head, its rooms, the moves between them' },
    { title: 'Gate', detail: 'npm test alone and the e2e of every Data screen, a gated push' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/data-round'
const SIZES = '390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080'

const OWNER = `THE OWNER, Asaf, 2026-10-31, word for word: "mate the whole what goes on this boat and the data and basically everything in data tab is a decent start, not at the level it has to be. there is mammoth work to get this app done mate, mammoth - let's keep at it, ensuring we push local and git every now and then to ensure we are doing the right thing on the right track". His bar for every screen: "if i take a screenshot, does it look PERFECT, and if not, why not, and fix it ... even down to scroll and how things expand and collapse", and "ensuring responsiveness on every single size". The end goal: stakeholder-ready with zero UI/UX errors, a full quote with a customer at the desk, deep backend configuration, a beautiful downloadable quote. HelmLogic is complex topics made beautiful, for Northside Marine alone.`

const SECTION = `THE DATA SECTION (src/app/ways.ts): the bar's Data door opens /data, the Master Price File itself (every list it carries, open to read and change), and its rooms: Rules (/rules, what may be sold with what), Fitment (/fitment?boat=, what goes on a boat), Catalogue (/catalogue, the chandlery of parts and accessories in aisles), Review (/review, what is wrong in the price list, each with its fix), Prices (/levels, what only Northside can decide about price), Shelf (/shelf, a new price list in and Northside's work kept safe). A list opens as the sheet (/data/$table), and a maker's own page is /places/$id. Settings (/manage) is a room of Home: Northside's details, people, colour, pictures and front page.`

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms). Stop every server you start before you report. A Playwright run on your own port (HL2_PREVIEW_PORT=<port>) builds into its own e2e/out/dist-<port>, so never rebuild or delete dist/ or another agent's folders; use --output=test-results-<port>.

Repo (cwd): ${NEW}; CLAUDE.md is in your context and binds you: no invented data (never a customer, quote, pairing, picture or figure the price file does not carry; a rule shown is measured from the file with its numerator and denominator; an empty state is the true state), cost and margin never on a customer surface, a refusal is a sentence with its reason where it is refused, tokens not literals, pure derivations in src/domain with tests, changes through commands with inverses and events, a position inside a screen is a URL search param, reduced motion and keyboard reach kept, Northside only, simple wins. ANOTHER AGENT MAY BE BUILDING A DIFFERENT DATA SCREEN IN THIS SAME TREE AT THE SAME TIME: touch only what you own, re-read any shared file right before you edit it, and never revert a change you did not make. EVERY SIZE: ${SIZES}, a screenshot read at each.

${OWNER}

${SECTION}`

const HOUSE = (port, dir) =>
  `BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; your specs and the rulers for your screen on every project (HL2_PREVIEW_PORT=${port} npx playwright test <specs> e2e/rulers --output=test-results-${port}). A failure another agent's half-finished work causes is named, not chased. Screenshots under ${dir}/. Do not commit. Report only figures you measured.`

const SCREENS_ALL = [
  {
    key: 'fitment',
    name: 'Fitment, what goes on this boat',
    route: '/fitment?boat=<a model>',
    folder: 'src/screens/fitment',
    specs: 'e2e/flows/fitment.spec.ts',
    refs: 'fitment',
    job: 'one boat, every motor, trailer and fit-out that goes on it, and why the rest do not; the owner named it first ("the whole what goes on this boat")',
    port: 6210,
  },
  {
    key: 'sheet',
    name: 'The sheet, one list of the price file',
    route: '/data/<a list>',
    folder: 'src/screens/sheet',
    specs: 'e2e/flows/sheet.spec.ts',
    refs: 'sheet',
    job: 'one list of the Master Price File (boats, motors, trailers, parts, packages and the rest), every row open to read and change, found, filtered and edited at speed',
    port: 6220,
  },
  {
    key: 'data',
    name: 'Data, the price list itself',
    route: '/data',
    folder: 'src/screens/data',
    specs: 'e2e/flows/data.spec.ts',
    refs: 'data',
    job: 'the Master Price File as one place: every list it carries, the makers, the rooms, what is new and what needs Northside, and the door to each',
    port: 6230,
  },
  {
    key: 'catalogue',
    name: 'The catalogue, the chandlery',
    route: '/catalogue',
    folder: 'src/screens/catalogue',
    specs: 'e2e/flows/chandlery.spec.ts',
    refs: 'choosing',
    job: 'every part and accessory on the price list in its aisle, with its pictures, its price and a place for Northside\u2019s own picture',
    port: 6240,
  },
  {
    key: 'rules',
    name: 'Rules, what may be sold with what',
    route: '/rules',
    folder: 'src/screens/rules',
    specs: 'e2e/flows/rules.spec.ts',
    refs: 'rules',
    job: 'the rules Northside sets on what may be sold with what, written as a sentence, and what each refuses in the build',
    port: 6250,
  },
  {
    key: 'review',
    name: 'Review, what is wrong in the price list',
    route: '/review',
    folder: 'src/screens/review',
    specs: 'e2e/flows/review.spec.ts',
    refs: 'review',
    job: 'what is wrong in the price list (a trailer registered as the wrong size, a line on sale with no price, one name at two prices), each with its fix beside it',
    port: 6260,
  },
  {
    key: 'levels',
    name: 'Prices, what only Northside can decide',
    route: '/levels',
    folder: 'src/screens/levels',
    specs: 'e2e/flows/levels.spec.ts',
    refs: 'levels',
    job: 'which figure a quote shows where the price list has not said, Warranty kept to Northside, Trade as a share of Cash, and every list\u2019s price as the file sets it',
    port: 6270,
  },
  {
    key: 'places',
    name: 'A maker\u2019s own page',
    route: '/places/<a maker>',
    folder: 'src/screens/places',
    specs: 'e2e/flows/places.spec.ts',
    refs: 'places',
    job: 'one maker as Northside sells it: its line, its mark, its photographs and colour, its models and what each carries',
    port: 6280,
  },
  {
    key: 'shelf',
    name: 'The shelf, a new price list and Northside\u2019s work kept safe',
    route: '/shelf',
    folder: 'src/screens/shelf',
    specs: 'e2e/flows/shelf.spec.ts',
    refs: 'shelf',
    job: 'bring in a new Master Price File and see every change before it is written; save a copy of Northside\u2019s work and bring it back on a new computer',
    port: 6290,
  },
  {
    key: 'manage',
    name: 'Settings, Northside as it prints and shows',
    route: '/manage',
    folder: 'src/screens/manage',
    specs: 'e2e/flows/manage.spec.ts',
    refs: 'manage',
    job: 'Northside\u2019s details on every quote, its people, its colour and pictures, and what its front page shows: the deep backend configuration of the end goal',
    port: 6300,
  },
]
const SCREENS =
  args && Array.isArray(args.only)
    ? SCREENS_ALL.filter((s) => args.only.includes(s.key))
    : SCREENS_ALL

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    done: { type: 'array', items: { type: 'string' } },
    notDone: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'done', 'notDone'],
}
const GAP = {
  type: 'object',
  properties: {
    size: { type: 'string' },
    severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
    what: { type: 'string' },
    evidence: { type: 'string' },
  },
  required: ['size', 'severity', 'what', 'evidence'],
}
const JUDGE = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['redraw', 'deepen'] },
    why: { type: 'string' },
    jobs: { type: 'array', items: { type: 'string' } },
    missing: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          what: { type: 'string' },
          why: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
        },
        required: ['what', 'why', 'severity'],
      },
    },
    gaps: { type: 'array', items: GAP },
    perfect: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'why', 'jobs', 'missing', 'gaps', 'perfect'],
}
const BOARDS = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    directions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', enum: ['a', 'b', 'c'] },
          name: { type: 'string' },
          summary: { type: 'string' },
        },
        required: ['key', 'name', 'summary'],
      },
    },
    recommended: { type: 'string', enum: ['a', 'b', 'c'] },
    notDone: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'directions', 'recommended', 'notDone'],
}
const PICK = {
  type: 'object',
  properties: {
    pick: { type: 'string', enum: ['a', 'b', 'c'] },
    why: { type: 'string' },
    graft: { type: 'array', items: { type: 'string' } },
    worries: { type: 'array', items: { type: 'string' } },
  },
  required: ['pick', 'why', 'graft', 'worries'],
}
const VERIFY = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          state: { type: 'string', enum: ['done', 'partly', 'not'] },
          evidence: { type: 'string' },
        },
        required: ['item', 'state', 'evidence'],
      },
    },
    gaps: { type: 'array', items: GAP },
    perfect: { type: 'array', items: { type: 'string' } },
  },
  required: ['items', 'gaps', 'perfect'],
}
const SECTION_GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string', enum: SCREENS_ALL.map((s) => s.key) },
          size: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['screen', 'size', 'severity', 'what', 'evidence'],
      },
    },
    perfect: { type: 'array', items: { type: 'string' } },
  },
  required: ['gaps', 'perfect'],
}

/* One checkpoint at a time: two lanes finish screens independently, and two commits at once
   would fight over git's index. */
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

const brief = (x, n) => JSON.stringify(x).slice(0, n)
const serve = (port) =>
  `Serve it on your own port: npx vite build --outDir e2e/out/dist-${port} --emptyOutDir && npx vite preview --outDir e2e/out/dist-${port} --port ${port} --strictPort, and load the real price file the way the e2e helpers do (read e2e/routes.ts, e2e/mint.ts and the screen's spec).`

const LENSES = [
  [
    'owner',
    'the owner, Asaf, who runs Northside, rejects anything half baked or boring on sight, and wants complex topics made beautiful and simple',
  ],
  [
    'admin',
    'the person who keeps Northside\u2019s price file every week, judging how fast every job is done, that nothing is hidden, ambiguous or wrong, and that each refusal says why',
  ],
  [
    'designer',
    'a senior product designer from the best tools in the world, judging hierarchy, type, density, motion and how it reflows at all six sizes',
  ],
]

async function oneScreen(s) {
  const dir = `${OUT}/${s.key}`
  const judge = await agent(
    `You are a fresh judge of one screen of HL_2.0 who has never seen it, read-only except ${dir}/judge.md and screenshots under ${dir}/before/. ${STATE}

THE SCREEN: ${s.name}, at ${s.route} (${s.folder}). Its job: ${s.job}. ${serve(s.port)}

(1) THE JOBS: list every real job a Northside person does on this screen (the admin who keeps the price file, the salesperson at the desk with a customer), from docs/SCREENS.md's row, the screen's code, docs/DECISIONS.md, docs/LATER.md (what is deliberately not built yet, and why) and what such a person truly needs. Then DO each job on the screen with the real price file, a screenshot at each step.
(2) THE PERFECT BAR at each of the six sizes: every state (empty, full, scrolled, expanded and collapsed, a refusal, a popup, the longest name), PERFECT or NOT AND WHY (the element, measured).
(3) THE LEVEL IT HAS TO BE: what the best tool in the world for this job would give this person that this screen does not (function, depth, clarity, speed, beauty), each named concretely, with why Northside needs it and whether the price file honestly carries what it needs (never a figure the file does not carry). Read docs/research/refs/${s.refs}/notes.md for what was learned before. Mark each blocker, major or minor. What docs/LATER.md defers is listed only if the owner's words now overrule it, and you say so.
(4) THE VERDICT: 'redraw' when the composition itself is wrong or thin for the job (it gets a new sweep and three drawn directions), 'deepen' when the composition is right and what is missing is function, depth and finish. The owner's words are a strong prior that what stands is not enough; a 'deepen' still lists the mammoth work.
Write ${dir}/judge.md.`,
    { label: 'judge:' + s.key, phase: 'Judge', schema: JUDGE },
  )
  if (!judge) return { key: s.key, judge: null }
  log(
    `${s.key}: ${judge.verdict}, ${judge.missing.length} missing, ${judge.gaps.length} gaps measured`,
  )

  let pick = null
  let boards = null
  let picks = []
  if (judge.verdict === 'redraw') {
    const sweep = await agent(
      `You are running the reference sweep for ${s.name}, which will be redrawn. ${STATE}

THE JUDGE: ${brief(judge, 6000)}

Read .claude/skills/research-sweep/SKILL.md and follow it, writing to docs/research/refs/${s.refs}/round-2/ (notes.md, sources-index.md, frames under live/ and gallery/). The earlier sweep is docs/research/refs/${s.refs}/notes.md: find what it did not use. Look for the best tools in the world for this job and for the judge's missing items: catalogue and price-list admin, fitment and compatibility finders, rule editors, data-quality review, pricing, import with a diff, backup, whichever are this screen's. Look at boat and car dealer back offices you can reach without signing in, the best registers (Linear, Stripe, Airtable, Retool, Shopify admin, Notion, Figma, Attio), and the galleries. Never sign in, never accept non-essential cookies, never fight bot protection; a site that refuses is listed with its reason. Every claim is tied to a frame or a URL.`,
      { label: 'sweep:' + s.key, phase: 'Draw', schema: REPORT },
    )
    boards = await agent(
      `You are drawing three directions for ${s.name}, and not building. ${STATE}

THE JUDGE: ${brief(judge, 5000)}
THE SWEEP: ${brief(sweep, 2500)} (its notes at docs/research/refs/${s.refs}/round-2/notes.md)

Read .claude/skills/directions/SKILL.md, all of it, including what the entry round taught. Draw three static directions as HTML on real seed content: real rows, figures and counts from the price file, real pictures from the seed and the ledger, and empty where the truth is empty. Each direction is a different ORDER AND GROUPING of the content, not only a different look. Each answers every job and every missing item the judge named. Draw each at 1440x900 and 390x844, and say how it reflows at 844x390, 834x1112, 1280x800 and 1920x1080. Use the app's tokens and component language (src/ui, the tokens stylesheet) so it can be built as drawn. Each board names two references no earlier board in docs/directions/ used, and says what this screen does that no other does. Save under ${dir}/boards/ (a.html, b.html, c.html, each with a PNG at both sizes, read by you) and write ${dir}/directions.md with the recommended one and why.`,
      { label: 'boards:' + s.key, phase: 'Draw', schema: BOARDS },
    )
    if (boards) {
      picks = (
        await parallel(
          LENSES.map(
            ([lens, who]) =>
              () =>
                agent(
                  `You are judging three drawn directions for ${s.name} as ${who}. Read-only. Open every PNG under ${NEW}\\${dir.replace(/\//g, '\\')}\\boards\\ and read ${dir}/directions.md and ${dir}/judge.md. The screen's job: ${s.job}. The owner: "a decent start, not at the level it has to be ... mammoth work". Judge each against the job, the judge's jobs and missing items, and the perfect bar at six sizes. Pick one; name what to graft from the others and what worries you about the pick.`,
                  { label: `pick:${s.key}:${lens}`, phase: 'Draw', schema: PICK, effort: 'medium' },
                ),
          ),
        )
      ).filter(Boolean)
      const count = { a: 0, b: 0, c: 0 }
      picks.forEach((p) => count[p.pick]++)
      const top = Math.max(count.a, count.b, count.c)
      const leaders = ['a', 'b', 'c'].filter((k) => count[k] === top)
      pick = leaders.length === 1 ? leaders[0] : boards.recommended
      log(`${s.key}: direction ${pick} (${count.a}/${count.b}/${count.c})`)
    }
  }

  const build = await agent(
    `You own ${s.folder}/** and its specs (${s.specs} and any you add), new files under src/domain with their tests, and a small additive change to src/state, src/data, src/ui or src/app where a function truly needs one (re-read it first; keep every other screen that uses it right, proven). ${STATE}

THE JUDGE OF ${s.name.toUpperCase()}: ${brief(judge, 9000)}
${
  pick
    ? `THE DIRECTION TO BUILD: ${pick}, drawn at ${dir}/boards/${pick}.html and its PNGs (${brief(boards && boards.directions, 1500)}). Three judges said: ${brief(picks, 3000)}. Graft what they name where it keeps the design simple. Build it as its own screen with its own styles, not a stamp of another screen. Mark the screen provisional in docs/SCREENS.md with the boards' paths, because the owner picks by eye later, and add a dated one-liner to docs/DECISIONS.md that names the directions that lost.`
    : 'THE COMPOSITION STAYS, AND IS DEEPENED. Add a dated one-liner to docs/DECISIONS.md for every real decision you make, naming what lost.'
}

DO: every job the judge listed works end to end on this screen with the real price file. Every missing item marked blocker or major is built, and minors too where the simpler design allows; each is honest (no figure the file does not carry; a refusal is a sentence). Every gap the judge measured is closed. Then screenshot and read every state at each of the six sizes until each one is perfect, and write the reflow into the stylesheet header. A test that asserts what this round changed is rewritten to the new truth, and you name each. Write ${dir}/built.md.

${HOUSE(s.port + 2, dir)}`,
    { label: 'build:' + s.key, phase: 'Build', schema: REPORT },
  )
  await checkpoint(`${s.name} ${pick ? 'redrawn as direction ' + pick : 'deepened'}`, 'Build')

  const fixes = []
  const verifies = []
  for (let round = 1; round <= 2; round++) {
    const verify = await agent(
      `You are a fresh verifier of ${s.name} who has never seen it, read-only except ${dir}/verify-${round}.md and screenshots under ${dir}/verify-${round}/. ${STATE}

WHAT IT MUST NOW DO: the judge's jobs and missing items: ${brief({ jobs: judge.jobs, missing: judge.missing }, 6000)}
${round === 1 ? `THE BUILDER REPORTED: ${brief(build, 4000)}` : `THE LAST VERIFY FOUND: ${brief(verifies[0].gaps, 4000)}; THE FIXER REPORTED: ${brief(fixes[0], 3000)}. A fixer's word is not proof.`}

${serve(s.port + 4)} Do every job yourself. Check each job and each missing item DONE, PARTLY or NOT, with the screenshot that proves it. Then the perfect bar at each of the six sizes over every state (empty, full, scrolled, expanded and collapsed, a refusal, a popup, the longest name): PERFECT or NOT AND WHY, the element measured. Gaps carry their severity and evidence.`,
      { label: `verify:${s.key}:${round}`, phase: 'Verify', schema: VERIFY },
    )
    if (!verify) break
    verifies.push(verify)
    const open = verify.items.filter((i) => i.state !== 'done')
    const heavy = verify.gaps.filter((g) => g.severity !== 'minor').length
    log(
      `${s.key} verify ${round}: ${open.length} items open, ${heavy} blockers or majors, ${verify.gaps.length} gaps`,
    )
    if (!open.length && !verify.gaps.length) break
    fixes.push(
      await agent(
        `You own ${s.folder}/** and its specs, new files under src/domain with their tests, and a small additive change to src/state, src/data, src/ui or src/app where a fix truly needs one (re-read it first; keep every other screen right). ${STATE}

THE VERIFIER OF ${s.name.toUpperCase()} (round ${round}): every item not done and every gap is yours to close, minors included, at its cause: ${brief({ open, gaps: verify.gaps }, 9000)}

${HOUSE(s.port + 6, dir)}`,
        { label: `fix:${s.key}:${round}`, phase: 'Verify', schema: REPORT },
      ),
    )
    await checkpoint(`${s.name}: the verifier\u2019s findings of round ${round} fixed`, 'Verify')
    if (!heavy && !open.filter((i) => i.state === 'not').length) break
  }
  return { key: s.key, judge, pick, picks, build, verifies, fixes }
}

/* Two lanes, each a screen at a time, so finished screens reach the live site early. Fitment and
   the sheet lead, because the owner named what goes on a boat and the data first. */
const LANES = [
  ['fitment', 'data', 'rules', 'levels', 'shelf'],
  ['sheet', 'catalogue', 'review', 'places', 'manage'],
]
const lane = async (keys) => {
  const out = []
  for (const k of keys) {
    const s = SCREENS.find((x) => x.key === k)
    if (s) out.push(await oneScreen(s))
  }
  return out
}
phase('Judge')
const screens = (await parallel(LANES.map((keys) => () => lane(keys)))).flat().filter(Boolean)

phase('Section')
const section = await agent(
  `You are a fresh critic of Data as one section, read-only except ${OUT}/section.md and screenshots under ${OUT}/section/. ${STATE}

What each screen's round reported: ${brief(
    screens.map((r) => ({
      key: r.key,
      verdict: r.judge && r.judge.verdict,
      pick: r.pick,
      left: r.verifies && r.verifies.length ? r.verifies[r.verifies.length - 1].gaps : null,
    })),
    8000,
  )}

${serve(6390)} At each of the six sizes: Data's head and every room; moving between rooms and back (the address, Data lit in the bar, the browser's back); a dealer's week done through the section (a new price list in and its changes read, what is wrong reviewed and fixed, a price decided, a rule written and seen refusing in a build, what fits a boat found, a picture added, a row edited and undone); and whether each screen reads as its own designed screen while the section reads as one place. PERFECT or NOT AND WHY for every frame. Gaps name the screen key they belong to.`,
  { label: 'section', phase: 'Section', schema: SECTION_GAPS },
)
const sectionGaps = (section && section.gaps) || []
log(`section: ${sectionGaps.length} gaps`)
const sectionFixes = await parallel(
  SCREENS.map((s) => () => {
    const mine = sectionGaps.filter((g) => g.screen === s.key)
    if (!mine.length) return null
    return agent(
      `You own ${s.folder}/** and its specs, new files under src/domain with their tests, and a small additive change to src/state, src/data, src/ui or src/app where a fix truly needs one. ${STATE}

THE SECTION CRITIC'S FINDINGS ON ${s.name.toUpperCase()}, every one to close at its cause: ${brief(mine, 8000)}

${HOUSE(s.port + 8, `${OUT}/${s.key}`)}`,
      { label: 'section-fix:' + s.key, phase: 'Section', schema: REPORT },
    )
  }),
)
await checkpoint('Data as one section: the section critic\u2019s findings fixed', 'Section')

phase('Gate')
const gate = await agent(
  `You are the gate, and you run alone. In ${NEW}, stop any vite or playwright still running from an earlier agent on ports 4170 to 6999 (only node processes serving this repo). Run npm test in the foreground (timeout 600000; about 420 s). Then run the e2e of every Data screen and the rulers on every project: HL2_PREVIEW_PORT=6399 npx playwright test ${SCREENS_ALL.map((s) => s.specs).join(' ')} e2e/rulers --output=test-results-6399 (timeout 600000; split it by spec if it needs longer). Every failure is fixed at its cause in the source. A ported or older test is never edited to pass unless this round changed what it asserts, and then you name it. Rerun until both pass. Then git add the changed paths (never test-results-*, e2e/out, zz-*.spec.ts or FAULT-*.png), commit "Fitment and every room of Data brought to the level they have to be, gated" with -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", and git push origin main. Report the npm test time, the e2e counts, every failure you fixed and how, and the hash.`,
  { label: 'gate', phase: 'Gate', schema: REPORT },
)

return { screens, section, sectionFixes, gate }
