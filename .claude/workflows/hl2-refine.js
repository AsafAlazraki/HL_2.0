export const meta = {
  name: 'hl2-refine',
  description:
    'Refine every built screen: make the overlap ruler see what the owner sees (floating chrome, scrolled states, controls and pictures), hunt visual overlap, repeated information and engine words by eye, fix them all, and guard them so they cannot come back',
  phases: [
    {
      title: 'Instrument',
      detail: 'the overlap ruler stops exempting what floats, and measures scrolled',
    },
    {
      title: 'Hunt',
      detail: 'overlap by eye, and information said twice or in the engine’s words',
    },
    { title: 'Fix', detail: 'every screen, two at a time' },
    {
      title: 'Verify',
      detail:
        'the gate alone with the stronger ruler, re-photographed, a fresh critic, a second fix if needed',
    },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

const INSTRUMENT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    whyItMissed: { type: 'string' },
    found: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          viewport: { type: 'string' },
          state: { type: 'string' },
          what: { type: 'string' },
        },
        required: ['screen', 'viewport', 'state', 'what'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'whyItMissed', 'found', 'notes'],
}

const HUNT = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          viewport: { type: 'string' },
          kind: { type: 'string', enum: ['overlap', 'repeated', 'words', 'other'] },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          title: { type: 'string' },
          detail: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['screen', 'kind', 'severity', 'title', 'detail', 'fix'],
      },
    },
    rulerStillMisses: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['lens', 'findings', 'rulerStillMisses', 'notes'],
}

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    fixed: { type: 'array', items: { type: 'string' } },
    notFixed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'fixed', 'notFixed', 'notes'],
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
    verdict: { type: 'string' },
  },
  required: ['gaps', 'verdict'],
}

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is Northside Marine's quoting and configuration app, on its real Master Price File; nothing in it is invented. Read docs/STATUS.md (top sections), docs/SCREENS.md, CLAUDE.md (in your context) and the newest critique under docs/directions/.

THE OWNER, 2026-09-24: "seeing overlap of info and things on some screens. ensure refinement of things covers that". And 2026-09-23: "this is a northside marine app … remember also simple wins. this app is complex topics made beautiful", and the finish line: stakeholders, "no ui and ux errors", a full quote with a customer at the desk, "and it is beautiful".

TWO FAULTS THIS ROUND EXISTS FOR, both measured before it was written:
1. THE OVERLAP RULER IS BLIND WHERE OVERLAP HAPPENS. e2e/rulers/measure/overlap.ts sets aside ANY element that is position absolute, fixed or sticky, and every descendant of one — which is the shell's floating pill, every sticky head, the configurator's stage and masthead, and every panel. It also measures only at rest, scrolled to the top, and only text against text. So the configurator's two sticky bars overlapped by 33px while the ruler was green, and the owner is now seeing overlap the gate calls clean.
2. THE SCREENS SPEAK THE ENGINE'S LANGUAGE, AND SAY THINGS TWICE. The Milestone 2 close-out's critic: "take the database out of the words, starting with the picker. Every screen in the sale speaks the engine's language" — 128 uses of "row" on the picker; "register", "rung", "table", "column", "frozen lines", "re-roots" reach a dealer. And the same fact is printed in two or three places on one screen: the earlier critique counted the word "Data" three times and four ways back in one window on the sheet.

HOW THIS APP IS BUILT, which every change respects: a screen lives in src/screens/<name>/ with its own stylesheet and no shared page component; every colour, face, size, space, radius, shadow, easing and duration comes from src/styles/tokens.css, and tools/check.ts refuses a literal colour, an undeclared token, anything under 11px, a cost column on a customer surface and the words entity / schema / field type / reference / UID in a reader-facing string; controls come from src/ui; figures are counted from the stores; nothing is invented; a refusal is a sentence with its reason, never a disabled control and never the loudest thing at rest; every write is a command with an inverse and Undo on the screen; the price figure never counts up; reduced motion removes movement. HONESTY OUTRANKS BREVITY: a fact that matters to a sale — a thing not priced, a pairing the file refuses and why, a picture that shows a different motor — is never deleted to tidy a screen. It is said ONCE, in the dealer's words, where it matters.

