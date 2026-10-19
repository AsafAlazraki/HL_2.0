export const meta = {
  name: 'hl2-build-close-2',
  description:
    "The tail of hl2-build-close, which the session restart cut off: the pill fix it never finished, then the round's verify alone, a fresh critic and one more pass — with the five finished agents' reports carried forward",
  phases: [
    { title: 'Screens', detail: 'the pill, which the restart cut off' },
    { title: 'Verify', detail: 'the gate alone, a fresh critic, one more pass if needed' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\OneDrive\\Desktop\\HL 2.0'

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

/* THE FIVE AGENTS THAT FINISHED before the restart (from the journal of wf_708b47e8-bb2):
   build:chapters, build:finale, fix:picker, fix:customers, fix:quotes. Their work is on disk,
   uncommitted; their reports are carried forward so the verifier and critic know what changed. */
const DONE = {
  'build:chapters': {
    fixed: [
      "Blocker 2: shut chapter heads say the answer the way a person says it. 'chosen:' is gone. The name leads in ink at 14px, then '· 3 more offered' in the second ink. The chosen motor's or trailer's own picture stands beside the subtotal. A trailer chapter no longer says '1 to choose from' about the one trailer on it.",
      "Blocker 2: no build name leads with a code. goods.ts nameFirst drops a part of the spoken name only when it is the line's own code AND it leads or is a hyphenated part number. Trailer: 'T Alloy 1400 ATM S 13\" Skid Braked' with TA1400S13SB kept. Kit: 'Yamaha/Stacer · Binnacle Mount Rigging Kit' with 9ST-704-6Y82L-22-07 kept. Shackle: 'D Shackle · 10 mm Galv' with 110016 kept. 'Battery · MRV70 · Qty 2' and 'Yamaha F250XSB2 · White' stay whole.",
      "Blocker 2: motor tiles no longer carry rigging-kit prose. A tile shows its picture, name, 'hp · kg · shaft' and its figure. The pairing's rigging kit, prop and code are one press away under the option: a 'For the workshop' kit Button with aria-expanded, described by the option's name. A search opens them with the matches in bold. Where two options share a name, their distinguishing facts stay on the tile.",
      "Blocker 2: the kit's power chips (Chip, EngineIcon, count, least power first) sit over a motor list that has more than one power. They narrow the tiles, never hide a motor that is on the quote, and step aside while a search runs. Tiles are two across wherever each gets 320px (desk and tablet), and a list of one takes the full width.",
      "Blocker 2: the kit's Dashes sit beside the search field at 1200px and up, at the field's height, driven by the same ScrollTrigger reading as the disc ring.",
      "Blocker 2: part and fit rows lead with the kind's glyph (KindMark), then the name first, the dealer code quiet in mono under it, and the kit's pill. Finish rows put their swatches where the glyph stands, and the chosen finish says 'on the quote' with the hull price instead of 'fitted'.",
      "Blocker 2: trailers state their own facts, read by the register's column names: 'for a 4.9–5.3 m boat · 1,400 kg ATM · 13″ wheels'. NSM's unitless '495' is not read as a size.",
      "'PRE-DELIVERY INCLUDED' on every tile is now one sentence over the list ('Every price here includes pre-delivery.').",
      "Minor 12: a chosen option's pill shows the price it stands on the quote at and says 'on the quote'. It no longer shows '−$14,330'.",
      'Minor 15, on the build only: the trailer is named by its words, not its code, on the tile, the recommendation line and the head.',
      "Blocker 1: .cfg-head__chev and .cfg-chapter::before now snap under :root[data-still]. A new e2e case types 'F115' with the caret held and reads every frame: every caret, accent bar and dash shows at most 2 states. It passes at six sizes.",
    ],
    notFixed: [
      "The masthead's engine sentence beside the total ('4 lines, each at the price it was picked at · 1 of them is not priced on this quote'). It is part of blocker 2's list, but it is the head rather than a chapter, and major 8's phone-chrome work also changes the head, so I left it.",
      "Minor 15 beyond the build: the paper, the cascade and the finale's notes still name the trailer code first. nameFirst in src/screens/configurator/goods.ts is pure and could serve them, but those screens are not mine.",
      "Major 8's second half, at 390: a pressed chapter opens out of sight. Not in this task.",
      "The kit's Chapter and Stat are not used on the build. Chapter's head cannot carry the build's reading ring, the numberless icon discs of Who it is for and the finale, or the '02 Motor' accessible names every flow and the finder use. Stat's 30px count would outweigh the one quiet 'N of M paired' line over each list. Both reasons are in docs/DECISIONS.md.",
    ],
  },
  'build:finale': {
    fixed: [
      "1. THE CARET RULE. The chapters pass had already put the build's chevrons and accent bars under :root[data-still]; the flow case 'nothing turns or grows while a caret is in the search' now also reads document.getAnimations() on every frame while 'F115' is typed with the caret held. It fails on any running transition or animation inside the build that moves something: transform, translate, scale, rotate, height, width, inset, top, left or clip-path. It also fails on a chapter body that motion grows a frame at a time, which no animation list shows. Colour and opacity stay allowed. The handover's own animations land at their end under :root[data-still].",
      "2. GIVING THE QUOTE IS A MOMENT (major 3). The finale is now a handover card: the boat's own photograph where the stage is not beside it (below 1200px), who it is for as the headline ('For Jordan Test'), the boat as every screen names it, 'Total at Cash' as the kit's large showroom figure (a price, so it never moves) with '4 lines · 1 not priced on this quote' under it, and one act. The finale's head drops its subtotal while open, so the total is shown once.",
      "2 (the give). 'For' becomes 'Given to' in the same place. The Lottie seal (88px, white on leaf) is stamped where the person's disc stood, the leaf ink spreads out from under it (a clip-path circle), the name comes up word by word out of a blur, the boat's photograph catches the light once (the stage at a desk, the card below 1200), and 'Open the document' arrives last and takes the keyboard. The whole sequence ends by about 882ms and plays once per give. Under reduced motion or a caret it is a clean cut to the same end state: no animation runs at the press, measured. The given card is an <output>, so a screen reader is told.",
      "2 (the total). Measured over 90 frames from the press on the Stacer 519, the card's total did not move at 1440 or 390. At 834 the whole finale moved 0.31px (explained in notFixed). The flow case holds both totals to under half a pixel and one value on every frame.",
      "2 (the hand-off to the paper). Below 1200 the card's photograph carries the view-transition name and the stage's gives it up, so the route carries the finale's photograph onto the paper's cover. Checked at 834: exactly one element holds the name.",
      "2 (contrast). The given card measures 5.70:1 by day and 9.30:1 by night; the total's label, count and figure measure 6.76:1 and above.",
      "3. THE PHONE (major 8). The masthead's eyebrow is now its own row. In a hand the head sticks at minus the eyebrow's measured height, so once the page moves only one row stays: the boat's name and the total. Measured on the Stacer 519 at 390: 96px at rest and 68px stuck, down from 193. The business name leaves the eyebrow in a hand.",
      "3 (the masthead sentence). '4 lines, each at the price it was picked at · 1 of them is not priced on this quote' is gone from the masthead at every size; this closes the masthead item that blocker 2 left open. The masthead keeps one sentence, only where the boat itself has no price.",
      "3 (a pressed chapter comes into view). A chapter pressed open low in the window, or reached by the finder's 'Go to it', is brought up by its head under the bars that stick. Measured at 390: 02 Motor pressed at y 679 came to rest at y 77 under the 68px head, first tile at 328. A wheel, touch, key or press cancels a move that is waiting, and stops one that is running.",
      "Minor 15, on the finale: the charge notes now name the trailer by its words ('T Alloy 1400 ATM S 13\" Skid Braked already has registration in its Cash price'), with a unit test.",
      "4. Both were already closed before this pass. The step line became the kit's toast on 2026-09-28, so it no longer pushes the chapter list down under a press. The build raises that toast on every step ('For Jordan Test · Undo'). No change was needed.",
    ],
    notFixed: [
      "Minor 11 is still open: the build's undo toast can sit over the rail's foot at 1440 while it is showing. The toast's position belongs to the kit's Toaster in src/ui, which I do not own.",
      "At 834×1112 the finale moves 0.31px when the quote is given. The card itself is unchanged to the thousandth of a pixel. On a given quote the stage band above the rail loses 'See what Trade does' and its note, and the scroll that keeps the finale in place can only move the window by whole pixels. The flow allows under half a pixel.",
      "Majors 4 and 5 (the picker's act drawn over its price, and the pill's capsule dropping out on the way to the paper) belong to the picker and the shell, not to this task. The capsule glitch is still visible in a frame I took of the build-to-paper transition at 834.",
    ],
  },
  'fix:picker': {
    fixed: [
      'Major 4, the false sentence. Measured before the fix at 1440 on the 519 CrossFire · Side Console, which had no draft: in the render the press caused, the act read "Open the draft already standing". Under it the plate said "…so this reopens it rather than starting a second", directly above "Quote 20260929-01 is started — opening the build". The fix is in Picker.tsx: while the press\'s answer (`started`) is about the boat and version on the plate, what the press found (`started.already`) decides the act\'s words. What the press left behind no longer does. Any move clears `started`, and a fresh plate asks the store again. Checked with a MutationObserver and rAF sampler, and by screencast frames at 1440, 834 and 390: the label stays "Start the quote" and the sentence stays empty in every frame until the build. Once the draft really stands (Back to the same boat), the act says "Open the draft already standing" and its true sentence.',
      'Major 4, the act covering the price. The act was drawn over the price at rest too, whenever a draft really stood. The old grid (`minmax(0,1fr) minmax(12rem,max-content)`) let the price column shrink to nothing. Measured before: "Open the draft already standing" had its left edge at x 1041 over "$28,450" ending at 1053 (1440), and over "$1,456,990" at 1280 (x 881 vs 977). "Start the quote" also covered the Jeanneau DB 43 OB\'s "$1,456,990" by 1 px at 834 (586 vs 587). In picker.css, `.picker-close` is now a wrapping flex line. The price is never narrower than its figure (`min-inline-size: min-content`, and `nowrap` keeps "from" on its figure). When the figure and the label do not both fit, the act drops under the price and fills the plate, as it does in a hand. After the fix there is no overlap at 1280, 1440, 1920, 834, 844×390 or 390, with either label, on the Side Console or on the dearest boat.',
      'New unit test in Picker.test.tsx: \'keeps the words it was pressed under while the quote it wrote opens\'. It fails on the old code (it cannot find a button named "Start the quote" after the press) and passes on the new code. A fresh plate for the same boat then says the draft.',
      "New e2e test in e2e/flows/picker.spec.ts: 'the act never covers the price, and says only what is true, from rest to the build'. It runs at all six sizes on the dearest one-line boat, found off the file. It reads the price's own text box (a Range) against the act's box and both against the plate's edges, at rest, on every frame and DOM change from the press to the build, and again after Back with the draft standing.",
    ],
    notFixed: [
      'Not mine, left alone: `npx oxlint --max-warnings 0 src tools e2e` reports 3 warnings in e2e/flows/shell.spec.ts (`no-underscore-dangle` on `__frames`, lines 662/674/689). That file is uncommitted and another agent is working on it. My own files lint clean, so the whole-repo lint gate is not green until its owner renames those.',
      'Seen in passing, not in my ownership: at 390 the "Quote … is started — opening the build" note stands below the fold under the tab bar, so a phone never sees it before the build opens. During the route crossfade at 1440 the Stacer mark flies across the list; that transition belongs to the route/build.',
      'Not changed: the picker\'s "Quote X was already open" note on a handed-back draft (the component test pins it). The act\'s own sentence says "already started", so the two word a standing draft differently, but neither is false.',
    ],
  },
  'fix:customers': {
    fixed: [
      "Critique-2 finding 9. The cause was `givenOf` in src/domain/people/book.ts. It counted a quote only while its standing was still 'given'. `indexQuotes` marks a given quote 'replaced' once a newer version supersedes it, so after 20260929-01 was given and versioned, Customers read GIVEN 0 / $0. History counted by the `issued` event and read 1 given / $55,223. History was right: STANDING_SAY.replaced says a replaced quote was given, and the Quotes peek says -01 is still the document the customer holds.",
      "The count now lives in one derivation, `givenTally` in src/domain/quote/given.ts. It returns `{ given, givenTotal, givenSummed }`. `wasGiven` is `state === 'issued'`. Issuing has no way back (NO_WAY_BACK), and `newVersionOf` starts with an empty diary and no issuedAt. Documents with nothing priced are counted as given but left out of the sum (the denominator), and each document is counted once by id.",
      "Customers now reads `givenTally(page.quotes)` for its Given and Given, in all figures. If fewer given quotes carry a figure than were given, the label reads 'Given, N of M with a figure' instead of 'Given, in all'. On engine data this never happens. `givenOf` and its test were removed from book.ts and book.test.ts.",
      'History reads the same derivation through src/domain/quote/diary/days.ts. `tallyOf` still picks the quotes issued on that day, then spreads `givenTally` over them. `diarySince` spreads `givenTally` over every document kept instead of adding up the day tallies. On an engine-written tree the result is the same. It differs only for an issued document that has no diary, which is now counted, as Customers counts it. History.tsx did not change: the field names it reads (given, givenTotal, givenSummed) are the same.',
      "Tests: src/domain/quote/given.test.ts (8 cases). It builds the critic's walk with the real `issue` and `newVersionOf` commands. It checks that the index calls -01 'replaced' and that `givenTally` still reports 1 given at quoteTotals. It checks that History's diarySince and the issue day's tally equal that, and that `readPage` for that person lists both quotes and `givenTally` over them equals it too. It also covers drafts, an empty list, nothing priced, a duplicate id and a document with no diary. Customers.test.tsx has a new case for given plus a new version (Written 2, Given 1, the money figure's value equals quoteTotals, the row says Replaced). customers.spec.ts has a new flow for the critic's walk: give, make a new version, then check the figure the build printed at giving on the Customers page, on History's day head and at History's foot.",
      "Checked with Playwright on the 519 Sea Ranger SDF, the critic's own boat, at 1440x900, 834x1112 and 390x844. Customers reads WRITTEN 2 · GIVEN 1 · GIVEN, IN ALL $55,223, and History reads '1 given $55,223' and '1 given to a customer · $55,223 given, as printed on their sheets'. The after-shots are saved over customers-{1440x900,834x1112,390x844}-letter.png.",
    ],
    notFixed: [
      'The Quotes register still shows ISSUED 0 · SUPERSEDED 1 $55,223 for the same tree. That split is by current standing, a different fact with its own label, and `tally()` in history.ts (unused by any screen) splits given and replaced the same way. Neither is owned here and neither was changed.',
      "With two quotes the Customers letter scrolls at 1440x900 ('Add a customer' is below the fold). The fit rule in customers.spec.ts only claims to fit a page with one quote, so this was not changed.",
    ],
  },
  'fix:quotes': {
    fixed: [
      "Critique finding 10, the photograph: the room under the rows now shows the quote the cursor is on (the marked row, which is also the quote the panel reads when it is open). It used to show the newest quote whose model had a photograph. If you press or arrow to a quote, the picture changes to its boat straight away, with no animation. The unused src/screens/quotes/latest.ts and its test are deleted. The photograph now uses the kit's Picture component, which carries the hull's travel name, so opening the quote always flies the right boat onto the build or the paper.",
      "Critique finding 10, the counts: the resting panel's three 175px tiles are gone. They repeated each band's count and sum, under a heading that counted the quotes a third time. At rest the panel is now a reading pane. It says what to press and what its act opens, then gives a legend of Draft, Issued and Superseded in their state colours, with no figures. At a desk it is centred in the plate. Each count now appears once, on the head of the band it counts.",
      "The room's blue caption no longer shows the state or the total, because the row just above says both. It now says only the hull's name and 'the hull on REF · customer'. The same figure had appeared four times on one screen.",
      "A band's head shows a sum only when it adds two or more figures. A band with one priced row leaves its figure to the row.",
      "The peek shows 'The lines' separately from the Total only when an adjustment sits between them. Before, it showed the same figure twice, one line apart. The divider above Total is drawn only when rows stand above it.",
      "The empty panel no longer says the groups 'stand at 0, 0, 0' beside three heads that already say 0. Its last sentence no longer promises 'its boat under the list and its total beside it', which is not true below 1200px.",
      'Below 1200px each plate now ends under its content instead of stretching to the window. At 834×1112 the list plate had about 170px of white under New quote, and the panel about 180px under its last line.',
      "Motion: the photograph's hover lean now sits on a clipped frame, is removed under reduced motion, and has no transition while the cursor is in the find field (:root[data-still]).",
    ],
    notFixed: [
      "The header line 'N quotes are filed in this browser' still gives the total alongside the band counts. I kept it because e2e/flows/shell.spec.ts, which I don't own, checks the pill's Quotes count against that line.",
      'Two things I saw in the after-shots belong to the shell or were already there: at 390 the scrolled peek puts its last refusal line under the foot pill, and at 834 there is now about 330px of the page background under the panel, where there used to be white inside the plates.',
    ],
  },
}
const chapters = DONE['build:chapters']
const finale = DONE['build:finale']

phase('Screens')
const shell = await agent(
  `${CONTEXT}\n\nTASK: ${"THE PILL: the lit capsule drops out of the pill on the way from the build to the paper (read the critique). The pill's capsule travels with the reader's place on every route change the view transition carries, and never disappears. Ownership: src/screens/shell/**, e2e/flows/shell.spec.ts."} A PREVIOUS ATTEMPT AT THIS TASK WAS CUT OFF mid-way by a session restart: read git diff -- src/screens/shell e2e/flows/shell.spec.ts first and treat what is there as a colleague's draft — finish it, fix it or replace it, and say which. Its e2e/flows/shell.spec.ts carries three lint warnings (no-underscore-dangle on __frames) that must be gone. Ports 6741, 6742.`,
  { label: 'fix:shell', phase: 'Screens', schema: REPORT },
)
const screens = [DONE['fix:picker'], DONE['fix:customers'], DONE['fix:quotes'], shell]

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
