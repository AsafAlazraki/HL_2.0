import { expect, test } from '@playwright/test'
import { sweep, type Sweep } from './measure/contrast'
import { findCuts } from './measure/cut'
import { readDensity } from './measure/density'
import { findOverlaps } from './measure/overlap'
import { decodePng, luminance, measureRun, medianLuminance } from './measure/pixels'
import { readRamp } from './measure/ramp'
import { measureOverPictures, wearTheme } from './measure/read'
import { plantRefusals, primitiveSources, specimens } from './measure/refusals'

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

/* A register's furniture, for the second density reading: a band head and an empty-band
   notice are rows a grid gives a reader, each one cell spanning the grid. */
const bandHead = (word: string): string =>
  `<div role="row" style="height:36px"><div role="gridcell" aria-colspan="3">${word}</div></div>`
const bandNotice = (word: string): string =>
  `<div role="row" style="height:24px"><div role="gridcell" aria-colspan="3">No ${word} yet</div></div>`

/** One record of a register: a row of three cells, `pitch` px tall. */
const record = (pitch: number, n: number): string =>
  `<div role="row" style="height:${pitch}px;display:flex"><span role="gridcell">Quote ${n}</span><span role="gridcell">a boat</span><span role="gridcell">$1</span></div>`

/** The list every density page names, the way a route names its register's list. */
const LIST = { list: '.list' }

/**
 * A register with ONE record on it, the state the walk leaves the quotes register in.
 * The frame is 600px with a 40px act row pinned to its foot, and the list is the app's own
 * list: `flex: 0 1 auto` and its own scroller, so full it shrinks to the 560px the act row
 * leaves it. The band heads take 36px each: at a 28px pitch that holds
 * floor((560 − 3×36) / 28) = 16 records, and at 20px it holds 22. Two pages, one pitch
 * apart, on either side of eighteen.
 */
const register = (pitch: number, records: number, contents = false): string => {
  /* `contents` draws the register the way a one-grid register does: the grid owns
     the columns, every rowgroup and every record row is `display: contents` and has
     no box of its own, and only the cells have a height. A band head spans the grid. */
  const one = (n: number) =>
    contents
      ? `<div role="row" style="display:contents"><span role="gridcell" style="height:${pitch}px">Quote ${n}</span><span role="gridcell" style="height:${pitch}px">a boat</span><span role="gridcell" style="height:${pitch}px">$1</span></div>`
      : record(pitch, n)
  const drafts = Array.from({ length: records }, (_, i) => one(i + 1)).join('')
  const grid = contents ? 'display:grid;grid-template-columns:repeat(3,1fr);' : ''
  const group = contents ? 'display:contents' : ''
  const span = contents ? '<style>[role="row"]:has([aria-colspan]){grid-column:1/-1}</style>' : ''
  return `<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">${span}
      <div class="body" style="height:600px;display:flex;flex-direction:column">
        <div role="grid" class="list" style="${grid}flex:0 1 auto;min-height:0;overflow:auto">
          <div role="rowgroup" style="${group}">${bandHead('Draft')}${drafts}</div>
          <div role="rowgroup" style="${group}">${bandHead('Issued')}${bandNotice('issued')}</div>
          <div role="rowgroup" style="${group}">${bandHead('Replaced')}${bandNotice('replaced')}</div>
        </div>
        <div class="act" style="height:40px;margin-top:auto;flex:none">New quote</div>
      </div>
    </body></html>`
}

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

/**
 * THE REFUSAL PAGES, for correction (7) below. Two stylesheets, one planted defect between
 * them. BROKEN inks the sentence under the room's controls — an act, a veiled control, a room
 * tile — #DDE9F3 in both themes, which is right for the night's navy plate and 1.23 : 1 on the
 * day's white. MENDED names a role that turns with the theme: #767676 by day, 4.54 : 1 on
 * white, and #9FB6C4 at night. Everything else on both pages is the same: paper is #FBFAF7 in
 * both themes and carries #3F5869 (7.13 : 1), and every control is a white chip with navy ink,
 * so the only runs that can move are the reasons under test.
 */