Do NOT commit, push, checkout, reset or stash. Append decisions to docs/DECISIONS.md with one \`cat >> docs/DECISIONS.md <<'EOF'\` each.`

phase('Instrument')
const instrument = await agent(
  `You are fixing the instrument before anybody fixes a screen: the overlap ruler must see what the owner sees.\n\n${CONTEXT}\n\nTASK.\n1. Read e2e/rulers/measure/overlap.ts, e2e/rulers/overlap.spec.ts, e2e/rulers/fixture.spec.ts's overlap cases, e2e/routes.ts and e2e/shots/recipe.ts. Write down in \`whyItMissed\` exactly why it passed the configurator's 33px sticky overlap and why it would pass the pill over content.\n2. MAKE IT SEE. (a) PERSISTENT CHROME IS MEASURED: an element that is fixed or sticky and is always there (the pill, a sticky head, a sticky stage or masthead, a floating act) is measured against the content under it — text, controls, pictures — and covering any of it is a failure. What stays set aside is only what a person opened on purpose and closes: an open dialog, menu, popover, listbox or tooltip (role dialog, menu, listbox, tooltip, or an element with [open] or aria-expanded content), and decoration marked aria-hidden. (b) SCROLLED STATES: measure each route at rest, one window down, and at the end of the page (and inside the main scroller, where a screen scrolls in its own box), because sticky overlap only appears after scrolling. (c) NOT ONLY TEXT: a control (button, link, input, select) overlapping another control or text, and text drawn over a picture with no ground behind it, are failures too. (d) A PIXEL OF TOUCH IS NOT OVERLAP: keep a small tolerance and say what it is. Every new failure gets a fixture page in fixture.spec.ts built to fail, with its near-miss neighbour built to pass, the way that file already proves every ruler.\n3. RUN IT on every route in e2e/routes.ts at all six viewports, alone: HL2_PREVIEW_PORT=5961 npx playwright test e2e/rulers/overlap.spec.ts e2e/rulers/fixture.spec.ts --workers 1. Report EVERY overlap it now finds, per screen, viewport and state, in \`found\`. DO NOT FIX SCREENS and do not loosen the ruler to make a screen pass — the fixers own the screens. It is expected and correct that the ruler is red when you finish; say so. Everything else in the gate (npm test) must be green.\nOwnership: e2e/rulers/**, and e2e/shots/recipe.ts only if the scrolled states need a helper. Ports: 5961, 5962.`,
  { label: 'instrument', phase: 'Instrument', schema: INSTRUMENT },
)
log(
  'instrument: ' + (instrument ? `${instrument.found.length} overlaps the ruler now sees` : 'none'),
)

