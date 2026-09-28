export const meta = {
  name: 'hl2-build-close',
  description:
    "Finish what the component round's second critic left: the build past the motor chapter still reads as text in boxes, giving the quote has no moment, and five smaller faults on the picker, the pill, Customers and the register; then the gate alone and a fresh critic",
  phases: [
    {
      title: 'Build',
      detail: 'the configurator, in two passes that never overlap: its chapters, then its finale',
    },
    { title: 'Screens', detail: 'the picker, the pill, Customers, the register' },
    { title: 'Verify', detail: 'the gate alone, a fresh critic, one more pass if needed' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

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
    stillBland: { type: 'string' },
  },
  required: ['gaps', 'stillBland'],
}

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is Northside Marine's quoting and configuration app, on its real Master Price File; nothing in it is invented. The component round (hl2-components) has just finished: the new kit is in src/ui (see it whole at /kit), with icons, kind inks, a motion vocabulary in src/ui/motion.ts, WebGL water in src/ui/water.ts and view transitions in src/ui/transition.ts. Its SECOND critic, docs/directions/components-critique-2.md — READ IT WHOLE — says the app is "mostly no" longer bland, except in one place that matters more than any other: THE BUILD (/quote/$id), past the motor chapter, and the moment the quote is given. Read also docs/STATUS.md (top section), CLAUDE.md (in your context), docs/WORDS.md if it exists, and the owner's design skills in .claude/skills/ (emil-design-eng, apple-design, animate, animation-vocabulary).

THE OWNER'S FINISH LINE: "do a full quote that is good enough experience to do so sitting with a customer and it is beautiful". The build is where that happens. His words: "components are so bland and boring"; "Configurator still sucks"; "More like Porsche the right side, not less. STUDY IT."; "simple wins. this app is complex topics made beautiful".

THE RULES THAT DO NOT BEND: every value a token; controls from src/ui (use the kit's OptionTile, Stat, Dashes, Plate, Chapter, Row, Picture, Status, Toaster — the critic found several used by no screen at all); nothing invented — a figure is counted from the file, a code the dealer needs stays available to the dealer but never leads what a customer reads; the price figure never counts up and never travels; NOTHING MOVES WHILE A CARET IS IN A TEXT FIELD (the :root[data-still] rule — the critic found the build's chevrons and accent bars break it at configurator.css ~933 and ~950); reduced motion keeps colour and opacity and removes movement; visible focus on every control; a refusal is a sentence; nothing drawn over anything at rest or scrolled; every write a command with an inverse and Undo on the screen; the primary act never a floating bottom bar. It is Northside Marine's app and nobody else's.

Do NOT commit, push, checkout, reset or stash. Append decisions to docs/DECISIONS.md with one \`cat >> docs/DECISIONS.md <<'EOF'\` each.

GATE for every agent: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then ONLY the Playwright flows and rulers of the screens you touched, --workers 1 on your own port. Look at what you changed with the browser tools at 1440×900, 834×1112 and 390×844, and save the after-shots over the old ones in docs/directions/<screen>/built/.`

phase('Build')
const chapters = await agent(
  `${CONTEXT}\n\nTASK: THE BUILD'S CHAPTERS, PAST THE MOTOR — the critic's blocker "past the motor tiles the build is still text in boxes". Today: chapter summaries lead with codes ("TA1400S13SB · …", "704-6Y82L-22-07"); dealer fit is rows of part numbers; every motor tile carries two to five lines of rigging-kit text, while /kit draws the same motors cleaner under hp chips and dashes. Make every chapter — motor, trailer, dealer fit and parts, and the hull's finishes — read the way /kit reads: the thing a person recognises first (its spoken name from src/domain/quote/spoken.ts, its picture where one is held, its two or three facts that decide it as Stats and chips with units), its price delta, its state (chosen, recommended by the file, refused with the engine's reason); the dealer's code and the pairing's rigging detail one press away (the kit's disclosure or the side of the tile), never leading. A chapter's shut head says its answer the way a person says it, with its subtotal. Use the kit's OptionTile, Stat, Dashes, Chapter and Picture; extend a primitive in src/ui only if a chapter genuinely needs a variant, and say so. Keep every function the build has (search across chapters, the delta, undo, refusals, the cascade's doors) and every test that pins one. Ownership: src/screens/configurator/** EXCEPT the finale and the Who-it-is-for chapter, and src/ui primitives only for a needed variant. Ports 6711, 6712.`,
  { label: 'build:chapters', phase: 'Build', schema: REPORT },
)
const finale = await agent(
  `${CONTEXT}\n\nThe chapters pass has just finished: ${JSON.stringify(chapters && { fixed: chapters.fixed, notFixed: chapters.notFixed }).slice(0, 3000)}\n\nTASK: THE BUILD'S FINALE, ITS STILLNESS AND ITS PHONE — the critic's blocker on the caret rule and its majors on the finale and the phone.\n1. THE CARET RULE: nothing on the build moves while a caret is in its search field or any field — chevrons, accent bars, anything (configurator.css ~933 and ~950 are not under :root[data-still]). Fix it and add a flow assertion that types in the search and reads that no animation runs.\n2. GIVING THE QUOTE IS A MOMENT. Today it is "a 72 px seal that is still by 450 ms" and "the finale is three numbers and a paragraph". This is the climax of a sale, done with the customer beside the dealer. Design and build it: the boat, its spoken name, who it is for, the total at the level it is given at, and one act — and when it is given, a moment the customer sees (an authored sequence with motion, or a Rive or Lottie piece if one earns it; the photograph handing off to the paper's cover by the view transition the kit already has), ending on the way to the paper. The total never animates. Under reduced motion it is a clean cut with the same end state.\n3. THE PHONE: at 390×844 the build is "a third chrome" and a pressed chapter opens off screen. Make the build at 390 a single clear column where pressing a chapter brings it into view, with the price always reachable and never covering the work.\n4. The step line that moves the chapter list under a press, and the Toaster the build mounts and never raises, if the chapters pass did not close them.\nOwnership: src/screens/configurator/** (you are the only agent in it now), e2e/flows/configurator.spec.ts. Ports 6721, 6722.`,
  { label: 'build:finale', phase: 'Build', schema: REPORT },
)

phase('Screens')
const SCREENS = [
  {
    key: 'picker',
    port: 6731,
    task: 'THE PICKER: after Start the quote, the act covers the price and says a false sentence (read the critique for the exact words and sizes). The act never covers the price; every sentence on the act is true at the moment it is read. Ownership: src/screens/picker/**, e2e/flows/picker.spec.ts.',
  },
  {
    key: 'shell',
    port: 6741,
    task: "THE PILL: the lit capsule drops out of the pill on the way from the build to the paper (read the critique). The pill's capsule travels with the reader's place on every route change the view transition carries, and never disappears. Ownership: src/screens/shell/**, e2e/flows/shell.spec.ts.",
  },
  {
    key: 'customers',
    port: 6751,
    task: 'CUSTOMERS: it says "Given 0 / $0" while History says "1 given $55,223" for the same person on the same tree. Two screens counting one fact differently is a false figure. Find the cause, put the count in ONE derivation in src/domain that both read, with a test, and make both screens read it. Ownership: src/screens/customers/**, the derivation in src/domain with its test, e2e/flows/customers.spec.ts; if History must change to read the shared derivation, change only that call and say so.',
  },
  {
    key: 'quotes',
    port: 6761,
    task: "THE REGISTER: it shows its counts twice, and its photograph belongs to a different quote than the one it stands beside (read the critique). Say each count once, where it matters; a picture beside a quote is that quote's boat and nothing else. Ownership: src/screens/quotes/**, e2e/flows/quotes.spec.ts.",
  },
]
const screens = await parallel(
  SCREENS.map(
    (s) => () =>
      agent(`${CONTEXT}\n\nTASK: ${s.task} Ports ${s.port}, ${s.port + 1}.`, {
        label: 'fix:' + s.key,
        phase: 'Screens',
        schema: REPORT,
      }),
  ),
)

phase('Verify')
const VERIFY = (round) =>
  `${CONTEXT}\n\nTASK: VERIFY THIS ROUND, ALONE. The reports: ${JSON.stringify([chapters, finale, ...screens].map((r) => r && { fixed: r.fixed, notFixed: r.notFixed })).slice(0, 9000)}\n1. Anything left in notFixed because it needed another agent's file: do it now.\n2. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Everything green; a red that passes alone with --last-failed --timeout 120000 --workers 1 is the machine — report both readings; a real red is fixed at its cause.\n3. Walk a full quote cold at 1440×900, 834×1112 and 390×844 — the picker, EVERY chapter of the build, a cascade, the Who-it-is-for chapter, GIVING THE QUOTE, the paper — and photograph each into docs/directions/<screen>/built/; write docs/directions/build-close${round}.md.\nReport the gate numbers and anything still wrong.`
await agent(VERIFY(''), { label: 'verify', phase: 'Verify', schema: REPORT })
const CRITIC = (round) =>
  `${CONTEXT}\n\nYou are a fresh critic who has never seen HL_2.0. Read-only except docs/directions/build-close-critique${round}.md. Serve it (npm run build && npx vite preview --port ${6791 + (round === '-2' ? 2 : 0)}) and do a FULL QUOTE as a salesperson would with a customer beside him, at 1440×900, 834×1112 and 390×844: every chapter of the build, a change of mind, the customer's name, giving the quote, the paper. For each of the findings in docs/directions/components-critique-2.md, say CLOSED or OPEN with what you saw, then find what is new. Findings with a screen and a severity; \`stillBland\`: would the owner still call any part of the sale bland, and where first?`
let critic = await agent(CRITIC(''), { label: 'critic', phase: 'Verify', schema: GAPS })
let serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const by = {}
  for (const g of critic.gaps) (by[g.screen] = by[g.screen] || []).push(g)
  const keys = Object.keys(by)
  const config = keys.filter((k) => /configurator|build/i.test(k))
  const rest = keys.filter((k) => !/configurator|build/i.test(k))
  if (config.length > 0) {
    await agent(
      `${CONTEXT}\n\nTASK: answer a fresh critic on THE BUILD (docs/directions/build-close-critique.md — read it whole): ${JSON.stringify(config.flatMap((k) => by[k]))}. Fix every blocker and major and the cheap minors. You are the only agent in src/screens/configurator/**. Ports 6801, 6802.`,
      { label: 'fix2:build', phase: 'Verify', schema: REPORT },
    )
  }
  await parallel(
    rest
      .slice(0, 8)
      .map(
        (screen, i) => () =>
          agent(
            `${CONTEXT}\n\nTASK: answer a fresh critic (docs/directions/build-close-critique.md — read it whole) on "${screen}": ${JSON.stringify(by[screen])}. Fix every blocker and major and the cheap minors, touching only that screen's files (never src/screens/configurator/**). Ports ${6811 + i * 4}, ${6812 + i * 4}.`,
            { label: 'fix2:' + screen, phase: 'Verify', schema: REPORT },
          ),
      ),
  )
  await agent(VERIFY('-2'), { label: 'verify2', phase: 'Verify', schema: REPORT })
  critic = await agent(CRITIC('-2'), { label: 'critic2', phase: 'Verify', schema: GAPS })
  serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
}

return {
  critic: critic && {
    stillBland: critic.stillBland,
    serious: serious.map((g) => `${g.severity} | ${g.screen} | ${g.title}`),
  },
}
