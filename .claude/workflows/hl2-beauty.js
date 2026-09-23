export const meta = {
  name: 'hl2-beauty',
  description:
    'The beauty and usability sweep: eight lenses over every screen at every size, a clueless-user walk, synthesis, per-screen polish, and the final gate',
  phases: [
    {
      title: 'Shots',
      detail:
        'one pass that photographs every screen at every viewport, once, for everybody else to read',
    },
    { title: 'Judge', detail: 'eight independent lenses over the whole app' },
    {
      title: 'Synthesis',
      detail: 'one editor turns eight reports into a ranked, deduplicated work list',
    },
    {
      title: 'Polish',
      detail:
        'per-screen fixes, two at a time, then re-photographed and re-scored; a second polish on anything still serious',
    },
    { title: 'Close', detail: 'the final gate, the review guide, and the honest verdict' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\Desktop\\HL 2.0'

const FINDINGS = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    verdict: { type: 'string' },
    score: { type: 'integer' },
    best: { type: 'array', items: { type: 'string' } },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          viewport: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          title: { type: 'string' },
          detail: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['screen', 'severity', 'title', 'detail', 'fix'],
      },
    },
  },
  required: ['lens', 'verdict', 'score', 'best', 'findings'],
}

const WORKLIST = {
  type: 'object',
  properties: {
    screens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          count: { type: 'integer' },
          headline: { type: 'string' },
          work: { type: 'string' },
        },
        required: ['screen', 'count', 'headline', 'work'],
      },
    },
    appWide: { type: 'array', items: { type: 'string' } },
    theOneThing: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['screens', 'appWide', 'theOneThing', 'summary'],
}

const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    gateGreen: { type: 'boolean' },
    changed: { type: 'string' },
    notChanged: { type: 'string' },
    notes: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'gateGreen', 'changed', 'notChanged', 'notes', 'blockers'],
}

const RESCORE = {
  type: 'object',
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lens: { type: 'string' },
          before: { type: 'integer' },
          after: { type: 'integer' },
          why: { type: 'string' },
        },
        required: ['lens', 'before', 'after', 'why'],
      },
    },
    remaining: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          screen: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          title: { type: 'string' },
          detail: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['screen', 'severity', 'title', 'detail', 'fix'],
      },
    },
    worse: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['scores', 'remaining', 'worse', 'summary'],
}