phase('Hunt')
const hunts = await parallel([
  () =>
    agent(
      `You are hunting OVERLAP BY EYE on every built screen of HL_2.0 — what a ruler cannot judge.\n\n${CONTEXT}\n\nWHAT THE STRENGTHENED RULER ALREADY FOUND (do not re-report these; confirm any it got wrong): ${JSON.stringify(instrument && instrument.found).slice(0, 8000)}\n\nBuild and serve (npm run build && npx vite preview --port 5971) and visit EVERY route in e2e/routes.ts the way its \`arrive\` says (read e2e/shots/recipe.ts and e2e/mint.ts; walk, never plant data) at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 — at rest, scrolled one window, scrolled to the end, and with each screen's panels, drawers, finder and menus OPEN. Photograph each into docs/directions/refine/<screen>/<w>x<h>-<state>.png. Find everything drawn over anything else that should not be: text over text, a control over a control, the pill or a sticky head over content, a caption over the boat it describes with nothing behind it, a panel covering the thing it is about, an open finder or menu drawn behind something, something cut off by an edge. Also anything that ALMOST touches in a way that reads as cramped. For each: the screen, size, state, what, and the fix. Then \`rulerStillMisses\`: every overlap you saw that the strengthened ruler did not report, and why it could not. Budget: open at most 60 pictures. Change nothing.`,
      { label: 'hunt:overlap', phase: 'Hunt', schema: HUNT },
    ),
  () =>
    agent(
      `You are hunting REPEATED INFORMATION and THE ENGINE'S WORDS on every built screen of HL_2.0.\n\n${CONTEXT}\n\nBuild and serve (npm run build && npx vite preview --port 5981) and read EVERY screen in e2e/routes.ts, reached the way its \`arrive\` says, at 1440×900 and 390×844, with a quote, a customer and the price file in it. Read the source of each screen too (src/screens/<name>/), because a sentence that shows only in one state is still shown.\n\n1. REPEATED INFORMATION: the same fact, count, name, total or way-out printed more than once on one screen, or a way to the same place offered twice (the pill already carries Home, Quotes, Customers, Data and History). For each, say where it should be said ONCE and what goes.\n2. THE ENGINE'S WORDS: every word or phrase a boat dealer would not say — row, register, rung, table, column, field, record, frozen, re-root, pairing as a mechanism, pack, mint, ledger, provenance, sheet (where a dealer would say price list), level (where a dealer would say price), held copy, leaf, band, chip, slot, and whatever else you find — with the DEALER'S WORD for each, in context. A boat dealer says: boat, model, finish, colour, motor, trailer, accessory, price, cash price, trade price, the price list, the quote, the customer, "not on the price list", "goes with", "doesn't fit". WRITE docs/WORDS.md: a short glossary, engine term → the dealer's word, with a one-line example of each on a real screen, and the few engine words that must stay because a dealer genuinely uses them (for example "Cash" and "Trade" as price names, because they are the file's own column names and the dealership's own words). This file is what every fixer in this round and every builder after it follows.\n3. Sentences that explain the app instead of the boat, and walls of prose a dealer would not read. Keep what is honest and needed; say it shorter.\nFor each finding: the screen, the size if it matters, kind (repeated / words / other), severity, what, and the fix. Budget: open at most 40 pictures. Change nothing except writing docs/WORDS.md.`,
      { label: 'hunt:words', phase: 'Hunt', schema: HUNT },
    ),
])
const found = hunts.filter(Boolean).flatMap((h) => h.findings)
const byScreen = {}
for (const f of found) (byScreen[f.screen] = byScreen[f.screen] || []).push(f)
for (const o of (instrument && instrument.found) || [])
  (byScreen[o.screen] = byScreen[o.screen] || []).push({
    kind: 'overlap',
    severity: 'major',
    title: 'the ruler: ' + o.what,
    detail: `${o.viewport} · ${o.state}`,
    fix: 'make it not overlap',
  })
log('hunt: ' + found.length + ' findings over ' + Object.keys(byScreen).length + ' screens')

phase('Fix')
const FIX = (screen, items, i, round) =>
  `You are refining one screen of HL_2.0: no overlap, every fact said once, and the dealer's words.\n\n${CONTEXT}\n\nYOUR SCREEN: ${screen}. EVERYTHING FOUND ON IT (the strengthened overlap ruler, an eye over every size and scrolled state, and a reader of every word): ${JSON.stringify(items)}\n\ndocs/WORDS.md is the glossary this round wrote — follow it for every word on your screen. Fix every overlap at its cause (layout, not a z-index that hides one thing behind another); say each repeated fact once, where it matters; put the engine's words into the dealer's; shorten what explains the app. Keep the screen's own idea and every honest fact. Look at your screen again at 390×844, 1280×800, 1440×900 and 1920×1080, at rest and scrolled, and compare with docs/directions/refine/<screen>/. Update the screen's component tests where they pinned the old words, by role and text — pinning the same property in the new words, never deleting the property. GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; and ONLY your screen's rulers and flow (HL2_PREVIEW_PORT=${6001 + i * 4 + (round - 1) * 60} npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<route name>" --workers 1) — another fixer is working beside you, so touch only your screen's files, and if a finding needs a file another screen owns (the shell's pill, a shared primitive in src/ui), say so in notFixed rather than editing it.`
