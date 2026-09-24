export const meta = {
  name: 'hl2-m2-last',
  description:
    "The last of Milestone 2: the final critic's three blockers, its one change first — every boat and colour named the way a person says it, everywhere — and the majors no later round owns; then the gate alone and a fresh critic",
  phases: [
    {
      title: 'Blockers',
      detail: 'the refusal ink, the picker on a tablet, the cascade’s invented “Standard”',
    },
    {
      title: 'Names',
      detail: 'one derivation for a boat’s and a colour’s name, used on every screen and the paper',
    },
    { title: 'Majors', detail: 'the dead Undo, the false export, the picker’s act at 390' },
    { title: 'Verify', detail: 'the gate alone, a fresh critic, a second pass if needed' },
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
    verdict: { type: 'string' },
  },
  required: ['gaps', 'verdict'],
}

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is Northside Marine's quoting and configuration app, on its real Master Price File; nothing in it is invented. Milestone 2's close-out finished on 2026-09-24 green (202 test files, 3,439 tests; e2e 1,284 tests, 0 failed). Its FINAL critic, docs/directions/built-critique-m2-close-2.md — READ IT WHOLE — still said no, and this round answers exactly what it named that no later round owns. Also read docs/STATUS.md (top section), CLAUDE.md (in your context) and docs/directions/built-m2-close-2.md.

THE CRITIC'S ONE THING TO CHANGE FIRST, in its words: "name every boat and every colour the way a person says it, everywhere. Replace the file's key string with 'Highfield Adventure 7 · Hypalon · Black / Grey / Black' on the build, the paper, the register, History, Customers, the cascade and the finder. Draw colourways as colour on the picker's chips and the sheet's Variant column, using the decode src/domain/quote/colourway.ts already holds. Put a unit on every measure." And its three blockers: a refused act's reason at 1.23:1 (src/ui/button.css, the day theme); on a tablet (834×1112, 844×390) pressing a boat on the picker appears to do nothing; and the cascade calls a line "Standard" (src/domain/quote/cascade.ts ~349) that the paper calls unpriced.

THE OWNER: "this is a northside marine app … remember also simple wins. this app is complex topics made beautiful"; "i can't stress enough how easy this system has to be to use"; and the finish line — a full quote with a customer at the desk, and a downloaded quote that is beautiful.

THE RULES THAT DO NOT BEND: NO INVENTED NAME. A boat's spoken name comes from the price file's own columns and hierarchy (its series, model and variant names, its Model Name or Description columns) or, where the file carries only a code, from the maker's own published name for that exact model with its source recorded — never a guess; a code the file and the maker do not decode (Highfield's colourway codes I, O, R and WH, for example) is shown as the code it is. A colour swatch is drawn only for a colour the decode NAMES, in a neutral rendering of that named colour, and a code it cannot decode gets no swatch. Every value is a token; every derivation is a pure function in src/domain with a test; every write is a command with an inverse; a refusal is a sentence, never a disabled control, never the loudest thing at rest; text 4.5:1 on its real ground in BOTH themes; nothing drawn over anything; the price figure never counts up; src/domain/quote/golden.test.ts stays untouched and green. It is Northside Marine's app and nobody else's.

Do NOT commit, push, checkout, reset or stash. Append decisions to docs/DECISIONS.md with one \`cat >> docs/DECISIONS.md <<'EOF'\` each.

GATE for every agent: npx prettier --write <your files>; npx oxlint --max-warnings 0 src tools e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then ONLY the Playwright flows and rulers of the screens you touched, with --workers 1 on your own port. Look at what you changed with the browser tools at 1440×900, 834×1112 and 390×844.`

