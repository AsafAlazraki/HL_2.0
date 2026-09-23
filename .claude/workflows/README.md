# The workflow scripts this rebuild runs

Each is a `Workflow` script: a deterministic chain of subagents with its own
phases. Run one with `Workflow({scriptPath: '.claude/workflows/<name>.js'})`.
They are committed rather than left in a session's scratchpad because this
rebuild has already survived three account limits and a model switch, and a
script that lives in a temporary folder does not survive any of them.

| script | what it does |
|---|---|
| `hl2-m2.js` | Milestone 2: the sheet, history, data, customers, the shell. Built and critiqued. |
| `hl2-m2-close.js` | Closes Milestone 2 against its critique: the whole gate measured alone first so every failure lands on its screen, the sheet REDESIGNED by three drawn directions and three judges, seven fixers, a cold verify, a fresh adversarial critic, and a second fix round if anything serious survives. |
| `hl2-imagery.js` | Fills the picture gaps: counts every model, motor, trailer and brand the file carries against what is held, matches the 4,320 verified candidates to the EXACT model the file names, has every proposal judged by eye on contact sheets, fetches what was accepted with full provenance inside a 90 MB budget, and gives every screen one reader for pictures instead of eight. |
| `hl2-m3.js` | Milestone 3: rules, fitment, review, levels. Exit: writing a rule changes what the configurator refuses on the next pick, in that rule's own words. |
| `hl2-m4.js` | Milestone 4: places with their marks and heroes, the organisation with its people and roles, the shelf for import and export — and the customisation panels `docs/CUSTOMISATION.md` specifies. |
| `hl2-m5.js` | Milestone 5: document templates with the four-layer override cascade, the map of the business, the pipeline. |
| `hl2-host.js` | The last step: GitHub Pages at a sub-path (the base, the router, deep links through 404.html), a green CI split into a matrix that fits, a deploy, and a stranger walking the live site cold at desk, phone and tablet size — refreshing on deep addresses, printing the quote to PDF, reading the console — with a second walk if anything failed. |
| `hl2-acceptance.js` | The LAST gate, run only once every milestone is built, polished and hosted: four hunters on the hosted build — a salesperson doing full quotes with a customer at the desk on a tablet and a laptop, the customer reading the downloaded PDFs, the admin configuring the backend and checking every change lands, and a stakeholder over every screen at six sizes — then fixers, looping until two rounds in a row find no blocker or major; then the gate alone, the deploy, and a walk of the live site. |
| `hl2-beauty.js` | The beauty and usability sweep: every screen photographed once at six viewports, then eight independent judges (type, colour and light, composition, motion, density, first use, delight, small screens) scoring out of ten with specific fixes; an editor merges and ranks them; per-screen polish; the whole app re-photographed and re-scored so the polish is measured rather than assumed, with a second polish on anything still serious or made worse; the final gate; and `docs/REVIEW.md` written for the owner. |

THE ORDER, and everything is BUILT before anything is judged: hl2-m2-close → hl2-imagery → hl2-m3 → hl2-m4 → hl2-m5 (revised by the proposal analysis in docs/research/proposal/) → hl2-beauty → hl2-host → hl2-acceptance.

Each milestone script runs sweep → design (three directions DRAWN on the real file and judged through the owner's, the dealer's and the designer's lenses) → build → verify → critique → fix → re-verify → a second, fresh critique → a second fix → close,
two agents at a time because this machine has four cores. Read
`docs/STATUS.md` first: it says which of them have run and what they left.