const REFUSAL_PAGE = (reason: string, night: string): string =>
  `<!doctype html><html><head><meta charset="utf-8"><style>
      :root { --color-ground: #ffffff; --color-panel: #ffffff; --color-paper: #fbfaf7;
              --ink: #04161f; --reason: ${reason}; }
      :root[data-theme='night'] { --color-ground: #04161f; --color-panel: #062033;
              --ink: #ffffff; --reason: ${night}; }
      body { margin: 0; font: 13px/1.5 sans-serif; color: var(--ink); background: var(--color-ground); }
      .ui-button, .ui-tile, .ui-menu-item, .ui-select-item {
        display: block; border: 0; font: inherit; color: #04161f; background: #ffffff;
      }
      .ui-menu, .ui-select-popup { background: #ffffff; }
      .ui-refusal { display: block; color: #3f5869; }
      .ui-button-frame[data-intent='act'] .ui-refusal,
      .ui-button-frame[data-intent='veiled'] .ui-refusal,
      .ui-tile-frame[data-tone='room'] .ui-refusal { color: var(--reason); }
    </style></head><body>
      <p>The finale</p>
      <span class="ui-button-frame" data-intent="act" data-size="md"><button type="button"
        class="ui-button" data-intent="act" data-size="md">Give it to the customer</button></span>
    </body></html>`