phase('Blockers')
const blockers = await parallel([
  () =>
    agent(
      `${CONTEXT}\n\nTASK: THE REFUSAL INK. A refused act's reason reads at 1.23:1 (the critique names the rule in src/ui/button.css for the day theme and the screens it shows on — every refused act on the configurator and the register). Find why the contrast ruler did not catch it (a theme it never ran in, a state it never reached, a colour set on a ground it never composited) and fix the RULER too, with a fixture that fails at 1.23:1 and passes at 4.5:1, so this can never ship again. Then re-ink the reason in every theme to 4.5:1 or better on its real ground, as a token. Ownership: src/ui/button.css, src/ui/refusal.css and the Refusal/Button primitives, src/styles/tokens.css, e2e/rulers/**. Ports 6511, 6512.`,
      { label: 'blocker:refusal-ink', phase: 'Blockers', schema: REPORT },
    ),
  () =>
    agent(
      `${CONTEXT}\n\nTASK: THE PICKER ON A TABLET. At 834×1112 and 844×390, pressing a boat on the picker appears to do nothing (read the critique for what it saw). Reproduce it with the browser tools at both sizes, with touch emulation, find the cause (the plate drawn off screen or behind something, a press that changes state nobody can see, a hover-only affordance), and fix it so that on a tablet a press on a boat visibly opens it and its act is in reach — the dealer is holding the tablet beside a hull with a customer. Add a flow assertion at both sizes that presses a boat and sees its plate and its act in the window. Also THE ADV7'S ACT AT 390: the critique found the act for a multi-colourway model below the fold at 390×844 — make the choice the act waits on and the act itself reachable without hunting. Ownership: src/screens/picker/**, e2e/flows/picker.spec.ts. Ports 6521, 6522.`,
      { label: 'blocker:picker-tablet', phase: 'Blockers', schema: REPORT },
    ),
])
const cascade = await agent(
  `${CONTEXT}\n\nTASK: THE CASCADE'S INVENTED "STANDARD". src/domain/quote/cascade.ts (around line 349) infers "Standard" for a line whose price the file does not carry, and the paper then prints that same line as not priced — two answers to one question, and "Standard" is a claim the file never makes. Delete the inference. The cascade, the configurator and the paper must say the same thing about the same line, in the dealer's words, from ONE derivation in src/domain (find which one the paper uses — src/domain/quote/document.ts — and make the cascade read it). Add a test that a line the file does not price reads the same on all three. golden.test.ts stays untouched. Ownership: src/domain/quote/cascade.ts and its test, src/screens/cascade/**, e2e/flows/cascade.spec.ts. Ports 6531, 6532.`,
  { label: 'blocker:cascade-standard', phase: 'Blockers', schema: REPORT },
)

phase('Names')
const names = await agent(
  `${CONTEXT}\n\nTASK: EVERY BOAT AND EVERY COLOUR NAMED THE WAY A PERSON SAYS IT, EVERYWHERE — the critic's one thing to change first.\n1. READ WHAT THE FILE ACTUALLY CARRIES for each boat table: its hierarchy (series ▸ model ▸ variant), its name and description columns, and what src/domain/quote/colourway.ts and marque.ts already decode. Where the file carries only a code (ADV7), find whether the file itself names it anywhere, then the maker's own published name for that exact model (Highfield's site says "Adventure 7"? verify it, with the page as the source, in a small ledger — data/northside/names.json — with provenance, the way pictures are recorded). Never guess a name.\n2. ONE PURE DERIVATION in src/domain (beside colourway.ts): a boat's spoken name — maker, model's name, material in words (HYP → Hypalon, PVC → PVC), colourway in words (B-G-B → Black / Grey / Black) — all or nothing per part as colourway.ts rules, with the code kept alongside for the dealer; and a measure with its unit (length and beam in metres, power in hp, weight in kg — read the unit the file's column names or the maker states; never assume one). Tests on the real pack, including the undecodable codes shown as codes.\n3. USE IT EVERYWHERE a boat or a colour is named: the configurator's headline and chapters, the cascade, the document (screen AND paper — the customer's copy), the quotes register, History, Customers, the finder's results, Home, the picker's plates and chips, the sheet's Variant column. A colourway chip draws its named colours as a small swatch of each (a token per named colour, defined once), a code it cannot decode as the code alone. The dealer's code stays where the dealer needs it (the sheet, the note beside the paper), never on the customer's paper.\n4. COUNT BOATS THE WAY A PERSON COUNTS THEM: Home says "810 BOATS" where the picker says 289 models — a person means models. One derivation for "how many boats", used by every screen that counts them.\nUpdate every component test that pinned the old strings to pin the same property in the new words. Ownership: src/domain/quote/ (the naming derivation and its test; not golden.test.ts), data/northside/names.json, and the naming lines in every screen listed above — you are the only agent touching screens in this phase. Ports 6541, 6542.`,
  { label: 'names:everywhere', phase: 'Names', schema: REPORT },
)