await parallel(
  Object.keys(byScreen)
    .slice(0, 20)
    .map(
      (screen, i) => () =>
        agent(FIX(screen, byScreen[screen], i, 1), {
          label: 'fix:' + screen,
          phase: 'Fix',
          schema: REPORT,
        }),
    ),
)

phase('Verify')
const VERIFY = (round) =>
  `You are verifying the refinement of HL_2.0, alone, and closing what the fixers could not reach.\n\n${CONTEXT}\n\n1. Anything a fixer reported in notFixed because it needed a shared file (the shell's pill, a primitive in src/ui, a token): do it now, once, for every screen at once.\n2. GUARD THE WORDS: extend the reader-facing word rule in tools/check.ts (and tools/check/rules.ts) with the engine words docs/WORDS.md says a dealer must never read, with a fixture test that proves it fails on each and passes on the dealer's word — so no later round can put the database back into the words. Only words the screens are now clean of; say which you left off and why.\n3. THE FULL GATE, alone, with the stronger ruler: npm test; npm run build; npm run e2e. Everything green. A red overlap is fixed at its cause, never by loosening the ruler; a red that passes alone with --last-failed --timeout 120000 --workers 1 is the machine — report both readings.\n4. Re-photograph every screen at 1440×900, 1280×800 and 390×844 into docs/directions/<screen>/built/ and write docs/directions/refine${round}.md: per screen, what changed and anything still wrong.\nReport the gate numbers and anything still wrong.`
const verify = await agent(VERIFY(''), { label: 'verify', phase: 'Verify', schema: REPORT })

const CRITIC = (round) =>
  `You are a fresh critic of HL_2.0 who has never seen it, looking for exactly three things on every screen: anything drawn over anything else, any fact said twice, and any word a boat dealer would not use. Read-only except docs/directions/refine-critique${round}.md.\n\n${CONTEXT}\n\nRead docs/WORDS.md and docs/directions/refine${round}.md, then SERVE THE APP YOURSELF (npm run build && npx vite preview --port ${6091 + (round === '-2' ? 4 : 0)}) and drive every screen at 390×844, 834×1112, 1280×800 and 1920×1080, at rest and scrolled, with panels open. Be adversarial: a claimed fix you cannot see is not fixed. Findings with a screen and a severity (blocker: overlap that hides something a person needs; an engine word on the sale's screens; a fact contradicted by a second copy of itself. major: any other overlap; a fact said twice; an engine word anywhere; prose a dealer would not read. minor: craft). Then \`verdict\`: would the owner still see "overlap of info and things"?`
let critic = await agent(CRITIC(''), { label: 'critic', phase: 'Verify', schema: GAPS })
let serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
log('critic: ' + serious.length + ' serious')
if (serious.length > 0) {
  const by2 = {}
  for (const g of critic.gaps) (by2[g.screen] = by2[g.screen] || []).push(g)
  await parallel(
    Object.keys(by2)
      .slice(0, 16)
      .map(
        (screen, i) => () =>
          agent(FIX(screen, by2[screen], i, 2), {
            label: 'fix2:' + screen,
            phase: 'Verify',
            schema: REPORT,
          }),
      ),
  )
  await agent(VERIFY('-2'), { label: 'verify2', phase: 'Verify', schema: REPORT })
  critic = await agent(CRITIC('-2'), { label: 'critic2', phase: 'Verify', schema: GAPS })
  serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
  log('critic2: ' + serious.length + ' serious')
}

return {
  instrument: instrument && { whyItMissed: instrument.whyItMissed, found: instrument.found.length },
  findings: found.length,
  verify,
  critic: critic && {
    verdict: critic.verdict,
    serious: serious.map((g) => `${g.severity} | ${g.screen} | ${g.title}`),
  },
}
