import { expect, test } from '@playwright/test'
import { sweep, type Sweep } from './measure/contrast'
import { findCuts } from './measure/cut'
import { countReadableRows } from './measure/density'
import { findOverlaps } from './measure/overlap'
import { readRamp } from './measure/ramp'

/* ============================================================
   THE RULERS, PROVED ABLE TO FAIL.

   The plan's guard mechanics are one sentence: "every guard has a
   ten-line fixture test that proves it can fail (three old guards
   silently measured nothing for weeks)". The fourteen static rules in
   tools/check/rules.ts each had one. The five rulers did not, and the
   round-3 critic said so in as many words: each of them guards its own
   non-vacuity — `expect(r.measured).toBeGreaterThan(0)` — so a sweep
   that reads nothing is red, but nothing had ever put a KNOWN DEFECT
   in front of the arithmetic and watched it come back. On a tree with
   one placeholder route and two measurable text nodes, "0 below
   threshold" is exactly what a silently broken parser returns.

   So every measurement is pointed at a page built to fail in one named
   way at a time. Each page carries the defect AND its near-miss
   neighbour — the passing ratio beside the failing one, the elision
   beside the cut, the ancestor beside the overlap — because a ruler
   that fails on everything is as useless as one that fails on nothing.

   THE RATIOS BELOW ARE ARITHMETIC, NOT OBSERVATION. Each one is the
   WCAG 2.x relative-luminance ratio of two named sRGB values and can
   be worked out on paper; they are written here so that a change to
   the compositing or the luminance curve moves a number a reader can
   check, rather than moving a boolean nobody can.

   These pages are drawn in inline styles on purpose. The rulers walk
   the app's own stylesheets everywhere else; here the point is that
   the measurement, not the cascade, is what is under test, and a
   fixture whose colours live in another file is a fixture that reads
   as magic.
   ============================================================ */

/** The one failure with this text, or nothing — every assertion below names the run it means. */
const failing = (r: Sweep, starts: string): Sweep['fails'][number] | undefined =>
  r.fails.find((f) => f.text.startsWith(starts))

/** One readable row of a register, at a height a person could read it at. */
const row = (n: number): string =>
  `<div role="row" style="height:20px">Row ${n}, readable at this height</div>`

/**
 * One page, eight measurable runs of text, and one of each of the five corrections the
 * old repo's three lying sweeps were built out of.
 */