const STATE = `THE END GOAL, in the owner's own words (2026-09-23), which every round builds towards and the last round tests: \"when you are done, i need to be able to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enough experience to do so sitting with a customer and it is beautiful and so configurable in the backend and the output can be sent to a customer after downloaded and things and be so beautiful\". Five things define done: stakeholder-ready from a link; NO UI and UX errors; a full quote good enough to drive live beside a buyer; configurable in the backend without a developer; and a downloaded quote a dealer would proudly send. EVERYTHING IS BUILT BEFORE IT IS JUDGED: the owner's words, \"all of it has to be built before we get there!\" — no screen, panel or capability is left for the acceptance round to discover missing.

IT IS NORTHSIDE MARINE'S APP, AND SIMPLE WINS. The owner, 2026-09-23: "this is a northside marine app yeah so we can remove the unnecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beautiful." Build nothing for a hypothetical second dealership, a second organisation or a business with no price file. When two designs both work, the simpler one wins. Every screen's job is to take a complex topic — a price file of 15,691 rows, 8,679 pairings, a ladder of price levels, a rule that excludes a motor — and make it clear and beautiful, never to show how complex it is.

THE APP. Repo (cwd): ${NEW}. HL_2.0 is a rebuilt quoting and configuration app for Northside Marine, a boat dealership in Brisbane. It is finished: roughly twenty-three screens across the whole business — the door, home, the model picker, the configurator, the cascade, the A4 document, the quotes register, the sheet, history, data, customers, rules, fitment, review, levels, places, manage, the shelf, templates, the map, the pipeline, Lost, and a shell (a floating pill over every screen with a Ctrl K finder). Its data is one real dealership's Master Price File: 53 tables, 15,691 rows, 8,679 pairings, 329 held photographs and seventeen brand marks. No figure, customer, quote or picture in it is invented.

READ FIRST: docs/STATUS.md, CLAUDE.md (in your context), docs/SCREENS.md (every screen, what only it does, its references, its status) and docs/CUSTOMISATION.md.

THE OWNER IS ABOUT TO LOOK AT IT FOR THE FIRST TIME. He has rejected five redesigns of the old app on sight. His words, which are the standard this sweep judges against:
- "it still feels like a database, it is not beautiful enough, it does not feel alive, it is still too complicated"
- "genuinely awful design" · "Configurator still sucks" · "More like Porsche the right side, not less. STUDY IT."
- "the tables — still too complicated and hard to use visually"
- "I want the logo to be the showpiece thing"
- "blue and white was the brief" and "a bit more colour usage please"
- "i can't stress enough how easy this system has to be to use" · "we are supposed to be taking a complicated thing and making it super super easy"
- "all of the same functionality, presented beautifully"
- "the bottom bar in that image is disgisting" (on a page-level action bar)
- on imagery: "imagery is insanely important… you gotta find the right ones"
- the acceptance persona: "you will pretend to be a very clueless user and screenshot things and test it" — a boat dealer's sales manager who reads nothing; if they get stuck, the app is wrong.

WHAT THE RULERS ALREADY GUARANTEE, so do not spend your budget re-measuring it: every text node clears 4.5:1 on its real ground at six viewports, nothing overlaps, nothing is cut mid-word, no register is under its row requirement, nothing is under 11px, no literal colour or undeclared token is in any stylesheet, and no cost column reaches a customer surface. THOSE ARE THE FLOOR, NOT THE CEILING. A screen can pass every ruler and still be ugly, lifeless, generic or exhausting, and finding exactly that is this sweep's whole job.`

const SHOTS_DIR = 'docs/directions/beauty'

