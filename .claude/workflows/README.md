# The workflow scripts this rebuild runs

Each is a `Workflow` script: a deterministic chain of subagents with its own
phases. Run one with `Workflow({scriptPath: '.claude/workflows/<name>.js'})`.
They are committed rather than left in a session's scratchpad because this
rebuild has already survived three account limits and a model switch, and a
script that lives in a temporary folder does not survive any of them.

| script | what it does |
|---|---|
| `hl2-m2.js` | Milestone 2: the sheet, history, data, customers, the shell. Built; its fix round is unfinished. |
| `hl2-m3.js` | Milestone 3: rules, fitment, review, levels. Exit: writing a rule changes what the configurator refuses on the next pick, in that rule's own words. |
| `hl2-m4.js` | Milestone 4: places with their marks and heroes, the organisation with its people and roles, the shelf for import and export — and the customisation panels `docs/CUSTOMISATION.md` specifies. |
| `hl2-m5.js` | Milestone 5: document templates with the four-layer override cascade, the map of the business, the pipeline. |
| `hl2-beauty.js` | The beauty and usability sweep: every screen photographed once at six viewports, then eight independent judges (type, colour and light, composition, motion, density, first use, delight, small screens) scoring out of ten with specific fixes; an editor merges and ranks them; per-screen polish; the final gate; and `docs/REVIEW.md` written for the owner. |

Each milestone script runs sweep → build → verify → critique → fix → close,
two agents at a time because this machine has four cores. Read
`docs/STATUS.md` first: it says which of them have run and what they left.
