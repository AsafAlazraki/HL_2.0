export const meta = {
  name: 'hl2-components',
  description:
    'Give HL_2.0 a component language with character: audit every control, sweep the best component systems, draw three kits on real content, judge them, build the winner in src/ui with icons, materials and motion, adopt it on every screen, and have a fresh critic say whether it is still bland',
  phases: [
    {
      title: 'Study',
      detail: 'every control in the app, the owner’s skills, and the best component systems',
    },
    { title: 'Design', detail: 'three kits drawn on real content, judged through three lenses' },
    { title: 'Build', detail: 'the kit in src/ui, its specimen page, its motion' },
    { title: 'Adopt', detail: 'every screen takes the kit, two at a time' },
    {
      title: 'Verify',
      detail: 'the gate alone, photographs, a fresh critic, a second pass if needed',
    },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'
const STOCK = 'C:\\Users\\Asaf\\dev\\hl-refs\\ref'

const STUDY = {
  type: 'object',
  properties: {
    notesFile: { type: 'string' },
    controls: { type: 'integer' },
    why: { type: 'string' },
    patterns: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['notesFile', 'controls', 'why', 'patterns', 'notes'],
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

const CONTEXT = `CONTEXT. HL_2.0 (repo: ${NEW}) is Northside Marine's quoting and configuration app, on its real Master Price File; nothing in it is invented. Read docs/STATUS.md (top sections), docs/SCREENS.md, docs/PLAN.md § "The technology stance" and § "UI kit rules", docs/CUSTOMISATION.md, and CLAUDE.md (in your context).

THE OWNER, 2026-09-24, looking at the app in the browser: "components are so bland and boring...". His standing words: "it still feels like a database, it is not beautiful enough, it does not feel alive"; "insanely beautiful"; "blue and white was the brief" and "a bit more colour usage please"; "I want the logo to be the showpiece thing"; and, the same week, "simple wins. this app is complex topics made beautiful". SIMPLE STRUCTURE, RICH CRAFT: character comes from materials, light, icons, type and motion, never from more things on the screen.

WHY IT IS BLAND, measured before this round was written: the libraries the owner named are installed and almost unused — motion in 1 file, @phosphor-icons/react in 1 file, @number-flow/react in 1, gsap and lenis in 0, lucide-react in 0 — so every screen is text in boxes: almost no icons, almost nothing moves, flat fills. The plan promised the opposite (docs/PLAN.md § "The technology stance": "Showroom takes the expressive libraries directly: magicui and reactbits components where a section calls for them — text reveals, shiny/gradient text, spotlight and tilt cards, dock, marquee, border beam, progressive blur, animated beam … GSAP + ScrollTrigger and Lenis for the chaptered scroll … motion for shared elements"; § "Motion choreography for the flow": the picker tile's photograph → the configurator's stage → the finale's boat → the document's cover, routes crossfading, the foot pill's dash filling). THE OWNER, AGAIN, THE SAME DAY: "tech stack looks SO BORING". Read that as what the app visibly USES being safe and flat. So this round also brings in the bolder front-end tech the plan promised and never used, wherever it earns its place, each with a reduced-motion fallback: a WebGL or shader ground (for example water light behind the door, Home or a brand mark — decoration on a Showroom screen is allowed, a faked figure is not); the View Transitions API for route and shared-element transitions (the picker photograph becoming the configurator stage becoming the document cover); GSAP with ScrollTrigger and Lenis for the configurator's chaptered scroll; Rive or Lottie for one authored moment (the mark's reveal, the quote being issued); the magicui and reactbits effects the plan names, ported natively — never a faked 3D boat, because no maker publishes a real model. INSTALLED IS NOT ADOPTED. A library the owner names is adopted and used well; the only vetoes are faking a figure, cost on a customer surface, ignoring reduced motion, and breaking keyboard reach.

THE OWNER'S OWN DESIGN SKILLS ARE IN THIS REPO AND ARE THE STANDARD: .claude/skills/emil-design-eng/SKILL.md (component polish and the invisible details), apple-design/SKILL.md (materials, depth, springs, typography), animate/SKILL.md (building an animation in the right order), animation-vocabulary/SKILL.md (naming effects), find-animation-opportunities/SKILL.md, review-animations/SKILL.md, pick-ui-library/SKILL.md (his library picks), ask-sonner/SKILL.md. Read the ones your task touches.

THE RULES THAT DO NOT BEND, whatever the kit looks like: every colour, face, size, space, radius, shadow, easing and duration is a token in src/styles/tokens.css (tools/check.ts refuses a literal colour, an undeclared token, anything under 11px); text clears 4.5:1 on its real ground, over a photograph included; the PRICE FIGURE NEVER COUNTS UP and never animates on an issued document (NumberFlow is for counts that are not the price); nothing moves while a caret is in a text field; reduced motion keeps colour and opacity and removes movement; every control is reachable by keyboard with a visible focus; a refusal is a sentence, never a disabled control; nothing is drawn over anything else at rest or scrolled; controls in src/ui refuse className and style, so a screen cannot fork a primitive's look; Northside can change its own mark, accent and pictures from its settings and the kit must stay designed when it does. It is Northside Marine's app: nothing is built for anyone else.

Do NOT commit, push, checkout, reset or stash. Append decisions to docs/DECISIONS.md with one \`cat >> docs/DECISIONS.md <<'EOF'\` each.`

phase('Study')
const study = await parallel([
  () =>
    agent(
      `You are auditing every control in HL_2.0 to say exactly why it reads as bland.\n\n${CONTEXT}\n\nList every kind of control and surface the app draws: the primitives in src/ui (Button, Tile, Field, Input, Select, Menu, Popover, Dialog, Tooltip, Kbd, Figure, PriceFigure, Refusal, Toaster) AND every control a screen draws for itself in its own stylesheet (grep src/screens/**/*.css for chips, tiles, pills, rows, tabs, segmented choices, toggles, cards, panels, band heads, the pill, the finder). Serve the app (npm run build && npx vite preview --port 6201), open every screen the way e2e/routes.ts says to reach it, and photograph each kind of control in its states — rest, hover, pressed, focused, selected, refused — at 1440×900, into docs/research/refs/components/audit/. For each, say what makes it bland: a flat fill, no icon where one would read faster, no state change on press, no depth, no motion, colour used for nothing, type doing all the work. Write docs/research/refs/components/audit.md: the inventory, the photographs, and the ten things that would change the app's feel most. Count the controls in \`controls\`. Change nothing else.`,
      { label: 'study:audit', phase: 'Study', schema: STUDY },
    ),
  () =>
    agent(
      `You are running the reference sweep for HL_2.0's component language — the controls every screen draws with.\n\n${CONTEXT}\n\nCAPTURE with npx tsx tools/research/capture.ts components/<modality> <list.json> (read the tool first; never sign in, never create an account, never type personal data, answer consent banners with the most privacy-preserving choice). At most 45 frames, and open at most 40. DRIVE: Linear (its buttons, its command menu, its status icons and their motion), Raycast (the launcher and its rows), Arc (sidebar and tabs), Vercel's Geist system (docs pages), Stripe's dashboard and Checkout (the best payment controls on the web), Apple's Human Interface Guidelines pages for materials, buttons, toggles and segmented controls, and the macOS and visionOS pages on apple.com (glass and depth done properly), Family (the wallet, famous for its motion), Things 3's site, Craft, Framer's site, Rauno Freiberg's and Emil Kowalski's sites and their open work (Vaul, Sonner — the ask-sonner skill has the details), Paco Coursey's cmdk demo, magicui.design and reactbits.dev (the component galleries the plan names — border beam, shimmer, spotlight, animated beam, marquee, number ticker, dock), Aceternity UI, and the best boat and car configurators' own controls in the stock at ${STOCK} (Porsche's option tiles and chips, Saxdor's toggles, Axopar's step pills). For each, say what gives the control character — a material, a light edge, an icon, a spring, a sound-alike click in motion, a colour used as signal — and whether it would suit a boat dealer's showroom and his desk. Write docs/research/refs/components/notes.md (under 2,500 words, the shape the other sweeps use, with named patterns and the frame that shows each) and sources-index.md.`,
      { label: 'study:sweep', phase: 'Study', schema: STUDY },
    ),
])
log(
  'study: ' +
    study
      .filter(Boolean)
      .map((s) => s.notesFile)
      .join(' · '),
)

phase('Design')
const boards = await agent(
  `You are designing HL_2.0's component language, and you are drawing, not building.\n\n${CONTEXT}\n\nREAD FIRST: docs/research/refs/components/audit.md and notes.md (written this round), the owner's design skills named above, and src/styles/tokens.css.\n\nDRAW THREE KITS, each a genuinely different CHARACTER — for example (not a prescription): instrument-precise, the way a marine chartplotter or a fine watch is; glass and light over the boats' own photographs, the way Apple's materials are; and bold signal, blue and white with the amber act as the one loud thing. Each kit is ONE self-contained HTML board at 1440×900 in docs/directions/components-boards/, with the same set of components drawn in it, IN THEIR STATES, on REAL CONTENT from data/northside/ (a Highfield SP560 and a Stacer 529 Assault Pro, their real prices and pictures from public/seed-images and public/hero-images): the primary act; a secondary and a quiet act; a chip and a segmented choice (Cash / Trade); a toggle; a field with its label and a refusal sentence; a select; an option tile with its price delta (a motor); a register row; a chapter head with its count and subtotal; a panel or sheet; the floating pill with its doors and icons; the finder row; a price figure; an undo toast; a brand mark plate. Put ICONS from Phosphor where they make a thing read faster (inline SVG copied from @phosphor-icons in node_modules). Each kit must also show at least ONE moment of the bolder tech named above, live on the board (a shader ground, a view transition, a scroll-driven chapter, an authored reveal), and say what it would cost in bytes and on a phone. Show MOTION with CSS on the board itself — hover and press every control, and describe the springs, durations and the route and shared-element transitions in a strip under the board. Draw each on the dark ground AND with one component group over a real photograph. Each board also at 390×844. Every colour from the tokens or ADDED as a token with its reason (a kit may add materials, gradients, highlights and shadows — that is the point — but each is a token). Write docs/directions/components-boards/canvas.json in the shape tools/research/board.ts reads, run npx tsx tools/research/board.ts components-boards and npx tsx tools/research/shots.ts components-boards (read both tools first), and LOOK at every shot. Budget: open at most 25 pictures. Change nothing under src/.`,
  { label: 'design:boards', phase: 'Design', schema: BOARDS },
)
const pick = boards
  ? await agent(
      `You are judging three component kits for HL_2.0 through three lenses at once, scoring each 1–10 on each:\n- THE OWNER, who looked at the app and said "components are so bland and boring...", who has rejected five redesigns on sight, and whose words are "insanely beautiful", "it does not feel alive", "blue and white was the brief", "a bit more colour usage please", "simple wins". Which kit would make him stop saying bland?\n- THE DEALER at the desk with a customer beside him: which kit makes it most obvious what to press, what is chosen, and what happened — at a glance, on a tablet as well as a laptop?\n- THE DESIGNER: craft, consistency, restraint where it matters, contrast on every ground, whether it survives Northside changing its own accent and pictures, and whether it is a system rather than a set of effects.\n\n${CONTEXT}\n\nTHE BOARDS: ${JSON.stringify(boards.boards)}. Open every board's 1440 and 390 shot (the Read tool renders PNGs), and the canvas at docs/directions/components-boards/canvas.html if you need to see a state. Also look at a few of docs/research/refs/components/audit/ for what is being replaced. Return per-board scores with a why; \`pick\` (highest sum; a tie goes to the simpler kit, then to the owner's lens); \`graft\` (one idea from a losing kit the winner must steal); \`mustChange\` (one thing about the pick to change before it is built). Flattery costs him money. Change nothing.`,
      { label: 'design:judge', phase: 'Design', schema: PICK },
    )
  : null
log('kit: ' + (pick ? pick.pick : 'none'))

phase('Build')
const kit = await agent(
  `You are building HL_2.0's component language into src/ui.\n\n${CONTEXT}\n\nTHE CHOSEN KIT: ${JSON.stringify(pick)}. The boards: ${JSON.stringify(boards && boards.boards)}. Open the winning board's shots and HTML under docs/directions/components-boards/ before you write a line, and read docs/research/refs/components/audit.md and notes.md.\n\nBUILD:\n1. TOKENS: the kit's materials, light, gradients, depths, highlights, icon sizes, and a motion vocabulary (named springs and durations for press, hover, enter, exit, layout and route) in src/styles/tokens.css, each with where it came from; and src/ui/motion.ts extended to hand those to motion, with reduced motion honoured in one place.\n2. THE PRIMITIVES in src/ui — Button (primary, secondary, quiet, with an optional Phosphor icon, a real press state, and refusedBecause), Tile, Chip, Segmented, Toggle, Field, Input, Select, Menu, Popover, Dialog (and a Sheet if the kit has one), Tooltip, Kbd, Figure, PriceFigure (never counts up), Refusal, Toaster (Sonner, the ask-sonner skill), and an Icon wrapper over @phosphor-icons/react — redrawn in the kit, with every state, every one keyboard-reachable with a visible focus, each still refusing className and style. Add the primitives the audit found screens drawing for themselves over and over (for example a band head, an option row, a stat) so screens stop forking them. Component tests by role and text for each, and the existing ones kept green.\n3. MOTION THAT MEANS SOMETHING, with motion: press and hover on every control; enter and exit on every panel, menu and dialog, exits faster than entries; layout motion when a list reorders or a chapter opens; route transitions keyed on location; and the plan's shared elements — the picker's photograph to the configurator's stage to the document's cover — if the kit calls for them. Never on the price figure, never while a caret is in a field, and off under reduced motion except colour and opacity.\n4. A SPECIMEN AT /kit: a route that draws every primitive in every state on real content, on the dark ground and over a photograph, at every size — for the owner to see the language whole, and for the rulers (join e2e/routes.ts as a foundation screen) so the kit itself faces contrast, overlap and cut at six viewports.\nGATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run; npx tsx tools/check.ts; npm run build; HL2_PREVIEW_PORT=6211 npx playwright test e2e/rulers -g "kit" --workers 1. Look at /kit at 1440×900 and 390×844. Ports 6211, 6212.`,
  { label: 'build:kit', phase: 'Build', schema: REPORT },
)

phase('Adopt')
const GROUPS = [
  {
    key: 'door-and-shell',
    screens:
      'entry (src/screens/entry), Lost (src/screens/lost), and the shell — the pill and the finder (src/screens/shell). NOT Home: it is redesigned in the next round, hl2-home, in this language',
  },
  {
    key: 'the-sale',
    screens:
      "the picker (src/screens/picker) and the configurator (src/screens/configurator) — the showroom, where the plan's shared element from the picker's photograph to the configurator's stage lives",
  },
  {
    key: 'decide-and-paper',
    screens:
      'the cascade (src/screens/cascade) and the document (src/screens/document) — on the document, only what shows on screen changes; the printed page stays paper',
  },
  {
    key: 'registers',
    screens:
      'the quotes register (src/screens/quotes), history (src/screens/history) and customers (src/screens/customers)',
  },
  { key: 'the-file', screens: 'data (src/screens/data) and the sheet (src/screens/sheet)' },
]
await parallel(
  GROUPS.map(
    (g, i) => () =>
      agent(
        `You are bringing HL_2.0's new component language onto real screens.\n\n${CONTEXT}\n\nTHE KIT IS BUILT: read src/ui, src/styles/tokens.css and src/ui/motion.ts, and LOOK at /kit (npm run build && npx vite preview --port ${6221 + i * 4}) — it is the language. The builder's report: ${JSON.stringify(kit).slice(0, 4000)}\n\nYOUR SCREENS: ${g.screens}.\n\nFor each: replace every control the screen draws for itself with the kit's primitive (or, where it is genuinely the screen's own, restyle it with the kit's tokens so it speaks the same language); put a Phosphor icon wherever it makes a thing read faster and nowhere it is decoration; give every act its press, every panel its entry and exit, every list its layout motion, per the kit's motion vocabulary; and make the screen's showpiece moment land (the door opening, the first paint of the configurator, a chapter opening, the A4 sheet arriving, a brand's mark). Keep each screen's own idea and composition — this is a new language, not a redesign. Keep every honest sentence, count and refusal. Look at each screen at 1440×900, 1280×800 and 390×844 before and after; save the after shots to docs/directions/<screen>/built/<screen>-<w>x<h>.png. GATE: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; ONLY your screens' flows and rulers (HL2_PREVIEW_PORT=${6223 + i * 4} npx playwright test e2e/flows/<screen>.spec.ts e2e/rulers -g "<route>" --workers 1). Touch only your screens' files; if a primitive needs a change, say so in notChanged rather than editing src/ui — another agent is working beside you.`,
        { label: 'adopt:' + g.key, phase: 'Adopt', schema: REPORT },
      ),
  ),
)

phase('Verify')
const VERIFY = (round) =>
  `You are verifying HL_2.0's new component language across the whole app, alone.\n\n${CONTEXT}\n\n1. Every primitive change an adopter asked for in notChanged: make it once in src/ui, for every screen.\n2. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Everything green; a red that passes alone with --last-failed --timeout 120000 --workers 1 is the machine — report both readings; a real red is fixed at its cause.\n3. Measure that the libraries are ADOPTED, not installed: count the files importing motion, @phosphor-icons/react, @number-flow/react, gsap, lenis and any bolder tech this round brought in (a shader or WebGL ground, view transitions, Rive or Lottie), say where each earns its place, and measure the bundle each one added and the frame rate of each ambient effect on a phone-sized viewport (throttle the CPU 4× in the browser tools).\n4. Photograph every screen at 1440×900 and 390×844 into docs/directions/<screen>/built/ and write docs/directions/components${round}.md: per screen, what the language changed.\nReport the gate and the counts.`
const verify = await agent(VERIFY(''), { label: 'verify', phase: 'Verify', schema: REPORT })

const CRITIC = (round) =>
  `You are a fresh critic of HL_2.0 who has never seen it, judging ONE question: is it still bland? Read-only except docs/directions/components-critique${round}.md.\n\n${CONTEXT}\n\nServe it yourself (npm run build && npx vite preview --port ${6291 + (round === '-2' ? 4 : 0)}) and DRIVE it — press things, hover things, open things, walk a full quote from the door to the document — at 1440×900, 834×1112 and 390×844. Look at /kit. For every screen: does it feel alive, does pressing things feel like pressing things, is colour doing work, are there icons where they help, does anything move that should not, is the price figure still, is it beautiful — or is it still text in boxes? Findings with a screen and a severity (blocker: a screen the owner would still call bland; motion on the price, under reduced motion, or while typing; a control with no visible focus; text under 4.5:1. major: a control still drawn the old way; an icon that is decoration; motion that fights the task; a showpiece moment that does not land. minor: craft). Then \`stillBland\`: would the owner still say "components are so bland and boring", and if so, where first?`
let critic = await agent(CRITIC(''), { label: 'critic', phase: 'Verify', schema: GAPS })
let serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
log('critic: ' + serious.length + ' serious')
if (serious.length > 0) {
  const by = {}
  for (const g of critic.gaps) (by[g.screen] = by[g.screen] || []).push(g)
  await parallel(
    Object.keys(by)
      .slice(0, 14)
      .map(
        (screen, i) => () =>
          agent(
            `You are answering a critic who says part of HL_2.0 is still bland.\n\n${CONTEXT}\n\nTHE CRITIQUE: docs/directions/components-critique.md — read it whole. YOUR SCREEN: ${screen}. Found on it: ${JSON.stringify(by[screen])}\n\nFix every blocker and major and the cheap minors, in the kit's language (src/ui, tokens, motion) — touch src/ui only if the finding is about a primitive and say so. Look at the screen at 1440×900 and 390×844 before and after. Gate as the adopters did (ports ${6301 + i * 4}, ${6302 + i * 4}), only your screen's flows and rulers.`,
            { label: 'fix:' + screen, phase: 'Verify', schema: REPORT },
          ),
      ),
  )
  await agent(VERIFY('-2'), { label: 'verify2', phase: 'Verify', schema: REPORT })
  critic = await agent(CRITIC('-2'), { label: 'critic2', phase: 'Verify', schema: GAPS })
  serious = ((critic && critic.gaps) || []).filter((g) => g.severity !== 'minor')
  log('critic2: ' + serious.length + ' serious')
}

return {
  pick,
  kit,
  verify,
  critic: critic && {
    stillBland: critic.stillBland,
    serious: serious.map((g) => `${g.severity} | ${g.screen} | ${g.title}`),
  },
}
