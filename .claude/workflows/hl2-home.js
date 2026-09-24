export const meta = {
  name: 'hl2-home',
  description:
    "Redesign Home, the dealership's dashboard, which the owner is not happy with: find out why from his own words and the best dashboards, draw four directions on real content in the new component language, judge them, build the winner, and have a fresh critic say whether he would be happy",
  phases: [
    {
      title: 'Study',
      detail:
        'why he is not happy, what a dealer needs from the first screen, and the best dashboards',
    },
    {
      title: 'Design',
      detail: 'four directions drawn on real content, judged through three lenses',
    },
    {
      title: 'Build',
      detail: 'the winner, in the new component language, with its showpiece moment',
    },
    { title: 'Verify', detail: 'the gate alone, a fresh critic, a second pass if needed' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'
const STOCK = 'C:\\Users\\Asaf\\dev\\hl-refs\\ref'

const STUDY = {
  type: 'object',
  properties: {
    notesFile: { type: 'string' },
    why: { type: 'string' },
    jobs: { type: 'array', items: { type: 'string' } },
    patterns: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['notesFile', 'why', 'jobs', 'patterns', 'notes'],
}

const BOARDS = {
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

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    changed: { type: 'string' },
    notChanged: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['files', 'gateGreen', 'changed', 'notChanged', 'notes'],
}

const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          title: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['severity', 'title', 'detail'],
      },
    },
    wouldHeBeHappy: { type: 'string' },
  },
  required: ['gaps', 'wouldHeBeHappy'],
}

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is Northside Marine's quoting and configuration app, on its real Master Price File (53 tables, 15,691 rows; nothing invented). Home, at /, is the first screen a salesperson sees after the door, and the owner calls it the dashboard. Read docs/STATUS.md (top sections), docs/SCREENS.md (Home's row), CLAUDE.md (in your context), src/screens/home/ in full, docs/research/refs/home/notes.md and the entry and home boards under docs/directions/home/.

THE OWNER, 2026-09-24: "dashboard isn't right yet — not happy." Earlier, of the old app's home: "I saw the design of the new home dashboard. HATE IT." and "The bottom bar in that image is disgusting." And: "components are so bland and boring"; "tech stack looks SO BORING"; "it still feels like a database, it is not beautiful enough, it does not feel alive"; "I want the logo to be the showpiece thing"; "blue and white was the brief" and "a bit more colour usage please"; "simple wins. this app is complex topics made beautiful". The finish line: he hands the app to stakeholders with no UI or UX errors and does a full quote with a customer at the desk. The last critic of Home said he would "argue about Home", and called its drafts empty state "a wireframe … the weakest object on the best screen".

WHAT THE SCREEN CAN HONESTLY SHOW, and only this: what this browser holds — the quotes raised here with their state, their totals frozen at issue, their customers and the days they moved (src/domain/quote/register.ts, find.ts, diary/history.ts, diary/days.ts); the customers filed here (src/domain/people/customers.ts, book.ts); the price file itself, counted — its brands, its models, their pictures and Northside's own mark (src/domain/modules, the image readers). NO INVENTED FIGURE: no revenue chart, target, conversion rate or "trend" that the quotes in this browser do not carry, and on day one there are none — the empty state is the true state and it must be the MOST beautiful state, because it is the one every stakeholder sees first. Cost and margin never appear: a customer may be sitting beside the salesperson.

THE NEW COMPONENT LANGUAGE (hl2-components) is built: read src/ui, src/styles/tokens.css, src/ui/motion.ts, and look at /kit. Home is drawn in it. The owner's design skills in .claude/skills/ (emil-design-eng, apple-design, animate, animation-vocabulary, pick-ui-library) are the standard. A library he named is adopted and used well — motion, Phosphor icons, NumberFlow for counts that are not a price, GSAP and Lenis, and bolder tech where it earns its place (WebGL or a shader for an ambient ground, the View Transitions API between screens, Rive or Lottie for an authored moment) — with the only vetoes being a faked figure, cost on a customer surface, ignoring reduced motion, and breaking keyboard reach. No faked 3D boat: no maker publishes a real model.

THE RULES THAT DO NOT BEND: every value a token; text 4.5:1 on its real ground, over a photograph included; nothing drawn over anything else at rest or scrolled; every fact said once; every word the dealer's (docs/WORDS.md if it exists); the price figure never counts up; nothing moves while a caret is in a field; reduced motion honoured; keyboard reach with visible focus; a refusal is a sentence; the primary act never a floating bottom bar; it fits the window at 1280×800, 1440×900 and 1920×1080 and works at 390×844, 844×390 and 834×1112. It is Northside Marine's app and nobody else's.

Do NOT commit, push, checkout, reset or stash. Append decisions to docs/DECISIONS.md with one \`cat >> docs/DECISIONS.md <<'EOF'\` each.`