const BROKEN = REFUSAL_PAGE('#dde9f3', '#dde9f3')
const MENDED = REFUSAL_PAGE('#767676', '#9fb6c4')

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

  /* ---- (6) the ground that is a picture ------------------------------------------------
     The shape entry is built in, in miniature: a fixed layer holding an <img>, and the words
     in a positioned sibling above it. The page's own background is the app's dark ground, so
     the ancestor walk — corrections 1 to 5, all of them working perfectly — reports 17:1 for
     BOTH runs. One of them is on white.

     The numbers are arithmetic: #DDE9F3 (entry B's caption ink, luminance 0.8012) is 17.02:1
     on black and 1.23:1 on white. */
  const PICTURE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect width='400' height='400' fill='%23000000'/%3E%3Crect x='400' width='400' height='400' fill='%23ffffff'/%3E%3C/svg%3E"
  const PICTURE_BLACK =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect width='800' height='400' fill='%23000000'/%3E%3C/svg%3E"

  const ON_A_PICTURE = `<!doctype html><html><head><meta charset="utf-8"><style>
      body { margin: 0; background: #04101c; font: 12px/1.5 sans-serif; }
      .ground { position: fixed; inset: 0; z-index: 0; }
      .ground img { position: absolute; inset-block-start: 0; inset-inline-start: 0;
                    width: 800px; height: 400px; }
      .band { position: relative; z-index: 1; color: #dde9f3; }
      .band p { position: absolute; margin: 0; width: 240px; }
      .dark { left: 40px; top: 40px; }
      .lit { left: 440px; top: 40px; }
    </style></head><body>
      <div class="ground" aria-hidden="true"><img src="${PICTURE}" alt=""></div>
      <div class="band">
        <p class="dark">Pale ink on the dark half of the picture</p>
        <p class="lit">Pale ink on the lit half of the picture</p>
      </div>
    </body></html>`

  test('contrast refuses to guess at a ground that is a photograph, and the pixels fail it', async ({
    page,
  }) => {
    await page.setContent(ON_A_PICTURE)
    await page.waitForFunction(() => [...document.images].every((i) => i.complete))
    const r = await page.evaluate(sweep)

    /* NEITHER RUN IS MEASURED IN THE PAGE. This is the correction: the
       walk can see that something picture-shaped is under both, and it
       says so instead of answering. */
    expect(r.pictures, 'the <img> was found painting behind the words').toBe(1)
    expect(r.onPicture.map((o) => o.text).toSorted()).toEqual([
      'Pale ink on the dark half of the picture',
      'Pale ink on the lit half of the picture',
    ])
    expect(r.fails, 'nothing is failed on a ground this walk never saw').toEqual([])

    /* AND THE PIXELS ANSWER. Same shot a person would look at, decoded
       in node, the ground taken as the median painted pixel under each
       run. The dark half clears the line by a mile; the lit half is the
       planted defect and comes back at 1.23:1 — the ratio the ancestor
       walk called 17:1. */
    const image = decodePng(new Uint8Array(await page.screenshot({ scale: 'css' })))
    expect([image.width, image.height], 'one image pixel per CSS pixel').toEqual([1440, 900])

    const measured = Object.fromEntries(
      r.onPicture.map((run) => [
        run.text.includes('dark') ? 'dark' : 'lit',
        measureRun(image, { x: run.x, y: run.y, width: run.width, height: run.height }, run.ink),
      ]),
    )
    expect(measured.dark!.ratio).toBeCloseTo(17.02, 1)
    expect(measured.lit!.ratio).toBeCloseTo(1.23, 1)
    expect(
      measured.lit!.ratio < r.onPicture[0]!.need,
      'the run on the lit half is under the line the sweep asked for',
    ).toBe(true)

    /* the decoder itself, against two values that can be worked out on
       paper: the two halves of the picture it just read */
    expect(medianLuminance(image, { x: 100, y: 300, width: 200, height: 40 })).toBeCloseTo(0, 5)
    expect(medianLuminance(image, { x: 500, y: 300, width: 200, height: 40 })).toBeCloseTo(1, 5)
    expect(luminance(221, 233, 243), '#DDE9F3, the ink both runs are set in').toBeCloseTo(0.8012, 3)
  })

  /* ---- (6b) the ground read with the glyphs taken off it, under the glyphs only --------
     The two runs the night's first reading failed on 2026-09-24, in miniature, both on a
     black picture and both perfectly legible: a run DENSE with glyphs (full blocks, so
     nearly every pixel of its line box is letter), whose median pixel is its own ink; and a
     button 217px wide with a 55% white border, whose last 24px tile is a 1px sliver of that
     border. Measured the old way — glyphs on the shot, the element's border box — the first
     is about 1 : 1 and the second 3.37 : 1. Measured by `measureOverPictures`, both are the
     arithmetic of their ink on black. */
  const DENSE_AND_BORDERED = `<!doctype html><html><head><meta charset="utf-8"><style>
      body { margin: 0; background: #ffffff; }
      .ground { position: fixed; inset: 0; z-index: 0; }
      .ground img { position: absolute; inset-block-start: 0; inset-inline-start: 0;
                    width: 800px; height: 400px; }
      .band { position: relative; z-index: 1; }
      .dense { position: absolute; left: 40px; top: 40px; margin: 0;
               font: 700 24px/1.5 monospace; color: #dde9f3; }
      .edged { position: absolute; left: 40px; top: 160px; box-sizing: border-box;
               width: 217px; padding: 4px 12px; border: 1px solid rgb(255 255 255 / 55%);
               background: transparent; color: #ffffff; font: 13px sans-serif; text-align: start; }
    </style></head><body>
      <div class="ground" aria-hidden="true"><img src="${PICTURE_BLACK}" alt=""></div>
      <div class="band">
        <p class="dense">████████</p>
        <button type="button" class="edged">Quote the boat</button>
      </div>
    </body></html>`

  test('contrast reads a picture’s ground with the glyphs off it and only under them', async ({
    page,
  }) => {
    await page.setContent(DENSE_AND_BORDERED)
    await page.waitForFunction(() => [...document.images].every((i) => i.complete))
    const r = await page.evaluate(sweep)
    expect(r.onPicture.map((o) => o.text).toSorted()).toEqual(['Quote the boat', '████████'])
    const dense = r.onPicture.find((o) => o.text.startsWith('█'))!
    const edged = r.onPicture.find((o) => o.text === 'Quote the boat')!

    /* THE OLD WAY, to show there was something to fix: glyphs on the shot, and the button's
       border box rather than its letters' */
    const shot = decodePng(new Uint8Array(await page.screenshot({ scale: 'css' })))
    expect(measureRun(shot, dense, dense.ink).ratio, 'the median pixel is a letter').toBeLessThan(2)
    const box = await page.locator('.edged').boundingBox()
    expect(box!.width).toBe(217)
    expect(edged.width, 'the run is its glyphs, not its padding and border').toBeLessThan(200)
    expect(
      measureRun(shot, box!, edged.ink).ratio,
      'the border box ends in a 1px tile of border',
    ).toBeCloseTo(3.37, 1)

    /* THE WAY IT IS READ: both are their ink on black, and pass */
    const m = await measureOverPictures(page, r.onPicture)
    expect(m.fails).toEqual([])
    expect(m.skipped).toEqual([])
    expect(m.ratios[r.onPicture.indexOf(dense)]).toBeCloseTo(17.02, 1)
    expect(m.ratios[r.onPicture.indexOf(edged)]).toBeCloseTo(21, 0)
    /* and the page is given back as it was: no transparent ink, no marks left on it */
    expect(await page.locator('style[data-ruler-hush], [data-on-picture]').count()).toBe(0)
  })

  /* ---- (7) the refusal a resting page never says, in the theme nobody read -------------
     The second close's critic, 2026-09-24: the sentence under a refused act read at 1.23 : 1
     — #DDE9F3 on a white plate, the dark room's ink under a rule nobody turned when the day
     became the default — while the contrast ruler said "0 below threshold" at six sizes. This
     is that app in miniature, with the ruler's three answers to it: the board plants every
     refusal the primitives can say (`measure/refusals.ts`, the same function
     `refusal.spec.ts` runs on the built app), `wear` reads it in both themes, and every
     reason is reported by name with its figure. The two pages are BROKEN and MENDED, above
     the describe. */
  test('refusals: a resting page says none, the board says them all, and the day fails the night’s ink at 1.23:1', async ({
    page,
  }) => {
    /* THE BLINDNESS, FIRST. At rest the act is on the page and its reason is not — the
       reason is said only once the act is refused — so a ruler that reads a resting page
       reads nothing to fail, in either theme. This is the "0 below threshold" the critic was
       shown. */
    await page.setContent(BROKEN)
    for (const theme of ['day', 'night'] as const) {
      await wearTheme(page, theme)
      const rest = await page.evaluate(sweep)
      expect(rest.refusals, `${theme}: no refusal is said at rest`).toEqual([])
      expect(rest.fails, `${theme}: so nothing fails at rest`).toEqual([])
    }

    /* THE BOARD SAYS EVERY ONE. Each context the primitives declare, on the ground it is
       drawn for; the room's controls stand on the room and on a plate. */
    const board = specimens()
    const onTheRoom = board.filter((s) => s.ground === 'room' || s.ground === 'plate')
    expect(onTheRoom.length, 'the board has room contexts to plant').toBeGreaterThan(0)
    expect(await page.evaluate(plantRefusals, board)).toBe(board.length)

    /* BY DAY: exactly the room's reasons fail, each at the critic's own figure. */
    const dayGround = await wearTheme(page, 'day')
    const day = await page.evaluate(sweep)
    expect(day.refusals, 'every planted reason is reported by name').toHaveLength(board.length)
    expect(
      day.fails.map((f) => f.cls),
      'only reasons fail, and only the room’s',
    ).toEqual(onTheRoom.map(() => 'ui-refusal'))
    expect(
      [...new Set(day.fails.map((f) => f.ratio))],
      '#DDE9F3 on white, the finale’s sentence by day',
    ).toEqual([1.23])

    /* BY NIGHT, THE SAME PAGE IS CLEAN. The rule is right in the theme it was written for —
       #DDE9F3 on the night's plate is 13.48 : 1 — which is why a ruler that reads one theme
       could never have seen it. The room's token must differ, or the day was read twice. */
    const nightGround = await wearTheme(page, 'night')
    expect(nightGround, 'the night put its own room on the page').not.toBe(dayGround)
    const night = await page.evaluate(sweep)
    expect(night.fails, 'the broken rule passes in the theme it was written for').toEqual([])
    expect(Math.min(...night.refusals.map((r) => r.ratio!))).toBeGreaterThanOrEqual(4.5)

    /* MENDED: a role that turns with the theme clears the line in both, at 4.54 : 1 by day. */
    await page.setContent(MENDED)
    await page.evaluate(plantRefusals, board)
    await wearTheme(page, 'day')
    const mendedDay = await page.evaluate(sweep)
    expect(mendedDay.fails, '#767676 on white is 4.54 : 1, over the line').toEqual([])
    expect(
      [...new Set(mendedDay.refusals.filter((r) => r.ratio! < 7).map((r) => r.ratio))],
      'the room’s reasons, and nothing else under 7 : 1',
    ).toEqual([4.54])
    await wearTheme(page, 'night')
    expect((await page.evaluate(sweep)).fails).toEqual([])
  })

  test('refusals: the board stops, with a sentence, on a context it does not know the ground of', () => {
    /* A NEW INTENT JOINS THE BOARD THE DAY IT IS DECLARED — the contexts are read off the
       primitives' own source — and it cannot be read until the board is told which ground it
       is drawn for: an unknown ground is never guessed at. Proved on the real Button.tsx with
       one intent added to its union, the way a builder would add it. */
    const real = primitiveSources()
    const louder = real.button.replace("intent?: '", "intent?: 'loud' | '")
    expect(louder, 'the union was found to add to').not.toBe(real.button)
    expect(() => specimens({ ...real, button: louder })).toThrow(
      /intent="loud" and the refusal board does not know which ground/,
    )
    /* and a primitive whose union cannot be found is an error, never an empty board */
    expect(() => specimens({ ...real, tile: '' })).toThrow(/no `tone\?:` union/)
    expect(specimens(real).length, 'the real primitives plant a board').toBeGreaterThan(0)
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
        <div role="grid" class="list">
          ${Array.from({ length: 20 }, (_, i) => row(i + 1)).join('')}
          <div role="row" style="height:1px">A row with no height is not a row</div>
          <div role="row" style="height:20px;margin-top:1200px">Row 21, below the fold</div>
        </div>
      </body></html>`)
    const d = await page.evaluate(readDensity, LIST)
    expect(d.shown, 'twenty in view; the collapsed one and the one below the fold are not').toBe(20)
  })

  test('density does not read a row its own list has scrolled out of sight', async ({ page }) => {
    /* DATA'S EIGHTEENTH ROW, IN MINIATURE. Twenty records in a list whose scrollport is
       300px, all of it inside a 900px window. The old reading took the window as the only
       edge and read twenty; a person sees ten, and the eleventh is sliced by the port. */
    await page.setContent(`<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">
        <div role="grid" class="list" style="height:300px;overflow:auto">
          ${Array.from({ length: 20 }, (_, i) => record(28, i + 1)).join('')}
        </div>
      </body></html>`)
    const d = await page.evaluate(readDensity, LIST)
    expect(d.records, 'ten whole rows in a 300px port at a 28px pitch').toBe(10)
    expect(d.room, 'the room is the port, and the window below it is not the list’s').toBe(300)
    expect(d.capacity, 'so the list holds ten, and a ruler asking eighteen fails it').toBe(10)
    expect(d.framed).toBe(true)
  })

  test('density reads the pitch off a real record and the room a full list would have', async ({
    page,
  }) => {
    await page.setContent(register(28, 1))
    const tight = await page.evaluate(readDensity, LIST)
    expect(tight.records, 'the one record is in view').toBe(1)
    expect(tight.shown, 'the record, three heads and two notices are all rows').toBe(6)
    expect(tight.pitch, 'the pitch is the record’s own height, not a head’s').toBe(28)
    expect(
      tight.room,
      'full, the list shrinks to the frame less the act row the frame keeps under it',
    ).toBe(560)
    expect(tight.heads, 'three band heads stand in the room').toBe(108)
    expect(tight.capacity, 'and at that pitch the room holds sixteen').toBe(16)

    await page.setContent(register(20, 1))
    const dense = await page.evaluate(readDensity, LIST)
    expect(dense.capacity, 'eight pixels off the pitch and it holds twenty-two').toBe(22)

    await page.setContent(register(28, 1, true))
    const flat = await page.evaluate(readDensity, LIST)
    expect(flat.records, 'a row drawn with display: contents is still a record').toBe(1)
    expect(flat.pitch, 'and its pitch is the box its cells occupy').toBe(28)
    expect(flat.capacity).toBe(16)

    await page.setContent(register(20, 0))
    const bare = await page.evaluate(readDensity, LIST)
    expect(bare.records).toBe(0)
    expect(bare.pitch, 'no record, no pitch').toBeNull()
    expect(bare.capacity, 'and no capacity, rather than a capacity nobody measured').toBe(0)

    /* and the probe that made the list full is gone again: nothing was left on the page */
    expect(await page.locator('.list > *').count()).toBe(3)
  })

  test('density asks the layout for the room, so margins count and an open page runs to the fold', async ({
    page,
  }) => {
    /* A RIGID MARGIN IS NOT ROOM. The act row keeps 16px above itself and a legend is
       pinned to the frame's foot by an auto margin: full, the list takes the auto margin and
       not the rigid one. 600 − 16 − 40 − 24 = 520, which at 28 holds 18. Added up from the
       pieces with the margin forgotten it is 536, and holds 19. */
    await page.setContent(`<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">
        <div style="height:600px;display:flex;flex-direction:column">
          <div role="grid" class="list" style="flex:0 1 auto;min-height:0;overflow:auto">${record(28, 1)}</div>
          <div style="height:40px;margin-top:16px;flex:none">New quote</div>
          <div style="height:24px;margin-top:auto;flex:none">J K move</div>
        </div>
      </body></html>`)
    const framed = await page.evaluate(readDensity, LIST)
    expect(framed.room).toBe(520)
    expect(framed.capacity).toBe(18)
    expect(framed.framed).toBe(true)

    /* NOTHING FRAMES THIS ONE. A 300px masthead, then the list in the page's own flow with
       its act row under it: full, the list pushes the act row off the window and a person
       reads rows to the fold — 900 − 300 = 600px, which holds 21. */
    await page.setContent(`<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">
        <header style="height:300px">A masthead</header>
        <div role="grid" class="list">${record(28, 1)}</div>
        <div style="height:40px">New quote</div>
      </body></html>`)
    const open = await page.evaluate(readDensity, LIST)
    expect(open.room).toBe(600)
    expect(open.capacity).toBe(21)
    expect(open.framed).toBe(false)
  })

  test('density takes off the room what floats over it, and nothing painted behind it', async ({
    page,
  }) => {
    /* THE PILL, IN MINIATURE: a fixed bar 50px deep across the top of a list that starts at
       the top of the window, and a fixed layer painted BEHIND the whole page, which covers
       nothing a person reads. The first record is wholly under the bar and the second is
       half under it, so neither is readable; the third is. The room starts under the bar:
       600 − 50 = 550, which holds 19 where the whole frame would hold 21. */
    await page.setContent(`<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">
        <div aria-hidden="true" style="position:fixed;inset:0;z-index:-1;background:#eee"></div>
        <div style="position:fixed;top:0;left:0;right:0;height:50px;z-index:1;background:#fff">Home · Quotes · Data</div>
        <div style="height:600px;display:flex;flex-direction:column">
          <div role="grid" class="list" style="flex:0 1 auto;min-height:0;overflow:auto">${record(28, 1)}${record(28, 2)}${record(28, 3)}</div>
        </div>
      </body></html>`)
    const d = await page.evaluate(readDensity, LIST)
    expect(d.records, 'the rows the bar stands on are not rows a person can read').toBe(1)
    expect(d.covered, 'the bar stands over 50px of the list, and the layer behind over none').toBe(
      50,
    )
    expect(d.room).toBe(550)
    expect(d.capacity).toBe(19)
  })

  test('density subtracts only the band heads the room can show, and finds a stray', async ({
    page,
  }) => {
    /* A FULL, GROUPED LIST: six groups of a 24px head and five 28px records, in a 300px
       port. The port shows two heads and nine records. Counting every head drawn — the old
       reading — takes 144px off and says the port holds 5 while nine are on it; counting the
       two it shows takes 48 and says 9, which is the rows a person reads. */
    const group = (g: number) =>
      `<div role="rowgroup"><div role="row" style="height:24px"><div role="gridcell">Model ${g}</div></div>${Array.from(
        { length: 5 },
        (_, i) => record(28, g * 10 + i),
      ).join('')}</div>`
    await page.setContent(`<!doctype html><html><body style="margin:0;font:12px/1.4 sans-serif">
        <div role="grid" class="list" style="height:300px;overflow:auto">${Array.from({ length: 6 }, (_, g) => group(g + 1)).join('')}</div>
        <div role="grid" class="other">${record(28, 99)}</div>
      </body></html>`)
    const d = await page.evaluate(readDensity, LIST)
    expect(d.heads, 'the two heads in the port, and not the four under it').toBe(48)
    expect(d.records).toBe(9)
    expect(d.capacity, 'the room holds the nine a person reads').toBe(9)
    expect(d.strays, 'the record in the second grid is not in the list the route named').toBe(1)

    const nowhere = await page.evaluate(readDensity, { list: '.nothing-here' })
    expect(nowhere.missing, 'a list the page does not have is said, not read as empty').toBe(
      '.nothing-here',
    )
    expect(nowhere.capacity).toBe(0)
  })
})