const LENSES = [
  {
    key: 'typography',
    title: 'Type and hierarchy',
    brief: `YOUR LENS: TYPE. Read every screen as a typographer. Scale contrast between the largest and smallest thing on each screen, and whether the biggest thing is the thing that matters. Measure (line length) — is anything running past 75 characters or squeezed under 40? Leading against size. Weight used as hierarchy versus size used as hierarchy, and whether the app is consistent about which. Tabular figures wherever figures line up. The mono face where a code or a reference is, and never where prose is. Optical alignment at the start edge of a column. Orphans and widows in a heading. Where a screen is typographically anonymous — it could be any SaaS product — and where it has a voice.

TWO STANDING TENSIONS you must judge, not duck: the old spec demanded six times scale contrast on a showroom screen and the owner called the six-times head "awful", so the right answer is the one that reads best and you must say what it is per screen; and this app writes in full sentences everywhere, which is a deliberate voice — say where that voice is doing work and where it has become a wall of prose somebody will not read.

Load the skill \`.claude/skills/apple-design/SKILL.md\` for its typography section and use it, and read src/styles/tokens.css for the faces and steps the app actually declares.`,
  },
  {
    key: 'colour',
    title: 'Colour, light and material',
    brief: `YOUR LENS: COLOUR AND LIGHT. The owner said "blue and white was the brief" and "a bit more colour usage please", and the app is drawn dark. Judge whether that is a beautiful answer to his brief or a drift away from it, and say so plainly.

Read: the ramp — how many greys are actually in use and do they step evenly; whether the accent is doing one job or five; where colour carries MEANING (a state, a warning, a rung) and whether that meaning is consistent app-wide or re-invented per screen; the amber act and whether it is still the single loudest thing; light — does anything on any screen look lit, or is it all flat fills; depth and material — shadows, scrims, translucency over photography, and whether the veils are doing work or hiding weak composition; the photographs against the interface, since this dealership's own boats are the only real colour in the product; the marks, their ink, and the two brands that have none; and whether the app still looks designed when Northside changes its own accent, mark or pictures from its settings (docs/CUSTOMISATION.md).

Read src/styles/tokens.css in full first: 96 tokens with measured contrast in their comments.`,
  },
  {
    key: 'composition',
    title: 'Composition and space',
    brief: `YOUR LENS: COMPOSITION. How each screen is divided, and whether the division is a decision or a default. Judge: the grid and whether anything is optically off it; margins and gutters and whether they are consistent per register; the fold — what a person sees before scrolling, on every screen, at 1280×800 and 1440×900, and whether the act is above it; balance and mass, and where a large empty area reads as calm versus as a hole; alignment between neighbouring blocks; the edge — what happens at the extreme start and end of each screen; and the app's silhouette, which is whether you could recognise a screen from its shape alone with the text blurred out.

SPECIFICALLY HUNT FOR SAMENESS. The owner's standing rule is that no two screens share a treatment: "never one treatment stamped across screens". Twenty-three screens were built by many hands against separate reference sweeps, and an earlier critic already caught five directions across four screens converging on one narrow-list-left, detail-right composition. Lay the screenshots side by side, group them by silhouette, and NAME every pair or cluster that reads as one shape. This is the single most valuable thing your lens can produce.`,
  },
  {
    key: 'motion',
    title: 'Motion and response',
    brief: `YOUR LENS: MOTION AND RESPONSE. This one you cannot judge from screenshots: DRIVE THE APP and watch it.

Judge: what animates and what does not, and whether the choice is deliberate; whether anything moves that should not (the price figure must never count up, and nothing may move while a caret is in a text field); entry and exit, and whether exits are faster than entries; interruption — what happens if a person presses again mid-transition; curves and durations against the tokens the app declares, and whether any of them feel borrowed rather than chosen; the transitions between screens in the sale, which are the app's showpiece moments; hover, focus and press states on every kind of control, and whether pressing something feels like pressing something; loading — what the eye does while 15,691 rows are read; reduced motion, which must keep colour and opacity and remove movement; and WHERE MOTION IS MISSING and its absence makes the app feel inert.

The owner: "it does not feel alive". That sentence is mostly about your lens. Load the skills \`.claude/skills/animate/SKILL.md\` and \`.claude/skills/animation-vocabulary/SKILL.md\` and name every effect by its right term.`,
  },
  {
    key: 'density',
    title: 'Density and information design',
    brief: `YOUR LENS: DENSITY AND INFORMATION DESIGN, on the Cockpit screens a dealer works in all day — the sheet, the quotes register, data, customers, history, rules, fitment, review, levels, the pipeline.

Judge: how much is on screen versus how much a person can take in; the row and its parts, and whether the eye can scan one column without the others interfering; where a number should be a bar, a sentence should be a glyph, or a glyph should be a word; borders versus space versus tint as separators, and whether the app is consistent; what is repeated on every row that could be said once; the scan path — where the eye lands first and whether that is the useful place; tables against Butterick's rule that borders come off first; and whether a dense screen has a rhythm or is a slab.

READ docs/reference/dense-tables-and-selection.md, the app's own research document, and judge the screens against it. Then judge the thing the rulers cannot: a screen can hold eighteen rows and still be exhausting. Say which of these screens a person could work in for six hours, and which they could not.`,
  },
  {
    key: 'firstuse',
    title: 'First use, and the clueless user',
    brief: `YOUR LENS: FIRST USE. You are a boat dealer's sales manager. You have used the old system for years, you read nothing, you have a customer standing at your desk, and you have never seen this app before. Do not read the source. DRIVE IT and get stuck.

Walk it cold, from an empty browser: get in, find a boat, build a quote with a motor and a trailer, deal with whatever the app refuses, put a customer on it, issue it, print it, find it again tomorrow. Then try the things a sales manager does on a slow Tuesday: fix a wrong price, add a boat that arrived, write down that these two things do not go together, see how the month is going.

Report every moment you: did not know where to press; pressed something and could not tell whether it worked; read a sentence twice; had to guess a word's meaning; could not get back; lost your work; or would have called somebody for help. Say how long each screen took you to understand. Name the three moments that would make a dealer give up.

ALSO judge the empty states, because this app is honest and starts empty: on day one there are no customers, no quotes, no rules and no history, and half of what you see is a screen with nothing on it. Does each of those teach you what to do next, or apologise?`,
  },
  {
    key: 'delight',
    title: 'Delight, personality and the showpiece moments',
    brief: `YOUR LENS: DELIGHT. Everything above is about not being bad. Yours is about being GOOD — the thing the owner is really asking for when he says "insanely beautiful" and "it does not feel alive".

Judge: the moments this app should be proud of, and whether they land — the door opening onto a photograph of a real boat, the first paint of the configurator, the total changing, the finale, the A4 sheet appearing at true size, a brand's mark at full size. Is there a single screen here that a person would screenshot and show somebody? Name it, or say there is none.

Then judge PERSONALITY. Twenty-three screens, one voice? Where does the app sound like a person who knows boats, and where like software? The refusal sentences are this app's signature — it never disables a control, it says why in words — so read fifty of them and say whether they read as a considered voice or as fifty separately-written apologies.

Then judge the CRAFT DETAILS that separate good from excellent: the favicon and the tab title, what a print looks like, what the app does at an absurd width, the selection colour, the focus ring, the scrollbars, the cursor over every kind of thing, what is copied when a person selects a row, the transitions the owner will try twice.

Finally, the PHOTOGRAPHS. The owner: "imagery is insanely important". 329 held pictures, eight on-water heroes at up to 2560px, seventeen marks. Is the imagery carrying the product, or decorating it? Name every screen where a real photograph would make it better and there is none, and every screen where a picture is drawn too small to be worth drawing.`,
  },
  {
    key: 'hand',
    title: 'The hand and the tablet',
    brief: `YOUR LENS: SMALL SCREENS. The owner's standing requirement: "responsive on EVERY screen size". The rulers check that nothing overlaps or is cut at 390×844, 844×390 and 834×1112 — they cannot tell you whether the app is any GOOD there.

DRIVE THE WHOLE APP at 390×844 (a phone upright), 844×390 (a phone turned sideways, which is the size that breaks layouts nobody tested) and 834×1112 (a tablet held beside a hull on the floor of a dealership, which is the realistic place for this product). Judge every screen: is the composition reconsidered for the size, or is it the desk layout squeezed; what is the first thing on screen and is it the right thing; can a thumb reach the acts; are the touch targets big enough; does anything scroll sideways; what happens to the dense registers, which cannot simply shrink; does the shell's pill work in a hand; and is anything genuinely BETTER small than large, which is the mark of a layout that was actually designed for it.

Report per screen and per size. Name the three worst, and name anything that is unusable rather than merely cramped.`,
  },
]