const CONTRAST_PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>
      body { margin: 0; background: #ffffff; font: 16px/1.5 sans-serif; }
    </style></head><body>
      <p style="color:#767676">A grey that clears four point five four to one</p>
      <p style="color:#999999">Faint, at two point eight five to one</p>
      <p style="color:color(srgb 0.6 0.6 0.6)">Declared in the srgb colour function</p>
      <p style="color:oklch(0.95 0 0)">Declared in oklch, and nearly white</p>
      <p style="color:rgba(0, 0, 0, 0.5)">Half-opaque ink over the page</p>
      <div style="background:rgba(0, 0, 0, 0.5)"><div style="background:rgba(0, 0, 0, 0.5)">
        <p style="color:#555555">Two tints deep</p>
      </div></div>
      <p style="color:#999999">Hull only <b style="color:#111111">$20,900</b></p>
      <p aria-hidden="true" style="color:#bbbbbb">·</p>
    </body></html>`

test.describe('the rulers can fail', () => {
  /* One viewport. The arithmetic does not change with the window, and
     running the same proof six times would report it six times. */
  test.skip(({ viewport }) => viewport?.width !== 1440, 'the proof is read once, not per viewport')

  // ---- contrast --------------------------------------------------------------------

  test('contrast finds the six planted failures and leaves the two passes alone', async ({
    page,
  }) => {
    await page.setContent(CONTRAST_PAGE)
    const r = await page.evaluate(sweep)

    /* Every ink on the page parsed. Two of them — the `color(srgb …)`
       form and the oklch one — are corrections (1) and (5), and a
       parser that had lost either would report them here instead of
       measuring them. */
    expect(r.unparsed, 'srgb and oklch both parsed rather than being guessed at').toBe(0)
    expect(r.measured, 'eight runs of text, the decorative one set aside').toBe(8)

    expect(
      r.fails.map((f) => f.text).toSorted(),
      'exactly the planted failures, and not the two that clear the line',
    ).toEqual([
      'Declared in oklch, and nearly white',
      'Declared in the srgb colour function',
      'Faint, at two point eight five to one',
      'Half-opaque ink over the page',
      'Hull only',
      'Two tints deep',
    ])

    /* #999999 on #ffffff. The arithmetic itself, with nothing composited. */
    expect(failing(r, 'Faint,')!.ratio).toBe(2.85)
    expect(failing(r, 'Faint,')!.need, '16px at weight 400 is not large text').toBe(4.5)

    /* (1) `color(srgb 0.6 0.6 0.6)` is 153,153,153 — the same grey, so the
       srgb arm and the rgb arm must agree to the second decimal. A parser
       that only knew rgb() would have counted this unparsed above. */
    expect(failing(r, 'Declared in the srgb')!.ratio).toBe(2.85)

    /* (2) THE WHOLE ANCESTOR CHAIN. #555555 sits under two half-opaque
       black tints over a white page: 255 → 127.5 → 63.75. Measured
       against that ground the ratio is 1.4:1. Against the FIRST
       non-transparent parent alone — the old bug — it would read
       1.87:1, because that tint composites over white and stops. */
    expect(failing(r, 'Two tints deep')!.ratio).toBe(1.4)

    /* (3) TRANSLUCENT TEXT, COMPOSITED FIRST. rgba(0,0,0,0.5) over white
       is 127.5 grey at 3.98:1. Measured uncomposited it is black on
       white, 21:1, and would not appear in this list at all. */
    expect(failing(r, 'Half-opaque ink')!.ratio).toBe(3.98)

    /* (4) A LEAF IS NOT "an element with no element children". The
       paragraph owns "Hull only" and the bold owns the figure; the
       old walk measured the bold and never the sentence in front of
       it. Both are measured, the sentence fails on its own text, and
       the wrapper is never credited with its child's string. */
    const wrapper = failing(r, 'Hull only')!
    expect(wrapper.tag).toBe('p')
    expect(wrapper.text, 'the wrapper is measured on its OWN text, not its subtree').toBe(
      'Hull only',
    )
    expect(failing(r, '$20,900'), '#111111 on white is 18.9:1').toBeUndefined()

    /* The exemption, counted out loud rather than swallowed. */
    expect(r.decorative).toBe(1)
    expect(r.decorativeBelow, 'the separator is under the line, and the report says so').toBe(1)
    expect(failing(r, '·')).toBeUndefined()
  })

  test('contrast reports nothing on a page that is honestly clean', async ({ page }) => {
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:#ffffff;font:16px sans-serif">
         <p style="color:#111111">Every figure here clears the line</p>
       </body></html>`,
    )
    const r = await page.evaluate(sweep)
    expect(r.measured).toBe(1)
    expect(r.fails).toEqual([])
  })

  // ---- overlap ---------------------------------------------------------------------

  test('overlap finds the one real collision and none of the three exemptions', async ({
    page,
  }) => {
    await page.setContent(`<!doctype html><html><body style="margin:0;font:16px/1.5 sans-serif">
        <div style="width:200px;height:40px">First run of text</div>
        <div style="width:200px;height:40px;margin-top:-30px">Second run, over the first</div>
        <div style="margin-top:200px"><p>Hull only <b>$20,900</b></p></div>
        <div style="position:relative;height:40px">
          <div style="position:absolute;inset:0;width:200px">A menu, over what it covers</div>
        </div>
        <div style="width:200px;height:40px">Above the kiss</div>
        <div style="width:200px;height:40px;margin-top:-1px">Below the kiss</div>
      </body></html>`)
    const r = await page.evaluate(findOverlaps)

    expect(r.leaves, 'six runs of text compared; the menu is not one of them').toBe(6)
    expect(r.layered, 'the absolutely positioned run is set aside, and counted').toBe(1)
    expect(r.pairs).toHaveLength(1)
    expect(r.pairs[0]!.a).toContain('First run of text')
    expect(r.pairs[0]!.b).toContain('Second run, over the first')
    /* 200 wide by 30 deep, which is well past a quarter of the smaller box. */
    expect(r.pairs[0]!.area).toBe(6000)
  })

  // ---- cut -------------------------------------------------------------------------

  test('cut tells an accident from a decision, on both axes', async ({ page }) => {
    const LONG = 'A model name far too long for the box it has been given'
    await page.setContent(`<!doctype html><html><body style="margin:0;font:16px/1.5 sans-serif">
        <div style="width:100px;overflow:hidden;white-space:nowrap">${LONG}</div>
        <div style="width:100px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${LONG}</div>
        <div style="width:100px;height:24px;overflow:hidden">${LONG}</div>
        <div style="width:100px;height:24px;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1">${LONG}</div>
        <p>Nothing is clipped here</p>
      </body></html>`)
    const r = await page.evaluate(findCuts)

    expect(r.measured).toBe(5)
    expect(
      r.elided,
      'the ellipsis and the line clamp are decisions, counted and never failed',
    ).toBe(2)
    expect(r.cuts).toHaveLength(2)
    expect(r.cuts.map((c) => c.axis).toSorted()).toEqual(['across', 'down'])
    for (const c of r.cuts) {
      expect(c.text, 'the cut names the run it sliced').toContain('A model name')
      expect(c.by, 'and by how many pixels').toBeGreaterThan(1)
    }
  })

  // ---- ramp ------------------------------------------------------------------------

  test('ramp reads tokens out of a grouping rule and reports what they give', async ({ page }) => {
    await page.setContent(`<!doctype html><html><head><style>
        @media screen {
          :root {
            --color-ink: #000000;
            --color-faint: #eeeeee;
            --text-body: 16px;
            --text-lede: 22px;
          }
        }
        body { margin: 0; background: #ffffff; font: 16px/1.5 sans-serif; color: var(--color-ink); }
        h1 { font-size: var(--text-lede); font-weight: 700; margin: 0; }
      </style></head><body><h1>A heading</h1><p>A sentence</p></body></html>`)
    const r = await page.evaluate(readRamp)

    /* Read RECURSIVELY or not at all: these four tokens are declared
       inside an `@media`, which is the same shape Tailwind's `@layer
       theme` has, and the first version of this walked only a sheet's
       top-level rules and reported zero. */
    expect(r.colours.map((c) => c.name).toSorted()).toEqual(['--color-faint', '--color-ink'])
    expect(r.ground).toBe('rgb(255, 255, 255)')
    expect(r.colours.find((c) => c.name === '--color-ink')!.onGround, 'black on white').toBe(21)
    expect(
      r.colours.find((c) => c.name === '--color-faint')!.onGround,
      '#eeeeee on white — a rule, never a word',
    ).toBe(1.16)

    expect(
      r.typeSteps.map((s) => s.px),
      'resolved through the cascade and sorted',
    ).toEqual([16, 22])
    expect(
      r.typeInUse.toSorted((a, b) => b.px - a.px).map((s) => `${s.px}/${s.weight}`),
      'the heading and the sentence, each counted once',
    ).toEqual(['22/700', '16/400'])
  })

  test('ramp marks a step a screen cannot actually show', async ({ page }) => {
    await page.setContent(`<!doctype html><html><head><style>
        :root { --color-reachable: #336699; --color-wild: oklch(0.7 0.4 250); }
        body { margin: 0; background: #ffffff; font: 16px sans-serif; }
      </style></head><body><p>A sentence</p></body></html>`)
    const r = await page.evaluate(readRamp)
    const by = (name: string) => r.colours.find((c) => c.name === name)!
    /* oklch can name a blue no monitor has; the screen paints the
       clamped stand-in, so the ratio reported is the one a person
       sees and the step says out loud that it is not reachable. */
    expect(by('--color-wild').outsideGamut).toBe(true)
    expect(by('--color-reachable').outsideGamut).toBe(false)
  })

  // ---- density ---------------------------------------------------------------------

  test('density counts the rows a person can read, not the ones that exist', async ({ page }) => {
    await page.setContent(`<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">
        <div role="table">
          ${Array.from({ length: 20 }, (_, i) => row(i + 1)).join('')}
          <div role="row" style="height:1px">A row with no height is not a row</div>
          <div role="row" style="height:20px;margin-top:1200px">Row 21, below the fold</div>
        </div>
      </body></html>`)
    const seen = await page.evaluate(countReadableRows)
    expect(seen, 'twenty in view; the collapsed one and the one below the fold are not').toBe(20)
  })
})