phase('Study')
const study = await parallel([
  () =>
    agent(
      `You are finding out WHY the owner of HL_2.0 is not happy with Home, and what a salesperson needs from the first screen of the day.\n\n${CONTEXT}\n\n1. Serve the app (npm run build && npx vite preview --port 6401), walk through the door cold, and look at Home at every size, on day one (nothing filed) and after a quote has been raised, issued and a customer filed (walk it; never plant data). Photograph each state into docs/research/refs/home2/now/.\n2. Read every word the owner has said about a home screen or dashboard: docs/PLAN.md's standing rules, the old repository's docs (C:\\Users\\Asaf\\dev\\HL_Playground\\docs — grep dashboard, home, "HATE", "bottom bar"), and the original HelmLogic's dashboard (C:\\Users\\Asaf\\dev\\HelmLogic — its dashboard pages and the Yamaha-style grouping the plan names).\n3. Write, plainly: why Home is not right today (name each thing on it that is dull, confusing, empty in the wrong way, or not useful), and THE JOBS the first screen must do for a Northside salesperson at 8am and with a customer walking in — in order of how often they happen. Keep it to what this app can honestly carry. Write docs/research/refs/home2/why.md.`,
      { label: 'study:why', phase: 'Study', schema: STUDY },
    ),
  () =>
    agent(
      `You are running the reference sweep for the dashboard of HL_2.0 — the first screen of a boat dealer's day.\n\n${CONTEXT}\n\nCAPTURE with npx tsx tools/research/capture.ts home2/<modality> <list.json> (read the tool first; never sign in, never create an account, never type personal data; consent banners get the most privacy-preserving answer). At most 45 frames; open at most 40. Home's first sweep leaned on boat builders' home pages (docs/research/refs/home/notes.md) — do not repeat it. DRIVE DASHBOARDS THAT PEOPLE LOVE, and the best "first screen of the day": Linear's inbox and My Issues, Stripe's dashboard home (public screenshots and docs), Shopify admin's home, Tesla's and Rivian's app home screens (press pages), Porsche's My Porsche, Apple's Fitness summary and Home app (apple.com), Things 3's Today, Superhuman's split inbox, Arc's new tab, Raycast's root, Vercel's dashboard, Robinhood's home, Monzo's and Revolut's home screens, Family wallet, Airbnb's host Today, Toast or Square's dealer-facing dashboards, dealership management systems' home screens where public (DealerSocket, Lightspeed EVO, CDK), and a few showpiece dashboards on godly.website, recent.design and dribbble's best-of that are more than decoration. For each: what the first screen answers in one glance, what it does when there is nothing yet, how it uses one photograph or one number as the hero, how it makes starting the main job one press, and what makes it feel alive (motion, light, a live element, a time-of-day greeting done well). Say what would suit a boat dealership and what would not. Write docs/research/refs/home2/notes.md (under 2,500 words, the shape the other sweeps use, named patterns with the frame that shows each) and sources-index.md.`,
      { label: 'study:sweep', phase: 'Study', schema: STUDY },
    ),
])
log(
  'study: ' +
    study
      .filter(Boolean)
      .map((s) => s.why.slice(0, 80))
      .join(' · '),
)

phase('Design')
const boards = await agent(
  `You are designing Home for HL_2.0 — the dealership's dashboard — and you are drawing, not building.\n\n${CONTEXT}\n\nREAD FIRST: docs/research/refs/home2/why.md and notes.md (written this round), and look at /kit (npm run build && npx vite preview --port 6411).\n\nDRAW FOUR DIRECTIONS, each a genuinely different COMPOSITION and a different ORDER AND GROUPING of the content — never the same stack on a different ground — and each answering the jobs in why.md in its own order. Each is a self-contained HTML board at 1440×900 in docs/directions/home2-boards/, drawn in the new component language (copy its tokens and draw its components as /kit draws them), on REAL content: Northside's own mark if it is held (data/northside/marks-ledger.json), its real brands with their marks and held photographs (public/brand-marks, public/hero-images, public/seed-images), and real quotes as the walk would leave them — draw each direction TWICE: on DAY ONE, with nothing filed, which must be the most beautiful state; and a WEEK IN, with the quotes, customers and days a real week would hold, taken only from what the engine can produce (read e2e/mint.ts; never invented totals — mint them with the engine or leave the figure out). Each board also at 390×844. Show the showpiece moment live on the board (the first paint, the greeting, the one act) with CSS motion, and name any bolder tech it uses (a shader ground, a view transition into the picker, a Rive or Lottie moment) and why. In a strip under each: its idea in one sentence, the jobs in the order it answers them, how it reflows at 390 / 834 / 1920, and how it differs in silhouette from the quotes register, the sheet and Data (look at docs/directions/*/built/). Write docs/directions/home2-boards/canvas.json in the shape tools/research/board.ts reads, run npx tsx tools/research/board.ts home2-boards and npx tsx tools/research/shots.ts home2-boards (read both tools first), and LOOK at every shot. Budget: open at most 30 pictures. Change nothing under src/.`,
  { label: 'design:boards', phase: 'Design', schema: BOARDS },
)
const pick = boards
  ? await agent(
      `You are judging four directions for HL_2.0's Home — the dealership's dashboard — through three lenses at once, scoring each 1–10 on each:\n- THE OWNER, who said "dashboard isn't right yet — not happy", who HATED the last one he saw, and who wants it "insanely beautiful", alive, with more colour, his logo as the showpiece, and simple. Would he be HAPPY with it — not merely not unhappy?\n- THE SALESPERSON at 8am and with a customer walking in: does the first glance answer what they need, and is starting a quote one press?\n- THE DESIGNER: hierarchy, honesty of every figure, the day-one state, the silhouette against the other screens, and whether it holds at 390px and at 1920px.\n\n${CONTEXT}\n\nTHE BOARDS: ${JSON.stringify(boards.boards)}. Open every board's 1440 and 390 shots, both states (day one and a week in), and docs/research/refs/home2/now/ for what is being replaced. Return per-board scores with a why, \`pick\` (highest sum; a tie goes to the simpler board, then to the owner), \`graft\` (the one idea from a losing board the winner must steal) and \`mustChange\` (the one thing to change before it is built). Flattery costs him money. Change nothing.`,
      { label: 'design:judge', phase: 'Design', schema: PICK },
    )
  : null