phase('Shots')
const shots = await agent(
  `You are photographing HL_2.0 for a design review, once, so that eight judges can read your pictures instead of each starting their own browser on a four-core machine.\n\n${STATE}\n\nTASK.\n1. Build and serve: npm run build; npx vite preview --port 5501.\n2. Read e2e/routes.ts — it is the one list of every screen with how each is REACHED (some need a walk through the door, some need a quote minted first, one needs a customer filed). Read e2e/shots/recipe.ts and e2e/mint.ts: the walk is already written and you should drive it, not reinvent it. A screen photographed before it has read its data is a photograph of nothing.\n3. Write a standalone Playwright script under ${SHOTS_DIR}/ that visits EVERY route in that list at 1920×1080, 1440×900, 1280×800, 834×1112, 844×390 and 390×844, under the determinism recipe (fixed clock, reduced motion, images decoded, fonts ready, caret hidden), and saves full-page PNGs to ${SHOTS_DIR}/<screen>/<viewport>.png. Where a screen has a second state worth seeing — a panel open, a band folded, a search typed, a refusal showing, an empty state — photograph that too as <screen>-<state>/<viewport>.png.\n4. Run it. Report how many screens and how many frames landed, and name any route you could not reach and why.\n5. Write ${SHOTS_DIR}/index.md: every screen, its address, the frames you took of it, and one line on how it is reached. The judges read this first.\nDo not change any application code. Do not commit.`,
  { label: 'shots', phase: 'Shots' },
)

