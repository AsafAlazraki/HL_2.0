export const meta = {
  name: 'hl2-sizes',
  description:
    'Every size, the quote flow first (the owner, 2026-10-31: "ensuring responsiveness on every single size"): New quote, the build page and its summary, the printed quote, the quotes page and the floating bar measured and read at all six sizes, then fixed and pushed',
  phases: [
    {
      title: 'Measure',
      detail: 'the rulers and a screenshot of every state at six sizes, read by eye',
    },
    { title: 'Fix', detail: 'per screen group, then pushed' },
  ],
}

const NEW = 'C:\\Users\\Asaf\\dev\\HL_2.0'
const OUT = 'docs/directions/sizes'
const SIZES =
  '390x844 (phone), 844x390 (phone on its side), 834x1112 (tablet), 1280x800 (laptop), 1440x900 (desk), 1920x1080 (wide)'

const STATE = `NEVER RUN A COMMAND IN THE BACKGROUND (run_in_background): a workflow subagent that waits for a background notice is never woken. Run every long command in the foreground with a timeout (up to 600000 ms). Stop every server you start before you report. Use your own --output=test-results-<port>; never delete another agent's results or dist while one may be running.

Repo (cwd): ${NEW}; CLAUDE.md is in your context and binds you. THE OWNER, 2026-10-31: "ensuring responsiveness on every single size". His bar: "if i take a screenshot, does it look PERFECT, and if not, why not, and fix it ... even down to scroll and how things expand and collapse". The six sizes: ${SIZES}. A layout that only holds where it was drawn fails. The weekly usage is nearly spent: be economical, and spend it on the quote flow.`

const GAPS = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          group: { type: 'string', enum: ['build', 'start', 'paper'] },
          size: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['group', 'size', 'severity', 'what', 'evidence'],
      },
    },
    perfect: { type: 'array', items: { type: 'string' } },
  },
  required: ['gaps', 'perfect'],
}
const REPORT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    done: { type: 'array', items: { type: 'string' } },
    notDone: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'done', 'notDone'],
}

phase('Measure')
const measured = await agent(
  `You are measuring the quote flow at every size, read-only except ${OUT}/. ${STATE}

(1) npm run build, then the rulers (contrast, cut, overlap, density, focus) and the flow specs for the picker, configurator, build-page, chandlery, document, quotes and shell, on every Playwright project, port 5911, --output=test-results-5911. Record every failure with its size. (2) Serve the build (npx vite preview --port 5912) and, at EACH of the six sizes, screenshot and READ every state of: New quote (what are you selling, a maker, a model, a motor shelf); the build page for a Highfield Sport 560 (top, hull open with its model, material and colour rows, motor open, the Show all popup, the chandlery popup, the lightbox, specs opened, the customer popover, scrolled to the last chapter, the summary, back up); a motor-only quote; the printed document (screen and print media) and its sections panel; the quotes page with a draft and a given quote; the floating bar with Find. Save under ${OUT}/<size>/. For every frame answer PERFECT or NOT AND WHY: anything cut, overlapping, crowded, stranded in empty space, scrolling where it should not (or not where it should), a control under the floating bar or the total, text too small, a picture soft or stretched, a sticky thing covering content, horizontal scroll. Group each gap: 'build' (src/screens/configurator), 'start' (picker, quotes, shell) or 'paper' (document). Write ${OUT}/report.md.`,
  { label: 'measure', phase: 'Measure', schema: GAPS },
)

phase('Fix')
const gaps = (measured && measured.gaps) || []
log(`${gaps.length} gaps across the six sizes`)
const OWNS = {
  build: 'src/screens/configurator/** and its specs',
  start: 'src/screens/picker/**, src/screens/quotes/**, src/screens/shell/** and their specs',
  paper: 'src/screens/document/** and its spec',
}
const fixes = await parallel(
  ['build', 'start', 'paper'].map((group, i) => () => {
    const mine = gaps.filter((g) => g.group === group)
    if (!mine.length) return null
    return agent(
      `You are making ${OWNS[group]} perfect at every size, and you touch nothing else. ${STATE}

THE GAPS MEASURED (${OUT}/report.md has the shots): ${JSON.stringify(mine).slice(0, 10000)}

Close every one, minors included. Write each screen's reflow at the six sizes into its stylesheet header. Then: npx prettier --write <your files>; npx oxlint --max-warnings 0 src e2e; npx tsc --noEmit -p tsconfig.app.json; npx vitest run <your paths>; npx tsx tools/check.ts; npm run build; your specs and the rulers for your screens on every project (port ${5921 + i * 10}, --output=test-results-${5921 + i * 10}); then screenshot what you fixed at all six sizes and read it. Do not commit.`,
      { label: 'fix:' + group, phase: 'Fix', schema: REPORT },
    )
  }),
)

await agent(
  `In ${NEW}, take a checkpoint and push it, because the owner watches the live site. Run git status --short; if nothing changed, say so and stop. Otherwise remove any e2e/flows/zz-*.spec.ts, FAULT-*.png and test-results-* that git would add, then git add -A and git commit -m "The quote flow at every size: New quote, the build page, the paper, the quotes page and the bar, measured at six sizes and fixed" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", then git push origin main. Report the hash.`,
  { label: 'checkpoint', phase: 'Fix', effort: 'low' },
)

return { measured, fixes }