log('home: ' + (pick ? pick.pick : 'none'))

phase('Build')
const BUILD = (extra) =>
  `You are building Home for HL_2.0 — the dealership's dashboard — from a judged direction.\n\n${CONTEXT}\n\nTHE DIRECTION: ${JSON.stringify(pick)}. The boards: ${JSON.stringify(boards && boards.boards)}. Open the winning board's shots and HTML under docs/directions/home2-boards/ and docs/research/refs/home2/why.md before you write a line.\n\n${extra}\n\nBuild it in src/screens/home/, replacing the drawing and keeping what the tests pin that is still true: the first-visit rule, the counted file, the way to the door when no price file is open, every act reaching the screen it names. Every figure through src/domain (a derivation missing there is added with its test); every control from src/ui; motion from src/ui/motion.ts; icons from Phosphor. Make the day-one state the most beautiful one. Make the showpiece moment land. Component tests by role and text; e2e/flows/home.spec.ts follows every act to its address at six viewports and asserts the page fits 800 in 800, 900 in 900 and 1,080 in 1,080. Update Home's row in docs/SCREENS.md (its direction, references and measured figures) by a targeted edit. GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run; npx tsx tools/check.ts; npm run build; HL2_PREVIEW_PORT=6421 npx playwright test e2e/flows/home.spec.ts e2e/rulers -g "home" --workers 1. Look at Home at 1440×900, 1280×800, 1920×1080, 834×1112 and 390×844, day one and a week in, and save the shots to docs/directions/home/built/.`
const built = await agent(BUILD(''), { label: 'build:home', phase: 'Build', schema: REPORT })

phase('Verify')
const CRITIC = (round) =>
  `You are a fresh critic who has never seen HL_2.0, judging its Home — the dealership's dashboard — as its owner would. Read-only except docs/directions/home2-critique${round}.md.\n\n${CONTEXT}\n\nServe it (npm run build && npx vite preview --port ${6431 + (round === '-2' ? 4 : 0)}), walk through the door cold, and look at Home on day one, then after raising and issuing a quote and filing a customer — at 1440×900, 1280×800, 1920×1080, 834×1112 and 390×844. Press everything on it. Findings with a severity (blocker: an invented figure; cost or margin; something that does nothing; overlap; text under 4.5:1; a page that does not fit a desk window it claims to; the day-one state looks broken or empty in the wrong way. major: anything the owner would name in the first ten seconds; a job from docs/research/refs/home2/why.md it does not do; motion on the price, while typing or under reduced motion; a word a dealer would not use; a fact said twice. minor: craft). Then \`wouldHeBeHappy\`: would the owner be HAPPY — not merely not unhappy — and if not, the one thing to change.`
let critic = await agent(CRITIC(''), { label: 'critic', phase: 'Verify', schema: GAPS })
let serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
if (serious.length > 0) {
  await agent(
    BUILD(
      `A FRESH CRITIC HAS LOOKED AT WHAT YOU BUILT (docs/directions/home2-critique.md — read it whole) and found: ${JSON.stringify(critic.gaps)}. Its verdict: ${critic.wouldHeBeHappy}. Answer every blocker and major and the cheap minors, keeping the direction's idea.`,
    ),
    { label: 'build:home-2', phase: 'Verify', schema: REPORT },
  )
  critic = await agent(CRITIC('-2'), { label: 'critic2', phase: 'Verify', schema: GAPS })
  serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
}
const gate = await agent(
  `You are closing the Home redesign of HL_2.0, alone.\n\n${CONTEXT}\n\nTHE FULL GATE: npm test; npm run build; npm run e2e. Everything green; a red that passes alone with --last-failed --timeout 120000 --workers 1 is the machine — report both readings; a real red is fixed at its cause. Then prepend a short dated section to docs/STATUS.md: what Home is now, its direction, what was measured on it, and the critic's last verdict in its own words. Report the gate.`,
  { label: 'gate', phase: 'Verify', schema: REPORT },
)

return {
  pick,
  built,
  critic: critic && {
    wouldHeBeHappy: critic.wouldHeBeHappy,
    serious: serious.map((g) => `${g.severity} | ${g.title}`),
  },
  gate,
}