phase('Judge')
const reports = await parallel(
  LENSES.map(
    (l) => () =>
      agent(
        `You are one of eight independent judges giving HL_2.0 a design review before its owner sees it for the first time. Your lens is "${l.title}" and you judge ONLY through it — seven other judges have the other seven, and a finding outside your lens wastes the panel's time.\n\n${STATE}\n\nTHE PHOTOGRAPHS ARE ALREADY TAKEN: ${SHOTS_DIR}/ holds every screen at six viewports, with ${SHOTS_DIR}/index.md naming each one and how it is reached. START THERE and open the frames your lens needs — the Read tool renders PNGs. Budget: open at most 60 frames. If your lens genuinely cannot be judged from a still (motion, first use), serve the app yourself (npm run build && npx vite preview --port ${5510 + LENSES.indexOf(l)}) and drive it with the browser tools — but check the frames first so you drive with a question rather than wandering.\n\n${l.brief}\n\nREPORT (StructuredOutput):\n- \`lens\`: your lens.\n- \`score\`: 1 to 10, where 5 is "a competent product nobody would remark on", 8 is "the best thing in its industry", and 10 is "people will copy this". Be honest; the owner has rejected five redesigns and flattery costs him money.\n- \`verdict\`: three or four sentences a designer would say out loud. Lead with the truth, not the pleasantry.\n- \`best\`: the two or three things that are genuinely excellent through your lens, each naming the screen. This matters as much as the faults — the polish round must not flatten what is already good.\n- \`findings\`: every fault, each with the screen, the viewport if it is size-specific, a severity, what is wrong, and \`fix\` — the specific change you would make, precise enough for somebody else to do it without asking you. Severity: blocker = the owner would reject the screen on sight; major = he would name it; minor = craft. Order them worst first. Do not pad the list: fifteen real findings beat fifty.\nChange nothing. Do not commit.`,
        { label: 'judge:' + l.key, phase: 'Judge', schema: FINDINGS },
      ),
  ),
)
const panel = reports.filter(Boolean)
log('panel: ' + panel.map((r) => `${r.lens} ${r.score}/10 (${r.findings.length})`).join(' · '))

phase('Synthesis')
const worklist = await agent(
  `You are the editor of an eight-lens design review of HL_2.0, turning eight reports into one work list that other people will execute.\n\n${STATE}\n\nTHE EIGHT REPORTS:\n${JSON.stringify(panel).slice(0, 90000)}\n\nTASK.\n1. DEDUPLICATE. Several judges will have found the same thing through different lenses; merge those into one finding that keeps the sharpest description and the best fix, and note that N lenses found it — a fault three judges independently hit is more important than one judge's blocker.\n2. RESOLVE CONTRADICTIONS. Two lenses will disagree (more colour versus restraint; more motion versus stillness; denser versus calmer). Do not average them. Decide, say which judge was right FOR THIS PRODUCT AND THIS OWNER, and say why in one sentence.\n3. RANK. What would most change the owner's first impression, first. He sees the door, then home, then a configurator; a fault on the shelf matters less than the same fault on the door, and your ranking must show you know that.\n4. CUT. Anything that is a taste difference rather than a fault, anything a ruler already guarantees, and anything that would flatten something the \`best\` lists named as excellent. Say what you cut and why.\n5. GROUP BY SCREEN, because the polish round is per screen, plus one app-wide group for the things that cross every screen (the voice of the refusals, the motion vocabulary, the accent's job, the silhouette clustering).\n6. Write all of it to ${SHOTS_DIR}/review.md: the eight scores with a line each, the verdict, the merged findings ranked, the contradictions and how you resolved them, and what you cut. This document is what the owner reads if he wants to know what the machines thought.\n\nRETURN: \`screens\` (one entry per screen with its count of findings, a headline, and \`work\` — the complete instruction the polish agent for that screen will be given, precise and self-contained), \`appWide\`, \`theOneThing\` (if only one thing is changed before the owner looks, what), and \`summary\`.`,
  { label: 'editor', phase: 'Synthesis', schema: WORKLIST },
)