phase('Majors')
const majors = await parallel([
  () =>
    agent(
      `${CONTEXT}\n\nTASK: THE UNDO THAT CAN NEVER WORK. On every freshly issued quote the configurator offers an Undo that cannot succeed (read the critique for exactly where and why). An issued quote refuses edits with a sentence; an act that cannot work is never offered. Remove it where it cannot work, and keep the ways that genuinely can (a new version of an issued quote). Test it. Ownership: src/screens/configurator/**, e2e/flows/configurator.spec.ts. Ports 6551, 6552.`,
      { label: 'major:issued-undo', phase: 'Majors', schema: REPORT },
    ),
  () =>
    agent(
      `${CONTEXT}\n\nTASK: A PROMISE OF AN EXPORT THAT DOES NOT EXIST. The quotes register's and History's empty states promise an export nobody can press (read the critique). Until the shelf (Milestone 4) builds backup and restore, no screen promises it: say only what is true today, in the dealer's words, and keep the empty state as good as it is. Grep every screen for any other promise of a thing that does not exist (export, import, send, email, sign, share) and make each true. Ownership: src/screens/quotes/**, src/screens/history/**, and the one sentence in any other screen that promises what does not exist. Ports 6561, 6562.`,
      { label: 'major:false-promises', phase: 'Majors', schema: REPORT },
    ),
])

phase('Verify')
const VERIFY = (round) =>
  `${CONTEXT}\n\nTASK: VERIFY THIS ROUND, ALONE. The fixers' reports: ${JSON.stringify([...blockers, cascade, names, ...majors].map((r) => r && { fixed: r.fixed, notFixed: r.notFixed })).slice(0, 8000)}\n1. Anything a fixer left in notFixed because it needed another agent's file: do it now.\n2. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Everything green; a red that passes alone with --last-failed --timeout 120000 --workers 1 is the machine — report both readings; a real red is fixed at its cause.\n3. Walk a full quote cold at 1440×900 and 834×1112: the picker (press a Highfield on the tablet), the configurator (the headline names the boat the way a person says it), a cascade, issue it, the paper (read what the customer reads), the register, History. Photograph each into docs/directions/<screen>/built/ and write docs/directions/m2-last${round}.md.\nReport the gate numbers and anything still wrong.`
await agent(VERIFY(''), { label: 'verify', phase: 'Verify', schema: REPORT })
const CRITIC = (round) =>
  `${CONTEXT}\n\nYou are a fresh critic who has never seen HL_2.0. Read-only except docs/directions/m2-last-critique${round}.md. Check the three blockers and the one change first from docs/directions/built-critique-m2-close-2.md — CLOSED or OPEN, with what you saw — then look for anything new this round broke. Serve it (npm run build && npx vite preview --port ${6591 + (round === '-2' ? 2 : 0)}) and drive a full quote at 1440×900, 834×1112 and 390×844, and read the printed paper. Findings with a screen and a severity; \`verdict\`: are the blockers gone and does every boat read the way a person says it?`
let critic = await agent(CRITIC(''), { label: 'critic', phase: 'Verify', schema: GAPS })
let serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  const by = {}
  for (const g of critic.gaps) (by[g.screen] = by[g.screen] || []).push(g)
  await parallel(
    Object.keys(by)
      .slice(0, 10)
      .map(
        (screen, i) => () =>
          agent(
            `${CONTEXT}\n\nTASK: answer a fresh critic (docs/directions/m2-last-critique.md — read it whole) on "${screen}": ${JSON.stringify(by[screen])}. Fix every blocker and major and the cheap minors, touching only that screen's files (say in notFixed anything needing another's). Ports ${6601 + i * 4}, ${6602 + i * 4}.`,
            { label: 'fix2:' + screen, phase: 'Verify', schema: REPORT },
          ),
      ),
  )
  await agent(VERIFY('-2'), { label: 'verify2', phase: 'Verify', schema: REPORT })
  critic = await agent(CRITIC('-2'), { label: 'critic2', phase: 'Verify', schema: GAPS })
  serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
}

return {
  names: names && names.fixed,
  critic: critic && {
    verdict: critic.verdict,
    serious: serious.map((g) => `${g.severity} | ${g.screen} | ${g.title}`),
  },
}