phase('Polish')
const HOUSE = `HOW THIS APP IS BUILT, which your fixes must respect: a screen lives in src/screens/<name>/ with its own stylesheet and no shared page component; every colour, face, size, space, radius, shadow, easing and duration comes from src/styles/tokens.css and tools/check.ts refuses a literal colour, an undeclared token, anything under 11px, a cost column on a customer surface, and the words entity / schema / field type / reference in a reader-facing string; controls come from src/ui and refuse className; figures are counted from the stores, never typed; no data is invented and an empty state is the true state; a refusal is a sentence with its reason, never a disabled control; every write is a command with an inverse and a typed event; reduced motion keeps colour and removes movement; nothing moves while a caret is in a text field; the price figure never counts up. A value the tokens lack is ADDED to tokens.css with a comment saying where it came from.

BEFORE YOU REPORT: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx tsc --noEmit -p tsconfig.node.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; then HL2_PREVIEW_PORT=<your port> npx playwright test e2e/rulers -g "<your route name>" — NEVER the whole suite, another polisher is running beside you. Then serve (npx vite --port <your port + 1>) and LOOK at what you changed at 1440×900 and 390×844 with the browser tools, against the frames in ${SHOTS_DIR}/<screen>/. Do NOT commit, push, checkout, reset or stash. Append a dated one-liner to docs/DECISIONS.md with one \`cat >> file <<'EOF'\` if you made a decision worth recording.`

const work = (worklist && worklist.screens) || []
await parallel(
  work
    .slice(0, 24)
    .map(
      (w, i) => () =>
        agent(
          `You are polishing one screen of HL_2.0 before its owner sees it for the first time.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SCREEN: ${w.screen}. ${w.headline}\n\nTHE WORK, from an eight-lens design review edited into one list:\n${w.work}\n\nAPP-WIDE FINDINGS that apply to your screen too, if they touch it:\n${JSON.stringify((worklist && worklist.appWide) || [])}\n\nRULES FOR THIS ROUND. Fix what is named. Do NOT redesign the screen — it came from a reference sweep and a chosen direction and the review did not reject it, so keep its own idea and answer the criticism within it. Do not flatten anything the review called excellent. If a finding is wrong, say so in \`notChanged\` with your reason rather than doing it badly. Your ports: Playwright ${5520 + i * 4}, vite ${5521 + i * 4}.\n\nReport \`changed\` (what you did, specifically), \`notChanged\` (what you refused and why), and your measured gate.`,
          { label: 'polish:' + w.screen, phase: 'Polish', schema: REPORT },
        ),
    ),
)

const rescore = await agent(
  `You are re-scoring HL_2.0 after a polish round, so that the owner is told what the polish actually changed rather than what it was meant to change.\n\n${STATE}\n\nTHE FIRST PANEL: ${JSON.stringify(panel.map((r) => ({ lens: r.lens, score: r.score, verdict: r.verdict, best: r.best }))).slice(0, 12000)}\nTHE EDITOR'S WORK LIST: ${JSON.stringify(worklist).slice(0, 12000)}\n\n1. Re-photograph every screen: run the script the Shots agent wrote under ${SHOTS_DIR}/ again (read ${SHOTS_DIR}/index.md), writing to ${SHOTS_DIR}/after/<screen>/<viewport>.png so the before and after sit side by side.\n2. For each of the eight lenses the first panel used, open the before and after of the screens that lens cared about most and score the app again 1–10 through that lens, with \`before\` the panel's score and a one-sentence \`why\`. Budget: open at most 70 pictures.\n3. \`remaining\`: every blocker or major from the work list that you can still SEE, with a precise fix. \`worse\`: anything the polish made worse, which is the finding that matters most here.\nBe as honest as the first panel was. Change nothing. Do not commit.`,
  { label: 'rescore', phase: 'Polish', schema: RESCORE },
)
const still = ((rescore && rescore.remaining) || []).filter((g) => g.severity !== 'minor')
log(
  'rescore: ' +
    ((rescore && rescore.scores) || [])
      .map((s) => s.lens + ' ' + s.before + '→' + s.after)
      .join(' · ') +
    ' · ' +
    still.length +
    ' still serious · ' +
    ((rescore && rescore.worse) || []).length +
    ' made worse',
)
if (still.length > 0 || ((rescore && rescore.worse) || []).length > 0) {
  const byS = {}
  for (const g of still) (byS[g.screen] = byS[g.screen] || []).push(g)
  for (const w of (rescore && rescore.worse) || [])
    (byS['app-wide'] = byS['app-wide'] || []).push({
      severity: 'major',
      title: 'made worse by the polish',
      detail: w,
    })
  await parallel(
    Object.keys(byS)
      .slice(0, 14)
      .map(
        (screen, i) => () =>
          agent(
            `You are polishing one screen of HL_2.0 a second time, because a re-score after the first polish could still see these.\n\n${STATE}\n\n${HOUSE}\n\nYOUR SCREEN: ${screen}.\nSTILL WRONG, OR MADE WORSE: ${JSON.stringify(byS[screen])}\n\nThe before and after pictures are under ${SHOTS_DIR}/<screen>/ and ${SHOTS_DIR}/after/<screen>/ — look at both. Fix what is named without flattening what the first panel called excellent. If a finding is wrong, say so in notChanged with your reason. Ports: Playwright ${5620 + i * 4}, vite ${5621 + i * 4}. Touch only this screen's files; for "app-wide", touch only what the finding names and say every file you changed.`,
            { label: 'polish2:' + screen, phase: 'Polish', schema: REPORT },
          ),
      ),
  )
}

phase('Close')
const close = await agent(
  `You are closing HL_2.0 for its owner's first review. This is the last agent to touch the tree.\n\n${STATE}\n\nEverything is built and an eight-lens design review has been executed. Nothing else is running now, so you may run everything.\n\n1. THE FULL GATE, alone: npm test; npm run build; npm run e2e. Report every number. If anything is red, fix it if it is the app; if it is this four-core machine under contention, re-run it alone with --last-failed --timeout 120000 --workers 1 and report BOTH readings honestly. Do not report a gate as green that is not.\n2. RE-PHOTOGRAPH every screen at 1440×900 and 390×844 with the script in ${SHOTS_DIR}/, so the pictures match the tree the owner will open, and say which screens visibly changed in the polish round.\n3. REFUSAL ROT, one last time: grep every refusal and every "not built" / "does not exist" / "yet" sentence in src/screens/** and src/routes/** and make each one TRUE. Every screen must have its door in the shell's one list and be reachable by the finder.\n4. Check docs/SCREENS.md: every screen has a row, no two rows share a primary reference set, and every status says what is measured.\n5. WRITE docs/REVIEW.md — the guide the owner opens first. It is for a person who has not seen any of this. It must carry: how to run it (npm run dev, port 5100) and what he will see on a cold browser; a table of every screen with its address, what only it does, and what to look at; the walk to take in order, as numbered steps, so that ten minutes shows him the whole product; what is deliberately empty and why (no invented customers, quotes or pictures); the open questions that need HIS answer, gathered from docs/STATUS.md — the 1,193 obsolete Highfield SKUs, the 25 Mercury and twin-bundle motor names, the four undecoded Highfield colourway codes, the rig kits that were never priced, and anything else the milestones raised; what is on docs/LATER.md and therefore deliberately absent; and the eight review scores with one line each BEFORE and AFTER the polish (the re-score: ${JSON.stringify(rescore && rescore.scores).slice(0, 4000)}), anything the polish made worse and whether it was put right, and the review\'s own "one thing to change first". Be honest in it: say what is provisional, say what has never been seen by a person, and say where the machines disagreed.\n6. Append a final dated section to docs/STATUS.md: the gate numbers, the screen count, the test count, and one paragraph saying plainly what this app now does end to end.\nReport the gate numbers, what you fixed, and anything still wrong.`,
  { label: 'close', phase: 'Close' },
)

return { shots, panel, worklist, rescore, close }
